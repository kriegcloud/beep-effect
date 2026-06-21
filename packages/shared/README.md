# Shared Kernel

`packages/shared` is the DDD shared-kernel package family for beep-effect.
It holds product language that multiple slices deliberately agree to share.
It is not a home for generic helpers, technical wrappers, or slice-local code
that has not found its owner yet.

The shared kernel is intentionally small. The active leaves are `domain/` and
`tables/`: they currently prove the shared entity kernel, the shared table
metadata boundary, and the `LocalDate` value object.

`config/`, `use-cases/`, `client/`, `server/`, and `ui/` are reserved roles, not
package directories today. In particular, `shared/use-cases` does not exist yet:
nothing has met the bar for a durable cross-slice contract that deserves that
coupling.

## Package Map

| Path | Package | Status | Role |
| --- | --- | --- | --- |
| `domain/` | `@beep/shared-domain` | Active | Cross-slice domain concepts, values, schemas, domain events, and pure behavior. |
| `tables/` | `@beep/shared-tables` | Active | Shared persistence/read-model metadata only when it encodes shared product language. |

Reserved future roles: `config/`, `use-cases/`, `client/`, `server/`, and `ui/`.
Create one only when the promotion bar below is met by real exported behavior.

## Promotion Bar

Add code here only when all of these are true:

- Multiple slices intentionally agree on the same product meaning.
- The concept is durable enough that shared coupling is worth the cost.
- The code can remain free of product-slice imports and driver imports.
- The role matches one of the package boundaries above.

If the code is reusable but domain-agnostic, put it in the appropriate
foundation family. If it belongs to one product area, keep it in that slice.

## Boundary Rules

- `shared/domain` is the normal shared-kernel home today. `shared/config` is a
  reserved normal role; create it only for real cross-slice typed config
  contracts.
- `shared/use-cases`, `shared/client`, `shared/server`, and `shared/ui` are
  reserved exceptional roles. `shared/tables` is active but still requires a
  clear cross-slice product contract.
- A future `shared/use-cases` package would be contract-only. Do not create one
  for workflows, handlers, concrete adapters, driver imports, persistence,
  clients, transports, or live Layers.
- `shared/tables` has one narrow Drizzle exception: it may build metadata-only
  `pgTable` definitions and indexes from shared-domain descriptors. It must not
  open connections, execute queries, own migrations, expose repositories, or
  become a live database package.
- `shared/*` packages do not import product slices, drivers, tooling packages,
  or agent bundles.
- Product-agnostic UI primitives belong in the foundation UI-system package, not
  the shared kernel.
- Config packages model typed application/runtime configuration contracts; they
  are not broad constants packages or global config registries.

## Reference Docs

- `standards/ARCHITECTURE.md`
- `standards/architecture/02-shared-kernel.md`
- `standards/architecture/03-driver-boundaries.md`
- `standards/architecture/05-layer-composition.md`
- `standards/architecture/06-configuration-boundaries.md`
- `standards/architecture/GLOSSARY.md`

## Development

Run commands from the leaf package directory when working in one package:

```bash
bun run check
bun run test
bun run docgen
bun run lint
```

Or run targeted Turbo checks from the repo root:

```bash
bunx turbo run check --filter=@beep/shared-domain
bunx turbo run test --filter=@beep/shared-domain
bunx turbo run docgen --filter=@beep/shared-domain
bunx turbo run lint --filter=@beep/shared-domain
```
