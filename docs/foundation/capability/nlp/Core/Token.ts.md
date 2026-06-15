---
title: Token.ts
nav_order: 15
parent: "@beep/nlp"
---

## Token.ts overview

Core token model for NLP runtime services.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CharPosition (type alias)](#charposition-type-alias)
  - [Token (class)](#token-class)
  - [TokenIndex (type alias)](#tokenindex-type-alias)
- [validation](#validation)
  - [CharPosition](#charposition)
  - [TokenIndex](#tokenindex)
  - [charPosition](#charposition-1)
  - [isCharPosition](#ischarposition)
  - [isTokenIndex](#istokenindex)
  - [tokenIndex](#tokenindex-1)
---

# models

## CharPosition (type alias)

Zero-based character offset into the original source text.

**Example**

```ts
import type { CharPosition } from "@beep/nlp/Core/Token"

const spanLength = (start: CharPosition, end: CharPosition): number => end - start
console.log(typeof spanLength) // "function"
```

**Signature**

```ts
type CharPosition = Brand.Branded<NonNegativeInt, "CharPosition">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L108)

Since v0.0.0

## Token (class)

Immutable token with lexical text, source offsets, and optional NLP metadata.

**Example**

```ts
import * as O from "effect/Option"
import { CharPosition, Token, TokenIndex } from "@beep/nlp/Core/Token"

const token = Token.make({
  text: "Effect",
  index: TokenIndex.make(0),
  start: CharPosition.make(0),
  end: CharPosition.make(6),
  pos: O.none(),
  lemma: O.none(),
  stem: O.none(),
  normal: O.none(),
  shape: O.none(),
  prefix: O.none(),
  suffix: O.none(),
  case: O.none(),
  uniqueId: O.none(),
  abbrevFlag: O.none(),
  contractionFlag: O.none(),
  stopWordFlag: O.none(),
  negationFlag: O.none(),
  precedingSpaces: O.none(),
  tags: []
})
console.log(Token.containsPosition(token, 3)) // true
```

**Signature**

```ts
declare class Token
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L205)

Since v0.0.0

## TokenIndex (type alias)

Zero-based position of a token within its document token stream.

**Example**

```ts
import type { TokenIndex } from "@beep/nlp/Core/Token"

const next = (index: TokenIndex): number => index + 1
console.log(typeof next) // "function"
```

**Signature**

```ts
type TokenIndex = Brand.Branded<NonNegativeInt, "TokenIndex">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L36)

Since v0.0.0

# validation

## CharPosition

Schema that decodes non-negative numbers into `CharPosition` values.

**Example**

```ts
import { CharPosition } from "@beep/nlp/Core/Token"

const offset = CharPosition.make(7)
console.log(offset) // 7
```

**Signature**

```ts
declare const CharPosition: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "Int" | "NonNegativeInt" | "CharPosition">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L158)

Since v0.0.0

## TokenIndex

Schema that decodes non-negative numbers into `TokenIndex` values.

**Example**

```ts
import { TokenIndex } from "@beep/nlp/Core/Token"

const index = TokenIndex.make(2)
console.log(index) // 2
```

**Signature**

```ts
declare const TokenIndex: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "Int" | "NonNegativeInt" | "TokenIndex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L84)

Since v0.0.0

## charPosition

Construct a branded character offset after validating it is non-negative.

**Example**

```ts
import { charPosition } from "@beep/nlp/Core/Token"

const offset = charPosition(4)
console.log(offset) // 4
```

**Signature**

```ts
declare const charPosition: Brand.Constructor<CharPosition>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L140)

Since v0.0.0

## isCharPosition

Narrow an unknown value to a non-negative character offset.

**Example**

```ts
import { isCharPosition } from "@beep/nlp/Core/Token"

console.log(isCharPosition(12)) // true
console.log(isCharPosition(-1)) // false
```

**Signature**

```ts
declare const isCharPosition: (u: unknown) => u is CharPosition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L124)

Since v0.0.0

## isTokenIndex

Narrow an unknown value to a non-negative token index.

**Example**

```ts
import { isTokenIndex } from "@beep/nlp/Core/Token"

console.log(isTokenIndex(0)) // true
console.log(isTokenIndex(-1)) // false
```

**Signature**

```ts
declare const isTokenIndex: (u: unknown) => u is TokenIndex
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L52)

Since v0.0.0

## tokenIndex

Construct a branded token index after validating it is non-negative.

**Example**

```ts
import { tokenIndex } from "@beep/nlp/Core/Token"

const first = tokenIndex(0)
console.log(first) // 0
```

**Signature**

```ts
declare const tokenIndex: Brand.Constructor<TokenIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/Token.ts#L68)

Since v0.0.0