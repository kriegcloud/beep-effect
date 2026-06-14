---
title: Sentence.ts
nav_order: 13
parent: "@beep/nlp"
---

## Sentence.ts overview

Core sentence model for NLP runtime services.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Sentence (class)](#sentence-class)
  - [SentenceIndex (type alias)](#sentenceindex-type-alias)
- [validation](#validation)
  - [SentenceIndex](#sentenceindex)
  - [sentenceIndex](#sentenceindex-1)
---

# models

## Sentence (class)

Immutable sentence with its document token range and optional scoring data.

**Example**

```ts
import { Chunk } from "effect"
import * as O from "effect/Option"
import { Sentence, SentenceIndex } from "@beep/nlp/Core/Sentence"
import { TokenIndex } from "@beep/nlp/Core/Token"

const sentence = Sentence.make({
  text: "Effect works.",
  index: SentenceIndex.make(0),
  tokens: Chunk.empty(),
  start: TokenIndex.make(0),
  end: TokenIndex.make(0),
  sentiment: O.none(),
  importance: O.none(),
  negationFlag: O.none(),
  markedUpText: O.none()
})
console.log(sentence.tokenCount) // 0
```

**Signature**

```ts
declare class Sentence
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Sentence.ts#L109)

Since v0.0.0

## SentenceIndex (type alias)

Zero-based position of a sentence within a document.

**Example**

```ts
import type { SentenceIndex } from "@beep/nlp/Core/Sentence"

const next = (index: SentenceIndex): number => index + 1
console.log(typeof next) // "function"
```

**Signature**

```ts
type SentenceIndex = Brand.Branded<NonNegativeInt, "SentenceIndex">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Sentence.ts#L36)

Since v0.0.0

# validation

## SentenceIndex

Schema that decodes non-negative numbers into `SentenceIndex` values.

**Example**

```ts
import { SentenceIndex } from "@beep/nlp/Core/Sentence"

const index = SentenceIndex.make(1)
console.log(index) // 1
```

**Signature**

```ts
declare const SentenceIndex: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "Int" | "NonNegativeInt" | "SentenceIndex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Sentence.ts#L70)

Since v0.0.0

## sentenceIndex

Construct a branded sentence index after validating it is non-negative.

**Example**

```ts
import { sentenceIndex } from "@beep/nlp/Core/Sentence"

const first = sentenceIndex(0)
console.log(first) // 0
```

**Signature**

```ts
declare const sentenceIndex: Brand.Constructor<SentenceIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Sentence.ts#L52)

Since v0.0.0