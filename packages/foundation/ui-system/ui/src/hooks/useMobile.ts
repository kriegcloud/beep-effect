/**
 * Responsive mobile-state helpers for `@beep/ui`.
 *
 * @example
 * ```ts
 * import { resolveIsMobile } from "@beep/ui/hooks/useMobile"
 *
 * console.log(resolveIsMobile)
 * ```
 *
 * @example
 * ```ts
 * import { useIsMobile } from "@beep/ui/hooks/useMobile"
 *
 * console.log(useIsMobile)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 * @packageDocumentation
 */
import { Str } from "@beep/utils";
import { useAtom } from "@effect/atom-react";
import { constFalse } from "effect/Function";
import * as O from "effect/Option";
import { Atom } from "effect/unstable/reactivity";
import * as React from "react";
import { TOUCH_MEDIA_QUERY } from "../themes/scales.ts";

const mobileMediaQuery = Str.replace(/^@media\s*/, "")(TOUCH_MEDIA_QUERY);

/**
 * Resolve is mobile export.
 *
 * @example
 * ```ts
 * import { resolveIsMobile } from "@beep/ui/hooks/useMobile"
 *
 * console.log(resolveIsMobile)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const resolveIsMobile = (isMobile: O.Option<boolean>): boolean => O.getOrElse(isMobile, constFalse);

/**
 * Use is mobile hook.
 *
 * @example
 * ```ts
 * import { useIsMobile } from "@beep/ui/hooks/useMobile"
 *
 * console.log(useIsMobile)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function useIsMobile() {
  const [isMobileAtom] = React.useState(() => Atom.make<O.Option<boolean>>(O.none<boolean>()));
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);

  React.useEffect(() => {
    const mql = window.matchMedia(mobileMediaQuery);
    const onChange = () => setIsMobile(O.some(mql.matches));

    mql.addEventListener("change", onChange);
    setIsMobile(O.some(mql.matches));

    return () => mql.removeEventListener("change", onChange);
  }, [setIsMobile]);

  return resolveIsMobile(isMobile);
}
