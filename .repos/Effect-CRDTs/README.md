# Effect-CRDTs

Effectful CRDTs (Conflict-free Replicated Data Types) using Effect's STM and VectorClock for causal consistency.

## Overview

Effect-CRDTs provides a collection of production-ready CRDT implementations built on top of the Effect ecosystem. All operations are transactional (using STM), composable, and designed for distributed systems that require strong eventual consistency.

## Features

- **Transactional Operations**: All CRDT operations use STM for atomic, composable updates
- **Vector Clock Causality**: Proper causal ordering using VectorClock (not just timestamps)
- **Type-Safe**: Full TypeScript support with Effect's type system
- **Pluggable Persistence**: Abstract persistence layer with Schema-based serialization
- **Dependency Injection**: Context-based service design using Effect Layers
- **Property-Based Testing**: Verified CRDT laws (commutativity, associativity, idempotence)
- **Dual APIs**: All operations support data-first and pipeable styles

## Installation

```bash
npm install effect-crdts effect
```

## Implemented CRDTs

### Counters

- **GCounter** (Grow-only Counter): Increment-only counter for distributed counting
- **PNCounter** (Positive-Negative Counter): Counter supporting both increment and decrement

### Sets

- **GSet** (Grow-only Set): Add-only set with union-based merge
- **TwoPSet** (Two-Phase Set): Add and remove with tombstones (elements cannot be re-added)
- **ORSet** (Observed-Remove Set): Add and remove with unique tags (supports re-adding elements)

### Registers

- **LWWRegister** (Last-Write-Wins Register): Single-value register with VectorClock-based conflict resolution
- **MVRegister** (Multi-Value Register): Preserves concurrent writes, application resolves conflicts

### Maps

- **LWWMap** (Last-Write-Wins Map): Key-value map with per-key VectorClock tracking

### Infrastructure

- **VectorClock**: Causal ordering tracking with Before/After/Equal/Concurrent semantics

## Quick Start

### GCounter Example

```typescript
import * as Effect from "effect/Effect"
import { GCounter, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const counter = yield* GCounter.Tag

  // Increment the counter (STM operations auto-commit when yielded)
  yield* GCounter.increment(counter, 5)
  yield* GCounter.increment(counter, 3)

  // Get the current value
  const value = yield* GCounter.value(counter)
  console.log("Counter value:", value) // 8
})

// Run with a layer providing the GCounter service
Effect.runPromise(
  program.pipe(Effect.provide(GCounter.Live(ReplicaId("replica-1"))))
)
```

### Multi-Replica Synchronization

```typescript
import * as Effect from "effect/Effect"
import { GCounter, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  // Create two replicas
  const replica1 = yield* GCounter.make(ReplicaId("replica-1"))
  const replica2 = yield* GCounter.make(ReplicaId("replica-2"))

  // Each replica increments independently
  yield* GCounter.increment(replica1, 10)
  yield* GCounter.increment(replica2, 20)

  // Synchronize replicas by merging state
  const state2 = yield* GCounter.query(replica2)
  yield* GCounter.merge(replica1, state2)

  // Both replicas now converge to the same value
  const value = yield* GCounter.value(replica1)
  console.log("Converged value:", value) // 30
})

Effect.runPromise(program)
```

### TwoPSet (Two-Phase Set)

```typescript
import * as Effect from "effect/Effect"
import { TwoPSet, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const set = yield* TwoPSet.make<string>(ReplicaId("replica-1"))

  // Add elements
  yield* TwoPSet.add(set, "apple")
  yield* TwoPSet.add(set, "banana")

  // Remove an element (creates tombstone)
  yield* TwoPSet.remove(set, "apple")

  // Check membership
  const hasApple = yield* TwoPSet.has(set, "apple")
  console.log("Has apple:", hasApple) // false

  // Cannot re-add removed elements
  yield* TwoPSet.add(set, "apple")
  const stillHasApple = yield* TwoPSet.has(set, "apple")
  console.log("Still has apple:", stillHasApple) // false (tombstone prevents re-add)

  const values = yield* TwoPSet.values(set)
  console.log("Values:", values) // ["banana"]
})

Effect.runPromise(program)
```

### ORSet (Observed-Remove Set)

```typescript
import * as Effect from "effect/Effect"
import { ORSet, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const set = yield* ORSet.make<string>(ReplicaId("replica-1"))

  // Add, remove, and re-add (unlike TwoPSet!)
  yield* ORSet.add(set, "apple")
  yield* ORSet.remove(set, "apple")
  yield* ORSet.add(set, "apple") // This works!

  const hasApple = yield* ORSet.has(set, "apple")
  console.log("Has apple:", hasApple) // true

  // Multiple concurrent adds create multiple tags
  const values = yield* ORSet.values(set)
  console.log("Values:", values) // ["apple"]
})

Effect.runPromise(program)
```

### LWWRegister (Last-Write-Wins Register)

```typescript
import * as Effect from "effect/Effect"
import { LWWRegister, VectorClock, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  // Create two registers
  const reg1 = yield* LWWRegister.make<string>(ReplicaId("replica-1"))
  const reg2 = yield* LWWRegister.make<string>(ReplicaId("replica-2"))

  // Write to both independently
  yield* LWWRegister.set(reg1, "value1")
  yield* LWWRegister.set(reg2, "value2")

  // Merge - causal ordering determines winner
  const state2 = yield* LWWRegister.query(reg2)
  yield* LWWRegister.merge(reg1, state2)

  const value = yield* LWWRegister.get(reg1)
  console.log("Merged value:", value) // Concurrent writes resolved by replica ID
})

Effect.runPromise(
  program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test"))))
)
```

### MVRegister (Multi-Value Register)

```typescript
import * as Effect from "effect/Effect"
import { MVRegister, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const reg1 = yield* MVRegister.make<string>(ReplicaId("replica-1"))
  const reg2 = yield* MVRegister.make<string>(ReplicaId("replica-2"))

  // Concurrent writes
  yield* MVRegister.set(reg1, "apple")
  yield* MVRegister.set(reg2, "banana")

  // Merge preserves both concurrent values
  const state2 = yield* MVRegister.query(reg2)
  yield* MVRegister.merge(reg1, state2)

  const values = yield* MVRegister.get(reg1)
  console.log("Values:", values) // ["apple", "banana"] - application resolves
})

Effect.runPromise(program)
```

### LWWMap (Last-Write-Wins Map)

```typescript
import * as Effect from "effect/Effect"
import { LWWMap, VectorClock, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const map = yield* LWWMap.make<string, number>(ReplicaId("replica-1"))

  // Set key-value pairs
  yield* LWWMap.set(map, "count", 42)
  yield* LWWMap.set(map, "score", 100)

  // Get a value
  const count = yield* LWWMap.get(map, "count")
  console.log("Count:", count) // Some(42)

  // Delete (creates tombstone)
  yield* LWWMap.delete_(map, "score")

  // Get all keys (filters tombstones)
  const keys = yield* LWWMap.keys(map)
  console.log("Keys:", keys) // ["count"]
})

Effect.runPromise(
  program.pipe(Effect.provide(VectorClock.Live(ReplicaId("test"))))
)
```

## VectorClock: Proper Causal Ordering

Unlike physical clocks, VectorClock provides true causal ordering:

```typescript
import * as Effect from "effect/Effect"
import { VectorClock, ReplicaId } from "effect-crdts"

const program = Effect.gen(function* () {
  const clock1 = yield* VectorClock.make(ReplicaId("replica-1"))
  const clock2 = yield* VectorClock.make(ReplicaId("replica-2"))

  // Increment clocks
  yield* VectorClock.increment(clock1)
  yield* VectorClock.increment(clock1)

  yield* VectorClock.increment(clock2)

  // Compare for causal ordering
  const state1 = yield* VectorClock.query(clock1)
  const state2 = yield* VectorClock.query(clock2)

  const ordering = VectorClock.compare(state1, state2)
  console.log("Ordering:", ordering) // "Concurrent" (neither happened before the other)

  // Merge clocks
  yield* VectorClock.merge(clock1, state2)

  const merged = yield* VectorClock.query(clock1)
  console.log("Merged:", merged.counters) // Max of both: {replica-1: 2, replica-2: 1}
})

Effect.runPromise(program)
```

## CRDT Laws

All CRDTs in this library satisfy the mathematical properties required for strong eventual consistency:

### Commutativity
```
merge(a, b) = merge(b, a)
```
Order of merging doesn't matter.

### Associativity
```
merge(merge(a, b), c) = merge(a, merge(b, c))
```
Grouping of merges doesn't matter.

### Idempotence
```
merge(a, a) = a
```
Merging the same state multiple times has no effect.

These properties are verified using property-based testing with `fast-check`.

## Architecture

### STM Integration

All CRDT operations return `STM.STM<T>`, making them:
- **Atomic**: Operations either complete fully or not at all
- **Composable**: Can be combined with other STM operations
- **Retryable**: Automatic retry on conflicts
- **Auto-commit**: When yielded in `Effect.gen`, STM operations automatically commit

```typescript
// STM operations auto-commit when yielded in Effect.gen
const program = Effect.gen(function* () {
  const counter = yield* GCounter.make(ReplicaId("replica-1"))

  // Each yield auto-commits (3 separate transactions)
  yield* GCounter.increment(counter, 1)
  yield* GCounter.increment(counter, 2)
  yield* GCounter.increment(counter, 3)

  return yield* GCounter.value(counter) // 6
})
```

### VectorClock vs Timestamps

**Why VectorClock over physical clocks?**

VectorClock provides proper distributed systems semantics:
- Detects causal relationships (A happened before B)
- Identifies concurrent operations (neither happened before the other)
- No reliance on synchronized physical clocks
- Correct conflict resolution for CRDTs

```typescript
// Concurrent writes with VectorClock
const reg1 = yield* LWWRegister.make(ReplicaId("r1"))
const reg2 = yield* LWWRegister.make(ReplicaId("r2"))

yield* LWWRegister.set(reg1, "value1") // [r1: 1]
yield* LWWRegister.set(reg2, "value2") // [r2: 1]

// These are CONCURRENT (not timestamp-ordered)
// Conflict resolved by replica ID tie-breaking
```

### Persistence Abstraction

CRDTs support Schema-based persistence with automatic serialization:

```typescript
import { LWWRegister, ReplicaId } from "effect-crdts"
import * as Schema from "effect/Schema"

// Persist register with custom value type
const program = Effect.gen(function* () {
  const RegisterTag = Context.GenericTag<LWWRegister.LWWRegister<User>>("UserRegister")

  const register = yield* RegisterTag

  yield* LWWRegister.set(register, { name: "Alice", age: 30 })
})

// Provide persistence layer
Effect.runPromise(
  program.pipe(
    Effect.provide(
      LWWRegister.withPersistence(
        RegisterTag,
        ReplicaId("replica-1"),
        Schema.Struct({ name: Schema.String, age: Schema.Number })
      )
    )
  )
)
```

### Dual APIs

All operations support both data-first and pipeable styles:

```typescript
import { pipe } from "effect/Function"

// Data-first
yield* GCounter.increment(counter, 5)

// Data-last (pipeable)
yield* pipe(counter, GCounter.increment(5))
```

## Testing

```bash
# Run all tests
bun test

# Run specific CRDT tests
bun test src/GCounter.test.ts
bun test src/ORSet.test.ts
bun test src/MVRegister.test.ts

# Type check
bunx tsc --noEmit
```

### Test Coverage

- **179 tests passing**
- **1,210+ assertions**
- Property-based CRDT law verification for all implementations
- Concurrent operation scenarios
- Merge conflict resolution tests

## Examples

See the `examples/` directory for comprehensive examples:

- `counter.ts`: Counter CRDT usage patterns
- `collaborative-counter.ts`: Multi-replica coordination
- `sync.ts`: State synchronization patterns
- `distributed-shopping-cart.ts`: OR-Set practical application
- `persistent-analytics.ts`: Persistence with GCounter

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Run tests
bun test

# Type check
bunx tsc --noEmit
```

## Project Structure

```
src/
├── CRDT.ts                 # Core CRDT interfaces and types
├── Persistence.ts          # Persistence abstraction
├── VectorClock.ts          # Causal ordering infrastructure
├── GCounter.ts             # Grow-only counter
├── PNCounter.ts            # Positive-negative counter
├── GSet.ts                 # Grow-only set
├── TwoPSet.ts              # Two-phase set
├── ORSet.ts                # Observed-remove set
├── LWWRegister.ts          # Last-write-wins register
├── MVRegister.ts           # Multi-value register
├── LWWMap.ts               # Last-write-wins map
├── CRDTCounter.ts          # Counter state schemas
├── CRDTSet.ts              # Set state schemas
├── CRDTRegister.ts         # Register state schemas
├── CRDTMap.ts              # Map state schemas
└── internal/               # Internal utilities

test/ (embedded in src/)
├── *.test.ts               # Unit tests with law verification

examples/                   # Usage examples
```

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`bun test`)
2. New CRDTs include property-based law tests
3. Code follows Effect patterns and best practices
4. Use VectorClock for causal ordering (not physical timestamps)
5. Remove unnecessary `STM.commit()` wrappers (auto-commit in Effect.gen)
6. Documentation is updated

## Roadmap

- [x] Core counters (GCounter, PNCounter)
- [x] Core sets (GSet, TwoPSet, ORSet)
- [x] Registers (LWWRegister, MVRegister)
- [x] Maps (LWWMap)
- [x] VectorClock infrastructure
- [ ] RGA (Replicated Growable Array) for ordered sequences
- [ ] ORMap (Observed-Remove Map)
- [ ] Delta-state CRDT optimization
- [ ] Network synchronization protocols
- [ ] More persistence adapters (IndexedDB, SQLite, etc.)
- [ ] Benchmarks and performance testing
- [ ] Merkle trees for efficient sync

## License

MIT

## References

- [A comprehensive study of CRDTs](https://hal.inria.fr/hal-01248191v1/document)
- [Conflict-free Replicated Data Types](https://crdt.tech/)
- [Effect Documentation](https://effect.website/)
