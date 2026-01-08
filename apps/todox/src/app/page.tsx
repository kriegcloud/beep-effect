"use client";

import { AI_CHAT_WIDTH, AIChatPanel, AIChatPanelTrigger } from "@beep/todox/components/ai-chat";
import { MiniSidebarProvider } from "@beep/todox/components/mini-sidebar";
import { TopNavbar } from "@beep/todox/components/navbar";
import { SidePanel, SidePanelProvider, useSidePanel } from "@beep/todox/components/side-panel";
import { MainContentPanelSidebar } from "@beep/todox/components/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@beep/todox/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@beep/todox/components/ui/toggle-group";
import { MailCompose } from "@beep/todox/features/mail/mail-compose";
import { MailDetails } from "@beep/todox/features/mail/mail-details";
import { MailList } from "@beep/todox/features/mail/mail-list";
import { MailProvider, useMail } from "@beep/todox/features/mail/provider";
import { cn } from "@beep/todox/lib/utils";
import Stack from "@mui/material/Stack";
import {
  BrainIcon,
  CalendarIcon,
  CheckSquareIcon,
  DeskIcon,
  EnvelopeSimpleIcon,
  FilesIcon,
  GaugeIcon,
  ListChecksIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import * as React from "react";

const user = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "/logo.avif",
};

function MailContent() {
  const {
    mails,
    mailsEmpty,
    mailsLoading,
    openMail,
    selectedLabelId,
    selectedMailId,
    mail,
    mailLoading,
    mailError,
    labels,
    openCompose,
    handleClickMail,
  } = useMail();

  return (
    <>
      {/* Sidebar + Content area */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <MainContentPanelSidebar fixed={false} />
        <SidebarInset className="bg-sidebar">
          {/* Main content - Mail List and Details */}
          <Stack
            direction="row"
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <Stack
              sx={{
                width: { xs: 1, md: 320 },
                flexShrink: 0,
                borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
              }}
            >
              <MailList
                mails={mails}
                isEmpty={mailsEmpty}
                loading={mailsLoading}
                openMail={openMail.value}
                onCloseMail={openMail.onFalse}
                onClickMail={handleClickMail}
                selectedLabelId={selectedLabelId}
                selectedMailId={selectedMailId}
              />
            </Stack>
            <Stack sx={{ flex: "1 1 auto", minWidth: 0 }}>
              <MailDetails
                mail={mail}
                error={mailError?.message}
                loading={mailsLoading || mailLoading}
                renderLabel={(id: string) => labels.find((label) => label.id === id)}
              />
            </Stack>
          </Stack>
        </SidebarInset>
      </div>

      {openCompose.value && <MailCompose onCloseCompose={openCompose.onFalse} />}
    </>
  );
}

function MainContent() {
  const { open: chatOpen } = useSidePanel();
  const [viewMode, setViewMode] = React.useState<string[]>(["email"]);

  return (
    <>
      {/* AI Chat Panel (includes Mini Sidebar) */}
      <SidePanel width={AI_CHAT_WIDTH} className="p-2">
        <AIChatPanel />
      </SidePanel>

      {/* Main Content Panel Wrapper */}
      <div className={cn("flex flex-1 min-w-0 overflow-hidden p-2", chatOpen && "pl-0")}>
        {/* Main Content Panel (floating) */}
        <div className="flex flex-1 min-w-0 flex-col overflow-hidden rounded-lg border border-sidebar-border bg-sidebar shadow-sm">
          <SidebarProvider
            style={
              {
                "--sidebar-width": "17rem",
              } as React.CSSProperties
            }
            className="min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          >
            {/* Panel Header - Full width above sidebar */}
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border px-3 min-w-0">
              <SidebarTrigger className="shrink-0" />
              <AIChatPanelTrigger />
              <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
                <ToggleGroup
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value.length > 0) setViewMode(value);
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-background w-max"
                >
                  <ToggleGroupItem value="workspace" className="gap-1.5 px-3">
                    <DeskIcon className="size-3.5" />
                    Workspace
                  </ToggleGroupItem>
                  <ToggleGroupItem value="calendar" className="gap-1.5 px-3">
                    <CalendarIcon className="size-3.5" />
                    Calendar
                  </ToggleGroupItem>
                  <ToggleGroupItem value="email" className="gap-1.5 px-3">
                    <EnvelopeSimpleIcon className="size-3.5" />
                    Email
                  </ToggleGroupItem>
                  <ToggleGroupItem value="knowledge-base" className="gap-1.5 px-3">
                    <BrainIcon className="size-3.5" />
                    Knowledge Base
                  </ToggleGroupItem>
                  <ToggleGroupItem value="todos" className="gap-1.5 px-3">
                    <CheckSquareIcon className="size-3.5" />
                    Todos
                  </ToggleGroupItem>
                  <ToggleGroupItem value="people" className="gap-1.5 px-3">
                    <UsersIcon className="size-3.5" />
                    People
                  </ToggleGroupItem>
                  <ToggleGroupItem value="tasks" className="gap-1.5 px-3">
                    <ListChecksIcon className="size-3.5" />
                    Tasks
                  </ToggleGroupItem>
                  <ToggleGroupItem value="files" className="gap-1.5 px-3">
                    <FilesIcon className="size-3.5" />
                    Files
                  </ToggleGroupItem>
                  <ToggleGroupItem value="calendar" className="gap-1.5 px-3">
                    <CalendarIcon className="size-3.5" />
                    Calendar
                  </ToggleGroupItem>
                  <ToggleGroupItem value="heat-map" className="gap-1.5 px-3">
                    <GaugeIcon className="size-3.5" />
                    Heat Map
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </header>
            {/* Wrap mail content with MailProvider */}
            <MailProvider>
              <MailContent />
            </MailProvider>
          </SidebarProvider>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <MiniSidebarProvider>
      <SidePanelProvider>
        {/* Full viewport wrapper */}
        <div className="flex h-svh w-full flex-col bg-background">
          {/* Top Navigation Bar */}
          <TopNavbar user={user} />
          {/* Main content area */}
          <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
            <MainContent />
          </div>
        </div>
      </SidePanelProvider>
    </MiniSidebarProvider>
  );
}
