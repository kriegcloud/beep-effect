import type { Icon } from "@phosphor-icons/react";

export interface SettingsNavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: Icon;
  readonly isActive?: boolean;
}

export interface SettingsNavGroup {
  readonly label: string;
  readonly icon: Icon;
  readonly items: readonly SettingsNavItem[];
  readonly isExpanded?: boolean;
}

export interface WorkspaceInfo {
  readonly id: string;
  readonly name: string;
  readonly avatarSrc: string;
  readonly settingsHref: string;
}

export interface SettingsTab {
  readonly label: string;
  readonly href: string;
  readonly isActive?: boolean;
}

export interface UserInfo {
  readonly username: string;
  readonly displayName: string;
}
