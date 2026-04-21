/**
 * Tokenize tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiToken } from "./_schemas.ts";

const $I = $NlpId.create("Tools/Tokenize");

class TokenizeParameters extends S.Class<TokenizeParameters>($I`TokenizeParameters`)(
  {
    text: S.String.annotateKey({
      description: "The text to tokenize",
      examples: ["The quick brown fox jumps over the lazy dog."],
    }),
  },
  $I.annote("TokenizeParameters", {
    description: "Text input used to produce annotated linguistic tokens.",
  })
) {}

class TokenizeSuccess extends S.Class<TokenizeSuccess>($I`TokenizeSuccess`)(
  {
    tokenCount: S.Number,
    tokens: S.Array(AiToken),
  },
  $I.annote("TokenizeSuccess", {
    description: "Annotated token stream and total token count for an input text.",
  })
) {}

/**
 * Tool for tokenizing text into annotated linguistic tokens.
 *
 * @since 0.0.0
 * @category Tools
 */
export const Tokenize = Tool.make("Tokenize", {
  description: "Tokenize text into linguistic tokens with part-of-speech tags, lemmas, and character positions.",
  parameters: TokenizeParameters,
  success: TokenizeSuccess,
});
