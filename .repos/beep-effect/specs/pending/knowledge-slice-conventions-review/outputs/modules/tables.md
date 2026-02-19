# Module

- Path: `packages/knowledge/tables`
- Owner surfaces (public exports): `src/index.ts` (`KnowledgeDbSchema`), `src/schema.ts` via `@beep/knowledge-tables/schema`
- Internal-only surfaces: `src/tables/**`, `src/relations.ts`, `src/_check.ts`

## Findings (Prioritized)

No findings in this module pass.

## Interface -> S.Class Candidates

None (this module is Drizzle table definitions + schema exports).

## Fixes Applied

- None.

## Verification Run For This Module

```bash
bun run --cwd packages/knowledge/tables check
bun run --cwd packages/knowledge/tables lint
bun run --cwd packages/knowledge/tables test

rg -n '\\bany\\b|@ts-ignore|as unknown as|\\bas any\\b' packages/knowledge/tables/src packages/knowledge/tables/test
```

Results:

- `bun run --cwd packages/knowledge/tables check`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/tables lint`: `PASS` (2026-02-07)
- `bun run --cwd packages/knowledge/tables test`: `PASS` (2026-02-07)
- `rg ...`: `PASS` (no matches) (2026-02-07)

