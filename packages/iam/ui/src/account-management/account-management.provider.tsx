"use client";
import { createCtx } from "@beep/ui-core/utils/createCtx";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";
import { AddressInfo, BackupSyncSettings, CardInfo, PersonalInfo, Storage } from "./TEMP_MOCK";

interface AccountManagementContext {
  readonly personalInfo: PersonalInfo.Type;
  readonly shippingBillingAddress: {
    readonly shippingAddress: AddressInfo.Type;
    readonly billingAddress: AddressInfo.Type;
  };
  readonly storage: {
    readonly backupSyncSettings: ReadonlyArray<BackupSyncSettings.Type>;
    readonly storageData: Storage.Type;
  };
  readonly creditCards: ReadonlyArray<CardInfo.Type>;
}

const [useAccountManagement, Provider] = createCtx<AccountManagementContext>("AccountManagement");

const mockAddress = F.pipe(AddressInfo.Mock(1), A.head, O.getOrThrow, F.constant);

export const AccountManagementProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [personalInfo] = React.useState<PersonalInfo.Type>(F.pipe(PersonalInfo.Mock(1), A.head, O.getOrThrow));
  const [shippingAddress] = React.useState<AddressInfo.Type>(mockAddress());
  const [billingAddress] = React.useState<AddressInfo.Type>(mockAddress());
  const [creditCards] = React.useState<ReadonlyArray<CardInfo.Type>>(F.pipe(CardInfo.Mock(3)));
  const [backupSyncSettings] = React.useState<ReadonlyArray<BackupSyncSettings.Type>>(
    F.pipe(BackupSyncSettings.Mock(1))
  );

  const [storageData] = React.useState<Storage.Type>(F.pipe(Storage.Mock(1), A.head, O.getOrThrow));

  return (
    <Provider
      value={{
        personalInfo,
        shippingBillingAddress: {
          shippingAddress,
          billingAddress,
        },
        creditCards,
        storage: {
          backupSyncSettings,
          storageData,
        },
      }}
    >
      {children}
    </Provider>
  );
};

export { useAccountManagement };
