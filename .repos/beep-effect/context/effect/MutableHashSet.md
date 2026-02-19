# MutableHashSet — Agent Context

> Quick reference for AI agents working with `effect/MutableHashSet`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `MutableHashSet.empty<T>()` | Creates empty mutable set | `const set = MutableHashSet.empty<string>();` |
| `MutableHashSet.make(...values)` | Creates set from values | `const set = MutableHashSet.make(1, 2, 3);` |
| `MutableHashSet.fromIterable(values)` | Creates set from iterable | `const set = MutableHashSet.fromIterable(array);` |
| `MutableHashSet.add(set, value)` | Add value (mutates in-place) | `MutableHashSet.add(set, "item");` |
| `MutableHashSet.remove(set, value)` | Remove value (mutates in-place) | `MutableHashSet.remove(set, "item");` |
| `MutableHashSet.has(set, value)` | Check value existence | `const exists = MutableHashSet.has(set, "item");` |
| `MutableHashSet.size(set)` | Get element count | `const count = MutableHashSet.size(set);` |
| `MutableHashSet.clear(set)` | Remove all elements | `MutableHashSet.clear(set);` |
| `MutableHashSet.values(set)` | Iterate over values | `for (const v of MutableHashSet.values(set)) {...}` |
| `MutableHashSet.forEach(set, fn)` | Apply function to each | `MutableHashSet.forEach(set, (v) => {...});` |

## Codebase Patterns

### Pattern 1: Deduplication with Mutation Scope

**Use Case**: Track seen entities during extraction to avoid duplicates.

**Location**: `packages/knowledge/server/src/Extraction/EntityExtractor.ts`

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

const deduplicateEntities = (
  entities: ReadonlyArray<Entity>
): ReadonlyArray<Entity> => {
  const seen = MutableHashSet.empty<string>();
  const unique = A.empty<Entity>();

  for (const entity of entities) {
    if (!MutableHashSet.has(seen, entity.id)) {
      MutableHashSet.add(seen, entity.id);
      unique.push(entity);
    }
  }

  return unique;
};
```

**Why Mutable**: Building a deduplication set in a single pass through data. Mutation is scoped to function body, no concurrency risk. Immutable HashSet would create O(n) copies.

### Pattern 2: React useRef for Lexical Plugin State

**Use Case**: Track active code blocks in a Lexical editor plugin.

**Location**: `apps/todox/src/app/lexical/plugins/CodeActionMenuPlugin/index.tsx`

```typescript
import { useRef } from "react";
import * as MutableHashSet from "effect/MutableHashSet";

export function CodeActionMenuPlugin() {
  const codeSetRef = useRef(MutableHashSet.empty<string>());
  const [shouldListenMouseMove, setShouldListenMouseMove] = useState(false);

  useEffect(() => {
    return editor.registerMutationListener(CodeNode, (mutations) => {
      for (const [key, mutation] of mutations) {
        if (mutation === "created") {
          MutableHashSet.add(codeSetRef.current, key);
        } else if (mutation === "destroyed") {
          MutableHashSet.remove(codeSetRef.current, key);
        }
      }

      // Update UI based on active code blocks
      setShouldListenMouseMove(MutableHashSet.size(codeSetRef.current) > 0);
    });
  }, [editor]);

  return null;
}
```

**Why Mutable**: React ref holds mutable state across renders. MutableHashSet provides O(1) add/remove for DOM node tracking without triggering re-renders.

### Pattern 3: Table Key Tracking for Editor Features

**Use Case**: Track which table nodes are currently active in Lexical editor.

**Location**: `apps/todox/src/app/lexical/plugins/TableCellResizer/index.tsx`

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

useEffect(() => {
  const tableKeys = MutableHashSet.empty<NodeKey>();

  return mergeRegister(
    editor.registerMutationListener(TableNode, (mutations) => {
      for (const [nodeKey, mutation] of mutations) {
        if (mutation === "destroyed") {
          MutableHashSet.remove(tableKeys, nodeKey);
        } else {
          MutableHashSet.add(tableKeys, nodeKey);
        }
      }
      setHasTable(MutableHashSet.size(tableKeys) > 0);
    })
  );
}, [editor]);
```

**Why**: Efficiently track dynamically created/destroyed table nodes. Size check drives conditional rendering of table resize UI.

### Pattern 4: Entity Clustering with Visited Tracking

**Use Case**: Track visited nodes during graph traversal for entity resolution.

**Location**: `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

const findConnectedComponent = (
  startId: EntityId,
  graph: Map<EntityId, EntityId[]>
): ReadonlyArray<EntityId> => {
  const visited = MutableHashSet.empty<EntityId>();
  const component = A.empty<EntityId>();
  const queue = [startId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (MutableHashSet.has(visited, current)) continue;

    MutableHashSet.add(visited, current);
    component.push(current);

    const neighbors = graph.get(current) ?? [];
    queue.push(...neighbors.filter(n => !MutableHashSet.has(visited, n)));
  }

  return component;
};
```

**Why**: Graph traversal needs O(1) membership checks for visited nodes. MutableHashSet provides constant-time has/add during BFS/DFS.

## Anti-Patterns

### NEVER: Use Native Set

```typescript
// FORBIDDEN - Native Set
const seen = new Set<string>();
seen.add("item");
const exists = seen.has("item");
```

```typescript
// REQUIRED - Effect MutableHashSet
import * as MutableHashSet from "effect/MutableHashSet";

const seen = MutableHashSet.empty<string>();
MutableHashSet.add(seen, "item");
const exists = MutableHashSet.has(seen, "item");
```

**Why**: Consistency with Effect ecosystem. MutableHashSet supports structural equality for Effect types (Data, Schema classes) while native Set uses reference equality.

### NEVER: Mutate Set Passed as Parameter Without Documentation

```typescript
// DANGEROUS - Caller doesn't expect mutation
function processItems(items: MutableHashSet.MutableHashSet<string>) {
  MutableHashSet.add(items, "unexpected");  // Side effect!
}

const mySet = MutableHashSet.make("a", "b");
processItems(mySet);
// Caller's set now has "unexpected" item
```

```typescript
// BETTER - Document mutation or return new set
/**
 * Process items by adding validation result.
 *
 * @param items - Mutable set that will be modified
 */
function processItems(items: MutableHashSet.MutableHashSet<string>): void {
  MutableHashSet.add(items, "validated");
}

// OR - Return new immutable HashSet
function processItems(items: HashSet.HashSet<string>): HashSet.HashSet<string> {
  return HashSet.add(items, "validated");
}
```

**Why**: MutableHashSet mutations are invisible to callers. Either document the mutation clearly or use immutable HashSet for function parameters.

### NEVER: Use MutableHashSet for Public API Return Values

```typescript
// BAD - Exposes mutable state to consumers
export const getProcessedIds = (): MutableHashSet.MutableHashSet<string> => {
  const ids = MutableHashSet.empty<string>();
  // ... populate
  return ids;  // Caller can mutate internal state!
};
```

```typescript
// GOOD - Return immutable HashSet or ReadonlyArray
import * as HashSet from "effect/HashSet";

export const getProcessedIds = (): HashSet.HashSet<string> => {
  const ids = MutableHashSet.empty<string>();
  // ... populate with mutations
  return HashSet.fromIterable(ids);  // Convert to immutable
};

// OR - Return frozen array
export const getProcessedIds = (): ReadonlyArray<string> => {
  const ids = MutableHashSet.empty<string>();
  // ... populate
  return Array.from(MutableHashSet.values(ids));
};
```

**Why**: Returning MutableHashSet lets consumers mutate your internal state. Convert to immutable types before returning.

### NEVER: Share MutableHashSet Across Async Operations

```typescript
// RACE CONDITION - Multiple async operations mutate shared set
const globalVisited = MutableHashSet.empty<string>();

export const processAsync = (id: string) =>
  Effect.gen(function* () {
    if (MutableHashSet.has(globalVisited, id)) {
      return;  // Already processed
    }

    MutableHashSet.add(globalVisited, id);
    yield* Effect.sleep(100);  // Async operation
    // Another Effect might have modified globalVisited!
  });
```

```typescript
// SAFE - Use Effect Ref for concurrent mutable state
import * as Ref from "effect/Ref";
import * as HashSet from "effect/HashSet";

export const makeProcessor = Effect.gen(function* () {
  const visitedRef = yield* Ref.make(HashSet.empty<string>());

  return {
    process: (id: string) =>
      Effect.gen(function* () {
        const visited = yield* Ref.get(visitedRef);

        if (HashSet.has(visited, id)) return;

        yield* Ref.update(visitedRef, HashSet.add(id));
        yield* Effect.sleep(100);
      }),
  };
});
```

**Why**: MutableHashSet has no concurrency protection. For shared state across async Effects, use `Ref<HashSet<T>>` which provides atomic updates.

## When to Use MutableHashSet vs HashSet

| Use Case | Choose | Reason |
|----------|--------|--------|
| Deduplication in loop | `MutableHashSet` | O(1) in-place add, no copies |
| Graph traversal visited tracking | `MutableHashSet` | Local scope, many mutations |
| React useRef state | `MutableHashSet` | Persistent mutable state across renders |
| Function return value | `HashSet` | Immutability for consumers |
| Shared state in Effect | `Ref<HashSet<T>>` | Safe concurrent access |
| Public API parameter | `HashSet` | Caller controls mutations |

## Import Convention

ALWAYS use namespace import:

```typescript
import * as MutableHashSet from "effect/MutableHashSet";
```

NEVER use:
```typescript
// FORBIDDEN
import { MutableHashSet } from "effect";  // Wrong namespace
import { empty, add, has } from "effect/MutableHashSet";  // No tree-shaking benefit
```

## Related Modules

- [HashSet.md](./HashSet.md) - Immutable alternative, use for public APIs
- [MutableHashMap.md](./MutableHashMap.md) - Mutable map for key-value caching
- [Array.md](./Array.md) - Ordered collection utilities
- [Ref.md](./Ref.md) - Safe concurrent mutable state

## Source Reference

[.repos/effect/packages/effect/src/MutableHashSet.ts](../../.repos/effect/packages/effect/src/MutableHashSet.ts)
