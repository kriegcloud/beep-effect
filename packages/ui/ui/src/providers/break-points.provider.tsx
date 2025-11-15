"use client";
import { createCtx } from "@beep/ui-core/utils";
import type { Breakpoint, Theme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import React from "react";

interface BreakpointsContext {
  readonly currentBreakpoint: Breakpoint;
  readonly up: (key: Breakpoint | number) => boolean;
  readonly down: (key: Breakpoint | number) => boolean;
  readonly only: (key: Breakpoint | number) => boolean;
  readonly between: (start: Breakpoint | number, end: Breakpoint | number) => boolean;
}

const [useBreakpoints, Provider] = createCtx<BreakpointsContext>("BreakPointsContext");

type Props = {
  children: React.ReactNode;
};
export const BreakpointsProvider: React.FC<Props> = ({ children }) => {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<Breakpoint>("xs");

  const up = (key: Breakpoint | number) => useMediaQuery<Theme>((theme) => theme.breakpoints.up(key));

  const down = (key: Breakpoint | number) => useMediaQuery<Theme>((theme) => theme.breakpoints.down(key));

  const only = (key: Breakpoint | number) => useMediaQuery<Theme>((theme) => theme.breakpoints.only(key as Breakpoint));

  const between = (start: Breakpoint | number, end: Breakpoint | number) =>
    useMediaQuery<Theme>((theme) => theme.breakpoints.between(start, end));

  const isXs = between("xs", "sm");
  const isSm = between("sm", "md");
  const isMd = between("md", "lg");
  const isLg = between("lg", "xl");
  const isXl = up("xl");

  React.useEffect(() => {
    if (isXs) setCurrentBreakpoint("xs");
    if (isSm) setCurrentBreakpoint("sm");
    if (isMd) setCurrentBreakpoint("md");
    if (isLg) setCurrentBreakpoint("lg");
    if (isXl) setCurrentBreakpoint("xl");
  }, [isXs, isSm, isMd, isLg, isXl]);

  return (
    <Provider
      value={{
        currentBreakpoint,
        up,
        down,
        only,
        between,
      }}
    >
      {children}
    </Provider>
  );
};

export { useBreakpoints };
