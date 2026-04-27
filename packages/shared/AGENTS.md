# Shared Kernel Agent Guide

## Scope

This guide applies to `packages/shared/**`. More specific package guides under
the leaf package directories add role-level details.

## Mission

Keep the shared kernel small, deliberate, and aligned with the architecture
standard. Shared code is cross-slice product language, not a convenience bucket.

## Start Here

- Read `standards/ARCHITECTURE.md` and the relevant file under
  `standards/architecture/` before changing package boundaries.
- Treat `standards/architecture/02-shared-kernel.md` as the primary rulebook for
  this directory.
- Check the current leaf package source before assuming a package already owns a
  runtime surface. These packages are scaffolded; `domain/` also has empty
  domain-kind modules and a `values/LocalDate` placeholder.

## Package Roles

| Package | Add only when the content is |
| --- | --- |
| `@beep/domain` | Driver-neutral shared product concepts, values, schemas, domain events, and pure behavior. |
| `@beep/config` | Shared typed config contracts, config vocabulary, redacted-secret contracts, and test config utilities. |
| `@beep/use-cases` | Contract-only commands, queries, DTOs, protocols, product ports, facades, and actionable application errors. |
| `@beep/client` | Browser-safe shared client adapters, state, services, and command/query clients tied to shared product semantics. |
| `@beep/server` | Server-only shared product boundary helpers that remain driver-neutral and do not aggregate slices. |
| `@beep/tables` | Shared persistence/read-model shapes tied to shared product language. |
| `@beep/ui` | Cross-slice product UI concepts, forms, and display contracts tied to shared domain language. |

## Rules

- Prefer keeping code in a concrete slice until multiple slices deliberately
  agree on the same product semantics.
- Prefer foundation packages for reusable domain-agnostic substrate.
- Do not import product slices, drivers, tooling packages, or agent bundles from
  `shared/*`.
- Do not add global registries, God Layers, catch-all config objects, or
  app-wide aggregation here.
- Keep `shared/use-cases` contract-only: no workflows, schedulers, handlers,
  concrete adapters, transports, persistence, driver imports, or live Layers.
- Keep config browser safety explicit: client code may consume only `/public`
  config surfaces when those surfaces exist.
- Keep new domain payloads, wire payloads, persisted shapes, and config payloads
  schema-first when Effect Schema can represent them.
- Add tests and JSDoc/docgen metadata when new exported behavior appears.

## Verification

Use package-local checks for the leaf package you touched:

```bash
bun run check
bun run test
bun run lint
```

For repo-root targeted checks, use Turbo filters:

```bash
bunx turbo run check --filter=@beep/domain
bunx turbo run test --filter=@beep/domain
bunx turbo run lint --filter=@beep/domain
```

Replace `@beep/domain` with the touched shared package.
