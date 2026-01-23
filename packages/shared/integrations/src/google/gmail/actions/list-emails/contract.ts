import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-emails/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 10 }),
    query: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("Payload", {
    description: "ListEmails payload.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Models.Email),
  },
  $I.annotations("Success", {
    description: "ListEmails success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListEmails", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
