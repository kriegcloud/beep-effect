/**
 * Property-based tests for NLP AI Tools
 * Uses Effect's FastCheck/Arbitrary to verify tool handler invariants
 * @since 3.0.0
 */

import { afterAll, beforeAll, describe, it } from "vitest"
import { Arbitrary, Cause, Effect, Exit, FastCheck, Layer, ManagedRuntime, Schema } from "effect"
import {
  NlpToolkit,
  NlpToolkitLive
} from "../../src/NLP/Tools/NlpToolkit.js"

// Shared runtime — avoids WinkEngine memory limit by reusing a single instance
// Use Layer.orDie to convert construction errors to defects
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

const runToolkit = async <A>(
  f: (
    toolkit: Effect.Effect.Success<typeof NlpToolkit>
  ) => Effect.Effect<A, unknown, Effect.Effect.Context<typeof NlpToolkit>>
) =>
  runtime.runPromise(
    Effect.gen(function*() {
      const toolkit = yield* NlpToolkit
      return yield* f(toolkit)
    })
  )

// Generators
const NonEmptyTextSchema = Schema.String.pipe(
  Schema.minLength(1),
  Schema.maxLength(200),
  Schema.pattern(/^[a-zA-Z0-9\s.,!?;:'"()-]+$/)
)

const SentenceTextSchema = Schema.String.pipe(
  Schema.minLength(5),
  Schema.maxLength(200),
  Schema.pattern(/^[A-Z][a-zA-Z0-9\s,;:'"()-]*[.!?](\s+[A-Z][a-zA-Z0-9\s,;:'"()-]*[.!?])*$/)
)

const WordsTextSchema = Schema.String.pipe(
  Schema.minLength(3),
  Schema.maxLength(300),
  Schema.pattern(/^[a-zA-Z]+(\s+[a-zA-Z]+)+$/)
)

const TopNSchema = Schema.Int.pipe(Schema.between(1, 20))

const OperationSchema = Schema.Literal(
  "lowercase",
  "uppercase",
  "trim",
  "removePunctuation",
  "removeExtraSpaces",
  "removeSpecialChars",
  "retainAlphaNums",
  "removeElisions"
)

describe("NLP Tools Property Tests", () => {
  describe("Tokenize invariants", () => {
    it("tokenCount always matches tokens array length", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Tokenize", { text })
              return r.result
            })
          )
          return result.tokenCount === result.tokens.length
        }),
        { numRuns: 50 }
      )
    })

    it("produces at least one token for text with word characters", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Tokenize", { text })
              return r.result
            })
          )
          return result.tokenCount > 0
        }),
        { numRuns: 50 }
      )
    })

    it("every token has non-empty text", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Tokenize", { text })
              return r.result
            })
          )
          return result.tokens.every((t) => t.text.length > 0)
        }),
        { numRuns: 50 }
      )
    })

    it("token positions are non-negative and end >= start", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Tokenize", { text })
              return r.result
            })
          )
          return result.tokens.every(
            (t) => t.start >= 0 && t.end >= t.start
          )
        }),
        { numRuns: 50 }
      )
    })

    it("isStopWord and isPunctuation are always booleans", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Tokenize", { text })
              return r.result
            })
          )
          return result.tokens.every(
            (t) =>
              typeof t.isStopWord === "boolean" &&
              typeof t.isPunctuation === "boolean"
          )
        }),
        { numRuns: 50 }
      )
    })

    it("is deterministic - same input produces same output", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const [r1, r2] = await runToolkit((tk) =>
            Effect.gen(function*() {
              const a = yield* tk.handle("Tokenize", { text })
              const b = yield* tk.handle("Tokenize", { text })
              return [a.result, b.result] as const
            })
          )
          return (
            r1.tokenCount === r2.tokenCount &&
            r1.tokens.every((t, i) => t.text === r2.tokens[i].text)
          )
        }),
        { numRuns: 30 }
      )
    })
  })

  describe("Sentences invariants", () => {
    it("sentenceCount matches sentences array length", async () => {
      const textArb = Arbitrary.make(SentenceTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Sentences", { text })
              return r.result
            })
          )
          return result.sentenceCount === result.sentences.length
        }),
        { numRuns: 50 }
      )
    })

    it("each sentence text is a string", async () => {
      const textArb = Arbitrary.make(SentenceTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Sentences", { text })
              return r.result
            })
          )
          return result.sentences.every((s) => typeof s.text === "string")
        }),
        { numRuns: 50 }
      )
    })

    it("each sentence has non-negative token count", async () => {
      const textArb = Arbitrary.make(SentenceTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Sentences", { text })
              return r.result
            })
          )
          return result.sentences.every((s) => s.tokenCount >= 0)
        }),
        { numRuns: 50 }
      )
    })

    it("sentence indices are sequential starting from 0", async () => {
      const textArb = Arbitrary.make(SentenceTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("Sentences", { text })
              return r.result
            })
          )
          return result.sentences.every((s, i) => s.index === i)
        }),
        { numRuns: 50 }
      )
    })
  })

  describe("TextSimilarity invariants", () => {
    it("similarity of text with itself is positive", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TextSimilarity", {
                text1: text,
                text2: text
              })
              return r.result
            })
          )
          return result.score > 0
        }),
        { numRuns: 20 }
      )
    })

    it("score is always a finite number", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, textArb, async (t1, t2) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TextSimilarity", {
                text1: t1,
                text2: t2
              })
              return r.result
            })
          )
          return Number.isFinite(result.score)
        }),
        { numRuns: 20 }
      )
    })

    it("method is always vector.cosine", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, textArb, async (t1, t2) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TextSimilarity", {
                text1: t1,
                text2: t2
              })
              return r.result
            })
          )
          return result.method === "vector.cosine"
        }),
        { numRuns: 20 }
      )
    })
  })

  describe("TransformText invariants", () => {
    it("operationsApplied matches input operations", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)
      const opsArb = FastCheck.array(Arbitrary.make(OperationSchema), {
        minLength: 1,
        maxLength: 4
      })

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, opsArb, async (text, operations) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TransformText", { text, operations })
              return r.result
            })
          )
          return (
            result.operationsApplied.length === operations.length &&
            result.operationsApplied.every((op, i) => op === operations[i])
          )
        }),
        { numRuns: 50 }
      )
    })

    it("lowercase is idempotent", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const [r1, r2] = await runToolkit((tk) =>
            Effect.gen(function*() {
              const a = yield* tk.handle("TransformText", {
                text,
                operations: ["lowercase"]
              })
              const b = yield* tk.handle("TransformText", {
                text: a.result.result,
                operations: ["lowercase"]
              })
              return [a.result, b.result] as const
            })
          )
          return r1.result === r2.result
        }),
        { numRuns: 50 }
      )
    })

    it("uppercase is idempotent", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const [r1, r2] = await runToolkit((tk) =>
            Effect.gen(function*() {
              const a = yield* tk.handle("TransformText", {
                text,
                operations: ["uppercase"]
              })
              const b = yield* tk.handle("TransformText", {
                text: a.result.result,
                operations: ["uppercase"]
              })
              return [a.result, b.result] as const
            })
          )
          return r1.result === r2.result
        }),
        { numRuns: 50 }
      )
    })

    it("trim is idempotent", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const [r1, r2] = await runToolkit((tk) =>
            Effect.gen(function*() {
              const a = yield* tk.handle("TransformText", {
                text,
                operations: ["trim"]
              })
              const b = yield* tk.handle("TransformText", {
                text: a.result.result,
                operations: ["trim"]
              })
              return [a.result, b.result] as const
            })
          )
          return r1.result === r2.result
        }),
        { numRuns: 50 }
      )
    })

    it("lowercase preserves string length", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TransformText", {
                text,
                operations: ["lowercase"]
              })
              return r.result
            })
          )
          return result.result.length === text.length
        }),
        { numRuns: 50 }
      )
    })

    it("empty operations list returns original text", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TransformText", {
                text,
                operations: []
              })
              return r.result
            })
          )
          return result.result === text && result.operationsApplied.length === 0
        }),
        { numRuns: 30 }
      )
    })

    it("result is always a string", async () => {
      const textArb = Arbitrary.make(NonEmptyTextSchema)
      const opsArb = FastCheck.array(Arbitrary.make(OperationSchema), {
        minLength: 0,
        maxLength: 5
      })

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, opsArb, async (text, operations) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("TransformText", { text, operations })
              return r.result
            })
          )
          return typeof result.result === "string"
        }),
        { numRuns: 50 }
      )
    })
  })

  describe("ExtractKeywords invariants", () => {
    it("never returns more keywords than topN", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)
      const topNArb = Arbitrary.make(TopNSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, topNArb, async (text, topN) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("ExtractKeywords", { text, topN })
              return r.result
            })
          )
          return result.keywords.length <= topN
        }),
        { numRuns: 30 }
      )
    })

    it("keywords have non-empty terms", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("ExtractKeywords", { text })
              return r.result
            })
          )
          return result.keywords.every((kw) => kw.term.length > 0)
        }),
        { numRuns: 30 }
      )
    })

    it("keywords have positive scores", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("ExtractKeywords", { text })
              return r.result
            })
          )
          return result.keywords.every((kw) => kw.score > 0)
        }),
        { numRuns: 30 }
      )
    })

    it("keywords are sorted by score descending", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("ExtractKeywords", { text })
              return r.result
            })
          )
          for (let i = 1; i < result.keywords.length; i++) {
            if (result.keywords[i].score > result.keywords[i - 1].score) {
              return false
            }
          }
          return true
        }),
        { numRuns: 30 }
      )
    })

    it("default topN returns at most 10 keywords", async () => {
      const textArb = Arbitrary.make(WordsTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const result = await runToolkit((tk) =>
            Effect.gen(function*() {
              const r = yield* tk.handle("ExtractKeywords", { text })
              return r.result
            })
          )
          return result.keywords.length <= 10
        }),
        { numRuns: 30 }
      )
    })
  })

  describe("Cross-tool invariants", () => {
    it("Tokenize and Sentences produce consistent results for the same text", async () => {
      const textArb = Arbitrary.make(SentenceTextSchema)

      await FastCheck.assert(
        FastCheck.asyncProperty(textArb, async (text) => {
          const [tokens, sentences] = await runToolkit((tk) =>
            Effect.gen(function*() {
              const t = yield* tk.handle("Tokenize", { text })
              const s = yield* tk.handle("Sentences", { text })
              return [t.result, s.result] as const
            })
          )
          // Total tokens from sentences should be related to standalone tokenize count
          const sentenceTokenTotal = sentences.sentences.reduce(
            (sum, s) => sum + s.tokenCount,
            0
          )
          return sentenceTokenTotal <= tokens.tokenCount + sentences.sentenceCount
        }),
        { numRuns: 30 }
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Error resilience — adversarial inputs
  // These tests use unconstrained generators to surface actual errors/defects.
  // Tool handlers use Effect.orDie, so any service error becomes a defect.
  // Since these tools will be called by LLMs, they must succeed on ANY string.
  // Tests assert Exit.isSuccess — failures surface real bugs to fix.
  // ---------------------------------------------------------------------------

  const runToolkitExit = async <A>(
    f: (
      toolkit: Effect.Effect.Success<typeof NlpToolkit>
    ) => Effect.Effect<A, unknown, Effect.Effect.Context<typeof NlpToolkit>>
  ) =>
    runtime.runPromise(
      Effect.gen(function*() {
        const toolkit = yield* NlpToolkit
        return yield* Effect.exit(f(toolkit))
      })
    )

  const exitMessage = (exit: Exit.Exit<unknown, unknown>): string => {
    if (Exit.isFailure(exit)) {
      return Cause.pretty(exit.cause)
    }
    return "unknown"
  }

  describe("Error resilience — adversarial inputs", () => {
    // Multiple generators at increasing levels of adversarial-ness
    const asciiStringArb = FastCheck.string({ minLength: 0, maxLength: 500 })
    const unicodeStringArb = FastCheck.unicodeString({ minLength: 0, maxLength: 500 })
    const fullUnicodeStringArb = FastCheck.fullUnicodeString({ minLength: 0, maxLength: 500 })
    // Mix generators: pick from one of the three at random
    const anyStringArb = FastCheck.oneof(asciiStringArb, unicodeStringArb, fullUnicodeStringArb)

    // Targeted adversarial strings that commonly surface issues
    const adversarialStrings = [
      "",
      " ",
      "   \t\n\r  ",
      "\0",
      "\0\0\0",
      "\x00\x01\x02\x03",
      "\uffff",
      "\ufffe",
      "\ufeff",                  // BOM
      "🎉🚀💻🔥",                // emoji
      "café résumé naïve",       // accented chars
      "中文文本处理测试",           // CJK
      "العربية",                  // RTL
      "שלום",                    // Hebrew
      "👨‍👩‍👧‍👦",                  // ZWJ sequence
      "a".repeat(5000),          // very long single word
      ("word ").repeat(1000),    // many words
      ".".repeat(100),           // all punctuation
      "!?!?!?!?",
      "<script>alert('xss')</script>",
      "Hello\x00World",          // embedded null
      "Line1\nLine2\nLine3",     // newlines
      "Tab\there",               // tab
      "\r\n\r\n\r\n",            // CRLF
      "a b  c   d    e",         // irregular spacing
      "....",
      "Mr. Smith went to Washington. He arrived at 3 p.m. It was nice.",
      "😀".repeat(200),           // many emoji
      "\x00".repeat(100),         // long null byte sequence
      "\t\t\t\t\t",               // only tabs
      "\n".repeat(50),            // only newlines
      "a".repeat(10000),          // very very long single token
      " ".repeat(5000),           // long whitespace-only
      "Hello. ".repeat(500),      // many identical sentences
      "a\u0300\u0301\u0302\u0303\u0304",  // combining diacritical marks
      "\u200b\u200c\u200d\u2060\ufeff",    // zero-width chars
      "test\x1b[31mred\x1b[0m",            // ANSI escape codes
      Array.from({ length: 100 }, (_, i) => String.fromCodePoint(i + 0x4e00)).join(""),  // CJK range
      String.fromCodePoint(0x10000, 0x10001, 0x10002, 0x1f600, 0x1f601)  // supplementary plane
    ]

    describe("Tokenize succeeds on arbitrary input", () => {
      it("succeeds on fully random strings", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("Tokenize", { text })
            )
            if (!Exit.isSuccess(exit)) {
              throw new Error(
                `Tokenize defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
              )
            }
            return true
          }),
          { numRuns: 100 }
        )
      })

      it("succeeds on targeted adversarial strings", async () => {
        for (const text of adversarialStrings) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("Tokenize", { text })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `Tokenize defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
            )
          }
        }
      }, 15_000)

      it("returns valid structure for empty string", async () => {
        const exit = await runToolkitExit((tk) =>
          tk.handle("Tokenize", { text: "" })
        )
        if (!Exit.isSuccess(exit)) {
          throw new Error(`Tokenize defected on empty string: ${exitMessage(exit)}`)
        }
        const result = exit.value.result
        if (result.tokenCount !== result.tokens.length) {
          throw new Error(
            `tokenCount (${result.tokenCount}) !== tokens.length (${result.tokens.length})`
          )
        }
      })
    })

    describe("Sentences succeeds on arbitrary input", () => {
      it("succeeds on fully random strings", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("Sentences", { text })
            )
            if (!Exit.isSuccess(exit)) {
              throw new Error(
                `Sentences defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
              )
            }
            return true
          }),
          { numRuns: 100 }
        )
      })

      it("succeeds on targeted adversarial strings", async () => {
        for (const text of adversarialStrings) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("Sentences", { text })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `Sentences defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
            )
          }
        }
      }, 15_000)

      it("sentenceCount matches array length for any input", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("Sentences", { text })
            )
            if (!Exit.isSuccess(exit)) return true // tested above
            const r = exit.value.result
            return r.sentenceCount === r.sentences.length
          }),
          { numRuns: 100 }
        )
      })
    })

    describe("TextSimilarity succeeds on arbitrary input", () => {
      it("succeeds on random string pairs", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, anyStringArb, async (text1, text2) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("TextSimilarity", { text1, text2 })
            )
            if (!Exit.isSuccess(exit)) {
              throw new Error(
                `TextSimilarity defected on ${JSON.stringify(text1.slice(0, 40))} vs ${JSON.stringify(text2.slice(0, 40))}: ${exitMessage(exit)}`
              )
            }
            return true
          }),
          { numRuns: 50 }
        )
      })

      it("succeeds on adversarial strings vs normal text", async () => {
        for (const text of adversarialStrings) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("TextSimilarity", { text1: text, text2: "baseline text" })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `TextSimilarity defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
            )
          }
        }
      }, 15_000)

      it("empty vs empty succeeds", async () => {
        const exit = await runToolkitExit((tk) =>
          tk.handle("TextSimilarity", { text1: "", text2: "" })
        )
        if (!Exit.isSuccess(exit)) {
          throw new Error(`TextSimilarity defected on empty vs empty: ${exitMessage(exit)}`)
        }
      })

      it("score is always a finite number for any input", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, anyStringArb, async (text1, text2) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("TextSimilarity", { text1, text2 })
            )
            if (!Exit.isSuccess(exit)) return true // tested above
            return Number.isFinite(exit.value.result.score)
          }),
          { numRuns: 50 }
        )
      })
    })

    describe("TransformText succeeds on arbitrary input", () => {
      const allOps = [
        "lowercase",
        "uppercase",
        "trim",
        "removeHtml",
        "removePunctuation",
        "removeExtraSpaces",
        "removeSpecialChars",
        "retainAlphaNums",
        "removeElisions"
      ] as const

      it("each operation succeeds on random strings", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            for (const op of allOps) {
              const exit = await runToolkitExit((tk) =>
                tk.handle("TransformText", { text, operations: [op] })
              )
              if (!Exit.isSuccess(exit)) {
                throw new Error(
                  `TransformText[${op}] defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
                )
              }
            }
            return true
          }),
          { numRuns: 50 }
        )
      })

      it("all operations chained succeed on adversarial strings", async () => {
        for (const text of adversarialStrings) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("TransformText", {
              text,
              operations: [...allOps]
            })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `TransformText[all] defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
            )
          }
        }
      })

      it("all operations chained succeed on random strings", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("TransformText", {
                text,
                operations: [...allOps]
              })
            )
            if (!Exit.isSuccess(exit)) {
              throw new Error(
                `TransformText[all] defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
              )
            }
            return true
          }),
          { numRuns: 50 }
        )
      })

      it("result is always a string", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("TransformText", {
                text,
                operations: [...allOps]
              })
            )
            if (!Exit.isSuccess(exit)) return true // tested above
            return typeof exit.value.result.result === "string"
          }),
          { numRuns: 50 }
        )
      })
    })

    describe("ExtractKeywords succeeds on arbitrary input", () => {
      it("succeeds on fully random strings", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("ExtractKeywords", { text })
            )
            if (!Exit.isSuccess(exit)) {
              throw new Error(
                `ExtractKeywords defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
              )
            }
            return true
          }),
          { numRuns: 50 }
        )
      })

      it("succeeds on targeted adversarial strings", async () => {
        for (const text of adversarialStrings) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("ExtractKeywords", { text })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `ExtractKeywords defected on ${JSON.stringify(text.slice(0, 80))}: ${exitMessage(exit)}`
            )
          }
        }
      }, 15_000)

      it("topN edge cases succeed", async () => {
        const edgeCases = [0, -1, 0.5, 1000, Number.MAX_SAFE_INTEGER]
        for (const topN of edgeCases) {
          const exit = await runToolkitExit((tk) =>
            tk.handle("ExtractKeywords", { text: "some normal text here", topN })
          )
          if (!Exit.isSuccess(exit)) {
            throw new Error(
              `ExtractKeywords defected on topN=${topN}: ${exitMessage(exit)}`
            )
          }
        }
      })

      it("keywords array is valid for any input", async () => {
        await FastCheck.assert(
          FastCheck.asyncProperty(anyStringArb, async (text) => {
            const exit = await runToolkitExit((tk) =>
              tk.handle("ExtractKeywords", { text })
            )
            if (!Exit.isSuccess(exit)) return true // tested above
            const kws = exit.value.result.keywords
            return Array.isArray(kws) && kws.every(
              (kw) => typeof kw.term === "string" && typeof kw.score === "number"
            )
          }),
          { numRuns: 50 }
        )
      })
    })
  })
})
