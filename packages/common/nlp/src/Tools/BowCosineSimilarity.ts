/**
 * BowCosineSimilarity tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { UnitInterval } from "../internal/numbers.ts";

const $I = $NlpId.create("Tools/BowCosineSimilarity");

class BowCosineSimilarityParameters extends S.Class<BowCosineSimilarityParameters>($I`BowCosineSimilarityParameters`)(
  {
    text1: S.String.annotateKey({
      description: "First text to compare",
      examples: ["Cats are wonderful pets."],
    }),
    text2: S.String.annotateKey({
      description: "Second text to compare",
      examples: ["Felines make great companions."],
    }),
  },
  $I.annote("BowCosineSimilarityParameters", {
    description: "Inputs required to compute bag-of-words cosine similarity between two texts.",
  })
) {}

class BowCosineSimilaritySuccess extends S.Class<BowCosineSimilaritySuccess>($I`BowCosineSimilaritySuccess`)(
  {
    method: S.Literal("bow.cosine").annotateKey({
      description: "The similarity method used",
    }),
    score: UnitInterval.annotateKey({
      description: "Similarity score from 0 (unrelated) to 1 (identical)",
    }),
  },
  $I.annote("BowCosineSimilaritySuccess", {
    description: "Bag-of-words cosine similarity score for two text inputs.",
  })
) {}

/**
 * Tool for computing bag-of-words cosine similarity.
 *
 * @example
 * ```ts
 * import { BowCosineSimilarity } from "@beep/nlp/Tools/BowCosineSimilarity"
 *
 * console.log(BowCosineSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const BowCosineSimilarity = Tool.make("BowCosineSimilarity", {
  description:
    "Compute cosine similarity using bag-of-words term frequencies. Returns a score from 0 (unrelated) to 1 (identical token distribution).",
  parameters: BowCosineSimilarityParameters,
  success: BowCosineSimilaritySuccess,
});
