import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect, Layer } from "effect"
import { rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ContextWindowExceeded, SessionNotFound } from "../../domain/src/errors.js"
import type { AgentId, ConversationId, SessionId, TurnId } from "../../domain/src/ids.js"
import type { Instant, SessionState, TurnRecord } from "../../domain/src/ports.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import { SessionTurnPortSqlite } from "../src/SessionTurnPortSqlite.js"

describe("SessionTurnPortSqlite", () => {
  it.effect("starts sessions and appends turns idempotently", () => {
    const dbPath = testDatabasePath("session-turns")
    const layer = makeSessionLayer(dbPath)

    return Effect.gen(function*() {
      const sessionPort = yield* SessionTurnPortSqlite
      const session = makeSessionState({
        sessionId: "session:turns" as SessionId,
        conversationId: "conversation:turns" as ConversationId,
        tokenCapacity: 400,
        tokensUsed: 10
      })
      const turn = makeTurnRecord({
        turnId: "turn:1" as TurnId,
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        message: {
          messageId: "message:hello" as TurnRecord["message"]["messageId"],
          role: "UserRole",
          content: "hello",
          contentBlocks: [{ contentBlockType: "TextBlock", text: "hello" }]
        }
      })

      yield* sessionPort.startSession(session)
      yield* sessionPort.appendTurn(turn)
      yield* sessionPort.appendTurn(turn)

      const loadedSession = yield* sessionPort.getSession(session.sessionId)
      const turns = yield* sessionPort.listTurns(session.sessionId)

      expect(loadedSession).not.toBeNull()
      expect(loadedSession?.tokensUsed).toBe(10)
      expect(turns).toHaveLength(1)
      expect(turns[0].turnId).toBe("turn:1")
      expect(turns[0].turnIndex).toBe(0)
      expect(turns[0].message.content).toBe("hello")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("updates context windows and enforces capacity", () => {
    const dbPath = testDatabasePath("session-window")
    const layer = makeSessionLayer(dbPath)

    return Effect.gen(function*() {
      const sessionPort = yield* SessionTurnPortSqlite
      const session = makeSessionState({
        sessionId: "session:window" as SessionId,
        tokenCapacity: 100,
        tokensUsed: 80
      })

      yield* sessionPort.startSession(session)
      yield* sessionPort.updateContextWindow(session.sessionId, 15)

      const updated = yield* sessionPort.getSession(session.sessionId)
      expect(updated?.tokensUsed).toBe(95)

      const exceeded = yield* sessionPort.updateContextWindow(
        session.sessionId,
        10
      ).pipe(Effect.flip)
      expect(exceeded).toBeInstanceOf(ContextWindowExceeded)
      expect(exceeded._tag).toBe("ContextWindowExceeded")

      const afterFailure = yield* sessionPort.getSession(session.sessionId)
      expect(afterFailure?.tokensUsed).toBe(95)
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("fails on missing sessions", () => {
    const dbPath = testDatabasePath("session-missing")
    const layer = makeSessionLayer(dbPath)

    return Effect.gen(function*() {
      const sessionPort = yield* SessionTurnPortSqlite

      const missing = yield* sessionPort.updateContextWindow(
        "session:missing" as SessionId,
        10
      ).pipe(Effect.flip)

      expect(missing).toBeInstanceOf(SessionNotFound)
      expect(missing._tag).toBe("SessionNotFound")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("deleteSession removes session and all turns", () => {
    const dbPath = testDatabasePath("session-delete")
    const layer = makeSessionLayer(dbPath)

    return Effect.gen(function*() {
      const sessionPort = yield* SessionTurnPortSqlite
      const session = makeSessionState({
        sessionId: "session:delete" as SessionId,
        conversationId: "conversation:delete" as ConversationId
      })

      yield* sessionPort.startSession(session)
      yield* sessionPort.appendTurn(makeTurnRecord({
        turnId: "turn:delete:1" as TurnId,
        sessionId: session.sessionId,
        conversationId: session.conversationId
      }))
      yield* sessionPort.appendTurn(makeTurnRecord({
        turnId: "turn:delete:2" as TurnId,
        sessionId: session.sessionId,
        conversationId: session.conversationId
      }))

      yield* sessionPort.deleteSession(session.sessionId)
      yield* sessionPort.deleteSession(session.sessionId)

      const deletedSession = yield* sessionPort.getSession(session.sessionId)
      const deletedTurns = yield* sessionPort.listTurns(session.sessionId)

      expect(deletedSession).toBeNull()
      expect(deletedTurns).toEqual([])
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })

  it.effect("retains sessions and turns across cold restart", () => {
    const dbPath = testDatabasePath("session-restart")
    const firstLayer = makeSessionLayer(dbPath)
    const secondLayer = makeSessionLayer(dbPath)
    const sessionId = "session:restart" as SessionId

    return Effect.gen(function*() {
      yield* Effect.gen(function*() {
        const sessionPort = yield* SessionTurnPortSqlite
        const session = makeSessionState({
          sessionId,
          conversationId: "conversation:restart" as ConversationId,
          tokenCapacity: 300,
          tokensUsed: 10
        })

        yield* sessionPort.startSession(session)
        yield* sessionPort.updateContextWindow(sessionId, 30)
        yield* sessionPort.appendTurn(makeTurnRecord({
          turnId: "turn:restart" as TurnId,
          sessionId,
          conversationId: session.conversationId,
          message: {
            messageId: "message:persist" as TurnRecord["message"]["messageId"],
            role: "UserRole",
            content: "persist me",
            contentBlocks: [{ contentBlockType: "TextBlock", text: "persist me" }]
          }
        }))
      }).pipe(Effect.provide(firstLayer))

      const persisted = yield* Effect.gen(function*() {
        const sessionPort = yield* SessionTurnPortSqlite
        const session = yield* sessionPort.getSession(sessionId)
        const turns = yield* sessionPort.listTurns(sessionId)
        return { session, turns } as const
      }).pipe(Effect.provide(secondLayer))

      expect(persisted.session).not.toBeNull()
      expect(persisted.session?.tokensUsed).toBe(40)
      expect(persisted.turns).toHaveLength(1)
      expect(persisted.turns[0].message.content).toBe("persist me")
    }).pipe(
      Effect.ensuring(cleanupDatabase(dbPath))
    )
  })
})

const makeSessionLayer = (dbPath: string) => {
  const sqliteLayer = SqliteRuntime.layer({ filename: dbPath })
  const migrationLayer = DomainMigrator.layer.pipe(
    Layer.provide(sqliteLayer),
    Layer.orDie
  )
  const sqlInfrastructureLayer = Layer.mergeAll(sqliteLayer, migrationLayer)

  return Layer.mergeAll(
    sqlInfrastructureLayer,
    SessionTurnPortSqlite.layer.pipe(Layer.provide(sqlInfrastructureLayer))
  )
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeSessionState = (overrides: Partial<SessionState>): SessionState => ({
  sessionId: "session:default" as SessionId,
  conversationId: "conversation:default" as ConversationId,
  tokenCapacity: 512,
  tokensUsed: 0,
  ...overrides
})

const makeTurnRecord = (overrides: Partial<TurnRecord>): TurnRecord => ({
  turnId: "turn:default" as TurnId,
  sessionId: "session:default" as SessionId,
  conversationId: "conversation:default" as ConversationId,
  turnIndex: 0,
  participantRole: "UserRole",
  participantAgentId: "agent:default" as AgentId,
  message: {
    messageId: "message:default" as TurnRecord["message"]["messageId"],
    role: "UserRole",
    content: "test",
    contentBlocks: [{ contentBlockType: "TextBlock", text: "test" }]
  },
  modelFinishReason: null,
  modelUsageJson: null,
  createdAt: instant("2026-02-24T12:00:00.000Z"),
  ...overrides
})

const testDatabasePath = (name: string): string =>
  join(tmpdir(), `personal-agent-${name}-${crypto.randomUUID()}.sqlite`)

const cleanupDatabase = (path: string) =>
  Effect.sync(() => {
    rmSync(path, { force: true })
  })
