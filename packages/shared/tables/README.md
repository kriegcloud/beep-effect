# @beep/tables

Shared-kernel persistence boundary for cross-slice table and read-model shapes
tied to shared product language.

This package is currently scaffolded. Its public surface exports `VERSION` from
`src/index.ts`; future exports should represent shared product persistence
shape, not generic database capability.

## Belongs Here

- Shared persistence/read-model shapes that multiple slices deliberately agree
  on.
- Mappings tied directly to shared domain language.
- Cross-slice table vocabulary when it is product-semantic and durable.

## Does Not Belong Here

- Generic Drizzle, SQL, migration, or database helper libraries.
- Driver wrappers or external infrastructure capability.
- Slice-private persistence shapes.
- Domain behavior or application orchestration.

## Exports

- `@beep/tables`
- `@beep/tables/*`
- `VERSION`

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
