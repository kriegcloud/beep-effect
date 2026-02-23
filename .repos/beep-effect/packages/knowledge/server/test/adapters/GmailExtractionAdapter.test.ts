import { GmailScopes, GoogleApiError, GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";
import {
  ExtractedEmailDocument,
  GMAIL_EXTRACTION_REQUIRED_SCOPES,
  GmailExtractionAdapter,
  GmailExtractionAdapterLive,
} from "@beep/knowledge-server/adapters";
import { assertTrue, describe, effect, layer, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { makeGoogleAuthClientLayer, makeHttpClientMockLayer } from "../_shared/ServiceMocks";

const encodeBase64Url = (data: string): string =>
  F.pipe(btoa(data), Str.replaceAll("+", "-"), Str.replaceAll("/", "_"), Str.replace(/=+$/, ""));

const MockGoogleAuthClient = makeGoogleAuthClientLayer();
const MockGoogleAuthClientMissingScopes = makeGoogleAuthClientLayer({ missingScopes: true });

describe("GmailExtractionAdapter", () => {
  const providerAccountId = "iam_account__00000000-0000-0000-0000-000000000000";
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
              data: encodeBase64Url("<html><body><h1>Project Alpha</h1><p>On track!</p></body></html>"),
            },
          },
        ],
      },
    };

    const MockHttpClient = makeHttpClientMockLayer((request) => {
      const url = request.url;
      if (Str.includes("/messages/msg-1")(url)) {
        return Effect.succeed({ status: 200, body: mockMessage1 });
      }
      if (Str.includes("/messages/msg-2")(url)) {
        return Effect.succeed({ status: 200, body: mockMessage2 });
      }
      if (Str.includes("/messages")(url)) {
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
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10);

          strictEqual(A.length(documents), 2);
          assertTrue(documents[0] instanceof ExtractedEmailDocument);
          strictEqual(documents[0]?.sourceType, "gmail");
          strictEqual(documents[0]?.sourceId, "msg-1");
          strictEqual(documents[0]?.title, "Q4 Planning Meeting Notes");
        })
      );

      it.effect("extracts email metadata correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10);

          const metadata = documents[0]?.metadata;
          strictEqual(metadata?.from, "alice@company.com");
          strictEqual(metadata ? A.length(metadata.to) : 0, 2);
          assertTrue(metadata ? A.contains(metadata.to, "bob@company.com") : false);
          assertTrue(metadata ? A.contains(metadata.to, "charlie@company.com") : false);
          strictEqual(metadata ? A.length(metadata.cc) : 0, 1);
          assertTrue(metadata ? A.contains(metadata.cc, "dave@company.com") : false);
          strictEqual(metadata?.threadId, "thread-1");
          assertTrue(metadata ? A.contains(metadata.labels, "INBOX") : false);
          assertTrue(metadata ? A.contains(metadata.labels, "IMPORTANT") : false);
        })
      );

      it.effect("extracts plain text content from multipart", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10);

          const doc2 = documents[1];
          strictEqual(doc2?.title, "Project Alpha - Weekly Status");
          assertTrue(doc2 ? Str.includes("Project Alpha is on track")(doc2.content) : false);
          assertTrue(doc2 ? Str.includes("Milestones completed")(doc2.content) : false);
        })
      );

      it.effect("includes extractedAt timestamp", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10);

          for (const doc of documents) {
            assertTrue(doc.extractedAt !== undefined);
          }
        })
      );

      it.effect("parses email date from internalDate", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10);

          assertTrue(O.isSome(documents[0]?.metadata.date ?? O.none()));
        })
      );
    });

    const MockHttpClientEmpty = makeHttpClientMockLayer((request) => {
      const url = request.url;
      if (Str.includes("/messages")(url)) {
        return Effect.succeed({ status: 200, body: {} });
      }
      return Effect.succeed({ status: 404, body: { error: "Not found" } });
    });

    const TestLayerEmpty = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClient),
      Layer.provide(MockHttpClientEmpty)
    );

    layer(TestLayerEmpty, { timeout: Duration.seconds(30) })("extractEmailsForKnowledgeGraph empty results", (it) => {
      it.effect("returns empty array when no messages match", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const documents = yield* adapter.extractEmailsForKnowledgeGraph("label:nonexistent", providerAccountId, 10);

          strictEqual(A.length(documents), 0);
        })
      );
    });
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
                "Team,\n\n" + "I approve this proposal. Please proceed with planning.\n\n" + "Manager"
              ),
            },
          },
        },
      ],
    };

    const MockHttpClient = makeHttpClientMockLayer((request) => {
      const url = request.url;
      if (Str.includes("/threads/thread-conversation")(url)) {
        return Effect.succeed({ status: 200, body: mockThread });
      }
      if (Str.includes("/threads/empty-thread")(url)) {
        return Effect.succeed({
          status: 200,
          body: { id: "empty-thread", messages: [] },
        });
      }
      if (Str.includes("/threads/nonexistent")(url)) {
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
          const context = yield* adapter.extractThreadContext("thread-conversation", providerAccountId);

          strictEqual(context.threadId, "thread-conversation");
          strictEqual(A.length(context.messages), 3);
          strictEqual(context.subject, "Project Proposal: New CRM System");
        })
      );

      it.effect("collects all unique participants", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const context = yield* adapter.extractThreadContext("thread-conversation", providerAccountId);

          assertTrue(A.contains(context.participants, "alice@company.com"));
          assertTrue(A.contains(context.participants, "bob@company.com"));
          assertTrue(A.contains(context.participants, "manager@company.com"));
          strictEqual(A.length(context.participants), 3);
        })
      );

      it.effect("calculates date range correctly", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const context = yield* adapter.extractThreadContext("thread-conversation", providerAccountId);

          assertTrue(DateTime.lessThanOrEqualTo(context.dateRange.earliest, context.dateRange.latest));
        })
      );

      it.effect("returns GoogleApiError for empty thread", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const error = yield* Effect.flip(adapter.extractThreadContext("empty-thread", providerAccountId));

          assertTrue(error instanceof GoogleApiError);
          assertTrue(Str.includes("no messages")(error.message));
        })
      );

      it.effect("returns GoogleApiError for non-existent thread", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const error = yield* Effect.flip(adapter.extractThreadContext("nonexistent", providerAccountId));

          assertTrue(error instanceof GoogleApiError);
        })
      );
    });
  });

  describe("authentication errors", () => {
    const MockHttpClient = makeHttpClientMockLayer((_request) => Effect.succeed({ status: 200, body: {} }));

    const TestLayerMissingScopes = GmailExtractionAdapterLive.pipe(
      Layer.provide(MockGoogleAuthClientMissingScopes),
      Layer.provide(MockHttpClient)
    );

    layer(TestLayerMissingScopes, { timeout: Duration.seconds(30) })("authentication error handling", (it) => {
      it.effect("returns GoogleScopeExpansionRequiredError when scopes are missing", () =>
        Effect.gen(function* () {
          const adapter = yield* GmailExtractionAdapter;
          const error = yield* Effect.flip(
            adapter.extractEmailsForKnowledgeGraph("label:INBOX", providerAccountId, 10)
          );

          assertTrue(error instanceof GoogleScopeExpansionRequiredError);
          assertTrue(A.isNonEmptyReadonlyArray(error.missingScopes));
        })
      );
    });
  });

  describe("GMAIL_EXTRACTION_REQUIRED_SCOPES", () => {
    effect("contains only gmail.readonly scope", () =>
      Effect.gen(function* () {
        strictEqual(A.length(GMAIL_EXTRACTION_REQUIRED_SCOPES), 1);
        assertTrue(A.contains(GMAIL_EXTRACTION_REQUIRED_SCOPES, GmailScopes.read));
      })
    );

    effect("does not include gmail.send scope (read-only adapter)", () =>
      Effect.gen(function* () {
        assertTrue(!A.contains(GMAIL_EXTRACTION_REQUIRED_SCOPES as ReadonlyArray<string>, GmailScopes.send));
      })
    );
  });
});
