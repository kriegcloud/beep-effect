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

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-drafts/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    q: S.optionalWith(S.String, { as: "Option" }),
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 20 }),
    pageToken: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("PayloadFrom", {
    description: "ListDrafts payload input.",
  })
) {}

/**
 * Transforms user-friendly list drafts payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersDraftsList, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    const queryValue = O.flatMap(from.q, O.liftPredicate(Str.isNonEmpty));
    const pageTokenValue = O.flatMap(from.pageToken, O.liftPredicate(Str.isNonEmpty));

    return GmailSchemas.GmailParamsResourceUsersDraftsList.make({
      userId: "me",
      maxResults: from.maxResults,
      ...(O.isSome(queryValue) ? { q: queryValue.value } : {}),
      ...(O.isSome(pageTokenValue) ? { pageToken: pageTokenValue.value } : {}),
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export class DraftItem extends S.Class<DraftItem>($I`DraftItem`)(
  {
    id: S.String,
    message: Models.Email,
  },
  $I.annotations("DraftItem", {
    description: "A draft item with its message.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    drafts: S.Array(DraftItem),
    nextPageToken: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("Success", {
    description: "ListDrafts success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListDrafts", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
