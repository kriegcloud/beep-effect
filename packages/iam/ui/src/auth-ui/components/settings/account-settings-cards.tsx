"use client";

import { cn } from "@beep/ui-core/utils";
import { useContext } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import { AccountsCard } from "./account/accounts-card";
import { UpdateAvatarCard } from "./account/update-avatar-card";
import { UpdateFieldCard } from "./account/update-field-card";
import { UpdateNameCard } from "./account/update-name-card";
import { UpdateUsernameCard } from "./account/update-username-card";
import { ChangeEmailCard } from "./security/change-email-card";
import type { SettingsCardClassNames } from "./shared/settings-card";

export function AccountSettingsCards({
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
    additionalFields,
    avatar,
    changeEmail,
    credentials,
    hooks: { useSession },
    multiSession,
    account: accountOptions,
  } = useContext(AuthUIContext);

  const { data: sessionData } = useSession();

  return (
    <div className={cn("flex w-full flex-col gap-4 md:gap-6", className, classNames?.cards)}>
      {accountOptions?.fields?.includes("image") && avatar && (
        <UpdateAvatarCard classNames={classNames?.card} localization={localization} />
      )}

      {credentials?.username && <UpdateUsernameCard classNames={classNames?.card} localization={localization} />}

      {accountOptions?.fields?.includes("name") && (
        <UpdateNameCard classNames={classNames?.card} localization={localization} />
      )}

      {changeEmail && <ChangeEmailCard classNames={classNames?.card} localization={localization} />}

      {accountOptions?.fields?.map((field) => {
        if (field === "image") return null;
        if (field === "name") return null;
        const additionalField = additionalFields?.[field];
        if (!additionalField) return null;

        const { label, description, instructions, placeholder, required, type, multiline, validate } = additionalField;

        // @ts-expect-error Custom fields are not typed
        const defaultValue = sessionData?.user[field] as unknown;

        return (
          <UpdateFieldCard
            key={field}
            classNames={classNames?.card}
            value={defaultValue}
            description={description}
            name={field}
            instructions={instructions}
            label={label}
            localization={localization}
            placeholder={placeholder}
            required={required}
            type={type}
            multiline={multiline}
            validate={validate}
          />
        );
      })}

      {multiSession && <AccountsCard classNames={classNames?.card} localization={localization} />}
    </div>
  );
}
