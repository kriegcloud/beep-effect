/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import {NonNegativeInt} from "@beep/schema";

const $I = $ScratchpadId.create("values/LlmChunk/LlmChunk.model");

export class LlmChunk extends S.Class<LlmChunk>($I`LlmChunk`)({
  text: S.String,
  inToken: S.OptionFromNullOr(NonNegativeInt),
  outToken: S.OptionFromNullOr(NonNegativeInt),
  model: S.String,
  isFinal: S.Boolean
}, $I.annote("LlmChunk", {
  description: "",
})) {
}
