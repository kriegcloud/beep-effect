---
title: CauseTaggedError.errors.ts
nav_order: 10
parent: "@beep/schema"
---

## CauseTaggedError.errors.ts overview

Cause-backed tagged error class helpers for schema-derived domain failures.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [CauseTaggedError](#causetaggederror)
  - [CauseTaggedErrorConstructor (type alias)](#causetaggederrorconstructor-type-alias)
- [models](#models)
  - [CauseTaggedErrorFactory (interface)](#causetaggederrorfactory-interface)
  - [CauseTaggedErrorWithStatics (type alias)](#causetaggederrorwithstatics-type-alias)
---

# constructors

## CauseTaggedError

Create a tagged error class that always carries a `message` and required defect `cause`.

`CauseTaggedError` is a pipe-friendly offshoot of `TaggedErrorClass`.
It prepends `message: S.String` and `cause: S.Defect({ includeStack: true })` to every
generated class and attaches dual static `new` and `mapError` helpers.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import { Effect, pipe } from "effect"
import { CauseTaggedError } from "@beep/schema/CauseTaggedError"

const $I = $SchemaId.create("CauseTaggedError/basic")

class DomainError extends CauseTaggedError<DomainError>($I`DomainError`)(
  "DomainError",
  $I.annote("DomainError", {
    description: "A domain failure with a message and defect cause."
  })
) {}

const program = pipe(
  Effect.fail("raw failure"),
  DomainError.mapError("Domain operation failed")
)

console.log(program)
```

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import * as S from "effect/Schema"
import { CauseTaggedError } from "@beep/schema/CauseTaggedError"

const $I = $SchemaId.create("CauseTaggedError/with-extra-fields")

class OperationError extends CauseTaggedError<OperationError>($I`OperationError`)(
  "OperationError",
  {
    operation: S.String
  },
  $I.annote("OperationError", {
    description: "An operation failure with structured context."
  })
) {}

const error = OperationError.new("Operation failed", {
  operation: "load-profile"
})(new Error("database unavailable"))

console.log(error)
```

**Signature**

```ts
declare const CauseTaggedError: CauseTaggedErrorConstructor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CauseTaggedError/CauseTaggedError.errors.ts#L508)

Since v0.0.0

## CauseTaggedErrorConstructor (type alias)

Callable constructor for creating cause-tagged error class factories.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import { CauseTaggedError, type CauseTaggedErrorConstructor } from "@beep/schema/CauseTaggedError"

const $I = $SchemaId.create("CauseTaggedErrorConstructor/example")
const makeCauseTaggedError: CauseTaggedErrorConstructor = CauseTaggedError

class ExampleError extends makeCauseTaggedError<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example failure built through the constructor type."
  })
) {}

const error = ExampleError.new("Example failed")(new Error("cause"))

console.log(error)
```

**Signature**

```ts
type CauseTaggedErrorConstructor = <Self, Brand = {}>(
  identifier?: undefined | string
) => CauseTaggedErrorFactory<Self, Brand>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CauseTaggedError/CauseTaggedError.errors.ts#L249)

Since v0.0.0

# models

## CauseTaggedErrorFactory (interface)

Factory returned by `CauseTaggedError` after an identity namespace has been selected.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import { CauseTaggedError, type CauseTaggedErrorFactory } from "@beep/schema/CauseTaggedError"

const $I = $SchemaId.create("CauseTaggedErrorFactory/example")

class ExampleError extends CauseTaggedError<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example failure built from a factory."
  })
) {}

const factory: CauseTaggedErrorFactory<ExampleError> = CauseTaggedError<ExampleError>($I`ExampleErrorFactory`)
const error = ExampleError.new("Example failed")(new Error("cause"))

console.log(factory)
console.log(error)
```

**Signature**

```ts
export interface CauseTaggedErrorFactory<Self, Brand = {}> {
  <Tag extends string, const Fields extends CauseTaggedErrorFields>(
    tag: Tag,
    fields: CauseTaggedErrorNoReservedFields<Fields>,
    annotations?: CauseTaggedErrorAnnotation<Self, S.TaggedStruct<Tag, CauseTaggedErrorCombinedFields<Fields>>>
  ): CauseTaggedErrorWithStatics<Self, Tag, Fields, Brand>;

  <Tag extends string>(
    tag: Tag,
    annotations?: CauseTaggedErrorAnnotation<Self, S.TaggedStruct<Tag, CauseTaggedErrorStandardFields>>
  ): CauseTaggedErrorWithStatics<Self, Tag, {}, Brand>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CauseTaggedError/CauseTaggedError.errors.ts#L210)

Since v0.0.0

## CauseTaggedErrorWithStatics (type alias)

Tagged error class returned by `CauseTaggedError`, including dual construction helpers.

**Example**

```ts
import { $SchemaId } from "@beep/identity/packages"
import { CauseTaggedError, type CauseTaggedErrorWithStatics } from "@beep/schema/CauseTaggedError"

const $I = $SchemaId.create("CauseTaggedErrorWithStatics/example")

class ExampleError extends CauseTaggedError<ExampleError>($I`ExampleError`)(
  "ExampleError",
  $I.annote("ExampleError", {
    description: "An example failure with a required cause."
  })
) {}

const fromClass = (
  errorClass: CauseTaggedErrorWithStatics<ExampleError, "ExampleError", {}, {}>
) => errorClass.new("Example failed")(new Error("cause"))

const error = fromClass(ExampleError)

console.log(error)
```

**Signature**

```ts
type CauseTaggedErrorWithStatics<Self, Tag, Fields, Brand, ErrorClass> = (new (
  ...args: CauseTaggedErrorConstructorArgs<ErrorClass>
) => CauseTaggedErrorInstance<ErrorClass>) &
  Omit<ErrorClass, "extend"> &
  CauseTaggedErrorStatics<Self, Fields> & {
    readonly extend: CauseTaggedErrorExtendMethod<Tag, Fields, ErrorClass>;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CauseTaggedError/CauseTaggedError.errors.ts#L164)

Since v0.0.0