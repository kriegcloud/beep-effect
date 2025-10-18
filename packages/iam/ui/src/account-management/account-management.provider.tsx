"use client";
import { createCtx } from "@beep/ui-core/utils/createCtx";

import type React from "react";
import type { AddressInfo, BackupSyncSettings, CardInfo, PersonalInfo, Storage } from "./TEMP_MOCK";

interface AccountManagementContext {
  readonly personalInfo: PersonalInfo.Type;
  readonly shippingBillingAddress: {
    readonly shippingAddress: AddressInfo.Type;
    readonly billingAddress: AddressInfo.Type;
  };
  readonly storage: {
    readonly backupSyncSettings: BackupSyncSettings.Type;
    readonly storageData: Storage.Type;
  };
  readonly creditCards: CardInfo.Type;
}

const [useAccountManagement, Provider] = createCtx<AccountManagementContext>("AccountManagement");

export const AccountManagementProvider: React.FC<React.PropsWithChildren<AccountManagementContext>> = ({
  children,
  personalInfo,
  shippingBillingAddress,
  storage,
  creditCards,
}) => {
  return (
    <Provider
      value={{
        personalInfo,
        shippingBillingAddress: {
          shippingAddress: shippingBillingAddress.shippingAddress,
          billingAddress: shippingBillingAddress.billingAddress,
        },
        creditCards,
        storage: {
          backupSyncSettings: storage.backupSyncSettings,
          storageData: storage.storageData,
        },
      }}
    >
      {children}
    </Provider>
  );
};

export { useAccountManagement };
