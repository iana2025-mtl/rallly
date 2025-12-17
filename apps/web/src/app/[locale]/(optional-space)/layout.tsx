import { requireSpace } from "@/auth/data";
import { BillingProvider } from "@/features/billing/client";
import { SpaceProvider } from "@/features/space/client";

// Public demo mode: No auth session check
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Public demo mode: Try to get space, but don't require session
  const space = await requireSpace();
  
  // Public demo mode: handle null space gracefully
  if (space && space.ownerId) {
    return (
      <SpaceProvider data={space} userId={space.ownerId}>
        <BillingProvider>{children}</BillingProvider>
      </SpaceProvider>
    );
  }

  return <BillingProvider>{children}</BillingProvider>;
}
