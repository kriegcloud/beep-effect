---
title: HttpStatus.schema.ts
nav_order: 127
parent: "@beep/schema"
---

## HttpStatus.schema.ts overview

Complete HTTP status schema.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Schema (type alias)](#schema-type-alias)
- [validation](#validation)
  - [HttpStatus](#httpstatus)
  - [HttpStatus (type alias)](#httpstatus-type-alias)
  - [HttpStatus (namespace)](#httpstatus-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [Schema](#schema)
---

# models

## Schema (type alias)

Runtime type extracted from `Schema`.

**Example**

```ts
import type { Schema as HttpStatusValue } from "@beep/schema/HttpStatus"

const status = 200 as HttpStatusValue
console.log(status)
```

**Signature**

```ts
type Schema = HttpStatus
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L100)

Since v0.0.0

# validation

## HttpStatus

A MappedLiteralKit of all HTTP status codes.

**Example**

```ts
import { HttpStatus } from "@beep/schema/HttpStatus"

console.log(HttpStatus.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["Continue", 100], readonly ["SwitchingProtocols", 101], readonly ["Processing", 102], readonly ["EarlyHints", 103], readonly ["Ok", 200], readonly ["Created", 201], readonly ["Accepted", 202], readonly ["NonAuthoritativeInformation", 203], readonly ["NoContent", 204], readonly ["ResetContent", 205], readonly ["PartialContent", 206], readonly ["MultiStatus", 207], readonly ["AlreadyReported", 208], readonly ["ImUsed", 226], readonly ["MultipleChoices", 300], readonly ["MovedPermanently", 301], readonly ["Found", 302], readonly ["SeeOther", 303], readonly ["NotModified", 304], readonly ["UseProxy", 305], readonly ["SwitchProxy", 306], readonly ["TemporaryRedirect", 307], readonly ["PermanentRedirect", 308], readonly ["BadRequest", 400], readonly ["Unauthorized", 401], readonly ["PaymentRequired", 402], readonly ["Forbidden", 403], readonly ["NotFound", 404], readonly ["MethodNotAllowed", 405], readonly ["NotAcceptable", 406], readonly ["ProxyAuthenticationRequired", 407], readonly ["RequestTimeout", 408], readonly ["Conflict", 409], readonly ["Gone", 410], readonly ["LengthRequired", 411], readonly ["PreconditionFailed", 412], readonly ["PayloadTooLarge", 413], readonly ["UriTooLong", 414], readonly ["UnsupportedMediaType", 415], readonly ["RangeNotSatisfiable", 416], readonly ["ExpectationFailed", 417], readonly ["ImATeapot", 418], readonly ["MisdirectedRequest", 421], readonly ["UnprocessableEntity", 422], readonly ["Locked", 423], readonly ["FailedDependency", 424], readonly ["TooEarly", 425], readonly ["UpgradeRequired", 426], readonly ["PreconditionRequired", 428], readonly ["TooManyRequests", 429], readonly ["RequestHeaderFieldsTooLarge", 431], readonly ["UnavailableForLegalReasons", 451], readonly ["InternalServerError", 500], readonly ["NotImplemented", 501], readonly ["BadGateway", 502], readonly ["ServiceUnavailable", 503], readonly ["GatewayTimeout", 504], readonly ["HttpVersionNotSupported", 505], readonly ["VariantAlsoNegotiates", 506], readonly ["InsufficientStorage", 507], readonly ["LoopDetected", 508], readonly ["NotExtended", 510], readonly ["NetworkAuthenticationRequired", 511], readonly ["RequestHeaderFieldsTooLargeShopify", 430], readonly ["LoginTimeout", 440], readonly ["RequestHeaderTooLarge", 494], readonly ["SslCertificateError", 495], readonly ["SslCertificateRequired", 496], readonly ["ClientClosedRequest", 499], readonly ["WebServerReturnedAnUnknownError", 520], readonly ["WebServerIsDown", 521], readonly ["SslHandshakeFailed", 525], readonly ["InvalidSslCertificate", 526]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L34)

Since v0.0.0

## HttpStatus (type alias)

{@inheritDoc HttpStatus}

**Signature**

```ts
type HttpStatus = typeof HttpStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L69)

Since v0.0.0

## HttpStatus (namespace)

A namespace for `HttpStatus` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L53)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus`

**Signature**

```ts
type Encoded = typeof HttpStatus.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L60)

Since v0.0.0

## Schema

Canonical alias for the complete HTTP status schema.

**Example**

```ts
import { Schema } from "@beep/schema/HttpStatus"

console.log(Schema.Pairs.length)
```

**Signature**

```ts
declare const Schema: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["Continue", 100], readonly ["SwitchingProtocols", 101], readonly ["Processing", 102], readonly ["EarlyHints", 103], readonly ["Ok", 200], readonly ["Created", 201], readonly ["Accepted", 202], readonly ["NonAuthoritativeInformation", 203], readonly ["NoContent", 204], readonly ["ResetContent", 205], readonly ["PartialContent", 206], readonly ["MultiStatus", 207], readonly ["AlreadyReported", 208], readonly ["ImUsed", 226], readonly ["MultipleChoices", 300], readonly ["MovedPermanently", 301], readonly ["Found", 302], readonly ["SeeOther", 303], readonly ["NotModified", 304], readonly ["UseProxy", 305], readonly ["SwitchProxy", 306], readonly ["TemporaryRedirect", 307], readonly ["PermanentRedirect", 308], readonly ["BadRequest", 400], readonly ["Unauthorized", 401], readonly ["PaymentRequired", 402], readonly ["Forbidden", 403], readonly ["NotFound", 404], readonly ["MethodNotAllowed", 405], readonly ["NotAcceptable", 406], readonly ["ProxyAuthenticationRequired", 407], readonly ["RequestTimeout", 408], readonly ["Conflict", 409], readonly ["Gone", 410], readonly ["LengthRequired", 411], readonly ["PreconditionFailed", 412], readonly ["PayloadTooLarge", 413], readonly ["UriTooLong", 414], readonly ["UnsupportedMediaType", 415], readonly ["RangeNotSatisfiable", 416], readonly ["ExpectationFailed", 417], readonly ["ImATeapot", 418], readonly ["MisdirectedRequest", 421], readonly ["UnprocessableEntity", 422], readonly ["Locked", 423], readonly ["FailedDependency", 424], readonly ["TooEarly", 425], readonly ["UpgradeRequired", 426], readonly ["PreconditionRequired", 428], readonly ["TooManyRequests", 429], readonly ["RequestHeaderFieldsTooLarge", 431], readonly ["UnavailableForLegalReasons", 451], readonly ["InternalServerError", 500], readonly ["NotImplemented", 501], readonly ["BadGateway", 502], readonly ["ServiceUnavailable", 503], readonly ["GatewayTimeout", 504], readonly ["HttpVersionNotSupported", 505], readonly ["VariantAlsoNegotiates", 506], readonly ["InsufficientStorage", 507], readonly ["LoopDetected", 508], readonly ["NotExtended", 510], readonly ["NetworkAuthenticationRequired", 511], readonly ["RequestHeaderFieldsTooLargeShopify", 430], readonly ["LoginTimeout", 440], readonly ["RequestHeaderTooLarge", 494], readonly ["SslCertificateError", 495], readonly ["SslCertificateRequired", 496], readonly ["ClientClosedRequest", 499], readonly ["WebServerReturnedAnUnknownError", 520], readonly ["WebServerIsDown", 521], readonly ["SslHandshakeFailed", 525], readonly ["InvalidSslCertificate", 526]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.schema.ts#L84)

Since v0.0.0