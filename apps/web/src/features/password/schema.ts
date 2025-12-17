"use client";
import { z } from "zod";
import {
  calculatePasswordStrength,
  passwordQualityThresholds,
} from "@/features/password/utils";
import { useTranslation } from "@/i18n/client";
import { useFeatureFlag } from "@/lib/feature-flags/client";

export function usePasswordValidationSchema() {
  const { t } = useTranslation();
  // Check if registration is enabled - if so, completely disable password strength requirements
  // This allows simple passwords for hobby/school projects
  let isRegistrationEnabled = false;
  try {
    isRegistrationEnabled = useFeatureFlag("registration");
  } catch (e) {
    // If feature flag context is not available, assume registration is enabled
    // (safer for demo mode)
    isRegistrationEnabled = true;
  }
  
  // When registration is enabled, only require minimum length (8 chars) - no strength requirement
  // For production, require "good" strength (score 3/4)
  if (isRegistrationEnabled) {
    // Just require minimum length - no strength validation at all
    return z.string().min(8, t("passwordMinLength", {
      defaultValue: "Password must be at least 8 characters long.",
    }));
  }
  
  // Production mode: require strong password
  return z.string()
    .min(8, t("passwordMinLength", {
      defaultValue: "Password must be at least 8 characters long.",
    }))
    .refine(
      (password) =>
        calculatePasswordStrength(password) >= passwordQualityThresholds.good,
      t("passwordTooWeak", {
        defaultValue: "Password is too weak. Please use a stronger password.",
      }),
    );
}
