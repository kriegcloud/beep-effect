import { useAtom } from "@effect/atom-react";
import * as O from "effect/Option";
import { Atom } from "effect/unstable/reactivity";
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const isMobileAtom = Atom.make<O.Option<boolean>>(O.none<boolean>());

export function useIsMobile() {
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(O.some(window.innerWidth < MOBILE_BREAKPOINT));
    };
    mql.addEventListener("change", onChange);
    setIsMobile(O.some(window.innerWidth < MOBILE_BREAKPOINT));
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
