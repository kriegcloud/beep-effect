# @beep/repo-codegraph Agent Guide

## Purpose & Fit
- Owns schema-first repo export catalog decoding, package import policy parsing,
  and deterministic lookup/ranking for agent-facing reuse guidance.
- Belongs to `tooling/library`: repo-operational analysis support code, not
  product slice language, shared-kernel product semantics, or a runtime driver.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| catalog models | `RepoExportsCatalog`, `RepoExportsCatalogEntry` | Generated public export facts from `standards/repo-exports.catalog.jsonc` |
| catalog IO | `readRepoExportsCatalog`, `readRepoCodegraphImportPolicies` | Reads checked catalog and package-local `beep.importPolicy` records |
| lookup models | `RepoCodegraphLookupRequest`, `RepoCodegraphLookupResult` | Machine-readable request and response schemas |
| lookup | `lookupRepoExports` | Deterministic symbol and intent lookup with import guidance |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep deterministic catalog facts authoritative over semantic, embedding, or
  graph hints.
- Keep public import recommendations limited to package export-map surfaces.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/repo-codegraph` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import {
  RepoCodegraphLookupRequest,
  lookupRepoExports,
  readRepoExportsCatalog,
} from "@beep/repo-codegraph"
```

```bash
bun run beep reuse lookup --query UnknownRecord --from packages/tooling/tool/cli --json
```

## Verifications
- `bunx turbo run test --filter=@beep/repo-codegraph`
- `bunx turbo run test:integration --filter=@beep/repo-codegraph`
- `bunx turbo run lint --filter=@beep/repo-codegraph`
- `bunx turbo run check --filter=@beep/repo-codegraph`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
