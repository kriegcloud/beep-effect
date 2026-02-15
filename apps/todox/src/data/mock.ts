/**
 * Temporary mock data for prototype UI.
 * TODO: Replace with real data from Effect Atom state management.
 */

import { assetPaths } from "@beep/constants";
import type {
  SettingsNavGroup,
  SettingsNavItem,
  SettingsTab,
  UserInfo,
  WorkspaceInfo,
} from "@beep/todox/types/navigation";
import {
  ArchiveIcon,
  BellIcon,
  ChartLineUpIcon,
  GearSixIcon,
  GiftIcon,
  KeyIcon,
  LinkIcon,
  PlugIcon,
  RocketIcon,
  ShieldIcon,
  UserIcon,
} from "@phosphor-icons/react";

export const currentUser: UserInfo = {
  username: "benjamintoppold",
  displayName: "Benjamin Toppold",
};

export const settingsNavItems: readonly SettingsNavItem[] = [
  { label: "General", href: "/settings", icon: UserIcon, isActive: true },
  { label: "Plans", href: "/settings/plans", icon: RocketIcon },
  { label: "Usage & Billing", href: "/settings/usage", icon: ChartLineUpIcon },
  { label: "Credits & Rewards", href: "/settings/credits", icon: GiftIcon },
  { label: "Notifications", href: "/settings/notifications", icon: BellIcon },
  { label: "Archives", href: "/settings/archives", icon: ArchiveIcon },
];

export const settingsNavGroups: readonly SettingsNavGroup[] = [
  {
    label: "Integrations",
    icon: PlugIcon,
    items: [],
  },
  {
    label: "Manage",
    icon: GearSixIcon,
    items: [],
  },
];

export const settingsGeneralSubNav: readonly SettingsNavItem[] = [
  { label: "Account", href: "/settings", icon: UserIcon, isActive: true },
  { label: "Password", href: "/settings/password", icon: KeyIcon },
  { label: "Connected Accounts", href: "/settings/sso", icon: LinkIcon },
  { label: "Sessions", href: "/settings/sessions", icon: ShieldIcon },
];

export const settingsTabs: readonly SettingsTab[] = [
  { label: "Account", href: "/settings", isActive: true },
  { label: "Password", href: "/settings/password" },
  { label: "Connected Accounts", href: "/settings/sso" },
  { label: "Sessions", href: "/settings/sessions" },
];

export const currentWorkspace: WorkspaceInfo = {
  id: "Yufy1godJk9Yddwv",
  name: "Workspace",
  avatarSrc: assetPaths.logo,
  settingsHref: "/settings/manage/Yufy1godJk9Yddwv",
};
