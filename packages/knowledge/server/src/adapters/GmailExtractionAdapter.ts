/**
 * GmailExtractionAdapter - Gmail email extraction for knowledge graph ingestion
 *
 * This adapter is READ-ONLY and specifically designed for knowledge extraction.
 * It extracts emails in a format optimized for entity/relation extraction
 * in the knowledge graph pipeline.
 *
 * @module knowledge-server/adapters/GmailExtractionAdapter
 * @since 0.1.0
 */

import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GmailScopes,
  GoogleApiError,
  type GoogleAuthenticationError,
  type GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// =============================================================================
// Constants
// =============================================================================

/**
 * Required OAuth scopes for email extraction.
 * Only read scope is needed - this adapter does not send emails.
 */
export const REQUIRED_SCOPES = [GmailScopes.read] as const;

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

// =============================================================================
// Output Types (Knowledge Graph Oriented)
// =============================================================================

/**
 * Email metadata extracted for knowledge graph processing
 */
export interface EmailMetadata {
  readonly from: string;
  readonly to: ReadonlyArray<string>;
  readonly cc: ReadonlyArray<string>;
  readonly date: O.Option<DateTime.Utc>;
  readonly threadId: string;
  readonly labels: ReadonlyArray<string>;
}

/**
 * Extracted email document optimized for knowledge graph ingestion
 */
export interface ExtractedEmailDocument {
  readonly sourceId: string;
  readonly sourceType: "gmail";
  readonly title: string;
  readonly content: string;
  readonly metadata: EmailMetadata;
  readonly extractedAt: DateTime.Utc;
}

/**
 * Thread context for multi-message conversations
 */
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

// =============================================================================
// Gmail API Response Types
// =============================================================================

const GmailMessageHeaderSchema = S.Struct({
  name: S.String,
  value: S.String,
});

const GmailMessagePartBodySchema = S.Struct({
  attachmentId: S.optional(S.String),
  size: S.Number,
  data: S.optional(S.String),
});

// Gmail message parts can be nested, but we use a simpler approach:
// We define parts as unknown and handle extraction manually
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

// =============================================================================
// Error Type Alias
// =============================================================================

type GmailExtractionError = GoogleApiError | GoogleAuthenticationError | GoogleScopeExpansionRequiredError;

// =============================================================================
// Header Parsing Utilities
// =============================================================================

const findHeader = (
  headers: ReadonlyArray<{ readonly name: string; readonly value: string }> | undefined,
  name: string
): O.Option<string> => {
  if (!headers) return O.none();
  const lowerName = Str.toLowerCase(name);
  return A.findFirst(headers, (h) => Str.toLowerCase(h.name) === lowerName).pipe(O.map((h) => h.value));
};

const parseEmailList = (value: string): ReadonlyArray<string> => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = value.match(emailRegex);
  return matches ? A.fromIterable(matches) : [];
};

const parseDate = (internalDate: string | undefined): O.Option<DateTime.Utc> => {
  if (!internalDate) return O.none();
  const timestamp = Number.parseInt(internalDate, 10);
  if (Number.isNaN(timestamp)) return O.none();
  return O.some(DateTime.unsafeMake(timestamp));
};

// =============================================================================
// Base64 URL Decoding
// =============================================================================

const decodeBase64Url = (encoded: string): string => {
  const base64 = Str.replaceAll("-", "+")(encoded).replace(/_/g, "/");
  const padded = base64.length % 4 === 0 ? base64 : base64 + "=".repeat(4 - (base64.length % 4));
  try {
    return atob(padded);
  } catch {
    return "";
  }
};

// =============================================================================
// Content Extraction
// =============================================================================

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
  Array.isArray(parts) && parts.every((p) => typeof p === "object" && p !== null);

const extractTextContent = (payload: PayloadLike | undefined): string => {
  if (!payload) return "";

  // Direct body content
  if (payload.body?.data) {
    const mimeType = payload.mimeType ?? "";
    if (mimeType === "text/plain" || !Str.includes("html")(mimeType)) {
      return decodeBase64Url(payload.body.data);
    }
  }

  // Multipart - prefer text/plain over text/html
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

    // Recursive check for nested parts (cast to PayloadLike for recursive call)
    const nestedContent = A.findFirst(parts, (part) => {
      if (!part.parts || !isPartArray(part.parts)) return false;
      const nested = extractTextContent(part as PayloadLike);
      return !Str.isEmpty(nested);
    }).pipe(
      O.flatMap((part) =>
        part.parts && isPartArray(part.parts) ? O.some(extractTextContent(part as PayloadLike)) : O.none()
      )
    );

    if (O.isSome(nestedContent)) {
      return nestedContent.value;
    }
  }

  return "";
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

// =============================================================================
// ACL Translation
// =============================================================================

const toExtractedDocument = (message: GmailMessage, extractedAt: DateTime.Utc): ExtractedEmailDocument => {
  const headers = message.payload?.headers;
  const subject = findHeader(headers, "Subject").pipe(O.getOrElse(() => "(No Subject)"));
  const from = findHeader(headers, "From").pipe(O.getOrElse(() => ""));
  const to = findHeader(headers, "To").pipe(
    O.map(parseEmailList),
    O.getOrElse(() => [])
  );
  const cc = findHeader(headers, "Cc").pipe(
    O.map(parseEmailList),
    O.getOrElse(() => [])
  );
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
      labels: message.labelIds ?? [],
    },
    extractedAt,
  };
};

// =============================================================================
// Service Definition
// =============================================================================

/**
 * GmailExtractionAdapter provides email extraction for knowledge graph ingestion.
 *
 * This adapter is READ-ONLY and optimized for extracting emails in a format
 * suitable for entity and relation extraction in the knowledge pipeline.
 */
export class GmailExtractionAdapter extends Context.Tag("GmailExtractionAdapter")<
  GmailExtractionAdapter,
  {
    /**
     * Extract emails matching a query for knowledge graph processing.
     *
     * @param query - Gmail search query (e.g., "from:user@example.com after:2024/01/01")
     * @param maxResults - Maximum number of emails to extract (default: 50)
     * @returns Array of extracted email documents
     */
    readonly extractEmailsForKnowledgeGraph: (
      query: string,
      maxResults?: number
    ) => Effect.Effect<ReadonlyArray<ExtractedEmailDocument>, GmailExtractionError>;

    /**
     * Extract full thread context for a conversation.
     *
     * @param threadId - Gmail thread ID
     * @returns Thread context with all messages and participant info
     */
    readonly extractThreadContext: (threadId: string) => Effect.Effect<ThreadContext, GmailExtractionError>;
  }
>() {}

// =============================================================================
// Layer Implementation
// =============================================================================

/**
 * Live implementation of GmailExtractionAdapter.
 *
 * Requires GoogleAuthClient and HttpClient to be provided.
 */
export const GmailExtractionAdapterLive = Layer.effect(
  GmailExtractionAdapter,
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient;
    const auth = yield* GoogleAuthClient;

    const makeAuthorizedRequest = <A, I, R>(request: HttpClientRequest.HttpClientRequest, schema: S.Schema<A, I, R>) =>
      Effect.gen(function* () {
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
        yield* Effect.logDebug("GmailExtractionAdapter.extractEmailsForKnowledgeGraph", {
          query,
          maxResults,
        });

        // List message IDs matching query
        const listResponse = yield* makeAuthorizedRequest(
          HttpClientRequest.get(`${GMAIL_API_BASE}/messages`).pipe(
            HttpClientRequest.setUrlParam("q", query),
            HttpClientRequest.setUrlParam("maxResults", String(maxResults))
          ),
          GmailMessagesListResponseSchema
        );

        const messageRefs = listResponse.messages ?? [];
        if (A.isEmptyReadonlyArray(messageRefs)) {
          yield* Effect.logDebug("GmailExtractionAdapter: no messages found");
          return [];
        }

        yield* Effect.logDebug("GmailExtractionAdapter: fetching message details", {
          count: messageRefs.length,
        });

        // Fetch full message details in parallel
        const messages = yield* Effect.all(
          A.map(messageRefs, (ref) => fetchMessage(ref.id)),
          { concurrency: 10 }
        );

        const extractedAt = DateTime.unsafeNow();
        const documents = A.map(messages, (msg) => toExtractedDocument(msg, extractedAt));

        yield* Effect.logInfo("GmailExtractionAdapter.extractEmailsForKnowledgeGraph: complete", {
          extracted: documents.length,
        });

        return documents;
      }).pipe(
        Effect.withSpan("GmailExtractionAdapter.extractEmailsForKnowledgeGraph", {
          captureStackTrace: false,
          attributes: { query, maxResults },
        })
      );

    const extractThreadContext = (threadId: string) =>
      Effect.gen(function* () {
        yield* Effect.logDebug("GmailExtractionAdapter.extractThreadContext", { threadId });

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

        // Extract subject from first message
        const firstMessage = A.head(extractedMessages);
        const subject = O.isSome(firstMessage) ? firstMessage.value.title : "(No Subject)";

        // Collect all unique participants
        const allParticipants = A.flatMap(extractedMessages, (doc) => [
          doc.metadata.from,
          ...doc.metadata.to,
          ...doc.metadata.cc,
        ]);
        const uniqueParticipants = A.dedupe(A.filter(allParticipants, (p) => !Str.isEmpty(p)));

        // Calculate date range
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

        yield* Effect.logInfo("GmailExtractionAdapter.extractThreadContext: complete", {
          threadId,
          messageCount: extractedMessages.length,
          participantCount: uniqueParticipants.length,
        });

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
  })
);
