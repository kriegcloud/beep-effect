import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/delete-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    draftId: S.String,
  },
  $I.annotations("PayloadFrom", {
    description: "DeleteDraft payload input.",
  })
) {}

/**
 * Transforms user-friendly delete draft payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersDraftsDelete, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersDraftsDelete.make({
      userId: "me",
      id: from.draftId,
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export const Wrapper = Wrap.Wrapper.make("DeleteDraft", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
