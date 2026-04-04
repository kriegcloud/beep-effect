/**
 * Tool export adapter — converts Effect AI Tool definitions into
 * REPL-compatible tool objects with positional-arg handlers and JSON Schema.
 * @since 3.0.0
 */

import { Cause, Data, Effect, JSONSchema, pipe, Schema } from "effect"
import { Tool } from "@effect/ai"
import { NlpToolkit, NlpToolkitLive } from "./NlpToolkit.js"

export class ExportedToolError extends Data.TaggedError("ExportedToolError")<{
  readonly message: string
  readonly toolName: string
}> {}

export interface ExportedTool {
  readonly name: string
  readonly description: string
  readonly parameterNames: ReadonlyArray<string>
  readonly parametersJsonSchema: object
  readonly returnsJsonSchema: object
  readonly usageExamples: ReadonlyArray<string>
  readonly timeoutMs: number
  readonly handle: (
    args: ReadonlyArray<unknown>
  ) => Effect.Effect<unknown, ExportedToolError>
}

const USAGE_EXAMPLES: Record<string, ReadonlyArray<string>> = {
  BowCosineSimilarity: [
    'const { score } = await BowCosineSimilarity("cats are great", "cats are wonderful")'
  ],
  ChunkBySentences: [
    'const { chunks } = await ChunkBySentences(text, 1500)',
    "const { chunkCount } = await ChunkBySentences(longDocument, 1200)"
  ],
  CorpusStats: [
    'const stats = await CorpusStats(corpusId, true, false, 20)',
    "const { vocabularySize, idfValues } = await CorpusStats(corpusId, true)"
  ],
  CreateCorpus: [
    "const { corpusId } = await CreateCorpus()",
    'const corpus = await CreateCorpus("product-docs")'
  ],
  DeleteCorpus: [
    "const { deleted } = await DeleteCorpus(corpusId)"
  ],
  DocumentStats: [
    'const stats = await DocumentStats("Hello world. This is a test.")',
    "const { wordCount, sentenceCount } = await DocumentStats(text)"
  ],
  ExtractEntities: [
    "const { entities } = await ExtractEntities(\"Email john@example.com by Friday\")"
  ],
  Tokenize: [
    'const result = await Tokenize("The quick brown fox.")',
    'const { tokens, tokenCount } = await Tokenize(text)'
  ],
  Sentences: [
    'const result = await Sentences("Hello world. How are you?")',
    'const { sentences, sentenceCount } = await Sentences(text)'
  ],
  TextSimilarity: [
    'const { score } = await TextSimilarity("cats are great", "felines are wonderful")'
  ],
  TverskySimilarity: [
    'const { score } = await TverskySimilarity("alpha beta gamma", "alpha beta", 0.8, 0.2)'
  ],
  TransformText: [
    'const { result } = await TransformText("<b>Hello</b> WORLD", ["removeHtml", "lowercase", "trim"])'
  ],
  ExtractKeywords: [
    'const { keywords } = await ExtractKeywords("Machine learning processes data.", 5)'
  ],
  LearnCorpus: [
    "await LearnCorpus(corpusId, [{ id: 'doc-1', text: 'Refund policy details' }])",
    "await LearnCorpus(corpusId, docs, true)"
  ],
  LearnCustomEntities: [
    "await LearnCustomEntities('custom-entities', 'append', [{ name: 'PERSON_NAME', patterns: ['[PROPN]', '[PROPN]'] }])"
  ],
  NGrams: [
    'const result = await NGrams("internationalization", 3, "bag", 10)'
  ],
  PhoneticMatch: [
    'const result = await PhoneticMatch("Stephen Hawking", "Steven Hocking", "soundex", 2)'
  ],
  QueryCorpus: [
    'const { ranked } = await QueryCorpus(corpusId, "refund policy", 5, true)'
  ],
  RankByRelevance: [
    'const { ranked } = await RankByRelevance(texts, "key policy changes", 5)'
  ]
}

const DEFAULT_TIMEOUT_MS = 30_000

const renderErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

const decodeParams = (
  fields: Schema.Struct.Fields,
  obj: Record<string, unknown>
): Effect.Effect<unknown, ExportedToolError> =>
  Schema.decodeUnknown(Schema.Struct(fields))(obj).pipe(
    Effect.mapError(
      (err) =>
        new ExportedToolError({
          toolName: "",
          message: err instanceof Error ? err.message : String(err)
        })
    )
  ) as Effect.Effect<unknown, ExportedToolError>

const buildExportedTool = (
  tool: Tool.Any,
  toolkit: {
    readonly handle: (
      name: string,
      params: unknown
    ) => Effect.Effect<{
      readonly isFailure: boolean
      readonly result: unknown
      readonly encodedResult: unknown
    }, unknown>
  }
): ExportedTool => {
  const name = tool.name
  const parameterNames = Object.keys(tool.parametersSchema.fields)
  const fields = tool.parametersSchema.fields as Schema.Struct.Fields

  return {
    name,
    description: Tool.getDescription(tool as never) ?? "",
    parameterNames,
    parametersJsonSchema: Tool.getJsonSchema(tool as never),
    returnsJsonSchema: JSONSchema.make(tool.successSchema),
    usageExamples: USAGE_EXAMPLES[name] ?? [],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    handle: (args) => {
      const obj: Record<string, unknown> = {}
      for (let i = 0; i < parameterNames.length; i++) {
        if (i < args.length && args[i] !== undefined) {
          obj[parameterNames[i]!] = args[i]
        }
      }
      return pipe(
        decodeParams(fields, obj),
        Effect.mapError(
          (err) =>
            new ExportedToolError({
              toolName: name,
              message: err instanceof Error ? err.message : String(err)
            })
        ),
        Effect.flatMap((decoded) =>
          toolkit.handle(name, decoded).pipe(
            Effect.flatMap((handled) =>
              handled.isFailure
                ? Effect.fail(
                    new ExportedToolError({
                      toolName: name,
                      message: `Tool ${name} failed: ${renderErrorMessage(handled.result)}`
                    })
                  )
                : Effect.succeed(handled.encodedResult)
            ),
            Effect.catchAllCause((cause) =>
              Effect.fail(
                new ExportedToolError({
                  toolName: name,
                  message: `Tool ${name} failed: ${Cause.pretty(cause)}`
                })
              )
            )
          )
        )
      )
    }
  }
}

export const exportTools: Effect.Effect<
  ReadonlyArray<ExportedTool>,
  ExportedToolError,
  never
> = Effect.gen(function*() {
  const toolkit = yield* NlpToolkit
  const tools = Object.values(NlpToolkit.tools) as ReadonlyArray<Tool.Any>
  return tools.map((tool) => buildExportedTool(tool, toolkit as never))
}).pipe(
  Effect.provide(NlpToolkitLive),
  Effect.mapError(
    (error) =>
      new ExportedToolError({
        toolName: "__init__",
        message: renderErrorMessage(error)
      })
  )
)
