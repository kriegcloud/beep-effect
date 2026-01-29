/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Modified to use Effect utilities and @effect-atom/atom-react.
 */

import { noOp } from "@beep/utils";
import { Atom, useAtomValue } from "@effect-atom/atom-react";
import * as F from "effect/Function";
import * as MutableRef from "effect/MutableRef";
import * as O from "effect/Option";

/**
 * Gets or creates the report container DOM element.
 * This is pure DOM manipulation and doesn't involve React state.
 */
const getElement = (): HTMLElement => {
  let element = document.getElementById("report-container");

  if (element === null) {
    element = document.createElement("div");
    element.id = "report-container";
    element.style.position = "fixed";
    element.style.top = "50%";
    element.style.left = "50%";
    element.style.fontSize = "32px";
    element.style.transform = "translate(-50%, -50px)";
    element.style.padding = "20px";
    element.style.background = "rgba(240, 240, 240, 0.4)";
    element.style.borderRadius = "20px";

    if (document.body) {
      document.body.appendChild(element);
    }
  }

  return element;
};

/**
 * Removes the report container element from the DOM if it exists.
 */
const removeElement = (): void => {
  const element = document.getElementById("report-container");
  if (element !== null && document.body) {
    document.body.removeChild(element);
  }
};

/**
 * Type for the report function returned by the hook.
 */
type ReportFunction = (content: string) => ReturnType<typeof setTimeout>;

/**
 * Atom that provides the report functionality.
 * Uses MutableRef for timer state management and get.addFinalizer for cleanup.
 */
const reportAtom = Atom.make<ReportFunction>((get) => {
  // Create a MutableRef to hold the current timer ID
  const timerRef = MutableRef.make(O.none<ReturnType<typeof setTimeout>>());

  /**
   * Cleanup function that clears the timer and removes the DOM element.
   */
  const cleanup = (): void => {
    // Clear any pending timer
    F.pipe(
      MutableRef.get(timerRef),
      O.match({
        onNone: noOp,
        onSome: (timerId) => clearTimeout(timerId),
      })
    );
    MutableRef.set(timerRef, O.none());

    // Remove the element from DOM
    removeElement();
  };

  // Register cleanup on atom disposal (replaces useEffect cleanup)
  get.addFinalizer(() => {
    cleanup();
  });

  /**
   * Report function that displays content and schedules cleanup.
   */
  const report: ReportFunction = (content: string) => {
    // Log the content
    console.log(content);

    // Get or create the element
    const element = getElement();

    // Clear any existing timer
    F.pipe(
      MutableRef.get(timerRef),
      O.match({
        onNone: noOp,
        onSome: (timerId) => clearTimeout(timerId),
      })
    );

    // Set the content
    element.innerHTML = content;

    // Schedule cleanup after 1 second
    const newTimerId = setTimeout(cleanup, 1000);
    MutableRef.set(timerRef, O.some(newTimerId));

    return newTimerId;
  };

  return report;
});

/**
 * Hook that provides a function to display temporary report messages.
 *
 * This hook creates a fixed-position overlay element that displays a message
 * for 1 second before automatically removing itself. If called again before
 * the timeout, the previous timer is cancelled and a new one is started.
 *
 * Uses Effect utilities and @effect-atom/atom-react instead of React hooks:
 * - MutableRef for timer state management (replaces useRef)
 * - get.addFinalizer for cleanup on unmount (replaces useEffect cleanup)
 * - Atom.make for memoized state (replaces useCallback)
 *
 * @example
 * ```tsx
 * import { useReport } from "./use-report";
 *
 * function MyComponent() {
 *   const report = useReport();
 *
 *   const handleAction = () => {
 *     report("Action completed!");
 *   };
 *
 *   return <button onClick={handleAction}>Do Action</button>;
 * }
 * ```
 *
 * @returns A function that displays a message and returns a timeout ID
 *
 * @since 1.0.0
 */
export function useReport(): ReportFunction {
  return useAtomValue(reportAtom);
}
