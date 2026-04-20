/**
 * DocumentStats tool definition.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Tools/DocumentStats
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiDocumentStats } from "./_schemas.ts";

const $I = $NlpId.create("Tools/DocumentStats");

class DocumentStatsParameters extends S.Class<DocumentStatsParameters>($I`DocumentStatsParameters`)(
  {
    text: S.String.annotateKey({
      description: "The text to analyze",
      examples: ["Hello world. This is a short example document."],
    }),
  },
  $I.annote("DocumentStatsParameters", {
    description: "Text input used to compute high-level document statistics.",
  })
) {}

/**
 * Tool for computing high-level document statistics.
 *
 * @since 0.0.0
 * @category Tools
 */
export const DocumentStats = Tool.make("DocumentStats", {
  description:
    "Compute fast document statistics including word count, sentence count, average sentence length, and character count.",
  parameters: DocumentStatsParameters,
  success: AiDocumentStats,
});
