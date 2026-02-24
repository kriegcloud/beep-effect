/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */

import type { UnsafeTypes } from "@beep/types";
import { Atom, AtomRef, useAtomValue } from "@effect-atom/atom-react";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

import { type DebouncedFunction, type DebounceOptions, debounce } from "../utils/debounce";

/**
 * Options for the useDebounce hook.
 */
export interface UseDebounceOptions {
  /**
   * The maximum time the function can be delayed before it's invoked.
   * This ensures the function is called at least once within this time window,
   * even if the debounced function keeps being called.
   */
  readonly maxWait?: undefined | Duration.DurationInput;
}

/**
 * Internal state for the debounce atom.
 */
// Required for function parameter contravariance
interface DebounceAtomState<T extends (...args: UnsafeTypes.UnsafeAny[]) => void> {
  readonly debounced: DebouncedFunction<T>;
  readonly fnRef: AtomRef.AtomRef<O.Option<T>>;
}

/**
 * Creates a string key for Atom.family to ensure stable memoization.
 */
const makeAtomKey = (delayMs: number, maxWaitMs: number | null): string =>
  `${delayMs}-${maxWaitMs === null ? "null" : maxWaitMs}`;

/**
 * Parses the atom key back to parameters.
 */
const parseAtomKey = (key: string): { delayMs: number; maxWaitMs: number | null } => {
  const parts = Str.split("-")(key);
  const delayMs = Number(parts[0]);
  const maxWaitMs = parts[1] === "null" ? null : Number(parts[1]);
  return { delayMs, maxWaitMs };
};

/**
 * Atom family for creating debounced function atoms.
 * Each unique (delay, maxWait) combination gets its own atom instance.
 * Uses a string key for stable memoization.
 */
const debouncedAtomFamily = Atom.family((key: string) =>
  // Required for function parameter contravariance
  Atom.make<DebounceAtomState<(...args: UnsafeTypes.UnsafeAny[]) => void>>((get) => {
    const params = parseAtomKey(key);

    // Create an AtomRef to hold the current function
    // UnsafeTypes.UnsafeAny Required for function parameter contravariance
    const fnRef = AtomRef.make<O.Option<(...args: UnsafeTypes.UnsafeAny[]) => void>>(O.none());

    // Build debounce options from nullable maxWaitMs
    const maxWaitOpt = O.fromNullable(params.maxWaitMs);
    const debounceOptions: DebounceOptions = F.pipe(
      maxWaitOpt,
      O.match({
        onNone: () => ({}),
        onSome: (maxWait) => ({ maxWait }),
      })
    );

    // Create the debounced wrapper that reads from the AtomRef
    // UnsafeTypes.UnsafeAny Required for function parameter contravariance
    const wrapper = (...args: UnsafeTypes.UnsafeAny[]): void => {
      F.pipe(
        fnRef.value,
        O.map((currentFn) => currentFn(...args))
      );
    };

    const debounced = debounce(wrapper, params.delayMs, debounceOptions);

    // Register cleanup to cancel pending invocations
    get.addFinalizer(() => {
      debounced.cancel();
    });

    return { debounced, fnRef };
  })
);

/**
 * Creates a debounced version of the provided function using Effect utilities and @effect-atom/atom-react.
 *
 * The hook ensures:
 * - The debounced function always calls the latest version of `fn`
 * - Proper cleanup on unmount via `get.addFinalizer()` (cancels pending invocations)
 * - Atom-based memoization via `Atom.family` keyed by `delay` and `maxWait`
 * - Uses `AtomRef` to track the current function without triggering re-renders
 *
 * @example
 * ```tsx
 * import { useDebounce } from "./use-debounce";
 * import * as Duration from "effect/Duration";
 *
 * function SearchInput() {
 *   const [query, setQuery] = useState("");
 *
 *   const debouncedSearch = useDebounce(
 *     (searchTerm: string) => {
 *       console.log("Searching for:", searchTerm);
 *     },
 *     Duration.millis(300)
 *   );
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => {
 *         setQuery(e.target.value);
 *         debouncedSearch(e.target.value);
 *       }}
 *     />
 *   );
 * }
 *
 * // With maxWait - ensures callback fires at least once per second
 * const debouncedSave = useDebounce(
 *   saveDocument,
 *   Duration.millis(500),
 *   { maxWait: Duration.seconds(1) }
 * );
 * ```
 *
 * @param fn - The function to debounce
 * @param delay - The debounce delay as Duration.DurationInput
 * @param options - Optional configuration including maxWait
 * @returns A debounced function with cancel and flush methods
 *
 * @since 0.1.0
 */
// UnsafeTypes.UnsafeAny Required for function parameter contravariance
export function useDebounce<T extends (...args: UnsafeTypes.UnsafeAny[]) => void>(
  fn: T,
  delay: Duration.DurationInput,
  options?: undefined | UseDebounceOptions
): DebouncedFunction<T> {
  const delayMs = Duration.toMillis(delay);
  const maxWaitMs = F.pipe(O.fromNullable(options?.maxWait), O.map(Duration.toMillis), O.getOrNull);

  // Get the atom from the family using a string key for stable memoization
  const atomKey = makeAtomKey(delayMs, maxWaitMs);
  const atom = debouncedAtomFamily(atomKey);

  // Get the debounced function and fnRef from the atom
  const { debounced, fnRef } = useAtomValue(atom);

  // Update the function ref on each render to always call the latest fn
  // UnsafeTypes.UnsafeAny Required for function parameter contravariance
  fnRef.set(O.some(fn as (...args: UnsafeTypes.UnsafeAny[]) => void));

  return debounced as DebouncedFunction<T>;
}
