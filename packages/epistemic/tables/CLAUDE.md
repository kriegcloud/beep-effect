# @beep/epistemic-tables Agent Guide

## Purpose & Fit

- Epistemic persistence boundary for metadata-only table projections.
- Owns concrete epistemic product table metadata projected from
  `@beep/epistemic-domain` entity schemas.
- Provides the `usage_record` projection backing the real UsageRecord sink.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `Entities`, `DbSchema` | Package entry point. |
| `src/entities/UsageRecord/` | `Table`, `toUsageRecordInsert`, `fromUsageRecordRow` | Epistemic UsageRecord table metadata and row converters. |
| `src/Schema.ts` | `DbSchema` | Metadata-only aggregate for exported epistemic tables. |

## Add Here

- Epistemic persistence and read-model shapes that are epistemic product
  language.
- Metadata-only Drizzle table definitions projected from epistemic domain
  entity schemas.

## Keep Out

- Live database access, query execution, repositories, server Layers,
  transactions, migrations, and seeders.
- Generic Drizzle/SQL/database helpers and driver wrappers.
- Shared-kernel or other product-slice table definitions.

## Laws

- Keep table meaning tied to epistemic domain language.
- Generic projection belongs in `@beep/drizzle`; this package only
  publishes concrete epistemic tables.
- In `test/` and `dtslint/`, import package source through
  `@beep/epistemic-tables` or other `@beep/*` package aliases; keep relative
  imports for local helpers, fixtures, and snapshots only.

## Verifications

- `bun run --cwd packages/epistemic/tables check`
- `bun run --cwd packages/epistemic/tables test`
- `bun run --cwd packages/epistemic/tables docgen`
- `bun run --cwd packages/epistemic/tables lint`
