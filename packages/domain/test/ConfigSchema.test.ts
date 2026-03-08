import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import {
  AgentConfigFileSchema,
  AgentProfileSchema,
  ChannelConfigSchema,
  ChannelsConfigSchema,
  IntegrationConfigSchema,
  MemoryInjectionConfigSchema,
  MemoryLimitsSchema,
  ProviderConfigSchema,
  RuntimeConfigSchema
} from "../src/config.js"

const promptCatalogInput = {
  rootDir: "prompts",
  entries: {
    "core.turn.system.default": { file: "core/system-default.md" },
    "core.turn.replay.continuation": { file: "core/replay-continuation.md" },
    "memory.trigger.envelope": { file: "memory/trigger-envelope.md" },
    "memory.tier.working": { file: "memory/tier-working.md" },
    "memory.tier.episodic": { file: "memory/tier-episodic.md" },
    "memory.tier.semantic": { file: "memory/tier-semantic.md" },
    "memory.tier.procedural": { file: "memory/tier-procedural.md" },
    "compaction.block.summary": { file: "compaction/block-summary.md" },
    "compaction.block.artifacts": { file: "compaction/block-artifacts.md" },
    "compaction.block.tools": { file: "compaction/block-tools.md" },
    "compaction.block.kept": { file: "compaction/block-kept-context.md" }
  }
} as const

describe("Config Schemas", () => {
  it("decodes a valid provider config", () => {
    const input = { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
    const result = Schema.decodeUnknownSync(ProviderConfigSchema)(input)
    expect(result.apiKeyEnv).toBe("PA_ANTHROPIC_API_KEY")
  })

  it("decodes a valid agent profile", () => {
    const input = {
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
    const result = Schema.decodeUnknownSync(AgentProfileSchema)(input)
    expect(result.persona.name).toBe("Test")
    expect(result.model.provider).toBe("anthropic")
    expect(result.generation.temperature).toBe(0.7)
  })

  it("decodes a full config file", () => {
    const input = {
      prompts: promptCatalogInput,
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant"  },
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
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(Object.keys(result.agents)).toEqual(["default"])
    expect(result.server.port).toBe(3000)
  })

  it("rejects invalid provider literal", () => {
    const input = {
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
      model: { provider: "invalid-provider", modelId: "x" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
    expect(() => Schema.decodeUnknownSync(AgentProfileSchema)(input)).toThrow()
  })

  it("allows optional generation fields to be omitted", () => {
    const input = {
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
      model: { provider: "openai", modelId: "gpt-4o" },
      generation: { temperature: 0.5, maxOutputTokens: 2048 }
    }
    const result = Schema.decodeUnknownSync(AgentProfileSchema)(input)
    expect(result.generation.topP).toBeUndefined()
    expect(result.generation.seed).toBeUndefined()
  })

  it("decodes a valid channel config", () => {
    const result = Schema.decodeUnknownSync(ChannelConfigSchema)({ enabled: true })
    expect(result.enabled).toBe(true)
  })

  it("decodes channels config with explicit values", () => {
    const result = Schema.decodeUnknownSync(ChannelsConfigSchema)({
      cli: { enabled: false },
      webchat: { enabled: true }
    })
    expect(result.cli.enabled).toBe(false)
    expect(result.webchat.enabled).toBe(true)
  })

  it("defaults omitted channel entries to enabled", () => {
    const result = Schema.decodeUnknownSync(ChannelsConfigSchema)({})
    expect(result.cli.enabled).toBe(true)
    expect(result.webchat.enabled).toBe(true)
  })

  it("defaults partial channel config (only cli specified)", () => {
    const result = Schema.decodeUnknownSync(ChannelsConfigSchema)({
      cli: { enabled: false }
    })
    expect(result.cli.enabled).toBe(false)
    expect(result.webchat.enabled).toBe(true)
  })

  it("defaults channels when omitted from full config", () => {
    const input = {
      prompts: promptCatalogInput,
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant"  },
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
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(result.channels.cli.enabled).toBe(true)
    expect(result.channels.webchat.enabled).toBe(true)
  })

  it("decodes full config with explicit channels", () => {
    const input = {
      prompts: promptCatalogInput,
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant"  },
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
      server: { port: 3000 },
      channels: {
        cli: { enabled: true },
        webchat: { enabled: false }
      }
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(result.channels.cli.enabled).toBe(true)
    expect(result.channels.webchat.enabled).toBe(false)
  })

  it("defaults integrations to empty array when omitted", () => {
    const input = {
      prompts: promptCatalogInput,
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant"  },
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
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(result.integrations).toEqual([])
  })

  it("decodes config with integrations defined", () => {
    const input = {
      prompts: promptCatalogInput,
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant"  },
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
      server: { port: 3000 },
      integrations: [
        {
          serviceId: "svc:example",
          name: "Example Service",
          endpoint: "http://localhost:8080",
          transport: "http",
          identifier: "custom-id"
        }
      ]
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(result.integrations).toHaveLength(1)
    expect(result.integrations[0].serviceId).toBe("svc:example")
    expect(result.integrations[0].name).toBe("Example Service")
    expect(result.integrations[0].endpoint).toBe("http://localhost:8080")
    expect(result.integrations[0].transport).toBe("http")
    expect(result.integrations[0].identifier).toBe("custom-id")
  })

  it("decodes integration without identifier (optional field)", () => {
    const input = {
      serviceId: "svc:test",
      name: "Test Service",
      endpoint: "http://localhost:9090",
      transport: "sse"
    }
    const result = Schema.decodeUnknownSync(IntegrationConfigSchema)(input)
    expect(result.serviceId).toBe("svc:test")
    expect(result.transport).toBe("sse")
    expect(result.identifier).toBeUndefined()
  })

  it("rejects invalid integration transport", () => {
    const input = {
      serviceId: "svc:bad",
      name: "Bad Service",
      endpoint: "http://localhost:9090",
      transport: "grpc"
    }
    expect(() => Schema.decodeUnknownSync(IntegrationConfigSchema)(input)).toThrow()
  })

  it("defaults RuntimeConfigSchema from empty object", () => {
    const result = Schema.decodeUnknownSync(RuntimeConfigSchema)({})
    expect(result).toEqual({
      tokenBudget: 200_000,
      maxToolIterations: 200,
      memory: {
        defaultRetrieveLimit: 10,
        maxRetrieveLimit: 50
      }
    })
  })

  it("allows partial RuntimeConfig overrides", () => {
    const result = Schema.decodeUnknownSync(RuntimeConfigSchema)({
      tokenBudget: 100_000,
      memory: { maxRetrieveLimit: 25 }
    })
    expect(result.tokenBudget).toBe(100_000)
    expect(result.maxToolIterations).toBe(200)
    expect(result.memory.defaultRetrieveLimit).toBe(10)
    expect(result.memory.maxRetrieveLimit).toBe(25)
  })

  it("defaults MemoryLimitsSchema from empty object", () => {
    const result = Schema.decodeUnknownSync(MemoryLimitsSchema)({})
    expect(result).toEqual({
      defaultRetrieveLimit: 10,
      maxRetrieveLimit: 50
    })
  })

  it("defaults runtime in AgentProfileSchema when omitted", () => {
    const input = {
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
    const result = Schema.decodeUnknownSync(AgentProfileSchema)(input)
    expect(result.runtime).toEqual({
      tokenBudget: 200_000,
      maxToolIterations: 200,
      memory: {
        defaultRetrieveLimit: 10,
        maxRetrieveLimit: 50
      }
    })
  })

  it("decodes memory injection config with optional fields", () => {
    const result = Schema.decodeUnknownSync(MemoryInjectionConfigSchema)({
      enabled: true,
      maxTokens: 2048,
      tiers: ["SemanticMemory", "ProceduralMemory"],
      perTierFetchLimit: 80,
      allowedSensitivities: ["Public", "Internal"]
    })
    expect(result.enabled).toBe(true)
    expect(result.maxTokens).toBe(2048)
    expect(result.tiers).toEqual(["SemanticMemory", "ProceduralMemory"])
    expect(result.perTierFetchLimit).toBe(80)
    expect(result.allowedSensitivities).toEqual(["Public", "Internal"])
  })

  it("rejects non-integer memory injection numeric fields", () => {
    expect(() =>
      Schema.decodeUnknownSync(MemoryInjectionConfigSchema)({
        maxTokens: 123.5
      })
    ).toThrow()
    expect(() =>
      Schema.decodeUnknownSync(MemoryInjectionConfigSchema)({
        perTierFetchLimit: 10.25
      })
    ).toThrow()
  })
})
