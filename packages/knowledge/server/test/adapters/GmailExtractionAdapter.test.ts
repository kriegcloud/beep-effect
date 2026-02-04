/**
 * GmailExtractionAdapter Integration Tests
 *
 * Tests the adapter using mocked GoogleAuthClient and HttpClient
 * to verify correct email extraction for knowledge graph ingestion.
 *
 * @module knowledge-server/test/adapters/GmailExtractionAdapter.test
 * @since 0.1.0
 */
import {
  GmailExtractionAdapter,
  GmailExtractionAdapterLive,
  GMAIL_EXTRACTION_REQUIRED_SCOPES,
} from "@beep/knowledge-server/adapters";
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
          scope: O.some(GmailScopes.read),
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

describe("GmailExtractionAdapter", () => {
  describe("extractEmailsForKnowledgeGraph", () => {
    const mockListResponse = {
      messages: [
        { id: "msg-1", threadId: "thread-1" },
        { id: "msg-2", threadId: "thread-2" },
      ],
    };

    const mockMessage1 = {
      id: "msg-1",
      threadId: "thread-1",
      labelIds: ["INBOX", "IMPORTANT"],
      snippet: "Meeting notes from the Q4 planning session...",
      internalDate: "1705320000000",
      payload: {
        partId: "",
        mimeType: "text/plain",
        filename: "",
        headers: [
          { name: "From", value: "alice@company.com" },
          { name: "To", value: "bob@company.com, charlie@company.com" },
          { name: "Cc", value: "dave@company.com" },
          { name: "Subject", value: "Q4 Planning Meeting Notes" },
        ],
        body: {
          attachmentId: undefined,
          size: 150,
          data: encodeBase64Url(
            "Discussed revenue targets for Q4. Action items:\n" +
            "1. Alice to prepare sales forecast\n" +
            "2. Bob to review marketing budget\n" +
            "3. Charlie to coordinate with engineering"
          ),
        },
      },
    };

    const mockMessage2 = {
      id: "msg-2",
      threadId: "thread-2",
      labelIds: ["INBOX"],
      snippet: "Project Alpha status update...",
      internalDate: "1705406400000",
      payload: {
        partId: "",
        mimeType: "multipart/alternative",
        filename: "",
        headers: [
          { name: "From", value: "bob@company.com" },
          { name: "To", value: "team@company.com" },
          { name: "Subject", value: "Project Alpha - Weekly Status" },
        ],
        body: {
          size: 0,
        },
        parts: [
          {
            partId: "0",
            mimeType: "text/plain",
            filename: "",
            headers: [],
            body: {
              size: 100,
              data: encodeBase64Url(
                "Project Alpha is on track.\n" +
                "Milestones completed: Design review, API spec\n" +
                "Next steps: Implementation phase begins Monday"
              ),
            },
          },
          {
            partId: "1",
            mimeType: "text/html",
            filename: "",
            headers: [],
            body: {
              size: 200,
              data: encodeBase64Url(
                "<html><body><h1>Project Alpha</h1><p>On track!</p></body></html>"
              ),
            },
          },
        ],
      },
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages/msg-1")) {
        return Effect.succeed({ status: 200, body: mockMessage1 });
      }
      if (url.includes("/messages/msg-2")) {
        return Effect.succeed({ status: 200, body: mockMessage2 });
      }
      if (url.includes("/messages")) {
        return Effect.succeed({ status: 200, body: mockListResponse });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(60) })("extractEmailsForKnowledgeGraph tests", (it) => {
      it.effect("extracts emails with correct structure", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10);

          strictEqual(documents.length, 2);
          strictEqual(documents[0]?.sourceType, "gmail");
          strictEqual(documents[0]?.sourceId, "msg-1");
          strictEqual(documents[0]?.title, "Q4 Planning Meeting Notes");
        })
      );

      it.effect("extracts email metadata correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10);

          const metadata = documents[0]?.metadata;
          strictEqual(metadata?.from, "alice@company.com");
          strictEqual(metadata?.to.length, 2);
          assertTrue(metadata?.to.includes("bob@company.com"));
          assertTrue(metadata?.to.includes("charlie@company.com"));
          strictEqual(metadata?.cc.length, 1);
          assertTrue(metadata?.cc.includes("dave@company.com"));
          strictEqual(metadata?.threadId, "thread-1");
          assertTrue(metadata?.labels.includes("INBOX"));
          assertTrue(metadata?.labels.includes("IMPORTANT"));
        })
      );

      it.effect("extracts plain text content from multipart", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10);

          const doc2 = documents[1];
          strictEqual(doc2?.title, "Project Alpha - Weekly Status");
          assertTrue(doc2?.content.includes("Project Alpha is on track"));
          assertTrue(doc2?.content.includes("Milestones completed"));
        })
      );

      it.effect("includes extractedAt timestamp", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10);

          for (const doc of documents) {
            assertTrue(doc.extractedAt !== undefined);
          }
        })
      );

      it.effect("parses email date from internalDate", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10);

          assertTrue(O.isSome(documents[0]?.metadata.date ?? O.none()));
        })
      );
    });

    const MockHttpClientEmpty = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/messages")) {
        return Effect.succeed({ status: 200, body: {} });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayerEmpty = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClientEmpty)
    );

    layer(TestLayerEmpty, { timeout: Duration.seconds(30) })(
      "extractEmailsForKnowledgeGraph empty results",
      (it) => {
        it.effect("returns empty array when no messages match", () =>
          Effect.gen(function* () {
            const adapter = yield* GmailExtractionAdapter;
            const documents = yield* adapter.extractEmailsForKnowledgeGraph(
              "label:nonexistent",
              10
            );

            strictEqual(documents.length, 0);
          })
        );
      }
    );
  });

  describe("extractThreadContext", () => {
    const mockThread = {
      id: "thread-conversation",
      messages: [
        {
          id: "msg-t1",
          threadId: "thread-conversation",
          labelIds: ["INBOX"],
          snippet: "Initial project proposal...",
          internalDate: "1705320000000",
          payload: {
            partId: "",
            mimeType: "text/plain",
            filename: "",
            headers: [
              { name: "From", value: "alice@company.com" },
              { name: "To", value: "bob@company.com" },
              { name: "Cc", value: "manager@company.com" },
              { name: "Subject", value: "Project Proposal: New CRM System" },
            ],
            body: {
              size: 100,
              data: encodeBase64Url(
                "Hi Bob,\n\n" +
                "I propose we implement a new CRM system.\n" +
                "Key benefits: improved tracking, better analytics.\n\n" +
                "Best,\nAlice"
              ),
            },
          },
        },
        {
          id: "msg-t2",
          threadId: "thread-conversation",
          labelIds: ["INBOX"],
          snippet: "Re: Project Proposal...",
          internalDate: "1705406400000",
          payload: {
            partId: "",
            mimeType: "text/plain",
            filename: "",
            headers: [
              { name: "From", value: "bob@company.com" },
              { name: "To", value: "alice@company.com" },
              { name: "Cc", value: "manager@company.com" },
              { name: "Subject", value: "Re: Project Proposal: New CRM System" },
            ],
            body: {
              size: 80,
              data: encodeBase64Url(
                "Alice,\n\n" +
                "Great idea! I have some questions about the budget.\n" +
                "Can we schedule a call?\n\n" +
                "Bob"
              ),
            },
          },
        },
        {
          id: "msg-t3",
          threadId: "thread-conversation",
          labelIds: ["INBOX", "STARRED"],
          snippet: "Re: Re: Project Proposal...",
          internalDate: "1705492800000",
          payload: {
            partId: "",
            mimeType: "text/plain",
            filename: "",
            headers: [
              { name: "From", value: "manager@company.com" },
              { name: "To", value: "alice@company.com, bob@company.com" },
              { name: "Subject", value: "Re: Project Proposal: New CRM System" },
            ],
            body: {
              size: 60,
              data: encodeBase64Url(
                "Team,\n\n" +
                "I approve this proposal. Please proceed with planning.\n\n" +
                "Manager"
              ),
            },
          },
        },
      ],
    };

    const MockHttpClient = makeHttpClientMock((request) => {
      const url = request.url;
      if (url.includes("/threads/thread-conversation")) {
        return Effect.succeed({ status: 200, body: mockThread });
      }
      if (url.includes("/threads/empty-thread")) {
        return Effect.succeed({
          status: 200,
          body: { id: "empty-thread", messages: [] },
        });
      }
      if (url.includes("/threads/nonexistent")) {
        return Effect.succeed({ status: 404, body: { error: { message: "Thread not found" } } });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayer = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayer, { timeout: Duration.seconds(60) })("extractThreadContext tests", (it) => {
      it.effect("extracts thread with all messages", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const context = yield* adapter.extractThreadContext("thread-conversation");

          strictEqual(context.threadId, "thread-conversation");
          strictEqual(context.messages.length, 3);
          strictEqual(context.subject, "Project Proposal: New CRM System");
        })
      );

      it.effect("collects all unique participants", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const context = yield* adapter.extractThreadContext("thread-conversation");

          assertTrue(context.participants.includes("alice@company.com"));
          assertTrue(context.participants.includes("bob@company.com"));
          assertTrue(context.participants.includes("manager@company.com"));
          strictEqual(context.participants.length, 3);
        })
      );

      it.effect("calculates date range correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const context = yield* adapter.extractThreadContext("thread-conversation");

          assertTrue(
            DateTime.lessThanOrEqualTo(context.dateRange.earliest, context.dateRange.latest)
          );
        })
      );

      it.effect("returns GoogleApiError for empty thread", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const error = yield* Effect.flip(adapter.extractThreadContext("empty-thread"));

          assertTrue(error instanceof GoogleApiError);
          assertTrue(error.message.includes("no messages"));
        })
      );

      it.effect("returns GoogleApiError for non-existent thread", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const error = yield* Effect.flip(adapter.extractThreadContext("nonexistent"));

          assertTrue(error instanceof GoogleApiError);
        })
      );
    });
  });

  describe("authentication errors", () => {
    const MockHttpClient = makeHttpClientMock((_request) =>
      Effect.succeed({ status: 200, body: {} })
    );

    const TestLayerMissingScopes = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClientMissingScopes),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayerMissingScopes, { timeout: Duration.seconds(30) })(
      "authentication error handling",
      (it) => {
        it.effect("returns GoogleScopeExpansionRequiredError when scopes are missing", () =>
          Effect.gen(function* () {
            const adapter = yield* GmailExtractionAdapter;
            const error = yield* Effect.flip(
              adapter.extractEmailsForKnowledgeGraph("label:INBOX", 10)
            );

            assertTrue(error instanceof GoogleScopeExpansionRequiredError);
            assertTrue(error.missingScopes.length > 0);
          })
        );
      }
    );
  });

  describe("GMAIL_EXTRACTION_REQUIRED_SCOPES", () => {
    effect("contains only gmail.readonly scope", () =>
      Effect.gen(function* () {
        strictEqual(GMAIL_EXTRACTION_REQUIRED_SCOPES.length, 1);
        assertTrue(GMAIL_EXTRACTION_REQUIRED_SCOPES.includes(GmailScopes.read));
      })
    );

    effect("does not include gmail.send scope (read-only adapter)", () =>
      Effect.gen(function* () {
        const scopes = GMAIL_EXTRACTION_REQUIRED_SCOPES as ReadonlyArray<string>;
        assertTrue(!scopes.includes(GmailScopes.send));
      })
    );
  });
});
