"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@beep/todox/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/todox/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@beep/todox/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@beep/todox/components/ui/toggle-group";
import {
  BellIcon,
  CaretUpDownIcon,
  CreditCardIcon,
  DesktopIcon,
  MoonIcon,
  SignOutIcon,
  SparkleIcon,
  SunIcon,
  UserCircleCheckIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { useTheme } from "next-themes";

export interface User {
  readonly name: string;
  readonly email: string;
  readonly avatar: string;
}

interface NavUserProps {
  readonly user: User;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  const initials = F.pipe(
    user.name,
    Str.split(" "),
    A.map((n) => n[0] ?? ""),
    A.join(""),
    Str.toUpperCase,
    Str.slice(0, 2)
  );

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
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <CaretUpDownIcon className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <SparkleIcon weight="fill" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserCircleCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-between pointer-events-none bg-transparent hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent"
              onSelect={(e) => e.preventDefault()}
            >
              <span className="text-sm">Theme</span>
              <ToggleGroup
                className="pointer-events-auto"
                value={theme === "system" ? ["system"] : theme === "light" ? ["light"] : ["dark"]}
                onValueChange={(value) => {
                  if (value.length > 0) {
                    setTheme(value[0] as string);
                  }
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="system" aria-label="System theme">
                  <DesktopIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="light" aria-label="Light theme">
                  <SunIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark theme">
                  <MoonIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
