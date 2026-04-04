/**
 * CorpusStats tool - inspects BM25 corpus internals.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiCorpusStatsSchema } from "./_schemas.js"

export const CorpusStats = Tool.make("CorpusStats", {
  description:
    "Inspect corpus internals such as vocabulary, IDF values, and optional document-term matrix",
  parameters: {
    corpusId: Schema.String.pipe(Schema.minLength(1)).annotations({
      description: "Corpus identifier returned by CreateCorpus"
    }),
    includeIdf: Schema.optional(
      Schema.Boolean.annotations({
        description: "Include sorted IDF values in the output"
      })
    ),
    includeMatrix: Schema.optional(
      Schema.Boolean.annotations({
        description: "Include the document-term matrix in the output"
      })
    ),
    topIdfTerms: Schema.optional(
      Schema.Number.annotations({
        description:
          "When includeIdf=true, maximum number of top-IDF terms to return"
      })
    )
  },
  success: AiCorpusStatsSchema
})
