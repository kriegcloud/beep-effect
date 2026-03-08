import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { withTestPromptsConfig } from "./TestPromptConfig.js"

const testYaml = withTestPromptsConfig({
  providers: {
    anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" },
    openai: { apiKeyEnv: "PA_OPENAI_API_KEY" }
  },
  agents: {
    default: {
      persona: { name: "Test Assistant"  },
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
    },
    summarizer: {
      persona: { name: "Summarizer"  },
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
      model: { provider: "openai", modelId: "gpt-4o-mini" },
      generation: { temperature: 0.2, maxOutputTokens: 1024 }
    }
  },
  server: { port: 3000 }
})

const testLayer = AgentConfig.layerFromParsed(testYaml)

describe("AgentConfig", () => {
  it.effect("getAgent returns the default profile", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("default")
      expect(profile.persona.name).toBe("Test Assistant")
      expect(profile.model.provider).toBe("anthropic")
    }).pipe(Effect.provide(testLayer)))

  it.effect("getAgent returns named profiles", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("summarizer")
      expect(profile.persona.name).toBe("Summarizer")
      expect(profile.model.provider).toBe("openai")
    }).pipe(Effect.provide(testLayer)))

  it.effect("getAgent maps agent:bootstrap to default profile", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("agent:bootstrap")
      expect(profile.persona.name).toBe("Test Assistant")
    }).pipe(Effect.provide(testLayer)))

  it.effect("getAgent falls back to default for unknown agent", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("nonexistent")
      expect(profile.persona.name).toBe("Test Assistant")
    }).pipe(Effect.provide(testLayer)))

  it.effect("defaultAgent returns the default profile", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.defaultAgent.persona.name).toBe("Test Assistant")
    }).pipe(Effect.provide(testLayer)))

  it.effect("providers map is populated", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.providers.size).toBe(2)
      expect(config.providers.get("anthropic")?.apiKeyEnv).toBe("PA_ANTHROPIC_API_KEY")
    }).pipe(Effect.provide(testLayer)))

  it.effect("channels default to enabled when omitted", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.channels.cli.enabled).toBe(true)
      expect(config.channels.webchat.enabled).toBe(true)
    }).pipe(Effect.provide(testLayer)))

  it.effect("channels reflect explicit config values", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.channels.cli.enabled).toBe(false)
      expect(config.channels.webchat.enabled).toBe(true)
    }).pipe(
      Effect.provide(
        AgentConfig.layerFromParsed({
          ...testYaml,
          channels: {
            cli: { enabled: false },
            webchat: { enabled: true }
          }
        })
      )
    ))

  it.effect("channels default individual entries when partially specified", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.channels.cli.enabled).toBe(false)
      expect(config.channels.webchat.enabled).toBe(true)
    }).pipe(
      Effect.provide(
        AgentConfig.layerFromParsed({
          ...testYaml,
          channels: {
            cli: { enabled: false }
          }
        })
      )
    ))

  it.effect("integrations defaults to empty array when omitted", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.integrations).toEqual([])
    }).pipe(Effect.provide(testLayer)))
})
