"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarRail } from "@beep/todox/components/ui/sidebar";
import { MailNav } from "@beep/todox/features/mail/mail-nav";
import { useMail } from "@beep/todox/features/mail/provider";
import type * as React from "react";
import { NavUser, type User } from "./nav-user";

// Sample data - can be replaced with actual data
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/logo.avif",
  } satisfies User,
};

export function MainContentPanelSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { labels, labelsLoading, labelsEmpty, openNav, selectedLabelId, handleClickLabel, handleToggleCompose } =
    useMail();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <MailNav
          labels={labels}
          isEmpty={labelsEmpty}
          loading={labelsLoading}
          openNav={openNav.value}
          onCloseNav={openNav.onFalse}
          selectedLabelId={selectedLabelId}
          onClickLabel={handleClickLabel}
          onToggleCompose={handleToggleCompose}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
