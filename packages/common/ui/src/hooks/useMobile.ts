import { useAtom } from "@effect/atom-react";
import { constFalse } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { Atom } from "effect/unstable/reactivity";
import * as React from "react";
import { TOUCH_MEDIA_QUERY } from "../themes/scales.ts";

const mobileMediaQuery = Str.replace(/^@media\s*/, "")(TOUCH_MEDIA_QUERY);

export const resolveIsMobile = (isMobile: O.Option<boolean>): boolean => O.getOrElse(isMobile, constFalse);

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
