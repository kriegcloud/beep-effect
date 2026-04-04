/**
 * LearnCustomEntities tool - teaches custom pattern-based entities to wink-nlp.
 * @since 3.1.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"

export const LearnCustomEntities = Tool.make("LearnCustomEntities", {
  description:
    "Learn custom entity patterns using bracket-string elements (e.g. [PROPN], [CARDINAL], [$])",
  parameters: {
    groupName: Schema.optional(
      Schema.String.pipe(Schema.minLength(1)).annotations({
        description:
          "Logical group name for this custom entity set. Defaults to custom-entities."
      })
    ),
    mode: Schema.optional(
      Schema.Literal("append", "replace").annotations({
        description:
          "append merges with existing learned entities, replace overwrites existing learned entities"
      })
    ),
    entities: Schema.NonEmptyArray(
      Schema.Struct({
        name: Schema.String.pipe(Schema.minLength(1)).annotations({
          description: "Custom entity type label (e.g. PERSON_NAME, MONEY_AMOUNT)"
        }),
        patterns: Schema.NonEmptyArray(Schema.String).annotations({
          description:
            "Ordered bracket-string pattern elements (e.g. [PROPN], [PROPN])"
        }),
        mark: Schema.optional(Schema.Tuple(Schema.Int, Schema.Int)).annotations({
          description:
            "Optional [start, end] mark range over matched pattern tokens"
        })
      })
    ).annotations({
      description: "One or more custom entity definitions to learn"
    })
  },
  success: Schema.Struct({
    groupName: Schema.String,
    mode: Schema.Literal("append", "replace"),
    learnedEntityCount: Schema.Number,
    totalEntityCount: Schema.Number,
    entityNames: Schema.Array(Schema.String)
  })
})
