---
title: HttpStatus.client-error.core.ts
nav_order: 121
parent: "@beep/schema"
---

## HttpStatus.client-error.core.ts overview

Core client-error HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [BadRequest](#badrequest)
  - [BadRequest (type alias)](#badrequest-type-alias)
  - [Conflict](#conflict)
  - [Conflict (type alias)](#conflict-type-alias)
  - [Forbidden](#forbidden)
  - [Forbidden (type alias)](#forbidden-type-alias)
  - [MethodNotAllowed](#methodnotallowed)
  - [MethodNotAllowed (type alias)](#methodnotallowed-type-alias)
  - [NotAcceptable](#notacceptable)
  - [NotAcceptable (type alias)](#notacceptable-type-alias)
  - [NotFound](#notfound)
  - [NotFound (type alias)](#notfound-type-alias)
  - [PaymentRequired](#paymentrequired)
  - [PaymentRequired (type alias)](#paymentrequired-type-alias)
  - [ProxyAuthenticationRequired](#proxyauthenticationrequired)
  - [ProxyAuthenticationRequired (type alias)](#proxyauthenticationrequired-type-alias)
  - [RequestTimeout](#requesttimeout)
  - [RequestTimeout (type alias)](#requesttimeout-type-alias)
  - [Unauthorized](#unauthorized)
  - [Unauthorized (type alias)](#unauthorized-type-alias)
---

# validation

## BadRequest

400 “Bad Request” – The server can’t return a valid response due to an error
from the client’s side. Common causes are URLs with invalid syntax, deceptive
request routing, large file size, etc.

**Example**

```ts
import { BadRequest } from "@beep/schema/HttpStatus"

console.log(BadRequest.literal)
```

**Signature**

```ts
declare const BadRequest: AnnotatedSchema<S.Literal<400>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L30)

Since v0.0.0

## BadRequest (type alias)

{@inheritDoc BadRequest}

**Signature**

```ts
type BadRequest = typeof BadRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L44)

Since v0.0.0

## Conflict

409 “Conflict” – This error occurs when a request can not be processed due
to a conflict in the current state of the resource on the server. An example
of this error is when multiple edits of the same file are submitted to the
server and the edits conflict with each other.

**Example**

```ts
import { Conflict } from "@beep/schema/HttpStatus"

console.log(Conflict.literal)
```

**Signature**

```ts
declare const Conflict: AnnotatedSchema<S.Literal<409>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L329)

Since v0.0.0

## Conflict (type alias)

{@inheritDoc Conflict}

**Signature**

```ts
type Conflict = typeof Conflict.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L343)

Since v0.0.0

## Forbidden

403 “Forbidden” – The error indicates that the server denies access to the
user agent that doesn’t have permission to access the resources. This error
is similar to HTTP code 401, but the difference is that in this case, the
identity of the user agent is known.
Typical causes of this error are restrictive rules from the website’s
server, insufficient permissions for the website’s files and folders, etc.
For more information, read this article about the HTTP 403 error and how to
fix it.

**Example**

```ts
import { Forbidden } from "@beep/schema/HttpStatus"

console.log(Forbidden.literal)
```

**Signature**

```ts
declare const Forbidden: AnnotatedSchema<S.Literal<403>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L139)

Since v0.0.0

## Forbidden (type alias)

{@inheritDoc Forbidden}

**Signature**

```ts
type Forbidden = typeof Forbidden.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L153)

Since v0.0.0

## MethodNotAllowed

405 “Method Not Allowed” – The server understands the requested method, but
the target resource doesn’t support it.

**Example**

```ts
import { MethodNotAllowed } from "@beep/schema/HttpStatus"

console.log(MethodNotAllowed.literal)
```

**Signature**

```ts
declare const MethodNotAllowed: AnnotatedSchema<S.Literal<405>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L202)

Since v0.0.0

## MethodNotAllowed (type alias)

{@inheritDoc MethodNotAllowed}

**Signature**

```ts
type MethodNotAllowed = typeof MethodNotAllowed.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L216)

Since v0.0.0

## NotAcceptable

406 “Not Acceptable” – The requested resource generated content that doesn’t
meet the criteria of the user-agent who requested it.

**Example**

```ts
import { NotAcceptable } from "@beep/schema/HttpStatus"

console.log(NotAcceptable.literal)
```

**Signature**

```ts
declare const NotAcceptable: AnnotatedSchema<S.Literal<406>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L232)

Since v0.0.0

## NotAcceptable (type alias)

{@inheritDoc NotAcceptable}

**Signature**

```ts
type NotAcceptable = typeof NotAcceptable.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L246)

Since v0.0.0

## NotFound

404 “Not found” – This is the most frequent error users see online. It means
that the server can’t find the requested resource. Usually, the cause is
that the URL you’re trying to access doesn’t exist.
The error could also be caused by a website misconfiguration. Read the
following guide for troubleshooting the HTTP error 404.

**Example**

```ts
import { NotFound } from "@beep/schema/HttpStatus"

console.log(NotFound.literal)
```

**Signature**

```ts
declare const NotFound: AnnotatedSchema<S.Literal<404>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L172)

Since v0.0.0

## NotFound (type alias)

{@inheritDoc NotFound}

**Signature**

```ts
type NotFound = typeof NotFound.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L186)

Since v0.0.0

## PaymentRequired

402 “Payment Required” – This is not a standard code however it is reserved
to be used in the future by payment systems. The purpose of the code is to
indicate that the content is not available due to a failed payment.

**Example**

```ts
import { PaymentRequired } from "@beep/schema/HttpStatus"

console.log(PaymentRequired.literal)
```

**Signature**

```ts
declare const PaymentRequired: AnnotatedSchema<S.Literal<402>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L103)

Since v0.0.0

## PaymentRequired (type alias)

{@inheritDoc PaymentRequired}

**Signature**

```ts
type PaymentRequired = typeof PaymentRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L117)

Since v0.0.0

## ProxyAuthenticationRequired

407 “Proxy Authentication Required” – There is a proxy server used in the
communication between the browser and the server and it requires
authentication.

**Example**

```ts
import { ProxyAuthenticationRequired } from "@beep/schema/HttpStatus"

console.log(ProxyAuthenticationRequired.literal)
```

**Signature**

```ts
declare const ProxyAuthenticationRequired: AnnotatedSchema<S.Literal<407>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L263)

Since v0.0.0

## ProxyAuthenticationRequired (type alias)

{@inheritDoc ProxyAuthenticationRequired}

**Signature**

```ts
type ProxyAuthenticationRequired = typeof ProxyAuthenticationRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L277)

Since v0.0.0

## RequestTimeout

408 “Request Timeout” – The server closed due to a time-out while waiting
for a request from your browser. In some cases, servers may send this
message on an idle connection even without any previous request from the
client.
It should be noted that servers may close the connection without sending a
message.

**Example**

```ts
import { RequestTimeout } from "@beep/schema/HttpStatus"

console.log(RequestTimeout.literal)
```

**Signature**

```ts
declare const RequestTimeout: AnnotatedSchema<S.Literal<408>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L297)

Since v0.0.0

## RequestTimeout (type alias)

{@inheritDoc RequestTimeout}

**Signature**

```ts
type RequestTimeout = typeof RequestTimeout.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L311)

Since v0.0.0

## Unauthorized

401 “Unauthorized” – This error appears when the client fails to provide
valid credentials and the response from the server includes a
WWW-Authenticate header. You will likely see this error when you try to
access password-protected URLs and don’t have the correct login information.
If you experience this problem, check this guide for
`| troubleshooting the HTTP 401 error.`

**Example**

```ts
import { Unauthorized } from "@beep/schema/HttpStatus"

console.log(Unauthorized.literal)
```

**Signature**

```ts
declare const Unauthorized: AnnotatedSchema<S.Literal<401>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L65)

Since v0.0.0

## Unauthorized (type alias)

{@inheritDoc Unauthorized}

**Signature**

```ts
type Unauthorized = typeof Unauthorized.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.core.ts#L86)

Since v0.0.0