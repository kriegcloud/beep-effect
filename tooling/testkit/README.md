# @beep/testkit

Bun-first Effect testing harness providing Effect-aware test runners, Layer composition, scoped resource management, and assertion helpers for Effect data types.

## Purpose

This package wraps Bun's native test runner with Effect-first orchestration primitives that keep tests within the Effect algebra. It provides:

- **Effect test runners** that execute Effects with automatic runtime management and error formatting
- **Layer-based orchestration** for sharing memoized runtimes across test suites
- **Assertion helpers** for Effect primitives (`Option`, `Either`, `Exit`) using `Equal.equals` semantics
- **Flaky test stabilization** via `Effect.retry` with configurable schedules
- **Complete re-exports** of `bun:test` (`describe`, `it`, `expect`) for seamless interop

This package is the standard testing foundation for all `@beep/*` packages requiring Effect-aware test orchestration.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/testkit": "workspace:*"
```

## Key Exports

### Test Runners

| Export | Description |
|--------|-------------|
| `effect` | Runs Effects with `TestContext` injected (TestClock, TestRandom) |
| `scoped` | Runs scoped Effects with automatic finalizer cleanup |
| `live` | Runs Effects without test services (real Clock/Random) |
| `scopedLive` | Combines scoped management with live services |
| `layer` | Shares memoized Layer runtime across test cases |
| `flakyTest` | Retries Effects with configurable schedule for stability |
| `prop` | Property-based testing placeholder (FastCheck integration pending) |
| `describeWrapped` | Custom test harness with bundled Effect methods |
| `makeMethods` | Factory for creating Effect test method bundles |

### Assertions

| Export | Description |
|--------|-------------|
| `strictEqual` | Reference equality (`===`) |
| `deepStrictEqual` | Deep structural equality |
| `notDeepStrictEqual` | Negated deep equality |
| `assertEquals` | Equality using `Equal.equals` trait |
| `assertTrue` | Asserts value is `true` |
| `assertFalse` | Asserts value is `false` |
| `assertInstanceOf` | Type guard assertion |
| `assertInclude` | String contains substring |
| `assertMatch` | String matches regex |
| `assertNone` | Asserts `Option.None` |
| `assertSome` | Asserts `Option.Some` with value |
| `assertLeft` | Asserts `Either.Left` with error |
| `assertRight` | Asserts `Either.Right` with value |
| `assertSuccess` | Asserts `Exit.Success` with value |
| `assertFailure` | Asserts `Exit.Failure` with cause |
| `doesNotThrow` | Asserts function doesn't throw |
| `throws` | Asserts function throws |
| `throwsAsync` | Asserts async function throws |
| `fail` | Manually fail test with message |

### Re-exports from bun:test

All exports from `bun:test` are re-exported for convenience: `describe`, `it`, `expect`, `test`, `beforeAll`, `beforeEach`, `afterAll`, `afterEach`, and more.

## Usage

### Basic Effect Test

```typescript
import * as Effect from "effect/Effect";
import { effect, strictEqual } from "@beep/testkit";

effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed(42);
    strictEqual(result, 42);
  })
);
```

### Layer-Based Test Suite

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import { layer, assertSome } from "@beep/testkit";

// Share database pool and auth context across tests
const TestRuntime = Layer.mergeAll(MyDb.Live, Auth.Test);

layer(TestRuntime, { timeout: Duration.seconds(30) })("integration suite", (it) => {
  it.effect("fetches entity", () =>
    Effect.gen(function* () {
      const repo = yield* MyDb.repo;
      const entity = yield* repo.findById("abc-123");
      assertSome(entity, { id: "abc-123", name: "Test" });
    })
  );
});
```

## Test Runners

### `effect` — TestContext-Injected Effect Runner

Runs Effects with `TestContext` automatically provided. Use for tests that need `TestClock`, `TestRandom`, or other test services.

```typescript
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import * as TestClock from "effect/TestClock";
import { effect } from "@beep/testkit";

effect("advances test clock", () =>
  Effect.gen(function* () {
    yield* TestClock.adjust(Duration.seconds(5));
    const now = yield* Effect.clockWith((clock) => clock.currentTimeMillis);
    // Clock advanced by 5 seconds
  })
);
```

### `scoped` — Scoped Effect Runner with Finalizers

Runs scoped Effects with automatic resource cleanup. Use for tests that acquire resources via `Effect.acquireRelease`.

```typescript
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

### `live` — Effect Runner Without Test Services

Runs Effects without injecting TestContext. Use for pure logic tests or when you need real Clock/Random implementations.

```typescript
import * as Effect from "effect/Effect";
import { live, assertTrue } from "@beep/testkit";

live("generates UUID", () =>
  Effect.gen(function* () {
    const id = yield* Effect.sync(() => crypto.randomUUID());
    assertTrue(id.length === 36);
  })
);
```

### `scopedLive` — Scoped Effect Runner Without Test Services

Combines scoped resource management with live services. Use when you need finalizers but want real Clock/Random.

```typescript
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

### `layer` — Share Memoized Layer Across Tests

Constructs a runtime from a Layer and shares it across test cases. Automatically injects TestContext unless `excludeTestServices: true` is set.

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Duration from "effect/Duration";
import { layer, assertTrue } from "@beep/testkit";

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
      yield* db.runTransaction((tx) => tx.insert(/* ... */));
      // Transaction rolled back via finalizer
    })
  );
});
```

**Layer Options**:
- `timeout`: Maximum duration for test execution (default: no timeout)
- `memoMap`: Share Layer memoization across nested layers (prevents resource duplication)
- `excludeTestServices`: Set to `true` to exclude automatic `TestContext` injection (use when Layer provides its own test services or needs live platform implementations)

**Nested Layers**:

```typescript
import * as Layer from "effect/Layer";
import { layer } from "@beep/testkit";

layer(BaseServices.Live)("base suite", (it) => {
  it.layer(AuthLayer.Live)("auth suite", (it) => {
    it.effect("accesses both base and auth services", () =>
      Effect.gen(function* () {
        const base = yield* BaseServices.service;
        const auth = yield* AuthLayer.service;
        // Both services available
      })
    );
  });
});
```

**Memo Map Management**:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { layer } from "@beep/testkit";

const memoMap = Effect.runSync(Layer.makeMemoMap);

layer(DbLayer, { memoMap })("outer", (it) => {
  it.layer(CacheLayer, { memoMap })("inner", (it) => {
    // Both layers share the same memo map - no resource duplication
  });
});
```

### `flakyTest` — Retry with Schedule

Catches defects and retries Effects up to a timeout. Use sparingly; prefer fixing root causes.

```typescript
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

### `describeWrapped` — Custom Test Harness

Creates a `describe` block with bundled Effect test methods. Use when you need a custom test suite with preconfigured helpers.

```typescript
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

## Assertions

All assertions use `Equal.equals` for structural equality and delegate to Bun's `expect` for diff output.

### Primitive Assertions

```typescript
import {
  strictEqual,
  deepStrictEqual,
  notDeepStrictEqual,
  assertEquals,
  fail,
  doesNotThrow,
  throws,
  throwsAsync
} from "@beep/testkit";

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

### Type Assertions

```typescript
import {
  assertTrue,
  assertFalse,
  assertInstanceOf,
  assertInclude,
  assertMatch
} from "@beep/testkit";

assertTrue(condition, "should be true");
assertFalse(condition, "should be false");
assertInstanceOf(value, MyClass);
assertInclude(str, "substring");
assertMatch(str, /pattern/);
```

### Option Assertions

```typescript
import * as Option from "effect/Option";
import { assertNone, assertSome } from "@beep/testkit";

const none = Option.none();
assertNone(none);

const some = Option.some(42);
assertSome(some, 42);
```

### Either Assertions

```typescript
import * as Either from "effect/Either";
import { assertLeft, assertRight } from "@beep/testkit";

const left = Either.left("error");
assertLeft(left, "error");

const right = Either.right(42);
assertRight(right, 42);
```

### Exit Assertions

```typescript
import * as Exit from "effect/Exit";
import * as Cause from "effect/Cause";
import { assertFailure, assertSuccess } from "@beep/testkit";

const success = Exit.succeed(42);
assertSuccess(success, 42);

const failure = Exit.failCause(Cause.fail("error"));
assertFailure(failure, Cause.fail("error"));
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `effect` | Core Effect runtime and data types |
| `@effect/platform` | Platform abstractions (FileSystem, Path, etc.) |
| `@effect/sql` | SQL abstraction layer |
| `@effect/sql-pg` | PostgreSQL driver for Effect SQL |
| `@effect/sql-drizzle` | Drizzle ORM integration with Effect SQL |
| `@testcontainers/postgresql` | Ephemeral PostgreSQL containers for testing |
| `drizzle-orm` | Drizzle ORM for type-safe database operations |
| `postgres` | PostgreSQL client for Node.js |

## Integration

This package is designed to be used by all `@beep/*` packages that require Effect-aware testing. It integrates seamlessly with:

- **Database testing**: Use with `@beep/db-admin` for ephemeral PostgreSQL containers via Testcontainers
- **Repository testing**: Test repository implementations from `packages/*/infra` with real or mock database connections
- **Domain logic testing**: Test pure domain logic from `packages/*/domain` using `live` runner for real services or `effect` runner for controlled test environments
- **SDK testing**: Test client contracts from `packages/*/sdk` with mock service layers

## Development

```bash
# Type check
bun run --filter @beep/testkit check

# Lint
bun run --filter @beep/testkit lint

# Auto-fix lint issues
bun run --filter @beep/testkit lint:fix

# Run tests
bun run --filter @beep/testkit test

# Generate coverage report
bun run --filter @beep/testkit coverage

# Detect circular dependencies
bun run --filter @beep/testkit lint:circular
```

## Notes

### Layer TestContext Injection

`layer` defaults to merging `TestContext` into the runtime. Set `excludeTestServices: true` when:
- Your Layer already provides test services
- You need live platform implementations (FileSystem, Path)
- You're testing with real external dependencies

### Property-Based Testing

`prop` is currently a stub without FastCheck integration. Avoid relying on property-based testing until fully implemented.

### Memo Map Management

Memo maps prevent resource duplication when nesting layers. Pass the same `memoMap` to nested `layer` calls or allocate one per suite with `Layer.makeMemoMap`.

### Flaky Test Stabilization

`flakyTest` catches defects via `Effect.catchAllDefect` and retries with a schedule. Prefer fixing root causes over masking instability. Use sparingly for genuinely intermittent failures (network calls, external services).

### Scoped Resources

Always close scopes properly. Prefer `scoped` or `scopedLive` when allocating mutable resources (spies, temp files, database connections) to ensure finalizers run.

### Extending Assertions

When adding custom assertions:
- Unwrap data via Effect primitives (`Option.getOrThrow`, `Either.getOrThrow`)
- Use `Equal.equals` for structural equality
- Delegate to Bun's `expect` for diff output
- Add type assertions where applicable (`asserts value is Type`)
