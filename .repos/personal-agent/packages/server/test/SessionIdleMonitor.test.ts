import { describe, expect, it } from "@effect/vitest"
import type { AgentId, ChannelId, ConversationId, SessionId } from "@template/domain/ids"
import type { ChannelPort, ChannelSummaryRecord } from "@template/domain/ports"
import { DateTime, Effect, Exit, Layer, Ref, Scope } from "effect"
import { TestClock } from "effect/testing"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ChannelPortTag } from "../src/PortTags.js"
import { SubroutineCatalog, type SubroutineCatalogService } from "../src/memory/SubroutineCatalog.js"
import {
  SubroutineControlPlane,
  type DispatchRequest,
  type SubroutineControlPlaneService
} from "../src/memory/SubroutineControlPlane.js"
import { SessionIdleMonitor } from "../src/memory/SessionIdleMonitor.js"
import { RuntimeSupervisor } from "../src/runtime/RuntimeSupervisor.js"
import type { LoadedSubroutine } from "../src/memory/SubroutineCatalog.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENT_ID = "agent:default" as AgentId

// The idle check interval is 60s (DEFAULT_IDLE_CHECK_INTERVAL_SECONDS).
// Under TestClock, the first tick fires at t=0 during Layer.build (before
// any clock adjustment), so DateTime.now=0.  We need to advance past 60s
// to trigger the second tick where DateTime.now >= 60.
const TICK_INTERVAL = "60 seconds"

const makeAgentConfigLayer = () =>
  AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "TEST_KEY" } },
    agents: {
      default: {
        persona: { name: "Test"  },
        promptBindings: {
          turn: {
            systemPromptRef: "core.turn.system.default",
            replayContinuationRef: "core.turn.replay.continuation"
          },
          memory: {
            triggerEnvelopeRef: "memory.trigger.envelope",
            tierInstructionRefs: {
              WorkingMemory: "memory.tier.working",
              EpisodicMemory: "memory.tier.episodic",
              SemanticMemory: "memory.tier.semantic",
              ProceduralMemory: "memory.tier.procedural"
            }
          },
          compaction: {
            summaryBlockRef: "compaction.block.summary",
            artifactRefsBlockRef: "compaction.block.artifacts",
            toolRefsBlockRef: "compaction.block.tools",
            keptContextBlockRef: "compaction.block.kept"
          }
        },
        model: { provider: "anthropic", modelId: "test" },
        generation: { temperature: 0.7, maxOutputTokens: 1024 }
      }
    },
    server: { port: 3000 }
  }))

const makePostSessionSub = (overrides?: {
  readonly id?: string
  readonly idleTimeoutSeconds?: number
}): LoadedSubroutine => ({
  config: {
    id: overrides?.id ?? "session_summary",
    name: "Session Summary",
    tier: "EpisodicMemory",
    trigger: { type: "PostSession", idleTimeoutSeconds: overrides?.idleTimeoutSeconds ?? 300 },
    promptRef: "prompts/summary.md",
    maxIterations: 3,
    toolConcurrency: 1,
    dedupeWindowSeconds: 30
  },
  prompt: "Summarize the session.",
  resolvedToolScope: {
    fileRead: true,
    fileWrite: false,
    shell: false,
    memoryRead: true,
    memoryWrite: true,
    notification: false
  }
})

const makeChannelSummary = (overrides?: Partial<ChannelSummaryRecord>): ChannelSummaryRecord => ({
  channelId: "channel:test" as ChannelId,
  channelType: "CLI",
  agentId: AGENT_ID,
  activeSessionId: "session:test" as SessionId,
  activeConversationId: "conversation:test" as ConversationId,
  createdAt: DateTime.fromDateUnsafe(new Date(0)),
  lastTurnAt: DateTime.fromDateUnsafe(new Date(0)),
  messageCount: 5,
  ...overrides
})

// ---------------------------------------------------------------------------
// Layer Builder
// ---------------------------------------------------------------------------

const makeTestLayer = (opts: {
  readonly channels?: ReadonlyArray<ChannelSummaryRecord>
  readonly catalogSubs?: ReadonlyArray<LoadedSubroutine>
  readonly capturedEnqueues?: Array<DispatchRequest>
  readonly enqueueAccepted?: boolean
}) => {
  const channelPortLayer = Layer.succeed(
    ChannelPortTag,
    {
      create: () => Effect.void,
      get: () => Effect.succeed(null),
      delete: () => Effect.void,
      release: () => Effect.succeed(null),
      list: () => Effect.succeed(opts.channels ?? []),
      updateModelPreference: () => Effect.void
    } as ChannelPort as any
  )

  const catalogLayer = Layer.succeed(
    SubroutineCatalog,
    {
      getByTrigger: (_agentId: string, triggerType: string) =>
        Effect.succeed(
          triggerType === "PostSession" ? (opts.catalogSubs ?? []) : []
        ),
      getById: () => Effect.die(new Error("not used in idle monitor"))
    } as SubroutineCatalogService as any
  )

  const controlPlaneLayer = Layer.succeed(
    SubroutineControlPlane,
    {
      enqueue: (request: DispatchRequest) => {
        opts.capturedEnqueues?.push(request)
        return Effect.succeed({
          accepted: opts.enqueueAccepted ?? true,
          reason: opts.enqueueAccepted === false ? "deduped" : "dispatched",
          runId: opts.enqueueAccepted === false ? null : "mock-run-id"
        })
      },
      execute: (request: DispatchRequest) => {
        opts.capturedEnqueues?.push(request)
        return Effect.succeed({
          accepted: opts.enqueueAccepted ?? true,
          subroutineId: request.subroutineId,
          runId: opts.enqueueAccepted === false ? null : "mock-run-id",
          success: opts.enqueueAccepted ?? true,
          errorTag: null,
          reason: opts.enqueueAccepted === false ? "deduped" : "completed"
        })
      },
      dispatchByTrigger: () => Effect.succeed([]),
      snapshot: () =>
        Effect.succeed({
          queueDepth: 0,
          inFlightCount: 0,
          dedupeEntries: 0,
          lastWorkerError: null
        })
    } as SubroutineControlPlaneService as any
  )

  return SessionIdleMonitor.layer.pipe(
    Layer.provide(channelPortLayer),
    Layer.provide(controlPlaneLayer),
    Layer.provide(catalogLayer),
    Layer.provide(RuntimeSupervisor.layer),
    Layer.provide(makeAgentConfigLayer())
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SessionIdleMonitor", () => {
  // Note on TestClock timing:
  // Effect.repeat(tick, Schedule.spaced(60s)) runs tick immediately at t=0
  // (during Layer.build), then sleeps 60s. Under TestClock the first tick
  // always sees now=0. Adjusting by 60s triggers the second tick where
  // now=60, giving enough elapsed time for short idle timeouts.

  it.effect("idle session enqueues only eligible subroutine", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []
      // sub10: 10s timeout (eligible at second tick, now≈60, elapsed=60 >= 10)
      // subFar: 99999s (not eligible, 60 < 99999)
      const sub10 = makePostSessionSub({ id: "summary_10", idleTimeoutSeconds: 10 })
      const subFar = makePostSessionSub({ id: "summary_far", idleTimeoutSeconds: 99999 })

      // lastTurnAt at epoch 0 — TestClock also starts at epoch 0
      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [sub10, subFar],
        capturedEnqueues
      })

      yield* Layer.build(layer)

      // Advance past one tick interval so the second tick fires
      yield* TestClock.adjust(TICK_INTERVAL)

      expect(capturedEnqueues.length).toBe(1)
      expect(capturedEnqueues[0].subroutineId).toBe("summary_10")
      expect(capturedEnqueues[0].triggerType).toBe("PostSession")
    }))

  it.effect("non-idle session does not enqueue", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []
      // idleTimeout=300s — at second tick (now≈60), elapsed=60 < 300 → skip
      const sub = makePostSessionSub({ idleTimeoutSeconds: 300 })

      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [sub],
        capturedEnqueues
      })

      yield* Layer.build(layer)
      yield* TestClock.adjust(TICK_INTERVAL)

      expect(capturedEnqueues.length).toBe(0)
    }))

  it.effect("already-fired session does not re-trigger", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []
      const sub = makePostSessionSub({ idleTimeoutSeconds: 10 })

      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [sub],
        capturedEnqueues
      })

      yield* Layer.build(layer)

      // Second tick fires and enqueues (now≈60, elapsed=60 >= 10)
      yield* TestClock.adjust(TICK_INTERVAL)
      expect(capturedEnqueues.length).toBe(1)

      // Third tick — same lastTurnAt, guard prevents re-enqueue
      yield* TestClock.adjust(TICK_INTERVAL)
      expect(capturedEnqueues.length).toBe(1)
    }))

  it.effect("failed/rejected enqueue does not update lastFired", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []
      const sub = makePostSessionSub({ idleTimeoutSeconds: 10 })

      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [sub],
        capturedEnqueues,
        enqueueAccepted: false
      })

      yield* Layer.build(layer)

      // Second tick fires but enqueue is rejected
      yield* TestClock.adjust(TICK_INTERVAL)
      expect(capturedEnqueues.length).toBe(1)

      // Third tick — lastFired was NOT updated, so it should try again
      yield* TestClock.adjust(TICK_INTERVAL)
      expect(capturedEnqueues.length).toBe(2)
    }))

  it.effect("no PostSession subroutines means no enqueue", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []

      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [],
        capturedEnqueues
      })

      yield* Layer.build(layer)
      yield* TestClock.adjust(TICK_INTERVAL)

      expect(capturedEnqueues.length).toBe(0)
    }))

  it.effect("error in tick does not kill loop", () =>
    Effect.gen(function*() {
      const callCount = yield* Ref.make(0)

      // The catalog's getByTrigger is the first call in the tick loop body
      // (after DateTime.now). Make it fail on first call then succeed.
      const catalogLayer = Layer.succeed(
        SubroutineCatalog,
        {
          getByTrigger: () =>
            Ref.getAndUpdate(callCount, (n) => n + 1).pipe(
              Effect.flatMap((n) =>
                n === 0
                  ? Effect.die("boom")
                  : Effect.succeed([])
              )
            ),
          getById: () => Effect.die(new Error("not used"))
        } as any
      )

      const channelPortLayer = Layer.succeed(
        ChannelPortTag,
        {
          create: () => Effect.void,
          get: () => Effect.succeed(null),
          delete: () => Effect.void,
          list: () => Effect.succeed([]),
          updateModelPreference: () => Effect.void
        } as any
      )

      const controlPlaneLayer = Layer.succeed(
        SubroutineControlPlane,
        {
          enqueue: () => Effect.succeed({ accepted: false, reason: "deduped", runId: null }),
          execute: (request: DispatchRequest) =>
            Effect.succeed({
              accepted: false,
              subroutineId: request.subroutineId,
              runId: null,
              success: false,
              errorTag: null,
              reason: "deduped"
            }),
          dispatchByTrigger: () => Effect.succeed([]),
          snapshot: () =>
            Effect.succeed({
              queueDepth: 0,
              inFlightCount: 0,
              dedupeEntries: 0,
              lastWorkerError: null
            })
        } as any
      )

      const layer = SessionIdleMonitor.layer.pipe(
        Layer.provide(channelPortLayer),
        Layer.provide(controlPlaneLayer),
        Layer.provide(catalogLayer),
        Layer.provide(RuntimeSupervisor.layer),
        Layer.provide(makeAgentConfigLayer())
      )

      yield* Layer.build(layer)

      // Tick 1 at t=0 (getByTrigger dies, caught by catchCause)
      // Tick 2 at t=60 (getByTrigger succeeds, returns empty → no-op)
      yield* TestClock.adjust(TICK_INTERVAL)

      const count = yield* Ref.get(callCount)
      expect(count).toBeGreaterThanOrEqual(2)
    }))

  it.effect("scope close stops loop", () =>
    Effect.gen(function*() {
      const capturedEnqueues: Array<DispatchRequest> = []
      const sub = makePostSessionSub({ idleTimeoutSeconds: 10 })

      const channel = makeChannelSummary()

      const layer = makeTestLayer({
        channels: [channel],
        catalogSubs: [sub],
        capturedEnqueues
      })

      const scope = yield* Scope.make()
      yield* Layer.buildWithScope(scope)(layer)

      // Second tick fires
      yield* TestClock.adjust(TICK_INTERVAL)
      const countBeforeClose = capturedEnqueues.length

      // Close the scope
      yield* Scope.close(scope, Exit.void)

      // Advance time — no more ticks should fire
      yield* TestClock.adjust("300 seconds")

      // Count should not have increased after scope close
      expect(capturedEnqueues.length).toBe(countBeforeClose)
    }))
})
