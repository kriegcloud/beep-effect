---
title: Graph.from-self.ts
nav_order: 105
parent: "@beep/schema"
---

## Graph.from-self.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [DirectedGraphFromSelf](#directedgraphfromself)
  - [DirectedGraphFromSelf (interface)](#directedgraphfromself-interface)
  - [GraphFromSelf](#graphfromself)
  - [GraphFromSelf (interface)](#graphfromself-interface)
  - [MutableDirectedGraphFromSelf](#mutabledirectedgraphfromself)
  - [MutableDirectedGraphFromSelf (interface)](#mutabledirectedgraphfromself-interface)
  - [MutableGraphFromSelf](#mutablegraphfromself)
  - [MutableGraphFromSelf (interface)](#mutablegraphfromself-interface)
  - [MutableUndirectedGraphFromSelf](#mutableundirectedgraphfromself)
  - [MutableUndirectedGraphFromSelf (interface)](#mutableundirectedgraphfromself-interface)
  - [UndirectedGraphFromSelf](#undirectedgraphfromself)
  - [UndirectedGraphFromSelf (interface)](#undirectedgraphfromself-interface)
---

# validation

## DirectedGraphFromSelf

Schema for validating existing immutable directed Effect graphs.

**Example**

```ts
import { DirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = DirectedGraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const DirectedGraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => DirectedGraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L337)

Since v0.0.0

## DirectedGraphFromSelf (interface)

Schema for validating existing immutable directed Effect graphs.

**Example**

```ts
import { DirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").DirectedGraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(DirectedGraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface DirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.DirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.DirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "directed">
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L67)

Since v0.0.0

## GraphFromSelf

Schema for validating existing immutable Effect graphs.

**Example**

```ts
import { GraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = GraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const GraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => GraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L310)

Since v0.0.0

## GraphFromSelf (interface)

Schema for validating existing immutable Effect graphs.

**Example**

```ts
import { GraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").GraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(GraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface GraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.Graph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.Graph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    readonly [Node, Edge],
    GraphIso<Node, Edge>
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L40)

Since v0.0.0

## MutableDirectedGraphFromSelf

Schema for validating existing mutable directed Effect graphs.

**Example**

```ts
import { MutableDirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = MutableDirectedGraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const MutableDirectedGraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => MutableDirectedGraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L424)

Since v0.0.0

## MutableDirectedGraphFromSelf (interface)

Schema for validating existing mutable directed Effect graphs.

**Example**

```ts
import { MutableDirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").MutableDirectedGraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(MutableDirectedGraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface MutableDirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableDirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.MutableDirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "directed">
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L148)

Since v0.0.0

## MutableGraphFromSelf

Schema for validating existing mutable Effect graphs.

**Example**

```ts
import { MutableGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = MutableGraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const MutableGraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => MutableGraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L397)

Since v0.0.0

## MutableGraphFromSelf (interface)

Schema for validating existing mutable Effect graphs.

**Example**

```ts
import { MutableGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").MutableGraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(MutableGraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface MutableGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableGraph<Node["Type"], Edge["Type"], GraphKindValue>,
    Graph_.MutableGraph<Node["Encoded"], Edge["Encoded"], GraphKindValue>,
    readonly [Node, Edge],
    GraphIso<Node, Edge>
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L121)

Since v0.0.0

## MutableUndirectedGraphFromSelf

Schema for validating existing mutable undirected Effect graphs.

**Example**

```ts
import { MutableUndirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = MutableUndirectedGraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const MutableUndirectedGraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => MutableUndirectedGraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L454)

Since v0.0.0

## MutableUndirectedGraphFromSelf (interface)

Schema for validating existing mutable undirected Effect graphs.

**Example**

```ts
import { MutableUndirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").MutableUndirectedGraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(MutableUndirectedGraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface MutableUndirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.MutableUndirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.MutableUndirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "undirected">
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L175)

Since v0.0.0

## UndirectedGraphFromSelf

Schema for validating existing immutable undirected Effect graphs.

**Example**

```ts
import { UndirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const schema = UndirectedGraphFromSelf({ node: S.String, edge: S.Finite })
console.log(S.isSchema(schema))
```

**Signature**

```ts
declare const UndirectedGraphFromSelf: <Node extends S.Top, Edge extends S.Top>(options: { readonly node: Node; readonly edge: Edge; }) => UndirectedGraphFromSelf<Node, Edge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L367)

Since v0.0.0

## UndirectedGraphFromSelf (interface)

Schema for validating existing immutable undirected Effect graphs.

**Example**

```ts
import { UndirectedGraphFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

type Schema = import("@beep/schema/Graph").UndirectedGraphFromSelf<typeof S.String, typeof S.Finite>
console.log(S.isSchema(UndirectedGraphFromSelf({ node: S.String, edge: S.Finite }) satisfies Schema))
```

**Signature**

```ts
export interface UndirectedGraphFromSelf<Node extends S.Top, Edge extends S.Top>
  extends S.declareConstructor<
    Graph_.UndirectedGraph<Node["Type"], Edge["Type"]>,
    Graph_.UndirectedGraph<Node["Encoded"], Edge["Encoded"]>,
    readonly [Node, Edge],
    GraphIso<Node, Edge, "undirected">
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.from-self.ts#L94)

Since v0.0.0