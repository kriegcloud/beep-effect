---
title: Graph.edge.ts
nav_order: 103
parent: "@beep/schema"
---

## Graph.edge.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Edge](#edge)
- [validation](#validation)
  - [Edge (interface)](#edge-interface)
  - [EdgeFromSelf](#edgefromself)
  - [EdgeFromSelf (interface)](#edgefromself-interface)
  - [EdgeTransform](#edgetransform)
  - [EdgeTransform (interface)](#edgetransform-interface)
---

# constructors

## Edge

Schema for graph edges. This is an alias of `EdgeTransform`.

Decodes an `{ source, target, data }` object into a `Graph.Edge` instance.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { Edge } from "@beep/schema/Graph"

const EdgeSchema = Edge(S.String)

console.log(EdgeSchema.ast)
```

**Signature**

```ts
declare const Edge: <Data extends S.Top>(data: Data) => Edge<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L210)

Since v0.0.0

# validation

## Edge (interface)

Schema for graph edges.

**Signature**

```ts
export interface Edge<Data extends S.Top> extends EdgeTransform<Data> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L67)

Since v0.0.0

## EdgeFromSelf

Schema for validating existing `Graph.Edge` instances while applying the
provided payload schema.

**Example**

```ts
import { EdgeFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const EdgeSchema = EdgeFromSelf(S.String)
console.log(EdgeSchema.ast._tag)
```

**Signature**

```ts
declare const EdgeFromSelf: <Data extends S.Top>(data: Data) => EdgeFromSelf<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L87)

Since v0.0.0

## EdgeFromSelf (interface)

Schema for validating existing `Graph.Edge` instances.

**Example**

```ts
import { EdgeFromSelf } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const EdgeSchema = EdgeFromSelf(S.String)
console.log(EdgeSchema.ast._tag)
```

**Signature**

```ts
export interface EdgeFromSelf<Data extends S.Top>
  extends S.declareConstructor<
    Graph_.Edge<Data["Type"]>,
    Graph_.Edge<Data["Encoded"]>,
    readonly [Data],
    EdgeIso<Data>
  > {
  readonly data: Data;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L29)

Since v0.0.0

## EdgeTransform

Schema that transforms encoded edge objects into `Graph.Edge` instances and
encodes them back to the same object shape.

**Example**

```ts
import { EdgeTransform } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const EdgeSchema = EdgeTransform(S.String)
console.log(EdgeSchema.ast._tag)
```

**Signature**

```ts
declare const EdgeTransform: <Data extends S.Top>(data: Data) => EdgeTransform<Data>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L159)

Since v0.0.0

## EdgeTransform (interface)

Schema for transforming encoded edge payloads into `Graph.Edge` instances.

**Example**

```ts
import { EdgeTransform } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const EdgeSchema = EdgeTransform(S.String)
console.log(EdgeSchema.ast._tag)
```

**Signature**

```ts
export interface EdgeTransform<Data extends S.Top>
  extends S.decodeTo<EdgeFromSelf<S.toType<Data>>, EdgeEncodedSchema<Data>> {
  readonly data: Data;
  readonly Rebuild: this;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.edge.ts#L55)

Since v0.0.0