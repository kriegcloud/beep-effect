import { describe, expect, it } from "@effect/vitest"
import { NodeFileSystem, NodePath } from "@effect/platform-node"
import type { AgentId, ConversationId, MessageId, SessionId, TurnId } from "@template/domain/ids"
import type { Instant, SessionTurnPort, TurnRecord } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { SessionTurnPortTag } from "../src/PortTags.js"
import { TranscriptProjector } from "../src/memory/TranscriptProjector.js"
import { SessionFileStore } from "../src/storage/SessionFileStore.js"
import { StorageLayout } from "../src/storage/StorageLayout.js"
import { rmSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AGENT_ID = "default" as AgentId
const SESSION_ID = "session:transcript-test" as SessionId
const CONVERSATION_ID = "conversation:transcript-test" as ConversationId

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))
const NOW = instant("2026-03-01T12:00:00.000Z")

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeUserTurn = (overrides?: Partial<TurnRecord>): TurnRecord => ({
  turnId: "turn:user-1" as TurnId,
  sessionId: SESSION_ID,
  conversationId: CONVERSATION_ID,
  turnIndex: 0,
  participantRole: "UserRole",
  participantAgentId: AGENT_ID,
  message: {
    messageId: "message:user-1" as MessageId,
    role: "UserRole",
    content: "Hello, how are you?",
    contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "Hello, how are you?" }]
  },
  modelFinishReason: null,
  modelUsageJson: null,
  createdAt: NOW,
  ...overrides
} as TurnRecord)

const makeAssistantTurn = (overrides?: Partial<TurnRecord>): TurnRecord => ({
  turnId: "turn:assistant-1" as TurnId,
  sessionId: SESSION_ID,
  conversationId: CONVERSATION_ID,
  turnIndex: 1,
  participantRole: "AssistantRole",
  participantAgentId: AGENT_ID,
  message: {
    messageId: "message:assistant-1" as MessageId,
    role: "AssistantRole",
    content: "I'm doing well!",
    contentBlocks: [{ contentBlockType: "TextBlock" as const, text: "I'm doing well!" }]
  },
  modelFinishReason: "stop",
  modelUsageJson: null,
  createdAt: NOW,
  ...overrides
} as TurnRecord)

const makeToolUseTurn = (): TurnRecord => ({
  turnId: "turn:tool-1" as TurnId,
  sessionId: SESSION_ID,
  conversationId: CONVERSATION_ID,
  turnIndex: 2,
  participantRole: "AssistantRole",
  participantAgentId: AGENT_ID,
  message: {
    messageId: "message:tool-1" as MessageId,
    role: "AssistantRole",
    content: "",
    contentBlocks: [
      {
        contentBlockType: "ToolUseBlock" as const,
        toolCallId: "call_1",
        toolName: "retrieve_memories",
        inputJson: '{"query":"recent"}'
      },
      {
        contentBlockType: "ToolResultBlock" as const,
        toolCallId: "call_1",
        toolName: "retrieve_memories",
        outputJson: '{"results":["memory1"]}',
        isError: false
      }
    ]
  },
  modelFinishReason: "tool-calls",
  modelUsageJson: null,
  createdAt: NOW
} as TurnRecord)

// ---------------------------------------------------------------------------
// Test Layer
// ---------------------------------------------------------------------------

const testDir = () => join(tmpdir(), `transcript-projector-test-${crypto.randomUUID()}`)
const transcriptPath = (baseDir: string, sessionId: SessionId) =>
  join(baseDir, "state", "sessions", sessionId, "transcript.md")

const makeStubSessionTurnPort = (
  turns: ReadonlyArray<TurnRecord> = []
)=>
  Layer.succeed(SessionTurnPortTag, {
    startSession: () => Effect.void,
    appendTurn: () => Effect.void,
    deleteSession: () => Effect.void,
    updateContextWindow: () => Effect.void,
    getSession: () => Effect.succeed(null),
    listTurns: () => Effect.succeed([...turns])
  } as SessionTurnPort)

const makeTestLayer = (transcriptDir: string, enabled = true, turns: ReadonlyArray<TurnRecord> = []) => {
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
          transcripts: { enabled, directory: transcriptDir }
        }
      }
    },
    server: {
      port: 3000,
      storage: {
        rootDir: join(transcriptDir, "state")
      }
    }
  }))
  const storageLayoutLayer = StorageLayout.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodePath.layer,
      agentConfigLayer
    ))
  )
  const sessionFileStoreLayer = SessionFileStore.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      storageLayoutLayer
    ))
  )

  return TranscriptProjector.layer.pipe(
    Layer.provide(Layer.mergeAll(
      agentConfigLayer,
      makeStubSessionTurnPort(turns),
      sessionFileStoreLayer
    ))
  )
}

const makeTestLayerNoConfig = () => {
  const dir = testDir()
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
    server: {
      port: 3000,
      storage: {
        rootDir: join(dir, "state")
      }
    }
  }))
  const storageLayoutLayer = StorageLayout.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodePath.layer,
      agentConfigLayer
    ))
  )
  const sessionFileStoreLayer = SessionFileStore.layer.pipe(
    Layer.provide(Layer.mergeAll(
      NodeFileSystem.layer,
      NodePath.layer,
      storageLayoutLayer
    ))
  )

  return TranscriptProjector.layer.pipe(
    Layer.provide(Layer.mergeAll(
      agentConfigLayer,
      makeStubSessionTurnPort(),
      sessionFileStoreLayer
    ))
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TranscriptProjector", () => {
  it.effect("appendTurn creates file with turn content", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeAssistantTurn())

      const expectedPath = transcriptPath(dir, SESSION_ID)
      expect(existsSync(expectedPath)).toBe(true)

      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("## Turn 1 (assistant)")
      expect(content).toContain("I'm doing well!")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("appendTurn appends to existing transcript", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeUserTurn())
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeAssistantTurn())

      const expectedPath = transcriptPath(dir, SESSION_ID)
      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("## Turn 0 (user)")
      expect(content).toContain("Hello, how are you?")
      expect(content).toContain("## Turn 1 (assistant)")
      expect(content).toContain("I'm doing well!")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("projectSession writes full transcript from turns", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.projectSession(AGENT_ID, SESSION_ID, [
        makeUserTurn(),
        makeAssistantTurn()
      ])

      const expectedPath = transcriptPath(dir, SESSION_ID)
      expect(existsSync(expectedPath)).toBe(true)

      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("# Session Transcript")
      expect(content).toContain("## Turn 0 (user)")
      expect(content).toContain("## Turn 1 (assistant)")
      // Verify header and first turn are separated (not merged)
      expect(content).not.toContain("# Session Transcript##")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("no-op when transcripts config absent", () => {
    const layer = makeTestLayerNoConfig()

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeAssistantTurn())
      // Should not throw
    }).pipe(Effect.provide(layer))
  })

  it.effect("no-op when transcripts.enabled = false", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir, false)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeAssistantTurn())
      expect(existsSync(dir)).toBe(false)
    }).pipe(Effect.provide(layer))
  })

  it.effect("renders tool use blocks in turn", () => {
    const dir = testDir()
    const layer = makeTestLayer(dir)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.appendTurn(AGENT_ID, SESSION_ID, makeToolUseTurn())

      const expectedPath = transcriptPath(dir, SESSION_ID)
      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("[Tool: retrieve_memories]")
      expect(content).toContain('Input: {"query":"recent"}')
      expect(content).toContain("Result (retrieve_memories)")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })

  it.effect("projectFromStore loads turns from SessionTurnPort and writes transcript", () => {
    const dir = testDir()
    const storedTurns = [makeUserTurn(), makeAssistantTurn()]
    const layer = makeTestLayer(dir, true, storedTurns)

    return Effect.gen(function*() {
      const projector = yield* TranscriptProjector
      yield* projector.projectFromStore(AGENT_ID, SESSION_ID)

      const expectedPath = transcriptPath(dir, SESSION_ID)
      expect(existsSync(expectedPath)).toBe(true)

      const content = readFileSync(expectedPath, "utf-8")
      expect(content).toContain("# Session Transcript")
      expect(content).toContain("## Turn 0 (user)")
      expect(content).toContain("Hello, how are you?")
      expect(content).toContain("## Turn 1 (assistant)")
      expect(content).toContain("I'm doing well!")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(Effect.sync(() => rmSync(dir, { recursive: true, force: true })))
    )
  })
})
