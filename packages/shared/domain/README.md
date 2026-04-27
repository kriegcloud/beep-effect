# @beep/shared-domain

Shared-kernel domain language for cross-slice product concepts, values, schemas,
and pure behavior.

This package contains the shared entity kernel, shared identity vocabulary, the
Organization proof, and shared value-object modules. Future exports should be
added only when multiple slices deliberately agree on the same driver-neutral
product meaning.

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

- `@beep/shared-domain`
- `@beep/shared-domain/*`
- `VERSION`
- `Entities.Organization`
- `BaseEntity`
- `EntityId`
- `EntityMixin`
- `EntityRef`
- `Identity.Shared`
- `Values.LocalDate`

## Source Map

| Path                                         | Intended role                                          |
|----------------------------------------------|--------------------------------------------------------|
| `src/aggregates/index.ts`                    | Shared aggregate roots and aggregate-level vocabulary. |
| `src/entities/index.ts`                      | Shared identity-bearing concepts, including `Organization`. |
| `src/entities/Organization/`                 | Organization model, value vocabulary, and pure behavior. |
| `src/entity/`                                | Shared entity-id, base-entity, mixin, principal, and reference constructors. |
| `src/identity/index.ts`                      | Shared entity-id modules and identity vocabulary.      |
| `src/values/index.ts`                        | Shared value objects.                                  |
| `src/values/LocalDate/index.ts`              | Shared `LocalDate` value-object barrel.                |
| `src/values/LocalDate/LocalDate.model.ts`    | Shared `LocalDate` schema/model.                       |
| `src/values/LocalDate/LocalDate.behavior.ts` | Pure `LocalDate` behavior.                             |

## Development

```bash
bun run check
bun run test
bun run lint
```

## License

MIT
