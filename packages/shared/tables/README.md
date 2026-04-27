# @beep/shared-tables

Shared-kernel persistence boundary for cross-slice table and read-model shapes
tied to shared product language.

This package currently proves the shared Organization table metadata and the
shared entity-metadata table constructor used by that proof. It represents
shared product persistence shape, not generic database execution capability.

## Belongs Here

- Shared persistence/read-model shapes that multiple slices deliberately agree
  on.
- Mappings tied directly to shared domain language.
- Cross-slice table vocabulary when it is product-semantic and durable.
- Metadata-only table constructors tied to shared entity metadata. Live
  execution belongs in driver and server packages.

## Does Not Belong Here

- Generic Drizzle, SQL, migration, or database helper libraries.
- Driver wrappers or external infrastructure capability.
- Slice-private persistence shapes.
- Domain behavior or application orchestration.

## Exports

- `@beep/shared-tables`
- `@beep/shared-tables/*`
- `Entities.Organization`
- `Table.make`

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
