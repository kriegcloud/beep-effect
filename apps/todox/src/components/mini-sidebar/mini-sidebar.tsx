"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { cn } from "@beep/todox/lib/utils";
import type { Icon } from "@phosphor-icons/react";
import {
  BookOpenIcon,
  CalendarIcon,
  CheckSquareIcon,
  FolderIcon,
  GearIcon,
  GridFourIcon,
  HouseIcon,
  PlusIcon,
  RobotIcon,
  StarIcon,
} from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as React from "react";

const MINI_SIDEBAR_AUTO_CLOSE_DELAY = 1500; // 1.5 seconds (faster close)
const MINI_SIDEBAR_ANIMATION_DURATION = 150; // 150ms animation

type MiniSidebarContextValue = {
  readonly open: boolean;
  readonly closing: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly openWithTimer: () => void;
  readonly closeImmediately: () => void;
  readonly keepOpen: () => void;
};

const MiniSidebarContext = React.createContext<MiniSidebarContextValue | null>(null);

function useMiniSidebar() {
  const context = React.useContext(MiniSidebarContext);
  if (!context) {
    throw new Error("useMiniSidebar must be used within a MiniSidebarProvider.");
  }
  return context;
}

interface MiniSidebarProviderProps {
  readonly children: React.ReactNode;
}

function MiniSidebarProvider({ children }: MiniSidebarProviderProps) {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoCloseTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearAnimationTimer = React.useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const closeWithAnimation = React.useCallback(() => {
    clearAutoCloseTimer();
    setClosing(true);
    animationRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, MINI_SIDEBAR_ANIMATION_DURATION);
  }, [clearAutoCloseTimer]);

  const startAutoCloseTimer = React.useCallback(() => {
    clearAutoCloseTimer();
    timerRef.current = setTimeout(() => {
      closeWithAnimation();
    }, MINI_SIDEBAR_AUTO_CLOSE_DELAY);
  }, [clearAutoCloseTimer, closeWithAnimation]);

  const openWithTimer = React.useCallback(() => {
    clearAnimationTimer();
    setClosing(false);
    setOpen(true);
    startAutoCloseTimer();
  }, [startAutoCloseTimer, clearAnimationTimer]);

  const closeImmediately = React.useCallback(() => {
    clearAutoCloseTimer();
    closeWithAnimation();
  }, [clearAutoCloseTimer, closeWithAnimation]);

  const keepOpen = React.useCallback(() => {
    clearAutoCloseTimer();
    clearAnimationTimer();
    setClosing(false);
  }, [clearAutoCloseTimer, clearAnimationTimer]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const contextValue = React.useMemo<MiniSidebarContextValue>(
    () => ({
      open,
      closing,
      setOpen,
      openWithTimer,
      closeImmediately,
      keepOpen,
    }),
    [open, closing, openWithTimer, closeImmediately, keepOpen]
  );

  return (
    <MiniSidebarContext.Provider value={contextValue}>
      <TooltipProvider>{children}</TooltipProvider>
    </MiniSidebarContext.Provider>
  );
}

interface MiniSidebarTriggerProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
}

function MiniSidebarTrigger({ className, children }: MiniSidebarTriggerProps) {
  const { open, openWithTimer, closeImmediately } = useMiniSidebar();

  return (
    <button
      type="button"
      className={cn("cursor-pointer", className)}
      onClick={() => {
        if (open) {
          closeImmediately();
        } else {
          openWithTimer();
        }
      }}
      onMouseEnter={() => {
        if (!open) {
          openWithTimer();
        }
      }}
    >
      {children}
    </button>
  );
}

interface NavItem {
  readonly title: string;
  readonly icon: Icon;
  readonly url: string;
  readonly isActive?: boolean;
}

const mainNavItems: NavItem[] = [
  { title: "Home", icon: HouseIcon, url: "#" },
  { title: "Projects", icon: FolderIcon, url: "#", isActive: true },
  { title: "AI Agents", icon: RobotIcon, url: "#" },
  { title: "Automations", icon: GridFourIcon, url: "#" },
  { title: "Media", icon: BookOpenIcon, url: "#" },
];

const bottomNavItems: NavItem[] = [
  { title: "Tasks", icon: CheckSquareIcon, url: "#" },
  { title: "Calendar", icon: CalendarIcon, url: "#" },
  { title: "Favorites", icon: StarIcon, url: "#" },
  { title: "Settings", icon: GearIcon, url: "#" },
];

interface MiniSidebarPanelProps {
  readonly className?: string;
  /** Position relative to the parent SidePanel: "left" or "right" */
  readonly position?: "left" | "right";
  /** Navigation items for the main section */
  readonly mainItems?: NavItem[];
  /** Navigation items for the bottom section */
  readonly bottomItems?: NavItem[];
}

/**
 * Mini sidebar panel - shows only icon button groups.
 * Position this absolutely within a SidePanel wrapper.
 *
 * When position="right": appears on right edge, slides in from right
 * When position="left": appears on left edge, slides in from left
 */
function MiniSidebarPanel({
  className,
  position = "right",
  mainItems = mainNavItems,
  bottomItems = bottomNavItems,
}: MiniSidebarPanelProps) {
  const { open, closing, keepOpen, openWithTimer } = useMiniSidebar();
  const [activeItem, setActiveItem] = React.useState<string>("Projects");

  // Don't render if not open and not in closing animation
  if (!open && !closing) {
    return null;
  }

  const isLeft = position === "left";

  return (
    <div
      data-slot="mini-sidebar-panel"
      className={cn(
        "absolute top-0 bottom-0 z-50 flex flex-col",
        "w-12 bg-sidebar shadow-lg",
        // Position on the correct edge
        isLeft ? "left-0 border-r border-sidebar-border" : "right-0 border-l border-sidebar-border",
        // Animation classes
        "transition-all duration-150 ease-out",
        // Opening animation
        !closing && (isLeft ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100"),
        // Closing animation - slide back into the panel
        closing && (isLeft ? "-translate-x-full opacity-0" : "translate-x-full opacity-0"),
        className
      )}
      onMouseEnter={keepOpen}
      onMouseLeave={() => openWithTimer()}
    >
      {/* Main nav icons */}
      <div className="flex flex-1 flex-col items-center gap-1 py-3">
        {F.pipe(
          mainItems,
          A.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeItem === item.title;
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("size-9", isActive && "bg-sidebar-accent")}
                      onClick={() => setActiveItem(item.title)}
                    >
                      <IconComponent className="size-5" weight={isActive ? "fill" : "regular"} />
                    </Button>
                  }
                />
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>

      {/* Bottom nav icons */}
      <div className="flex flex-col items-center gap-1 border-t border-sidebar-border py-3">
        {F.pipe(
          bottomItems,
          A.map((item) => {
            const IconComponent = item.icon;
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger
                  render={
                    <Button variant="ghost" size="icon" className="size-9">
                      <IconComponent className="size-5" />
                    </Button>
                  }
                />
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          })
        )}
      </div>

      {/* Add button at bottom */}
      <div className="flex flex-col items-center pb-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon" className="size-9">
                <PlusIcon className="size-5" />
              </Button>
            }
          />
          <TooltipContent side="right">Add new</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export {
  bottomNavItems,
  mainNavItems,
  MiniSidebarPanel,
  MiniSidebarProvider,
  MiniSidebarTrigger,
  type MiniSidebarPanelProps,
  type NavItem,
  useMiniSidebar,
};
