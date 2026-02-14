"use client";

import { debounce } from "es-toolkit";
import { useMemo, useRef } from "react";

/**
 * A hook that returns a debounced version of the provided function.
 *
 * The debounced function delays invoking `fn` until after `ms` milliseconds
 * have elapsed since the last time it was invoked. The function reference
 * is stored in a ref to avoid recreating the debounced function on every render.
 *
 * @param fn - The function to debounce
 * @param ms - The number of milliseconds to delay
 * @returns A debounced version of the function
 *
 * @example
 * ```tsx
 * const debouncedSave = useDebounce((content: string) => {
 *   saveDocument(content);
 * }, 500);
 *
 * // In an effect or handler
 * debouncedSave(editorContent);
 * ```
 */
export function useDebounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        if (funcRef.current) {
          funcRef.current(...args);
        }
      }, ms),
    [ms]
  );
}

export default useDebounce;
