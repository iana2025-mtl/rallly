"use client";
import { z } from "zod";
import { useTranslation } from "@/i18n/client";

export function usePasswordValidationSchema() {
  const { t } = useTranslation();
  
  // For demo/hobby projects: only require minimum length, no strength check
  // This allows simple passwords like "demo123456" for school projects
  return z.string().min(8, t("passwordMinLength", {
    defaultValue: "Password must be at least 8 characters long.",
  }));
}
