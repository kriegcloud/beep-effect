# @beep/calendar-ui

React components for calendar display and event management.

## Overview

This package provides UI components for the calendar vertical:
- Calendar view components (day, week, month)
- Event creation and editing forms
- Scheduling interface components

## Installation

```bash
bun add @beep/calendar-ui
```

## Key Exports

| Export | Description |
|--------|-------------|
| Components | React components for calendar display |

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/calendar-client` | Client contracts for data fetching |
| `@beep/ui` | Base UI component library |
| `@beep/ui-core` | Core UI utilities |
| `react` | React framework |

## Usage

```tsx
import * as React from "react";
import { CalendarView } from "@beep/calendar-ui";

export const CalendarPage: React.FC = () => {
  return (
    <CalendarView
      view="month"
      onEventClick={(event) => console.log("Event:", event)}
      onDateSelect={(date) => console.log("Selected:", date)}
    />
  );
};
```

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/calendar-domain` | Domain models |
| `@beep/calendar-client` | Client contracts |
| `@beep/ui` | Base components |
