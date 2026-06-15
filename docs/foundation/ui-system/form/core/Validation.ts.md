---
title: Validation.ts
nav_order: 11
parent: "@beep/form"
---

## Validation.ts overview

Schema validation error routing for form fields.

Since v0.0.0

---
## Exports Grouped by Category
- [destructors](#destructors)
  - [extractFirstError](#extractfirsterror)
- [models](#models)
  - [ErrorEntry (class)](#errorentry-class)
- [schemas](#schemas)
  - [ErrorSource](#errorsource)
- [type-level](#type-level)
  - [ErrorSource (type alias)](#errorsource-type-alias)
- [validation](#validation)
  - [routeErrors](#routeerrors)
  - [routeErrorsWithSource](#routeerrorswithsource)
---

# destructors

## extractFirstError

Extracts the first user-facing message from a schema error.

**Example**

```ts
import { extractFirstError } from "@beep/form/core/Validation"
import { Effect } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Finite)("nope")))
const message = extractFirstError(error)
console.log(O.isSome(message)) // true
```

**Signature**

```ts
declare const extractFirstError: (error: S.SchemaError) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L146)

Since v0.0.0

# models

## ErrorEntry (class)

Renderable validation error with source metadata.

**Example**

```ts
import { ErrorEntry } from "@beep/form/core/Validation"

const entry = ErrorEntry.make({ message: "Required", source: "field" })
console.log(entry.message) // "Required"
```

**Signature**

```ts
declare class ErrorEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L66)

Since v0.0.0

# schemas

## ErrorSource

Validation error source literal schema.

**Example**

```ts
import { ErrorSource } from "@beep/form/core/Validation"
import * as S from "effect/Schema"

console.log(S.is(ErrorSource)("field")) // true
```

**Signature**

```ts
declare const ErrorSource: AnnotatedSchema<S.Literals<readonly ["field", "refinement"]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L30)

Since v0.0.0

# type-level

## ErrorSource (type alias)

Runtime type extracted from `ErrorSource`.

**Example**

```ts
import type { ErrorSource } from "@beep/form/core/Validation"

const source: ErrorSource = "refinement"
console.log(source) // "refinement"
```

**Signature**

```ts
type ErrorSource = typeof ErrorSource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L50)

Since v0.0.0

# validation

## routeErrors

Routes schema error messages to form field paths.

**Example**

```ts
import { routeErrors } from "@beep/form/core/Validation"
import { Effect, HashMap } from "effect"
import * as S from "effect/Schema"

const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Struct({ age: S.Finite }))({ age: "x" })))
const errors = routeErrors(error)
console.log(HashMap.has(errors, "age")) // true
```

**Signature**

```ts
declare const routeErrors: (error: S.SchemaError) => HashMap.HashMap<string, string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L168)

Since v0.0.0

## routeErrorsWithSource

Routes schema error messages to form field paths with source metadata.

**Example**

```ts
import { routeErrorsWithSource } from "@beep/form/core/Validation"
import { Effect, HashMap } from "effect"
import * as S from "effect/Schema"

const error = Effect.runSync(Effect.flip(S.decodeUnknownEffect(S.Struct({ name: S.String }))({ name: 1 })))
const errors = routeErrorsWithSource(error)
console.log(HashMap.has(errors, "name")) // true
```

**Signature**

```ts
declare const routeErrorsWithSource: (error: S.SchemaError) => HashMap.HashMap<string, ErrorEntry>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Validation.ts#L199)

Since v0.0.0