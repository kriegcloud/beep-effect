import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { noOp, thunkEmptyStr } from "@beep/utils";
import type * as Gmail from "@googleapis/gmail";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Encoding from "effect/Encoding";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as GmailSchemas from "../common/gmail.schemas.ts";
import { EmailAttachment } from "./attachment.ts";

const $I = $SharedIntegrationsId.create("google/gmail/models/email");

export const parseMessageToEmail = (raw: Gmail.gmail_v1.Schema$Message, includeBody?: undefined | boolean) => {
  const headers = O.fromNullable(raw.payload?.headers).pipe(
    O.map((heads) =>
      A.reduce(heads, R.empty<string, string>(), (acc, header) => {
        if (header.name && header.value) acc[header.name.toLowerCase()] = header.value;
        return acc;
      })
    ),
    O.getOrElse(R.empty<string, string>)
  );
  const subject = headers.subject || "";
  const from = headers.from || "";
  const to = A.filter(Str.split(/,\s*/)(headers.to || ""), P.isNotNullable);
  const cc = headers.cc ? A.filter(Str.split(/,\s*/)(headers.cc), P.isNotNullable) : undefined;
  const bcc = headers.bcc ? A.filter(Str.split(/,\s*/)(headers.bcc), P.isNotNullable) : undefined;
  const date = headers.date || DateTime.unsafeNow().pipe(DateTime.toDateUtc);
  const attachments = A.empty<EmailAttachment>();

  let bodyText: string | undefined;
  if (includeBody) {
    bodyText = GmailSchemas.extractPlainTextBody(raw.payload);
  }

  return {
    id: raw.id || "",
    threadId: raw.threadId || "",
    subject,
    from,
    to,
    ...F.pipe(
      O.Do,
      O.bind("cc", () => O.fromNullable(cc)),
      O.bind("bcc", () => O.fromNullable(bcc)),
      O.map(F.identity),
      O.getOrElse(noOp)
    ),
    date,
    snippet: raw.snippet || "",
    body: bodyText,
    labels: (raw.labelIds || []) as ReadonlyArray<string>,
    attachments,
  };
};

export class Email extends S.Class<Email>($I`Email`)(
  {
    id: S.String,
    threadId: S.String,
    subject: S.String,
    from: S.String,
    to: S.Array(S.String),
    cc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    bcc: S.optionalWith(S.Array(S.String), { as: "Option" }),
    date: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    snippet: S.String,
    body: S.optionalWith(S.String, { as: "Option" }),
    labels: S.optionalWith(S.Array(S.String), { as: "Option" }),
    attachments: S.optionalWith(S.Array(EmailAttachment), { as: "Option" }),
  },
  $I.annotations("Email", {
    description: "Email",
  })
) {
  readonly toRaw = () =>
    F.pipe(
      A.make(
        `To: ${A.join(", ")(this.to)}`,
        this.cc.pipe(
          O.flatMap(O.liftPredicate(A.isNonEmptyReadonlyArray)),
          O.map(A.join(", ")),
          O.map((ccStr) => `Cc: ${ccStr}`),
          O.getOrNull
        ),
        this.bcc.pipe(
          O.flatMap(O.liftPredicate(A.isNonEmptyReadonlyArray)),
          O.map(A.join(", ")),
          O.map((bccStr) => `Cc: ${bccStr}`),
          O.getOrNull
        ),
        `Subject: ${this.subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        O.getOrElse(this.body, thunkEmptyStr)
      ),
      A.filter(P.isNotNullable),
      A.join("\r\n"),
      Encoding.encodeBase64Url
    );
}
