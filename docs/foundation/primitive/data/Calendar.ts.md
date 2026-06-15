---
title: Calendar.ts
nav_order: 2
parent: "@beep/data"
---

## Calendar.ts overview

Calendar data constants for month and weekday names, numbers, and ISO codes.

Provides typed arrays of month names, weekday names, their formalized
(capitalized) variants, numeric month values (1-12), and two-digit ISO
month codes. Each array is `as const` so members can be used as literal
union types.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [FormalMonthNameValues](#formalmonthnamevalues)
  - [FormalWeekNameValues](#formalweeknamevalues)
  - [MonthISOValues](#monthisovalues)
  - [MonthNameValues](#monthnamevalues)
  - [MonthNumberValues](#monthnumbervalues)
  - [WeekNameValues](#weeknamevalues)
- [models](#models)
  - [FormalMonthName (type alias)](#formalmonthname-type-alias)
  - [FormalWeekName (type alias)](#formalweekname-type-alias)
  - [MonthISO (type alias)](#monthiso-type-alias)
  - [MonthName (type alias)](#monthname-type-alias)
  - [MonthNumber (type alias)](#monthnumber-type-alias)
  - [WeekName (type alias)](#weekname-type-alias)
---

# constants

## FormalMonthNameValues

Ordered tuple of all twelve capitalized English month names.

**Example**

```ts
```typescript
import { FormalMonthNameValues } from "@beep/data/Calendar"

FormalMonthNameValues[0] // "January"
```
```

**Signature**

```ts
declare const FormalMonthNameValues: ["January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December", ...("January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December")[]]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L142)

Since v0.0.0

## FormalWeekNameValues

Ordered tuple of all seven capitalized English weekday names, starting with Sunday.

**Example**

```ts
```typescript
import { FormalWeekNameValues } from "@beep/data/Calendar"

FormalWeekNameValues[0] // "Sunday"
FormalWeekNameValues[1] // "Monday"
```
```

**Signature**

```ts
declare const FormalWeekNameValues: ["Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday", ...("Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[]]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L202)

Since v0.0.0

## MonthISOValues

Ordered tuple of two-digit ISO month code strings from `"01"` through `"12"`.

**Example**

```ts
```typescript
import { MonthISOValues } from "@beep/data/Calendar"

MonthISOValues[0] // "01"
MonthISOValues[11] // "12"
```
```

**Signature**

```ts
declare const MonthISOValues: readonly ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L172)

Since v0.0.0

## MonthNameValues

Ordered tuple of all twelve lowercase English month names.

**Example**

```ts
```typescript
import { MonthNameValues } from "@beep/data/Calendar"

MonthNameValues[0] // "january"
MonthNameValues[11] // "december"
```
```

**Signature**

```ts
declare const MonthNameValues: readonly ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L128)

Since v0.0.0

## MonthNumberValues

Ordered tuple of month numbers from 1 through 12.

**Example**

```ts
```typescript
import { MonthNumberValues } from "@beep/data/Calendar"

MonthNumberValues[0] // 1
MonthNumberValues[11] // 12
```
```

**Signature**

```ts
declare const MonthNumberValues: readonly [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L157)

Since v0.0.0

## WeekNameValues

Ordered tuple of all seven lowercase English weekday names, starting with Sunday.

**Example**

```ts
```typescript
import { WeekNameValues } from "@beep/data/Calendar"

WeekNameValues[0] // "sunday"
WeekNameValues[1] // "monday"
```
```

**Signature**

```ts
declare const WeekNameValues: readonly ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L187)

Since v0.0.0

# models

## FormalMonthName (type alias)

Union of capitalized English month name strings.

**Example**

```ts
```typescript
import type { FormalMonthName } from "@beep/data/Calendar"

const month: FormalMonthName = "January"
console.log(month)
```
```

**Signature**

```ts
type FormalMonthName = (typeof internal.FormalMonthNameValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L47)

Since v0.0.0

## FormalWeekName (type alias)

Union of capitalized English weekday name strings.

**Example**

```ts
```typescript
import type { FormalWeekName } from "@beep/data/Calendar"

const day: FormalWeekName = "Monday"
console.log(day)
```
```

**Signature**

```ts
type FormalWeekName = (typeof internal.Weekday.FormalWeekNameValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L109)

Since v0.0.0

## MonthISO (type alias)

Union of two-digit ISO month code strings from `"01"` through `"12"`.

**Example**

```ts
```typescript
import type { MonthISO } from "@beep/data/Calendar"

const jan: MonthISO = "01"
console.log(jan)
```
```

**Signature**

```ts
type MonthISO = (typeof internal.MonthISOValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L79)

Since v0.0.0

## MonthName (type alias)

Union of lowercase English month name strings.

**Example**

```ts
```typescript
import type { MonthName } from "@beep/data/Calendar"

const month: MonthName = "january"
console.log(month)
```
```

**Signature**

```ts
type MonthName = (typeof internal.MonthNameValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L32)

Since v0.0.0

## MonthNumber (type alias)

Union of month number literals from 1 through 12.

**Example**

```ts
```typescript
import type { MonthNumber } from "@beep/data/Calendar"

const jan: MonthNumber = 1
const dec: MonthNumber = 12
console.log(jan)
console.log(dec)
```
```

**Signature**

```ts
type MonthNumber = (typeof internal.MonthNumberValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L64)

Since v0.0.0

## WeekName (type alias)

Union of lowercase English weekday name strings.

**Example**

```ts
```typescript
import type { WeekName } from "@beep/data/Calendar"

const day: WeekName = "monday"
console.log(day)
```
```

**Signature**

```ts
type WeekName = (typeof internal.Weekday.WeekNameValues)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/data/src/Calendar.ts#L94)

Since v0.0.0