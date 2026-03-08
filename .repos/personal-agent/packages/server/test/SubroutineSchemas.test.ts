import { describe, expect, it } from "@effect/vitest"
import {
  MemoryRoutinesConfig,
  MemorySubroutineConfig,
  SubroutineTrigger
} from "@template/domain/memory"
import {
  DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS,
  DEFAULT_SUBROUTINE_MAX_ITERATIONS,
  DEFAULT_SUBROUTINE_TOOL_CONCURRENCY
} from "@template/domain/system-defaults"
import { Effect, Schema } from "effect"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const decodeFail = (schema: typeof SubroutineTrigger | typeof MemorySubroutineConfig | typeof MemoryRoutinesConfig) =>
  (input: unknown) => {
    try {
      Schema.decodeUnknownSync(schema)(input)
      return false
    } catch {
      return true
    }
  }

describe("SubroutineTrigger", () => {
  it("decodes PostTurn trigger", () => {
    const result = Schema.decodeUnknownSync(SubroutineTrigger)({ type: "PostTurn" })
    expect(result.type).toBe("PostTurn")
  })

  it("decodes PostSession trigger", () => {
    const result = Schema.decodeUnknownSync(SubroutineTrigger)({ type: "PostSession", idleTimeoutSeconds: 600 })
    expect(result.type).toBe("PostSession")
    expect(result).toHaveProperty("idleTimeoutSeconds", 600)
  })

  it("decodes Scheduled trigger", () => {
    const result = Schema.decodeUnknownSync(SubroutineTrigger)({
      type: "Scheduled",
      cronExpression: "0 * * * *"
    })
    expect(result.type).toBe("Scheduled")
  })

  it("decodes Scheduled trigger with timezone", () => {
    const result = Schema.decodeUnknownSync(SubroutineTrigger)({
      type: "Scheduled",
      cronExpression: "0 * * * *",
      timezone: "America/New_York"
    })
    expect(result.type).toBe("Scheduled")
    expect(result).toHaveProperty("timezone", "America/New_York")
  })

  it("decodes ContextPressure trigger", () => {
    const result = Schema.decodeUnknownSync(SubroutineTrigger)({
      type: "ContextPressure",
      reserveTokens: 4000,
      retryOnOverflow: true
    })
    expect(result.type).toBe("ContextPressure")
    expect(result).toHaveProperty("reserveTokens", 4000)
    expect(result).toHaveProperty("retryOnOverflow", true)
  })

  it("rejects unknown trigger type", () => {
    expect(decodeFail(SubroutineTrigger)({ type: "Unknown" })).toBe(true)
  })

  it("rejects PostSession with non-integer idleTimeoutSeconds", () => {
    expect(decodeFail(SubroutineTrigger)({
      type: "PostSession",
      idleTimeoutSeconds: 1.5
    })).toBe(true)
  })
})

describe("MemorySubroutineConfig", () => {
  const minimalConfig = {
    id: "sub:test",
    name: "Test Subroutine",
    tier: "SemanticMemory",
    trigger: { type: "PostTurn" },
    promptRef: "prompts/test.md"
  }

  it("decodes minimal config with defaults", () => {
    const result = Schema.decodeUnknownSync(MemorySubroutineConfig)(minimalConfig)
    expect(result.id).toBe("sub:test")
    expect(result.maxIterations).toBe(DEFAULT_SUBROUTINE_MAX_ITERATIONS)
    expect(result.toolConcurrency).toBe(DEFAULT_SUBROUTINE_TOOL_CONCURRENCY)
    expect(result.dedupeWindowSeconds).toBe(DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS)
  })

  it("decodes config with explicit maxIterations", () => {
    const result = Schema.decodeUnknownSync(MemorySubroutineConfig)({
      ...minimalConfig,
      maxIterations: 10
    })
    expect(result.maxIterations).toBe(10)
  })

  it("decodes config with toolConcurrency number", () => {
    const result = Schema.decodeUnknownSync(MemorySubroutineConfig)({
      ...minimalConfig,
      toolConcurrency: 3
    })
    expect(result.toolConcurrency).toBe(3)
  })

  it("decodes config with toolConcurrency inherit", () => {
    const result = Schema.decodeUnknownSync(MemorySubroutineConfig)({
      ...minimalConfig,
      toolConcurrency: "inherit"
    })
    expect(result.toolConcurrency).toBe("inherit")
  })

  it("decodes config with toolScope", () => {
    const result = Schema.decodeUnknownSync(MemorySubroutineConfig)({
      ...minimalConfig,
      toolScope: {
        fileRead: true,
        fileWrite: false,
        shell: false,
        memoryRead: true,
        memoryWrite: true,
        notification: false
      }
    })
    expect(result.toolScope).toBeDefined()
    expect(result.toolScope!.fileRead).toBe(true)
    expect(result.toolScope!.shell).toBe(false)
  })

  it("decodes all four memory tiers", () => {
    for (const tier of ["WorkingMemory", "EpisodicMemory", "SemanticMemory", "ProceduralMemory"]) {
      const result = Schema.decodeUnknownSync(MemorySubroutineConfig)({ ...minimalConfig, tier })
      expect(result.tier).toBe(tier)
    }
  })

  it("rejects invalid tier", () => {
    expect(decodeFail(MemorySubroutineConfig)({
      ...minimalConfig,
      tier: "InvalidTier"
    })).toBe(true)
  })

  it("rejects non-integer maxIterations", () => {
    expect(decodeFail(MemorySubroutineConfig)({
      ...minimalConfig,
      maxIterations: 3.5
    })).toBe(true)
  })
})

describe("MemoryRoutinesConfig", () => {
  it("decodes with subroutines and optional sections omitted", () => {
    const result = Schema.decodeUnknownSync(MemoryRoutinesConfig)({
      subroutines: [{
        id: "sub:1",
        name: "Test",
        tier: "SemanticMemory",
        trigger: { type: "PostTurn" },
        promptRef: "prompts/test.md"
      }]
    })
    expect(result.subroutines).toHaveLength(1)
    expect(result.transcripts).toBeUndefined()
    expect(result.traces).toBeUndefined()
  })

  it("decodes with transcripts and traces", () => {
    const result = Schema.decodeUnknownSync(MemoryRoutinesConfig)({
      subroutines: [],
      transcripts: { enabled: true, directory: "transcripts" },
      traces: { enabled: true, directory: "traces/memory" }
    })
    expect(result.transcripts!.enabled).toBe(true)
    expect(result.traces!.retentionDays).toBe(30)
  })
})

describe("AgentConfig memoryRoutines", () => {
  const baseYaml = withTestPromptsConfig({
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
        model: { provider: "anthropic", modelId: "test-model" },
        generation: { temperature: 0.7, maxOutputTokens: 1024 }
      }
    },
    server: { port: 3000 }
  })

  it.effect("decodes profile without memoryRoutines", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("default")
      expect(profile.memoryRoutines).toBeUndefined()
    }).pipe(Effect.provide(AgentConfig.layerFromParsed(baseYaml))))

  it.effect("decodes profile with memoryRoutines", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("default")
      expect(profile.memoryRoutines).toBeDefined()
      expect(profile.memoryRoutines!.subroutines).toHaveLength(1)
      expect(profile.memoryRoutines!.subroutines[0].id).toBe("sub:reflect")
      expect(profile.memoryRoutines!.subroutines[0].maxIterations).toBe(DEFAULT_SUBROUTINE_MAX_ITERATIONS)
    }).pipe(
      Effect.provide(
        AgentConfig.layerFromParsed(withTestPromptsConfig({
          ...baseYaml,
          agents: {
            default: {
              ...baseYaml.agents.default,
              memoryRoutines: {
                subroutines: [{
                  id: "sub:reflect",
                  name: "Reflection",
                  tier: "EpisodicMemory",
                  trigger: { type: "PostTurn" },
                  promptRef: "prompts/reflect.md"
                }]
              }
            }
          }
        }))
      )
    ))
})
