/**
 * ExtractEntities tool definition.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Tools/ExtractEntities
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiEntity } from "./_schemas.ts";

const $I = $NlpId.create("Tools/ExtractEntities");

class ExtractEntitiesParameters extends S.Class<ExtractEntitiesParameters>($I`ExtractEntitiesParameters`)(
  {
    includeCustom: S.optionalKey(S.Boolean).annotateKey({
      description: "Include custom entities learned via LearnCustomEntities (default: true)",
    }),
    text: S.String.annotateKey({
      description: "The text to analyze for entities",
      examples: ["Email john@example.com by 2026-01-15. Budget is $1200 for New York."],
    }),
  },
  $I.annote("ExtractEntitiesParameters", {
    description: "Inputs required to extract built-in and optional custom entities from text.",
  })
) {}

class ExtractEntitiesSuccess extends S.Class<ExtractEntitiesSuccess>($I`ExtractEntitiesSuccess`)(
  {
    allEntities: S.Array(AiEntity).annotateKey({
      description: "Combined built-in and custom entity matches",
    }),
    allEntityCount: S.Number,
    customEntities: S.Array(AiEntity).annotateKey({
      description: "Custom learned entity matches",
    }),
    customEntityCount: S.Number,
    customEntityTypes: S.Array(S.String),
    entities: S.Array(AiEntity).annotateKey({
      description: "Built-in entity matches",
    }),
    entityCount: S.Number,
    entityTypes: S.Array(S.String),
  },
  $I.annote("ExtractEntitiesSuccess", {
    description: "Entity extraction result including built-in entities and optional learned custom entities.",
  })
) {}

/**
 * Tool for extracting built-in and custom entities from text.
 *
 * @since 0.0.0
 * @category Tools
 */
export const ExtractEntities = Tool.make("ExtractEntities", {
  description: "Extract named entities from text, including optional learned custom entities.",
  parameters: ExtractEntitiesParameters,
  success: ExtractEntitiesSuccess,
});
