/**
 * Tokenize tool - tokenizes text into linguistic tokens with POS tags, lemmas, and positions.
 * @since 3.0.0
 */

import { Schema } from "effect"
import { Tool } from "@effect/ai"
import { AiTokenSchema } from "./_schemas.js"

export const Tokenize = Tool.make("Tokenize", {
  description:
    "Tokenize text into linguistic tokens with part-of-speech tags, lemmas, and character positions",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to tokenize",
      examples: ["The quick brown fox jumps over the lazy dog."]
    })
  },
  success: Schema.Struct({
    tokens: Schema.Array(AiTokenSchema),
    tokenCount: Schema.Number
  })
})
