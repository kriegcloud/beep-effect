# @beep/calendar-domain — Agent Guide

## Purpose & Fit
- Domain layer for calendar functionality: events, scheduling, and time management.
- Provides strongly-typed domain models for calendar events and related entities.
- Defines Effect schemas for event data with proper datetime handling.
- Bridges shared-kernel entities from `@beep/shared-domain` into the calendar slice.

## Surface Map
- **Entities (`src/entities/`)**
  - `CalendarEvent` — Core event entity with start/end times, recurrence, and attendees.
- **Value Objects (`src/value-objects/`)** — Immutable primitives for recurrence patterns, event status, etc.
- **API (`src/api/`)** — RPC schema definitions for calendar operations.

## Usage Snapshots
- `packages/calendar/server/src/db/repos/` — Repositories reference domain entities.
- `packages/calendar/tables/src/tables/` — Drizzle schemas mirror domain structures.
- `packages/calendar/client/` — Consumes domain types for client contracts.

## Authoring Guardrails
- ALWAYS namespace Effect imports (`import * as Effect from "effect/Effect"`).
- NEVER use native Date; use `effect/DateTime` for all temporal operations.
- Entity models MUST remain pure and infrastructure-agnostic.
- Use `@beep/schema` (`BS` helpers) for datetime fields with proper transformations.
- Recurrence rules MUST use RFC 5545 (iCalendar) compatible schemas.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as DateTime from "effect/DateTime";
import { CalendarEvent } from "@beep/calendar-domain/entities";

// Create calendar event with proper datetime handling
const createEvent = (data: {
  title: string;
  startTime: DateTime.DateTime.Utc;
  endTime: DateTime.DateTime.Utc;
}) =>
  Effect.gen(function* () {
    const event = yield* S.decodeUnknown(CalendarEvent.Model.insert)(data);
    yield* Effect.logInfo("event.created", { eventId: event.id });
    return event;
  });
```

## Verifications
- `bun run check --filter @beep/calendar-domain`
- `bun run lint --filter @beep/calendar-domain`
- `bun run test --filter @beep/calendar-domain`

## Contributor Checklist
- [ ] Entity changes align with `@beep/calendar-tables` schemas.
- [ ] DateTime fields use Effect DateTime, never native Date.
- [ ] Recurrence patterns follow RFC 5545 specification.
- [ ] Branded IDs registered in `@beep/shared-domain/entity-ids`.
