import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/search-emails/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    query: S.String,
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 10 }),
  },
  $I.annotations("PayloadFrom", {
    description: "SearchEmails payload input.",
  })
) {}

/**
 * Transforms user-friendly search emails payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesList, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    return GmailSchemas.GmailParamsResourceUsersMessagesList.make({
      userId: "me",
      maxResults: from.maxResults,
      q: from.query,
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
    description: "SearchEmails success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("SearchEmails", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
