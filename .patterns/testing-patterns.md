# Testing patterns for Effect code

## Scope and authority

This is the repository's pattern reference for testing Effect code with
`@effect/vitest`. It is subordinate to
[the testing standard](../standards/architecture/08-testing.md), which owns how
a slice's tests are layered, which runner to use (`bun run test` or
`bunx --bun vitest run`, never `bun test`), and the doctest and docgen example
lanes. [Effect-first development](../standards/effect-first-development.md) and
the applicable package's `AGENTS.md` still govern the code under test.

Every TypeScript example below is compiled by `bun run beep laws markdown-fences --check`.
Each example is self-contained: it declares the small module it tests inline.
In a real package test, import that module through its `@beep/*` alias, never
through a relative path into another workspace's `src/`.

Disposition recorded 2026-10-23 for #1856 wave 3: rewritten for this
repository. The earlier text was an adapted copy of upstream Effect library
guidance; its `../src/*.js` imports and library-internal module names are gone.

## Testing framework selection

### Use `@effect/vitest` for Effect-based code

`it.effect` runs an Effect with the test services (`TestClock`, `TestConsole`)
and a scope, so the test body is an Effect, not a promise.

```ts
import { assert, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

const double = Effect.fn("double")(function* (n: number) {
  return n * 2
})

it.effect("doubles inside an Effect", () =>
  Effect.gen(function* () {
    const result = yield* double(21)
    assert.strictEqual(result, 42)
  })
)
```

### Use plain `it` for pure functions

```ts
import { expect, it } from "@effect/vitest"
import * as Str from "effect/String"

const initials = (name: string): string => Str.toUpperCase(Str.slice(0, 1)(name))

it("takes the first letter", () => {
  expect(initials("ada")).toBe("A")
})
```

### Never run an Effect synchronously inside a test

`Effect.runSync` inside a plain `it` skips the test services and fails on any
asynchronous step. Write the test with `it.effect` instead.

```ts
import { assert, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

const answer = Effect.succeed(42)

// Wrong: the runner bypasses TestClock and the test scope.
it("wrong pattern", () => {
  const result = Effect.runSync(answer)
  assert.strictEqual(result, 42)
})

// Right: the body is an Effect.
it.effect("correct pattern", () =>
  Effect.gen(function* () {
    const result = yield* answer
    assert.strictEqual(result, 42) // expect(result).toBe(42) is also legal for plain values
  })
)
```

### Choose assertions by value, not by tester

`expect` and plain-value `assert` are legal inside `it.effect`. For Option,
Result, and Exit values, use the public `@effect/vitest/utils` helpers instead
of tag predicates or equality checks on the container. Keep both the expected
variant and its payload in the assertion; see the complete examples below.

```ts
import { expect, it } from "@effect/vitest"
import { assertSome } from "@effect/vitest/utils"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"

it.effect("asserts an Option payload and a plain value", () =>
  Effect.gen(function* () {
    const result = yield* Effect.succeed(O.some(42))
    assertSome(result, 42)
    expect(result.value + 1).toBe(43)
  })
)
```

## Time-dependent testing with TestClock

Any code that sleeps, times out, retries on a schedule or races a timer must
advance `TestClock` instead of waiting on real time. Fork the timed work, move
the clock, then join.

```ts
import { assert, describe, it } from "@effect/vitest"
import { assertExitFailure } from "@effect/vitest/utils"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as TestClock from "effect/testing/TestClock"

describe("time-dependent operations", () => {
  it.effect("completes a delay once the clock moves", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.forkChild(Effect.as(Effect.sleep("5 seconds"), "completed"))

      yield* TestClock.adjust("5 seconds")

      const result = yield* Fiber.join(fiber)
      assert.strictEqual(result, "completed")
    })
  )

  it.effect("fails with a TimeoutError once the deadline passes", () =>
    Effect.gen(function* () {
      const fiber = yield* Effect.forkChild(Effect.timeout(Effect.sleep("10 seconds"), "5 seconds"))

      yield* TestClock.adjust("5 seconds")

      const result = yield* Effect.exit(Fiber.join(fiber))
      assertExitFailure(result, Cause.fail(new Cause.TimeoutError()))
    })
  )

  it.effect("sets absolute time with setTime", () =>
    Effect.gen(function* () {
      yield* TestClock.setTime(1000)

      const fiber = yield* Effect.forkChild(
        Effect.andThen(
          Effect.sleep("2 seconds"),
          Effect.clockWith((clock) => clock.currentTimeMillis)
        )
      )

      yield* TestClock.adjust("2 seconds")
      const result = yield* Fiber.join(fiber)
      assert.strictEqual(result, 3000) // 1000 + 2000ms
    })
  )
})
```

### Operations that need TestClock

- `Effect.sleep()` and `Effect.delay()`
- `Effect.timeout()` and races against a timer
- Scheduled operations and retry policies
- Queue operations with time-based completion
- Any concurrent operation whose order depends on timing

## Testing patterns

### Basic Effect test

```ts
import { assert, describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

class Counter extends S.Class<Counter>("Counter")({ value: S.Int }) {}

const Counters = {
  create: Effect.fn("Counters.create")(function* (initialValue = 0) {
    return Counter.make({ value: initialValue })
  }),
  map: Effect.fn("Counters.map")(function* (counter: Counter, f: (value: number) => number) {
    return Counter.make({ value: f(counter.value) })
  }),
}

describe("Counters", () => {
  describe("constructors", () => {
    it.effect("create starts at zero", () =>
      Effect.gen(function* () {
        const counter = yield* Counters.create()
        assert.strictEqual(counter.value, 0)
      })
    )

    it.effect("create accepts an initial value", () =>
      Effect.gen(function* () {
        const counter = yield* Counters.create(42)
        assert.strictEqual(counter.value, 42)
      })
    )
  })

  describe("combinators", () => {
    it.effect("map transforms the value", () =>
      Effect.gen(function* () {
        const counter = yield* Counters.create(10)
        const doubled = yield* Counters.map(counter, (value) => value * 2)
        assert.strictEqual(doubled.value, 20)
      })
    )
  })
})
```

### Error handling test

Inspect a typed failure with `Effect.exit` and compare the whole `Cause`.
Replace a dependency with a failing test implementation through its service
tag.

```ts
import { assert, describe, it } from "@effect/vitest"
import { assertExitFailure } from "@effect/vitest/utils"
import * as Cause from "effect/Cause"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as O from "effect/Option"
import * as S from "effect/Schema"

class ValidationError extends S.TaggedError<ValidationError>()("ValidationError", { message: S.String }) {}
class NetworkError extends S.TaggedError<NetworkError>()("NetworkError", { message: S.String }) {}

class Network extends Context.Service<
  Network,
  { readonly fetch: (url: string) => Effect.Effect<string, NetworkError> }
>()("Network") {}

const create = Effect.fn("create")(function* (initialValue: number) {
  if (initialValue < 0) {
    return yield* new ValidationError({ message: "initial value must not be negative" })
  }
  return initialValue
})

const fetchBody = Effect.fn("fetchBody")(function* (url: string) {
  const network = yield* Network
  return yield* network.fetch(url)
})

describe("error handling", () => {
  it.effect("fails with a validation error for negative values", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(create(-1))

      // Extract the error, not its Cause; success or a defect-only cause throws.
      const error = O.getOrThrow(Exit.findErrorOption(result))
      assertExitFailure(result, Cause.fail(error))
      assert.isTrue(S.is(ValidationError)(error))
    })
  )

  it.effect("surfaces a network failure from a test service", () =>
    Effect.gen(function* () {
      const expectedError = new NetworkError({ message: "Connection timeout" })
      const failingNetwork = Layer.succeed(Network, Network.of({ fetch: () => Effect.fail(expectedError) }))

      const result = yield* Effect.exit(fetchBody("https://api.example.com").pipe(Effect.provide(failingNetwork)))

      assertExitFailure(result, Cause.fail(expectedError))
    })
  )
})
```

### Resource management test

Record acquisition and release in a `Ref` and assert the release ran on both
success and failure.

```ts
import { assert, describe, it } from "@effect/vitest"
import { assertExitFailure } from "@effect/vitest/utils"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"

const withResource = <R, A, E>(
  acquire: Effect.Effect<R>,
  use: (resource: R) => Effect.Effect<A, E>,
  release: Effect.Effect<void>
): Effect.Effect<A, E> => Effect.acquireUseRelease(acquire, use, () => release)

describe("resource management", () => {
  it.effect("acquires and releases around a successful use", () =>
    Effect.gen(function* () {
      const acquired = yield* Ref.make(false)
      const released = yield* Ref.make(false)

      const result = yield* withResource(
        Ref.set(acquired, true),
        () => Effect.succeed("used"),
        Ref.set(released, true)
      )

      assert.strictEqual(result, "used")
      assert.isTrue(yield* Ref.get(acquired))
      assert.isTrue(yield* Ref.get(released))
    })
  )

  it.effect("releases even when the use fails", () =>
    Effect.gen(function* () {
      const released = yield* Ref.make(false)

      const result = yield* Effect.exit(
        withResource(Effect.succeed("resource"), () => Effect.fail("operation failed"), Ref.set(released, true))
      )

      assertExitFailure(result, Cause.fail("operation failed"))
      assert.isTrue(yield* Ref.get(released))
    })
  )
})
```

### Concurrent operations test

```ts
import { assert, describe, it } from "@effect/vitest"
import * as A from "effect/Array"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as Ref from "effect/Ref"
import * as TestClock from "effect/testing/TestClock"

const operation = Effect.fn("operation")(function* (id: string) {
  return id
})

describe("concurrent operations", () => {
  it.effect("runs several operations concurrently", () =>
    Effect.gen(function* () {
      const results = yield* Effect.all([operation("A"), operation("B"), operation("C")], {
        concurrency: "unbounded",
      })

      assert.strictEqual(results.length, 3)
      assert.includeMembers(results, ["A", "B", "C"])
    })
  )

  it.effect("respects a concurrency limit", () =>
    Effect.gen(function* () {
      const started = yield* Ref.make<ReadonlyArray<string>>([])

      const timedOperation = Effect.fnUntraced(function* (id: string) {
        yield* Ref.update(started, A.append(id))
        yield* Effect.sleep(Duration.seconds(1))
        return id
      })

      const fiber = yield* Effect.forkChild(Effect.all(A.map(["A", "B", "C", "D"], timedOperation), { concurrency: 2 }))

      // Each wave takes one second; inspect after 500ms, then drive the remaining 1500ms.
      yield* TestClock.adjust(Duration.millis(500))
      assert.strictEqual((yield* Ref.get(started)).length, 2) // Only 2 have started

      yield* TestClock.adjust(Duration.millis(1500))
      const finalResults = yield* Fiber.join(fiber)
      assert.strictEqual(finalResults.length, 4)
    })
  )
})
```

### Layer and service test

Define the dependency as a `Context.Service`, then provide a test layer for
each scenario. `Layer.succeed` with `Service.of(...)` covers one-off mocks; a
static layer on the service keeps the production implementation next to its
contract.

```ts
import { assert, describe, it } from "@effect/vitest"
import { assertExitFailure } from "@effect/vitest/utils"
import * as Cause from "effect/Cause"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

type Row = { readonly id: number; readonly name: string }

class Database extends Context.Service<
  Database,
  { readonly query: (sql: string) => Effect.Effect<ReadonlyArray<Row>, string> }
>()("Database") {
  static readonly layerEmpty = Layer.succeed(Database, Database.of({ query: () => Effect.succeed([]) }))
}

const mockDatabase = (rows: ReadonlyArray<Row>) =>
  Layer.succeed(Database, Database.of({ query: () => Effect.succeed(rows) }))

const failingDatabase = (error: string) => Layer.succeed(Database, Database.of({ query: () => Effect.fail(error) }))

const findUser = Effect.fn("findUser")(function* (id: string) {
  const database = yield* Database
  const rows = yield* database.query(`select * from users where id = '${id}'`)
  return rows[0]
})

describe("service integration", () => {
  it.effect("reads through a mock service", () =>
    Effect.gen(function* () {
      const rows = [{ id: 1, name: "test" }]
      const result = yield* findUser("1").pipe(Effect.provide(mockDatabase(rows)))
      assert.deepStrictEqual(result, rows[0])
    })
  )

  it.effect("surfaces a service failure", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(
        findUser("1").pipe(Effect.provide(failingDatabase("Database connection failed")))
      )
      assertExitFailure(result, Cause.fail("Database connection failed"))
    })
  )

  it.effect("uses the empty layer", () =>
    Effect.gen(function* () {
      const result = yield* findUser("1").pipe(Effect.provide(Database.layerEmpty))
      assert.isUndefined(result)
    })
  )
})
```

## Assertion patterns

### Plain-value assertions

These `assert` methods remain legal, as do equivalent `expect` matchers, for
plain values in either plain `it` or `it.effect`. Use the specialized helpers
in the next section for Option, Result, and Exit containers.

```ts
import { assert, it } from "@effect/vitest"

it("plain-value assertions", () => {
  const actual = { id: 1, tags: ["a", "b"] }

  // Equality
  assert.strictEqual(actual.id, 1) // Reference/primitive equality
  assert.notStrictEqual(actual.id, 2) // Reference/primitive inequality
  assert.deepStrictEqual(actual, { id: 1, tags: ["a", "b"] }) // Deep structural equality
  assert.deepEqual(actual, { id: 1, tags: ["a", "b"] }) // Vitest/Chai structural equality; not Effect's Equal.equals

  // Booleans
  assert.isTrue(actual.id > 0)
  assert.isFalse(actual.id < 0)
  assert.ok(actual.tags.length > 0, "optional message") // Boolean with custom message

  // Null and undefined
  assert.isNull(null)
  assert.isNotNull(actual)
  assert.isUndefined(undefined)
  assert.isDefined(actual)

  // Numeric comparisons
  assert.isAtLeast(actual.tags.length, 2) // actual >= expected
  assert.isAtMost(actual.tags.length, 2) // actual <= expected

  // Strings and arrays
  assert.match("user-1", /^user-\d+$/)
  assert.includeMembers(actual.tags, ["a"])
})
```

### Specialized Option, Result, and Exit Assertions

Import helpers from `@effect/vitest/utils`. `assertSome`, `assertSuccess`,
`assertFailure`, `assertExitSuccess`, and `assertExitFailure` require an
expected payload (or Cause for Exit failure), check it with deep strict
equality, and narrow the container. `assertNone` needs only the Option. They
fail on the wrong variant or payload; no conditional assertion branch is
needed. `assertExitFailure(exit, Cause.fail(error))` checks a typed error;
`Cause.die(defect)` checks a defect. A bare error is not a Cause.

Use `Effect.exit` to inspect an Effect's outcome. The Result examples below
exercise Result values directly; there is no need to wrap a pure Result in an
Effect or convert an Effect to Result just to assert its outcome.

```ts
import { describe, expect, it } from "@effect/vitest"
import {
  assertExitFailure,
  assertExitSuccess,
  assertFailure,
  assertNone,
  assertSome,
  assertSuccess,
} from "@effect/vitest/utils"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import * as Result from "effect/Result"

describe("specialized assertions", () => {
  it("asserts Some and its payload", () => {
    const result: O.Option<{ readonly id: number }> = O.some({ id: 1 })
    assertSome(result, { id: 1 })
    expect(result.value.id).toBe(1)
  })

  it("asserts None", () => {
    const result: O.Option<number> = O.none()
    assertNone(result)
  })

  it.effect("asserts Exit success", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(Effect.succeed(42))

      // Type-safe assertion that narrows the Exit
      assertExitSuccess(result, 42)
      expect(result.value + 1).toBe(43)
    })
  )

  it.effect("asserts Exit failure", () =>
    Effect.gen(function* () {
      const result = yield* Effect.exit(Effect.fail("error"))

      // Asserts failure and validates the complete Cause
      assertExitFailure(result, Cause.fail("error"))
    })
  )

  it("asserts Result success", () => {
    const result: Result.Result<string, string> = Result.succeed("value")
    assertSuccess(result, "value")
    expect(result.success.length).toBe(5)
  })

  it("asserts Result failure", () => {
    const result: Result.Result<string, string> = Result.fail("error")
    assertFailure(result, "error")
    expect(result.failure.length).toBe(5)
  })
})
```

### Testing structured data

```ts
import { assert, it } from "@effect/vitest"
import { assertSome } from "@effect/vitest/utils"
import * as A from "effect/Array"
import * as Effect from "effect/Effect"

type User = { readonly id: string; readonly name: string; readonly age: number }

const processUsers = Effect.fn("processUsers")(function* (users: ReadonlyArray<User>) {
  return { processedUsers: A.map(users, (user) => ({ ...user, processed: true })) }
})

it.effect("transforms every user", () =>
  Effect.gen(function* () {
    const result = yield* processUsers([
      { id: "1", name: "Alice", age: 30 },
      { id: "2", name: "Bob", age: 25 },
    ])

    assert.strictEqual(result.processedUsers.length, 2)

    const alice = A.findFirst(result.processedUsers, (user) => user.id === "1")
    assertSome(alice, { id: "1", name: "Alice", age: 30, processed: true })
  })
)
```

## Test organization

### Group related tests

Group by the role of the API under test, from constructors to integration.

```ts
import { describe } from "@effect/vitest"

describe("ModuleName", () => {
  describe("constructors", () => {
    // Tests for creation functions
  })

  describe("combinators", () => {
    // Tests for transformation functions
  })

  describe("predicates", () => {
    // Tests for boolean-returning functions
  })

  describe("error handling", () => {
    // Tests for error conditions
  })

  describe("integration", () => {
    // Tests for service integration
  })
})
```

### Progressive test complexity

```ts
import { describe, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

describe("feature progression", () => {
  it.effect("basic functionality", () => Effect.void)
  it.effect("with configuration", () => Effect.void)
  it.effect("with error handling", () => Effect.void)
  it.effect("with concurrency", () => Effect.void)
  it.effect("full integration", () => Effect.void)
})
```
