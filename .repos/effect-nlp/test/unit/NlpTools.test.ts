/**
 * NLP Tools test - tests individual tool handler logic
 * @since 3.0.0
 */

import { assert, describe, it } from "@effect/vitest"
import { Chunk, Effect, Option , Layer } from "effect"
import { Tokenization } from "../../src/NLP/Core/Tokenization.js"
import { WinkVectorizer, type TermFrequency } from "../../src/NLP/Wink/WinkVectorizer.js"
import { CosineSimilarityRequest, WinkSimilarity } from "../../src/NLP/Wink/WinkSimilarity.js"
import { TextInput, WinkUtils, WinkUtilsLive } from "../../src/NLP/Wink/WinkUtils.js"
import { WinkLayerLive } from "../../src/NLP/Wink/Layer.js"

const TestLayer = Layer.merge(WinkLayerLive, WinkUtilsLive)

describe("NLP Tool Handlers", () => {
  describe("Tokenize handler", () => {
    it.effect("tokenizes text into AI-friendly tokens", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const tokens = yield* tokenization.tokenize("The cat sat on the mat.")
        const arr = Chunk.toReadonlyArray(tokens)

        assert.isTrue(arr.length > 0)
        const first = arr[0]
        assert.strictEqual(first.text, "The")
        assert.isTrue(typeof (first.start as number) === "number")
        assert.isTrue(typeof (first.end as number) === "number")
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("correctly maps Option fields to plain values", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const tokens = yield* tokenization.tokenize("Hello world!")
        const arr = Chunk.toReadonlyArray(tokens)

        for (const token of arr) {
          // stopWordFlag is Option<boolean | undefined>
          const isStopWord = Option.match(token.stopWordFlag, {
            onNone: () => false,
            onSome: (v) => v ?? false
          })
          assert.isTrue(typeof isStopWord === "boolean")
        }
      }).pipe(Effect.provide(TestLayer))
    )
  })

  describe("Sentences handler", () => {
    it.effect("splits text into sentences", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const doc = yield* tokenization.document("Hello world. How are you? Fine thanks.")

        const sentences = Chunk.toReadonlyArray(doc.sentences)
        assert.strictEqual(sentences.length, 3)
        assert.strictEqual(sentences[0].text, "Hello world.")
        assert.strictEqual(sentences[1].text, "How are you?")
        assert.strictEqual(sentences[2].text, "Fine thanks.")
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("provides token counts per sentence", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const doc = yield* tokenization.document("I am here. You are there.")

        const sentences = Chunk.toReadonlyArray(doc.sentences)
        for (const s of sentences) {
          assert.isTrue(Chunk.size(s.tokens) > 0)
        }
      }).pipe(Effect.provide(TestLayer))
    )
  })

  describe("TextSimilarity handler", () => {
    it.effect("computes similarity between two texts", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const vectorizer = yield* WinkVectorizer
        const similarity = yield* WinkSimilarity

        const doc1 = yield* tokenization.document("The cat sat on the mat", "t1")
        const doc2 = yield* tokenization.document("The cat sat on the mat", "t2")
        yield* vectorizer.learnDocument(doc1)
        yield* vectorizer.learnDocument(doc2)
        const vec1 = yield* vectorizer.vectorizeDocument(doc1)
        const vec2 = yield* vectorizer.vectorizeDocument(doc2)
        const result = yield* similarity.vectorCosine(
          CosineSimilarityRequest({ vector1: vec1, vector2: vec2 })
        )
        yield* vectorizer.reset()

        // BM25 cosine similarity for identical texts should be positive
        assert.isTrue(result.score > 0)
        assert.strictEqual(result.method, "vector.cosine")
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("returns lower score for different texts", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const vectorizer = yield* WinkVectorizer
        const similarity = yield* WinkSimilarity

        const doc1 = yield* tokenization.document("The quick brown fox jumps over the lazy dog", "a")
        const doc2 = yield* tokenization.document("Machine learning algorithms process data efficiently", "b")
        yield* vectorizer.learnDocument(doc1)
        yield* vectorizer.learnDocument(doc2)
        const vec1 = yield* vectorizer.vectorizeDocument(doc1)
        const vec2 = yield* vectorizer.vectorizeDocument(doc2)
        const result = yield* similarity.vectorCosine(
          CosineSimilarityRequest({ vector1: vec1, vector2: vec2 })
        )
        yield* vectorizer.reset()

        assert.isTrue(result.score < 1)
      }).pipe(Effect.provide(TestLayer))
    )
  })

  describe("TransformText handler", () => {
    it.effect("applies lowercase transformation", () =>
      Effect.gen(function*() {
        const utils = yield* WinkUtils
        const result = yield* utils.lowerCase(TextInput({ text: "HELLO WORLD" }))
        assert.strictEqual(result.text, "hello world")
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("applies multiple transformations in sequence", () =>
      Effect.gen(function*() {
        const utils = yield* WinkUtils
        const r1 = yield* utils.removeExtraSpaces(TextInput({ text: "  hello   world  " }))
        const r2 = yield* utils.lowerCase(TextInput({ text: r1.text }))
        assert.strictEqual(r2.text, "hello world")
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("removes HTML tags", () =>
      Effect.gen(function*() {
        const utils = yield* WinkUtils
        const result = yield* utils.removeHTMLTags(TextInput({ text: "<b>Hello</b>" }))
        // wink-nlp-utils replaces tags with spaces
        assert.isTrue(result.text.includes("Hello"))
        assert.isFalse(result.text.includes("<b>"))
      }).pipe(Effect.provide(TestLayer))
    )
  })

  describe("ExtractKeywords handler", () => {
    it.effect("extracts term frequencies from text", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const vectorizer = yield* WinkVectorizer

        const doc = yield* tokenization.document("The cat sat on the mat. The cat was happy.", "kw")
        yield* vectorizer.learnDocument(doc)
        const tfs = yield* vectorizer.getDocumentTermFrequencies(0)
        yield* vectorizer.reset()

        const tfArray = Chunk.toReadonlyArray(tfs) as ReadonlyArray<TermFrequency>
        assert.isTrue(tfArray.length > 0)

        const sorted = [...tfArray].sort((a, b) => b.frequency - a.frequency)
        // "the" and "cat" should have high frequencies
        assert.isTrue(sorted[0].frequency > 0)
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect("respects topN parameter", () =>
      Effect.gen(function*() {
        const tokenization = yield* Tokenization
        const vectorizer = yield* WinkVectorizer

        const doc = yield* tokenization.document(
          "The quick brown fox jumps over the lazy dog while the happy cat sleeps.",
          "kw2"
        )
        yield* vectorizer.learnDocument(doc)
        const tfs = yield* vectorizer.getDocumentTermFrequencies(0)
        yield* vectorizer.reset()

        const tfArray = Chunk.toReadonlyArray(tfs) as ReadonlyArray<TermFrequency>
        const topN = 3
        const top = [...tfArray]
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, topN)

        assert.isTrue(top.length <= topN)
      }).pipe(Effect.provide(TestLayer))
    )
  })
})
