/**
 * Concurrent vectorizer isolation tests
 * Verifies that TextSimilarity and ExtractKeywords produce deterministic
 * results under concurrent execution (no shared mutable BM25 state).
 * @since 3.0.0
 */

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

describe("Concurrent vectorizer isolation", () => {
  it("TextSimilarity produces deterministic results under concurrency", async () => {
    const pairs = [
      { text1: "The cat sat on the mat", text2: "A dog slept on the rug" },
      { text1: "Machine learning processes data", text2: "Deep learning trains models" },
      { text1: "The quick brown fox", text2: "The lazy sleeping dog" }
    ]

    // Run each pair sequentially first to get baseline results
    const baselines = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit
        const results = []
        for (const pair of pairs) {
          const r = yield* toolkit.handle("TextSimilarity", pair)
          results.push(r.result.score)
        }
        return results
      })
    )

    // Now run all pairs concurrently 10 times and verify determinism
    for (let round = 0; round < 10; round++) {
      const concurrentResults = await runtime.runPromise(
        Effect.gen(function*() {
          const toolkit = yield* NlpToolkit
          return yield* Effect.all(
            pairs.map((pair) =>
              toolkit.handle("TextSimilarity", pair).pipe(
                Effect.map((r) => r.result.score)
              )
            ),
            { concurrency: "unbounded" }
          )
        })
      )

      for (let i = 0; i < pairs.length; i++) {
        expect(concurrentResults[i]).toBeCloseTo(baselines[i], 10)
      }
    }
  })

  it("ExtractKeywords produces deterministic results under concurrency", async () => {
    const texts = [
      "The cat sat on the mat. The cat was happy. The cat purred loudly.",
      "Machine learning algorithms process data efficiently and accurately.",
      "The quick brown fox jumps over the lazy dog while birds sing."
    ]

    // Get baseline results sequentially
    const baselines = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit
        const results = []
        for (const text of texts) {
          const r = yield* toolkit.handle("ExtractKeywords", { text, topN: 5 })
          results.push(r.result.keywords.map((kw) => kw.term).sort())
        }
        return results
      })
    )

    // Run concurrently 10 times
    for (let round = 0; round < 10; round++) {
      const concurrentResults = await runtime.runPromise(
        Effect.gen(function*() {
          const toolkit = yield* NlpToolkit
          return yield* Effect.all(
            texts.map((text) =>
              toolkit.handle("ExtractKeywords", { text, topN: 5 }).pipe(
                Effect.map((r) => r.result.keywords.map((kw) => kw.term).sort())
              )
            ),
            { concurrency: "unbounded" }
          )
        })
      )

      for (let i = 0; i < texts.length; i++) {
        expect(concurrentResults[i]).toEqual(baselines[i])
      }
    }
  })

  it("TextSimilarity and ExtractKeywords run concurrently without interference", async () => {
    // Mix both tool types in concurrent execution
    const result = await runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit
        const [simResult, kwResult] = yield* Effect.all([
          toolkit.handle("TextSimilarity", {
            text1: "cats are wonderful pets",
            text2: "dogs are great companions"
          }),
          toolkit.handle("ExtractKeywords", {
            text: "cats are wonderful pets and dogs are great companions",
            topN: 5
          })
        ], { concurrency: "unbounded" })
        return { score: simResult.result.score, keywords: kwResult.result.keywords }
      })
    )

    expect(Number.isFinite(result.score)).toBe(true)
    expect(result.keywords.length).toBeGreaterThan(0)
    expect(result.keywords.length).toBeLessThanOrEqual(5)
  })
})
