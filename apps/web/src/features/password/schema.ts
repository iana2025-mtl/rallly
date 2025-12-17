"use client";
import { z } from "zod";
import {
  calculatePasswordStrength,
  passwordQualityThresholds,
} from "@/features/password/utils";
import { useTranslation } from "@/i18n/client";
import { env as runtimeEnv } from "next-runtime-env";

export function usePasswordValidationSchema() {
  const { t } = useTranslation();
  // Check DEMO_MODE from runtime environment (available on client)
  const isDemoMode = runtimeEnv("DEMO_MODE") === "true";
  
  // In demo mode, only require minimum length (8 chars) - no strength requirement
  // For production, require "good" strength (score 3/4)
  if (isDemoMode) {
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
