# @beep/testkit — Bun-first Effect testing harness

Effect-aware testing utilities wrapping Bun's native test runner with Layer composition, scoped resources, and retry semantics. Provides assertion helpers for Effect data types and orchestration primitives that keep tests within the Effect algebra.

## What this package provides
- **Effect test runners** (`effect`, `scoped`, `live`, `scopedLive`) execute tests with automatic Effect runtime management and error formatting.
- **Layer-based orchestration** (`layer`) shares memoized runtimes across test suites while optionally injecting TestContext.
- **Assertion helpers** (`assert.ts`) for Effect primitives (`Option`, `Either`, `Exit`) using `Equal.equals` semantics and Bun's diff output.
- **Flaky test stabilization** (`flakyTest`) uses `Effect.retry` with configurable schedules to handle intermittent failures.
- **Property-based testing hook** (`prop`) provides a placeholder for future FastCheck integration.
- **Bun re-exports** (`describe`, `it`, `expect`) from `bun:test` for seamless interop with the existing Bun ecosystem.

## When to reach for it
- Writing Effect-based integration tests that need Layer composition and resource lifecycle management.
- Testing repository implementations with ephemeral database containers or service mocks.
- Asserting on Effect data types (`Option.Some`, `Either.Right`, `Exit.Success`) without hand-rolling equality checks.
- Stabilizing tests with transient external dependencies via retry schedules.
- Sharing expensive Layer construction (database pools, auth contexts) across multiple test cases.

## Quickstart
```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { effect, layer, assertSome, assertSuccess } from "@beep/testkit";

// Basic Effect test
effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed(42);
    strictEqual(result, 42);
  })
);

// Layer-based test with shared runtime
layer(MyDb.Live, { timeout: Duration.seconds(30) })("db suite", (it) => {
  it.effect("fetches entity", () =>
    Effect.gen(function* () {
      const repo = yield* MyDb.repo;
      const entity = yield* repo.findById("abc-123");
      assertSome(entity, { id: "abc-123", name: "Test" });
    })
  );
});
```

## Test orchestration helpers

### `effect` — TestContext-injected Effect runner
Runs Effects with `TestContext` automatically provided. Use for tests that need `TestClock`, `TestRandom`, or other test services.

```ts
import * as Effect from "effect/Effect";
import * as TestClock from "effect/TestClock";
import { effect } from "@beep/testkit";

effect("advances test clock", () =>
  Effect.gen(function* () {
    yield* TestClock.adjust(Duration.seconds(5));
    const now = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
    // clock advanced by 5 seconds
  })
);
```

### `scoped` — Scoped Effect runner with finalizers
Runs scoped Effects with automatic resource cleanup. Use for tests that acquire resources via `Effect.acquireRelease`.

```ts
import * as Effect from "effect/Effect";
import { scoped } from "@beep/testkit";

scoped("cleans up spy", () =>
  Effect.gen(function* () {
    const spy = createSpy();
    yield* Effect.addFinalizer(() => Effect.sync(() => spy.restore()));
    spy.track();
    yield* Effect.sync(() => spy.assertCalled());
    // spy.restore() runs after test completes
  })
);
```

### `live` — Bare Effect runner without test services
Runs Effects without injecting TestContext. Use for pure logic tests or when you need real Clock/Random implementations.

```ts
import * as Effect from "effect/Effect";
import { live } from "@beep/testkit";

live("generates UUID", () =>
  Effect.gen(function* () {
    const id = yield* Effect.sync(() => crypto.randomUUID());
    assertTrue(id.length === 36);
  })
);
```

### `scopedLive` — Scoped Effect runner without test services
Combines scoped resource management with live services. Use when you need finalizers but want real Clock/Random.

```ts
import * as Effect from "effect/Effect";
import { scopedLive } from "@beep/testkit";

scopedLive("manages temp file", () =>
  Effect.acquireUseRelease(
    Effect.sync(() => fs.openSync("/tmp/test", "w")),
    (fd) => Effect.sync(() => fs.writeSync(fd, "data")),
    (fd) => Effect.sync(() => fs.closeSync(fd))
  )
);
```

### `layer` — Share memoized Layer across tests
Constructs a runtime from a Layer and shares it across test cases. Automatically injects TestContext unless `excludeTestServices: true` is set.

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import { layer } from "@beep/testkit";

// Share database pool and auth context across tests
const TestRuntime = Layer.mergeAll(MyDb.Live, Auth.Test);

layer(TestRuntime, { timeout: Duration.seconds(60) })("integration", (it) => {
  it.effect("authenticates user", () =>
    Effect.gen(function* () {
      const auth = yield* Auth.service;
      const token = yield* auth.login({ email: "test@example.com" });
      assertTrue(token.length > 0);
    })
  );

  it.scoped("rolls back transaction", () =>
    Effect.gen(function* () {
      const db = yield* MyDb.service;
      yield* db.runTransaction((tx) => tx.insert(...));
      // transaction rolled back via finalizer
    })
  );
});
```

#### Nested layers
You can nest `layer` calls to compose runtimes:

```ts
import * as Layer from "effect/Layer";
import { layer } from "@beep/testkit";

layer(BaseServices.Live)("base suite", (it) => {
  layer(AuthLayer.Live)("auth suite", (it) => {
    it.effect("accesses both base and auth services", () =>
      Effect.gen(function* () {
        const base = yield* BaseServices.service;
        const auth = yield* AuthLayer.service;
        // both services available
      })
    );
  });
});
```

#### Memo map management
Pass `memoMap` when nesting layers to prevent resource churn:

```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { layer } from "@beep/testkit";

const memoMap = Effect.runSync(Layer.makeMemoMap);

layer(DbLayer, { memoMap })("outer", (it) => {
  layer(CacheLayer, { memoMap })("inner", (it) => {
    // both layers share the same memo map
  });
});
```

### `flakyTest` — Retry with schedule
Catches defects and retries Effects up to a timeout. Use sparingly; prefer fixing root causes.

```ts
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as Schedule from "effect/Schedule";
import * as F from "effect/Function";
import { effect, flakyTest } from "@beep/testkit";

effect("stabilizes API call", () =>
  flakyTest(
    Effect.retry(
      externalApi.fetch(),
      F.pipe(
        Schedule.recurs(5),
        Schedule.compose(Schedule.elapsed)
      )
    ),
    Duration.seconds(10)
  )
);
```

### `describeWrapped` — Custom test harness
Creates a `describe` block with bundled Effect test methods. Use when you need a custom test suite with preconfigured helpers.

```ts
import * as Effect from "effect/Effect";
import { describeWrapped } from "@beep/testkit";

describeWrapped("widget service", (it) => {
  it.effect("creates widget", () =>
    Effect.succeed({ id: "w-123", name: "Widget" })
  );

  it.scoped("deletes widget", () =>
    Effect.acquireUseRelease(
      createWidget(),
      (widget) => deleteWidget(widget.id),
      cleanupWidget
    )
  );
});
```

## Assertion helpers

All assertions use `Equal.equals` for structural equality and delegate to Bun's `expect` for diff output.

### Primitives

```ts
import { strictEqual, deepStrictEqual, notDeepStrictEqual, assertEquals, fail, doesNotThrow, throws, throwsAsync } from "@beep/testkit";

// Reference equality
strictEqual(actual, expected);

// Deep structural equality
deepStrictEqual(actual, expected);
notDeepStrictEqual(actual, expected);

// Effect Equal.equals equality
assertEquals(actual, expected);

// Error handling
doesNotThrow(() => fn());
throws(() => fn(), optionalError);
await throwsAsync(async () => fn());

// Manual failure
fail("Expected condition not met");
```

### Type assertions

```ts
import { assertTrue, assertFalse, assertInstanceOf, assertInclude, assertMatch } from "@beep/testkit";

assertTrue(condition, "should be true");
assertFalse(condition, "should be false");
assertInstanceOf(value, MyClass);
assertInclude(str, "substring");
assertMatch(str, /pattern/);
```

### Option assertions

```ts
import * as Option from "effect/Option";
import { assertNone, assertSome } from "@beep/testkit";

const none = Option.none();
assertNone(none);

const some = Option.some(42);
assertSome(some, 42);
```

### Either assertions

```ts
import * as Either from "effect/Either";
import { assertLeft, assertRight } from "@beep/testkit";

const left = Either.left("error");
assertLeft(left, "error");

const right = Either.right(42);
assertRight(right, 42);
```

### Exit assertions

```ts
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Cause from "effect/Cause";
import { assertFailure, assertSuccess } from "@beep/testkit";

const success = Exit.succeed(42);
assertSuccess(success, 42);

const failure = Exit.failCause(Cause.fail("error"));
assertFailure(failure, Cause.fail("error"));
```

## Effect pattern compliance

This package strictly follows the repository's Effect-first patterns:

### Namespace imports
```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
```

### No native array/string methods
```ts
// ❌ NEVER
items.map((item) => item.id);
str.split(",");

// ✅ ALWAYS
F.pipe(items, A.map((item) => item.id));
F.pipe(str, Str.split(","));
```

### Uppercase Schema constructors
```ts
import * as S from "effect/Schema";

// ✅ REQUIRED
S.Struct({ name: S.String, age: S.Number });
S.Array(S.String);

// ❌ FORBIDDEN
S.struct({ name: S.string, age: S.number });
```

## Verification and scripts
Run from `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit`:
- `bun run lint` — Biome format and lint checks
- `bun run lint:fix` — Auto-fix lint issues
- `bun run check` — TypeScript type checking
- `bun run test` — Run test suite
- `bun run coverage` — Generate coverage report
- `bun run lint:circular` — Detect circular dependencies

## Notes and gotchas
- `layer` defaults to merging `TestContext`; set `excludeTestServices: true` when your Layer already provides test services or needs live platform implementations (FileSystem, Path).
- `prop` is currently a stub without FastCheck integration; avoid relying on property-based testing until fully wired.
- Memo maps prevent resource duplication; pass the same `memoMap` to nested `layer` calls or allocate one per suite with `Layer.makeMemoMap`.
- `flakyTest` catches defects via `Effect.catchAllDefect`; prefer fixing root causes over masking instability.
- Always close scopes properly: prefer `scoped` when allocating mutable resources (spies, temp files, database connections).
- When extending assertions, unwrap data via Effect primitives (`Option.some`, `Either.right`) and delegate to `expect` for diff output.

## Contributor checklist
- [ ] Use namespace imports (`import * as Effect from "effect/Effect"`) in all code examples.
- [ ] Rely on Effect collection utilities (`A.map`, `Str.split`) instead of native methods.
- [ ] Document Layer memo map requirements when adding orchestration helpers.
- [ ] Update both `README.md` and `AGENTS.md` when introducing new assertion or runner patterns.
- [ ] Run `bun run lint` and `bun run check` before committing.
- [ ] Add usage snapshots to `test/` when extending the public surface.
- [ ] Cross-link from root `AGENTS.md` Package Agent Guides section.
