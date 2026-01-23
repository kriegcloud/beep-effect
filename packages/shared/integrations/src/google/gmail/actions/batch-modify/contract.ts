import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/batch-modify/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    emailIds: S.Array(S.String).pipe(S.mutable),
    options: S.Struct({
      addLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
      removeLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
    }),
  },
  $I.annotations("Payload", {
    description: "BatchModify payload.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("BatchModify", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
