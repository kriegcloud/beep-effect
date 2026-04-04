/**
 * RankByRelevance tool - ranks texts against a query using BM25 vectors + cosine similarity.
 * @since 3.0.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiRankedTextSchema } from "./_schemas.js"

export const RankByRelevance = Tool.make("RankByRelevance", {
  description:
    "Rank an array of texts by relevance to a query using BM25-based vectorization and cosine similarity",
  parameters: {
    texts: Schema.Array(
      Schema.String.annotations({
        description: "Candidate text to rank"
      })
    ).annotations({
      description: "Candidate texts",
      examples: [["Cats are playful", "Quantum computing advances"]]
    }),
    query: Schema.String.annotations({
      description: "Query to rank texts against",
      examples: ["cats and kittens"]
    }),
    topN: Schema.optional(
      Schema.Number.annotations({
        description:
          "Maximum number of ranked results to return (default: all texts)",
        examples: [3, 5, 10]
      })
    )
  },
  success: Schema.Struct({
    ranked: Schema.Array(AiRankedTextSchema),
    totalTexts: Schema.Number,
    returned: Schema.Number
  })
})
