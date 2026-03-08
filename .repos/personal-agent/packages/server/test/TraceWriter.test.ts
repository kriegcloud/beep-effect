import { describe, expect, it } from "@effect/vitest"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import type { AgentId, ArtifactId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type {
  ArtifactStorePort,
  Instant,
  SessionArtifactPort,
  SessionMetricsPort
} from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import * as Response from "effect/unstable/ai/Response"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { TraceWriter, _renderTrace } from "../src/memory/TraceWriter.js"
import type { LoadedSubroutine } from "../src/memory/SubroutineCatalog.js"
import type { SubroutineContext, SubroutineResult } from "../src/memory/SubroutineRunner.js"
import type { RunTraceParams } from "../src/memory/TraceWriter.js"
import {
  ArtifactStorePortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../src/PortTags.js"
import { rmSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENT_ID = "default" as AgentId
const SESSION_ID = "session:trace-test" as SessionId
const CONVERSATION_ID = "conversation:trace-test" as ConversationId
const RUN_ID = "run-abc-123"

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))
const NOW = instant("2026-03-01T12:00:00.000Z")

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeSubroutine = (): LoadedSubroutine => ({
  config: {
    id: "memory_consolidation",
    name: "Memory Consolidation",
    tier: "SemanticMemory",
    trigger: { type: "PostTurn" },
    promptRef: "prompts/consolidation.md",
    maxIterations: 5,
    toolConcurrency: 1,
    dedupeWindowSeconds: 30
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

const makeContext = (overrides?: Partial<SubroutineContext>): SubroutineContext => ({
  agentId: AGENT_ID,
  sessionId: SESSION_ID,
  conversationId: CONVERSATION_ID,
  turnId: "turn:test" as TurnId,
  triggerType: "PostTurn",
  triggerReason: "End of user turn",
  now: NOW,
  runId: RUN_ID,
  ...overrides
})

const makeSuccessResult = (): SubroutineResult => ({
  subroutineId: "memory_consolidation",
  runId: RUN_ID,
  success: true,
  iterationsUsed: 2,
  toolCallsTotal: 1,
  assistantContent: "Memory stored.",
  modelUsageJson: null,
  checkpointWritten: "skipped",
  error: null
})

const makeFailedResult = (): SubroutineResult => ({
  subroutineId: "memory_consolidation",
  runId: RUN_ID,
  success: false,
  iterationsUsed: 0,
  toolCallsTotal: 0,
  assistantContent: "",
  modelUsageJson: null,
  checkpointWritten: "skipped",
  error: { tag: "model_error", message: "connection timeout" }
})

const makeContentParts = (): ReadonlyArray<Response.Part<any>> => [
  Response.makePart("text", { text: "Let me review the recent conversation..." }),
  Response.makePart("tool-call", {
    id: "call_1",
    name: "retrieve_memories",
    params: { query: "recent topics" },
    providerExecuted: false
  }),
  Response.makePart("tool-result", {
    id: "call_1",
    name: "retrieve_memories",
    isFailure: false,
    result: "Found 3 memories...",
    encodedResult: "Found 3 memories...",
    providerExecuted: false,
    preliminary: false
  })
]

// ---------------------------------------------------------------------------
// Test Layer
// ---------------------------------------------------------------------------

const testDir = () => join(tmpdir(), `trace-writer-test-${crypto.randomUUID()}`)

const makeTestLayer = (traceDir: string, enabled = true) => {
  const agentConfigLayer = AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" } },
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
        generation: { temperature: 0.7, maxOutputTokens: 4096 },
        memoryRoutines: {
          subroutines: [],
          traces: { enabled, directory: traceDir, retentionDays: 7 }
        }
      }
    },
    server: { port: 3000 }
  }))
  const artifactStoreLayer = Layer.succeed(ArtifactStorePortTag, {
    putJson: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "application/json",
        bytes: 0,
        previewText: null
      }),
    putBytes: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "text/plain",
        bytes: 0,
        previewText: null
      }),
    getBytes: () => Effect.succeed(new Uint8Array())
  } as ArtifactStorePort)
  const sessionArtifactLayer = Layer.succeed(SessionArtifactPortTag, {
    link: () => Effect.void,
    listBySession: () => Effect.succeed([])
  } as SessionArtifactPort)
  const sessionMetricsLayer = Layer.succeed(SessionMetricsPortTag, {
    increment: () => Effect.void,
    get: () => Effect.succeed(null),
    shouldTriggerCompaction: () => Effect.succeed(false)
  } as SessionMetricsPort)

  return TraceWriter.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      agentConfigLayer,
      artifactStoreLayer,
      sessionArtifactLayer,
      sessionMetricsLayer
    ))
  )
}

const makeTestLayerNoConfig = () => {
  const agentConfigLayer = AgentConfig.layerFromParsed(withTestPromptsConfig({
    providers: { anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" } },
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
        generation: { temperature: 0.7, maxOutputTokens: 4096 }
      }
    },
    server: { port: 3000 }
  }))
  const artifactStoreLayer = Layer.succeed(ArtifactStorePortTag, {
    putJson: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "application/json",
        bytes: 0,
        previewText: null
      }),
    putBytes: () =>
      Effect.succeed({
        artifactId: "artifact:test" as ArtifactId,
        sha256: "test",
        mediaType: "text/plain",
        bytes: 0,
        previewText: null
      }),
    getBytes: () => Effect.succeed(new Uint8Array())
  } as ArtifactStorePort)
  const sessionArtifactLayer = Layer.succeed(SessionArtifactPortTag, {
    link: () => Effect.void,
    listBySession: () => Effect.succeed([])
  } as SessionArtifactPort)
  const sessionMetricsLayer = Layer.succeed(SessionMetricsPortTag, {
    increment: () => Effect.void,
    get: () => Effect.succeed(null),
    shouldTriggerCompaction: () => Effect.succeed(false)
  } as SessionMetricsPort)

  return TraceWriter.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      agentConfigLayer,
      artifactStoreLayer,
      sessionArtifactLayer,
      sessionMetricsLayer
    ))
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TraceWriter", () => {
  it.effect("writes trace file for successful run", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const writer = yield* TraceWriter
      yield* writer.writeRunTrace({
        subroutine: makeSubroutine(),
        context: makeContext(),
        contentParts: makeContentParts(),
        result: makeSuccessResult(),
        usage: null
      })

      const expectedPath = join(dir, "memory_consolidation", "2026-03-01", `${RUN_ID}.trace.txt`)
      expect(existsSync(expectedPath)).toBe(true)

      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("=== Subroutine Run Trace ===")
      expect(content).toContain("memory_consolidation (Memory Consolidation)")
      expect(content).toContain("Status: Success")
      expect(content).toContain("Iterations: 2")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("writes trace file for failed run", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const writer = yield* TraceWriter
      yield* writer.writeRunTrace({
        subroutine: makeSubroutine(),
        context: makeContext(),
        contentParts: [],
        result: makeFailedResult(),
        usage: null
      })

      const expectedPath = join(dir, "memory_consolidation", "2026-03-01", `${RUN_ID}.trace.txt`)
      expect(existsSync(expectedPath)).toBe(true)

      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("Status: Failed")
      expect(content).toContain("Error: model_error: connection timeout")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("no-op when traces config absent", () => {
    const layer = makeTestLayerNoConfig()

    return Effect.gen(function*() {
      const writer = yield* TraceWriter
      // Should not throw or write any files
      yield* writer.writeRunTrace({
        subroutine: makeSubroutine(),
        context: makeContext(),
        contentParts: makeContentParts(),
        result: makeSuccessResult(),
        usage: null
      })
    }).pipe(Effect.provide(layer))
  })

  it.effect("no-op when traces.enabled = false", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir, false)

    return Effect.gen(function*() {
      const writer = yield* TraceWriter
      yield* writer.writeRunTrace({
        subroutine: makeSubroutine(),
        context: makeContext(),
        contentParts: makeContentParts(),
        result: makeSuccessResult(),
        usage: null
      })

      // Directory should not even be created
      expect(existsSync(dir)).toBe(false)
    }).pipe(Effect.provide(layer))
  })

  it("trace includes tool call and tool result parts", () => {
    const params: RunTraceParams = {
      subroutine: makeSubroutine(),
      context: makeContext(),
      contentParts: makeContentParts(),
      result: makeSuccessResult(),
      usage: null
    }

    const content = _renderTrace(params)
    expect(content).toContain("[tool_call] retrieve_memories")
    expect(content).toContain('{"query":"recent topics"}')
    expect(content).toContain("[tool_result] retrieve_memories")
    expect(content).toContain("Found 3 memories...")
    expect(content).toContain("[text] Let me review the recent conversation...")
  })

  it("file path includes subroutineId, date, runId", () => {
    const params: RunTraceParams = {
      subroutine: makeSubroutine(),
      context: makeContext(),
      contentParts: [],
      result: makeSuccessResult(),
      usage: null
    }

    const content = _renderTrace(params)
    expect(content).toContain("Subroutine: memory_consolidation")
    expect(content).toContain("Run ID: run-abc-123")
    expect(content).toContain("Started: 2026-03-01")
  })
})
