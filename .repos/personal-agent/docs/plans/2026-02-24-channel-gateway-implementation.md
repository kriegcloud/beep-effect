# Channel + Gateway Vertical Slice Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full message lifecycle: CLI `agent chat` → Channel entity (facade) → Session entity → TurnProcessingWorkflow → LLM → streamed SSE response back to CLI, with multi-turn conversation history.

**Architecture:** Channel-as-Facade. ChannelEntity is the user-facing API. CLI sends text to a channelId, gets an SSE stream back. Channel manages session lifecycle internally. EntityProxy derives HTTP endpoints for non-streaming entities (Agent, Governance, Memory). Channel gets hand-crafted SSE routes. Session is internal-only (no HTTP surface).

**Tech Stack:** Effect 4.0.0-beta.11, Effect Cluster entities, EntityProxy, SQLite (via `@effect/sql-sqlite-bun`), Bun runtime (server + CLI).

**Design doc:** `docs/plans/2026-02-24-channel-gateway-vertical-slice-design.md`

**Key constraint:** EntityProxy's HTTP layer does NOT support streaming RPC responses — it serializes Stream as a regular value. All streaming endpoints must use manual `HttpRouter` + `HttpServerResponse.stream()` with SSE encoding.

---

## Task 1: Extract Event Schemas from RuntimeApi

Move `TurnStreamEvent` types to their own module so they survive RuntimeApi deletion.

**Files:**
- Create: `packages/domain/src/events.ts`
- Modify: `packages/domain/src/index.ts:4` (replace RuntimeApi re-export with events)
- Modify: `packages/server/src/entities/SessionEntity.ts:3` (update import)
- Modify: `packages/server/src/turn/TurnProcessingRuntime.ts` (update import)
- Modify: `packages/server/src/TurnStreamingRouter.ts:1` (update import)

**Step 1: Create `packages/domain/src/events.ts`**

Copy all Schema.Class event definitions and SubmitTurnRequest from `RuntimeApi.ts`:

```typescript
import { Schema } from "effect"
import { ContentBlock } from "./ports.js"

export class SubmitTurnRequest extends Schema.Class<SubmitTurnRequest>("SubmitTurnRequest")({
  turnId: Schema.String,
  conversationId: Schema.String,
  agentId: Schema.String,
  content: Schema.String,
  contentBlocks: Schema.Array(ContentBlock),
  createdAt: Schema.DateTimeUtc,
  inputTokens: Schema.Number
}) {}

export class TurnStartedEvent extends Schema.Class<TurnStartedEvent>("TurnStartedEvent")({
  type: Schema.Literal("turn.started"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  createdAt: Schema.DateTimeUtc
}) {}

export class AssistantDeltaEvent extends Schema.Class<AssistantDeltaEvent>("AssistantDeltaEvent")({
  type: Schema.Literal("assistant.delta"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  delta: Schema.String
}) {}

export class ToolCallEvent extends Schema.Class<ToolCallEvent>("ToolCallEvent")({
  type: Schema.Literal("tool.call"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  toolCallId: Schema.String,
  toolName: Schema.String,
  inputJson: Schema.String
}) {}

export class ToolResultEvent extends Schema.Class<ToolResultEvent>("ToolResultEvent")({
  type: Schema.Literal("tool.result"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  toolCallId: Schema.String,
  toolName: Schema.String,
  outputJson: Schema.String,
  isError: Schema.Boolean
}) {}

export class TurnCompletedEvent extends Schema.Class<TurnCompletedEvent>("TurnCompletedEvent")({
  type: Schema.Literal("turn.completed"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  accepted: Schema.Boolean,
  auditReasonCode: Schema.String,
  modelFinishReason: Schema.Union([Schema.String, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null])
}) {}

export class TurnFailedEvent extends Schema.Class<TurnFailedEvent>("TurnFailedEvent")({
  type: Schema.Literal("turn.failed"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  errorCode: Schema.String,
  message: Schema.String
}) {}

export const TurnStreamEvent = Schema.Union([
  TurnStartedEvent,
  AssistantDeltaEvent,
  ToolCallEvent,
  ToolResultEvent,
  TurnCompletedEvent,
  TurnFailedEvent
])
export type TurnStreamEvent = typeof TurnStreamEvent.Type
```

**Step 2: Update `packages/domain/src/index.ts`**

Replace line 4 (`export * from "./RuntimeApi.js"`) with:

```typescript
export * from "./events.js"
```

**Step 3: Update server imports**

Replace all `from "@template/domain/RuntimeApi"` with `from "@template/domain/events"`:

- `packages/server/src/entities/SessionEntity.ts:3`
- `packages/server/src/turn/TurnProcessingRuntime.ts` (search for RuntimeApi import)
- `packages/server/src/TurnStreamingRouter.ts:1`

**Step 4: Verify**

Run: `bun run check`
Expected: Zero TypeScript errors.

**Step 5: Commit**

```bash
git add packages/domain/src/events.ts packages/domain/src/index.ts packages/domain/src/RuntimeApi.ts packages/server/src/entities/SessionEntity.ts packages/server/src/turn/TurnProcessingRuntime.ts packages/server/src/TurnStreamingRouter.ts
git commit -m "refactor: extract event schemas from RuntimeApi to domain/events"
```

---

## Task 2: Add Domain Types for Channels

**Files:**
- Modify: `packages/domain/src/ids.ts` (add ChannelId)
- Modify: `packages/domain/src/status.ts` (add ChannelType)
- Modify: `packages/domain/src/ports.ts` (add ChannelRecord, ChannelPort, extend SessionTurnPort)
- Modify: `packages/domain/src/errors.ts` (add ChannelNotFound)

**Step 1: Add `ChannelId` to `packages/domain/src/ids.ts`**

After the `ToolName` definition (line 37), add:

```typescript
export const ChannelId = Schema.String.pipe(Schema.brand("ChannelId"))
export type ChannelId = typeof ChannelId.Type
```

**Step 2: Add `ChannelType` to `packages/domain/src/status.ts`**

After `QuotaPeriod` (line 61), add:

```typescript
export const ChannelType = Schema.Literals([
  "CLI",
  "HTTP"
])
export type ChannelType = typeof ChannelType.Type
```

**Step 3: Add `ChannelRecord` and `ChannelPort` to `packages/domain/src/ports.ts`**

Add `ChannelId` to the id imports (line 14 area). Add `ChannelType` to the status imports (line 30 area).

After the `SchedulePort` interface (line 265), add:

```typescript
export interface ChannelRecord {
  readonly channelId: ChannelId
  readonly channelType: ChannelType
  readonly agentId: AgentId
  readonly activeSessionId: SessionId
  readonly activeConversationId: ConversationId
  readonly createdAt: Instant
}

export interface ChannelPort {
  readonly create: (channel: ChannelRecord) => Effect.Effect<void>
  readonly get: (channelId: ChannelId) => Effect.Effect<ChannelRecord | null>
}
```

**Step 4: Extend `SessionTurnPort` with `listTurns`**

In `packages/domain/src/ports.ts`, add to the `SessionTurnPort` interface (after `updateContextWindow`, line 235):

```typescript
  readonly listTurns: (
    sessionId: SessionId
  ) => Effect.Effect<ReadonlyArray<TurnRecord>>
```

**Step 5: Add `ChannelNotFound` to `packages/domain/src/errors.ts`**

After `ClusterEntityError` (line 40), add:

```typescript
export class ChannelNotFound extends Schema.ErrorClass<ChannelNotFound>("ChannelNotFound")({
  _tag: Schema.tag("ChannelNotFound"),
  channelId: Schema.String
}) {}
```

**Step 6: Verify**

Run: `bun run check`
Expected: Errors in `SessionTurnPortMemory.ts` (missing `listTurns`). That's expected — fixed in Task 3.

**Step 7: Commit**

```bash
git add packages/domain/src/ids.ts packages/domain/src/status.ts packages/domain/src/ports.ts packages/domain/src/errors.ts
git commit -m "feat(domain): add Channel types, ChannelPort, listTurns to SessionTurnPort"
```

---

## Task 3: Channel Persistence Layer

**Files:**
- Modify: `packages/server/src/PortTags.ts` (add ChannelPortTag)
- Create: `packages/server/src/ChannelPortSqlite.ts`
- Modify: `packages/server/src/persistence/DomainMigrator.ts` (add migration 0003)
- Modify: `packages/server/src/SessionTurnPortMemory.ts` (add listTurns)
- Create: `packages/server/test/ChannelPortSqlite.test.ts`

**Step 1: Add `ChannelPortTag` to `packages/server/src/PortTags.ts`**

Add `ChannelPort` to the type import from `@template/domain/ports`. Add after `MemoryPortTag`:

```typescript
export const ChannelPortTag = ServiceMap.Service<ChannelPort>("server/ports/ChannelPort")
```

**Step 2: Add `listTurns` to `SessionTurnPortMemory`**

In `packages/server/src/SessionTurnPortMemory.ts`, add before the return object (~line 61):

```typescript
      const listTurns = (sessionId: SessionId) =>
        Ref.get(turns).pipe(
          Effect.map((map) => {
            const current = HashMap.get(map, sessionId)
            return Option.isSome(current) ? current.value : ([] as Array<TurnRecord>)
          })
        )
```

Add `listTurns` to the returned `as const` object.

**Step 3: Add migration `0003_channel_tables` to `packages/server/src/persistence/DomainMigrator.ts`**

After the `"0002_core_phase1_tables"` entry (line 122), add:

```typescript
  "0003_channel_tables": Effect.gen(function*() {
    const sql = yield* SqlClient.SqlClient

    yield* sql`
      CREATE TABLE IF NOT EXISTS channels (
        channel_id TEXT PRIMARY KEY,
        channel_type TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        active_session_id TEXT NOT NULL,
        active_conversation_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `.unprepared
  })
```

**Step 4: Create `packages/server/src/ChannelPortSqlite.ts`**

Follow `AgentStatePortSqlite` / `SessionTurnPortSqlite` patterns exactly:

```typescript
import { Effect, Layer, Option, Schema, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import * as SqlSchema from "effect/unstable/sql/SqlSchema"
import type { ChannelId } from "../../domain/src/ids.js"
import type { ChannelPort, ChannelRecord, Instant } from "../../domain/src/ports.js"
import type { ChannelType } from "../../domain/src/status.js"

const ChannelRowSchema = Schema.Struct({
  channel_id: Schema.String,
  channel_type: Schema.String,
  agent_id: Schema.String,
  active_session_id: Schema.String,
  active_conversation_id: Schema.String,
  created_at: Schema.String
})
type ChannelRow = typeof ChannelRowSchema.Type

const ChannelIdRequest = Schema.Struct({ channelId: Schema.String })
const InstantFromSqlString = Schema.DateTimeUtcFromString
const decodeSqlInstant = Schema.decodeUnknownSync(InstantFromSqlString)
const encodeSqlInstant = Schema.encodeSync(InstantFromSqlString)

export class ChannelPortSqlite extends ServiceMap.Service<ChannelPortSqlite>()(
  "server/ChannelPortSqlite",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient

      const findChannelById = SqlSchema.findOneOption({
        Request: ChannelIdRequest,
        Result: ChannelRowSchema,
        execute: ({ channelId }) =>
          sql`
            SELECT channel_id, channel_type, agent_id,
                   active_session_id, active_conversation_id, created_at
            FROM channels
            WHERE channel_id = ${channelId}
            LIMIT 1
          `.withoutTransform
      })

      const create: ChannelPort["create"] = (channel) =>
        sql`
          INSERT INTO channels (
            channel_id, channel_type, agent_id,
            active_session_id, active_conversation_id, created_at
          ) VALUES (
            ${channel.channelId},
            ${channel.channelType},
            ${channel.agentId},
            ${channel.activeSessionId},
            ${channel.activeConversationId},
            ${encodeSqlInstant(channel.createdAt)}
          )
          ON CONFLICT(channel_id) DO UPDATE SET
            channel_type = excluded.channel_type,
            agent_id = excluded.agent_id,
            active_session_id = excluded.active_session_id,
            active_conversation_id = excluded.active_conversation_id
        `.unprepared.pipe(
          Effect.asVoid,
          Effect.orDie
        )

      const get: ChannelPort["get"] = (channelId) =>
        findChannelById({ channelId }).pipe(
          Effect.map(
            Option.match({
              onNone: () => null,
              onSome: decodeChannelRow
            })
          ),
          Effect.orDie
        )

      return { create, get } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const decodeChannelRow = (row: ChannelRow): ChannelRecord => ({
  channelId: row.channel_id as ChannelId,
  channelType: row.channel_type as ChannelType,
  agentId: row.agent_id as ChannelRecord["agentId"],
  activeSessionId: row.active_session_id as ChannelRecord["activeSessionId"],
  activeConversationId: row.active_conversation_id as ChannelRecord["activeConversationId"],
  createdAt: decodeSqlInstant(row.created_at)
})
```

**Step 5: Write test `packages/server/test/ChannelPortSqlite.test.ts`**

Follow the `AgentEntity.test.ts` layer setup pattern exactly — `SqliteRuntime.layer({ filename: dbPath })`:

```typescript
import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ChannelId, ConversationId, SessionId } from "@template/domain/ids"
import type { ChannelRecord, Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const portLayer = ChannelPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )

  return Layer.mergeAll(sqlInfrastructureLayer, portLayer)
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeChannel = (id: string): ChannelRecord => ({
  channelId: `channel:${id}` as ChannelId,
  channelType: "CLI",
  agentId: "agent:bootstrap" as AgentId,
  activeSessionId: `session:${id}` as SessionId,
  activeConversationId: `conv:${id}` as ConversationId,
  createdAt: instant("2026-02-24T12:00:00.000Z")
})

describe("ChannelPortSqlite", () => {
  it.effect("get returns null for unknown channel", () => {
    const dbPath = testDatabasePath("channel-port-null")
    return Effect.gen(function*() {
      const port = yield* ChannelPortSqlite
      const result = yield* port.get("channel:unknown" as ChannelId)
      expect(result).toBeNull()
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("create + get roundtrip", () => {
    const dbPath = testDatabasePath("channel-port-roundtrip")
    return Effect.gen(function*() {
      const port = yield* ChannelPortSqlite
      const channel = makeChannel("test1")
      yield* port.create(channel)
      const result = yield* port.get(channel.channelId)
      expect(result).not.toBeNull()
      expect(result!.channelId).toBe(channel.channelId)
      expect(result!.channelType).toBe("CLI")
      expect(result!.activeSessionId).toBe(channel.activeSessionId)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("create is idempotent (upsert)", () => {
    const dbPath = testDatabasePath("channel-port-upsert")
    return Effect.gen(function*() {
      const port = yield* ChannelPortSqlite
      const channel = makeChannel("test2")
      yield* port.create(channel)
      yield* port.create({ ...channel, channelType: "HTTP" })
      const result = yield* port.get(channel.channelId)
      expect(result!.channelType).toBe("HTTP")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => { rmSync(path, { force: true }) })
```

**Step 6: Run tests**

Run: `bun run test -- packages/server/test/ChannelPortSqlite.test.ts`
Expected: 3 tests pass.

**Step 7: Verify full check**

Run: `bun run check`
Expected: Zero errors.

**Step 8: Commit**

```bash
git add packages/server/src/PortTags.ts packages/server/src/ChannelPortSqlite.ts packages/server/src/persistence/DomainMigrator.ts packages/server/src/SessionTurnPortMemory.ts packages/server/test/ChannelPortSqlite.test.ts
git commit -m "feat(server): add ChannelPortSqlite with migration and tests"
```

---

## Task 4: Create ChannelEntity

**Files:**
- Create: `packages/server/src/entities/ChannelEntity.ts`
- Create: `packages/server/test/ChannelEntity.test.ts`

**Step 1: Create `packages/server/src/entities/ChannelEntity.ts`**

Key patterns:
- `createChannel` is **create-if-missing** — checks if channel exists before creating
- `sendMessage` returns `Stream.unwrap(Effect.gen(...))` — the Effect resolves channel state, the unwrapped stream is the SessionEntity response
- `getHistory` delegates to `SessionTurnPortTag.listTurns`

```typescript
import type { AgentId, ChannelId, ConversationId, SessionId } from "@template/domain/ids"
import { ChannelNotFound } from "@template/domain/errors"
import { TurnStreamEvent } from "@template/domain/events"
import { ContentBlock } from "@template/domain/ports"
import { DateTime, Effect, Schema, Stream } from "effect"
import { ClusterSchema, Entity } from "effect/unstable/cluster"
import { Rpc } from "effect/unstable/rpc"
import { ChannelPortTag, SessionTurnPortTag } from "../PortTags.js"
import { SessionEntity } from "./SessionEntity.js"
import { TurnProcessingError } from "../turn/TurnProcessingWorkflow.js"

const CreateChannelRpc = Rpc.make("createChannel", {
  payload: {
    channelType: Schema.Literals(["CLI", "HTTP"]),
    agentId: Schema.String
  },
  success: Schema.Void,
  primaryKey: ({ agentId }) => `create:${agentId}`
}).annotate(ClusterSchema.Persisted, true)

const SendMessageRpc = Rpc.make("sendMessage", {
  payload: {
    content: Schema.String
  },
  success: TurnStreamEvent,
  error: Schema.Union([ChannelNotFound, TurnProcessingError]),
  stream: true
})

const TurnRecordSchema = Schema.Struct({
  turnId: Schema.String,
  sessionId: Schema.String,
  conversationId: Schema.String,
  turnIndex: Schema.Number,
  participantRole: Schema.String,
  participantAgentId: Schema.Union([Schema.String, Schema.Null]),
  message: Schema.Struct({
    messageId: Schema.String,
    role: Schema.String,
    content: Schema.String,
    contentBlocks: Schema.Array(ContentBlock)
  }),
  modelFinishReason: Schema.Union([Schema.String, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null]),
  createdAt: Schema.DateTimeUtc
})

const GetHistoryRpc = Rpc.make("getHistory", {
  payload: {},
  success: Schema.Array(TurnRecordSchema),
  error: ChannelNotFound,
  primaryKey: () => "history"
})

export const ChannelEntity = Entity.make("Channel", [
  CreateChannelRpc,
  SendMessageRpc,
  GetHistoryRpc
])

export const layer = ChannelEntity.toLayer(Effect.gen(function*() {
  const channelPort = yield* ChannelPortTag
  const sessionTurnPort = yield* SessionTurnPortTag
  const makeSessionClient = yield* SessionEntity.client

  return {
    createChannel: ({ payload, entityId }) =>
      Effect.gen(function*() {
        const channelId = entityId as ChannelId

        // Create-if-missing: skip if channel already exists
        const existing = yield* channelPort.get(channelId)
        if (existing !== null) return

        const agentId = payload.agentId as AgentId
        const sessionId = `session:${crypto.randomUUID()}` as SessionId
        const conversationId = `conv:${crypto.randomUUID()}` as ConversationId
        const now = yield* DateTime.now

        yield* channelPort.create({
          channelId,
          channelType: payload.channelType,
          agentId,
          activeSessionId: sessionId,
          activeConversationId: conversationId,
          createdAt: now
        })

        const sessionClient = makeSessionClient(sessionId)
        yield* sessionClient.startSession({
          sessionId,
          conversationId,
          tokenCapacity: 200_000,
          tokensUsed: 0
        })
      }),

    sendMessage: ({ payload, entityId }) =>
      // Stream.unwrap: Effect<Stream<A>> → Stream<A>
      // The Effect resolves channel state, returns the inner stream from SessionEntity
      Stream.unwrap(
        Effect.gen(function*() {
          const channelId = entityId as ChannelId
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return Stream.fail(new ChannelNotFound({ channelId }))
          }

          const turnId = `turn:${crypto.randomUUID()}`
          const now = yield* DateTime.now
          const sessionClient = makeSessionClient(channel.activeSessionId)

          return sessionClient.processTurn({
            turnId,
            sessionId: channel.activeSessionId,
            conversationId: channel.activeConversationId,
            agentId: channel.agentId,
            content: payload.content,
            contentBlocks: [{ contentBlockType: "TextBlock" as const, text: payload.content }],
            createdAt: now,
            inputTokens: 0
          })
        })
      ),

    getHistory: ({ entityId }) =>
      Effect.gen(function*() {
        const channelId = entityId as ChannelId
        const channel = yield* channelPort.get(channelId)
        if (channel === null) {
          return yield* new ChannelNotFound({ channelId })
        }

        return yield* sessionTurnPort.listTurns(channel.activeSessionId)
      })
  }
}))
```

**Step 2: Write test `packages/server/test/ChannelEntity.test.ts`**

Uses `Entity.makeTestClient` pattern from `AgentEntity.test.ts`. Includes mock TurnProcessingRuntime from `SessionEntity.test.ts`:

```typescript
import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ChannelId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { Instant, SessionTurnPort } from "@template/domain/ports"
import type { TurnStreamEvent } from "@template/domain/events"
import { DateTime, Effect, Layer, Stream } from "effect"
import { ShardingConfig } from "effect/unstable/cluster"
import { Entity } from "effect/unstable/cluster"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ChannelEntity, layer as ChannelEntityLayer } from "../src/entities/ChannelEntity.js"
import { layer as SessionEntityLayer } from "../src/entities/SessionEntity.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { ChannelPortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import type { ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

const makeMockTurnProcessingRuntime = () =>
  Layer.succeed(TurnProcessingRuntime, {
    processTurn: (_input: ProcessTurnPayload) =>
      Effect.succeed({
        turnId: _input.turnId,
        accepted: true,
        auditReasonCode: "turn_processing_accepted" as const,
        assistantContent: "mock response",
        assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock response" }],
        modelFinishReason: "stop",
        modelUsageJson: "{}"
      }),
    processTurnStream: (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent> =>
      Stream.make(
        {
          type: "turn.started" as const,
          sequence: 1,
          turnId: input.turnId,
          sessionId: input.sessionId,
          createdAt: input.createdAt
        },
        {
          type: "assistant.delta" as const,
          sequence: 2,
          turnId: input.turnId,
          sessionId: input.sessionId,
          delta: "mock response"
        },
        {
          type: "turn.completed" as const,
          sequence: 3,
          turnId: input.turnId,
          sessionId: input.sessionId,
          accepted: true,
          auditReasonCode: "turn_processing_accepted",
          modelFinishReason: "stop",
          modelUsageJson: "{}"
        }
      )
  } as any)

const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() {
      return (yield* ChannelPortSqlite) as any
    })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(
    Layer.provide(sqlInfrastructureLayer)
  )
  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() {
      return (yield* SessionTurnPortSqlite) as SessionTurnPort
    })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    channelPortSqliteLayer,
    channelPortTagLayer,
    sessionTurnSqliteLayer,
    sessionTurnTagLayer,
    makeMockTurnProcessingRuntime(),
    ShardingConfig.layer()
  )
}

describe("ChannelEntity", () => {
  it.effect("createChannel + getHistory returns empty", () => {
    const dbPath = testDatabasePath("channel-entity-history")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(ChannelEntity, ChannelEntityLayer)
      const channelId = `channel:${crypto.randomUUID()}`
      const client = yield* makeClient(channelId)

      yield* client.createChannel({
        channelType: "CLI",
        agentId: "agent:bootstrap"
      })

      const history = yield* client.getHistory({})
      expect(history).toEqual([])
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("createChannel is idempotent (create-if-missing)", () => {
    const dbPath = testDatabasePath("channel-entity-idempotent")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(ChannelEntity, ChannelEntityLayer)
      const channelId = `channel:${crypto.randomUUID()}`
      const client = yield* makeClient(channelId)

      yield* client.createChannel({ channelType: "CLI", agentId: "agent:bootstrap" })

      // Get the session ID after first create
      const port = yield* ChannelPortSqlite
      const channel1 = yield* port.get(channelId as any)
      const sessionId1 = channel1!.activeSessionId

      // Call createChannel again — should NOT reset session
      yield* client.createChannel({ channelType: "CLI", agentId: "agent:bootstrap" })
      const channel2 = yield* port.get(channelId as any)
      expect(channel2!.activeSessionId).toBe(sessionId1)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("sendMessage returns stream of TurnStreamEvents", () => {
    const dbPath = testDatabasePath("channel-entity-send")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(ChannelEntity, ChannelEntityLayer)
      const channelId = `channel:${crypto.randomUUID()}`
      const client = yield* makeClient(channelId)

      yield* client.createChannel({ channelType: "CLI", agentId: "agent:bootstrap" })

      const events = yield* client.sendMessage({ content: "hello" }).pipe(
        Stream.runCollect
      )

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((e) => e.type === "assistant.delta")).toBe(true)
      expect(events.some((e) => e.type === "turn.completed")).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("sendMessage to non-existent channel fails with ChannelNotFound", () => {
    const dbPath = testDatabasePath("channel-entity-notfound")
    return Effect.gen(function*() {
      const makeClient = yield* Entity.makeTestClient(ChannelEntity, ChannelEntityLayer)
      const client = yield* makeClient("channel:nonexistent")

      const error = yield* client.sendMessage({ content: "hello" }).pipe(
        Stream.runCollect,
        Effect.flip
      )

      expect(error._tag).toBe("ChannelNotFound")
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => { rmSync(path, { force: true }) })
```

**Step 3: Run tests**

Run: `bun run test -- packages/server/test/ChannelEntity.test.ts`
Expected: 4 tests pass.

**Step 4: Verify**

Run: `bun run check`
Expected: Zero errors.

**Step 5: Commit**

```bash
git add packages/server/src/entities/ChannelEntity.ts packages/server/test/ChannelEntity.test.ts
git commit -m "feat(server): add ChannelEntity with create-if-missing, streaming sendMessage, getHistory"
```

---

## Task 5: Create Gateway (EntityProxy + SSE Routes)

**Files:**
- Create: `packages/server/src/gateway/ProxyGateway.ts`
- Create: `packages/server/src/gateway/ChannelRoutes.ts`

**Step 1: Create `packages/server/src/gateway/ChannelRoutes.ts`**

Manual SSE routes for Channel entity. Adapts TurnStreamingRouter pattern to use ChannelEntity:

```typescript
import type { TurnFailedEvent, TurnStreamEvent } from "@template/domain/events"
import { Effect, Schema, Stream } from "effect"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
import { ChannelEntity } from "../entities/ChannelEntity.js"

// POST /channels/:channelId/create — create-if-missing
const createChannel = HttpRouter.add(
  "POST",
  "/channels/:channelId/create",
  (request) =>
    Effect.gen(function*() {
      const makeClient = yield* ChannelEntity.client
      const channelId = extractParam(request.url, 1) // /channels/:channelId/create
      const body = yield* request.json
      const client = makeClient(channelId)

      yield* client.createChannel({
        channelType: body.channelType ?? "CLI",
        agentId: body.agentId ?? "agent:bootstrap"
      })

      return HttpServerResponse.json({ ok: true })
    })
)

// POST /channels/:channelId/messages — SSE streaming
const sendMessage = HttpRouter.add(
  "POST",
  "/channels/:channelId/messages",
  (request) =>
    Effect.gen(function*() {
      const makeClient = yield* ChannelEntity.client
      const channelId = extractParam(request.url, 1)
      const body = yield* request.json
      const client = makeClient(channelId)

      const stream = client.sendMessage({ content: body.content }).pipe(
        Stream.map(encodeSseEvent),
        Stream.catch((error) =>
          Stream.make(
            encodeSseEvent({
              type: "turn.failed",
              sequence: Number.MAX_SAFE_INTEGER,
              turnId: "",
              sessionId: "",
              errorCode: getErrorCode(error),
              message: getErrorMessage(error)
            } satisfies TurnFailedEvent)
          )
        )
      )

      return HttpServerResponse.stream(stream, {
        contentType: "text/event-stream",
        headers: {
          "cache-control": "no-cache",
          connection: "keep-alive"
        }
      })
    })
)

// POST /channels/:channelId/history — get conversation history
const getHistory = HttpRouter.add(
  "POST",
  "/channels/:channelId/history",
  (request) =>
    Effect.gen(function*() {
      const makeClient = yield* ChannelEntity.client
      const channelId = extractParam(request.url, 1)
      const client = makeClient(channelId)

      const turns = yield* client.getHistory({})
      return HttpServerResponse.json(turns)
    })
)

// GET /health — health check
const health = HttpRouter.add(
  "GET",
  "/health",
  () =>
    Effect.succeed(
      HttpServerResponse.json({
        status: "ok",
        service: "personal-agent"
      })
    )
)

export const layer = HttpRouter.mergeAll(createChannel, sendMessage, getHistory, health)

// --- Helpers (carried over from TurnStreamingRouter) ---

const encodeSseEvent = (event: TurnStreamEvent): Uint8Array =>
  new TextEncoder().encode(
    `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
  )

const extractParam = (inputUrl: string, index: number): string => {
  const url = new URL(inputUrl, "http://localhost")
  const parts = url.pathname.split("/").filter(Boolean)
  return parts[index] ?? ""
}

const getErrorCode = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "_tag" in error &&
    typeof error._tag === "string"
  ) {
    return error._tag
  }
  return "TurnProcessingError"
}

const getErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "reason" in error &&
    typeof error.reason === "string"
  ) {
    return error.reason
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}
```

**Step 2: Create `packages/server/src/gateway/ProxyGateway.ts`**

EntityProxy for non-streaming entities only:

```typescript
import { Layer } from "effect"
import { HttpApi } from "effect/unstable/httpapi"
import { EntityProxy, EntityProxyServer } from "effect/unstable/cluster"
import { AgentEntity } from "../entities/AgentEntity.js"
import { GovernanceEntity } from "../entities/GovernanceEntity.js"
import { MemoryEntity } from "../entities/MemoryEntity.js"

// Auto-derive HTTP API groups from non-streaming entity RPCs
const AgentHttpApi = EntityProxy.toHttpApiGroup("agents", AgentEntity)
const GovernanceHttpApi = EntityProxy.toHttpApiGroup("governance", GovernanceEntity)
const MemoryHttpApi = EntityProxy.toHttpApiGroup("memory", MemoryEntity)

// Combine into a single HttpApi
// NOTE: check exact API — may need .addGroup() instead of .add()
export const ProxyApi = HttpApi.make("proxy")
  .add(AgentHttpApi)
  .add(GovernanceHttpApi)
  .add(MemoryHttpApi)

// Auto-implement handlers via EntityProxyServer
export const ProxyHandlersLive = Layer.mergeAll(
  EntityProxyServer.layerHttpApi(ProxyApi, "agents", AgentEntity),
  EntityProxyServer.layerHttpApi(ProxyApi, "governance", GovernanceEntity),
  EntityProxyServer.layerHttpApi(ProxyApi, "memory", MemoryEntity)
)
```

**Important notes for implementation:**
1. Verify `EntityProxy` and `EntityProxyServer` export paths — may be `effect/unstable/cluster/EntityProxy` and `effect/unstable/cluster/EntityProxyServer` rather than barrel exports
2. Verify `HttpApi.make("proxy").add(group)` compiles — may need different chaining API
3. `HttpApiBuilder.layer(ProxyApi)` is needed to create the serving layer from ProxyApi + ProxyHandlersLive
4. Import `HttpApiBuilder` from `effect/unstable/httpapi`

**Step 3: Verify**

Run: `bun run check`
Expected: Zero errors.

**Step 4: Commit**

```bash
git add packages/server/src/gateway/ChannelRoutes.ts packages/server/src/gateway/ProxyGateway.ts
git commit -m "feat(server): add ChannelRoutes (SSE) and ProxyGateway (EntityProxy for non-streaming entities)"
```

---

## Task 6: Wire Server and Delete Old Files

**Files:**
- Modify: `packages/server/src/server.ts`
- Delete: `packages/server/src/Api.ts`
- Delete: `packages/server/src/TurnStreamingRouter.ts`
- Delete: `packages/domain/src/RuntimeApi.ts`

**Step 1: Update `packages/server/src/server.ts`**

Key changes:

1. **Remove imports:**
   - `ApiLive` from `./Api.js`
   - `TurnStreamingLayer` from `./TurnStreamingRouter.js`
   - `RuntimeApi`, `CreateSessionResponse`, `RuntimeStatus` — no longer needed

2. **Add imports:**
   - `{ layer as ChannelEntityLayer }` from `./entities/ChannelEntity.js`
   - `{ layer as ChannelRoutesLayer }` from `./gateway/ChannelRoutes.js`
   - `{ ProxyApi, ProxyHandlersLive }` from `./gateway/ProxyGateway.js`
   - `{ ChannelPortSqlite }` from `./ChannelPortSqlite.js`
   - `{ ChannelPortTag }` from `./PortTags.js` (add to existing import)
   - `{ HttpApiBuilder }` from `effect/unstable/httpapi`
   - Type import for `ChannelPort` from `@template/domain/ports`

3. **Add channel port layers** (same wiring pattern as other ports):

```typescript
const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(
  Layer.provide(sqlInfrastructureLayer)
)

const channelPortTagLayer = Layer.effect(
  ChannelPortTag,
  Effect.gen(function*() {
    return (yield* ChannelPortSqlite) as ChannelPort
  })
).pipe(Layer.provide(channelPortSqliteLayer))
```

4. **Add channel entity layer:**

```typescript
const channelEntityLayer = ChannelEntityLayer.pipe(
  Layer.provide(clusterLayer),
  Layer.provide(channelPortTagLayer),
  Layer.provide(sessionTurnPortTagLayer)
)
```

5. **Add channel layers to `PortsLive`** (in the `Layer.mergeAll` block):

```typescript
  channelPortTagLayer,
  channelEntityLayer,
```

6. **Replace `HttpApiAndStreamingLive`:**

```typescript
const ProxyApiLive = HttpApiBuilder.layer(ProxyApi).pipe(
  Layer.provide(ProxyHandlersLive)
)

const HttpApiAndRoutesLive = Layer.mergeAll(
  ProxyApiLive,
  ChannelRoutesLayer
).pipe(
  Layer.provide(PortsLive),
  Layer.provide(clusterLayer)
)
```

7. **Update `HttpLive`** to use `HttpApiAndRoutesLive`:

```typescript
const HttpLive = HttpRouter.serve(
  HttpApiAndRoutesLive
).pipe(
  Layer.provide(clusterLayer),
  Layer.provideMerge(BunHttpServer.layer({ port: 3000 }))
)
```

**Step 2: Delete old files**

```bash
rm packages/server/src/Api.ts
rm packages/server/src/TurnStreamingRouter.ts
rm packages/domain/src/RuntimeApi.ts
```

**Step 3: Fix remaining imports**

- `packages/cli/src/RuntimeClient.ts` — imports `RuntimeApi`. Will be fully rewritten in Task 7.
- Any test files — check for `RuntimeApi` imports, update to `events` or remove.

**Step 4: Verify server compiles**

Run: `bun run check` (expect CLI errors only — fixed in Task 7)

**Step 5: Run server tests**

Run: `bun run test -- packages/server/`
Expected: All server tests pass.

**Step 6: Commit**

```bash
git add -u
git add packages/server/src/server.ts packages/server/src/gateway/
git commit -m "feat(server): wire ChannelRoutes + ProxyGateway, delete Api.ts + TurnStreamingRouter + RuntimeApi"
```

---

## Task 7: Rewrite CLI for `agent chat`

**Files:**
- Rewrite: `packages/cli/src/RuntimeClient.ts` → ChatClient
- Rewrite: `packages/cli/src/Cli.ts`
- Modify: `packages/cli/src/bin.ts`

**Step 1: Rewrite `packages/cli/src/RuntimeClient.ts`**

Replace entirely with a ChatClient using raw HTTP + SSE stream parsing:

```typescript
import { Effect, Layer, ServiceMap, Stream } from "effect"
import type { TurnStreamEvent } from "@template/domain/events"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"

const BASE_URL = "http://localhost:3000"

export class ChatClient extends ServiceMap.Service<ChatClient>()("cli/ChatClient", {
  make: Effect.gen(function*() {
    const httpClient = yield* HttpClient.HttpClient

    const createChannel = (channelId: string, agentId: string) =>
      httpClient.execute(
        HttpClientRequest.post(`${BASE_URL}/channels/${channelId}/create`).pipe(
          HttpClientRequest.jsonBody({ channelType: "CLI", agentId })
        )
      ).pipe(
        Effect.asVoid,
        Effect.scoped
      )

    const sendMessage = (channelId: string, content: string) =>
      httpClient.execute(
        HttpClientRequest.post(`${BASE_URL}/channels/${channelId}/messages`).pipe(
          HttpClientRequest.jsonBody({ content })
        )
      ).pipe(
        Effect.map((response) =>
          response.stream.pipe(
            Stream.decodeText(),
            Stream.splitLines,
            Stream.filter((line) => line.startsWith("data: ")),
            Stream.map((line) => line.slice(6)),
            Stream.map((json) => JSON.parse(json) as TurnStreamEvent)
          )
        )
      )

    const health = httpClient.execute(
      HttpClientRequest.get(`${BASE_URL}/health`)
    ).pipe(
      Effect.flatMap((response) => response.json),
      Effect.flatMap((body) => Effect.logInfo(body)),
      Effect.scoped
    )

    return { createChannel, sendMessage, health } as const
  })
}) {
  static layer = Layer.effect(this, this.make)
}
```

**Important:** The SSE parsing (`Stream.decodeText → splitLines → filter "data:" → parse JSON`) matches the SSE wire format from `ChannelRoutes.ts` (`event: ${type}\ndata: ${json}\n\n`). If the actual response format differs, adjust the parser.

**Step 2: Rewrite `packages/cli/src/Cli.ts`**

```typescript
import { Command, Options } from "effect/unstable/cli"
import { Console, Effect, Stream } from "effect"
import { ChatClient } from "./RuntimeClient.js"
import * as readline from "node:readline"

const channelOption = Options.text("channel").pipe(
  Options.withDescription("Channel ID to resume"),
  Options.optional
)

const chat = Command.make("chat", { channel: channelOption }).pipe(
  Command.withDescription("Interactive chat with the agent"),
  Command.withHandler(({ channel }) =>
    ChatClient.use((client) =>
      Effect.gen(function*() {
        const channelId = channel ?? `channel:${crypto.randomUUID()}`

        yield* Effect.logInfo(`Creating channel ${channelId}...`)
        yield* client.createChannel(channelId, "agent:bootstrap")
        yield* Effect.logInfo("Channel ready. Type your message (Ctrl+C to exit).\n")

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })

        const prompt = () =>
          Effect.async<string>((resume) => {
            rl.question("> ", (answer) => {
              resume(Effect.succeed(answer))
            })
          })

        let running = true
        rl.on("close", () => { running = false })

        while (running) {
          const input = yield* prompt()
          if (!input.trim()) continue

          const streamEffect = yield* client.sendMessage(channelId, input)
          yield* streamEffect.pipe(
            Stream.tap((event) => {
              switch (event.type) {
                case "turn.started":
                  return Console.log("")
                case "assistant.delta":
                  return Effect.sync(() => process.stdout.write(event.delta))
                case "tool.call":
                  return Console.log(`\n[tool: ${event.toolName}]`)
                case "tool.result":
                  return Console.log(`[result: ${event.outputJson}]`)
                case "turn.completed":
                  return Console.log("\n")
                case "turn.failed":
                  return Console.log(`\n[error: ${event.errorCode}: ${event.message}]\n`)
              }
            }),
            Stream.runDrain
          )
        }

        rl.close()
      })
    )
  )
)

const status = Command.make("status").pipe(
  Command.withDescription("Check server health"),
  Command.withHandler(() => ChatClient.use((client) => client.health))
)

const command = Command.make("agent").pipe(
  Command.withSubcommands([chat, status])
)

export const cli = Command.run(command, {
  version: "0.0.0"
})
```

**Step 3: Update `packages/cli/src/bin.ts`**

```typescript
#!/usr/bin/env bun

import { BunHttpClient, BunRuntime, BunServices } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { cli } from "./Cli.js"
import { ChatClient } from "./RuntimeClient.js"

const MainLive = ChatClient.layer.pipe(
  Layer.provide(BunHttpClient.layer),
  Layer.merge(BunServices.layer)
)

cli.pipe(
  Effect.provide(MainLive),
  BunRuntime.runMain
)
```

**Step 4: Verify**

Run: `bun run check`
Expected: Zero TypeScript errors.

**Step 5: Commit**

```bash
git add packages/cli/src/RuntimeClient.ts packages/cli/src/Cli.ts packages/cli/src/bin.ts
git commit -m "feat(cli): add agent chat command with SSE streaming REPL"
```

---

## Task 8: Integration Tests

Test the full HTTP round-trip through ChannelRoutes SSE endpoints.

**Files:**
- Create: `packages/server/test/ChannelRoutes.e2e.test.ts`

**Step 1: Create HTTP integration test**

This test starts a real HTTP server on a random port and sends actual HTTP requests:

```typescript
import { describe, expect, it } from "@effect/vitest"
import type { SessionTurnPort } from "@template/domain/ports"
import type { TurnStreamEvent } from "@template/domain/events"
import { DateTime, Effect, Layer, Stream } from "effect"
import { ShardingConfig, SingleRunner } from "effect/unstable/cluster"
import * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import * as HttpRouter from "effect/unstable/http/HttpRouter"
import * as HttpServer from "effect/unstable/http/HttpServer"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { layer as ChannelEntityLayer } from "../src/entities/ChannelEntity.js"
import { layer as SessionEntityLayer } from "../src/entities/SessionEntity.js"
import { layer as ChannelRoutesLayer } from "../src/gateway/ChannelRoutes.js"
import { ChannelPortSqlite } from "../src/ChannelPortSqlite.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"
import { ChannelPortTag, SessionTurnPortTag } from "../src/PortTags.js"
import { TurnProcessingRuntime } from "../src/turn/TurnProcessingRuntime.js"
import type { ProcessTurnPayload } from "../src/turn/TurnProcessingWorkflow.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"

// Mock TurnProcessingRuntime (same as ChannelEntity test)
const makeMockTurnProcessingRuntime = () =>
  Layer.succeed(TurnProcessingRuntime, {
    processTurn: (_input: ProcessTurnPayload) =>
      Effect.succeed({
        turnId: _input.turnId,
        accepted: true,
        auditReasonCode: "turn_processing_accepted" as const,
        assistantContent: "mock response",
        assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "mock response" }],
        modelFinishReason: "stop",
        modelUsageJson: "{}"
      }),
    processTurnStream: (input: ProcessTurnPayload): Stream.Stream<TurnStreamEvent> =>
      Stream.make(
        {
          type: "turn.started" as const,
          sequence: 1,
          turnId: input.turnId,
          sessionId: input.sessionId,
          createdAt: input.createdAt
        },
        {
          type: "assistant.delta" as const,
          sequence: 2,
          turnId: input.turnId,
          sessionId: input.sessionId,
          delta: "hello from agent"
        },
        {
          type: "turn.completed" as const,
          sequence: 3,
          turnId: input.turnId,
          sessionId: input.sessionId,
          accepted: true,
          auditReasonCode: "turn_processing_accepted",
          modelFinishReason: "stop",
          modelUsageJson: "{}"
        }
      )
  } as any)

// Build full test layer with HTTP server + cluster + all dependencies
const makeTestLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(Layer.provide(sqliteLayer), Layer.orDie)
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  const channelPortSqliteLayer = ChannelPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  const channelPortTagLayer = Layer.effect(
    ChannelPortTag,
    Effect.gen(function*() { return (yield* ChannelPortSqlite) as any })
  ).pipe(Layer.provide(channelPortSqliteLayer))

  const sessionTurnSqliteLayer = SessionTurnPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  const sessionTurnTagLayer = Layer.effect(
    SessionTurnPortTag,
    Effect.gen(function*() { return (yield* SessionTurnPortSqlite) as SessionTurnPort })
  ).pipe(Layer.provide(sessionTurnSqliteLayer))

  const clusterLayer = SingleRunner.layer().pipe(
    Layer.provide(sqlInfrastructureLayer),
    Layer.orDie
  )

  const channelEntityLayer = ChannelEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(channelPortTagLayer),
    Layer.provide(sessionTurnTagLayer)
  )

  const sessionEntityLayer = SessionEntityLayer.pipe(
    Layer.provide(clusterLayer),
    Layer.provide(sessionTurnTagLayer),
    Layer.provide(makeMockTurnProcessingRuntime())
  )

  // Serve ChannelRoutes on a random port
  const httpLayer = HttpRouter.serve(ChannelRoutesLayer).pipe(
    Layer.provide(channelEntityLayer),
    Layer.provide(sessionEntityLayer),
    Layer.provide(clusterLayer),
    Layer.provideMerge(HttpServer.layerTest)  // Provides test HTTP server
  )

  return httpLayer
}

describe("ChannelRoutes E2E", () => {
  it.effect("POST /health returns ok", () => {
    const dbPath = testDatabasePath("e2e-health")
    return Effect.gen(function*() {
      const client = yield* HttpClient.HttpClient
      const response = yield* client.execute(
        HttpClientRequest.get("/health")
      ).pipe(Effect.scoped)
      const body = yield* response.json
      expect(body).toEqual({ status: "ok", service: "personal-agent" })
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("create channel + send message returns SSE stream", () => {
    const dbPath = testDatabasePath("e2e-send")
    return Effect.gen(function*() {
      const client = yield* HttpClient.HttpClient
      const channelId = `channel:${crypto.randomUUID()}`

      // Create channel
      yield* client.execute(
        HttpClientRequest.post(`/channels/${channelId}/create`).pipe(
          HttpClientRequest.jsonBody({ channelType: "CLI", agentId: "agent:bootstrap" })
        )
      ).pipe(Effect.scoped)

      // Send message
      const response = yield* client.execute(
        HttpClientRequest.post(`/channels/${channelId}/messages`).pipe(
          HttpClientRequest.jsonBody({ content: "hello" })
        )
      )

      // Parse SSE stream
      const events = yield* response.stream.pipe(
        Stream.decodeText(),
        Stream.splitLines,
        Stream.filter((line) => line.startsWith("data: ")),
        Stream.map((line) => JSON.parse(line.slice(6)) as TurnStreamEvent),
        Stream.runCollect
      )

      expect(events.length).toBeGreaterThan(0)
      expect(events[0]?.type).toBe("turn.started")
      expect(events.some((e) => e.type === "assistant.delta")).toBe(true)
      expect(events.some((e) => e.type === "turn.completed")).toBe(true)
    }).pipe(
      Effect.provide(makeTestLayer(dbPath)),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => { rmSync(path, { force: true }) })
```

**Note:** `HttpServer.layerTest` provides a test HTTP server that HttpClient can access without a real TCP port. Check if this exists in Effect's current API — alternative is to use `BunHttpServer.layer({ port: 0 })` for random port binding, then build the HttpClient with the actual port. Adjust during implementation.

**Step 2: Run tests**

Run: `bun run test -- packages/server/test/ChannelRoutes.e2e.test.ts`
Expected: 2 tests pass.

**Step 3: Run full test suite**

Run: `bun run test`
Expected: All tests pass.

**Step 4: Commit**

```bash
git add packages/server/test/ChannelRoutes.e2e.test.ts
git commit -m "test(server): add ChannelRoutes HTTP E2E tests with SSE streaming"
```

---

## Task 9: Final Verification and Cleanup

**Step 1: Full type check**

Run: `bun run check`
Expected: Zero errors.

**Step 2: Full test suite**

Run: `bun run test`
Expected: All tests pass.

**Step 3: Lint**

Run: `bun run lint`
Expected: No lint errors.

**Step 4: Manual smoke test**

```bash
# Terminal 1: Start server
bun run packages/server/src/server.ts

# Terminal 2: Test health
curl http://localhost:3000/health

# Terminal 3: Test CLI
bun run packages/cli/src/bin.ts agent status
bun run packages/cli/src/bin.ts agent chat
# Type a message, verify streamed response appears
```

**Step 5: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup for channel + gateway vertical slice"
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| `EntityProxy` / `EntityProxyServer` import paths | May not be barrel-exported from `effect/unstable/cluster`. Check imports at `.reference/effect/packages/effect/src/unstable/cluster/`. May need direct file imports. |
| `HttpApi.make().add()` vs `.addGroup()` | Check exact chaining API in `.reference/effect/packages/effect/src/unstable/httpapi/HttpApi.ts`. |
| `HttpServer.layerTest` may not exist | Use `BunHttpServer.layer({ port: 0 })` + extract actual port for test HTTP client. |
| Entity-to-entity RPC (Channel → Session) | `SessionEntity.client` in ChannelEntity handler requires Sharding. Both entities share Sharding context within the cluster layer. |
| `Stream.unwrap` in sendMessage handler | Must return `Stream`, not `Effect<Stream>`. The `Stream.unwrap(Effect.gen(...))` pattern converts `Effect<Stream<A>>` → `Stream<A>`. Verify against `.reference/effect/` streaming entity tests. |
| CLI SSE parser assumes `data:` line format | Matches ChannelRoutes encoder (`event: ${type}\ndata: ${json}\n\n`). `splitLines` + filter `"data: "` is correct for this format. |
| `HttpRouter.mergeAll` may not exist | May need `Layer.mergeAll` of individual HttpRouter layers instead. Check API. |
