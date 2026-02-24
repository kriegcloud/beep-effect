# Effect Testing Standards

> Mandatory patterns for writing Effect-based tests in the beep-effect monorepo.

---

## Critical Rule

**ALWAYS use `@beep/testkit` for Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.**

```typescript
// FORBIDDEN - Manual Effect execution
import { test } from "bun:test"
test("wrong", async () => {
  await Effect.gen(function* () {
    const result = yield* someEffect()
  }).pipe(Effect.provide(TestLayer), Effect.runPromise)
})

// REQUIRED - testkit runners
import { effect } from "@beep/testkit"
effect("correct", () =>
  Effect.gen(function* () {
    const result = yield* someEffect()
  })
)
```

---

## Test Runner Selection

| Runner | Use Case | When to Use |
|--------|----------|-------------|
| `effect()` | Standard Effect tests | Most unit tests, time-dependent code with TestClock |
| `scoped()` | Resource management | Tests with acquireRelease, cleanup, spies |
| `live()` | Pure logic without test services | Tests needing real Clock/Random |
| `layer()` | Shared expensive resources | Database tests, integration tests, service composition |

### Quick Reference Matrix

```typescript
// Unit test with mocked time
effect("completes after delay", () =>
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(Effect.sleep("5 seconds"))
    yield* TestClock.adjust("5 seconds")
    const result = yield* Fiber.join(fiber)
    strictEqual(result, undefined)
  })
)

// Resource cleanup
scoped("releases resource", () =>
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

// Integration test with shared Layer
layer(TestLayer, { timeout: Duration.seconds(60) })("database", (it) => {
  it.effect("queries data", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepo
      const result = yield* repo.findAll()
      strictEqual(result.length, 0)
    })
  )
})
```

---

## Critical Pattern: Effect.fn vs Effect.gen

**ALWAYS use `Effect.fn(function* () {...})` for test bodies and callbacks.**

**NEVER use `() => Effect.gen(function* () {...})`.**

### Why This Matters

The `Effect.fn` pattern provides proper type inference and error context. The arrow function pattern causes `unknown` type errors and loses context information.

### Correct Patterns

```typescript
// Test bodies - REQUIRED
effect("test name", Effect.fn(function* () {
  const result = yield* someEffect()
  strictEqual(result, 42)
}))

// Callbacks in Effect operations - REQUIRED
const items = yield* A.findFirst(
  array,
  Effect.fn(function* (item: ItemType) {
    const check = yield* validateItem(item)
    return check
  })
)

// Filter with Effects - REQUIRED
const valid = yield* A.filterEffect(
  items,
  Effect.fn(function* (item: ItemType) {
    const isValid = yield* checkValidity(item)
    return isValid
  })
)

// ForEach with Effects - REQUIRED
yield* A.forEach(
  items,
  Effect.fn(function* (item: ItemType) {
    yield* processItem(item)
  })
)
```

### Forbidden Patterns

```typescript
// FORBIDDEN - Arrow function wrapper
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect()  // Type: unknown
    strictEqual(result, 42)  // Error: unknown type
  })
)

// FORBIDDEN - Missing type annotation in callback
const items = yield* A.findFirst(
  array,
  (item) =>  // item: unknown - causes type errors
    Effect.gen(function* () {
      const check = yield* validateItem(item)
      return check
    })
)

// FORBIDDEN - Manual type annotation workaround
const items = yield* A.findFirst(
  array,
  (item: ItemType) =>  // Don't add types manually - use Effect.fn
    Effect.gen(function* () {
      const check = yield* validateItem(item)
      return check
    })
)
```

---

## Layer Pattern: Suite-Level vs Per-Test

**ALWAYS use `layer()` utility for shared test layers.**

**NEVER use individual `.pipe(Effect.provide(TestLayer))` on each test.**

### Correct Pattern

```typescript
const TestLayer = Layer.mergeAll(
  DbConnectionLive,
  UserRepoLive,
  AuthServiceLive
)

// REQUIRED - Layer shared across suite
layer(TestLayer, { timeout: Duration.seconds(60) })("user service", (it) => {
  it.effect("creates user", Effect.fn(function* () {
    const service = yield* UserService
    const user = yield* service.create({ name: "Alice" })
    strictEqual(user.name, "Alice")
  }))

  it.effect("finds user", Effect.fn(function* () {
    const service = yield* UserService
    const found = yield* service.findByName("Alice")
    assertSome(found)
  }))
})
```

### Forbidden Pattern

```typescript
// FORBIDDEN - Individual layer provision
const TestLayer = Layer.mergeAll(
  DbConnectionLive,
  UserRepoLive,
  AuthServiceLive
)

effect("creates user", () =>
  Effect.gen(function* () {
    const service = yield* UserService
    const user = yield* service.create({ name: "Alice" })
    strictEqual(user.name, "Alice")
  }).pipe(Effect.provide(TestLayer))  // WRONG - per-test provision
)

effect("finds user", () =>
  Effect.gen(function* () {
    const service = yield* UserService
    const found = yield* service.findByName("Alice")
    assertSome(found)
  }).pipe(Effect.provide(TestLayer))  // WRONG - duplicated provision
)
```

### Why This Matters

- **Performance**: `layer()` memoizes the runtime, preventing expensive Layer reconstruction
- **Consistency**: Shared state across tests (e.g., database connections, migrations)
- **Type Safety**: Layer composition happens once, reducing type inference issues
- **Cleanup**: Automatic finalizer execution after suite completion

---

## Type Annotations in Callbacks

**ALWAYS add explicit type annotations in array operation callbacks.**

### Why This Matters

Effect array operations often cannot infer callback parameter types, leading to `unknown` type errors.

### Correct Patterns

```typescript
// Array.some - REQUIRED type annotation
const hasValid = A.some(items, (item: ItemType) => item.isValid)

// Array.filter - REQUIRED type annotation
const filtered = A.filter(items, (item: ItemType) => item.count > 0)

// Array.map - REQUIRED type annotation
const mapped = A.map(items, (item: ItemType) => item.name)

// Array.findFirst with Effect - REQUIRED type annotation
const found = yield* A.findFirst(
  items,
  Effect.fn(function* (item: ItemType) {
    const isValid = yield* validateItem(item)
    return isValid
  })
)

// Array.forEach with Effect - REQUIRED type annotation
yield* A.forEach(
  items,
  Effect.fn(function* (item: ItemType) {
    yield* processItem(item)
  })
)
```

### Forbidden Patterns

```typescript
// FORBIDDEN - Missing type annotation
const hasValid = A.some(items, (item) => item.isValid)  // item: unknown

// FORBIDDEN - Relying on type inference in complex operations
const found = yield* A.findFirst(
  items,
  Effect.fn(function* (item) {  // item: unknown
    const isValid = yield* validateItem(item)  // Type error
    return isValid
  })
)
```

---

## Context Type Mismatches

### Problem Pattern

```typescript
// Test declares Effect<void, unknown, unknown>
effect("test name", Effect.fn(function* () {
  const service = yield* MyService  // Requires MyService in context
  // ...
}))

// Error: Type 'Effect<void, unknown, MyService>' is not assignable to
//        type 'Effect<void, unknown, unknown>'
```

### Solution: Use `layer()` for Service Dependencies

```typescript
// CORRECT - Layer provides the service context
const TestLayer = Layer.mergeAll(
  MyServiceLive,
  DependencyLive
)

layer(TestLayer)("service tests", (it) => {
  it.effect("uses service", Effect.fn(function* () {
    const service = yield* MyService
    const result = yield* service.doSomething()
    strictEqual(result, expected)
  }))
})
```

### When You Need Inline Layers

If `layer()` utility is not appropriate (e.g., per-test Layer variation):

```typescript
effect("test with custom layer", () =>
  Effect.gen(function* () {
    const service = yield* MyService
    const result = yield* service.doSomething()
    strictEqual(result, expected)
  }).pipe(
    Effect.provide(CustomLayer)  // Only acceptable when Layer varies per test
  )
)
```

**Rule of thumb**: If 2+ tests use the same Layer, use `layer()` utility.

---

## Effect Array Operations

**ALWAYS use Effect array helpers for operations involving Effects.**

### Sequential vs Parallel Execution

```typescript
// Sequential processing
yield* A.forEach(items, Effect.fn(function* (item: ItemType) {
  yield* processItem(item)
}))

// Parallel processing with bounded concurrency
yield* Effect.forEach(
  items,
  Effect.fn(function* (item: ItemType) {
    yield* processItem(item)
  }),
  { concurrency: 5 }
)

// Parallel processing with unbounded concurrency
yield* Effect.all(
  A.map(items, (item: ItemType) => processItem(item)),
  { concurrency: "unbounded" }
)
```

### Filtering with Effects

```typescript
// Filter requiring Effect checks
const valid = yield* A.filterEffect(
  items,
  Effect.fn(function* (item: ItemType) {
    const isValid = yield* validateItem(item)
    return isValid
  })
)
```

### Finding with Effects

```typescript
// Find first matching item
const found = yield* A.findFirst(
  items,
  Effect.fn(function* (item: ItemType) {
    const matches = yield* checkCondition(item)
    return matches
  })
)

// Handle Option result
if (O.isSome(found)) {
  const item = found.value
  // Use item
}
```

---

## Time-Dependent Tests

**ALWAYS use TestClock for time-dependent operations.**

### Fork → Adjust → Join Pattern

```typescript
effect("completes after delay", Effect.fn(function* () {
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
}))
```

### Cache TTL Pattern

```typescript
scoped("expires cache after TTL", Effect.fn(function* () {
  const cache = yield* Cache.make({
    capacity: 100,
    timeToLive: Duration.seconds(1)
  })

  yield* cache.set("key", "value")
  assertSome(yield* cache.get("key"), "value")

  yield* TestClock.adjust(Duration.seconds(2))
  assertNone(yield* cache.get("key"))
}))
```

---

## Test File Organization

### Directory Structure - MANDATORY

```
packages/example/
├── src/
│   ├── services/UserService.ts
│   └── utils/validation.ts
└── test/                         # All tests here
    ├── services/UserService.test.ts
    └── utils/validation.test.ts
```

**NEVER place tests inline with source files.**

### Import Paths - NO RELATIVE IMPORTS

```typescript
// FORBIDDEN
import { UserService } from "../src/services/UserService"

// REQUIRED - path aliases
import { UserService } from "@beep/iam-server/services/UserService"
```

---

## Common Pitfalls

### Pitfall 1: Arrow Function in Test Body

```typescript
// WRONG
effect("test", () =>
  Effect.gen(function* () {
    const result = yield* someEffect()  // Type: unknown
  })
)

// CORRECT
effect("test", Effect.fn(function* () {
  const result = yield* someEffect()  // Proper type inference
}))
```

### Pitfall 2: Missing Type Annotation in Callback

```typescript
// WRONG
const found = yield* A.findFirst(items, (item) => item.isValid)  // item: unknown

// CORRECT
const found = yield* A.findFirst(items, (item: ItemType) => item.isValid)
```

### Pitfall 3: Individual Layer Provision

```typescript
// WRONG - Expensive Layer reconstruction per test
effect("test 1", () => Effect.gen(...).pipe(Effect.provide(TestLayer)))
effect("test 2", () => Effect.gen(...).pipe(Effect.provide(TestLayer)))

// CORRECT - Shared Layer runtime
layer(TestLayer)("suite", (it) => {
  it.effect("test 1", Effect.fn(...))
  it.effect("test 2", Effect.fn(...))
})
```

### Pitfall 4: Missing Effect Context Type

```typescript
// WRONG - Test declares Effect<void, unknown, unknown> but uses services
effect("test", Effect.fn(function* () {
  const service = yield* MyService  // Requires MyService context
}))

// CORRECT - Provide Layer with required services
layer(TestLayer)("suite", (it) => {
  it.effect("test", Effect.fn(function* () {
    const service = yield* MyService
  }))
})
```

---

## Verification Commands

After writing tests, verify with:

```bash
# Type check
bun run check --filter @beep/package-name

# Run tests
bun run test --filter @beep/package-name

# Lint
bun run lint:fix --filter @beep/package-name
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `.claude/commands/patterns/effect-testing-patterns.md` | Comprehensive test patterns and examples |
| `tooling/testkit/README.md` | Complete testkit API reference |
| `tooling/testkit/AGENTS.md` | testkit usage guide for agents |
| `.claude/rules/effect-patterns.md` | Core Effect patterns (imports, schemas, etc.) |

---

## Quick Checklist

Before submitting tests, verify:

- [ ] Using `@beep/testkit` runners (NOT raw `bun:test`)
- [ ] Using `Effect.fn(function* () {...})` for test bodies and callbacks
- [ ] Using `layer()` utility for shared test layers
- [ ] Added explicit type annotations in array operation callbacks
- [ ] Using TestClock for time-dependent tests
- [ ] Tests in `./test` directory (NOT inline with source)
- [ ] Using path aliases (NOT relative imports)
- [ ] All tests pass locally
- [ ] Type check passes (`bun run check`)
