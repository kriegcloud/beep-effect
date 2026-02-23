# @beep/calendar-server — Agent Guide

## Purpose & Fit
- Server infrastructure for the calendar vertical: repositories, services, and database access.
- Implements Effect-based repositories for calendar entities using `@beep/shared-server` patterns.
- Provides event scheduling, recurrence expansion, and conflict detection services.
- Consumes domain models from `@beep/calendar-domain` and tables from `@beep/calendar-tables`.

## Surface Map
- **Database (`src/db.ts`)** — Calendar slice database client factory using `DbClient.make`.
- **Repositories (`src/db/repos/`)** — Repository implementations for calendar entities.

## Usage Snapshots
- `packages/runtime/server/src/DataAccess.layer.ts` — Composes calendar repositories.
- `packages/calendar/client/` — RPC handlers reference server services.

## Authoring Guardrails
- ALWAYS use `DbRepo.make` for repository creation.
- NEVER access database directly; use repository pattern.
- DateTime operations MUST use `effect/DateTime` for timezone-safe handling.
- Recurrence expansion MUST handle edge cases (DST, leap years).

## Quick Recipes
```ts
import { DbRepo } from "@beep/shared-server";
import { CalendarEntityIds } from "@beep/shared-domain";
import { CalendarEvent } from "@beep/calendar-domain/entities";
import { CalendarDb } from "../db";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";

export class CalendarEventRepo extends Effect.Service<CalendarEventRepo>()(
  "@beep/calendar-server/repos/CalendarEventRepo",
  {
    dependencies: [CalendarDb.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const baseRepo = yield* DbRepo.make(
        CalendarEntityIds.CalendarEventId,
        CalendarEvent.Model,
        Effect.gen(function* () {
          const { makeQuery } = yield* CalendarDb;

          const findInRange = makeQuery(
            (execute, start: Date, end: Date, orgId: string) =>
              execute((client) =>
                client.query.calendarEvent.findMany({
                  where: (table, { and, gte, lte, eq }) =>
                    and(
                      eq(table.organizationId, orgId),
                      gte(table.startTime, start),
                      lte(table.endTime, end)
                    ),
                })
              )
          );

          return { findInRange };
        })
      );
      return baseRepo;
    }),
  }
) {}
```

## Verifications
- `bun run check --filter @beep/calendar-server`
- `bun run lint --filter @beep/calendar-server`
- `bun run test --filter @beep/calendar-server`

## Google Calendar Integration

The `GoogleCalendarAdapter` provides Effect-based integration with Google Calendar API for bidirectional calendar synchronization.

### Required Scopes

```typescript
import { CalendarScopes } from "@beep/google-workspace-domain";

export const REQUIRED_SCOPES = [CalendarScopes.events] as const;
```

Scope: `https://www.googleapis.com/auth/calendar.events` - Full CRUD operations on calendar events.

### Key Operations

| Method | Purpose | Returns |
|--------|---------|---------|
| `listEvents` | Fetch events in date range | `ReadonlyArray<CalendarEvent>` |
| `createEvent` | Create new calendar event | `CalendarEvent` |
| `updateEvent` | Patch existing event | `CalendarEvent` |
| `deleteEvent` | Delete event by ID | `void` |

### Usage Pattern

The `GoogleCalendarAdapter` requires `AuthContext` at layer construction time, so it must be provided within the request context where `AuthContext` is available (not at router level).

```typescript
import { GoogleCalendarAdapter } from "@beep/calendar-server/adapters";
import * as GoogleWorkspace from "@beep/runtime-server/GoogleWorkspace.layer";
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";

// In a handler with AuthContext available:
const listCalendarEvents = Effect.gen(function* () {
  const calendar = yield* GoogleCalendarAdapter;

  const timeMin = DateTime.unsafeNow();
  const timeMax = DateTime.addDuration(timeMin, { days: 7 });

  const events = yield* calendar.listEvents("primary", timeMin, timeMax);
  return events;
}).pipe(
  Effect.provide(GoogleWorkspace.layer)  // Provides AuthContext-dependent layer
);
```

### Error Handling

The adapter emits these tagged errors:
- `GoogleApiError` - HTTP/API failures (network, invalid response)
- `GoogleAuthenticationError` - OAuth token failures
- `GoogleScopeExpansionRequiredError` - User lacks required OAuth scopes (triggers incremental consent flow)

```typescript
import { GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";

const program = listCalendarEvents.pipe(
  Effect.catchTag("GoogleScopeExpansionRequiredError", (error) =>
    // Redirect user to OAuth consent screen with expanded scopes
    redirectToOAuthConsent(error.requiredScopes)
  )
);
```

### ACL Translation

The adapter handles bidirectional translation between domain models and Google Calendar API format:

- **Input**: `CreateEventInput` / `UpdateEventInput` (domain types with `DateTime.Utc`)
- **Google API**: RFC 3339 ISO strings with timezone metadata
- **Output**: `CalendarEvent` (normalized domain type)

This Anti-Corruption Layer ensures the domain remains independent of Google Calendar API changes.

## Contributor Checklist
- [ ] Repositories use `DbRepo.make` with proper ID schemas.
- [ ] Date range queries use proper timezone handling.
- [ ] Telemetry spans added for observability.
- [ ] Google Calendar operations check for scope expansion errors.
