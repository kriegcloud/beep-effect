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

## Contributor Checklist
- [ ] Repositories use `DbRepo.make` with proper ID schemas.
- [ ] Date range queries use proper timezone handling.
- [ ] Telemetry spans added for observability.
