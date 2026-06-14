---
title: Monoid.ts
nav_order: 2
parent: "@beep/nlp"
---

## Monoid.ts overview

Algebraic monoid primitives and reusable instances.

Since v0.0.0

---
## Exports Grouped by Category
- [accessors](#accessors)
  - [getAverage](#getaverage)
- [combinators](#combinators)
  - [ArrayConcat](#arrayconcat)
  - [BooleanAll](#booleanall)
  - [BooleanAny](#booleanany)
  - [Dual](#dual)
  - [Endo](#endo)
  - [MultiSet](#multiset)
  - [NumberMax](#numbermax)
  - [NumberMin](#numbermin)
  - [NumberProduct](#numberproduct)
  - [NumberSum](#numbersum)
  - [Option](#option)
  - [Product](#product)
  - [Product3](#product3)
  - [SetIntersection](#setintersection)
  - [SetUnion](#setunion)
  - [StringConcat](#stringconcat)
  - [StringDelimited](#stringdelimited)
  - [StringJoin](#stringjoin)
  - [VectorAdd](#vectoradd)
  - [VectorAverage](#vectoraverage)
- [constructors](#constructors)
  - [make](#make)
- [folding](#folding)
  - [combineAll](#combineall)
  - [fold](#fold)
- [models](#models)
  - [Monoid (interface)](#monoid-interface)
- [predicates](#predicates)
  - [checkAssociativity](#checkassociativity)
  - [checkLaws](#checklaws)
  - [checkLeftIdentity](#checkleftidentity)
  - [checkRightIdentity](#checkrightidentity)
---

# accessors

## getAverage

Extract the average from a `VectorAverage` result.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const average = Monoid.getAverage({ sum: [12, 18], count: 3 })

console.log(average)
// [4, 6]
```

**Signature**

```ts
declare const getAverage: (result: { readonly sum: ReadonlyArray<number>; readonly count: number; }) => ReadonlyArray<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L496)

Since v0.0.0

# combinators

## ArrayConcat

Array concatenation monoid (empty: []).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const tokens = Monoid.fold(Monoid.ArrayConcat<string>())([["effect"], ["schema", "model"]])

console.log(tokens)
// ["effect", "schema", "model"]
```

**Signature**

```ts
declare const ArrayConcat: <A>() => Monoid<ReadonlyArray<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L320)

Since v0.0.0

## BooleanAll

Logical AND monoid (empty: true).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const allChecksPassed = Monoid.fold(Monoid.BooleanAll)([true, true, false])

console.log(allChecksPassed)
// false
```

**Signature**

```ts
declare const BooleanAll: Monoid<boolean>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L661)

Since v0.0.0

## BooleanAny

Logical OR monoid (empty: false).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const anyMatch = Monoid.fold(Monoid.BooleanAny)([false, false, true])

console.log(anyMatch)
// true
```

**Signature**

```ts
declare const BooleanAny: Monoid<boolean>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L682)

Since v0.0.0

## Dual

Dual monoid: reverse the order of combination (x ⊕' y = y ⊕ x).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const reversed = Monoid.fold(Monoid.Dual(Monoid.StringJoin(" -> ")))(["parse", "rank", "answer"])

console.log(reversed)
// "answer -> rank -> parse"
```

**Signature**

```ts
declare const Dual: <A>(monoid: Monoid<A>) => Monoid<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L636)

Since v0.0.0

## Endo

Endomorphism monoid: functions from A to A under composition (empty: identity).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const normalize = Monoid.fold(Monoid.Endo<string>())([
  (value) => value.trim(),
  (value) => value.toLowerCase()
])
const result = normalize("  EFFECT  ")

console.log(result)
// "effect"
```

**Signature**

```ts
declare const Endo: <A>() => Monoid<(a: A) => A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L611)

Since v0.0.0

## MultiSet

Multiset (bag) union monoid.

A multiset is a collection where elements can appear multiple times.
Union adds the multiplicities.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import { HashMap } from "effect"

const first = HashMap.make(["effect", 2], ["schema", 1])
const second = HashMap.make(["effect", 3], ["nlp", 1])
const counts = Monoid.MultiSet<string>().combine(first, second)

console.log(HashMap.get(counts, "effect"))
// Option.some(5)
```

**Signature**

```ts
declare const MultiSet: <K>() => Monoid<HashMap.HashMap<K, number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L351)

Since v0.0.0

## NumberMax

Max monoid for numbers (empty: -Infinity).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const peakScore = Monoid.fold(Monoid.NumberMax)([0.42, 0.91, 0.73])

console.log(peakScore)
// 0.91
```

**Signature**

```ts
declare const NumberMax: Monoid<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L274)

Since v0.0.0

## NumberMin

Min monoid for numbers (empty: Infinity).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const nearestDistance = Monoid.fold(Monoid.NumberMin)([12, 4, 19])

console.log(nearestDistance)
// 4
```

**Signature**

```ts
declare const NumberMin: Monoid<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L295)

Since v0.0.0

## NumberProduct

Multiplication monoid for numbers (empty: 1).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const combinedWeight = Monoid.fold(Monoid.NumberProduct)([0.8, 0.5, 0.25])

console.log(combinedWeight)
// 0.1
```

**Signature**

```ts
declare const NumberProduct: Monoid<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L253)

Since v0.0.0

## NumberSum

Addition monoid for numbers (empty: 0).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const wordCount = Monoid.fold(Monoid.NumberSum)([120, 80, 30])

console.log(wordCount)
// 230
```

**Signature**

```ts
declare const NumberSum: Monoid<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L232)

Since v0.0.0

## Option

Lift a monoid through Option: combine point-wise, treating `None` as the identity.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as O from "effect/Option"

const OptionalScores = Monoid.Option(Monoid.NumberSum)
const score = Monoid.fold(OptionalScores)([O.some(2), O.none(), O.some(5)])

console.log(score)
// Option.some(7)
```

**Signature**

```ts
declare const Option: <A>(monoid: Monoid<A>) => Monoid<O.Option<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L577)

Since v0.0.0

## Product

Product monoid: combine two monoids component-wise.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const Stats = Monoid.Product(Monoid.NumberSum, Monoid.NumberMax)
const result = Monoid.fold(Stats)([
  [10, 0.4],
  [15, 0.9]
])

console.log(result)
// [25, 0.9]
```

**Signature**

```ts
declare const Product: <A, B>(ma: Monoid<A>, mb: Monoid<B>) => Monoid<readonly [A, B]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L525)

Since v0.0.0

## Product3

Triple product monoid.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const CorpusStats = Monoid.Product3(Monoid.NumberSum, Monoid.NumberSum, Monoid.NumberMax)
const result = Monoid.fold(CorpusStats)([
  [100, 4, 0.71],
  [80, 3, 0.92]
])

console.log(result)
// [180, 7, 0.92]
```

**Signature**

```ts
declare const Product3: <A, B, C>(ma: Monoid<A>, mb: Monoid<B>, mc: Monoid<C>) => Monoid<readonly [A, B, C]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L550)

Since v0.0.0

## SetIntersection

Set intersection monoid.

Note: There is no universal identity element for intersection over an
unbounded universe, so we model the identity as the "universal set" via
`Option.none()` (intersecting with the universal set is the identity).
Only use when all elements come from a finite universe.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as HashSet from "effect/HashSet"
import * as O from "effect/Option"

const commonTags = Monoid.fold(Monoid.SetIntersection<string>())([
  O.some(HashSet.make("noun", "topic", "entity")),
  O.some(HashSet.make("topic", "entity"))
])

console.log(O.map(commonTags, (tags) => Array.from(tags).sort()))
// Option.some(["entity", "topic"])
```

**Signature**

```ts
declare const SetIntersection: <A>() => Monoid<O.Option<HashSet.HashSet<A>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L411)

Since v0.0.0

## SetUnion

Set union monoid (empty: ∅).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import * as HashSet from "effect/HashSet"

const vocabulary = Monoid.fold(Monoid.SetUnion<string>())([
  HashSet.make("effect", "schema"),
  HashSet.make("schema", "nlp")
])

console.log(Array.from(vocabulary).sort())
// ["effect", "nlp", "schema"]
```

**Signature**

```ts
declare const SetUnion: <A>() => Monoid<HashSet.HashSet<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L380)

Since v0.0.0

## StringConcat

String concatenation monoid.

- Empty: ""
- Combine: (x, y) =\> x + y

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const token = Monoid.fold(Monoid.StringConcat)(["sub", "word"])

console.log(token)
// "subword"
```

**Signature**

```ts
declare const StringConcat: Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L153)

Since v0.0.0

## StringDelimited

String join with prefix and suffix, useful for creating delimited lists.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const list = Monoid.fold(Monoid.StringDelimited("[", "]", ", "))(["alpha", "beta", "gamma"])

console.log(list)
// "[alpha, beta, gamma]"
```

**Signature**

```ts
declare const StringDelimited: (prefix: string, suffix: string, separator: string) => Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L201)

Since v0.0.0

## StringJoin

String join with separator monoid.

Combines strings with a separator, intelligently handling empty strings.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const phrase = Monoid.fold(Monoid.StringJoin(" "))(["effect", "", "schemas"])

console.log(phrase)
// "effect schemas"
```

**Signature**

```ts
declare const StringJoin: (separator: string) => Monoid<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L176)

Since v0.0.0

## VectorAdd

Vector addition monoid (element-wise addition; empty: zero vector).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const embeddingSum = Monoid.fold(Monoid.VectorAdd(3))([
  [1, 2, 3],
  [4, 5, 6]
])

console.log(embeddingSum)
// [5, 7, 9]
```

**Signature**

```ts
declare const VectorAdd: (dimension: number) => Monoid<ReadonlyArray<number>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L445)

Since v0.0.0

## VectorAverage

Vector average monoid (tracks sum and count to compute a running average).

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const accumulated = Monoid.fold(Monoid.VectorAverage(2))([
  { sum: [2, 4], count: 1 },
  { sum: [4, 8], count: 1 }
])
const average = Monoid.getAverage(accumulated)

console.log(average)
// [3, 6]
```

**Signature**

```ts
declare const VectorAverage: (dimension: number) => Monoid<{ readonly sum: ReadonlyArray<number>; readonly count: number; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L470)

Since v0.0.0

# constructors

## make

Helper to create a Monoid instance

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import { dual } from "effect/Function"

const combineScores: Monoid.Monoid<number>["combine"] = dual(2, (left, right) => left + right)
const scoreMonoid = Monoid.make(0, combineScores)
const score = scoreMonoid.combine(7, 4)

console.log(score)
// 11
```

**Signature**

```ts
declare const make: <A>(empty: A, combine: Monoid<A>["combine"]) => Monoid<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L75)

Since v0.0.0

# folding

## combineAll

Combine an array of values using a monoid, seeded with the identity.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const joined = Monoid.combineAll(Monoid.StringJoin(" / "))(["title", "summary", "body"])

console.log(joined)
// "title / summary / body"
```

**Signature**

```ts
declare const combineAll: <A>(monoid: Monoid<A>) => (values: ReadonlyArray<A>) => A
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L125)

Since v0.0.0

## fold

Fold a collection using a monoid
This is the fundamental aggregation operation.

Category theory: This is a catamorphism from the list functor to the monoid.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const totalCharacters = Monoid.fold(Monoid.NumberSum)([5, 8, 13])

console.log(totalCharacters)
// 26
```

**Signature**

```ts
declare const fold: <A>(monoid: Monoid<A>) => (values: Iterable<A>) => A
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L99)

Since v0.0.0

# models

## Monoid (interface)

Monoid type class

A monoid is an algebraic structure with:
- An identity element (empty)
- An associative binary operation (combine)

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"
import { dual } from "effect/Function"

const combineScores: Monoid.Monoid<number>["combine"] = dual(2, (left, right) => left + right)
const Sum: Monoid.Monoid<number> = Monoid.make(0, combineScores)
const total = Monoid.fold(Sum)([2, 3, 5])

console.log(total)
// 10
```

**Signature**

```ts
export interface Monoid<A> {
  /**
   * Associative binary operation
   * Must satisfy: combine(combine(x, y), z) = combine(x, combine(y, z))
   */
  readonly combine: {
    (x: A, y: A): A;
    (y: A): (x: A) => A;
  };
  /**
   * The identity element
   * Must satisfy: combine(empty, x) = x = combine(x, empty)
   */
  readonly empty: A;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L40)

Since v0.0.0

# predicates

## checkAssociativity

Check associativity law: (x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const valid = Monoid.checkAssociativity(Monoid.NumberProduct, 2, 3, 4)

console.log(valid)
// true
```

**Signature**

```ts
declare const checkAssociativity: <A>(monoid: Monoid<A>, x: A, y: A, z: A, equals?: (a: A, b: A) => boolean) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L751)

Since v0.0.0

## checkLaws

Check all monoid laws against a representative triple.

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const valid = Monoid.checkLaws(Monoid.NumberSum, [1, 2, 3])

console.log(valid)
// true
```

**Signature**

```ts
declare const checkLaws: <A>(monoid: Monoid<A>, values: readonly [A, A, A], equals?: (a: A, b: A) => boolean) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L779)

Since v0.0.0

## checkLeftIdentity

Check left identity law: empty ⊕ x = x

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const valid = Monoid.checkLeftIdentity(Monoid.StringJoin(" "), "token")

console.log(valid)
// true
```

**Signature**

```ts
declare const checkLeftIdentity: <A>(monoid: Monoid<A>, x: A, equals?: (a: A, b: A) => boolean) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L707)

Since v0.0.0

## checkRightIdentity

Check right identity law: x ⊕ empty = x

**Example**

```ts
import * as Monoid from "@beep/nlp/Algebra/Monoid"

const valid = Monoid.checkRightIdentity(Monoid.NumberSum, 42)

console.log(valid)
// true
```

**Signature**

```ts
declare const checkRightIdentity: <A>(monoid: Monoid<A>, x: A, equals?: (a: A, b: A) => boolean) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Algebra/Monoid.ts#L729)

Since v0.0.0