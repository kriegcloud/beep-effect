---
path: packages/calendar/ui
summary: Calendar UI components - React views for event display, scheduling, and calendar navigation
tags: [calendar, ui, react, components, scheduling, effect-atom]
---

# @beep/calendar-ui

React component library for calendar display and event management. Provides CalendarView, event forms, and scheduling interface components using Effect-atom patterns for state management. Respects user timezone preferences for date display.

## Architecture

```
|-------------------|     |------------------|
|   UI Components   | --> | @beep/ui-core    |
|-------------------|     | @beep/ui         |
         |                |------------------|
         v
|-------------------|     |----------------------|
|   Effect-Atom     | --> | State Management     |
|   State           |     |----------------------|
         |
         v
|-------------------|     |----------------------|
| @beep/calendar-   | --> | Data Fetching        |
| client            |     |----------------------|
         |
         v
|-------------------|
|    Web Apps       |
| (apps/todox, etc) |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `components` | React components for calendar views (pending implementation) |
| `hooks` | Custom hooks for calendar state and data (pending implementation) |

## Usage Patterns

### Calendar View Component

```tsx
import * as React from "react";
// import { CalendarView } from "@beep/calendar-ui";

export const CalendarPage: React.FC = () => {
  return (
    <div>
      {/* <CalendarView
        view="month"
        onEventClick={(event) => console.log("Event:", event.id)}
        onDateSelect={(date) => console.log("Selected:", date)}
      /> */}
    </div>
  );
};
```

### Event Form Pattern

```tsx
import * as React from "react";
// import { EventForm } from "@beep/calendar-ui";

export const CreateEventPage: React.FC = () => {
  return (
    <div>
      {/* <EventForm
        onSubmit={(event) => handleCreate(event)}
        defaultDate={new Date()}
      /> */}
    </div>
  );
};
```

### View Mode Selection

```tsx
// Calendar supports multiple view modes
type ViewMode = "month" | "week" | "day" | "list";

// <CalendarView view={currentView} onViewChange={setView} />
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect-atom state management | Consistent with codebase patterns, fine-grained reactivity |
| Timezone-aware display | User preferences respected, UTC storage with local display |
| Base components from @beep/ui | Consistent styling and accessibility across the app |
| Effect-based data fetching | No native fetch, composable error handling |

## Dependencies

**Internal**:
- `@beep/calendar-client` - Data fetching contracts (implicit consumer)
- `@beep/ui` - Base UI components (implicit consumer)
- `@beep/ui-core` - Core component patterns (implicit consumer)

**External**:
- `effect` - Core Effect runtime

**Dev**:
- `@babel/preset-react` - React JSX transformation
- `babel-plugin-transform-next-use-client` - Next.js client directive support

## Related

- **AGENTS.md** - Detailed contributor guidance for UI authoring
- `packages/calendar/client` - Data fetching contracts
- `packages/ui` - Base component library
