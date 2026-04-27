# @beep/domain

Shared-kernel domain language for cross-slice product concepts, values, schemas,
and pure behavior.

This package is currently scaffolded. The package root exports `VERSION` from
`src/index.ts`, and the source tree contains shared-domain role modules for
aggregates, entities, identity, values, and a future `LocalDate` value object.
Future exports should be added only when multiple slices deliberately agree on
the same driver-neutral product meaning.

## Belongs Here

- Shared value objects and schema-first models tied to product language.
- Shared domain events, pure policies, guards, and lifecycle behavior.
- Driver-neutral access vocabulary and invariants that multiple slices reuse.

## Does Not Belong Here

- Slice-private entities or partially promoted domain models.
- Runtime configuration, `ConfigProvider`, environment access, or secrets.
- Persistence, client, server, UI, drivers, workflow orchestration, or adapters.
- Generic schema helpers that belong in foundation modeling packages.

## Exports

- `@beep/domain`
- `@beep/domain/*`
- `VERSION`

## Source Map

| Path | Intended role |
| --- | --- |
| `src/aggregates/index.ts` | Shared aggregate roots and aggregate-level vocabulary. |
| `src/entities/index.ts` | Shared identity-bearing concepts. |
| `src/identity/index.ts` | Shared entity-id modules and identity vocabulary. |
| `src/values/index.ts` | Shared value objects. |
| `src/values/LocalDate/index.ts` | Future shared `LocalDate` value-object barrel. |
| `src/values/LocalDate/LocalDate.model.ts` | Future shared `LocalDate` schema/model. |
| `src/values/LocalDate/LocalDate.behavior.ts` | Future pure `LocalDate` behavior. |

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
