# Status
fixed on current branch

## Outcome
Workspace discovery now rejects absolute/traversing glob patterns, canonicalizes matched workspace directories with `realPath`, and fails closed if any workspace path resolves outside the repo root.

## Evidence
- Code: `tooling/repo-utils/src/Workspaces.ts`
- Code: `tooling/repo-utils/src/FsUtils.ts`
- Tests: `tooling/repo-utils/test/Workspaces.test.ts`
- Verification: `bunx tsc -p tooling/repo-utils/tsconfig.json --noEmit`
- Verification: `bunx --bun vitest run tooling/repo-utils/test/Workspaces.test.ts`
