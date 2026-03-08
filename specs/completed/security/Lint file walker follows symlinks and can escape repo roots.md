# Status
fixed on current branch

## Outcome
The lint file walker now canonicalizes roots, skips symlinked paths, enforces repo-root containment, and tracks visited canonical directories to prevent recursion loops.

## Evidence
- Code: `tooling/cli/src/commands/Lint/index.ts`
- Tests: `tooling/cli/test/lint-security.test.ts`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
- Verification: `bunx vitest run tooling/cli/test/lint-security.test.ts`
