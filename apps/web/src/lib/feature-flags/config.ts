import "server-only";
import { env } from "@/env";
import { isBillingEnabled } from "@/features/billing/constants";
import { isCalendarsEnabled } from "@/features/calendars/constants";
import { isFeedbackEnabled } from "@/features/feedback/constants";
import type { FeatureFlagConfig } from "@/lib/feature-flags/types";
import { isStorageEnabled } from "@/lib/storage";

const isEmailLoginEnabled = env.EMAIL_LOGIN_ENABLED === "true";
const isRegistrationEnabled = env.REGISTRATION_ENABLED === "true";
const isDemoMode = env.DEMO_MODE === "true";

export const featureFlagConfig: FeatureFlagConfig = {
  storage: isStorageEnabled,
  billing: isBillingEnabled,
  feedback: isFeedbackEnabled,
  emailLogin: isEmailLoginEnabled || isDemoMode,
  // In demo mode, disable registration - use demo credentials only
  registration: isDemoMode ? false : (isEmailLoginEnabled && isRegistrationEnabled),
  calendars: isCalendarsEnabled,
};
