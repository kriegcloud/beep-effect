"use client";

import type { User } from "@beep/iam-infra/adapters/better-auth/types";
import { useContext, useState } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";
import { TwoFactorPasswordDialog } from "./two-factor-password-dialog";

export interface TwoFactorCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: AuthLocalization;
}

export function TwoFactorCard({ className, classNames, localization }: TwoFactorCardProps) {
  const {
    localization: contextLocalization,
    hooks: { useSession },
  } = useContext(AuthUIContext);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  localization = { ...contextLocalization, ...localization };

  const { data: sessionData, isPending } = useSession();
  const isTwoFactorEnabled = (sessionData?.user as User)?.twoFactorEnabled;

  return (
    <div>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={isTwoFactorEnabled ? localization.DISABLE_TWO_FACTOR : localization.ENABLE_TWO_FACTOR}
        description={localization.TWO_FACTOR_CARD_DESCRIPTION}
        instructions={
          isTwoFactorEnabled
            ? localization.TWO_FACTOR_DISABLE_INSTRUCTIONS
            : localization.TWO_FACTOR_ENABLE_INSTRUCTIONS
        }
        isPending={isPending}
        title={localization.TWO_FACTOR}
        action={() => setShowPasswordDialog(true)}
      />

      <TwoFactorPasswordDialog
        classNames={classNames}
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        isTwoFactorEnabled={!!isTwoFactorEnabled}
      />
    </div>
  );
}
