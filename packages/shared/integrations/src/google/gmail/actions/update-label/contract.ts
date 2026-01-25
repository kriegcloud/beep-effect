import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/update-label/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    labelId: S.String,
    updates: S.Struct({
      name: S.optionalWith(S.String, { as: "Option" }),
      labelListVisibility: S.optionalWith(Models.LabelListVisibility, { as: "Option" }),
      messageListVisibility: S.optionalWith(Models.MessageListVisibility, { as: "Option" }),
      color: S.optionalWith(Models.LabelColor, { as: "Option" }),
    }),
  },
  $I.annotations("PayloadFrom", {
    description: "UpdateLabel payload input.",
  })
) {}

/**
 * Transforms user-friendly update label payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersLabelsUpdate, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersLabelsUpdate.make({
      userId: "me",
      id: from.labelId,
      requestBody: GmailSchemas.GmailLabel.make({
        ...(O.isSome(from.updates.name) ? { name: from.updates.name.value } : {}),
        ...(O.isSome(from.updates.labelListVisibility)
          ? { labelListVisibility: from.updates.labelListVisibility.value }
          : {}),
        ...(O.isSome(from.updates.messageListVisibility)
          ? { messageListVisibility: from.updates.messageListVisibility.value }
          : {}),
        ...(O.isSome(from.updates.color)
          ? {
              color: GmailSchemas.GmailLabelColor.make({
                ...(O.isSome(from.updates.color.value.textColor)
                  ? { textColor: from.updates.color.value.textColor.value }
                  : {}),
                ...(O.isSome(from.updates.color.value.backgroundColor)
                  ? { backgroundColor: from.updates.color.value.backgroundColor.value }
                  : {}),
              }),
            }
          : {}),
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
