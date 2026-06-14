---
title: LocalDate.schema.ts
nav_order: 144
parent: "@beep/schema"
---

## LocalDate.schema.ts overview

LocalDate - Date without timezone value object

Represents a calendar date (year, month, day) without time or timezone information.
Uses Effect's DateTime.Utc internally but only represents the date portion.
Encodes to/from ISO 8601 date strings (YYYY-MM-DD format).

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [addDays](#adddays)
  - [addMonths](#addmonths)
  - [addYears](#addyears)
- [constructors](#constructors)
  - [LocalDate (class)](#localdate-class)
    - [toISOString (method)](#toisostring-method)
    - [[Equal.symbol] (method)](#equalsymbol-method)
    - [[Hash.symbol] (method)](#hashsymbol-method)
    - [toDateTime (method)](#todatetime-method)
    - [toString (property)](#tostring-property)
    - [toDate (property)](#todate-property)
  - [LocalDateFromString](#localdatefromstring)
  - [fromDate](#fromdate)
  - [fromDateTime](#fromdatetime)
  - [fromString](#fromstring)
  - [today](#today)
  - [todayEffect](#todayeffect)
- [guards](#guards)
  - [isLocalDate](#islocaldate)
- [models](#models)
  - [LocalDateFromString (type alias)](#localdatefromstring-type-alias)
  - [LocalDateFromString (namespace)](#localdatefromstring-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
- [predicates](#predicates)
  - [equals](#equals)
  - [isAfter](#isafter)
  - [isBefore](#isbefore)
  - [isLeapYear](#isleapyear)
- [utilities](#utilities)
  - [Order](#order)
  - [daysInMonth](#daysinmonth)
  - [diffInDays](#diffindays)
  - [endOfMonth](#endofmonth)
  - [endOfYear](#endofyear)
  - [startOfMonth](#startofmonth)
  - [startOfYear](#startofyear)
---

# combinators

## addDays

Add days to a `LocalDate`.

**Example**

```ts
import { LocalDate, addDays } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(addDays(date, 1).toISOString())
```

**Signature**

```ts
declare const addDays: { (days: number): (self: LocalDate) => LocalDate; (self: LocalDate, days: number): LocalDate; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L429)

Since v0.0.0

## addMonths

Add months to a `LocalDate`.

**Example**

```ts
import { LocalDate, addMonths } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(addMonths(date, 1).toISOString())
```

**Signature**

```ts
declare const addMonths: { (months: number): (self: LocalDate) => LocalDate; (self: LocalDate, months: number): LocalDate; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L452)

Since v0.0.0

## addYears

Add years to a `LocalDate`.

**Example**

```ts
import { LocalDate, addYears } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(addYears(date, 1).toISOString())
```

**Signature**

```ts
declare const addYears: { (years: number): (self: LocalDate) => LocalDate; (self: LocalDate, years: number): LocalDate; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L475)

Since v0.0.0

# constructors

## LocalDate (class)

Schema class representing a calendar date without time or timezone.

Stores year (1-9999), month (1-12), and day (1-31) as integers.

**Example**

```ts
import { LocalDate } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })

console.log(date.toISOString()) // "2024-06-15"
console.log(date.toDateTime())
```

**Signature**

```ts
declare class LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L51)

Since v0.0.0

### toISOString (method)

Format as ISO 8601 date string (YYYY-MM-DD)

**Signature**

```ts
declare const toISOString: () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L69)

### [Equal.symbol] (method)

Value equality for LocalDate instances.

**Signature**

```ts
declare const [Equal.symbol]: (that: Equal.Equal) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L86)

### [Hash.symbol] (method)

Stable hash based on the ISO date representation.

**Signature**

```ts
declare const [Hash.symbol]: () => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L93)

### toDateTime (method)

Convert to Effect DateTime.Utc at midnight UTC

**Signature**

```ts
declare const toDateTime: () => DateTime.Utc
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L102)

### toString (property)

Convert to string representation

**Signature**

```ts
readonly toString: () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L81)

### toDate (property)

Convert to JavaScript Date at midnight UTC

**Signature**

```ts
readonly toDate: () => Date
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L115)

## LocalDateFromString

Schema that transforms ISO 8601 date strings (`YYYY-MM-DD`) into `LocalDate` instances.

This schema can be used directly in API URL params, request bodies, and database columns
to automatically parse date strings into LocalDate instances.

**Example**

```ts
import * as S from "effect/Schema";
import { LocalDateFromString } from "@beep/schema/LocalDate";

const decodeLocalDate = S.decodeUnknownSync(LocalDateFromString);
const encodeLocalDate = S.encodeSync(LocalDateFromString);

const date = decodeLocalDate("2024-06-15");
const str = encodeLocalDate(date);

console.log(str); // "2024-06-15"
```

**Signature**

```ts
declare const LocalDateFromString: AnnotatedSchema<S.decodeTo<typeof LocalDate, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L650)

Since v0.0.0

## fromDate

Create a `LocalDate` from a JavaScript `Date` using its UTC components.

**Example**

```ts
import { fromDate } from "@beep/schema/LocalDate"

const date = fromDate(new Date("2024-06-15T10:30:00Z"))
console.log(date.toISOString())
```

**Signature**

```ts
declare const fromDate: (date: Date) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L258)

Since v0.0.0

## fromDateTime

Create a `LocalDate` from a `DateTime` by extracting its UTC date components.

**Example**

```ts
import { DateTime } from "effect"
import { fromDateTime } from "@beep/schema/LocalDate"

const date = fromDateTime(DateTime.makeUnsafe("2024-06-15T10:30:00Z"))
console.log(date.toISOString())
```

**Signature**

```ts
declare const fromDateTime: (dateTime: DateTime.DateTime) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L318)

Since v0.0.0

## fromString

Parse a `YYYY-MM-DD` string into a `LocalDate`, returning an `Effect` that fails for invalid input.

**Example**

```ts
import { Effect } from "effect"
import { fromString } from "@beep/schema/LocalDate"

const program = fromString("2024-06-15")
console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const fromString: (dateString: string) => Effect.Effect<LocalDate, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L227)

Since v0.0.0

## today

Get today's date in UTC.

**Example**

```ts
import { today } from "@beep/schema/LocalDate"

const date = today()
console.log(date.year > 0)
```

**Signature**

```ts
declare const today: () => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L280)

Since v0.0.0

## todayEffect

Get today's UTC date as an `Effect` using the Clock service, testable with `TestClock`.

**Example**

```ts
import { Effect } from "effect"
import { todayEffect } from "@beep/schema/LocalDate"

console.log(Effect.runPromise(todayEffect))
```

**Signature**

```ts
declare const todayEffect: Effect.Effect<LocalDate, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L298)

Since v0.0.0

# guards

## isLocalDate

Type guard for `LocalDate` instances.

**Example**

```ts
import { LocalDate, isLocalDate } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(isLocalDate(date))
```

**Signature**

```ts
declare const isLocalDate: <I>(input: I) => input is I & LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L132)

Since v0.0.0

# models

## LocalDateFromString (type alias)

Decoded `LocalDate` type extracted from `LocalDateFromString`.

**Example**

```ts
import type { LocalDateFromString } from "@beep/schema/LocalDate"

console.log({} as { date: LocalDateFromString })
```

**Signature**

```ts
type LocalDateFromString = typeof LocalDateFromString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L675)

Since v0.0.0

## LocalDateFromString (namespace)

Namespace members for `LocalDateFromString`.

**Example**

```ts
import type { LocalDateFromString } from "@beep/schema/LocalDate"

type EncodedLocalDate = LocalDateFromString.Encoded
console.log({} as { encoded: EncodedLocalDate })
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L691)

Since v0.0.0

### Encoded (type alias)

Encoded string representation (`YYYY-MM-DD`) of a `LocalDateFromString`.

**Signature**

```ts
type Encoded = typeof LocalDateFromString.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L698)

Since v0.0.0

# predicates

## equals

Dual predicate returning `true` when two `LocalDate` values represent the same calendar date.

**Example**

```ts
import { LocalDate, equals } from "@beep/schema/LocalDate"

const a = LocalDate.make({ year: 2024, month: 6, day: 15 })
const b = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(equals(a, b))
```

**Signature**

```ts
declare const equals: { (that: LocalDate): (self: LocalDate) => boolean; (self: LocalDate, that: LocalDate): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L410)

Since v0.0.0

## isAfter

Dual predicate returning `true` when `self` is chronologically after `that`.

**Example**

```ts
import { LocalDate, isAfter } from "@beep/schema/LocalDate"

const earlier = LocalDate.make({ year: 2024, month: 1, day: 1 })
const later = LocalDate.make({ year: 2024, month: 1, day: 2 })
console.log(isAfter(later, earlier))
```

**Signature**

```ts
declare const isAfter: { (that: LocalDate): (self: LocalDate) => boolean; (self: LocalDate, that: LocalDate): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L390)

Since v0.0.0

## isBefore

Dual predicate returning `true` when `self` is chronologically before `that`.

**Example**

```ts
import { LocalDate, isBefore } from "@beep/schema/LocalDate"

const earlier = LocalDate.make({ year: 2024, month: 1, day: 1 })
const later = LocalDate.make({ year: 2024, month: 1, day: 2 })
console.log(isBefore(earlier, later))
```

**Signature**

```ts
declare const isBefore: { (that: LocalDate): (self: LocalDate) => boolean; (self: LocalDate, that: LocalDate): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L370)

Since v0.0.0

## isLeapYear

Check whether a year is a leap year.

**Example**

```ts
import { isLeapYear } from "@beep/schema/LocalDate"

console.log(isLeapYear(2024))
```

**Signature**

```ts
declare const isLeapYear: (year: number) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L606)

Since v0.0.0

# utilities

## Order

Chronological `Order` for `LocalDate` values.

**Example**

```ts
import { LocalDate, Order } from "@beep/schema/LocalDate"

const earlier = LocalDate.make({ year: 2024, month: 1, day: 1 })
const later = LocalDate.make({ year: 2024, month: 1, day: 2 })
console.log(Order(earlier, later))
```

**Signature**

```ts
declare const Order: Order_.Order<LocalDate>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L342)

Since v0.0.0

## daysInMonth

Get the number of days in a given month, accounting for leap years.

**Example**

```ts
import { daysInMonth } from "@beep/schema/LocalDate"

console.log(daysInMonth(2024, 2))
```

**Signature**

```ts
declare const daysInMonth: { (month: number): (year: number) => number; (year: number, month: number): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L621)

Since v0.0.0

## diffInDays

Get the difference in whole days between two `LocalDate` values.

**Example**

```ts
import { LocalDate, diffInDays } from "@beep/schema/LocalDate"

const earlier = LocalDate.make({ year: 2024, month: 6, day: 15 })
const later = LocalDate.make({ year: 2024, month: 6, day: 18 })
console.log(diffInDays(later, earlier))
```

**Signature**

```ts
declare const diffInDays: { (that: LocalDate): (self: LocalDate) => number; (self: LocalDate, that: LocalDate): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L499)

Since v0.0.0

## endOfMonth

Return the last day of the month for the given `LocalDate`.

**Example**

```ts
import { LocalDate, endOfMonth } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 2, day: 15 })
console.log(endOfMonth(date).toISOString())
```

**Signature**

```ts
declare const endOfMonth: (date: LocalDate) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L544)

Since v0.0.0

## endOfYear

Return December 31st for the year of the given `LocalDate`.

**Example**

```ts
import { LocalDate, endOfYear } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(endOfYear(date).toISOString())
```

**Signature**

```ts
declare const endOfYear: (date: LocalDate) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L586)

Since v0.0.0

## startOfMonth

Return the first day of the month for the given `LocalDate`.

**Example**

```ts
import { LocalDate, startOfMonth } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(startOfMonth(date).toISOString())
```

**Signature**

```ts
declare const startOfMonth: (date: LocalDate) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L523)

Since v0.0.0

## startOfYear

Return January 1st for the year of the given `LocalDate`.

**Example**

```ts
import { LocalDate, startOfYear } from "@beep/schema/LocalDate"

const date = LocalDate.make({ year: 2024, month: 6, day: 15 })
console.log(startOfYear(date).toISOString())
```

**Signature**

```ts
declare const startOfYear: (date: LocalDate) => LocalDate
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts#L565)

Since v0.0.0