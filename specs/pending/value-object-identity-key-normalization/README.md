# value-object-identity-key-normalization

> Normalize domain value-object identity keys and file naming to a single convention: `values/<PascalName>.value`.

---

## Objective

Apply the same migration that was completed in `packages/calendar/domain/src/values` to the remaining slice domain packages:

- `packages/iam/domain`
- `packages/workspaces/domain`
- `packages/knowledge/domain`
- `packages/comms/domain`
- `packages/shared/domain`
- `packages/customization/domain`

This includes identity key normalization, filename normalization, directory naming normalization (`value-objects` -> `values` where applicable), and import/export updates.

---

## Baseline Completed (Calendar)

The calendar slice migration is complete and verified. Applied pattern:

1. Renamed value-object files from kebab-case to PascalCase:
   - `calendar-event.value.ts` -> `CalendarEvent.value.ts`
   - `calendar-filter.value.ts` -> `CalendarFilter.value.ts`
   - `calendar-range.value.ts` -> `CalendarRange.value.ts`
   - `calendar-view.value.ts` -> `CalendarView.value.ts`
   - `date-picker-control.value.ts` -> `DatePickerControl.value.ts`
   - `day-grid-view.value.ts` -> `DayGridView.value.ts`
   - `list-view.value.ts` -> `ListView.value.ts`
   - `time-grid-view.value.ts` -> `TimeGridView.value.ts`
2. Updated identity composer keys to `values/<PascalName>.value`.
3. Updated local imports and barrel exports to new file names.
4. Verified no stale references with repo grep.
5. Verified compilation with:
   - `bun run --cwd packages/calendar/domain check`

---

## Current State of Remaining Slices

- `packages/iam/domain/src/values` exists but currently only contains `index.ts`.
- `packages/workspaces/domain/src/value-objects` exists with mixed naming.
- `packages/knowledge/domain/src/value-objects` exists with mixed casing, nested folders (`rdf`, `sparql`, `reasoning`), and mixed identity key formats.
- `packages/comms/domain/src/value-objects` exists; current identity keys include `.values` (plural) suffixes.
- `packages/shared/domain/src/value-objects` exists with non-`.value.ts` files.
- `packages/customization/domain/src/value-objects` exists (currently minimal).

---

## Migration Rules

1. Directory convention:
   - Target directory name is `src/values`.
   - If a package currently uses `src/value-objects`, migrate to `src/values`.

2. File naming convention for value objects:
   - Use `PascalCase.value.ts` when the file defines a value object.
   - Preserve nested subdirectory segments where they are semantically meaningful (e.g. `values/rdf/NamedGraph.value.ts` if renamed).

3. Identity key convention:
   - `const $I = $<Slice>DomainId.create("values/<PascalName>.value")`
   - For nested groups: `values/<group>/<PascalName>.value`.
   - Eliminate legacy variants: `value-objects/...`, kebab-case keys, missing `.value`, plural `.values`.

4. Import/export updates:
   - Update all dependent imports after file/directory renames.
   - Update each `values/index.ts` barrel accordingly.

5. Safety constraints:
   - Do not change public type names unless required by compile errors.
   - Keep behavior unchanged; this is a naming/identity normalization pass.

---

## Execution Plan

### Phase 1: Inventory

- Build per-slice inventory of:
  - file path
  - exported value object symbol
  - existing `$I` key
  - target file path
  - target `$I` key
- Save as `outputs/value-object-inventory.md`.

### Phase 2: Rename and Rewrite

- Rename files/directories using TypeScript-aware refactoring so imports update automatically.
- Rewrite `$I` keys to canonical format.
- Update index barrels and any direct imports that were not auto-updated.

### Phase 3: Verification

- Grep for stale patterns in targeted slices:
  - `value-objects`
  - kebab-case identity key patterns
  - `.values` suffix
- Run checks for each changed package:
  - `bun run --cwd packages/<slice>/domain check`

### Phase 4: Report

- Produce `outputs/migration-notes.md`:
  - exact files renamed
  - identity keys changed
  - exceptional/manual decisions
  - unresolved issues (if any)

---

## Definition of Done

- [ ] Target slices use `src/values` where applicable
- [ ] Value-object files are normalized to `PascalCase.value.ts` (or documented exception)
- [ ] All `$I` keys use `values/<PascalName>.value` (or nested equivalent)
- [ ] All imports/exports resolve without stale paths
- [ ] Package checks pass for changed domain packages
- [ ] Notes are documented in `outputs/migration-notes.md`

---

## Entry Points

- Handoff context: `specs/pending/value-object-identity-key-normalization/handoffs/HANDOFF_P1.md`
- Execution prompt: `specs/pending/value-object-identity-key-normalization/handoffs/P1_ORCHESTRATOR_PROMPT.md`
