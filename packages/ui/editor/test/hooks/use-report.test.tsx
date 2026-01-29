import { afterEach, describe, mock } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import { RegistryProvider } from "@effect-atom/atom-react";
import { act, renderHook } from "@testing-library/react";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { ReactNode } from "react";

import { useReport } from "../../src/hooks/use-report";

/**
 * Helper to create a delay Effect using Effect.sleep.
 */
const delay = (ms: number) => Effect.sleep(Duration.millis(ms));

/**
 * Wrapper component providing RegistryProvider for atoms.
 */
const wrapper = ({ children }: { children: ReactNode }) => <RegistryProvider>{children}</RegistryProvider>;

describe("useReport", () => {
  // Clean up DOM after each test
  afterEach(() => {
    const element = document.getElementById("report-container");
    if (element?.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  live(
    "should return a function",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });
      assertTrue(typeof result.current === "function");
    })
  );

  live(
    "should return a timeout ID when called",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      let timerId: ReturnType<typeof setTimeout> | undefined;
      act(() => {
        timerId = result.current("Test message");
      });

      assertTrue(timerId !== undefined);
      // Node returns Timeout object, browser returns number
      assertTrue(typeof timerId === "number" || typeof timerId === "object");
    })
  );

  live(
    "should create report element in DOM",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("Hello World");
      });

      const element = document.getElementById("report-container");
      assertTrue(element !== null);
      strictEqual(element?.innerHTML, "Hello World");
    })
  );

  live(
    "should update element content on subsequent calls",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("First message");
      });

      act(() => {
        result.current("Second message");
      });

      const element = document.getElementById("report-container");
      strictEqual(element?.innerHTML, "Second message");
    })
  );

  live(
    "should cleanup element after timeout",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("Temporary message");
      });

      assertTrue(document.getElementById("report-container") !== null);

      // Wait for cleanup timeout (1000ms + buffer)
      yield* delay(1200);

      // Element should be removed
      strictEqual(document.getElementById("report-container"), null);
    })
  );

  live(
    "should cleanup on unmount",
    Effect.fn(function* () {
      const { result, unmount } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("Message before unmount");
      });

      assertTrue(document.getElementById("report-container") !== null);

      act(() => {
        unmount();
      });

      // Allow any async cleanup to complete
      yield* delay(50);

      // Element should be removed on unmount
      strictEqual(document.getElementById("report-container"), null);
    })
  );

  live(
    "should cancel previous timer when called again",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("First");
      });

      // Call again before timeout
      yield* delay(500);

      act(() => {
        result.current("Second");
      });

      // Wait past original timeout but before second timeout completes
      yield* delay(700);

      // Element should still exist (second timer not expired yet)
      assertTrue(document.getElementById("report-container") !== null);
      strictEqual(document.getElementById("report-container")?.innerHTML, "Second");
    })
  );

  live(
    "should log content to console",
    Effect.fn(function* () {
      const consoleSpy = mock(() => {});
      const originalLog = console.log;
      console.log = consoleSpy;

      try {
        const { result } = renderHook(() => useReport(), { wrapper });

        act(() => {
          result.current("Logged message");
        });

        strictEqual(consoleSpy.mock.calls.length, 1);
        // @ts-expect-error
        strictEqual(consoleSpy.mock.calls[0]?.[0], "Logged message");
      } finally {
        console.log = originalLog;
      }
    })
  );

  live(
    "should style the report element correctly",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("Styled message");
      });

      const element = document.getElementById("report-container");
      assertTrue(element !== null);
      strictEqual(element?.style.position, "fixed");
      strictEqual(element?.style.top, "50%");
      strictEqual(element?.style.left, "50%");
      strictEqual(element?.style.fontSize, "32px");
      strictEqual(element?.style.padding, "20px");
      strictEqual(element?.style.borderRadius, "20px");
    })
  );

  live(
    "should reuse existing element on subsequent calls",
    Effect.fn(function* () {
      const { result } = renderHook(() => useReport(), { wrapper });

      act(() => {
        result.current("First");
      });

      const firstElement = document.getElementById("report-container");

      act(() => {
        result.current("Second");
      });

      const secondElement = document.getElementById("report-container");

      // Should be the same DOM element
      assertTrue(firstElement === secondElement);
    })
  );
});
