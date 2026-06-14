---
title: Operation.ts
nav_order: 24
parent: "@beep/nlp"
---

## Operation.ts overview

GraphOperations/Operation - the core graph-operation abstraction.

A `GraphOperation` is a morphism in the category of graphs: it maps a
node of data `A` to an array of child nodes of data `B`, possibly requiring
context `R` and failing with `E`, alongside validation and cost-estimation.

Effect v4 `@beep/nlp` implementation notes:
- operations that mint nodes are EFFECTFUL (`pure`/`identity` use
  `EffectGraph.makeNode`/`generateNodeId`, which read `Clock`/`Random`).
- native `Array#map` becomes `effect/Array` + `Effect.forEach`.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [flatMap](#flatmap)
  - [map](#map)
- [constructors](#constructors)
  - [expand](#expand)
  - [filter](#filter)
  - [identity](#identity)
  - [make](#make)
  - [pure](#pure)
  - [transform](#transform)
- [getters](#getters)
  - [getCategory](#getcategory)
- [models](#models)
  - [GraphOperation (interface)](#graphoperation-interface)
---

# combinators

## flatMap

Build a named `flatMap` expansion for leaf payloads.

**Example**

```ts
import { flatMap } from "@beep/nlp/Graph/GraphOperations/Operation"

const characters = flatMap((text: string) => text.split(""))
console.log(characters.category) // "expansion"
```

**Signature**

```ts
declare const flatMap: <A, B>(f: (a: A) => ReadonlyArray<B>) => GraphOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L315)

Since v0.0.0

## map

Build a named `map` transformation for leaf payloads.

**Example**

```ts
import { map } from "@beep/nlp/Graph/GraphOperations/Operation"

const lengths = map((text: string) => text.length)
console.log(lengths.category) // "transformation"
```

**Signature**

```ts
declare const map: <A, B>(f: (a: A) => B) => GraphOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L298)

Since v0.0.0

# constructors

## expand

Create a one-to-many expansion operation.

**Example**

```ts
import { expand } from "@beep/nlp/Graph/GraphOperations/Operation"

const splitWords = expand({
  name: "split-words",
  description: "Emit one child payload per whitespace-delimited token.",
  f: (text: string) => text.split(/\s+/).filter((token) => token.length > 0)
})

console.log(splitWords.category) // "expansion"
```

**Signature**

```ts
declare const expand: <A, B>(config: { readonly description: string; readonly f: (data: A) => ReadonlyArray<B>; readonly name: string; }) => GraphOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L212)

Since v0.0.0

## filter

Create a predicate operation that keeps or drops leaf payloads.

**Example**

```ts
import { filter } from "@beep/nlp/Graph/GraphOperations/Operation"

const nonEmpty = filter({
  name: "non-empty",
  description: "Keep only leaves containing text.",
  predicate: (text: string) => text.trim().length > 0
})

console.log(nonEmpty.category) // "filtering"
```

**Signature**

```ts
declare const filter: <A>(config: { readonly description: string; readonly name: string; readonly predicate: (data: A) => boolean; }) => GraphOperation<A, A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L242)

Since v0.0.0

## identity

Re-emit a leaf payload under a fresh child node id.

**Example**

```ts
import { identity } from "@beep/nlp/Graph/GraphOperations/Operation"

const passthrough = identity<string>()
console.log(passthrough.name) // "identity"
```

**Signature**

```ts
declare const identity: <A>() => GraphOperation<A, A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L276)

Since v0.0.0

## make

Build a graph operation while filling in safe validation and cost defaults.

**Example**

```ts
import { Effect } from "effect"
import { make } from "@beep/nlp/Graph/GraphOperations/Operation"

const operation = make<string, string>({
  name: "emit-none",
  description: "Suppress every matched leaf.",
  category: "filtering",
  apply: () => Effect.succeed([])
})

console.log(operation.name) // "emit-none"
```

**Signature**

```ts
declare const make: <A, B, R = never, E = never>(config: { readonly apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>; readonly category: OperationCategory; readonly description: string; readonly estimateCost?: (node: GraphNode<A>) => Effect.Effect<OperationCost>; readonly name: string; readonly validate?: (node: GraphNode<A>) => Effect.Effect<ValidationResult>; }) => GraphOperation<A, B, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L99)

Since v0.0.0

## pure

Create an operation from a pure data function that emits child payloads.

**Example**

```ts
import { pure } from "@beep/nlp/Graph/GraphOperations/Operation"

const duplicate = pure({
  name: "duplicate",
  description: "Emit two child payloads for each input.",
  category: "expansion",
  f: (text: string) => [text, text]
})

console.log(duplicate.category) // "expansion"
```

**Signature**

```ts
declare const pure: <A, B>(config: { readonly category: OperationCategory; readonly description: string; readonly f: (data: A) => ReadonlyArray<B>; readonly name: string; }) => GraphOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L140)

Since v0.0.0

## transform

Create a one-to-one transformation operation.

**Example**

```ts
import { transform } from "@beep/nlp/Graph/GraphOperations/Operation"

const normalize = transform({
  name: "normalize-case",
  description: "Lowercase a text leaf.",
  f: (text: string) => text.toLowerCase()
})

console.log(normalize.category) // "transformation"
```

**Signature**

```ts
declare const transform: <A, B>(config: { readonly description: string; readonly f: (data: A) => B; readonly name: string; }) => GraphOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L176)

Since v0.0.0

# getters

## getCategory

Read an operation's morphism category.

**Example**

```ts
import { getCategory, map } from "@beep/nlp/Graph/GraphOperations/Operation"

const category = getCategory(map((text: string) => text.length))
console.log(category) // "transformation"
```

**Signature**

```ts
declare const getCategory: <A, B, R, E>(operation: GraphOperation<A, B, R, E>) => OperationCategory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L336)

Since v0.0.0

# models

## GraphOperation (interface)

Operation contract for expanding one graph node into zero or more child nodes.

**Example**

```ts
import { Effect } from "effect"
import { make, type GraphOperation } from "@beep/nlp/Graph/GraphOperations/Operation"

const operation: GraphOperation<string, string> = make({
  name: "drop-empty",
  description: "Keep only non-empty leaf text.",
  category: "filtering",
  apply: () => Effect.succeed([])
})

console.log(operation.category) // "filtering"
```

**Signature**

```ts
export interface GraphOperation<A, B, R = never, E = never> {
  /** Apply the operation to a single node, producing child nodes. */
  readonly apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>;
  readonly category: OperationCategory;
  readonly description: string;
  /** Estimate the cost of applying the operation to a node. */
  readonly estimateCost: (node: GraphNode<A>) => Effect.Effect<OperationCost>;
  readonly name: string;
  /** Validate that the operation can be applied to a node. */
  readonly validate: (node: GraphNode<A>) => Effect.Effect<ValidationResult>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/GraphOperations/Operation.ts#L57)

Since v0.0.0