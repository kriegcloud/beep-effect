/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import {NonNegativeInt} from "@beep/schema";

const $I = $ScratchpadId.create("values/LlmResult/LlmResult.model");

export class LlmResult extends S.Class<LlmResult>($I`LlmResult`)({
  text: S.String,
  inToken: NonNegativeInt,
  outToken: NonNegativeInt,
  model: S.String,
}, $I.annote("LlmResult", {
  description: "",
})) {
}
