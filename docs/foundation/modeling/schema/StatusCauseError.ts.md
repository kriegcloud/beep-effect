---
title: StatusCauseError.ts
nav_order: 204
parent: "@beep/schema"
---

## StatusCauseError.ts overview

Shared status/cause error payload helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeStatusCauseError](#makestatuscauseerror)
- [models](#models)
  - [StatusCauseInput (class)](#statuscauseinput-class)
- [schemas](#schemas)
  - [StatusCauseFields](#statuscausefields)
- [utilities](#utilities)
  - [StatusCauseInputOptions (class)](#statuscauseinputoptions-class)
  - [statusCauseInput](#statuscauseinput)
---

# constructors

## makeStatusCauseError

Build a tagged error directly or derive a reusable `(message, status, cause?) => Error` builder.

Supports multiple calling conventions via `dual`:
- `makeStatusCauseError(Ctor)` returns a builder function.
- `makeStatusCauseError(Ctor, message, status)` returns a cause handler.
- `makeStatusCauseError(Ctor, message, status, cause)` returns the error directly.

**Example**

```ts
import { TaggedErrorClass } from "@beep/schema"
import { StatusCauseFields, makeStatusCauseError } from "@beep/schema/StatusCauseError"

class AppError extends TaggedErrorClass<AppError>()("AppError", StatusCauseFields) {}

const build = makeStatusCauseError(AppError)
const err = build({
  message: "not found",
  status: 404,
  cause: new Error("missing")
})

console.log(err)

```

**Signature**

```ts
declare const makeStatusCauseError: { <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>): StatusCauseErrorBuilder<Error>; <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>, input: StatusCauseContext): StatusCauseErrorCauseHandler<Error>; <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>, input: StatusCauseErrorInput): Error; (input: StatusCauseContext): <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>) => StatusCauseErrorCauseHandler<Error>; (input: StatusCauseErrorInput): <Input extends StatusCauseInput, Error>(ctor: StatusCauseErrorCtor<Input, Error>) => Error; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseError.ts#L193)

Since v0.0.0

# models

## StatusCauseInput (class)

Input payload shape produced by `statusCauseInput`.

**Example**

```ts
import { statusCauseInput, type StatusCauseInput } from "@beep/schema/StatusCauseError"

const payload: StatusCauseInput = statusCauseInput("not found", { status: 404, cause: undefined })

console.log(payload)
```

**Signature**

```ts
declare class StatusCauseInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseError.ts#L87)

Since v0.0.0

# schemas

## StatusCauseFields

Shared field set for tagged errors that carry a message, HTTP status, and optional defect cause.

**Example**

```ts
import * as O from "effect/Option"
import { TaggedErrorClass } from "@beep/schema"
import { StatusCauseFields } from "@beep/schema/StatusCauseError"

class AppError extends TaggedErrorClass<AppError>()("AppError", StatusCauseFields) {}

const error = AppError.make({
  message: "not found",
  status: 404,
  cause: O.none()
})

console.log(error)
```

**Signature**

```ts
declare const StatusCauseFields: { readonly message: S.String; readonly status: S.Finite; readonly cause: S.OptionFromOptionalKey<S.Defect>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseError.ts#L39)

Since v0.0.0

# utilities

## StatusCauseInputOptions (class)

Build the payload object expected by errors using `StatusCauseFields`.

Normalizes an optional raw cause into an `Option`.

**Example**

```ts
import { statusCauseInput } from "@beep/schema/StatusCauseError"

const payload = statusCauseInput("not found", { status: 404, cause: undefined })
console.log(payload.message) // "not found"
console.log(payload.status)  // 404
```

**Signature**

```ts
declare class StatusCauseInputOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseError.ts#L62)

Since v0.0.0

## statusCauseInput

Creates normalized status/cause input payloads.

**Example**

```ts
import { statusCauseInput } from "@beep/schema/StatusCauseError"

const payload = statusCauseInput("not found", { status: 404, cause: undefined })

console.log(payload.status)
```

**Signature**

```ts
declare const statusCauseInput: { (message: string, options: StatusCauseInputOptions): StatusCauseInput; (options: StatusCauseInputOptions): (message: string) => StatusCauseInput; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/StatusCauseError.ts#L113)

Since v0.0.0