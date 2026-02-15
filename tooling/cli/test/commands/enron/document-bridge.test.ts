import { describe, effect, expect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Path from "node:path";
import { parseEmail } from "@beep/repo-cli/commands/enron/parser";
import { reconstructThreads } from "@beep/repo-cli/commands/enron/thread-reconstructor";
import { threadToEnronDocuments, toEnronDocument } from "@beep/repo-cli/commands/enron/document-bridge";

const fixturePath = (name: string) => Path.join(import.meta.dir, "fixtures", name);
const readFixture = (name: string): Effect.Effect<string> => Effect.promise(() => Bun.file(fixturePath(name)).text());

describe("enron/document-bridge", () => {
  effect("maps parsed email into a TodoX-compatible document shape", () =>
    Effect.gen(function* () {
      const raw = yield* readFixture("simple-email.eml");
      const email = yield* parseEmail(raw, { folder: "allen-p/inbox", user: "allen-p" });
      const document = yield* toEnronDocument(email, "thread:test");

      strictEqual(document.id.startsWith("email:"), true);
      strictEqual(document.title, "Daily Position Update");
      strictEqual(document.metadata.sender, "john.arnold@enron.com");
      strictEqual(document.metadata.threadId, "thread:test");
      expect(document.metadata.recipients).toContain("jane.doe@enron.com");
      strictEqual(document.spans.length, 1);
      strictEqual(document.spans[0]?.start, 0);
      strictEqual(document.spans[0]?.end, document.body.length);
    })
  );

  effect("keeps document IDs stable for repeated conversions", () =>
    Effect.gen(function* () {
      const raw = yield* readFixture("simple-email.eml");
      const email = yield* parseEmail(raw, { folder: "allen-p/inbox", user: "allen-p" });

      const first = yield* toEnronDocument(email, "thread:test");
      const second = yield* toEnronDocument(email, "thread:test");

      strictEqual(first.id, second.id);
      strictEqual(first.metadata.messageId, second.metadata.messageId);
    })
  );

  effect("maps an entire thread into thread-scoped documents", () =>
    Effect.gen(function* () {
      const root = yield* readFixture("thread-root.eml");
      const reply = yield* readFixture("thread-reply-a.eml");
      const rootEmail = yield* parseEmail(root, { folder: "threads/inbox", user: "thread-user" });
      const replyEmail = yield* parseEmail(reply, { folder: "threads/inbox", user: "thread-user" });

      const thread = reconstructThreads([rootEmail, replyEmail])[0];
      if (thread === undefined) {
        throw new Error("Expected thread");
      }

      const documents = yield* threadToEnronDocuments(thread);
      strictEqual(documents.length, 2);
      expect(documents.every((document) => document.metadata.threadId === thread.threadId)).toBe(true);
    })
  );
});
