# Status
fixed on current branch

## Outcome
Agent HTTP and RPC servers now default to `127.0.0.1`, and non-loopback exposure requires an explicit auth token. Request handlers authorize inbound calls before executing agent operations.

## Evidence
- Code: `packages/ai/sdk/src/core/service/AgentServerAccess.ts`
- Code: `packages/ai/sdk/src/core/service/AgentHttpServer.ts`, `packages/ai/sdk/src/core/service/AgentRpcServer.ts`
- Code: `packages/ai/sdk/src/core/service/AgentHttpHandlers.ts`, `packages/ai/sdk/src/core/service/AgentRpcHandlers.ts`
- Tests: `packages/ai/sdk/test/agent-service-http.test.ts`, `packages/ai/sdk/test/agent-service-rpc.test.ts`
- Verification: `bunx tsc -p packages/ai/sdk/tsconfig.json --noEmit`
- Verification: `bunx --bun vitest run packages/ai/sdk/test/agent-service-http.test.ts packages/ai/sdk/test/agent-service-rpc.test.ts`
