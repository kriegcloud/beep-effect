"use client";

import { MiniSidebarPanel, MiniSidebarProvider } from "@beep/todox/components/mini-sidebar";
import { TopNavbar, type User } from "@beep/todox/components/navbar";
import { SidePanel, SidePanelProvider } from "@beep/todox/components/side-panel/side-panel";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@beep/todox/components/ui/resizable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@beep/todox/components/ui/sheet";
import { useBreakpoint } from "@beep/todox/hooks/use-media-query";
import { cn } from "@beep/todox/lib/utils";
import { ListIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as React from "react";
import { useDefaultLayout, usePanelRef } from "react-resizable-panels";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LAYOUT_STORAGE_ID = "app-shell-layout";

const WORKSPACE_PANEL_ID = "workspace-sidebar";
const CONTENT_PANEL_ID = "main-content";

// ---------------------------------------------------------------------------
// Mock user (temporary until auth integration)
// ---------------------------------------------------------------------------

const mockUser: User = {
  name: "Benjamin Toppold",
  email: "benjamin@beep.com",
  avatar: "/logo.avif",
};

// ---------------------------------------------------------------------------
// WorkspaceSidebar (placeholder for Phase 3)
// ---------------------------------------------------------------------------

interface WorkspaceSidebarProps {
  readonly className?: undefined | string;
}

function WorkspaceSidebar({ className }: WorkspaceSidebarProps) {
  return (
    <div
      data-slot="workspace-sidebar"
      className={cn("flex h-full flex-col border-r border-shade-gray-300 bg-sidebar/50", className)}
    >
      <div className="flex items-center gap-2 border-b border-shade-gray-300 px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Workspace</span>
      </div>
      <div className="flex flex-1 items-center justify-center p-4">
        <span className="text-xs text-muted-foreground">Navigation content (Phase 3)</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MobileSidebarSheet
// ---------------------------------------------------------------------------

interface MobileSidebarSheetProps {
  readonly open: boolean;
  readonly onOpenChange: (nextOpen: boolean) => void;
}

function MobileSidebarSheet({ open, onOpenChange }: MobileSidebarSheetProps) {
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean, _eventDetails: unknown) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <WorkspaceSidebar />
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// MobileSidebarTrigger
// ---------------------------------------------------------------------------

interface MobileSidebarTriggerProps {
  readonly onPress: () => void;
}

function MobileSidebarTrigger({ onPress }: MobileSidebarTriggerProps) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={onPress}
      aria-label="Open sidebar"
    >
      <ListIcon className="size-5" />
    </button>
  );
}

// ---------------------------------------------------------------------------
// OrbBackdrop (shared between header and content)
// ---------------------------------------------------------------------------

function OrbBackdrop() {
  return (
    <div className="header-panel-orb-backdrop">
      <div className="header-panel-orb-primary" />
      <div className="header-panel-orb-secondary" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DesktopPanelLayout
// ---------------------------------------------------------------------------

interface DesktopPanelLayoutProps {
  readonly children: React.ReactNode;
  readonly showWorkspaceSidebar: boolean;
}

function DesktopPanelLayout({ children, showWorkspaceSidebar }: DesktopPanelLayoutProps) {
  const workspacePanelRef = usePanelRef();

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: LAYOUT_STORAGE_ID,
  });

  const prevShowRef = React.useRef(showWorkspaceSidebar);
  React.useEffect(() => {
    if (prevShowRef.current !== showWorkspaceSidebar) {
      prevShowRef.current = showWorkspaceSidebar;
      const panel = workspacePanelRef.current;
      if (panel) {
        if (showWorkspaceSidebar) {
          panel.expand();
        } else {
          panel.collapse();
        }
      }
    }
  }, [showWorkspaceSidebar, workspacePanelRef]);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="flex-1"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      {/* Workspace sidebar panel */}
      <ResizablePanel
        id={WORKSPACE_PANEL_ID}
        panelRef={workspacePanelRef}
        defaultSize="220px"
        minSize="180px"
        maxSize="400px"
        collapsible
        collapsedSize="0px"
        className="hidden md:block"
      >
        <WorkspaceSidebar />
      </ResizablePanel>

      <ResizableHandle className="hidden md:flex" />

      {/* Main content panel */}
      <ResizablePanel id={CONTENT_PANEL_ID} minSize="30%">
        <div className="relative flex h-full w-full flex-1 overflow-hidden px-2 pb-2">
          <div id="secondary-panel-desktop-portal-root" className="contents" />
          <div id="app-header-portal-root" className="relative" />
          <div className="z-1 border-shade-gray-300 relative flex flex-1 flex-col overflow-clip rounded-xl border">
            <OrbBackdrop />
            <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
              <div className="overflow-hidden relative h-full" style={{ width: "auto" }}>
                <div className="relative flex h-full border-appcolor-300" style={{ opacity: 1 }}>
                  {children}
                </div>
              </div>
              <div id="secondary-panel-mobile-portal-root" className="contents" />
            </div>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

// ---------------------------------------------------------------------------
// AppShell
// ---------------------------------------------------------------------------

interface AppShellProps {
  readonly children: React.ReactNode;
  readonly user?: User;
}

export function AppShell({ children, user = mockUser }: AppShellProps) {
  const { isMobile, isDesktop } = useBreakpoint();
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

  const handleMobileTrigger = React.useCallback(() => {
    setMobileSheetOpen(true);
  }, A.empty());

  return (
    <MiniSidebarProvider>
      <SidePanelProvider>
        <div className="flex h-dvh w-dvw flex-col">
          {/* Header */}
          <div className="relative">
            <OrbBackdrop />
            <div className="flex items-center">
              {isMobile && (
                <div className="flex shrink-0 items-center pl-3">
                  <MobileSidebarTrigger onPress={handleMobileTrigger} />
                </div>
              )}
              <TopNavbar user={user} />
            </div>
          </div>

          {/* Body */}
          <div
            className={cn(
              "relative flex h-full w-full",
              "md:overflow-hidden md:max-h-none",
              "max-md:max-h-[calc(100dvh-3rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
            )}
          >
            {/* Mini sidebar (fixed width, outside resizable group) */}
            {!isMobile && (
              <SidePanel width="auto" className="z-10">
                <MiniSidebarPanel position="right" />
              </SidePanel>
            )}

            {/* Resizable panel layout */}
            <DesktopPanelLayout showWorkspaceSidebar={isDesktop}>{children}</DesktopPanelLayout>
          </div>

          {/* Mobile sidebar overlay */}
          {isMobile && <MobileSidebarSheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen} />}
        </div>
      </SidePanelProvider>
    </MiniSidebarProvider>
  );
}
