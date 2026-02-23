# CRDT Refactoring Plan: From OOP to Functional Architecture

## Objective
Refactor CRDT implementations to align with Effect's design philosophy where data structures are simple containers and all operations are functions with dual API support.

---

## Core Principles

### 1. Data vs Logic Separation
**Before (OOP):**
```typescript
interface Counter extends CRDT<CounterState> {
  readonly increment: (value?: number) => STM.STM<void>
  readonly value: STM.STM<number>
}
```

**After (Functional):**
```typescript
// Data structure (simple container)
export interface GCounter {
  readonly [GCounterTypeId]: GCounterTypeId
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>
}

// Operations (functions)
export const increment: {
  (value?: number): (self: GCounter) => STM.STM<void>
  (self: GCounter, value?: number): STM.STM<void>
}

export const value: (self: GCounter) => STM.STM<number>
```

### 2. Use Effect's Transactional Data Structures
- **TMap** instead of `Map<K, V>` for key-value storage
- **TSet** instead of `Set<A>` for set storage
- **TRef** for single values (if needed)

### 3. Dual API Pattern
Every operation should support both data-first and data-last:
```typescript
export const increment: {
  // Data-last (for pipe)
  (value?: number): (self: GCounter) => STM.STM<void>
  // Data-first (direct call)
  (self: GCounter, value?: number): STM.STM<void>
} = dual(
  (args) => isGCounter(args[0]),
  (self: GCounter, value = 1) => {
    // implementation
  }
)
```

### 4. Module Structure (Effect Standard)
Each module should organize exports by category:
```typescript
// =============================================================================
// Symbols
// =============================================================================
export const GCounterTypeId: unique symbol = Symbol.for("effect-crdts/GCounter")
export type GCounterTypeId = typeof GCounterTypeId

// =============================================================================
// Models
// =============================================================================
export interface GCounter extends GCounter.Variance {}
export declare namespace GCounter {
  export interface Variance {
    readonly [GCounterTypeId]: {
      readonly _ReplicaId: Types.Covariant<ReplicaId>
    }
  }
}

// =============================================================================
// Type Guards
// =============================================================================
export const isGCounter = (u: unknown): u is GCounter =>
  Predicate.hasProperty(u, GCounterTypeId)

// =============================================================================
// Constructors
// =============================================================================
export const make: (replicaId: ReplicaId) => STM.STM<GCounter>
export const fromState: (state: CounterState) => STM.STM<GCounter>

// =============================================================================
// Operations
// =============================================================================
export const increment: {/*...*/}
export const merge: {/*...*/}

// =============================================================================
// Getters
// =============================================================================
export const value: (self: GCounter) => STM.STM<number>
export const query: (self: GCounter) => STM.STM<CounterState>

// =============================================================================
// Layers
// =============================================================================
export const Live: (replicaId: ReplicaId) => Layer.Layer<GCounter>
```

---

## What to Keep vs Remove

### KEEP ✅
- **src/internal/proto.ts** - Update to only provide:
  - TypeId utilities
  - Pipeable support
  - Inspectable support
  - NO Equal/Hash/toJSON

```typescript
// Simplified proto.ts
export const makeProtoBase = <T>(typeId: symbol) => ({
  [typeId]: typeId,
  [NodeInspectSymbol]() {
    return format(this)
  },
  toString() {
    return format(this)
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
})
```

- **State interfaces** - Keep for persistence/serialization:
  ```typescript
  export interface CounterState {
    readonly type: "GCounter"
    readonly replicaId: ReplicaId
    readonly counts: ReadonlyMap<ReplicaId, number>
  }
  ```

- **Schema definitions** - Keep for persistence
- **ReplicaId branded type** - Keep in CRDT.ts

### REMOVE ❌
- **Base CRDT interface with methods** - No more `CRDT<State, Delta>` interface
- **Object methods** - Convert all to functions
- **Vanilla Map/Set usage** - Replace with TMap/TSet
- **Equal.Equal, Hash.Hash from CRDT interface** - Mutable containers don't implement these

### TRANSFORM 🔄
- **CRDTCounter.ts, CRDTSet.ts, CRDTMap.ts, CRDTRegister.ts**
  - Keep state type definitions
  - Remove interface extensions
  - These become pure type definition modules

---

## Effect Reference Patterns

### TMap Usage (from .context/effect/packages/effect/src/TMap.ts)

```typescript
// TMap structure (internal)
export interface TMap<K, V> {
  readonly tBuckets: TRef.TRef<TArray.TArray<Chunk.Chunk<[K, V]>>>
  readonly tSize: TRef.TRef<number>
}

// Constructor
export const empty: <K, V>() => STM.STM<TMap<K, V>>
export const make: <K, V>(...entries: Array<readonly [K, V]>) => STM.STM<TMap<K, V>>
export const fromIterable: <K, V>(iterable: Iterable<readonly [K, V]>) => STM.STM<TMap<K, V>>

// Operations (dual API)
export const set: {
  <K, V>(key: K, value: V): (self: TMap<K, V>) => STM.STM<void>
  <K, V>(self: TMap<K, V>, key: K, value: V): STM.STM<void>
}

export const get: {
  <K>(key: K): <V>(self: TMap<K, V>) => STM.STM<Option.Option<V>>
  <K, V>(self: TMap<K, V>, key: K): STM.STM<Option.Option<V>>
}

export const merge: {
  <K, V>(key: K, value: V, f: (x: V, y: V) => V): (self: TMap<K, V>) => STM.STM<V>
  <K, V>(self: TMap<K, V>, key: K, value: V, f: (x: V, y: V) => V): STM.STM<V>
}

export const toMap: <K, V>(self: TMap<K, V>) => STM.STM<ReadonlyMap<K, V>>
```

### TSet Usage (from .context/effect/packages/effect/src/TSet.ts)

```typescript
// TSet structure (internal)
export interface TSet<A> {
  readonly tMap: TMap.TMap<A, void>
}

// Constructors
export const empty: <A>() => STM.STM<TSet<A>>
export const make: <Elements extends Array<any>>(...elements: Elements) => STM.STM<TSet<Elements[number]>>
export const fromIterable: <A>(iterable: Iterable<A>) => STM.STM<TSet<A>>

// Operations
export const add: {
  <A>(value: A): (self: TSet<A>) => STM.STM<void>
  <A>(self: TSet<A>, value: A): STM.STM<void>
}

export const has: {
  <A>(value: A): (self: TSet<A>) => STM.STM<boolean>
  <A>(self: TSet<A>, value: A): STM.STM<boolean>
}

export const toReadonlySet: <A>(self: TSet<A>) => STM.STM<ReadonlySet<A>>
```

---

## Specific Refactoring Tasks

### Task 1: GCounter Refactoring

**File:** `src/GCounter.ts`

**Changes:**

1. **Update data structure:**
```typescript
export interface GCounter extends GCounter.Variance {}
export interface GCounter {
  readonly [GCounterTypeId]: GCounterTypeId
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>
}

export declare namespace GCounter {
  export interface Variance {
    readonly [GCounterTypeId]: {
      readonly _ReplicaId: Types.Covariant<ReplicaId>
    }
  }
}
```

2. **Keep state interface** (for persistence):
```typescript
export interface CounterState {
  readonly type: "GCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
}
```

3. **Constructors:**
```typescript
export const make = (replicaId: ReplicaId): STM.STM<GCounter> =>
  Effect.gen(function* () {
    const counts = yield* TMap.make<ReplicaId, number>([replicaId, 0])
    const counter: Mutable<GCounter> = Object.create(ProtoGCounter)
    counter.replicaId = replicaId
    counter.counts = counts
    return counter
  }).pipe(STM.commit)

export const fromState = (state: CounterState): STM.STM<GCounter> =>
  Effect.gen(function* () {
    const counts = yield* TMap.fromIterable(state.counts.entries())
    const counter: Mutable<GCounter> = Object.create(ProtoGCounter)
    counter.replicaId = state.replicaId
    counter.counts = counts
    return counter
  }).pipe(STM.commit)
```

4. **Operations (dual API):**
```typescript
export const increment: {
  (value?: number): (self: GCounter) => STM.STM<void>
  (self: GCounter, value?: number): STM.STM<void>
} = dual(
  (args) => isGCounter(args[0]),
  (self: GCounter, value = 1): STM.STM<void> => {
    if (value < 0) {
      return STM.die(new GCounterError({ message: "Cannot increment by negative value" }))
    }
    return pipe(
      TMap.get(self.counts, self.replicaId),
      STM.flatMap((currentOpt) => {
        const current = Option.getOrElse(currentOpt, () => 0)
        return TMap.set(self.counts, self.replicaId, current + value)
      })
    )
  }
)

export const value = (self: GCounter): STM.STM<number> =>
  pipe(
    TMap.values(self.counts),
    STM.map(Number.sumAll)
  )

export const merge: {
  (other: CounterState): (self: GCounter) => STM.STM<void>
  (self: GCounter, other: CounterState): STM.STM<void>
} = dual(
  2,
  (self: GCounter, other: CounterState): STM.STM<void> =>
    STM.forEach(other.counts.entries(), ([replicaId, count]) =>
      pipe(
        TMap.get(self.counts, replicaId),
        STM.flatMap((currentOpt) => {
          const current = Option.getOrElse(currentOpt, () => 0)
          return TMap.set(self.counts, replicaId, Math.max(current, count))
        })
      )
    )
)

export const query = (self: GCounter): STM.STM<CounterState> =>
  pipe(
    TMap.toMap(self.counts),
    STM.map((counts) => ({
      type: "GCounter" as const,
      replicaId: self.replicaId,
      counts
    }))
  )
```

5. **Layers (separate export):**
```typescript
export const Live = (replicaId: ReplicaId): Layer.Layer<GCounter> =>
  Layer.effect(
    Context.GenericTag<GCounter>("GCounter"),
    make(replicaId)
  )
```

6. **Remove:**
   - Counter interface extension
   - makeGCounter internal function with methods
   - Context.Tag class pattern (replace with separate exports)

---

### Task 2: PNCounter Refactoring

**File:** `src/PNCounter.ts`

**Changes:**

1. **Data structure:**
```typescript
export interface PNCounter extends PNCounter.Variance {}
export interface PNCounter {
  readonly [PNCounterTypeId]: PNCounterTypeId
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>
  readonly decrements: TMap.TMap<ReplicaId, number>
}
```

2. **State:**
```typescript
export interface CounterState {
  readonly type: "PNCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
  readonly decrements: ReadonlyMap<ReplicaId, number>
}
```

3. **Operations:**
```typescript
export const increment: {/*...same as GCounter...*/}

export const decrement: {
  (value?: number): (self: PNCounter) => STM.STM<void>
  (self: PNCounter, value?: number): STM.STM<void>
} = dual(
  (args) => isPNCounter(args[0]),
  (self: PNCounter, value = 1): STM.STM<void> => {
    if (value < 0) {
      return STM.die(new PNCounterError({ message: "Cannot decrement by negative value" }))
    }
    return pipe(
      TMap.get(self.decrements, self.replicaId),
      STM.flatMap((currentOpt) => {
        const current = Option.getOrElse(currentOpt, () => 0)
        return TMap.set(self.decrements, self.replicaId, current + value)
      })
    )
  }
)

export const value = (self: PNCounter): STM.STM<number> =>
  STM.gen(function* () {
    const countSum = yield* pipe(TMap.values(self.counts), STM.map(Number.sumAll))
    const decrementSum = yield* pipe(TMap.values(self.decrements), STM.map(Number.sumAll))
    return countSum - decrementSum
  })

export const merge: {
  (other: CounterState): (self: PNCounter) => STM.STM<void>
  (self: PNCounter, other: CounterState): STM.STM<void>
} = dual(
  2,
  (self: PNCounter, other: CounterState): STM.STM<void> =>
    STM.gen(function* () {
      // Merge counts
      yield* STM.forEach(other.counts.entries(), ([replicaId, count]) =>
        pipe(
          TMap.get(self.counts, replicaId),
          STM.flatMap((currentOpt) => {
            const current = Option.getOrElse(currentOpt, () => 0)
            return TMap.set(self.counts, replicaId, Math.max(current, count))
          })
        )
      )
      // Merge decrements
      yield* STM.forEach(other.decrements.entries(), ([replicaId, decrement]) =>
        pipe(
          TMap.get(self.decrements, replicaId),
          STM.flatMap((currentOpt) => {
            const current = Option.getOrElse(currentOpt, () => 0)
            return TMap.set(self.decrements, replicaId, Math.max(current, decrement))
          })
        )
      )
    })
)

export const query = (self: PNCounter): STM.STM<CounterState> =>
  STM.gen(function* () {
    const counts = yield* TMap.toMap(self.counts)
    const decrements = yield* TMap.toMap(self.decrements)
    return {
      type: "PNCounter" as const,
      replicaId: self.replicaId,
      counts,
      decrements
    }
  })
```

---

### Task 3: GSet Refactoring

**File:** `src/GSet.ts`

**Changes:**

1. **Data structure:**
```typescript
export interface GSet<A> extends GSet.Variance<A> {}
export interface GSet<A> {
  readonly [GSetTypeId]: GSetTypeId
  readonly replicaId: ReplicaId
  readonly added: TSet.TSet<A>
}

export declare namespace GSet {
  export interface Variance<A> {
    readonly [GSetTypeId]: {
      readonly _A: Types.Invariant<A>
    }
  }
}
```

2. **State:**
```typescript
export interface GSetState<A> {
  readonly type: "GSet"
  readonly replicaId: ReplicaId
  readonly added: ReadonlySet<A>
}
```

3. **Operations:**
```typescript
export const make = <A>(replicaId: ReplicaId): STM.STM<GSet<A>> =>
  Effect.gen(function* () {
    const added = yield* TSet.empty<A>()
    const set: Mutable<GSet<A>> = Object.create(ProtoGSet)
    set.replicaId = replicaId
    set.added = added
    return set
  }).pipe(STM.commit)

export const fromState = <A>(state: GSetState<A>): STM.STM<GSet<A>> =>
  Effect.gen(function* () {
    const added = yield* TSet.fromIterable(state.added)
    const set: Mutable<GSet<A>> = Object.create(ProtoGSet)
    set.replicaId = state.replicaId
    set.added = added
    return set
  }).pipe(STM.commit)

export const add: {
  <A>(value: A): (self: GSet<A>) => STM.STM<void>
  <A>(self: GSet<A>, value: A): STM.STM<void>
} = dual(
  2,
  <A>(self: GSet<A>, value: A): STM.STM<void> =>
    TSet.add(self.added, value)
)

export const has: {
  <A>(value: A): (self: GSet<A>) => STM.STM<boolean>
  <A>(self: GSet<A>, value: A): STM.STM<boolean>
} = dual(
  2,
  <A>(self: GSet<A>, value: A): STM.STM<boolean> =>
    TSet.has(self.added, value)
)

export const values = <A>(self: GSet<A>): STM.STM<ReadonlySet<A>> =>
  TSet.toReadonlySet(self.added)

export const size = <A>(self: GSet<A>): STM.STM<number> =>
  TSet.size(self.added)

export const merge: {
  <A>(other: GSetState<A>): (self: GSet<A>) => STM.STM<void>
  <A>(self: GSet<A>, other: GSetState<A>): STM.STM<void>
} = dual(
  2,
  <A>(self: GSet<A>, other: GSetState<A>): STM.STM<void> =>
    STM.forEach(other.added, (value) => TSet.add(self.added, value))
)

export const query = <A>(self: GSet<A>): STM.STM<GSetState<A>> =>
  pipe(
    TSet.toReadonlySet(self.added),
    STM.map((added) => ({
      type: "GSet" as const,
      replicaId: self.replicaId,
      added
    }))
  )
```

4. **Layers:**
```typescript
export const Live = <A>(replicaId: ReplicaId) =>
  Layer.effect(
    Context.GenericTag<GSet<A>>("GSet"),
    make<A>(replicaId)
  )
```

---

### Task 4: Update CRDT Core

**File:** `src/CRDT.ts`

**Changes:**

1. **Remove old base interface:**
```typescript
// DELETE THIS:
export interface CRDT<State, Delta = State>
  extends Equal.Equal, Hash.Hash, Pipeable.Pipeable, Inspectable.Inspectable {
  readonly [CRDTTypeId]: CRDTTypeId
  readonly query: STM.STM<State>
  readonly merge: (other: State) => STM.STM<void>
  readonly delta: STM.STM<Option.Option<Delta>>
  readonly applyDelta: (delta: Delta) => STM.STM<void>
}
```

2. **Keep:**
```typescript
export const CRDTTypeId: unique symbol = Symbol.for("effect-crdts/CRDT")
export type CRDTTypeId = typeof CRDTTypeId

export type ReplicaId = Brand.Branded<string, "ReplicaId">
export const ReplicaId = Brand.nominal<ReplicaId>()
export const ReplicaIdSchema = Schema.String.pipe(Schema.fromBrand(ReplicaId))
```

3. **Add utility types (if needed):**
```typescript
// Optional: helper for extracting state from CRDT
export type StateOf<T> = T extends { query: STM.STM<infer S> } ? S : never
```

---

### Task 5: Update Type Definition Modules

**Files:** `src/CRDTCounter.ts`, `src/CRDTSet.ts`, `src/CRDTMap.ts`, `src/CRDTRegister.ts`

**Changes:**

1. **Remove interface definitions** - These are now in the implementation modules
2. **Keep state type definitions** - These are used for persistence
3. **Keep Schema definitions** - Used for serialization

Example for `CRDTCounter.ts`:
```typescript
/**
 * Counter CRDT state types.
 * @since 0.1.0
 */
import type * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { ReplicaIdSchema } from "./CRDT.js"
import type { ReplicaId } from "./CRDT.js"

/**
 * State of a G-Counter CRDT.
 * @since 0.1.0
 * @category models
 */
export interface GCounterState {
  readonly type: "GCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
}

/**
 * State of a PN-Counter CRDT.
 * @since 0.1.0
 * @category models
 */
export interface PNCounterState {
  readonly type: "PNCounter"
  readonly replicaId: ReplicaId
  readonly counts: ReadonlyMap<ReplicaId, number>
  readonly decrements: ReadonlyMap<ReplicaId, number>
}

/**
 * Discriminated union of counter states.
 * @since 0.1.0
 * @category models
 */
export type CounterState = GCounterState | PNCounterState

/**
 * Schema for CounterState.
 * @since 0.1.0
 * @category schemas
 */
export const CounterState = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("GCounter"),
    replicaId: ReplicaIdSchema,
    counts: Schema.ReadonlyMap({
      key: ReplicaIdSchema,
      value: Schema.Number
    })
  }),
  Schema.Struct({
    type: Schema.Literal("PNCounter"),
    replicaId: ReplicaIdSchema,
    counts: Schema.ReadonlyMap({
      key: ReplicaIdSchema,
      value: Schema.Number
    }),
    decrements: Schema.ReadonlyMap({
      key: ReplicaIdSchema,
      value: Schema.Number
    })
  })
)
```

---

### Task 6: Update proto.ts

**File:** `src/internal/proto.ts`

**Changes:**

Simplify to only provide TypeId and Pipeable support:

```typescript
/**
 * Shared Proto object utilities for CRDTs.
 *
 * Provides common implementations of Inspectable and Pipeable protocols
 * to reduce duplication across CRDT implementations.
 *
 * @since 0.1.0
 * @internal
 */

import { format, NodeInspectSymbol } from "effect/Inspectable"
import { pipeArguments } from "effect/Pipeable"
import * as Predicate from "effect/Predicate"

/**
 * Type guard to check if a value has the CRDT type ID.
 *
 * @internal
 */
export const hasCRDTTypeId = (typeId: symbol) => (u: unknown): boolean =>
  Predicate.hasProperty(u, typeId)

/**
 * Creates common Proto object methods for CRDTs.
 *
 * Provides:
 * - NodeInspectSymbol (uses format for inspection)
 * - toString (uses format)
 * - pipe (uses pipeArguments)
 *
 * @internal
 */
export const makeProtoBase = (typeId: symbol) => ({
  [typeId]: typeId,
  [NodeInspectSymbol]() {
    return format(this)
  },
  toString() {
    return format(this)
  },
  pipe() {
    return pipeArguments(this, arguments)
  }
})
```

---

## Implementation Order

1. **First:** Update `proto.ts` (simplify)
2. **Parallel (3 agents):**
   - Agent 1: Refactor `GCounter.ts`
   - Agent 2: Refactor `PNCounter.ts`
   - Agent 3: Refactor `GSet.ts`
3. **After parallel work:**
   - Update `CRDT.ts` (remove base interface)
   - Update `CRDTCounter.ts`, `CRDTSet.ts` (keep only state types)
4. **Last:** Persistence refactoring (separate task)

---

## Testing Strategy

After each refactoring:
1. Run existing tests to ensure behavior is preserved
2. Tests should work without modification since we're maintaining the same semantics
3. May need to update test imports from methods to functions

Example test update:
```typescript
// Before
yield* STM.commit(counter.increment(5))
const value = yield* STM.commit(counter.value)

// After (same semantics, different syntax)
yield* STM.commit(increment(counter, 5))
const value = yield* STM.commit(value(counter))

// Or with pipe
yield* pipe(counter, increment(5), STM.commit)
const value = yield* pipe(counter, value, STM.commit)
```

---

## Key Imports Needed

Each CRDT module will need:
```typescript
import * as Context from "effect/Context"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { dual, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Number from "effect/Number"
import * as Option from "effect/Option"
import * as STM from "effect/STM"
import * as TMap from "effect/TMap"  // For counters
import * as TSet from "effect/TSet"  // For sets
import type { Mutable } from "effect/Types"
import * as Types from "effect/Types"
import * as Predicate from "effect/Predicate"

import { CRDTTypeId, type ReplicaId } from "./CRDT.js"
import { makeProtoBase, hasCRDTTypeId } from "./internal/proto.js"
```

---

## Delta Support (Internal Methods)

If `delta` and `applyDelta` are only used internally for synchronization and are semantically tied to the data structure, they can remain as properties on the data:

```typescript
export interface GCounter {
  readonly [GCounterTypeId]: GCounterTypeId
  readonly replicaId: ReplicaId
  readonly counts: TMap.TMap<ReplicaId, number>

  // Internal methods (if they align with Effect's pattern)
  readonly delta?: STM.STM<Option.Option<CounterState>>
  readonly applyDelta?: (delta: CounterState) => STM.STM<void>
}
```

However, if these are part of the public API, they should be functions:
```typescript
export const delta = (self: GCounter): STM.STM<Option.Option<CounterState>> =>
  pipe(query(self), STM.map(Option.some))

export const applyDelta: {
  (delta: CounterState): (self: GCounter) => STM.STM<void>
  (self: GCounter, delta: CounterState): STM.STM<void>
} = dual(2, (self: GCounter, delta: CounterState) => merge(self, delta))
```

Decision: Make them **public functions** since they're part of the CRDT API contract.

---

## Success Criteria

- ✅ All CRDTs use TMap/TSet instead of vanilla Map/Set
- ✅ All operations are functions with dual API support
- ✅ Module structure follows Effect's organization
- ✅ Proto object only provides TypeId and Pipeable
- ✅ State types are preserved for persistence
- ✅ All existing tests pass
- ✅ No methods on data structures (except internal if aligned with Effect)
- ✅ Layers are separate exports, not attached to Context.Tag classes
