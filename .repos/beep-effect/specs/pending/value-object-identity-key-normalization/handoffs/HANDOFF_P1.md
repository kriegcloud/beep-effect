# HANDOFF P1: value-object-identity-key-normalization

## Status

- Calendar baseline migration: complete.
- Remaining slice migration: not started.

## Calendar Baseline (Already Done)

### File Renames
- `packages/calendar/domain/src/values/calendar-event.value.ts` -> `packages/calendar/domain/src/values/CalendarEvent.value.ts`
- `packages/calendar/domain/src/values/calendar-filter.value.ts` -> `packages/calendar/domain/src/values/CalendarFilter.value.ts`
- `packages/calendar/domain/src/values/calendar-range.value.ts` -> `packages/calendar/domain/src/values/CalendarRange.value.ts`
- `packages/calendar/domain/src/values/calendar-view.value.ts` -> `packages/calendar/domain/src/values/CalendarView.value.ts`
- `packages/calendar/domain/src/values/date-picker-control.value.ts` -> `packages/calendar/domain/src/values/DatePickerControl.value.ts`
- `packages/calendar/domain/src/values/day-grid-view.value.ts` -> `packages/calendar/domain/src/values/DayGridView.value.ts`
- `packages/calendar/domain/src/values/list-view.value.ts` -> `packages/calendar/domain/src/values/ListView.value.ts`
- `packages/calendar/domain/src/values/time-grid-view.value.ts` -> `packages/calendar/domain/src/values/TimeGridView.value.ts`

### Identity Key Changes
All calendar value-object keys now follow:
- `values/CalendarColorOption.value`
- `values/CalendarEvent.value`
- `values/CalendarFilter.value`
- `values/CalendarRange.value`
- `values/CalendarView.value`
- `values/DatePickerControl.value`
- `values/DayGridView.value`
- `values/ListView.value`
- `values/TimeGridView.value`

### Import/Export Changes
- Updated `packages/calendar/domain/src/values/index.ts` exports to PascalCase file names.
- Updated intra-folder import in `CalendarFilter.value.ts` for `DatePickerControl.value`.

### Verification
- No stale kebab-case calendar value-object import paths found via `rg`.
- `bun run --cwd packages/calendar/domain check` passed.

## Remaining Slices to Migrate

- `packages/iam/domain`
- `packages/workspaces/domain`
- `packages/knowledge/domain`
- `packages/comms/domain`
- `packages/shared/domain`
- `packages/customization/domain`

## Known Edge Cases

1. Directory naming drift:
- Most remaining slices still use `src/value-objects`.

2. Identity key drift examples:
- `values/count-result.value` (kebab + .value)
- `values/ClassIri` (Pascal but no `.value`)
- `values/logging.values` (plural `.values`)

3. Non-standard filenames:
- Some files in value-object folders are not `*.value.ts` (for example `SerializedEditorState.ts`, `Query.ts`, `Plan.ts`).
- Decide explicitly whether to convert or document as exceptions.
