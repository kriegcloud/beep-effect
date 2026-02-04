"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@beep/ui/components/sidebar";
import type { Icon } from "@phosphor-icons/react";
import { DotsThreeIcon, FolderIcon, ShareIcon, TrashIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";

export interface Project {
  readonly name: string;
  readonly url: string;
  readonly icon: Icon;
}

interface NavProjectsProps {
  readonly projects: Project[];
}

export function NavProjects({ projects }: NavProjectsProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {F.pipe(
          projects,
          A.map((item) => {
            const ItemIcon = item.icon;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton>
                  <a href={item.url} className="flex items-center gap-2">
                    <ItemIcon weight="bold" />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuAction showOnHover>
                        <DotsThreeIcon weight="bold" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    }
                  />
                  <DropdownMenuContent
                    className="w-48 rounded-lg"
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                  >
                    <DropdownMenuItem>
                      <FolderIcon className="text-muted-foreground" />
                      <span>View Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShareIcon className="text-muted-foreground" />
                      <span>Share Project</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <TrashIcon className="text-muted-foreground" />
                      <span>Delete Project</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          })
        )}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <DotsThreeIcon className="text-sidebar-foreground/70" weight="bold" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
