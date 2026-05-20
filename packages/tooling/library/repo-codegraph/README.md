# @beep/repo-codegraph

Schema-first repo codegraph, lookup, and semantic retrieval primitives.

## Purpose

`@beep/repo-codegraph` owns the deterministic lookup layer for repo reuse
guidance. It reads the checked repo export catalog, applies package-local import
policy, ranks public exports, and returns import candidates with boundary
advice.

## Usage

```ts
import {
  RepoCodegraphLookupRequest,
  lookupRepoExports,
  readRepoCodegraphImportPolicies,
  readRepoExportsCatalog,
} from "@beep/repo-codegraph"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const catalog = yield* readRepoExportsCatalog(process.cwd())
  const importPolicies = yield* readRepoCodegraphImportPolicies(process.cwd(), catalog)

  return lookupRepoExports(
    catalog,
    new RepoCodegraphLookupRequest({
      query: "UnknownRecord",
    }),
    { importPolicies }
  )
})
```

The CLI surface lives in `@beep/repo-cli`:

```bash
bun run beep reuse lookup --query UnknownRecord --from packages/tooling/tool/cli --json
```

## Source Of Truth

- `standards/repo-exports.catalog.jsonc` is the deterministic export catalog.
- package-local `beep.importPolicy` records provide canonical import hints.
- architecture boundary advice cites checked-in doctrine rather than graph or
  embedding guesses.

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/repo-codegraph` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
