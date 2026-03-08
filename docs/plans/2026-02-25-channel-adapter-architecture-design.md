# Channel Adapter Architecture Design

**Date:** 2026-02-25
**Status:** Approved
**Goal:** Enable multi-channel agent communication (Email, WebChat, WhatsApp) through Effect Cluster adapter entities aligned with the PAO ontology.

## Research Context

Design informed by analysis of three projects:
- **OpenClaw** — `MsgContext` pivot type, per-session lane serialization, plugin channels via `api.registerChannel()`
- **Letta/LettaBot** — `ChannelAdapter` interface + `InboundMessage` envelope, shared vs per-channel sessions, capability-based optional methods, XML directive pattern
- **Pi (pi-mono)** — `AgentEvent` subscription model, per-channel filesystem isolation, `ChannelQueue` sequential processing, no formal adapter interface

Key takeaway: all three normalize at the message level (not the transport level), and let each adapter own its transport entirely.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Target channels (first slice) | Email, WebChat, WhatsApp | Three distinct transport patterns: polling, WebSocket, webhook |
| Session semantics | Shared with override (Letta model) | Cross-channel conversation continuity with governance guardrails |
| Adapter runtime model | Cluster Entities | Full lifecycle management, sharding, distributed coordination |
| Capability model | Capability tags (Schema union) | Type-safe declaration of what each adapter supports |

---

## 1. Domain Model (Ontology Alignment)

| PAO Class | Effect Type | Purpose |
|-----------|-------------|---------|
| `pao:CommunicationChannel` | `ChannelRecord` (expanded) | Persisted channel metadata |
| `pao:ChannelType` | `ChannelType` schema union | `CLI`, `Messaging`, `WebChat`, `APIChannel`, `VoiceChannel`, `EmailChannel` |
| `pao:ExternalService` | `ExternalServiceConfig` (new) | Transport config: endpoint URL, auth ref, protocol |
| `pao:ServiceConnection` | Managed by adapter entity runtime | Runtime connection state with `ConnectionStatus` |
| `pao:ServiceCapability` | `ChannelCapability` schema union | `SendText`, `SendFile`, `Reactions`, `Threads`, `ReadReceipts`, `Typing`, `StreamingDelivery` |

### ChannelType Expansion

```typescript
export const ChannelType = Schema.Literals([
  "CLI", "Messaging", "WebChat", "APIChannel", "VoiceChannel", "EmailChannel"
])
```

### ChannelCapability

```typescript
export const ChannelCapability = Schema.Literals([
  "SendText", "SendFile", "Reactions", "Threads",
  "ReadReceipts", "Typing", "StreamingDelivery"
])
```

### InboundMessage (canonical envelope)

```typescript
export class InboundMessage extends Schema.Class<InboundMessage>("InboundMessage")({
  channelId: Schema.String,
  userId: Schema.String,
  userName: Schema.optionalWith(Schema.String, { as: "Option" }),
  text: Schema.String,
  timestamp: Schema.DateTimeUtc,
  threadId: Schema.optionalWith(Schema.String, { as: "Option" }),
  isGroup: Schema.Boolean,
  attachments: Schema.Array(InboundAttachment),
  metadata: Schema.Record({ key: Schema.String, value: Schema.Unknown })
}) {}
```

### ChannelRecord Expansion

```typescript
export interface ChannelRecord {
  readonly channelId: ChannelId
  readonly channelType: ChannelType
  readonly agentId: AgentId
  readonly activeSessionId: SessionId
  readonly activeConversationId: ConversationId
  readonly capabilities: ReadonlyArray<ChannelCapability>
  readonly serviceConfigJson: string | null
  readonly createdAt: Instant
}
```

---

## 2. Adapter Entity Architecture

### Approach: AdapterEntity as Entry Point (Approach C)

```
Platform Event -> AdapterEntity (normalize + session resolve + orchestrate) -> SessionEntity (process)
```

Each adapter type is an `Entity.make(...)` implementing a base protocol plus platform-specific RPCs. A shared `ChannelCore` service provides common logic.

### Base Protocol (all adapters implement)

```typescript
const InitializeRpc = Rpc.make("initialize", {
  payload: { agentId: Schema.String, config: ExternalServiceConfig },
  success: Schema.Void,
  primaryKey: ({ agentId }) => `init:${agentId}`
}).annotate(ClusterSchema.Persisted, true)

const ReceiveMessageRpc = Rpc.make("receiveMessage", {
  payload: { message: InboundMessage },
  success: TurnStreamEvent,
  error: Schema.Union([ChannelNotFound, TurnProcessingError]),
  stream: true
})

const GetHistoryRpc = Rpc.make("getHistory", {
  payload: {},
  success: Schema.Array(TurnRecordSchema),
  error: ChannelNotFound
})

const GetStatusRpc = Rpc.make("getStatus", {
  payload: {},
  success: ChannelStatusSchema
})
```

### ChannelCore Service

Extracted from the current ChannelEntity. Provides:
- `resolveSession(channelId, agentId, userId, mode)` — session key construction based on mode
- `ensureAgent(agentId)` — ensure agent state exists
- `persistChannel(record)` — persist channel record
- `buildTurnPayload(channel, message)` — construct turn payload from InboundMessage
- `processTurn(turnPayload)` — delegate to SessionEntity
- `getHistory(sessionId)` — fetch turn history

### Entity ID Convention

`{channelType}:{accountId}` (e.g., `WebChat:default`, `Email:personal`, `WhatsApp:+1234567890`). Maps to `pao:CommunicationChannel` instance identity.

### Current ChannelEntity Evolution

Renamed to `CLIAdapterEntity`. Implements the base protocol, delegates to `ChannelCore`.

---

## 3. Session Resolution & Cross-Channel Identity

### Session Resolution Modes

Configured per-agent in `agent.yaml`:

```yaml
agents:
  default:
    sessions:
      mode: shared          # "shared" | "per-channel" | "per-user-channel"
      overrides:
        Email: per-channel
```

| Mode | Session Key | Effect |
|------|-------------|--------|
| `shared` | `session:{agentId}:{canonicalUserId}` | One session per user across all channels |
| `per-channel` | `session:{agentId}:{channelId}` | One session per channel (current behavior) |
| `per-user-channel` | `session:{agentId}:{channelType}:{platformUserId}` | Per-user per-channel isolation |

### User Identity Linking

```typescript
export class UserIdentity extends Schema.Class<UserIdentity>("UserIdentity")({
  userId: UserId,
  platformLinks: Schema.Array(PlatformLink)
}) {}

export class PlatformLink extends Schema.Class<PlatformLink>("PlatformLink")({
  channelType: ChannelType,
  platformUserId: Schema.String,
  displayName: Schema.optionalWith(Schema.String, { as: "Option" }),
  linkedAt: Schema.DateTimeUtc
}) {}
```

### Governance on Cross-Channel Access

When session mode is `shared`, governance evaluates a `CrossChannelAccess` policy before allowing a channel to join an existing session:

```typescript
yield* governancePort.evaluatePolicy({
  action: "CrossChannelAccess",
  agentId,
  channelId,
  targetSessionId: existingSession.sessionId,
  sourceChannelType: "WebChat",
  targetChannelType: "Email"
})
```

### Database Changes

```sql
CREATE TABLE user_identities (
  user_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platform_links (
  channel_type TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES user_identities(user_id),
  display_name TEXT,
  linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (channel_type, platform_user_id)
);
```

Channels table gains optional `user_id` column.

---

## 4. Transport & Delivery Patterns

Each adapter owns its transport. No forced streaming on non-streaming transports.

### Email Adapter (IMAP/SMTP)

- **Inbound:** Polling-based scheduled fiber, configurable interval
- **Outbound:** Accumulate TurnStreamEvents, send single reply on `turn.completed`
- **Threading:** `In-Reply-To` / `References` headers map to `threadId`
- **Capabilities:** `["SendText", "SendFile", "Threads"]`

### WebChat Adapter (WebSocket)

- **Inbound:** WebSocket upgrade handler at `/ws/chat/{channelId}`
- **Outbound:** Real-time streaming, each TurnStreamEvent pushed as JSON frame
- **Reconnect:** Client sends `lastEventSequence`, entity replays missed events
- **Capabilities:** `["SendText", "Typing", "StreamingDelivery"]`

### WhatsApp Adapter (Webhook + REST API)

- **Inbound:** Webhook handler at `POST /webhook/whatsapp/{channelId}` with signature verification
- **Outbound:** Accumulate events, send via WhatsApp Business API, chunk at 4096 chars
- **Capabilities:** `["SendText", "SendFile", "Reactions", "ReadReceipts"]`

### Delivery Strategy (capability-driven)

```
StreamingDelivery capable (WebChat) -> forward each event as it arrives
Non-streaming (Email, WhatsApp) -> Stream.runCollect, deliver final result
```

### Route Registration

Each adapter registers transport-specific routes. The existing `/channels/:channelId/messages` SSE endpoint stays as the universal REST entry point. Platform-specific endpoints are additive.

---

## 5. Configuration & Wiring

### agent.yaml Extension

```yaml
channels:
  cli:
    enabled: true
  webchat:
    enabled: true
  email:
    enabled: false
    accounts:
      personal:
        imap: { host: "imap.gmail.com", port: 993, tls: true }
        smtp: { host: "smtp.gmail.com", port: 587, tls: true }
        credentialEnv: PA_EMAIL_PERSONAL_PASSWORD
        pollIntervalSeconds: 30
        allowFrom: ["alice@example.com"]
  whatsapp:
    enabled: false
    accounts:
      business:
        businessAccountId: "123456"
        phoneNumberId: "789012"
        credentialEnv: PA_WHATSAPP_BUSINESS_TOKEN
        webhookVerifyToken: "my-verify-token"
```

### Server Wiring

Conditional layer composition via `Layer.unwrap` reading from `AgentConfig`:

```typescript
const adapterLayers = Layer.unwrap(
  Effect.gen(function*() {
    const config = yield* AgentConfig
    const layers = [CLIAdapterEntity.layer]
    if (config.channels?.webchat?.enabled) layers.push(WebChatAdapterEntity.layer)
    if (config.channels?.email?.enabled) layers.push(EmailAdapterEntity.layer)
    if (config.channels?.whatsapp?.enabled) layers.push(WhatsAppAdapterEntity.layer)
    return Layer.mergeAll(...layers)
  }).pipe(Effect.provide(agentConfigLayer))
)
```

---

## 6. Testing Strategy

- **Unit tests per adapter:** `Entity.makeTestClient` with mocked transport (mock IMAP, mock WebSocket, mock webhook)
- **ChannelCore integration tests:** Session resolution modes, identity linking, governance cross-channel checks
- **E2E tests:** Full server boot per adapter exercising real transport endpoints
- **Regression:** Existing `ChannelEntity.test.ts` becomes `CLIAdapterEntity.test.ts` with minimal changes

---

## 7. Migration Path

1. Extract `ChannelCore` from current `ChannelEntity` logic
2. Rename `ChannelEntity` -> `CLIAdapterEntity` (implements base protocol)
3. Verify all existing tests pass
4. Add `WebChatAdapterEntity` (simplest — no external deps)
5. Add `EmailAdapterEntity`
6. Add `WhatsAppAdapterEntity`
7. Add session resolution and identity linking
8. Add governance for cross-channel access
