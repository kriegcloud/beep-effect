# Testing Patterns Analysis - effect-smol

**Analysis Date:** 2026-02-18
**Repository:** `.repos/effect-smol`

## Overview

This document captures the comprehensive testing patterns and conventions observed in the effect-smol repository, which serves as the canonical reference for Effect v4 testing practices.

## Test File Organization

### Structure
- **Dedicated test directories**: Tests are organized in `test/` directories at package level (e.g., `packages/effect/test/`)
- **No co-located tests**: Tests are NOT placed alongside source files
- **No `__tests__` directories**: The convention is `test/` not `__tests__/`
- **Hierarchical structure**: Test directories mirror module structure with subdirectories (e.g., `test/schema/`, `test/unstable/`)
- **201 total test files** across all packages

### Directory Pattern
```
packages/effect/
├── src/
│   └── [source files]
└── test/
    ├── Array.test.ts
    ├── Effect.test.ts
    ├── schema/
    │   └── Schema.test.ts
    └── utils/
        └── [test utilities]
```

## Testing Framework

### Primary Tools
- **Vitest** (v4.0.18) - Primary test runner
- **@effect/vitest** - Custom Effect integration package extending Vitest
- **tstyche** - Type-level testing (separate from runtime tests)

### Test File Naming
- Runtime tests: `*.test.ts` (NOT `.spec.ts`)
- Type tests: `*.tst.ts` (located in `dtslint/` directories)
- Examples: `Array.test.ts`, `Effect.test.ts`, `Option.test.ts`

## Test Structure Patterns

### Standard Test Organization
```typescript
import { describe, it } from "@effect/vitest"
import { assert, deepStrictEqual, strictEqual } from "@effect/vitest/utils"

describe("Module", () => {
  describe("feature group", () => {
    it("specific behavior", () => {
      // assertions
    })
  })
})
```

### Effect-Based Tests

#### Test Function Types
1. **it.effect** - For Effect-based tests with TestContext
2. **it.live** - For tests using live environment (real clock, etc.)
3. **it.effect.prop** - For property-based testing with Effects
4. **it.layer** - For testing with shared Layer context

#### Basic Effect Test
```typescript
it.effect("test name", () =>
  Effect.gen(function*() {
    const result = yield* someEffect
    assert.strictEqual(result, expected)
  })
)
```

#### Using Test Services
```typescript
it.effect("with TestClock", () =>
  Effect.gen(function*() {
    yield* TestClock.adjust(Duration.millis(1000))
    const result = yield* someTimeDependentEffect
    assert.strictEqual(result, expected)
  })
)
```

#### Layer-Based Testing
```typescript
layer(SomeService.Live)((it) => {
  it.effect("test with layer", () =>
    Effect.gen(function*() {
      const service = yield* SomeService
      assert.strictEqual(service.value, "expected")
    })
  )
})
```

## Testing Utilities and Helpers

### Custom Assertion Helpers
From `test/utils/assert.ts`:

```typescript
// Option assertions
assertSome(option, expectedValue)
assertNone(option)

// Result assertions
assertSuccess(result, expectedValue)
assertFailure(result, expectedError)

// Exit assertions
assertExitSuccess(exit, expectedValue)
assertExitFailure(exit, expectedCause)

// Effect-specific
assertEquals(actual, expected) // Uses Equal.equals
assertTrue(value)
assertFalse(value)
```

### Specialized Test Utilities
- `test/utils/counter.ts` - Helper for testing resource acquisition/release
- `test/utils/chunkCoordination.ts` - Stream coordination for testing

## Property-Based Testing

### FastCheck Integration
```typescript
import { FastCheck as fc } from "effect/testing"

it.effect.prop(
  "test name",
  [fc.integer(), fc.string()],
  ([num, str]) =>
    Effect.gen(function*() {
      // test implementation
      return someBoolean
    }),
  { fastCheck: { numRuns: 200 } }
)
```

## Schema Testing

### TestSchema Utilities
```typescript
import { TestSchema } from "effect/testing"

const asserts = new TestSchema.Asserts(schema)

const decoding = asserts.decoding()
await decoding.succeed(validInput)
await decoding.fail(invalidInput, "Expected error message")

const encoding = asserts.encoding()
await encoding.succeed(validOutput)
```

## Mock/Stub Patterns

Effect uses **Service-based dependency injection** rather than traditional mocking:

### Patterns
1. **Layer-based substitution**: Replace services via Layer composition
2. **Test implementations**: Create test versions of services
3. **ServiceMap**: Use Effect's built-in service system

### Example
```typescript
class TestService extends ServiceMap.Service("TestService")<TestService, string>() {
  static Live = Layer.succeed(TestService)("test-value")
}
```

## Test Setup and Teardown

### Global Setup
- `vitest.setup.ts` - Adds equality testers via `addEqualityTesters()`
- `vitest.shared.ts` - Shared configuration for all packages

### Per-Test Setup
Using Effect's resource management:
```typescript
it.effect("with resource", () =>
  Effect.gen(function*() {
    const resource = yield* Effect.acquireRelease(
      acquire,
      () => release
    )
    // test using resource
  })
)
```

## Configuration Files

### Root vitest.config.ts
```typescript
export default defineConfig({
  test: {
    projects: [
      "packages/*/vitest.config.ts",
      "packages/ai/*/vitest.config.ts",
      // ... more patterns
    ]
  }
})
```

### Shared vitest.shared.ts
```typescript
{
  test: {
    setupFiles: ["vitest.setup.ts"],
    fakeTimers: { toFake: undefined },
    sequence: { concurrent: true },
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["html"],
      exclude: [
        "node_modules/",
        "dist/",
        "test/utils/",
        "**/*.d.ts",
        "**/*.config.*"
      ]
    }
  }
}
```

### Type Testing (tstyche.config.json)
```json
{
  "testFileMatch": ["packages/*/dtslint/**/*.tst.*"],
  "tsconfig": "ignore"
}
```

## Coverage Configuration

- **Provider**: v8
- **Reporter**: HTML
- **Exclusions**: node_modules, dist, test utilities, type definitions, config files
- **Directory**: `coverage/` at package level

## Test Execution Patterns

### Test Modifiers
- `it.effect.skip()` - Skip test
- `it.effect.only()` - Run only this test
- `it.effect.skipIf(condition)` - Conditional skip
- `it.effect.runIf(condition)` - Conditional run
- `it.effect.fails()` - Expect test to fail
- `it.effect.each([...])` - Parameterized tests

### Concurrent Testing
Tests run concurrently by default (`sequence: { concurrent: true }`)

## Type-Level Testing

Separate from runtime tests, using tstyche:

```typescript
import { describe, expect, it } from "tstyche"

describe("Types", () => {
  it("extracts type correctly", () => {
    expect<ExtractedType>().type.toBe<ExpectedType>()
  })
})
```

## Best Practices Observed

1. **Effect.gen pattern** - All Effect tests use generator syntax
2. **Scoped resources** - Proper resource management with acquire/release
3. **Test isolation** - Each test manages its own context
4. **Descriptive names** - Test names describe exact behavior
5. **Nested describe blocks** - Logical grouping of related tests
6. **No shared mutable state** - Tests don't rely on order
7. **TestClock for time** - Use TestClock instead of real delays
8. **Layer composition** - Services provided via Layers
9. **Property testing** - Critical properties verified with FastCheck
10. **Schema validation** - Schemas tested with TestSchema utilities

## Key Takeaways for @beep/repo-cli

When creating test templates for new packages:
- Use `test/` directory structure
- Name files `*.test.ts`
- Use `@effect/vitest` as the testing framework
- Provide test utilities in `test/utils/`
- Configure coverage with v8 provider
- Use Effect-native patterns (it.effect, Layer-based testing)
- Include property-based testing setup
- Configure concurrent test execution
