# HashSet — Agent Context

> Quick reference for AI agents working with `effect/HashSet`

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `HashSet.empty<T>()` | Create empty set | `HashSet.empty<string>()` |
| `HashSet.make(...values)` | Create from values | `HashSet.make(1, 2, 3)` |
| `HashSet.fromIterable(iter)` | Create from iterable | `HashSet.fromIterable(array)` |
| `HashSet.has(set, value)` | Check membership | `HashSet.has(tags, "active")` |
| `HashSet.add(set, value)` | Add element | `HashSet.add(set, "new")` |
| `HashSet.remove(set, value)` | Remove element | `HashSet.remove(set, "old")` |
| `HashSet.size(set)` | Get size | `HashSet.size(set)` |
| `HashSet.isEmpty(set)` | Check if empty | `HashSet.isEmpty(set)` |
| `HashSet.union(set1, set2)` | Union (A ∪ B) | `HashSet.union(set1, set2)` |
| `HashSet.intersection(set1, set2)` | Intersection (A ∩ B) | `HashSet.intersection(set1, set2)` |
| `HashSet.difference(set1, set2)` | Difference (A - B) | `HashSet.difference(set1, set2)` |
| `HashSet.isSubset(set1, set2)` | Check subset | `HashSet.isSubset(subset, superset)` |
| `HashSet.map(set, fn)` | Transform elements | `HashSet.map(set, x => x * 2)` |
| `HashSet.filter(set, pred)` | Filter elements | `HashSet.filter(set, x => x > 0)` |
| `HashSet.values(set)` | Get values iterable | `HashSet.values(set)` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED
import * as HashSet from "effect/HashSet";

// FORBIDDEN
import { HashSet } from "effect";
import { make, add } from "effect/HashSet";
```

### Immutable Operations

HashSet is **immutable**. Operations return a **new** HashSet:

```typescript
import * as HashSet from "effect/HashSet";

// Empty set
let tags = HashSet.empty<string>();

// Add elements (returns new HashSet)
tags = HashSet.add(tags, "typescript");
tags = HashSet.add(tags, "effect");
tags = HashSet.add(tags, "typescript");  // Duplicate - no effect

// Remove element (returns new HashSet)
tags = HashSet.remove(tags, "effect");

// Size is 1 (only "typescript" remains)
HashSet.size(tags);  // 1
```

### Membership Testing

```typescript
import * as HashSet from "effect/HashSet";

const allowedTags = HashSet.make("public", "internal", "deprecated");

// Check membership
if (HashSet.has(allowedTags, userTag)) {
  // Tag is allowed
}

// Check if empty
if (HashSet.isEmpty(tags)) {
  return "No tags";
}
```

### Real Usage: Graph Dependencies

From `tooling/utils/src/repo/Graph.ts`:

```typescript
import * as HashSet from "effect/HashSet";
import * as HashMap from "effect/HashMap";
import * as Effect from "effect/Effect";

export const buildDependencyGraph = Effect.gen(function* () {
  const adjacencyList = HashMap.make<string, HashSet.HashSet<string>>(
    ["pkg-a", HashSet.make("pkg-b", "pkg-c")],
    ["pkg-b", HashSet.make("pkg-c")],
    ["pkg-c", HashSet.empty<string>()],
  );

  // Check if pkg-a depends on pkg-b
  const depsA = HashMap.get(adjacencyList, "pkg-a");
  if (O.isSome(depsA) && HashSet.has(depsA.value, "pkg-b")) {
    // pkg-a depends on pkg-b
  }
});
```

**Pattern**: Use `HashMap<K, HashSet<V>>` for adjacency lists.

### Real Usage: Unique Dependencies

From `tooling/utils/src/repo/Dependencies.ts`:

```typescript
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

export class WorkspaceDeps extends S.Class<WorkspaceDeps>("WorkspaceDeps")({
  workspace: HashSet.make<string>(),
  npm: HashSet.make<string>(),
}) {}

export const extractWorkspaceDependencies = Effect.gen(function* () {
  const pkgJson = yield* readPackageJson(path);

  let workspaceDeps = HashSet.empty<string>();
  let npmDeps = HashSet.empty<string>();

  for (const [name, version] of Object.entries(pkgJson.dependencies ?? {})) {
    if (version.startsWith("workspace:")) {
      workspaceDeps = HashSet.add(workspaceDeps, name);
    } else {
      npmDeps = HashSet.add(npmDeps, name);
    }
  }

  return new WorkspaceDeps({
    workspace: workspaceDeps,
    npm: npmDeps,
  });
});
```

**Pattern**: Build HashSet incrementally, capturing each return value.

### Set Operations

```typescript
import * as HashSet from "effect/HashSet";

const setA = HashSet.make("a", "b", "c");
const setB = HashSet.make("b", "c", "d");

// Union (all elements from both sets)
const unionAB = HashSet.union(setA, setB);  // { "a", "b", "c", "d" }

// Intersection (only common elements)
const intersectAB = HashSet.intersection(setA, setB);  // { "b", "c" }

// Difference (in A but not in B)
const diffAB = HashSet.difference(setA, setB);  // { "a" }

// Subset check
const isSub = HashSet.isSubset(
  HashSet.make("b", "c"),
  setA
);  // true
```

### Converting to/from Arrays

```typescript
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";

// From array (removes duplicates)
const values = [1, 2, 2, 3, 3, 3];
const set = HashSet.fromIterable(values);  // { 1, 2, 3 }

// To array
const uniqueValues = A.fromIterable(HashSet.values(set));  // [1, 2, 3]
```

### Filter and Transform

```typescript
import * as HashSet from "effect/HashSet";

const numbers = HashSet.make(1, 2, 3, 4, 5);

// Filter positive even numbers
const evens = HashSet.filter(numbers, (n) => n % 2 === 0);  // { 2, 4 }

// Transform elements (returns new HashSet)
const doubled = HashSet.map(numbers, (n) => n * 2);  // { 2, 4, 6, 8, 10 }
```

### Structural Equality

HashSet uses **structural equality** for elements (via `Equal` trait):

```typescript
import * as HashSet from "effect/HashSet";
import { Data } from "effect";

// Works with complex values
const key1 = Data.struct({ userId: "123", role: "admin" });
const key2 = Data.struct({ userId: "123", role: "admin" });

let set = HashSet.empty<typeof key1>();
set = HashSet.add(set, key1);

// key2 is structurally equal to key1
HashSet.has(set, key2);  // true
HashSet.size(set);  // 1 (no duplicate)
```

### Real Usage: Dependency Tracking

From `tooling/utils/src/repo/UniqueDependencies.ts`:

```typescript
import * as HashSet from "effect/HashSet";
import * as HashMap from "effect/HashMap";
import * as A from "effect/Array";
import * as F from "effect/Function";

export const collectUniqueNpmDependencies = Effect.gen(function* () {
  const depIndex = yield* buildRepoDependencyIndex;

  let allNpmDeps = HashSet.empty<string>();
  let allNpmDevDeps = HashSet.empty<string>();

  const entries = A.fromIterable(HashMap.values(depIndex));

  for (const workspace of entries) {
    allNpmDeps = F.pipe(
      allNpmDeps,
      HashSet.union(workspace.dependencies.npm)
    );

    allNpmDevDeps = F.pipe(
      allNpmDevDeps,
      HashSet.union(workspace.devDependencies.npm)
    );
  }

  return {
    dependencies: allNpmDeps,
    devDependencies: allNpmDevDeps,
  };
});
```

**Pattern**: Use `HashSet.union` to accumulate unique values across multiple sets.

## Anti-Patterns

### NEVER Use Mutable Patterns

```typescript
// FORBIDDEN - HashSet is immutable
const set = HashSet.empty<string>();
HashSet.add(set, "value");  // WRONG - discards result
HashSet.has(set, "value");  // false

// REQUIRED - Capture return values
let set = HashSet.empty<string>();
set = HashSet.add(set, "value");  // Capture new set
HashSet.has(set, "value");  // true
```

### NEVER Use Native Set for Immutable Data

```typescript
// FORBIDDEN - Native Set is mutable
const tags = new Set<string>();
tags.add("typescript");

// REQUIRED - Use HashSet for functional code
import * as HashSet from "effect/HashSet";
let tags = HashSet.empty<string>();
tags = HashSet.add(tags, "typescript");
```

### NEVER Use Array for Uniqueness

```typescript
// FORBIDDEN - Inefficient uniqueness check
const unique = array.filter((v, i, arr) => arr.indexOf(v) === i);

// REQUIRED - Use HashSet
import * as HashSet from "effect/HashSet";
import * as A from "effect/Array";

const unique = A.fromIterable(
  HashSet.values(HashSet.fromIterable(array))
);
```

### Use MutableHashSet for Hot Loops

When building large sets in performance-critical code, consider `MutableHashSet`:

```typescript
// For frequent adds in tight loops
import * as MutableHashSet from "effect/MutableHashSet";

const set = MutableHashSet.empty<string>();
for (let i = 0; i < 10000; i++) {
  MutableHashSet.add(set, `item${i}`);  // In-place mutation
}

// Convert to immutable when done
const immutable = MutableHashSet.toHashSet(set);
```

See MutableHashSet.md for mutable variant.

### NEVER Use Array.includes for Membership

```typescript
// FORBIDDEN - O(n) lookup
if (allowedValues.includes(value)) { }

// REQUIRED - O(1) average lookup with HashSet
import * as HashSet from "effect/HashSet";

const allowed = HashSet.fromIterable(allowedValues);
if (HashSet.has(allowed, value)) { }
```

## Related Modules

- **[HashMap.md](./HashMap.md)** - Use `HashMap<K, HashSet<V>>` for adjacency lists
- **[Array.md](./Array.md)** - Convert with `A.fromIterable(HashSet.values(set))`
- **MutableHashSet.md** - Mutable alternative for hot paths
- **effect/Data** - Structural equality for complex elements

## Source Reference

[`.repos/effect/packages/effect/src/HashSet.ts`](../../.repos/effect/packages/effect/src/HashSet.ts)

## Key Takeaways

1. **ALWAYS** use `import * as HashSet from "effect/HashSet"`
2. **HashSet is immutable** - operations return new HashSet
3. **Ensures uniqueness** - duplicate adds have no effect
4. **O(1) membership testing** - faster than array lookup
5. **Use for set operations** - union, intersection, difference
6. **Structural equality** - elements compared by value
7. **Capture return values** - `HashSet.add` returns new set
8. **Use with HashMap** - `HashMap<K, HashSet<V>>` for adjacency lists
9. **Convert with A.fromIterable** - `A.fromIterable(HashSet.values(set))`
10. **Consider MutableHashSet** - for hot loops building large sets
