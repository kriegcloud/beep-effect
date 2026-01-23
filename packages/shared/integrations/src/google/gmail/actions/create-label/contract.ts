import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as S from "effect/Schema";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/create-label/contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.String,
    requestBody: S.optionalWith(
      S.Struct({
        labelListVisibility: S.optionalWith(Models.LabelListVisibility, {
          as: "Option",
        }),
        messageListVisibility: S.optionalWith(Models.MessageListVisibility, {
          as: "Option",
        }),
        color: S.optionalWith(Models.LabelColor, {
          as: "Option",
        }),
      }),
      {
        as: "Option",
      }
    ),
  },
  $I.annotations("Payload", {
    description: "CreateLabel payload.",
  })
) {}

export class Success extends Models.Label.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "CreateLabel success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("CreateLabel", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
