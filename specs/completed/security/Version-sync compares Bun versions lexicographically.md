# Status
fixed on current branch

## Outcome
Version-sync now parses Bun versions as semver-like values and compares numeric core versions plus prerelease precedence instead of using lexicographic string ordering.

## Evidence
- Code: `tooling/cli/src/commands/VersionSync/internal/resolvers/BunResolver.ts`
- Tests: `tooling/cli/test/version-sync-effect.test.ts`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
- Verification: `bunx vitest run tooling/cli/test/version-sync-effect.test.ts`
