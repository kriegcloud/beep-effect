# beep-effect2 Monorepo

## Architecture

Effect v4 TypeScript monorepo using Bun, Turborepo, and changesets.

```
packages/common/*   - Shared kernel (types, schema, data, identity, utils, messages, ontology)
packages/shared/*   - Cross-cutting shared services (domain, env)
tooling/*           - Developer tooling (cli, repo-utils, codebase-search)
apps/*              - Applications (web)
```

## Effect v4 Conventions (MANDATORY)

- **Namespace imports**: `import * as Effect from "effect/Effect"`, `import * as A from "effect/Array"`
- **No native collections**: Use `effect/Array`, `effect/Option`, `MutableHashMap` instead of native Array/Map/Set methods
- **No type assertions**: Never use `as X` (except `as const`). Fix types properly.
- **Tagged errors**: Use `S.TaggedErrorClass` from `effect/Schema`, never `Data.TaggedError`
- **Schema annotations**: Every schema must have `identifier`, `title`, `description`
- **Effect.fn**: Use `Effect.fn` for all functions returning Effects
- **Schema-based JSON**: Use `Schema.decodeUnknownEffect`/`encodeUnknownEffect`, never `JSON.parse`/`stringify`
- **Console output**: `Console.log`/`Console.error` for CLI output, `Effect.log` for diagnostics

## Commands

| Command | Purpose |
|---------|---------|
| `bun run build` | Build all packages (Turborepo) |
| `bun run check` | TypeScript type checking |
| `bun run test` | Run unit tests (Vitest) + type tests (tstyche) |
| `bun run lint` | Biome + ESLint JSDoc + circular deps + docgen |
| `bun run lint:spell` | cspell spell checking |
| `bun run lint:markdown` | markdownlint |
| `bun run lint:fix` | Auto-fix with Biome |
| `bun run beep <cmd>` | Monorepo CLI (codegen, create-package, topo-sort, version-sync) |

## Testing

- **Unit tests**: `npx vitest run` (NEVER `bun test`)
- **Type tests**: `bun run test:types` (tstyche, files in `**/dtslint/**/*.tst.*`)
- **Effect tests**: `it.effect("name", () => Effect.gen(function*() { ... }))`
- **Coverage**: Vitest v8 provider, thresholds in `vitest.shared.ts`

## Package Guidelines

- Every export needs `/** @since 0.0.0 */` JSDoc
- Each package has its own `CLAUDE.md` and `AGENTS.md` with specific guidance
- Catalog dependencies: add to root `catalog` first, then use `catalog:` in package
- Build config: packages extend `../../tsconfig.base.json`

## Git Hooks (Lefthook)

- **pre-commit**: Biome format/lint, ESLint JSDoc, gitleaks, typos
- **commit-msg**: Conventional commits (commitlint)
- **pre-push**: Full build + check + test
- **post-merge**: Version sync check

## CI

Quality gates in `.github/workflows/check.yml`: build, typecheck, lint, test, spell check, markdown lint, syncpack, audit, changeset status, gitleaks, OSV-Scanner, dependency review, Semgrep SAST.
