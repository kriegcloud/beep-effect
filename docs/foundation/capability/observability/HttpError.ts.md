---
title: HttpError.ts
nav_order: 6
parent: "@beep/observability"
---

## HttpError.ts overview

Typed HTTP error classes and convenience constructors for standard status codes.

Each error class extends `TaggedErrorClass` with a fixed status code, carries
`ErrorReporter.severity` and `ErrorReporter.attributes` for structured
observability, and is transport-safe via Effect Schema.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { NotFoundError, makeBadRequestError } from "@beep/observability"

const failNotFound = Effect.fail(
  NotFoundError.make({ cause: Option.none(), message: "missing", status: 404 })
)

const failBadReq = Effect.fail(makeBadRequestError("missing field"))

console.log(failNotFound)
console.log(failBadReq)
```
```

Since v0.0.0

---
## Exports Grouped by Category
  - [makeBadRequestError](#makebadrequesterror)
  - [makeConflictError](#makeconflicterror)
  - [makeForbiddenError](#makeforbiddenerror)
  - [makeGatewayTimeoutError](#makegatewaytimeouterror)
  - [makeInternalServerError](#makeinternalservererror)
  - [makeNotFoundError](#makenotfounderror)
  - [makeServiceUnavailableError](#makeserviceunavailableerror)
  - [makeTooManyRequestsError](#maketoomanyrequestserror)
  - [makeUnauthorizedError](#makeunauthorizederror)
  - [makeUnprocessableEntityError](#makeunprocessableentityerror)
- [models](#models)
  - [BadGatewayError (class)](#badgatewayerror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property)
  - [BadRequestError (class)](#badrequesterror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-1)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-1)
  - [ClientHttpError (class)](#clienthttperror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-2)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-2)
  - [ConflictError (class)](#conflicterror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-3)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-3)
  - [ForbiddenError (class)](#forbiddenerror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-4)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-4)
  - [GatewayTimeoutError (class)](#gatewaytimeouterror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-5)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-5)
  - [InternalServerErrorError (class)](#internalservererrorerror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-6)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-6)
  - [NotFoundError (class)](#notfounderror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-7)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-7)
  - [ServerHttpError (class)](#serverhttperror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-8)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-8)
  - [ServiceUnavailableError (class)](#serviceunavailableerror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-9)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-9)
  - [TooManyRequestsError (class)](#toomanyrequestserror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-10)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-10)
  - [UnauthorizedError (class)](#unauthorizederror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-11)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-11)
  - [UnprocessableEntityError (class)](#unprocessableentityerror-class)
    - [[ErrorReporter.severity] (property)](#errorreporterseverity-property-12)
    - [[ErrorReporter.attributes] (property)](#errorreporterattributes-property-12)
---

# error-handling

## makeBadGatewayError

Helper constructor for `BadGatewayError` (502).

**Example**

```ts
```typescript
import { makeBadGatewayError } from "@beep/observability"

const error = makeBadGatewayError("upstream unreachable")
console.log(error.status) // 502
```
```

**Signature**

```ts
declare const makeBadGatewayError: StatusErrorConstructor<BadGatewayError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L591)

Since v0.0.0

## makeBadRequestError

Helper constructor for `BadRequestError` (400).

**Example**

```ts
```typescript
import { makeBadRequestError } from "@beep/observability"

const error = makeBadRequestError("missing required field 'email'")
console.log(error.status) // 400
```
```

**Signature**

```ts
declare const makeBadRequestError: StatusErrorConstructor<BadRequestError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L439)

Since v0.0.0

## makeConflictError

Helper constructor for `ConflictError` (409).

**Example**

```ts
```typescript
import { makeConflictError } from "@beep/observability"

const error = makeConflictError("duplicate key")
console.log(error.status) // 409
```
```

**Signature**

```ts
declare const makeConflictError: StatusErrorConstructor<ConflictError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L515)

Since v0.0.0

## makeForbiddenError

Helper constructor for `ForbiddenError` (403).

**Example**

```ts
```typescript
import { makeForbiddenError } from "@beep/observability"

const error = makeForbiddenError("insufficient permissions")
console.log(error.status) // 403
```
```

**Signature**

```ts
declare const makeForbiddenError: StatusErrorConstructor<ForbiddenError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L477)

Since v0.0.0

## makeGatewayTimeoutError

Helper constructor for `GatewayTimeoutError` (504).

**Example**

```ts
```typescript
import { makeGatewayTimeoutError } from "@beep/observability"

const error = makeGatewayTimeoutError("upstream timed out")
console.log(error.status) // 504
```
```

**Signature**

```ts
declare const makeGatewayTimeoutError: StatusErrorConstructor<GatewayTimeoutError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L629)

Since v0.0.0

## makeInternalServerError

Helper constructor for `InternalServerErrorError` (500).

**Example**

```ts
```typescript
import { makeInternalServerError } from "@beep/observability"

const error = makeInternalServerError("unexpected failure")
console.log(error.status) // 500
```
```

**Signature**

```ts
declare const makeInternalServerError: StatusErrorConstructor<InternalServerErrorError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L572)

Since v0.0.0

## makeNotFoundError

Helper constructor for `NotFoundError` (404).

**Example**

```ts
```typescript
import { makeNotFoundError } from "@beep/observability"

const error = makeNotFoundError("resource missing")
console.log(error.status) // 404
```
```

**Signature**

```ts
declare const makeNotFoundError: StatusErrorConstructor<NotFoundError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L496)

Since v0.0.0

## makeServiceUnavailableError

Helper constructor for `ServiceUnavailableError` (503).

**Example**

```ts
```typescript
import { makeServiceUnavailableError } from "@beep/observability"

const error = makeServiceUnavailableError("service down for maintenance")
console.log(error.status) // 503
```
```

**Signature**

```ts
declare const makeServiceUnavailableError: StatusErrorConstructor<ServiceUnavailableError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L610)

Since v0.0.0

## makeTooManyRequestsError

Helper constructor for `TooManyRequestsError` (429).

**Example**

```ts
```typescript
import { makeTooManyRequestsError } from "@beep/observability"

const error = makeTooManyRequestsError("rate limit hit")
console.log(error.status) // 429
```
```

**Signature**

```ts
declare const makeTooManyRequestsError: StatusErrorConstructor<TooManyRequestsError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L553)

Since v0.0.0

## makeUnauthorizedError

Helper constructor for `UnauthorizedError` (401).

**Example**

```ts
```typescript
import { makeUnauthorizedError } from "@beep/observability"

const error = makeUnauthorizedError("token expired")
console.log(error.status) // 401
```
```

**Signature**

```ts
declare const makeUnauthorizedError: StatusErrorConstructor<UnauthorizedError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L458)

Since v0.0.0

## makeUnprocessableEntityError

Helper constructor for `UnprocessableEntityError` (422).

**Example**

```ts
```typescript
import { makeUnprocessableEntityError } from "@beep/observability"

const error = makeUnprocessableEntityError("schema mismatch")
console.log(error.status) // 422
```
```

**Signature**

```ts
declare const makeUnprocessableEntityError: StatusErrorConstructor<UnprocessableEntityError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L534)

Since v0.0.0

# models

## BadGatewayError (class)

502 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { BadGatewayError } from "@beep/observability"

const err = BadGatewayError.make({ cause: Option.none(), message: "upstream unavailable", status: 502 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class BadGatewayError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L362)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Error"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L369)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 502; readonly status_class: "5xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L370)

## BadRequestError (class)

400 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { BadRequestError } from "@beep/observability"

const err = BadRequestError.make({ cause: Option.none(), message: "invalid input", status: 400 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class BadRequestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L154)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L161)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 400; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L162)

## ClientHttpError (class)

Shared tagged error for 4xx HTTP responses with `Warn` severity.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { ClientHttpError } from "@beep/observability"

const err = ClientHttpError.make({
  cause: Option.none(),
  message: "invalid input",
  status: 400
})

console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class ClientHttpError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L89)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L100)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L101)

## ConflictError (class)

409 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { ConflictError } from "@beep/observability"

const err = ConflictError.make({ cause: Option.none(), message: "duplicate entry", status: 409 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class ConflictError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L258)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L265)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 409; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L266)

## ForbiddenError (class)

403 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { ForbiddenError } from "@beep/observability"

const err = ForbiddenError.make({ cause: Option.none(), message: "access denied", status: 403 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class ForbiddenError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L206)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L213)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 403; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L214)

## GatewayTimeoutError (class)

504 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { GatewayTimeoutError } from "@beep/observability"

const err = GatewayTimeoutError.make({ cause: Option.none(), message: "upstream timed out", status: 504 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class GatewayTimeoutError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L414)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Error"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L421)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 504; readonly status_class: "5xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L422)

## InternalServerErrorError (class)

500 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { InternalServerErrorError } from "@beep/observability"

const err = InternalServerErrorError.make({ cause: Option.none(), message: "unexpected failure", status: 500 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class InternalServerErrorError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L336)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Error"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L343)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 500; readonly status_class: "5xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L344)

## NotFoundError (class)

404 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { NotFoundError } from "@beep/observability"

const err = NotFoundError.make({ cause: Option.none(), message: "user not found", status: 404 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class NotFoundError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L232)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Info"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L239)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 404; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L240)

## ServerHttpError (class)

Shared tagged error for 5xx HTTP responses with `Error` severity.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { ServerHttpError } from "@beep/observability"

const err = ServerHttpError.make({
  cause: Option.none(),
  message: "server failed",
  status: 500
})

console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class ServerHttpError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L124)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Error"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L135)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511; readonly status_class: "5xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L136)

## ServiceUnavailableError (class)

503 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { ServiceUnavailableError } from "@beep/observability"

const err = ServiceUnavailableError.make({ cause: Option.none(), message: "service down", status: 503 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class ServiceUnavailableError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L388)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Error"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L395)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 503; readonly status_class: "5xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L396)

## TooManyRequestsError (class)

429 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { TooManyRequestsError } from "@beep/observability"

const err = TooManyRequestsError.make({ cause: Option.none(), message: "rate limit exceeded", status: 429 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class TooManyRequestsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L310)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L317)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 429; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L318)

## UnauthorizedError (class)

401 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { UnauthorizedError } from "@beep/observability"

const err = UnauthorizedError.make({ cause: Option.none(), message: "token expired", status: 401 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class UnauthorizedError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L180)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L187)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 401; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L188)

## UnprocessableEntityError (class)

422 tagged error.

**Example**

```ts
```typescript
import { Effect, Option } from "effect"
import { UnprocessableEntityError } from "@beep/observability"

const err = UnprocessableEntityError.make({ cause: Option.none(), message: "validation failed", status: 422 })
console.log(Effect.fail(err))
```
```

**Signature**

```ts
declare class UnprocessableEntityError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L284)

Since v0.0.0

### [ErrorReporter.severity] (property)

**Signature**

```ts
readonly [ErrorReporter.severity]: "Warn"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L291)

### [ErrorReporter.attributes] (property)

**Signature**

```ts
readonly [ErrorReporter.attributes]: { readonly status: 422; readonly status_class: "4xx"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/HttpError.ts#L292)