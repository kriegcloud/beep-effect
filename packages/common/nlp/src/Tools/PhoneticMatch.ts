/**
 * PhoneticMatch tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, PosInt, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiPhoneticMatch } from "./_schemas.ts";

const $I = $NlpId.create("Tools/PhoneticMatch");
const PhoneticMatchAlgorithmKit = LiteralKit(["soundex", "phonetize"] as const);
const PhoneticMatchAlgorithm = PhoneticMatchAlgorithmKit.pipe(
  $I.annoteSchema("PhoneticMatchAlgorithm", {
    description: "Phonetic encoding algorithm used to compare text.",
  }),
  SchemaUtils.withLiteralKitStatics(PhoneticMatchAlgorithmKit)
);

class PhoneticMatchParameters extends S.Class<PhoneticMatchParameters>($I`PhoneticMatchParameters`)(
  {
    algorithm: S.optionalKey(PhoneticMatchAlgorithm).annotateKey({
      description: "Phonetic algorithm to apply (default: soundex)",
    }),
    minTokenLength: S.optionalKey(PosInt).annotateKey({
      description: "Ignore tokens shorter than this length before encoding (default: 2)",
    }),
    text1: S.String.annotateKey({
      description: "First text to compare phonetically",
      examples: ["Stephen Hawking"],
    }),
    text2: S.String.annotateKey({
      description: "Second text to compare phonetically",
      examples: ["Steven Hocking"],
    }),
  },
  $I.annote("PhoneticMatchParameters", {
    description: "Inputs required to compare two texts by phonetic overlap.",
  })
) {}

/**
 * Tool for comparing texts by phonetic overlap.
 *
 * @example
 * ```ts
 * import { PhoneticMatch } from "@beep/nlp/Tools/PhoneticMatch"
 *
 * console.log(PhoneticMatch)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const PhoneticMatch = Tool.make("PhoneticMatch", {
  description: "Compute phonetic overlap between two texts using Soundex or phonetization.",
  parameters: PhoneticMatchParameters,
  success: AiPhoneticMatch,
});
