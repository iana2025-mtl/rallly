import { prisma } from "@rallly/database";
import { absoluteUrl } from "@rallly/utils/absolute-url";
import { waitUntil } from "@vercel/functions";
import type { BetterAuthPlugin } from "better-auth";
import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  admin,
  anonymous,
  createAuthMiddleware,
  emailOTP,
  genericOAuth,
  lastLoginMethod,
} from "better-auth/plugins";
import { headers } from "next/headers";
import { cache } from "react";
import { isEmailBlocked } from "@/auth/helpers/is-email-blocked";
import {
  linkAnonymousUser,
  mergeGuestsIntoUser,
} from "@/auth/helpers/merge-user";
import { isTemporaryEmail } from "@/auth/helpers/temp-email-domains";
import { env } from "@/env";
import { PostHogClient } from "@/features/analytics/posthog";
import { createSpace } from "@/features/space/mutations";
import { getTranslation } from "@/i18n/server";
import { getLocale } from "@/i18n/server/get-locale";
import { isKvEnabled, kv } from "@/lib/kv";
import { auth as legacyAuth, signOut as legacySignOut } from "@/next-auth";
import { getEmailClient } from "@/utils/emails";
import { getValueByPath } from "@/utils/get-value-by-path";

const baseURL = absoluteUrl("/api/better-auth");

const plugins: BetterAuthPlugin[] = [];

if (env.OIDC_CLIENT_ID && env.OIDC_CLIENT_SECRET && env.OIDC_DISCOVERY_URL) {
  if (env.OIDC_ISSUER_URL) {
    console.info(
      "OIDC_ISSUER_URL is no longer used. You can remove it from your environment variables.",
    );
  }
  plugins.push(
    genericOAuth({
      config: [
        {
          providerId: "oidc",
          discoveryUrl: env.OIDC_DISCOVERY_URL,
          clientId: env.OIDC_CLIENT_ID,
          clientSecret: env.OIDC_CLIENT_SECRET,
          scopes: ["openid", "profile", "email"],
          redirectURI: absoluteUrl("/api/auth/callback/oidc"),
          pkce: true,
          mapProfileToUser(profile) {
            return {
              name: getValueByPath(profile, env.OIDC_NAME_CLAIM_PATH) as string,
              email: getValueByPath(
                profile,
                env.OIDC_EMAIL_CLAIM_PATH,
              ) as string,
              image: getValueByPath(
                profile,
                env.OIDC_PICTURE_CLAIM_PATH,
              ) as string,
            };
          },
        },
      ],
    }),
  );
}

// Lazy initialization: Better Auth is only created when first accessed
let _authLib: ReturnType<typeof betterAuth> | null = null;

export function getAuthLib() {
  if (_authLib) {
    return _authLib;
  }
  
  // Ensure Prisma Client is initialized before creating better-auth
  // This ensures the User model is available when prismaAdapter tries to access it
  void prisma.$connect().catch(() => {
    // Ignore connection errors - Prisma will connect on first query
  });
  
  _authLib = betterAuth({
    appName: "Rallly",
    secret: env.SECRET_PASSWORD,
    experimental: {
      joins: true,
    },
    emailAndPassword: {
      enabled: env.EMAIL_LOGIN_ENABLED !== "false",
      requireEmailVerification: env.DEMO_MODE === "true" ? false : true,
      sendResetPassword: async ({ user, url }) => {
        const locale =
          "locale" in user ? (user.locale as string) : await getLocale();

        await getEmailClient(locale).sendTemplate("ResetPasswordEmail", {
          to: user.email,
          props: {
            resetLink: url,
          },
        });
      },
      onPasswordReset: async ({ user }) => {
        const posthog = PostHogClient();
        posthog?.capture({
          distinctId: user.id,
          event: "password_reset",
        });
        if (posthog) {
          waitUntil(posthog.shutdown());
        }
      },
    },
    emailVerification: {
      autoSignInAfterVerification: true,
    },
    database: prismaAdapter(prisma, {
      provider: "postgresql",
      transaction: false, // when set to true, there is an issue where the after() hook is called before the user is actually created in the database
    }),
  plugins: [
    ...plugins,
    admin(),
    anonymous({
      emailDomainName: "rallly.co",
      generateName: async () => {
        const { t } = await getTranslation();
        return t("guest");
      },
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        await linkAnonymousUser(newUser.user.id, anonymousUser.user.id);
      },
    }),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    emailOTP({
      disableSignUp: true,
      expiresIn: 15 * 60,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const locale = await getLocale(); // TODO: Get locale from email
        const emailClient = getEmailClient(locale);
        switch (type) {
          // We're not actually using the sign-in type anymore since we just we have `autoSignInAfterVerification` enabled.
          // This lets us keep things a bit simpler since we share the same verification flow for both login and registration.
          case "sign-in":
            waitUntil(
              emailClient.sendTemplate("RegisterEmail", {
                to: email,
                props: {
                  code: otp,
                },
              }),
            );
            break;
          case "email-verification":
            waitUntil(
              emailClient.sendTemplate("RegisterEmail", {
                to: email,
                props: { code: otp },
              }),
            );
            break;
        }
      },
    }),
  ],
  socialProviders: {
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            redirectURI: absoluteUrl("/api/auth/callback/google"),
          }
        : undefined,
    microsoft:
      env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET
        ? {
            tenantId: env.MICROSOFT_TENANT_ID,
            clientId: env.MICROSOFT_CLIENT_ID,
            clientSecret: env.MICROSOFT_CLIENT_SECRET,
            redirectURI: absoluteUrl("/api/auth/callback/microsoft-entra-id"),
          }
        : undefined,
  },
  user: {
    additionalFields: {
      timeZone: {
        type: "string",
        input: true,
      },
      locale: {
        type: "string",
        input: true,
      },
    },
  },
  secondaryStorage: isKvEnabled
    ? {
        set: async (key: string, value: string, ttl?: number) => {
          if (ttl) {
            await kv.set(key, value, {
              ex: ttl,
            });
          } else {
            await kv.set(key, value);
          }
        },
        get: async (key: string) => {
          return await kv.get(key);
        },
        delete: async (key: string) => {
          await kv.del(key);
        },
      }
    : undefined,
  rateLimit: {
    storage: isKvEnabled ? "secondary-storage" : "memory",
  },
  account: {
    fields: {
      providerId: "provider",
      accountId: "providerAccountId",
      refreshToken: "refresh_token",
      accessToken: "access_token",
      idToken: "id_token",
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Skip email validation in demo mode
      if (env.DEMO_MODE === "true") {
        return;
      }

      if (
        ctx.path.startsWith("/sign-in") ||
        ctx.path.startsWith("/sign-up") ||
        ctx.path.startsWith("/email-otp")
      ) {
        if (ctx.body?.email) {
          try {
            if (isEmailBlocked(ctx.body.email as string)) {
              throw new APIError("BAD_REQUEST", {
                code: "EMAIL_BLOCKED",
                message:
                  "This email address is not allowed. Please use a different email or contact support.",
              });
            }
            if (isTemporaryEmail(ctx.body.email as string)) {
              throw new APIError("BAD_REQUEST", {
                code: "TEMPORARY_EMAIL_NOT_ALLOWED",
                message:
                  "Temporary email addresses are not allowed. Please use a different email.",
              });
            }
          } catch (error) {
            // Re-throw APIError, but catch any unexpected errors
            if (error instanceof APIError) {
              throw error;
            }
            // Log unexpected errors but don't block registration
            console.error("Error in email validation hook:", error);
          }
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // In demo mode, completely skip the hook to avoid any errors
          // This ensures registration always succeeds
          if (env.DEMO_MODE === "true") {
            return;
          }

          // Fail-safe: Never throw errors from this hook
          // Registration must succeed even if post-registration tasks fail
          try {
            if (user.isAnonymous) {
              return;
            }
            
            // Check if user already has a space to avoid duplicates
            let existingSpace = null;
            try {
              existingSpace = await prisma.space.findFirst({
                where: {
                  ownerId: user.id,
                },
              });
            } catch (prismaError) {
              console.error("Failed to check for existing space:", prismaError);
              // Continue - we'll try to create space anyway if check fails
            }

            // Only create space if user doesn't have one
            if (!existingSpace) {
              try {
                const space = await createSpace({
                  name: "Personal",
                  ownerId: user.id,
                });

                // Track space creation (non-blocking)
                try {
                  const posthog = PostHogClient();
                  if (posthog) {
                    posthog.groupIdentify({
                      groupType: "space",
                      groupKey: space.id,
                      properties: {
                        name: space.name,
                        memberCount: 1,
                        seatCount: 1,
                        tier: "hobby",
                      },
                    });
                  }
                } catch (posthogError) {
                  console.error("Failed to track space creation:", posthogError);
                }
              } catch (spaceError) {
                // Log but don't fail registration if space creation fails
                console.error("Failed to create space for user:", spaceError);
              }
            }

            // Track registration event (non-blocking)
            try {
              const posthog = PostHogClient();
              if (posthog) {
                posthog.capture({
                  distinctId: user.id,
                  event: "register",
                  properties: {
                    method: user.lastLoginMethod,
                    $set: {
                      name: user.name,
                      email: user.email,
                      tier: "hobby",
                      timeZone: user.timeZone ?? undefined,
                      locale: user.locale ?? undefined,
                    },
                  },
                });

                // Use waitUntil in a try-catch to prevent it from throwing
                try {
                  waitUntil(posthog.shutdown());
                } catch (waitError) {
                  console.error("Failed to wait for PostHog shutdown:", waitError);
                }
              }
            } catch (posthogError) {
              // Log but don't fail registration if PostHog fails
              console.error("Failed to track registration event:", posthogError);
            }
          } catch (error) {
            // Ultimate fail-safe: Log and return, never throw
            // This ensures registration always succeeds
            console.error("Error in user.create.after hook (non-fatal):", error);
            // Explicitly return void to ensure no error propagation
            return;
          }
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Merge legacy guest users into new user
          const legacySession = await legacyAuth();

          if (legacySession) {
            if (legacySession.user?.isGuest) {
              await mergeGuestsIntoUser(session.userId, legacySession.user.id);
            }
            // Delete legacy session
            await legacySignOut({
              redirect: false,
            });
          }

          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isAnonymous: true, lastLoginMethod: true },
          });

          // Only track login events for non-anonymous users
          // Anonymous users shouldn't trigger login events or create person profiles
          if (user && !user.isAnonymous) {
            const posthog = PostHogClient();

            posthog?.capture({
              distinctId: session.userId,
              event: "login",
              properties: { method: user.lastLoginMethod },
            });

            if (posthog) {
              waitUntil(posthog.shutdown());
            }
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 60, // 60 days
    updateAge: 60 * 60 * 24, // 1 day
  },
    baseURL,
  });
  
  return _authLib;
}

// Export lazy getter - Better Auth is only initialized when first accessed
export const authLib = new Proxy({} as ReturnType<typeof betterAuth>, {
  get(_target, prop) {
    const lib = getAuthLib();
    const value = lib[prop as keyof typeof lib];
    if (typeof value === "function") {
      return value.bind(lib);
    }
    return value;
  },
});

export type Auth = ReturnType<typeof getAuthLib>;

// Helper function to safely get auth provider info
export function getAuthProviders() {
  try {
    const lib = getAuthLib();
    return {
      hasGoogle: !!lib.options.socialProviders.google,
      hasMicrosoft: !!lib.options.socialProviders.microsoft,
      hasOidc: !!lib.options.plugins.find(
        (plugin) => plugin.id === "generic-oauth",
      ),
    };
  } catch (error) {
    console.error("Failed to get auth providers", error);
    return {
      hasGoogle: false,
      hasMicrosoft: false,
      hasOidc: false,
    };
  }
}

export const getSession = cache(async () => {
  // Public demo mode: Check if authLib is available
  try {
    const lib = getAuthLib();
    if (!lib || !lib.api) {
      console.warn("authLib not available (expected in demo mode)");
      return null;
    }

    const session = await lib.api.getSession({
      headers: await headers(),
    });

    if (session) {
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          isGuest: !!session.user.isAnonymous,
          image: session.user.image,
        },
        expires: session.session.expiresAt.toISOString(),
        legacy: false,
      };
    }
  } catch (e) {
    // Public demo mode: Return null instead of crashing
    console.warn("getSession failed (expected in demo mode):", e);
    return null;
  }

  // Fallback to legacy auth
  // TODO: Remove this once we have fully migrated to better-auth and there are no active legacy sessions left
  try {
    const legacySession = await legacyAuth();
    if (legacySession) {
      return {
        ...legacySession,
        legacy: true,
      };
    }
  } catch (e) {
    console.error("FAILED TO GET LEGACY SESSION", e);
    return null;
  }

  return null;
});

export const signOut = async () => {
  const lib = getAuthLib();
  await Promise.all([
    lib.api.signOut({
      headers: await headers(),
    }),
    legacySignOut({
      redirect: false,
    }),
  ]);
};

export const getUserIdIfLoggedIn = async () => {
  const session = await getSession();
  return session?.user?.isGuest ? undefined : session?.user?.id;
};

export default authLib;
