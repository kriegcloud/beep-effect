# Agent Service Extension (RPC + HTTP)

Status: Draft

## Purpose
Provide a first-class network service for the Effect-based Claude Agent SDK
wrapper. The service should expose streaming queries, non-streaming queries,
and basic runtime control over HTTP and typed RPC.

This is intended as a lightweight, practical service layer (not a workflow
engine) for apps to call remotely.

## Goals
- **Streaming queries** over HTTP (via RPC HTTP protocol + NDJSON).
- **Non-streaming queries** for simple API clients.
- **Typed contract** using Effect `Schema`.
- **Bun-native server** using `@effect/platform-bun`.
- **Composable security** (optional middleware).

## Non-Goals (for now)
- Full session multiplexing over RPC.
- Durable workflows or orchestration (separate extension).
- Multi-tenant billing or quota enforcement (can be added later).

## Service Surface

### RPC (Primary)
Use `@effect/rpc` with HTTP protocol + NDJSON serialization. This supports
streaming responses in a type-safe way.

RPCs to expose (MVP):
- `QueryStream`: stream of `SDKMessage` for a prompt.
- `QueryResult`: returns final text or `SDKResultSuccess`.
- `Stats`: returns `QuerySupervisorStats`.
- `InterruptAll`: interrupts all running queries.
- `SupportedModels`, `SupportedCommands`, `AccountInfo`.

Suggested payload schemas:

- `QueryInput`:
  - `prompt: string | Array<SDKUserMessage>`
  - `options?: Options`

- `QueryResultOutput`:
  - `result: string`
  - `metadata?: SDKResultSuccess` (optional)

### HTTP (Secondary)
Use `@effect/platform` `HttpApi` for simple REST endpoints:
- `POST /query` → `QueryResultOutput` (non-streaming)
- `GET /stats`
- `POST /interrupt-all`
- `GET /models`, `GET /commands`, `GET /account`

## API Design (Concrete)

### RPC Group
Define a typed RPC group that maps directly onto `AgentRuntime` / `AgentSdk`:

```ts
import { Rpc, RpcGroup } from "@effect/rpc"
import { Schema } from "effect"
import * as SdkSchema from "../Schema/index.js"
import { AgentSdkError } from "../Errors.js"
import * as QuerySupervisor from "../QuerySupervisor.js"

const QueryInput = Schema.Struct({
  prompt: Schema.Union(
    Schema.String,
    Schema.Array(SdkSchema.SDKUserMessage)
  ),
  options: Schema.optional(SdkSchema.Options)
})

const QueryResultOutput = Schema.Struct({
  result: Schema.String
  // optional: full SDKResultSuccess for metadata
})

export class AgentRpcs extends RpcGroup.make(
  Rpc.make("QueryStream", {
    payload: QueryInput,
    success: SdkSchema.SDKMessage,
    stream: true
  }),
  Rpc.make("QueryResult", {
    payload: QueryInput,
    success: QueryResultOutput,
    error: AgentSdkError
  }),
  Rpc.make("Stats", {
    success: QuerySupervisor.QuerySupervisorStatsSchema
  }),
  Rpc.make("InterruptAll", {
    success: Schema.Void
  }),
  Rpc.make("SupportedModels", {
    success: Schema.Array(SdkSchema.ModelInfo)
  }),
  Rpc.make("SupportedCommands", {
    success: Schema.Array(SdkSchema.SlashCommand)
  }),
  Rpc.make("AccountInfo", {
    success: SdkSchema.AccountInfo
  })
) {}
```

Notes:
- `QuerySupervisorStatsSchema` lives in `QuerySupervisor` for RPC/HTTP exposure.
- `QueryStream` emits `SDKMessage` via NDJSON over HTTP.
- `QueryResult` is a convenience wrapper that collects a final result.
- `SupportedModels/Commands/AccountInfo` require a short-lived probe query,
  because the SDK exposes them on `QueryHandle`.

### HTTP API
Use `HttpApi` for REST-style access (non-streaming):
- `POST /query` returns `QueryResultOutput`.
- `GET /stats` returns `QuerySupervisorStats`.
- `POST /interrupt-all` returns `204 No Content`.

`HttpApi` can also expose OpenAPI/Swagger docs via `HttpApiSwagger`.

## Implementation Plan

### Step 1: Schemas
- Add `QuerySupervisorStatsSchema` (mirrors `QuerySupervisorStats`).
- Add `QueryResultOutput` schema (if not collocated with service).

### Step 2: RPC service
Files:
- `src/service/AgentRpcs.ts` (RPC group definitions)
- `src/service/AgentRpcHandlers.ts` (handlers using `AgentRuntime`)

Handler sketch:
- `QueryStream`: `AgentRuntime.stream(prompt, options)`
- `QueryResult`: `AgentRuntime.stream` → collect `SDKResultSuccess` text
- `Stats`: `AgentRuntime.stats`
- `InterruptAll`: `AgentRuntime.interruptAll`
- `SupportedModels/Commands/AccountInfo`: delegate to `AgentSdk`

### Step 3: HTTP service
Files:
- `src/service/AgentHttpApi.ts` (HttpApi / HttpApiGroup / endpoints)
- `src/service/AgentHttpHandlers.ts` (handlers wired to `AgentRuntime`)

### Step 4: Server wiring (Bun)
Provide a layer that mounts the RPC or HTTP service:
- RPC server:
  - `RpcServer.layer(AgentRpcs)`
  - `RpcServer.layerProtocolHttp({ path: "/rpc" })`
  - `RpcSerialization.layerNdjson`
  - `BunHttpServer.layer({ port })`
- HTTP server:
  - `HttpApiBuilder.api(AgentApi)`
  - `BunHttpServer.layer({ port })`

### Step 5: Client helpers
- `AgentRpcClient.layer` using `RpcClient.layerProtocolHttp`.
- Optional `HttpApiClient` for REST clients.

## Security
- RPC: use `RpcMiddleware` to enforce API keys.
- HTTP: use `HttpApiMiddleware` + `HttpApiSecurity.ApiKey` or `Bearer`.
- Apply middleware to `Query*` endpoints only, if desired.

## Observability
- Wrap handlers with `Effect.withSpan` and consistent attributes:
  - `queryId`, `model`, `permissionMode`, `duration`.
- Optional: expose `QuerySupervisor.events` as a streaming RPC.

## Testing
- RPC handler unit tests (no network):
  - `QueryResult` returns result for a stubbed `AgentRuntime`.
  - `QueryStream` propagates stream errors.
- Integration tests with Bun HTTP server and `RpcClient`.

## Phased Implementation Plan

### Phase 1: Schema + Core Utilities
Deliverables:
- `QuerySupervisorStatsSchema` in `QuerySupervisor.ts`.
- `QueryResultOutput` schema (shared type for HTTP/RPC).
- Stream helper to extract final `SDKResultSuccess` from a `Stream<SDKMessage>`.

Checks:
- `bun test` (schema unit tests if added).
- `bun run typecheck`.

### Phase 2: RPC Surface
Deliverables:
- `src/service/AgentRpcs.ts` with RPC group definitions.
- `src/service/AgentRpcHandlers.ts` implementing handlers via `AgentRuntime` and `AgentSdk`.
- `src/service/AgentRpcServer.ts` wiring `RpcServer.layer` + `RpcSerialization.layerNdjson`.

Checks:
- Unit tests for `QueryResult` and `QueryStream`.
- Optional contract snapshot test for RPC group schemas.

### Phase 3: HTTP Surface
Deliverables:
- `src/service/AgentHttpApi.ts` with `HttpApi` + endpoints.
- `src/service/AgentHttpHandlers.ts` using `AgentRuntime`/`AgentSdk`.
- `src/service/AgentHttpServer.ts` with `HttpApiBuilder` + `BunHttpServer`.

Checks:
- Integration test for `/query` (non-streaming).
- OpenAPI generation sanity check (optional).

### Phase 4: Client Helpers
Deliverables:
- `src/service/AgentRpcClient.ts` wrapper around `RpcClient`.
- Optional `src/service/AgentHttpClient.ts` using `HttpApiClient`.
- Example scripts showing RPC and HTTP usage.

Checks:
- `bun test` for client wiring or example smoke tests.

### Phase 5: Security + Ops Polish
Deliverables:
- `RpcMiddleware` API key or bearer token support.
- `HttpApiSecurity` middleware for REST endpoints.
- Consistent logging and spans for query metadata.
- Optional rate limiting layer integration.

Checks:
- Middleware unit tests.
- End-to-end test with auth enabled.
