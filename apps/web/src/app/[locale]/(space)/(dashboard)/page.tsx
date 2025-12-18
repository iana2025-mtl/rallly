import { prisma } from "@rallly/database";
import { Tile, TileDescription, TileGrid, TileTitle } from "@rallly/ui/tile";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BillingPageIcon,
  CreatePageIcon,
  EventPageIcon,
  MembersPageIcon,
  PollPageIcon,
  SettingsPageIcon,
} from "@/app/components/page-icons";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/app/components/page-layout";
import { getCurrentUser, requireSpace, requireUser } from "@/auth/data";
import { Button } from "@rallly/ui/button";
import { Trans } from "@/components/trans";
import { GroupMeetingsLogo } from "@/components/group-meetings-logo";
import { IfCloudHosted } from "@/contexts/environment";
import { getUpcomingEventsCount } from "@/features/scheduled-event/data";
import { loadMembers } from "@/features/space/data";
import { defineAbilityForMember } from "@/features/space/member/ability";
import { getTotalSeatsForSpace } from "@/features/space/utils";
import { getUserHasNoAccounts } from "@/features/user/queries";
import { getTranslation } from "@/i18n/server";
import { IfFeatureEnabled } from "@/lib/feature-flags/client";
import { isFeatureEnabled } from "@/lib/feature-flags/server";
import { FeedbackAlert } from "./feedback-alert";
import { PasswordSetupAlert } from "./password-setup-alert";

async function loadData() {
  const [space, user] = await Promise.all([requireSpace(), requireUser()]);

  // Public demo mode: return empty data if no auth
  if (!space || !user) {
    return {
      livePollCount: 0,
      upcomingEventCount: 0,
      memberCount: 0,
      seatCount: 0,
      canManageBilling: false,
      hasNoAccounts: false,
    };
  }

  // Public demo mode: These functions call requireSpace() internally, 
  // which will return null. Handle errors gracefully.
  let upcomingEventCount = 0;
  let memberCount = 0;
  let seatCount = 0;
  let hasNoAccounts = false;

  try {
    const [livePollCountResult, upcomingEventsResult, membersResult, seatCountResult, hasNoAccountsResult] = await Promise.all([
      prisma.poll.count({
        where: {
          spaceId: space.id,
          status: "live",
          deleted: false,
        },
      }),
      getUpcomingEventsCount().catch(() => 0),
      loadMembers().catch(() => ({ total: 0, data: [] })),
      getTotalSeatsForSpace(space.id).catch(() => 0),
      getUserHasNoAccounts(user.id).catch(() => false),
    ]);

    upcomingEventCount = upcomingEventsResult;
    memberCount = membersResult.total;
    seatCount = seatCountResult;
    hasNoAccounts = hasNoAccountsResult;

    const ability = defineAbilityForMember({ space, user });
    const canManageBilling = ability.can("manage", "Billing");

    return {
      livePollCount: livePollCountResult,
      upcomingEventCount,
      memberCount,
      seatCount,
      canManageBilling,
      hasNoAccounts,
    };
  } catch (error) {
    // Public demo mode: If any function fails (e.g., requireSpace returns null),
    // return empty data gracefully
    console.warn("loadData failed (expected in demo mode):", error);
    return {
      livePollCount: 0,
      upcomingEventCount: 0,
      memberCount: 0,
      seatCount: 0,
      canManageBilling: false,
      hasNoAccounts: false,
    };
  }
}


export default async function Page(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const user = await getCurrentUser();
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect(`/${params.locale}/login`);
  }

  const {
    livePollCount,
    upcomingEventCount,
    memberCount,
    seatCount,
    canManageBilling,
    hasNoAccounts,
  } = await loadData();

  const isEmailLoginEnabled = isFeatureEnabled("emailLogin");

  return (
    <PageContainer className="bg-gradient-to-br from-[#ffe5e9]/20 via-white to-[#fdd7c2]/20 min-h-screen">
      <PageHeader className="mb-6">
        <div className="flex items-center gap-4">
          <GroupMeetingsLogo size="md" />
          <PageTitle className="text-[#1e3a5f]">
            <Trans i18nKey="home" defaults="Home" />
          </PageTitle>
        </div>
        {!user && isEmailLoginEnabled && (
          <PageHeaderActions>
            <Button variant="primary" asChild>
              <Link href="/login">
                <Trans i18nKey="login" defaults="Login" />
              </Link>
            </Button>
          </PageHeaderActions>
        )}
      </PageHeader>
      <PageContent className="space-y-8">
        <div className="space-y-4">
          {hasNoAccounts && isEmailLoginEnabled ? <PasswordSetupAlert /> : null}
          <IfCloudHosted>
            <FeedbackAlert />
          </IfCloudHosted>
        </div>
        <div className="space-y-4">
          <h2 className="text-[#1e3a5f] font-semibold text-base">
            <Trans i18nKey="homeActionsTitle" defaults="Actions" />
          </h2>
          <TileGrid>
            <Tile 
              asChild
              className="hover:bg-gradient-to-br hover:from-[#c7dbda]/30 hover:to-[#ffe5e9]/30 transition-all border-[#c7dbda]/50"
            >
              <Link href="/new">
                <CreatePageIcon />
                <TileTitle className="text-[#1e3a5f]">
                  <Trans i18nKey="create" defaults="Create" />
                </TileTitle>
              </Link>
            </Tile>
          </TileGrid>
        </div>
        <div className="space-y-4">
          <h2 className="text-[#1e3a5f] font-semibold text-base">
            <Trans i18nKey="content" defaults="Content" />
          </h2>
          <TileGrid>
            <Tile 
              asChild
              className="hover:bg-gradient-to-br hover:from-[#c7dbda]/30 hover:to-[#ffe5e9]/30 transition-all border-[#c7dbda]/50"
            >
              <Link href="/polls">
                <PollPageIcon />
                <TileTitle className="text-[#1e3a5f]">
                  <Trans i18nKey="polls" defaults="Polls" />
                </TileTitle>
                <TileDescription className="text-[#1e3a5f]/70">
                  <Trans
                    i18nKey="livePollCount"
                    defaults="{count} live"
                    values={{ count: livePollCount }}
                  />
                </TileDescription>
              </Link>
            </Tile>

            <Tile 
              asChild
              className="hover:bg-gradient-to-br hover:from-[#ffe5e9]/30 hover:to-[#fdd7c2]/30 transition-all border-[#ffe5e9]/50"
            >
              <Link href="/events">
                <EventPageIcon />
                <TileTitle className="text-[#1e3a5f]">
                  <Trans i18nKey="events" defaults="Events" />
                </TileTitle>
                <TileDescription className="text-[#1e3a5f]/70">
                  <Trans
                    i18nKey="upcomingEventCount"
                    defaults="{count} upcoming"
                    values={{ count: upcomingEventCount }}
                  />
                </TileDescription>
              </Link>
            </Tile>
          </TileGrid>
        </div>
        <div className="space-y-4">
          <h2 className="text-[#1e3a5f] font-semibold text-base">
            <Trans i18nKey="manage" defaults="Manage" />
          </h2>
          <TileGrid>
            <Tile 
              asChild
              className="hover:bg-gradient-to-br hover:from-[#c7dbda]/30 hover:to-[#ffe5e9]/30 transition-all border-[#c7dbda]/50"
            >
              <Link href="/settings/general">
                <SettingsPageIcon />
                <TileTitle className="text-[#1e3a5f]">
                  <Trans i18nKey="settings" defaults="Settings" />
                </TileTitle>
              </Link>
            </Tile>

            <Tile 
              asChild
              className="hover:bg-gradient-to-br hover:from-[#ffe5e9]/30 hover:to-[#fdd7c2]/30 transition-all border-[#ffe5e9]/50"
            >
              <Link href="/settings/members">
                <MembersPageIcon />
                <TileTitle className="text-[#1e3a5f]">
                  <Trans i18nKey="members" defaults="Members" />
                </TileTitle>
                <TileDescription className="text-[#1e3a5f]/70">
                  <Trans
                    i18nKey="memberCount"
                    defaults="{count, plural, =0 {No members} one {1 member} other {# members}}"
                    values={{ count: memberCount }}
                  />
                </TileDescription>
              </Link>
            </Tile>

            <IfFeatureEnabled feature="billing">
              {canManageBilling && (
                <Tile 
                  asChild
                  className="hover:bg-gradient-to-br hover:from-[#fdd7c2]/30 hover:to-[#c7dbda]/30 transition-all border-[#fdd7c2]/50"
                >
                  <Link href="/settings/billing">
                    <BillingPageIcon />
                    <TileTitle className="text-[#1e3a5f]">
                      <Trans i18nKey="billing" defaults="Billing" />
                    </TileTitle>
                    <TileDescription className="text-[#1e3a5f]/70">
                      <Trans
                        i18nKey="seatCount"
                        defaults="{count, plural, =0 {No seats} one {1 seat} other {# seats}}"
                        values={{ count: seatCount }}
                      />
                    </TileDescription>
                  </Link>
                </Tile>
              )}
            </IfFeatureEnabled>
          </TileGrid>
        </div>
      </PageContent>
    </PageContainer>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslation();
  return {
    title: t("home", {
      defaultValue: "Home",
    }),
  };
}
