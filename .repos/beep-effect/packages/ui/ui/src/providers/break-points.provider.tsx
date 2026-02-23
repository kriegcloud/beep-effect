"use client";
import { createCtx } from "@beep/ui-core/utils";
import type { Breakpoint, Theme } from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";
import type React from "react";
import { useCallback, useMemo } from "react";

interface BreakpointsContext {
  readonly currentBreakpoint: Breakpoint;
  readonly up: (key: Breakpoint | number) => boolean;
  readonly down: (key: Breakpoint | number) => boolean;
  readonly only: (key: Breakpoint) => boolean;
  readonly between: (start: Breakpoint | number, end: Breakpoint | number) => boolean;
}

const [useBreakpoints, Provider] = createCtx<BreakpointsContext>("BreakPointsContext");

/**
 * Breakpoint values in pixels, matching MUI defaults
 */
const BREAKPOINT_VALUES: Record<Breakpoint, number> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

type Props = {
  children: React.ReactNode;
};

/**
 * BreakpointsProvider - Provides responsive breakpoint utilities via context.
 *
 * Performance optimization: Uses a single useMediaQuery hook to detect the
 * largest matching breakpoint, avoiding multiple synchronous media query
 * evaluations that cause forced reflow.
 *
 * The helper functions (up, down, only, between) are pure functions that
 * compare against the detected breakpoint - they do NOT call hooks.
 */
export const BreakpointsProvider: React.FC<Props> = ({ children }) => {
  const theme = useTheme();

  // Use a single media query to detect the largest matching breakpoint
  // This avoids 5+ useMediaQuery calls that cause forced reflow
  const isXl = useMediaQuery<Theme>((t) => t.breakpoints.up("xl"), { noSsr: true });
  const isLg = useMediaQuery<Theme>((t) => t.breakpoints.up("lg"), { noSsr: true });
  const isMd = useMediaQuery<Theme>((t) => t.breakpoints.up("md"), { noSsr: true });
  const isSm = useMediaQuery<Theme>((t) => t.breakpoints.up("sm"), { noSsr: true });

  // Determine current breakpoint from largest matching
  const currentBreakpoint: Breakpoint = useMemo(() => {
    if (isXl) return "xl";
    if (isLg) return "lg";
    if (isMd) return "md";
    if (isSm) return "sm";
    return "xs";
  }, [isXl, isLg, isMd, isSm]);

  // Get numeric value for a breakpoint key
  const getBreakpointValue = useCallback(
    (key: Breakpoint | number): number => {
      if (typeof key === "number") return key;
      return theme.breakpoints.values[key] ?? BREAKPOINT_VALUES[key];
    },
    [theme.breakpoints.values]
  );

  // Get current width value
  const currentValue = getBreakpointValue(currentBreakpoint);

  // Pure functions that compare against current breakpoint (no hooks!)
  const up = useCallback(
    (key: Breakpoint | number): boolean => {
      const targetValue = getBreakpointValue(key);
      return currentValue >= targetValue;
    },
    [currentValue, getBreakpointValue]
  );

  const down = useCallback(
    (key: Breakpoint | number): boolean => {
      const targetValue = getBreakpointValue(key);
      return currentValue < targetValue;
    },
    [currentValue, getBreakpointValue]
  );

  const only = useCallback(
    (key: Breakpoint): boolean => {
      return currentBreakpoint === key;
    },
    [currentBreakpoint]
  );

  const between = useCallback(
    (start: Breakpoint | number, end: Breakpoint | number): boolean => {
      const startValue = getBreakpointValue(start);
      const endValue = getBreakpointValue(end);
      return currentValue >= startValue && currentValue < endValue;
    },
    [currentValue, getBreakpointValue]
  );

  const value = useMemo(
    () => ({
      currentBreakpoint,
      up,
      down,
      only,
      between,
    }),
    [currentBreakpoint, up, down, only, between]
  );

  return <Provider value={value}>{children}</Provider>;
};

export { useBreakpoints };
