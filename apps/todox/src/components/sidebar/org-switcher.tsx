"use client";

import { Button } from "@beep/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@beep/ui/components/sidebar";
import type { Icon } from "@phosphor-icons/react";
import { CaretUpDownIcon, CheckIcon, PlusIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as React from "react";

export interface Org {
  readonly name: string;
  readonly logo: Icon;
  readonly plan: string;
}

interface OrgSwitcherProps {
  readonly orgs: Org[];
}

export function OrgSwitcher({ orgs }: OrgSwitcherProps) {
  const { isMobile } = useSidebar();
  const [activeOrg, setActiveOrg] = React.useState(orgs[0]);

  if (!activeOrg) {
    return null;
  }

  const ActiveLogo = activeOrg.logo;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ActiveLogo className="size-4" weight="bold" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{activeOrg.name}</span>
                  <span className="truncate text-xs">{activeOrg.plan}</span>
                </div>
                <CaretUpDownIcon className="ml-auto" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-muted-foreground text-xs">Orgs</DropdownMenuLabel>
              {F.pipe(
                orgs,
                A.map((team, index) => {
                  const OrgLogo = team.logo;
                  return (
                    <DropdownMenuItem key={team.name} onClick={() => setActiveOrg(team)} className="gap-2 p-2">
                      <div className="flex size-6 items-center justify-center rounded-md border">
                        <OrgLogo className="size-3.5 shrink-0" weight="bold" />
                      </div>
                      {team.name}
                      {team.name === activeOrg.name && <CheckIcon className="ml-auto size-4" />}
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
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/**
 * Compact version of OrgSwitcher for use in panel headers
 */
export function OrgSwitcherCompact({ orgs }: OrgSwitcherProps) {
  const [activeOrg, setActiveOrg] = React.useState(orgs[0]);

  if (!activeOrg) {
    return null;
  }

  const ActiveLogo = activeOrg.logo;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 px-2 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex size-7 items-center justify-center rounded-lg">
              <ActiveLogo className="size-4" weight="bold" />
            </div>
            <div className="grid text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeOrg.name}</span>
              <span className="truncate text-xs text-muted-foreground">{activeOrg.plan}</span>
            </div>
            <CaretUpDownIcon className="size-4 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent className="min-w-56 rounded-lg" align="start" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-muted-foreground text-xs">Orgs</DropdownMenuLabel>
          {F.pipe(
            orgs,
            A.map((team, index) => {
              const OrgLogo = team.logo;
              return (
                <DropdownMenuItem key={team.name} onClick={() => setActiveOrg(team)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <OrgLogo className="size-3.5 shrink-0" weight="bold" />
                  </div>
                  {team.name}
                  {team.name === activeOrg.name && <CheckIcon className="ml-auto size-4" />}
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
          <div className="text-muted-foreground font-medium">Add team</div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
