---
title: HttpStatus.redirection.ts
nav_order: 126
parent: "@beep/schema"
---

## HttpStatus.redirection.ts overview

Redirection HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [Found](#found)
  - [Found (type alias)](#found-type-alias)
  - [HttpStatus3XX](#httpstatus3xx)
  - [HttpStatus3XX (type alias)](#httpstatus3xx-type-alias)
  - [HttpStatus3XX (namespace)](#httpstatus3xx-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [MovedPermanently](#movedpermanently)
  - [MovedPermanently (type alias)](#movedpermanently-type-alias)
  - [MultipleChoices](#multiplechoices)
  - [MultipleChoices (type alias)](#multiplechoices-type-alias)
  - [NotModified](#notmodified)
  - [NotModified (type alias)](#notmodified-type-alias)
  - [PermanentRedirect](#permanentredirect)
  - [PermanentRedirect (type alias)](#permanentredirect-type-alias)
  - [SeeOther](#seeother)
  - [SeeOther (type alias)](#seeother-type-alias)
  - [SwitchProxy](#switchproxy)
  - [SwitchProxy (type alias)](#switchproxy-type-alias)
  - [TemporaryRedirect](#temporaryredirect)
  - [TemporaryRedirect (type alias)](#temporaryredirect-type-alias)
  - [UseProxy](#useproxy)
  - [UseProxy (type alias)](#useproxy-type-alias)
---

# validation

## Found

302 “Found” – Previously, this code was known as “Moved temporarily”. It
instructs browsers that the requested resource is moved temporarily to a new
URL, but the new address may be changed again in the future. Thus, the
original URL should still be used by the client. The code is used for
temporary redirects.

**Example**

```ts
import { Found } from "@beep/schema/HttpStatus"

console.log(Found.literal)
```

**Signature**

```ts
declare const Found: AnnotatedSchema<S.Literal<302>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L99)

Since v0.0.0

## Found (type alias)

{@inheritDoc Found}

**Signature**

```ts
type Found = typeof Found.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L113)

Since v0.0.0

## HttpStatus3XX

3XX codes specify that there will be a redirection. `| Redirects` are
commonly
used when a resource is moved to a new address. The different 3XX codes instruct
browsers on how the redirect must be performed.

**Example**

```ts
import { HttpStatus3XX } from "@beep/schema/HttpStatus"

console.log(HttpStatus3XX.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus3XX: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["MultipleChoices", 300], readonly ["MovedPermanently", 301], readonly ["Found", 302], readonly ["SeeOther", 303], readonly ["NotModified", 304], readonly ["UseProxy", 305], readonly ["SwitchProxy", 306], readonly ["TemporaryRedirect", 307], readonly ["PermanentRedirect", 308]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L318)

Since v0.0.0

## HttpStatus3XX (type alias)

{@inheritDoc HttpStatus3XX}

**Signature**

```ts
type HttpStatus3XX = typeof HttpStatus3XX.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L341)

Since v0.0.0

## HttpStatus3XX (namespace)

A namespace for `HttpStatus3XX` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L349)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus3XX`

**Signature**

```ts
type Encoded = typeof HttpStatus3XX.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L356)

Since v0.0.0

## MovedPermanently

301 “Moved Permanently” – This is the code for a permanent redirect. It means that the URL of the requested resource is permanently replaced with a new address, and search engines should update the URL in their databases.
You learn more about it from our article on 301 redirects.

**Example**

```ts
import { MovedPermanently } from "@beep/schema/HttpStatus"

console.log(MovedPermanently.literal)
```

**Signature**

```ts
declare const MovedPermanently: AnnotatedSchema<S.Literal<301>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L66)

Since v0.0.0

## MovedPermanently (type alias)

{@inheritDoc MovedPermanently}

**Signature**

```ts
type MovedPermanently = typeof MovedPermanently.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L80)

Since v0.0.0

## MultipleChoices

300 “Multiple Choices” – The server presents the client with a choice of
multiple resources to choose from. The status code is applied when you use
your browser to download files and you are given a choice of file extension,
or when you are presented with options for word-sense disambiguation.

**Example**

```ts
import { MultipleChoices } from "@beep/schema/HttpStatus"

console.log(MultipleChoices.literal)
```

**Signature**

```ts
declare const MultipleChoices: AnnotatedSchema<S.Literal<300>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L32)

Since v0.0.0

## MultipleChoices (type alias)

{@inheritDoc MultipleChoices}

**Signature**

```ts
type MultipleChoices = typeof MultipleChoices.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L50)

Since v0.0.0

## NotModified

304 “Not Modified” – The server informs your browser that the resource
hasn’t been altered since the last time you requested it. Your browser can
keep using the cached version it already stores locally. Clearing the
browser cache usually solves this error.

**Example**

```ts
import { NotModified } from "@beep/schema/HttpStatus"

console.log(NotModified.literal)
```

**Signature**

```ts
declare const NotModified: AnnotatedSchema<S.Literal<304>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L161)

Since v0.0.0

## NotModified (type alias)

{@inheritDoc NotModified}

**Signature**

```ts
type NotModified = typeof NotModified.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L175)

Since v0.0.0

## PermanentRedirect

308 “Permanent Redirect” – The requested resource is permanently moved to
another URL and all future requests must be redirected to the new address.
The code is similar to the HTTP 302 code, the only difference being that it
doesn’t allow browsers to change the type of HTTP request.

**Example**

```ts
import { PermanentRedirect } from "@beep/schema/HttpStatus"

console.log(PermanentRedirect.literal)
```

**Signature**

```ts
declare const PermanentRedirect: AnnotatedSchema<S.Literal<308>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L286)

Since v0.0.0

## PermanentRedirect (type alias)

{@inheritDoc PermanentRedirect}

**Signature**

```ts
type PermanentRedirect = typeof PermanentRedirect.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L300)

Since v0.0.0

## SeeOther

303 “See Other” – The server instructs the client that it found the
resource, but it has to be retrieved on another URL with a GET request.

**Example**

```ts
import { SeeOther } from "@beep/schema/HttpStatus"

console.log(SeeOther.literal)
```

**Signature**

```ts
declare const SeeOther: AnnotatedSchema<S.Literal<303>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L129)

Since v0.0.0

## SeeOther (type alias)

{@inheritDoc SeeOther}

**Signature**

```ts
type SeeOther = typeof SeeOther.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L143)

Since v0.0.0

## SwitchProxy

306 “Switch Proxy” – This code is no longer in use. It means that the
following requests should use the specified proxy.

**Example**

```ts
import { SwitchProxy } from "@beep/schema/HttpStatus"

console.log(SwitchProxy.literal)
```

**Signature**

```ts
declare const SwitchProxy: AnnotatedSchema<S.Literal<306>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L221)

Since v0.0.0

## SwitchProxy (type alias)

{@inheritDoc SwitchProxy}

**Signature**

```ts
type SwitchProxy = typeof SwitchProxy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L235)

Since v0.0.0

## TemporaryRedirect

307 “Temporary redirect” – This is the new code for temporary redirects that
replaced the HTTP 302 code. It specifies that the requested resource has
moved to another URL. Unlike the HTTP 302 code, the HTTP 307 code doesn’t
allow the HTTP method to be changed. For example, if the first request was
GET, the second request should be GET as well.

**Example**

```ts
import { TemporaryRedirect } from "@beep/schema/HttpStatus"

console.log(TemporaryRedirect.literal)
```

**Signature**

```ts
declare const TemporaryRedirect: AnnotatedSchema<S.Literal<307>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L254)

Since v0.0.0

## TemporaryRedirect (type alias)

{@inheritDoc TemporaryRedirect}

**Signature**

```ts
type TemporaryRedirect = typeof TemporaryRedirect.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L268)

Since v0.0.0

## UseProxy

305 “Use Proxy” – The requested resource is available only through a proxy.
This code is now deprecated and browsers disregard it.

**Example**

```ts
import { UseProxy } from "@beep/schema/HttpStatus"

console.log(UseProxy.literal)
```

**Signature**

```ts
declare const UseProxy: AnnotatedSchema<S.Literal<305>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L191)

Since v0.0.0

## UseProxy (type alias)

{@inheritDoc UseProxy}

**Signature**

```ts
type UseProxy = typeof UseProxy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.redirection.ts#L205)

Since v0.0.0