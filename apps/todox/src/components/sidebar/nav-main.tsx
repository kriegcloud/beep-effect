"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@beep/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@beep/ui/components/sidebar";
import type { Icon } from "@phosphor-icons/react";
import { CaretRightIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";

export interface NavMainItem {
  readonly title: string;
  readonly url: string;
  readonly icon?: undefined | Icon;
  readonly isActive?: undefined | boolean;
  readonly items?:
    | undefined
    | {
        readonly title: string;
        readonly url: string;
      }[];
}

interface NavMainProps {
  readonly items: NavMainItem[];
}

export function NavMain({ items }: NavMainProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {F.pipe(
          items,
          A.map((item) => (
            <Collapsible key={item.title} defaultOpen={item.isActive} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon weight="bold" />}
                      <span>{item.title}</span>
                      <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {F.pipe(
                      item.items ?? [],
                      A.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton href={subItem.url}>
                            <span>{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
