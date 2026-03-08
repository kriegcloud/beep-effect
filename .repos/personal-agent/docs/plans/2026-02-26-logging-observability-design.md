# Logging, Spans & Error Observability — Design

## Principle

Use Effect's native observability primitives — `Effect.withSpan`, `Effect.annotateLogs`, `Effect.logError`, `Cause.pretty`, typed errors — consistently at key boundaries. No custom logging framework, no external dependencies. Dev-first patterns that scale to production.

## Problem Statement

The server has a fragmented observability story:

1. **Error context loss** — `toErrorMessage(Cause.squash(cause))` collapses rich Cause chains to empty strings, making production debugging impossible.
2. **Silent failures** — `.orDie` used without logging in port implementations; memory retrieval errors swallowed silently.
3. **Inconsistent logging** — only the scheduler uses `Effect.log`; entities, RPC handlers, and the turn workflow are silent.
4. **No trace correlation** — turnId/sessionId/channelId exist but aren't woven into log annotations.

## Design

### 1. Error Context Preservation

Replace `toErrorMessage(Cause.squash(cause))` with `Cause.pretty(cause)` at all Cause-based catch sites:

- `ChannelCore.ts` — 3 `catchCause` sites (lines 155, 160, 169)
- `TurnProcessingWorkflow.ts` — `Effect.catch` at `generateText` (line 224)
- `WebChatRoutes.ts` — `catchCause` for message processing (line 187)

Keep `toErrorMessage` only for typed error classes where `.message` is meaningful (e.g., `TokenBudgetExceeded`).

### 2. Spans at Key Boundaries (~15 sites)

Add `Effect.withSpan` (or `Stream.withSpan` for streams) at:

- **HTTP route handlers** — each route in ChannelRoutes and WebChatRoutes
- **Entity RPC handlers** — each RPC method in SessionEntity, MemoryEntity, AgentEntity, CLIAdapterEntity, WebChatAdapterEntity, IntegrationEntity
- **Turn processing workflow** — span around policy evaluation, model call, result encoding
- **Model API call** — span around `chat.generateText`

### 3. Log Annotations with Context IDs

Use `Effect.annotateLogs` to thread domain IDs through log context:

- HTTP handlers annotate with `channelId`
- Entity handlers annotate with `entityType`, `entityId`
- Turn processing annotates with `turnId`, `sessionId`, `agentId`

Any `Effect.log` / `Effect.logError` inside those scopes automatically includes the IDs.

### 4. Explicit Error Logging Before Propagation

Add `Effect.tapDefect(Effect.logError)` at key boundaries where `.orDie` is used:

- `AgentStatePortSqlite` — 4 `.orDie` sites
- `SessionTurnPortSqlite` — similar pattern
- `ChannelPortSqlite`, `GovernancePortSqlite`, `MemoryPortSqlite`

This logs the defect before it crashes, instead of silently dying.

Also add `Effect.logWarning` for swallowed errors:
- `TurnProcessingWorkflow.ts` — memory retrieval failure silently returns `[]`

### 5. Structured Logger for Server

In `server.ts`, add `Logger.consoleJson` (or `Logger.consoleStructured`) as a layer so all log output is structured JSON. Machine-parseable output that works locally and scales to production log aggregation.

## Files Changed

| File | Changes |
|------|---------|
| `server.ts` | Add `Logger.consoleJson` layer |
| `ChannelCore.ts` | Replace Cause handling with `Cause.pretty`, add `annotateLogs` |
| `TurnProcessingWorkflow.ts` | Replace Cause handling, add spans + annotations, log swallowed memory errors |
| `ChannelRoutes.ts` | Add `withSpan` + `annotateLogs` per route |
| `WebChatRoutes.ts` | Add `withSpan` + `annotateLogs`, fix Cause handling |
| Entities (6 files) | Add `withSpan` + `annotateLogs` to RPC handlers |
| Port implementations (5 files) | Add `tapDefect(Effect.logError)` before `.orDie` |

ProxyGateway.ts and SchedulerTickService.ts already follow good patterns — no changes needed.

## Verification

```bash
bun run check           # typecheck clean
bun run test            # 230 tests pass, no regressions
bun run start           # structured JSON log output, spans visible
# Send a message — verify turnId/sessionId appear in all log lines
# Trigger an error — verify Cause.pretty output in logs
```
