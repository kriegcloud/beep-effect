/**
 * TextSimilarity tool - compares two texts using BM25 vectorization and cosine similarity.
 * @since 3.0.0
 */

import { Schema } from "effect"
import { Tool } from "@effect/ai"

export const TextSimilarity = Tool.make("TextSimilarity", {
  description:
    "Compute similarity between two texts using BM25 vectorization and cosine similarity. Returns a score from 0 (unrelated) to 1 (identical).",
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
    method: Schema.String.annotations({
      description: "The similarity method used"
    })
  })
})
