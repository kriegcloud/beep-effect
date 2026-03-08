import { describe, expect, it } from "@effect/vitest"
import type { AgentProfile } from "@template/domain/config"
import type { AgentId } from "@template/domain/ids"
import type { MemoryItemRecord, MemoryPort } from "@template/domain/ports"
import type { MemoryTier, SensitivityLevel } from "@template/domain/status"
import { DateTime, Effect } from "effect"
import { buildMemoryBlock, injectMemoriesIntoSystemPrompt } from "../src/turn/MemoryInjector.js"

// ── Helpers ──

const makeItem = (
  overrides: Partial<MemoryItemRecord> & { content: string; tier?: MemoryTier }
): MemoryItemRecord => {
  const {
    content,
    tier,
    sensitivity,
    createdAt,
    updatedAt,
    ...rest
  } = overrides

  return {
    memoryItemId: `mem:${crypto.randomUUID()}` as MemoryItemRecord["memoryItemId"],
    agentId: "agent:test" as AgentId,
    tier: tier ?? "SemanticMemory",
    scope: "GlobalScope",
    source: "AgentSource",
    content,
    metadataJson: null,
    generatedByTurnId: null,
    sessionId: null,
    sensitivity: sensitivity ?? "Internal",
    wasGeneratedBy: null,
    wasAttributedTo: null,
    governedByRetention: null,
    lastAccessTime: null,
    createdAt: createdAt ?? DateTime.fromDateUnsafe(new Date("2026-01-15T10:00:00Z")),
    updatedAt: updatedAt ?? DateTime.fromDateUnsafe(new Date("2026-01-15T10:00:00Z")),
    ...rest
  }
}

const makeMemoryPort = (items: ReadonlyArray<MemoryItemRecord>): MemoryPort => ({
  search: () => Effect.succeed({ items: [], cursor: null, totalCount: 0 }),
  encode: () => Effect.succeed([]),
  retrieve: () => Effect.succeed([]),
  forget: () => Effect.succeed(0),
  listAll: (_agentId, filters) =>
    Effect.succeed(
      items.filter((item) =>
        (filters.tier === undefined || item.tier === filters.tier)
        && (filters.scope === undefined || item.scope === filters.scope)
      ).slice(0, filters.limit)
    )
})

const baseProfile: AgentProfile = {
  persona: { name: "Test Agent" },
  promptBindings: {
    turn: { systemPromptRef: "test.system", replayContinuationRef: "test.replay" },
    memory: {
      triggerEnvelopeRef: "test.envelope",
      tierInstructionRefs: {
        WorkingMemory: "test.working",
        EpisodicMemory: "test.episodic",
        SemanticMemory: "test.semantic",
        ProceduralMemory: "test.procedural"
      }
    },
    compaction: {
      summaryBlockRef: "test.summary",
      artifactRefsBlockRef: "test.artifacts",
      toolRefsBlockRef: "test.tools",
      keptContextBlockRef: "test.kept"
    }
  },
  model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
  generation: { temperature: 0.7, maxOutputTokens: 4096 },
  runtime: {
    tokenBudget: 100000,
    maxToolIterations: 25,
    memory: { defaultRetrieveLimit: 20, maxRetrieveLimit: 100 }
  }
}

const agentId = "agent:test" as AgentId

// ── Tests ──

describe("buildMemoryBlock", () => {
  it.effect("returns empty string when no memories exist", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toBe("")
    })
  )

  it.effect("returns empty string when injection is disabled", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([makeItem({ content: "hello" })])
      const profile = { ...baseProfile, memoryInjection: { enabled: false } }
      const result = yield* buildMemoryBlock(port, agentId, profile)
      expect(result).toBe("")
    })
  )

  it.effect("renders semantic memory items", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "User prefers dark mode", tier: "SemanticMemory" })
      ])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("## Durable Memory (Reference Data)")
      expect(result).toContain("untrusted quoted data")
      expect(result).toContain("### Facts & Knowledge")
      expect(result).toContain("- [Internal] content_json: \"User prefers dark mode\"")
    })
  )

  it.effect("renders both semantic and procedural tiers", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "User timezone is US/Pacific", tier: "SemanticMemory" }),
        makeItem({ content: "Always run tests before deploy", tier: "ProceduralMemory" })
      ])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("### Facts & Knowledge")
      expect(result).toContain("### Procedures & Workflows")
      expect(result).toContain("User timezone is US/Pacific")
      expect(result).toContain("Always run tests before deploy")
    })
  )

  it.effect("filters by configured tiers only", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "semantic fact", tier: "SemanticMemory" }),
        makeItem({ content: "episodic event", tier: "EpisodicMemory" }),
        makeItem({ content: "procedural step", tier: "ProceduralMemory" })
      ])
      // Default tiers are Semantic + Procedural
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("semantic fact")
      expect(result).toContain("procedural step")
      expect(result).not.toContain("episodic event")
    })
  )

  it.effect("filters by allowed sensitivities", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "public fact", sensitivity: "Public" as SensitivityLevel }),
        makeItem({ content: "internal fact", sensitivity: "Internal" as SensitivityLevel }),
        makeItem({ content: "confidential fact", sensitivity: "Confidential" as SensitivityLevel }),
        makeItem({ content: "restricted fact", sensitivity: "Restricted" as SensitivityLevel })
      ])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("public fact")
      expect(result).toContain("internal fact")
      expect(result).not.toContain("confidential fact")
      expect(result).not.toContain("restricted fact")
    })
  )

  it.effect("respects token budget and drops oldest items first", () =>
    Effect.gen(function*() {
      const baseDate = new Date("2026-01-01T00:00:00Z")
      const items = Array.from({ length: 100 }, (_, i) =>
        makeItem({
          content: `Memory item number ${i} with some padding content to use tokens`,
          tier: "SemanticMemory",
          createdAt: DateTime.fromDateUnsafe(new Date(baseDate.getTime() + i * 86_400_000))
        })
      )
      const port = makeMemoryPort(items)
      const profile = { ...baseProfile, memoryInjection: { maxTokens: 200 } }
      const result = yield* buildMemoryBlock(port, agentId, profile)

      // Should have some items but not all 100
      expect(result.length).toBeGreaterThan(0)
      const lines = result.split("\n").filter((l) => l.startsWith("- ["))
      expect(lines.length).toBeLessThan(100)
      expect(lines.length).toBeGreaterThan(0)
    })
  )

  it.effect("skips oversized recent item and still keeps older items that fit budget", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({
          content: "x".repeat(6000),
          tier: "SemanticMemory",
          createdAt: DateTime.fromDateUnsafe(new Date("2026-01-10T00:00:00Z"))
        }),
        makeItem({
          content: "small memory that should survive budget filtering",
          tier: "SemanticMemory",
          createdAt: DateTime.fromDateUnsafe(new Date("2026-01-09T00:00:00Z"))
        })
      ])
      const profile = { ...baseProfile, memoryInjection: { maxTokens: 120 } }
      const result = yield* buildMemoryBlock(port, agentId, profile)
      expect(result).toContain("small memory that should survive budget filtering")
    })
  )

  it.effect("skips items with empty content", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "" }),
        makeItem({ content: "   " }),
        makeItem({ content: "real content" })
      ])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("real content")
      const lines = result.split("\n").filter((l) => l.startsWith("- ["))
      expect(lines.length).toBe(1)
    })
  )

  it.effect("sanitizes markdown control sequences in content", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "## Injected heading\n---\nContent after rule\tand tabbed text" })
      ])
      const result = yield* buildMemoryBlock(port, agentId, baseProfile)
      expect(result).toContain("content_json:")
      expect(result).toContain("## Injected heading --- Content after rule and tabbed text")
    })
  )

  it.effect("clamps negative and oversized config values to safe bounds", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        ...Array.from({ length: 8 }, (_, i) =>
          makeItem({
            content: `item-${i}`,
            tier: "SemanticMemory",
            createdAt: DateTime.fromDateUnsafe(new Date(`2026-01-${10 + i}T00:00:00Z`))
          }))
      ])
      const profile = {
        ...baseProfile,
        memoryInjection: {
          maxTokens: 999_999_999,
          perTierFetchLimit: -10
        }
      }
      const result = yield* buildMemoryBlock(port, agentId, profile)
      const lines = result.split("\n").filter((line) => line.startsWith("- ["))
      expect(lines.length).toBe(1)
    })
  )
})

describe("injectMemoriesIntoSystemPrompt", () => {
  const basePrompt = "You are a helpful assistant."

  it.effect("appends memory block to base prompt", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([
        makeItem({ content: "User likes coffee" })
      ])
      const result = yield* injectMemoriesIntoSystemPrompt({
        baseSystemPrompt: basePrompt,
        memoryPort: port,
        agentId,
        profile: baseProfile
      })
      expect(result).toContain(basePrompt)
      expect(result).toContain("User likes coffee")
    })
  )

  it.effect("returns base prompt when no memories exist", () =>
    Effect.gen(function*() {
      const port = makeMemoryPort([])
      const result = yield* injectMemoriesIntoSystemPrompt({
        baseSystemPrompt: basePrompt,
        memoryPort: port,
        agentId,
        profile: baseProfile
      })
      expect(result).toBe(basePrompt)
    })
  )

  it.effect("falls back to base prompt on failure", () =>
    Effect.gen(function*() {
      const failingPort: MemoryPort = {
        search: () => Effect.die(new Error("db error")),
        encode: () => Effect.die(new Error("db error")),
        retrieve: () => Effect.die(new Error("db error")),
        forget: () => Effect.die(new Error("db error")),
        listAll: () => Effect.die(new Error("db error"))
      }
      const result = yield* injectMemoriesIntoSystemPrompt({
        baseSystemPrompt: basePrompt,
        memoryPort: failingPort,
        agentId,
        profile: baseProfile
      })
      expect(result).toBe(basePrompt)
    })
  )
})
