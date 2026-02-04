import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/send-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    draftId: S.String,
  },
  $I.annotations("PayloadFrom", {
    description: "SendDraft payload input.",
  })
) {}

/**
 * Transforms user-friendly send draft payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersDraftsSend, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersDraftsSend.make({
      userId: "me",
      requestBody: GmailSchemas.GmailDraft.make({
        id: from.draftId,
      }),
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
    id: S.String,
    threadId: S.String,
  },
  $I.annotations("Success", {
    description: "SendDraft success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("SendDraft", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
