# @beep/calendar-ui — Agent Guide

## Purpose & Fit
- React components for calendar display and event management.
- Provides CalendarView, EventForm, and scheduling interface components.
- Consumes `@beep/calendar-client` for data fetching.
- Part of the calendar vertical's UI layer.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for UI components.
- **Components** — React components for calendar views and event interaction.

## Usage Snapshots
- `apps/todox/` — Imports calendar UI components for scheduling views.
- `apps/todox/` — May integrate calendar features in task scheduling.

## Authoring Guardrails
- ALWAYS use `@beep/ui` and `@beep/ui-core` for base component patterns.
- Components MUST follow Effect-atom patterns for state management.
- NEVER use native fetch; use Effect-based data fetching via client contracts.
- Date display MUST respect user timezone preferences.

## Quick Recipes
```tsx
import * as React from "react";
import { CalendarView } from "@beep/calendar-ui";

export const CalendarPage: React.FC = () => {
  return (
    <CalendarView
      view="month"
      onEventClick={(event) => console.log("Event:", event.id)}
      onDateSelect={(date) => console.log("Selected:", date)}
    />
  );
};
```

## Verifications
- `bun run check --filter @beep/calendar-ui`
- `bun run lint --filter @beep/calendar-ui`
- `bun run test --filter @beep/calendar-ui`

## Contributor Checklist
- [ ] Components use Effect-atom for state management.
- [ ] Timezone handling respects user preferences.
- [ ] Accessibility attributes included for date navigation.
