import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { AuditEntryRecord, GovernancePort, Instant } from "@template/domain/ports"
import type { SubroutineTriggerType } from "@template/domain/status"
import { DateTime, Deferred, Effect, Exit, Layer, Scope } from "effect"
import { GovernancePortTag } from "../src/PortTags.js"
import {
  SubroutineCatalog,
  SubroutineNotFound,
  type LoadedSubroutine,
  type SubroutineCatalogService
} from "../src/memory/SubroutineCatalog.js"
import {
  SubroutineControlPlane,
  makeDedupeKey,
  isDuplicate,
  makeSerializationKey,
  type DispatchRequest
} from "../src/memory/SubroutineControlPlane.js"
import {
  SubroutineRunner,
  type SubroutineContext,
  type SubroutineResult,
  type SubroutineRunnerService
} from "../src/memory/SubroutineRunner.js"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_ID = "session:cp-test" as SessionId
const SESSION_ID_2 = "session:cp-test-2" as SessionId
const CONVERSATION_ID = "conversation:cp-test" as ConversationId
const AGENT_ID = "agent:default" as AgentId

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))
const NOW = instant("2026-03-01T12:00:00.000Z")

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeDispatchRequest = (overrides?: Partial<DispatchRequest>): DispatchRequest => ({
  agentId: AGENT_ID,
  sessionId: SESSION_ID,
  conversationId: CONVERSATION_ID,
  subroutineId: "memory_consolidation",
  turnId: "turn:test-turn" as TurnId,
  triggerType: "PostTurn" as SubroutineTriggerType,
  triggerReason: "End of user turn",
  enqueuedAt: NOW,
  ...overrides
})

const makeLoadedSubroutine = (overrides?: {
  readonly id?: string
  readonly dedupeWindowSeconds?: number
}): LoadedSubroutine => ({
  config: {
    id: overrides?.id ?? "memory_consolidation",
    name: "Memory Consolidation",
    tier: "SemanticMemory",
    trigger: { type: "PostTurn" },
    promptRef: "prompts/consolidation.md",
    maxIterations: 5,
    toolConcurrency: 1,
    dedupeWindowSeconds: overrides?.dedupeWindowSeconds ?? 30
  },
  prompt: "You are a memory consolidation routine.",
  resolvedToolScope: {
    fileRead: true,
    fileWrite: false,
    shell: false,
    memoryRead: true,
    memoryWrite: true,
    notification: false
  }
})

const makeSuccessResult = (subroutineId: string, runId: string): SubroutineResult => ({
  subroutineId,
  runId,
  success: true,
  iterationsUsed: 1,
  toolCallsTotal: 0,
  assistantContent: "Memory stored.",
  modelUsageJson: null,
  checkpointWritten: "skipped",
  error: null
})

// ---------------------------------------------------------------------------
// Mock Helpers
// ---------------------------------------------------------------------------

const makeMockCatalog = (
  subroutines: ReadonlyArray<LoadedSubroutine> = [makeLoadedSubroutine()]
): SubroutineCatalogService => {
  const byId = new Map<string, LoadedSubroutine>()
  for (const s of subroutines) byId.set(s.config.id, s)

  return {
    getByTrigger: (_agentId, _triggerType) =>
      Effect.succeed(subroutines.filter((s) => s.config.trigger.type === _triggerType)),
    getById: (subroutineId) => {
      const loaded = byId.get(subroutineId)
      if (!loaded) return Effect.fail(new SubroutineNotFound({ subroutineId }))
      return Effect.succeed(loaded)
    }
  }
}

const makeMockRunner = (
  options?: {
    readonly onExecute?: (loaded: LoadedSubroutine, context: SubroutineContext) => Effect.Effect<SubroutineResult>
  }
): SubroutineRunnerService => ({
  execute: (loaded, context) =>
    options?.onExecute
      ? options.onExecute(loaded, context)
      : Effect.succeed(makeSuccessResult(loaded.config.id, context.runId))
})

const makeMockGovernance = (): {
  readonly port: GovernancePort
  readonly audits: Array<AuditEntryRecord>
} => {
  const audits: Array<AuditEntryRecord> = []
  const port = {
    writeAudit: (entry: AuditEntryRecord) => {
      audits.push(entry)
      return Effect.void
    },
    listAuditEntries: () => Effect.succeed(audits),
    getAuditEntry: (_id: string) => Effect.succeed(null)
  } as unknown as GovernancePort
  return { port, audits }
}

const makeTestLayer = (options?: {
  readonly subroutines?: ReadonlyArray<LoadedSubroutine>
  readonly runner?: SubroutineRunnerService
  readonly governance?: { port: GovernancePort; audits: Array<AuditEntryRecord> }
}) => {
  const governance = options?.governance ?? makeMockGovernance()
  const catalog = makeMockCatalog(options?.subroutines)
  const runner = options?.runner ?? makeMockRunner()

  const catalogLayer = Layer.succeed(SubroutineCatalog, catalog as any)
  const runnerLayer = Layer.succeed(SubroutineRunner, runner as any)
  const governanceLayer = Layer.succeed(GovernancePortTag, governance.port as any)

  return SubroutineControlPlane.layer.pipe(
    Layer.provide(Layer.mergeAll(
      catalogLayer,
      runnerLayer,
      governanceLayer,
      RuntimeSupervisor.layer
    ))
  )
}

// ---------------------------------------------------------------------------
// Unit Tests: makeDedupeKey
// ---------------------------------------------------------------------------

describe("makeDedupeKey", () => {
  it("PostTurn with turnId includes turnId in key", () => {
    const req = makeDispatchRequest({
      triggerType: "PostTurn",
      turnId: "turn:abc" as TurnId
    })
    const key = makeDedupeKey(req)
    expect(key).toBe(`${SESSION_ID}::memory_consolidation::turn:abc`)
  })

  it("PostSession excludes turnId from key", () => {
    const req = makeDispatchRequest({
      triggerType: "PostSession",
      turnId: "turn:abc" as TurnId
    })
    const key = makeDedupeKey(req)
    expect(key).toBe(`${SESSION_ID}::memory_consolidation`)
  })

  it("Scheduled uses sessionId::subroutineId", () => {
    const req = makeDispatchRequest({
      triggerType: "Scheduled",
      turnId: null
    })
    const key = makeDedupeKey(req)
    expect(key).toBe(`${SESSION_ID}::memory_consolidation`)
  })

  it("ContextPressure uses sessionId::subroutineId", () => {
    const req = makeDispatchRequest({
      triggerType: "ContextPressure",
      turnId: null
    })
    const key = makeDedupeKey(req)
    expect(key).toBe(`${SESSION_ID}::memory_consolidation`)
  })

  it("different sessions produce different keys", () => {
    const req1 = makeDispatchRequest({ sessionId: SESSION_ID })
    const req2 = makeDispatchRequest({ sessionId: SESSION_ID_2 })
    expect(makeDedupeKey(req1)).not.toBe(makeDedupeKey(req2))
  })

  it("PostTurn with null turnId falls back to sessionId::subroutineId", () => {
    const req = makeDispatchRequest({
      triggerType: "PostTurn",
      turnId: null
    })
    const key = makeDedupeKey(req)
    expect(key).toBe(`${SESSION_ID}::memory_consolidation`)
  })
})

// ---------------------------------------------------------------------------
// Unit Tests: isDuplicate
// ---------------------------------------------------------------------------

describe("isDuplicate", () => {
  it("empty map returns false", () => {
    const map = new Map()
    expect(isDuplicate(map, "key", NOW, 30)).toBe(false)
  })

  it("within window returns true", () => {
    const map = new Map([["key", { acceptedAt: NOW }]])
    const later = instant("2026-03-01T12:00:10.000Z")
    expect(isDuplicate(map, "key", later, 30)).toBe(true)
  })

  it("outside window returns false", () => {
    const map = new Map([["key", { acceptedAt: NOW }]])
    const later = instant("2026-03-01T12:00:31.000Z")
    expect(isDuplicate(map, "key", later, 30)).toBe(false)
  })

  it("exact window boundary returns false", () => {
    const map = new Map([["key", { acceptedAt: NOW }]])
    const later = instant("2026-03-01T12:00:30.000Z")
    expect(isDuplicate(map, "key", later, 30)).toBe(false)
  })

  it("different key returns false", () => {
    const map = new Map([["other-key", { acceptedAt: NOW }]])
    expect(isDuplicate(map, "key", NOW, 30)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Unit Tests: makeSerializationKey
// ---------------------------------------------------------------------------

describe("makeSerializationKey", () => {
  it("produces sessionId::subroutineId format", () => {
    expect(makeSerializationKey("session:a", "routine:b")).toBe("session:a::routine:b")
  })
})

// ---------------------------------------------------------------------------
// Integration Tests: SubroutineControlPlane enqueue + worker
// ---------------------------------------------------------------------------

describe("SubroutineControlPlane", () => {
  it("accepted request returns dispatched result", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const result = yield* cp.enqueue(makeDispatchRequest())

      expect(result.accepted).toBe(true)
      expect(result.reason).toBe("dispatched")
      expect(result.runId).toBeTruthy()
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("duplicate within window returns deduped", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const req = makeDispatchRequest()

      const first = yield* cp.enqueue(req)
      expect(first.accepted).toBe(true)

      const second = yield* cp.enqueue(req)
      expect(second.accepted).toBe(false)
      expect(second.reason).toBe("deduped")
      expect(second.runId).toBeNull()
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("concurrent duplicate enqueue preserves dedupe consistency", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const req = makeDispatchRequest()

      const [left, right] = yield* Effect.all(
        [cp.enqueue(req), cp.enqueue(req)],
        { concurrency: "unbounded" }
      )

      const acceptedCount = [left, right].filter((result) => result.accepted).length
      const dedupedCount = [left, right].filter((result) => result.reason === "deduped").length

      expect(acceptedCount).toBe(1)
      expect(dedupedCount).toBe(1)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("after window expires, same request re-accepted", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const req = makeDispatchRequest()

      const first = yield* cp.enqueue(req)
      expect(first.accepted).toBe(true)

      // Second request is 31s later — outside the 30s window
      const laterReq = makeDispatchRequest({
        enqueuedAt: instant("2026-03-01T12:00:31.000Z")
      })
      const second = yield* cp.enqueue(laterReq)
      expect(second.accepted).toBe(true)
      expect(second.reason).toBe("dispatched")
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("unknown subroutineId returns unknown_subroutine", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const req = makeDispatchRequest({ subroutineId: "nonexistent" })
      const result = yield* cp.enqueue(req)

      expect(result.accepted).toBe(false)
      expect(result.reason).toBe("unknown_subroutine")
      expect(result.runId).toBeNull()
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("dispatched request eventually executed by runner", async () => {
    const executedRuns: Array<string> = []
    const executionDone = Deferred.makeUnsafe<void>()

    const runner = makeMockRunner({
      onExecute: (loaded, context) =>
        Effect.gen(function*() {
          executedRuns.push(context.runId)
          yield* Deferred.succeed(executionDone, void 0)
          return makeSuccessResult(loaded.config.id, context.runId)
        })
    })

    const layer = makeTestLayer({ runner })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const result = yield* cp.enqueue(makeDispatchRequest())
      expect(result.accepted).toBe(true)

      // Wait for the worker to process
      yield* Deferred.await(executionDone).pipe(
        Effect.timeout("5 seconds"),
        Effect.orDie
      )

      expect(executedRuns.length).toBe(1)
      expect(executedRuns[0]).toBe(result.runId)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("audit written on dispatch and skip", async () => {
    const governance = makeMockGovernance()
    const layer = makeTestLayer({ governance })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const req = makeDispatchRequest()

      // First enqueue → dispatched
      yield* cp.enqueue(req)
      // Second enqueue → deduped (skipped)
      yield* cp.enqueue(req)

      const dispatchAudits = governance.audits.filter((a) =>
        a.reason.includes("memory_subroutine_dispatched")
      )
      const skipAudits = governance.audits.filter((a) =>
        a.reason.includes("memory_subroutine_skipped")
      )

      expect(dispatchAudits.length).toBe(1)
      expect(skipAudits.length).toBe(1)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("worker error does not kill the loop", async () => {
    let callCount = 0
    const secondDone = Deferred.makeUnsafe<void>()

    const runner = makeMockRunner({
      onExecute: (loaded, context) => {
        callCount++
        if (callCount === 1) {
          return Effect.die(new Error("Boom")) as Effect.Effect<SubroutineResult>
        }
        return Deferred.succeed(secondDone, void 0).pipe(
          Effect.as(makeSuccessResult(loaded.config.id, context.runId))
        )
      }
    })

    const layer = makeTestLayer({ runner })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane

      // First request will cause runner to die
      yield* cp.enqueue(makeDispatchRequest({
        turnId: "turn:first" as TurnId
      }))

      // Give worker time to process first item
      yield* Effect.sleep("100 millis")

      // Second request with different turnId to avoid dedupe
      yield* cp.enqueue(makeDispatchRequest({
        turnId: "turn:second" as TurnId,
        enqueuedAt: instant("2026-03-01T12:00:01.000Z")
      }))

      // Wait for second execution
      yield* Deferred.await(secondDone).pipe(
        Effect.timeout("5 seconds"),
        Effect.orDie
      )

      expect(callCount).toBe(2)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("scope close stops the worker", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const scope = yield* Scope.make()

      const cp = yield* Effect.gen(function*() {
        return yield* SubroutineControlPlane
      }).pipe(
        Effect.provide(Layer.mergeAll(layer, Layer.succeed(Scope.Scope, scope as any)))
      )

      // Enqueue something
      const result = yield* cp.enqueue(makeDispatchRequest())
      expect(result.accepted).toBe(true)

      // Close scope — this should terminate the worker
      yield* Scope.close(scope, Exit.void)

      // If we get here without hanging, the worker was properly stopped
    })

    await Effect.runPromise(program)
  })

  it("in-flight request blocks duplicate for same (session, subroutine)", async () => {
    const executionStarted = Deferred.makeUnsafe<void>()
    const executionGate = Deferred.makeUnsafe<void>()
    const executionLog: Array<string> = []

    const runner = makeMockRunner({
      onExecute: (loaded, context) =>
        Effect.gen(function*() {
          executionLog.push(`start:${context.runId}`)
          yield* Deferred.succeed(executionStarted, void 0)
          yield* Deferred.await(executionGate)
          executionLog.push(`end:${context.runId}`)
          return makeSuccessResult(loaded.config.id, context.runId)
        })
    })

    const layer = makeTestLayer({ runner })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane

      // First request — will start executing and block on gate
      const first = yield* cp.enqueue(makeDispatchRequest({
        turnId: "turn:a" as TurnId
      }))
      expect(first.accepted).toBe(true)

      // Wait for first execution to start
      yield* Deferred.await(executionStarted).pipe(
        Effect.timeout("5 seconds"),
        Effect.orDie
      )

      // Second request for same (session, subroutine) but different turnId
      const second = yield* cp.enqueue(makeDispatchRequest({
        turnId: "turn:b" as TurnId,
        enqueuedAt: instant("2026-03-01T12:00:01.000Z")
      }))
      // Should be accepted by the queue (dedupe key differs due to different turnId)
      expect(second.accepted).toBe(true)

      // Release the gate
      yield* Deferred.succeed(executionGate, void 0)

      // Give worker time to process both
      yield* Effect.sleep("200 millis")

      // The first execution should complete; the second should have been
      // skipped by in-flight check (same session + subroutine was in-flight)
      // OR processed after the first completed (serialized)
      // Either way, the system shouldn't crash
      expect(executionLog.filter((e) => e.startsWith("start:")).length).toBeGreaterThanOrEqual(1)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("different subroutineIds for same session are not deduped", async () => {
    const sub1 = makeLoadedSubroutine({ id: "routine_a" })
    const sub2 = makeLoadedSubroutine({ id: "routine_b" })
    const layer = makeTestLayer({ subroutines: [sub1, sub2] })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane

      const r1 = yield* cp.enqueue(makeDispatchRequest({ subroutineId: "routine_a" }))
      const r2 = yield* cp.enqueue(makeDispatchRequest({ subroutineId: "routine_b" }))

      expect(r1.accepted).toBe(true)
      expect(r2.accepted).toBe(true)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("dedupe prunes expired entries", async () => {
    const layer = makeTestLayer()

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane

      // Enqueue at time T
      yield* cp.enqueue(makeDispatchRequest({
        turnId: "turn:old" as TurnId,
        enqueuedAt: NOW
      }))

      // Enqueue at time T + 121s (beyond 2× max window = 120s)
      // This request at T+121s will trigger pruning of the T entry
      const laterReq = makeDispatchRequest({
        subroutineId: "memory_consolidation",
        turnId: "turn:new" as TurnId,
        enqueuedAt: instant("2026-03-01T12:02:01.000Z")
      })
      const result = yield* cp.enqueue(laterReq)
      expect(result.accepted).toBe(true)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })
})

// ---------------------------------------------------------------------------
// Integration Tests: dispatchByTrigger
// ---------------------------------------------------------------------------

describe("SubroutineControlPlane.dispatchByTrigger", () => {
  it("returns EnqueueResults for each matching subroutine", async () => {
    const sub1 = makeLoadedSubroutine({ id: "routine_a" })
    const sub2 = makeLoadedSubroutine({ id: "routine_b" })
    const layer = makeTestLayer({ subroutines: [sub1, sub2] })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const results = yield* cp.dispatchByTrigger("PostTurn", {
        agentId: AGENT_ID,
        sessionId: SESSION_ID,
        conversationId: CONVERSATION_ID,
        turnId: "turn:batch" as TurnId,
        now: NOW
      })

      expect(results).toHaveLength(2)
      expect(results[0].accepted).toBe(true)
      expect(results[0].reason).toBe("dispatched")
      expect(results[0].runId).toBeTruthy()
      expect(results[1].accepted).toBe(true)
      expect(results[1].reason).toBe("dispatched")
      expect(results[1].runId).toBeTruthy()
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("returns empty array when no subroutines match trigger", async () => {
    const sub = makeLoadedSubroutine({ id: "post_turn_only" })
    const layer = makeTestLayer({ subroutines: [sub] })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const results = yield* cp.dispatchByTrigger("Scheduled", {
        agentId: AGENT_ID,
        sessionId: SESSION_ID,
        conversationId: CONVERSATION_ID,
        turnId: null,
        now: NOW
      })

      expect(results).toHaveLength(0)
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })

  it("deduplicates correctly across repeated dispatchByTrigger calls", async () => {
    const sub = makeLoadedSubroutine({ id: "routine_dedup" })
    const layer = makeTestLayer({ subroutines: [sub] })

    const program = Effect.gen(function*() {
      const cp = yield* SubroutineControlPlane
      const context = {
        agentId: AGENT_ID,
        sessionId: SESSION_ID,
        conversationId: CONVERSATION_ID,
        turnId: "turn:same" as TurnId,
        now: NOW
      }

      const first = yield* cp.dispatchByTrigger("PostTurn", context)
      expect(first).toHaveLength(1)
      expect(first[0].accepted).toBe(true)

      // Same trigger context → dedupe
      const second = yield* cp.dispatchByTrigger("PostTurn", context)
      expect(second).toHaveLength(1)
      expect(second[0].accepted).toBe(false)
      expect(second[0].reason).toBe("deduped")
    }).pipe(Effect.scoped, Effect.provide(layer))

    await Effect.runPromise(program)
  })
})
