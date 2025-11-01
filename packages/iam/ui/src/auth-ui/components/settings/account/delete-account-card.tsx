"use client";

import type { Account } from "better-auth";
import { useContext, useState } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";
import { DeleteAccountDialog } from "./delete-account-dialog";

export interface DeleteAccountCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  accounts?: Account[] | null;
  isPending?: boolean;
  localization?: AuthLocalization;
  skipHook?: boolean;
}

export function DeleteAccountCard({
  className,
  classNames,
  accounts,
  isPending,
  localization,
  skipHook,
}: DeleteAccountCardProps) {
  const {
    hooks: { useListAccounts },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const [showDialog, setShowDialog] = useState(false);

  if (!skipHook) {
    const result = useListAccounts();
    accounts = result.data;
    isPending = result.isPending;
  }

  return (
    <div>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={localization?.DELETE_ACCOUNT}
        description={localization?.DELETE_ACCOUNT_DESCRIPTION}
        isPending={isPending}
        title={localization?.DELETE_ACCOUNT}
        variant="destructive"
        action={() => setShowDialog(true)}
      />

      <DeleteAccountDialog
        classNames={classNames}
        accounts={accounts}
        localization={localization}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </div>
  );
}
