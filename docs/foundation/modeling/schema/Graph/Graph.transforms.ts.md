---
title: Graph.transforms.ts
nav_order: 110
parent: "@beep/schema"
---

## Graph.transforms.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [DirectedGraph](#directedgraph)
- [validation](#validation)
  - [DirectedGraph (interface)](#directedgraph-interface)
  - [MutableDirectedGraph](#mutabledirectedgraph)
  - [MutableDirectedGraph (interface)](#mutabledirectedgraph-interface)
  - [MutableUndirectedGraph](#mutableundirectedgraph)
  - [MutableUndirectedGraph (interface)](#mutableundirectedgraph-interface)
  - [UndirectedGraph](#undirectedgraph)
  - [UndirectedGraph (interface)](#undirectedgraph-interface)
---

# constructors

## DirectedGraph

Schema for immutable directed graphs.

Decodes an encoded `{ _tag: "Graph", type: "directed", nodes, edges }`
payload into an immutable `Graph.DirectedGraph` value.

**Example**

```ts
import * as S from "effect/Schema"
import { DirectedGraph } from "@beep/schema/Graph"

const GraphSchema = DirectedGraph({ node: S.String, edge: S.Finite })

console.log(GraphSchema.ast)
```

**Signature**

```ts
declare const DirectedGraph: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => DirectedGraph<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L151)

Since v0.0.0

# validation

## DirectedGraph (interface)

Schema for decoding encoded graph payloads into immutable directed graphs.

**Signature**

```ts
export interface DirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<DirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L27)

Since v0.0.0

## MutableDirectedGraph

Schema for mutable directed graphs.

**Example**

```ts
import * as S from "effect/Schema"
import { MutableDirectedGraph } from "@beep/schema/Graph"

const GraphSchema = MutableDirectedGraph({ node: S.String, edge: S.Finite })

console.log(GraphSchema.ast)
```

**Signature**

```ts
declare const MutableDirectedGraph: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => MutableDirectedGraph<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L219)

Since v0.0.0

## MutableDirectedGraph (interface)

Schema for decoding encoded graph payloads into mutable directed graphs.

**Signature**

```ts
export interface MutableDirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<MutableDirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L53)

Since v0.0.0

## MutableUndirectedGraph

Schema for mutable undirected graphs.

**Example**

```ts
import * as S from "effect/Schema"
import { MutableUndirectedGraph } from "@beep/schema/Graph"

const GraphSchema = MutableUndirectedGraph({ node: S.String, edge: S.Finite })

console.log(GraphSchema.ast)
```

**Signature**

```ts
declare const MutableUndirectedGraph: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => MutableUndirectedGraph<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L253)

Since v0.0.0

## MutableUndirectedGraph (interface)

Schema for decoding encoded graph payloads into mutable undirected graphs.

**Signature**

```ts
export interface MutableUndirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<MutableUndirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L66)

Since v0.0.0

## UndirectedGraph

Schema for immutable undirected graphs.

**Example**

```ts
import * as S from "effect/Schema"
import { UndirectedGraph } from "@beep/schema/Graph"

const GraphSchema = UndirectedGraph({ node: S.String, edge: S.Finite })

console.log(GraphSchema.ast)
```

**Signature**

```ts
declare const UndirectedGraph: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => UndirectedGraph<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L185)

Since v0.0.0

## UndirectedGraph (interface)

Schema for decoding encoded graph payloads into immutable undirected graphs.

**Signature**

```ts
export interface UndirectedGraph<Node extends S.Top, Edge extends S.Top>
  extends S.decodeTo<UndirectedGraphFromSelf<S.toType<Node>, S.toType<Edge>>, GraphEncodedSchema<Node, Edge>> {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.transforms.ts#L40)

Since v0.0.0