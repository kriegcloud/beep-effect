# @beep/epistemic-tables

Epistemic persistence boundary for metadata-only table projections.

This package owns epistemic slice table metadata projected from epistemic domain
entity schemas. It provides the `usage_record` table projection that backs the
real UsageRecord sink used by the desktop chat surface.

## Belongs Here

- Epistemic slice table metadata projected from epistemic domain entity schemas.
- Read-model and table shapes when they are epistemic product language.
- Metadata-only Drizzle table definitions created with
  `EntityTable.pgTableFrom(entity)`.

## Does Not Belong Here

- Live database access, repositories, server Layers, or transactions.
- Migrations, seeders, or runtime database setup.
- Cross-slice shared-kernel tables.
- Generic Drizzle, SQL, or database helper libraries.

## Exports

| Export | Role |
| --- | --- |
| `@beep/epistemic-tables` | Entry point exposing `Entities` and `DbSchema`. |
| `@beep/epistemic-tables/entities` | Epistemic entity table namespaces. |
| `@beep/epistemic-tables/entities/UsageRecord` | `UsageRecord.Table` metadata and row converters. |

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

Tests and dtslint files import package source through
`@beep/epistemic-tables` or other `@beep/*` aliases. Use relative imports only
for local helpers, fixtures, and snapshots.

## License

MIT
