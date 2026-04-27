# Shared Kernel

`packages/shared` is the DDD shared-kernel package family for beep-effect.
It holds product language that multiple slices deliberately agree to share.
It is not a home for generic helpers, technical wrappers, or slice-local code
that has not found its owner yet.

The shared kernel is intentionally small. The current packages are mostly
scaffolded: the non-domain leaves currently expose `VERSION` from `src/index.ts`,
while `domain/` also contains scaffolded role folders for shared aggregates,
entities, identity, values, and a future `LocalDate` value object. The package
docs describe the boundary each package is allowed to grow into.

## Package Map

| Path | Package | Role |
| --- | --- | --- |
| `domain/` | `@beep/domain` | Cross-slice domain concepts, values, schemas, domain events, and pure behavior. |
| `config/` | `@beep/config` | Cross-slice typed config contracts and config vocabulary. |
| `use-cases/` | `@beep/use-cases` | Contract-only commands, queries, DTOs, protocols, product ports, and actionable application errors. |
| `client/` | `@beep/client` | Browser-safe shared client boundary for cross-slice product semantics. |
| `server/` | `@beep/server` | Server-only shared-kernel boundary for cross-slice product semantics that must stay driver-neutral. |
| `tables/` | `@beep/tables` | Shared persistence/read-model shapes only when they encode shared product language. |
| `ui/` | `@beep/ui` | Shared-kernel UI boundary for cross-slice product concepts, not product-agnostic primitives. |

## Promotion Bar

Add code here only when all of these are true:

- Multiple slices intentionally agree on the same product meaning.
- The concept is durable enough that shared coupling is worth the cost.
- The code can remain free of product-slice imports and driver imports.
- The role matches one of the package boundaries above.

If the code is reusable but domain-agnostic, put it in the appropriate
foundation family. If it belongs to one product area, keep it in that slice.

## Boundary Rules

- `shared/domain` and `shared/config` are the normal shared-kernel homes.
- `shared/use-cases`, `shared/client`, `shared/server`, `shared/tables`, and
  `shared/ui` are exceptional and need a clear cross-slice product contract.
- `shared/use-cases` is contract-only. Do not add workflows, handlers, concrete
  adapters, driver imports, persistence, clients, transports, or live Layers.
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
bun run lint
```

Or run targeted Turbo checks from the repo root:

```bash
bunx turbo run check --filter=@beep/domain
bunx turbo run test --filter=@beep/domain
bunx turbo run lint --filter=@beep/domain
```
