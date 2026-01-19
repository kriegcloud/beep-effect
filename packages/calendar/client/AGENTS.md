# @beep/calendar-client — Agent Guide

## Purpose & Fit
- Client-side contracts and handlers for the calendar vertical.
- Provides RPC type definitions for event CRUD and scheduling operations.
- Consumed by web applications for type-safe client-server communication.
- Bridges `@beep/calendar-domain` types to frontend applications.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for client contracts.
- **Contracts** — RPC schema definitions for calendar operations.

## Usage Snapshots
- `apps/web/` — Imports calendar client for scheduling interface.
- `packages/calendar/server/` — Server implements contracts defined here.

## Authoring Guardrails
- ALWAYS define contracts using `@effect/rpc` schema patterns.
- Client handlers MUST be Effect-based, never using raw async/await.
- NEVER import server-side code; client package is browser-safe.
- DateTime serialization MUST use ISO 8601 format for wire transfer.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import { CalendarContract } from "@beep/calendar-client";

// Fetch events in date range
const getEventsInRange = (start: Date, end: Date) =>
  Effect.gen(function* () {
    const client = yield* CalendarContract.Client;
    const events = yield* client.listEvents({
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
    return events;
  });
```

## Verifications
- `bun run check --filter @beep/calendar-client`
- `bun run lint --filter @beep/calendar-client`
- `bun run test --filter @beep/calendar-client`

## Contributor Checklist
- [ ] Contract changes synchronized with server implementation.
- [ ] No server-side imports in client package.
- [ ] DateTime fields use ISO 8601 string format.
