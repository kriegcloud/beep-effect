# HashMap — Agent Context

> Quick reference for AI agents working with `effect/HashMap`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `HashMap.empty<K, V>()` | Create empty HashMap | `HashMap.empty<string, number>()` |
| `HashMap.make(...entries)` | Create from entries | `HashMap.make(["a", 1], ["b", 2])` |
| `HashMap.fromIterable(iter)` | Create from iterable | `HashMap.fromIterable(entries)` |
| `HashMap.get(map, key)` | Get value (returns Option) | `HashMap.get(cache, userId)` |
| `HashMap.has(map, key)` | Check key exists | `HashMap.has(map, "key")` |
| `HashMap.set(map, key, value)` | Add/update entry | `HashMap.set(map, "x", 42)` |
| `HashMap.remove(map, key)` | Remove entry | `HashMap.remove(map, "old")` |
| `HashMap.size(map)` | Get number of entries | `HashMap.size(map)` |
| `HashMap.isEmpty(map)` | Check if empty | `HashMap.isEmpty(map)` |
| `HashMap.keys(map)` | Get keys iterable | `HashMap.keys(map)` |
| `HashMap.values(map)` | Get values iterable | `HashMap.values(map)` |
| `HashMap.entries(map)` | Get entries iterable | `HashMap.entries(map)` |
| `HashMap.map(map, fn)` | Transform values | `HashMap.map(map, (v) => v * 2)` |
| `HashMap.filter(map, pred)` | Filter entries | `HashMap.filter(map, (v) => v > 0)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED
import * as HashMap from "effect/HashMap";

// FORBIDDEN
import { HashMap } from "effect";
import { make, get } from "effect/HashMap";
```

### Immutable Operations

HashMap is **immutable**. Operations return a **new** HashMap:

```typescript
import * as HashMap from "effect/HashMap";

// Empty map
let map = HashMap.empty<string, number>();

// Add entries (returns new HashMap)
map = HashMap.set(map, "a", 1);
map = HashMap.set(map, "b", 2);

// Remove entry (returns new HashMap)
map = HashMap.remove(map, "a");

// Original map is never mutated
```

### Safe Get with Option

`HashMap.get` returns `Option<V>` for safe access:

```typescript
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

const map = HashMap.make(["user1", { name: "Alice" }]);

// Get returns Option
const maybeUser = HashMap.get(map, "user1");

// Handle Option
const userName = O.pipe(
  maybeUser,
  O.map(user => user.name),
  O.getOrElse(() => "Unknown")
);
```

### Real Usage: Dependency Index

From `tooling/utils/src/repo/DependencyIndex.ts`:

```typescript
import * as HashMap from "effect/HashMap";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";

export const buildRepoDependencyIndex = Effect.gen(function* () {
  const workspacePkgJsonMap = yield* mapWorkspaceToPackageJsonPath;

  // Build entries array
  const entries: Array<readonly [string, string]> = [
    ...A.fromIterable(HashMap.entries(workspacePkgJsonMap)),
    ["@beep/root", repoRootPkgJsonPath] as const,
  ];

  // Build HashMap incrementally
  let map = HashMap.empty<WorkspacePkgKeyT, RepoDepMapValueT>();

  for (const [name, pkgJsonPath] of entries) {
    const deps = yield* extractWorkspaceDependencies(pkgJsonPath);
    const key = yield* S.decodeUnknown(WorkspacePkgKey)(name);
    map = HashMap.set(map, key, deps);  // Immutable update
  }

  return map;
});
```

### Real Usage: Cache with Ref

From `packages/knowledge/server/src/Ontology/OntologyCache.ts`:

```typescript
import * as HashMap from "effect/HashMap";
import * as Ref from "effect/Ref";
import * as O from "effect/Option";
import * as Effect from "effect/Effect";

export class OntologyCache extends Effect.Service<OntologyCache>()("@beep/knowledge-server/OntologyCache", {
  effect: Effect.gen(function* () {
    // Cache storage as Ref<HashMap>
    const cacheRef = yield* Ref.make(HashMap.empty<string, CachedOntology>());

    return {
      get: Effect.fn((key: string) =>
        Effect.gen(function* () {
          const cache = yield* Ref.get(cacheRef);
          const entry = HashMap.get(cache, key);  // Returns Option

          if (O.isNone(entry)) {
            return O.none<ParsedOntology>();
          }

          // Check expiry and return
          const now = yield* DateTime.now;
          if (isExpired(entry.value.loadedAt, now)) {
            return O.none<ParsedOntology>();
          }

          return O.some(entry.value.data);
        })
      ),

      set: Effect.fn((key: string, data: ParsedOntology, content: string) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;
          const cached: CachedOntology = {
            data,
            loadedAt: now,
            contentHash: hashContent(content),
          };

          // Update Ref with new HashMap
          yield* Ref.update(cacheRef, (cache) =>
            HashMap.set(cache, key, cached)
          );
        })
      ),
    };
  }),
}) {}
```

### Converting to/from Arrays

```typescript
import * as HashMap from "effect/HashMap";
import * as A from "effect/Array";

// From array of tuples
const entries: Array<[string, number]> = [["a", 1], ["b", 2]];
const map = HashMap.fromIterable(entries);

// To array of keys
const keys = A.fromIterable(HashMap.keys(map));

// To array of entries
const allEntries = A.fromIterable(HashMap.entries(map));
```

### Structural Equality for Keys

HashMap uses **structural equality** for keys (via `Equal` trait):

```typescript
import * as HashMap from "effect/HashMap";
import { Data } from "effect";

// Works with complex keys
const key1 = Data.struct({ userId: "123", orgId: "456" });
const key2 = Data.struct({ userId: "123", orgId: "456" });

let map = HashMap.empty<typeof key1, string>();
map = HashMap.set(map, key1, "value");

// key2 is structurally equal to key1
HashMap.has(map, key2);  // true
HashMap.get(map, key2);  // Some("value")
```

### Transform Values

```typescript
import * as HashMap from "effect/HashMap";

const prices = HashMap.make(
  ["apple", 1.50],
  ["banana", 0.75],
  ["orange", 2.00]
);

// Double all prices
const doubled = HashMap.map(prices, (price) => price * 2);

// Filter expensive items
const expensive = HashMap.filter(prices, (price) => price > 1.00);
```

## Anti-Patterns

### NEVER Use Mutable Patterns

```typescript
// FORBIDDEN - HashMap is immutable, not mutable
const map = HashMap.empty<string, number>();
HashMap.set(map, "x", 1);  // WRONG - discards result
const value = HashMap.get(map, "x");  // Returns None

// REQUIRED - Use the returned HashMap
let map = HashMap.empty<string, number>();
map = HashMap.set(map, "x", 1);  // Capture new HashMap
const value = HashMap.get(map, "x");  // Returns Some(1)
```

### NEVER Use Non-Null Assertion on Get

```typescript
// FORBIDDEN
const value = HashMap.get(map, key)!;

// REQUIRED - Handle Option properly
import * as O from "effect/Option";

const maybeValue = HashMap.get(map, key);
const value = O.pipe(
  maybeValue,
  O.getOrElse(() => defaultValue)
);
```

### NEVER Use Native Map for Immutable Data

```typescript
// FORBIDDEN - Native Map is mutable
const map = new Map<string, number>();
map.set("a", 1);

// REQUIRED - Use HashMap for functional code
import * as HashMap from "effect/HashMap";
let map = HashMap.empty<string, number>();
map = HashMap.set(map, "a", 1);
```

### Use MutableHashMap for Hot Loops

When building large maps in performance-critical code, consider `MutableHashMap`:

```typescript
// For frequent updates in tight loops
import * as MutableHashMap from "effect/MutableHashMap";

const map = MutableHashMap.empty<string, number>();
for (let i = 0; i < 10000; i++) {
  MutableHashMap.set(map, `key${i}`, i);  // In-place mutation
}

// Convert to immutable when done
const immutable = MutableHashMap.toHashMap(map);
```

See [MutableHashMap.md](./MutableHashMap.md) for mutable variant.

## Related Modules

- **[Option.md](./Option.md)** - `HashMap.get` returns Option
- **[Record.md](./Record.md)** - Use Record for simple string-keyed objects
- **MutableHashMap.md** - Mutable alternative for hot paths
- **[HashSet.md](./HashSet.md)** - Set operations on keys

## Source Reference

[`.repos/effect/packages/effect/src/HashMap.ts`](../../.repos/effect/packages/effect/src/HashMap.ts)

## Key Takeaways

1. **ALWAYS** use `import * as HashMap from "effect/HashMap"`
2. **HashMap is immutable** - operations return new HashMap
3. **`HashMap.get` returns `Option<V>`** - never use non-null assertion
4. **Use structural equality** - keys are compared by value, not reference
5. **Capture return values** - `HashMap.set` and `HashMap.remove` return new maps
6. **Use with Ref** for mutable state in Effect programs
7. **Convert iterables** with `A.fromIterable()` for arrays
8. **Consider MutableHashMap** for hot loops building large maps
