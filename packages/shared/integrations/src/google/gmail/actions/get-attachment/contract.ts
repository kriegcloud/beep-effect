import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-attachment/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    messageId: S.String,
    attachmentId: S.String,
  },
  $I.annotations("PayloadFrom", {
    description: "GetAttachment payload input.",
  })
) {}

export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesAttachmentsGet, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersMessagesAttachmentsGet.make({
      userId: "me",
      messageId: from.messageId,
      id: from.attachmentId,
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export class Success extends S.Class<Success>($I`Success`)(
  {
    attachmentId: S.String,
    size: S.optionalWith(S.NonNegativeInt, { as: "Option" }),
    data: S.String,
  },
  $I.annotations("Success", {
    description: "GetAttachment success response containing base64 encoded attachment data.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("GetAttachment", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
