/**
 * Responsive mobile-state helpers for `@beep/ui`.
 *
 * @since 0.0.0
 * @module
 */
import { useAtom } from "@effect/atom-react";
import { constFalse } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { Atom } from "effect/unstable/reactivity";
import * as React from "react";
import { TOUCH_MEDIA_QUERY } from "../themes/scales.ts";

const mobileMediaQuery = Str.replace(/^@media\s*/, "")(TOUCH_MEDIA_QUERY);

/**
 * Resolve an optional mobile flag to a concrete boolean value.
 *
 * @since 0.0.0
 * @category utilities
 */
export const resolveIsMobile = (isMobile: O.Option<boolean>): boolean => O.getOrElse(isMobile, constFalse);

/**
 * React hook that tracks whether the current viewport matches the mobile media query.
 *
 * @since 0.0.0
 * @category React
 */
export function useIsMobile() {
  const [isMobileAtom] = React.useState(() => Atom.make<O.Option<boolean>>(O.none<boolean>()));
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);

  React.useEffect(() => {
    const mql = window.matchMedia(mobileMediaQuery);
    const onChange = () => {
      setIsMobile(O.some(mql.matches));
    };

    mql.addEventListener("change", onChange);
    setIsMobile(O.some(mql.matches));

    return () => mql.removeEventListener("change", onChange);
  }, [setIsMobile]);

  return resolveIsMobile(isMobile);
}
