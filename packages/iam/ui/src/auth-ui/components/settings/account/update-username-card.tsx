"use client";

import type { User } from "@beep/iam-infra/adapters/better-auth/types";
import { useContext } from "react";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardProps } from "../shared/settings-card";
import { UpdateFieldCard } from "./update-field-card";

export function UpdateUsernameCard({ className, classNames, localization, ...props }: SettingsCardProps) {
  const {
    hooks: { useSession },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessionData } = useSession();
  const value = (sessionData?.user as User)?.displayUsername || (sessionData?.user as User)?.username;

  return (
    <UpdateFieldCard
      className={className}
      classNames={classNames}
      value={value}
      description={localization.USERNAME_DESCRIPTION}
      name="username"
      instructions={localization.USERNAME_INSTRUCTIONS}
      label={localization.USERNAME}
      localization={localization}
      placeholder={localization.USERNAME_PLACEHOLDER}
      required
      {...props}
    />
  );
}
