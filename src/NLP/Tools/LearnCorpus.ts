/**
 * LearnCorpus tool - incrementally learns documents into a corpus session.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"

export const LearnCorpus = Tool.make("LearnCorpus", {
  description:
    "Learn one or more documents into an existing corpus session for incremental BM25 indexing",
  parameters: {
    corpusId: Schema.String.pipe(Schema.minLength(1)).annotations({
      description: "Corpus identifier returned by CreateCorpus"
    }),
    documents: Schema.NonEmptyArray(
      Schema.Struct({
        id: Schema.optional(Schema.String.pipe(Schema.minLength(1))),
        text: Schema.String
      })
    ).annotations({
      description: "Documents to learn into the corpus"
    }),
    dedupeById: Schema.optional(
      Schema.Boolean.annotations({
        description:
          "If true (default), skip incoming documents whose ids already exist in the corpus"
      })
    )
  },
  success: Schema.Struct({
    corpusId: Schema.String,
    learnedCount: Schema.Number,
    skippedCount: Schema.Number,
    totalDocuments: Schema.Number,
    vocabularySize: Schema.Number,
    reindexRequired: Schema.Boolean
  })
})
