# @beep/shared-tables Agent Guide

## Purpose & Fit

- Shared-kernel persistence boundary for cross-slice table and read-model shapes
  tied to shared product language.
- This package currently proves shared Organization table metadata plus the
  shared entity-metadata table constructor used by that proof. New exports must
  be product-semantic, not generic database helpers or live database access.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `Entities`, `Table` | Current package entry point. |
| `src/entities/Organization/` | `Table` | Shared Organization table metadata. |
| `src/table/Table.ts` | `make`, `ColumnBuilderFor`, `ColumnBuilderMapFor`, `TableFor`, `Definition`, `WithDefinition` | Metadata-only table constructor plus public metadata/type aliases tied to shared entity metadata. |

## Add Here

- Shared persistence shapes, read-model shapes, and mappings that multiple
  slices deliberately share as product language.
- Metadata-only Drizzle table construction from shared entity descriptors.

## Keep Out

- Generic Drizzle/SQL/database helpers, driver wrappers, migration tooling,
  slice-private tables, domain behavior, and application orchestration.
- Connections, query execution, live database access, seeders, migrations, and
  repository abstractions.

## Laws

- Keep table meaning tied to shared domain language.
- The only Drizzle allowance is metadata-only `pgTable` definition and index
  construction from shared-domain descriptors.
- Do not turn this package into a generic driver or database utility package.
- Do not import product slices.

## Verifications

- `bunx turbo run check --filter=@beep/shared-tables`
- `bunx turbo run test --filter=@beep/shared-tables`
- `bunx turbo run docgen --filter=@beep/shared-tables`
- `bunx turbo run lint --filter=@beep/shared-tables`
