---
title: HttpStatus.unofficial.ts
nav_order: 133
parent: "@beep/schema"
---

## HttpStatus.unofficial.ts overview

Unofficial HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [ClientClosedRequest](#clientclosedrequest)
  - [ClientClosedRequest (type alias)](#clientclosedrequest-type-alias)
  - [InvalidSslCertificate](#invalidsslcertificate)
  - [InvalidSslCertificate (type alias)](#invalidsslcertificate-type-alias)
  - [LoginTimeout](#logintimeout)
  - [LoginTimeout (type alias)](#logintimeout-type-alias)
  - [RequestHeaderFieldsTooLargeShopify](#requestheaderfieldstoolargeshopify)
  - [RequestHeaderFieldsTooLargeShopify (type alias)](#requestheaderfieldstoolargeshopify-type-alias)
  - [RequestHeaderTooLarge](#requestheadertoolarge)
  - [RequestHeaderTooLarge (type alias)](#requestheadertoolarge-type-alias)
  - [SslCertificateError](#sslcertificateerror)
  - [SslCertificateError (type alias)](#sslcertificateerror-type-alias)
  - [SslCertificateRequired](#sslcertificaterequired)
  - [SslCertificateRequired (type alias)](#sslcertificaterequired-type-alias)
  - [SslHandshakeFailed](#sslhandshakefailed)
  - [SslHandshakeFailed (type alias)](#sslhandshakefailed-type-alias)
  - [WebServerIsDown](#webserverisdown)
  - [WebServerIsDown (type alias)](#webserverisdown-type-alias)
  - [WebServerReturnedAnUnknownError](#webserverreturnedanunknownerror)
  - [WebServerReturnedAnUnknownError (type alias)](#webserverreturnedanunknownerror-type-alias)
---

# validation

## ClientClosedRequest

499 “Client Closed Request” – The client terminated the request before the
server could send a response. Another code used by NGINX.

**Example**

```ts
import { ClientClosedRequest } from "@beep/schema/HttpStatus"

console.log(ClientClosedRequest.literal)
```

**Signature**

```ts
declare const ClientClosedRequest: AnnotatedSchema<S.Literal<499>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L181)

Since v0.0.0

## ClientClosedRequest (type alias)

{@inheritDoc ClientClosedRequest}

**Signature**

```ts
type ClientClosedRequest = typeof ClientClosedRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L195)

Since v0.0.0

## InvalidSslCertificate

526 “Invalid SSL Certificate” – Another code mostly used by Cloudflare.
Cloudflare could not validate the SSL installed on the origin server.
Usually, caused by invalid or missing SSL on the origin server. Read this
guide on how to install Let’s Encrypt for your SiteGround-hosted website.

**Example**

```ts
import { InvalidSslCertificate } from "@beep/schema/HttpStatus"

console.log(InvalidSslCertificate.literal)
```

**Signature**

```ts
declare const InvalidSslCertificate: AnnotatedSchema<S.Literal<526>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L305)

Since v0.0.0

## InvalidSslCertificate (type alias)

{@inheritDoc InvalidSslCertificate}

**Signature**

```ts
type InvalidSslCertificate = typeof InvalidSslCertificate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L319)

Since v0.0.0

## LoginTimeout

440 “Login Time-out” – This code is used by Microsoft’s ISS (Internet
Information Services). The client’s login session has expired and they must
log in again.

**Example**

```ts
import { LoginTimeout } from "@beep/schema/HttpStatus"

console.log(LoginTimeout.literal)
```

**Signature**

```ts
declare const LoginTimeout: AnnotatedSchema<S.Literal<440>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L61)

Since v0.0.0

## LoginTimeout (type alias)

{@inheritDoc LoginTimeout}

**Signature**

```ts
type LoginTimeout = typeof LoginTimeout.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L75)

Since v0.0.0

## RequestHeaderFieldsTooLargeShopify

430 “Request Header Fields Too Large” – This code is used by Shopify when
too many URLs are requested at the same time. It is similar to the HTTP code
429 “Too many requests”.

**Example**

```ts
import { RequestHeaderFieldsTooLargeShopify } from "@beep/schema/HttpStatus"

console.log(RequestHeaderFieldsTooLargeShopify.literal)
```

**Signature**

```ts
declare const RequestHeaderFieldsTooLargeShopify: AnnotatedSchema<S.Literal<430>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L30)

Since v0.0.0

## RequestHeaderFieldsTooLargeShopify (type alias)

{@inheritDoc RequestHeaderFieldsTooLargeShopify}

**Signature**

```ts
type RequestHeaderFieldsTooLargeShopify = typeof RequestHeaderFieldsTooLargeShopify.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L44)

Since v0.0.0

## RequestHeaderTooLarge

494 “Request header too large” – used by NGINX. The client has sent too
large of a request or too long of a header line.

**Example**

```ts
import { RequestHeaderTooLarge } from "@beep/schema/HttpStatus"

console.log(RequestHeaderTooLarge.literal)
```

**Signature**

```ts
declare const RequestHeaderTooLarge: AnnotatedSchema<S.Literal<494>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L91)

Since v0.0.0

## RequestHeaderTooLarge (type alias)

{@inheritDoc RequestHeaderTooLarge}

**Signature**

```ts
type RequestHeaderTooLarge = typeof RequestHeaderTooLarge.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L105)

Since v0.0.0

## SslCertificateError

495 “SSL Certificate Error” – This is also a status code used by NGINX
signaling that the client has provided an invalid SSL certificate.

**Example**

```ts
import { SslCertificateError } from "@beep/schema/HttpStatus"

console.log(SslCertificateError.literal)
```

**Signature**

```ts
declare const SslCertificateError: AnnotatedSchema<S.Literal<495>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L121)

Since v0.0.0

## SslCertificateError (type alias)

{@inheritDoc SslCertificateError}

**Signature**

```ts
type SslCertificateError = typeof SslCertificateError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L135)

Since v0.0.0

## SslCertificateRequired

496 “SSL Certificate Required” – used by NGINX. A client certificate is
required but is not provided.

**Example**

```ts
import { SslCertificateRequired } from "@beep/schema/HttpStatus"

console.log(SslCertificateRequired.literal)
```

**Signature**

```ts
declare const SslCertificateRequired: AnnotatedSchema<S.Literal<496>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L151)

Since v0.0.0

## SslCertificateRequired (type alias)

{@inheritDoc SslCertificateRequired}

**Signature**

```ts
type SslCertificateRequired = typeof SslCertificateRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L165)

Since v0.0.0

## SslHandshakeFailed

525 “SSL Handshake Failed” – Used by Cloudflare. Cloudflare is unable to
establish an SSL/TLS handshake with the origin server.

**Example**

```ts
import { SslHandshakeFailed } from "@beep/schema/HttpStatus"

console.log(SslHandshakeFailed.literal)
```

**Signature**

```ts
declare const SslHandshakeFailed: AnnotatedSchema<S.Literal<525>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L273)

Since v0.0.0

## SslHandshakeFailed (type alias)

{@inheritDoc SslHandshakeFailed}

**Signature**

```ts
type SslHandshakeFailed = typeof SslHandshakeFailed.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L287)

Since v0.0.0

## WebServerIsDown

521 “Web Server is Down” – Another Cloudflare-specific error code. The
origin server refused the connection to Cloudflare. This error could be
caused by the origin’s firewall blocking Cloudflare’s IPs.

**Example**

```ts
import { WebServerIsDown } from "@beep/schema/HttpStatus"

console.log(WebServerIsDown.literal)
```

**Signature**

```ts
declare const WebServerIsDown: AnnotatedSchema<S.Literal<521>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L243)

Since v0.0.0

## WebServerIsDown (type alias)

{@inheritDoc WebServerIsDown}

**Signature**

```ts
type WebServerIsDown = typeof WebServerIsDown.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L257)

Since v0.0.0

## WebServerReturnedAnUnknownError

520 “Web Server Returned an Unknown Error” – This is a code used by
Cloudflare. It specifies that the origin server returned an unexpected or
unknown response to Cloudflare.

**Example**

```ts
import { WebServerReturnedAnUnknownError } from "@beep/schema/HttpStatus"

console.log(WebServerReturnedAnUnknownError.literal)
```

**Signature**

```ts
declare const WebServerReturnedAnUnknownError: AnnotatedSchema<S.Literal<520>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L212)

Since v0.0.0

## WebServerReturnedAnUnknownError (type alias)

{@inheritDoc WebServerReturnedAnUnknownError}

**Signature**

```ts
type WebServerReturnedAnUnknownError = typeof WebServerReturnedAnUnknownError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.unofficial.ts#L226)

Since v0.0.0