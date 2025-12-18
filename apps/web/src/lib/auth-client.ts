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
  // Get locale from current pathname
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  const localeMatch = currentPath.match(/^\/([^/]+)/);
  const locale = localeMatch && localeMatch[1] !== "login" && localeMatch[1] !== "register" && localeMatch[1] !== "api" 
    ? localeMatch[1] 
    : "en";
  
  // Clear all auth sessions
  await Promise.all([
    authClient.signOut(),
    nextAuthSignOut({ redirect: false }),
  ]);
  
  // Clear any cached session data
  if (typeof window !== "undefined") {
    // Clear any localStorage/sessionStorage that might cache user data
    try {
      localStorage.removeItem("better-auth.session");
      // Clear all better-auth related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("better-auth") || key.startsWith("auth")) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (e) {
      // Ignore errors if localStorage is not available
      console.warn("Failed to clear storage:", e);
    }
  }
  
  // Redirect to login page with locale - use full page reload to clear all state
  if (typeof window !== "undefined") {
    window.location.href = `/${locale}/login`;
  }
}
