---
title: Graph.primitives.ts
nav_order: 107
parent: "@beep/schema"
---

## Graph.primitives.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [EdgeIndexFromString](#edgeindexfromstring)
  - [NodeIndex](#nodeindex)
  - [NodeIndexFromString](#nodeindexfromstring)
- [models](#models)
  - [EdgeIndex (type alias)](#edgeindex-type-alias)
  - [GraphKind (type alias)](#graphkind-type-alias)
  - [NodeIndex (type alias)](#nodeindex-type-alias)
- [validation](#validation)
  - [EdgeIndex](#edgeindex)
  - [GraphKind](#graphkind)
---

# constructors

## EdgeIndexFromString

Decode a string-encoded graph edge index into a branded `EdgeIndex`.

**Example**

```ts
import { EdgeIndexFromString } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const index = S.decodeUnknownSync(EdgeIndexFromString)("2")
console.log(index)
```

**Signature**

```ts
declare const EdgeIndexFromString: AnnotatedSchema<S.compose<AnnotatedSchema<S.brand<S.Int, "EdgeIndex">>, S.FiniteFromString>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L114)

Since v0.0.0

## NodeIndex

Branded schema for graph node indices.

Validates that the value is a non-negative integer.

**Example**

```ts
import * as S from "effect/Schema"
import { NodeIndex } from "@beep/schema/Graph"

const decode = S.decodeUnknownSync(NodeIndex)

const idx = decode(0)
console.log(idx) // 0
```

**Signature**

```ts
declare const NodeIndex: AnnotatedSchema<S.brand<S.Int, "NodeIndex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L30)

Since v0.0.0

## NodeIndexFromString

Decode a string-encoded graph node index into a branded `NodeIndex`.

**Example**

```ts
import * as S from "effect/Schema"
import { NodeIndexFromString } from "@beep/schema/Graph"

const decode = S.decodeUnknownSync(NodeIndexFromString)

const idx = decode("3")
console.log(idx) // 3
```

**Signature**

```ts
declare const NodeIndexFromString: AnnotatedSchema<S.compose<AnnotatedSchema<S.brand<S.Int, "NodeIndex">>, S.FiniteFromString>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L62)

Since v0.0.0

# models

## EdgeIndex (type alias)

Branded edge index type extracted from `EdgeIndex`.

**Signature**

```ts
type EdgeIndex = typeof EdgeIndex.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L97)

Since v0.0.0

## GraphKind (type alias)

Graph kind discriminator type extracted from `GraphKind`.

**Signature**

```ts
type GraphKind = typeof GraphKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L148)

Since v0.0.0

## NodeIndex (type alias)

Branded node index type extracted from `NodeIndex`.

**Signature**

```ts
type NodeIndex = typeof NodeIndex.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L43)

Since v0.0.0

# validation

## EdgeIndex

Branded schema for graph edge indices.

**Example**

```ts
import { EdgeIndex } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const index = S.decodeUnknownSync(EdgeIndex)(1)
console.log(index)
```

**Signature**

```ts
declare const EdgeIndex: AnnotatedSchema<S.brand<S.Int, "EdgeIndex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L84)

Since v0.0.0

## GraphKind

Schema for graph kind discriminators.

**Example**

```ts
import { GraphKind } from "@beep/schema/Graph"
import * as S from "effect/Schema"

const kind = S.decodeUnknownSync(GraphKind)("directed")
console.log(kind)
```

**Signature**

```ts
declare const GraphKind: AnnotatedSchema<S.Literals<readonly ["directed", "undirected"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.primitives.ts#L136)

Since v0.0.0