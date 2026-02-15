"use client";

import {
  currentWorkspace as defaultWorkspace,
  settingsGeneralSubNav,
  settingsNavGroups,
  settingsNavItems,
} from "@beep/todox/data/mock";
import type { SettingsNavGroup, SettingsNavItem, WorkspaceInfo } from "@beep/todox/types/navigation";
import { CaretDownIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

interface SettingsNavProps {
  readonly items?: readonly SettingsNavItem[];
  readonly groups?: readonly SettingsNavGroup[];
  readonly workspace?: WorkspaceInfo;
}

function NavLink({ item, size = "md" }: { readonly item: SettingsNavItem; readonly size?: "sm" | "md" }) {
  const Icon = item.icon;
  const baseClasses =
    size === "sm"
      ? "liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"
      : "liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out";

  const activeClasses =
    size === "sm"
      ? "liquid-nav-item-dark selected text-textcolor-900 font-medium"
      : "liquid-nav-item-dark selected text-textcolor-1000 font-medium active";

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <a
      className={`${baseClasses} ${item.isActive ? activeClasses : ""} ${size === "md" ? "hidden sm:flex" : ""}`}
      href={item.href}
    >
      <Icon className={iconSize} aria-hidden="true" />
      {item.label}
    </a>
  );
}

function NavGroup({ group }: { readonly group: SettingsNavGroup }) {
  const Icon = group.icon;

  return (
    <div>
      <button
        type="button"
        className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out group w-full justify-between"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" aria-hidden="true" />
          {group.label}
        </div>
        <CaretDownIcon
          className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-105"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function MobileGeneralGroup() {
  const firstIcon = F.pipe(
    settingsNavItems,
    A.head,
    O.map((first) => {
      const Icon = first.icon;
      return <Icon className="h-5 w-5" aria-hidden="true" />;
    }),
    O.getOrNull
  );

  return (
    <div className="block sm:hidden">
      <button
        type="button"
        className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out group w-full justify-between liquid-nav-item-dark selected text-textcolor-1000 font-medium"
      >
        <div className="flex items-center gap-3">
          {firstIcon}
          General
        </div>
        <CaretDownIcon
          className="h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-105"
          aria-hidden="true"
        />
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100">
        <div className="bg-appcolor-50/40 dark:bg-appcolor-100/40 ml-1 space-y-0.5 rounded-lg border-0 p-1.5 shadow-sm backdrop-blur-md">
          {F.pipe(
            settingsGeneralSubNav,
            A.map((item) => <NavLink key={item.href} item={item} size="sm" />)
          )}
        </div>
      </div>
    </div>
  );
}

function WorkspaceSettingsSection({ workspace }: { readonly workspace: WorkspaceInfo }) {
  return (
    <div className="flex flex-col">
      <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-textcolor-500">
        <a href="/settings/manage">Workspace Settings</a>
      </div>
      <a
        className="liquid-nav-item-dark text-appcolor-800 relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-1 text-sm transition-all duration-200 ease-in-out"
        href={workspace.settingsHref}
      >
        <div
          className="flex items-center justify-center rounded-[40%] h-6 w-6 flex-none"
          style={{
            background: "linear-gradient(135deg, rgb(40, 164, 40) 0%, rgb(71, 195, 122) 100%)",
          }}
        >
          <div className="flex h-full w-full items-center justify-center !rounded-[40%]">
            <img src={workspace.avatarSrc} alt={workspace.name} className="h-full w-full rounded-[40%] object-cover" />
          </div>
        </div>
        <span className="w-full truncate">{workspace.name}</span>
      </a>
    </div>
  );
}

export function SettingsNav({
  items = settingsNavItems,
  groups = settingsNavGroups,
  workspace = defaultWorkspace,
}: SettingsNavProps) {
  const integrationsEl = F.pipe(
    groups,
    A.head,
    O.map((group) => <NavGroup key={group.label} group={group} />),
    O.getOrNull
  );

  const manageEl = F.pipe(
    groups,
    A.get(1),
    O.map((group) => <NavGroup key={group.label} group={group} />),
    O.getOrNull
  );

  return (
    <div className="relative h-full overflow-hidden border-r" style={{ width: "200px", opacity: 1 }}>
      <div className="orb-backdrop !z-0">
        <div className="orb-primary" />
        <div className="orb-secondary" />
      </div>
      <div
        className="absolute left-0 top-0 flex h-full w-full flex-col overflow-auto"
        style={{ width: "280px", opacity: 1, transform: "none" }}
      >
        <div className="px-2 py-3">
          <div className="flex flex-col">
            <MobileGeneralGroup />

            {F.pipe(
              items,
              A.map((item) => <NavLink key={item.href} item={item} size="md" />)
            )}

            {integrationsEl}
            {manageEl}

            <WorkspaceSettingsSection workspace={workspace} />
          </div>
        </div>
      </div>
    </div>
  );
}
