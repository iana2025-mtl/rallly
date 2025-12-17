import "../../style.css";

import { PostHogIdentify, PostHogProvider } from "@rallly/posthog/client";
import { Toaster } from "@rallly/ui/sonner";
import { TooltipProvider } from "@rallly/ui/tooltip";
import { domAnimation, LazyMotion } from "motion/react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { PublicEnvScript } from "next-runtime-env";
import type React from "react";

import { TimeZoneChangeDetector } from "@/app/[locale]/timezone-change-detector";
import type { Params } from "@/app/[locale]/types";
import { UserProvider } from "@/components/user-provider";
import { PreferencesProvider } from "@/contexts/preferences";
import { I18nProvider } from "@/i18n/client";
import { FeatureFlagsProvider } from "@/lib/feature-flags/client";
import { featureFlagConfig } from "@/lib/feature-flags/config";
import { LocaleSync } from "@/lib/locale/client";
import { TimezoneProvider } from "@/lib/timezone/client/context";
import { TRPCProvider } from "@/trpc/client/provider";
import { ConnectedDayjsProvider } from "@/utils/dayjs";
import { PostHogPageView } from "../posthog-page-view";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Public demo mode: Still check for user session if logged in
async function loadData() {
  try {
    const { getCurrentUser } = await import("@/auth/data");
    const user = await getCurrentUser();
    return {
      user,
    };
  } catch (error) {
    // In demo mode, allow access without user
    console.warn("Failed to get user (expected in demo mode):", error);
    return {
      user: null,
    };
  }
}

export default async function Root({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { locale } = await params;
  const { user } = await loadData();

  return (
    <html lang={locale} className={inter.className}>
      <head>
        <PublicEnvScript />
      </head>
      <body>
        <FeatureFlagsProvider value={featureFlagConfig}>
          <Toaster />
          <I18nProvider locale={locale}>
            <TRPCProvider>
              <LazyMotion features={domAnimation}>
                <PostHogProvider>
                  <PostHogIdentify
                    distinctId={user?.id}
                  />
                  <PostHogPageView />
                  <TooltipProvider>
                    <UserProvider user={user ?? undefined}>
                      <LocaleSync userLocale={user?.locale ?? locale} />
                      <PreferencesProvider
                        initialValue={{
                          timeFormat: user?.timeFormat ?? undefined,
                          timeZone: user?.timeZone ?? undefined,
                          weekStart: user?.weekStart ?? undefined,
                        }}
                      >
                        <TimezoneProvider initialTimezone={user?.timeZone ?? undefined}>
                          <ConnectedDayjsProvider>
                            {children}
                            <TimeZoneChangeDetector />
                          </ConnectedDayjsProvider>
                        </TimezoneProvider>
                      </PreferencesProvider>
                    </UserProvider>
                  </TooltipProvider>
                </PostHogProvider>
              </LazyMotion>
            </TRPCProvider>
          </I18nProvider>
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: "%s | Rallly",
      default: "Rallly",
    },
  };
}
