/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import {Field} from "../Field/index.ts";


const $I = $ScratchpadId.create("values/RowSchema/RowSchema.model");

export class RowSchema extends S.Class<RowSchema>($I`RowSchema`)({
  name: S.String,
  description: S.OptionFromOptionalKey(S.String),
  fields: S.Array(Field),
}, $I.annote("RowSchema", {
  description: "",
})) {
}
