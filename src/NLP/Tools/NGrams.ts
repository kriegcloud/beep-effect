/**
 * NGrams tool - extracts character n-grams for text fingerprinting and analysis.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiNGramSchema } from "./_schemas.js"

export const NGrams = Tool.make("NGrams", {
  description:
    "Extract character n-grams from text using bag, edge, or set mode with deterministic ranking",
  parameters: {
    text: Schema.String.annotations({
      description: "Input text used to generate n-grams",
      examples: ["internationalization"]
    }),
    size: Schema.Int.pipe(Schema.greaterThanOrEqualTo(1)).annotations({
      description: "N-gram size (e.g. 2 for bigrams, 3 for trigrams)",
      examples: [3]
    }),
    mode: Schema.optional(
      Schema.Literal("bag", "edge", "set").annotations({
        description:
          "Generation mode: bag counts all n-grams, edge uses edge n-grams, set keeps unique n-grams (default: bag)"
      })
    ),
    topN: Schema.optional(
      Schema.Int.pipe(Schema.greaterThanOrEqualTo(1)).annotations({
        description:
          "Maximum n-gram entries to return after sorting by count desc then value asc"
      })
    )
  },
  success: Schema.Struct({
    mode: Schema.Literal("bag", "edge", "set"),
    size: Schema.Number,
    ngrams: Schema.Array(AiNGramSchema),
    totalNGrams: Schema.Number,
    uniqueNGrams: Schema.Number
  })
})
