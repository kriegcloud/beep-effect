# Channel Adapter Architecture — Slice 2 Design

**Date:** 2026-02-25
**Prerequisite:** Slice 1 complete (merged to main, 174 tests passing)

## Goals

1. Unify the adapter RPC contract so CLI and WebChat share identical protocol
2. Fix correctness gaps identified in Slice 1 code review
3. Fill test coverage holes (WS e2e, concurrency, config gating)
4. Begin the ExternalService/Integration ontology surface

## Decisions

- **HTTP route rename:** Routes change to match AdapterProtocol naming. CLI RuntimeClient updates accordingly.
- **userId scope:** Carried through turn payloads for audit trail. Not persisted on channel record.
- **Integration depth:** Skeleton entity with Connect/Disconnect/GetStatus. No external service communication in Slice 2.

---

## Group A — Correctness & Contract Unification

### A1. Unify CLI to shared AdapterProtocol RPCs

CLIAdapterEntity drops its private RPCs (`CreateChannelRpc`, `SendMessageRpc`) and uses `InitializeRpc`, `ReceiveMessageRpc`, `GetHistoryRpc`, `GetStatusRpc` from AdapterProtocol.

HTTP routes in `ChannelRoutes.ts` rename:
- `POST /channels/:channelId/create` → `POST /channels/:channelId/initialize`
- `POST /channels/:channelId/messages` stays (calls `receiveMessage` internally)
- `POST /channels/:channelId/history` → `GET /channels/:channelId/history`
- New: `GET /channels/:channelId/status`

CLI `RuntimeClient.ts` updates to call renamed endpoints.

### A2. Enforce `channels.cli.enabled`

Gate `cliAdapterEntityLayer` and `ChannelRoutesLayer` with `Layer.unwrap` + `config.channels.cli.enabled`, mirroring the WebChat pattern.

### A3. ChannelCore re-init validation

When `channelPort.get(channelId)` returns an existing record, verify `channelType` and `agentId` match the request. Add `ChannelTypeMismatch` error to `packages/domain/src/errors.ts`. Surface through `initializeChannel` return type.

### A4. Thread userId through turn payloads

- Add `userId: Schema.String` to `InitializeRpc` payload in AdapterProtocol
- Carry `userId` into `buildTurnPayload` → `ProcessTurnPayload`
- CLI defaults to `"user:cli:local"`, WebChat uses the init frame value
- Not persisted on channel record

### A5. Align WS error frames

- Protocol-level errors (`INVALID_FRAME`, `NOT_INITIALIZED`, `ALREADY_INITIALIZED`) stay as `{type:"error"}` — transport concerns with no turn context
- Message processing errors in `WebChatRoutes.ts` normalize to `turn.failed` shape matching the SSE contract in `ChannelRoutes.ts`

### A6. Promote TurnRecordSchema to domain

Move `TurnRecordSchema` from `AdapterProtocol.ts` to `packages/domain/src/ports.ts` as a `Schema.Class` aligned with the `TurnRecord` interface. Both adapters import from domain.

---

## Group B — Test Completeness

### B1. Bun WS e2e tests

New file `WebChatRoutes.ws.test.ts` using `BunHttpServer` with port 0 and native `new WebSocket()`:
- Happy path: connect → connected → init → initialized → message → streamed events
- Malformed frame → INVALID_FRAME error
- Message before init → NOT_INITIALIZED error
- Double init → ALREADY_INITIALIZED error
- Disconnect cleanup (no leaked fibers)

Guarded by Bun runtime check so they don't break the vitest suite.

### B2. Missing test matrix items

Add to existing test files:
- ChannelCore re-init validation (new error paths from A3)
- Config gating: disabled WebChat/CLI doesn't register routes
- Concurrent messages on one channel (serialized, no turn index collisions)
- Cross-channel isolation (same user, two channels, independent sessions)

---

## Group C — Ontology Advancement

### C1. Domain types

Add to `packages/domain/src/status.ts`:
- `IntegrationStatus = Schema.Literals(["Connected", "Disconnected", "Error", "Initializing"])`
- `ConnectionStatus = Schema.Literals(["Open", "Closed", "Reconnecting", "Failed"])`

### C2. ExternalService + ServiceCapability schemas

New file `packages/domain/src/integration.ts`:
- `ExternalServiceSchema` — Schema.Class: `serviceId`, `name`, `endpoint`, `transport` (`"stdio" | "sse" | "http"`), `identifier`
- `ServiceCapability` — tagged union: `ServiceToolCapability`, `ServiceResourceCapability`, `ServicePromptCapability`
- `IntegrationRecord` interface: `integrationId`, `agentId`, `serviceId`, `status`, `capabilities`, `createdAt`

### C3. Persistence

Migration `0004_integration_tables`:
- `external_services` table
- `integrations` table

New `IntegrationPortSqlite` implementing `IntegrationPort` (CRUD for integrations + external services).

### C4. Agent config

Add optional `integrations` array to `AgentConfigFileSchema`. Each entry: `serviceId`, `name`, `endpoint`, `transport`. Satisfies `pao:AIAgent.hasIntegration` constraint. Surfaced via `AgentConfig`.

### C5. Skeleton IntegrationEntity

Entity with three RPCs:
- `ConnectRpc` — persists integration record, status `Initializing` → `Connected`
- `DisconnectRpc` — sets status to `Disconnected`
- `GetStatusRpc` — returns integration status + capabilities

Stub implementation (no actual external service communication). Wired into `server.ts` conditionally based on agent config.

---

## Deferred to Slice 3+

- `CapabilityDiscoveryWorkflow` + `InvokeTool` RPC
- MCP client integration (`McpServer`/`McpClient`)
- Vector embedding search for memory retrieval
- WebChat authentication (JWT/session tokens)
- Reconnect replay via `lastEventSequence`
- WS backpressure buffer cap
- `ConversationEntity` (session chain + CommonGround)

## Files Summary

| File | Action |
|------|--------|
| `packages/domain/src/errors.ts` | Add `ChannelTypeMismatch` |
| `packages/domain/src/ports.ts` | Promote `TurnRecordSchema` to Schema.Class |
| `packages/domain/src/status.ts` | Add `IntegrationStatus`, `ConnectionStatus` |
| `packages/domain/src/integration.ts` | Create — ExternalService, ServiceCapability, IntegrationRecord |
| `packages/domain/src/config.ts` | Add integrations config schema |
| `packages/domain/src/index.ts` | Export new types |
| `packages/server/src/ChannelCore.ts` | Re-init validation, userId in buildTurnPayload |
| `packages/server/src/entities/AdapterProtocol.ts` | Add userId to InitializeRpc, import TurnRecordSchema from domain |
| `packages/server/src/entities/CLIAdapterEntity.ts` | Use shared AdapterProtocol RPCs |
| `packages/server/src/entities/WebChatAdapterEntity.ts` | Pass userId through |
| `packages/server/src/gateway/ChannelRoutes.ts` | Rename routes, use AdapterProtocol RPC names |
| `packages/server/src/gateway/WebChatRoutes.ts` | Normalize message errors to turn.failed |
| `packages/server/src/server.ts` | Gate CLI, wire IntegrationEntity |
| `packages/server/src/persistence/DomainMigrator.ts` | Add 0004_integration_tables |
| `packages/server/src/IntegrationPortSqlite.ts` | Create — integration persistence |
| `packages/server/src/entities/IntegrationEntity.ts` | Create — skeleton entity |
| `packages/server/src/ai/AgentConfig.ts` | Surface integrations config |
| `packages/cli/src/RuntimeClient.ts` | Update endpoint paths |
| `packages/server/test/WebChatRoutes.ws.test.ts` | Create — Bun WS e2e tests |
| Various test files | Add re-init, concurrency, config gating, cross-channel tests |
| `agent.yaml.example` | Add integrations section |
