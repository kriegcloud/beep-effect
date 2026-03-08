# Status
fixed on current branch

## Outcome
The explicit `idleTimeout: 0` override was removed so the sidecar again uses Bun’s default idle timeout behavior.

## Evidence
- Code: `packages/runtime/server/src/index.ts`
- Verification: `git diff -- packages/runtime/server/src/index.ts`
