# Logging, Spans & Error Observability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish consistent logging, span tracing, and error context preservation across the server using Effect-native observability primitives.

**Architecture:** Add `Effect.withSpan` at key boundaries (HTTP routes, entity RPCs, workflow steps), `Effect.annotateLogs` to thread domain IDs through log context, replace `Cause.squash` + `toErrorMessage` with `Cause.pretty`, and add `Effect.tapDefect(Effect.logError)` before all `.orDie` calls. Add `Logger.consoleJson` to the server for structured output.

**Tech Stack:** Effect v4 beta.11 (`Effect.withSpan`, `Effect.annotateLogs`, `Effect.tapDefect`, `Cause.pretty`, `Logger.consoleJson`)

---

### Task 1: Structured JSON logger in server.ts

**Files:**
- Modify: `packages/server/src/server.ts`

Add `Logger` to imports and provide `Logger.consoleJson` as a layer so all Effect.log output is structured JSON.

**Changes:**

1. Update the import on line 11 from:
   ```typescript
   import { Effect, Layer } from "effect"
   ```
   to:
   ```typescript
   import { Effect, Layer, Logger } from "effect"
   ```

2. Add the logger layer to `HttpLive`. Change:
   ```typescript
   Layer.launch(HttpLive).pipe(
     BunRuntime.runMain
   )
   ```
   to:
   ```typescript
   Layer.launch(HttpLive).pipe(
     Effect.provide(Logger.consoleJson),
     BunRuntime.runMain
   )
   ```

**Verify:** `bun run start` — server logs appear as JSON objects instead of the default format. The scheduler tick messages should be JSON.

**Commit:** `feat: add structured JSON logger to server`

---

### Task 2: Fix error context in ChannelCore.ts

**Files:**
- Modify: `packages/server/src/ChannelCore.ts`

Replace all `toErrorMessage(Cause.squash(cause))` with `Cause.pretty(cause)`. Remove the `toErrorMessage` helper (it's only used here for Cause-based errors). Add `Effect.annotateLogs` with channelId to the `processTurn` function.

**Changes:**

1. Remove line 14:
   ```typescript
   const toErrorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error)
   ```

2. Replace the `PersistenceError` handler (line 153-156) from:
   ```typescript
   PersistenceError: (error) =>
     failWithModelFailure(
       `session_entity_persistence_error: ${toErrorMessage(error)}`
     )
   ```
   to:
   ```typescript
   PersistenceError: (error) =>
     failWithModelFailure(
       `session_entity_persistence_error: ${error.message ?? String(error)}`
     )
   ```

3. Replace `Stream.catchCause` (lines 158-162) from:
   ```typescript
   Stream.catchCause((cause) =>
     failWithModelFailure(
       `session_entity_stream_error: ${toErrorMessage(Cause.squash(cause))}`
     )
   )
   ```
   to:
   ```typescript
   Stream.catchCause((cause) =>
     failWithModelFailure(
       `session_entity_stream_error: ${Cause.pretty(cause)}`
     )
   )
   ```

4. Replace `Effect.catchCause` (lines 165-172) from:
   ```typescript
   Effect.catchCause((cause) => {
     const error = Cause.squash(cause)
     return Effect.succeed(
       failWithModelFailure(
         `session_entity_client_error: ${toErrorMessage(error)}`
       )
     )
   })
   ```
   to:
   ```typescript
   Effect.catchCause((cause) =>
     Effect.succeed(
       failWithModelFailure(
         `session_entity_client_error: ${Cause.pretty(cause)}`
       )
     )
   )
   ```

5. Add `Effect.annotateLogs` to the `receiveMessage` RPC handler. Find the `receiveMessage` method that returns the `processTurn` stream and wrap the return with:
   ```typescript
   Effect.annotateLogs({ module: "ChannelCore", channelId })
   ```

**Verify:** `bun run check && bun run test` — all 230 tests pass. Then `bun run start`, send a bad request to trigger an error, and verify the error message now includes stack trace info instead of being empty.

**Commit:** `fix: preserve error context with Cause.pretty in ChannelCore`

---

### Task 3: Fix error context in TurnProcessingWorkflow.ts

**Files:**
- Modify: `packages/server/src/turn/TurnProcessingWorkflow.ts`

Replace `toErrorMessage` usage with proper typed error message extraction. Add `Effect.withSpan` around the model call and key workflow steps. Add `Effect.annotateLogs` with turn context. Log swallowed memory retrieval errors.

**Changes:**

1. Add `Cause` and `Stream` to the import on line 1:
   ```typescript
   import { Cause, Effect, Layer, Ref, Schema, Stream } from "effect"
   ```

2. Replace the silent memory retrieval fallback (line 182) from:
   ```typescript
   ).pipe(Effect.catch(() => Effect.succeed([] as ReadonlyArray<{ content: string }>)))
   ```
   to:
   ```typescript
   ).pipe(Effect.catch((error) =>
     Effect.logWarning("Semantic memory retrieval failed, continuing without memories", Cause.die(error)).pipe(
       Effect.as([] as ReadonlyArray<{ content: string }>)
     )
   ))
   ```

3. The `Effect.catch` on the `generateText` call (lines 224-240) uses `toErrorMessage(error)` which can produce empty strings for Effect errors. Replace `reason: toErrorMessage(error)` with:
   ```typescript
   reason: error instanceof Error ? error.message : String(error)
   ```
   This is the same logic but explicit — the issue was that `toErrorMessage` was also used for Cause-squashed values. Here the error is a typed error from `Effect.catch` so `.message` is correct.

4. Same fix for the encoding error catch (line 264):
   ```typescript
   reason: `encoding_error: ${error instanceof Error ? error.message : String(error)}`
   ```

5. Add `Effect.withSpan` around the `generateText` call. Wrap the model response block:
   ```typescript
   yield* chat.generateText({
     prompt: userPrompt,
     toolkit: toolkitBundle.toolkit
   }).pipe(
     Effect.provide(Layer.merge(toolkitBundle.handlerLayer, lmLayer)),
     Effect.withSpan("TurnProcessing.generateText")
   )
   ```

6. Add `Effect.annotateLogs` to the outer workflow effect with turn context:
   ```typescript
   Effect.annotateLogs({
     module: "TurnProcessingWorkflow",
     turnId: payload.turnId,
     sessionId: payload.sessionId,
     agentId: payload.agentId
   })
   ```

7. Remove the `toErrorMessage` helper function (lines 388-393) — it's no longer used.

**Verify:** `bun run check && bun run test` — all tests pass.

**Commit:** `fix: improve error context and add spans to TurnProcessingWorkflow`

---

### Task 4: Fix error context in WebChatRoutes.ts

**Files:**
- Modify: `packages/server/src/gateway/WebChatRoutes.ts`

Replace `Cause.squash` usage with `Cause.pretty`. Add `Effect.annotateLogs` with channelId.

**Changes:**

1. Replace the message frame `catchCause` (lines 187-199) from:
   ```typescript
   Effect.catchCause((cause) => {
     const err = Cause.squash(cause)
     const failedEvent = new TurnFailedEvent({
       type: "turn.failed",
       sequence: Number.MAX_SAFE_INTEGER,
       turnId: "",
       sessionId: "",
       errorCode: "MESSAGE_ERROR",
       message: err instanceof Error ? err.message : String(err)
     })
     return writeFn(encodeToJson(failedEvent)).pipe(Effect.ignore)
   })
   ```
   to:
   ```typescript
   Effect.catchCause((cause) => {
     const failedEvent = new TurnFailedEvent({
       type: "turn.failed",
       sequence: Number.MAX_SAFE_INTEGER,
       turnId: "",
       sessionId: "",
       errorCode: "MESSAGE_ERROR",
       message: Cause.pretty(cause)
     })
     return writeFn(encodeToJson(failedEvent)).pipe(Effect.ignore)
   })
   ```

2. Replace the init frame `catchCause` (lines 170-174) from:
   ```typescript
   Effect.catchCause((cause) =>
     writeFn(errorFrame("INIT_FAILED", String(cause))).pipe(
       Effect.ignore
     )
   )
   ```
   to:
   ```typescript
   Effect.catchCause((cause) =>
     writeFn(errorFrame("INIT_FAILED", Cause.pretty(cause))).pipe(
       Effect.ignore
     )
   )
   ```

3. Add `Effect.annotateLogs` wrapping the inner handler body with the channelId:
   ```typescript
   Effect.annotateLogs({ module: "WebChatRoutes", channelId })
   ```

**Verify:** `bun run check && bun run test && bun run test:ws` — all tests pass.

**Commit:** `fix: preserve error context with Cause.pretty in WebChatRoutes`

---

### Task 5: Add spans and annotations to ChannelRoutes.ts

**Files:**
- Modify: `packages/server/src/gateway/ChannelRoutes.ts`

Add `Effect.withSpan` and `Effect.annotateLogs` to each route handler.

**Changes:**

1. For each of the 4 route handlers (`initializeChannel`, `sendMessage`, `getHistory`, `getStatus`), wrap the handler Effect with:
   ```typescript
   Effect.withSpan("ChannelRoutes.<methodName>"),
   Effect.annotateLogs({ module: "ChannelRoutes", channelId })
   ```
   where `channelId` is the extracted param already available in each handler.

2. Example for `initializeChannel` — add before the `.pipe(Effect.catchCause(...))`:
   ```typescript
   Effect.withSpan("ChannelRoutes.initializeChannel"),
   Effect.annotateLogs({ module: "ChannelRoutes", channelId }),
   ```

3. Repeat for `sendMessage`, `getHistory`, `getStatus`.

**Verify:** `bun run check && bun run test`

**Commit:** `feat: add spans and log annotations to ChannelRoutes`

---

### Task 6: Add spans and annotations to entity RPC handlers

**Files:**
- Modify: `packages/server/src/entities/SessionEntity.ts`
- Modify: `packages/server/src/entities/MemoryEntity.ts`
- Modify: `packages/server/src/entities/AgentEntity.ts`
- Modify: `packages/server/src/entities/CLIAdapterEntity.ts`
- Modify: `packages/server/src/entities/WebChatAdapterEntity.ts`
- Modify: `packages/server/src/entities/IntegrationEntity.ts`

For each entity, add `Effect.withSpan` and `Effect.annotateLogs` to each RPC handler method. The pattern is:

```typescript
someMethod: ({ payload, address }) =>
  port.doSomething(payload).pipe(
    Effect.withSpan("EntityName.methodName"),
    Effect.annotateLogs({ module: "EntityName", entityId: address.entityId })
  )
```

For stream-returning handlers (like `processTurn` in SessionEntity, `receiveMessage` in CLIAdapter/WebChatAdapter), use `Stream.withSpan`:

```typescript
processTurn: ({ payload }) =>
  runtime.processTurnStream(payload).pipe(
    Stream.withSpan("SessionEntity.processTurn")
  )
```

Add `Effect` (and `Stream` where needed) to imports if not already present.

**Verify:** `bun run check && bun run test`

**Commit:** `feat: add spans and log annotations to entity RPC handlers`

---

### Task 7: Add tapDefect logging to port implementations

**Files:**
- Modify: `packages/server/src/AgentStatePortSqlite.ts`
- Modify: `packages/server/src/SessionTurnPortSqlite.ts`
- Modify: `packages/server/src/ChannelPortSqlite.ts`
- Modify: `packages/server/src/GovernancePortSqlite.ts`
- Modify: `packages/server/src/MemoryPortSqlite.ts`

For every `.orDie` call, insert `Effect.tapDefect(Effect.logError)` before it. This logs the defect before it becomes an unrecoverable error.

The pattern changes from:
```typescript
).pipe(Effect.orDie)
```
to:
```typescript
).pipe(
  Effect.tapDefect(Effect.logError),
  Effect.orDie
)
```

Also add `Effect.annotateLogs` at the service level with the module name:
```typescript
Effect.annotateLogs({ module: "AgentStatePortSqlite" })
```

**Count of changes:**
- `AgentStatePortSqlite.ts` — 3 `.orDie` sites (lines 74, 80, 111)
- `SessionTurnPortSqlite.ts` — 5+ `.orDie` sites (lines 129, 154, 160, 167, 202, 245, 251)
- `ChannelPortSqlite.ts` — 2 `.orDie` sites (lines 60, 90)
- `GovernancePortSqlite.ts` — 2 `.orDie` sites (lines 72, 89)
- `MemoryPortSqlite.ts` — 5 `.orDie` sites (lines 129, 161, 219, 256, 280)

**Verify:** `bun run check && bun run test`

**Commit:** `feat: log defects before .orDie in port implementations`

---

### Task 8: End-to-end verification

**Files:** None (verification only)

**Steps:**

1. Run full test suite:
   ```bash
   bun run check && bun run test && bun run test:ws
   ```
   Expected: typecheck clean, 230 vitest tests pass, 5 WS tests pass.

2. Start the server and send a message:
   ```bash
   bun run start
   # In another terminal:
   curl -s -X POST http://localhost:3000/channels/channel:verify-1/initialize \
     -H 'Content-Type: application/json' -d '{"channelType":"CLI","agentId":"agent:bootstrap"}'
   printf '{"content":"What time is it?"}' | \
     curl -sN -X POST http://localhost:3000/channels/channel:verify-1/messages \
     -H 'Content-Type: application/json' -d @-
   ```

3. Verify in server output:
   - Logs are structured JSON
   - `turnId`, `sessionId`, `agentId` appear in log annotations
   - Span names like `ChannelRoutes.sendMessage`, `TurnProcessing.generateText` appear
   - No empty error messages

4. Trigger an error (e.g., send garbage JSON) and verify the error log includes `Cause.pretty` output with stack trace.

**Commit:** None (verification only)

---

## Files Summary

| File | Action |
|------|--------|
| `packages/server/src/server.ts` | Add `Logger.consoleJson` layer |
| `packages/server/src/ChannelCore.ts` | Replace `Cause.squash`+`toErrorMessage` with `Cause.pretty`, add annotations |
| `packages/server/src/turn/TurnProcessingWorkflow.ts` | Fix error messages, add spans + annotations, log memory failures |
| `packages/server/src/gateway/WebChatRoutes.ts` | Replace `Cause.squash` with `Cause.pretty`, add annotations |
| `packages/server/src/gateway/ChannelRoutes.ts` | Add `withSpan` + `annotateLogs` per route |
| `packages/server/src/entities/SessionEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/entities/MemoryEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/entities/AgentEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/entities/CLIAdapterEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/entities/WebChatAdapterEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/entities/IntegrationEntity.ts` | Add spans + annotations to RPCs |
| `packages/server/src/AgentStatePortSqlite.ts` | Add `tapDefect(logError)` before `.orDie` |
| `packages/server/src/SessionTurnPortSqlite.ts` | Add `tapDefect(logError)` before `.orDie` |
| `packages/server/src/ChannelPortSqlite.ts` | Add `tapDefect(logError)` before `.orDie` |
| `packages/server/src/GovernancePortSqlite.ts` | Add `tapDefect(logError)` before `.orDie` |
| `packages/server/src/MemoryPortSqlite.ts` | Add `tapDefect(logError)` before `.orDie` |

## Verification

```bash
bun run check           # typecheck clean
bun run test            # 230 tests pass
bun run test:ws         # 5 WS tests pass (in server package)
bun run start           # structured JSON logs, spans visible, error context preserved
```
