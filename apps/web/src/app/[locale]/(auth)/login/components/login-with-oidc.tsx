"use client";
import { Button } from "@rallly/ui/button";

import { Trans } from "@/components/trans";
import { authClient } from "@/lib/auth-client";
import { validateRedirectUrl } from "@/utils/redirect";

export function LoginWithOIDC({
  name,
  redirectTo,
}: {
  name: string;
  redirectTo?: string;
}) {
  return (
    <Button
      onClick={() => {
        authClient.signIn.oauth2({
          providerId: "oidc",
          callbackURL: validateRedirectUrl(redirectTo) || "/",
          errorCallbackURL: "/",  // Public demo mode: redirect to home instead of deleted /login
        });
      }}
      className="w-full"
      size="lg"
    >
      <Trans
        i18nKey="continueWithProvider"
        defaults="Continue with {provider}"
        values={{ provider: name }}
      />
    </Button>
  );
}
