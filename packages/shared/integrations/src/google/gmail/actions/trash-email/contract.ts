import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/trash-email/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    emailId: S.String,
  },
  $I.annotations("Payload", {
    description: "TrashEmail payload.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("TrashEmail", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
