# Effect v4 API Corrections for @beep/repo-utils

**Date:** 2026-02-19
**Status:** ✅ Verified against `.repos/effect-v4/packages/effect/`

---

## CRITICAL: Handoff Documentation Corrections

The original handoff documentation was written with Effect v3 patterns. This document provides the **verified Effect v4 corrections** based on actual source code analysis.

---

## API Corrections

### 1. ❌ Context.GenericTag → ✅ ServiceMap.Service

**WRONG (v3 pattern in handoff):**
```typescript
import * as Context from "effect/Context"
const FsUtils = Context.GenericTag<FsUtils>("@beep/repo-utils/FsUtils")
```

**CORRECT (Effect v4):**
```typescript
import { ServiceMap } from "effect"

// Simple pattern
const FsUtils = ServiceMap.Service<FsUtils>("@beep/repo-utils/FsUtils")

// Class-based pattern (PREFERRED)
class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()("@beep/repo-utils/FsUtils", {
  make: Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path
    return {
      glob: (pattern: string) => /* implementation */,
      readJson: (path: string) => /* implementation */,
      // ...
    }
  })
}) {}
```

**Why:** The entire `Context` module is gone from Effect v4. It's not exported from the barrel `index.ts`.

---

### 2. ❌ @effect/platform imports → ✅ effect package imports

**WRONG (handoff):**
```typescript
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
```

**CORRECT (Effect v4):**
```typescript
import { FileSystem, Path, PlatformError } from "effect"

// Service access in Effect.gen
const fs = yield* FileSystem.FileSystem
const path = yield* Path.Path
```

**Layer imports (still from platform-node):**
```typescript
import { NodeFileSystem, NodePath, NodeServices } from "@effect/platform-node"

// Provide layers
const program = myEffect.pipe(
  Effect.provide([NodeFileSystem.layer, NodePath.layer])
)
```

**Why:** FileSystem and Path abstractions moved to the main `effect` package in v4. Only the Node.js implementations remain in `@effect/platform-node`.

**Impact on package.json:**
- May not need `@effect/platform` as a dependency
- Only need `@effect/platform-node` for Node implementations

---

### 3. ❌ S.decode → ✅ S.decodeUnknownEffect / S.decodeUnknownSync

**WRONG (handoff):**
```typescript
const result = S.decode(PackageJson)(jsonData)
```

**CORRECT (Effect v4):**
```typescript
// Effectful decoding
const parsePackageJson = (data: unknown) =>
  S.decodeUnknownEffect(PackageJson)(data)  // Returns: Effect<Type, SchemaError>

// Synchronous decoding (throws on error)
const parsePackageJsonSync = (data: unknown) =>
  S.decodeUnknownSync(PackageJson)(data)

// Also available
S.decodeSync(PackageJson)(data)  // From encoded type, not unknown
```

**Why:** `S.decode` doesn't exist in v4. Use the explicit effectful or sync variants.

---

### 4. ❌ HashMap.toIterable / HashSet.toIterable → ✅ Direct iteration

**WRONG (handoff):**
```typescript
for (const [key, value] of HashMap.toIterable(myMap)) {
  // ...
}
```

**CORRECT (Effect v4):**
```typescript
// HashMap and HashSet implement Iterable directly
for (const [key, value] of myMap) {
  // ...
}

// Or use explicit iterators
for (const [key, value] of HashMap.entries(myMap)) {
  // ...
}
```

**Why:** Both `HashMap` and `HashSet` implement the `Iterable` interface directly in v4.

---

### 5. ❌ Layer.scoped → ✅ Layer.effect (handles scoping automatically)

**WRONG (handoff):**
```typescript
const myLayer = Layer.scoped(MyService, scopedEffect)
```

**CORRECT (Effect v4):**
```typescript
// Layer.effect already handles scoped resources
const myLayer = Layer.effect(MyService, effectfulConstruction)

// For static values
const myLayer = Layer.succeed(MyService, staticValue)

// For lazy values
const myLayer = Layer.sync(MyService, () => computedValue)
```

**Why:** `Layer.effect` already excludes `Scope` from the requirements type. No separate `Layer.scoped` needed.

---

## New Capabilities

### Built-in Graph Module (MAJOR)

Effect v4 has a **built-in Graph module** that eliminates the need to implement graph algorithms from scratch!

**Available APIs:**
```typescript
import { Graph } from "effect"

// Create graphs
const g = Graph.directed<string, string>()
const g2 = Graph.undirected<string, string>()

// Build graphs
Graph.addNode(graph, "node1")
Graph.addEdge(graph, "node1", "node2")

// Algorithms
Graph.topo(graph)           // Topological sort (Kahn's algorithm)
Graph.isAcyclic(graph)      // Cycle detection
Graph.dfs(graph, "start")   // Depth-first search
Graph.bfs(graph, "start")   // Breadth-first search
Graph.dfsPostOrder(graph)   // DFS post-order traversal
```

**Impact on Task #11:** Instead of implementing Kahn's algorithm and cycle detection from scratch, wrap the built-in Graph module with conversion functions from HashMap<package, HashSet<deps>> to Graph structure.

---

### ServiceMap.Service with embedded construction

Services can embed their own layer construction:

```typescript
class FsUtils extends ServiceMap.Service<FsUtils, FsUtilsShape>()("FsUtils", {
  make: Effect.gen(function*() {
    const fs = yield* FileSystem.FileSystem
    return { /* implementation */ }
  })
}) {}

// Then use: FsUtils.make (the Effect for constructing the service)
```

---

### Effect.provide accepts arrays

Effect v4 allows providing multiple layers at once:

```typescript
const program = myEffect.pipe(
  Effect.provide([LayerA, LayerB, LayerC])  // Array of layers!
)
```

---

## Verified Correct APIs

These patterns from the handoff are **correct** and work in Effect v4:

✅ **Data.TaggedError:**
```typescript
class NoSuchFileError extends Data.TaggedError("NoSuchFileError")<{
  path: string
  message: string
}> {}
```

✅ **S.Struct (capital S):**
```typescript
const PackageJson = S.Struct({
  name: S.String,
  version: S.optional(S.String),
})
```

✅ **Effect.gen:**
```typescript
Effect.gen(function*() {
  const result = yield* someEffect
  return result
})
```

✅ **Layer.effect:**
```typescript
Layer.effect(service, effect)
```

✅ **HashMap and HashSet:**
```typescript
HashMap.empty(), HashMap.make(), HashMap.set(), HashMap.get()
HashSet.empty(), HashSet.make(), HashSet.add(), HashSet.has()
```

✅ **@effect/vitest:**
```typescript
import { describe, expect, it } from "@effect/vitest"
it.effect("test name", () => Effect.gen(function*() { /* ... */ }))
```

---

## Complete Import Map

```typescript
// Services
import { ServiceMap } from "effect"  // NOT Context

// Platform
import { FileSystem, Path, PlatformError } from "effect"  // NOT @effect/platform
import { NodeFileSystem, NodePath } from "@effect/platform-node"  // Layers

// Schema
import * as S from "effect/Schema"
S.decodeUnknownEffect(schema)(data)  // NOT S.decode

// Data structures
import { HashMap, HashSet } from "effect"
for (const [k, v] of map) { /* ... */ }  // NOT HashMap.toIterable

// Graph algorithms (NEW!)
import { Graph } from "effect"
Graph.topo(), Graph.isAcyclic(), Graph.dfs()

// Errors
import { Data } from "effect"
class MyError extends Data.TaggedError("MyError")<{ /* ... */ }> {}

// Testing
import { describe, expect, it } from "@effect/vitest"
```

---

## Summary of Impact

| Component | Status | Action Required |
|-----------|--------|-----------------|
| **Task #4 (FsUtils)** | ⚠️ Blocked | Update to use ServiceMap.Service, correct FileSystem/Path imports |
| **Task #5 (Root)** | ⚠️ Blocked | Update FileSystem/Path imports |
| **Task #6 (Workspaces)** | ⚠️ Blocked | Update imports, use S.decodeUnknownEffect |
| **Task #7 (Dependencies)** | ⚠️ Blocked | Use S.decodeUnknownEffect |
| **Task #11 (Graph)** | ✅ Simplified | Use built-in Graph module instead of implementing from scratch |
| **All tasks** | ⚠️ | Replace Context.GenericTag with ServiceMap.Service |
| **Handoff doc** | ❌ Outdated | Needs complete rewrite with v4 patterns |

---

## Testing Recommendations

When implementing, verify each API against `.repos/effect-v4/packages/effect/` source:

1. Check barrel exports in `index.ts` first
2. Read JSDoc examples in the source files
3. Test with actual Effect v4 runtime
4. If compilation fails, assume the API doesn't exist and search for alternatives

---

**Last Updated:** 2026-02-19
**Verified By:** effect-v4-verifier agent
**Source:** `.repos/effect-v4/packages/effect/`
