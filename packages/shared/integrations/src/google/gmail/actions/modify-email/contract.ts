import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/modify-email/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    emailId: S.String,
    options: S.Struct({
      addLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
      removeLabelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
    }),
  },
  $I.annotations("PayloadFrom", {
    description: "ModifyEmail payload input.",
  })
) {}

/**
 * Transforms user-friendly modify email payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesModify, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersMessagesModify.make({
      userId: "me",
      id: from.emailId,
      requestBody: GmailSchemas.GmailModifyMessageRequest.make({
        ...(O.isSome(from.options.addLabelIds) ? { addLabelIds: from.options.addLabelIds.value } : {}),
        ...(O.isSome(from.options.removeLabelIds) ? { removeLabelIds: from.options.removeLabelIds.value } : {}),
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

export class Success extends Models.Email.extend<Success>($I`Success`)(
  {},
  $I.annotations("Success", {
    description: "ModifyEmail success.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ModifyEmail", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
