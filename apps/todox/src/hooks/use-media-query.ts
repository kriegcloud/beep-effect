"use client";

import * as React from "react";

export const BREAKPOINTS = { mobile: 768, tablet: 1024 } as const;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handler);
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}

export function useBreakpoint(): {
  readonly isMobile: boolean;
  readonly isTablet: boolean;
  readonly isDesktop: boolean;
} {
  const isBelowTablet = useMediaQuery(`(max-width: ${BREAKPOINTS.mobile - 1}px)`);
  const isAboveTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.tablet}px)`);

  return {
    isMobile: isBelowTablet,
    isTablet: !isBelowTablet && !isAboveTablet,
    isDesktop: isAboveTablet,
  };
}
