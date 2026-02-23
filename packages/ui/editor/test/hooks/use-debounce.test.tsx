import { describe, expect, mock } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import { RegistryProvider } from "@effect-atom/atom-react";
import { act, renderHook } from "@testing-library/react";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { ReactNode } from "react";

import { useDebounce } from "../../src/hooks/use-debounce";

/**
 * Helper to create a delay Effect using Effect.sleep.
 */
const delay = (ms: number) => Effect.sleep(Duration.millis(ms));

/**
 * Wrapper component that provides the RegistryProvider for effect-atom.
 */
const wrapper = ({ children }: { children: ReactNode }) => <RegistryProvider>{children}</RegistryProvider>;

describe("useDebounce", () => {
  live(
    "should return a debounced function",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result } = renderHook(() => useDebounce(callback, Duration.millis(50)), { wrapper });

      assertTrue(typeof result.current === "function");
      assertTrue(typeof result.current.cancel === "function");
      assertTrue(typeof result.current.flush === "function");
      assertTrue(typeof result.current.schedule === "function");
    })
  );

  live(
    "should debounce function calls",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result } = renderHook(() => useDebounce(callback, Duration.millis(50)), { wrapper });

      act(() => {
        result.current();
        result.current();
        result.current();
      });

      strictEqual(callback.mock.calls.length, 0);

      yield* delay(100);

      strictEqual(callback.mock.calls.length, 1);
    })
  );

  live(
    "should call the latest function version",
    Effect.fn(function* () {
      const callback1 = mock(() => "first");
      const callback2 = mock(() => "second");

      const { result, rerender } = renderHook(({ fn }) => useDebounce(fn, Duration.millis(50)), {
        wrapper,
        initialProps: { fn: callback1 },
      });

      act(() => {
        result.current();
      });

      // Update the function before debounce fires
      rerender({ fn: callback2 });

      yield* delay(100);

      // Should have called callback2, not callback1
      strictEqual(callback1.mock.calls.length, 0);
      strictEqual(callback2.mock.calls.length, 1);
    })
  );

  live(
    "should cancel on unmount",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result, unmount } = renderHook(() => useDebounce(callback, Duration.millis(100)), { wrapper });

      act(() => {
        result.current();
      });

      // Unmount before debounce fires
      unmount();

      yield* delay(150);

      // Should not have been called due to cleanup
      strictEqual(callback.mock.calls.length, 0);
    })
  );

  live(
    "should maintain stable identity for same delay/maxWait",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result, rerender } = renderHook(({ fn }) => useDebounce(fn, Duration.millis(50)), {
        wrapper,
        initialProps: { fn: callback },
      });

      const firstDebounced = result.current;

      // Rerender with a new callback but same delay
      const newCallback = mock(() => {});
      rerender({ fn: newCallback });

      const secondDebounced = result.current;

      // The debounced function identity should remain the same
      // because delay/maxWait haven't changed
      strictEqual(firstDebounced, secondDebounced);
    })
  );

  live(
    "should pass arguments through to the callback",
    Effect.fn(function* () {
      const callback = mock((_a: string, _b: number) => {});

      const { result } = renderHook(() => useDebounce(callback, Duration.millis(50)), { wrapper });

      act(() => {
        result.current("hello", 42);
      });

      yield* delay(100);

      strictEqual(callback.mock.calls.length, 1);
      expect(callback.mock.calls[0]).toEqual(["hello", 42]);
    })
  );

  live(
    "should support flush method",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result } = renderHook(() => useDebounce(callback, Duration.millis(100)), { wrapper });

      act(() => {
        result.current();
      });

      strictEqual(callback.mock.calls.length, 0);

      act(() => {
        result.current.flush();
      });

      strictEqual(callback.mock.calls.length, 1);
    })
  );

  live(
    "should support cancel method",
    Effect.fn(function* () {
      const callback = mock(() => {});

      const { result } = renderHook(() => useDebounce(callback, Duration.millis(50)), { wrapper });

      act(() => {
        result.current();
      });

      act(() => {
        result.current.cancel();
      });

      yield* delay(100);

      strictEqual(callback.mock.calls.length, 0);
    })
  );

  describe("with maxWait option", () => {
    live(
      "should invoke callback after maxWait even with continuous calls",
      Effect.fn(function* () {
        const callback = mock(() => {});

        const { result } = renderHook(
          () => useDebounce(callback, Duration.millis(100), { maxWait: Duration.millis(150) }),
          { wrapper }
        );

        // Keep calling to reset the debounce timer
        act(() => {
          result.current();
        });
        yield* delay(50);
        act(() => {
          result.current();
        });
        yield* delay(50);
        act(() => {
          result.current();
        });
        yield* delay(100);

        // maxWait should have triggered by now
        assertTrue(callback.mock.calls.length >= 1);
      })
    );
  });

  describe("Duration.DurationInput support", () => {
    live(
      "should accept number (milliseconds)",
      Effect.fn(function* () {
        const callback = mock(() => {});

        const { result } = renderHook(() => useDebounce(callback, 50), { wrapper });

        act(() => {
          result.current();
        });

        yield* delay(100);

        strictEqual(callback.mock.calls.length, 1);
      })
    );

    live(
      "should accept Duration object",
      Effect.fn(function* () {
        const callback = mock(() => {});

        const { result } = renderHook(() => useDebounce(callback, Duration.millis(50)), { wrapper });

        act(() => {
          result.current();
        });

        yield* delay(100);

        strictEqual(callback.mock.calls.length, 1);
      })
    );

    live(
      "should accept string duration",
      Effect.fn(function* () {
        const callback = mock(() => {});

        const { result } = renderHook(() => useDebounce(callback, "50 millis"), { wrapper });

        act(() => {
          result.current();
        });

        yield* delay(100);

        strictEqual(callback.mock.calls.length, 1);
      })
    );
  });
});
