/**
 * LearnCustomEntities tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { MarkRange } from "../Core/Pattern.ts";

const $I = $NlpId.create("Tools/LearnCustomEntities");
const LearnCustomEntitiesModeKit = LiteralKit(["append", "replace"] as const);
const LearnCustomEntitiesMode = LearnCustomEntitiesModeKit.pipe(
  $I.annoteSchema("LearnCustomEntitiesMode", {
    description: "How learned custom entities are merged into the current engine state.",
  }),
  SchemaUtils.withLiteralKitStatics(LearnCustomEntitiesModeKit)
);

class LearnCustomEntityDefinition extends S.Class<LearnCustomEntityDefinition>($I`LearnCustomEntityDefinition`)(
  {
    mark: S.optionalKey(MarkRange).annotateKey({
      description: "Optional [start, end] mark range over matched pattern tokens",
    }),
    name: S.String.check(S.isMinLength(1)).annotateKey({
      description: "Custom entity type label such as PERSON_NAME or MONEY_AMOUNT",
    }),
    patterns: S.NonEmptyArray(S.String).annotateKey({
      description: "Ordered bracket-string pattern elements such as [PROPN], [PROPN]",
    }),
  },
  $I.annote("LearnCustomEntityDefinition", {
    description: "One custom entity definition consisting of a name and bracket-string patterns.",
  })
) {}

class LearnCustomEntitiesParameters extends S.Class<LearnCustomEntitiesParameters>($I`LearnCustomEntitiesParameters`)(
  {
    entities: S.NonEmptyArray(LearnCustomEntityDefinition).annotateKey({
      description: "One or more custom entity definitions to learn",
    }),
    groupName: S.optionalKey(S.String.check(S.isMinLength(1))).annotateKey({
      description: "Logical group name for this custom entity set. Defaults to custom-entities.",
    }),
    mode: S.optionalKey(LearnCustomEntitiesMode).annotateKey({
      description: "append merges with existing learned entities; replace overwrites them.",
    }),
  },
  $I.annote("LearnCustomEntitiesParameters", {
    description: "Inputs required to learn custom bracket-string entity patterns into the wink engine.",
  })
) {}

class LearnCustomEntitiesSuccess extends S.Class<LearnCustomEntitiesSuccess>($I`LearnCustomEntitiesSuccess`)(
  {
    entityNames: S.Array(S.String),
    groupName: S.String,
    learnedEntityCount: S.Number,
    mode: LearnCustomEntitiesMode,
    totalEntityCount: S.Number,
  },
  $I.annote("LearnCustomEntitiesSuccess", {
    description: "Learning result summary for custom entity definitions.",
  })
) {}

/**
 * Tool for teaching custom pattern-based entities.
 *
 * @since 0.0.0
 * @category Tools
 */
export const LearnCustomEntities = Tool.make("LearnCustomEntities", {
  description: "Learn custom entity patterns using bracket-string elements such as [PROPN], [CARDINAL], or [$].",
  parameters: LearnCustomEntitiesParameters,
  success: LearnCustomEntitiesSuccess,
});
