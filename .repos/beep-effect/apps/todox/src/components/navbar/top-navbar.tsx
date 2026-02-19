"use client";

import { MiniSidebarTrigger } from "@beep/todox/components/mini-sidebar";
import { TeamSwitcherCompact } from "@beep/todox/components/sidebar";
import { type Org, OrgSwitcherCompact } from "@beep/todox/components/sidebar/org-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@beep/todox/components/ui/avatar";
import { Button } from "@beep/todox/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@beep/todox/components/ui/dropdown-menu";
import type { Icon } from "@phosphor-icons/react";
import {
  BuildingsIcon,
  CaretDownIcon,
  CheckIcon,
  PlusIcon,
  RocketIcon,
  TerminalIcon,
  UsersFourIcon,
  UsersThreeIcon,
  WaveformIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as React from "react";
import { CommandSearch } from "./command-search";
import { NavbarUserDropdown, type User } from "./navbar-user-dropdown";
import { NotificationDropdown } from "./notification-dropdown";

const organizations: Org[] = [
  {
    name: "Acme Inc",
    logo: BuildingsIcon,
    plan: "",
  },
  {
    name: "Acme Corp.",
    logo: WaveformIcon,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: TerminalIcon,
    plan: "Free",
  },
];

interface Workspace {
  readonly id: string;
  readonly name: string;
  readonly logo: Icon;
}

interface App {
  readonly id: string;
  readonly name: string;
  readonly icon: Icon;
}

const teams: Org[] = [
  {
    name: "Default",
    logo: BuildingsIcon,
    plan: "",
  },
  {
    name: "Acme Corp.",
    logo: UsersThreeIcon,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: UsersFourIcon,
    plan: "Free",
  },
];

const workspaces: Workspace[] = [
  { id: "1", name: "Workspace", logo: BuildingsIcon },
  { id: "2", name: "Personal", logo: WaveformIcon },
  { id: "3", name: "Team Alpha", logo: TerminalIcon },
];

const apps: App[] = [
  { id: "1", name: "Projects", icon: RocketIcon },
  { id: "2", name: "Dashboard", icon: BuildingsIcon },
  { id: "3", name: "Analytics", icon: WaveformIcon },
];

interface TopNavbarProps {
  readonly user: User;
}

export function TopNavbar({ user }: TopNavbarProps) {
  const [activeWorkspace, setActiveWorkspace] = React.useState(workspaces[0]);
  const [activeApp, setActiveApp] = React.useState(apps[0]);

  if (!activeWorkspace || !activeApp) {
    return null;
  }

  const WorkspaceLogo = activeWorkspace.logo;
  const AppIcon = activeApp.icon;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between bg-background px-4">
      {/* Left side - Logo, Workspace, App selector */}
      <div className="flex items-center gap-1">
        {/* Logo/Avatar - triggers mini sidebar on hover/click */}
        <MiniSidebarTrigger>
          <Avatar className="size-7">
            <AvatarImage src="/logo.avif" alt="Logo" />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">B</AvatarFallback>
          </Avatar>
        </MiniSidebarTrigger>
        <span className="mx-1 text-muted-foreground">/</span>
        <OrgSwitcherCompact orgs={organizations} />
        <span className="mx-1 text-muted-foreground">/</span>
        {/* Team Selector */}
        <TeamSwitcherCompact teams={teams} />
        <span className="mx-1 text-muted-foreground">/</span>

        {/* Workspace Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-sm font-medium">
                <div className="flex size-5 items-center justify-center rounded bg-emerald-500 text-white">
                  <WorkspaceLogo className="size-3" weight="bold" />
                </div>
                <span>{activeWorkspace.name}</span>
                <CaretDownIcon className="size-3 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent className="w-56 rounded-lg" align="start" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Workspaces</DropdownMenuLabel>
              {F.pipe(
                workspaces,
                A.map((workspace, index) => {
                  const Logo = workspace.logo;
                  return (
                    <DropdownMenuItem
                      key={workspace.id}
                      onClick={() => setActiveWorkspace(workspace)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Logo className="size-3.5 shrink-0" weight="bold" />
                      </div>
                      {workspace.name}
                      {workspace.id === activeWorkspace.id && <CheckIcon className="ml-auto size-4" />}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add workspace</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 text-muted-foreground">/</span>

        {/* App Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-sm font-medium">
                <div className="flex size-5 items-center justify-center rounded bg-emerald-500 text-white">
                  <AppIcon className="size-3" weight="bold" />
                </div>
                <span>{activeApp.name}</span>
                <CaretDownIcon className="size-3 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent className="w-56 rounded-lg" align="start" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Apps</DropdownMenuLabel>
              {F.pipe(
                apps,
                A.map((app) => {
                  const Icon = app.icon;
                  return (
                    <DropdownMenuItem key={app.id} onClick={() => setActiveApp(app)} className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <Icon className="size-3.5 shrink-0" weight="bold" />
                      </div>
                      {app.name}
                      {app.id === activeApp.id && <CheckIcon className="ml-auto size-4" />}
                    </DropdownMenuItem>
                  );
                })
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Create app</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="mx-1 text-muted-foreground">/</span>
      </div>

      {/* Right side - Search, Notifications, User */}
      <div className="flex items-center gap-2">
        <CommandSearch />
        <NotificationDropdown />
        <NavbarUserDropdown user={user} />
      </div>
    </header>
  );
}
