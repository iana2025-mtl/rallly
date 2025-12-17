import {
  anonymousClient,
  emailOTPClient,
  genericOAuthClient,
  inferAdditionalFields,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { env } from "@/env";
import type { Auth } from "@/lib/auth";

// Use relative URL to avoid CORS issues, or fallback to current origin
function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    // Client-side: use relative URL or current origin
    return "/api/better-auth";
  }
  // Server-side: use configured base URL
  return `${env.NEXT_PUBLIC_BASE_URL}/api/better-auth`;
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
  plugins: [
    inferAdditionalFields<Auth>(),
    emailOTPClient(),
    genericOAuthClient(),
    lastLoginMethodClient(),
    anonymousClient(),
  ],
});

export async function signOut() {
  await Promise.all([
    authClient.signOut(),
    nextAuthSignOut({ redirect: false }),
  ]);
  window.location.href = "/";
}
