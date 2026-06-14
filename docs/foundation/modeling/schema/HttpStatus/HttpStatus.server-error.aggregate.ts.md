---
title: HttpStatus.server-error.aggregate.ts
nav_order: 128
parent: "@beep/schema"
---

## HttpStatus.server-error.aggregate.ts overview

Server-error HTTP status aggregate schema.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [HttpStatus5XX](#httpstatus5xx)
  - [HttpStatus5XX (type alias)](#httpstatus5xx-type-alias)
  - [HttpStatus5XX (namespace)](#httpstatus5xx-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
---

# validation

## HttpStatus5XX

The 5XX HTTP codes indicate that there is a problem on the website’s server
that prevents it from processing a request. Like the 4XX codes, you
will see an error page on your browser when a 5XX error is triggered.

**Example**

```ts
import { HttpStatus5XX } from "@beep/schema/HttpStatus"

console.log(HttpStatus5XX.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus5XX: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["InternalServerError", 500], readonly ["NotImplemented", 501], readonly ["BadGateway", 502], readonly ["ServiceUnavailable", 503], readonly ["GatewayTimeout", 504], readonly ["HttpVersionNotSupported", 505], readonly ["VariantAlsoNegotiates", 506], readonly ["InsufficientStorage", 507], readonly ["LoopDetected", 508], readonly ["NotExtended", 510], readonly ["NetworkAuthenticationRequired", 511]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.aggregate.ts#L39)

Since v0.0.0

## HttpStatus5XX (type alias)

{@inheritDoc HttpStatus5XX}

**Signature**

```ts
type HttpStatus5XX = typeof HttpStatus5XX.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.aggregate.ts#L80)

Since v0.0.0

## HttpStatus5XX (namespace)

A namespace for `HttpStatus5XX` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.aggregate.ts#L64)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus5XX`

**Signature**

```ts
type Encoded = typeof HttpStatus5XX.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.aggregate.ts#L71)

Since v0.0.0