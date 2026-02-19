# @beep/calendar-server

Server infrastructure for calendar functionality.

## Overview

This package provides the server-side infrastructure for the calendar vertical:
- Effect-based repositories for calendar entities
- Event scheduling and conflict detection services
- Recurrence expansion utilities

## Installation

```bash
bun add @beep/calendar-server
```

## Key Exports

| Export | Description |
|--------|-------------|
| `CalendarDb` | Database client factory for calendar slice |
| `CalendarEventRepo` | Repository for calendar events |
| `CalendarRepos` | Namespace containing all calendar repositories |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain entities |
| `@beep/calendar-tables` | Drizzle table definitions |
| `@beep/shared-server` | Base repository patterns |
| `effect` | Core Effect runtime |

## Usage

```typescript
import * as Effect from "effect/Effect";
import { CalendarEventRepo } from "@beep/calendar-server";

const getEventsInRange = (start: Date, end: Date, orgId: string) =>
  Effect.gen(function* () {
    const repo = yield* CalendarEventRepo;
    const events = yield* repo.findInRange(start, end, orgId);
    return events;
  });
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain models |
| `@beep/calendar-tables` | Database tables |
| `@beep/calendar-client` | Client contracts |
