---
title: Graph.guards.ts
nav_order: 106
parent: "@beep/schema"
---

## Graph.guards.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isEdge](#isedge)
  - [isGraph](#isgraph)
---

# guards

## isEdge

Guard for Effect `Graph.Edge` values.

**Example**

```ts
import { Graph } from "effect"
import { isEdge } from "@beep/schema/Graph"

const edge = new Graph.Edge({ source: 0, target: 1, data: "knows" })
console.log(isEdge(edge))
```

**Signature**

```ts
declare const isEdge: <Data>(value: unknown) => value is Graph_.Edge<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.guards.ts#L27)

Since v0.0.0

## isGraph

Guard for Effect graph values, including mutable variants.

**Example**

```ts
import { Graph } from "effect"
import { isGraph } from "@beep/schema/Graph"

const graph = Graph.directed<string, string>()
console.log(isGraph(graph))
```

**Signature**

```ts
declare const isGraph: <Node, Edge>(value: unknown) => value is Graph_.Graph<Node, Edge, GraphKindValue> | Graph_.MutableGraph<Node, Edge, GraphKindValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.guards.ts#L46)

Since v0.0.0