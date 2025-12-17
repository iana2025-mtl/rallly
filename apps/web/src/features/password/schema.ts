"use client";
import { z } from "zod";
import {
  calculatePasswordStrength,
  passwordQualityThresholds,
} from "@/features/password/utils";
import { useTranslation } from "@/i18n/client";
import { useFeatureFlags } from "@/lib/feature-flags/client";

export function usePasswordValidationSchema() {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();
  // In demo mode or when registration is enabled, relax password requirements
  // This allows simple passwords for hobby/school projects
  const shouldRelaxRequirements = featureFlags?.registration === true;
  
  // When relaxed, only require minimum length (8 chars) - no strength requirement
  // For production, require "good" strength (score 3/4)
  if (shouldRelaxRequirements) {
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
