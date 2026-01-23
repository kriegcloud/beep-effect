import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-labels/contract");

export class Success extends S.Class<Success>($I`Success`)(
  {
    data: S.Array(Models.Label),
  },
  $I.annotations("Success", {
    description: "ListLabels success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListLabels", {
  success: Success,
  error: GmailMethodError,
});
