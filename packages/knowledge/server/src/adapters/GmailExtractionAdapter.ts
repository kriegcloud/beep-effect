import { GoogleAuthClient } from "@beep/google-workspace-client";
import { type GmailExtractionError, GmailScopes, GoogleApiError } from "@beep/google-workspace-domain";
import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("adapters/GmailExtractionAdapter");

export const REQUIRED_SCOPES = [GmailScopes.read] as const;

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

// Gmail message payloads use MIME types beyond our file-focused BS.MimeType union
// (e.g. `multipart/alternative`), so we intentionally accept any string here.
const GmailMimeType = S.String.annotations(
  $I.annotations("GmailMimeType", {
    description: "MIME type from Gmail message payload/parts (e.g. text/plain, text/html, multipart/alternative).",
  })
);

export class EmailMetadata extends S.Class<EmailMetadata>($I`EmailMetadata`)(
  {
    from: S.String,
    to: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    cc: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
    date: S.optionalWith(S.OptionFromSelf(BS.DateTimeUtcFromAllAcceptable), { default: O.none<DateTime.Utc> }),
    threadId: S.String,
    labels: S.optionalWith(S.Array(S.String), { default: A.empty<string> }),
  },
  $I.annotations("EmailMetadata", {
    description: "Normalized email metadata extracted from Gmail headers (participants, date, thread, labels).",
  })
) {}

export class ExtractedEmailSourceType extends BS.StringLiteralKit("gmail").annotations(
  $I.annotations("ExtractedEmailSourceType", {
    description: "Source discriminator for extracted email documents (currently only Gmail).",
  })
) {}

export class ExtractedEmailDocument extends S.Class<ExtractedEmailDocument>($I`ExtractedEmailDocument`)(
  {
    sourceId: S.String,
    sourceType: ExtractedEmailSourceType,
    title: S.optionalWith(S.String, { default: () => "(No Subject)" }),
    content: S.optionalWith(S.String, { default: thunkEmptyStr }),
    metadata: EmailMetadata,
    extractedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ExtractedEmailDocument", {
    description:
      "An email document extracted from Gmail for knowledge graph processing, containing the message content, metadata (sender, recipients, dates), and extraction timestamp.",
  })
) {}

class ThreadContextDateRange extends S.Class<ThreadContextDateRange>($I`ThreadContextDateRange`)(
  {
    earliest: BS.DateTimeUtcFromAllAcceptable,
    latest: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("ThreadContextDateRange", {
    description:
      "The temporal boundaries of an email thread, capturing the earliest and latest message timestamps to establish the thread's time span.",
  })
) {}

export class ThreadContext extends S.Class<ThreadContext>($I`ThreadContext`)(
  {
    threadId: S.String,
    subject: S.String,
    participants: S.Array(S.String),
    messages: S.Array(ExtractedEmailDocument),
    dateRange: ThreadContextDateRange,
  },
  $I.annotations("ThreadContext", {
    description:
      "Complete context for an email thread, aggregating all messages with their extracted content, the full list of participants, subject line, and the temporal range spanning from the earliest to latest message in the conversation.",
  })
) {}

export class GmailMessageHeader extends S.Class<GmailMessageHeader>($I`GmailMessageHeader`)(
  {
    name: S.String,
    value: S.String,
  },
  $I.annotations("GmailMessageHeader", {
    description:
      "A single header field from a Gmail message, representing a key-value pair such as 'From', 'To', 'Subject', 'Date', or custom headers that provide metadata about the email.",
  })
) {}

export class GmailMessagePartBody extends S.Class<GmailMessagePartBody>($I`GmailMessagePartBody`)(
  {
    attachmentId: S.optional(S.String),
    size: S.Number,
    data: S.optional(S.String),
  },
  $I.annotations("GmailMessagePartBody", {
    description:
      "The body content of a Gmail message part, containing the actual data (base64url encoded), its size in bytes, and optionally an attachment ID for retrieving large attachments separately via the Gmail API.",
  })
) {}

export class GmailMessagePart extends S.Class<GmailMessagePart>($I`GmailMessagePart`)(
  {
    partId: S.String,
    mimeType: GmailMimeType,
    filename: S.String,
    headers: S.Array(GmailMessageHeader),
    body: GmailMessagePartBody,
    parts: S.optional(S.Unknown),
  },
  $I.annotations("GmailMessagePart", {
    description:
      "A structural component of a Gmail message representing a single MIME part, containing the part identifier, MIME type, filename (for attachments), headers specific to this part, the body content, and optionally nested parts for multipart messages.",
  })
) {}

export class GmailMessagePayload extends S.Class<GmailMessagePayload>($I`GmailMessagePayload`)({
  partId: S.optional(S.String),
  mimeType: S.optional(GmailMimeType),
  filename: S.optional(S.String),
  headers: S.optional(S.Array(GmailMessageHeader)),
  body: S.optional(GmailMessagePartBody),
  parts: S.optional(S.Array(GmailMessagePart)),
}) {}

export class GmailMessage extends S.Class<GmailMessage>($I`GmailMessage`)({
  id: S.String,
  threadId: S.String,
  labelIds: S.optional(S.Array(S.String)),
  snippet: S.optional(S.String),
  historyId: S.optional(S.String),
  internalDate: S.optional(S.String),
  payload: S.optional(GmailMessagePayload),
  sizeEstimate: S.optional(S.Number),
  raw: S.optional(S.String),
}) {}

export class GmailMessagesListResponseMessage extends S.Class<GmailMessagesListResponseMessage>(
  $I`GmailMessagesListResponseMessage`
)({
  id: S.String,
  threadId: S.String,
}) {}

export class GmailMessagesListResponse extends S.Class<GmailMessagesListResponse>($I`GmailMessagesListResponse`)({
  messages: S.optional(S.Array(GmailMessagesListResponseMessage)),
  nextPageToken: S.optional(S.String),
  resultSizeEstimate: S.optional(S.Number),
}) {}

export class GmailThread extends S.Class<GmailThread>($I`GmailThread`)({
  id: S.String,
  historyId: S.optional(S.String),
  messages: S.optional(S.Array(GmailMessage)),
}) {}

const findHeader = (
  headers: ReadonlyArray<{ readonly name: string; readonly value: string }> | undefined,
  name: string
): O.Option<string> =>
  F.pipe(
    O.fromNullable(headers),
    O.flatMap((hdrs) => {
      const lowerName = Str.toLowerCase(name);
      return F.pipe(
        A.findFirst(hdrs, (h) => Str.toLowerCase(h.name) === lowerName),
        O.map((h) => h.value)
      );
    })
  );

const parseEmailList = (value: string): ReadonlyArray<string> =>
  F.pipe(
    Str.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)(value),
    O.map(A.fromIterable),
    O.getOrElse(A.empty<string>)
  );

const parseDate = (internalDate: string | undefined): O.Option<DateTime.Utc> =>
  F.pipe(
    O.fromNullable(internalDate),
    O.map((d) => Number.parseInt(d, 10)),
    O.filter(P.not(Number.isNaN)),
    O.map(DateTime.unsafeMake)
  );

const decodeBase64Url = (encoded: string): string => {
  const base64 = F.pipe(encoded, Str.replaceAll("-", "+"), Str.replaceAll("_", "/"));
  const len = Str.length(base64);
  const remainder = len % 4;
  const padded = remainder === 0 ? base64 : base64 + "=".repeat(4 - remainder);
  return Either.try(() => atob(padded)).pipe(Either.getOrElse(thunkEmptyStr));
};

export class PartBody extends S.Class<PartBody>($I`PartBody`)({
  data: S.optional(S.String),
}) {}

export class PartLike extends S.Class<PartLike>($I`PartLike`)({
  mimeType: S.optional(GmailMimeType),
  body: S.optional(PartBody),
  parts: S.optional(S.Unknown),
}) {}

export class PayloadLikeBody extends S.Class<PayloadLikeBody>($I`PayloadLikeBody`)({
  attachmentId: S.optional(S.String),
  // Gmail returns a numeric byte count here (and our decoded GmailMessagePartBody uses Number).
  size: S.optional(S.Number),
  data: S.optional(S.String),
}) {}

export class PayloadLike extends S.Class<PayloadLike>($I`PayloadLike`)({
  partId: S.optional(S.String),
  mimeType: S.optional(GmailMimeType),
  filename: S.optional(S.String),
  headers: S.optional(S.Array(GmailMessageHeader)),
  body: S.optional(PayloadLikeBody),
  parts: S.optional(S.Unknown),
}) {}

const isPartArray = (parts: unknown): parts is ReadonlyArray<PartLike> =>
  A.isArray(parts) && A.every(parts, (p) => P.isNotNull(p) && P.isObject(p));

const extractTextContent = (payload: PayloadLike | undefined): string => {
  if (!payload) return Str.empty;

  if (payload.body?.data) {
    const mimeType = payload.mimeType ?? Str.empty;
    if (mimeType === "text/plain" || !Str.includes("html")(mimeType)) {
      return decodeBase64Url(payload.body.data);
    }
  }

  if (payload.parts && isPartArray(payload.parts)) {
    const parts = payload.parts;
    const plainPart = A.findFirst(parts, (p) => p.mimeType === "text/plain");
    if (O.isSome(plainPart) && plainPart.value.body?.data) {
      return decodeBase64Url(plainPart.value.body.data);
    }

    const htmlPart = A.findFirst(parts, (p) => p.mimeType === "text/html");
    if (O.isSome(htmlPart) && htmlPart.value.body?.data) {
      return stripHtml(decodeBase64Url(htmlPart.value.body.data));
    }

    const nestedContent = A.findFirst(parts, (part) => {
      if (!part.parts || !isPartArray(part.parts)) return false;
      const nested = extractTextContent(new PayloadLike(part));
      return !Str.isEmpty(nested);
    }).pipe(
      O.flatMap(O.liftPredicate((part): part is PayloadLike => P.isNotNullable(part.parts) && isPartArray(part.parts))),
      O.map(extractTextContent)
    );

    if (O.isSome(nestedContent)) {
      return nestedContent.value;
    }
  }

  return Str.empty;
};

const stripHtml = (html: string): string =>
  F.pipe(
    html,
    Str.replaceAll(/<style[^>]*>[\s\S]*?<\/style>/gi, ""),
    Str.replaceAll(/<script[^>]*>[\s\S]*?<\/script>/gi, ""),
    Str.replaceAll(/<[^>]+>/g, " "),
    Str.replaceAll(/&nbsp;/g, " "),
    Str.replaceAll(/&amp;/g, "&"),
    Str.replaceAll(/&lt;/g, "<"),
    Str.replaceAll(/&gt;/g, ">"),
    Str.replaceAll(/&quot;/g, '"'),
    Str.replaceAll(/&#39;/g, "'"),
    Str.replaceAll(/\s+/g, " "),
    Str.trim
  );

type ExtractedEmailDocumentEncoded = S.Schema.Encoded<typeof ExtractedEmailDocument>;

const decodeExtractedEmailDocument = (u: unknown): Effect.Effect<ExtractedEmailDocument, GoogleApiError> =>
  S.decodeUnknown(ExtractedEmailDocument)(u).pipe(
    Effect.mapError(
      (cause) =>
        new GoogleApiError({
          message: `Failed to decode extracted email document: ${String(cause)}`,
          statusCode: 500,
          endpoint: "GmailExtractionAdapter.decodeExtractedEmailDocument",
        })
    )
  );

const buildExtractedDocument = (message: GmailMessage, extractedAt: DateTime.Utc): ExtractedEmailDocumentEncoded => {
  const headers = message.payload?.headers;
  const messagePayload = S.decodeUnknownSync(PayloadLike)(message.payload);
  const subject = findHeader(headers, "Subject").pipe(O.getOrElse(() => "(No Subject)"));
  const from = findHeader(headers, "From").pipe(O.getOrElse(thunkEmptyStr));
  const to = findHeader(headers, "To").pipe(O.map(parseEmailList), O.getOrElse(A.empty<string>));
  const cc = findHeader(headers, "Cc").pipe(O.map(parseEmailList), O.getOrElse(A.empty<string>));
  const date = parseDate(message.internalDate);
  const content = extractTextContent(messagePayload);

  return {
    sourceId: message.id,
    sourceType: "gmail",
    title: subject,
    content,
    metadata: {
      from,
      to,
      cc,
      date,
      threadId: message.threadId,
      labels: message.labelIds ?? A.empty<string>(),
    },
    extractedAt,
  };
};

export interface GmailExtractionAdapterShape {
  readonly extractEmailsForKnowledgeGraph: (
    query: string,
    providerAccountId: string,
    maxResults?: undefined | number
  ) => Effect.Effect<ReadonlyArray<ExtractedEmailDocument>, GmailExtractionError.Type>;
  readonly extractThreadContext: (
    threadId: string,
    providerAccountId: string
  ) => Effect.Effect<ThreadContext, GmailExtractionError.Type>;
}

export class GmailExtractionAdapter extends Context.Tag($I`GmailExtractionAdapter`)<
  GmailExtractionAdapter,
  GmailExtractionAdapterShape
>() {}

const serviceEffect: Effect.Effect<GmailExtractionAdapterShape, never, HttpClient.HttpClient | GoogleAuthClient> =
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    const makeAuthorizedRequest = Effect.fn(function* <A, I, R>(
      request: HttpClientRequest.HttpClientRequest,
      schema: S.Schema<A, I, R>,
      providerAccountId: string
    ) {
      const token = yield* auth.getValidToken(REQUIRED_SCOPES, providerAccountId);
      const accessToken = O.getOrThrow(token.accessToken);

      return yield* http.execute(request.pipe(HttpClientRequest.bearerToken(accessToken))).pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(schema)),
        Effect.mapError(
          (error) =>
            new GoogleApiError({
              message: `Gmail API request failed: ${String(error)}`,
              statusCode: 500,
              endpoint: request.url,
            })
        ),
        Effect.scoped
      );
    });

    const fetchMessage = (messageId: string, providerAccountId: string) =>
      makeAuthorizedRequest(
        HttpClientRequest.get(`${GMAIL_API_BASE}/messages/${messageId}`).pipe(
          HttpClientRequest.setUrlParam("format", "full")
        ),
        GmailMessage,
        providerAccountId
      ).pipe(
        Effect.withSpan("GmailExtractionAdapter.fetchMessage", {
          captureStackTrace: false,
          attributes: { messageId },
        })
      );

    const fetchThread = (threadId: string, providerAccountId: string) =>
      makeAuthorizedRequest(
        HttpClientRequest.get(`${GMAIL_API_BASE}/threads/${threadId}`).pipe(
          HttpClientRequest.setUrlParam("format", "full")
        ),
        GmailThread,
        providerAccountId
      ).pipe(
        Effect.withSpan("GmailExtractionAdapter.fetchThread", {
          captureStackTrace: false,
          attributes: { threadId },
        })
      );

    const extractEmailsForKnowledgeGraph = (query: string, providerAccountId: string, maxResults = 50) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Extracting emails for knowledge graph").pipe(
          // Hardening (C-04 / R13): do not log raw query text, which can contain PII (emails, names, subjects).
          Effect.annotateLogs({ maxResults, hasQuery: !Str.isEmpty(query) })
        );

        const listResponse = yield* makeAuthorizedRequest(
          HttpClientRequest.get(`${GMAIL_API_BASE}/messages`).pipe(
            HttpClientRequest.setUrlParam("q", query),
            HttpClientRequest.setUrlParam("maxResults", String(maxResults))
          ),
          GmailMessagesListResponse,
          providerAccountId
        );

        const messageRefs = listResponse.messages ?? [];
        if (A.isEmptyReadonlyArray(messageRefs)) {
          yield* Effect.logDebug("No messages found");
          return [];
        }

        yield* Effect.logDebug("Fetching message details").pipe(Effect.annotateLogs({ count: A.length(messageRefs) }));

        const messages = yield* Effect.all(
          A.map(messageRefs, (ref) => fetchMessage(ref.id, providerAccountId)),
          { concurrency: 10 }
        );

        const extractedAt = DateTime.unsafeNow();
        const rawDocuments = A.map(messages, (msg) => buildExtractedDocument(msg, extractedAt));
        const documents = yield* Effect.forEach(rawDocuments, (doc) => decodeExtractedEmailDocument(doc), {
          concurrency: 10,
        });

        yield* Effect.logInfo("Email extraction complete").pipe(
          Effect.annotateLogs({ extracted: A.length(documents) })
        );

        return documents;
      }).pipe(
        Effect.withSpan("GmailExtractionAdapter.extractEmailsForKnowledgeGraph", {
          captureStackTrace: false,
          attributes: { query, maxResults },
        })
      );

    const extractThreadContext = (threadId: string, providerAccountId: string) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Extracting thread context").pipe(Effect.annotateLogs({ threadId }));

        const thread = yield* fetchThread(threadId, providerAccountId);
        const messages = thread.messages ?? [];

        if (A.isEmptyReadonlyArray(messages)) {
          return yield* new GoogleApiError({
            message: `Thread ${threadId} contains no messages`,
            statusCode: 404,
            endpoint: `${GMAIL_API_BASE}/threads/${threadId}`,
          });
        }

        const extractedAt = DateTime.unsafeNow();
        const rawDocuments = A.map(messages, (msg) => buildExtractedDocument(msg, extractedAt));
        const extractedMessages = yield* Effect.forEach(rawDocuments, (doc) => decodeExtractedEmailDocument(doc), {
          concurrency: 10,
        });

        const subject = F.pipe(
          A.head(extractedMessages),
          O.map((m) => m.title),
          O.getOrElse(() => "(No Subject)")
        );

        const allParticipants = A.flatMap(extractedMessages, (doc) =>
          F.pipe(A.make(doc.metadata.from), A.appendAll(doc.metadata.to), A.appendAll(doc.metadata.cc))
        );
        const uniqueParticipants = F.pipe(
          allParticipants,
          A.filter((p) => !Str.isEmpty(p)),
          A.dedupe
        );

        const dates = A.filterMap(extractedMessages, (doc) => doc.metadata.date);
        const sortedDates = A.sort(dates, DateTime.Order);
        const earliest = A.head(sortedDates);
        const latest = A.last(sortedDates);

        const context: ThreadContext = {
          threadId,
          subject,
          participants: uniqueParticipants,
          messages: extractedMessages,
          dateRange: {
            earliest: O.getOrElse(earliest, () => extractedAt),
            latest: O.getOrElse(latest, () => extractedAt),
          },
        };

        yield* Effect.logInfo("Thread context extraction complete").pipe(
          Effect.annotateLogs({
            threadId,
            messageCount: A.length(extractedMessages),
            participantCount: A.length(uniqueParticipants),
          })
        );

        return context;
      }).pipe(
        Effect.withSpan("GmailExtractionAdapter.extractThreadContext", {
          captureStackTrace: false,
          attributes: { threadId },
        })
      );

    return GmailExtractionAdapter.of({
      extractEmailsForKnowledgeGraph,
      extractThreadContext,
    });
  });
export const GmailExtractionAdapterLive = Layer.effect(GmailExtractionAdapter, serviceEffect);
