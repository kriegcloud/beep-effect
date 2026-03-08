/**
 * BowCosineSimilarity tool - compares two texts using bag-of-words cosine similarity.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"

export const BowCosineSimilarity = Tool.make("BowCosineSimilarity", {
  description:
    "Compute cosine similarity using bag-of-words term frequencies (no BM25 weighting). Returns a score from 0 (unrelated) to 1 (identical token distribution).",
  parameters: {
    text1: Schema.String.annotations({
      description: "First text to compare",
      examples: ["Cats are wonderful pets."]
    }),
    text2: Schema.String.annotations({
      description: "Second text to compare",
      examples: ["Felines make great companions."]
    })
  },
  success: Schema.Struct({
    score: Schema.Number.annotations({
      description: "Similarity score from 0 (unrelated) to 1 (identical)"
    }),
    method: Schema.Literal("bow.cosine").annotations({
      description: "The similarity method used"
    })
  })
})
