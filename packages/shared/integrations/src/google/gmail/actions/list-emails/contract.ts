import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-emails/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 10 }),
    query: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("PayloadFrom", {
    description: "ListEmails payload input.",
  })
) {}

/**
 * Transforms user-friendly list emails payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesList, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    const queryValue = O.flatMap(from.query, O.liftPredicate(Str.isNonEmpty));

    return GmailSchemas.GmailParamsResourceUsersMessagesList.make({
      userId: "me",
      maxResults: from.maxResults,
      ...(O.isSome(queryValue) ? { q: queryValue.value } : {}),
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
    data: S.Array(Models.Email),
  },
  $I.annotations("Success", {
    description: "ListEmails success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListEmails", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
