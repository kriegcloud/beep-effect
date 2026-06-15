---
title: GraphOps.ts
nav_order: 27
parent: "@beep/nlp"
---

## GraphOps.ts overview

GraphOps - generic categorical operations over `effect/Graph` directed graphs.

Structure-preserving and structure-querying operations with mathematical
foundations: functorial `mapNodes`/`mapEdges`/`bimap`, monoidal folds,
indexed search, effectful traversals, and streaming for large graphs. Graphs
form a category whose morphisms are structure-preserving maps; functors
preserve identity and composition; the index/query pair supports lookup by
derived keys.

Effect v4 `@beep/nlp` implementation notes:
- type-changing `mapNodes`/`mapEdges`/`bimap`/`mapNodesEffect` RECONSTRUCT the
  graph with an old→new index remap because v4's in-place `Graph.mapNodes`
  cannot change the node type.
- native keyed/set collections become `HashMap`/`HashSet` (and `MutableHashMap`
  for the local index remap); `Array#push`/`forEach`/`!` become `effect/Array` + folds.
- `merge` remaps and copies the second graph's edges.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [merge](#merge)
- [constructors](#constructors)
  - [empty](#empty)
  - [singleton](#singleton)
- [filtering](#filtering)
  - [filterEdges](#filteredges)
  - [filterNodes](#filternodes)
- [folding](#folding)
  - [foldNodes](#foldnodes)
  - [foldTraversal](#foldtraversal)
- [getters](#getters)
  - [collectNodes](#collectnodes)
  - [collectTraversal](#collecttraversal)
  - [edgeCount](#edgecount)
  - [findNodes](#findnodes)
  - [getChildren](#getchildren)
  - [getLeaves](#getleaves)
  - [getNode](#getnode)
  - [getRoots](#getroots)
  - [isEmpty](#isempty)
  - [nodeCount](#nodecount)
- [mapping](#mapping)
  - [bimap](#bimap)
  - [mapEdges](#mapedges)
  - [mapNodes](#mapnodes)
  - [mapNodesEffect](#mapnodeseffect)
- [models](#models)
  - [DirectedGraph (type alias)](#directedgraph-type-alias)
  - [NodeIndex (type alias)](#nodeindex-type-alias)
  - [NodeWalker (type alias)](#nodewalker-type-alias)
  - [SearchIndex (interface)](#searchindex-interface)
- [queries](#queries)
  - [buildIndex](#buildindex)
  - [queryIndex](#queryindex)
  - [queryIndexIntersection](#queryindexintersection)
  - [queryIndexUnion](#queryindexunion)
- [schemas](#schemas)
  - [TraversalOrder](#traversalorder)
- [sequencing](#sequencing)
  - [traverseNodes](#traversenodes)
  - [traverseNodesCollect](#traversenodescollect)
- [streams](#streams)
  - [batchNodes](#batchnodes)
  - [streamNodes](#streamnodes)
  - [streamNodesWithIndex](#streamnodeswithindex)
- [type-level](#type-level)
  - [TraversalOrder (type alias)](#traversalorder-type-alias)
- [utilities](#utilities)
  - [isAcyclic](#isacyclic)
  - [stronglyConnectedComponents](#stronglyconnectedcomponents)
---

# combinators

## merge

Merge two graphs, copying the second graph's nodes and edges into the first
with a fresh index remap (the second graph's indices are reallocated).

**Example**

```ts
import { merge, nodeCount, singleton } from "@beep/nlp/Graph/GraphOps"

const merged = merge(singleton<string, string>("left"), singleton<string, string>("right"))
console.log(nodeCount(merged)) // 2
```

**Signature**

```ts
declare const merge: { <A, E>(g1: DirectedGraph<A, E>, g2: DirectedGraph<A, E>): DirectedGraph<A, E>; <A, E>(g2: DirectedGraph<A, E>): (g1: DirectedGraph<A, E>) => DirectedGraph<A, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L1065)

Since v0.0.0

# constructors

## empty

Create an empty directed graph.

**Example**

```ts
import { empty, nodeCount } from "@beep/nlp/Graph/GraphOps"

console.log(nodeCount(empty<string, string>())) // 0
```

**Signature**

```ts
declare const empty: <A, E>() => DirectedGraph<A, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L1030)

Since v0.0.0

## singleton

Create a graph with one root node and no edges.

**Example**

```ts
import { collectNodes, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(collectNodes(singleton<string, string>("root"))) // ["root"]
```

**Signature**

```ts
declare const singleton: <A, E>(node: A) => DirectedGraph<A, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L1045)

Since v0.0.0

# filtering

## filterEdges

Keep matching edges while preserving all nodes.

**Example**

```ts
import { filterEdges, nodeCount, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = filterEdges(singleton<string, string>("root"), (edge) => edge === "contains")
console.log(nodeCount(graph)) // 1
```

**Signature**

```ts
declare const filterEdges: { <A, E>(graph: DirectedGraph<A, E>, predicate: (edge: E) => boolean): DirectedGraph<A, E>; <A, E>(predicate: (edge: E) => boolean): (graph: DirectedGraph<A, E>) => DirectedGraph<A, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L322)

Since v0.0.0

## filterNodes

Keep matching nodes and remove edges touching dropped nodes.

**Example**

```ts
import { filterNodes, nodeCount, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = filterNodes(singleton<string, string>("root"), (node) => node.startsWith("r"))
console.log(nodeCount(graph)) // 1
```

**Signature**

```ts
declare const filterNodes: { <A, E>(graph: DirectedGraph<A, E>, predicate: (node: A) => boolean): DirectedGraph<A, E>; <A, E>(predicate: (node: A) => boolean): (graph: DirectedGraph<A, E>) => DirectedGraph<A, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L299)

Since v0.0.0

# folding

## foldNodes

Fold all node payloads in the backing graph's iteration order.

**Example**

```ts
import { foldNodes, singleton } from "@beep/nlp/Graph/GraphOps"

const total = foldNodes(singleton<string, string>("root"), 0, (sum, node) => sum + node.length)
console.log(total) // 4
```

**Signature**

```ts
declare const foldNodes: { <A, E, B>(graph: DirectedGraph<A, E>, initial: B, f: (acc: B, node: A) => B): B; <A, E, B>(initial: B, f: (acc: B, node: A) => B): (graph: DirectedGraph<A, E>) => B; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L372)

Since v0.0.0

## foldTraversal

Fold node payloads in `dfs`, `bfs`, or topological traversal order.

**Example**

```ts
import { foldTraversal, getRoots, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const total = foldTraversal(graph, getRoots(graph), "dfs", 0, (sum, node) => sum + node.length)
console.log(total) // 4
```

**Signature**

```ts
declare const foldTraversal: { <A, E, B>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder, initial: B, f: (acc: B, node: A, index: NodeIndex) => B): B; <A, E, B>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder, initial: B, f: (acc: B, node: A, index: NodeIndex) => B): (graph: DirectedGraph<A, E>) => B; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L396)

Since v0.0.0

# getters

## collectNodes

Collect every node payload in the backing graph's iteration order.

**Example**

```ts
import { collectNodes, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(collectNodes(singleton<string, string>("root"))) // ["root"]
```

**Signature**

```ts
declare const collectNodes: <A, E>(graph: DirectedGraph<A, E>) => ReadonlyArray<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L437)

Since v0.0.0

## collectTraversal

Collect node payloads in `dfs`, `bfs`, or topological traversal order.

**Example**

```ts
import { collectTraversal, getRoots, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
console.log(collectTraversal(graph, getRoots(graph), "dfs")) // ["root"]
```

**Signature**

```ts
declare const collectTraversal: { <A, E>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder): ReadonlyArray<A>; <A, E>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder): (graph: DirectedGraph<A, E>) => ReadonlyArray<A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L454)

Since v0.0.0

## edgeCount

Count edges in the graph.

**Example**

```ts
import { edgeCount, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(edgeCount(singleton<string, string>("root"))) // 0
```

**Signature**

```ts
declare const edgeCount: <A, E>(graph: DirectedGraph<A, E>) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L996)

Since v0.0.0

## findNodes

Find node indices whose payload matches a predicate.

**Example**

```ts
import { findNodes, singleton } from "@beep/nlp/Graph/GraphOps"

const indices = findNodes(singleton<string, string>("root"), (node) => node === "root")
console.log(indices.length) // 1
```

**Signature**

```ts
declare const findNodes: { <A, E>(graph: DirectedGraph<A, E>, predicate: (node: A) => boolean): ReadonlyArray<NodeIndex>; <A, E>(predicate: (node: A) => boolean): (graph: DirectedGraph<A, E>) => ReadonlyArray<NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L345)

Since v0.0.0

## getChildren

Return direct outgoing neighbor indices for a node.

**Example**

```ts
import { getChildren, getRoots, singleton } from "@beep/nlp/Graph/GraphOps"
import * as A from "effect/Array"
import * as O from "effect/Option"

const graph = singleton<string, string>("root")
const children = O.match(A.head(getRoots(graph)), {
  onNone: () => [],
  onSome: (root) => getChildren(graph, root)
})

console.log(children.length) // 0
```

**Signature**

```ts
declare const getChildren: { <A, E>(graph: DirectedGraph<A, E>, nodeIndex: NodeIndex): ReadonlyArray<NodeIndex>; <A, E>(nodeIndex: NodeIndex): (graph: DirectedGraph<A, E>) => ReadonlyArray<NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L520)

Since v0.0.0

## getLeaves

Return node indices with no outgoing edges.

**Example**

```ts
import { getLeaves, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(getLeaves(singleton<string, string>("root")).length) // 1
```

**Signature**

```ts
declare const getLeaves: <A, E>(graph: DirectedGraph<A, E>) => ReadonlyArray<NodeIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L496)

Since v0.0.0

## getNode

Return node payload at an index, when the index exists.

**Example**

```ts
import { getNode, getRoots, singleton } from "@beep/nlp/Graph/GraphOps"
import * as A from "effect/Array"
import * as O from "effect/Option"

const graph = singleton<string, string>("root")
const rootText = O.flatMap(A.head(getRoots(graph)), (root) => getNode(graph, root))

console.log(O.getOrElse(rootText, () => "missing")) // "root"
```

**Signature**

```ts
declare const getNode: { <A, E>(graph: DirectedGraph<A, E>, nodeIndex: NodeIndex): O.Option<A>; <A, E>(nodeIndex: NodeIndex): (graph: DirectedGraph<A, E>) => O.Option<A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L547)

Since v0.0.0

## getRoots

Return node indices with no incoming edges.

**Example**

```ts
import { getRoots, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(getRoots(singleton<string, string>("root")).length) // 1
```

**Signature**

```ts
declare const getRoots: <A, E>(graph: DirectedGraph<A, E>) => ReadonlyArray<NodeIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L480)

Since v0.0.0

## isEmpty

Check whether a graph has no nodes.

**Example**

```ts
import { empty, isEmpty } from "@beep/nlp/Graph/GraphOps"

console.log(isEmpty(empty<string, string>())) // true
```

**Signature**

```ts
declare const isEmpty: <A, E>(graph: DirectedGraph<A, E>) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L1011)

Since v0.0.0

## nodeCount

Count nodes in the graph.

**Example**

```ts
import { nodeCount, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(nodeCount(singleton<string, string>("root"))) // 1
```

**Signature**

```ts
declare const nodeCount: <A, E>(graph: DirectedGraph<A, E>) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L981)

Since v0.0.0

# mapping

## bimap

Map node and edge data in one reconstruction pass.

**Example**

```ts
import { bimap, collectNodes, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = bimap(
  singleton<string, string>("root"),
  (node) => node.length,
  (edge) => edge.length
)

console.log(collectNodes(graph)) // [4]
```

**Signature**

```ts
declare const bimap: { <A, B, E, F>(graph: DirectedGraph<A, E>, nodeF: (node: A) => B, edgeF: (edge: E) => F): DirectedGraph<B, F>; <A, B, E, F>(nodeF: (node: A) => B, edgeF: (edge: E) => F): (graph: DirectedGraph<A, E>) => DirectedGraph<B, F>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L266)

Since v0.0.0

## mapEdges

Map edge data while preserving node payloads and connectivity.

**Example**

```ts
import { edgeCount, mapEdges, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = mapEdges(singleton<string, string>("root"), (edge) => edge.toUpperCase())
console.log(edgeCount(graph)) // 0
```

**Signature**

```ts
declare const mapEdges: { <A, E, F>(graph: DirectedGraph<A, E>, f: (edge: E) => F): DirectedGraph<A, F>; <A, E, F>(f: (edge: E) => F): (graph: DirectedGraph<A, E>) => DirectedGraph<A, F>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L238)

Since v0.0.0

## mapNodes

Map node data while preserving every surviving edge.

**Example**

```ts
import { collectNodes, mapNodes, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = mapNodes(singleton<string, string>("root"), (node) => node.length)
console.log(collectNodes(graph)) // [4]
```

**Signature**

```ts
declare const mapNodes: { <A, B, E>(graph: DirectedGraph<A, E>, f: (node: A) => B): DirectedGraph<B, E>; <A, B, E>(f: (node: A) => B): (graph: DirectedGraph<A, E>) => DirectedGraph<B, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L215)

Since v0.0.0

## mapNodesEffect

Map node payloads with an effectful function and reconstruct the graph.

**Example**

```ts
import { Effect } from "effect"
import { collectNodes, mapNodesEffect, singleton } from "@beep/nlp/Graph/GraphOps"

const program = Effect.map(
  mapNodesEffect(singleton<string, string>("root"), (node) => Effect.succeed(node.length)),
  collectNodes
)

console.log(Effect.runSync(program)) // [4]
```

**Signature**

```ts
declare const mapNodesEffect: { <A, B, E, Err, R>(graph: DirectedGraph<A, E>, f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>): Effect.Effect<DirectedGraph<B, E>, Err, R>; <A, B, E, Err, R>(f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>): (graph: DirectedGraph<A, E>) => Effect.Effect<DirectedGraph<B, E>, Err, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L795)

Since v0.0.0

# models

## DirectedGraph (type alias)

Alias for Effect's directed graph type used by generic graph utilities.

**Example**

```ts
import { empty, nodeCount, type DirectedGraph } from "@beep/nlp/Graph/GraphOps"

const graph: DirectedGraph<string, string> = empty()
console.log(nodeCount(graph)) // 0
```

**Signature**

```ts
type DirectedGraph<A, E> = Graph.DirectedGraph<A, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L50)

Since v0.0.0

## NodeIndex (type alias)

Stable node index allocated by the backing `effect/Graph`.

**Example**

```ts
import { getRoots, singleton, type NodeIndex } from "@beep/nlp/Graph/GraphOps"
import * as A from "effect/Array"
import * as O from "effect/Option"

const firstRoot: O.Option<NodeIndex> = A.head(getRoots(singleton<string, string>("root")))
console.log(O.isSome(firstRoot)) // true
```

**Signature**

```ts
type NodeIndex = Graph.NodeIndex
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L68)

Since v0.0.0

## NodeWalker (type alias)

Effect graph walker used for ordered graph traversals.

**Example**

```ts
import type { NodeWalker } from "@beep/nlp/Graph/GraphOps"

const consume = <A>(walker: NodeWalker<A>) => walker
console.log(consume)
```

**Signature**

```ts
type NodeWalker<A> = Graph.NodeWalker<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L84)

Since v0.0.0

## SearchIndex (interface)

An immutable search index mapping search keys to node indices, paired with the
key-extraction function that produced it (the `index` side of `query ⊣ index`).

**Example**

```ts
import { buildIndex, singleton, type SearchIndex } from "@beep/nlp/Graph/GraphOps"

const index: SearchIndex<string, string> = buildIndex(
  singleton<string, string>("Root"),
  (node) => [node.toLowerCase()]
)

console.log(index.keyFn("Root")) // ["root"]
```

**Signature**

```ts
export interface SearchIndex<K, A> {
  readonly index: HashMap.HashMap<K, ReadonlyArray<NodeIndex>>;
  readonly keyFn: (node: A) => ReadonlyArray<K>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L105)

Since v0.0.0

# queries

## buildIndex

Build a search index from keys extracted from each node payload.

**Example**

```ts
import { buildIndex, queryIndex, singleton } from "@beep/nlp/Graph/GraphOps"

const index = buildIndex(singleton<string, string>("Root"), (node) => [node.toLowerCase()])
console.log(queryIndex(index, "root").length) // 1
```

**Signature**

```ts
declare const buildIndex: { <A, E, K>(graph: DirectedGraph<A, E>, keyFn: (node: A) => ReadonlyArray<K>): SearchIndex<K, A>; <A, E, K>(keyFn: (node: A) => ReadonlyArray<K>): (graph: DirectedGraph<A, E>) => SearchIndex<K, A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L574)

Since v0.0.0

## queryIndex

Query a search index for one key.

**Example**

```ts
import { buildIndex, queryIndex, singleton } from "@beep/nlp/Graph/GraphOps"

const index = buildIndex(singleton<string, string>("Root"), (node) => [node.toLowerCase()])
console.log(queryIndex(index, "missing").length) // 0
```

**Signature**

```ts
declare const queryIndex: { <K, A>(searchIndex: SearchIndex<K, A>, key: K): ReadonlyArray<NodeIndex>; <K, A>(key: K): (searchIndex: SearchIndex<K, A>) => ReadonlyArray<NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L608)

Since v0.0.0

## queryIndexIntersection

Query a search index for indices present under every supplied key.

**Example**

```ts
import { buildIndex, queryIndexIntersection, singleton } from "@beep/nlp/Graph/GraphOps"

const index = buildIndex(singleton<string, string>("Root"), (node) => [node, node.toLowerCase()])
console.log(queryIndexIntersection(index, ["Root", "root"]).length) // 1
```

**Signature**

```ts
declare const queryIndexIntersection: { <K, A>(searchIndex: SearchIndex<K, A>, keys: ReadonlyArray<K>): ReadonlyArray<NodeIndex>; <K, A>(keys: ReadonlyArray<K>): (searchIndex: SearchIndex<K, A>) => ReadonlyArray<NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L658)

Since v0.0.0

## queryIndexUnion

Query a search index for any matching key, returning deduplicated indices.

**Example**

```ts
import { buildIndex, queryIndexUnion, singleton } from "@beep/nlp/Graph/GraphOps"

const index = buildIndex(singleton<string, string>("Root"), (node) => [node, node.toLowerCase()])
console.log(queryIndexUnion(index, ["Root", "root"]).length) // 1
```

**Signature**

```ts
declare const queryIndexUnion: { <K, A>(searchIndex: SearchIndex<K, A>, keys: ReadonlyArray<K>): ReadonlyArray<NodeIndex>; <K, A>(keys: ReadonlyArray<K>): (searchIndex: SearchIndex<K, A>) => ReadonlyArray<NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L631)

Since v0.0.0

# schemas

## TraversalOrder

Traversal order for ordered folds, walkers, streams, and batches.

**Example**

```ts
import { TraversalOrder } from "@beep/nlp/Graph/GraphOps"

console.log(TraversalOrder.is.dfs("dfs")) // true
```

**Signature**

```ts
declare const TraversalOrder: LiteralKit<readonly ["dfs", "bfs", "topo"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L123)

Since v0.0.0

# sequencing

## traverseNodes

Traverse nodes in order, running one effect per visited node.

**Example**

```ts
import { Effect } from "effect"
import { getRoots, singleton, traverseNodes } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const program = traverseNodes(graph, getRoots(graph), "dfs", () => Effect.void)

console.log(Effect.runSync(program))
```

**Signature**

```ts
declare const traverseNodes: { <A, E, R, Err>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder, f: (node: A, index: NodeIndex) => Effect.Effect<void, Err, R>): Effect.Effect<void, Err, R>; <A, E, R, Err>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder, f: (node: A, index: NodeIndex) => Effect.Effect<void, Err, R>): (graph: DirectedGraph<A, E>) => Effect.Effect<void, Err, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L701)

Since v0.0.0

## traverseNodesCollect

Traverse nodes in order and collect each effect result.

**Example**

```ts
import { Effect } from "effect"
import { getRoots, singleton, traverseNodesCollect } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const program = traverseNodesCollect(graph, getRoots(graph), "dfs", (node) =>
  Effect.succeed(node.length)
)

console.log(Effect.runSync(program)) // [4]
```

**Signature**

```ts
declare const traverseNodesCollect: { <A, E, B, Err, R>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder, f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>): Effect.Effect<ReadonlyArray<B>, Err, R>; <A, E, B, Err, R>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder, f: (node: A, index: NodeIndex) => Effect.Effect<B, Err, R>): (graph: DirectedGraph<A, E>) => Effect.Effect<ReadonlyArray<B>, Err, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L749)

Since v0.0.0

# streams

## batchNodes

Stream node payloads in fixed-size traversal batches.

**Example**

```ts
import { Effect, Stream } from "effect"
import { batchNodes, getRoots, singleton } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const program = Stream.runCollect(batchNodes(graph, getRoots(graph), "dfs", 2))

console.log(Effect.runSync(program).length) // 1
```

**Signature**

```ts
declare const batchNodes: { <A, E>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder, batchSize: number): Stream.Stream<ReadonlyArray<A>>; <A, E>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder, batchSize: number): (graph: DirectedGraph<A, E>) => Stream.Stream<ReadonlyArray<A>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L909)

Since v0.0.0

## streamNodes

Stream node payloads in traversal order.

**Example**

```ts
import { Effect, Stream } from "effect"
import { getRoots, singleton, streamNodes } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const program = Stream.runCollect(streamNodes(graph, getRoots(graph), "dfs"))

console.log(Effect.runSync(program))
```

**Signature**

```ts
declare const streamNodes: { <A, E>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder): Stream.Stream<A>; <A, E>(start: ReadonlyArray<NodeIndex>, order: TraversalOrder): (graph: DirectedGraph<A, E>) => Stream.Stream<A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L854)

Since v0.0.0

## streamNodesWithIndex

Stream node-index and payload pairs in traversal order.

**Example**

```ts
import { Effect, Stream } from "effect"
import { getRoots, singleton, streamNodesWithIndex } from "@beep/nlp/Graph/GraphOps"

const graph = singleton<string, string>("root")
const program = Stream.runCollect(streamNodesWithIndex(graph, getRoots(graph), "dfs"))

console.log(Effect.runSync(program).length) // 1
```

**Signature**

```ts
declare const streamNodesWithIndex: { <A, E>(graph: DirectedGraph<A, E>, start: ReadonlyArray<NodeIndex>, order: TraversalOrder): Stream.Stream<readonly [NodeIndex, A]>; (start: ReadonlyArray<NodeIndex>, order: TraversalOrder): <A, E>(graph: DirectedGraph<A, E>) => Stream.Stream<readonly [NodeIndex, A]>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L880)

Since v0.0.0

# type-level

## TraversalOrder (type alias)

Runtime type for graph traversal order values.

**Example**

```ts
import type { TraversalOrder } from "@beep/nlp/Graph/GraphOps"

const order: TraversalOrder = "dfs"
console.log(order)
```

**Signature**

```ts
type TraversalOrder = typeof TraversalOrder.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L143)

Since v0.0.0

# utilities

## isAcyclic

Check whether a graph has no directed cycles.

**Example**

```ts
import { isAcyclic, singleton } from "@beep/nlp/Graph/GraphOps"

console.log(isAcyclic(singleton<string, string>("root"))) // true
```

**Signature**

```ts
declare const isAcyclic: <A, E>(graph: DirectedGraph<A, E>) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L948)

Since v0.0.0

## stronglyConnectedComponents

Compute strongly connected components as node-index groups.

**Example**

```ts
import { singleton, stronglyConnectedComponents } from "@beep/nlp/Graph/GraphOps"

const components = stronglyConnectedComponents(singleton<string, string>("root"))
console.log(components.length) // 1
```

**Signature**

```ts
declare const stronglyConnectedComponents: <A, E>(graph: DirectedGraph<A, E>) => ReadonlyArray<ReadonlyArray<NodeIndex>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOps.ts#L964)

Since v0.0.0