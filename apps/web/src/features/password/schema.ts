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
  // Check if registration is enabled - if so, relax password requirements
  // This allows simple passwords for hobby/school projects
  const isRegistrationEnabled = useFeatureFlag("registration");
  
  // When registration is enabled, only require minimum length (8 chars) - no strength requirement
  // For production, require "good" strength (score 3/4)
  if (isRegistrationEnabled) {
    return z.string().min(8, t("passwordMinLength", {
      defaultValue: "Password must be at least 8 characters long.",
    }));
  }
  
  return z.string().refine(
    (password) =>
      calculatePasswordStrength(password) >= passwordQualityThresholds.good,
    t("passwordTooWeak", {
      defaultValue: "Password is too weak. Please use a stronger password.",
    }),
  );
}
