---
path: packages/calendar/server
summary: Calendar server infrastructure - database client, repositories, and Effect services
tags: [calendar, server, effect, repository, database, postgresql]
---

# @beep/calendar-server

Server-side infrastructure for the calendar vertical slice. Provides the database client factory, Effect-based repositories, and services for event scheduling operations using the shared server patterns.

## Architecture

```
|-------------------|     |----------------------|
|    CalendarDb     | --> | @beep/shared-server  |
|-------------------|     | (DbClient.make)      |
         |                |----------------------|
         v
|-------------------|     |----------------------|
|   Repositories    | --> | @beep/calendar-tables|
|-------------------|     | (DbSchema)           |
         |                |----------------------|
         v
|-------------------|     |----------------------|
|   Domain Models   | --> | @beep/calendar-domain|
|-------------------|     | (Entities)           |
         |                |----------------------|
         v
|-------------------|
|  Runtime Layer    |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `CalendarDb.Db` | Database client service for calendar slice |
| `CalendarDb.layer` | Layer providing scoped database connection |
| `CalendarEventRepo` | Repository for CalendarEvent CRUD operations |

## Usage Patterns

### Composing Database Layer

```typescript
import * as Layer from "effect/Layer";
import { CalendarDb } from "@beep/calendar-server/db";

// Compose into runtime layer
const CalendarDbLive = CalendarDb.layer;
```

### Using Repository in Services

```typescript
import * as Effect from "effect/Effect";
import { CalendarEventRepo } from "@beep/calendar-server";

const findEvent = (id: string) =>
  Effect.gen(function* () {
    const repo = yield* CalendarEventRepo;
    return yield* repo.findById(id);
  });
```

### Repository Creation Pattern

```typescript
import * as Effect from "effect/Effect";
import { Entities } from "@beep/calendar-domain";
import { CalendarDb } from "@beep/calendar-server/db";
import { CalendarEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";

export class CalendarEventRepo extends Effect.Service<CalendarEventRepo>()(
  "@beep/calendar-server/repos/CalendarEventRepo",
  {
    dependencies: [CalendarDb.Db.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      yield* CalendarDb.Db;
      return yield* DbRepo.make(
        CalendarEntityIds.CalendarEventId,
        Entities.CalendarEvent.Model,
        Effect.succeed({})
      );
    }),
  }
) {}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `DbClient.make` factory | Consistent database client creation with schema typing |
| `DbRepo.make` for repositories | Standard CRUD operations with entity ID validation |
| Scoped Layer for Db | Connection lifecycle managed by Effect runtime |
| Service dependencies via Layer | Explicit dependency graph for testability |

## Dependencies

**Internal**:
- `@beep/calendar-domain` - Domain entity models
- `@beep/calendar-tables` - Database schema definitions
- `@beep/shared-domain` - Entity IDs, DbRepo factory
- `@beep/shared-server` - DbClient factory, server patterns

**External**:
- `effect` - Core Effect runtime
- `@effect/platform` - Platform abstractions
- `@effect/sql` - SQL effect integration
- `@effect/sql-drizzle` - Drizzle adapter
- `@effect/sql-pg` - PostgreSQL client
- `drizzle-orm` - Query building

## Related

- **AGENTS.md** - Detailed contributor guidance for server authoring
- `packages/calendar/domain` - Domain entities consumed by repositories
- `packages/calendar/tables` - Schema definitions used by database client
- `packages/runtime/server` - Runtime composition including calendar layers
