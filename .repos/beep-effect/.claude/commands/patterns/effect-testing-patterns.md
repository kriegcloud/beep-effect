# Effect Testing Patterns Reference

Comprehensive patterns for testing Effect-based code in the beep-effect monorepo using `@beep/testkit`.

---

## Test Runner Selection

| Runner | Use Case | TestServices |
|--------|----------|--------------|
| `effect()` | Standard Effect tests | Yes (TestClock, TestRandom) |
| `scoped()` | Resource management (acquireRelease) | Yes + Scope |
| `live()` | Pure logic without mocked services | No |
| `scopedLive()` | Resources with real Clock/Random | No + Scope |
| `layer()` | Shared expensive resources (DB, services) | Configurable |

### Basic Examples

```typescript
import { effect, scoped, live, layer, strictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"

// Standard test
effect("creates resource", () =>
  Effect.gen(function* () {
    const result = yield* createResource({ name: "test" })
    strictEqual(result.name, "test")
  })
)

// Resource cleanup
scoped("cleans up on completion", () =>
  Effect.gen(function* () {
    const resource = yield* acquireResource()
    yield* useResource(resource)
    // Finalizers run automatically
  })
)

// Shared layer
layer(DbLayer, { timeout: Duration.seconds(30) })(
  "database operations",
  (it) => {
    it.effect("queries data", () =>
      Effect.gen(function* () {
        const db = yield* Database
        const result = yield* db.query("SELECT 1")
        strictEqual(result.length, 1)
      })
    )
  }
)
```

---

## Assertions

| Function | Purpose | Example |
|----------|---------|---------|
| `strictEqual(a, b)` | Reference equality (toBe) | `strictEqual(result, 42)` |
| `deepStrictEqual(a, b)` | Deep structural equality | `deepStrictEqual(obj, expected)` |
| `assertTrue(val)` | Assert truthy | `assertTrue(isValid)` |
| `assertFalse(val)` | Assert falsy | `assertFalse(isEmpty)` |
| `assertNone(opt)` | Option is None | `assertNone(maybeValue)` |
| `assertSome(opt, val)` | Option is Some | `assertSome(result, expected)` |
| `assertLeft(either, val)` | Either is Left | `assertLeft(result, error)` |
| `assertRight(either, val)` | Either is Right | `assertRight(result, value)` |
| `assertSuccess(exit, val)` | Exit is Success | `assertSuccess(exit, result)` |
| `assertFailure(exit, cause)` | Exit is Failure | `assertFailure(exit, cause)` |
| `assertInclude(str, sub)` | String contains | `assertInclude(log, "message")` |
| `assertMatch(str, regex)` | String matches | `assertMatch(fmt, /pattern/)` |
| `fail(msg)` | Force failure | `fail("Should not reach here")` |

---

## TestClock Patterns

**CRITICAL**: Any code with timing MUST use TestClock to avoid flaky tests.

### When to Use TestClock

- `Effect.sleep()`, `Effect.delay()`, `Effect.timeout()`
- `Effect.schedule()`, `Effect.retry()` with schedules
- Cache TTL, rate limiting, debouncing
- Any concurrent operations with timing dependencies

### Fork → Adjust → Join Pattern

```typescript
import * as TestClock from "effect/TestClock"
import * as Duration from "effect/Duration"

effect("completes after delay", () =>
  Effect.gen(function* () {
    // 1. Fork the time-dependent operation
    const fiber = yield* Effect.fork(
      Effect.gen(function* () {
        yield* Effect.sleep(Duration.seconds(5))
        return "completed"
      })
    )

    // 2. Advance virtual time
    yield* TestClock.adjust(Duration.seconds(5))

    // 3. Join and verify
    const result = yield* Fiber.join(fiber)
    strictEqual(result, "completed")
  })
)
```

### Cache TTL Pattern

```typescript
scoped("expires cache after TTL", () =>
  Effect.gen(function* () {
    const cache = yield* ManualCache.make<string, string>({
      capacity: 100,
      timeToLive: "1 second",
    })

    yield* cache.set("key", "value")
    assertSome(yield* cache.get("key"), "value")

    yield* TestClock.adjust("2 seconds")
    assertNone(yield* cache.get("key"))
  })
)
```

### With Effect.yieldNow()

Use when scheduled effects need to run:

```typescript
yield* TestClock.adjust("31 seconds")
yield* Effect.yieldNow()  // Allow scheduled effect to run
```

---

## Error Testing

### Using Effect.exit

```typescript
effect("fails with validation error", () =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(
      validateUser({ name: "", age: -1 })
    )

    strictEqual(exit._tag, "Failure")

    if (Exit.isFailure(exit)) {
      const error = Cause.failureOption(exit.cause)
      assertTrue(error._tag === "Some")
      strictEqual(error.value._tag, "ValidationError")
    }
  })
)
```

### Using Effect.either

```typescript
effect("captures error details", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(
      fetchUser("nonexistent-id")
    )

    if (result._tag === "Left") {
      strictEqual(result.left._tag, "NotFoundError")
      assertInclude(result.left.message, "nonexistent-id")
    } else {
      fail("Expected operation to fail")
    }
  })
)
```

### Schema Validation

```typescript
effect("rejects invalid schema input", () =>
  Effect.gen(function* () {
    const UserSchema = S.Struct({
      name: S.NonEmptyString,
      age: S.Number.pipe(S.positive())
    })

    const result = yield* Effect.either(
      S.decodeUnknown(UserSchema)({ name: "", age: -5 })
    )

    strictEqual(result._tag, "Left")
  })
)
```

---

## Service Mocking

### Inline Layer

```typescript
effect("uses mock repository", () =>
  Effect.gen(function* () {
    const mockUser = { id: "1", name: "Test" }

    const result = yield* UserService.getUser("1").pipe(
      Effect.provide(
        Layer.succeed(UserRepository, {
          findById: (id) => Effect.succeed(id === "1" ? mockUser : null),
          save: (user) => Effect.succeed(user)
        })
      )
    )

    deepStrictEqual(result, mockUser)
  })
)
```

### Shared Test Layer

```typescript
const TestDbLayer = Layer.mergeAll(
  DbConnectionLive,
  MigrationLayer,
  SeedDataLayer
)

layer(TestDbLayer, { timeout: Duration.seconds(60) })(
  "database integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepository
        const created = yield* repo.save({ name: "Alice", email: "a@test.com" })
        const found = yield* repo.findById(created.id)
        deepStrictEqual(found, created)
      })
    )
  }
)
```

---

## Resource Management

```typescript
scoped("properly acquires and releases", () =>
  Effect.gen(function* () {
    const released = yield* Ref.make(false)

    const resource = Effect.acquireRelease(
      Effect.succeed("resource"),
      () => Ref.set(released, true)
    )

    yield* Effect.scoped(
      Effect.gen(function* () {
        const r = yield* resource
        strictEqual(r, "resource")
      })
    )

    assertTrue(yield* Ref.get(released))
  })
)

scoped("releases on failure", () =>
  Effect.gen(function* () {
    const released = yield* Ref.make(false)

    const resource = Effect.acquireRelease(
      Effect.succeed("resource"),
      () => Ref.set(released, true)
    )

    const exit = yield* Effect.exit(
      Effect.scoped(
        Effect.gen(function* () {
          yield* resource
          return yield* Effect.fail("intentional")
        })
      )
    )

    strictEqual(exit._tag, "Failure")
    assertTrue(yield* Ref.get(released))
  })
)
```

---

## Concurrent Operations

```typescript
effect("executes in parallel", () =>
  Effect.gen(function* () {
    const order = yield* Ref.make<string[]>([])

    const op = (id: string) =>
      Effect.gen(function* () {
        yield* Ref.update(order, (arr) => [...arr, `start-${id}`])
        yield* Effect.sleep(Duration.millis(100))
        yield* Ref.update(order, (arr) => [...arr, `end-${id}`])
      })

    const fiber = yield* Effect.fork(
      Effect.all([op("A"), op("B"), op("C")], { concurrency: "unbounded" })
    )

    yield* TestClock.adjust(Duration.millis(100))
    yield* Effect.join(fiber)

    const sequence = yield* Ref.get(order)
    // All started before any ended (parallel execution)
    strictEqual(sequence.slice(0, 3).every(s => s.startsWith("start")), true)
  })
)
```

---

## Test Organization

### File Location - CRITICAL

**Tests MUST be in `./test` folder, NEVER inline with source files.**

```
packages/example/
├── src/
│   ├── services/UserService.ts
│   └── utils/validation.ts
└── test/                         # All tests here
    ├── services/UserService.test.ts
    └── utils/validation.test.ts
```

### Import Paths - NO RELATIVE IMPORTS

```typescript
// FORBIDDEN
import { UserService } from "../src/services/UserService"

// REQUIRED - path aliases
import { UserService } from "@beep/iam-server/services/UserService"
```

### File Naming

- Test files: `{module-name}.test.ts`
- Placeholder: `Dummy.test.ts` for new packages

---

## Import Conventions

```typescript
// Effect namespace imports
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as TestClock from "effect/TestClock"
import * as Exit from "effect/Exit"
import * as Cause from "effect/Cause"
import * as Fiber from "effect/Fiber"
import * as Ref from "effect/Ref"

// Short aliases
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as S from "effect/Schema"

// Testkit
import { describe } from "bun:test"
import {
  effect,
  scoped,
  live,
  layer,
  strictEqual,
  deepStrictEqual,
  assertTrue,
  assertNone,
  assertSome,
  fail
} from "@beep/testkit"
```

---

## Quick Reference

| Pattern | Runner | Key Import |
|---------|--------|------------|
| Unit test | `effect()` | - |
| Resource cleanup | `scoped()` | - |
| Time-dependent | `effect()` | `TestClock` |
| Error testing | `effect()` | `Effect.exit`, `Effect.either` |
| Integration (DB) | `layer()` | Test layer with timeout |
| Mock service | `effect()` | `Layer.succeed` |
| Concurrency | `effect()` | `Effect.fork`, `Ref` |
