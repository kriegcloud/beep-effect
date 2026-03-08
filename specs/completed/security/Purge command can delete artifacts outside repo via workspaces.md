# Status
fixed on current branch

## Outcome
Purge now validates workspace-derived paths against the repo root before deletion, and unsafe workspace resolution fails closed before any external artifact path can be removed.

## Evidence
- Code: `tooling/cli/src/commands/Purge.ts`
- Code: `tooling/repo-utils/src/Workspaces.ts`
- Tests: `tooling/cli/test/purge-security.test.ts`, `tooling/repo-utils/test/Workspaces.test.ts`
- Verification: `bunx vitest run tooling/cli/test/purge-security.test.ts tooling/repo-utils/test/Workspaces.test.ts`
