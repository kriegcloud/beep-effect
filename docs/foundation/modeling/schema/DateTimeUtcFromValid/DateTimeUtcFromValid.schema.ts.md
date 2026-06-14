---
title: DateTimeUtcFromValid.schema.ts
nav_order: 46
parent: "@beep/schema"
---

## DateTimeUtcFromValid.schema.ts overview

Schemas for normalizing valid Effect `DateTime.Input` values into `DateTime.Utc`.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [DateTimeInput](#datetimeinput)
  - [DateTimeInputDate](#datetimeinputdate)
  - [DateTimeInputDateTime](#datetimeinputdatetime)
  - [DateTimeInputInstant (class)](#datetimeinputinstant-class)
  - [DateTimeInputInstantWithZone (class)](#datetimeinputinstantwithzone-class)
  - [DateTimeInputKind](#datetimeinputkind)
  - [DateTimeInputNumber](#datetimeinputnumber)
  - [DateTimeInputParts (class)](#datetimeinputparts-class)
  - [DateTimeInputString](#datetimeinputstring)
  - [DateTimeUtcFromValid](#datetimeutcfromvalid)
- [models](#models)
  - [DateTimeInput (type alias)](#datetimeinput-type-alias)
  - [DateTimeInputDate (type alias)](#datetimeinputdate-type-alias)
  - [DateTimeInputDateTime (type alias)](#datetimeinputdatetime-type-alias)
  - [DateTimeInputKind (type alias)](#datetimeinputkind-type-alias)
  - [DateTimeInputNumber (type alias)](#datetimeinputnumber-type-alias)
  - [DateTimeInputString (type alias)](#datetimeinputstring-type-alias)
  - [DateTimeUtcFromValid (type alias)](#datetimeutcfromvalid-type-alias)
---

# constructors

## DateTimeInput

Union of raw and tagged values accepted by `DateTimeUtcFromValid`.

Raw `DateTime.Input` values are supported for decoding. Tagged string,
number, and Date wrappers provide deterministic encoded representations.

**Example**

```ts
import * as S from "effect/Schema"
import { DateTimeInput } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInput)
const input = decode("2024-01-01T00:00:00.000Z")
console.log(input)
```

**Signature**

```ts
declare const DateTimeInput: AnnotatedSchema<S.Union<readonly [S.String & SchemaStatics<S.String> & InputKindStatics<"string", S.String & SchemaStatics<S.String>>, S.TaggedStruct<"string", { readonly value: S.String & SchemaStatics<S.String>; }>, S.Finite & SchemaStatics<S.Finite> & InputKindStatics<"number", S.Finite & SchemaStatics<S.Finite>>, S.TaggedStruct<"number", { readonly value: S.Finite & SchemaStatics<S.Finite>; }>, S.DateValid & SchemaStatics<S.DateValid> & InputKindStatics<"Date", S.DateValid & SchemaStatics<S.DateValid>>, S.TaggedStruct<"Date", { readonly value: S.DateValid & SchemaStatics<S.DateValid>; }>, AnnotatedSchema<S.Union<readonly [S.DateTimeUtc, S.DateTimeZoned]>>, typeof DateTimeInputInstant, typeof DateTimeInputInstantWithZone, typeof DateTimeInputParts]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L416)

Since v0.0.0

## DateTimeInputDate

Valid JavaScript `Date` input accepted by Effect `DateTime.make`.

The schema also exposes a tagged representation for encoded transport.

**Example**

```ts
import * as S from "effect/Schema"
import { DateTimeInputDate } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInputDate)
const value = decode(new Date("2024-01-01T00:00:00.000Z"))
const tagged = DateTimeInputDate.makeTagged(value)
console.log(tagged._tag)
```

**Signature**

```ts
declare const DateTimeInputDate: S.DateValid & SchemaStatics<S.DateValid> & InputKindStatics<"Date", S.DateValid & SchemaStatics<S.DateValid>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L242)

Since v0.0.0

## DateTimeInputDateTime

Existing Effect `DateTime` values accepted by `DateTimeUtcFromValid`.

Zoned values decode to the same instant in UTC.

**Example**

```ts
import * as DateTime from "effect/DateTime"
import * as S from "effect/Schema"
import { DateTimeInputDateTime } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInputDateTime)
const value = decode(DateTime.makeUnsafe("2024-01-01T00:00:00.000Z"))
console.log(DateTime.formatIso(value))
```

**Signature**

```ts
declare const DateTimeInputDateTime: AnnotatedSchema<S.Union<readonly [S.DateTimeUtc, S.DateTimeZoned]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L284)

Since v0.0.0

## DateTimeInputInstant (class)

Tagged Effect `DateTime.Instant` transport value.

**Example**

```ts
import { DateTimeInputInstant } from "@beep/schema/DateTimeUtcFromValid"

const value = new DateTimeInputInstant({ epochMilliseconds: 1_704_067_200_000 })
console.log(value._tag)
```

**Signature**

```ts
declare class DateTimeInputInstant
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L321)

Since v0.0.0

## DateTimeInputInstantWithZone (class)

Tagged Effect `DateTime.InstantWithZone` transport value.

**Example**

```ts
import { DateTimeInputInstantWithZone } from "@beep/schema/DateTimeUtcFromValid"

const value = new DateTimeInputInstantWithZone({
  epochMilliseconds: 1_704_067_200_000,
  timeZoneId: "UTC"
})
console.log(value._tag)
```

**Signature**

```ts
declare class DateTimeInputInstantWithZone
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L348)

Since v0.0.0

## DateTimeInputKind

Literal discriminator values used by tagged date-time input representations.

**Example**

```ts
import * as S from "effect/Schema"
import { DateTimeInputKind } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInputKind)
const kind = decode("Instant")
console.log(kind)
```

**Signature**

```ts
declare const DateTimeInputKind: AnnotatedSchema<LiteralKit<readonly ["number", "string", "Date", "DateTime", "Parts", "Instant", "InstantWithZone"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L34)

Since v0.0.0

## DateTimeInputNumber

Valid numeric epoch-millisecond input accepted by Effect `DateTime.make`.

The schema also exposes a tagged representation used by callers that need a
discriminated transport shape.

**Example**

```ts
import * as S from "effect/Schema"
import { DateTimeInputNumber } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInputNumber)
const value = decode(1_704_067_200_000)
const tagged = DateTimeInputNumber.makeTagged(value)
console.log(tagged._tag)
```

**Signature**

```ts
declare const DateTimeInputNumber: S.Finite & SchemaStatics<S.Finite> & InputKindStatics<"number", S.Finite & SchemaStatics<S.Finite>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L200)

Since v0.0.0

## DateTimeInputParts (class)

Tagged `Partial<DateTime.Parts>` transport value.

Missing fields default the same way Effect `DateTime.make` defaults partial
parts: from the Unix epoch in UTC.

**Example**

```ts
import { DateTimeInputParts } from "@beep/schema/DateTimeUtcFromValid"

const value = new DateTimeInputParts({ year: 2024, month: 1, day: 1 })
console.log(value._tag)
```

**Signature**

```ts
declare class DateTimeInputParts
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L381)

Since v0.0.0

## DateTimeInputString

Valid string input accepted by Effect `DateTime.make`.

The schema also exposes a tagged representation used when encoding through
`DateTimeUtcFromValid`.

**Example**

```ts
import * as S from "effect/Schema"
import { DateTimeInputString } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeInputString)
const value = decode("2024-01-01T00:00:00.000Z")
const tagged = DateTimeInputString.makeTagged(value)
console.log(tagged._tag)
```

**Signature**

```ts
declare const DateTimeInputString: S.String & SchemaStatics<S.String> & InputKindStatics<"string", S.String & SchemaStatics<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L157)

Since v0.0.0

## DateTimeUtcFromValid

Bidirectional schema transformation from valid DateTime input to `DateTime.Utc`.

Decoding accepts raw Effect `DateTime.Input` values and this module's tagged
primitive/object transport values. Encoding produces a canonical tagged ISO
string representation so the encoded value is deterministic.

**Example**

```ts
import * as DateTime from "effect/DateTime"
import * as S from "effect/Schema"
import { DateTimeUtcFromValid } from "@beep/schema/DateTimeUtcFromValid"

const decode = S.decodeUnknownSync(DateTimeUtcFromValid)
const encode = S.encodeSync(DateTimeUtcFromValid)

const utc = decode("2024-01-01T00:00:00.000Z")
const encoded = encode(utc)

console.log(DateTime.formatIso(utc))
console.log(encoded)
```

**Signature**

```ts
declare const DateTimeUtcFromValid: AnnotatedSchema<S.decodeTo<S.DateTimeUtc, S.Union<readonly [S.String & SchemaStatics<S.String> & InputKindStatics<"string", S.String & SchemaStatics<S.String>>, S.TaggedStruct<"string", { readonly value: S.String & SchemaStatics<S.String>; }>, S.Finite & SchemaStatics<S.Finite> & InputKindStatics<"number", S.Finite & SchemaStatics<S.Finite>>, S.TaggedStruct<"number", { readonly value: S.Finite & SchemaStatics<S.Finite>; }>, S.DateValid & SchemaStatics<S.DateValid> & InputKindStatics<"Date", S.DateValid & SchemaStatics<S.DateValid>>, S.TaggedStruct<"Date", { readonly value: S.DateValid & SchemaStatics<S.DateValid>; }>, AnnotatedSchema<S.Union<readonly [S.DateTimeUtc, S.DateTimeZoned]>>, typeof DateTimeInputInstant, typeof DateTimeInputInstantWithZone, typeof DateTimeInputParts]> & SchemaStatics<S.Union<readonly [S.String & SchemaStatics<S.String> & InputKindStatics<"string", S.String & SchemaStatics<S.String>>, S.TaggedStruct<"string", { readonly value: S.String & SchemaStatics<S.String>; }>, S.Finite & SchemaStatics<S.Finite> & InputKindStatics<"number", S.Finite & SchemaStatics<S.Finite>>, S.TaggedStruct<"number", { readonly value: S.Finite & SchemaStatics<S.Finite>; }>, S.DateValid & SchemaStatics<S.DateValid> & InputKindStatics<"Date", S.DateValid & SchemaStatics<S.DateValid>>, S.TaggedStruct<"Date", { readonly value: S.DateValid & SchemaStatics<S.DateValid>; }>, AnnotatedSchema<S.Union<readonly [S.DateTimeUtc, S.DateTimeZoned]>>, typeof DateTimeInputInstant, typeof DateTimeInputInstantWithZone, typeof DateTimeInputParts]>>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L510)

Since v0.0.0

# models

## DateTimeInput (type alias)

{@inheritDoc DateTimeInput}

**Example**

```ts
import type { DateTimeInput } from "@beep/schema/DateTimeUtcFromValid"

const input: DateTimeInput = "2024-01-01T00:00:00.000Z"
console.log(input)
```

**Signature**

```ts
type DateTimeInput = typeof DateTimeInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L447)

Since v0.0.0

## DateTimeInputDate (type alias)

{@inheritDoc DateTimeInputDate}

**Example**

```ts
import type { DateTimeInputDate } from "@beep/schema/DateTimeUtcFromValid"

const value: DateTimeInputDate = new Date("2024-01-01T00:00:00.000Z")
console.log(value.toISOString())
```

**Signature**

```ts
type DateTimeInputDate = typeof DateTimeInputDate.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L263)

Since v0.0.0

## DateTimeInputDateTime (type alias)

{@inheritDoc DateTimeInputDateTime}

**Example**

```ts
import * as DateTime from "effect/DateTime"
import type { DateTimeInputDateTime } from "@beep/schema/DateTimeUtcFromValid"

const value: DateTimeInputDateTime = DateTime.makeUnsafe("2024-01-01T00:00:00.000Z")
console.log(DateTime.formatIso(value))
```

**Signature**

```ts
type DateTimeInputDateTime = typeof DateTimeInputDateTime.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L305)

Since v0.0.0

## DateTimeInputKind (type alias)

{@inheritDoc DateTimeInputKind}

**Example**

```ts
import type { DateTimeInputKind } from "@beep/schema/DateTimeUtcFromValid"

const kind: DateTimeInputKind = "string"
console.log(kind)
```

**Signature**

```ts
type DateTimeInputKind = typeof DateTimeInputKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L62)

Since v0.0.0

## DateTimeInputNumber (type alias)

{@inheritDoc DateTimeInputNumber}

**Example**

```ts
import type { DateTimeInputNumber } from "@beep/schema/DateTimeUtcFromValid"

const value: DateTimeInputNumber = 1_704_067_200_000
console.log(value)
```

**Signature**

```ts
type DateTimeInputNumber = typeof DateTimeInputNumber.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L221)

Since v0.0.0

## DateTimeInputString (type alias)

{@inheritDoc DateTimeInputString}

**Example**

```ts
import type { DateTimeInputString } from "@beep/schema/DateTimeUtcFromValid"

const value: DateTimeInputString = "2024-01-01T00:00:00.000Z"
console.log(value)
```

**Signature**

```ts
type DateTimeInputString = typeof DateTimeInputString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L178)

Since v0.0.0

## DateTimeUtcFromValid (type alias)

{@inheritDoc DateTimeUtcFromValid}

**Example**

```ts
import * as DateTime from "effect/DateTime"
import type { DateTimeUtcFromValid } from "@beep/schema/DateTimeUtcFromValid"

const utc: DateTimeUtcFromValid = DateTime.makeUnsafe("2024-01-01T00:00:00.000Z")
console.log(DateTime.formatIso(utc))
```

**Signature**

```ts
type DateTimeUtcFromValid = typeof DateTimeUtcFromValid.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DateTimeUtcFromValid/DateTimeUtcFromValid.schema.ts#L538)

Since v0.0.0