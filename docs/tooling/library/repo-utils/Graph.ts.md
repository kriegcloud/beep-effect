---
title: Graph.ts
nav_order: 8
parent: "@beep/repo-utils"
---

## Graph.ts overview

Graph algorithms for dependency analysis in monorepo workspaces.

Wraps the built-in Effect v4 `Graph` module, converting between
`HashMap<string, HashSet<string>>` adjacency lists (the natural shape for
package dependency data) and the indexed `Graph.DirectedGraph` structure
that the Effect algorithms operate on.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [computeTransitiveClosure](#computetransitiveclosure)
  - [detectCycles](#detectcycles)
  - [topologicalSort](#topologicalsort)
---

# services

## computeTransitiveClosure

Compute the transitive closure of dependencies for a single package.

Returns a `HashSet` of all packages that the given package depends on,
directly or transitively.  The starting package itself is **not** included
unless it participates in a cycle.

Uses BFS traversal via the built-in `Graph.bfs`.

**Example**

```ts
```typescript
import { Effect, HashMap, HashSet } from "effect"
import { computeTransitiveClosure } from "@beep/repo-utils/Graph"

const adj = HashMap.make(["app", HashSet.make("lib")], ["lib", HashSet.empty<string>()])
const program = computeTransitiveClosure(adj, "app")
Effect.runPromise(program).then(console.log)
```
```

**Signature**

```ts
declare const computeTransitiveClosure: { (pkg: string): (adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>) => Effect.Effect<HashSet.HashSet<string>>; (adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>, pkg: string): Effect.Effect<HashSet.HashSet<string>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Graph.ts#L297)

Since v0.0.0

## detectCycles

Detect all cycles in a directed dependency graph.

Uses strongly connected components (Kosaraju's algorithm via the built-in
`Graph.stronglyConnectedComponents`) and then reconstructs explicit cycle
paths of the form `[pkg1, pkg2, ..., pkg1]`.

Returns an empty array when the graph is acyclic.

**Example**

```ts
```typescript
import { Effect, HashMap, HashSet } from "effect"
import { detectCycles } from "@beep/repo-utils/Graph"

const adj = HashMap.make(["app", HashSet.make("lib")], ["lib", HashSet.empty<string>()])
const program = detectCycles(adj)
Effect.runPromise(program).then(console.log)
```
```

**Signature**

```ts
declare const detectCycles: (adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>) => Effect.Effect<ReadonlyArray<ReadonlyArray<string>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Graph.ts#L150)

Since v0.0.0

## topologicalSort

Compute a topological ordering (dependency-first build order) of packages
described by the given adjacency list using Kahn's algorithm.

Dependencies appear **before** their dependents in the returned array so
that every package is built after all of its dependencies.

Fails with `CyclicDependencyError` when the graph contains cycles.

**Example**

```ts
```typescript
import { Effect, HashMap, HashSet } from "effect"
import { topologicalSort } from "@beep/repo-utils/Graph"

const adj = HashMap.make(["app", HashSet.make("lib")], ["lib", HashSet.empty<string>()])
const program = topologicalSort(adj)
Effect.runPromise(program).then(console.log)
```
```

**Signature**

```ts
declare const topologicalSort: (adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>) => Effect.Effect<ReadonlyArray<string>, CyclicDependencyError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Graph.ts#L100)

Since v0.0.0