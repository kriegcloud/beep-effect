import { describe, effect, expect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Path from "node:path";
import { parseEmail } from "@beep/repo-cli/commands/enron/parser";
import { reconstructThreads } from "@beep/repo-cli/commands/enron/thread-reconstructor";

const fixturePath = (name: string) => Path.join(import.meta.dir, "fixtures", name);
const readFixture = (name: string): Effect.Effect<string> => Effect.promise(() => Bun.file(fixturePath(name)).text());

const parseFixture = (name: string) =>
  Effect.gen(function* () {
    const raw = yield* readFixture(name);
    return yield* parseEmail(raw, { folder: "threads/inbox", user: "thread-user" });
  });

describe("enron/thread-reconstructor", () => {
  effect("reconstructs a multi-branch thread with depth", () =>
    Effect.gen(function* () {
      const messages = yield* Effect.all(
        [
          parseFixture("thread-root.eml"),
          parseFixture("thread-reply-a.eml"),
          parseFixture("thread-reply-b.eml"),
          parseFixture("thread-reply-a1.eml"),
        ],
        { concurrency: "unbounded" }
      );

      const threads = reconstructThreads(messages);
      strictEqual(threads.length, 1);

      const thread = threads[0];
      if (thread === undefined) {
        throw new Error("Expected a thread");
      }

      strictEqual(thread.messages.length, 4);
      strictEqual(thread.depth, 3);
      expect(thread.participants).toContain("leader@enron.com");
      expect(thread.participants).toContain("alpha@enron.com");
      expect(thread.participants).toContain("beta@enron.com");
      strictEqual(thread.threadId.startsWith("thread:"), true);
    })
  );

  effect("creates orphan single-message threads when references are broken", () =>
    Effect.gen(function* () {
      const root = yield* parseFixture("thread-root.eml");
      const orphan = yield* parseFixture("orphan-email.eml");

      const threads = reconstructThreads([root, orphan]);
      strictEqual(threads.length, 2);

      const orphanThread = threads.find((thread) => thread.messages.some((message) => message.messageId === orphan.messageId));
      if (orphanThread === undefined) {
        throw new Error("Expected orphan thread");
      }

      strictEqual(orphanThread.messages.length, 1);
      strictEqual(orphanThread.depth, 1);
    })
  );
});
