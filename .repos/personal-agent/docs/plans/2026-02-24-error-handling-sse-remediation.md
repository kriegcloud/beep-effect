# Error Handling, Cluster Architecture & SSE Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix entity boundary misalignments, error handling gaps, and replace manual SSE encoding/decoding with Effect's native `effect/unstable/encoding/Sse` module.

**Architecture:** Four concerns — (1) correct entity boundaries so only true actors are entities, (2) tighten error propagation from ports through entities to HTTP, (3) fix cluster Entity misconfigurations on remaining entities, (4) adopt `Sse.encode` / `Sse.decode` for wire-format handling.

**Tech Stack:** Effect 4.0.0-beta.11, `effect/unstable/encoding/Sse`, `effect/unstable/http`

---

## Cluster Architecture Assessment

### How Effect Cluster Entities Are Designed

An Effect Cluster Entity is a **distributed actor**:

- **`entityId`** is a routing key — determines which shard/runner processes the message. All requests to the same `entityId` go to the same mailbox.
- **FIFO mailbox** — within one entity instance, requests are processed sequentially (concurrency defaults to 1). Serialized access to state without locks.
- **`primaryKey`** — idempotency *within* an entity instance. If the same `primaryKey` arrives twice, the second gets the cached result. This is NOT the entity ID — it's a deduplication key for the payload.
- **`Persisted`** — the message is saved to storage before processing. On crash, it's recovered and retried. Designed for durability of writes, not reads.

The design intent: an entity **owns state** and **makes decisions**. It's an actor with a mailbox, not a service proxy.

### Current Entity Audit

| Entity | Entity ID | Owns state? | Has behavior? | Correct use of Entity? |
|--------|-----------|-------------|---------------|----------------------|
| `ChannelEntity` | channelId | Yes (channel→session mapping) | Yes (create-if-missing, facade routing) | **Yes** |
| `AgentEntity` | agentId | Yes (budget, permissions) | Minimal (pass-through to port) | **Yes** — FIFO needed for budget consumption |
| `SessionEntity` | sessionId | Yes (turns, context window) | Minimal (delegates to runtime) | **Yes** — FIFO needed for turn ordering |
| `GovernanceEntity` | ??? (no natural ID) | No (stateless service) | No (pure pass-through) | **No — should be a service** |
| `MemoryEntity` | ??? (no natural ID) | No (stateless store) | No (pure pass-through) | **No — should be a service** |
| `SchedulerCommandEntity` | scheduleId | Yes (schedule state) | Yes (dispatch logic) | **Yes** |

### Why GovernanceEntity and MemoryEntity Are Wrong

**GovernanceEntity** wraps a stateless cross-cutting concern (policy evaluation, quota checking, audit writing). As an entity:
- Every `evaluatePolicy` call is serialized through an arbitrary mailbox — artificial bottleneck with no benefit
- `Persisted` on reads journals every policy check for crash recovery — pointless overhead
- The `primaryKey` caches policy decisions — returns stale results if policies change
- There's no natural entity ID — callers fabricate one

**MemoryEntity** wraps a shared store. `retrieve` is a query, `encode` writes to a shared index, `forget` is a bulk delete. None of these operations belong to a specific entity instance. The per-entity mailbox serialization actively hurts read concurrency.

Both already exist as proper services via `GovernancePortTag` and `MemoryPortTag`. The entities are redundant wrappers that add overhead and misuse the cluster abstraction.

### ChannelEntity → SessionEntity Bypass

`ChannelEntity.sendMessage` calls `TurnProcessingRuntime` directly instead of going through `SessionEntity.client`. This means:
- No Session mailbox FIFO ordering on turns — concurrent messages to the same channel race
- No session-level idempotency through the Session entity
- The Session entity's `processTurn` RPC is effectively dead code for the channel flow

This was done because `Entity.makeTestClient` doesn't support cross-entity calls (`makeClient` unavailable in mock Sharding). The bypass is acceptable for single-user CLI but is a correctness issue for concurrent access.

---

## R0a: Remove GovernanceEntity — use GovernancePortTag directly

**Files:**
- Delete: `packages/server/src/entities/GovernanceEntity.ts`
- Modify: `packages/server/src/gateway/ProxyGateway.ts` — remove GovernanceEntity from EntityProxy
- Modify: `packages/server/src/server.ts` — remove `governanceEntityLayer`, remove from `PortsLive`

**Problem:** GovernanceEntity wraps `GovernancePortTag` in an Entity with no natural entity ID, no per-instance state, and no behavior. Every call goes through an artificial mailbox (serialization bottleneck) and journals reads with `Persisted` (pointless overhead). The port tag already provides the same interface without cluster overhead.

**What stays:** `GovernancePortTag`, `GovernancePortSqlite`, `GovernancePort` interface — all unchanged. The workflow (`TurnProcessingWorkflow.ts`) already calls `GovernancePortTag` directly, not the entity. The entity was only consumed by `ProxyGateway`.

**If governance needs HTTP endpoints:** Replace the EntityProxy route with a plain `HttpRouter.add` route that calls `GovernancePortTag` directly, same as `ChannelRoutes`. But evaluate whether governance endpoints are needed at all — policy evaluation and audit writes are internal operations, not client-facing.

**Verification:** `bun run check && bun test`

---

## R0b: Remove MemoryEntity — use MemoryPortTag directly

**Files:**
- Delete: `packages/server/src/entities/MemoryEntity.ts`
- Modify: `packages/server/src/gateway/ProxyGateway.ts` — remove MemoryEntity from EntityProxy
- Modify: `packages/server/src/server.ts` — remove `memoryEntityLayer`, remove from `PortsLive`

**Problem:** Same as GovernanceEntity. MemoryEntity wraps `MemoryPortTag` with no natural entity ID. `retrieve` is a query against a shared store — the per-entity mailbox serializes reads that could be concurrent. `RetrieveRpc` with `primaryKey: ({ agentId }) => retrieve:${agentId}` caches results incorrectly — two different queries for the same agent (different `text`, different `limit`) return the same cached result.

**What stays:** `MemoryPortTag`, `MemoryPortMemory`, `MemoryPort` interface — all unchanged. If memory needs to become an actor later (e.g., per-agent memory consolidation as described in the architecture review), it can be re-introduced with a proper entity ID (`agentId`) and actual behavior (consolidation schedules, TTL eviction).

**If memory needs HTTP endpoints:** Same approach as R0a — plain `HttpRouter.add` routes calling `MemoryPortTag`.

**Verification:** `bun run check && bun test`

---

## R0c: Route ChannelEntity.sendMessage through SessionEntity

**Files:**
- Modify: `packages/server/src/entities/ChannelEntity.ts`

**Problem:** `ChannelEntity.sendMessage` bypasses `SessionEntity` and calls `TurnProcessingRuntime` directly. This loses the Session mailbox's FIFO guarantee — concurrent messages to the same channel race through the workflow with no serialization. The bypass was necessary because `Entity.makeTestClient` doesn't support `makeClient` for cross-entity calls.

**Target:** In the `ChannelEntity` layer, replace direct `TurnProcessingRuntime` usage with `SessionEntity.client`:

```typescript
export const layer = ChannelEntity.toLayer(Effect.gen(function*() {
  const channelPort = yield* ChannelPortTag
  const sessionTurnPort = yield* SessionTurnPortTag
  const makeSessionClient = yield* SessionEntity.client  // instead of TurnProcessingRuntime

  return {
    // ...
    sendMessage: (request) =>
      Stream.unwrap(
        Effect.gen(function*() {
          const channelId = String(request.address.entityId) as ChannelId
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return Stream.fail(new ChannelNotFound({ channelId }))
          }

          const sessionClient = makeSessionClient(channel.activeSessionId)
          return sessionClient.processTurn({
            turnId: `turn:${crypto.randomUUID()}`,
            sessionId: channel.activeSessionId,
            conversationId: channel.activeConversationId,
            agentId: channel.agentId,
            content: request.payload.content,
            contentBlocks: [{ contentBlockType: "TextBlock", text: request.payload.content }],
            createdAt: yield* DateTime.now,
            inputTokens: 0
          })
        })
      ),
    // ...
  }
}))
```

**Dependencies in `server.ts`:** `channelEntityLayer` needs `sessionEntityLayer` provided (for `SessionEntity.client`). Replace `turnProcessingRuntimeLayer` dependency with `sessionEntityLayer`.

**Testing impact:** `ChannelEntity.test.ts` tests that use `Entity.makeTestClient` will need adjustment. If `makeClient` is unavailable in test Sharding, options:
1. Test through the HTTP layer (`ChannelRoutes.e2e.test.ts`) instead of `makeTestClient`
2. Provide a mock `SessionEntity.client` layer manually
3. Keep a `// TODO` and test the integration path through e2e tests only

**Verification:** `bun run check && bun test`

---

## R1: Replace manual SSE encoding with `Sse.encode`

**Files:**
- Modify: `packages/server/src/gateway/ChannelRoutes.ts`

**Problem:** `encodeSseEvent` manually builds `event: ...\ndata: ...\n\n` strings and calls `new TextEncoder().encode(...)`. This is fragile (no multiline data escaping, no retry support, no event ID tracking) and duplicates what `effect/unstable/encoding/Sse` provides natively.

**Current code** (`ChannelRoutes.ts:18-21`):
```typescript
const encodeSseEvent = (event: TurnStreamEvent): Uint8Array =>
  new TextEncoder().encode(
    `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
  )
```

**Target:** Use `Sse.encode` channel to transform `TurnStreamEvent` domain objects into SSE wire format.

```typescript
import * as Sse from "effect/unstable/encoding/Sse"

// Convert domain events to Sse.Event shape
const toSseEvent = (event: TurnStreamEvent): Sse.Event => ({
  _tag: "Event",
  event: event.type,
  id: String(event.sequence),
  data: JSON.stringify(event)
})
```

In the `sendMessage` route handler, replace the manual encoding pipeline:

```typescript
// BEFORE
const stream = client.sendMessage({ content }).pipe(
  Stream.map(encodeSseEvent),
  Stream.catch((error) => Stream.make(encodeSseEvent(failEvent)))
)
return HttpServerResponse.stream(stream, { contentType: "text/event-stream", ... })

// AFTER
const stream = client.sendMessage({ content }).pipe(
  Stream.catch((error) => Stream.make(failEvent)),
  Stream.map(toSseEvent),
  Stream.pipeThroughChannel(Sse.encode()),
  Stream.encodeText
)
return HttpServerResponse.stream(stream, { contentType: "text/event-stream", ... })
```

Delete `encodeSseEvent` and `getErrorCode`/`getErrorMessage` helpers (see R3 for error handling replacement).

**Verification:** `bun run check && bun test`

---

## R2: Replace manual SSE parsing in CLI with `Sse.decode`

**Files:**
- Modify: `packages/cli/src/RuntimeClient.ts`

**Problem:** The CLI manually parses SSE by splitting lines, filtering `data: ` prefixes, and `JSON.parse`-ing. This doesn't handle multiline `data:` fields, `id:` fields, `retry:` instructions, or UTF-8 BOM.

**Current code** (`RuntimeClient.ts:29-35`):
```typescript
response.stream.pipe(
  Stream.decodeText(),
  Stream.splitLines,
  Stream.filter((line) => line.startsWith("data: ")),
  Stream.map((line) => line.slice(6)),
  Stream.filter((json) => json.length > 0),
  Stream.map((json) => JSON.parse(json) as TurnStreamEvent)
)
```

**Target:** Use `Sse.decodeDataSchema` with the `TurnStreamEvent` schema for type-safe, spec-compliant SSE parsing.

```typescript
import * as Sse from "effect/unstable/encoding/Sse"
import { TurnStreamEvent } from "@template/domain/events"

// In sendMessage:
response.stream.pipe(
  Stream.decodeText(),
  Stream.pipeThroughChannel(Sse.decodeDataSchema(TurnStreamEvent)),
  Stream.map((event) => event.data)  // extract parsed TurnStreamEvent
)
```

This gives us:
- Proper multiline data field handling
- Event ID tracking (for future reconnection)
- Schema validation on decode (catches malformed events)
- UTF-8 BOM stripping

**Note:** `Sse.decodeDataSchema` introduces `Schema.SchemaError` into the error channel. Handle it with `Stream.catchTag("SchemaError", ...)` or let it propagate as a defect if the server should never send malformed events.

**Verification:** `bun run check && bun test`

---

## R3: Add error handling to non-streaming HTTP routes

**Files:**
- Modify: `packages/server/src/gateway/ChannelRoutes.ts`

**Problem:** `createChannel` and `getHistory` routes have no error handling. Entity RPC failures propagate as raw Effect errors, producing unstructured 500 responses.

**`getHistory`** can fail with `ChannelNotFound` (declared on `GetHistoryRpc`). Should return HTTP 404.

**`createChannel`** currently swallows errors silently (returns void). If `channelPort.create` or `sessionTurnPort.startSession` fail, those are `orDie` defects — acceptable. But the route should still handle unexpected errors gracefully.

**Target for `getHistory`:**
```typescript
const getHistory = HttpRouter.add(
  "POST",
  "/channels/:channelId/history",
  (request) =>
    Effect.gen(function*() {
      const makeClient = yield* ChannelEntity.client
      const channelId = extractParam(request.url, 1)
      const client = makeClient(channelId)
      const turns = yield* client.getHistory({})
      return yield* HttpServerResponse.json(turns)
    }).pipe(
      Effect.catchTag("ChannelNotFound", (error) =>
        HttpServerResponse.json(
          { error: "ChannelNotFound", channelId: error.channelId },
          { status: 404 }
        )
      )
    )
)
```

**Target for `sendMessage` error events** — replace untyped `getErrorCode`/`getErrorMessage` with typed pattern match:
```typescript
Stream.catch((error) => {
  const failEvent: TurnFailedEvent = {
    type: "turn.failed",
    sequence: Number.MAX_SAFE_INTEGER,
    turnId: "",
    sessionId: "",
    errorCode: error._tag,
    message: "reason" in error ? error.reason : error._tag
  }
  return Stream.make(failEvent)
})
```

Delete the `getErrorCode` and `getErrorMessage` helper functions.

**Verification:** `bun run check && bun test`

---

## R4: Remove `Persisted` and `primaryKey` from read-only RPCs

**Files:**
- Modify: `packages/server/src/entities/AgentEntity.ts`
- Modify: `packages/server/src/entities/ChannelEntity.ts`

**Problem:** Read-only RPCs (`getState`, `getHistory`) are annotated with `ClusterSchema.Persisted` and have `primaryKey` functions. This causes the cluster to journal every read for crash recovery (unnecessary overhead) and cache read results by `primaryKey` (incorrect behavior — `GetHistoryRpc` uses `primaryKey: () => "history"` which means ALL channels share one cached result).

**Note:** GovernanceEntity and MemoryEntity read RPCs are resolved by R0a/R0b (entities deleted entirely).

**Changes:**

`AgentEntity.ts` — `GetStateRpc`:
```typescript
// BEFORE
const GetStateRpc = Rpc.make("getState", {
  payload: { agentId: Schema.String },
  success: AgentStateOrNull,
  primaryKey: ({ agentId }) => agentId
}).annotate(ClusterSchema.Persisted, true)

// AFTER
const GetStateRpc = Rpc.make("getState", {
  payload: { agentId: Schema.String },
  success: AgentStateOrNull
})
```

`ChannelEntity.ts` — `GetHistoryRpc`:
```typescript
// BEFORE
const GetHistoryRpc = Rpc.make("getHistory", {
  payload: {},
  success: Schema.Array(TurnRecordSchema),
  error: ChannelNotFound,
  primaryKey: () => "history"
})

// AFTER — remove primaryKey entirely
const GetHistoryRpc = Rpc.make("getHistory", {
  payload: {},
  success: Schema.Array(TurnRecordSchema),
  error: ChannelNotFound
})
```

**Leave `Persisted` and `primaryKey` on all write RPCs** — those correctly need idempotency and crash recovery.

**Verification:** `bun run check && bun test`

---

## R5: Use entity ID instead of payload ID in entity handlers

**Files:**
- Modify: `packages/server/src/entities/AgentEntity.ts`

**Problem:** `AgentEntity` handlers pass `payload.agentId` to port methods, but the entity is addressed by `request.address.entityId`. If a caller sends `agentId: "agent:A"` to the entity addressed as `"agent:B"`, the handler silently operates on agent A while the cluster routes to entity B. `ChannelEntity` already does this correctly.

**Target:**
```typescript
// BEFORE
getState: ({ payload }) => port.get(payload.agentId as AgentId),

// AFTER
getState: (request) => {
  const agentId = String(request.address.entityId) as AgentId
  return port.get(agentId)
},
```

Apply the same pattern to `upsertState` and `consumeTokenBudget` — derive `agentId` from `request.address.entityId`, ignore `payload.agentId`.

**Note:** This may require adjusting callers that currently rely on `payload.agentId`. Check that the entity is always addressed by the correct agent ID. GovernanceEntity and MemoryEntity had the same issue but are resolved by R0a/R0b (entities deleted).

**Verification:** `bun run check && bun test`

---

## R6: Make audit writes non-fatal in the workflow

**Files:**
- Modify: `packages/server/src/turn/TurnProcessingWorkflow.ts`

**Problem:** `writeAuditEntry` is an Activity on the critical path. If the governance port's SQL write fails, the entire workflow fails. Audit writes are observability side-effects — they should not abort a user's turn.

**Target:** Wrap audit writes in `Effect.ignoreLogged` so failures are logged but don't propagate:

```typescript
const writeAuditEntry = (...) =>
  Activity.make({
    name: "WriteAudit",
    execute: Effect.gen(function*() {
      const idempotencyKey = yield* Activity.idempotencyKey(`WriteAudit:${reasonCode}`)
      const auditEntryId = (`audit:${idempotencyKey}`) as AuditEntryId
      yield* governancePort.writeAudit({ ... })
    })
  }).asEffect().pipe(Effect.ignoreLogged)
```

**Exception:** The audit writes that happen *before* failing (e.g., `turn_processing_policy_denied` before returning `TurnPolicyDenied`) should still be best-effort. The error should come from the policy decision, not the audit write.

**Verification:** `bun run check && bun test`

---

## R7: Separate model errors from encoding errors in workflow

**Status: DONE (Option A)**

The second catch block (line 225) now prefixes the reason with `encoding_error:`:
```typescript
reason: `encoding_error: ${toErrorMessage(error)}`
```

This distinguishes LLM provider errors from schema encoding errors while keeping the same `TurnModelFailure` type. Option B (separate `TurnEncodingFailure` class) remains available if alerting differentiation is needed later.

---

## R8: Remove unused `ClusterEntityError`

**Files:**
- Modify: `packages/domain/src/errors.ts`

**Problem:** `ClusterEntityError` is defined but never referenced anywhere in the codebase. Dead code.

**Action:** Delete the class definition (lines 36-40). If it was intended for future use, it can be re-added when needed.

**Verification:** `bun run check && bun test`

---

## R9: Port error handling — keep current pattern

**Status: WON'T FIX — current pattern is correct**

**Original proposal:** Replace `Effect.catch((error: unknown) => instanceof ? fail : die)` with `Effect.catchTag` + `Effect.orDie`.

**Why it doesn't work:** `Effect.catchTag("X", Effect.fail)` catches the error and re-fails with it, re-introducing it into the error channel. Then `Effect.orDie` kills ALL remaining errors — including the re-introduced domain error. The result is that domain errors become defects, breaking tests.

Effect v4 does not have `Effect.catchAll` and `Effect.catchTag`/`Effect.catchTags` cannot express "keep these errors as failures, die on everything else" in two composable steps.

The existing `Effect.catch((error: unknown) => ...)` pattern with `instanceof` discrimination is the correct approach for this use case. It handles the "selectively die" semantics in a single catch-all.

---

## Completion Status

| Task | Status | Notes |
|------|--------|-------|
| R0a: Remove GovernanceEntity | **DONE** | Entity deleted, removed from ProxyGateway and server.ts |
| R0b: Remove MemoryEntity | **DONE** | Entity deleted, removed from ProxyGateway and server.ts |
| R0c: Route ChannelEntity through SessionEntity | **DONE** | sendMessage uses SessionEntity.client |
| R1: Server-side `Sse.encode` | **DONE** | Uses `Sse.encode()` channel |
| R2: Client-side `Sse.decodeDataSchema` | **DONE** | Uses `Sse.decodeDataSchema(TurnStreamEvent)` |
| R3: HTTP error handling on non-streaming routes | **DONE** | `getHistory` returns 404 via `Effect.catchTag` |
| R4: Remove `Persisted`/`primaryKey` from reads | **DONE** | Cleaned on AgentEntity and ChannelEntity |
| R5: Entity ID vs payload ID | **DONE** | AgentEntity uses `address.entityId` |
| R6: Non-fatal audit writes | **DONE** | Uses `Effect.ignore` |
| R7: Separate model/encoding errors | **DONE** | Option A — `encoding_error:` prefix |
| R8: Remove unused `ClusterEntityError` | **DONE** | Deleted from errors.ts |
| R9: Port error handling | **WON'T FIX** | Current `Effect.catch` + `instanceof` pattern is correct; `Effect.catchTag` + `Effect.orDie` can't selectively keep domain errors |

**All actionable items complete.**

---

## Verification

1. `bun run check` — zero type errors after each task
2. `bun run test` — all tests pass after each task
3. `bun run lint` — no lint errors
4. Manual smoke test: `agent chat` round-trip still streams SSE correctly
