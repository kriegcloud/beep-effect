# MutableHashMap — Agent Context

> Quick reference for AI agents working with `effect/MutableHashMap`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `MutableHashMap.empty<K, V>()` | Creates empty mutable map | `const map = MutableHashMap.empty<string, number>();` |
| `MutableHashMap.make(...entries)` | Creates map from entries | `const map = MutableHashMap.make(["a", 1], ["b", 2]);` |
| `MutableHashMap.fromIterable(entries)` | Creates map from iterable | `const map = MutableHashMap.fromIterable(array);` |
| `MutableHashMap.get(map, key)` | Safe get returning Option | `const value = MutableHashMap.get(map, "key");` |
| `MutableHashMap.set(map, key, value)` | Set value (mutates in-place) | `MutableHashMap.set(map, "key", 42);` |
| `MutableHashMap.has(map, key)` | Check key existence | `const exists = MutableHashMap.has(map, "key");` |
| `MutableHashMap.remove(map, key)` | Remove entry (mutates in-place) | `MutableHashMap.remove(map, "key");` |
| `MutableHashMap.size(map)` | Get entry count | `const count = MutableHashMap.size(map);` |
| `MutableHashMap.keys(map)` | Get all keys as array | `const allKeys = MutableHashMap.keys(map);` |
| `MutableHashMap.values(map)` | Get all values as array | `const allValues = MutableHashMap.values(map);` |
| `MutableHashMap.forEach(map, fn)` | Iterate over entries | `MutableHashMap.forEach(map, (v, k) => {...});` |

## Codebase Patterns

### Pattern 1: RRF Scoring with Score Accumulation

**Use Case**: Combine multiple ranking signals into a single relevance score.

**Location**: `packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

```typescript
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import { thunkZero } from "@beep/utils";

export const fuseRankings = <T extends string>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k = 60
): ReadonlyArray<RankedItem<T>> => {
  // Accumulate scores by ID using mutable map
  const scoreMap = MutableHashMap.empty<T, number>();

  for (const rankedList of rankedLists) {
    A.forEach(rankedList, (id, i) => {
      const rank = i + 1;
      const component = rrfComponent(rank, k);

      // Get current score or default to 0
      const currentScore = O.getOrElse(
        MutableHashMap.get(scoreMap, id),
        thunkZero
      );

      // Update accumulated score
      MutableHashMap.set(scoreMap, id, currentScore + component);
    });
  }

  // Convert to array for sorting
  const items = A.empty<RankedItem<T>>();
  MutableHashMap.forEach(scoreMap, (score, id) => {
    items.push({ id, score });
  });

  return A.sort(items, Order.mapInput(Num.Order, (item) => -item.score));
};
```

**Why Mutable**: Building a score accumulator from multiple lists. Immutable HashMap would create a new map on each update, causing O(n²) complexity. MutableHashMap provides O(1) updates.

### Pattern 2: Grouping by Key with Option Handling

**Use Case**: Group entities by hop count for graph traversal ranking.

**Location**: `packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

```typescript
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

export const assignGraphRanks = <T extends string>(
  entityHops: MutableHashMap.MutableHashMap<T, number>
): MutableHashMap.MutableHashMap<T, number> => {
  // Group entities by hop count
  const hopGroups = MutableHashMap.empty<number, Array<T>>();

  MutableHashMap.forEach(entityHops, (hops, id) => {
    // Get existing group or create empty array
    const groupOpt = MutableHashMap.get(hopGroups, hops);
    const group = O.getOrElse(groupOpt, A.empty<T>);

    // Add entity to group
    group.push(id);
    MutableHashMap.set(hopGroups, hops, group);
  });

  // ... assign ranks based on groups
};
```

**Key Pattern**: Always use `O.getOrElse` with `MutableHashMap.get` to handle missing keys safely.

### Pattern 3: Jotai Atom State Management

**Use Case**: Track pending optimistic actions by ID.

**Location**: `packages/shared/client/src/services/optimistic-actions-manager/optimistic-actions-manager.ts`

```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as S from "effect/Schema";
import { BS } from "@beep/schema";

export class OptimisticActionsManager extends S.Class<OptimisticActionsManager>(
  $I`OptimisticActionsManager`
)({
  pendingActions: S.optionalWith(
    BS.MutableHashMap({
      key: S.String,
      value: PendingAction,
    }),
    {
      default: MutableHashMap.empty<string, PendingAction.Type>,
    }
  ),
}) {}
```

**Why**: Jotai atoms need mutable state for client-side optimistic updates. MutableHashMap provides efficient in-place updates for action tracking.

## Anti-Patterns

### NEVER: Use Native Map

```typescript
// FORBIDDEN - Native Map
const cache = new Map<string, User>();
cache.set(userId, user);
const user = cache.get(userId);  // Returns T | undefined
```

```typescript
// REQUIRED - Effect MutableHashMap
import * as MutableHashMap from "effect/MutableHashMap";

const cache = MutableHashMap.empty<string, User>();
MutableHashMap.set(cache, userId, user);
const user = MutableHashMap.get(cache, userId);  // Returns Option<T>
```

**Why**: Native Map returns `T | undefined`, requiring null checks. MutableHashMap returns `Option<T>`, enabling functional composition.

### NEVER: Access Get Result Directly

```typescript
// FORBIDDEN - Assumes key exists
const value = MutableHashMap.get(map, key)!;  // Non-null assertion!
```

```typescript
// REQUIRED - Handle Option properly
import * as O from "effect/Option";

const valueOpt = MutableHashMap.get(map, key);
const value = O.getOrElse(valueOpt, () => defaultValue);
```

**Why**: `get` returns `Option<V>` to enforce safe handling of missing keys. Use `O.getOrElse`, `O.match`, or `pipe` with Option combinators.

### NEVER: Mutate Shared State Without Coordination

```typescript
// DANGEROUS - Multiple consumers mutating shared state
const sharedCache = MutableHashMap.empty<string, Data>();

// Consumer A
MutableHashMap.set(sharedCache, "key", dataA);

// Consumer B (elsewhere)
MutableHashMap.remove(sharedCache, "key");  // Race condition!
```

```typescript
// BETTER - Encapsulate mutation in Effect service
export class CacheService extends Effect.Service<CacheService>()(
  "CacheService",
  {
    effect: Effect.sync(() => {
      const cache = MutableHashMap.empty<string, Data>();

      return {
        get: (key: string) => MutableHashMap.get(cache, key),
        set: (key: string, value: Data) =>
          Effect.sync(() => MutableHashMap.set(cache, key, value)),
      };
    }),
  }
) {}
```

**Why**: MutableHashMap mutates in-place. Shared mutable state needs coordination through Effect services or Refs to avoid race conditions.

### NEVER: Use Immutable HashMap for Accumulation Loops

```typescript
// INEFFICIENT - Creates new map on each iteration
import * as HashMap from "effect/HashMap";

let scores = HashMap.empty<string, number>();
for (const [id, score] of entries) {
  scores = HashMap.set(scores, id, score);  // O(n) copy per iteration!
}
```

```typescript
// EFFICIENT - Mutate in-place during accumulation
import * as MutableHashMap from "effect/MutableHashMap";

const scores = MutableHashMap.empty<string, number>();
for (const [id, score] of entries) {
  MutableHashMap.set(scores, id, score);  // O(1) mutation
}

// Convert to immutable if needed for return value
const immutableScores = HashMap.fromIterable(scores);
```

**Why**: Immutable HashMap creates a new map on each update. For accumulation loops with many iterations, use MutableHashMap and convert to immutable HashMap only when returning from a function.

## When to Use MutableHashMap vs HashMap

| Use Case | Choose | Reason |
|----------|--------|--------|
| Building cache incrementally | `MutableHashMap` | O(1) in-place updates |
| Accumulating scores in loop | `MutableHashMap` | Avoid O(n²) complexity from immutable copies |
| Local variable in function | `MutableHashMap` | Mutation is scoped, no concurrency risk |
| Public API return value | `HashMap` | Immutability guarantees for consumers |
| Shared state across Effects | `HashMap` + `Ref` | Safe concurrent access |
| Client-side atom state | `MutableHashMap` | Efficient state updates in React/Jotai |

## Import Convention

ALWAYS use namespace import:

```typescript
import * as MutableHashMap from "effect/MutableHashMap";
```

NEVER use:
```typescript
// FORBIDDEN
import { MutableHashMap } from "effect";  // Wrong namespace
import { empty, set, get } from "effect/MutableHashMap";  // No tree-shaking benefit
```

## Related Modules

- [HashMap.md](./HashMap.md) - Immutable alternative, use for public APIs and concurrent access
- [MutableHashSet.md](./MutableHashSet.md) - Mutable set for deduplication
- [Record.md](./Record.md) - Immutable string-keyed records
- [Ref.md](./Ref.md) - Safe concurrent mutable state in Effect context

## Source Reference

[.repos/effect/packages/effect/src/MutableHashMap.ts](../../.repos/effect/packages/effect/src/MutableHashMap.ts)
