/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $ScratchpadId.create("values/Field/Field.model");

export class Field extends S.Class<Field>($I`Field`)(
  {
    name: S.String,
    type: S.String,
    description: S.OptionFromOptionalKey(S.String)
  },
  $I.annote(
    "Field",
    {
      description: ""
    }
  )
) {}
