import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { StoreItemInput } from "../src/memory.js"
import { MemoryScope, MemorySource, MemoryTier, SensitivityLevel } from "../src/status.js"

describe("Memory schemas", () => {
  it.effect("decodes a valid StoreItemInput", () =>
    Effect.gen(function*() {
      const input = {
        tier: "SemanticMemory",
        scope: "GlobalScope",
        source: "AgentSource",
        content: "User prefers concise responses"
      }
      const result = yield* Schema.decodeUnknownEffect(StoreItemInput)(input)
      expect(result.tier).toBe("SemanticMemory")
      expect(result.content).toBe("User prefers concise responses")
    }))

  it.effect("rejects invalid tier", () =>
    Effect.gen(function*() {
      const input = { tier: "InvalidTier", scope: "GlobalScope", source: "AgentSource", content: "test" }
      const result = yield* Schema.decodeUnknownEffect(StoreItemInput)(input).pipe(Effect.flip)
      expect(result).toBeDefined()
    }))

  it.effect("decodes all four MemoryTier values", () =>
    Effect.gen(function*() {
      for (const tier of ["WorkingMemory", "EpisodicMemory", "SemanticMemory", "ProceduralMemory"]) {
        yield* Schema.decodeUnknownEffect(MemoryTier)(tier)
      }
    }))

  it.effect("decodes all status enums", () =>
    Effect.gen(function*() {
      yield* Schema.decodeUnknownEffect(MemoryScope)("GlobalScope")
      yield* Schema.decodeUnknownEffect(MemoryScope)("SessionScope")
      yield* Schema.decodeUnknownEffect(MemorySource)("UserSource")
      yield* Schema.decodeUnknownEffect(SensitivityLevel)("Internal")
    }))

  it.effect("rejects ProjectScope (removed from enum)", () =>
    Effect.gen(function*() {
      const result = yield* Schema.decodeUnknownEffect(MemoryScope)("ProjectScope").pipe(Effect.flip)
      expect(result).toBeDefined()
    }))
})
