---
title: EffectGraph.ts
nav_order: 19
parent: "@beep/nlp"
---

## EffectGraph.ts overview

EffectGraph - a categorical approach to text processing as graph transformations.

Models text processing as morphisms in a category where objects are nodes in a
directed acyclic graph and morphisms are operations that transform nodes
(potentially creating children). Composition preserves the DAG property.

Theoretical foundations: catamorphism (bottom-up fold), F-algebra (`F a -> a`),
and structure-preserving operation composition. Built on Effect's in-core
`effect/Graph` module.

Effect v4 `@beep/nlp` implementation notes:
- `makeNode`/`singleton`/`ana` are EFFECTFUL (read `Clock` for the timestamp and an
  `effect/Random`-based id generator) instead of calling `Date.now()` +
  `crypto.randomUUID()` inline, both of which are repo-law violations.
- `NodeId` is a `Brand.nominal` branded string (no `as`).
- native keyed/set collections become `MutableHashMap`/`MutableHashSet`; native
  array methods become `effect/Array`; partial `getOrThrow`/`!` become `Option` handling.
- `Data.TaggedError` becomes `TaggedErrorClass` from `@beep/schema`.
- the terminal `Formatter` (which depended on the dropped `@effect/printer`) is gone;
  `show` renders the plain-text tree.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [addNode](#addnode)
- [constructors](#constructors)
  - [empty](#empty)
  - [generateNodeId](#generatenodeid)
  - [makeNode](#makenode)
  - [singleton](#singleton)
- [errors](#errors)
  - [NodeNotFoundError (class)](#nodenotfounderror-class)
- [folding](#folding)
  - [ana](#ana)
  - [cata](#cata)
- [formatting](#formatting)
  - [show](#show)
- [getters](#getters)
  - [getChildren](#getchildren)
  - [getNode](#getnode)
  - [getRoots](#getroots)
  - [size](#size)
  - [toArray](#toarray)
- [mapping](#mapping)
  - [map](#map)
- [models](#models)
  - [EffectGraph (interface)](#effectgraph-interface)
  - [GraphAlgebra (type alias)](#graphalgebra-type-alias)
  - [GraphCoalgebra (type alias)](#graphcoalgebra-type-alias)
  - [GraphEdge (class)](#graphedge-class)
  - [GraphNode (interface)](#graphnode-interface)
  - [NodeId](#nodeid)
  - [NodeId (type alias)](#nodeid-type-alias)
  - [NodeMetadata (class)](#nodemetadata-class)
---

# combinators

## addNode

Add a node to the graph, recalculating its depth from its parent and linking
the parent-\>child edge when a parent is present.

**Example**

```ts
import { Effect } from "effect"
import { addNode, getRoots, makeNode, singleton } from "@beep/nlp/Graph/EffectGraph"
import * as O from "effect/Option"

const program = Effect.gen(function* () {
  const graph = yield* singleton("root")
  const root = getRoots(graph)[0]
  const child = yield* makeNode("child", O.some(root.id))
  return addNode(graph, child)
})

console.log(Effect.runSync(program).nodeIdToIndex)
```

**Signature**

```ts
declare const addNode: { <A>(effectGraph: EffectGraph<A>, node: GraphNode<A>): EffectGraph<A>; <A>(node: GraphNode<A>): (effectGraph: EffectGraph<A>) => EffectGraph<A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L355)

Since v0.0.0

# constructors

## empty

Create an empty graph with no nodes, edges, or id-index mappings.

**Example**

```ts
import { empty, size } from "@beep/nlp/Graph/EffectGraph"

const graph = empty<string>()
console.log(size(graph)) // 0
```

**Signature**

```ts
declare const empty: <A>() => EffectGraph<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L290)

Since v0.0.0

## generateNodeId

Generate a fresh node id from the Effect clock and random service.

**Example**

```ts
import { Effect } from "effect"
import { generateNodeId } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(generateNodeId, (id) => id.startsWith("node-"))
console.log(Effect.runSync(program)) // true
```

**Signature**

```ts
declare const generateNodeId: Effect.Effect<string & Brand<"NodeId">, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L95)

Since v0.0.0

## makeNode

Create a graph node with generated id, timestamp, parent, and operation metadata.

**Example**

```ts
import { Effect } from "effect"
import { makeNode } from "@beep/nlp/Graph/EffectGraph"

const node = Effect.runSync(makeNode("hello"))
console.log(node.data) // "hello"
```

**Signature**

```ts
declare const makeNode: { <A>(data: A, parentId?: O.Option<NodeId>, operation?: O.Option<string>): Effect.Effect<GraphNode<A>>; (parentId?: O.Option<NodeId>, operation?: O.Option<string>): <A>(data: A) => Effect.Effect<GraphNode<A>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L250)

Since v0.0.0

## singleton

Create a graph containing one generated root node.

**Example**

```ts
import { Effect } from "effect"
import { singleton, size } from "@beep/nlp/Graph/EffectGraph"

const graph = Effect.runSync(singleton("root"))
console.log(size(graph)) // 1
```

**Signature**

```ts
declare const singleton: <A>(data: A) => Effect.Effect<EffectGraph<A>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L312)

Since v0.0.0

# errors

## NodeNotFoundError (class)

Error raised when traversal cannot resolve a node id.

**Example**

```ts
import { NodeNotFoundError } from "@beep/nlp/Graph/EffectGraph"

const error = NodeNotFoundError.make({ nodeId: "node-missing" })
console.log(error._tag) // "NodeNotFoundError"
```

**Signature**

```ts
declare class NodeNotFoundError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L115)

Since v0.0.0

# folding

## ana

Unfold a seed into a graph by recursively producing child seeds.

**Example**

```ts
import { Effect } from "effect"
import { ana, size } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(
  ana(2, (n) => Effect.succeed([n, n > 0 ? [n - 1] : []])),
  size
)

console.log(Effect.runSync(program)) // 3
```

**Signature**

```ts
declare const ana: { <A, B>(seed: B, coalgebra: GraphCoalgebra<A, B>): Effect.Effect<EffectGraph<A>, NodeNotFoundError>; <A, B>(coalgebra: GraphCoalgebra<A, B>): (seed: B) => Effect.Effect<EffectGraph<A>, NodeNotFoundError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L598)

Since v0.0.0

## cata

Fold a graph bottom-up, visiting children before their parents.

**Example**

```ts
import { Effect } from "effect"
import { cata, singleton } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.flatMap(
  singleton("root"),
  cata((node, children: ReadonlyArray<number>) => node.data.length + children.length)
)

console.log(Effect.runSync(program)) // [4]
```

**Signature**

```ts
declare const cata: { <A, B>(graph: EffectGraph<A>, algebra: GraphAlgebra<A, B>): Effect.Effect<ReadonlyArray<B>, NodeNotFoundError>; <A, B>(algebra: GraphAlgebra<A, B>): (graph: EffectGraph<A>) => Effect.Effect<ReadonlyArray<B>, NodeNotFoundError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L524)

Since v0.0.0

# formatting

## show

Render roots and descendants as an indented plain-text tree.

**Example**

```ts
import { Effect } from "effect"
import { show, singleton } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(singleton("root"), show((text) => text))
console.log(Effect.runSync(program)) // "[root] root"
```

**Signature**

```ts
declare const show: { <A>(graph: EffectGraph<A>, showData: (a: A) => string): string; <A>(showData: (a: A) => string): (graph: EffectGraph<A>) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L731)

Since v0.0.0

# getters

## getChildren

Read the direct child nodes for a parent id.

**Example**

```ts
import { Effect } from "effect"
import { getChildren, getRoots, singleton } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(singleton("root"), (graph) => {
  const root = getRoots(graph)[0]
  return getChildren(graph, root.id).length
})

console.log(Effect.runSync(program)) // 0
```

**Signature**

```ts
declare const getChildren: { <A>(graph: EffectGraph<A>, nodeId: NodeId): ReadonlyArray<GraphNode<A>>; <A>(nodeId: NodeId): (graph: EffectGraph<A>) => ReadonlyArray<GraphNode<A>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L444)

Since v0.0.0

## getNode

Look up a node by stable node id.

**Example**

```ts
import { Effect } from "effect"
import { getNode, getRoots, singleton } from "@beep/nlp/Graph/EffectGraph"
import * as O from "effect/Option"

const program = Effect.map(singleton("root"), (graph) => {
  const root = getRoots(graph)[0]
  return O.isSome(getNode(graph, root.id))
})

console.log(Effect.runSync(program)) // true
```

**Signature**

```ts
declare const getNode: { <A>(graph: EffectGraph<A>, nodeId: NodeId): O.Option<GraphNode<A>>; <A>(nodeId: NodeId): (graph: EffectGraph<A>) => O.Option<GraphNode<A>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L416)

Since v0.0.0

## getRoots

Get all root nodes, defined as nodes with no incoming parent edge.

**Example**

```ts
import { Effect } from "effect"
import { getRoots, singleton } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(singleton("root"), (graph) => getRoots(graph).length)
console.log(Effect.runSync(program)) // 1
```

**Signature**

```ts
declare const getRoots: <A>(graph: EffectGraph<A>) => ReadonlyArray<GraphNode<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L472)

Since v0.0.0

## size

Count graph nodes.

**Example**

```ts
import { empty, size } from "@beep/nlp/Graph/EffectGraph"

console.log(size(empty<string>())) // 0
```

**Signature**

```ts
declare const size: <A>(graph: EffectGraph<A>) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L710)

Since v0.0.0

## toArray

Collect all graph nodes in the backing graph's node order.

**Example**

```ts
import { Effect } from "effect"
import { singleton, toArray } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(singleton("root"), (graph) => toArray(graph).length)
console.log(Effect.runSync(program)) // 1
```

**Signature**

```ts
declare const toArray: <A>(graph: EffectGraph<A>) => ReadonlyArray<GraphNode<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L694)

Since v0.0.0

# mapping

## map

Map every node payload while preserving ids, metadata, and edge structure.

**Example**

```ts
import { Effect } from "effect"
import { map, singleton, toArray } from "@beep/nlp/Graph/EffectGraph"

const program = Effect.map(singleton("root"), (graph) =>
  toArray(map(graph, (text) => text.length))[0].data
)

console.log(Effect.runSync(program)) // 4
```

**Signature**

```ts
declare const map: { <A, B>(graph: EffectGraph<A>, f: (a: A) => B): EffectGraph<B>; <A, B>(f: (a: A) => B): (graph: EffectGraph<A>) => EffectGraph<B>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L641)

Since v0.0.0

# models

## EffectGraph (interface)

NLP operation graph backed by `effect/Graph` plus node-id index maps.

**Example**

```ts
import { empty, size, type EffectGraph } from "@beep/nlp/Graph/EffectGraph"

const graph: EffectGraph<string> = empty()
console.log(size(graph)) // 0
```

**Signature**

```ts
export interface EffectGraph<A> {
  readonly graph: Graph.DirectedGraph<GraphNode<A>, GraphEdge>;
  readonly indexToNodeId: HashMap.HashMap<Graph.NodeIndex, NodeId>;
  readonly nodeIdToIndex: HashMap.HashMap<NodeId, Graph.NodeIndex>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L225)

Since v0.0.0

## GraphAlgebra (type alias)

Algebra used by `cata` to collapse a node after its children.

**Example**

```ts
import type { GraphAlgebra } from "@beep/nlp/Graph/EffectGraph"

const countSubtree: GraphAlgebra<string, number> = (_node, children) =>
  1 + children.reduce((sum, count) => sum + count, 0)

console.log(countSubtree)
```

**Signature**

```ts
type GraphAlgebra<A, B> = (node: GraphNode<A>, children: ReadonlyArray<B>) => B
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L499)

Since v0.0.0

## GraphCoalgebra (type alias)

Coalgebra used by `ana` to unfold a seed into node data and child seeds.

**Example**

```ts
import { Effect } from "effect"
import type { GraphCoalgebra } from "@beep/nlp/Graph/EffectGraph"

const countdown: GraphCoalgebra<number, number> = (n) =>
  Effect.succeed([n, n > 0 ? [n - 1] : []])

const [value, children] = Effect.runSync(countdown(2))
console.log(`${value}:${children.length}`) // "2:1"
```

**Signature**

```ts
type GraphCoalgebra<A, B> = (seed: B) => Effect.Effect<readonly [A, ReadonlyArray<B>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L577)

Since v0.0.0

## GraphEdge (class)

Directed child edge between two graph nodes.

**Example**

```ts
import { GraphEdge } from "@beep/nlp/Graph/EffectGraph"

const edge = GraphEdge.make({ relation: "child" })
console.log(edge.relation) // "child"
```

**Signature**

```ts
declare class GraphEdge
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L197)

Since v0.0.0

## GraphNode (interface)

Node payload plus graph lineage metadata.

**Example**

```ts
import { Effect } from "effect"
import { makeNode, type GraphNode } from "@beep/nlp/Graph/EffectGraph"

const node: GraphNode<string> = Effect.runSync(makeNode("root"))
console.log(node.data) // "root"
```

**Signature**

```ts
export interface GraphNode<A> {
  readonly data: A;
  readonly id: NodeId;
  readonly metadata: NodeMetadata;
  readonly parentId: O.Option<NodeId>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L176)

Since v0.0.0

## NodeId

Branded identifier for graph nodes.

**Example**

```ts
import { NodeId } from "@beep/nlp/Graph/EffectGraph"

const nodeId = NodeId.make("node-example")
console.log(nodeId.startsWith("node-")) // true
```

**Signature**

```ts
declare const NodeId: AnnotatedSchema<S.brand<S.String, "NodeId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L56)

Since v0.0.0

## NodeId (type alias)

Companion type for `NodeId`.

**Example**

```ts
import { NodeId } from "@beep/nlp/Graph/EffectGraph"

const nodeId = NodeId.make("node-example")
console.log(nodeId)
```

**Signature**

```ts
type NodeId = typeof NodeId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L77)

Since v0.0.0

## NodeMetadata (class)

Per-node metadata recorded by graph constructors and operations.

**Example**

```ts
import { NodeMetadata } from "@beep/nlp/Graph/EffectGraph"
import * as O from "effect/Option"

const metadata = NodeMetadata.make({
  depth: 0,
  operation: O.none(),
  timestamp: 0
})

console.log(metadata.depth) // 0
```

**Signature**

```ts
declare class NodeMetadata
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/EffectGraph.ts#L145)

Since v0.0.0