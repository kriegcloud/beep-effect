---
title: StatusCauseTaggedErrorClass.errors.ts
nav_order: 206
parent: "@beep/schema"
---

## StatusCauseTaggedErrorClass.errors.ts overview

Status and optional-cause tagged error class helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [StatusCauseTaggedErrorClass](#statuscausetaggederrorclass)
  - [StatusCauseTaggedErrorClassConstructor (type alias)](#statuscausetaggederrorclassconstructor-type-alias)
- [models](#models)
  - [StatusCauseTaggedErrorClassFactory (interface)](#statuscausetaggederrorclassfactory-interface)
  - [StatusCauseTaggedErrorClassWithStatics (type alias)](#statuscausetaggederrorclasswithstatics-type-alias)
---

# constructors

## StatusCauseTaggedErrorClass

Create a tagged error class that carries `message`, `status`, and optional defect `cause`.

`StatusCauseTaggedErrorClass` is a pipe-friendly offshoot of `TaggedErrorClass`
for the existing `StatusCauseFields` shape. It attaches dual static
`new` and `mapError` helpers plus a `noCause` constructor for status-only
failures. Raw causes are normalized into `Option` values.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import { Effect, pipe } from "effect"
import { StatusCauseTaggedErrorClass } from "@beep/schema/StatusCauseTaggedErrorClass"

const $I = $SchemaId.create("StatusCauseTaggedErrorClass/basic")

class HttpError extends StatusCauseTaggedErrorClass<HttpError>($I`HttpError`)(
  "HttpError",
  $I.annote("HttpError", {
    description: "An HTTP failure with status and optional cause."
  })
) {}

const program = pipe(
  Effect.fail(new Error("unavailable")),
  HttpError.mapError("Request failed", 503)
)
const notFound = HttpError.noCause("Missing resource", 404)

console.log(program)
console.log(notFound)
```

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import * as S from "effect/Schema"
import { StatusCauseTaggedErrorClass } from "@beep/schema/StatusCauseTaggedErrorClass"

const $I = $SchemaId.create("StatusCauseTaggedErrorClass/with-extra-fields")

class ProviderError extends StatusCauseTaggedErrorClass<ProviderError>($I`ProviderError`)(
  "ProviderError",
  {
    provider: S.String
  },
  $I.annote("ProviderError", {
    description: "A provider failure with status, cause, and provider context."
  })
) {}

const error = ProviderError.new("Provider failed", 502, {
  provider: "local"
})(new Error("unavailable"))

console.log(error)
```

**Signature**

```ts
declare const StatusCauseTaggedErrorClass: StatusCauseTaggedErrorClassConstructor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseTaggedErrorClass/StatusCauseTaggedErrorClass.errors.ts#L527)

Since v0.0.0

## StatusCauseTaggedErrorClassConstructor (type alias)

Callable constructor for creating status-cause tagged error class factories.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import {
  StatusCauseTaggedErrorClass,
  type StatusCauseTaggedErrorClassConstructor
} from "@beep/schema/StatusCauseTaggedErrorClass"

const $I = $SchemaId.create("StatusCauseTaggedErrorClassConstructor/example")
const makeStatusError: StatusCauseTaggedErrorClassConstructor = StatusCauseTaggedErrorClass

class ExampleError extends makeStatusError<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example HTTP-style failure built through the constructor type."
  })
) {}

const error = ExampleError.noCause("Missing", 404)

console.log(error)
```

**Signature**

```ts
type StatusCauseTaggedErrorClassConstructor = <Self, Brand = {}>(
  identifier?: undefined | string
) => StatusCauseTaggedErrorClassFactory<Self, Brand>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseTaggedErrorClass/StatusCauseTaggedErrorClass.errors.ts#L265)

Since v0.0.0

# models

## StatusCauseTaggedErrorClassFactory (interface)

Factory returned by `StatusCauseTaggedErrorClass` after an identity namespace has been selected.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import {
  StatusCauseTaggedErrorClass,
  type StatusCauseTaggedErrorClassFactory
} from "@beep/schema/StatusCauseTaggedErrorClass"

const $I = $SchemaId.create("StatusCauseTaggedErrorClassFactory/example")

class ExampleError extends StatusCauseTaggedErrorClass<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example HTTP-style failure built from a factory."
  })
) {}

const factory: StatusCauseTaggedErrorClassFactory<ExampleError> =
  StatusCauseTaggedErrorClass<ExampleError>($I`ExampleErrorFactory`)
const error = ExampleError.noCause("Missing", 404)

console.log(factory)
console.log(error)
```

**Signature**

```ts
export interface StatusCauseTaggedErrorClassFactory<Self, Brand = {}> {
  <Tag extends string, const Fields extends StatusCauseTaggedErrorFields>(
    tag: Tag,
    fields: StatusCauseTaggedErrorNoReservedFields<Fields>,
    annotations?: StatusCauseTaggedErrorAnnotation<
      Self,
      S.TaggedStruct<Tag, StatusCauseTaggedErrorCombinedFields<Fields>>
    >
  ): StatusCauseTaggedErrorClassWithStatics<Self, Tag, Fields, Brand>;

  <Tag extends string>(
    tag: Tag,
    annotations?: StatusCauseTaggedErrorAnnotation<Self, S.TaggedStruct<Tag, StatusCauseTaggedErrorStandardFields>>
  ): StatusCauseTaggedErrorClassWithStatics<Self, Tag, {}, Brand>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseTaggedErrorClass/StatusCauseTaggedErrorClass.errors.ts#L220)

Since v0.0.0

## StatusCauseTaggedErrorClassWithStatics (type alias)

Tagged error class returned by `StatusCauseTaggedErrorClass`, including dual status/cause helpers.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import {
  StatusCauseTaggedErrorClass,
  type StatusCauseTaggedErrorClassWithStatics
} from "@beep/schema/StatusCauseTaggedErrorClass"

const $I = $SchemaId.create("StatusCauseTaggedErrorClassWithStatics/example")

class ExampleError extends StatusCauseTaggedErrorClass<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example HTTP-style failure."
  })
) {}

const fromClass = (
  errorClass: StatusCauseTaggedErrorClassWithStatics<ExampleError, "ExampleError", {}, {}>
) => errorClass.noCause("Missing", 404)

const error = fromClass(ExampleError)

console.log(error)
```

**Signature**

```ts
type StatusCauseTaggedErrorClassWithStatics<Self, Tag, Fields, Brand, ErrorClass> = (new (
  ...args: StatusCauseTaggedErrorConstructorArgs<ErrorClass>
) => StatusCauseTaggedErrorInstance<ErrorClass>) &
  Omit<ErrorClass, "extend"> &
  StatusCauseTaggedErrorStatics<Self, Fields> & {
    readonly extend: StatusCauseTaggedErrorExtendMethod<Tag, Fields, ErrorClass>;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseTaggedErrorClass/StatusCauseTaggedErrorClass.errors.ts#L170)

Since v0.0.0