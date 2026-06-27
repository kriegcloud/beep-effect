---
name: effect-test-clock-v4
description: TestClock patterns for controlling time in Effect v4 tests. Use when testing time-dependent code, Effect.sleep, Schedule, Stream debounce/throttle, Cache TTL, or any code that depends on Clock. Triggers on TestClock, TestClock.adjust, TestClock.setTime, it.effect vs it.live, Effect.sleep test, Schedule test, time-dependent test.
---

# Effect TestClock (v4 / effect-smol)

TestClock replaces the real clock in tests, giving you precise control over time. `Effect.sleep` blocks until you explicitly advance time with `adjust` or `setTime`.

## Imports

```ts
import { assert, it } from "@effect/vitest";
import { Duration, Effect, Fiber } from "effect";
import { TestClock } from "effect/testing";
```

The `effect/testing` subpath also exports `TestConsole`, `FastCheck`, and `TestSchema`. The main `effect` barrel does NOT re-export `testing/*`.

## TestClock API

```ts
interface TestClock extends Clock.Clock {
  adjust(duration: Duration.Input): Effect.Effect<void>;
  setTime(timestamp: number): Effect.Effect<void>;
  withLive<A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>;
}
```

### `adjust(duration)`

Advances the clock by the given duration. Wakes any fibers whose `Effect.sleep` has expired. Accepts string durations: `"1 hour"`, `"500 millis"`, `"30 seconds"`.

### `setTime(timestamp)`

Sets the clock to an absolute timestamp (milliseconds since epoch). Wakes all fibers with sleep targets at or before the new time.

### `withLive(effect)`

Runs an effect using the real system clock instead of the test clock. Useful when a test needs one real delay while controlling everything else.

## Clock in v4

Clock is a `ServiceMap.Reference<Clock>` (not a `Context.Tag`). It has a default value (the real clock) and can be overridden per-fiber. TestClock replaces it in test contexts.

```ts
import { Clock } from "effect";

const Clock: ServiceMap.Reference<Clock>;
```

## `it.effect` vs `it.live`

| Variant     | Clock                              | Scope | Use When                                                  |
| ----------- | ---------------------------------- | ----- | --------------------------------------------------------- |
| `it.effect` | TestClock (time starts at epoch 0) | Yes   | Default. Testing time-dependent code with controlled time |
| `it.live`   | Real system clock                  | Yes   | Testing with real delays, wallclock-dependent code        |

```ts
it.effect("uses TestClock", () =>
  Effect.gen(function*() {
    // Effect.sleep blocks here until TestClock.adjust is called
    // Time starts at 0 (Unix epoch)
  }));

it.live("uses real clock", () =>
  Effect.gen(function*() {
    // Effect.sleep actually waits
    yield* Effect.sleep("100 millis");
  }));
```

### No `it.scoped` or `it.scopedLive` in v4

`it.effect` already provides a Scope. There is no separate scoped variant.

### `it.layer` and TestClock

`it.layer` merges TestClock into the provided layer by default:

```ts
it.layer(MyServiceLive)("tests", (it) => {
  it.effect("has TestClock", () =>
    Effect.gen(function*() {
      const service = yield* MyService;
      yield* TestClock.adjust("1 hour");
    }));
});
```

On the top level `it.layer(...)` call, pass `{ excludeTestServices: true }` to disable:

```ts
it.layer(MyServiceLive, { excludeTestServices: true })("tests", (it) => {
  // No TestClock, uses real clock
});
```

## The Fundamental Pattern: Fork + Adjust

Time-dependent effects must be **forked** before advancing time. Otherwise the sleeping effect blocks and `adjust` never runs.

```ts
it.effect("delay completes after adjust", () =>
  Effect.gen(function*() {
    let elapsed = false;
    yield* Effect.sync(() => {
      elapsed = true;
    })
      .pipe(Effect.delay("10 hours"), Effect.forkChild);

    yield* TestClock.adjust("11 hours");
    assert.isTrue(elapsed);
  }));
```

The sequence is always:

1. **Fork** the time-dependent effect (`Effect.forkChild`, `Effect.forkScoped`, or `Effect.forkDetach`)
2. **Adjust** time to trigger the sleep
3. **Assert** on the result (join the fiber or check side effects)

### With Fiber.join

```ts
it.effect("sleep then return", () =>
  Effect.gen(function*() {
    const fiber = yield* Effect.sleep("5 seconds").pipe(
      Effect.as("done"),
      Effect.forkChild,
    );

    yield* TestClock.adjust("5 seconds");
    const result = yield* Fiber.join(fiber);
    assert.strictEqual(result, "done");
  }));
```

### Multiple sleeps with incremental adjusts

```ts
it.effect("sequential sleeps", () =>
  Effect.gen(function*() {
    const events: Array<string> = [];

    yield* Effect.sleep("1 second").pipe(
      Effect.tap(() => Effect.sync(() => events.push("first"))),
      Effect.andThen(Effect.sleep("2 seconds")),
      Effect.tap(() => Effect.sync(() => events.push("second"))),
      Effect.forkChild,
    );

    yield* TestClock.adjust("1 second");
    assert.deepStrictEqual(events, ["first"]);

    yield* TestClock.adjust("2 seconds");
    assert.deepStrictEqual(events, ["first", "second"]);
  }));
```

## `setTime(Infinity)` to Run Everything

When you don't care about intermediate timing and just want all sleeps to complete:

```ts
it.effect("run all delays immediately", () =>
  Effect.gen(function*() {
    const fiber = yield* Effect.sleep("999 hours").pipe(
      Effect.as("done"),
      Effect.forkChild,
    );

    yield* TestClock.setTime(Number.POSITIVE_INFINITY);
    const result = yield* Fiber.join(fiber);
    assert.strictEqual(result, "done");
  }));
```

This is the standard pattern for Schedule testing when you only care about the output, not the timing.

## Schedule Testing

### Run a schedule to completion

```ts
const run = Effect.fnUntraced(function*<A, E, R>(effect: Effect.Effect<A, E, R>) {
  const fiber = yield* Effect.forkChild(effect);
  yield* TestClock.setTime(Number.POSITIVE_INFINITY);
  return yield* Fiber.join(fiber);
});

it.effect("retry succeeds after 3 attempts", () =>
  Effect.gen(function*() {
    let attempts = 0;
    const result = yield* run(
      Effect.gen(function*() {
        attempts++;
        if (attempts < 3) return yield* Effect.fail("not yet");
        return "success";
      }).pipe(Effect.retry(Schedule.recurs(5))),
    );

    assert.strictEqual(result, "success");
    assert.strictEqual(attempts, 3);
  }));
```

### Test with specific time points (cron, absolute)

```ts
it.effect("fires at specific time", () =>
  Effect.gen(function*() {
    yield* TestClock.setTime(new Date(2024, 0, 1, 0, 0, 0).getTime());
    // now clock is at Jan 1, 2024 midnight
    yield* TestClock.adjust("1 hour");
    // now clock is at Jan 1, 2024 1:00 AM
  }));
```

### Testing exponential backoff

```ts
it.effect("exponential backoff", () =>
  Effect.gen(function*() {
    let attempts = 0;
    const fiber = yield* Effect.gen(function*() {
      attempts++;
      return yield* Effect.fail("error");
    }).pipe(
      Effect.retry(Schedule.exponential("1 second")),
      Effect.ignore,
      Effect.forkChild,
    );

    yield* TestClock.adjust("1 second"); // first retry after 1s
    yield* TestClock.adjust("2 seconds"); // second retry after 2s
    yield* TestClock.adjust("4 seconds"); // third retry after 4s
  }));
```

## Stream + TestClock

### Debounce

```ts
it.effect("debounce emits last value", () =>
  Effect.gen(function*() {
    const fiber = yield* Stream.make(1, 2, 3).pipe(
      Stream.debounce("1 second"),
      Stream.runCollect,
      Effect.forkScoped,
    );

    yield* TestClock.adjust("1 second");
    const result = yield* Fiber.join(fiber);
    assert.deepStrictEqual(result, [3]);
  }));
```

### Throttle

```ts
it.effect("throttle limits throughput", () =>
  Effect.gen(function*() {
    const fiber = yield* Stream.make(1, 2, 3, 4, 5).pipe(
      Stream.throttle({ cost: () => 1, units: 1, duration: "1 second" }),
      Stream.runCollect,
      Effect.forkScoped,
    );

    yield* TestClock.adjust("5 seconds");
    const result = yield* Fiber.join(fiber);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5]);
  }));
```

### Stream retry with TestClock

```ts
it.effect("stream retries with backoff", () =>
  Effect.gen(function*() {
    let attempts = 0;
    const fiber = yield* Stream.fromEffect(
      Effect.gen(function*() {
        attempts++;
        if (attempts < 3) return yield* Effect.fail("retry");
        return 42;
      }),
    ).pipe(
      Stream.retry(Schedule.exponential("1 second")),
      Stream.runCollect,
      Effect.forkScoped,
    );

    yield* TestClock.adjust("1 second");
    yield* TestClock.adjust("2 seconds");
    const result = yield* Fiber.join(fiber);
    assert.deepStrictEqual(result, [42]);
  }));
```

## Cache / TTL Testing

```ts
it.effect("cache expires after TTL", () =>
  Effect.gen(function*() {
    const cache = yield* Cache.make({
      lookup: (key: string) => Effect.succeed(key.toUpperCase()),
      timeToLive: "1 hour",
      capacity: 100,
    });

    yield* Cache.get(cache, "test");
    yield* TestClock.adjust("30 minutes");
    assert.isTrue(yield* Cache.has(cache, "test"));

    yield* TestClock.adjust("31 minutes");
    assert.isFalse(yield* Cache.has(cache, "test"));
  }));
```

## `withLive` for Real Clock in a Test

When you need one real delay inside a TestClock-controlled test:

```ts
it.effect("mixed real and test time", () =>
  Effect.gen(function*() {
    yield* TestClock.withLive(Effect.sleep("10 millis"));

    const fiber = yield* Effect.sleep("1 hour").pipe(
      Effect.as("done"),
      Effect.forkChild,
    );
    yield* TestClock.adjust("1 hour");
    const result = yield* Fiber.join(fiber);
    assert.strictEqual(result, "done");
  }));
```

## Warning System

TestClock logs a warning if `Effect.sleep` is called without a subsequent `adjust` or `setTime` within 1 second of live time. This catches the common mistake of forgetting to advance the clock. The warning is emitted with `Effect.logWarning(...)` and scheduled against the live clock.

Configurable via `TestClock.layer({ warningDelay: "5 seconds" })` or disable with `warningDelay: Duration.infinity`.

## `Effect.forkChild` vs `Effect.forkScoped` vs `Effect.forkDetach`

In tests, prefer `Effect.forkChild` or `Effect.forkScoped`. Use `Effect.forkDetach` only when you intentionally want detached daemon style behavior.

```ts
yield * myEffect.pipe(Effect.forkChild); // interrupted when test ends
yield * myEffect.pipe(Effect.forkDetach); // daemon, survives test scope
yield * myEffect.pipe(Effect.forkScoped); // tied to Scope, also fine in tests
```

## Key Differences from v3

| v3                                              | v4                                                              |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `import { TestClock } from "effect"`            | `import { TestClock } from "effect/testing"`                    |
| `Clock` is `Context.Tag`                        | `Clock` is `ServiceMap.Reference`                               |
| `TestContext.TestContext` bundles test services | No public `TestContext` module                                  |
| `it.scoped` / `it.scopedLive` exist             | Only `it.effect` and `it.live` (`it.effect` already scopes)     |
| Detached daemon style fibers                    | `Effect.forkDetach`                                             |
| Internal uses `Deferred` for sleep sync         | Internal uses `Effect.Latch` for sleep sync                     |
| `adjust` accepts `Duration`                     | `adjust` accepts `DurationInput` (strings like `"1 hour"` work) |

## Quick Reference

| Pattern                                 | When                                          |
| --------------------------------------- | --------------------------------------------- |
| `Effect.forkChild` + `TestClock.adjust` | Default. Control exactly when sleeps complete |
| `TestClock.setTime(Infinity)`           | Run all pending sleeps immediately            |
| `TestClock.setTime(timestamp)`          | Set clock to absolute time (cron, dates)      |
| `TestClock.withLive(effect)`            | Run one effect with the real clock            |
| `it.effect`                             | Test with TestClock (default)                 |
| `it.live`                               | Test with real clock                          |
| Incremental `adjust` calls              | Match backoff/retry durations exactly         |
