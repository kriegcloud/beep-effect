/**
 * ExtractKeywords tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiKeyword } from "./_schemas.ts";

const $I = $NlpId.create("Tools/ExtractKeywords");

class ExtractKeywordsParameters extends S.Class<ExtractKeywordsParameters>($I`ExtractKeywordsParameters`)(
  {
    text: S.String.annotateKey({
      description: "The text to extract keywords from",
      examples: ["Machine learning algorithms process data efficiently."],
    }),
    topN: S.optionalKey(PosInt).annotateKey({
      default: PosInt.make(10),
      description: "Maximum number of keywords to return (default: 10)",
      examples: [PosInt.make(5), PosInt.make(10), PosInt.make(20)],
    }),
  },
  $I.annote("ExtractKeywordsParameters", {
    description: "Inputs required to extract ranked keywords from a text document.",
  })
) {}

class ExtractKeywordsSuccess extends S.Class<ExtractKeywordsSuccess>($I`ExtractKeywordsSuccess`)(
  {
    keywords: S.Array(AiKeyword),
  },
  $I.annote("ExtractKeywordsSuccess", {
    description: "Ranked keyword entries extracted from the input text.",
  })
) {}

/**
 * Tool for extracting ranked keywords from text.
 *
 * @since 0.0.0
 * @category Tools
 */
export const ExtractKeywords = Tool.make("ExtractKeywords", {
  description: "Extract keywords from text ranked by TF-IDF-style importance.",
  parameters: ExtractKeywordsParameters,
  success: ExtractKeywordsSuccess,
});
