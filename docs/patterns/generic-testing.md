# Generic Testing Patterns

This document describes general testing patterns used in the project with @effect/vitest and Effect ecosystem testing approaches.

## Core Testing Framework Pattern

### 1. @effect/vitest Integration

```typescript
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"

describe("Feature Name", () => {
  it.effect("should do something", () =>
    Effect.gen(function* () {
      const result = yield* someEffectOperation()
      assert.strictEqual(result, expectedValue)
    })
  )
})
```

**Key Elements:**
- **Import from @effect/vitest**: `assert`, `describe`, `it` for Effect-aware testing
- **it.effect()**: Special test function for Effect-based tests
- **Effect.gen()**: Generator-based Effect composition
- **assert methods**: Use `assert.*` instead of `expect` for Effect tests

### 2. Effect Test Structure Pattern

```typescript
it.effect("descriptive test name", () =>
  Effect.gen(function* () {
    // Arrange: Set up test data/state
    const input = "test data"
    
    // Act: Perform the operation
    const result = yield* operationUnderTest(input)
    
    // Assert: Verify the outcome
    assert.strictEqual(result, "expected output")
  })
)
```

**Structure Benefits:**
- **Effect Composition**: Natural Effect chaining with generators
- **Error Handling**: Automatic Effect error propagation
- **Type Safety**: Full TypeScript integration with Effect types

## Service Mocking Pattern

### 1. Mock Service Creation

```typescript
export const createMockConsole = () => {
  const messages: Array<string> = []

  // Unsafe implementation (plain functions)
  const unsafeConsole: Console.UnsafeConsole = {
    log: (...args: ReadonlyArray<any>) => {
      messages.push(args.join(" "))
    },
    error: (...args: ReadonlyArray<any>) => {
      messages.push(`error: ${args.join(" ")}`)
    },
    // ... all console methods
  }

  // Effect wrapper (Effect-based interface)
  const mockConsole: Console.Console = {
    [Console.TypeId]: Console.TypeId,
    log: (...args: ReadonlyArray<any>) => 
      Effect.sync(() => unsafeConsole.log(...args)),
    error: (...args: ReadonlyArray<any>) => 
      Effect.sync(() => unsafeConsole.error(...args)),
    // ... all console methods
    unsafe: unsafeConsole
  }

  return { mockConsole, messages }
}
```

**Mock Service Pattern:**
1. **State Capture**: Array/object to capture calls and data
2. **Dual Interface**: Both unsafe and Effect-based implementations
3. **Type Safety**: Implement complete service interface
4. **Test Utilities**: Return both mock and captured data

### 2. Service Interface Implementation

```typescript
const mockConsole: Console.Console = {
  [Console.TypeId]: Console.TypeId,              // ← Type identifier
  log: (...args) => Effect.sync(() => ...),     // ← Effect wrapper
  unsafe: unsafeConsole                          // ← Direct access
}
```

**Implementation Requirements:**
- **Complete Interface**: Implement every method from service interface
- **Type Identifier**: Include service type ID for runtime identification
- **Effect Integration**: Wrap unsafe operations in `Effect.sync()`
- **Unsafe Access**: Provide direct access for performance-critical operations

## Test Data Management Pattern

### 1. Captured Data Pattern

```typescript
export const createMockConsole = () => {
  const messages: Array<string> = []    // ← Captured data

  const unsafeConsole = {
    log: (...args) => {
      messages.push(args.join(" "))     // ← Capture call
    }
  }

  return { mockConsole, messages }      // ← Return both mock and data
}
```

**Data Capture Benefits:**
- **Inspection**: Tests can verify what was called
- **Debugging**: Easy to see what happened during test execution
- **Assertions**: Test can assert on captured data

### 2. Test State Management

```typescript
describe("Console Testing", () => {
  const { mockConsole, messages } = createMockConsole()

  it.effect("should capture log messages", () =>
    Effect.gen(function* () {
      yield* Console.log("test message").pipe(
        Effect.provide(Console.setConsole(mockConsole))
      )
      
      assert.strictEqual(messages.length, 1)
      assert.strictEqual(messages[0], "test message")
    })
  )
})
```

**State Management Principles:**
- **Per-Test State**: Each test gets clean mock state
- **Service Provision**: Provide mock via Effect service system
- **Assertion Access**: Test code can inspect captured state

## Effect Service Testing Pattern

### 1. Service Provision in Tests

```typescript
it.effect("should use provided service", () =>
  Effect.gen(function* () {
    yield* Console.log("test")
  }).pipe(
    Effect.provide(Console.setConsole(mockConsole))  // ← Provide mock service
  )
)
```

**Service Provision Methods:**
- **Effect.provide()**: Provide service implementation to Effect
- **Layer-based**: Use layers for complex service dependencies
- **Direct provision**: Simple service replacement

### 2. Service Replacement Pattern

```typescript
// Replace default service with mock
Effect.provide(Console.setConsole(mockConsole))

// Replace default with custom implementation
Effect.provide(Logger.replace(Logger.defaultLogger, testLogger))

// Add service instance
Effect.provide(Logger.add(Logger.defaultLogger))
```

## Assertion Patterns

### 1. Effect-Specific Assertions

```typescript
import { assert } from "@effect/vitest"

// Value assertions
assert.strictEqual(actual, expected)
assert.deepStrictEqual(actualObject, expectedObject)

// Boolean assertions  
assert.isTrue(condition)
assert.isFalse(condition)

// Existence assertions
assert.isDefined(value)
assert.isUndefined(value)
```

**Assertion Guidelines:**
- **Use assert, not expect**: @effect/vitest provides assert methods
- **Type-safe**: Assertions work with Effect type system
- **Clear Messages**: Provide descriptive failure messages

### 2. Error Testing Pattern

```typescript
it.effect("should handle errors", () =>
  Effect.gen(function* () {
    const result = yield* Effect.flip(failingOperation())
    assert.isTrue(result instanceof ExpectedError)
  })
)
```

**Error Testing Approaches:**
- **Effect.flip()**: Convert failure to success for testing
- **Effect.either()**: Get Either<Error, Success> for pattern matching  
- **Try/Catch with Effects**: Use Effect error handling patterns

## Test Organization Patterns

### 1. Describe Block Structure

```typescript
describe("Feature/Module Name", () => {
  // Setup shared across tests
  const sharedResource = createSharedResource()
  
  describe("specific functionality", () => {
    // Nested describe for grouping related tests
    
    it.effect("should handle normal case", () => ...)
    it.effect("should handle error case", () => ...)
  })
})
```

**Organization Benefits:**
- **Logical Grouping**: Related tests grouped together
- **Shared Setup**: Common resources defined once
- **Clear Hierarchy**: Easy to understand test structure

### 2. Test Naming Convention

```typescript
// ✅ Good: Descriptive and specific
it.effect("GET /healthz returns 200 status with success message", () => ...)
it.effect("should capture console messages in test environment", () => ...)

// ❌ Poor: Vague or implementation-focused
it.effect("test endpoint", () => ...)
it.effect("should work", () => ...)
```

**Naming Guidelines:**
- **Behavior-focused**: Describe what the system should do
- **Specific**: Include key details (HTTP method, expected outcome)
- **Action + Result**: What action produces what result

## Test Utility Patterns

### 1. Factory Functions for Test Resources

```typescript
export const createMockConsole = () => {
  // Resource creation logic
  return { mockConsole, messages }
}

export const createTestData = () => {
  return {
    validUser: { id: 1, name: "Test User" },
    invalidUser: { id: -1, name: "" }
  }
}
```

**Factory Benefits:**
- **Reusability**: Same setup across multiple tests
- **Consistency**: Standardized test data/mocks
- **Encapsulation**: Hide complex setup logic

### 2. Test Helper Functions

```typescript
const waitFor = (condition: () => boolean, timeout = 1000) =>
  Effect.gen(function* () {
    const start = Date.now()
    while (!condition() && Date.now() - start < timeout) {
      yield* Effect.sleep("10 millis")
    }
    if (!condition()) {
      yield* Effect.fail(new Error("Condition not met within timeout"))
    }
  })
```

## Environment-Specific Testing

### 1. Test vs Production Separation

```typescript
// Test environment detection
const isTest = process.env.NODE_ENV === "test"

// Test-specific configuration
const testConfig = {
  port: 0,           // Random port
  logLevel: "silent", // Reduce test output
  timeout: 5000      // Shorter timeouts
}
```

### 2. Resource Cleanup Pattern

```typescript
describe("Resource Tests", () => {
  let resource: SomeResource
  
  beforeEach(() => {
    resource = createResource()
  })
  
  afterEach(() => {
    resource.cleanup()
  })
  
  it.effect("should use resource", () => 
    Effect.gen(function* () {
      yield* useResource(resource)
    })
  )
})
```

## Best Practices

### 1. Test Independence
- **No Shared State**: Each test should be independent
- **Clean Mocks**: Reset mocks between tests
- **Isolated Resources**: Tests shouldn't affect each other

### 2. Effect Integration
- **Use it.effect()**: For any test that uses Effect operations
- **Effect.gen()**: For readable async test code
- **Service provision**: Use Effect service system for dependencies

### 3. Assertion Quality
- **Specific Assertions**: Test exact values, not just truthiness
- **Multiple Assertions**: Verify all important aspects
- **Good Error Messages**: Make test failures easy to understand

### 4. Test Coverage
- **Happy Path**: Test normal successful operations
- **Error Cases**: Test failure scenarios
- **Edge Cases**: Test boundary conditions and unusual inputs

This testing approach provides reliable, maintainable tests that integrate well with the Effect ecosystem while maintaining excellent error handling and type safety.