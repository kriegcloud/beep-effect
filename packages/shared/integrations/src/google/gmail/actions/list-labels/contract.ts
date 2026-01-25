import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-labels/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {},
  $I.annotations("PayloadFrom", {
    description: "ListLabels payload input.",
  })
) {}

/**
 * Transforms user-friendly list labels payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersLabelsList, {
  strict: true,
  decode: Effect.fnUntraced(function* (_from) {
    return GmailSchemas.GmailParamsResourceUsersLabelsList.make({
      userId: "me",
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
    data: S.Array(Models.Label),
  },
  $I.annotations("Success", {
    description: "ListLabels success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListLabels", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
