---
title: HttpStatus.server-error.ts
nav_order: 129
parent: "@beep/schema"
---

## HttpStatus.server-error.ts overview

Server-error HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [BadGateway](#badgateway)
  - [BadGateway (type alias)](#badgateway-type-alias)
  - [GatewayTimeout](#gatewaytimeout)
  - [GatewayTimeout (type alias)](#gatewaytimeout-type-alias)
  - [HttpVersionNotSupported](#httpversionnotsupported)
  - [HttpVersionNotSupported (type alias)](#httpversionnotsupported-type-alias)
  - [InsufficientStorage](#insufficientstorage)
  - [InsufficientStorage (type alias)](#insufficientstorage-type-alias)
  - [InternalServerError](#internalservererror)
  - [InternalServerError (type alias)](#internalservererror-type-alias)
  - [LoopDetected](#loopdetected)
  - [LoopDetected (type alias)](#loopdetected-type-alias)
  - [NetworkAuthenticationRequired](#networkauthenticationrequired)
  - [NetworkAuthenticationRequired (type alias)](#networkauthenticationrequired-type-alias)
  - [NotExtended](#notextended)
  - [NotExtended (type alias)](#notextended-type-alias)
  - [NotImplemented](#notimplemented)
  - [NotImplemented (type alias)](#notimplemented-type-alias)
  - [ServiceUnavailable](#serviceunavailable)
  - [ServiceUnavailable (type alias)](#serviceunavailable-type-alias)
  - [VariantAlsoNegotiates](#variantalsonegotiates)
  - [VariantAlsoNegotiates (type alias)](#variantalsonegotiates-type-alias)
---

# validation

## BadGateway

502 “Bad Gateway” – This error indicates that the server acted as a gateway
or a proxy and received an invalid response from the upstream server. This
is the official description, but various factors can cause this error. Find
out more about the HTTP 502 “Bad Gateway” error and how to fix it here.

**Example**

```ts
import { BadGateway } from "@beep/schema/HttpStatus"

console.log(BadGateway.literal)
```

**Signature**

```ts
declare const BadGateway: AnnotatedSchema<S.Literal<502>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L95)

Since v0.0.0

## BadGateway (type alias)

{@inheritDoc BadGateway}

**Signature**

```ts
type BadGateway = typeof BadGateway.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L109)

Since v0.0.0

## GatewayTimeout

504 “Gateway Timeout” – The server acted as a gateway and did not receive a
timely response from the upstream server. In most cases, this error is
caused by PHP scripts that don’t finish in time and exceed the server’s
max_execution_time PHP variable timeout limit, hence the server terminates
the connection. See more details in this article about the HTTP 504
“Gateway Timeout” and how to fix it.

**Example**

```ts
import { GatewayTimeout } from "@beep/schema/HttpStatus"

console.log(GatewayTimeout.literal)
```

**Signature**

```ts
declare const GatewayTimeout: AnnotatedSchema<S.Literal<504>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L161)

Since v0.0.0

## GatewayTimeout (type alias)

{@inheritDoc GatewayTimeout}

**Signature**

```ts
type GatewayTimeout = typeof GatewayTimeout.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L175)

Since v0.0.0

## HttpVersionNotSupported

505 “HTTP Version Not Supported” – The server doesn’t support the HTTP
protocol version used in the request.

**Example**

```ts
import { HttpVersionNotSupported } from "@beep/schema/HttpStatus"

console.log(HttpVersionNotSupported.literal)
```

**Signature**

```ts
declare const HttpVersionNotSupported: AnnotatedSchema<S.Literal<505>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L191)

Since v0.0.0

## HttpVersionNotSupported (type alias)

{@inheritDoc HttpVersionNotSupported}

**Signature**

```ts
type HttpVersionNotSupported = typeof HttpVersionNotSupported.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L205)

Since v0.0.0

## InsufficientStorage

507 “Insufficient Storage” (WebDAV) – The server is unable to store the
representation required to complete the request.

**Example**

```ts
import { InsufficientStorage } from "@beep/schema/HttpStatus"

console.log(InsufficientStorage.literal)
```

**Signature**

```ts
declare const InsufficientStorage: AnnotatedSchema<S.Literal<507>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L254)

Since v0.0.0

## InsufficientStorage (type alias)

{@inheritDoc InsufficientStorage}

**Signature**

```ts
type InsufficientStorage = typeof InsufficientStorage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L268)

Since v0.0.0

## InternalServerError

500 “Internal Server Error” – This is a generic error that indicates the
server encountered an unexpected condition and can’t fulfill the request.
The server tells you there is something wrong, but it is not sure what the
problem is. Usually, the issue stems from the website configuration on
the client’s side. Read this tutorial on `| what an “HTTP Error 500 –
Internal Server Error” is and how to fix it` for more information.

**Example**

```ts
import { InternalServerError } from "@beep/schema/HttpStatus"

console.log(InternalServerError.literal)
```

**Signature**

```ts
declare const InternalServerError: AnnotatedSchema<S.Literal<500>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L33)

Since v0.0.0

## InternalServerError (type alias)

{@inheritDoc InternalServerError}

**Signature**

```ts
type InternalServerError = typeof InternalServerError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L47)

Since v0.0.0

## LoopDetected

508 “Loop Detected” (WebDAV) – The server detected an infinite loop while
processing the request.

**Example**

```ts
import { LoopDetected } from "@beep/schema/HttpStatus"

console.log(LoopDetected.literal)
```

**Signature**

```ts
declare const LoopDetected: AnnotatedSchema<S.Literal<508>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L284)

Since v0.0.0

## LoopDetected (type alias)

{@inheritDoc LoopDetected}

**Signature**

```ts
type LoopDetected = typeof LoopDetected.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L297)

Since v0.0.0

## NetworkAuthenticationRequired

511 “Network Authentication Required” – This response is sent when you need
to be authenticated so the network can send your request to a server. Most
commonly, it is seen when trying to use a Wi-Fi network, and you need to
agree to its Terms of Agreement.

**Example**

```ts
import { NetworkAuthenticationRequired } from "@beep/schema/HttpStatus"

console.log(NetworkAuthenticationRequired.literal)
```

**Signature**

```ts
declare const NetworkAuthenticationRequired: AnnotatedSchema<S.Literal<511>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L345)

Since v0.0.0

## NetworkAuthenticationRequired (type alias)

{@inheritDoc NetworkAuthenticationRequired}

**Signature**

```ts
type NetworkAuthenticationRequired = typeof NetworkAuthenticationRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L359)

Since v0.0.0

## NotExtended

510 “Not Extended” – Further extensions to the request are required for the
server to fulfill it. This code is now deprecated.

**Example**

```ts
import { NotExtended } from "@beep/schema/HttpStatus"

console.log(NotExtended.literal)
```

**Signature**

```ts
declare const NotExtended: AnnotatedSchema<S.Literal<510>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L313)

Since v0.0.0

## NotExtended (type alias)

{@inheritDoc NotExtended}

**Signature**

```ts
type NotExtended = typeof NotExtended.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L327)

Since v0.0.0

## NotImplemented

501 “Not Implemented” – The server doesn’t support the request method or
doesn’t have the ability to fulfill the request.

**Example**

```ts
import { NotImplemented } from "@beep/schema/HttpStatus"

console.log(NotImplemented.literal)
```

**Signature**

```ts
declare const NotImplemented: AnnotatedSchema<S.Literal<501>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L63)

Since v0.0.0

## NotImplemented (type alias)

{@inheritDoc NotImplemented}

**Signature**

```ts
type NotImplemented = typeof NotImplemented.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L77)

Since v0.0.0

## ServiceUnavailable

503 “Service Unavailable” – The server can’t handle the request. This is
usually a temporary condition caused by overload or ongoing maintenance on
the server. Read this guide on what the HTTP 503 “Service Unavailable” error
is and how to fix it.

**Example**

```ts
import { ServiceUnavailable } from "@beep/schema/HttpStatus"

console.log(ServiceUnavailable.literal)
```

**Signature**

```ts
declare const ServiceUnavailable: AnnotatedSchema<S.Literal<503>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L127)

Since v0.0.0

## ServiceUnavailable (type alias)

{@inheritDoc ServiceUnavailable}

**Signature**

```ts
type ServiceUnavailable = typeof ServiceUnavailable.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L141)

Since v0.0.0

## VariantAlsoNegotiates

506 “Variant Also Negotiates” – This error occurs when the client and the
server enter into Transparent Content Negotiation, which allows the client
to retrieve the best variant of a resource when the server supports multiple
versions. However, there is a misconfiguration, and the chosen resource also
prompts content negotiation that causes a closed loop.

**Example**

```ts
import { VariantAlsoNegotiates } from "@beep/schema/HttpStatus"

console.log(VariantAlsoNegotiates.literal)
```

**Signature**

```ts
declare const VariantAlsoNegotiates: AnnotatedSchema<S.Literal<506>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L224)

Since v0.0.0

## VariantAlsoNegotiates (type alias)

{@inheritDoc VariantAlsoNegotiates}

**Signature**

```ts
type VariantAlsoNegotiates = typeof VariantAlsoNegotiates.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.server-error.ts#L238)

Since v0.0.0