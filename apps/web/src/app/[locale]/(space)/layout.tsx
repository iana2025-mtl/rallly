import { requireSpace, requireUser } from "@/auth/data";
import { BillingProvider } from "@/features/billing/client";
import { SpaceProvider } from "@/features/space/client";
import { TimezoneProvider } from "@/lib/timezone/client/context";

async function loadData() {
  const [user, space] = await Promise.all([requireUser(), requireSpace()]);

  return {
    user,
    space,
  };
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, space } = await loadData();

  // Public demo mode: render without space/user providers if not authenticated
  if (!space || !user) {
    return (
      <BillingProvider>
        {children}
      </BillingProvider>
    );
  }

  return (
    <SpaceProvider key={space.id} data={space} userId={user.id}>
      <BillingProvider>
        <TimezoneProvider initialTimezone={user.timeZone}>
          {children}
        </TimezoneProvider>
      </BillingProvider>
    </SpaceProvider>
  );
}
