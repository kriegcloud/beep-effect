---
title: Timestamp.schema.ts
nav_order: 212
parent: "@beep/schema"
---

## Timestamp.schema.ts overview

UTC timestamp value objects, branded ISO string schemas, and epoch-millisecond schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [EPOCH](#epoch)
  - [EpochMillis](#epochmillis)
  - [ISOStr](#isostr)
  - [Timestamp (class)](#timestamp-class)
    - [toDateTime (property)](#todatetime-property)
    - [toDate (property)](#todate-property)
    - [toISOStr (property)](#toisostr-property)
    - [toStr (property)](#tostr-property)
    - [toLocalDate (property)](#tolocaldate-property)
  - [ToIsoStr](#toisostr)
  - [fromDate](#fromdate)
  - [fromDateTime](#fromdatetime)
  - [fromString](#fromstring)
  - [now](#now)
  - [nowEffect](#noweffect)
- [guards](#guards)
  - [isTimestamp](#istimestamp)
- [models](#models)
  - [EpochMillis (type alias)](#epochmillis-type-alias)
  - [ISOStr (type alias)](#isostr-type-alias)
  - [ToIsoStr (namespace)](#toisostr-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [ToIsoString (type alias)](#toisostring-type-alias)
- [predicates](#predicates)
  - [equals](#equals)
  - [isAfter](#isafter)
  - [isBefore](#isbefore)
- [utilities](#utilities)
  - [Order](#order)
  - [addDays](#adddays)
  - [addHours](#addhours)
  - [addMillis](#addmillis)
  - [addMinutes](#addminutes)
  - [addSeconds](#addseconds)
  - [diffInMillis](#diffinmillis)
  - [diffInSeconds](#diffinseconds)
  - [max](#max)
  - [min](#min)
---

# constructors

## EPOCH

The Unix epoch timestamp representing `1970-01-01T00:00:00.000Z`.

**Example**

```ts
import { EPOCH } from "@beep/schema/Timestamp"

console.log(EPOCH.toISOStr())
```

**Signature**

```ts
declare const EPOCH: Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L651)

Since v0.0.0

## EpochMillis

Branded positive integer schema for epoch milliseconds since 1970-01-01T00:00:00.000Z.

**Example**

```ts
import * as S from "effect/Schema"
import { EpochMillis } from "@beep/schema/Timestamp"

const decode = S.decodeUnknownSync(EpochMillis)

const millis = decode(1704067200000)
console.log(millis)
```

**Signature**

```ts
declare const EpochMillis: AnnotatedSchema<Schema.brand<Schema.brand<Schema.brand<Schema.Int, "Int">, "PosInt">, "EpochMillis">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L85)

Since v0.0.0

## ISOStr

Branded ISO 8601 datetime string schema.

Accepts a non-empty trimmed string that can be parsed as a valid `DateTime`.

**Example**

```ts
import * as S from "effect/Schema"
import { ISOStr } from "@beep/schema/Timestamp"

const decode = S.decodeUnknownSync(ISOStr)

const iso = decode("2024-01-01T00:00:00.000Z")
console.log(iso)
```

**Signature**

```ts
declare const ISOStr: AnnotatedSchema<Schema.brand<Schema.brand<Schema.Trim, "NonEmptyTrimmedStr">, "ISOStr">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L45)

Since v0.0.0

## Timestamp (class)

Schema class wrapping `DateTime.Utc` as epoch milliseconds.

Provides conversions to `DateTime.Utc`, `Date`, `ISOStr`, and `LocalDate`.

**Example**

```ts
import { Timestamp } from "@beep/schema/Timestamp"

const ts = Timestamp.make({ epochMillis: 1704067200000 })

console.log(ts.toISOStr())
console.log(ts.toLocalDate().toISOString())
```

**Example**

```ts
import { Timestamp, now, isBefore } from "@beep/schema/Timestamp"

const a = now()
const b = Timestamp.make({ epochMillis: 0 })

console.log(isBefore(b, a)) // true
```

**Signature**

```ts
declare class Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L208)

Since v0.0.0

### toDateTime (property)

Get the underlying DateTime.Utc instance

**Signature**

```ts
readonly toDateTime: () => DateTime.Utc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L224)

Since v0.0.0

### toDate (property)

Convert to JavaScript Date

**Signature**

```ts
readonly toDate: () => Date
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L232)

Since v0.0.0

### toISOStr (property)

Convert this timestamp to a branded ISO 8601 string without fractional seconds.

**Signature**

```ts
readonly toISOStr: () => Brand.Branded<Brand.Branded<string, "NonEmptyTrimmedStr">, "ISOStr">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L240)

Since v0.0.0

### toStr (property)

Convert to string representation

**Signature**

```ts
readonly toStr: () => ISOStr
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L251)

Since v0.0.0

### toLocalDate (property)

Extract the LocalDate portion (UTC date)

**Signature**

```ts
readonly toLocalDate: () => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L259)

Since v0.0.0

## ToIsoStr

Schema that normalizes numeric timestamps or ISO strings into ISO strings without fractional seconds.

**Example**

```ts
import * as S from "effect/Schema"
import { ToIsoStr } from "@beep/schema/Timestamp"

const decode = S.decodeUnknownSync(ToIsoStr)

const iso = decode("2024-01-01T00:00:00.123Z")
console.log(iso) // "2024-01-01T00:00:00Z"
```

**Signature**

```ts
declare const ToIsoStr: AnnotatedSchema<Schema.decodeTo<AnnotatedSchema<Schema.brand<Schema.brand<Schema.Trim, "NonEmptyTrimmedStr">, "ISOStr">>, Schema.Union<readonly [AnnotatedSchema<Schema.brand<Schema.brand<Schema.Trim, "NonEmptyTrimmedStr">, "ISOStr">>, Schema.Finite]>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L126)

Since v0.0.0

## fromDate

Create a `Timestamp` from a JavaScript `Date`.

**Example**

```ts
import { fromDate } from "@beep/schema/Timestamp"

const timestamp = fromDate(new Date("2024-01-01T00:00:00Z"))
console.log(timestamp.toISOStr())
```

**Signature**

```ts
declare const fromDate: (date: Date) => Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L317)

Since v0.0.0

## fromDateTime

Create a `Timestamp` from a `DateTime.Utc`.

**Example**

```ts
import { DateTime } from "effect"
import { fromDateTime } from "@beep/schema/Timestamp"

const timestamp = fromDateTime(DateTime.makeUnsafe("2024-01-01T00:00:00Z"))
console.log(timestamp.epochMillis)
```

**Signature**

```ts
declare const fromDateTime: (dateTime: DateTime.Utc) => Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L300)

Since v0.0.0

## fromString

Create a `Timestamp` from an ISO 8601 string, returning an `Effect` that fails for invalid input.

**Example**

```ts
import { Effect } from "effect"
import { fromString } from "@beep/schema/Timestamp"

const program = fromString("2024-01-01T00:00:00Z")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const fromString: (dateString: string) => Effect.Effect<Timestamp, SchemaIssue.InvalidValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L336)

Since v0.0.0

## now

Create a `Timestamp` for the current wall-clock time.

**Example**

```ts
import { now } from "@beep/schema/Timestamp"

const timestamp = now()
console.log(timestamp.epochMillis > 0)
```

**Signature**

```ts
declare const now: () => Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L359)

Since v0.0.0

## nowEffect

Get the current timestamp as an `Effect` using the Clock service, testable with `TestClock`.

**Example**

```ts
import { Effect } from "effect"
import { nowEffect } from "@beep/schema/Timestamp"

console.log(Effect.runPromise(nowEffect))
```

**Signature**

```ts
declare const nowEffect: Effect.Effect<Timestamp, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L377)

Since v0.0.0

# guards

## isTimestamp

Type guard for `Timestamp` instances.

**Example**

```ts
import { Timestamp, isTimestamp } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1704067200000 })
console.log(isTimestamp(timestamp))
```

**Signature**

```ts
declare const isTimestamp: <I>(input: I) => input is I & Timestamp
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L283)

Since v0.0.0

# models

## EpochMillis (type alias)

Branded epoch milliseconds type extracted from `EpochMillis`.

**Example**

```ts
import type { EpochMillis } from "@beep/schema/Timestamp"

const millis = 1704067200000 as EpochMillis
console.log(millis)
```

**Signature**

```ts
type EpochMillis = typeof EpochMillis.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L107)

Since v0.0.0

## ISOStr (type alias)

Branded ISO string type extracted from `ISOStr`.

**Example**

```ts
import type { ISOStr } from "@beep/schema/Timestamp"

const iso = "2024-01-01T00:00:00Z" as ISOStr
console.log(iso)
```

**Signature**

```ts
type ISOStr = typeof ISOStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L66)

Since v0.0.0

## ToIsoStr (namespace)

Namespace members for `ToIsoStr`.

**Example**

```ts
import type { ToIsoStr } from "@beep/schema/Timestamp"

type EncodedTimestamp = ToIsoStr.Encoded
console.log({} as { encoded: EncodedTimestamp })
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L170)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `ToIsoStr` (string or number union).

**Signature**

```ts
type Encoded = typeof ToIsoStr.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L177)

Since v0.0.0

## ToIsoString (type alias)

Normalized ISO string type extracted from `ToIsoStr`.

**Example**

```ts
import type { ToIsoString } from "@beep/schema/Timestamp"

const iso = "2024-01-01T00:00:00Z" as ToIsoString
console.log(iso)
```

**Signature**

```ts
type ToIsoString = typeof ToIsoStr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L154)

Since v0.0.0

# predicates

## equals

Check whether two timestamps represent the same point in time.

**Example**

```ts
import { Timestamp, equals } from "@beep/schema/Timestamp"

const a = Timestamp.make({ epochMillis: 1 })
const b = Timestamp.make({ epochMillis: 1 })
console.log(equals(a, b))
```

**Signature**

```ts
declare const equals: { (that: Timestamp): (self: Timestamp) => boolean; (self: Timestamp, that: Timestamp): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L458)

Since v0.0.0

## isAfter

Dual predicate returning `true` when `self` is chronologically after `that`.

**Example**

```ts
import { Timestamp, isAfter } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2 })
console.log(isAfter(later, earlier))
```

**Signature**

```ts
declare const isAfter: { (that: Timestamp): (self: Timestamp) => boolean; (self: Timestamp, that: Timestamp): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L438)

Since v0.0.0

## isBefore

Dual predicate returning `true` when `self` is chronologically before `that`.

**Example**

```ts
import { Timestamp, isBefore } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2 })
console.log(isBefore(earlier, later))
```

**Signature**

```ts
declare const isBefore: { (that: Timestamp): (self: Timestamp) => boolean; (self: Timestamp, that: Timestamp): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L418)

Since v0.0.0

# utilities

## Order

Chronological `Order` for `Timestamp` values.

**Example**

```ts
import { Timestamp, Order } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2 })
console.log(Order(earlier, later))
```

**Signature**

```ts
declare const Order: Order_.Order<Timestamp>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L397)

Since v0.0.0

## addDays

Add days to a timestamp.

**Example**

```ts
import { Timestamp, addDays } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1 })
console.log(addDays(timestamp, 1).epochMillis)
```

**Signature**

```ts
declare const addDays: { (days: number): (self: Timestamp) => Timestamp; (self: Timestamp, days: number): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L553)

Since v0.0.0

## addHours

Add hours to a timestamp.

**Example**

```ts
import { Timestamp, addHours } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1 })
console.log(addHours(timestamp, 1).epochMillis)
```

**Signature**

```ts
declare const addHours: { (hours: number): (self: Timestamp) => Timestamp; (self: Timestamp, hours: number): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L534)

Since v0.0.0

## addMillis

Add milliseconds to a timestamp.

**Example**

```ts
import { Timestamp, addMillis } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1 })
console.log(addMillis(timestamp, 999).epochMillis)
```

**Signature**

```ts
declare const addMillis: { (millis: number): (self: Timestamp) => Timestamp; (self: Timestamp, millis: number): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L477)

Since v0.0.0

## addMinutes

Add minutes to a timestamp.

**Example**

```ts
import { Timestamp, addMinutes } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1 })
console.log(addMinutes(timestamp, 1).epochMillis)
```

**Signature**

```ts
declare const addMinutes: { (minutes: number): (self: Timestamp) => Timestamp; (self: Timestamp, minutes: number): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L515)

Since v0.0.0

## addSeconds

Add seconds to a timestamp.

**Example**

```ts
import { Timestamp, addSeconds } from "@beep/schema/Timestamp"

const timestamp = Timestamp.make({ epochMillis: 1 })
console.log(addSeconds(timestamp, 1).epochMillis)
```

**Signature**

```ts
declare const addSeconds: { (seconds: number): (self: Timestamp) => Timestamp; (self: Timestamp, seconds: number): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L496)

Since v0.0.0

## diffInMillis

Get the difference in milliseconds between two timestamps.

**Example**

```ts
import { Timestamp, diffInMillis } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 1001 })
console.log(diffInMillis(later, earlier))
```

**Signature**

```ts
declare const diffInMillis: { (that: Timestamp): (self: Timestamp) => number; (self: Timestamp, that: Timestamp): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L573)

Since v0.0.0

## diffInSeconds

Get the difference in seconds between two timestamps.

**Example**

```ts
import { Timestamp, diffInSeconds } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2001 })
console.log(diffInSeconds(later, earlier))
```

**Signature**

```ts
declare const diffInSeconds: { (that: Timestamp): (self: Timestamp) => number; (self: Timestamp, that: Timestamp): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L593)

Since v0.0.0

## max

Get the maximum of two timestamps.

**Example**

```ts
import { Timestamp, max } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2 })
console.log(max(earlier, later).epochMillis)
```

**Signature**

```ts
declare const max: { (that: Timestamp): (self: Timestamp) => Timestamp; (self: Timestamp, that: Timestamp): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L633)

Since v0.0.0

## min

Get the minimum of two timestamps.

**Example**

```ts
import { Timestamp, min } from "@beep/schema/Timestamp"

const earlier = Timestamp.make({ epochMillis: 1 })
const later = Timestamp.make({ epochMillis: 2 })
console.log(min(earlier, later).epochMillis)
```

**Signature**

```ts
declare const min: { (that: Timestamp): (self: Timestamp) => Timestamp; (self: Timestamp, that: Timestamp): Timestamp; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts#L613)

Since v0.0.0