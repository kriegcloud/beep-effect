---
title: Pattern.ts
nav_order: 9
parent: "@beep/nlp"
---

## Pattern.ts overview

Schema-first NLP pattern model.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EntityPatternElement (class)](#entitypatternelement-class)
  - [EntityPatternOption](#entitypatternoption)
  - [EntityPatternOption (type alias)](#entitypatternoption-type-alias)
  - [LiteralPatternElement (class)](#literalpatternelement-class)
  - [LiteralPatternOption](#literalpatternoption)
  - [LiteralPatternOption (type alias)](#literalpatternoption-type-alias)
  - [MarkRange](#markrange)
  - [MarkRange (type alias)](#markrange-type-alias)
  - [NamedEntityType](#namedentitytype)
  - [NamedEntityType (type alias)](#namedentitytype-type-alias)
  - [POSPatternElement (class)](#pospatternelement-class)
  - [POSPatternOption](#pospatternoption)
  - [POSPatternOption (type alias)](#pospatternoption-type-alias)
  - [Pattern (class)](#pattern-class)
  - [PatternElement](#patternelement)
  - [PatternElement (type alias)](#patternelement-type-alias)
  - [PatternId](#patternid)
  - [PatternId (type alias)](#patternid-type-alias)
  - [UniversalPOSTag](#universalpostag)
  - [UniversalPOSTag (type alias)](#universalpostag-type-alias)
---

# models

## EntityPatternElement (class)

Tagged pattern element that matches named-entity alternatives.

**Example**

```ts
import { EntityPatternElement } from "@beep/nlp/Core/Pattern"

const element = EntityPatternElement.make({ value: ["EMAIL"] })
console.log(element._tag) // "EntityPatternElement"
```

**Signature**

```ts
declare class EntityPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L328)

Since v0.0.0

## EntityPatternOption

Non-empty set of entity-type choices for one pattern slot.

**Example**

```ts
import { EntityPatternOption } from "@beep/nlp/Core/Pattern"

const option = EntityPatternOption.make(["EMAIL", "URL"])
console.log(option.includes("URL")) // true
```

**Signature**

```ts
declare const EntityPatternOption: AnnotatedSchema<S.NonEmptyArray<S.Union<readonly [LiteralKit<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"], undefined> & SchemaStatics<LiteralKit<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"], undefined>> & LiteralKitStatics<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"]>, AnnotatedSchema<S.Literal<"">>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L225)

Since v0.0.0

## EntityPatternOption (type alias)

Runtime type for `EntityPatternOption`.

**Example**

```ts
import type { EntityPatternOption } from "@beep/nlp/Core/Pattern"

type Example = EntityPatternOption
```

**Signature**

```ts
type EntityPatternOption = typeof EntityPatternOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L246)

Since v0.0.0

## LiteralPatternElement (class)

Tagged pattern element that matches literal token text alternatives.

**Example**

```ts
import { LiteralPatternElement } from "@beep/nlp/Core/Pattern"

const element = LiteralPatternElement.make({ value: ["Effect"] })
console.log(element.value[0]) // "Effect"
```

**Signature**

```ts
declare class LiteralPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L352)

Since v0.0.0

## LiteralPatternOption

Non-empty set of literal token-text choices for one pattern slot.

**Example**

```ts
import { LiteralPatternOption } from "@beep/nlp/Core/Pattern"

const option = LiteralPatternOption.make(["Effect", "effect-ts"])
console.log(option[0]) // "Effect"
```

**Signature**

```ts
declare const LiteralPatternOption: AnnotatedSchema<S.NonEmptyArray<S.Union<readonly [S.NonEmptyString, AnnotatedSchema<S.Literal<"">>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L266)

Since v0.0.0

## LiteralPatternOption (type alias)

Runtime type for `LiteralPatternOption`.

**Example**

```ts
import type { LiteralPatternOption } from "@beep/nlp/Core/Pattern"

type Example = LiteralPatternOption
```

**Signature**

```ts
type LiteralPatternOption = typeof LiteralPatternOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L288)

Since v0.0.0

## MarkRange

Inclusive `[start, end]` element-index range selected by a pattern.

**Example**

```ts
import * as S from "effect/Schema"
import { MarkRange } from "@beep/nlp/Core/Pattern"

const range = S.decodeUnknownSync(MarkRange)([1, 2])
console.log(range[0]) // 1
```

**Signature**

```ts
declare const MarkRange: AnnotatedSchema<S.Tuple<readonly [AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>, AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L452)

Since v0.0.0

## MarkRange (type alias)

Runtime type for `MarkRange`.

**Example**

```ts
import type { MarkRange } from "@beep/nlp/Core/Pattern"

type Example = MarkRange
```

**Signature**

```ts
type MarkRange = typeof MarkRange.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L471)

Since v0.0.0

## NamedEntityType

Named-entity labels accepted by wink-backed entity pattern matching.

**Example**

```ts
import { NamedEntityType } from "@beep/nlp/Core/Pattern"

console.log(NamedEntityType.is.EMAIL("EMAIL")) // true
console.log(NamedEntityType.is.EMAIL("URL")) // false
```

**Signature**

```ts
declare const NamedEntityType: LiteralKit<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"], undefined> & SchemaStatics<LiteralKit<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"], undefined>> & LiteralKitStatics<readonly ["DATE", "ORDINAL", "CARDINAL", "MONEY", "PERCENT", "TIME", "DURATION", "HASHTAG", "EMOJI", "EMOTICON", "EMAIL", "URL", "MENTION"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L133)

Since v0.0.0

## NamedEntityType (type alias)

Runtime TypeScript union decoded by `NamedEntityType`.

**Example**

```ts
import type { NamedEntityType } from "@beep/nlp/Core/Pattern"

const describe = (entityType: NamedEntityType): string => `entity:${entityType}`
console.log(typeof describe) // "function"
```

**Signature**

```ts
type NamedEntityType = typeof NamedEntityType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L154)

Since v0.0.0

## POSPatternElement (class)

Tagged pattern element that matches grammatical POS alternatives.

**Example**

```ts
import { POSPatternElement } from "@beep/nlp/Core/Pattern"

const element = POSPatternElement.make({ value: ["NOUN"] })
console.log(element._tag) // "POSPatternElement"
```

**Signature**

```ts
declare class POSPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L304)

Since v0.0.0

## POSPatternOption

Non-empty set of POS choices for one pattern slot.

**Example**

```ts
import { POSPatternOption } from "@beep/nlp/Core/Pattern"

const option = POSPatternOption.make(["NOUN", "PROPN"])
console.log(option.includes("NOUN")) // true
```

**Signature**

```ts
declare const POSPatternOption: AnnotatedSchema<S.NonEmptyArray<S.Union<readonly [LiteralKit<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"], undefined> & SchemaStatics<LiteralKit<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"], undefined>> & LiteralKitStatics<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"]>, AnnotatedSchema<S.Literal<"">>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L188)

Since v0.0.0

## POSPatternOption (type alias)

Runtime type for `POSPatternOption`.

**Example**

```ts
import type { POSPatternOption } from "@beep/nlp/Core/Pattern"

type Example = POSPatternOption
```

**Signature**

```ts
type POSPatternOption = typeof POSPatternOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L209)

Since v0.0.0

## Pattern (class)

Ordered pattern of POS, entity, and literal slots with an optional mark.

**Example**

```ts
import { Chunk } from "effect"
import * as O from "effect/Option"
import { LiteralPatternElement, Pattern, PatternId } from "@beep/nlp/Core/Pattern"

const pattern = Pattern.make({
  _tag: "Pattern",
  id: PatternId.make("effect-token"),
  elements: Chunk.of(LiteralPatternElement.make({ value: ["Effect"] })),
  mark: O.none()
})
console.log(Pattern.is(pattern)) // true
```

**Signature**

```ts
declare class Pattern
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L499)

Since v0.0.0

## PatternElement

Schema union for every pattern element variant supported by this package.

**Example**

```ts
import { PatternElement } from "@beep/nlp/Core/Pattern"

const element = PatternElement.make({ _tag: "LiteralPatternElement", value: ["Effect"] })
console.log(element._tag) // "LiteralPatternElement"
```

**Signature**

```ts
declare const PatternElement: AnnotatedSchema<S.Union<readonly [typeof POSPatternElement, typeof EntityPatternElement, typeof LiteralPatternElement]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L376)

Since v0.0.0

## PatternElement (type alias)

Runtime type for `PatternElement`.

**Example**

```ts
import type { PatternElement } from "@beep/nlp/Core/Pattern"

type Example = PatternElement
```

**Signature**

```ts
type PatternElement = typeof PatternElement.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L395)

Since v0.0.0

## PatternId

Non-empty identifier for a reusable pattern definition.

**Example**

```ts
import { PatternId } from "@beep/nlp/Core/Pattern"

const id = PatternId.make("package-name")
console.log(id) // "package-name"
```

**Signature**

```ts
declare const PatternId: AnnotatedSchema<S.brand<S.NonEmptyString, "PatternId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L411)

Since v0.0.0

## PatternId (type alias)

Runtime type for `PatternId`.

**Example**

```ts
import type { PatternId } from "@beep/nlp/Core/Pattern"

type Example = PatternId
```

**Signature**

```ts
type PatternId = typeof PatternId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L431)

Since v0.0.0

## UniversalPOSTag

Universal part-of-speech tags accepted by wink-backed pattern matching.

**Example**

```ts
import { UniversalPOSTag } from "@beep/nlp/Core/Pattern"

console.log(UniversalPOSTag.is.NOUN("NOUN")) // true
console.log(UniversalPOSTag.is.NOUN("VERB")) // false
```

**Signature**

```ts
declare const UniversalPOSTag: LiteralKit<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"], undefined> & SchemaStatics<LiteralKit<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"], undefined>> & LiteralKitStatics<readonly ["ADJ", "ADP", "ADV", "AUX", "CCONJ", "DET", "INTJ", "NOUN", "NUM", "PART", "PRON", "PROPN", "PUNCT", "SCONJ", "SYM", "VERB", "X", "SPACE"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L96)

Since v0.0.0

## UniversalPOSTag (type alias)

Runtime TypeScript union decoded by `UniversalPOSTag`.

**Example**

```ts
import type { UniversalPOSTag } from "@beep/nlp/Core/Pattern"

const describe = (tag: UniversalPOSTag): string => `pos:${tag}`
console.log(typeof describe) // "function"
```

**Signature**

```ts
type UniversalPOSTag = typeof UniversalPOSTag.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Pattern.ts#L117)

Since v0.0.0