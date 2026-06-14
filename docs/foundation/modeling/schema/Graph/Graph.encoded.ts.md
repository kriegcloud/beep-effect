---
title: Graph.encoded.ts
nav_order: 104
parent: "@beep/schema"
---

## Graph.encoded.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EdgeEncoded (type alias)](#edgeencoded-type-alias)
  - [GraphEncoded (type alias)](#graphencoded-type-alias)
- [type-level](#type-level)
  - [EdgeIso (type alias)](#edgeiso-type-alias)
  - [GraphIso (type alias)](#graphiso-type-alias)
- [validation](#validation)
  - [EdgeEncoded](#edgeencoded)
  - [EdgeEncodedSchema (interface)](#edgeencodedschema-interface)
  - [GraphEncoded](#graphencoded)
  - [GraphEncodedSchema (interface)](#graphencodedschema-interface)
---

# models

## EdgeEncoded (type alias)

Encoded edge representation used by graph codecs.

**Example**

```ts
import { NodeIndex, type EdgeEncoded } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const source = S.decodeUnknownSync(NodeIndex)(0)
const target = S.decodeUnknownSync(NodeIndex)(1)
const edge = { source, target, data: "knows" } satisfies EdgeEncoded<string>
console.log(edge.data)
```

**Signature**

```ts
type Readonly<{ readonly source: NodeIndex; readonly target: NodeIndex; readonly data: Data; }> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L30)

Since v0.0.0

## GraphEncoded (type alias)

Encoded graph representation used by graph codecs.

**Example**

```ts
import { NodeIndex, type GraphEncoded } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const nodeIndex = S.decodeUnknownSync(NodeIndex)(0)

const graph = {
  _tag: "Graph",
  type: "directed",
  nodes: [[nodeIndex, "Ada"]],
  edges: []
} satisfies GraphEncoded<string, string, "directed">

console.log(graph.nodes.length)
```

**Signature**

```ts
type Readonly<{ readonly _tag: "Graph"; readonly type: Kind; readonly nodes: ReadonlyArray<readonly [NodeIndex, Node]>; readonly edges: ReadonlyArray<{ readonly index: EdgeIndex; readonly source: NodeIndex; readonly target: NodeIndex; readonly data: Edge; }>; }> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge;
  }>;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L59)

Since v0.0.0

# type-level

## EdgeIso (type alias)

Public schema module export.

**Signature**

```ts
type Readonly<{ readonly source: NodeIndex; readonly target: NodeIndex; readonly data: Data["Iso"]; }> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data["Iso"];
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L78)

Since v0.0.0

## GraphIso (type alias)

Public schema module export.

**Signature**

```ts
type Readonly<{ readonly _tag: "Graph"; readonly type: Kind; readonly nodes: ReadonlyArray<readonly [NodeIndex, Node["Iso"]]>; readonly edges: ReadonlyArray<{ readonly index: EdgeIndex; readonly source: NodeIndex; readonly target: NodeIndex; readonly data: Edge["Iso"]; }>; }> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node["Iso"]]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge["Iso"];
  }>;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L91)

Since v0.0.0

# validation

## EdgeEncoded

Schema for encoded graph edges.

**Example**

```ts
import { EdgeEncoded } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const Edge = EdgeEncoded(S.String)
const edge = S.decodeUnknownSync(Edge)({ source: 0, target: 1, data: "knows" })
console.log(edge.data)
```

**Signature**

```ts
declare const EdgeEncoded: <Data extends S.Top>(data: Data) => EdgeEncodedSchema<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L156)

Since v0.0.0

## EdgeEncodedSchema (interface)

Schema type for encoded graph edges.

**Signature**

```ts
export interface EdgeEncodedSchema<Data extends S.Top>
  extends S.Codec<
    EdgeEncoded<Data["Type"]>,
    EdgeEncoded<Data["Encoded"]>,
    Data["DecodingServices"],
    Data["EncodingServices"]
  > {
  readonly data: Data;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L109)

Since v0.0.0

## GraphEncoded

Schema for encoded graphs.

**Example**

```ts
import { GraphEncoded } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const Graph = GraphEncoded(S.String, S.String)
const graph = S.decodeUnknownSync(Graph)({
  _tag: "Graph",
  type: "directed",
  nodes: [[0, "Ada"]],
  edges: []
})

console.log(graph.type)
```

**Signature**

```ts
declare const GraphEncoded: { <Node extends S.Top, Edge extends S.Top>(node: Node): (edge: Edge) => GraphEncodedSchema<Node, Edge>; <Node extends S.Top, Edge extends S.Top>(node: Node, edge: Edge): GraphEncodedSchema<Node, Edge>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L195)

Since v0.0.0

## GraphEncodedSchema (interface)

Schema type for encoded graphs.

**Signature**

```ts
export interface GraphEncodedSchema<Node extends S.Top, Edge extends S.Top>
  extends S.Codec<
    GraphEncoded<Node["Type"], Edge["Type"]>,
    GraphEncoded<Node["Encoded"], Edge["Encoded"]>,
    Node["DecodingServices"] | Edge["DecodingServices"],
    Node["EncodingServices"] | Edge["EncodingServices"]
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.encoded.ts#L126)

Since v0.0.0