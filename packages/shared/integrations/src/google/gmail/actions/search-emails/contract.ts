import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/search-emails/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    query: S.String,
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 10 }),
  },
  $I.annotations("Payload", {
    description: "SearchEmails payload.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Models.Email),
  },
  $I.annotations("Success", {
    description: "SearchEmails success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("SearchEmails", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
