---
title: LocalDate.behavior.ts
nav_order: 34
parent: "@beep/shared-domain"
---

## LocalDate.behavior.ts overview

LocalDate value object behavior.

Provides pure constructors, predicates, ordering, date arithmetic, and string
boundary codecs for `Model`. Runtime validation that depends on the
relationship between year, month, and day lives here.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [addDays](#adddays)
  - [addMonths](#addmonths)
  - [addYears](#addyears)
- [constructors](#constructors)
  - [LocalDateFromString](#localdatefromstring)
  - [fromDate](#fromdate)
  - [fromDateTime](#fromdatetime)
  - [fromString](#fromstring)
  - [make](#make)
  - [makeEffect](#makeeffect)
  - [makeOption](#makeoption)
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

Add whole days to a LocalDate.

**Example**

```ts
import { addDays, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 30 })
const next = addDays(date, 1)

console.log(next.toISOString()) // "2024-07-01"
```

**Signature**

```ts
declare const addDays: { (days: number): (self: LocalDate.Model) => LocalDate.Model; (self: LocalDate.Model, days: number): LocalDate.Model; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L432)

Since v0.0.0

## addMonths

Add whole months to a LocalDate.

**Example**

```ts
import { addMonths, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 11, day: 15 })
const next = addMonths(date, 3)

console.log(next.toISOString()) // "2025-02-15"
```

**Signature**

```ts
declare const addMonths: { (months: number): (self: LocalDate.Model) => LocalDate.Model; (self: LocalDate.Model, months: number): LocalDate.Model; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L460)

Since v0.0.0

## addYears

Add whole years to a LocalDate.

**Example**

```ts
import { addYears, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })
const next = addYears(date, 2)

console.log(next.toISOString()) // "2026-06-15"
```

**Signature**

```ts
declare const addYears: { (years: number): (self: LocalDate.Model) => LocalDate.Model; (self: LocalDate.Model, years: number): LocalDate.Model; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L488)

Since v0.0.0

# constructors

## LocalDateFromString

Schema that transforms ISO 8601 date strings into LocalDate models.

Decodes `YYYY-MM-DD` text to `Model` and encodes the model back to the
same canonical text format.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { LocalDateFromString } from "@beep/shared-domain/values/LocalDate"

const program = Effect.gen(function* () {
  const decodeLocalDate = S.decodeUnknownEffect(LocalDateFromString)
  const encodeLocalDate = S.encodeEffect(LocalDateFromString)

  const date = yield* decodeLocalDate("2024-06-15")
  const encoded = yield* encodeLocalDate(date)

  return encoded
})
console.log(program)
```

**Signature**

```ts
declare const LocalDateFromString: AnnotatedSchema<S.decodeTo<typeof LocalDate.Model, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L694)

Since v0.0.0

## fromDate

Create a `LocalDate` from a JavaScript `Date` using UTC calendar components.

**Example**

```ts
import * as DateTime from "effect/DateTime"
import { fromDate } from "@beep/shared-domain/values/LocalDate"

const date = fromDate(DateTime.toDateUtc(DateTime.makeUnsafe("2024-06-15T12:00:00.000Z")))

console.log(date.toISOString()) // "2024-06-15"
```

**Signature**

```ts
declare const fromDate: (date: Date) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L238)

Since v0.0.0

## fromDateTime

Create a `LocalDate` from an Effect `DateTime` using UTC calendar components.

**Example**

```ts
import * as DateTime from "effect/DateTime"
import { fromDateTime } from "@beep/shared-domain/values/LocalDate"

const date = fromDateTime(DateTime.makeUnsafe("2024-06-15T12:00:00.000Z"))

console.log(date.toISOString()) // "2024-06-15"
```

**Signature**

```ts
declare const fromDateTime: (dateTime: DateTime.DateTime) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L302)

Since v0.0.0

## fromString

Parse a `YYYY-MM-DD` string into a `LocalDate` model.

The returned effect fails when the input is not an ISO local date or does not
represent a real calendar date.

**Example**

```ts
import { Effect } from "effect"
import { fromString } from "@beep/shared-domain/values/LocalDate"

const program = Effect.gen(function* () {
  const date = yield* fromString("2024-06-15")
  return date.month
})
```

**Signature**

```ts
declare const fromString: (dateString: string) => Effect.Effect<LocalDate.Model, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L207)

Since v0.0.0

## make

Unsafe constructor for a `LocalDate` model.

**Example**

```ts
import { make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })

console.log(date.toISOString()) // "2024-06-15"
```

**Signature**

```ts
declare const make: (input: CalendarParts) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L46)

Since v0.0.0

## makeEffect

Effectful constructor for a `LocalDate` model.

Fails with `Schema.SchemaError` when the model fields fail schema validation.

**Example**

```ts
import { Effect } from "effect"
import { makeEffect } from "@beep/shared-domain/values/LocalDate"

const program = Effect.gen(function* () {
  const date = yield* makeEffect({ year: 2024, month: 6, day: 15 })
  return date.toISOString()
})
```

**Signature**

```ts
declare const makeEffect: (input: CalendarParts) => Effect.Effect<LocalDate.Model, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L91)

Since v0.0.0

## makeOption

Optional constructor for a `LocalDate` model.

Returns `Option.none()` when the model fields fail schema validation.

**Example**

```ts
import * as O from "effect/Option"
import { makeOption } from "@beep/shared-domain/values/LocalDate"

const date = makeOption({ year: 2024, month: 6, day: 15 })

console.log(O.isSome(date)) // true
```

**Signature**

```ts
declare const makeOption: (input: CalendarParts) => O.Option<LocalDate.Model>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L68)

Since v0.0.0

## today

Get today's UTC LocalDate using the live clock.

**Example**

```ts
import { today } from "@beep/shared-domain/values/LocalDate"

const date = today()

console.log(date.toISOString())
```

**Signature**

```ts
declare const today: () => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L256)

Since v0.0.0

## todayEffect

Get today's UTC LocalDate using Effect's `Clock` service.

This effect is deterministic under `TestClock`, which makes it the preferred
constructor for tested workflows.

**Example**

```ts
import { Effect } from "effect"
import { todayEffect } from "@beep/shared-domain/values/LocalDate"

const program = Effect.gen(function* () {
  const date = yield* todayEffect
  return date.toISOString()
})
```

**Signature**

```ts
declare const todayEffect: Effect.Effect<LocalDate.Model, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L279)

Since v0.0.0

# guards

## isLocalDate

Type guard for `LocalDate` model instances.

**Example**

```ts
import { isLocalDate, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })

console.log(isLocalDate(date)) // true
```

**Signature**

```ts
declare const isLocalDate: <I>(input: I) => input is I & LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L111)

Since v0.0.0

# models

## LocalDateFromString (type alias)

Type for `LocalDateFromString`.

**Example**

```ts
import { Model, type LocalDateFromString } from "@beep/shared-domain/values/LocalDate"

const date: LocalDateFromString = Model.make({ year: 2024, month: 6, day: 15 })

console.log(date.toISOString()) // "2024-06-15"
```

**Signature**

```ts
type LocalDateFromString = typeof LocalDateFromString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L720)

Since v0.0.0

## LocalDateFromString (namespace)

Namespace members for `LocalDateFromString`.

**Example**

```ts
import type { LocalDateFromString } from "@beep/shared-domain/values/LocalDate"

const encoded: LocalDateFromString.Encoded = "2024-06-15"

console.log(encoded)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L737)

Since v0.0.0

### Encoded (type alias)

Encoded string representation for `LocalDateFromString`.

**Example**

```ts
import type { LocalDateFromString } from "@beep/shared-domain/values/LocalDate"

const encoded: LocalDateFromString.Encoded = "2024-06-15"

console.log(encoded)
```

**Signature**

```ts
type Encoded = typeof LocalDateFromString.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L753)

Since v0.0.0

# predicates

## equals

Test whether two LocalDate values represent the same calendar date.

**Example**

```ts
import { equals, make } from "@beep/shared-domain/values/LocalDate"

const left = make({ year: 2024, month: 6, day: 15 })
const right = make({ year: 2024, month: 6, day: 15 })

console.log(equals(left, right)) // true
```

**Signature**

```ts
declare const equals: { (that: LocalDate.Model): (self: LocalDate.Model) => boolean; (self: LocalDate.Model, that: LocalDate.Model): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L404)

Since v0.0.0

## isAfter

Test whether one LocalDate is chronologically after another.

**Example**

```ts
import { isAfter, make } from "@beep/shared-domain/values/LocalDate"

const left = make({ year: 2024, month: 6, day: 16 })
const right = make({ year: 2024, month: 6, day: 15 })

console.log(isAfter(left, right)) // true
```

**Signature**

```ts
declare const isAfter: { (that: LocalDate.Model): (self: LocalDate.Model) => boolean; (self: LocalDate.Model, that: LocalDate.Model): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L380)

Since v0.0.0

## isBefore

Test whether one LocalDate is chronologically before another.

**Example**

```ts
import { isBefore, make } from "@beep/shared-domain/values/LocalDate"

const left = make({ year: 2024, month: 6, day: 15 })
const right = make({ year: 2024, month: 6, day: 16 })

console.log(isBefore(left, right)) // true
```

**Signature**

```ts
declare const isBefore: { (that: LocalDate.Model): (self: LocalDate.Model) => boolean; (self: LocalDate.Model, that: LocalDate.Model): boolean; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L356)

Since v0.0.0

## isLeapYear

Check whether a year is a leap year in the Gregorian calendar.

**Example**

```ts
import { isLeapYear } from "@beep/shared-domain/values/LocalDate"

console.log(isLeapYear(2024)) // true
console.log(isLeapYear(1900)) // false
```

**Signature**

```ts
declare const isLeapYear: (year: number) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L641)

Since v0.0.0

# utilities

## Order

Chronological order for `LocalDate` values.

**Example**

```ts
import { Order, make } from "@beep/shared-domain/values/LocalDate"

const left = make({ year: 2024, month: 6, day: 15 })
const right = make({ year: 2024, month: 6, day: 16 })

console.log(Order(left, right)) // -1
```

**Signature**

```ts
declare const Order: Ord.Order<LocalDate.Model>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L332)

Since v0.0.0

## daysInMonth

Get the number of days in a given month.

Leap years are accounted for when the month is February.

**Example**

```ts
import { daysInMonth } from "@beep/shared-domain/values/LocalDate"

console.log(daysInMonth(2024, 2)) // 29
console.log(daysInMonth(2023, 2)) // 28
```

**Signature**

```ts
declare const daysInMonth: { (month: number): (year: number) => number; (year: number, month: number): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L662)

Since v0.0.0

## diffInDays

Get the difference in whole days between two LocalDate values.

The result is positive when `self` is after `that` and negative when `self`
is before `that`.

**Example**

```ts
import { diffInDays, make } from "@beep/shared-domain/values/LocalDate"

const left = make({ year: 2024, month: 6, day: 20 })
const right = make({ year: 2024, month: 6, day: 15 })

console.log(diffInDays(left, right)) // 5
```

**Signature**

```ts
declare const diffInDays: { (that: LocalDate.Model): (self: LocalDate.Model) => number; (self: LocalDate.Model, that: LocalDate.Model): number; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L519)

Since v0.0.0

## endOfMonth

Return the last day of the month for the given LocalDate.

**Example**

```ts
import { endOfMonth, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 2, day: 15 })

console.log(endOfMonth(date).toISOString()) // "2024-02-29"
```

**Signature**

```ts
declare const endOfMonth: (date: LocalDate.Model) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L570)

Since v0.0.0

## endOfYear

Return December 31st for the year of the given LocalDate.

**Example**

```ts
import { endOfYear, make } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })

console.log(endOfYear(date).toISOString()) // "2024-12-31"
```

**Signature**

```ts
declare const endOfYear: (date: LocalDate.Model) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L618)

Since v0.0.0

## startOfMonth

Return the first day of the month for the given LocalDate.

**Example**

```ts
import { make, startOfMonth } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })

console.log(startOfMonth(date).toISOString()) // "2024-06-01"
```

**Signature**

```ts
declare const startOfMonth: (date: LocalDate.Model) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L546)

Since v0.0.0

## startOfYear

Return January 1st for the year of the given LocalDate.

**Example**

```ts
import { make, startOfYear } from "@beep/shared-domain/values/LocalDate"

const date = make({ year: 2024, month: 6, day: 15 })

console.log(startOfYear(date).toISOString()) // "2024-01-01"
```

**Signature**

```ts
declare const startOfYear: (date: LocalDate.Model) => LocalDate.Model
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/values/LocalDate/LocalDate.behavior.ts#L594)

Since v0.0.0