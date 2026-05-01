# @beep/shared-tables

Shared-kernel persistence boundary for cross-slice table and read-model shapes
tied to shared product language.

This package currently proves the shared Organization table metadata and the
schema-first table projection used by that proof. It is the narrow shared-kernel
Drizzle exception: metadata-only `pgTable` definitions and index metadata may
live here when they encode shared product language, but live database access
remains banned.

## Belongs Here

- Shared persistence/read-model shapes that multiple slices deliberately agree
  on.
- Mappings tied directly to shared domain language.
- Cross-slice table vocabulary when it is product-semantic and durable.
- Metadata-only Drizzle table definitions projected from shared entity schemas.
  Live execution belongs in driver and server packages.

## Does Not Belong Here

- Generic Drizzle, SQL, migration, or database helper libraries.
- Driver wrappers or external infrastructure capability.
- Connections, query execution, live repositories, seeders, and migrations.
- Slice-private persistence shapes.
- Domain behavior or application orchestration.

## Exports

| Export | Role |
| --- | --- |
| `@beep/shared-tables` | Entry point exposing shared concrete table namespaces. |
| `@beep/shared-tables/*` | Package subpath access for public source modules. |
| `Entities.Organization` | Shared Organization table metadata projected with `EntityTable.pgTableFrom(Organization.Model)`. |
| `@beep/shared-tables/table/Table` | Compatibility subpath re-exporting `@beep/drizzle` `EntityTable` type helpers. |

Generic table projection lives in `@beep/drizzle/EntityTable`. Shared table
packages publish concrete shared product table metadata; they do not own a
separate SQL DSL or a domain-to-persistence mapping layer.

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

## License

MIT
