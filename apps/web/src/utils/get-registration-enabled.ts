import "server-only";

import { getInstanceSettings } from "@/features/instance-settings/queries";
import { isFeatureEnabled } from "@/lib/feature-flags/server";
import { env } from "@/env";

export async function getRegistrationEnabled() {
  // If REGISTRATION_ENABLED is explicitly set to "true", allow registration
  // even if instance settings would disable it (for demo mode setup)
  if (env.REGISTRATION_ENABLED === "true") {
    return true;
  }
  
  if (!isFeatureEnabled("registration")) {
    return false;
  }
  const instanceSettings = await getInstanceSettings();

  return !instanceSettings.disableUserRegistration;
}
