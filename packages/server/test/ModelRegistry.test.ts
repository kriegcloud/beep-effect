import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ModelRegistry } from "../src/ai/ModelRegistry.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const testConfig = withTestPromptsConfig({
  providers: {
    anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
  },
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
      model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
  },
  server: { port: 3000 }
})

describe("ModelRegistry", () => {
  it.effect("service loads and exposes get function", () =>
    Effect.gen(function*() {
      const registry = yield* ModelRegistry
      expect(typeof registry.get).toBe("function")
    }).pipe(
      Effect.provide(
        ModelRegistry.layer.pipe(
          Layer.provide(AgentConfig.layerFromParsed(testConfig))
        )
      )
    ))
})
