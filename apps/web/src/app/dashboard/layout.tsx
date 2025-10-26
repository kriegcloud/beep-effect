"use client";
import { assetPaths } from "@beep/constants";
import { useSignOut } from "@beep/iam-sdk/clients/sign-out";
import { _contacts, _mock } from "@beep/mock";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { paths } from "@beep/shared-domain";
import { useRouter } from "@beep/ui/hooks";
import { DashboardLayout } from "@beep/ui/layouts";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import React from "react";
import { AuthGuard } from "@/providers/AuthGuard";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const REFERENCE_ACTIVITY_TIMESTAMP = Date.UTC(2024, 0, 1, 12, 0, 0);

const _images = [
  assetPaths.assets.images.mock.avatar.avatar1,
  assetPaths.assets.images.mock.avatar.avatar2,
  assetPaths.assets.images.mock.avatar.avatar3,
  assetPaths.assets.images.mock.avatar.avatar4,
];

const _lastActivity = A.makeBy(20, (index) =>
  new Date(REFERENCE_ACTIVITY_TIMESTAMP - index * (MS_PER_DAY + MS_PER_HOUR)).toISOString()
);

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

const _notificationTypes = [
  "friend",
  "project",
  "file",
  "tags",
  "payment",
  "order",
  "delivery",
  "chat",
  "mail",
] as const;

const _notificationCategories = [
  "Communication",
  "Project UI",
  "File manager",
  "File manager",
  "File manager",
  "Order",
  "Order",
  "Communication",
  "Communication",
] as const;

const _notificationTitles = [
  `<p><strong>Deja Brady</strong> sent you a friend request</p>`,
  `<p><strong>Jayvon Hull</strong> mentioned you in <strong><a href='#'>Minimal UI</a></strong></p>`,
  `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File manager</a></strong></p>`,
  `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File manager</a></strong></p>`,
  `<p><strong>Giana Brandt</strong> request a payment of <strong>$200</strong></p>`,
  `<p>Your order is placed waiting for shipping</p>`,
  `<p>Delivery processing your order is being shipped</p>`,
  `<p>You have new message 5 unread messages</p>`,
  `<p>You have new mail</p>`,
] as const;

const _notificationCreatedAt = F.pipe(_lastActivity, A.take(9));

const _notifications = A.map(_notificationCreatedAt, (createdAt, index) => {
  const avatarUrl = _images[index % _images.length]!;

  return {
    id: _mock.id(index)!,
    avatarUrl,
    type: _notificationTypes[index]!,
    category: _notificationCategories[index]!,
    isUnread: false,
    createdAt,
    title: _notificationTitles[index]!,
  };
});
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

export default function Layout({ children }: Props) {
  const router = useRouter();
  const runtime = useRuntime();
  const { signOut } = useSignOut();
  const runSwitchAccount = makeRunClientPromise(runtime, "iam.account.switchAccount");
  const runSwitchOrg = makeRunClientPromise(runtime, "iam.organization.switchOrg");

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
        <DashboardLayout>{children}</DashboardLayout>
      </AuthGuard>
    </React.Suspense>
  );
}
