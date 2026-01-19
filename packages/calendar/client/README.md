# @beep/calendar-client

Client-side contracts and handlers for calendar operations.

## Overview

This package provides the client API surface for calendar operations:
- RPC type definitions for event CRUD
- Effect-based handlers for client-side operations
- Type-safe client-server communication contracts

## Installation

```bash
bun add @beep/calendar-client
```

## Key Exports

| Export | Description |
|--------|-------------|
| `CalendarContract` | RPC contract definitions |
| Handlers | Effect-based operation handlers |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain entities |
| `effect` | Core Effect runtime |
| `@effect/rpc` | RPC contract definitions |

## Usage

```typescript
import * as Effect from "effect/Effect";
import { CalendarContract } from "@beep/calendar-client";

const fetchEvents = (startDate: Date, endDate: Date) =>
  Effect.gen(function* () {
    const client = yield* CalendarContract.Client;
    const events = yield* client.listEvents({
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    });
    return events;
  });
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain models |
| `@beep/calendar-server` | Server implementation |
| `@beep/calendar-ui` | UI components |
