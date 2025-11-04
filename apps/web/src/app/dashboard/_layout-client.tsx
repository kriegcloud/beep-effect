"use client";
import { assetPaths } from "@beep/constants";
import { AccountSettingsTabSearchParamValue } from "@beep/iam-domain";
import { useSignOut } from "@beep/iam-sdk/clients/sign-out";
import { _contacts, _notifications } from "@beep/mock";
import { makeRunClientPromise, urlSearchParamSSR, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { DashboardLayout } from "@beep/ui/layouts";
import type { Atom } from "@effect-atom/atom-react";
import { useAtom } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import React from "react";
import { AccountDialog } from "@/features/account/account-dialog";
import { AuthGuard } from "@/providers/AuthGuard";

const settingsDialogAtom: Atom.Writable<O.Option<AccountSettingsTabSearchParamValue.Type>> = urlSearchParamSSR(
  "settingsTab",
  {
    schema: AccountSettingsTabSearchParamValue,
  }
);

const useSettingsDialog = () => {
  const [currentTab, setCurrentTab] = useAtom(settingsDialogAtom);

  const handleClose = () => setCurrentTab(O.none());

  const handleTab = (tabValue: AccountSettingsTabSearchParamValue.Type) => setCurrentTab(O.some(tabValue));

  return {
    currentTab,
    handleTab,
    handleClose,
  };
};
const _workspaces = [
  {
    id: "team-1",
    name: "Team 1",
    plan: "Free",
    logo: assetPaths.assets.icons.workspaces.logo1,
  },
  {
    id: "team-2",
    name: "Team 2",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo2,
  },
  {
    id: "team-3",
    name: "Team 3",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo3,
  },
];

const TEMP_MOCKED_DATA = {
  userOrgs: [
    {
      id: 1,
      name: "beep 1",
      logo: assetPaths.assets.images.mock.avatar.avatar1,
    },
    {
      id: 2,
      name: "beep 2",
      logo: assetPaths.assets.images.mock.avatar.avatar1,
    },
  ],
  userAccounts: [
    { id: 1, name: "account 1" },
    { id: 2, name: "account 2" },
  ],
  notifications: _notifications,
  workspaces: _workspaces,
  contacts: _contacts,
};

type Props = {
  children: React.ReactNode;
};
// mock switchAccount with Promise timeout
const switchAccount = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const switchOrg = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export function LayoutClient({ children }: Props) {
  const router = useRouter();
  const runtime = useRuntime();
  const { signOut } = useSignOut();
  const runSwitchAccount = makeRunClientPromise(runtime, "iam.account.switchAccount");
  const runSwitchOrg = makeRunClientPromise(runtime, "iam.organization.switchOrg");

  const { currentTab, handleTab, handleClose } = useSettingsDialog();
  return (
    <React.Suspense>
      <AuthGuard
        switchAccount={() => runSwitchAccount(Effect.tryPromise(switchAccount))}
        switchOrganization={() => runSwitchOrg(Effect.tryPromise(switchOrg))}
        signOut={async () =>
          signOut({
            onSuccess: () => {
              router.refresh();
              void router.push(paths.auth.signIn);
            },
          })
        }
        userOrgs={TEMP_MOCKED_DATA.userOrgs}
        userAccounts={TEMP_MOCKED_DATA.userAccounts}
        notifications={TEMP_MOCKED_DATA.notifications}
        workspaces={TEMP_MOCKED_DATA.workspaces}
        contacts={TEMP_MOCKED_DATA.contacts}
      >
        <AccountDialog onClose={() => handleClose()} handleTab={handleTab} currentTab={currentTab} />
        <DashboardLayout onClickAccountSettings={() => handleTab("general")}>{children}</DashboardLayout>
      </AuthGuard>
    </React.Suspense>
  );
}
