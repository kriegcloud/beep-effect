import type { User } from "@beep/shared-domain/entities";
import { createCtx } from "@beep/ui-core/utils";
import type React from "react";

export type AccountSettingsProviderCtxValue = {
  readonly userInfo: User.Model;
};

type AccountSettingsProviderProps = React.PropsWithChildren<{
  readonly userInfo: User.Model;
}>;

const [useAccountSettings, Provider] = createCtx<AccountSettingsProviderCtxValue>("AccountSettingsProvider");

export const AccountSettingsProvider: React.FC<AccountSettingsProviderProps> = ({ children, userInfo }) => {
  return <Provider value={{ userInfo }}>{children}</Provider>;
};

export { useAccountSettings };
