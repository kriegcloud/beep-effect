import { type DependencyList, useEffect, useLayoutEffect, useRef } from "react";

const makeUseEffectAfterFirst =
  (useEffectHook: typeof useEffect | typeof useLayoutEffect) =>
  (callback: () => void, dependencies: DependencyList = [], shouldExecute = true) => {
    const isFirst = useRef(true);

    useEffectHook(() => {
      if (shouldExecute) {
        if (isFirst.current) {
          isFirst.current = false;
        } else {
          return callback();
        }
      }
    }, dependencies);
  };

export const useEffectAfterFirst = makeUseEffectAfterFirst(useEffect);

export const useLayoutEffectAfterFirst = makeUseEffectAfterFirst(useLayoutEffect);
