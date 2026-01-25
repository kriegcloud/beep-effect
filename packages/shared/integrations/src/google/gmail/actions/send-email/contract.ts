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

const $I = $SharedIntegrationsId.create("google/gmail/actions/send-email/contract");

class Attachment extends S.Class<Attachment>($I`Attachment`)(
  {
    filename: BS.NameAttribute,
    content: S.Union(S.String, BS.CustomBuffer),
    contentType: S.optionalWith(BS.MimeType, { as: "Option" }),
  },
  $I.annotations("Attachment", {
    description: "Attachment for email.",
  })
) {}

class Options extends S.Class<Options>($I`Options`)(
  {
    cc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
    bcc: S.optionalWith(S.Array(BS.Email), { default: A.empty<BS.Email.Type> }),
    attachments: S.optionalWith(S.Array(Attachment), { default: A.empty<Attachment> }),
  },
  $I.annotations("Options", {
    description: "Options for email.",
  })
) {}

export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    to: S.Array(BS.Email),
    subject: S.String,
    body: S.String,
    options: S.optionalWith(Options, { default: () => Options.make({}) }),
  },
  $I.annotations("PayloadFrom", {
    description: "Send email payload.",
  })
) {}

/**
 * Transforms user-friendly email payload into Gmail API send parameters.
 * The decoded type matches GmailParamsResourceUsersMessagesSend exactly.
 */
export const Payload = S.transformOrFail(PayloadFrom, GmailSchemas.GmailParamsResourceUsersMessagesSend, {
  strict: true,
  decode: Effect.fnUntraced(function* (from, _options, ast) {
    // Build raw email from user input
    const rawEmail = yield* S.decode(Common.RawEmail)({
      to: A.map(from.to, Redacted.value),
      subject: from.subject,
      body: from.body,
      cc: A.map(O.getOrElse(O.fromNullable(from.options?.cc), A.empty<BS.Email.Type>), Redacted.value),
      bcc: A.map(O.getOrElse(O.fromNullable(from.options?.bcc), A.empty<BS.Email.Type>), Redacted.value),
    }).pipe(Effect.mapError((error) => new ParseResult.Type(ast, from, `Failed to build raw email: ${error}`)));

    const raw = rawEmail.toRawString();

    // Return Gmail API compatible params
    return GmailSchemas.GmailParamsResourceUsersMessagesSend.make({
      userId: "me",
      requestBody: GmailSchemas.GmailMessage.make({
        raw,
      }),
    });
  }),
  encode: Effect.fnUntraced(function* (_to, _options, ast) {
    // Encoding from API params back to PayloadFrom is not supported
    // as we don't have the original email fields in the raw format
    return yield* Effect.fail(
      new ParseResult.Type(ast, _to, "Encoding from Gmail API params to PayloadFrom is not supported")
    );
  }),
});

export type Payload = S.Schema.Type<typeof Payload>;

export const Wrapper = Wrap.Wrapper.make("SendEmail", {
  payload: Payload,
  success: S.Void,
  error: GmailMethodError,
});
