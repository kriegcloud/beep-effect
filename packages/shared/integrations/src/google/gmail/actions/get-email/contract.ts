import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/get-email/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    emailId: S.String,
  },
  $I.annotations("PayloadFrom", {
    description: "GetEmail payload input.",
  })
) {}

/**
 * Transforms user-friendly get email payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesGet, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersMessagesGet.make({
      userId: "me",
      id: from.emailId,
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
