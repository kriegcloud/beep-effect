import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-email/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    emailId: S.String,
  },
  $I.annotations("Payload", {
    description: "GetEmail payload.",
  })
) {}

export class Success extends Models.Email.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "GetEmail success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("GetEmail", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
