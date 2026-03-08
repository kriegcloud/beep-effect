import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { Effect, Layer, ManagedRuntime } from "effect"
import {
  NlpToolkit,
  NlpToolkitLive
} from "../../src/NLP/Tools/NlpToolkit.js"

const NlpToolkitLiveOrDie = Layer.orDie(NlpToolkitLive)

let runtime: ManagedRuntime.ManagedRuntime<
  Effect.Effect.Context<typeof NlpToolkit>,
  never
>

beforeAll(async () => {
  runtime = ManagedRuntime.make(NlpToolkitLiveOrDie)
})

afterAll(async () => {
  await runtime.dispose()
})

describe("NLP custom entity tools", () => {
  it("learns custom entities in replace mode and extracts them", async () => {
    const result = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit

        const learned = yield* toolkit.handle("LearnCustomEntities", {
          groupName: "custom-entities-test",
          mode: "replace",
          entities: [
            {
              name: "PERSON_NAME",
              patterns: ["[PROPN]", "[PROPN]"]
            }
          ]
        })

        const extracted = yield* toolkit.handle("ExtractEntities", {
          text: "John Doe met Jane Roe yesterday.",
          includeCustom: true
        })

        return {
          learned,
          extracted
        }
      })
    )

    expect(result.learned.isFailure).toBe(false)
    expect(result.learned.result.mode).toBe("replace")
    expect(result.learned.result.learnedEntityCount).toBe(1)
    expect(result.learned.result.entityNames).toContain("PERSON_NAME")

    expect(result.extracted.isFailure).toBe(false)
    expect(result.extracted.result.customEntityCount).toBeGreaterThan(0)
    expect(result.extracted.result.customEntityTypes).toContain("PERSON_NAME")
    expect(
      result.extracted.result.customEntities.every((entity) => entity.source === "custom")
    ).toBe(true)
    expect(result.extracted.result.allEntityCount).toBeGreaterThanOrEqual(
      result.extracted.result.entityCount
    )
  })

  it("ExtractEntities can skip custom entities with includeCustom=false", async () => {
    const result = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit

        yield* toolkit.handle("LearnCustomEntities", {
          groupName: "custom-entities-test",
          mode: "replace",
          entities: [
            {
              name: "PERSON_NAME",
              patterns: ["[PROPN]", "[PROPN]"]
            }
          ]
        })

        return yield* toolkit.handle("ExtractEntities", {
          text: "John Doe met Jane Roe yesterday.",
          includeCustom: false
        })
      })
    )

    expect(result.isFailure).toBe(false)
    expect(result.result.customEntityCount).toBe(0)
    expect(result.result.customEntities).toEqual([])
    expect(result.result.customEntityTypes).toEqual([])
    expect(result.result.allEntityCount).toBe(result.result.entityCount)
  })

  it("append mode preserves existing custom entities and adds new ones", async () => {
    const result = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit

        const replaced = yield* toolkit.handle("LearnCustomEntities", {
          groupName: "custom-entities-test",
          mode: "replace",
          entities: [
            {
              name: "PERSON_NAME",
              patterns: ["[PROPN]", "[PROPN]"]
            }
          ]
        })

        const appended = yield* toolkit.handle("LearnCustomEntities", {
          groupName: "custom-entities-test",
          mode: "append",
          entities: [
            {
              name: "MONEY_AMOUNT",
              patterns: ["[MONEY]"]
            }
          ]
        })

        const extracted = yield* toolkit.handle("ExtractEntities", {
          text: "John Doe paid $ 300 yesterday.",
          includeCustom: true
        })

        return {
          replaced,
          appended,
          extracted
        }
      })
    )

    expect(result.replaced.isFailure).toBe(false)
    expect(result.appended.isFailure).toBe(false)
    expect(result.appended.result.mode).toBe("append")
    expect(result.appended.result.entityNames).toContain("PERSON_NAME")
    expect(result.appended.result.entityNames).toContain("MONEY_AMOUNT")
    expect(result.appended.result.totalEntityCount).toBeGreaterThanOrEqual(2)

    expect(result.extracted.isFailure).toBe(false)
    expect(result.extracted.result.customEntityTypes).toContain("PERSON_NAME")
    expect(result.extracted.result.customEntityTypes).toContain("MONEY_AMOUNT")
  })
})
