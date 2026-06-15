---
title: PatternBuilders.ts
nav_order: 10
parent: "@beep/nlp"
---

## PatternBuilders.ts overview

Pattern builders and patch helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [addElements](#addelements)
  - [applyPatch](#applypatch)
  - [combine](#combine)
  - [composePatches](#composepatches)
  - [drop](#drop)
  - [filterElements](#filterelements)
  - [generalizeLiterals](#generalizeliterals)
  - [mapElements](#mapelements)
  - [patchReplaceAllLiterals](#patchreplaceallliterals)
  - [patchReplaceLiteralAt](#patchreplaceliteralat)
  - [prependElements](#prependelements)
  - [take](#take)
  - [withId](#withid)
  - [withMark](#withmark)
  - [withoutMark](#withoutmark)
- [constructors](#constructors)
  - [entity](#entity)
  - [literal](#literal)
  - [make](#make)
  - [optionalEntity](#optionalentity)
  - [optionalLiteral](#optionalliteral)
  - [optionalPos](#optionalpos)
  - [pos](#pos)
- [getters](#getters)
  - [elementAt](#elementat)
  - [elements](#elements)
  - [getMark](#getmark)
  - [head](#head)
  - [last](#last)
  - [length](#length)
- [models](#models)
  - [PatternPatch (type alias)](#patternpatch-type-alias)
- [predicates](#predicates)
  - [hasMark](#hasmark)
  - [isEmpty](#isempty)
---

# combinators

## addElements

Append elements to a pattern.

**Example**

```ts
import { addElements } from "@beep/nlp/Core/PatternBuilders"

console.log(addElements)
```

**Signature**

```ts
declare const addElements: PatternDual<ReadonlyArray<POSPatternElement | EntityPatternElement | LiteralPatternElement>, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L303)

Since v0.0.0

## applyPatch

Apply a patch to a pattern.

**Example**

```ts
import { applyPatch } from "@beep/nlp/Core/PatternBuilders"

console.log(applyPatch)
```

**Signature**

```ts
declare const applyPatch: PatternDual<PatternPatch, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L614)

Since v0.0.0

## combine

Combine two patterns into a new one.

**Example**

```ts
import { combine } from "@beep/nlp/Core/PatternBuilders"

console.log(combine)
```

**Signature**

```ts
declare const combine: { (left: Pattern, right: Pattern, options: { readonly id: string; }): Pattern; (right: Pattern, options: { readonly id: string; }): (left: Pattern) => Pattern; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L577)

Since v0.0.0

## composePatches

Compose multiple patches from left to right.

**Example**

```ts
import { composePatches } from "@beep/nlp/Core/PatternBuilders"

console.log(composePatches)
```

**Signature**

```ts
declare const composePatches: (...patches: ReadonlyArray<PatternPatch>) => PatternPatch
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L632)

Since v0.0.0

## drop

Drop the first `count` elements.

**Example**

```ts
import { drop } from "@beep/nlp/Core/PatternBuilders"

console.log(drop)
```

**Signature**

```ts
declare const drop: PatternDual<number, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L556)

Since v0.0.0

## filterElements

Filter pattern elements.

**Example**

```ts
import { filterElements } from "@beep/nlp/Core/PatternBuilders"

console.log(filterElements)
```

**Signature**

```ts
declare const filterElements: PatternDual<(element: PatternElement, index: number) => boolean, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L514)

Since v0.0.0

## generalizeLiterals

Generalize literal elements into other element kinds.

**Example**

```ts
import { generalizeLiterals } from "@beep/nlp/Core/PatternBuilders"

console.log(generalizeLiterals)
```

**Signature**

```ts
declare const generalizeLiterals: { (to: PatternElement): (pattern: Pattern) => Pattern; (f: LiteralReplacer): (pattern: Pattern) => Pattern; (pattern: Pattern, to: PatternElement): Pattern; (pattern: Pattern, f: LiteralReplacer): Pattern; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L699)

Since v0.0.0

## mapElements

Map pattern elements.

**Example**

```ts
import { mapElements } from "@beep/nlp/Core/PatternBuilders"

console.log(mapElements)
```

**Signature**

```ts
declare const mapElements: PatternDual<(element: PatternElement, index: number) => PatternElement, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L493)

Since v0.0.0

## patchReplaceAllLiterals

Replace all literal elements.

**Example**

```ts
import { patchReplaceAllLiterals } from "@beep/nlp/Core/PatternBuilders"

console.log(patchReplaceAllLiterals)
```

**Signature**

```ts
declare const patchReplaceAllLiterals: (replacer: LiteralReplacer) => PatternPatch
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L676)

Since v0.0.0

## patchReplaceLiteralAt

Replace a literal element at a given index.

**Example**

```ts
import { patchReplaceLiteralAt } from "@beep/nlp/Core/PatternBuilders"

console.log(patchReplaceLiteralAt)
```

**Signature**

```ts
declare const patchReplaceLiteralAt: { (index: number, replacer: (values: ReadonlyArray<string>) => PatternElement): PatternPatch; (replacer: (values: ReadonlyArray<string>) => PatternElement): (index: number) => PatternPatch; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L648)

Since v0.0.0

## prependElements

Prepend elements to a pattern.

**Example**

```ts
import { prependElements } from "@beep/nlp/Core/PatternBuilders"

console.log(prependElements)
```

**Signature**

```ts
declare const prependElements: PatternDual<ReadonlyArray<POSPatternElement | EntityPatternElement | LiteralPatternElement>, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L324)

Since v0.0.0

## take

Take the first `count` elements.

**Example**

```ts
import { take } from "@beep/nlp/Core/PatternBuilders"

console.log(take)
```

**Signature**

```ts
declare const take: PatternDual<number, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L535)

Since v0.0.0

## withId

Replace the pattern id.

**Example**

```ts
import { withId } from "@beep/nlp/Core/PatternBuilders"

console.log(withId)
```

**Signature**

```ts
declare const withId: PatternDual<string, Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L345)

Since v0.0.0

## withMark

Add a mark range to a pattern.

**Example**

```ts
import { withMark } from "@beep/nlp/Core/PatternBuilders"

console.log(withMark)
```

**Signature**

```ts
declare const withMark: PatternDual<readonly [number & Brand<"Int"> & Brand<"NonNegativeInt">, number & Brand<"Int"> & Brand<"NonNegativeInt">], Pattern>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L264)

Since v0.0.0

## withoutMark

Remove a mark range from a pattern.

**Example**

```ts
import { withoutMark } from "@beep/nlp/Core/PatternBuilders"

console.log(withoutMark)
```

**Signature**

```ts
declare const withoutMark: { (): (pattern: Pattern) => Pattern; (pattern: Pattern): Pattern; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L282)

Since v0.0.0

# constructors

## entity

Create an entity pattern element.

**Example**

```ts
import { entity } from "@beep/nlp/Core/PatternBuilders"

console.log(entity)
```

**Signature**

```ts
declare const entity: { (first: NamedEntityType | "", ...rest: ReadonlyArray<NamedEntityType | "">): EntityPatternElement; (types: ReadonlyArray<NamedEntityType | "">): EntityPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L119)

Since v0.0.0

## literal

Create a literal pattern element.

**Example**

```ts
import { literal } from "@beep/nlp/Core/PatternBuilders"

console.log(literal)
```

**Signature**

```ts
declare const literal: { (first: string, ...rest: ReadonlyArray<string>): LiteralPatternElement; (values: ReadonlyArray<string>): LiteralPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L144)

Since v0.0.0

## make

Construct a pattern from an id and ordered elements.

**Example**

```ts
import { make } from "@beep/nlp/Core/PatternBuilders"

console.log(make)
```

**Signature**

```ts
declare const make: { (id: string, elements: ReadonlyArray<PatternElement>): Pattern; (id: string): (elements: ReadonlyArray<PatternElement>) => Pattern; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L242)

Since v0.0.0

## optionalEntity

Create an optional entity pattern element.

**Example**

```ts
import { optionalEntity } from "@beep/nlp/Core/PatternBuilders"

console.log(optionalEntity)
```

**Signature**

```ts
declare const optionalEntity: { (first: NamedEntityType, ...rest: ReadonlyArray<NamedEntityType>): EntityPatternElement; (types: ReadonlyArray<NamedEntityType>): EntityPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L191)

Since v0.0.0

## optionalLiteral

Create an optional literal pattern element.

**Example**

```ts
import { optionalLiteral } from "@beep/nlp/Core/PatternBuilders"

console.log(optionalLiteral)
```

**Signature**

```ts
declare const optionalLiteral: { (first: string, ...rest: ReadonlyArray<string>): LiteralPatternElement; (values: ReadonlyArray<string>): LiteralPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L216)

Since v0.0.0

## optionalPos

Create an optional POS pattern element.

**Example**

```ts
import { optionalPos } from "@beep/nlp/Core/PatternBuilders"

console.log(optionalPos)
```

**Signature**

```ts
declare const optionalPos: { (first: UniversalPOSTag, ...rest: ReadonlyArray<UniversalPOSTag>): POSPatternElement; (tags: ReadonlyArray<UniversalPOSTag>): POSPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L166)

Since v0.0.0

## pos

Create a POS pattern element.

**Example**

```ts
import { pos } from "@beep/nlp/Core/PatternBuilders"

console.log(pos)
```

**Signature**

```ts
declare const pos: { (first: UniversalPOSTag | "", ...rest: ReadonlyArray<UniversalPOSTag | "">): POSPatternElement; (tags: ReadonlyArray<UniversalPOSTag | "">): POSPatternElement; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L94)

Since v0.0.0

# getters

## elementAt

Get an element by index.

**Example**

```ts
import { elementAt } from "@beep/nlp/Core/PatternBuilders"

console.log(elementAt)
```

**Signature**

```ts
declare const elementAt: { (pattern: Pattern, index: number): PatternElement | undefined; (index: number): (pattern: Pattern) => PatternElement | undefined; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L424)

Since v0.0.0

## elements

Materialize pattern elements as a readonly array.

**Example**

```ts
import { elements } from "@beep/nlp/Core/PatternBuilders"

console.log(elements)
```

**Signature**

```ts
declare const elements: (pattern: Pattern) => ReadonlyArray<PatternElement>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L409)

Since v0.0.0

## getMark

Get a pattern's mark if present.

**Example**

```ts
import { getMark } from "@beep/nlp/Core/PatternBuilders"

console.log(getMark)
```

**Signature**

```ts
declare const getMark: (pattern: Pattern) => MarkRange | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L378)

Since v0.0.0

## head

Get the first pattern element.

**Example**

```ts
import { head } from "@beep/nlp/Core/PatternBuilders"

console.log(head)
```

**Signature**

```ts
declare const head: (pattern: Pattern) => PatternElement | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L463)

Since v0.0.0

## last

Get the last pattern element.

**Example**

```ts
import { last } from "@beep/nlp/Core/PatternBuilders"

console.log(last)
```

**Signature**

```ts
declare const last: (pattern: Pattern) => PatternElement | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L478)

Since v0.0.0

## length

Count pattern elements.

**Example**

```ts
import { length } from "@beep/nlp/Core/PatternBuilders"

console.log(length)
```

**Signature**

```ts
declare const length: (pattern: Pattern) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L394)

Since v0.0.0

# models

## PatternPatch (type alias)

Functional patch over a pattern.

**Example**

```ts
import type { PatternPatch } from "@beep/nlp/Core/PatternBuilders"

type Example = PatternPatch
```

**Signature**

```ts
type PatternPatch = (pattern: Pattern) => Pattern
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L599)

Since v0.0.0

# predicates

## hasMark

Test whether a pattern has a mark.

**Example**

```ts
import { hasMark } from "@beep/nlp/Core/PatternBuilders"

console.log(hasMark)
```

**Signature**

```ts
declare const hasMark: (pattern: Pattern) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L363)

Since v0.0.0

## isEmpty

Test whether a pattern is empty.

**Example**

```ts
import { isEmpty } from "@beep/nlp/Core/PatternBuilders"

console.log(isEmpty)
```

**Signature**

```ts
declare const isEmpty: (pattern: Pattern) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternBuilders.ts#L448)

Since v0.0.0