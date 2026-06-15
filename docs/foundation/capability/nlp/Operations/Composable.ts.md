---
title: Composable.ts
nav_order: 39
parent: "@beep/nlp"
---

## Composable.ts overview

Operations/Composable - composable NLP operations as Kleisli arrows.

An `OperationBuilder` wraps an effectful arrow `A -> Effect<B, E, R>` with
its input/output schemas, exposing the categorical combinators: `map` (Functor),
`flatMap` (Monad), `product`/`zipWith` (Applicative), plus traversal helpers.
`run` applies the arrow to a typed input; the schemas are carried as metadata.

Effect v4 `@beep/nlp` implementation notes:
- the `@effect/typeclass` instances (Foldable/SemiApplicative/Traversable) are
  reimplemented on core `effect` (`Effect.zipWith`/`Effect.all`/`Effect.forEach`
  and `Monoid` from `@beep/nlp/Algebra/Monoid#Monoid`), since `@effect/typeclass`
  is not a dependency here.
- the builder is parameterized by the DECODED value types `A`/`B` (schemas carried
  as `Schema.Schema<A>`/`Schema.Schema<B>`), avoiding `any` and the v4 schema
  variance (`DecodingServices`/tuple optionality) that leaks through `Schema.Top`.
- `flatMap` takes the next operation directly, so no fake value is
  constructed and there are no casts.
- `run` applies the (already typed `A`) input directly; the input/output schemas
  are carried as introspection metadata. Re-decoding a typed value would leak
  the schema's `DecodingServices` into the requirements channel.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [compose](#compose)
  - [map](#map)
  - [product](#product)
  - [zipWith](#zipwith)
- [constructors](#constructors)
  - [fromDefinition](#fromdefinition)
  - [identity](#identity)
  - [makeOperation](#makeoperation)
  - [makePureOperation](#makepureoperation)
- [folding](#folding)
  - [aggregate](#aggregate)
- [models](#models)
  - [NLPOperation (type alias)](#nlpoperation-type-alias)
  - [OperationBuilder (class)](#operationbuilder-class)
    - [run (method)](#run-method)
    - [map (method)](#map-method)
    - [flatMap (method)](#flatmap-method)
    - [product (method)](#product-method)
    - [zipWith (method)](#zipwith-method)
    - [operation (property)](#operation-property)
    - [inputSchema (property)](#inputschema-property)
    - [outputSchema (property)](#outputschema-property)
    - [name (property)](#name-property)
- [sequencing](#sequencing)
  - [traverse](#traverse)
---

# combinators

## compose

Sequential composition: feed the first operation's output into the second.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { compose, makePureOperation } from "@beep/nlp/Operations/Composable"

const trim = makePureOperation("trim", S.String, S.String, (input) => input.trim())
const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const pipeline = compose(trim, length)

Effect.runPromise(pipeline.run(" Effect ")).then(console.log) // 6
```

**Signature**

```ts
declare const compose: <A, B, C, R1, E1, R2, E2>(first: OperationBuilder<A, B, R1, E1>, second: OperationBuilder<B, C, R2, E2>) => OperationBuilder<A, C, R1 | R2, E1 | E2>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L467)

Since v0.0.0

## map

Functor map for `OperationBuilder`, exposed as a dual helper for
data-first and data-last use.

**Example**

```ts
import { Effect, pipe } from "effect"
import * as S from "effect/Schema"
import { makePureOperation, map } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)

const dataFirst = map(length, (n) => n + 1, S.Finite)
const dataLast = pipe(length, map((n) => n * 2, S.Finite))

Effect.runPromise(dataFirst.run("nlp")).then(console.log) // 4
Effect.runPromise(dataLast.run("nlp")).then(console.log) // 6
```

**Signature**

```ts
declare const map: { <B, C>(f: (b: B) => C, outputSchema: S.Schema<C>): <A, R, E>(self: OperationBuilder<A, B, R, E>) => OperationBuilder<A, C, R, E>; <A, B, C, R, E>(self: OperationBuilder<A, B, R, E>, f: (b: B) => C, outputSchema: S.Schema<C>): OperationBuilder<A, C, R, E>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L342)

Since v0.0.0

## product

Applicative product for `OperationBuilder`, exposed as a dual helper for
data-first and data-last use.

**Example**

```ts
import { Effect, pipe } from "effect"
import * as S from "effect/Schema"
import { makePureOperation, product } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const upper = makePureOperation("upper", S.String, S.String, (input) => input.toUpperCase())

const dataFirst = product(length, upper, S.Tuple([S.Finite, S.String]))
const dataLast = pipe(length, product(upper, S.Tuple([S.Finite, S.String])))

Effect.runPromise(dataFirst.run("nlp")).then(console.log) // [3, "NLP"]
Effect.runPromise(dataLast.run("nlp")).then(console.log) // [3, "NLP"]
```

**Signature**

```ts
declare const product: { <A, B, C, R2, E2>(that: OperationBuilder<A, C, R2, E2>, outputSchema: S.Schema<readonly [B, C]>): <R1, E1>(self: OperationBuilder<A, B, R1, E1>) => OperationBuilder<A, readonly [B, C], R1 | R2, E1 | E2>; <A, B, C, R1, E1, R2, E2>(self: OperationBuilder<A, B, R1, E1>, that: OperationBuilder<A, C, R2, E2>, outputSchema: S.Schema<readonly [B, C]>): OperationBuilder<A, readonly [B, C], R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L384)

Since v0.0.0

## zipWith

Applicative zipWith for `OperationBuilder`, exposed as a dual helper for
data-first and data-last use.

**Example**

```ts
import { Effect, pipe } from "effect"
import * as S from "effect/Schema"
import { makePureOperation, zipWith } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const upper = makePureOperation("upper", S.String, S.String, (input) => input.toUpperCase())

const dataFirst = zipWith(length, upper, (size, text) => `${text}:${size}`, S.String)
const dataLast = pipe(length, zipWith(upper, (size, text) => `${text}:${size}`, S.String))

Effect.runPromise(dataFirst.run("nlp")).then(console.log) // "NLP:3"
Effect.runPromise(dataLast.run("nlp")).then(console.log) // "NLP:3"
```

**Signature**

```ts
declare const zipWith: { <A, B, C, D, R2, E2>(that: OperationBuilder<A, C, R2, E2>, f: (b: B, c: C) => D, resultSchema: S.Schema<D>): <R1, E1>(self: OperationBuilder<A, B, R1, E1>) => OperationBuilder<A, D, R1 | R2, E1 | E2>; <A, B, C, D, R1, E1, R2, E2>(self: OperationBuilder<A, B, R1, E1>, that: OperationBuilder<A, C, R2, E2>, f: (b: B, c: C) => D, resultSchema: S.Schema<D>): OperationBuilder<A, D, R1 | R2, E1 | E2>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L426)

Since v0.0.0

# constructors

## fromDefinition

Build an `OperationBuilder` from a structured `OperationDefinition`.

**Example**

```ts
import { fromDefinition } from "@beep/nlp/Operations/Composable"
import { Effect } from "effect"
import * as S from "effect/Schema"

const operation = fromDefinition({
  name: "id",
  inputSchema: S.String,
  outputSchema: S.String,
  implementation: Effect.succeed
})

Effect.runPromise(operation.run("Effect")).then(console.log) // "Effect"
```

**Signature**

```ts
declare const fromDefinition: <A, B, R, E>(definition: OperationDefinition<A, B, R, E>) => OperationBuilder<A, B, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L294)

Since v0.0.0

## identity

The identity operation: returns its input unchanged.

**Example**

```ts
import { identity } from "@beep/nlp/Operations/Composable"
import { Effect } from "effect"
import * as S from "effect/Schema"

Effect.runPromise(identity(S.String).run("same")).then(console.log) // "same"
```

**Signature**

```ts
declare const identity: <A>(schema: S.Schema<A>) => OperationBuilder<A, A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L487)

Since v0.0.0

## makeOperation

Build an `OperationBuilder` from name, schemas, and an effectful arrow.

**Example**

```ts
import { makeOperation } from "@beep/nlp/Operations/Composable"
import * as S from "effect/Schema"
import { Effect } from "effect"

const length = makeOperation("len", S.String, S.Finite, (s) => Effect.succeed(s.length))
Effect.runPromise(length.run("Effect")).then(console.log) // 6
```

**Signature**

```ts
declare const makeOperation: <A, B, R = never, E = never>(name: string, inputSchema: S.Schema<A>, outputSchema: S.Schema<B>, f: NLPOperation<A, B, R, E>) => OperationBuilder<A, B, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L265)

Since v0.0.0

## makePureOperation

Build a pure (context-free, infallible) operation from a plain function.

**Example**

```ts
import { makePureOperation } from "@beep/nlp/Operations/Composable"
import * as S from "effect/Schema"
import { Effect } from "effect"

const upper = makePureOperation("upper", S.String, S.String, (s) => s.toUpperCase())
Effect.runPromise(upper.run("effect")).then(console.log) // "EFFECT"
```

**Signature**

```ts
declare const makePureOperation: <A, B>(name: string, inputSchema: S.Schema<A>, outputSchema: S.Schema<B>, f: (input: A) => B) => OperationBuilder<A, B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L313)

Since v0.0.0

# folding

## aggregate

Aggregate an array of values into a single value using a `Monoid.Monoid`.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import { aggregate } from "@beep/nlp/Operations/Composable"

const totalCharacters = aggregate(Monoid.NumberSum, (text: string) => text.length)

console.log(totalCharacters(["typed", "nlp"])) // 8
```

**Signature**

```ts
declare const aggregate: <A, M>(monoid: Monoid.Monoid<M>, f: (a: A) => M) => (values: ReadonlyArray<A>) => M
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L529)

Since v0.0.0

# models

## NLPOperation (type alias)

An effectful arrow from `A` to `B` requiring context `R` and failing with `E`.

**Example**

```ts
import { Effect } from "effect"
import type { NLPOperation } from "@beep/nlp/Operations/Composable"

const length: NLPOperation<string, number> = (input) => Effect.succeed(input.length)
Effect.runPromise(length("Effect")).then(console.log) // 6
```

**Signature**

```ts
type NLPOperation<A, B, R, E> = (input: A) => Effect.Effect<B, E, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L53)

Since v0.0.0

## OperationBuilder (class)

A composable operation carrying its input/output schemas alongside its arrow,
parameterized by the decoded value types `A` (input) and `B` (output).

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { OperationBuilder } from "@beep/nlp/Operations/Composable"

const operation = new OperationBuilder(
  (input: string) => Effect.succeed(input.toUpperCase()),
  S.String,
  S.String,
  "upper"
)

Effect.runPromise(operation.run("effect")).then(console.log) // "EFFECT"
```

**Signature**

```ts
declare class OperationBuilder<A, B, R, E> { constructor(operation: NLPOperation<A, B, R, E>, inputSchema: S.Schema<A>, outputSchema: S.Schema<B>, name: string) }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L78)

Since v0.0.0

### run (method)

Execute the operation on a typed input.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation } from "@beep/nlp/Operations/Composable"

const operation = makePureOperation("trim", S.String, S.String, (input) => input.trim())
Effect.runPromise(operation.run("  Effect  ")).then(console.log) // "Effect"
```

**Signature**

```ts
declare const run: (input: A) => Effect.Effect<B, E, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L107)

Since v0.0.0

### map (method)

Functor map: transform the result, supplying the new output schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation } from "@beep/nlp/Operations/Composable"

const words = makePureOperation("words", S.String, S.Array(S.String), (input) => input.split(" "))
const count = words.map((tokens) => tokens.length, S.Finite)
Effect.runPromise(count.run("typed effects compose")).then(console.log) // 3
```

**Signature**

```ts
declare const map: <C>(f: (b: B) => C, outputSchema: S.Schema<C>) => OperationBuilder<A, C, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L128)

Since v0.0.0

### flatMap (method)

Monad flatMap: sequence into a dependent operation whose input is this
operation's output. The next operation's output schema becomes the result's.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation } from "@beep/nlp/Operations/Composable"

const trim = makePureOperation("trim", S.String, S.String, (input) => input.trim())
const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const pipeline = trim.flatMap(length)
Effect.runPromise(pipeline.run(" Effect ")).then(console.log) // 6
```

**Signature**

```ts
declare const flatMap: <C, R2, E2>(next: OperationBuilder<B, C, R2, E2>) => OperationBuilder<A, C, R | R2, E | E2>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L151)

Since v0.0.0

### product (method)

Applicative product: run both operations on the same input, pairing results.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const upper = makePureOperation("upper", S.String, S.String, (input) => input.toUpperCase())
const summary = length.product(upper, S.Tuple([S.Finite, S.String]))
Effect.runPromise(summary.run("nlp")).then(console.log) // [3, "NLP"]
```

**Signature**

```ts
declare const product: <C, R2, E2>(that: OperationBuilder<A, C, R2, E2>, outputSchema: S.Schema<readonly [B, C]>) => OperationBuilder<A, readonly [B, C], R | R2, E | E2>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L178)

Since v0.0.0

### zipWith (method)

Applicative zipWith: run both operations on the same input, combining results.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const upper = makePureOperation("upper", S.String, S.String, (input) => input.toUpperCase())
const label = length.zipWith(upper, (size, text) => `${text}:${size}`, S.String)
Effect.runPromise(label.run("nlp")).then(console.log) // "NLP:3"
```

**Signature**

```ts
declare const zipWith: <C, D, R2, E2>(that: OperationBuilder<A, C, R2, E2>, f: (b: B, c: C) => D, resultSchema: S.Schema<D>) => OperationBuilder<A, D, R | R2, E | E2>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L203)

Since v0.0.0

### operation (property)

**Signature**

```ts
readonly operation: NLPOperation<A, B, R, E>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L79)

### inputSchema (property)

**Signature**

```ts
readonly inputSchema: S.Schema<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L80)

### outputSchema (property)

**Signature**

```ts
readonly outputSchema: S.Schema<B>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L81)

### name (property)

**Signature**

```ts
readonly name: string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L82)

# sequencing

## traverse

Traverse an array of inputs through an operation, collecting decoded results.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { makePureOperation, traverse } from "@beep/nlp/Operations/Composable"

const length = makePureOperation("length", S.String, S.Finite, (input) => input.length)
const program = traverse(length)(["typed", "nlp"])

Effect.runPromise(program).then(console.log) // [5, 3]
```

**Signature**

```ts
declare const traverse: <A, B, R, E>(operation: OperationBuilder<A, B, R, E>) => (inputs: ReadonlyArray<A>) => Effect.Effect<ReadonlyArray<B>, E, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Operations/Composable.ts#L508)

Since v0.0.0