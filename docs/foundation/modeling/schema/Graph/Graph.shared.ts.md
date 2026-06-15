---
title: Graph.shared.ts
nav_order: 109
parent: "@beep/schema"
---

## Graph.shared.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeGraphConstructionIssue](#makegraphconstructionissue)
  - [makeGraphEquivalence](#makegraphequivalence)
  - [makeInvalidGraphIssue](#makeinvalidgraphissue)
- [formatting](#formatting)
  - [formatGraph](#formatgraph)
  - [trimGraphDescription](#trimgraphdescription)
- [guards](#guards)
  - [isImmutableGraphValue](#isimmutablegraphvalue)
  - [isMutableGraphValue](#ismutablegraphvalue)
- [symbols](#symbols)
  - [sortRawEdgeEntries](#sortrawedgeentries)
  - [sortRawNodeEntries](#sortrawnodeentries)
  - [toRawEdgeEncoded](#torawedgeencoded)
  - [toRawGraphEncoded](#torawgraphencoded)
- [type-level](#type-level)
  - [GraphKindValue (type alias)](#graphkindvalue-type-alias)
  - [RawEdgeEncoded (type alias)](#rawedgeencoded-type-alias)
  - [RawGraphEncoded (type alias)](#rawgraphencoded-type-alias)
---

# constructors

## makeGraphConstructionIssue

Public schema module export.

**Signature**

```ts
declare const makeGraphConstructionIssue: (actual: unknown, entity: "node" | "edge", expected: number, received: number) => SchemaIssue.InvalidValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L84)

Since v0.0.0

## makeGraphEquivalence

Public schema module export.

**Signature**

```ts
declare const makeGraphEquivalence: <Node, Edge>(nodeEquivalence: (self: Node, that: Node) => boolean, edgeEquivalence: (self: Edge, that: Edge) => boolean) => (self: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>, that: Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L199)

Since v0.0.0

## makeInvalidGraphIssue

Public schema module export.

**Signature**

```ts
declare const makeInvalidGraphIssue: (actual: unknown, message: string) => SchemaIssue.InvalidValue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L74)

Since v0.0.0

# formatting

## formatGraph

Public schema module export.

**Signature**

```ts
declare const formatGraph: <Node, Edge, Kind extends GraphKindValue>(graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>, formatNode: (node: Node) => string, formatEdge: (edge: Edge) => string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L172)

Since v0.0.0

## trimGraphDescription

Public schema module export.

**Signature**

```ts
declare const trimGraphDescription: (value: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L280)

Since v0.0.0

# guards

## isImmutableGraphValue

Public schema module export.

**Signature**

```ts
declare const isImmutableGraphValue: <Node, Edge>(value: unknown) => value is Graph_.Graph<Node, Edge, GraphKindValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L258)

Since v0.0.0

## isMutableGraphValue

Public schema module export.

**Signature**

```ts
declare const isMutableGraphValue: <Node, Edge>(value: unknown) => value is Graph_.MutableGraph<Node, Edge, GraphKindValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L268)

Since v0.0.0

# symbols

## sortRawEdgeEntries

Public schema module export.

**Signature**

```ts
declare const sortRawEdgeEntries: <Edge>(edges: RawGraphEncoded<never, Edge>["edges"]) => RawGraphEncoded<never, Edge>["edges"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L113)

Since v0.0.0

## sortRawNodeEntries

Public schema module export.

**Signature**

```ts
declare const sortRawNodeEntries: <Node>(nodes: RawGraphEncoded<Node, never>["nodes"]) => RawGraphEncoded<Node, never>["nodes"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L98)

Since v0.0.0

## toRawEdgeEncoded

Public schema module export.

**Signature**

```ts
declare const toRawEdgeEncoded: <Data>(edge: Graph_.Edge<Data>) => RawEdgeEncoded<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L124)

Since v0.0.0

## toRawGraphEncoded

Public schema module export.

**Signature**

```ts
declare const toRawGraphEncoded: <Node, Edge, Kind extends GraphKindValue>(graph: Graph_.Graph<Node, Edge, Kind> | Graph_.MutableGraph<Node, Edge, Kind>) => RawGraphEncoded<Node, Edge, Kind>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L137)

Since v0.0.0

# type-level

## GraphKindValue (type alias)

Public schema module export.

**Signature**

```ts
type GraphKindValue = "directed" | "undirected"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L29)

Since v0.0.0

## RawEdgeEncoded (type alias)

Public schema module export.

**Signature**

```ts
type Readonly<{ readonly source: number; readonly target: number; readonly data: Data; }> = Readonly<{
  readonly source: number;
  readonly target: number;
  readonly data: Data;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L38)

Since v0.0.0

## RawGraphEncoded (type alias)

Public schema module export.

**Signature**

```ts
type Readonly<{ readonly _tag: "Graph"; readonly type: Kind; readonly nodes: ReadonlyArray<readonly [number, Node]>; readonly edges: ReadonlyArray<{ readonly index: number; readonly source: number; readonly target: number; readonly data: Edge; }>; }> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [number, Node]>;
  readonly edges: ReadonlyArray<{
    readonly index: number;
    readonly source: number;
    readonly target: number;
    readonly data: Edge;
  }>;
}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.shared.ts#L51)

Since v0.0.0