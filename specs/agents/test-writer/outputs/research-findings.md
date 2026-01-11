# Test Writer Research Findings

## Testkit Helpers

### `effect()`

**Signature:**
```typescript
effect: BunTest.Tester<TestServices.TestServices>
```

**Usage:**
- For basic unit tests that need TestServices (TestClock, TestRandom, etc.)
- Wraps tests with `TestContext.TestContext` automatically
- Returns an Effect that will be run with test services

**Example:**
```typescript
import { effect } from "@beep/testkit"
import * as Effect from "effect/Effect"
import { expect } from "vitest"

effect("validates email format", () =>
  Effect.gen(function* () {
    const result = yield* validateEmail("test@example.com")
    expect(result).toBe(true)
  })
)
```

### `scoped()`

**Signature:**
```typescript
scoped: BunTest.Tester<TestServices.TestServices | Scope.Scope>
```

**Usage:**
- For tests that need scoped resources (spies, temp files, cleanup)
- Automatically provides Scope for resource management
- Use with `Effect.addFinalizer` for cleanup

**Example:**
```typescript
import { scoped } from "@beep/testkit"
import * as Effect from "effect/Effect"

scoped("restores spy via finalizer", () =>
  Effect.gen(function* () {
    const spy = createSpy()
    yield* Effect.addFinalizer(() => Effect.sync(() => spy.restore()))
    spy.run()
    yield* Effect.sync(() => spy.assertCalled())
  })
)
```

### `layer()`

**Signature:**
```typescript
layer: <R, E>(
  layer_: Layer.Layer<R, E>,
  options?: {
    readonly memoMap?: Layer.MemoMap;
    readonly timeout?: Duration.DurationInput;
    readonly excludeTestServices?: boolean;
  }
) => {
  (f: (it: BunTest.Methods) => void): void;
  (name: string, f: (it: BunTest.Methods) => void): void;
}
```

**Usage:**
- For integration tests requiring service layers
- Memoizes layer construction across tests in the suite
- Provides nested `it.effect`, `it.scoped`, `it.layer`, `it.live`
- By default merges with `TestContext.TestContext`

**Example:**
```typescript
import { layer } from "@beep/testkit"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"

layer(Layer.mergeAll(UserRepoTestLayer, DbTestLayer), { timeout: Duration.seconds(30) })(
  "UserRepo integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const created = yield* repo.create({ name: "Alice" })
        const retrieved = yield* repo.findById(created.id)
        expect(retrieved).toEqual(created)
      })
    )
  }
)
```

### `flakyTest()`

**Signature:**
```typescript
flakyTest: <A, E, R>(
  self: Effect.Effect<A, E, R>,
  timeout?: Duration.DurationInput
) => Effect.Effect<A, never, R>
```

**Usage:**
- Wraps flaky tests with retry logic
- Uses `Schedule.recurs(10)` with elapsed time check
- Default timeout: 30 seconds
- Catches defects and converts to failures for retry

**Example:**
```typescript
import { effect, flakyTest } from "@beep/testkit"
import * as Duration from "effect/Duration"

effect("stabilizes transient API", () =>
  flakyTest(
    Effect.retry(
      RemoteCall,
      F.pipe(Schedule.recurs(5), Schedule.compose(Schedule.elapsed))
    ),
    Duration.seconds(10)
  )
)
```

### `live()`

**Signature:**
```typescript
live: BunTest.Tester<never>
```

**Usage:**
- For tests that should NOT use TestContext
- Uses real Clock, Random, etc.
- For testing actual time-dependent behavior

### `scopedLive()`

**Signature:**
```typescript
scopedLive: BunTest.Tester<Scope.Scope>
```

**Usage:**
- Scoped tests without TestContext
- Real services with resource cleanup

### `describeWrapped()`

**Usage:**
- Creates a describe block with all testkit methods available
- Alternative to `layer` when no layer is needed

---

## Effect Testing Modules

### Arbitrary (Property-Based Testing)

**Module:** `effect/Arbitrary`

**Key Functions:**
- `Arbitrary.make(schema)` - Creates a FastCheck arbitrary from a Schema
- `Arbitrary.makeLazy(schema)` - Lazy arbitrary creation

**Usage with FastCheck:**
```typescript
import * as Arbitrary from "effect/Arbitrary"
import * as FastCheck from "effect/FastCheck"
import * as S from "effect/Schema"

const PersonSchema = S.Struct({
  name: S.NonEmptyString,
  age: S.Int.pipe(S.between(1, 80))
})

const arb = Arbitrary.make(PersonSchema)
FastCheck.assert(
  FastCheck.property(arb, (person) => {
    // Test invariants
    return person.age >= 1 && person.age <= 80
  })
)
```

**Custom Arbitraries:**
```typescript
const Name = S.NonEmptyString.annotations({
  arbitrary: () => (fc) =>
    fc.constantFrom("Alice Johnson", "Bob Smith", "Carol White")
})
```

### TestClock (Time Control)

**Module:** `effect/TestClock`

**Key Functions:**
- `TestClock.adjust(duration)` - Advance clock time
- `TestClock.setTime(epochMillis)` - Set absolute time
- `TestClock.currentTimeMillis` - Get current test time
- `TestClock.sleep(duration)` - Sleep in test clock time
- `TestClock.sleeps` - Get pending sleeps

**Critical Pattern:**
1. Fork the effect being tested
2. Adjust TestClock
3. Join fiber and verify results

**Example:**
```typescript
import * as TestClock from "effect/TestClock"
import * as Fiber from "effect/Fiber"
import * as Option from "effect/Option"

effect("expires token after 1 hour", () =>
  Effect.gen(function* () {
    // Fork the time-dependent operation
    const fiber = yield* Effect.sleep("5 minutes").pipe(
      Effect.timeoutTo({
        duration: "1 minute",
        onSuccess: Option.some,
        onTimeout: () => Option.none<void>()
      }),
      Effect.fork
    )

    // Advance time
    yield* TestClock.adjust("1 minute")

    // Check result
    const result = yield* Fiber.join(fiber)
    expect(Option.isNone(result)).toBe(true)
  })
)
```

### ConfigProvider (Test Configuration)

**Module:** `effect/ConfigProvider`

**Key Functions:**
- `ConfigProvider.fromMap(map)` - Create from Map
- `ConfigProvider.fromJson(json)` - Create from JSON string
- `ConfigProvider.nested(prefix)` - Nested config provider

**Usage:**
```typescript
import * as ConfigProvider from "effect/ConfigProvider"
import * as Layer from "effect/Layer"

const TestConfig = Layer.setConfigProvider(
  ConfigProvider.fromMap(new Map([
    ["DATABASE_URL", "postgres://test:test@localhost/test"],
    ["API_KEY", "test-key"]
  ]))
)
```

### TestContext

**Module:** `effect/TestContext`

**Export:**
```typescript
const TestContext: Layer.Layer<TestServices.TestServices, never, never>
```

**Services Provided:**
- TestClock - Controllable time
- TestRandom - Deterministic random
- TestConfig - Test configuration
- TestAnnotations - Test annotations

---

## Test Patterns Found in Codebase

### Unit Test Pattern

**From `packages/common/utils/test/md5/md5.test.ts`:**
```typescript
import { describe, expect, test } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"

describe("MD5 hashing with Effect", () => {
  test("should pass the self test", () => {
    const result = Effect.runSync(Md5.hashStr("hello"))
    expect(result).toEqual("5d41402abc4b2a76b9719d911017c592")
  })

  test("should hash incrementally", () => {
    const result = Effect.runSync(
      Effect.gen(function* () {
        let state = Md5.makeState()
        state = yield* F.pipe(state, Md5.appendStr("chunk1"))
        state = yield* F.pipe(state, Md5.appendStr("chunk2"))
        return yield* F.pipe(state, Md5.finalize(false))
      })
    )
    expect(result).toEqual("expected-hash")
  })
})
```

### Integration Test Pattern (with Layers)

**From `packages/_internal/db-admin/test/AccountRepo.test.ts`:**
```typescript
import { describe, expect } from "bun:test"
import { layer, strictEqual, deepStrictEqual, assertTrue, assertNone } from "@beep/testkit"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

const TEST_TIMEOUT = 60000

describe("AccountRepo", () => {
  layer(PgTest, { timeout: Duration.seconds(60) })("insert operations", (it) => {
    it.effect(
      "should insert account and return entity with all fields",
      () =>
        Effect.gen(function* () {
          const userRepo = yield* UserRepo
          const accountRepo = yield* AccountRepo

          const user = yield* userRepo.insert(makeMockUser())
          const account = yield* accountRepo.insert(makeMockAccount({ userId: user.id }))

          assertTrue(S.is(Entities.Account.Model)(account))
          strictEqual(account.providerId, "google")
          deepStrictEqual(account.userId, user.id)
        }),
      TEST_TIMEOUT
    )
  })
})
```

### Service Test Pattern

**From `packages/shared/domain/test/services/EncryptionService.test.ts`:**
```typescript
import { describe } from "bun:test"
import { layer, strictEqual, assertTrue, deepStrictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"

const TestLayer = EncryptionService.layer

describe("EncryptionService", () => {
  layer(TestLayer)("encrypt and decrypt", (it) => {
    it.effect("should encrypt and decrypt a string correctly", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService
        const key = yield* service.generateKey()

        const plaintext = "Hello, World!"
        const encrypted = yield* service.encrypt(plaintext, key)
        const decrypted = yield* service.decrypt(encrypted, key)

        strictEqual(decrypted, plaintext)
      })
    )

    it.effect("should fail to decrypt with wrong key", () =>
      Effect.gen(function* () {
        const service = yield* EncryptionService.EncryptionService
        const key1 = yield* service.generateKey()
        const key2 = yield* service.generateKey()

        const encrypted = yield* service.encrypt("secret", key1)
        const result = yield* Effect.either(service.decrypt(encrypted, key2))

        strictEqual(result._tag, "Left")
        if (result._tag === "Left") {
          strictEqual(result.left._tag, "DecryptionError")
        }
      })
    )
  })
})
```

### Error Testing Pattern

**From `packages/common/contract/test/Contract.test.ts`:**
```typescript
import { effect } from "@beep/testkit"
import * as Cause from "effect/Cause"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as O from "effect/Option"

effect("continuation mapError maps raw errors to typed failures", () =>
  Effect.gen(function* () {
    const contract = Contract.make("MapError", {
      payload: {},
      success: S.Struct({ ok: S.Boolean }),
      failure: S.Union(TestError, NotAllowedError),
    })

    const continuation = contract.continuation({
      mapError: (error, _ctx) => {
        if (error instanceof MockDOMException && error.name === "NotAllowedError") {
          return new NotAllowedError({ message: error.message, domain: "test" })
        }
        return undefined
      },
    })

    const exit = yield* Effect.exit(
      continuation.run(() => Promise.reject(new MockDOMException("User cancelled", "NotAllowedError")))
    )

    const failure = Exit.match(exit, {
      onSuccess: () => O.none(),
      onFailure: (cause) => Cause.dieOption(cause),
    })

    expect(O.isSome(failure)).toBe(true)
    const err = O.getOrUndefined(failure)
    expect(err).toBeInstanceOf(NotAllowedError)
  })
)
```

### Schema Validation Test Pattern

**From `packages/common/schema/test/identity/entity-id.test.ts`:**
```typescript
import { describe, expect, test } from "bun:test"
import { EntityId } from "@beep/schema/identity"
import * as Effect from "effect/Effect"
import * as S from "effect/Schema"

describe("EntityId Schema Factory", () => {
  test("create() returns the data type, not the class", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" })
    const id = TestId.create()
    expect(id).toMatch(/^test_entity__[0-9a-f-]+$/)
  })

  test("is() type guard works correctly", () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" })
    const validId = TestId.create()
    const invalidId = "not-an-id"

    expect(TestId.is(validId)).toBe(true)
    expect(TestId.is(invalidId)).toBe(false)
  })

  test("works in Effect context without type pollution", async () => {
    const TestId = EntityId.make("test_entity", { brand: "TestId" })

    const program = Effect.gen(function* () {
      const id = TestId.create()
      return yield* Effect.succeed(id)
    })

    const result = await Effect.runPromise(program)
    expect(result).toMatch(/^test_entity__[0-9a-f-]+$/)
  })
})
```

---

## Testkit Assertion Helpers

From `@beep/testkit` assertions:
- `strictEqual(actual, expected)` - Strict equality
- `deepStrictEqual(actual, expected)` - Deep equality
- `assertTrue(value)` - Assert truthy
- `assertNone(option)` - Assert Option.none
- `assertSome(option)` - Assert Option.some

---

## Key Patterns Summary

1. **No `async/await`** - All tests use `Effect.gen` with generators
2. **No `describe` blocks with testkit helpers** - Use `effect()` and `layer()` directly
3. **Layer memoization** - Use `layer()` to share expensive setup
4. **Effect.either for error testing** - Wrap failures to inspect error types
5. **Effect.exit for defect testing** - Use with `Cause.dieOption` for defects
6. **Namespace imports everywhere** - `import * as Effect`, `import * as A`, etc.
7. **No native array/string methods** - Use `A.map`, `Str.split`, `F.pipe`
