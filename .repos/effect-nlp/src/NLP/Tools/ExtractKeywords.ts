/**
 * ExtractKeywords tool - extracts keywords from text ranked by TF-IDF importance.
 * @since 3.0.0
 */

import { Schema } from "effect"
import { Tool } from "@effect/ai"
import { AiKeywordSchema } from "./_schemas.js"

export const ExtractKeywords = Tool.make("ExtractKeywords", {
  description:
    "Extract keywords from text ranked by TF-IDF importance using BM25 scoring",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to extract keywords from",
      examples: ["Machine learning algorithms process data efficiently."]
    }),
    topN: Schema.optional(
      Schema.Number.annotations({
        description: "Maximum number of keywords to return (default: 10)",
        default: 10,
        examples: [5, 10, 20]
      })
    )
  },
  success: Schema.Struct({
    keywords: Schema.Array(AiKeywordSchema)
  })
})
