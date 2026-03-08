import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import {
  AlignmentError,
  AlignmentExecutor,
  AnnotatedDocument,
  Annotator,
  DocumentIdGenerator,
  FormatHandler,
  LanguageModel,
  PromptBuilder,
  Resolver,
  Tokenizer
} from "../../src/index.js"
import { makeBunAlignmentExecutorLayer } from "../../src/runtime/BunAlignmentWorker.js"

const mockProviderLanguageModelLayer = LanguageModel.testLayer({
  provider: "mock",
  defaultText:
    "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited\"}]"
})

const resolverLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
  Tokenizer.Default,
  FormatHandler.Default
])

const localAlignmentLayer = Layer.provide(
  AlignmentExecutor.DefaultWithoutDependencies,
  [resolverLayer]
)

const makeAnnotatorLayer = (
  alignmentExecutorLayer: Layer.Layer<AlignmentExecutor>
) =>
  Layer.provide(Annotator.DefaultWithoutDependencies, [
    Tokenizer.Default,
    PromptBuilder.Default,
    FormatHandler.Default,
    alignmentExecutorLayer,
    resolverLayer,
    mockProviderLanguageModelLayer,
    DocumentIdGenerator.Test
  ])

const testOptions = {
  maxCharBuffer: 200,
  batchLength: 4,
  batchConcurrency: 1,
  providerConcurrency: 4,
  extractionPasses: 1,
  promptDescription: "Extract locations and actions."
} as const

const simplify = (result: AnnotatedDocument) =>
  result.extractions.map((item) => ({
    extractionClass: item.extractionClass,
    extractionText: item.extractionText,
    alignmentStatus: item.alignmentStatus,
    startPos: item.charInterval?.startPos,
    endPos: item.charInterval?.endPos,
    startIndex: item.tokenInterval?.startIndex,
    endIndex: item.tokenInterval?.endIndex
  }))

describe("Worker-backed alignment", () => {
  it.live("matches local alignment output when workers are enabled", () =>
    Effect.gen(function* () {
      const inputText = "Alice visited Paris. Bob stayed in London."

      const localResult = yield* Effect.gen(function* () {
        const annotator = yield* Annotator
        return yield* annotator.annotateText(inputText, testOptions)
      }).pipe(Effect.provide(makeAnnotatorLayer(localAlignmentLayer)))

      const workerResult = yield* Effect.gen(function* () {
        const annotator = yield* Annotator
        return yield* annotator.annotateText(inputText, testOptions)
      }).pipe(
        Effect.provide(
          makeAnnotatorLayer(makeBunAlignmentExecutorLayer({ poolSize: 1 }))
        )
      )

      expect(simplify(workerResult)).toEqual(simplify(localResult))
    })
  )

  it.effect("falls back to local resolver alignment when executor fails", () =>
    Effect.gen(function* () {
      const failingAlignmentLayer = AlignmentExecutor.testLayer({
        alignChunk: () =>
          Effect.fail(
            new AlignmentError({
              message: "simulated worker failure"
            })
          )
      })

      const result = yield* Effect.gen(function* () {
        const annotator = yield* Annotator
        return yield* annotator.annotateText(
          "Alice visited Paris. Bob stayed in London.",
          testOptions
        )
      }).pipe(Effect.provide(makeAnnotatorLayer(failingAlignmentLayer)))

      expect(result.extractions.length).toBeGreaterThan(0)
      expect(result.extractions[0]?.alignmentStatus).toBeDefined()
      expect((result.extractions[0]?.charInterval?.startPos ?? -1) >= 0).toBe(
        true
      )
    })
  )
})
