---
title: HttpStatus.client-error.extended.ts
nav_order: 122
parent: "@beep/schema"
---

## HttpStatus.client-error.extended.ts overview

Extended client-error HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [FailedDependency](#faileddependency)
  - [FailedDependency (type alias)](#faileddependency-type-alias)
  - [Locked](#locked)
  - [Locked (type alias)](#locked-type-alias)
  - [MisdirectedRequest](#misdirectedrequest)
  - [MisdirectedRequest (type alias)](#misdirectedrequest-type-alias)
  - [PreconditionRequired](#preconditionrequired)
  - [PreconditionRequired (type alias)](#preconditionrequired-type-alias)
  - [RequestHeaderFieldsTooLarge](#requestheaderfieldstoolarge)
  - [RequestHeaderFieldsTooLarge (type alias)](#requestheaderfieldstoolarge-type-alias)
  - [TooEarly](#tooearly)
  - [TooEarly (type alias)](#tooearly-type-alias)
  - [TooManyRequests](#toomanyrequests)
  - [TooManyRequests (type alias)](#toomanyrequests-type-alias)
  - [UnavailableForLegalReasons](#unavailableforlegalreasons)
  - [UnavailableForLegalReasons (type alias)](#unavailableforlegalreasons-type-alias)
  - [UnprocessableEntity](#unprocessableentity)
  - [UnprocessableEntity (type alias)](#unprocessableentity-type-alias)
  - [UpgradeRequired](#upgraderequired)
  - [UpgradeRequired (type alias)](#upgraderequired-type-alias)
---

# validation

## FailedDependency

424 “Failed Dependency” – The request failed because it depended on another
request that failed as well.

**Example**

```ts
import { FailedDependency } from "@beep/schema/HttpStatus"

console.log(FailedDependency.literal)
```

**Signature**

```ts
declare const FailedDependency: AnnotatedSchema<S.Literal<424>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L114)

Since v0.0.0

## FailedDependency (type alias)

{@inheritDoc FailedDependency}

**Signature**

```ts
type FailedDependency = typeof FailedDependency.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L128)

Since v0.0.0

## Locked

423 “Locked” – The resource that is being accessed is locked.

**Example**

```ts
import { Locked } from "@beep/schema/HttpStatus"

console.log(Locked.literal)
```

**Signature**

```ts
declare const Locked: AnnotatedSchema<S.Literal<423>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L85)

Since v0.0.0

## Locked (type alias)

{@inheritDoc Locked}

**Signature**

```ts
type Locked = typeof Locked.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L98)

Since v0.0.0

## MisdirectedRequest

421 “Misdirected Request” – The request was directed to a server unable to
produce a response.

**Example**

```ts
import { MisdirectedRequest } from "@beep/schema/HttpStatus"

console.log(MisdirectedRequest.literal)
```

**Signature**

```ts
declare const MisdirectedRequest: AnnotatedSchema<S.Literal<421>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L25)

Since v0.0.0

## MisdirectedRequest (type alias)

{@inheritDoc MisdirectedRequest}

**Signature**

```ts
type MisdirectedRequest = typeof MisdirectedRequest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L38)

Since v0.0.0

## PreconditionRequired

428 “Precondition Required” – The server requires the request to be
conditional. In most cases, this response is used to prevent conflicts when
a client uses the GET method to request a resource, modifies it, and then
uses PUT to upload the new version while another party may have also altered
the same resource.

**Example**

```ts
import { PreconditionRequired } from "@beep/schema/HttpStatus"

console.log(PreconditionRequired.literal)
```

**Signature**

```ts
declare const PreconditionRequired: AnnotatedSchema<S.Literal<428>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L208)

Since v0.0.0

## PreconditionRequired (type alias)

{@inheritDoc PreconditionRequired}

**Signature**

```ts
type PreconditionRequired = typeof PreconditionRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L222)

Since v0.0.0

## RequestHeaderFieldsTooLarge

431 “Request Header Fields Too Large” – The server can’t process the request
because its individual header fields or all combined header fields are too
large. The client may submit a new request if the size is reduced.

**Example**

```ts
import { RequestHeaderFieldsTooLarge } from "@beep/schema/HttpStatus"

console.log(RequestHeaderFieldsTooLarge.literal)
```

**Signature**

```ts
declare const RequestHeaderFieldsTooLarge: AnnotatedSchema<S.Literal<431>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L278)

Since v0.0.0

## RequestHeaderFieldsTooLarge (type alias)

{@inheritDoc RequestHeaderFieldsTooLarge}

**Signature**

```ts
type RequestHeaderFieldsTooLarge = typeof RequestHeaderFieldsTooLarge.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L292)

Since v0.0.0

## TooEarly

425 “Too Early” – This error indicates that the server is unwilling to risk
processing a request that might be replayed.

**Example**

```ts
import { TooEarly } from "@beep/schema/HttpStatus"

console.log(TooEarly.literal)
```

**Signature**

```ts
declare const TooEarly: AnnotatedSchema<S.Literal<425>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L144)

Since v0.0.0

## TooEarly (type alias)

{@inheritDoc TooEarly}

**Signature**

```ts
type TooEarly = typeof TooEarly.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L158)

Since v0.0.0

## TooManyRequests

429 “Too many requests” – The server responds with this code when the user
agent has sent too many requests in the given time and has exceeded the rate
limit.
You may see this error on your WordPress website if bad bots or scripts
attempt to access the dashboard. In that case, changing the login URL is
recommended which can be easily done from the Login Security settings of the
Security Optimizer plugin.
You may also see this error when you try to install a Let’s Encrypt SSL, but
you’ve accumulated too many failed requests. For more information, read this
guide: Let’s Encrypt errors “429 Too Many Requests”, “No Domains
Authorized,” and “Certificate is not for the chosen domain.”

**Example**

```ts
import { TooManyRequests } from "@beep/schema/HttpStatus"

console.log(TooManyRequests.literal)
```

**Signature**

```ts
declare const TooManyRequests: AnnotatedSchema<S.Literal<429>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L247)

Since v0.0.0

## TooManyRequests (type alias)

{@inheritDoc TooManyRequests}

**Signature**

```ts
type TooManyRequests = typeof TooManyRequests.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L261)

Since v0.0.0

## UnavailableForLegalReasons

451 “Unavailable for Legal Reasons” – The client requests a resource for
which the server is legally bound to deny access, such as a web page
censored by the government.

**Example**

```ts
import { UnavailableForLegalReasons } from "@beep/schema/HttpStatus"

console.log(UnavailableForLegalReasons.literal)
```

**Signature**

```ts
declare const UnavailableForLegalReasons: AnnotatedSchema<S.Literal<451>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L309)

Since v0.0.0

## UnavailableForLegalReasons (type alias)

{@inheritDoc UnavailableForLegalReasons}

**Signature**

```ts
type UnavailableForLegalReasons = typeof UnavailableForLegalReasons.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L323)

Since v0.0.0

## UnprocessableEntity

422 “Unprocessable Entity” – The request from the client is well-formed but
it contains semantic errors that prevent the server from processing a
response. If you stumble upon this error, check out our article about the
422 Error Code.

**Example**

```ts
import { UnprocessableEntity } from "@beep/schema/HttpStatus"

console.log(UnprocessableEntity.literal)
```

**Signature**

```ts
declare const UnprocessableEntity: AnnotatedSchema<S.Literal<422>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L56)

Since v0.0.0

## UnprocessableEntity (type alias)

{@inheritDoc UnprocessableEntity}

**Signature**

```ts
type UnprocessableEntity = typeof UnprocessableEntity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L70)

Since v0.0.0

## UpgradeRequired

426 “Upgrade Required” – The server refuses the request using the current
protocols as indicated by the upgrade header sent in response. It is willing
to accept the request if the client upgrades to another protocol.

**Example**

```ts
import { UpgradeRequired } from "@beep/schema/HttpStatus"

console.log(UpgradeRequired.literal)
```

**Signature**

```ts
declare const UpgradeRequired: AnnotatedSchema<S.Literal<426>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L175)

Since v0.0.0

## UpgradeRequired (type alias)

{@inheritDoc UpgradeRequired}

**Signature**

```ts
type UpgradeRequired = typeof UpgradeRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.extended.ts#L189)

Since v0.0.0