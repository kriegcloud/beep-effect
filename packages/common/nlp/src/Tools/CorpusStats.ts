/**
 * CorpusStats tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiCorpusStats } from "./_schemas.ts";

const $I = $NlpId.create("Tools/CorpusStats");

class CorpusStatsParameters extends S.Class<CorpusStatsParameters>($I`CorpusStatsParameters`)(
  {
    corpusId: S.String.check(S.isMinLength(1)).annotateKey({
      description: "Corpus identifier returned by CreateCorpus",
    }),
    includeIdf: S.optionalKey(S.Boolean).annotateKey({
      description: "Include sorted IDF values in the output",
    }),
    includeMatrix: S.optionalKey(S.Boolean).annotateKey({
      description: "Include the document-term matrix in the output",
    }),
    topIdfTerms: S.optionalKey(PosInt).annotateKey({
      description: "When includeIdf=true, maximum number of top-IDF terms to return",
    }),
  },
  $I.annote("CorpusStatsParameters", {
    description: "Inputs used to inspect corpus internals and optional matrix details.",
  })
) {}

/**
 * Tool for inspecting corpus internals.
 *
 * @example
 * ```ts
 * import { CorpusStats } from "@beep/nlp/Tools/CorpusStats"
 *
 * console.log(CorpusStats)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const CorpusStats = Tool.make("CorpusStats", {
  description: "Inspect corpus internals such as vocabulary, IDF values, and optional document-term matrix.",
  parameters: CorpusStatsParameters,
  success: AiCorpusStats,
});
