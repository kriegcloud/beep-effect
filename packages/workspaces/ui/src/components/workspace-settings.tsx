"use client";

import { BellIcon, GearIcon, PaletteIcon, ShieldCheckIcon, TrashIcon, UsersIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import type * as React from "react";

// ---------------------------------------------------------------------------
// Settings sections
// ---------------------------------------------------------------------------

interface SettingsSection {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ElementType;
  readonly description: string;
}

const SETTINGS_SECTIONS: ReadonlyArray<SettingsSection> = [
  { id: "general", label: "General", icon: GearIcon, description: "Name, description, and visibility" },
  { id: "members", label: "Members", icon: UsersIcon, description: "Manage workspace members and roles" },
  { id: "permissions", label: "Permissions", icon: ShieldCheckIcon, description: "Access control and sharing" },
  { id: "appearance", label: "Appearance", icon: PaletteIcon, description: "Icons, cover images, and layout" },
  { id: "notifications", label: "Notifications", icon: BellIcon, description: "Email and in-app notification rules" },
  { id: "danger", label: "Danger Zone", icon: TrashIcon, description: "Archive or delete this workspace" },
];

// ---------------------------------------------------------------------------
// WorkspaceSettings
// ---------------------------------------------------------------------------

interface WorkspaceSettingsProps {
  readonly workspaceName?: string;
  readonly className?: string;
  readonly onSectionSelect?: (sectionId: string) => void;
}

export function WorkspaceSettings({
  workspaceName = "My Workspace",
  className,
  onSectionSelect,
}: WorkspaceSettingsProps) {
  return (
    <div data-slot="workspace-settings" className={["flex flex-col gap-6 p-6", className].filter(Boolean).join(" ")}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">{workspaceName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage workspace settings</p>
      </div>

      {/* Settings list */}
      <ul className="list-none p-0 m-0 space-y-1">
        {F.pipe(
          SETTINGS_SECTIONS,
          A.map((section) => {
            const SectionIcon = section.icon;
            return (
              <li key={section.id}>
                <button
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    section.id === "danger"
                      ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                      : "text-foreground",
                  ].join(" ")}
                  onClick={() => onSectionSelect?.(section.id)}
                >
                  <SectionIcon className="size-5 shrink-0" weight="duotone" />
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{section.label}</span>
                    <span className="block text-xs text-muted-foreground truncate">{section.description}</span>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
