/**
 * DocumentStats tool - computes high-level document statistics.
 * @since 3.0.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiDocumentStatsSchema } from "./_schemas.js"

export const DocumentStats = Tool.make("DocumentStats", {
  description:
    "Compute fast document statistics including word count, sentence count, average sentence length, and character count",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to analyze",
      examples: ["Hello world. This is a short example document."]
    })
  },
  success: AiDocumentStatsSchema
})
