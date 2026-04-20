/**
 * RankByRelevance tool definition.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Tools/RankByRelevance
 */

import { $NlpId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiRankedText } from "./_schemas.ts";

const $I = $NlpId.create("Tools/RankByRelevance");
const CandidateText = S.String.annotate({
  description: "Candidate text to rank",
});

class RankByRelevanceParameters extends S.Class<RankByRelevanceParameters>($I`RankByRelevanceParameters`)(
  {
    query: S.String.annotateKey({
      description: "Query to rank texts against",
      examples: ["cats and kittens"],
    }),
    texts: S.Array(CandidateText).annotateKey({
      description: "Candidate texts",
      examples: [["Cats are playful", "Quantum computing advances"]],
    }),
    topN: S.optionalKey(PosInt).annotateKey({
      description: "Maximum number of ranked results to return (default: all texts)",
      examples: [PosInt.make(3), PosInt.make(5), PosInt.make(10)],
    }),
  },
  $I.annote("RankByRelevanceParameters", {
    description: "Inputs required to rank multiple candidate texts against a query.",
  })
) {}

class RankByRelevanceSuccess extends S.Class<RankByRelevanceSuccess>($I`RankByRelevanceSuccess`)(
  {
    ranked: S.Array(AiRankedText),
    returned: S.Number,
    totalTexts: S.Number,
  },
  $I.annote("RankByRelevanceSuccess", {
    description: "Ranked relevance results and source-text count metadata.",
  })
) {}

/**
 * Tool for ranking texts against a query.
 *
 * @since 0.0.0
 * @category Tools
 */
export const RankByRelevance = Tool.make("RankByRelevance", {
  description: "Rank an array of texts by relevance to a query using vectorized similarity.",
  parameters: RankByRelevanceParameters,
  success: RankByRelevanceSuccess,
});
