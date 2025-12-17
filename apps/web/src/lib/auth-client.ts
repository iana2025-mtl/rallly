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

// Get absolute base URL for auth client
// Use current window origin to avoid CORS issues with Vercel preview URLs
function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    // Client-side: use current window origin to avoid CORS
    return `${window.location.origin}/api/better-auth`;
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
