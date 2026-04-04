/**
 * ExtractEntities tool - extracts named entities from text with offsets.
 * @since 3.0.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiEntitySchema } from "./_schemas.js"

export const ExtractEntities = Tool.make("ExtractEntities", {
  description:
    "Extract named entities (e.g. DATE, MONEY, PERSON, EMAIL, URL) from text using wink-nlp",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to analyze for entities",
      examples: [
        "Email john@example.com by 2026-01-15. Budget is $1200 for New York."
      ]
    }),
    includeCustom: Schema.optional(
      Schema.Boolean.annotations({
        description:
          "Include custom entities learned via LearnCustomEntities (default: true)"
      })
    )
  },
  success: Schema.Struct({
    entities: Schema.Array(AiEntitySchema).annotations({
      description: "Built-in wink entity matches"
    }),
    entityCount: Schema.Number,
    entityTypes: Schema.Array(Schema.String),
    customEntities: Schema.Array(AiEntitySchema).annotations({
      description: "Custom learned entity matches"
    }),
    customEntityCount: Schema.Number,
    customEntityTypes: Schema.Array(Schema.String),
    allEntities: Schema.Array(AiEntitySchema).annotations({
      description: "Combined built-in and custom entities"
    }),
    allEntityCount: Schema.Number
  }).annotations({
    description:
      "Entity extraction result including built-in entities and optional learned custom entities"
  })
})
