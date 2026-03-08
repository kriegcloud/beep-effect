# Status
fixed on current branch

## Outcome
The Graphiti proxy now forwards only the configured `/mcp` endpoint, preserves query parameters for that endpoint only, and rejects alternate paths plus absolute-form request targets locally.

## Evidence
- Code: `tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts`
- Tests: `tooling/cli/test/graphiti-proxy-security.test.ts`
- Verification: `bunx tsc -p tooling/cli/tsconfig.json --noEmit`
- Verification: `bunx vitest run tooling/cli/test/graphiti-proxy-security.test.ts`
