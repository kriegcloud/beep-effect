---
title: HttpStatus.success.ts
nav_order: 131
parent: "@beep/schema"
---

## HttpStatus.success.ts overview

Success HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [Accepted](#accepted)
  - [Accepted (type alias)](#accepted-type-alias)
  - [AlreadyReported](#alreadyreported)
  - [AlreadyReported (type alias)](#alreadyreported-type-alias)
  - [Created](#created)
  - [Created (type alias)](#created-type-alias)
  - [HttpStatus2XX](#httpstatus2xx)
  - [HttpStatus2XX (type alias)](#httpstatus2xx-type-alias)
  - [HttpStatus2XX (namespace)](#httpstatus2xx-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [ImUsed](#imused)
  - [ImUsed (type alias)](#imused-type-alias)
  - [MultiStatus](#multistatus)
  - [MultiStatus (type alias)](#multistatus-type-alias)
  - [NoContent](#nocontent)
  - [NoContent (type alias)](#nocontent-type-alias)
  - [NonAuthoritativeInformation](#nonauthoritativeinformation)
  - [NonAuthoritativeInformation (type alias)](#nonauthoritativeinformation-type-alias)
  - [Ok](#ok)
  - [Ok (type alias)](#ok-type-alias)
  - [PartialContent](#partialcontent)
  - [PartialContent (type alias)](#partialcontent-type-alias)
  - [ResetContent](#resetcontent)
  - [ResetContent (type alias)](#resetcontent-type-alias)
---

# validation

## Accepted

202 “Accepted” – The server accepted the request but has not yet finished
processing it. The request might be fulfilled or rejected, but the outcome
is still undetermined.

**Example**

```ts
import { Accepted } from "@beep/schema/HttpStatus"

console.log(Accepted.literal)
```

**Signature**

```ts
declare const Accepted: AnnotatedSchema<S.Literal<202>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L88)

Since v0.0.0

## Accepted (type alias)

{@inheritDoc Accepted}

**Signature**

```ts
type Accepted = typeof Accepted.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L102)

Since v0.0.0

## AlreadyReported

208 “Already Reported” (WebDav) – This code indicates that the internal
members of a DAV binding were already enumerated in a previous part of the
response and will not be enumerated again.

**Example**

```ts
import { AlreadyReported } from "@beep/schema/HttpStatus"

console.log(AlreadyReported.literal)
```

**Signature**

```ts
declare const AlreadyReported: AnnotatedSchema<S.Literal<208>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L273)

Since v0.0.0

## AlreadyReported (type alias)

{@inheritDoc AlreadyReported}

**Signature**

```ts
type AlreadyReported = typeof AlreadyReported.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L287)

Since v0.0.0

## Created

201 “Created” – The request was fulfilled, and the server created a new resource.

**Example**

```ts
import { Created } from "@beep/schema/HttpStatus"

console.log(Created.literal)
```

**Signature**

```ts
declare const Created: AnnotatedSchema<S.Literal<201>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L58)

Since v0.0.0

## Created (type alias)

{@inheritDoc Created}

**Signature**

```ts
type Created = typeof Created.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L71)

Since v0.0.0

## HttpStatus2XX

The 2XX codes are the best responses you can receive. They indicate that the
request was recognized by the server, was accepted, and is being processed.

**Example**

```ts
import { HttpStatus2XX } from "@beep/schema/HttpStatus"

console.log(HttpStatus2XX.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus2XX: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["Ok", 200], readonly ["Created", 201], readonly ["Accepted", 202], readonly ["NonAuthoritativeInformation", 203], readonly ["NoContent", 204], readonly ["ResetContent", 205], readonly ["PartialContent", 206], readonly ["MultiStatus", 207], readonly ["AlreadyReported", 208], readonly ["ImUsed", 226]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L334)

Since v0.0.0

## HttpStatus2XX (type alias)

{@inheritDoc HttpStatus2XX}

**Signature**

```ts
type HttpStatus2XX = typeof HttpStatus2XX.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L374)

Since v0.0.0

## HttpStatus2XX (namespace)

A namespace for `HttpStatus2XX` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L358)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus2XX`

**Signature**

```ts
type Encoded = typeof HttpStatus2XX.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L365)

Since v0.0.0

## ImUsed

226 “IM Used” – The server fulfilled the request, and the response is a
representation of the result of one or more instance manipulations applied
to the current instance.

**Example**

```ts
import { ImUsed } from "@beep/schema/HttpStatus"

console.log(ImUsed.literal)
```

**Signature**

```ts
declare const ImUsed: AnnotatedSchema<S.Literal<226>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L304)

Since v0.0.0

## ImUsed (type alias)

{@inheritDoc ImUsed}

**Signature**

```ts
type ImUsed = typeof ImUsed.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L318)

Since v0.0.0

## MultiStatus

207 “Multi-Status” – A code associated with WebDav when a compound request
is made. The server returns a message containing an array of response codes
for all sub-requests.

**Example**

```ts
import { MultiStatus } from "@beep/schema/HttpStatus"

console.log(MultiStatus.literal)
```

**Signature**

```ts
declare const MultiStatus: AnnotatedSchema<S.Literal<207>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L242)

Since v0.0.0

## MultiStatus (type alias)

{@inheritDoc MultiStatus}

**Signature**

```ts
type MultiStatus = typeof MultiStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L256)

Since v0.0.0

## NoContent

204 “No Content” – The server fulfilled the request but won’t return any
content.

**Example**

```ts
import { NoContent } from "@beep/schema/HttpStatus"

console.log(NoContent.literal)
```

**Signature**

```ts
declare const NoContent: AnnotatedSchema<S.Literal<204>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L150)

Since v0.0.0

## NoContent (type alias)

{@inheritDoc NoContent}

**Signature**

```ts
type NoContent = typeof NoContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L163)

Since v0.0.0

## NonAuthoritativeInformation

203 “Non-Authoritative Information” – A code that usually appears when a
proxy service is used. The proxy server received a 200 “OK” status code
from the origin server and returns a modified version of the origin’s
response.

**Example**

```ts
import { NonAuthoritativeInformation } from "@beep/schema/HttpStatus"

console.log(NonAuthoritativeInformation.literal)
```

**Signature**

```ts
declare const NonAuthoritativeInformation: AnnotatedSchema<S.Literal<203>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L120)

Since v0.0.0

## NonAuthoritativeInformation (type alias)

{@inheritDoc NonAuthoritativeInformation}

**Signature**

```ts
type NonAuthoritativeInformation = typeof NonAuthoritativeInformation.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L134)

Since v0.0.0

## Ok

200 “OK” – The response for a successful HTTP request. The result will depend on the type of request.

**Example**

```ts
import { Ok } from "@beep/schema/HttpStatus"

console.log(Ok.literal)
```

**Signature**

```ts
declare const Ok: AnnotatedSchema<S.Literal<200>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L29)

Since v0.0.0

## Ok (type alias)

{@inheritDoc Ok}

**Signature**

```ts
type Ok = typeof Ok.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L43)

Since v0.0.0

## PartialContent

206 “Partial Content” – The server returns only a portion of the requested
resources because your browser uses “range headers”. These headers allow
browsers to resume downloads or split downloads into multiple simultaneous
streams.

**Example**

```ts
import { PartialContent } from "@beep/schema/HttpStatus"

console.log(PartialContent.literal)
```

**Signature**

```ts
declare const PartialContent: AnnotatedSchema<S.Literal<206>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L211)

Since v0.0.0

## PartialContent (type alias)

{@inheritDoc PartialContent}

**Signature**

```ts
type PartialContent = typeof PartialContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L225)

Since v0.0.0

## ResetContent

205 “Reset Content” – The server fulfilled the request, and it won’t return
any content but asks the client (browser) to reset the document view.

**Example**

```ts
import { ResetContent } from "@beep/schema/HttpStatus"

console.log(ResetContent.literal)
```

**Signature**

```ts
declare const ResetContent: AnnotatedSchema<S.Literal<205>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L179)

Since v0.0.0

## ResetContent (type alias)

{@inheritDoc ResetContent}

**Signature**

```ts
type ResetContent = typeof ResetContent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.success.ts#L193)

Since v0.0.0