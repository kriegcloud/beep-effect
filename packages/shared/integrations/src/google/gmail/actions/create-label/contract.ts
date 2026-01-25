import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/create-label/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    name: S.String.annotations({
      description: "The name of the label to create.",
    }),
    requestBody: S.optionalWith(
      S.Struct({
        labelListVisibility: S.optionalWith(Models.LabelListVisibility, {
          as: "Option",
        }).annotations({
          description: "The visibility of the label in the label list.",
        }),
        messageListVisibility: S.optionalWith(Models.MessageListVisibility, {
          as: "Option",
        }).annotations({
          description: "The visibility of the label in the message list.",
        }),
        color: S.optionalWith(Models.LabelColor, {
          as: "Option",
        }).annotations({
          description: "The color of the label.",
        }),
      }),
      {
        as: "Option",
      }
    ).annotations({
      description: "The label to create.",
    }),
  },
  $I.annotations("PayloadFrom", {
    description: "Labels are used to categorize messages and threads within the user's mailbox.",
  })
) {}

/**
 * Transforms user-friendly create label payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersLabelsCreate, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    const colorValue = O.flatMap(from.requestBody, (rb) => rb.color);

    return GmailSchemas.GmailParamsResourceUsersLabelsCreate.make({
      userId: "me",
      requestBody: GmailSchemas.GmailLabel.make({
        name: from.name,
        ...(O.isSome(from.requestBody) && O.isSome(from.requestBody.value.labelListVisibility)
          ? { labelListVisibility: from.requestBody.value.labelListVisibility.value }
          : {}),
        ...(O.isSome(from.requestBody) && O.isSome(from.requestBody.value.messageListVisibility)
          ? { messageListVisibility: from.requestBody.value.messageListVisibility.value }
          : {}),
        ...(O.isSome(colorValue)
          ? {
              color: GmailSchemas.GmailLabelColor.make({
                ...(O.isSome(colorValue.value.textColor) ? { textColor: colorValue.value.textColor.value } : {}),
                ...(O.isSome(colorValue.value.backgroundColor)
                  ? { backgroundColor: colorValue.value.backgroundColor.value }
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
    description: "CreateLabel success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("CreateLabel", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
