# DateTime — Agent Context

> Best practices for using `effect/DateTime` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `DateTime.now` | Get current UTC time as Effect | `yield* DateTime.now` |
| `DateTime.unsafeNow()` | Get current UTC time (non-Effect) | `createdAt: DateTime.unsafeNow()` |
| `DateTime.toDate` | Convert to JavaScript Date | `DateTime.toDate(dt)` |
| `DateTime.toEpochMillis` | Convert to Unix timestamp | `DateTime.toEpochMillis(dt)` |
| `DateTime.make` | Create from parts or input | `DateTime.make({ year: 2024, ... })` |
| `DateTime.setZone` | Add timezone to UTC time | `DateTime.setZone(dt, "America/New_York")` |
| `DateTime.format` | Format as string | `DateTime.format(dt, { dateStyle: "medium" })` |

## Codebase Patterns

### Effect Context (Preferred)

When inside `Effect.gen`, ALWAYS use `DateTime.now`:

```typescript
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const timestamp = yield* DateTime.now;

  // Convert to Date if needed for external APIs
  const jsDate = DateTime.toDate(timestamp);

  return { createdAt: timestamp };
});
```

### Non-Effect Context (Schema Defaults, Model Constructors)

When outside Effect context (class definitions, schema defaults), use `DateTime.unsafeNow()`:

```typescript
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";

export class Entity extends S.Class<Entity>("Entity")({
  id: S.String,
  createdAt: S.DateTimeUtc,
  updatedAt: S.DateTimeUtc,
}) {
  static create = (params: { id: string }) =>
    new Entity({
      ...params,
      createdAt: DateTime.unsafeNow(),  // Outside Effect.gen
      updatedAt: DateTime.unsafeNow(),
    });
}
```

### Working with Timestamps

```typescript
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as F from "effect/Function";

// Get Unix timestamp (milliseconds)
const epochMillis = F.pipe(
  DateTime.unsafeNow(),
  DateTime.toEpochMillis
);

// Add duration
const futureTime = F.pipe(
  DateTime.now,
  DateTime.add(Duration.hours(24))
);

// Format for display
const formatted = DateTime.format(
  DateTime.unsafeNow(),
  { dateStyle: "long", timeStyle: "short" }
);
```

## Anti-Patterns

### NEVER use native JavaScript Date constructors

```typescript
// FORBIDDEN
new Date()
Date.now()
new Date().getTime()

// REQUIRED
DateTime.now           // Effect context
DateTime.unsafeNow()   // Non-Effect context
```

### NEVER use Date methods directly on DateTime

```typescript
// FORBIDDEN
const dt = DateTime.unsafeNow();
dt.getFullYear();  // DateTime is not a Date!

// REQUIRED
const dt = DateTime.unsafeNow();
const jsDate = DateTime.toDate(dt);
const year = jsDate.getFullYear();

// OR use DateTime.getParts
const parts = DateTime.getParts(dt);
const year = parts.year;
```

### NEVER mix Date and DateTime without conversion

```typescript
// FORBIDDEN
const dt = DateTime.unsafeNow();
someApiCall({ timestamp: dt });  // API expects Date

// REQUIRED
const dt = DateTime.unsafeNow();
someApiCall({ timestamp: DateTime.toDate(dt) });
```

## Schema Integration

When using DateTime in schemas, prefer `S.DateTimeUtc`:

```typescript
import * as S from "effect/Schema";

// Domain model with DateTime
export class Event extends S.Class<Event>("Event")({
  id: S.String,
  startTime: S.DateTimeUtc,  // Runtime: DateTime.Utc
  endTime: S.DateTimeUtc,
});

// API schema with ISO string (wire format)
export class EventDTO extends S.Class<EventDTO>("EventDTO")({
  id: S.String,
  startTime: S.DateFromString,  // Runtime: Date, decoded from ISO string
  endTime: S.DateFromString,
});
```

## Related Modules

- [Duration.md](./Duration.md) - Time intervals and durations
- [Effect.md](./Effect.md) - Effect context and execution
- [Schema.md](./Schema.md) - DateTime schema types

## Source Reference

[.repos/effect/packages/effect/src/DateTime.ts](../../.repos/effect/packages/effect/src/DateTime.ts)
