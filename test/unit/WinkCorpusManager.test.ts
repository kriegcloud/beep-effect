import { assert, describe, it } from "@effect/vitest"
import { Chunk, Effect } from "effect"
import { Tokenization } from "../../src/NLP/Core/Tokenization.js"
import { WinkLayerLive } from "../../src/NLP/Wink/Layer.js"
import { WinkCorpusManager } from "../../src/NLP/Wink/WinkCorpusManager.js"

describe("WinkCorpusManager", () => {
  it.effect("creates a corpus and supports incremental learning/querying", () =>
    Effect.gen(function*() {
      const corpusManager = yield* WinkCorpusManager
      const tokenization = yield* Tokenization

      const created = yield* corpusManager.createCorpus({
        corpusId: "animals-corpus"
      })
      assert.strictEqual(created.corpusId, "animals-corpus")
      assert.strictEqual(created.documentCount, 0)
      assert.strictEqual(created.vocabularySize, 0)

      const doc1 = yield* tokenization.document("Cats purr softly.", "doc-1")
      const doc2 = yield* tokenization.document("Dogs bark loudly.", "doc-2")

      const learn1 = yield* corpusManager.learnDocuments({
        corpusId: created.corpusId,
        documents: Chunk.make(doc1)
      })
      assert.strictEqual(learn1.learnedCount, 1)
      assert.strictEqual(learn1.totalDocuments, 1)

      const learn2 = yield* corpusManager.learnDocuments({
        corpusId: created.corpusId,
        documents: Chunk.make(doc2)
      })
      assert.strictEqual(learn2.learnedCount, 1)
      assert.strictEqual(learn2.totalDocuments, 2)

      const query = yield* corpusManager.query({
        corpusId: created.corpusId,
        query: "cats purr",
        topN: 2
      })

      assert.strictEqual(query.totalDocuments, 2)
      assert.strictEqual(query.returned, 2)
      assert.strictEqual(query.ranked[0]?.id, "doc-1")
      assert.isTrue(query.ranked[0]?.score !== undefined)
      assert.isTrue((query.ranked[0]?.score ?? 0) >= (query.ranked[1]?.score ?? 0))
    }).pipe(Effect.provide(WinkLayerLive))
  )

  it.effect("dedupes by id by default and allows duplicates when disabled", () =>
    Effect.gen(function*() {
      const corpusManager = yield* WinkCorpusManager
      const tokenization = yield* Tokenization

      const created = yield* corpusManager.createCorpus({
        corpusId: "dedupe-corpus"
      })

      const duplicated = yield* tokenization.document(
        "Duplicate document content.",
        "dup-1"
      )

      const dedupedLearn = yield* corpusManager.learnDocuments({
        corpusId: created.corpusId,
        documents: Chunk.make(duplicated, duplicated)
      })

      assert.strictEqual(dedupedLearn.learnedCount, 1)
      assert.strictEqual(dedupedLearn.skippedCount, 1)
      assert.strictEqual(dedupedLearn.totalDocuments, 1)

      const noDedupeLearn = yield* corpusManager.learnDocuments({
        corpusId: created.corpusId,
        documents: Chunk.make(duplicated),
        dedupeById: false
      })

      assert.strictEqual(noDedupeLearn.learnedCount, 1)
      assert.strictEqual(noDedupeLearn.skippedCount, 0)
      assert.strictEqual(noDedupeLearn.totalDocuments, 2)
    }).pipe(Effect.provide(WinkLayerLive))
  )

  it.effect("returns idf and matrix stats for a learned corpus", () =>
    Effect.gen(function*() {
      const corpusManager = yield* WinkCorpusManager
      const tokenization = yield* Tokenization

      const created = yield* corpusManager.createCorpus({
        corpusId: "stats-corpus"
      })
      const doc1 = yield* tokenization.document(
        "Machine learning models process data.",
        "stats-1"
      )
      const doc2 = yield* tokenization.document(
        "Learning systems optimize model weights.",
        "stats-2"
      )

      yield* corpusManager.learnDocuments({
        corpusId: created.corpusId,
        documents: Chunk.make(doc1, doc2)
      })

      const stats = yield* corpusManager.getStats({
        corpusId: created.corpusId,
        includeIdf: true,
        includeMatrix: true,
        topIdfTerms: 8
      })

      assert.strictEqual(stats.totalDocuments, 2)
      assert.isTrue(stats.vocabularySize > 0)
      assert.isTrue(stats.averageDocumentLength > 0)
      assert.isTrue(stats.terms.length > 0)
      assert.isTrue(stats.idfValues.length > 0)
      assert.isTrue(stats.idfValues.length <= 8)
      assert.strictEqual(stats.documentTermMatrix.length, 2)
      assert.strictEqual(stats.matrixShape.rows, 2)
      assert.strictEqual(stats.matrixShape.cols, stats.terms.length)
    }).pipe(Effect.provide(WinkLayerLive))
  )

  it.effect("returns a corpus manager error when querying a deleted corpus", () =>
    Effect.gen(function*() {
      const corpusManager = yield* WinkCorpusManager

      const created = yield* corpusManager.createCorpus({
        corpusId: "delete-corpus"
      })

      const deleted = yield* corpusManager.deleteCorpus(created.corpusId)
      assert.isTrue(deleted)

      const deletedAgain = yield* corpusManager.deleteCorpus(created.corpusId)
      assert.isFalse(deletedAgain)

      const error = yield* corpusManager.query({
        corpusId: created.corpusId,
        query: "should fail"
      }).pipe(Effect.flip)

      assert.strictEqual(error._tag, "CorpusManagerError")
      assert.isTrue(error.message.includes("does not exist"))
      assert.strictEqual(error.corpusId, created.corpusId)
    }).pipe(Effect.provide(WinkLayerLive))
  )

  it.effect("serializes concurrent learning for a shared corpus", () =>
    Effect.gen(function*() {
      const corpusManager = yield* WinkCorpusManager
      const tokenization = yield* Tokenization

      const created = yield* corpusManager.createCorpus({
        corpusId: "concurrency-corpus"
      })

      const docs = yield* Effect.forEach(
        Array.from({ length: 12 }, (_, index) => index),
        (index) =>
          tokenization.document(
            `Shared corpus document ${index} includes cats and dogs.`,
            `concurrent-${index}`
          )
      )

      yield* Effect.all(
        docs.map((document) =>
          corpusManager.learnDocuments({
            corpusId: created.corpusId,
            documents: Chunk.make(document)
          })
        ),
        { concurrency: "unbounded" }
      )

      const stats = yield* corpusManager.getStats({
        corpusId: created.corpusId
      })
      assert.strictEqual(stats.totalDocuments, 12)

      const query = yield* corpusManager.query({
        corpusId: created.corpusId,
        query: "cats dogs",
        topN: 5
      })
      assert.strictEqual(query.returned, 5)
      assert.strictEqual(query.totalDocuments, 12)
    }).pipe(Effect.provide(WinkLayerLive))
  )
})
