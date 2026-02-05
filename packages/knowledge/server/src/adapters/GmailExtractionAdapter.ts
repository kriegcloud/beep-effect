import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GmailScopes,
  GoogleApiError,
  type GoogleAuthenticationError,
  type GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
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

export const REQUIRED_SCOPES = [GmailScopes.read] as const;

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface EmailMetadata {
  readonly from: string;
  readonly to: ReadonlyArray<string>;
  readonly cc: ReadonlyArray<string>;
  readonly date: O.Option<DateTime.Utc>;
  readonly threadId: string;
  readonly labels: ReadonlyArray<string>;
}

export interface ExtractedEmailDocument {
  readonly sourceId: string;
  readonly sourceType: "gmail";
  readonly title: string;
  readonly content: string;
  readonly metadata: EmailMetadata;
  readonly extractedAt: DateTime.Utc;
}

export interface ThreadContext {
  readonly threadId: string;
  readonly subject: string;
  readonly participants: ReadonlyArray<string>;
  readonly messages: ReadonlyArray<ExtractedEmailDocument>;
  readonly dateRange: {
    readonly earliest: DateTime.Utc;
    readonly latest: DateTime.Utc;
  };
}

const GmailMessageHeaderSchema = S.Struct({
  name: S.String,
  value: S.String,
});

const GmailMessagePartBodySchema = S.Struct({
  attachmentId: S.optional(S.String),
  size: S.Number,
  data: S.optional(S.String),
});

const GmailMessagePartSchema = S.Struct({
  partId: S.String,
  mimeType: S.String,
  filename: S.String,
  headers: S.Array(GmailMessageHeaderSchema),
  body: GmailMessagePartBodySchema,
  parts: S.optional(S.Unknown),
});

const GmailMessageSchema = S.Struct({
  id: S.String,
  threadId: S.String,
  labelIds: S.optional(S.Array(S.String)),
  snippet: S.optional(S.String),
  historyId: S.optional(S.String),
  internalDate: S.optional(S.String),
  payload: S.optional(
    S.Struct({
      partId: S.optional(S.String),
      mimeType: S.optional(S.String),
      filename: S.optional(S.String),
      headers: S.optional(S.Array(GmailMessageHeaderSchema)),
      body: S.optional(GmailMessagePartBodySchema),
      parts: S.optional(S.Array(GmailMessagePartSchema)),
    })
  ),
  sizeEstimate: S.optional(S.Number),
  raw: S.optional(S.String),
});

type GmailMessage = S.Schema.Type<typeof GmailMessageSchema>;

const GmailMessagesListResponseSchema = S.Struct({
  messages: S.optional(
    S.Array(
      S.Struct({
        id: S.String,
        threadId: S.String,
      })
    )
  ),
  nextPageToken: S.optional(S.String),
  resultSizeEstimate: S.optional(S.Number),
});

const GmailThreadSchema = S.Struct({
  id: S.String,
  historyId: S.optional(S.String),
  messages: S.optional(S.Array(GmailMessageSchema)),
});

type GmailExtractionError = GoogleApiError | GoogleAuthenticationError | GoogleScopeExpansionRequiredError;

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

type PartLike = {
  readonly mimeType?: string | undefined;
  readonly body?: { readonly data?: string | undefined } | undefined;
  readonly parts?: unknown;
};

type PayloadLike = {
  readonly partId?: string | undefined;
  readonly mimeType?: string | undefined;
  readonly filename?: string | undefined;
  readonly headers?: ReadonlyArray<{ readonly name: string; readonly value: string }> | undefined;
  readonly body?:
    | { readonly attachmentId?: string | undefined; readonly size: number; readonly data?: string | undefined }
    | undefined;
  readonly parts?: unknown;
};

const isPartArray = (parts: unknown): parts is ReadonlyArray<PartLike> =>
  A.isArray(parts) && A.every(parts, (p) => P.isNotNull(p) && P.isObject(p));

const extractTextContent = (payload: PayloadLike | undefined): string => {
  if (!payload) return Str.empty;

  if (payload.body?.data) {
    const mimeType = payload.mimeType ?? Str.empty;
    if (BS.MimeType.is["text/plain"](mimeType) || !Str.includes("html")(mimeType)) {
      return decodeBase64Url(payload.body.data);
    }
  }

  if (payload.parts && isPartArray(payload.parts)) {
    const parts = payload.parts;
    const plainPart = A.findFirst(parts, (p) => BS.MimeType.is["text/plain"](p.mimeType));
    if (O.isSome(plainPart) && plainPart.value.body?.data) {
      return decodeBase64Url(plainPart.value.body.data);
    }

    const htmlPart = A.findFirst(parts, (p) => BS.MimeType.is["text/html"](p.mimeType));
    if (O.isSome(htmlPart) && htmlPart.value.body?.data) {
      return stripHtml(decodeBase64Url(htmlPart.value.body.data));
    }

    const nestedContent = A.findFirst(parts, (part) => {
      if (!part.parts || !isPartArray(part.parts)) return false;
      const nested = extractTextContent(part as PayloadLike);
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

const toExtractedDocument = (message: GmailMessage, extractedAt: DateTime.Utc): ExtractedEmailDocument => {
  const headers = message.payload?.headers;
  const subject = findHeader(headers, "Subject").pipe(O.getOrElse(() => "(No Subject)"));
  const from = findHeader(headers, "From").pipe(O.getOrElse(thunkEmptyStr));
  const to = findHeader(headers, "To").pipe(O.map(parseEmailList), O.getOrElse(A.empty<string>));
  const cc = findHeader(headers, "Cc").pipe(O.map(parseEmailList), O.getOrElse(A.empty<string>));
  const date = parseDate(message.internalDate);
  const content = extractTextContent(message.payload);

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
    maxResults?: undefined | number
  ) => Effect.Effect<ReadonlyArray<ExtractedEmailDocument>, GmailExtractionError>;
  readonly extractThreadContext: (threadId: string) => Effect.Effect<ThreadContext, GmailExtractionError>;
}

export class GmailExtractionAdapter extends Context.Tag("GmailExtractionAdapter")<
  GmailExtractionAdapter,
  GmailExtractionAdapterShape
>() {}

const serviceEffect: Effect.Effect<GmailExtractionAdapterShape, never, HttpClient.HttpClient | GoogleAuthClient> =
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    const makeAuthorizedRequest = Effect.fn(function* <A, I, R>(
      request: HttpClientRequest.HttpClientRequest,
      schema: S.Schema<A, I, R>
    ) {
      const token = yield* auth.getValidToken(REQUIRED_SCOPES);
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

    const fetchMessage = (messageId: string) =>
      makeAuthorizedRequest(
        HttpClientRequest.get(`${GMAIL_API_BASE}/messages/${messageId}`).pipe(
          HttpClientRequest.setUrlParam("format", "full")
        ),
        GmailMessageSchema
      ).pipe(
        Effect.withSpan("GmailExtractionAdapter.fetchMessage", {
          captureStackTrace: false,
          attributes: { messageId },
        })
      );

    const fetchThread = (threadId: string) =>
      makeAuthorizedRequest(
        HttpClientRequest.get(`${GMAIL_API_BASE}/threads/${threadId}`).pipe(
          HttpClientRequest.setUrlParam("format", "full")
        ),
        GmailThreadSchema
      ).pipe(
        Effect.withSpan("GmailExtractionAdapter.fetchThread", {
          captureStackTrace: false,
          attributes: { threadId },
        })
      );

    const extractEmailsForKnowledgeGraph = (query: string, maxResults = 50) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Extracting emails for knowledge graph").pipe(
          Effect.annotateLogs({ query, maxResults })
        );

        const listResponse = yield* makeAuthorizedRequest(
          HttpClientRequest.get(`${GMAIL_API_BASE}/messages`).pipe(
            HttpClientRequest.setUrlParam("q", query),
            HttpClientRequest.setUrlParam("maxResults", String(maxResults))
          ),
          GmailMessagesListResponseSchema
        );

        const messageRefs = listResponse.messages ?? [];
        if (A.isEmptyReadonlyArray(messageRefs)) {
          yield* Effect.logDebug("No messages found");
          return [];
        }

        yield* Effect.logDebug("Fetching message details").pipe(Effect.annotateLogs({ count: A.length(messageRefs) }));

        const messages = yield* Effect.all(
          A.map(messageRefs, (ref) => fetchMessage(ref.id)),
          { concurrency: 10 }
        );

        const extractedAt = DateTime.unsafeNow();
        const documents = A.map(messages, (msg) => toExtractedDocument(msg, extractedAt));

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

    const extractThreadContext = (threadId: string) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("Extracting thread context").pipe(Effect.annotateLogs({ threadId }));

        const thread = yield* fetchThread(threadId);
        const messages = thread.messages ?? [];

        if (A.isEmptyReadonlyArray(messages)) {
          return yield* new GoogleApiError({
            message: `Thread ${threadId} contains no messages`,
            statusCode: 404,
            endpoint: `${GMAIL_API_BASE}/threads/${threadId}`,
          });
        }

        const extractedAt = DateTime.unsafeNow();
        const extractedMessages = A.map(messages, (msg) => toExtractedDocument(msg, extractedAt));

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
