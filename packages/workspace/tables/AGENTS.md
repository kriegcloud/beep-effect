# @beep/workspace-tables Agent Guide

## Purpose & Fit

- Workspace persistence boundary for metadata-only table projections.
- Owns concrete workspace product table metadata projected from
  `@beep/workspace-domain` entity schemas.
- This package closes the former `schema-to-drizzle-projection` product-slice
  proof for `CandidateDraft` and `CandidateProject`.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `Entities`, `DbSchema` | Package entry point. |
| `src/entities/CandidateDraft/` | `Table` | Workspace CandidateDraft table metadata. |
| `src/entities/CandidateProject/` | `Table` | Workspace CandidateProject table metadata. |
| `src/Schema.ts` | `DbSchema` | Metadata-only aggregate for exported workspace tables. |

## Add Here

- Workspace persistence and read-model shapes that are workspace product
  language.
- Metadata-only Drizzle table definitions projected from workspace domain
  entity schemas.

## Keep Out

- Live database access, query execution, repositories, server Layers,
  transactions, migrations, and seeders.
- Generic Drizzle/SQL/database helpers and driver wrappers.
- Shared-kernel or other product-slice table definitions.

## Laws

- Keep table meaning tied to workspace domain language.
- Generic projection belongs in `@beep/drizzle`; this package only
  publishes concrete workspace tables.
- In `test/` and `dtslint/`, import package source through
  `@beep/workspace-tables` or other `@beep/*` package aliases; keep relative
  imports for local helpers, fixtures, and snapshots only.

## Verifications

- `bun run --cwd packages/workspace/tables check`
- `bun run --cwd packages/workspace/tables test`
- `bun run --cwd packages/workspace/tables docgen`
- `bun run --cwd packages/workspace/tables lint`
