"use client";

import { cn } from "@beep/ui-core/utils";
import { useContext } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { DeleteAccountCard } from "./account/delete-account-card";
import { PasskeysCard } from "./passkey/passkeys-card";
import { ProvidersCard } from "./providers/providers-card";
import { ChangePasswordCard } from "./security/change-password-card";
import { SessionsCard } from "./security/sessions-card";
import type { SettingsCardClassNames } from "./shared/settings-card";
import { TwoFactorCard } from "./two-factor/two-factor-card";

export function SecuritySettingsCards({
  className,
  classNames,
  localization,
}: {
  className?: string;
  classNames?: {
    card?: SettingsCardClassNames;
    cards?: string;
  };
  localization?: Partial<AuthLocalization>;
}) {
  const {
    credentials,
    deleteUser,
    hooks,
    localization: contextLocalization,
    passkey,
    social,
    genericOAuth,
    twoFactor,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { useListAccounts } = hooks;

  const { data: accounts, isPending: accountsPending, refetch: refetchAccounts } = useListAccounts();

  const credentialsLinked = accounts?.some((acc) => acc.providerId === "credential");

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
      {credentials && (
        <ChangePasswordCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          localization={localization}
          skipHook
        />
      )}

      {(social?.providers?.length || genericOAuth?.providers?.length) && (
        <ProvidersCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          localization={localization}
          refetch={refetchAccounts}
          skipHook
        />
      )}

      {twoFactor && credentialsLinked && <TwoFactorCard classNames={classNames?.card} localization={localization} />}

      {passkey && <PasskeysCard classNames={classNames?.card} localization={localization} />}

      <SessionsCard classNames={classNames?.card} localization={localization} />

      {deleteUser && (
        <DeleteAccountCard
          accounts={accounts}
          classNames={classNames?.card}
          isPending={accountsPending}
          localization={localization}
          skipHook
        />
      )}
    </div>
  );
}
