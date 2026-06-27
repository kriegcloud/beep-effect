---
name: effect-testing-v4
description: "General Effect v4 testing patterns with @effect/vitest, it.effect, it.layer, Layer.mock, service mocking, error testing, concurrency testing, and resource management. Use when writing tests for Effect v4 code. Triggers on @effect/vitest, it.effect, it.layer, Layer.mock, Effect.flip, Effect.exit, fiber test, Deferred test, Latch test, Ref test."
---

# Effect Testing (v4)

General testing patterns for Effect v4 code using `@effect/vitest`.

> **Companion skills (MUST READ when applicable):**
>
> - **effect-test-clock-v4**: TestClock patterns for time-dependent code
>   (Effect.sleep, Schedule, Stream debounce/throttle, Cache TTL).
>   Load whenever your test needs `TestClock.adjust` or `TestClock.setTime`
> - **effect-fast-check-v4**: Property-based testing with `it.prop`,
>   `it.effect.prop`, schema-derived arbitraries. Load whenever your
>   test uses `FastCheck`, `Arbitrary`, or `it.prop`

## Setup

```ts
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect, Exit, Layer, Option } from "effect";
```

`@effect/vitest` re-exports everything from `vitest` and adds
Effect-specific test methods.

## Test Methods

### `it.effect`

Effectful test with automatic Scope, TestClock (at epoch 0), and
TestConsole:

```ts
it.effect("does something", () =>
  Effect.gen(function*() {
    const result = yield* myEffect;
    expect(result).toBe(42);
  }));
```

Supported modifiers are `it.effect.skip`, `it.effect.only`,
`it.effect.each`, `it.effect.fails`, `it.effect.skipIf`,
`it.effect.runIf`, and `it.effect.prop`.

### `it.live`

Effectful test with real Clock (no TestClock) and Scope. Use for
integration tests that need real time:

```ts
it.live("connects to real service", () =>
  Effect.gen(function*() {
    const conn = yield* connectToDatabase;
    expect(conn.isConnected).toBe(true);
  }));
```

### `it.layer`

Share a Layer across multiple tests. The layer is built once
(`beforeAll`) and torn down after all tests (`afterAll`):

```ts
const TestLayer = Layer.mergeAll(
  Layer.succeed(Database, mockDb),
  Layer.succeed(Cache, mockCache),
);

it.layer(TestLayer)("feature tests", (it) => {
  it.effect("reads from database", () =>
    Effect.gen(function*() {
      const db = yield* Database;
      const result = yield* db.query("SELECT 1");
      expect(result).toBe("1");
    }));

  it.effect("reads from cache", () =>
    Effect.gen(function*() {
      const cache = yield* Cache;
      const value = yield* cache.get("key");
      expect(value).toBe("cached");
    }));
});
```

Without a name string:

```ts
it.layer(TestLayer)((it) => {
  it.effect("test", () => ...)
})
```

**Nested layers** share the parent's MemoMap and compose via
`Layer.provideMerge`:

```ts
it.layer(BaseLayer)("base", (it) => {
  it.layer(ExtensionLayer)("extended", (it) => {
    it.effect("has both", () => ...)
  })
})
```

`it.live` is NOT available inside `it.layer` blocks. By default,
`it.layer` adds `TestClock` and `TestConsole`. Pass
`{ excludeTestServices: true }` on the top level `it.layer(...)` call to
opt out.

### `it.flakyTest`

Retry an effect up to 10 times within a timeout:

```ts
it.effect("eventually succeeds", () =>
  it.flakyTest(
    Effect.gen(function*() {
      const result = yield* flakyOperation;
      expect(result).toBe("ok");
    }),
  ));
```

### `it.prop` / `it.effect.prop`

Property-based testing. See the **effect-fast-check-v4** skill for full
patterns:

```ts
it.prop(
  "commutative",
  [FastCheck.integer(), FastCheck.integer()],
  ([a, b]) => expect(a + b).toBe(b + a),
);

it.effect.prop("effectful prop", [FastCheck.string()], ([s]) =>
  Effect.gen(function*() {
    const result = yield* processString(s);
    expect(result.length).toBeGreaterThanOrEqual(0);
  }));
```

## Service Mocking

### `Layer.mock`

Partial mock with Proxy. Only the methods you provide are implemented.
Unimplemented methods throw `UnimplementedError` at runtime:

```ts
const MockDatabase = Layer.mock(Database)({
  query: (sql) => Effect.succeed("mocked result"),
});
```

`PartialEffectful<S>` makes all Effect-valued properties optional while
keeping non-Effect properties required.

### `Layer.succeed`

Provide a complete implementation:

```ts
const TestConfig = Layer.succeed(Config, {
  port: 3000,
  host: "localhost",
});
```

### `Layer.effect`

Effectful construction for test services:

```ts
const TestDatabase = Layer.effect(
  Database,
  Effect.gen(function*() {
    const ref = yield* Ref.make(new Map<string, string>());
    return {
      query: (sql) => Ref.get(ref).pipe(Effect.map((m) => m.get(sql) ?? "")),
    };
  }),
);
```

### Reusing Existing Constructors and Layers

If a service module already exposes a reusable constructor effect or
layer, reuse it in tests and provide test dependencies around it:

```ts
const TestUserRepo = Layer.effect(UserRepo, UserRepo.make).pipe(
  Layer.provide(TestDatabase),
);
```

### Call Tracking (Spy Pattern)

Use a mutable array to record calls:

```ts
const makeApiMock = (options?: { shouldFail?: boolean; }) => {
  const calls: Array<{ method: string; args: unknown; }> = [];

  const layer = Layer.mock(Api)({
    getData: (id) => {
      calls.push({ method: "getData", args: id });
      if (options?.shouldFail) return Effect.fail(new NotFoundError());
      return Effect.succeed({ id, name: "test" });
    },
  });

  return { layer, calls };
};

it.effect("calls API with correct args", () =>
  Effect.gen(function*() {
    const { layer, calls } = makeApiMock();
    const result = yield* myEffect.pipe(Effect.provide(layer));
    expect(calls).toEqual([{ method: "getData", args: "123" }]);
  }));
```

### Mutable Refs for Changing Behavior Mid-Test

```ts
const makeApiMock = (failRef: { current: boolean; }) => {
  const layer = Layer.mock(Api)({
    getData: () =>
      failRef.current
        ? Effect.fail(new ApiError())
        : Effect.succeed("ok"),
  });
  return layer;
};

it.effect("handles failure after success", () =>
  Effect.gen(function*() {
    const failRef = { current: false };
    const layer = makeApiMock(failRef);

    const first = yield* getData.pipe(Effect.provide(layer));
    expect(first).toBe("ok");

    failRef.current = true;

    const error = yield* getData.pipe(Effect.provide(layer), Effect.flip);
    expect(error._tag).toBe("ApiError");
  }));
```

## Error Testing

### `Effect.flip`

Swap success and error channels. Use to assert on expected errors:

```ts
it.effect("fails with NotFound", () =>
  Effect.gen(function*() {
    const error = yield* findUser("nonexistent").pipe(Effect.flip);
    expect(error._tag).toBe("NotFound");
  }));
```

### `Effect.exit`

Capture the full Exit without throwing:

```ts
it.effect("returns failure exit", () =>
  Effect.gen(function*() {
    const exit = yield* Effect.exit(riskyOperation);
    expect(exit).toEqual(Exit.fail("boom"));
  }));
```

### `Effect.sandbox` + `Effect.flip`

Inspect the full Cause (including defects, interruptions):

```ts
it.effect("produces expected cause", () =>
  Effect.gen(function*() {
    const cause = yield* riskyOperation.pipe(
      Effect.sandbox,
      Effect.flip,
    );
    expect(Cause.isInterrupted(cause)).toBe(true);
  }));
```

### `Effect.catchDefect`

Catch defects thrown by mocked services:

```ts
it.effect("handles unimplemented method", () =>
  Effect.gen(function*() {
    const error = yield* service.unimplemented().pipe(
      Effect.catchDefect(Effect.fail),
      Effect.flip,
    );
    expect(error.name).toBe("UnimplementedError");
  }));
```

## Concurrency Testing

### Fiber Polling

Use `fiber.pollUnsafe()` to synchronously inspect fiber state:

```ts
it.effect("runs concurrently", () =>
  Effect.gen(function*() {
    const fiber = yield* longRunning.pipe(Effect.forkChild);

    expect(fiber.pollUnsafe()).toBeUndefined(); // still running

    yield* TestClock.adjust("10 seconds");

    expect(fiber.pollUnsafe()).toEqual(Exit.succeed("done"));
  }));
```

### `Effect.yieldNow`

Yield to other fibers. Use after forking to let fibers start:

```ts
it.effect("processes in background", () =>
  Effect.gen(function*() {
    const ref = yield* Ref.make(0);
    yield* Ref.update(ref, (n) => n + 1).pipe(Effect.forkChild);
    yield* Effect.yieldNow;
    expect(yield* Ref.get(ref)).toBe(1);
  }));
```

### Deferred for Coordination

```ts
it.effect("waits for signal", () =>
  Effect.gen(function*() {
    const deferred = yield* Deferred.make<string>();

    const fiber = yield* Deferred.await(deferred).pipe(Effect.forkChild);
    expect(fiber.pollUnsafe()).toBeUndefined();

    yield* Deferred.succeed(deferred, "done");
    yield* Effect.yieldNow;

    expect(fiber.pollUnsafe()).toEqual(Exit.succeed("done"));
  }));
```

### Latch for Synchronization

```ts
it.effect("synchronizes with latch", () =>
  Effect.gen(function*() {
    const latch = yield* Latch.make();

    const fiber = yield* latch.await.pipe(
      Effect.andThen(Effect.succeed("released")),
      Effect.forkChild,
    );

    expect(fiber.pollUnsafe()).toBeUndefined();

    yield* latch.open;
    yield* Effect.yieldNow;

    expect(fiber.pollUnsafe()).toEqual(Exit.succeed("released"));
  }));
```

For non-effectful contexts (e.g., inside Layer construction), use
`Latch.makeUnsafe()`.

### Ref for Shared State Assertions

```ts
it.effect("tracks mutations", () =>
  Effect.gen(function*() {
    const ref = yield* Ref.make<Array<string>>([]);

    yield* Effect.forEach(["a", "b", "c"], (item) => Ref.update(ref, (arr) => [...arr, item]), {
      concurrency: "unbounded",
    });

    const result = yield* Ref.get(ref);
    expect(result).toHaveLength(3);
    expect(result).toContain("a");
  }));
```

## Resource Lifecycle Testing

### Verifying Acquisition and Release

```ts
it.effect("releases on success", () =>
  Effect.gen(function*() {
    let released = false;

    yield* Effect.acquireRelease(
      Effect.succeed("resource"),
      () =>
        Effect.sync(() => {
          released = true;
        }),
    );

    expect(released).toBe(false); // not yet, scope still open
  }));
// After test: scope closes, released = true
```

### Verifying Finalizers Run Between Retries

```ts
it.effect("cleans up on retry", () =>
  Effect.gen(function*() {
    let finalizeCount = 0;
    const ref = yield* Ref.make(0);

    const stream = Stream.unwrap(
      Effect.gen(function*() {
        yield* Effect.addFinalizer(() =>
          Effect.sync(() => {
            finalizeCount++;
          })
        );
        const n = yield* Ref.getAndUpdate(ref, (n) => n + 1);
        if (n === 0) return Stream.fail("retry me");
        return Stream.make(1, 2, 3);
      }),
    ).pipe(Stream.retry(Schedule.forever));

    const result = yield* Stream.runCollect(stream);
    expect(result).toEqual([1, 2, 3]);
    expect(finalizeCount).toBe(1); // first attempt finalized
  }));
```

## Assertion Utilities

`@effect/vitest/utils` provides assertion helpers:

```ts
import {
  assertEquals,
  assertExitFailure,
  assertExitSuccess,
  assertNone,
  assertSome,
} from "@effect/vitest/utils";

assertExitSuccess(exit, expectedValue);
assertExitFailure(exit, expectedCause);
assertSome(option, expectedValue);
assertNone(option);
assertEquals(a, b); // uses Equal.equals
```

### `addEqualityTesters`

Treat `addEqualityTesters()` as optional glue for Vitest expectations, not
as the primary equality mechanism:

```ts
import { addEqualityTesters } from "@effect/vitest";
addEqualityTesters();
```

Prefer `assertEquals(a, b)` from `@effect/vitest/utils` or explicit
`Equal.equals(a, b)` when you need guaranteed Effect equality semantics.

## Layer Lifecycle in Tests

### Fresh Layers Per Test

Each `Effect.provide(layer)` in an `it.effect` test normally builds with a
fresh memo context unless you explicitly reuse or provide an ambient
`MemoMap`:

```ts
it.effect("test 1", () => myEffect.pipe(Effect.provide(TestLayer)) // new build
);
it.effect("test 2", () => myEffect.pipe(Effect.provide(TestLayer)) // new build
);
```

### Shared Layers via `it.layer`

Top level `it.layer` creates one `MemoMap` for the block and shares the
layer build through that memo map. Nested `it.layer` blocks reuse the
parent memo map:

```ts
it.layer(ExpensiveLayer)("suite", (it) => {
  it.effect("test 1", () => ...) // same layer instance
  it.effect("test 2", () => ...) // same layer instance
})
```

### Factory Functions Don't Need `Layer.fresh`

A factory that returns a new layer object on each call already produces
different references. `Layer.fresh` is only needed when the same layer
reference appears multiple times in a single composition and you want
separate instances.

## Quick Reference

| Task                 | Pattern                                                      |
| -------------------- | ------------------------------------------------------------ |
| Basic effect test    | `it.effect("name", () => Effect.gen(...))`                   |
| Real clock test      | `it.live("name", () => Effect.gen(...))`                     |
| Scoped resource test | `it.effect("name", () => Effect.gen(...))`                   |
| Shared layer         | `it.layer(layer)("name", (it) => { ... })`                   |
| Partial mock         | `Layer.mock(Service)({ method: () => Effect.succeed(...) })` |
| Full mock            | `Layer.succeed(Service, impl)`                               |
| Assert error         | `yield* myEffect.pipe(Effect.flip)`                          |
| Assert exit          | `yield* Effect.exit(myEffect)`                               |
| Assert cause         | `yield* myEffect.pipe(Effect.sandbox, Effect.flip)`          |
| Fork + poll          | `fiber.pollUnsafe()`                                         |
| Yield to fibers      | `yield* Effect.yieldNow`                                     |
| Coordinate fibers    | `Deferred.make()` / `Latch.make()`                           |
| Track calls          | `const calls: Array<...> = []` in mock                       |
| Equality testers     | `addEqualityTesters()` at module level                       |
| Property test        | `it.prop("name", arbs, fn)`                                  |
| Time-dependent       | See **effect-test-clock-v4** skill                           |
| Property-based       | See **effect-fast-check-v4** skill                           |
