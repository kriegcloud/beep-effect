import { describe, expect, it } from "@effect/vitest"
import { Chunk, Clock, Effect, Layer, Stream } from "effect"

import {
  AlignmentExecutor,
  Annotator,
  Document,
  DocumentIdGenerator,
  FormatHandler,
  LanguageModel,
  PromptBuilder,
  Resolver,
  ScoredOutput,
  Tokenizer
} from "../../src/index.js"

const mockProviderLanguageModelLayer = LanguageModel.testLayer({
  provider: "mock",
  defaultText:
    "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited\"}]"
})

const annotateRuntimeLayer = (languageModelLayer: Layer.Layer<LanguageModel>) => {
  const resolverLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
    Tokenizer.Default,
    FormatHandler.Default
  ])

  const alignmentExecutorLayer = Layer.provide(
    AlignmentExecutor.DefaultWithoutDependencies,
    [resolverLayer]
  )

  return Layer.provide(Annotator.DefaultWithoutDependencies, [
    Tokenizer.Default,
    PromptBuilder.Default,
    FormatHandler.Default,
    alignmentExecutorLayer,
    resolverLayer,
    languageModelLayer,
    DocumentIdGenerator.Test
  ])
}

describe("Annotator integration", () => {
  it.effect("emits aligned extractions from provider output", () =>
    Effect.gen(function* () {
      const annotator = yield* Annotator
      const result = yield* annotator.annotateText(
        "Alice visited Paris. Bob stayed in London.",
        {
          maxCharBuffer: 200,
          batchLength: 4,
          batchConcurrency: 1,
          providerConcurrency: 4,
          extractionPasses: 1,
          promptDescription: "Extract locations and actions."
        }
      )

      expect(result.extractions.length).toBeGreaterThan(0)
      expect(result.extractions[0]?.alignmentStatus).toBeDefined()
      expect((result.extractions[0]?.charInterval?.startPos ?? -1) >= 0).toBe(
        true
      )
    }).pipe(Effect.provide(annotateRuntimeLayer(mockProviderLanguageModelLayer)))
  )

  it.effect("keeps first-pass extraction when later pass overlaps", () =>
    Effect.gen(function* () {
      const passAwareLanguageModel = LanguageModel.make({
        modelId: "test-pass-aware",
        requiresFenceOutput: false,
        schema: undefined,
        infer: (prompts, options) => {
          const pass = options?.passNumber ?? 1
          const output =
            pass === 1
              ? "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited\"}]"
              : "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited Paris\"}]"

          return Effect.succeed(
            prompts.map(() => [
              new ScoredOutput({
                provider: "test",
                output,
                score: 1
              })
            ])
          )
        },
        generateText: (prompt, options) =>
          passAwareLanguageModel.infer([prompt], options).pipe(
            Effect.map((values) => values[0]?.[0] ?? new ScoredOutput({}))
          ),
        generateObject: () => Effect.succeed({}),
        streamText: (prompt, options) =>
          Stream.fromEffect(
            passAwareLanguageModel.infer([prompt], options).pipe(
              Effect.map((values) => values[0]?.[0]?.output ?? "")
            )
          )
      })

      const result = yield* Effect.gen(function* () {
        const annotator = yield* Annotator
        return yield* annotator.annotateText("Alice visited Paris yesterday.", {
          maxCharBuffer: 200,
          batchLength: 2,
          batchConcurrency: 1,
          providerConcurrency: 2,
          extractionPasses: 2
        })
      }).pipe(
        Effect.provide(
          annotateRuntimeLayer(Layer.succeed(LanguageModel, passAwareLanguageModel))
        )
      )

      const extractionTexts = result.extractions.map((item) => item.extractionText)
      expect(extractionTexts).toContain("Alice visited")
      expect(extractionTexts).not.toContain("Alice visited Paris")
    })
  )

  it.effect("remains deterministic with high batch concurrency", () =>
    Effect.gen(function* () {
      const concurrentLanguageModel = LanguageModel.make({
        modelId: "test-concurrent",
        requiresFenceOutput: false,
        schema: undefined,
        infer: (prompts) =>
          Effect.forEach(
            prompts,
            () =>
              Effect.succeed([
                new ScoredOutput({
                  provider: "test",
                  output:
                    "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited\"}]",
                  score: 1
                })
              ]),
            { concurrency: 8 }
          ),
        generateText: (prompt, options) =>
          concurrentLanguageModel.infer([prompt], options).pipe(
            Effect.map((values) => values[0]?.[0] ?? new ScoredOutput({}))
          ),
        generateObject: () => Effect.succeed({}),
        streamText: (prompt, options) =>
          Stream.fromEffect(
            concurrentLanguageModel.infer([prompt], options).pipe(
              Effect.map((values) => values[0]?.[0]?.output ?? "")
            )
          )
      })

      const text = Array.from(
        { length: 24 },
        (_unused, index) => `Alice visited location ${index}.`
      ).join(" ")

      const run = Effect.gen(function* () {
        const annotator = yield* Annotator
        return yield* annotator.annotateText(text, {
          maxCharBuffer: 45,
          batchLength: 1,
          batchConcurrency: 8,
          providerConcurrency: 8,
          extractionPasses: 1
        })
      }).pipe(
        Effect.provide(
          annotateRuntimeLayer(Layer.succeed(LanguageModel, concurrentLanguageModel))
        )
      )

      const first = yield* run
      const second = yield* run

      expect(first.extractions.length).toBeGreaterThan(2)
      expect(first.extractions.length).toBe(second.extractions.length)
    })
  )

  it.live("streams completed documents without waiting for slower batches", () => {
    const slowAwareLanguageModel = LanguageModel.make({
      modelId: "test-streaming",
      requiresFenceOutput: false,
      schema: undefined,
      infer: (prompts) =>
        Effect.forEach(
          prompts,
          (prompt) =>
            (prompt.includes("slow-marker")
              ? Effect.sleep("500 millis")
              : Effect.void
            ).pipe(
              Effect.as([
                new ScoredOutput({
                  provider: "test",
                  output:
                    "[{\"extractionClass\":\"event\",\"extractionText\":\"Alice visited\"}]",
                  score: 1
                })
              ])
            ),
          { concurrency: 2 }
        ),
      generateText: (prompt, options) =>
        slowAwareLanguageModel.infer([prompt], options).pipe(
          Effect.map((values) => values[0]?.[0] ?? new ScoredOutput({}))
        ),
      generateObject: () => Effect.succeed({}),
      streamText: (prompt, options) =>
        Stream.fromEffect(
          slowAwareLanguageModel.infer([prompt], options).pipe(
            Effect.map((values) => values[0]?.[0]?.output ?? "")
          )
        )
    })

    return Effect.gen(function* () {
      const documents = [
        new Document({
          text: "Alice visited quickly."
        }),
        new Document({
          text: "slow-marker Alice visited eventually."
        })
      ] as const

      const annotator = yield* Annotator
      const started = yield* Clock.currentTimeMillis
      const firstCompleted = yield* annotator
        .annotateDocuments(documents, {
          maxCharBuffer: 200,
          batchLength: 1,
          batchConcurrency: 2,
          providerConcurrency: 2,
          extractionPasses: 1
        })
        .pipe(
          Stream.take(1),
          Stream.runCollect,
          Effect.map((values) => Chunk.toReadonlyArray(values)[0])
        )
      const elapsed = (yield* Clock.currentTimeMillis) - started

      expect(firstCompleted?.text).toContain("quickly")
      expect(elapsed).toBeLessThan(450)
    }).pipe(
      Effect.provide(
        annotateRuntimeLayer(Layer.succeed(LanguageModel, slowAwareLanguageModel))
      )
    )
  })
})
