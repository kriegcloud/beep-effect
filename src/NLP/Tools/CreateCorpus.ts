/**
 * CreateCorpus tool - creates a stateful BM25 corpus session.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiCorpusSummarySchema } from "./_schemas.js"

export const CreateCorpus = Tool.make("CreateCorpus", {
  description:
    "Create a stateful BM25 corpus session that can be learned incrementally across tool calls",
  parameters: {
    corpusId: Schema.optional(
      Schema.String.pipe(Schema.minLength(1)).annotations({
        description:
          "Optional stable corpus identifier. If omitted, a generated id is returned."
      })
    ),
    bm25Config: Schema.optional(
      Schema.Struct({
        k1: Schema.optional(Schema.Number),
        b: Schema.optional(Schema.Number),
        k: Schema.optional(Schema.Number),
        norm: Schema.optional(Schema.Literal("none", "l1", "l2"))
      }).annotations({
        description: "Optional BM25 overrides. Omitted fields use defaults."
      })
    )
  },
  success: AiCorpusSummarySchema
})
