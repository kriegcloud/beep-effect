---
title: PatternParsers.ts
nav_order: 12
parent: "@beep/nlp"
---

## PatternParsers.ts overview

Pattern string parsers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [BracketStringToPatternElement (type alias)](#bracketstringtopatternelement-type-alias)
- [validation](#validation)
  - [BracketStringToEntityPatternElement](#bracketstringtoentitypatternelement)
  - [BracketStringToLiteralPatternElement](#bracketstringtoliteralpatternelement)
  - [BracketStringToPOSPatternElement](#bracketstringtopospatternelement)
  - [BracketStringToPatternElement](#bracketstringtopatternelement)
  - [PatternFromString](#patternfromstring)
---

# models

## BracketStringToPatternElement (type alias)

Runtime type for `BracketStringToPatternElement`.

**Example**

```ts
import type { BracketStringToPatternElement } from "@beep/nlp/Core/PatternParsers"

type Example = BracketStringToPatternElement
```

**Signature**

```ts
type BracketStringToPatternElement = typeof BracketStringToPatternElement.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L218)

Since v0.0.0

# validation

## BracketStringToEntityPatternElement

Decode an entity bracket string into a pattern element.

**Example**

```ts
import { BracketStringToEntityPatternElement } from "@beep/nlp/Core/PatternParsers"

console.log(BracketStringToEntityPatternElement)
```

**Signature**

```ts
declare const BracketStringToEntityPatternElement: AnnotatedSchema<S.decodeTo<typeof EntityPatternElement, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L133)

Since v0.0.0

## BracketStringToLiteralPatternElement

Decode a literal bracket string into a pattern element.

**Example**

```ts
import { BracketStringToLiteralPatternElement } from "@beep/nlp/Core/PatternParsers"

console.log(BracketStringToLiteralPatternElement)
```

**Signature**

```ts
declare const BracketStringToLiteralPatternElement: AnnotatedSchema<S.decodeTo<typeof LiteralPatternElement, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L164)

Since v0.0.0

## BracketStringToPOSPatternElement

Decode a POS bracket string into a pattern element.

**Example**

```ts
import { BracketStringToPOSPatternElement } from "@beep/nlp/Core/PatternParsers"

console.log(BracketStringToPOSPatternElement)
```

**Signature**

```ts
declare const BracketStringToPOSPatternElement: AnnotatedSchema<S.decodeTo<typeof POSPatternElement, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L104)

Since v0.0.0

## BracketStringToPatternElement

Decode any supported bracket string element.

**Example**

```ts
import { BracketStringToPatternElement } from "@beep/nlp/Core/PatternParsers"

console.log(BracketStringToPatternElement)
```

**Signature**

```ts
declare const BracketStringToPatternElement: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.Union<readonly [typeof POSPatternElement, typeof EntityPatternElement, typeof LiteralPatternElement]>>, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L195)

Since v0.0.0

## PatternFromString

Decode a string array into ordered pattern elements.

**Example**

```ts
import { PatternFromString } from "@beep/nlp/Core/PatternParsers"

console.log(PatternFromString)
```

**Signature**

```ts
declare const PatternFromString: (input: unknown) => readonly [POSPatternElement | EntityPatternElement | LiteralPatternElement, ...(POSPatternElement | EntityPatternElement | LiteralPatternElement)[]]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternParsers.ts#L233)

Since v0.0.0