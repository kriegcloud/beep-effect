import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/delete-email/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    emailId: S.String,
  },
  $I.annotations("Payload", {
    description: "DeleteEmail payload.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("DeleteEmail", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
