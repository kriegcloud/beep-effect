import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { debounce } from "@beep/utils/timing/debounce";
import { throttle } from "@beep/utils/timing/throttle";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

const waitFor = (ms: number) =>
  // @ts-expect-error
  Effect.async<void>((resume) => {
    const timer = setTimeout(() => resume(Effect.void), ms);
    return () => {
      clearTimeout(timer);
    };
  });

effect(
  "debounce supports leading/trailing execution, flush, and cancel",
  Effect.fn(function* () {
    let count = 0;
    const fn = debounce(
      () => {
        count += 1;
        return count;
      },
      Duration.millis(20),
      { leading: true, trailing: true }
    );

    fn();
    fn();
    expect(fn.pending()).toBe(true);

    yield* waitFor(30);
    expect(count).toBe(2);

    fn();
    const flushed = fn.flush();
    expect(flushed).toBe(3);
    expect(fn.pending()).toBe(false);

    fn();
    fn.cancel();
    yield* waitFor(30);
    expect(count).toBe(3);
  })
);

effect(
  "throttle limits calls within the wait window",
  Effect.fn(function* () {
    let value = 0;
    const throttled = throttle(() => {
      value += 1;
      return value;
    }, Duration.millis(25));

    throttled();
    throttled();
    throttled();

    expect(throttled.pending()).toBe(true);
    yield* waitFor(30);
    expect(value).toBe(2);

    yield* waitFor(30);
    throttled();
    yield* waitFor(30);
    expect(value).toBe(3);

    throttled.cancel();
    expect(throttled.pending()).toBe(false);
  })
);
