# Status
fixed on current branch

## Outcome
Repo-memory indexing now resolves canonical paths, skips symlink recursion, tracks visited canonical directories during tsconfig discovery, and avoids indexing files discovered through path escapes.

## Evidence
- Code: `packages/repo-memory/runtime/src/indexing/TypeScriptIndexer.ts`
- Tests: `packages/repo-memory/runtime/test/TypeScriptIndexer.security.test.ts`
- Verification: `bunx tsc -p packages/repo-memory/runtime/tsconfig.json --noEmit`
- Verification: `bunx --bun vitest run packages/repo-memory/runtime/test/TypeScriptIndexer.security.test.ts`
