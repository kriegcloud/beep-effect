/**
 * TverskySimilarity tool definition.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/TverskySimilarity
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";

const $I = $NlpId.create("Tools/TverskySimilarity");

class TverskySimilarityParameters extends S.Class<TverskySimilarityParameters>($I`TverskySimilarityParameters`)(
  {
    alpha: S.optionalKey(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1))).annotateKey({
      description: "Weight for terms present in text1 but absent in text2 (default: 0.5)",
    }),
    beta: S.optionalKey(S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1))).annotateKey({
      description: "Weight for terms present in text2 but absent in text1 (default: 0.5)",
    }),
    text1: S.String.annotateKey({
      description: "First text to compare",
      examples: ["alpha beta gamma"],
    }),
    text2: S.String.annotateKey({
      description: "Second text to compare",
      examples: ["alpha beta"],
    }),
  },
  $I.annote("TverskySimilarityParameters", {
    description: "Inputs required to compute asymmetric set similarity between two texts.",
  })
) {}

class TverskySimilaritySuccess extends S.Class<TverskySimilaritySuccess>($I`TverskySimilaritySuccess`)(
  {
    alpha: S.Number.annotateKey({
      description: "Applied alpha parameter",
    }),
    beta: S.Number.annotateKey({
      description: "Applied beta parameter",
    }),
    method: S.Literal("set.tversky").annotateKey({
      description: "The similarity method used",
    }),
    score: S.Number.annotateKey({
      description: "Similarity score from 0 (no overlap) to 1 (identical sets)",
    }),
  },
  $I.annote("TverskySimilaritySuccess", {
    description: "Asymmetric Tversky similarity score and applied parameter values.",
  })
) {}

/**
 * Tool for computing asymmetric set similarity.
 *
 * @since 0.0.0
 * @category Tools
 */
export const TverskySimilarity = Tool.make("TverskySimilarity", {
  description:
    "Compute asymmetric set similarity between two texts using the Tversky index. Useful for containment-style comparisons.",
  parameters: TverskySimilarityParameters,
  success: TverskySimilaritySuccess,
});
