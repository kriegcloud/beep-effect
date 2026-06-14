---
title: HttpStatus.client-error.resource.ts
nav_order: 123
parent: "@beep/schema"
---

## HttpStatus.client-error.resource.ts overview

Resource client-error HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [ExpectationFailed](#expectationfailed)
  - [ExpectationFailed (type alias)](#expectationfailed-type-alias)
  - [Gone](#gone)
  - [Gone (type alias)](#gone-type-alias)
  - [ImATeapot](#imateapot)
  - [ImATeapot (type alias)](#imateapot-type-alias)
  - [LengthRequired](#lengthrequired)
  - [LengthRequired (type alias)](#lengthrequired-type-alias)
  - [PayloadTooLarge](#payloadtoolarge)
  - [PayloadTooLarge (type alias)](#payloadtoolarge-type-alias)
  - [PreconditionFailed](#preconditionfailed)
  - [PreconditionFailed (type alias)](#preconditionfailed-type-alias)
  - [RangeNotSatisfiable](#rangenotsatisfiable)
  - [RangeNotSatisfiable (type alias)](#rangenotsatisfiable-type-alias)
  - [UnsupportedMediaType](#unsupportedmediatype)
  - [UnsupportedMediaType (type alias)](#unsupportedmediatype-type-alias)
  - [UriTooLong](#uritoolong)
  - [UriTooLong (type alias)](#uritoolong-type-alias)
---

# validation

## ExpectationFailed

417 “Expectation Failed” – The server fails to meet the requirements set in
the request’s expected header field.

**Example**

```ts
import { ExpectationFailed } from "@beep/schema/HttpStatus"

console.log(ExpectationFailed.literal)
```

**Signature**

```ts
declare const ExpectationFailed: AnnotatedSchema<S.Literal<417>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L245)

Since v0.0.0

## ExpectationFailed (type alias)

{@inheritDoc ExpectationFailed}

**Signature**

```ts
type ExpectationFailed = typeof ExpectationFailed.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L259)

Since v0.0.0

## Gone

410 “Gone” – The requested resource is not available and will not be
available in the future. It is not replaced with a new resource on a new
address so clients are expected to remove any links and cache related to the
resource. For example, search engines should remove the resource’s
information from their databases.

**Example**

```ts
import { Gone } from "@beep/schema/HttpStatus"

console.log(Gone.literal)
```

**Signature**

```ts
declare const Gone: AnnotatedSchema<S.Literal<410>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L28)

Since v0.0.0

## Gone (type alias)

{@inheritDoc Gone}

**Signature**

```ts
type Gone = typeof Gone.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L42)

Since v0.0.0

## ImATeapot

418 “I’m a teapot.” – This error is returned by teapots requested to brew
coffee. It is an April’s Fool joke dating back to 1998.

**Example**

```ts
import { ImATeapot } from "@beep/schema/HttpStatus"

console.log(ImATeapot.literal)
```

**Signature**

```ts
declare const ImATeapot: AnnotatedSchema<S.Literal<418>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L275)

Since v0.0.0

## ImATeapot (type alias)

{@inheritDoc ImATeapot}

**Signature**

```ts
type ImATeapot = typeof ImATeapot.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L289)

Since v0.0.0

## LengthRequired

411 “Length Required” – The length of the request’s content is not specified
and the resource on the server requires it.

**Example**

```ts
import { LengthRequired } from "@beep/schema/HttpStatus"

console.log(LengthRequired.literal)
```

**Signature**

```ts
declare const LengthRequired: AnnotatedSchema<S.Literal<411>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L58)

Since v0.0.0

## LengthRequired (type alias)

{@inheritDoc LengthRequired}

**Signature**

```ts
type LengthRequired = typeof LengthRequired.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L72)

Since v0.0.0

## PayloadTooLarge

413 “Payload too large” – The request is larger than the limits specified on
the server, thus the server can not process the request.
You may see this error on your WordPress site when you try to upload a file
and its size exceeds the upload limit of your website. If you encounter this
problem, read this guide about the “413 Entity Too Large” Error in
WordPress.

**Example**

```ts
import { PayloadTooLarge } from "@beep/schema/HttpStatus"

console.log(PayloadTooLarge.literal)
```

**Signature**

```ts
declare const PayloadTooLarge: AnnotatedSchema<S.Literal<413>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L122)

Since v0.0.0

## PayloadTooLarge (type alias)

{@inheritDoc PayloadTooLarge}

**Signature**

```ts
type PayloadTooLarge = typeof PayloadTooLarge.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L136)

Since v0.0.0

## PreconditionFailed

412 “Precondition failed” – The headers of the request specify certain
preconditions that the server fails to meet.

**Example**

```ts
import { PreconditionFailed } from "@beep/schema/HttpStatus"

console.log(PreconditionFailed.literal)
```

**Signature**

```ts
declare const PreconditionFailed: AnnotatedSchema<S.Literal<412>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L88)

Since v0.0.0

## PreconditionFailed (type alias)

{@inheritDoc PreconditionFailed}

**Signature**

```ts
type PreconditionFailed = typeof PreconditionFailed.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L102)

Since v0.0.0

## RangeNotSatisfiable

416 “Range Not Satisfiable” – The request asked for a portion of the
resource that the server can’t provide. This error can occur when your
browser asks for a portion of a file that is outside of the end of the file.

**Example**

```ts
import { RangeNotSatisfiable } from "@beep/schema/HttpStatus"

console.log(RangeNotSatisfiable.literal)
```

**Signature**

```ts
declare const RangeNotSatisfiable: AnnotatedSchema<S.Literal<416>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L215)

Since v0.0.0

## RangeNotSatisfiable (type alias)

{@inheritDoc RangeNotSatisfiable}

**Signature**

```ts
type RangeNotSatisfiable = typeof RangeNotSatisfiable.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L229)

Since v0.0.0

## UnsupportedMediaType

415 “Unsupported Media Type” – The request contains a media type that the
server doesn’t support. For instance, you try to upload an image file in
.jpg format, but the server doesn’t support it.

**Example**

```ts
import { UnsupportedMediaType } from "@beep/schema/HttpStatus"

console.log(UnsupportedMediaType.literal)
```

**Signature**

```ts
declare const UnsupportedMediaType: AnnotatedSchema<S.Literal<415>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L184)

Since v0.0.0

## UnsupportedMediaType (type alias)

{@inheritDoc UnsupportedMediaType}

**Signature**

```ts
type UnsupportedMediaType = typeof UnsupportedMediaType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L198)

Since v0.0.0

## UriTooLong

414 “URI Too Long” – The length of the URI is too long and the server can’t
process it. Usually, this is the result of a GET request containing too much
data and therefore must be changed to a POST request.

**Example**

```ts
import { UriTooLong } from "@beep/schema/HttpStatus"

console.log(UriTooLong.literal)
```

**Signature**

```ts
declare const UriTooLong: AnnotatedSchema<S.Literal<414>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L153)

Since v0.0.0

## UriTooLong (type alias)

{@inheritDoc UriTooLong}

**Signature**

```ts
type UriTooLong = typeof UriTooLong.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.client-error.resource.ts#L167)

Since v0.0.0