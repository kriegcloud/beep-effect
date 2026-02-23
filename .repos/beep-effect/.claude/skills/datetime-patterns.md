# DateTime Patterns

## When to Use

Apply this skill when:
- Working with dates and times in any form
- Converting between timezones
- Performing date arithmetic
- Formatting dates for display
- Comparing or calculating date distances

## Forbidden: Native Date

```typescript
// NEVER use native Date - it is mutable and error-prone
new Date();
new Date("2025-01-15");
date.setDate(date.getDate() + 1);  // Mutation!
date.getMonth() + 1;               // 0-indexed months confusion
date.toISOString();

// NEVER do manual timezone handling
new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
const offset = date.getTimezoneOffset();
```

## Required: Effect DateTime

```typescript
import * as DateTime from "effect/DateTime";
```

## Creation

```typescript
// Current time (Utc)
DateTime.unsafeNow();

// In Effect context
yield* DateTime.now;

// From string (unsafe - throws on invalid)
DateTime.unsafeMake("2025-01-15");

// From string (safe - returns Option)
DateTime.make("2025-01-15");  // Option<Utc>

// From parts
DateTime.unsafeMake({ year: 2025, month: 1, day: 15 });
```

## Arithmetic

All operations are immutable and handle edge cases correctly:

```typescript
// Add time
DateTime.add(date, { days: 1 });
DateTime.add(date, { months: 1, days: -5 });
DateTime.add(date, { hours: 3, minutes: 30 });

// Subtract time
DateTime.subtract(date, { weeks: 2 });
DateTime.subtract(date, { years: 1 });
```

## Comparison

```typescript
// Boolean comparisons
DateTime.lessThan(date1, date2);
DateTime.greaterThan(date1, date2);
DateTime.between({ minimum: start, maximum: end })(date);

// Distance between dates
DateTime.distance(date1, date2);  // Returns Duration
```

## Formatting

```typescript
// ISO string format
DateTime.formatIso(date);

// Localized formatting
DateTime.format(date, { dateStyle: "medium" });
DateTime.format(date, { dateStyle: "full", timeStyle: "short" });

// UTC formatting
DateTime.formatUtc(date);
```

## Timezones

```typescript
// Create zoned DateTime
const zoned = DateTime.makeZoned(date, { timeZone: "America/New_York" });

// Add timezone to UTC date
DateTime.withZone(utcDate, "Europe/Rome");

// Convert to UTC
DateTime.toUtc(zonedDate);
```

## Extracting Parts

```typescript
// Get all parts
DateTime.toParts(date);  // { year, month, day, hours, minutes, seconds, ... }

// Get specific part in UTC
DateTime.getPartUtc(date, "year");
DateTime.getPartUtc(date, "month");
DateTime.getPartUtc(date, "day");
```

## Examples: Common Patterns

```typescript
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import * as F from "effect/Function";

// Check if date is in the past
const isPast = (date: DateTime.Utc) =>
  DateTime.lessThan(date, DateTime.unsafeNow());

// Get date N days from now
const daysFromNow = (n: number) =>
  DateTime.add(DateTime.unsafeNow(), { days: n });

// Parse date with fallback
const parseDate = (input: string): DateTime.Utc =>
  F.pipe(
    DateTime.make(input),
    O.getOrElse(() => DateTime.unsafeNow())
  );

// Format for display
const formatForUser = (date: DateTime.Utc) =>
  DateTime.format(date, { dateStyle: "long", timeStyle: "short" });
```
