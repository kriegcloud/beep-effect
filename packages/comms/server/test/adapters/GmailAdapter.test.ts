/**
 * GmailAdapter Integration Tests
 *
 * Tests the adapter using mocked GoogleAuthClient and HttpClient
 * to verify correct API interaction patterns.
 *
 * @module comms-server/test/adapters/GmailAdapter.test
 * @since 0.1.0
 */
import {
  GmailAdapter,
  GmailAdapterLive,
  REQUIRED_SCOPES,
} from "@beep/comms-server/adapters";
import { GoogleAuthClient } from "@beep/google-workspace-client";
import {
  GmailScopes,
  GoogleApiError,
  GoogleAuthenticationError,
  GoogleOAuthToken,
  GoogleScopeExpansionRequiredError,
} from "@beep/google-workspace-domain";
import { describe, effect, layer, strictEqual, assertTrue } from "@beep/testkit";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const encodeBase64Url = (data: string): string => {
  const base64 = btoa(data);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const MockGoogleAuthClient = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (_scopes) =>
      Effect.succeed(
        new GoogleOAuthToken({
          accessToken: O.some("mock-access-token"),
          refreshToken: O.none(),
          scope: O.some([GmailScopes.read, GmailScopes.send].join(" ")),
          tokenType: O.some("Bearer"),
          expiryDate: O.some(DateTime.add(DateTime.unsafeNow(), { hours: 1 })),
        })
      ),
    refreshToken: () =>
      Effect.fail(
        new GoogleAuthenticationError({
          message: "Mock client does not support refresh",
        })
      ),
  })
);

const MockGoogleAuthClientMissingScopes = Layer.succeed(
  GoogleAuthClient,
  GoogleAuthClient.of({
    getValidToken: (requiredScopes) =>
      Effect.fail(
        new GoogleScopeExpansionRequiredError({
          message: "Missing required scopes",
          currentScopes: [],
          requiredScopes: A.fromIterable(requiredScopes),
          missingScopes: A.fromIterable(requiredScopes),
        })
      ),
    refreshToken: () =>
      Effect.fail(
        new GoogleAuthenticationError({
          message: "Mock client does not support refresh",
        })
      ),
  })
);

const makeHttpClientMock = (
  handler: (
    request: HttpClientRequest.HttpClientRequest
  ) => Effect.Effect<{ status: number; body: unknown }, never, never>
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request) =>
      Effect.gen(function* () {
        const result = yield* handler(request);
        return HttpClientResponse.fromWeb(
          request,
          new Response(JSON.stringify(result.body), {
            status: result.status,
            headers: { "Content-Type": "application/json" },
          })
        );
      })
    )
  );

describe("GmailAdapter", () => {
  describe("listMessages", () => {
    const mockListResponse = {
      messages: [
        { id: "msg-1", threadId: "thread-1" },
        { id: "msg-2", threadId: "thread-1" },
      ],
    };

    const mockMessage1 = {
      id: "msg-1",
      threadId: "thread-1",
      labelIds: ["INBOX", "UNREAD"],
      snippet: "Hello, this is a test email...",
      internalDate: "1705320000000",
      payload: {
        headers: [
          { name: "From", value: "sender@example.com" },
          { name: "To", value: "recipient@example.com" },
          { name: "Subject", value: "Test Email" },
        ],
        body: {
          data: encodeBase64Url("This is the email body content."),
        },
      },
    };

    const mockMessage2 = {
      id: "msg-2",
      threadId: "thread-1",
      labelIds: ["INBOX"],
      snippet: "Reply to the test email...",
      internalDate: "1705406400000",
      payload: {
        headers: [
          { name: "From", value: "recipient@example.com" },
          { name: "To", value: "sender@example.com" },
          { name: "Subject", value: "Re: Test Email" },
        ],
        body: {
          data: encodeBase64Url("This is the reply."),
        },
      },
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages?")) {
        return Effect.succeed({ status: 200, body: mockListResponse });
      }
      if (url.includes("/messages/msg-1")) {
        return Effect.succeed({ status: 200, body: mockMessage1 });
      }
      if (url.includes("/messages/msg-2")) {
        return Effect.succeed({ status: 200, body: mockMessage2 });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("listMessages tests", (it) => {
      it.effect("returns messages matching query", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const messages = yield* adapter.listMessages("in:inbox", 10);

          strictEqual(messages.length, 2);
          strictEqual(messages[0]?.id, "msg-1");
          strictEqual(messages[0]?.threadId, "thread-1");
          strictEqual(messages[0]?.snippet, "Hello, this is a test email...");
        })
      );

      it.effect("extracts labels correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const messages = yield* adapter.listMessages("in:inbox", 10);

          strictEqual(messages[0]?.labelIds.length, 2);
          assertTrue(messages[0]?.labelIds.includes("INBOX"));
          assertTrue(messages[0]?.labelIds.includes("UNREAD"));
        })
      );

      it.effect("parses internalDate to DateTime", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const messages = yield* adapter.listMessages("in:inbox", 10);

          assertTrue(O.isSome(messages[0]?.internalDate ?? O.none()));
        })
      );
    });

    const MockHttpClientEmpty = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages?")) {
        return Effect.succeed({ status: 200, body: { messages: [] } });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayerEmpty = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClientEmpty)
    );

    layer(TestLayerEmpty, { timeout: Duration.seconds(30) })("listMessages empty results", (it) => {
      it.effect("returns empty array when no messages match", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const messages = yield* adapter.listMessages("label:nonexistent", 10);

          strictEqual(messages.length, 0);
        })
      );
    });
  });

  describe("getMessage", () => {
    const mockMessage = {
      id: "msg-123",
      threadId: "thread-456",
      labelIds: ["INBOX"],
      snippet: "Important message content...",
      internalDate: "1705320000000",
      payload: {
        headers: [
          { name: "From", value: "boss@company.com" },
          { name: "To", value: "employee@company.com" },
          { name: "Subject", value: "Important Update" },
        ],
        mimeType: "multipart/alternative",
        parts: [
          {
            mimeType: "text/plain",
            body: {
              data: encodeBase64Url("Plain text content here."),
            },
          },
          {
            mimeType: "text/html",
            body: {
              data: encodeBase64Url("<html><body>HTML content here.</body></html>"),
            },
          },
        ],
      },
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages/msg-123")) {
        return Effect.succeed({ status: 200, body: mockMessage });
      }
      if (url.includes("/messages/nonexistent")) {
        return Effect.succeed({ status: 404, body: { error: { message: "Message not found" } } });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("getMessage tests", (it) => {
      it.effect("returns full message details", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const message = yield* adapter.getMessage("msg-123");

          strictEqual(message.id, "msg-123");
          strictEqual(message.threadId, "thread-456");
          strictEqual(message.snippet, "Important message content...");
        })
      );

      it.effect("extracts multipart content", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const message = yield* adapter.getMessage("msg-123");

          assertTrue(O.isSome(message.payload));
          const payload = O.getOrThrow(message.payload);
          strictEqual(payload.parts.length, 2);
        })
      );

      it.effect("returns GoogleApiError for non-existent message", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const error = yield* Effect.flip(adapter.getMessage("nonexistent"));

          assertTrue(error instanceof GoogleApiError);
          strictEqual(error.statusCode, 404);
        })
      );
    });
  });

  describe("sendMessage", () => {
    const mockSendResponse = {
      id: "sent-msg-789",
      threadId: "new-thread-123",
      labelIds: ["SENT"],
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages/send") && request.method === "POST") {
        return Effect.succeed({ status: 200, body: mockSendResponse });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("sendMessage tests", (it) => {
      it.effect("sends message and returns response", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const result = yield* adapter.sendMessage(
            "recipient@example.com",
            "Test Subject",
            "Test body content"
          );

          strictEqual(result.id, "sent-msg-789");
          strictEqual(result.threadId, "new-thread-123");
          assertTrue(result.labelIds.includes("SENT"));
        })
      );
    });

    const MockHttpClientError = makeHttpClientMock((_request) =>
      Effect.succeed({
        status: 400,
        body: { error: { message: "Invalid recipient address" } },
      })
    );

    const TestLayerError = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClientError)
    );

    layer(TestLayerError, { timeout: Duration.seconds(30) })("sendMessage error handling", (it) => {
      it.effect("returns GoogleApiError for invalid request", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const error = yield* Effect.flip(
            adapter.sendMessage("invalid-email", "Subject", "Body")
          );

          assertTrue(error instanceof GoogleApiError);
          strictEqual(error.statusCode, 400);
        })
      );
    });
  });

  describe("getThread", () => {
    const mockThread = {
      id: "thread-abc",
      messages: [
        {
          id: "msg-1",
          threadId: "thread-abc",
          labelIds: ["INBOX"],
          snippet: "First message in thread",
          internalDate: "1705320000000",
          payload: {
            headers: [
              { name: "From", value: "user1@example.com" },
              { name: "Subject", value: "Discussion Topic" },
            ],
          },
        },
        {
          id: "msg-2",
          threadId: "thread-abc",
          labelIds: ["INBOX"],
          snippet: "Reply to first message",
          internalDate: "1705406400000",
          payload: {
            headers: [
              { name: "From", value: "user2@example.com" },
              { name: "Subject", value: "Re: Discussion Topic" },
            ],
          },
        },
      ],
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/threads/thread-abc")) {
        return Effect.succeed({ status: 200, body: mockThread });
      }
      if (url.includes("/threads/nonexistent")) {
        return Effect.succeed({ status: 404, body: { error: { message: "Thread not found" } } });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(30) })("getThread tests", (it) => {
      it.effect("returns thread with all messages", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const thread = yield* adapter.getThread("thread-abc");

          strictEqual(thread.id, "thread-abc");
          strictEqual(thread.messages.length, 2);
          strictEqual(thread.messages[0]?.id, "msg-1");
          strictEqual(thread.messages[1]?.id, "msg-2");
        })
      );

      it.effect("returns GoogleApiError for non-existent thread", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailAdapter;
          const error = yield* Effect.flip(adapter.getThread("nonexistent"));

          assertTrue(error instanceof GoogleApiError);
          strictEqual(error.statusCode, 404);
        })
      );
    });
  });

  describe("authentication errors", () => {
    const MockHttpClient = makeHttpClientMock((_request) =>
      Effect.succeed({ status: 200, body: { messages: [] } })
    );

    const TestLayerMissingScopes = GmailAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClientMissingScopes),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayerMissingScopes, { timeout: Duration.seconds(30) })(
      "authentication error handling",
      (it) => {
        it.effect("returns GoogleScopeExpansionRequiredError when scopes are missing", () =>
          Effect.gen(function* () {
            const adapter = yield* GmailAdapter;
            const error = yield* Effect.flip(adapter.listMessages("in:inbox", 10));

            assertTrue(error instanceof GoogleScopeExpansionRequiredError);
            assertTrue(error.missingScopes.length > 0);
          })
        );
      }
    );
  });

  describe("REQUIRED_SCOPES", () => {
    effect("contains gmail.readonly scope", () =>
      Effect.gen(function* () {
        assertTrue(REQUIRED_SCOPES.includes(GmailScopes.read));
      })
    );

    effect("contains gmail.send scope", () =>
      Effect.gen(function* () {
        assertTrue(REQUIRED_SCOPES.includes(GmailScopes.send));
      })
    );
  });
});
