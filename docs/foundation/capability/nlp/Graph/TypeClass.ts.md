---
title: TypeClass.ts
nav_order: 31
parent: "@beep/nlp"
---

## TypeClass.ts overview

TypeClass - categorical abstractions for text-processing operations on graphs.

Formalizes text operations as morphisms in the Kleisli category of `Effect`:
a `TextOperation` takes one `GraphNode` of data `A` and
produces an array of nodes of data `B`, possibly requiring context `R` and
failing with `E`. The module provides the Functor/Applicative/Monad/Traversable
combinators (`map`/`ap`/`chain`/`traverse`), a `Composable` monoid of
operations, a `Foldable` instance for graphs, and a paired
expansion/aggregation model.

Effect v4 `@beep/nlp` implementation notes:
- operations that mint nodes are EFFECTFUL: `EffectGraph.makeNode` /
  `EffectGraph.generateNodeId` read `Clock`/`Random`.
- `Foldable<F>` is parameterized as `Foldable<F, A>` so the graph instance is
  implementable without `any`.
- `executeOperation` relies on `effect/Graph` covariance in its node type, so
  the widening is sound without assertions.
- native `Array#map`/`flat`/`push` + index loops become `effect/Array` + folds +
  `Effect.all`/`Effect.forEach`; the `purOperation` typo is corrected to
  `pureOperation`.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [alt](#alt)
  - [ap](#ap)
  - [chain](#chain)
  - [composeOperations](#composeoperations)
  - [empty](#empty)
  - [executeOperation](#executeoperation)
  - [executeOperations](#executeoperations)
  - [filterOperation](#filteroperation)
  - [flatMapOperation](#flatmapoperation)
  - [flatten](#flatten)
  - [foldableGraph](#foldablegraph)
  - [mapOperation](#mapoperation)
  - [pure](#pure)
  - [replicate](#replicate)
  - [traverse](#traverse)
  - [unless](#unless)
  - [when](#when)
- [constructors](#constructors)
  - [identityOperation](#identityoperation)
  - [makeAdjunction](#makeadjunction)
  - [makeOperation](#makeoperation)
  - [pureOperation](#pureoperation)
- [getters](#getters)
  - [collectData](#collectdata)
  - [depth](#depth)
- [mapping](#mapping)
  - [flatMap](#flatmap)
  - [map](#map)
- [models](#models)
  - [Composable (interface)](#composable-interface)
  - [Foldable (interface)](#foldable-interface)
  - [ForgetfulOperation (interface)](#forgetfuloperation-interface)
  - [FreeOperation (type alias)](#freeoperation-type-alias)
  - [Functor (interface)](#functor-interface)
  - [TextOperation (interface)](#textoperation-interface)
---

# combinators

## alt

Combine two operations, collecting results from both (parallel branching).

**Example**

```ts
import { alt, mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = alt(
  mapOperation("lower", (text: string) => text.toLowerCase()),
  mapOperation("upper", (text: string) => text.toUpperCase())
)

console.log(operation.name) // "alt(lower, upper)"
```

**Signature**

```ts
declare const alt: { <A, B, R1, E1, R2, E2>(op1: TextOperation<A, B, R1, E1>, op2: TextOperation<A, B, R2, E2>): TextOperation<A, B, R1 | R2, E1 | E2>; <A, B, R1, E1, R2, E2>(op2: TextOperation<A, B, R2, E2>): (op1: TextOperation<A, B, R1, E1>) => TextOperation<A, B, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L805)

Since v0.0.0

## ap

Apply an operation of functions to an operation of values (Cartesian product).

**Example**

```ts
import { ap, mapOperation, pureOperation } from "@beep/nlp/Graph/TypeClass"

const functions = pureOperation("fn", () => [(text: string) => text.length])
const values = mapOperation("trim", (text: string) => text.trim())
const operation = ap(functions, values)

console.log(operation.name) // "ap(fn, trim)"
```

**Signature**

```ts
declare const ap: { <A, B, C, R1, E1, R2, E2>(opFn: TextOperation<A, (b: B) => C, R1, E1>, opVal: TextOperation<A, B, R2, E2>): TextOperation<A, C, R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(opVal: TextOperation<A, B, R2, E2>): (opFn: TextOperation<A, (b: B) => C, R1, E1>) => TextOperation<A, C, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L654)

Since v0.0.0

## chain

Sequence dependent operations: the first's outputs choose the next operation.

**Example**

```ts
import { chain, mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = chain(
  mapOperation("trim", (text: string) => text.trim()),
  (text) => mapOperation("length", () => text.length)
)

console.log(operation.name) // "trim >>= chain"
```

**Signature**

```ts
declare const chain: { <A, B, C, R1, E1, R2, E2>(operation: TextOperation<A, B, R1, E1>, f: (b: B) => TextOperation<B, C, R2, E2>): TextOperation<A, C, R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(f: (b: B) => TextOperation<B, C, R2, E2>): (operation: TextOperation<A, B, R1, E1>) => TextOperation<A, C, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L722)

Since v0.0.0

## composeOperations

Compose two operations sequentially: the first's outputs feed the second.

**Example**

```ts
import { composeOperations, mapOperation } from "@beep/nlp/Graph/TypeClass"

const trimThenLength = composeOperations(
  mapOperation("trim", (text: string) => text.trim()),
  mapOperation("length", (text: string) => text.length)
)

console.log(trimThenLength.name) // "trim -> length"
```

**Signature**

```ts
declare const composeOperations: { <A, B, C, R, E>(first: TextOperation<A, B, R, E>, second: TextOperation<B, C, R, E>): TextOperation<A, C, R, E>; <A, B, C, R, E>(second: TextOperation<B, C, R, E>): (first: TextOperation<A, B, R, E>) => TextOperation<A, C, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L193)

Since v0.0.0

## empty

The empty operation (identity for `alt`): produces no nodes.

**Example**

```ts
import { empty } from "@beep/nlp/Graph/TypeClass"

const operation = empty<string, number>()
console.log(operation.name) // "empty"
```

**Signature**

```ts
declare const empty: <A, B>() => TextOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L843)

Since v0.0.0

## executeOperation

Apply an operation to every current leaf node, adding the results as children
(one new DAG layer). A natural transformation between graph functors.

**Example**

```ts
import { Effect } from "effect"
import { singleton, size } from "@beep/nlp/Graph/EffectGraph"
import { executeOperation, mapOperation } from "@beep/nlp/Graph/TypeClass"

const program = Effect.flatMap(
  singleton("root"),
  executeOperation(mapOperation("length", (text: string) => text.length))
)

console.log(size(Effect.runSync(program))) // 2
```

**Signature**

```ts
declare const executeOperation: { <A, B, R, E>(graph: EffectGraph<A>, operation: TextOperation<A, B, R, E>): Effect.Effect<EffectGraph<A | B>, E, R>; <A, B, R, E>(operation: TextOperation<A, B, R, E>): (graph: EffectGraph<A>) => Effect.Effect<EffectGraph<A | B>, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L294)

Since v0.0.0

## executeOperations

Apply a sequence of operations, each adding a DAG layer.

**Example**

```ts
import { Effect } from "effect"
import { singleton, size } from "@beep/nlp/Graph/EffectGraph"
import { executeOperations, mapOperation } from "@beep/nlp/Graph/TypeClass"

const graph = Effect.runSync(singleton("root"))
const program = executeOperations(graph, [
  mapOperation("length", (value: unknown) => String(value).length)
])

console.log(size(Effect.runSync(program))) // 2
```

**Signature**

```ts
declare const executeOperations: { <R, E>(graph: EffectGraph<unknown>, operations: ReadonlyArray<TextOperation<unknown, unknown, R, E>>): Effect.Effect<EffectGraph<unknown>, E, R>; <R, E>(operations: ReadonlyArray<TextOperation<unknown, unknown, R, E>>): (graph: EffectGraph<unknown>) => Effect.Effect<EffectGraph<unknown>, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L337)

Since v0.0.0

## filterOperation

Filter operation: keep nodes whose data satisfies the predicate.

**Example**

```ts
import { filterOperation } from "@beep/nlp/Graph/TypeClass"

const operation = filterOperation("non-empty", (text: string) => text.length > 0)
console.log(operation.name) // "non-empty"
```

**Signature**

```ts
declare const filterOperation: { <A>(name: string, predicate: (a: A) => boolean): TextOperation<A, A>; <A>(predicate: (a: A) => boolean): (name: string) => TextOperation<A, A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L469)

Since v0.0.0

## flatMapOperation

FlatMap operation: map then flatten in one step.

**Example**

```ts
import { flatMapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = flatMapOperation("words", (text: string) => text.split(" "))
console.log(operation.name) // "words"
```

**Signature**

```ts
declare const flatMapOperation: { <A, B>(name: string, f: (a: A) => ReadonlyArray<B>): TextOperation<A, B>; <A, B>(f: (a: A) => ReadonlyArray<B>): (name: string) => TextOperation<A, B>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L492)

Since v0.0.0

## flatten

Flatten nested operations (alias of `chain`).

**Example**

```ts
import { flatten, mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = flatten(
  mapOperation("trim", (text: string) => text.trim()),
  (text) => mapOperation("length", () => text.length)
)

console.log(operation.name) // "trim >>= chain"
```

**Signature**

```ts
declare const flatten: { <A, B, C, R1, E1, R2, E2>(operation: TextOperation<A, B, R1, E1>, getInnerOp: (b: B) => TextOperation<B, C, R2, E2>): TextOperation<A, C, R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(getInnerOp: (b: B) => TextOperation<B, C, R2, E2>): (operation: TextOperation<A, B, R1, E1>) => TextOperation<A, C, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L767)

Since v0.0.0

## foldableGraph

The `Foldable` instance for `EffectGraph`, folding over
node data in graph order.

**Example**

```ts
import { Effect } from "effect"
import { singleton } from "@beep/nlp/Graph/EffectGraph"
import { foldableGraph } from "@beep/nlp/Graph/TypeClass"

const graph = Effect.runSync(singleton("root"))
const total = foldableGraph<string>().fold(graph, (sum, value) => sum + value.length, 0)

console.log(total) // 4
```

**Signature**

```ts
declare const foldableGraph: <A>() => Foldable<EffectGraph<A>, A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L257)

Since v0.0.0

## mapOperation

Map operation: transform node data without changing structure (a functor map).

**Example**

```ts
import { mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = mapOperation("length", (text: string) => text.length)
console.log(operation.name) // "length"
```

**Signature**

```ts
declare const mapOperation: { <A, B>(name: string, f: (a: A) => B): TextOperation<A, B>; <A, B>(f: (a: A) => B): (name: string) => TextOperation<A, B>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L450)

Since v0.0.0

## pure

Lift a value into an operation that always produces it.

**Example**

```ts
import { pure } from "@beep/nlp/Graph/TypeClass"

const operation = pure<string, number>(1)
console.log(operation.name) // "pure"
```

**Signature**

```ts
declare const pure: <A, B>(value: B) => TextOperation<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L697)

Since v0.0.0

## replicate

Apply an operation `n` times and collect all results.

**Example**

```ts
import { mapOperation, replicate } from "@beep/nlp/Graph/TypeClass"

const operation = replicate(mapOperation("length", (text: string) => text.length), 2)
console.log(operation.name) // "replicate(length, 2)"
```

**Signature**

```ts
declare const replicate: { <A, B, R, E>(operation: TextOperation<A, B, R, E>, n: number): TextOperation<A, B, R, E>; (n: number): <A, B, R, E>(operation: TextOperation<A, B, R, E>) => TextOperation<A, B, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L915)

Since v0.0.0

## traverse

Traverse an operation's outputs with an effectful function.

**Example**

```ts
import { Effect } from "effect"
import { mapOperation, traverse } from "@beep/nlp/Graph/TypeClass"

const operation = traverse(
  mapOperation("trim", (text: string) => text.trim()),
  (text) => Effect.succeed(text.length)
)

console.log(operation.name) // "trim |> traverse"
```

**Signature**

```ts
declare const traverse: { <A, B, C, R1, E1, R2, E2>(operation: TextOperation<A, B, R1, E1>, f: (b: B) => Effect.Effect<C, E2, R2>): TextOperation<A, C, R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(f: (b: B) => Effect.Effect<C, E2, R2>): (operation: TextOperation<A, B, R1, E1>) => TextOperation<A, C, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L869)

Since v0.0.0

## unless

Apply an operation unless the node data satisfies the predicate.

**Example**

```ts
import { mapOperation, unless } from "@beep/nlp/Graph/TypeClass"

const operation = unless(
  (text: string) => text.length === 0,
  mapOperation("length", (text: string) => text.length)
)

console.log(operation.name) // "when(length)"
```

**Signature**

```ts
declare const unless: { <A, B, R, E>(predicate: (a: A) => boolean, operation: TextOperation<A, B, R, E>): TextOperation<A, B, R, E>; <A, B, R, E>(operation: TextOperation<A, B, R, E>): (predicate: (a: A) => boolean) => TextOperation<A, B, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L981)

Since v0.0.0

## when

Apply an operation only when the node data satisfies the predicate.

**Example**

```ts
import { mapOperation, when } from "@beep/nlp/Graph/TypeClass"

const operation = when(
  (text: string) => text.length > 0,
  mapOperation("length", (text: string) => text.length)
)

console.log(operation.name) // "when(length)"
```

**Signature**

```ts
declare const when: { <A, B, R, E>(predicate: (a: A) => boolean, operation: TextOperation<A, B, R, E>): TextOperation<A, B, R, E>; <A, B, R, E>(operation: TextOperation<A, B, R, E>): (predicate: (a: A) => boolean) => TextOperation<A, B, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L952)

Since v0.0.0

# constructors

## identityOperation

The identity operation: re-emits the node under a fresh id (effectful id).

**Example**

```ts
import { identityOperation } from "@beep/nlp/Graph/TypeClass"

const operation = identityOperation<string>()
console.log(operation.name) // "identity"
```

**Signature**

```ts
declare const identityOperation: <A>() => TextOperation<A, A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L164)

Since v0.0.0

## makeAdjunction

Pair a free expansion with its aggregation operation.

**Example**

```ts
import { makeNode } from "@beep/nlp/Graph/EffectGraph"
import { makeAdjunction, mapOperation, type ForgetfulOperation } from "@beep/nlp/Graph/TypeClass"

const aggregate: ForgetfulOperation<number, string> = {
  name: "stringify",
  apply: (nodes) => makeNode(nodes.map((node) => String(node.data)).join(","))
}
const pairing = makeAdjunction(mapOperation("length", (text: string) => text.length), aggregate)

console.log(pairing.expand.name) // "length"
```

**Signature**

```ts
declare const makeAdjunction: <A, B, R, E>(free: FreeOperation<A, B, R, E>, forgetful: ForgetfulOperation<B, A, R, E>) => { readonly expand: FreeOperation<A, B, R, E>; readonly aggregate: ForgetfulOperation<B, A, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L424)

Since v0.0.0

## makeOperation

Build a `TextOperation` from an effectful node-producing function.

**Example**

```ts
import { Effect } from "effect"
import { makeOperation } from "@beep/nlp/Graph/TypeClass"

const operation = makeOperation<string, string>("emit-none", () => Effect.succeed([]))
console.log(operation.name) // "emit-none"
```

**Signature**

```ts
declare const makeOperation: { <A, B, R = never, E = never>(name: string, apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>): TextOperation<A, B, R, E>; <A, B, R = never, E = never>(apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>): (name: string) => TextOperation<A, B, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L79)

Since v0.0.0

## pureOperation

A pure text operation: maps node data to new data values (no context/errors),
minting a child node per produced value (effectful only via id/clock).

**Example**

```ts
import { pureOperation } from "@beep/nlp/Graph/TypeClass"

const split = pureOperation("split", (text: string) => text.split(" "))
console.log(split.name) // "split"
```

**Signature**

```ts
declare const pureOperation: { <A, B>(name: string, f: (data: A) => ReadonlyArray<B>): TextOperation<A, B>; <A, B>(f: (data: A) => ReadonlyArray<B>): (name: string) => TextOperation<A, B>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L110)

Since v0.0.0

# getters

## collectData

Collect all node data values from the graph.

**Example**

```ts
import { Effect } from "effect"
import { singleton } from "@beep/nlp/Graph/EffectGraph"
import { collectData } from "@beep/nlp/Graph/TypeClass"

console.log(collectData(Effect.runSync(singleton("root")))) // ["root"]
```

**Signature**

```ts
declare const collectData: <A>(graph: EffectGraph<A>) => ReadonlyArray<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L512)

Since v0.0.0

## depth

Graph depth: the maximum node depth (longest root-to-leaf path).

**Example**

```ts
import { Effect } from "effect"
import { singleton } from "@beep/nlp/Graph/EffectGraph"
import { depth } from "@beep/nlp/Graph/TypeClass"

console.log(depth(Effect.runSync(singleton("root")))) // 0
```

**Signature**

```ts
declare const depth: <A>(graph: EffectGraph<A>) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L529)

Since v0.0.0

# mapping

## flatMap

FlatMap over a `TextOperation`'s output data with an effectful function.

**Example**

```ts
import { Effect } from "effect"
import { flatMap, mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = flatMap(
  mapOperation("trim", (text: string) => text.trim()),
  (text) => Effect.succeed(text.length)
)

console.log(operation.name) // "trim |> flatMap"
```

**Signature**

```ts
declare const flatMap: { <A, B, C, R1, E1, R2, E2>(operation: TextOperation<A, B, R1, E1>, f: (b: B) => Effect.Effect<C, E2, R2>): TextOperation<A, C, R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(f: (b: B) => Effect.Effect<C, E2, R2>): (operation: TextOperation<A, B, R1, E1>) => TextOperation<A, C, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L605)

Since v0.0.0

## map

Map over a `TextOperation`'s output data, preserving structure/effects.

**Example**

```ts
import { map, mapOperation } from "@beep/nlp/Graph/TypeClass"

const operation = map(mapOperation("trim", (text: string) => text.trim()), (text) => text.length)
console.log(operation.name) // "trim |> map"
```

**Signature**

```ts
declare const map: { <A, B, C, R, E>(operation: TextOperation<A, B, R, E>, f: (b: B) => C): TextOperation<A, C, R, E>; <A, B, C, R, E>(f: (b: B) => C): (operation: TextOperation<A, B, R, E>) => TextOperation<A, C, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L570)

Since v0.0.0

# models

## Composable (interface)

Operations composable end-to-end, forming a monoid (sequential composition +
identity). Laws: associativity and identity.

**Example**

```ts
import { composeOperations, identityOperation, type Composable } from "@beep/nlp/Graph/TypeClass"

const composable: Composable<string> = {
  compose: composeOperations,
  identity: identityOperation()
}

console.log(composable.identity.name) // "identity"
```

**Signature**

```ts
export interface Composable<A, R = never, E = never> {
  readonly compose: <B>(
    first: TextOperation<A, B, R, E>,
    second: TextOperation<B, A, R, E>
  ) => TextOperation<A, A, R, E>;
  readonly identity: TextOperation<A, A>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L142)

Since v0.0.0

## Foldable (interface)

Foldable structures of element type `A`. Laws: empty/singleton/concat
homomorphism. Parameterized by `A` so instances are implementable without
`any`.

**Example**

```ts
import type { Foldable } from "@beep/nlp/Graph/TypeClass"

const foldStrings = <F>(foldable: Foldable<F, string>, fa: F) =>
  foldable.fold(fa, (count, value) => count + value.length, 0)

console.log(foldStrings)
```

**Signature**

```ts
export interface Foldable<F, A> {
  readonly fold: <B>(fa: F, algebra: (b: B, a: A) => B, initial: B) => B;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L234)

Since v0.0.0

## ForgetfulOperation (interface)

The forgetful (aggregation) functor: many nodes to one (e.g. sentences -\> text).

**Example**

```ts
import { Effect } from "effect"
import { makeNode } from "@beep/nlp/Graph/EffectGraph"
import type { ForgetfulOperation } from "@beep/nlp/Graph/TypeClass"

const operation: ForgetfulOperation<string, string> = {
  name: "join",
  apply: (nodes) => makeNode(nodes.map((node) => node.data).join(" "))
}

console.log(operation.name) // "join"
```

**Signature**

```ts
export interface ForgetfulOperation<A, B, R = never, E = never> {
  readonly apply: (nodes: ReadonlyArray<GraphNode<A>>) => Effect.Effect<GraphNode<B>, E, R>;
  readonly name: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L399)

Since v0.0.0

## FreeOperation (type alias)

The free (expansion) functor: one node to many (e.g. text -\> sentences).

**Example**

```ts
import { mapOperation, type FreeOperation } from "@beep/nlp/Graph/TypeClass"

const operation: FreeOperation<string, number> = mapOperation("length", (text: string) => text.length)
console.log(operation.name) // "length"
```

**Signature**

```ts
type FreeOperation<A, B, R, E> = TextOperation<A, B, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L377)

Since v0.0.0

## Functor (interface)

A Functor over `F`: `map` transforms the output while preserving structure.
Laws: identity and composition. (Documented abstraction; the standalone
`map` witnesses it for `TextOperation`.)

**Example**

```ts
import type { Functor } from "@beep/nlp/Graph/TypeClass"

const acceptsFunctor = <F>(functor: Functor<F>) => functor
console.log(acceptsFunctor)
```

**Signature**

```ts
export interface Functor<F> {
  readonly map: <A, B>(fa: F, f: (a: A) => B) => F;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L552)

Since v0.0.0

## TextOperation (interface)

A morphism in the graph category: maps a node of data `A` to new nodes of data
`B`, requiring context `R` and possibly failing with `E`. Operations produce
NEW nodes, forming the next layer of the DAG.

**Example**

```ts
import { Effect } from "effect"
import { makeOperation, type TextOperation } from "@beep/nlp/Graph/TypeClass"

const operation: TextOperation<string, string> = makeOperation(
  "emit-none",
  () => Effect.succeed([])
)

console.log(operation.name) // "emit-none"
```

**Signature**

```ts
export interface TextOperation<A, B, R = never, E = never> {
  readonly apply: (node: GraphNode<A>) => Effect.Effect<ReadonlyArray<GraphNode<B>>, E, R>;
  readonly name: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TypeClass.ts#L59)

Since v0.0.0