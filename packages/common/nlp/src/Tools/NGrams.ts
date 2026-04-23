/**
 * NGrams tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, PosInt, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiNGram } from "./_schemas.ts";

const $I = $NlpId.create("Tools/NGrams");
const NGramModeKit = LiteralKit(["bag", "edge", "set"]);
const NGramMode = NGramModeKit.pipe(
  $I.annoteSchema("NGramMode", {
    description: "Character n-gram generation mode.",
  }),
  SchemaUtils.withLiteralKitStatics(NGramModeKit)
);

class NGramsParameters extends S.Class<NGramsParameters>($I`NGramsParameters`)(
  {
    mode: S.optionalKey(NGramMode).annotateKey({
      description: "Generation mode: bag counts all n-grams, edge uses edge n-grams, set keeps unique n-grams.",
    }),
    size: PosInt.annotateKey({
      description: "N-gram size such as 2 for bigrams or 3 for trigrams",
      examples: [PosInt.make(3)],
    }),
    text: S.String.annotateKey({
      description: "Input text used to generate n-grams",
      examples: ["internationalization"],
    }),
    topN: S.optionalKey(PosInt).annotateKey({
      description: "Maximum n-gram entries to return after sorting by count descending then value ascending.",
    }),
  },
  $I.annote("NGramsParameters", {
    description: "Inputs required to extract deterministic character n-grams from text.",
  })
) {}

class NGramsSuccess extends S.Class<NGramsSuccess>($I`NGramsSuccess`)(
  {
    mode: NGramMode,
    ngrams: S.Array(AiNGram),
    size: S.Number,
    totalNGrams: S.Number,
    uniqueNGrams: S.Number,
  },
  $I.annote("NGramsSuccess", {
    description: "Extracted n-gram entries and summary counts for the selected mode.",
  })
) {}

/**
 * Tool for extracting character n-grams.
 *
 * @example
 * ```ts
 * import { NGrams } from "@beep/nlp/Tools/NGrams"
 *
 * console.log(NGrams)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const NGrams = Tool.make("NGrams", {
  description: "Extract character n-grams from text using bag, edge, or set mode with deterministic ranking.",
  parameters: NGramsParameters,
  success: NGramsSuccess,
});
