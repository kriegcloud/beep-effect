# Channel + Gateway Vertical Slice Design

## Goal

Build a complete message lifecycle: CLI sends text to a Channel entity, which delegates to a Session entity for turn processing via a durable workflow, streaming the LLM response back to the CLI. All HTTP endpoints are auto-derived from entity RPCs via EntityProxy.

## Decisions

- **CLI access**: Gateway-only. CLI is a thin HTTP client; server owns the cluster.
- **Channel model**: Channel is a first-class cluster entity with its own RPCs.
- **Slice scope**: Multi-turn conversation with full conversation history.
- **API migration**: Full replacement. EntityProxy replaces hand-coded Api.ts, TurnStreamingRouter.ts, and RuntimeApi.ts.
- **Architecture**: Channel-as-Facade. Channel is the primary API surface; the CLI only needs a channelId.
- **Queue semantics**: Cluster entity mailbox provides FIFO ordering, backpressure (MailboxFull), and idempotency (persisted primaryKey). No explicit queue needed.

## Channel Entity

ChannelEntity is the user-facing facade. It owns session lifecycle and provides a simple message API.

### RPCs

| RPC | Payload | Success | Notes |
|-----|---------|---------|-------|
| `createChannel` | `{ channelId, channelType, agentId }` | `void` | Creates channel + bootstrap session. `channelType`: `"CLI" \| "HTTP"` |
| `sendMessage` | `{ content }` | `Stream<TurnStreamEvent>` | `stream: true`. Resolves active session, generates turnId, delegates to SessionEntity.processTurn |
| `getHistory` | `{ conversationId, limit?, before? }` | `Array<Turn>` | Retrieves conversation history from SessionTurnPort |

### Internal State

Channel manages per-channel state:
- `channelId` → `agentId`, `channelType`, `activeSessionId`, `activeConversationId`
- Channel creates one Session on `createChannel`, reuses it for all `sendMessage` calls
- Future: `rotateSession` RPC when context window fills

### sendMessage Behavior

1. Look up active session for this channel
2. Generate `turnId` (UUID)
3. Build `ProcessTurnPayload` from the text content
4. Call `SessionEntity.processTurn(payload)` → `Stream<TurnStreamEvent>`
5. Forward the stream to the caller

## EntityProxy Gateway

EntityProxy auto-derives HTTP POST endpoints from entity RPCs.

### Endpoint Pattern

Each entity gets endpoints at `POST /{rpcTag}/:entityId`:

```
ChannelEntity:
  POST /createChannel/:entityId
  POST /sendMessage/:entityId       (streaming SSE response)
  POST /getHistory/:entityId

SessionEntity:
  POST /startSession/:entityId
  POST /processTurn/:entityId       (streaming SSE response)

AgentEntity:
  POST /getState/:entityId
  POST /upsertState/:entityId
  POST /consumeTokenBudget/:entityId

GovernanceEntity:
  POST /evaluatePolicy/:entityId
  POST /checkToolQuota/:entityId
  POST /writeAudit/:entityId

MemoryEntity:
  POST /retrieve/:entityId
  POST /encode/:entityId
  POST /forget/:entityId
```

### Server Wiring

```typescript
const ChannelHttpApi = EntityProxy.toHttpApiGroup("channels", ChannelEntity)
const SessionHttpApi = EntityProxy.toHttpApiGroup("sessions", SessionEntity)
// ... etc for all entities

const ProxyApi = HttpApi.make("ProxyApi").pipe(
  HttpApi.addGroup(ChannelHttpApi),
  HttpApi.addGroup(SessionHttpApi),
  // ...
)

// EntityProxyServer auto-implements handlers
const ProxyLive = EntityProxyServer.layerHttpApi(ProxyApi, "channels", ChannelEntity).pipe(
  Layer.merge(EntityProxyServer.layerHttpApi(ProxyApi, "sessions", SessionEntity)),
  // ...
)
```

A plain `/health` endpoint is added as a simple `HttpRouter.get` outside the proxy.

### Cluster Error Handling

EntityProxy automatically adds cluster errors to all RPC error types:
- `MailboxFull` — entity overwhelmed, backpressure signal
- `AlreadyProcessingMessage` — concurrent access
- `PersistenceError` — durable state failure

Each RPC also gets a `*Discard` fire-and-forget variant.

## CLI Changes

### Commands

| Command | What it does |
|---------|--------------|
| `agent chat` | Interactive REPL. Creates channel (or resumes), reads input, streams responses. |
| `agent chat --channel <id>` | Resume an existing channel/conversation |
| `agent chat --new` | Start a fresh channel |
| `agent status` | Health check against `/health` endpoint |

### Chat REPL Flow

```
1. Generate channelId (or use --channel flag, or load from ~/.personal-agent/channels.json)
2. POST /createChannel/:channelId  { channelType: "CLI", agentId: "agent:bootstrap" }
3. Loop:
   a. Read user input from stdin (prompt: "> ")
   b. POST /sendMessage/:channelId  { content: userInput }
   c. Stream SSE response:
      - TurnStartedEvent → show spinner/indicator
      - AssistantDeltaEvent → print text chunks incrementally
      - ToolCallEvent → print "[tool: name(args)]"
      - ToolResultEvent → print tool output
      - TurnCompletedEvent → newline, show prompt again
      - TurnFailedEvent → print error, show prompt again
4. Ctrl+C to exit
```

### Local Channel Persistence

Store channel mappings in `~/.personal-agent/channels.json`:

```json
{ "default": "channel:abc123" }
```

- `agent chat` with no flags uses the `"default"` channel
- `agent chat --new` creates a fresh channel and sets it as default
- `agent chat --channel <id>` uses a specific channel

## Data Flow

```
CLI: user types "What's the weather?"
  │
  ▼
POST /sendMessage/:channelId  { content: "What's the weather?" }
  │
  ▼
ChannelEntity.sendMessage
  ├─ lookup activeSessionId, activeConversationId, agentId
  ├─ generate turnId
  ├─ build ProcessTurnPayload
  └─ SessionEntity.processTurn(payload) → Stream
       │
       ▼
     TurnProcessingRuntime.processTurnStream
       │
       ▼
     TurnProcessingWorkflow (durable):
       1. governancePort.evaluatePolicy → Allow
       2. agentStatePort.consumeTokenBudget
       3. sessionTurnPort.appendTurn(userTurn)       ← persisted
       4. sessionTurnPort.updateContextWindow
       5. chatPersistence.getOrCreate(sessionId)     ← load history
       6. chat.generateText(tools)                   ← LLM call
       7. transform response → ContentBlocks
       8. sessionTurnPort.appendTurn(assistantTurn)  ← persisted
       9. governancePort.writeAudit
       │
       ▼
     ProcessTurnResult → Stream<TurnStreamEvent>
       │
       ▼
SSE: turn.started → assistant.delta → ... → turn.completed
  │
  ▼
CLI: renders text chunks as they arrive
```

Conversation persistence uses two existing mechanisms:
1. **SessionTurnPort** (SQLite) — authoritative turn storage (steps 3, 8)
2. **ChatPersistence** (Effect Chat.Persistence backed by SQL) — LLM context building (step 5)

No new persistence code needed.

## Queue Semantics

Cluster entity mailbox provides implicit queue behavior:
- One RPC processed at a time per entity instance (addressed by entityId)
- Additional messages queue in the mailbox (FIFO)
- `MailboxFull` error if capacity exceeded (backpressure)
- Streaming RPCs hold the mailbox slot for the stream duration
- Idempotency via `primaryKey` + `ClusterSchema.Persisted`

For a CLI REPL where the user waits for the response, this is the correct behavior.

## Testing Strategy

### Unit Tests (Entity.makeTestClient)

| Test | Validates |
|------|-----------|
| `ChannelEntity.createChannel` | Creates channel, bootstraps session |
| `ChannelEntity.sendMessage` | Delegates to SessionEntity.processTurn, returns event stream |
| `ChannelEntity.sendMessage` sequential | Second message processes after first completes |
| `ChannelEntity.getHistory` | Returns turns from SessionTurnPort |

ChannelEntity tests require a live SessionEntity in the test context since Channel delegates to Session.

### Integration Tests (E2E through proxy)

| Test | Validates |
|------|-----------|
| HTTP round-trip | POST `/createChannel/:id` then POST `/sendMessage/:id` → SSE stream |
| Multi-turn | Send 2 messages, second response includes context from first |
| Idempotency | Same turnId twice → same result |

No CLI tests — CLI is a thin REPL, tested manually.

## Files

### New

1. `packages/server/src/entities/ChannelEntity.ts`
2. `packages/server/src/gateway/ProxyGateway.ts`
3. `packages/server/test/ChannelEntity.test.ts`
4. `packages/server/test/ProxyGateway.e2e.test.ts`

### Modified

5. `packages/server/src/server.ts` — Replace ApiLive + TurnStreamingLayer with ProxyGateway
6. `packages/cli/src/Cli.ts` — Add `agent chat` command
7. `packages/cli/src/RuntimeClient.ts` — Rewrite for proxy endpoints + SSE streaming
8. `packages/domain/src/ids.ts` — Add `ChannelId` branded type
9. `packages/domain/src/ports.ts` — Add channel-related types if needed

### Deleted

10. `packages/server/src/Api.ts`
11. `packages/server/src/TurnStreamingRouter.ts`
12. `packages/domain/src/RuntimeApi.ts`

### Unchanged

- All existing entity files (AgentEntity, SessionEntity, GovernanceEntity, MemoryEntity)
- All port/SQLite implementation files
- TurnProcessingWorkflow, TurnProcessingRuntime
- ChatPersistence, LanguageModelLive, ToolRegistry

## Risks

- **EntityProxy API surface**: Need to verify exact `toHttpApiGroup` and `layerHttpApi` signatures against `.reference/effect/` during implementation
- **Streaming through proxy**: Confirm EntityProxy handles streaming RPCs → SSE correctly (the source code shows support but needs integration testing)
- **Channel-to-Session delegation**: ChannelEntity calling SessionEntity.client within an entity handler — verify this works within cluster semantics (entity-to-entity RPC)
- **Chat.Persistence integration**: Existing ChatPersistence uses Effect's internal `Chat.layerPersisted()` — verify it works correctly with multi-turn conversation loads
