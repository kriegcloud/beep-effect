---
title: HttpStatus.informational.ts
nav_order: 125
parent: "@beep/schema"
---

## HttpStatus.informational.ts overview

Informational HTTP status schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [Continue](#continue)
  - [Continue (type alias)](#continue-type-alias)
  - [EarlyHints](#earlyhints)
  - [EarlyHints (type alias)](#earlyhints-type-alias)
  - [HttpStatus1XX](#httpstatus1xx)
  - [HttpStatus1XX (type alias)](#httpstatus1xx-type-alias)
  - [HttpStatus1XX (namespace)](#httpstatus1xx-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [Processing](#processing)
  - [Processing (type alias)](#processing-type-alias)
  - [SwitchingProtocols](#switchingprotocols)
  - [SwitchingProtocols (type alias)](#switchingprotocols-type-alias)
---

# validation

## Continue

100 “Continue” – The server has received the headers of the request.
It now tells your browser to proceed with sending the body of the request.

**Example**

```ts
import { Continue } from "@beep/schema/HttpStatus"

console.log(Continue.literal)
```

**Signature**

```ts
declare const Continue: AnnotatedSchema<S.Literal<100>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L30)

Since v0.0.0

## Continue (type alias)

{@inheritDoc Continue}

**Signature**

```ts
type Continue = typeof Continue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L44)

Since v0.0.0

## EarlyHints

103 “Early Hints” – The server returns some response headers before the
final HTTP response is sent.

**Example**

```ts
import { EarlyHints } from "@beep/schema/HttpStatus"

console.log(EarlyHints.literal)
```

**Signature**

```ts
declare const EarlyHints: AnnotatedSchema<S.Literal<103>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L121)

Since v0.0.0

## EarlyHints (type alias)

{@inheritDoc EarlyHints}

**Signature**

```ts
type EarlyHints = typeof EarlyHints.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L135)

Since v0.0.0

## HttpStatus1XX

1XX codes are informational responses from the website’s server. They do not
generate content and only update clients on the progress of their requests.
This information is sent in the headers of the HTTP response.

**Example**

```ts
import { HttpStatus1XX } from "@beep/schema/HttpStatus"

console.log(HttpStatus1XX.Pairs.length)
```

**Signature**

```ts
declare const HttpStatus1XX: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["Continue", 100], readonly ["SwitchingProtocols", 101], readonly ["Processing", 102], readonly ["EarlyHints", 103]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L152)

Since v0.0.0

## HttpStatus1XX (type alias)

{@inheritDoc HttpStatus1XX}

**Signature**

```ts
type HttpStatus1XX = typeof HttpStatus1XX.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L186)

Since v0.0.0

## HttpStatus1XX (namespace)

A namespace for `HttpStatus1XX` to contain the Encoded type

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L170)

Since v0.0.0

### Encoded (type alias)

The encoded type of `HttpStatus1XX`

**Signature**

```ts
type Encoded = typeof HttpStatus1XX.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L177)

Since v0.0.0

## Processing

102 “Processing” – This is a response mainly associated with WebDAV
requests, which may take a longer time to be completed. It indicates that
the server has received the request and is currently processing it.

**Example**

```ts
import { Processing } from "@beep/schema/HttpStatus"

console.log(Processing.literal)
```

**Signature**

```ts
declare const Processing: AnnotatedSchema<S.Literal<102>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L91)

Since v0.0.0

## Processing (type alias)

{@inheritDoc Processing}

**Signature**

```ts
type Processing = typeof Processing.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L105)

Since v0.0.0

## SwitchingProtocols

101 “Switching Protocols” – The requesting client (browser) asked the server to
change the protocols, and the server fulfilled the request.

**Example**

```ts
import { SwitchingProtocols } from "@beep/schema/HttpStatus"

console.log(SwitchingProtocols.literal)
```

**Signature**

```ts
declare const SwitchingProtocols: AnnotatedSchema<S.Literal<101>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L60)

Since v0.0.0

## SwitchingProtocols (type alias)

{@inheritDoc SwitchingProtocols}

**Signature**

```ts
type SwitchingProtocols = typeof SwitchingProtocols.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.informational.ts#L74)

Since v0.0.0