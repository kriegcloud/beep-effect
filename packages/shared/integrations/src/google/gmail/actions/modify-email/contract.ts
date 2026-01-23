import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/modify-email/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    emailId: S.String,
    options: S.Struct({
      addLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
      removeLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
    }),
  },
  $I.annotations("Payload", {
    description: "ModifyEmail payload.",
  })
) {}

export class Success extends Models.Email.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "ModifyEmail success.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ModifyEmail", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
