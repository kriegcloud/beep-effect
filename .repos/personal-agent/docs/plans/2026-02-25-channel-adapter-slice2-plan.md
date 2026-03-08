# Channel Adapter Slice 2: Contract Unification + Integration Foundation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify the adapter RPC contract, fix Slice 1 correctness gaps, fill test coverage holes, and lay the ExternalService/Integration foundation.

**Architecture:** Three groups — (A) correctness fixes that unify CLI and WebChat under a single AdapterProtocol, (B) test completeness for WS e2e and concurrency, (C) domain schemas + skeleton persistence + stub entity for ExternalService/Integration. All changes are additive or rename-only; no behavioral regressions.

**Tech Stack:** Effect (Schema.Class, ServiceMap, Entity, Rpc), Bun WebSocket, SQLite migrations

---

## Task 0: Fix ProxyGateway baseline type errors

**Files:**
- Modify: `packages/server/src/gateway/ProxyGateway.ts`

### Requirements

`bun run check` currently fails on two ProxyGateway issues unrelated to Slice 2. Fix them so subsequent tasks can verify cleanly.

**ProxyGateway.ts line 2:** Remove unused `EntityProxyServer` import:

```typescript
// Before:
import { EntityProxy, EntityProxyServer } from "effect/unstable/cluster"
// After:
import { EntityProxy } from "effect/unstable/cluster"
```

**ProxyGateway.ts line 54:** The `any` argument error comes from the `handle` chain for `${parentRpc._tag}Discard`. The workaround in this file already uses `as any` casts throughout — add an explicit `as any` on the `.handle` return at line 68 to silence the remaining error, OR suppress with `// @ts-expect-error` if the cast doesn't work (this is a known effect beta bug documented in the file comments).

### Verify

```bash
bun run check   # should now pass (or only emit non-error diagnostics)
bun run test
```

---

## Task 1: Promote TurnRecordSchema to domain

**Files:**
- Modify: `packages/domain/src/ports.ts`
- Modify: `packages/domain/src/index.ts`
- Modify: `packages/server/src/entities/AdapterProtocol.ts`
- Modify: `packages/server/src/entities/CLIAdapterEntity.ts`

### Requirements

Convert the `TurnRecord` interface in `ports.ts` to a `Schema.Class` so it serves as both the runtime type and the RPC serialisation schema. Remove the duplicate hand-maintained `TurnRecordSchema` from `AdapterProtocol.ts`.

In `packages/domain/src/ports.ts`, replace the `TurnRecord` interface (lines 110-121) with:

```typescript
export class TurnRecord extends Schema.Class<TurnRecord>("TurnRecord")({
  turnId: TurnId,
  sessionId: SessionId,
  conversationId: ConversationId,
  turnIndex: Schema.Number,
  participantRole: AgentRole,
  participantAgentId: Schema.Union([AgentId, Schema.Null]),
  message: MessageRecord,
  modelFinishReason: Schema.Union([ModelFinishReason, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null]),
  createdAt: Schema.DateTimeUtcFromString
}) {}
```

Add imports: `TurnId`, `SessionId`, `ConversationId`, `AgentId` from `./ids.js` and `ModelFinishReason` from `./status.js`. Import `AgentRole` as a value (it's already imported as a type — switch to value import since we use it in the schema).

Export `TurnRecord` from `index.ts` (already exported via `ports.js` barrel — verify).

In `AdapterProtocol.ts`, remove the `TurnRecordSchema` definition (lines 20-42) and the `ContentBlock` import. Import `TurnRecord` from `@template/domain/ports`. Replace `Schema.Array(TurnRecordSchema)` with `Schema.Array(TurnRecord)` in `GetHistoryRpc`.

In `CLIAdapterEntity.ts`, remove the `TurnRecordSchema` import from `./AdapterProtocol.js` and import `TurnRecord` from `@template/domain/ports` instead. Replace `Schema.Array(TurnRecordSchema)` with `Schema.Array(TurnRecord)` in `GetHistoryRpc`.

**Note:** `TurnRecord` was previously an interface used by `SessionTurnPort.listTurns` and `SessionTurnPort.appendTurn`. Converting to Schema.Class keeps the same shape but makes it a class. All places that construct `TurnRecord` objects will still work since Schema.Class instances can be created with plain objects. However, type annotations using `TurnRecord` as an interface will now reference the class — verify that `SessionTurnPortSqlite` and `TurnProcessingWorkflow` still compile.

**Branded ID note:** The existing `TurnRecordSchema` used plain `Schema.String` everywhere. The branded IDs (`TurnId`, `SessionId`, etc.) are `Schema.String.pipe(Schema.brand(...))` — they accept any string at decode time but produce branded types. Callers that construct TurnRecord objects with plain strings will need `as TurnId` casts (which they already use). If this causes widespread type breakage, fall back to `Schema.String` for the branded fields and add a TODO comment.

### Verify

```bash
bun run check
bun run test
```

---

## Task 2: Add `ChannelTypeMismatch` error + re-init validation

**Files:**
- Modify: `packages/domain/src/errors.ts`
- Modify: `packages/server/src/entities/AdapterProtocol.ts`
- Modify: `packages/server/src/ChannelCore.ts`
- Modify: `packages/server/test/ChannelCore.test.ts`

### Requirements

Add to `packages/domain/src/errors.ts`:

```typescript
export class ChannelTypeMismatch extends Schema.ErrorClass<ChannelTypeMismatch>("ChannelTypeMismatch")({
  _tag: Schema.tag("ChannelTypeMismatch"),
  channelId: Schema.String,
  existingType: Schema.String,
  requestedType: Schema.String
}) {}
```

**AdapterProtocol.ts:** Add `ChannelTypeMismatch` to `InitializeRpc` error channel so the RPC boundary explicitly declares this error:

```typescript
import { ChannelNotFound, ChannelTypeMismatch } from "@template/domain/errors"

export const InitializeRpc = Rpc.make("initialize", {
  payload: {
    channelType: ChannelType,
    agentId: Schema.String
  },
  success: Schema.Void,
  error: ChannelTypeMismatch,
  primaryKey: ({ agentId }) => `initialize:${agentId}`
}).annotate(ClusterSchema.Persisted, true)
```

In `ChannelCore.ts`, modify `initializeChannel` (lines 56-59). When `existing !== null`, validate that `existing.channelType === params.channelType` and `existing.agentId === params.agentId`. If type mismatches, yield `ChannelTypeMismatch`. If agent mismatches, also yield `ChannelTypeMismatch` (reuse the error — agent mismatch is the same class of problem).

Update the `initializeChannel` type signature to include `ChannelTypeMismatch` in its error channel.

Add tests to `ChannelCore.test.ts`:
- Re-init with matching type/agent succeeds (idempotent — already tested, verify still passes)
- Re-init with different channelType fails with `ChannelTypeMismatch`
- Re-init with different agentId fails with `ChannelTypeMismatch`

### Verify

```bash
bun run check
bun run test
```

---

## Task 3: Add userId to adapter protocol + turn payloads

**Files:**
- Modify: `packages/server/src/entities/AdapterProtocol.ts`
- Modify: `packages/server/src/ChannelCore.ts`
- Modify: `packages/server/src/turn/TurnProcessingWorkflow.ts`
- Modify: `packages/server/src/entities/CLIAdapterEntity.ts`
- Modify: `packages/server/src/entities/WebChatAdapterEntity.ts`
- Modify: `packages/server/src/gateway/WebChatRoutes.ts`
- Modify: `packages/server/src/gateway/ChannelRoutes.ts`
- Modify: `packages/server/src/entities/SessionEntity.ts`

### Requirements

**userId flow:** The design says "on turn payload only" — not persisted on channel record. Each adapter sources userId differently and passes it through the message processing path.

**AdapterProtocol.ts:** Add `userId: Schema.String` to both `InitializeRpc` and `ReceiveMessageRpc` payloads. This ensures the userId is always available at message-processing time without requiring channel-record persistence:

```typescript
export const InitializeRpc = Rpc.make("initialize", {
  payload: {
    channelType: ChannelType,
    agentId: Schema.String,
    userId: Schema.String
  },
  // ... rest unchanged
})

export const ReceiveMessageRpc = Rpc.make("receiveMessage", {
  payload: {
    content: Schema.String,
    userId: Schema.String
  },
  // ... rest unchanged
})
```

**ChannelCore.ts:** Add `userId: string` param to `buildTurnPayload`. Pass it into the returned `ProcessTurnPayload`:

```typescript
const buildTurnPayload = (params: {
  readonly channelId: ChannelId
  readonly content: string
  readonly contentBlocks: ReadonlyArray<ContentBlock>
  readonly userId: string
}) =>
  Effect.gen(function*() {
    // ... existing channel lookup ...
    return {
      // ... existing fields ...
      userId: params.userId
    } satisfies ProcessTurnPayload
  })
```

**TurnProcessingWorkflow.ts:** Add `userId: Schema.String` to `ProcessTurnPayload` schema (after `agentId` field, line ~34). The workflow doesn't use it yet — it's carried for audit trail.

**SessionEntity.ts:** Add `userId: Schema.String` to `ProcessTurnPayloadFields` so the field serialises across the entity RPC boundary.

**CLIAdapterEntity.ts:** In `createChannel` handler, pass `userId: "user:cli:local"`. In `sendMessage` handler, pass `userId: request.payload.userId` (which becomes `"user:cli:local"` from the route layer).

**WebChatAdapterEntity.ts:** In `initialize` handler, pass `userId: request.payload.userId`. In `receiveMessage` handler, pass `userId: request.payload.userId`.

**WebChatRoutes.ts:** Store `userId` alongside `initialized` in connection state. On init frame, capture `frame.userId`. On message frame, pass `userId` to `client.receiveMessage({ content: frame.content, userId })`.

**ChannelRoutes.ts:** Pass `userId: "user:cli:local"` in both the create handler and the sendMessage handler (via request payload or hardcoded — use hardcoded for now since CLI routes serve local users).

### Verify

```bash
bun run check
bun run test
```

---

## Task 4: Unify CLI adapter to shared AdapterProtocol RPCs + rename HTTP routes

**Files:**
- Modify: `packages/server/src/entities/CLIAdapterEntity.ts`
- Modify: `packages/server/src/gateway/ChannelRoutes.ts`
- Modify: `packages/cli/src/RuntimeClient.ts`
- Modify: `packages/cli/src/Cli.ts`
- Modify: `packages/server/src/server.ts`
- Modify: `packages/server/test/CLIAdapterEntity.test.ts`
- Modify: `packages/server/test/ChannelRoutes.e2e.test.ts`

### Requirements

**CLIAdapterEntity.ts:** Remove private RPC definitions (`CreateChannelRpc`, `SendMessageRpc`, `GetHistoryRpc`). Import and use `InitializeRpc`, `ReceiveMessageRpc`, `GetHistoryRpc`, `GetStatusRpc` from `./AdapterProtocol.js`. Update the entity definition:

```typescript
export const CLIAdapterEntity = Entity.make("CLIAdapter", [
  InitializeRpc,
  ReceiveMessageRpc,
  GetHistoryRpc,
  GetStatusRpc
])
```

Update `toLayer` handler names: `createChannel` → `initialize`, `sendMessage` → `receiveMessage`. Add `getStatus` handler (same pattern as WebChatAdapterEntity — read from ChannelPortTag). Add `ChannelPortTag` dependency to the layer's `Effect.gen`.

**server.ts:** Update `cliAdapterEntityLayer` to provide `channelPortTagLayer` (needed for the new `getStatus` handler):

```typescript
const cliAdapterEntityLayer = CLIAdapterEntityLayer.pipe(
  Layer.provide(clusterLayer),
  Layer.provide(channelCoreLayer),
  Layer.provide(channelPortTagLayer)
)
```

**ChannelRoutes.ts:**
- Extract `/health` route into a separate export (`healthRoute` or `healthLayer`) so it can remain always-on even when CLI routes are gated. The simplest approach: keep the `health` const as-is but export it separately, and have the CLI-gated layer only include the channel-specific routes.
- Rename routes:
  - `POST /channels/:channelId/create` → `POST /channels/:channelId/initialize`
  - `POST /channels/:channelId/history` → `GET /channels/:channelId/history`
  - Add new `GET /channels/:channelId/status` route
  - Keep `POST /channels/:channelId/messages` (calls `receiveMessage` internally)
- Update internal calls: `client.createChannel(...)` → `client.initialize(...)`, `client.sendMessage(...)` → `client.receiveMessage(...)`

Export two layers:
```typescript
export const healthLayer = health  // always-on
export const layer = Layer.mergeAll(initializeChannel, sendMessage, getHistory, getStatus)  // gatable
```

**RuntimeClient.ts:**
- Rename `createChannel` method to `initialize`
- Update URL: `/channels/${channelId}/create` → `/channels/${channelId}/initialize`
- Update return interface: `{ initialize, sendMessage, health }`

**Cli.ts:** Update `client.createChannel(channelId, "agent:bootstrap")` → `client.initialize(channelId, "agent:bootstrap")` (line 30).

**CLIAdapterEntity.test.ts:** Update test calls from `client.createChannel(...)` to `client.initialize(...)` and `client.sendMessage(...)` to `client.receiveMessage(...)`. Add a test for `getStatus`.

**ChannelRoutes.e2e.test.ts:** Update all HTTP calls to use the new route paths (`/channels/:id/initialize` instead of `/channels/:id/create`).

### Verify

```bash
bun run check
bun run test
```

---

## Task 5: Enforce `channels.cli.enabled` config gating

**Files:**
- Modify: `packages/server/src/server.ts`

### Requirements

Gate `cliAdapterEntityLayer` and the CLI channel routes layer with `Layer.unwrap` + `config.channels.cli.enabled`, mirroring the existing WebChat gating pattern (lines 222-234 in server.ts).

Replace the unconditional `cliAdapterEntityLayer` (from Task 4) with:

```typescript
const cliAdapterEntityLayer = Layer.unwrap(
  Effect.gen(function*() {
    const config = yield* AgentConfig
    if (!config.channels.cli.enabled) {
      return Layer.empty
    }
    return CLIAdapterEntityLayer.pipe(
      Layer.provide(clusterLayer),
      Layer.provide(channelCoreLayer),
      Layer.provide(channelPortTagLayer)
    )
  }).pipe(Effect.provide(agentConfigLayer))
)
```

Gate the CLI-specific routes (but NOT the health route):

```typescript
const cliRoutesLayer = Layer.unwrap(
  Effect.gen(function*() {
    const config = yield* AgentConfig
    if (!config.channels.cli.enabled) {
      return Layer.empty
    }
    return ChannelRoutesLayer  // the gatable layer from Task 4 (excludes /health)
  }).pipe(Effect.provide(agentConfigLayer))
)
```

Update `HttpApiAndRoutesLive` to include both `healthLayer` (always-on) and `cliRoutesLayer` (gated) separately:

```typescript
const HttpApiAndRoutesLive = Layer.mergeAll(
  ProxyApiLive,
  HealthRoutesLayer,     // always-on
  cliRoutesLayer,        // gated by channels.cli.enabled
  webChatRoutesLayer     // gated by channels.webchat.enabled
).pipe(
  Layer.provide(PortsLive),
  Layer.provide(clusterLayer)
)
```

### Verify

```bash
bun run check
bun run test
```

---

## Task 6: Align WS message-processing errors with `turn.failed`

**Files:**
- Modify: `packages/server/src/gateway/WebChatRoutes.ts`
- Modify: `packages/server/test/WebChatRoutes.e2e.test.ts`

### Requirements

In `WebChatRoutes.ts`, the `MESSAGE_ERROR` case (lines 156-161) currently sends `{type:"error", code:"MESSAGE_ERROR", message:...}`. Change it to send a `TurnFailedEvent` shape matching the SSE contract in ChannelRoutes.ts:

```typescript
Stream.runForEach((event) => writeFn(turnEventToFrame(event))),
Effect.catchCause((cause) => {
  const err = Cause.squash(cause)
  const failedEvent = {
    type: "turn.failed" as const,
    sequence: Number.MAX_SAFE_INTEGER,
    turnId: "",
    sessionId: "",
    errorCode: "MESSAGE_ERROR",
    message: err instanceof Error ? err.message : String(err)
  }
  return writeFn(JSON.stringify(failedEvent)).pipe(Effect.ignore)
})
```

Add `Cause` to the Effect imports.

Keep protocol-level errors (`INVALID_FRAME`, `NOT_INITIALIZED`, `ALREADY_INITIALIZED`, `INIT_FAILED`, `UNKNOWN_FRAME`) as `{type:"error"}` — these are transport concerns.

Update the `errorFrame` helper JSDoc to clarify it's for transport-level errors only.

### Verify

```bash
bun run check
bun run test
```

---

## Task 7: Domain types — IntegrationStatus, ConnectionStatus, ExternalService, ServiceCapability

**Files:**
- Modify: `packages/domain/src/status.ts`
- Create: `packages/domain/src/integration.ts`
- Modify: `packages/domain/src/ids.ts`
- Modify: `packages/domain/src/index.ts`
- Create: `packages/domain/test/IntegrationSchema.test.ts`

### Requirements

**ids.ts:** Add:

```typescript
export const IntegrationId = Schema.String.pipe(Schema.brand("IntegrationId"))
export type IntegrationId = typeof IntegrationId.Type

export const ExternalServiceId = Schema.String.pipe(Schema.brand("ExternalServiceId"))
export type ExternalServiceId = typeof ExternalServiceId.Type
```

**status.ts:** Add:

```typescript
export const IntegrationStatus = Schema.Literals([
  "Connected",
  "Disconnected",
  "Error",
  "Initializing"
])
export type IntegrationStatus = typeof IntegrationStatus.Type

export const ConnectionStatus = Schema.Literals([
  "Open",
  "Closed",
  "Reconnecting",
  "Failed"
])
export type ConnectionStatus = typeof ConnectionStatus.Type

export const ServiceTransport = Schema.Literals([
  "stdio",
  "sse",
  "http"
])
export type ServiceTransport = typeof ServiceTransport.Type
```

**integration.ts:** Create with Schema.Class for both records (needed for runtime encode/decode in persistence layer):

```typescript
import { Schema } from "effect"
import { AgentId, ExternalServiceId, IntegrationId } from "./ids.js"
import { IntegrationStatus, ServiceTransport } from "./status.js"
import { Instant } from "./ports.js"

export class ServiceToolCapability extends Schema.Class<ServiceToolCapability>("ServiceToolCapability")({
  _tag: Schema.tag("ServiceToolCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String)
}) {}

export class ServiceResourceCapability extends Schema.Class<ServiceResourceCapability>("ServiceResourceCapability")({
  _tag: Schema.tag("ServiceResourceCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String),
  uri: Schema.optional(Schema.String)
}) {}

export class ServicePromptCapability extends Schema.Class<ServicePromptCapability>("ServicePromptCapability")({
  _tag: Schema.tag("ServicePromptCapability"),
  name: Schema.String,
  description: Schema.optional(Schema.String)
}) {}

export const ServiceCapability = Schema.Union([
  ServiceToolCapability,
  ServiceResourceCapability,
  ServicePromptCapability
])
export type ServiceCapability = typeof ServiceCapability.Type

export class ExternalServiceRecord extends Schema.Class<ExternalServiceRecord>("ExternalServiceRecord")({
  serviceId: ExternalServiceId,
  name: Schema.String,
  endpoint: Schema.String,
  transport: ServiceTransport,
  identifier: Schema.String,
  createdAt: Schema.DateTimeUtcFromString
}) {}

export class IntegrationRecord extends Schema.Class<IntegrationRecord>("IntegrationRecord")({
  integrationId: IntegrationId,
  agentId: AgentId,
  serviceId: ExternalServiceId,
  status: IntegrationStatus,
  capabilities: Schema.Array(ServiceCapability),
  createdAt: Schema.DateTimeUtcFromString,
  updatedAt: Schema.DateTimeUtcFromString
}) {}
```

**index.ts:** Add `export * from "./integration.js"`.

**IntegrationSchema.test.ts:** Test encode/decode for each `ServiceCapability` variant and `ExternalServiceRecord`/`IntegrationRecord` roundtrip via `Schema.decodeUnknown`/`Schema.encodeUnknown`.

### Verify

```bash
bun run check
bun run test
```

---

## Task 8: Integration config in AgentConfig

**Files:**
- Modify: `packages/domain/src/config.ts`
- Modify: `packages/server/src/ai/AgentConfig.ts`
- Modify: `packages/domain/test/ConfigSchema.test.ts`
- Modify: `packages/server/test/AgentConfig.test.ts`
- Modify: `agent.yaml.example`

### Requirements

**config.ts:** Add after `ChannelsConfigSchema`:

```typescript
export const IntegrationConfigSchema = Schema.Struct({
  serviceId: Schema.String,
  name: Schema.String,
  endpoint: Schema.String,
  transport: Schema.Literals(["stdio", "sse", "http"]),
  identifier: Schema.optional(Schema.String)
})
export type IntegrationConfig = typeof IntegrationConfigSchema.Type

export const IntegrationsConfigSchema = Schema.Array(IntegrationConfigSchema)
export type IntegrationsConfig = typeof IntegrationsConfigSchema.Type
```

**Note:** `identifier` is optional in config — defaults to `endpoint` value when not provided. The `IntegrationEntity` (Task 10) derives `identifier` from config: `config.identifier ?? config.endpoint`.

Add to `AgentConfigFileSchema`:

```typescript
integrations: IntegrationsConfigSchema.pipe(
  Schema.withDecodingDefaultKey(() => [] as IntegrationsConfig)
)
```

**AgentConfig.ts:** Add `readonly integrations: IntegrationsConfig` to `AgentConfigService` interface. Wire `integrations: config.integrations` in `makeFromParsed`.

**ConfigSchema.test.ts:** Test that `integrations` defaults to `[]`, and test parsing a config with integrations defined (including with/without `identifier`).

**AgentConfig.test.ts:** Test that `AgentConfig.integrations` is accessible and defaults empty.

**agent.yaml.example:** Add:

```yaml
# integrations:
#   - serviceId: "svc:example"
#     name: "Example Service"
#     endpoint: "http://localhost:8080"
#     transport: "http"
#     # identifier: "custom-id"  # optional, defaults to endpoint
```

### Verify

```bash
bun run check
bun run test
```

---

## Task 9: IntegrationPort + persistence

**Files:**
- Modify: `packages/domain/src/ports.ts`
- Modify: `packages/server/src/persistence/DomainMigrator.ts`
- Create: `packages/server/src/IntegrationPortSqlite.ts`
- Modify: `packages/server/src/PortTags.ts`
- Create: `packages/server/test/IntegrationPortSqlite.test.ts`

### Requirements

**ports.ts:** Add:

```typescript
export interface IntegrationPort {
  readonly createService: (service: ExternalServiceRecord) => Effect.Effect<void>
  readonly getService: (serviceId: ExternalServiceId) => Effect.Effect<ExternalServiceRecord | null>
  readonly createIntegration: (integration: IntegrationRecord) => Effect.Effect<void>
  readonly getIntegration: (integrationId: IntegrationId) => Effect.Effect<IntegrationRecord | null>
  readonly getIntegrationByService: (agentId: AgentId, serviceId: ExternalServiceId) => Effect.Effect<IntegrationRecord | null>
  readonly updateStatus: (integrationId: IntegrationId, status: IntegrationStatus) => Effect.Effect<void>
}
```

Add necessary imports from `./ids.js`, `./integration.js`, `./status.js`.

**DomainMigrator.ts:** Add migration `0005_integration_tables`:

```typescript
"0005_integration_tables": Effect.gen(function*() {
  const sql = yield* SqlClient.SqlClient

  yield* sql`
    CREATE TABLE IF NOT EXISTS external_services (
      service_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      transport TEXT NOT NULL CHECK (transport IN ('stdio', 'sse', 'http')),
      identifier TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.unprepared

  yield* sql`
    CREATE TABLE IF NOT EXISTS integrations (
      integration_id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Connected', 'Disconnected', 'Error', 'Initializing')),
      capabilities_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.unprepared

  yield* sql`
    CREATE UNIQUE INDEX IF NOT EXISTS integrations_agent_service_idx
    ON integrations (agent_id, service_id)
  `.unprepared
})
```

**IntegrationPortSqlite.ts:** Implement `IntegrationPort` using `ServiceMap.Service` pattern (follow `ChannelPortSqlite` as reference). Use `Schema.fromJsonString(Schema.Array(ServiceCapability))` for capabilities JSON encoding (same pattern as `ChannelPortSqlite` uses for capabilities).

**PortTags.ts:** Add:

```typescript
export class IntegrationPortTag extends ServiceMap.Tag<IntegrationPort>()("server/ports/IntegrationPort") {}
```

Follow the existing pattern used by other port tags in this file (e.g., `ChannelPortTag`).

**IntegrationPortSqlite.test.ts:** Test CRUD operations: create service, get service, create integration, get by ID, get by agent+service, update status. Test capabilities JSON roundtrip.

### Verify

```bash
bun run check
bun run test
```

---

## Task 10: Skeleton IntegrationEntity

**Files:**
- Modify: `packages/domain/src/errors.ts`
- Create: `packages/server/src/entities/IntegrationEntity.ts`
- Modify: `packages/server/src/server.ts`
- Create: `packages/server/test/IntegrationEntity.test.ts`

### Requirements

**errors.ts:** Add `IntegrationNotFound`:

```typescript
export class IntegrationNotFound extends Schema.ErrorClass<IntegrationNotFound>("IntegrationNotFound")({
  _tag: Schema.tag("IntegrationNotFound"),
  integrationId: Schema.String
}) {}
```

**IntegrationEntity.ts:** Create with three RPCs:

```typescript
import { Schema } from "effect"
import { ClusterSchema } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { ServiceCapability } from "@template/domain/integration"
import { IntegrationNotFound } from "@template/domain/errors"

const ConnectRpc = Rpc.make("connect", {
  payload: {
    serviceId: Schema.String,
    name: Schema.String,
    endpoint: Schema.String,
    transport: Schema.Literals(["stdio", "sse", "http"]),
    identifier: Schema.optional(Schema.String)
  },
  success: Schema.Void,
  primaryKey: ({ serviceId }) => `connect:${serviceId}`
}).annotate(ClusterSchema.Persisted, true)

const DisconnectRpc = Rpc.make("disconnect", {
  payload: {},
  success: Schema.Void
})

const GetStatusRpc = Rpc.make("getIntegrationStatus", {
  payload: {},
  success: Schema.Struct({
    integrationId: Schema.String,
    serviceId: Schema.String,
    status: Schema.String,
    capabilities: Schema.Array(ServiceCapability)
  }),
  error: IntegrationNotFound
})
```

Entity name: `"Integration"`. Entity ID is the `integrationId`.

Stub implementation:
- `connect`: Derives `agentId` from `AgentConfig` (yield it in the `toLayer` gen). Creates `ExternalServiceRecord` with `identifier: payload.identifier ?? payload.endpoint`. Creates `IntegrationRecord` with status `"Connected"` (skeleton — no actual connection). Uses `IntegrationPortTag` for persistence.
- `disconnect`: Updates status to `"Disconnected"` via `updateStatus`.
- `getIntegrationStatus`: Reads from `IntegrationPortTag`. Returns `IntegrationNotFound` if not found.

**server.ts:** Import and wire `IntegrationEntity`. Conditionally include based on whether `config.integrations` is non-empty:

```typescript
const integrationEntityLayer = Layer.unwrap(
  Effect.gen(function*() {
    const config = yield* AgentConfig
    if (config.integrations.length === 0) {
      return Layer.empty
    }
    return IntegrationEntityLayer.pipe(
      Layer.provide(clusterLayer),
      Layer.provide(integrationPortTagLayer),
      Layer.provide(agentConfigLayer)
    )
  }).pipe(Effect.provide(agentConfigLayer))
)
```

Add `integrationPortSqliteLayer`, `integrationPortTagLayer`, and wire into `entityLayer` and `portTagsLayer`.

**IntegrationEntity.test.ts:** Test connect (creates records), disconnect (updates status), getIntegrationStatus (returns snapshot), connect idempotency, getStatus for non-existent integration returns error.

### Verify

```bash
bun run check
bun run test
```

---

## Task 11: Bun WebSocket e2e tests

**Files:**
- Create: `packages/server/test/WebChatRoutes.ws.test.ts`

### Requirements

Uses `BunHttpServer` (from `@effect/platform-bun`) with `{ port: 0 }` to start on a random port. Connects via native `new WebSocket(url)`.

Guard tests with a runtime check so they only run under Bun:

```typescript
const isBun = typeof globalThis.Bun !== "undefined"
const describeWs = isBun ? describe : describe.skip
```

Test cases:
1. **Happy path:** connect → receives `{"type":"connected"}` → send init → receives `{"type":"initialized"}` → send message → receives `turn.started`, `assistant.delta`, `turn.completed` events
2. **Malformed frame:** send garbage → receives `{"type":"error","code":"INVALID_FRAME"}`
3. **Message before init:** send message frame before init → receives `NOT_INITIALIZED` error
4. **Double init:** send init twice → receives `ALREADY_INITIALIZED` error
5. **Disconnect cleanup:** connect, init, close socket — verify no unhandled promise rejections

Test layer: same as `WebChatAdapterEntity.test.ts` pattern with mock TurnProcessingRuntime, plus `WebChatRoutesLayer` and `BunHttpServer.layer({ port: 0 })`.

### Verify

```bash
bun run test
```

---

## Task 12: Missing test matrix items

**Files:**
- Modify: `packages/server/test/ChannelCore.test.ts`
- Modify: `packages/server/test/CLIAdapterEntity.test.ts`
- Modify: `packages/server/test/WebChatAdapterEntity.test.ts`

### Requirements

Add to `ChannelCore.test.ts`:
- **Cross-channel isolation:** Same `agentId`, two different `channelId`s → independent sessions, independent history
- **History after processed turn:** Initialize channel, send message, verify `getHistory` returns user + assistant turns

Add to `CLIAdapterEntity.test.ts` or `WebChatAdapterEntity.test.ts`:
- **Event ordering:** Verify streamed events come in order: `turn.started` first, then deltas/tool events, then `turn.completed` last
- **Concurrent messages on one channel:** Send two messages rapidly, verify both complete without turn index collision (mock runtime should handle sequentially)

**Note on mock path:** These tests use `Entity.makeTestClient` which bypasses real sharded session routing. The concurrency tests validate ChannelCore's own serialization logic (no turn index collisions at the core level), not the full sharding path. Add a comment in each concurrency test documenting this limitation.

### Verify

```bash
bun run check
bun run test
```

---

## Task 13: End-to-end verification

Run:

```bash
bun run check
bun run test
bun run start
```

Confirm:
- `/channels/:channelId/initialize` works (renamed from `/create`)
- `/channels/:channelId/messages` SSE works
- `/channels/:channelId/status` returns channel info
- `/health` works even when `channels.cli.enabled: false`
- `/ws/chat/:channelId` WebSocket flow works (init + message + streamed events)
- Config gating: both CLI and WebChat can be disabled independently

---

## Files Summary

| File | Action |
|------|--------|
| `packages/domain/src/errors.ts` | Add `ChannelTypeMismatch`, `IntegrationNotFound` |
| `packages/domain/src/ids.ts` | Add `IntegrationId`, `ExternalServiceId` |
| `packages/domain/src/ports.ts` | Promote `TurnRecord` to Schema.Class, add `IntegrationPort` |
| `packages/domain/src/status.ts` | Add `IntegrationStatus`, `ConnectionStatus`, `ServiceTransport` |
| `packages/domain/src/integration.ts` | Create — ServiceCapability, ExternalServiceRecord, IntegrationRecord (all Schema.Class) |
| `packages/domain/src/config.ts` | Add `IntegrationConfigSchema`, `IntegrationsConfigSchema` |
| `packages/domain/src/index.ts` | Export integration module |
| `packages/domain/test/IntegrationSchema.test.ts` | Create — schema encode/decode tests |
| `packages/domain/test/ConfigSchema.test.ts` | Add integrations config tests |
| `packages/server/src/gateway/ProxyGateway.ts` | Fix baseline type errors |
| `packages/server/src/ChannelCore.ts` | Re-init validation, userId in buildTurnPayload |
| `packages/server/src/entities/AdapterProtocol.ts` | Add userId + error to InitializeRpc, userId to ReceiveMessageRpc, import TurnRecord from domain |
| `packages/server/src/entities/CLIAdapterEntity.ts` | Use shared AdapterProtocol RPCs, add getStatus |
| `packages/server/src/entities/WebChatAdapterEntity.ts` | Pass userId through |
| `packages/server/src/entities/SessionEntity.ts` | Add userId to ProcessTurnPayloadFields |
| `packages/server/src/entities/IntegrationEntity.ts` | Create — skeleton entity |
| `packages/server/src/gateway/ChannelRoutes.ts` | Extract /health, rename routes, use AdapterProtocol RPC names |
| `packages/server/src/gateway/WebChatRoutes.ts` | Normalize message errors to turn.failed, store/pass userId |
| `packages/server/src/server.ts` | Gate CLI, wire IntegrationEntity, separate health route |
| `packages/server/src/persistence/DomainMigrator.ts` | Add 0005_integration_tables |
| `packages/server/src/IntegrationPortSqlite.ts` | Create — integration persistence |
| `packages/server/src/PortTags.ts` | Add IntegrationPortTag |
| `packages/server/src/ai/AgentConfig.ts` | Surface integrations config |
| `packages/server/src/turn/TurnProcessingWorkflow.ts` | Add userId to ProcessTurnPayload |
| `packages/cli/src/RuntimeClient.ts` | Update endpoint paths, rename createChannel → initialize |
| `packages/cli/src/Cli.ts` | Update createChannel → initialize call |
| `packages/server/test/ChannelCore.test.ts` | Add re-init, cross-channel, history tests |
| `packages/server/test/CLIAdapterEntity.test.ts` | Update RPC names, add getStatus test |
| `packages/server/test/WebChatAdapterEntity.test.ts` | Add event ordering, concurrent tests |
| `packages/server/test/ChannelRoutes.e2e.test.ts` | Update route paths |
| `packages/server/test/WebChatRoutes.ws.test.ts` | Create — Bun WS e2e tests |
| `packages/server/test/WebChatRoutes.e2e.test.ts` | Update for turn.failed error shape |
| `packages/server/test/IntegrationPortSqlite.test.ts` | Create — persistence tests |
| `packages/server/test/IntegrationEntity.test.ts` | Create — entity tests |
| `packages/server/test/AgentConfig.test.ts` | Add integrations config tests |
| `agent.yaml.example` | Add integrations section |
