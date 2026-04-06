# Status
fixed on current branch

## Outcome
Tenant selection now treats the caller header as authoritative: request-body tenant overrides are rejected unless `x-agent-tenant` is present and matches.

## Evidence
- Code: `packages/ai/sdk/src/core/service/TenantAccess.ts`
- Code: `packages/ai/sdk/src/core/service/AgentHttpHandlers.ts`, `packages/ai/sdk/src/core/service/AgentRpcHandlers.ts`
- Tests: `packages/ai/sdk/test/agent-service-http.test.ts`, `packages/ai/sdk/test/agent-service-rpc.test.ts`
- Verification: `bunx --bun vitest run packages/ai/sdk/test/agent-service-http.test.ts packages/ai/sdk/test/agent-service-rpc.test.ts`
