import { $SharedIntegrationsId } from "@beep/identity/packages";
import { Wrap } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";

const $I = $SharedIntegrationsId.create("google/gmail/actions/list-threads/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    q: S.optionalWith(S.String, { as: "Option" }),
    maxResults: S.optionalWith(S.NonNegativeInt, { default: () => 20 }),
    pageToken: S.optionalWith(S.String, { as: "Option" }),
    labelIds: S.optionalWith(S.Array(S.String).pipe(S.mutable), { as: "Option" }),
    includeSpamTrash: S.optionalWith(S.Boolean, { default: () => false }),
  },
  $I.annotations("PayloadFrom", {
    description: "ListThreads payload input.",
  })
) {}

export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersThreadsList, {
  strict: true,
  decode: Effect.fnUntraced(function* (from) {
    const queryValue = O.flatMap(from.q, O.liftPredicate(Str.isNonEmpty));

    return GmailSchemas.GmailParamsResourceUsersThreadsList.make({
      userId: "me",
      maxResults: from.maxResults,
      includeSpamTrash: from.includeSpamTrash,
      ...(O.isSome(queryValue) ? { q: queryValue.value } : {}),
      ...(O.isSome(from.pageToken) ? { pageToken: from.pageToken.value } : {}),
      ...(O.isSome(from.labelIds) ? { labelIds: from.labelIds.value } : {}),
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export class ThreadListItem extends S.Class<ThreadListItem>($I`ThreadListItem`)(
  {
    id: S.String,
    snippet: S.optionalWith(S.String, { as: "Option" }),
    historyId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("ThreadListItem", {
    description: "A thread item in the list response.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    threads: S.Array(ThreadListItem),
    nextPageToken: S.optionalWith(S.String, { as: "Option" }),
    resultSizeEstimate: S.optionalWith(S.Number, { as: "Option" }),
  },
  $I.annotations("Success", {
    description: "ListThreads success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("ListThreads", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
