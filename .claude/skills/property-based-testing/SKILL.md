# Property-Based Testing with Effect Schema

## Overview

Property-based testing with Effect Schema generates random test data that adheres to schema constraints using the `Arbitrary` module and fast-check library. This approach allows you to test properties that should hold for all valid inputs rather than writing specific examples.

## When to Use This Skill

Use property-based testing when:
- Testing mathematical properties (commutativity, associativity, idempotence)
- Testing CRDT laws (convergence, monotonicity, idempotence)
- Verifying type transformations preserve invariants
- Testing serialization/deserialization roundtrips
- Verifying business rules across a wide input space
- Testing edge cases that are hard to think of manually

## Core Concepts

### 1. Arbitrary Generation from Schema

The `Arbitrary.make` function creates a fast-check `Arbitrary<A>` from a `Schema<A, I, R>`:

```typescript
import { Arbitrary, FastCheck, Schema } from "effect"

// Define a schema with constraints
const Person = Schema.Struct({
  name: Schema.NonEmptyString,
  age: Schema.Int.pipe(Schema.between(1, 80))
})

// Create an Arbitrary from the schema
const personArb = Arbitrary.make(Person)

// Generate random samples
console.log(FastCheck.sample(personArb, 5))
```

### 2. Using @effect/vitest for Property Testing

The `@effect/vitest` package provides `it.prop` for property-based testing:

```typescript
import { describe, it } from "@effect/vitest"
import { Schema, FastCheck } from "effect"

const realNumber = Schema.Finite.pipe(Schema.nonNaN())

// Array-based syntax
it.prop("addition is commutative",
  [realNumber, realNumber],
  ([a, b]) => a + b === b + a
)

// Object-based syntax (preferred for clarity)
it.prop("addition is commutative",
  { a: realNumber, b: realNumber },
  ({ a, b }) => a + b === b + a
)
```

### 3. Property Testing with Effects

Use `it.effect.prop` when your property test requires Effect operations:

```typescript
import { describe, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

it.effect.prop("database operations preserve data",
  { user: UserSchema },
  ({ user }) =>
    Effect.gen(function*() {
      const db = yield* Database
      yield* db.insert(user)
      const retrieved = yield* db.findById(user.id)
      return Equal.equals(user, retrieved)
    })
)
```

### 4. Mixing Schema and FastCheck Arbitraries

You can mix Schema-derived arbitraries with native fast-check arbitraries:

```typescript
it.prop("mixing schemas and arbitraries",
  {
    user: UserSchema,
    count: FastCheck.integer({ min: 0, max: 100 }),
    flag: FastCheck.boolean()
  },
  ({ user, count, flag }) => {
    // Test implementation
  }
)
```

## Best Practices

### 1. Apply Constraints in Schema Definitions

Rather than filtering after generation, build constraints into your schemas:

```typescript
// ❌ Less efficient - filtering after generation
const BadAge = Schema.Number.pipe(
  Schema.filter(n => n >= 0 && n <= 120)
)

// ✅ Better - constraints built into schema
const GoodAge = Schema.Number.pipe(
  Schema.between(0, 120),
  Schema.int()
)
```

### 2. Use Pattern Constraints for Strings

When testing string patterns, use `Schema.pattern` instead of custom filters:

```typescript
// ❌ Less efficient
const BadEmail = Schema.String.pipe(
  Schema.filter(s => /^[a-z]+@[a-z]+\.[a-z]+$/.test(s))
)

// ✅ More efficient - uses FastCheck.stringMatching
const GoodEmail = Schema.String.pipe(
  Schema.pattern(/^[a-z]+@[a-z]+\.[a-z]+$/)
)
```

### 3. Order Transformations and Filters Correctly

For consistent arbitrary generation:
1. Apply filters for the initial type (`I`)
2. Apply transformations
3. Apply filters for the transformed type (`A`)

```typescript
// ❌ Filters before transformation may be ignored
const problematic = Schema.compose(
  Schema.NonEmptyString,
  Schema.Trim
).pipe(Schema.maxLength(500))

// ✅ Apply filters after transformations
const correct = Schema.Trim.pipe(
  Schema.nonEmptyString(),
  Schema.maxLength(500)
)
```

### 4. Customize Arbitrary Generation

Use the `arbitrary` annotation to customize data generation:

```typescript
import { Arbitrary, Schema } from "effect"
import { faker } from "@faker-js/faker"

const RealisticName = Schema.String.annotations({
  arbitrary: () => (fc) =>
    fc.constant(null).map(() => faker.person.fullName())
})

const RealisticAge = Schema.Int.pipe(
  Schema.between(18, 100)
).annotations({
  arbitrary: () => (fc) =>
    fc.integer({ min: 18, max: 100 })
})
```

### 5. Configure FastCheck Options

Pass options to fast-check for control over test execution:

```typescript
it.prop(
  "expensive property test",
  { data: ComplexSchema },
  ({ data }) => {
    // Test implementation
  },
  {
    timeout: 30000,
    fastCheck: {
      numRuns: 1000,        // Run more tests
      seed: 42,             // Reproducible results
      endOnFailure: false,  // Find all failures
      verbose: true         // Show shrinking progress
    }
  }
)
```

## Testing CRDT Properties

Property-based testing is ideal for verifying CRDT laws:

### 1. Commutativity (Order Independence)

```typescript
import { it } from "@effect/vitest"
import { Schema, Effect } from "effect"

const Operation = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal("increment"), amount: Schema.Int }),
  Schema.Struct({ _tag: Schema.Literal("decrement"), amount: Schema.Int })
)

it.effect.prop("operations commute",
  { op1: Operation, op2: Operation },
  ({ op1, op2 }) =>
    Effect.gen(function*() {
      const counter1 = yield* Counter.make
      const counter2 = yield* Counter.make

      // Apply operations in different orders
      yield* Counter.apply(counter1, op1)
      yield* Counter.apply(counter1, op2)

      yield* Counter.apply(counter2, op2)
      yield* Counter.apply(counter2, op1)

      const value1 = yield* Counter.value(counter1)
      const value2 = yield* Counter.value(counter2)

      return value1 === value2
    })
)
```

### 2. Associativity (Merge Order Independence)

```typescript
it.effect.prop("merge is associative",
  {
    state1: CRDTStateSchema,
    state2: CRDTStateSchema,
    state3: CRDTStateSchema
  },
  ({ state1, state2, state3 }) =>
    Effect.gen(function*() {
      // (a ⋃ b) ⋃ c
      const left = yield* CRDT.make
      yield* CRDT.merge(left, state1)
      yield* CRDT.merge(left, state2)
      yield* CRDT.merge(left, state3)

      // a ⋃ (b ⋃ c)
      const right = yield* CRDT.make
      const temp = yield* CRDT.make
      yield* CRDT.merge(temp, state2)
      yield* CRDT.merge(temp, state3)
      const tempState = yield* CRDT.query(temp)
      yield* CRDT.merge(right, state1)
      yield* CRDT.merge(right, tempState)

      const leftValue = yield* CRDT.value(left)
      const rightValue = yield* CRDT.value(right)

      return Equal.equals(leftValue, rightValue)
    })
)
```

### 3. Idempotence (Duplicate Operations)

```typescript
it.effect.prop("operations are idempotent",
  { operation: OperationSchema },
  ({ operation }) =>
    Effect.gen(function*() {
      const crdt = yield* CRDT.make

      // Apply once
      yield* CRDT.apply(crdt, operation)
      const value1 = yield* CRDT.value(crdt)

      // Apply again
      yield* CRDT.apply(crdt, operation)
      const value2 = yield* CRDT.value(crdt)

      return Equal.equals(value1, value2)
    })
)
```

### 4. Convergence

```typescript
it.effect.prop("replicas converge after exchanging states",
  {
    operations1: Schema.Array(OperationSchema),
    operations2: Schema.Array(OperationSchema)
  },
  ({ operations1, operations2 }) =>
    Effect.gen(function*() {
      const replica1 = yield* CRDT.make(ReplicaId("r1"))
      const replica2 = yield* CRDT.make(ReplicaId("r2"))

      // Apply different operations to each replica
      yield* Effect.forEach(operations1, op => CRDT.apply(replica1, op))
      yield* Effect.forEach(operations2, op => CRDT.apply(replica2, op))

      // Exchange states
      const state1 = yield* CRDT.query(replica1)
      const state2 = yield* CRDT.query(replica2)

      yield* CRDT.merge(replica1, state2)
      yield* CRDT.merge(replica2, state1)

      // Verify convergence
      const value1 = yield* CRDT.value(replica1)
      const value2 = yield* CRDT.value(replica2)

      return Equal.equals(value1, value2)
    })
)
```

## Schemas for CRDTs

Define schemas for common CRDT types:

```typescript
import { Schema } from "effect"

// Replica ID
const ReplicaIdSchema = Schema.String.pipe(
  Schema.pattern(/^replica-[a-z0-9-]+$/),
  Schema.brand("ReplicaId")
)

// Vector Clock
const VectorClockSchema = Schema.Record({
  key: ReplicaIdSchema,
  value: Schema.Int.pipe(Schema.greaterThanOrEqualTo(0))
})

// G-Counter State
const GCounterStateSchema = Schema.Record({
  key: ReplicaIdSchema,
  value: Schema.Int.pipe(Schema.greaterThanOrEqualTo(0))
})

// LWW-Register State
const LWWRegisterStateSchema = Schema.Struct({
  value: Schema.Unknown,
  timestamp: Schema.Int.pipe(Schema.greaterThanOrEqualTo(0)),
  replicaId: ReplicaIdSchema
})

// OR-Set Element
const ORSetElementSchema = <A>(valueSchema: Schema.Schema<A>) =>
  Schema.Struct({
    value: valueSchema,
    addToken: Schema.String.pipe(Schema.uuid()),
    removeToken: Schema.Option(Schema.String.pipe(Schema.uuid()))
  })
```

## Advanced Techniques

### 1. Scoped Property Tests

Use `it.scoped.prop` when testing requires `Scope`:

```typescript
it.scoped.prop("resource cleanup",
  { data: DataSchema },
  ({ data }) =>
    Effect.gen(function*() {
      const scope = yield* Effect.scope
      const resource = yield* acquireResource(data)
      // Test with resource
      return testProperty(resource)
    })
)
```

### 2. Stateful Property Testing

Test sequences of operations:

```typescript
const CommandSchema = Schema.Union(
  Schema.Struct({ _tag: Schema.Literal("add"), value: Schema.Int }),
  Schema.Struct({ _tag: Schema.Literal("remove"), value: Schema.Int }),
  Schema.Struct({ _tag: Schema.Literal("clear") })
)

it.effect.prop("command sequence maintains invariants",
  { commands: Schema.Array(CommandSchema) },
  ({ commands }) =>
    Effect.gen(function*() {
      const state = yield* State.make

      for (const cmd of commands) {
        yield* State.execute(state, cmd)
        const invariant = yield* State.checkInvariant(state)
        if (!invariant) return false
      }

      return true
    })
)
```

### 3. Shrinking and Debugging

When a property test fails, fast-check automatically shrinks the failing input:

```typescript
// If this test fails with large arrays, fast-check will
// find the minimal failing case
it.prop("array operations",
  { items: Schema.Array(Schema.Int) },
  ({ items }) => {
    const result = processArray(items)
    return result.length === items.length
  },
  {
    fastCheck: {
      verbose: 2  // Show shrinking steps
    }
  }
)
```

## Common Patterns

### 1. Roundtrip Testing

```typescript
it.effect.prop("encode/decode roundtrip",
  { data: DomainSchema },
  ({ data }) =>
    Effect.gen(function*() {
      const encoded = yield* Schema.encode(DomainSchema)(data)
      const decoded = yield* Schema.decode(DomainSchema)(encoded)
      return Equal.equals(data, decoded)
    })
)
```

### 2. Invariant Testing

```typescript
it.effect.prop("operations preserve invariants",
  { operation: OperationSchema },
  ({ operation }) =>
    Effect.gen(function*() {
      const crdt = yield* CRDT.make
      const beforeValid = yield* CRDT.checkInvariant(crdt)

      yield* CRDT.apply(crdt, operation)

      const afterValid = yield* CRDT.checkInvariant(crdt)
      return beforeValid && afterValid
    })
)
```

### 3. Comparison Testing

Test that two implementations produce the same results:

```typescript
it.prop("optimized version matches naive version",
  { input: InputSchema },
  ({ input }) => {
    const naive = naiveImplementation(input)
    const optimized = optimizedImplementation(input)
    return Equal.equals(naive, optimized)
  }
)
```

## Testing Tips

1. **Start Simple**: Begin with basic properties before testing complex ones
2. **Use Descriptive Names**: Property test names should describe what property is being tested
3. **Test Multiple Properties**: Don't just test one property - test commutativity, associativity, idempotence, etc.
4. **Increase Test Runs**: Use `numRuns` to run more tests for critical properties
5. **Fix Seeds for Debugging**: Use `seed` option to reproduce failures
6. **Add Custom Arbitraries**: Create realistic test data with custom arbitraries and faker
7. **Document Failures**: When a property test fails, document why and add regression tests

## Complete Example

Here's a complete example testing a CRDT counter:

```typescript
import { describe, it } from "@effect/vitest"
import { Effect, Schema, Equal } from "effect"
import * as Counter from "./Counter"
import { ReplicaId } from "./CRDT"

describe("Counter CRDT Properties", () => {
  const ReplicaIdSchema = Schema.String.annotations({
    arbitrary: () => (fc) =>
      fc.constantFrom("r1", "r2", "r3", "r4", "r5")
        .map(id => ReplicaId(id))
  })

  const IncrementAmount = Schema.Int.pipe(
    Schema.between(1, 100)
  )

  it.effect.prop("increment is commutative",
    { amount1: IncrementAmount, amount2: IncrementAmount },
    ({ amount1, amount2 }) =>
      Effect.gen(function*() {
        const counter1 = yield* Counter.make(ReplicaId("r1"))
        const counter2 = yield* Counter.make(ReplicaId("r1"))

        yield* Counter.increment(counter1, amount1)
        yield* Counter.increment(counter1, amount2)

        yield* Counter.increment(counter2, amount2)
        yield* Counter.increment(counter2, amount1)

        const value1 = yield* Counter.value(counter1)
        const value2 = yield* Counter.value(counter2)

        return value1 === value2
      })
  )

  it.effect.prop("merge converges",
    {
      replica1Ops: Schema.Array(IncrementAmount),
      replica2Ops: Schema.Array(IncrementAmount)
    },
    ({ replica1Ops, replica2Ops }) =>
      Effect.gen(function*() {
        const r1 = yield* Counter.make(ReplicaId("r1"))
        const r2 = yield* Counter.make(ReplicaId("r2"))

        yield* Effect.forEach(replica1Ops, amt =>
          Counter.increment(r1, amt)
        )
        yield* Effect.forEach(replica2Ops, amt =>
          Counter.increment(r2, amt)
        )

        const state1 = yield* Counter.query(r1)
        const state2 = yield* Counter.query(r2)

        yield* Counter.merge(r1, state2)
        yield* Counter.merge(r2, state1)

        const value1 = yield* Counter.value(r1)
        const value2 = yield* Counter.value(r2)

        return value1 === value2
      }),
    {
      fastCheck: {
        numRuns: 500
      }
    }
  )

  it.effect.prop("merge is idempotent",
    { operations: Schema.Array(IncrementAmount) },
    ({ operations }) =>
      Effect.gen(function*() {
        const r1 = yield* Counter.make(ReplicaId("r1"))
        const r2 = yield* Counter.make(ReplicaId("r2"))

        yield* Effect.forEach(operations, amt =>
          Counter.increment(r2, amt)
        )

        const state = yield* Counter.query(r2)

        // Merge once
        yield* Counter.merge(r1, state)
        const value1 = yield* Counter.value(r1)

        // Merge again with same state
        yield* Counter.merge(r1, state)
        const value2 = yield* Counter.value(r1)

        return value1 === value2
      })
  )
})
```

## Resources

- [Effect Schema Documentation](https://effect.website/docs/schema/introduction)
- [fast-check Documentation](https://fast-check.dev/)
- [Effect Arbitrary API Reference](https://effect.website/docs/schema/arbitrary)
- [@effect/vitest Documentation](https://effect.website/docs/guides/testing/vitest)
