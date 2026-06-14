---
title: PatternOperations.ts
nav_order: 11
parent: "@beep/nlp"
---

## PatternOperations.ts overview

Pattern inspection utilities.

Since v0.0.0

---
## Exports Grouped by Category
- [getters](#getters)
  - [extractBracketContent](#extractbracketcontent)
  - [extractElementValues](#extractelementvalues)
  - [joinBracketValues](#joinbracketvalues)
  - [splitBracketValues](#splitbracketvalues)
- [predicates](#predicates)
  - [isEntityElement](#isentityelement)
  - [isLiteralElement](#isliteralelement)
  - [isPOSElement](#isposelement)
---

# getters

## extractBracketContent

Create a bracket-string content slice if the input is bracketed.

**Example**

```ts
import { extractBracketContent } from "@beep/nlp/Core/PatternOperations"

console.log(extractBracketContent)
```

**Signature**

```ts
declare const extractBracketContent: (value: string) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L89)

Since v0.0.0

## extractElementValues

Extract element values as a readonly array.

**Example**

```ts
import { extractElementValues } from "@beep/nlp/Core/PatternOperations"

console.log(extractElementValues)
```

**Signature**

```ts
declare const extractElementValues: (element: PatternElement) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L74)

Since v0.0.0

## joinBracketValues

Join values into bracket-string form.

**Example**

```ts
import { joinBracketValues } from "@beep/nlp/Core/PatternOperations"

console.log(joinBracketValues)
```

**Signature**

```ts
declare const joinBracketValues: (values: ReadonlyArray<string>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L120)

Since v0.0.0

## splitBracketValues

Split bracket content into trimmed segments.

**Example**

```ts
import { splitBracketValues } from "@beep/nlp/Core/PatternOperations"

console.log(splitBracketValues)
```

**Signature**

```ts
declare const splitBracketValues: (content: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L105)

Since v0.0.0

# predicates

## isEntityElement

Check whether an element is an entity element.

**Example**

```ts
import { isEntityElement } from "@beep/nlp/Core/PatternOperations"

console.log(isEntityElement)
```

**Signature**

```ts
declare const isEntityElement: (element: PatternElement) => element is EntityPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L42)

Since v0.0.0

## isLiteralElement

Check whether an element is a literal element.

**Example**

```ts
import { isLiteralElement } from "@beep/nlp/Core/PatternOperations"

console.log(isLiteralElement)
```

**Signature**

```ts
declare const isLiteralElement: (element: PatternElement) => element is LiteralPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L58)

Since v0.0.0

## isPOSElement

Check whether an element is a POS element.

**Example**

```ts
import { isPOSElement } from "@beep/nlp/Core/PatternOperations"

console.log(isPOSElement)
```

**Signature**

```ts
declare const isPOSElement: (element: PatternElement) => element is POSPatternElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Core/PatternOperations.ts#L26)

Since v0.0.0