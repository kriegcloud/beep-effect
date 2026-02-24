# Workspaces Migration Kickoff

Date: 2026-02-12

## Decisions Locked

- `workspaces` remains a vertical slice, not `packages/shared/*`.
- Existing `documents` packages are treated as the legacy implementation surface.
- Migration must be incremental and non-breaking; old imports continue to work while we transition.

## Domain Direction

The ambiguity is real: `Document` currently overlaps with `Page` and has become a catch-all. The replacement model should separate concerns:

- `Workspace`: tenant-owned boundary for context and collaboration.
- `WorkspaceItem`: canonical item inside a workspace (page, file, external source, etc).
- `Page`: rich-text/editable content item type (instead of using `Document` as the generic name).
- `SourceLink`/provenance: explicit mapping from external systems (gmail/calendar/front/etc) to internal workspace items.

This avoids overloading "document" while preserving provenance and AI-context assembly use cases.

## Phase Plan

1. Compatibility phase (done in this change): add `@beep/workspaces-*` facades that re-export `@beep/documents-*`.
2. Import migration phase: switch consumers from `@beep/documents-*` to `@beep/workspaces-*` package-by-package.
3. Semantic migration phase: rename entities/contracts/tables from document-centric language to workspace-centric language.
4. Cleanup phase: remove `@beep/documents-*` packages and aliases after all consumers are moved.

## Completed In This Kickoff

- Added new compatibility packages:
  - `@beep/workspaces-domain`
  - `@beep/workspaces-tables`
  - `@beep/workspaces-server`
  - `@beep/workspaces-client`
  - `@beep/workspaces-ui`
- Added root workspace discovery for `packages/workspaces/*`.
- Added TypeScript path aliases for all `@beep/workspaces-*` package names.
- Migrated initial internal consumer (`@beep/db-admin`) imports from documents aliases to workspaces aliases.

## Next Suggested Slice-Level Work

1. Migrate runtime/server and app-level imports to `@beep/workspaces-*` aliases.
2. Introduce `Workspace` + `WorkspaceItem` domain models in the new slice facade.
3. Define a strict item taxonomy before renaming tables (page, file, source, thread, event snapshot).
4. Plan SQL/table rename strategy with compatibility views or dual-write period.
