# Status
fixed on current branch

## Outcome
The explicit `idleTimeout: 0` override was removed, so the sidecar now uses Bun’s default idle timeout behavior and idle timeouts are enabled again.

## Evidence
- Code: `packages/runtime/server/src/index.ts`
- Verification: `git diff -- packages/runtime/server/src/index.ts`
