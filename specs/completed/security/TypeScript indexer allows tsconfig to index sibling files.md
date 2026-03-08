# Status
fixed on current branch

## Outcome
Repo-memory source-file filtering now uses canonical real paths plus path-boundary checks instead of a simple string-prefix check, so sibling directories referenced by tsconfig are ignored.

## Evidence
- Code: `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts`
- Tests: `packages/repo-memory/runtime/test/TypeScriptIndexer.security.test.ts`
- Verification: `bunx vitest run packages/repo-memory/runtime/test/TypeScriptIndexer.security.test.ts`
