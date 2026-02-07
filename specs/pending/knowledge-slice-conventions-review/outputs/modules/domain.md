# Module

- Path: `packages/knowledge/domain`
- Owner surfaces (public exports): `src/index.ts` (`Entities`, `Errors`, `Rpc`, `Services`, `ValueObjects`)
- Internal-only surfaces: `src/**` not reachable via `@beep/knowledge-domain/*` exports (none observed; package exports are broad)

## Findings (Prioritized)

| Priority | Area | Finding | Fix | Evidence Links (Code/Test) | Verification (Command + Result + Date) |
|---|---|---|---|---|---|
| P1 | conventions/imports | Test helper imported a subpath with a `.ts` extension, which is inconsistent with the rest of the repo and can mis-resolve under package `exports` patterns. | Drop the `.ts` extension in the import specifier. | `packages/knowledge/domain/test/_shared/TestLayers.ts:1` | `bun run --cwd packages/knowledge/domain test` + PASS (2026-02-07) |
| P2 | conventions/imports | `Split.service.ts` used a relative import for an exported error type; other services in this module consistently use the package alias. | Switch to `@beep/knowledge-domain/errors/...` import for consistency. | `packages/knowledge/domain/src/services/Split.service.ts:3` | `bun run --cwd packages/knowledge/domain check` + PASS (2026-02-07) |

## Interface -> S.Class Candidates

None identified in this module pass (existing cross-boundary data models are already `S.Class` / `M.Class`).

## Fixes Applied

- `packages/knowledge/domain/test/_shared/TestLayers.ts`: normalized `@beep/knowledge-domain/...` import (no `.ts` extension).
- `packages/knowledge/domain/src/services/Split.service.ts`: normalized internal import to `@beep/knowledge-domain/errors/Split.errors`.

## Verification Run For This Module

```bash
bun run --cwd packages/knowledge/domain check
bun run --cwd packages/knowledge/domain lint
bun run --cwd packages/knowledge/domain test

rg -n '\\bany\\b|@ts-ignore|as unknown as|\\bas any\\b' packages/knowledge/domain/src packages/knowledge/domain/test
```

Results:

- `bun run --cwd packages/knowledge/domain check`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/domain lint`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/domain test`: `PASS` (2026-02-07)
- `rg ...`: `PASS` (matches are docstrings and allowlisted) (2026-02-07)

