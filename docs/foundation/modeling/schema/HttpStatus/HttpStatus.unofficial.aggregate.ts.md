---
title: HttpStatus.unofficial.aggregate.ts
nav_order: 132
parent: "@beep/schema"
---

## HttpStatus.unofficial.aggregate.ts overview

Unofficial HTTP status aggregate schema.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [HttpStatusUnofficial](#httpstatusunofficial)
  - [HttpStatusUnofficial (type alias)](#httpstatusunofficial-type-alias)
  - [HttpStatusUnofficial (namespace)](#httpstatusunofficial-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
---

# validation

## HttpStatusUnofficial

The codes above are officially recognized by IANA, but different platforms
use unofficial HTTP codes to indicate specific problems related to their
services. The following codes are used in some of the most popular online
services.

**Example**

```ts
import { HttpStatusUnofficial } from "@beep/schema/HttpStatus"

console.log(HttpStatusUnofficial.Pairs.length)
```

**Signature**

```ts
declare const HttpStatusUnofficial: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["RequestHeaderFieldsTooLargeShopify", 430], readonly ["LoginTimeout", 440], readonly ["RequestHeaderTooLarge", 494], readonly ["SslCertificateError", 495], readonly ["SslCertificateRequired", 496], readonly ["ClientClosedRequest", 499], readonly ["WebServerReturnedAnUnknownError", 520], readonly ["WebServerIsDown", 521], readonly ["SslHandshakeFailed", 525], readonly ["InvalidSslCertificate", 526]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.aggregate.ts#L39)

Since v0.0.0

## HttpStatusUnofficial (type alias)

{@inheritDoc HttpStatusUnofficial}

**Signature**

```ts
type HttpStatusUnofficial = typeof HttpStatusUnofficial.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.aggregate.ts#L79)

Since v0.0.0

## HttpStatusUnofficial (namespace)

A namespace for `HttpStatusUnofficial` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.aggregate.ts#L63)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatusUnofficial`

**Signature**

```ts
type Encoded = typeof HttpStatusUnofficial.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.aggregate.ts#L70)

Since v0.0.0