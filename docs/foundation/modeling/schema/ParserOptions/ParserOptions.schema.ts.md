---
title: ParserOptions.schema.ts
nav_order: 166
parent: "@beep/schema"
---

## ParserOptions.schema.ts overview

The \@beep/schema/ParserOptions parser options configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [HeaderValueInput](#headervalueinput)
  - [HeaderValueInput (type alias)](#headervalueinput-type-alias)
  - [ParserOptions (class)](#parseroptions-class)
  - [ParserOptionsArgs (type alias)](#parseroptionsargs-type-alias)
- [schemas](#schemas)
  - [Error](#error)
  - [Schema](#schema)
- [validation](#validation)
  - [ParserOptionsError (class)](#parseroptionserror-class)
---

# configuration

## HeaderValueInput

A parser header configuration input.

**Example**

```ts
import { HeaderValueInput } from "@beep/schema/ParserOptions"
import * as S from "effect/Schema"

const headers = S.decodeUnknownSync(HeaderValueInput)(true)
console.log(headers)
```

**Signature**

```ts
declare const HeaderValueInput: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>, AnnotatedSchema<FnSchemaUnary<AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>, AnnotatedSchema<S.$Array<S.NullishOr<S.String>>>, S.Never>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L70)

Since v0.0.0

## HeaderValueInput (type alias)

{@inheritDoc HeaderValueInput}

**Signature**

```ts
type HeaderValueInput = typeof HeaderValueInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L82)

Since v0.0.0

## ParserOptions (class)

Schema-backed CSV parser options.

Derived runtime fields from the original implementation such as
`escapedDelimiter`, `escapeChar`, `supportsComments`, `limitRows`, and
`NEXT_TOKEN_REGEXP` are exposed as getters so the schema stays focused on the
true input/configuration surface.

**Example**

```ts
import { ParserOptions } from "@beep/schema/ParserOptions"

const options = ParserOptions.new({ delimiter: ";" })
console.log(options.escapedDelimiter)
```

**Signature**

```ts
declare class ParserOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L138)

Since v0.0.0

## ParserOptionsArgs (type alias)

Encoded/raw constructor input for `ParserOptions`.

**Example**

```ts
import type { ParserOptionsArgs } from "@beep/schema/ParserOptions"

const options = { delimiter: ";" } satisfies ParserOptionsArgs
console.log(options.delimiter)
```

**Signature**

```ts
type ParserOptionsArgs = typeof ParserOptions.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L265)

Since v0.0.0

# schemas

## Error

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Error: typeof ParserOptionsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L273)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: typeof ParserOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L273)

Since v0.0.0

# validation

## ParserOptionsError (class)

A parser options configuration error.

**Example**

```ts
import { Error as ParserOptionsError } from "@beep/schema/ParserOptions"
import * as O from "effect/Option"

const error = ParserOptionsError.make({ cause: O.none(), message: "Invalid delimiter" })
console.log(error.message)
```

**Signature**

```ts
declare class ParserOptionsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ParserOptions/ParserOptions.schema.ts#L99)

Since v0.0.0