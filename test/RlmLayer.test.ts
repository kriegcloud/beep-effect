import { describe, expect, test } from "bun:test"
import { Chunk, Effect, Layer, Stream } from "effect"
import { Rlm, rlmBunLayer, rlmLayer } from "../src/Rlm"
import { RlmConfig, type RlmConfigService } from "../src/RlmConfig"
import { makeFakeRlmModelLayer, type FakeModelResponse } from "./helpers/FakeRlmModel"
import { makeFakeSandboxFactoryLayer } from "./helpers/FakeSandboxFactory"

const defaultConfig: RlmConfigService = {
  maxIterations: 10,
  maxDepth: 1,
  maxLlmCalls: 20,
  maxTotalTokens: null,
  concurrency: 4,
  enableLlmQueryBatched: true,
  maxBatchQueries: 32,
  eventBufferCapacity: 4096,
  maxExecutionOutputChars: 8_000,
  enablePromptCaching: true,
  primaryTarget: {
    provider: "anthropic",
    model: "claude-sonnet-4-5-20250929"
  },
  subLlmDelegation: {
    enabled: false,
    depthThreshold: 1
  }
}

const makeLayer = (options: {
  readonly responses: ReadonlyArray<FakeModelResponse>
  readonly config?: Partial<RlmConfigService>
}) =>
  Layer.provide(
    rlmLayer,
    Layer.mergeAll(
      makeFakeRlmModelLayer(options.responses),
      makeFakeSandboxFactoryLayer(),
      Layer.succeed(RlmConfig, { ...defaultConfig, ...options.config })
    )
  )

const makeBunLayer = (options: {
  readonly responses: ReadonlyArray<FakeModelResponse>
  readonly config?: Partial<RlmConfigService>
}) =>
  Layer.provide(
    rlmBunLayer,
    Layer.mergeAll(
      makeFakeRlmModelLayer(options.responses),
      Layer.succeed(RlmConfig, { ...defaultConfig, ...options.config })
    )
  )

const submitAnswer = (answer: string): FakeModelResponse => ({
  toolCalls: [{ name: "SUBMIT", params: { answer } }]
})

describe("Rlm layer wiring", () => {
  test("creates a fresh runtime for each stream call", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const rlm = yield* Rlm

        const firstEvents = yield* rlm.stream({
          query: "first",
          context: "ctx"
        }).pipe(Stream.runCollect)

        const secondEvents = yield* rlm.stream({
          query: "second",
          context: "ctx"
        }).pipe(Stream.runCollect)

        const firstCallStarted = Chunk.toReadonlyArray(firstEvents).find((event) => event._tag === "CallStarted")
        const secondCallStarted = Chunk.toReadonlyArray(secondEvents).find((event) => event._tag === "CallStarted")

        return {
          firstCompletionId: firstCallStarted?.completionId,
          secondCompletionId: secondCallStarted?.completionId
        }
      }).pipe(
        Effect.provide(
          makeLayer({
            responses: [submitAnswer("one"), submitAnswer("two")]
          })
        )
      )
    )

    expect(result.firstCompletionId).toBeDefined()
    expect(result.secondCompletionId).toBeDefined()
    expect(result.firstCompletionId).not.toBe(result.secondCompletionId)
  })

  test("resets llm budget per complete call", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const rlm = yield* Rlm
        const first = yield* rlm.complete({ query: "first", context: "ctx" })
        const second = yield* rlm.complete({ query: "second", context: "ctx" })
        return { first, second }
      }).pipe(
        Effect.provide(
          makeLayer({
            responses: [submitAnswer("first-answer"), submitAnswer("second-answer")],
            config: { maxLlmCalls: 1 }
          })
        )
      )
    )

    expect(result.first).toBe("first-answer")
    expect(result.second).toBe("second-answer")
  })
})

describe("Rlm bun layer wiring", () => {
  test("uses one completion id per run and new id per subsequent run", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const rlm = yield* Rlm

        const firstEvents = yield* rlm.stream({
          query: "first",
          context: "ctx"
        }).pipe(Stream.runCollect)
        const secondEvents = yield* rlm.stream({
          query: "second",
          context: "ctx"
        }).pipe(Stream.runCollect)

        const firstIds = new Set(
          Chunk.toReadonlyArray(firstEvents).map((event) => event.completionId)
        )
        const secondIds = new Set(
          Chunk.toReadonlyArray(secondEvents).map((event) => event.completionId)
        )

        return {
          firstIds,
          secondIds
        }
      }).pipe(
        Effect.provide(
          makeBunLayer({
            responses: [submitAnswer("first"), submitAnswer("second")]
          })
        )
      )
    )

    expect(result.firstIds.size).toBe(1)
    expect(result.secondIds.size).toBe(1)
    expect([...result.firstIds][0]).not.toBe([...result.secondIds][0])
  })

  test("creates a fresh runtime for each complete call", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const rlm = yield* Rlm
        const first = yield* rlm.complete({ query: "first", context: "ctx" })
        const second = yield* rlm.complete({ query: "second", context: "ctx" })
        return { first, second }
      }).pipe(
        Effect.provide(
          makeBunLayer({
            responses: [submitAnswer("first"), submitAnswer("second")],
            config: { maxLlmCalls: 1 }
          })
        )
      )
    )

    expect(result.first).toBe("first")
    expect(result.second).toBe("second")
  })
})
