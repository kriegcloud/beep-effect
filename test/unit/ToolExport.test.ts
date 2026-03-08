/**
 * ToolExport adapter tests — verifies exported tool structure, positional arg
 * handling, schema richness, and error handling.
 * @since 3.0.0
 */

import { assert, describe, it } from "@effect/vitest"
import { Effect, Exit } from "effect"
import {
  type ExportedTool,
  exportTools as exportToolsEffect
} from "../../src/NLP/Tools/ToolExport.js"

const EXPECTED_TOOL_NAMES = [
  "BowCosineSimilarity",
  "ChunkBySentences",
  "CorpusStats",
  "CreateCorpus",
  "DeleteCorpus",
  "DocumentStats",
  "ExtractEntities",
  "ExtractKeywords",
  "LearnCorpus",
  "LearnCustomEntities",
  "NGrams",
  "PhoneticMatch",
  "QueryCorpus",
  "RankByRelevance",
  "Sentences",
  "TextSimilarity",
  "Tokenize",
  "TransformText",
  "TverskySimilarity"
]

// Avoid repeatedly constructing Wink layers in each test case.
const exportTools = Effect.succeed(Effect.runSync(exportToolsEffect))

describe("ToolExport", () => {
  it.effect("exports all 19 tools", () =>
    Effect.gen(function*() {
      const tools = yield* exportTools
      const names = tools.map((t) => t.name).slice().sort()
      assert.deepStrictEqual(names, EXPECTED_TOOL_NAMES)
    })
  )

  it.effect("each tool has the full ExportedTool contract", () =>
    Effect.gen(function*() {
      const tools = yield* exportTools
      for (const tool of tools) {
        assert.isTrue(typeof tool.name === "string" && tool.name.length > 0)
        assert.isTrue(
          typeof tool.description === "string" && tool.description.length > 0
        )
        assert.isTrue(Array.isArray(tool.parameterNames))
        assert.isTrue(tool.parameterNames.length > 0)
        assert.isTrue(
          typeof tool.parametersJsonSchema === "object" &&
            tool.parametersJsonSchema !== null
        )
        assert.isTrue(
          typeof tool.returnsJsonSchema === "object" &&
            tool.returnsJsonSchema !== null
        )
        assert.isTrue(Array.isArray(tool.usageExamples))
        assert.isTrue(tool.usageExamples.length > 0)
        assert.isTrue(typeof tool.timeoutMs === "number" && tool.timeoutMs > 0)
        assert.isTrue(typeof tool.handle === "function")
      }
    })
  )

  describe("positional arg handling", () => {
    it.effect("Tokenize handles positional string arg", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const tokenize = findTool(tools, "Tokenize")
        assert.deepStrictEqual(tokenize.parameterNames, ["text"])
        const result = yield* tokenize.handle(["Hello world"])
        assertIsObject(result)
        const r = result as { tokens: Array<unknown>; tokenCount: number }
        assert.strictEqual(r.tokenCount, 2)
        assert.strictEqual(r.tokens.length, 2)
      })
    )

    it.effect("Sentences handles positional string arg", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const sentences = findTool(tools, "Sentences")
        const result = yield* sentences.handle([
          "Hello world. How are you?"
        ])
        assertIsObject(result)
        const r = result as {
          sentences: Array<unknown>
          sentenceCount: number
        }
        assert.strictEqual(r.sentenceCount, 2)
      })
    )

    it.effect("DocumentStats handles positional string arg", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const stats = findTool(tools, "DocumentStats")
        assert.deepStrictEqual(stats.parameterNames, ["text"])
        const result = yield* stats.handle(["Hello world. How are you?"])
        assertIsObject(result)
        const r = result as {
          wordCount: number
          sentenceCount: number
          avgSentenceLength: number
          charCount: number
        }
        assert.strictEqual(r.wordCount, 5)
        assert.strictEqual(r.sentenceCount, 2)
        assert.isTrue(r.avgSentenceLength > 0)
        assert.strictEqual(typeof r.charCount, "number")
      })
    )

    it.effect("ChunkBySentences handles text + maxChunkChars positional args", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const chunk = findTool(tools, "ChunkBySentences")
        assert.deepStrictEqual(chunk.parameterNames, ["text", "maxChunkChars"])
        const result = yield* chunk.handle([
          "One two three. Four five six. Seven eight nine.",
          20
        ])
        assertIsObject(result)
        const r = result as {
          chunks: Array<{ text: string; sentenceCount: number }>
          chunkCount: number
          originalSentenceCount: number
        }
        assert.strictEqual(r.chunkCount, 3)
        assert.strictEqual(r.originalSentenceCount, 3)
        assert.strictEqual(r.chunks.length, 3)
      })
    )

    it.effect("CreateCorpus handles optional positional corpusId and config", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const createCorpus = findTool(tools, "CreateCorpus")
        assert.deepStrictEqual(createCorpus.parameterNames, [
          "corpusId",
          "bm25Config"
        ])

        const result = yield* createCorpus.handle([
          "export-corpus",
          { k1: 1.4, b: 0.7, k: 1, norm: "none" }
        ])
        assertIsObject(result)
        const r = result as {
          corpusId: string
          documentCount: number
          vocabularySize: number
          config: { k1: number; b: number; k: number; norm: string }
        }
        assert.strictEqual(r.corpusId, "export-corpus")
        assert.strictEqual(r.documentCount, 0)
        assert.strictEqual(r.vocabularySize, 0)
        assert.strictEqual(r.config.k1, 1.4)
      })
    )

    it.effect("LearnCorpus, QueryCorpus, and CorpusStats handle positional args", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const createCorpus = findTool(tools, "CreateCorpus")
        const learnCorpus = findTool(tools, "LearnCorpus")
        const queryCorpus = findTool(tools, "QueryCorpus")
        const corpusStats = findTool(tools, "CorpusStats")

        assert.deepStrictEqual(learnCorpus.parameterNames, [
          "corpusId",
          "documents",
          "dedupeById"
        ])
        assert.deepStrictEqual(queryCorpus.parameterNames, [
          "corpusId",
          "query",
          "topN",
          "includeText"
        ])
        assert.deepStrictEqual(corpusStats.parameterNames, [
          "corpusId",
          "includeIdf",
          "includeMatrix",
          "topIdfTerms"
        ])

        const created = yield* createCorpus.handle(["query-corpus"])
        assertIsObject(created)
        const corpusId = (created as { corpusId: string }).corpusId

        const learned = yield* learnCorpus.handle([
          corpusId,
          [
            { id: "lc-1", text: "Cats purr softly in calm rooms." },
            { id: "lc-2", text: "Dogs bark loudly near doors." }
          ],
          true
        ])
        assertIsObject(learned)
        const learnedResult = learned as { learnedCount: number; totalDocuments: number }
        assert.strictEqual(learnedResult.learnedCount, 2)
        assert.strictEqual(learnedResult.totalDocuments, 2)

        const queried = yield* queryCorpus.handle([corpusId, "cats purr", 2, true])
        assertIsObject(queried)
        const queryResult = queried as {
          ranked: Array<{ id: string }>
          returned: number
        }
        assert.strictEqual(queryResult.returned, 2)
        assert.strictEqual(queryResult.ranked[0]?.id, "lc-1")

        const stats = yield* corpusStats.handle([corpusId, true, true, 5])
        assertIsObject(stats)
        const statsResult = stats as {
          totalDocuments: number
          idfValues: Array<unknown>
          matrixShape: { rows: number; cols: number }
          terms: Array<string>
        }
        assert.strictEqual(statsResult.totalDocuments, 2)
        assert.isTrue(statsResult.idfValues.length > 0)
        assert.strictEqual(statsResult.matrixShape.rows, 2)
        assert.strictEqual(statsResult.matrixShape.cols, statsResult.terms.length)
      })
    )

    it.effect("LearnCustomEntities handles positional args", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const learnCustomEntities = findTool(tools, "LearnCustomEntities")
        const extractEntities = findTool(tools, "ExtractEntities")

        assert.deepStrictEqual(learnCustomEntities.parameterNames, [
          "groupName",
          "mode",
          "entities"
        ])

        const learned = yield* learnCustomEntities.handle([
          "export-custom-entities",
          "replace",
          [
            {
              name: "PERSON_NAME",
              patterns: ["[PROPN]", "[PROPN]"]
            }
          ]
        ])
        assertIsObject(learned)
        const learnedResult = learned as {
          mode: string
          learnedEntityCount: number
          totalEntityCount: number
          entityNames: Array<string>
        }
        assert.strictEqual(learnedResult.mode, "replace")
        assert.strictEqual(learnedResult.learnedEntityCount, 1)
        assert.isTrue(learnedResult.totalEntityCount >= 1)
        assert.isTrue(learnedResult.entityNames.includes("PERSON_NAME"))

        const extracted = yield* extractEntities.handle([
          "John Doe met Jane Roe yesterday.",
          true
        ])
        assertIsObject(extracted)
        const extractedResult = extracted as {
          customEntityCount: number
          customEntityTypes: Array<string>
        }
        assert.isTrue(extractedResult.customEntityCount >= 1)
        assert.isTrue(extractedResult.customEntityTypes.includes("PERSON_NAME"))
      })
    )

    it.effect("DeleteCorpus handles positional corpusId arg", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const createCorpus = findTool(tools, "CreateCorpus")
        const deleteCorpus = findTool(tools, "DeleteCorpus")
        assert.deepStrictEqual(deleteCorpus.parameterNames, ["corpusId"])

        const created = yield* createCorpus.handle(["delete-corpus"])
        assertIsObject(created)
        const corpusId = (created as { corpusId: string }).corpusId

        const deleted = yield* deleteCorpus.handle([corpusId])
        assertIsObject(deleted)
        const deletedResult = deleted as { deleted: boolean }
        assert.isTrue(deletedResult.deleted)
      })
    )

    it.effect(
      "ExtractKeywords succeeds with omitted optional topN",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const extract = findTool(tools, "ExtractKeywords")
          assert.deepStrictEqual(extract.parameterNames, ["text", "topN"])
          const result = yield* extract.handle([
            "The cat sat on the mat. The cat was happy."
          ])
          assertIsObject(result)
          const r = result as { keywords: Array<unknown> }
          assert.isTrue(r.keywords.length > 0)
        })
    )

    it.effect("ExtractKeywords respects positional topN", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const extract = findTool(tools, "ExtractKeywords")
        const result = yield* extract.handle([
          "The quick brown fox jumps over the lazy dog while the happy cat sleeps.",
          3
        ])
        assertIsObject(result)
        const r = result as { keywords: Array<unknown> }
        assert.isTrue(r.keywords.length <= 3)
      })
    )

    it.effect(
      "TextSimilarity handles two positional string args",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const sim = findTool(tools, "TextSimilarity")
          assert.deepStrictEqual(sim.parameterNames, ["text1", "text2"])
          const result = yield* sim.handle([
            "The cat sat on the mat",
            "The cat sat on the mat"
          ])
          assertIsObject(result)
          const r = result as { score: number; method: string }
          assert.isTrue(r.score > 0)
          assert.strictEqual(r.method, "vector.cosine")
        })
    )

    it.effect(
      "BowCosineSimilarity handles two positional string args",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const sim = findTool(tools, "BowCosineSimilarity")
          assert.deepStrictEqual(sim.parameterNames, ["text1", "text2"])
          const result = yield* sim.handle([
            "The cat sat on the mat",
            "The cat sat on the mat"
          ])
          assertIsObject(result)
          const r = result as { score: number; method: string }
          assert.isTrue(r.score > 0)
          assert.isTrue(r.score <= 1)
          assert.strictEqual(r.method, "bow.cosine")
        })
    )

    it.effect(
      "TverskySimilarity handles positional args with defaults and asymmetry controls",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const sim = findTool(tools, "TverskySimilarity")
          assert.deepStrictEqual(sim.parameterNames, [
            "text1",
            "text2",
            "alpha",
            "beta"
          ])

          const defaultResult = yield* sim.handle([
            "alpha beta gamma",
            "alpha beta"
          ])
          assertIsObject(defaultResult)
          const d = defaultResult as {
            score: number
            method: string
            alpha: number
            beta: number
          }
          assert.strictEqual(d.method, "set.tversky")
          assert.strictEqual(d.alpha, 0.5)
          assert.strictEqual(d.beta, 0.5)
          assert.isTrue(d.score >= 0)
          assert.isTrue(d.score <= 1)

          const forward = yield* sim.handle([
            "alpha beta gamma",
            "alpha beta",
            0.8,
            0.2
          ])
          const reverse = yield* sim.handle([
            "alpha beta",
            "alpha beta gamma",
            0.8,
            0.2
          ])
          assertIsObject(forward)
          assertIsObject(reverse)
          const f = forward as { score: number }
          const r = reverse as { score: number }
          assert.isTrue(r.score > f.score)
        })
    )

    it.effect("NGrams handles positional args and deterministic ordering", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const ngrams = findTool(tools, "NGrams")
        assert.deepStrictEqual(ngrams.parameterNames, [
          "text",
          "size",
          "mode",
          "topN"
        ])
        const result = yield* ngrams.handle(["banana", 2, "bag", 2])
        assertIsObject(result)
        const r = result as {
          mode: string
          size: number
          ngrams: Array<{ value: string; count: number }>
          totalNGrams: number
          uniqueNGrams: number
        }
        assert.strictEqual(r.mode, "bag")
        assert.strictEqual(r.size, 2)
        assert.strictEqual(r.totalNGrams, 5)
        assert.strictEqual(r.uniqueNGrams, 3)
        assert.deepStrictEqual(r.ngrams, [
          { value: "an", count: 2 },
          { value: "na", count: 2 }
        ])
      })
    )

    it.effect(
      "PhoneticMatch handles positional args and returns phonetic overlap",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const phonetic = findTool(tools, "PhoneticMatch")
          assert.deepStrictEqual(phonetic.parameterNames, [
            "text1",
            "text2",
            "algorithm",
            "minTokenLength"
          ])
          const result = yield* phonetic.handle([
            "Stephen Hawking",
            "Steven Hocking",
            "soundex",
            2
          ])
          assertIsObject(result)
          const r = result as {
            algorithm: string
            score: number
            sharedCodes: Array<string>
            leftCodes: Array<string>
            rightCodes: Array<string>
          }
          assert.strictEqual(r.algorithm, "soundex")
          assert.isTrue(r.score > 0)
          assert.isTrue(r.score <= 1)
          assert.isTrue(r.sharedCodes.length > 0)
          assert.deepStrictEqual(
            [...r.sharedCodes].sort((a, b) => a.localeCompare(b)),
            r.sharedCodes
          )
          assert.deepStrictEqual(
            [...r.leftCodes].sort((a, b) => a.localeCompare(b)),
            r.leftCodes
          )
          assert.deepStrictEqual(
            [...r.rightCodes].sort((a, b) => a.localeCompare(b)),
            r.rightCodes
          )
        })
    )

    it.effect("ExtractEntities handles positional string arg", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const extractEntities = findTool(tools, "ExtractEntities")
        assert.deepStrictEqual(extractEntities.parameterNames, [
          "text",
          "includeCustom"
        ])
        const result = yield* extractEntities.handle([
          "Email john@example.com by 2026-01-15."
        ])
        assertIsObject(result)
        const r = result as {
          entities: Array<{
            value: string
            type: string
            start: number
            end: number
          }>
          entityCount: number
          entityTypes: Array<string>
          customEntities: Array<{
            source?: string
          }>
          customEntityCount: number
          customEntityTypes: Array<string>
          allEntities: Array<{
            source?: string
          }>
          allEntityCount: number
        }
        assert.strictEqual(r.entityCount, r.entities.length)
        for (const entity of r.entities) {
          assert.isTrue(entity.value.length > 0)
          assert.isTrue(entity.type.length > 0)
          assert.isTrue(entity.end >= entity.start)
        }
        assert.isTrue(Array.isArray(r.entityTypes))
        assert.isTrue(Array.isArray(r.customEntities))
        assert.strictEqual(r.customEntityCount, r.customEntities.length)
        assert.isTrue(Array.isArray(r.customEntityTypes))
        assert.isTrue(Array.isArray(r.allEntities))
        assert.strictEqual(r.allEntityCount, r.allEntities.length)
      })
    )

    it.effect(
      "TransformText handles text + operations array",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const transform = findTool(tools, "TransformText")
          assert.deepStrictEqual(transform.parameterNames, [
            "text",
            "operations"
          ])
          const result = yield* transform.handle([
            "HELLO WORLD",
            ["lowercase"]
          ])
          assertIsObject(result)
          const r = result as {
            result: string
            operationsApplied: Array<string>
          }
          assert.strictEqual(r.result, "hello world")
          assert.deepStrictEqual(r.operationsApplied, ["lowercase"])
        })
    )

    it.effect("RankByRelevance handles texts + query + optional topN", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const rank = findTool(tools, "RankByRelevance")
        assert.deepStrictEqual(rank.parameterNames, ["texts", "query", "topN"])
        const result = yield* rank.handle([
          [
            "Cats purr and meow softly.",
            "Felines are playful companions.",
            "Quantum computing uses qubits."
          ],
          "cats and felines",
          2
        ])
        assertIsObject(result)
        const r = result as {
          ranked: Array<{ index: number; score: number }>
          totalTexts: number
          returned: number
        }
        assert.strictEqual(r.totalTexts, 3)
        assert.strictEqual(r.returned, 2)
        assert.isTrue(r.ranked.length <= 2)
        assert.isTrue(r.ranked.every((entry) => entry.index >= 0 && entry.index < 3))
      })
    )
  })

  describe("invalid arg handling", () => {
    it.effect(
      "Tokenize returns ExportedToolError for number input",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const tokenize = findTool(tools, "Tokenize")
          const exit = yield* Effect.exit(tokenize.handle([123]))
          assert.isTrue(Exit.isFailure(exit))
          if (Exit.isFailure(exit)) {
            const error = exit.cause
            assert.isTrue(
              String(error).includes("ExportedToolError")
            )
          }
        })
    )

    it.effect(
      "TransformText returns ExportedToolError for invalid operations",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const transform = findTool(tools, "TransformText")
          const exit = yield* Effect.exit(
            transform.handle(["hello", ["invalidOp"]])
          )
          assert.isTrue(Exit.isFailure(exit))
        })
    )
  })

  describe("JSON schema richness", () => {
    it.effect(
      "parametersJsonSchema contains description and examples",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const tokenize = findTool(tools, "Tokenize")
          const schema = tokenize.parametersJsonSchema as Record<
            string,
            unknown
          >
          assert.strictEqual(schema["type"], "object")
          const props = schema["properties"] as Record<
            string,
            Record<string, unknown>
          >
          assert.isTrue("text" in props)
          assert.isTrue(typeof props["text"]["description"] === "string")
          assert.isTrue(Array.isArray(props["text"]["examples"]))
        })
    )

    it.effect("returnsJsonSchema has expected structure", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        const tokenize = findTool(tools, "Tokenize")
        const schema = tokenize.returnsJsonSchema as Record<
          string,
          unknown
        >
        assert.strictEqual(schema["type"], "object")
        const props = schema["properties"] as Record<string, unknown>
        assert.isTrue("tokens" in props)
        assert.isTrue("tokenCount" in props)
      })
    )

    it.effect(
      "ExtractKeywords parametersJsonSchema includes optional topN with default and examples",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const extract = findTool(tools, "ExtractKeywords")
          const schema = extract.parametersJsonSchema as Record<
            string,
            unknown
          >
          const props = schema["properties"] as Record<
            string,
            Record<string, unknown>
          >
          assert.isTrue("topN" in props)
          assert.strictEqual(props["topN"]["default"], 10)
          assert.isTrue(Array.isArray(props["topN"]["examples"]))
        })
    )

    it.effect(
      "schema annotations include title on output schemas",
      () =>
        Effect.gen(function*() {
          const tools = yield* exportTools
          const tokenize = findTool(tools, "Tokenize")
          const schema = tokenize.returnsJsonSchema as Record<
            string,
            unknown
          >
          const props = schema["properties"] as Record<
            string,
            Record<string, unknown>
          >
          const tokensSchema = props["tokens"] as Record<string, unknown>
          const itemsSchema = tokensSchema["items"] as Record<
            string,
            unknown
          >
          assert.strictEqual(itemsSchema["title"], "Token")
        })
    )
  })

  describe("usage examples", () => {
    it.effect("each tool has at least one usage example", () =>
      Effect.gen(function*() {
        const tools = yield* exportTools
        for (const tool of tools) {
          assert.isTrue(
            tool.usageExamples.length >= 1,
            `${tool.name} should have usage examples`
          )
          for (const ex of tool.usageExamples) {
            assert.isTrue(
              typeof ex === "string" && ex.length > 0,
              `${tool.name} usage example should be a non-empty string`
            )
          }
        }
      })
    )
  })
})

function findTool(
  tools: ReadonlyArray<ExportedTool>,
  name: string
): ExportedTool {
  const tool = tools.find((t) => t.name === name)
  if (!tool) throw new Error(`Tool "${name}" not found`)
  return tool
}

function assertIsObject(value: unknown): asserts value is object {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Expected object, got ${typeof value}`)
  }
}
