import { type DependencyList, useState } from "react";

/**
 * Returns the memoized value of a function, updating it only when its
 * dependencies change.
 */
export const useSafeMemo = <T>(fn: () => T, deps: DependencyList): T => {
  const [[currValue, currDeps], set] = useState<[T, DependencyList]>(() => [fn(), deps]);
  let value = currValue;
  const changed = deps.length !== currDeps.length || deps.some((dep, i) => dep !== currDeps[i]);

  if (changed) {
    value = fn();
    set([value, deps]);
  }

  return value;
};
