# Test Writer Agent Design

## Agent Overview

The test-writer agent is an Effect-first testing specialist that writes unit and integration tests using `@beep/testkit`. It covers:

- Layer-based testing
- Property-based testing
- Time control
- Error testing
- Service testing

---

## Critical Constraints

1. **NEVER use `async/await`** - All tests must use Effect patterns
2. **NEVER use native array/string methods** - Use `A.map`, `Str.split`, etc.
3. **All tests must use `@beep/testkit`** helpers
4. **No `describe` blocks with testkit helpers** - Use `effect()` and `layer()` directly
5. **Always use namespace imports** - `import * as Effect from "effect/Effect"`

---

## Test Pattern Designs

### Pattern 1: Unit Test (Pure Functions)

```typescript
import * as Effect from "effect/Effect"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

effect("validates email format", () =>
  Effect.gen(function* () {
    const result = yield* validateEmail("test@example.com")
    expect(result).toBe(true)
  })
)

effect("rejects invalid email", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(validateEmail("invalid"))
    expect(result._tag).toBe("Left")
  })
)
```

### Pattern 2: Integration Test (with Layers)

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"
import { layer, strictEqual, deepStrictEqual } from "@beep/testkit"
import { expect } from "vitest"

const TestLayer = Layer.mergeAll(UserRepoTestLayer, DbTestLayer)

layer(TestLayer, { timeout: Duration.seconds(30) })(
  "UserRepo integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const created = yield* repo.create({ name: "Alice" })
        const retrieved = yield* repo.findById(created.id)
        deepStrictEqual(retrieved, created)
      })
    )

    it.effect("handles not found", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const result = yield* Effect.either(repo.findById("nonexistent"))
        expect(result._tag).toBe("Left")
      })
    )
  }
)
```

### Pattern 3: Property-Based Test

```typescript
import * as Effect from "effect/Effect"
import * as Arbitrary from "effect/Arbitrary"
import * as FastCheck from "effect/FastCheck"
import * as S from "effect/Schema"
import { effect } from "@beep/testkit"

effect("roundtrips encode/decode", () =>
  Effect.gen(function* () {
    const arb = Arbitrary.make(UserSchema)

    FastCheck.assert(
      FastCheck.property(arb, (user) => {
        const encoded = S.encodeSync(UserSchema)(user)
        const decoded = S.decodeSync(UserSchema)(encoded)
        return decoded.id === user.id && decoded.name === user.name
      })
    )
  })
)
```

### Pattern 4: Time Control Test

```typescript
import * as Effect from "effect/Effect"
import * as TestClock from "effect/TestClock"
import * as Fiber from "effect/Fiber"
import * as O from "effect/Option"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

effect("expires token after 1 hour", () =>
  Effect.gen(function* () {
    // Fork time-dependent operation
    const fiber = yield* createToken().pipe(
      Effect.flatMap((token) =>
        Effect.sleep("1 hour").pipe(
          Effect.map(() => isTokenValid(token))
        )
      ),
      Effect.fork
    )

    // Advance time by 59 minutes - still valid
    yield* TestClock.adjust("59 minutes")

    // Advance time by 2 more minutes - expired
    yield* TestClock.adjust("2 minutes")

    const result = yield* Fiber.join(fiber)
    expect(result).toBe(false)
  })
)
```

### Pattern 5: Error Testing

```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as Exit from "effect/Exit"
import * as O from "effect/Option"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

// Test specific error type
effect("throws UserNotFoundError", () =>
  Effect.gen(function* () {
    const exit = yield* Effect.exit(findUser("nonexistent"))

    expect(exit._tag).toBe("Failure")
    if (exit._tag === "Failure") {
      const failures = Cause.failures(exit.cause)
      expect(failures[0]._tag).toBe("UserNotFoundError")
    }
  })
)

// Test with Effect.either
effect("returns Left on validation error", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(validateInput({ invalid: true }))

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left._tag).toBe("ValidationError")
    }
  })
)
```

### Pattern 6: Service Test

```typescript
import { describe } from "bun:test"
import { layer, strictEqual, assertTrue } from "@beep/testkit"
import * as Effect from "effect/Effect"

const TestLayer = MyService.layer

describe("MyService", () => {
  layer(TestLayer)("core operations", (it) => {
    it.effect("performs operation successfully", () =>
      Effect.gen(function* () {
        const service = yield* MyService.MyService
        const result = yield* service.doOperation("input")

        assertTrue(result.success)
        strictEqual(result.value, "expected")
      })
    )

    it.effect("handles edge case", () =>
      Effect.gen(function* () {
        const service = yield* MyService.MyService
        const result = yield* Effect.either(service.doOperation(""))

        strictEqual(result._tag, "Left")
      })
    )
  })
})
```

### Pattern 7: Scoped Test (Resource Management)

```typescript
import * as Effect from "effect/Effect"
import { scoped } from "@beep/testkit"
import { expect } from "vitest"

scoped("manages resource lifecycle", () =>
  Effect.gen(function* () {
    let cleaned = false

    // Acquire resource with cleanup
    const resource = yield* Effect.acquireRelease(
      Effect.succeed({ data: "test" }),
      () => Effect.sync(() => { cleaned = true })
    )

    expect(resource.data).toBe("test")

    // Cleanup happens automatically when scope closes
  })
)
```

---

## Test File Structure

```typescript
/**
 * Tests for [Module/Service Name]
 */

import { describe } from "bun:test"
import { effect, layer, scoped, strictEqual, deepStrictEqual, assertTrue, assertNone } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"
import * as O from "effect/Option"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as Str from "effect/String"
import * as F from "effect/Function"

// Import module under test
import { ModuleUnderTest } from "./module"

// Test constants
const TEST_TIMEOUT = 60000

// Test helpers (if needed)
const makeTestData = () => ({ ... })

describe("ModuleUnderTest", () => {
  // Unit tests with effect()
  effect("pure function test", () =>
    Effect.gen(function* () {
      // Test implementation
    })
  )

  // Integration tests with layer()
  layer(TestLayer, { timeout: Duration.seconds(30) })(
    "integration suite",
    (it) => {
      it.effect("integration test", () =>
        Effect.gen(function* () {
          // Test implementation
        })
      )
    }
  )
})
```

---

## Agent Methodology

### Step 1: Analyze Code Under Test

1. Read the source file(s) being tested
2. Identify public API surface
3. Map out dependencies (services, layers)
4. Note error types and edge cases

### Step 2: Identify Test Types

| Code Type | Test Approach |
|-----------|---------------|
| Pure function | `effect()` with direct calls |
| Effect returning | `effect()` with `yield*` |
| Service method | `layer()` with service access |
| Time-dependent | `effect()` with TestClock |
| Resource-managed | `scoped()` with acquire/release |

### Step 3: Set Up Dependencies

1. Create test layers for services
2. Mock external dependencies
3. Set up test configuration
4. Prepare test data factories

### Step 4: Write Tests

1. Start with happy path
2. Add error cases
3. Cover edge cases
4. Add property tests for invariants

### Step 5: Validate Coverage

- All public methods tested
- Error paths covered
- Edge cases handled
- Type narrowing verified

---

## Assertion Reference

| Assertion | Usage |
|-----------|-------|
| `strictEqual(a, b)` | Primitive equality |
| `deepStrictEqual(a, b)` | Object/array equality |
| `assertTrue(v)` | Truthy check |
| `assertNone(opt)` | Option.none check |
| `expect(a).toBe(b)` | Vitest/Bun equality |
| `expect(a).toMatch(re)` | Regex matching |
| `expect(a).toHaveProperty(p)` | Property existence |

---

## Common Import Block

```typescript
// Core Effect modules
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"
import * as Exit from "effect/Exit"
import * as Cause from "effect/Cause"
import * as Fiber from "effect/Fiber"

// Data modules (single-letter aliases)
import * as A from "effect/Array"
import * as O from "effect/Option"
import * as S from "effect/Schema"
import * as Str from "effect/String"
import * as F from "effect/Function"

// Test modules
import * as TestClock from "effect/TestClock"
import * as Arbitrary from "effect/Arbitrary"
import * as FastCheck from "effect/FastCheck"

// Testkit
import { effect, scoped, layer, strictEqual, deepStrictEqual, assertTrue, assertNone } from "@beep/testkit"
import { describe, expect } from "bun:test"
```
