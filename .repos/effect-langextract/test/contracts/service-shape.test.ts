import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import {
  AlignmentExecutor,
  Annotator,
  AnthropicConfig,
  CharInterval,
  DocumentIdGenerator,
  ExampleData,
  Extraction,
  FormatHandler,
  GeminiConfig,
  LanguageModel,
  OllamaConfig,
  OpenAIConfig,
  PrimedCache,
  PrimedCacheKey,
  PrimedCacheTest,
  PromptBuilder,
  PromptValidator,
  Resolver,
  RuntimeControl,
  ScoredOutput,
  TokenInterval,
  Tokenizer,
  Visualizer} from "../../src/index.js"

describe("Service contracts", () => {
  it.effect("Tokenizer exposes tokenize/tokensText/findSentenceRange", () =>
    Effect.gen(function* () {
      const tokenizer = yield* Tokenizer
      const tokenized = tokenizer.tokenize("One two. Three four")
      const sentence = tokenizer.findSentenceRange(
        tokenized.text,
        tokenized.tokens,
        0
      )

      expect(typeof tokenizer.tokenize).toBe("function")
      expect(typeof tokenizer.tokensText).toBe("function")
      expect(typeof tokenizer.findSentenceRange).toBe("function")
      expect(sentence.startIndex).toBe(0)
      expect(sentence.endIndex).toBeGreaterThan(0)
      expect(
        tokenizer.tokensText(
          tokenized,
          new TokenInterval({ startIndex: 0, endIndex: 2 })
        )
      ).toContain("One")
    }).pipe(Effect.provide(Tokenizer.Default))
  )

  it.effect("PrimedCache supports put/get/invalidate", () =>
    Effect.gen(function* () {
      const cache = yield* PrimedCache
      const key = new PrimedCacheKey({
        provider: "test",
        modelId: "test-model",
        promptFingerprint: "fp-1",
        promptVersion: "langextract"
      })

      yield* cache.put(key, [new ScoredOutput({ output: "ok", score: 1 })])
      const beforeDelete = yield* cache.get(key)
      yield* cache.invalidate(key)
      const afterDelete = yield* cache.get(key)

      expect(beforeDelete?.[0]?.output).toBe("ok")
      expect(afterDelete).toBeUndefined()
    }).pipe(Effect.provide(PrimedCacheTest))
  )

  it("services expose canonical Test/testLayer APIs", () => {
    expect(typeof Tokenizer.Test).toBe("object")
    expect(typeof Tokenizer.testLayer).toBe("function")
    expect(typeof LanguageModel.Test).toBe("object")
    expect(typeof LanguageModel.testLayer).toBe("function")
    expect(typeof DocumentIdGenerator.Test).toBe("object")
    expect(typeof DocumentIdGenerator.testLayer).toBe("function")
    expect(typeof FormatHandler.Test).toBe("object")
    expect(typeof FormatHandler.testLayer).toBe("function")
    expect(typeof PrimedCache.testLayer).toBe("function")
    expect(typeof PromptBuilder.Test).toBe("object")
    expect(typeof PromptBuilder.testLayer).toBe("function")
    expect(typeof PromptValidator.Test).toBe("object")
    expect(typeof PromptValidator.testLayer).toBe("function")
    expect(typeof Resolver.Test).toBe("object")
    expect(typeof Resolver.testLayer).toBe("function")
    expect(typeof AlignmentExecutor.Test).toBe("object")
    expect(typeof AlignmentExecutor.testLayer).toBe("function")
    expect(typeof Annotator.Test).toBe("object")
    expect(typeof Annotator.testLayer).toBe("function")
    expect(typeof Visualizer.Test).toBe("object")
    expect(typeof Visualizer.testLayer).toBe("function")
    expect(typeof RuntimeControl.Test).toBe("object")
    expect(typeof RuntimeControl.testLayer).toBe("function")
    expect(typeof OpenAIConfig.Test).toBe("object")
    expect(typeof OpenAIConfig.testLayer).toBe("function")
    expect(typeof GeminiConfig.Test).toBe("object")
    expect(typeof GeminiConfig.testLayer).toBe("function")
    expect(typeof AnthropicConfig.Test).toBe("object")
    expect(typeof AnthropicConfig.testLayer).toBe("function")
    expect(typeof OllamaConfig.Test).toBe("object")
    expect(typeof OllamaConfig.testLayer).toBe("function")
  })

  it("dependency-based services expose DefaultWithoutDependencies", () => {
    expect(typeof Resolver.DefaultWithoutDependencies).toBe("object")
    expect(typeof PromptValidator.DefaultWithoutDependencies).toBe("object")
    expect(typeof AlignmentExecutor.DefaultWithoutDependencies).toBe("object")
    expect(typeof Annotator.DefaultWithoutDependencies).toBe("object")
  })

  it.effect("PromptValidator overrides dependencies deterministically", () =>
    Effect.gen(function* () {
      const resolverStub = Resolver.make({
        resolve: () => Effect.succeed([]),
        align: (extractions) =>
          Effect.succeed(
            extractions.map(
              (extraction, index) =>
                new Extraction({
                  extractionClass: extraction.extractionClass,
                  extractionText: extraction.extractionText,
                  alignmentStatus: "match_lesser",
                  extractionIndex: extraction.extractionIndex ?? index,
                  groupIndex: extraction.groupIndex ?? 0,
                  charInterval: new CharInterval({ startPos: 0, endPos: 1 }),
                  tokenInterval: { startIndex: 0, endIndex: 1 }
                })
            )
          )
      })

      const promptValidatorLayer = Layer.provide(
        PromptValidator.DefaultWithoutDependencies,
        [Layer.succeed(Resolver, resolverStub)]
      )

      const validate = Effect.gen(function* () {
        const validator = yield* PromptValidator
        return yield* validator.validatePromptAlignment([
          new ExampleData({
            text: "Alice visited Paris.",
            extractions: [
              new Extraction({
                extractionClass: "person",
                extractionText: "Alice"
              })
            ]
          })
        ])
      }).pipe(Effect.provide(promptValidatorLayer))

      const first = yield* validate
      const second = yield* validate

      expect(first.issues.length).toBe(1)
      expect(first.issues[0]?.issueKind).toBe("non_exact")
      expect(second.issues).toEqual(first.issues)
    })
  )

  it.effect("stateful testLayer factories create fresh deterministic instances", () =>
    Effect.gen(function* () {
      const nextDocumentId = Effect.gen(function* () {
        const generator = yield* DocumentIdGenerator
        return yield* generator.next
      })

      const first = yield* nextDocumentId.pipe(
        Effect.provide(DocumentIdGenerator.testLayer())
      )
      const second = yield* nextDocumentId.pipe(
        Effect.provide(DocumentIdGenerator.testLayer())
      )

      expect(first).toBe("doc_00000001")
      expect(second).toBe("doc_00000001")
    })
  )
})
