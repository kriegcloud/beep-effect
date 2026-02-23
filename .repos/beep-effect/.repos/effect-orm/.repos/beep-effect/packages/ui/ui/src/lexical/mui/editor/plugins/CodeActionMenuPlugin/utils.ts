import { debounce } from "@beep/utils";
import { useMemo, useRef } from "react";

export function useDebounce<T extends (...args: never[]) => void>(fn: T, ms: number, maxWait?: undefined | number) {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () =>
      debounce(
        (...args: Parameters<T>) => {
          if (funcRef.current) {
            funcRef.current(...args);
          }
        },
        ms,
        { maxWait }
      ),
    [ms, maxWait]
  );
}
