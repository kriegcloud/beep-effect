/**
 * PhoneticMatch tool - compares two texts by overlap of phonetic encodings.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiPhoneticMatchSchema } from "./_schemas.js"

export const PhoneticMatch = Tool.make("PhoneticMatch", {
  description:
    "Compute phonetic overlap between two texts using Soundex or phonetization",
  parameters: {
    text1: Schema.String.annotations({
      description: "First text to compare phonetically",
      examples: ["Stephen Hawking"]
    }),
    text2: Schema.String.annotations({
      description: "Second text to compare phonetically",
      examples: ["Steven Hocking"]
    }),
    algorithm: Schema.optional(
      Schema.Literal("soundex", "phonetize").annotations({
        description: "Phonetic algorithm to apply (default: soundex)"
      })
    ),
    minTokenLength: Schema.optional(
      Schema.Int.pipe(Schema.greaterThanOrEqualTo(1)).annotations({
        description:
          "Ignore tokens shorter than this length before encoding (default: 2)"
      })
    )
  },
  success: AiPhoneticMatchSchema
})
