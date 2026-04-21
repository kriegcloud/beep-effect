/**
 * TextSimilarity tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { UnitInterval } from "../internal/numbers.ts";

const $I = $NlpId.create("Tools/TextSimilarity");

class TextSimilarityParameters extends S.Class<TextSimilarityParameters>($I`TextSimilarityParameters`)(
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
  $I.annote("TextSimilarityParameters", {
    description: "Inputs required to compute cosine similarity between two texts.",
  })
) {}

class TextSimilaritySuccess extends S.Class<TextSimilaritySuccess>($I`TextSimilaritySuccess`)(
  {
    method: S.Literal("vector.cosine").annotateKey({
      description: "The similarity method used",
    }),
    score: UnitInterval.annotateKey({
      description: "Similarity score from 0 (unrelated) to 1 (identical)",
    }),
  },
  $I.annote("TextSimilaritySuccess", {
    description: "Cosine similarity score for two text inputs.",
  })
) {}

/**
 * Tool for computing similarity between two texts.
 *
 * @example
 * ```ts
 * import { TextSimilarity } from "@beep/nlp/Tools/TextSimilarity"
 *
 * console.log(TextSimilarity)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const TextSimilarity = Tool.make("TextSimilarity", {
  description:
    "Compute similarity between two texts using BM25 vectorization and cosine similarity. Returns a score from 0 (unrelated) to 1 (identical).",
  parameters: TextSimilarityParameters,
  success: TextSimilaritySuccess,
});
