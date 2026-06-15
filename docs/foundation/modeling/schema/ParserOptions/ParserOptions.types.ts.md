---
title: ParserOptions.types.ts
nav_order: 167
parent: "@beep/schema"
---

## ParserOptions.types.ts overview

Common types for CSV parsing

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [HeaderArray](#headerarray)
  - [HeaderArray (type alias)](#headerarray-type-alias)
  - [HeaderTransformFunction](#headertransformfunction)
  - [HeaderTransformFunction (type alias)](#headertransformfunction-type-alias)
---

# validation

## HeaderArray

An array containing possibly nullish strings.

**Example**

```ts
import { HeaderArray } from "../../src/ParserOptions/ParserOptions.types.ts"
import * as S from "effect/Schema"

const headers = S.decodeUnknownSync(HeaderArray)(["name", null])
console.log(headers.length)
```

**Signature**

```ts
declare const HeaderArray: AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.types.ts#L29)

Since v0.0.0

## HeaderArray (type alias)

{@inheritDoc HeaderArray}

**Signature**

```ts
type HeaderArray = typeof HeaderArray.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.types.ts#L44)

Since v0.0.0

## HeaderTransformFunction

An identity function taking an array containing possibly nullish strings
and returning it.

**Example**

```ts
import { HeaderTransformFunction } from "../../src/ParserOptions/ParserOptions.types.ts"

const transform = HeaderTransformFunction.implementSync((headers) => headers)
console.log(transform(["name"]).length)
```

**Signature**

```ts
declare const HeaderTransformFunction: AnnotatedSchema<FnSchemaUnary<AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>, AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>, S.Never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.types.ts#L61)

Since v0.0.0

## HeaderTransformFunction (type alias)

{@inheritDoc HeaderTransformFunction}

**Signature**

```ts
type HeaderTransformFunction = typeof HeaderTransformFunction.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.types.ts#L76)

Since v0.0.0