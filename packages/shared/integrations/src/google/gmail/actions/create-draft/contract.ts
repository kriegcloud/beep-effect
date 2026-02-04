import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Wrap } from "@beep/wrap";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { Common } from "../../common";
import * as GmailSchemas from "../../common/gmail.schemas.ts";
import { GmailMethodError } from "../../errors.ts";
import { Models } from "../../models";

const $I = $SharedIntegrationsId.create("google/gmail/actions/create-draft/contract");

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    to: S.Array(BS.Email),
    subject: S.String,
    body: S.optionalWith(S.String, { default: () => "" }),
    cc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
    bcc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
    threadId: S.optionalWith(S.String, { as: "Option" }),
  },
  $I.annotations("PayloadFrom", {
    description: "CreateDraft payload input.",
  })
) {}

/**
 * Transforms user-friendly create draft payload into Gmail API parameters.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersDraftsCreate, {
  strict: true,
  decode: Effect.fnUntraced(function* (from, _options, ast) {
    const rawEmail = yield* S.decode(Common.RawEmail)({
      to: A.map(from.to, Redacted.value),
      subject: from.subject,
      body: from.body,
      cc: A.map(from.cc, Redacted.value),
      bcc: A.map(from.bcc, Redacted.value),
    }).pipe(Effect.mapError((error) => new ParseResult.Type(ast, from, `Failed to build raw email: ${error}`)));

    const raw = rawEmail.toRawString();

    const message = GmailSchemas.GmailMessage.make({
      raw,
      ...(O.isSome(from.threadId) ? { threadId: from.threadId.value } : {}),
    });

    return GmailSchemas.GmailParamsResourceUsersDraftsCreate.make({
      userId: "me",
      requestBody: GmailSchemas.GmailDraft.make({
        message,
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

export class Success extends S.Class<Success>($I`Success`)(
  {
    id: S.String,
    message: Models.Email,
  },
  $I.annotations("Success", {
    description: "CreateDraft success response.",
  })
) {}

export const Wrapper = Wrap.Wrapper.make("CreateDraft", {
  payload: Payload,
  success: Success,
  error: GmailMethodError,
});
