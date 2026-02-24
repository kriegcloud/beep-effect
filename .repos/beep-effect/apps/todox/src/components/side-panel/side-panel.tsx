"use client";

import { cn } from "@beep/todox/lib/utils";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as React from "react";

const SIDE_PANEL_WIDTH = "320px";
const SIDE_PANEL_STORAGE_KEY = "side_panel_state";

// ============================================================================
// SidePanelProvider - Controls visibility of the SidePanel
// ============================================================================

type SidePanelContextValue = {
  readonly mounted: boolean;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
  readonly togglePanel: () => void;
};

const SidePanelContext = React.createContext<SidePanelContextValue | null>(null);

function useSidePanel() {
  const context = React.useContext(SidePanelContext);
  if (!context) {
    throw new Error("useSidePanel must be used within a SidePanelProvider.");
  }
  return context;
}

interface SidePanelProviderProps {
  readonly children: React.ReactNode;
  readonly defaultOpen?: boolean;
}

function SidePanelProvider({ children, defaultOpen = true }: SidePanelProviderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [open, _setOpen] = React.useState(defaultOpen);

  // Sync from localStorage after mount to avoid hydration mismatch
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDE_PANEL_STORAGE_KEY);
      if (P.isNotNull(stored)) {
        _setOpen(stored === "true");
      }
    } catch {
      // localStorage may be unavailable
    }
    setMounted(true);
  }, A.empty());

  const setOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    _setOpen((prev) => {
      const newValue = P.isFunction(value) ? value(prev) : value;
      try {
        localStorage.setItem(SIDE_PANEL_STORAGE_KEY, String(newValue));
      } catch {
        // localStorage may be unavailable
      }
      return newValue;
    });
  }, A.empty());

  const togglePanel = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  const contextValue = React.useMemo<SidePanelContextValue>(
    () => ({
      mounted,
      open,
      setOpen,
      togglePanel,
    }),
    [mounted, open, setOpen, togglePanel]
  );

  return <SidePanelContext.Provider value={contextValue}>{children}</SidePanelContext.Provider>;
}

// ============================================================================
// SidePanel - Container component that renders when open
// ============================================================================

interface SidePanelProps {
  /** Main content to render inside the panel */
  readonly children: React.ReactNode;
  /** Panel width (default: 320px) */
  readonly width?: undefined | string;
  /** Additional className for the wrapper */
  readonly className?: undefined | string;
}

/**
 * SidePanel - A container that renders its children when the panel is open.
 * Use with SidePanelProvider to control visibility.
 */
function SidePanel({ children, width = SIDE_PANEL_WIDTH, className }: SidePanelProps) {
  const { mounted, open } = useSidePanel();

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted || !open) {
    return null;
  }

  return (
    <div data-slot="side-panel" className={cn("relative shrink-0", className)} style={{ width, minWidth: width }}>
      {children}
    </div>
  );
}

export { SidePanel, SidePanelProvider, useSidePanel, type SidePanelContextValue, type SidePanelProps };
