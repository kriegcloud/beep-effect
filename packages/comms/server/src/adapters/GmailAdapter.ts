import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GmailScopes,
  GoogleApiError,
  type GoogleAuthenticationError,
  type GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { $CommsServerId } from "@beep/identity/packages";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";

const $I = $CommsServerId.create("adapters/GmailAdapter");

export const REQUIRED_SCOPES = [GmailScopes.read, GmailScopes.send] as const;

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface MessagePayload {
  readonly headers: ReadonlyArray<{ name: string; value: string }>;
  readonly body: O.Option<string>;
  readonly parts: ReadonlyArray<MessagePart>;
}

export interface MessagePart {
  readonly mimeType: string;
  readonly body: O.Option<string>;
}

export interface GmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly labelIds: ReadonlyArray<string>;
  readonly snippet: string;
  readonly payload: O.Option<MessagePayload>;
  readonly internalDate: O.Option<DateTime.Utc>;
}

export interface GmailThread {
  readonly id: string;
  readonly messages: ReadonlyArray<GmailMessage>;
}

type GmailAdapterError = GoogleApiError | GoogleAuthenticationError | GoogleScopeExpansionRequiredError;

export class GmailAdapter extends Context.Tag($I`GmailAdapter`)<
  GmailAdapter,
  {
    readonly listMessages: (
      query: string,
      maxResults: number,
      providerAccountId: string
    ) => Effect.Effect<ReadonlyArray<GmailMessage>, GmailAdapterError>;

    readonly getMessage: (messageId: string, providerAccountId: string) => Effect.Effect<GmailMessage, GmailAdapterError>;

    readonly sendMessage: (
      to: string,
      subject: string,
      body: string,
      providerAccountId: string
    ) => Effect.Effect<GmailMessage, GmailAdapterError>;

    readonly getThread: (threadId: string, providerAccountId: string) => Effect.Effect<GmailThread, GmailAdapterError>;
  }
>() {}

interface RawGmailMessagePayloadHeader {
  readonly name: string;
  readonly value: string;
}

interface RawGmailMessagePayloadBody {
  readonly data?: string;
  readonly size?: number;
}

interface RawGmailMessagePayloadPart {
  readonly mimeType: string;
  readonly body?: RawGmailMessagePayloadBody;
  readonly parts?: ReadonlyArray<RawGmailMessagePayloadPart>;
}

interface RawGmailMessagePayload {
  readonly headers?: ReadonlyArray<RawGmailMessagePayloadHeader>;
  readonly body?: RawGmailMessagePayloadBody;
  readonly parts?: ReadonlyArray<RawGmailMessagePayloadPart>;
  readonly mimeType?: string;
}

interface RawGmailMessage {
  readonly id: string;
  readonly threadId: string;
  readonly labelIds?: ReadonlyArray<string>;
  readonly snippet?: string;
  readonly payload?: RawGmailMessagePayload;
  readonly internalDate?: string;
}

interface RawGmailThread {
  readonly id: string;
  readonly messages?: ReadonlyArray<RawGmailMessage>;
}

interface RawListMessagesResponse {
  readonly messages?: ReadonlyArray<{ id: string; threadId: string }>;
  readonly nextPageToken?: string;
}

const decodeBase64Url = (data: string): string => {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
};

const encodeBase64Url = (data: string): string => {
  const base64 = btoa(data);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const translateMessagePayloadPart = (part: RawGmailMessagePayloadPart): MessagePart => ({
  mimeType: part.mimeType,
  body: O.fromNullable(part.body?.data).pipe(O.map(decodeBase64Url)),
});

const translateMessagePayload = (payload: RawGmailMessagePayload): MessagePayload => ({
  headers: payload.headers ?? [],
  body: O.fromNullable(payload.body?.data).pipe(O.map(decodeBase64Url)),
  parts: A.map(payload.parts ?? [], translateMessagePayloadPart),
});

const translateGmailMessage = (raw: RawGmailMessage): GmailMessage => ({
  id: raw.id,
  threadId: raw.threadId,
  labelIds: raw.labelIds ?? [],
  snippet: raw.snippet ?? "",
  payload: O.fromNullable(raw.payload).pipe(O.map(translateMessagePayload)),
  internalDate: O.fromNullable(raw.internalDate).pipe(
    O.flatMap((ms) => {
      const timestamp = Number.parseInt(ms, 10);
      if (Number.isNaN(timestamp)) {
        return O.none();
      }
      return DateTime.make(timestamp);
    }),
    O.map(DateTime.toUtc)
  ),
});

const translateGmailThread = (raw: RawGmailThread): GmailThread => ({
  id: raw.id,
  messages: A.map(raw.messages ?? [], translateGmailMessage),
});

const createRfc2822Message = (to: string, subject: string, body: string): string => {
  const lines = [`To: ${to}`, `Subject: ${subject}`, "Content-Type: text/plain; charset=utf-8", "", body];
  return lines.join("\r\n");
};

export const GmailAdapterLive: Layer.Layer<GmailAdapter, never, GoogleAuthClient | HttpClient.HttpClient> =
  Layer.effect(
    GmailAdapter,
    Effect.gen(function* () {
      const authClient = yield* GoogleAuthClient;
      const httpClient = yield* HttpClient.HttpClient;

      const getAuthHeader = (providerAccountId: string) =>
        Effect.gen(function* () {
          const token = yield* authClient.getValidToken(REQUIRED_SCOPES, providerAccountId);
          const accessToken = O.getOrThrow(token.accessToken);
          return `Bearer ${accessToken}`;
        });

      const makeAuthorizedRequest = <T>(
        request: HttpClientRequest.HttpClientRequest,
        spanName: string,
        providerAccountId: string
      ): Effect.Effect<T, GmailAdapterError> =>
        Effect.gen(function* () {
          const authHeader = yield* getAuthHeader(providerAccountId);
          const authorizedRequest = HttpClientRequest.setHeader(request, "Authorization", authHeader);

          const response = yield* httpClient.execute(authorizedRequest).pipe(
            Effect.mapError(
              (error) =>
                new GoogleApiError({
                  message: `HTTP request failed: ${error.message}`,
                  statusCode: 0,
                  endpoint: spanName,
                })
            )
          );

          const status = response.status;
          if (status >= 400) {
            const bodyText = yield* response.text.pipe(Effect.orElseSucceed(() => "Unknown error"));
            return yield* new GoogleApiError({
              message: `Gmail API error: ${bodyText}`,
              statusCode: status,
              endpoint: spanName,
            });
          }

          const json = yield* response.json.pipe(
            Effect.mapError(
              (error) =>
                new GoogleApiError({
                  message: `Failed to parse JSON response: ${String(error)}`,
                  statusCode: response.status,
                  endpoint: spanName,
                })
            )
          );

          return json as T;
        }).pipe(Effect.withSpan(spanName));

      const listMessages = (
        query: string,
        maxResults: number,
        providerAccountId: string
      ): Effect.Effect<ReadonlyArray<GmailMessage>, GmailAdapterError> =>
        Effect.gen(function* () {
          const url = `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
          const request = HttpClientRequest.get(url);

          const listResponse = yield* makeAuthorizedRequest<RawListMessagesResponse>(
            request,
            "GmailAdapter.listMessages",
            providerAccountId
          );

          const messageRefs = listResponse.messages ?? [];
          if (A.isEmptyReadonlyArray(messageRefs)) {
            return [];
          }

          const messages = yield* Effect.all(
            A.map(messageRefs, (ref) => getMessage(ref.id, providerAccountId)),
            { concurrency: 5 }
          );

          return messages;
        }).pipe(Effect.withSpan("GmailAdapter.listMessages"));

      const getMessage = (messageId: string, providerAccountId: string): Effect.Effect<GmailMessage, GmailAdapterError> =>
        Effect.gen(function* () {
          const url = `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}?format=full`;
          const request = HttpClientRequest.get(url);

          const rawMessage = yield* makeAuthorizedRequest<RawGmailMessage>(
            request,
            "GmailAdapter.getMessage",
            providerAccountId
          );

          return translateGmailMessage(rawMessage);
        }).pipe(Effect.withSpan("GmailAdapter.getMessage"), Effect.annotateLogs({ messageId }));

      const sendMessage = (
        to: string,
        subject: string,
        body: string,
        providerAccountId: string
      ): Effect.Effect<GmailMessage, GmailAdapterError> =>
        Effect.gen(function* () {
          const rawMessage = createRfc2822Message(to, subject, body);
          const encodedMessage = encodeBase64Url(rawMessage);

          const url = `${GMAIL_API_BASE}/messages/send`;
          const requestWithBody = yield* HttpClientRequest.post(url).pipe(
            HttpClientRequest.setHeader("Content-Type", "application/json"),
            HttpClientRequest.bodyJson({ raw: encodedMessage }),
            Effect.mapError(
              () =>
                new GoogleApiError({
                  message: "Failed to create request body",
                  statusCode: 0,
                  endpoint: "GmailAdapter.sendMessage",
                })
            )
          );

          const rawResponse = yield* makeAuthorizedRequest<RawGmailMessage>(
            requestWithBody,
            "GmailAdapter.sendMessage",
            providerAccountId
          );

          return translateGmailMessage(rawResponse);
        }).pipe(Effect.withSpan("GmailAdapter.sendMessage"), Effect.annotateLogs({ to: Str.slice(0, 3)(to) + "***" }));

      const getThread = (threadId: string, providerAccountId: string): Effect.Effect<GmailThread, GmailAdapterError> =>
        Effect.gen(function* () {
          const url = `${GMAIL_API_BASE}/threads/${encodeURIComponent(threadId)}?format=full`;
          const request = HttpClientRequest.get(url);

          const rawThread = yield* makeAuthorizedRequest<RawGmailThread>(
            request,
            "GmailAdapter.getThread",
            providerAccountId
          );

          return translateGmailThread(rawThread);
        }).pipe(Effect.withSpan("GmailAdapter.getThread"), Effect.annotateLogs({ threadId }));

      return GmailAdapter.of({
        listMessages,
        getMessage,
        sendMessage,
        getThread,
      });
    })
  );
