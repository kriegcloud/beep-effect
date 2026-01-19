# @beep/calendar-domain

Domain models and schemas for calendar functionality.

## Overview

This package provides the pure domain layer for the calendar vertical:
- Effect schemas for calendar events
- Value objects for recurrence patterns
- Branded IDs for type-safe entity references

## Installation

```bash
bun add @beep/calendar-domain
```

## Key Exports

| Export | Description |
|--------|-------------|
| `CalendarEvent` | Core event entity with scheduling metadata |
| `Entities` | Namespace containing all calendar entities |
| Value Objects | Recurrence patterns, event status, etc. |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/shared-domain` | Shared entity utilities |
| `@beep/schema` | Schema helpers and validation |
| `effect` | Core Effect runtime |

## Usage

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { CalendarEvent } from "@beep/calendar-domain/entities";

const decodeEvent = (data: unknown) =>
  Effect.gen(function* () {
    const event = yield* S.decodeUnknown(CalendarEvent.Model)(data);
    return event;
  });
```

## Domain Models

### CalendarEvent

| Field | Type | Description |
|-------|------|-------------|
| `id` | `CalendarEventId` | Branded event identifier |
| `title` | `string` | Event title |
| `startTime` | `DateTime` | Event start time |
| `endTime` | `DateTime` | Event end time |
| `organizationId` | `OrganizationId` | Tenant reference |

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/calendar-tables` | Database schemas |
| `@beep/calendar-server` | Server infrastructure |
| `@beep/calendar-client` | Client contracts |
