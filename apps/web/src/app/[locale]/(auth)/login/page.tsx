import type { Metadata } from "next";
import { getTranslation } from "@/i18n/server";
import {
  AuthPageContainer,
  AuthPageContent,
  AuthPageDescription,
  AuthPageExternal,
  AuthPageHeader,
  AuthPageTitle,
} from "../components/auth-page";
import { LinkWithRedirectTo } from "../components/link-with-redirect-to";
import { LoginWithEmailForm } from "./components/login-email-form";
import { DemoCredentials } from "./components/demo-credentials";
import { SSOProvider } from "./components/sso-provider";
import { LoginWithOIDC } from "./components/login-with-oidc";
import { OrDivider } from "./components/or-divider";
import { isFeatureEnabled } from "@/lib/feature-flags/server";
import { env } from "@/env";
import { getAuthProviders } from "@/lib/auth";

export default async function LoginPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { t } = await getTranslation(params.locale);
  const isEmailLoginEnabled = isFeatureEnabled("emailLogin");
  const isDemoMode = env.DEMO_MODE === "true";
  const authProviders = getAuthProviders();

  if (!isEmailLoginEnabled) {
    return null;
  }

  const hasAnySSO = authProviders.hasGoogle || authProviders.hasMicrosoft || authProviders.hasOidc;

  return (
    <AuthPageContainer>
      <AuthPageHeader>
        <AuthPageTitle>
          {t("welcome", { defaultValue: "Welcome" })}
        </AuthPageTitle>
        <AuthPageDescription>
          {t("loginDescription", {
            defaultValue: "Sign in to your account to continue",
          })}
        </AuthPageDescription>
      </AuthPageHeader>
      <AuthPageContent>
        {isDemoMode && <DemoCredentials />}
        {!isDemoMode && hasAnySSO && (
          <>
            {authProviders.hasGoogle && (
              <SSOProvider providerId="google" name="Google" />
            )}
            {authProviders.hasMicrosoft && (
              <SSOProvider providerId="microsoft" name="Microsoft" />
            )}
            {authProviders.hasOidc && (
              <LoginWithOIDC name={env.OIDC_NAME || "OIDC"} />
            )}
            {isEmailLoginEnabled && <OrDivider />}
          </>
        )}
        {isEmailLoginEnabled && <LoginWithEmailForm />}
      </AuthPageContent>
      {!isDemoMode && (
        <AuthPageExternal>
          {t("dontHaveAccount", {
            defaultValue: "Don't have an account?",
          })}{" "}
          <LinkWithRedirectTo className="text-link" href="/register">
            {t("signUp", { defaultValue: "Sign up" })}
          </LinkWithRedirectTo>
        </AuthPageExternal>
      )}
    </AuthPageContainer>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getTranslation(params.locale);
  return {
    title: t("login", { defaultValue: "Login" }),
  };
}
