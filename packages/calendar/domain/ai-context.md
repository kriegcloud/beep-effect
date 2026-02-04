---
path: packages/calendar/domain
summary: Calendar domain layer - entities, value objects, and business rules for event scheduling
tags: [calendar, domain, effect, schema, entities, value-objects]
---

# @beep/calendar-domain

Domain layer for calendar functionality providing strongly-typed entities and value objects for event scheduling, time management, and calendar views. All temporal operations use Effect DateTime for timezone-safe handling.

## Architecture

```
|-------------------|     |----------------------|
|     Entities      | --> |   @beep/shared-domain |
|-------------------|     |----------------------|
         |
         v
|-------------------|
|   Value Objects   |
|-------------------|
         |
         v
|-------------------|     |-----------------|
|   Downstream      | --> | tables, server, |
|   Consumers       |     | client, ui      |
|-------------------|     |-----------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Entities.CalendarEvent` | Core event entity with name, description, audit fields |
| `VO.CalendarColorOption` | Color options for event categorization |
| `VO.CalendarEvent` | Event value object schemas |
| `VO.CalendarFilter` | Filter criteria for event queries |
| `VO.CalendarRange` | Date range representations |
| `VO.CalendarView` | View mode definitions (month, week, day) |
| `VO.DatePickerControl` | Date picker state management |
| `VO.DayGridView` | Day grid layout configuration |
| `VO.ListView` | List view configuration |
| `VO.TimeGridView` | Time grid layout configuration |

## Usage Patterns

### Creating a Calendar Event

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Entities } from "@beep/calendar-domain";
import { CalendarEntityIds } from "@beep/shared-domain";

const createEvent = Effect.gen(function* () {
  const event = Entities.CalendarEvent.Model.make({
    id: CalendarEntityIds.CalendarEventId.create(),
    name: "Team Meeting",
    description: O.some("Weekly sync"),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return event;
});
```

### Using Value Objects

```typescript
import * as S from "effect/Schema";
import { VO } from "@beep/calendar-domain";

// Define calendar view state
const viewState = {
  view: "month" as const,
  range: { start: new Date(), end: new Date() },
  filters: [],
};
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect DateTime over native Date | Timezone-safe temporal operations across the stack |
| Value objects for view state | Immutable, composable configuration for UI components |
| Branded EntityIds | Type-safe entity references preventing ID mixing |
| RFC 5545 recurrence patterns | iCalendar compatibility for interoperability |

## Dependencies

**Internal**:
- `@beep/shared-domain` - Shared entity IDs, common fields, model factories
- `@beep/schema` - Schema helpers (BS utilities)

**External**:
- `effect` - Core Effect types and Schema
- `@effect/sql` - Model class definitions

## Related

- **AGENTS.md** - Detailed contributor guidance for domain authoring
- `packages/calendar/tables` - Drizzle schemas mirroring domain structures
- `packages/calendar/server` - Repositories consuming domain entities
