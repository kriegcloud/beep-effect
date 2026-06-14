---
title: HttpStatus.client-error.ts
nav_order: 124
parent: "@beep/schema"
---

## HttpStatus.client-error.ts overview

Client-error HTTP status aggregate schema.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [HttpStatus4XX](#httpstatus4xx)
  - [HttpStatus4XX (type alias)](#httpstatus4xx-type-alias)
  - [HttpStatus4XX (namespace)](#httpstatus4xx-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
---

# validation

## HttpStatus4XX

The 4XX codes are HTTP error status codes. They define errors as invalid
requests from your browser that the website’s server can’t process.
The problem may be a syntax error in the request, a non-existent URL, wrong
credentials, etc. Your browser will usually produce a page with a particular
error code.

**Example**

```ts
import { HttpStatus4XX } from "@beep/schema/HttpStatus"

console.log(HttpStatus4XX.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus4XX: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["BadRequest", 400], readonly ["Unauthorized", 401], readonly ["PaymentRequired", 402], readonly ["Forbidden", 403], readonly ["NotFound", 404], readonly ["MethodNotAllowed", 405], readonly ["NotAcceptable", 406], readonly ["ProxyAuthenticationRequired", 407], readonly ["RequestTimeout", 408], readonly ["Conflict", 409], readonly ["Gone", 410], readonly ["LengthRequired", 411], readonly ["PreconditionFailed", 412], readonly ["PayloadTooLarge", 413], readonly ["UriTooLong", 414], readonly ["UnsupportedMediaType", 415], readonly ["RangeNotSatisfiable", 416], readonly ["ExpectationFailed", 417], readonly ["ImATeapot", 418], readonly ["MisdirectedRequest", 421], readonly ["UnprocessableEntity", 422], readonly ["Locked", 423], readonly ["FailedDependency", 424], readonly ["TooEarly", 425], readonly ["UpgradeRequired", 426], readonly ["PreconditionRequired", 428], readonly ["TooManyRequests", 429], readonly ["RequestHeaderFieldsTooLarge", 431], readonly ["UnavailableForLegalReasons", 451]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.ts#L63)

Since v0.0.0

## HttpStatus4XX (type alias)

{@inheritDoc HttpStatus4XX}

**Signature**

```ts
type HttpStatus4XX = typeof HttpStatus4XX.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.ts#L126)

Since v0.0.0

## HttpStatus4XX (namespace)

A namespace for `HttpStatus4XX` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.ts#L110)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus4XX`

**Signature**

```ts
type Encoded = typeof HttpStatus4XX.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.ts#L117)

Since v0.0.0