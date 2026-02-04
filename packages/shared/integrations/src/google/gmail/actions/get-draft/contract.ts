import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    draftId: S.String,
  },
  $I.annotations("PayloadFrom", {
    description: "GetDraft payload input.",
  })
) {}

/**
 * Transforms user-friendly get draft payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersDraftsGet, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersDraftsGet.make({
      userId: "me",
      id: from.draftId,
      format: "full",
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export class Success extends Models.Email.extend<Success>($I`Success`)(
  {
    draftId: S.String,
  },
  $I.annotations("Success", {
    description: "GetDraft success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("GetDraft", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
