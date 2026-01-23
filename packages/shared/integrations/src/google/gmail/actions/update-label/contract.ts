import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/update-label/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    labelId: S.String,
    updates: S.Struct({
      name: S.optionalWith(S.String, { as: "Option" }),
      labelListVisibility: S.optionalWith(Models.LabelListVisibility, { as: "Option" }),
      messageListVisibility: S.optionalWith(Models.MessageListVisibility, { as: "Option" }),
      color: S.optionalWith(Models.LabelColor, { as: "Option" }),
    }),
  },
  $I.annotations("Payload", {
    description: "UpdateLabel payload.",
  })
) {
  /**
   * Converts the payload to the format expected by the Gmail API.
   */
  toRequestBody() {
    return {
      name: O.getOrUndefined(this.updates.name),
      labelListVisibility: O.getOrUndefined(this.updates.labelListVisibility),
      messageListVisibility: O.getOrUndefined(this.updates.messageListVisibility),
      color: O.getOrUndefined(this.updates.color),
    };
  }
}

export class Success extends Models.Label.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "UpdateLabel success.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("UpdateLabel", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
