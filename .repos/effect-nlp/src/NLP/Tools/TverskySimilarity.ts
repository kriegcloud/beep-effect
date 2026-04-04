/**
 * TverskySimilarity tool - compares two texts using asymmetric set similarity.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"

export const TverskySimilarity = Tool.make("TverskySimilarity", {
  description:
    "Compute asymmetric set similarity between two texts using Tversky index. Useful for containment-style comparisons.",
  parameters: {
    text1: Schema.String.annotations({
      description: "First text to compare",
      examples: ["alpha beta gamma"]
    }),
    text2: Schema.String.annotations({
      description: "Second text to compare",
      examples: ["alpha beta"]
    }),
    alpha: Schema.optional(
      Schema.Number.pipe(
        Schema.greaterThanOrEqualTo(0),
        Schema.lessThanOrEqualTo(1)
      ).annotations({
        description:
          "Weight for terms present in text1 but absent in text2 (default: 0.5)"
      })
    ),
    beta: Schema.optional(
      Schema.Number.pipe(
        Schema.greaterThanOrEqualTo(0),
        Schema.lessThanOrEqualTo(1)
      ).annotations({
        description:
          "Weight for terms present in text2 but absent in text1 (default: 0.5)"
      })
    )
  },
  success: Schema.Struct({
    score: Schema.Number.annotations({
      description: "Similarity score from 0 (no overlap) to 1 (identical sets)"
    }),
    method: Schema.Literal("set.tversky").annotations({
      description: "The similarity method used"
    }),
    alpha: Schema.Number.annotations({
      description: "Applied alpha parameter"
    }),
    beta: Schema.Number.annotations({
      description: "Applied beta parameter"
    })
  })
})
