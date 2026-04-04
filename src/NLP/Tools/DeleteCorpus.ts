/**
 * DeleteCorpus tool - deletes a stateful BM25 corpus session.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"

export const DeleteCorpus = Tool.make("DeleteCorpus", {
  description: "Delete a corpus session and release its in-memory index state",
  parameters: {
    corpusId: Schema.String.pipe(Schema.minLength(1)).annotations({
      description: "Corpus identifier returned by CreateCorpus"
    })
  },
  success: Schema.Struct({
    corpusId: Schema.String,
    deleted: Schema.Boolean
  })
})
