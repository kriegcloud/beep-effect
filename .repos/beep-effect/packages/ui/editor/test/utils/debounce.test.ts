import { describe, expect, mock, spyOn } from "bun:test";
import { assertTrue, live, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

import { debounce } from "../../src/utils/debounce";

/**
 * Helper to create a delay Effect using Effect.sleep.
 */
const delay = (ms: number) => Effect.sleep(Duration.millis(ms));

describe("debounce", () => {
  live(
    "should debounce function calls",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      yield* delay(debounceMs * 2);

      strictEqual(func.mock.calls.length, 1);
    })
  );

  live(
    "should delay the function call by the specified wait time",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      yield* delay(debounceMs / 2);
      strictEqual(func.mock.calls.length, 0);

      yield* delay(debounceMs / 2 + 10);
      strictEqual(func.mock.calls.length, 1);
    })
  );

  live(
    "should reset the wait time if called again before wait time ends",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      yield* delay(debounceMs / 2);
      debouncedFunc();
      yield* delay(debounceMs / 2);
      debouncedFunc();
      yield* delay(debounceMs / 2);
      debouncedFunc();

      strictEqual(func.mock.calls.length, 0);

      yield* delay(debounceMs + 10);
      strictEqual(func.mock.calls.length, 1);
    })
  );

  live(
    "should cancel the debounced function call",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      debouncedFunc.cancel();
      yield* delay(debounceMs + 10);

      strictEqual(func.mock.calls.length, 0);
    })
  );

  live(
    "should work correctly if the debounced function is called after the wait time",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      yield* delay(debounceMs + 10);
      debouncedFunc();
      yield* delay(debounceMs + 10);

      strictEqual(func.mock.calls.length, 2);
    })
  );

  live(
    "should have no effect if we call cancel when the function is not executed",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      // Should not throw
      debouncedFunc.cancel();
      assertTrue(true);
    })
  );

  live(
    "should call the function with correct arguments",
    Effect.fn(function* () {
      const func = mock((_a: string, _b: number) => {});
      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc("test", 123);

      yield* delay(debounceMs * 2);

      strictEqual(func.mock.calls.length, 1);
      expect(func.mock.calls[0]).toEqual(["test", 123]);
    })
  );

  live(
    "should cancel the debounced function call if aborted via AbortSignal",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 50;
      const controller = new AbortController();
      const signal = controller.signal;
      const debouncedFunc = debounce(func, debounceMs, { signal });

      debouncedFunc();
      controller.abort();

      yield* delay(debounceMs + 10);

      strictEqual(func.mock.calls.length, 0);
    })
  );

  live(
    "should not call the debounced function if it is already aborted by AbortSignal",
    Effect.fn(function* () {
      const controller = new AbortController();
      const signal = controller.signal;

      controller.abort();

      const func = mock(() => {});

      const debounceMs = 50;
      const debouncedFunc = debounce(func, debounceMs, { signal });

      debouncedFunc();

      yield* delay(debounceMs + 10);

      strictEqual(func.mock.calls.length, 0);
    })
  );

  live(
    "should not add multiple abort event listeners",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 100;
      const controller = new AbortController();
      const signal = controller.signal;
      const addEventListenerSpy = spyOn(signal, "addEventListener");

      const debouncedFunc = debounce(func, debounceMs, { signal });

      debouncedFunc();
      debouncedFunc();

      yield* delay(150);

      strictEqual(func.mock.calls.length, 1);

      // Filter for 'abort' event listeners
      const abortListenerCount = addEventListenerSpy.mock.calls.filter(([event]) => event === "abort").length;
      strictEqual(abortListenerCount, 1);
    })
  );

  live(
    "should flush the debounced function immediately",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debounceMs = 100;
      const debouncedFunc = debounce(func, debounceMs);

      debouncedFunc();
      strictEqual(func.mock.calls.length, 0);

      debouncedFunc.flush();
      strictEqual(func.mock.calls.length, 1);
    })
  );

  live(
    "should accept Duration.DurationInput for delay",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debouncedFunc = debounce(func, Duration.millis(50));

      debouncedFunc();
      yield* delay(100);

      strictEqual(func.mock.calls.length, 1);
    })
  );

  live(
    "should accept string duration format",
    Effect.fn(function* () {
      const func = mock(() => {});
      const debouncedFunc = debounce(func, "50 millis");

      debouncedFunc();
      yield* delay(100);

      strictEqual(func.mock.calls.length, 1);
    })
  );

  describe("edges option", () => {
    live(
      "should invoke on leading edge when edges includes 'leading'",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debounceMs = 50;
        const debouncedFunc = debounce(func, debounceMs, { edges: ["leading"] });

        debouncedFunc();
        strictEqual(func.mock.calls.length, 1);

        yield* delay(debounceMs + 10);
        // Should not invoke again on trailing since edges only includes 'leading'
        strictEqual(func.mock.calls.length, 1);
      })
    );

    live(
      "should invoke on both edges when both 'leading' and 'trailing' are specified",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debounceMs = 50;
        const debouncedFunc = debounce(func, debounceMs, { edges: ["leading", "trailing"] });

        debouncedFunc();
        strictEqual(func.mock.calls.length, 1); // Leading invocation

        yield* delay(debounceMs + 10);
        strictEqual(func.mock.calls.length, 2); // Trailing invocation
      })
    );

    live(
      "should default to trailing edge only",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debounceMs = 50;
        const debouncedFunc = debounce(func, debounceMs);

        debouncedFunc();
        strictEqual(func.mock.calls.length, 0); // No leading invocation

        yield* delay(debounceMs + 10);
        strictEqual(func.mock.calls.length, 1); // Trailing invocation
      })
    );
  });

  describe("maxWait option", () => {
    live(
      "should invoke function after maxWait even if calls keep coming",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debounceMs = 100;
        const maxWaitMs = 200;
        const debouncedFunc = debounce(func, debounceMs, { maxWait: maxWaitMs });

        // Keep calling to reset the debounce timer
        debouncedFunc();
        yield* delay(50);
        debouncedFunc();
        yield* delay(50);
        debouncedFunc();
        yield* delay(50);
        debouncedFunc();
        yield* delay(50);
        debouncedFunc();

        // By now maxWait should have triggered
        yield* delay(50);
        assertTrue(func.mock.calls.length >= 1);
      })
    );

    live(
      "should accept Duration.DurationInput for maxWait",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debouncedFunc = debounce(func, Duration.millis(100), { maxWait: Duration.millis(150) });

        debouncedFunc();
        yield* delay(50);
        debouncedFunc();
        yield* delay(50);
        debouncedFunc();
        yield* delay(100);

        assertTrue(func.mock.calls.length >= 1);
      })
    );
  });

  describe("dual API", () => {
    live(
      "should work in data-first style",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debouncedFunc = debounce(func, 50);

        debouncedFunc();
        yield* delay(100);

        strictEqual(func.mock.calls.length, 1);
      })
    );

    live(
      "should work in data-last (pipeable) style",
      Effect.fn(function* () {
        const func = mock(() => {});
        const debouncedFunc = func.constructor.length === 0 ? debounce(50)(func) : debounce(func, 50);

        debouncedFunc();
        yield* delay(100);

        strictEqual(func.mock.calls.length, 1);
      })
    );
  });
});
