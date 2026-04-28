# @beep/shared-tables

Shared-kernel persistence boundary for cross-slice table and read-model shapes
tied to shared product language.

This package currently proves the shared Organization table metadata and the
shared entity-metadata table constructor used by that proof. It is the narrow
shared-kernel Drizzle exception: metadata-only `pgTable` definitions and index
metadata may live here when they encode shared product language, but live
database access remains banned.

## Belongs Here

- Shared persistence/read-model shapes that multiple slices deliberately agree
  on.
- Mappings tied directly to shared domain language.
- Cross-slice table vocabulary when it is product-semantic and durable.
- Metadata-only Drizzle table constructors tied to shared entity metadata.
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
| `@beep/shared-tables` | Entry point exposing `Entities` and `Table` namespaces. |
| `@beep/shared-tables/*` | Package subpath access for public source modules. |
| `Entities.Organization` | Shared Organization table metadata. |
| `Table.make` | Metadata-only table constructor from shared entity descriptors. |
| `Table.ColumnBuilderFor` | Type alias for one descriptor-derived Drizzle column builder. |
| `Table.ColumnBuilderMapFor` | Type alias for a descriptor-map-derived column builder map. |
| `Table.TableFor` | Type alias for the Drizzle table returned by `Table.make`. |
| `Table.Definition` | Metadata attached to generated tables: entity id, field map, and table name. |
| `Table.WithDefinition` | Type alias for Drizzle tables carrying shared-kernel metadata. |

## Development

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

## License

MIT
