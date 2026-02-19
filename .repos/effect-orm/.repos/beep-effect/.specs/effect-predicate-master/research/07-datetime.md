# DateTime Predicates - Effect Research

**Module**: `effect/DateTime`
**Source Files**:
- `/tmp/effect/packages/effect/src/DateTime.ts`
- `/node_modules/effect/dist/dts/DateTime.d.ts`

## Overview

The `effect/DateTime` module provides immutable, timezone-aware date/time operations as a replacement for the mutable native `Date` object. This research focuses on **predicate-related functions** that return `boolean` values for date comparisons and type guards.

## Type Guards (Category: guards)

### 1. `isDateTime`
**Line**: 272 (source), 227 (types)
**Signature**: `(u: unknown) => u is DateTime`
**Category**: Type guard for any DateTime value

Checks if a value is a `DateTime` (either `Utc` or `Zoned`).

```typescript
import * as DateTime from "effect/DateTime"

const maybeDate: unknown = DateTime.unsafeNow()
if (DateTime.isDateTime(maybeDate)) {
  // maybeDate is narrowed to DateTime
  const millis = DateTime.toEpochMillis(maybeDate)
}
```

### 2. `isUtc`
**Line**: 296 (source), 247 (types)
**Signature**: `(self: DateTime) => self is Utc`
**Category**: Type guard for UTC DateTime

Checks if a `DateTime` is a `Utc` variant (no timezone attached).

```typescript
import * as DateTime from "effect/DateTime"

const date = DateTime.unsafeNow()
if (DateTime.isUtc(date)) {
  // date is narrowed to DateTime.Utc
  const parts = DateTime.toPartsUtc(date)
}
```

### 3. `isZoned`
**Line**: 302 (source), 252 (types)
**Signature**: `(self: DateTime) => self is Zoned`
**Category**: Type guard for Zoned DateTime

Checks if a `DateTime` is a `Zoned` variant (has timezone information).

```typescript
import * as DateTime from "effect/DateTime"

const date = DateTime.unsafeMakeZoned(
  { year: 2024 },
  { timeZone: "Europe/London" }
)

if (DateTime.isZoned(date)) {
  // date is narrowed to DateTime.Zoned
  const offset = DateTime.zonedOffset(date)
  const zone = date.zone
}
```

### 4. `isTimeZone`
**Line**: 278 (source), 232 (types)
**Signature**: `(u: unknown) => u is TimeZone`
**Category**: Type guard for TimeZone value

Checks if a value is a `TimeZone` (either `Offset` or `Named`).

```typescript
import * as DateTime from "effect/DateTime"

const maybeZone: unknown = DateTime.zoneMakeLocal()
if (DateTime.isTimeZone(maybeZone)) {
  // maybeZone is narrowed to TimeZone
  const str = DateTime.zoneToString(maybeZone)
}
```

### 5. `isTimeZoneOffset`
**Line**: 284 (source), 237 (types)
**Signature**: `(u: unknown) => u is TimeZone.Offset`
**Category**: Type guard for offset-based timezone

Checks if a `TimeZone` is an `Offset` variant (fixed offset in milliseconds).

```typescript
import * as DateTime from "effect/DateTime"

const zone = DateTime.zoneMakeOffset(3 * 60 * 60 * 1000)
if (DateTime.isTimeZoneOffset(zone)) {
  // zone is narrowed to TimeZone.Offset
  const offset = zone.offset // number in milliseconds
}
```

### 6. `isTimeZoneNamed`
**Line**: 290 (source), 242 (types)
**Signature**: `(u: unknown) => u is TimeZone.Named`
**Category**: Type guard for named timezone

Checks if a `TimeZone` is a `Named` variant (IANA timezone identifier).

```typescript
import * as DateTime from "effect/DateTime"

const zone = DateTime.zoneUnsafeMakeNamed("America/New_York")
if (DateTime.isTimeZoneNamed(zone)) {
  // zone is narrowed to TimeZone.Named
  const id = zone.id // "America/New_York"
}
```

## Comparison Predicates (Category: comparisons)

### 7. `greaterThan`
**Line**: 830 (source), 1027 (types)
**Signature**:
```typescript
{
  (that: DateTime): (self: DateTime) => boolean
  (self: DateTime, that: DateTime): boolean
}
```

Checks if `self` is after `that` in time.

```typescript
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"

const now = DateTime.unsafeNow()
const future = DateTime.add(now, { hours: 1 })

// Piped usage
const isLater = F.pipe(future, DateTime.greaterThan(now)) // true

// Direct usage
const isLater2 = DateTime.greaterThan(future, now) // true
```

### 8. `greaterThanOrEqualTo`
**Line**: 839 (source), 1043 (types)
**Signature**:
```typescript
{
  (that: DateTime): (self: DateTime) => boolean
  (self: DateTime, that: DateTime): boolean
}
```

Checks if `self` is after or equal to `that` in time.

```typescript
import * as DateTime from "effect/DateTime"

const date1 = DateTime.unsafeMake("2024-01-01")
const date2 = DateTime.unsafeMake("2024-01-01")

DateTime.greaterThanOrEqualTo(date1, date2) // true (equal)
```

### 9. `lessThan`
**Line**: 848 (source), 1059 (types)
**Signature**:
```typescript
{
  (that: DateTime): (self: DateTime) => boolean
  (self: DateTime, that: DateTime): boolean
}
```

Checks if `self` is before `that` in time.

```typescript
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"

const past = DateTime.unsafeMake("2023-01-01")
const present = DateTime.unsafeNow()

F.pipe(past, DateTime.lessThan(present)) // true
```

### 10. `lessThanOrEqualTo`
**Line**: 857 (source), 1075 (types)
**Signature**:
```typescript
{
  (that: DateTime): (self: DateTime) => boolean
  (self: DateTime, that: DateTime): boolean
}
```

Checks if `self` is before or equal to `that` in time.

```typescript
import * as DateTime from "effect/DateTime"

const date1 = DateTime.unsafeMake({ year: 2024, month: 1, day: 1 })
const date2 = DateTime.unsafeMake({ year: 2024, month: 1, day: 2 })

DateTime.lessThanOrEqualTo(date1, date2) // true
```

### 11. `between`
**Line**: 866 (source), 1091 (types)
**Signature**:
```typescript
{
  (options: { minimum: DateTime; maximum: DateTime }): (self: DateTime) => boolean
  (self: DateTime, options: { minimum: DateTime; maximum: DateTime }): boolean
}
```

Checks if `self` is between `minimum` and `maximum` (inclusive).

```typescript
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"

const start = DateTime.unsafeMake("2024-01-01")
const end = DateTime.unsafeMake("2024-12-31")
const middle = DateTime.unsafeMake("2024-06-15")

F.pipe(
  middle,
  DateTime.between({ minimum: start, maximum: end })
) // true
```

### 12. `isFuture`
**Line**: 875 (source), 1113 (types)
**Signature**: `(self: DateTime) => Effect.Effect<boolean>`
**Category**: Effect-based predicate using Clock service

Checks if `self` is after the current time (requires Effect context).

```typescript
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const future = DateTime.unsafeMake("2050-01-01")
  const isFuture = yield* DateTime.isFuture(future) // true

  const past = DateTime.unsafeMake("2000-01-01")
  const isPast = yield* DateTime.isFuture(past) // false

  return { isFuture, isPast }
})
```

### 13. `unsafeIsFuture`
**Line**: 881 (source), 1118 (types)
**Signature**: `(self: DateTime) => boolean`
**Category**: Synchronous future check using Date.now()

Checks if `self` is after the current time (uses `Date.now()` internally).

```typescript
import * as DateTime from "effect/DateTime"

const future = DateTime.unsafeMake("2050-01-01")
const result = DateTime.unsafeIsFuture(future) // true

// Replace native Date comparisons
// ❌ FORBIDDEN
// new Date("2050-01-01") > new Date()

// ✅ REQUIRED
DateTime.unsafeIsFuture(DateTime.unsafeMake("2050-01-01"))
```

### 14. `isPast`
**Line**: 887 (source), 1123 (types)
**Signature**: `(self: DateTime) => Effect.Effect<boolean>`
**Category**: Effect-based predicate using Clock service

Checks if `self` is before the current time (requires Effect context).

```typescript
import * as DateTime from "effect/DateTime"
import * as Effect from "effect/Effect"

const program = Effect.gen(function* () {
  const past = DateTime.unsafeMake("2000-01-01")
  const result = yield* DateTime.isPast(past) // true

  return result
})
```

### 15. `unsafeIsPast`
**Line**: 893 (source), 1128 (types)
**Signature**: `(self: DateTime) => boolean`
**Category**: Synchronous past check using Date.now()

Checks if `self` is before the current time (uses `Date.now()` internally).

```typescript
import * as DateTime from "effect/DateTime"

const past = DateTime.unsafeMake("2000-01-01")
const result = DateTime.unsafeIsPast(past) // true

// Replace native Date comparisons
// ❌ FORBIDDEN
// new Date("2000-01-01") < new Date()

// ✅ REQUIRED
DateTime.unsafeIsPast(DateTime.unsafeMake("2000-01-01"))
```

## Supporting Comparison Functions (Non-Predicate)

While not strictly predicates (they don't return `boolean`), these functions support comparison operations:

### `min` (Line 812, 995)
**Signature**:
```typescript
{
  <That extends DateTime>(that: That): <Self extends DateTime>(self: Self) => Self | That
  <Self extends DateTime, That extends DateTime>(self: Self, that: That): Self | That
}
```

Returns the earlier of two DateTimes.

```typescript
import * as DateTime from "effect/DateTime"

const date1 = DateTime.unsafeMake("2024-01-01")
const date2 = DateTime.unsafeMake("2025-01-01")

const earlier = DateTime.min(date1, date2) // date1
```

### `max` (Line 821, 1011)
**Signature**:
```typescript
{
  <That extends DateTime>(that: That): <Self extends DateTime>(self: Self) => Self | That
  <Self extends DateTime, That extends DateTime>(self: Self, that: That): Self | That
}
```

Returns the later of two DateTimes.

```typescript
import * as DateTime from "effect/DateTime"

const date1 = DateTime.unsafeMake("2024-01-01")
const date2 = DateTime.unsafeMake("2025-01-01")

const later = DateTime.max(date1, date2) // date2
```

### `clamp` (Line 323, 266)
**Signature**:
```typescript
{
  <Min extends DateTime, Max extends DateTime>(
    options: { readonly minimum: Min; readonly maximum: Max }
  ): <A extends DateTime>(self: A) => A | Min | Max
  <A extends DateTime, Min extends DateTime, Max extends DateTime>(
    self: A,
    options: { readonly minimum: Min; readonly maximum: Max }
  ): A | Min | Max
}
```

Clamps a DateTime to a given range.

```typescript
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"

const min = DateTime.unsafeMake("2024-01-01")
const max = DateTime.unsafeMake("2024-12-31")

const tooEarly = DateTime.unsafeMake("2023-06-15")
const clamped = F.pipe(
  tooEarly,
  DateTime.clamp({ minimum: min, maximum: max })
) // Returns min (2024-01-01)
```

## Effect Order Instance (Line 318, 262)

The `Order` instance provides ordering semantics for DateTimes:

```typescript
import * as DateTime from "effect/DateTime"
import * as Order from "effect/Order"

const dates = [
  DateTime.unsafeMake("2024-06-01"),
  DateTime.unsafeMake("2024-01-01"),
  DateTime.unsafeMake("2024-12-01")
]

const sorted = dates.sort(Order.compare(DateTime.Order))
// [2024-01-01, 2024-06-01, 2024-12-01]
```

## Replacing Native Date Comparisons

### Anti-Patterns (FORBIDDEN)

```typescript
// ❌ NEVER use native Date comparisons
const date1 = new Date("2024-01-01")
const date2 = new Date("2025-01-01")

if (date1 > date2) { /* ... */ }
if (date1 < date2) { /* ... */ }
if (date1.getTime() === date2.getTime()) { /* ... */ }

const now = new Date()
if (date1 > now) { /* future */ }
if (date1 < now) { /* past */ }

const min = date1 < date2 ? date1 : date2
const max = date1 > date2 ? date1 : date2
```

### Effect Patterns (REQUIRED)

```typescript
import * as DateTime from "effect/DateTime"
import * as F from "effect/Function"
import * as Effect from "effect/Effect"

// ✅ Type-safe comparisons
const date1 = DateTime.unsafeMake("2024-01-01")
const date2 = DateTime.unsafeMake("2025-01-01")

if (DateTime.greaterThan(date1, date2)) { /* ... */ }
if (DateTime.lessThan(date1, date2)) { /* ... */ }
// Use Equivalence for equality
import * as Equivalence from "effect/Equivalence"
if (DateTime.Equivalence(date1, date2)) { /* ... */ }

// ✅ Future/past checks in Effect context
const program = Effect.gen(function* () {
  if (yield* DateTime.isFuture(date1)) {
    // Handle future date
  }

  if (yield* DateTime.isPast(date1)) {
    // Handle past date
  }
})

// ✅ Synchronous future/past checks
if (DateTime.unsafeIsFuture(date1)) { /* ... */ }
if (DateTime.unsafeIsPast(date1)) { /* ... */ }

// ✅ Min/max with type preservation
const earlier = DateTime.min(date1, date2)
const later = DateTime.max(date1, date2)

// ✅ Range checks
const inRange = F.pipe(
  date1,
  DateTime.between({
    minimum: DateTime.unsafeMake("2024-01-01"),
    maximum: DateTime.unsafeMake("2024-12-31")
  })
)
```

## Integration with Match and Predicate Modules

DateTime predicates work seamlessly with `effect/Match`:

```typescript
import * as DateTime from "effect/DateTime"
import * as Match from "effect/Match"
import * as F from "effect/Function"

const date = DateTime.unsafeMake("2024-06-15")

const result = Match.value(date).pipe(
  Match.when(
    (d) => DateTime.unsafeIsFuture(d),
    () => "Future event"
  ),
  Match.when(
    (d) => DateTime.unsafeIsPast(d),
    () => "Past event"
  ),
  Match.orElse(() => "Present")
)
```

Using with `effect/Predicate` for composition:

```typescript
import * as DateTime from "effect/DateTime"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

const start = DateTime.unsafeMake("2024-01-01")
const end = DateTime.unsafeMake("2024-12-31")

const isInYear2024 = (date: DateTime.DateTime) =>
  DateTime.between(date, { minimum: start, maximum: end })

const isInFuture = (date: DateTime.DateTime) =>
  DateTime.unsafeIsFuture(date)

const isFutureIn2024 = P.and(isInYear2024, isInFuture)

const date = DateTime.unsafeMake("2024-06-15")
if (isFutureIn2024(date)) {
  // Date is in 2024 and in the future
}
```

## Summary

### Type Guards (6 functions)
1. `isDateTime` - Check if value is any DateTime
2. `isUtc` - Check if DateTime is UTC variant
3. `isZoned` - Check if DateTime is Zoned variant
4. `isTimeZone` - Check if value is TimeZone
5. `isTimeZoneOffset` - Check if TimeZone is Offset variant
6. `isTimeZoneNamed` - Check if TimeZone is Named variant

### Comparison Predicates (10 functions)
7. `greaterThan` - After check
8. `greaterThanOrEqualTo` - After or equal check
9. `lessThan` - Before check
10. `lessThanOrEqualTo` - Before or equal check
11. `between` - Range check (inclusive)
12. `isFuture` - After current time (Effect-based)
13. `unsafeIsFuture` - After current time (synchronous)
14. `isPast` - Before current time (Effect-based)
15. `unsafeIsPast` - Before current time (synchronous)

### Supporting Functions (3 functions)
- `min` - Return earlier DateTime
- `max` - Return later DateTime
- `clamp` - Clamp to range

### Instance
- `Order` - Ordering instance for sorting/comparing

## Key Principles

1. **Immutability**: All DateTime operations return new values
2. **Type Safety**: Type guards provide precise type narrowing
3. **Dual API**: Most predicates support both piped and direct call styles
4. **Effect Integration**: Future/past checks available in both Effect and synchronous forms
5. **No Native Date**: Complete replacement for mutable Date comparisons
6. **Timezone Aware**: Comparisons respect timezone information

This comprehensive suite of predicates enables fully type-safe, immutable date/time comparisons throughout Effect applications.
