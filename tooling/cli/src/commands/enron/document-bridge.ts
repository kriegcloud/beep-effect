import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { makeDeterministicEmailId, makeDeterministicId } from "./parser.js";
import { EnronDocument, EnronDocumentSpan, type EnronEmail, type EnronThread } from "./schemas.js";

const decodeDocument = (input: unknown): Effect.Effect<EnronDocument, ParseResult.ParseError> =>
  S.decodeUnknown(EnronDocument)(input);

const dedupeRecipients = (email: EnronEmail): ReadonlyArray<string> =>
  A.dedupe(
    [...email.to, ...email.cc, ...email.bcc]
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0)
  );

const buildBodySpans = (body: string): ReadonlyArray<EnronDocumentSpan> => {
  if (body.length === 0) {
    return A.empty<EnronDocumentSpan>();
  }

  return [
    new EnronDocumentSpan({
      label: "body",
      start: 0,
      end: body.length,
    }),
  ];
};

export const toEnronDocument = (
  email: EnronEmail,
  threadId?: string
): Effect.Effect<EnronDocument, ParseResult.ParseError> => {
  const resolvedThreadId = threadId ?? makeDeterministicId("thread", email.messageId);

  return decodeDocument({
    id: makeDeterministicEmailId(email.messageId),
    title: email.subject,
    body: email.body,
    metadata: {
      sender: email.from,
      recipients: dedupeRecipients(email),
      threadId: resolvedThreadId,
      messageId: email.messageId,
      originalDate: email.date.toISOString(),
      folder: email.folder,
      user: email.user,
      inReplyTo: email.inReplyTo,
      references: email.references,
    },
    spans: buildBodySpans(email.body),
  });
};

export const threadToEnronDocuments = (
  thread: EnronThread
): Effect.Effect<ReadonlyArray<EnronDocument>, ParseResult.ParseError> =>
  Effect.forEach(thread.messages, (message) => toEnronDocument(message, thread.threadId), { concurrency: "unbounded" });

export const emailsToEnronDocuments = (
  emails: ReadonlyArray<EnronEmail>
): Effect.Effect<ReadonlyArray<EnronDocument>, ParseResult.ParseError> =>
  Effect.forEach(emails, (email) => toEnronDocument(email), { concurrency: "unbounded" });
