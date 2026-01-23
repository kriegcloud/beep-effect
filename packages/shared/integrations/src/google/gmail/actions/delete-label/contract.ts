import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/delete-label/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    labelId: S.String,
  },
  $I.annotations("Payload", {
    description: "DeleteLabel payload.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("DeleteLabel", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
