/**
 * QueryCorpus tool - queries a learned corpus session without relearning.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiCorpusRankedDocumentSchema } from "./_schemas.js"

export const QueryCorpus = Tool.make("QueryCorpus", {
  description:
    "Query a learned corpus session and return BM25 vector-cosine ranked results without relearning",
  parameters: {
    corpusId: Schema.String.pipe(Schema.minLength(1)).annotations({
      description: "Corpus identifier returned by CreateCorpus"
    }),
    query: Schema.String.annotations({
      description: "Query text to rank corpus documents against"
    }),
    topN: Schema.optional(
      Schema.Number.annotations({
        description: "Maximum ranked results to return (default: all documents)"
      })
    ),
    includeText: Schema.optional(
      Schema.Boolean.annotations({
        description: "Include source document text for each ranked result"
      })
    )
  },
  success: Schema.Struct({
    corpusId: Schema.String,
    query: Schema.String,
    method: Schema.Literal("vector.cosine"),
    ranked: Schema.Array(AiCorpusRankedDocumentSchema),
    totalDocuments: Schema.Number,
    returned: Schema.Number
  })
})
