/**
 * TransformText tool - applies text cleaning/normalization operations in sequence.
 * @since 3.0.0
 */

import { Schema } from "effect"
import { Tool } from "@effect/ai"

export const TransformText = Tool.make("TransformText", {
  description:
    "Apply text transformation operations in sequence: cleaning, normalization, and linguistic processing",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to transform",
      examples: ["<b>Hello</b>  WORLD!! "]
    }),
    operations: Schema.Array(
      Schema.Literal(
        "lowercase",
        "uppercase",
        "trim",
        "removeHtml",
        "removePunctuation",
        "removeExtraSpaces",
        "removeSpecialChars",
        "retainAlphaNums",
        "removeElisions"
      )
    ).annotations({
      description: "Ordered list of transformations to apply",
      examples: [["removeHtml", "lowercase", "trim"]]
    })
  },
  success: Schema.Struct({
    result: Schema.String.annotations({
      description: "The transformed text"
    }),
    operationsApplied: Schema.Array(Schema.String).annotations({
      description: "List of operations that were applied"
    })
  })
})
