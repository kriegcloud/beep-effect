import { createHash } from "node:crypto";
import { describe, effect, expect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import { curateFromEmails } from "@beep/repo-cli/commands/enron/curator";
import { EnronEmail } from "@beep/repo-cli/commands/enron/schemas";

interface ThreadFactoryOptions {
  readonly threadSeed: string;
  readonly participants: ReadonlyArray<string>;
  readonly messageCount: number;
  readonly baseSubject: string;
  readonly bodyBuilder: (index: number) => string;
  readonly forwarded?: boolean;
}

const hash = (content: string): string => createHash("sha256").update(content, "utf8").digest("hex");

const makeThreadEmails = (options: ThreadFactoryOptions): ReadonlyArray<EnronEmail> => {
  const start = new Date("2001-02-01T00:00:00.000Z").getTime();

  return Array.from({ length: options.messageCount }, (_, index) => {
    const sender = options.participants[index % options.participants.length] ?? "unknown@enron.com";
    const recipients = options.participants.filter((participant) => participant !== sender).slice(0, 3);

    const messageId = `<${options.threadSeed}-${index}@enron.com>`;

    return new EnronEmail({
      from: sender,
      to: recipients,
      cc: [],
      bcc: [],
      date: new Date(start + index * 60_000),
      subject: options.forwarded && index > 0 ? `Fwd: ${options.baseSubject} ${index}` : `${options.baseSubject} ${index}`,
      messageId,
      inReplyTo: index === 0 ? undefined : `<${options.threadSeed}-${index - 1}@enron.com>`,
      references: index === 0 ? [] : [`<${options.threadSeed}-0@enron.com>`],
      body: options.bodyBuilder(index),
      folder: "test/maildir",
      user: "test-user",
    });
  });
};

const buildFixtureEmails = (): ReadonlyArray<EnronEmail> => {
  const threads = [
    makeThreadEmails({
      threadSeed: "financial-deep",
      participants: ["lead@enron.com", "risk@enron.com", "ops@enron.com", "finance@enron.com"],
      messageCount: 7,
      baseSubject: "Deal Risk Portfolio",
      bodyBuilder: (index) =>
        index % 2 === 0
          ? `Please review the deal position, account exposure, and portfolio risk by deadline ${index}.`
          : `${"Detailed desk analysis ".repeat(90)} follow up action compensation account`,
    }),
    makeThreadEmails({
      threadSeed: "forwarded-chain",
      participants: ["alpha@enron.com", "beta@enron.com", "gamma@enron.com"],
      messageCount: 5,
      baseSubject: "Forwarded Contract Notes",
      forwarded: true,
      bodyBuilder: (index) =>
        index === 2
          ? "-----Original Message-----\nPlease follow up with legal by deadline."
          : `Please action this request ${index}.`,
    }),
    makeThreadEmails({
      threadSeed: "action-focused",
      participants: ["mgr@enron.com", "analyst@enron.com", "assistant@enron.com"],
      messageCount: 5,
      baseSubject: "Action Tracker",
      bodyBuilder: (index) => `Need follow up action item ${index} before deadline.`,
    }),
    makeThreadEmails({
      threadSeed: "multi-party",
      participants: ["one@enron.com", "two@enron.com", "three@enron.com", "four@enron.com", "five@enron.com"],
      messageCount: 4,
      baseSubject: "Coordination",
      bodyBuilder: (index) => (index === 0 ? "Short." : "Thanks for the update."),
    }),
    makeThreadEmails({
      threadSeed: "length-diverse",
      participants: ["x@enron.com", "y@enron.com", "z@enron.com"],
      messageCount: 4,
      baseSubject: "Mixed Length",
      bodyBuilder: (index) => (index % 2 === 0 ? "Ack." : `${"Long narrative ".repeat(120)} please review`),
    }),
    makeThreadEmails({
      threadSeed: "neutral-1",
      participants: ["u1@enron.com", "u2@enron.com"],
      messageCount: 3,
      baseSubject: "Neutral",
      bodyBuilder: (index) => `Status ${index}.`,
    }),
    makeThreadEmails({
      threadSeed: "neutral-2",
      participants: ["v1@enron.com", "v2@enron.com"],
      messageCount: 3,
      baseSubject: "Neutral Two",
      bodyBuilder: (index) => `FYI ${index}.`,
    }),
  ];

  return threads.flat();
};

describe("enron/curator", () => {
  effect("selects a bounded, diverse subset and emits consistent manifest metadata", () =>
    Effect.gen(function* () {
      const emails = buildFixtureEmails();

      const result = yield* curateFromEmails(emails, {
        minMessageCount: 20,
        targetMessageCount: 24,
        maxMessageCount: 28,
        minimumThreadsPerCategory: 1,
        sourceLabel: "fixture://enron-curator-test",
      });

      expect(result.selection.selectedMessageCount).toBeGreaterThanOrEqual(20);
      expect(result.selection.selectedMessageCount).toBeLessThanOrEqual(28);

      expect(result.selection.selectedCategoryCoverage.financial).toBeGreaterThan(0);
      expect(result.selection.selectedCategoryCoverage.actionItems).toBeGreaterThan(0);
      expect(result.selection.selectedCategoryCoverage.multiParty).toBeGreaterThan(0);
      expect(result.selection.selectedCategoryCoverage.deepThread).toBeGreaterThan(0);
      expect(result.selection.selectedCategoryCoverage.forwardedChain).toBeGreaterThan(0);
      expect(result.selection.selectedCategoryCoverage.lengthDiversity).toBeGreaterThan(0);

      strictEqual(result.manifest.selectedThreadCount, result.selection.selectedThreadCount);
      strictEqual(result.manifest.selectedMessageCount, result.selection.selectedMessageCount);

      const artifactHashes = new Map(result.manifest.artifacts.map((artifact) => [artifact.fileName, artifact.sha256]));
      strictEqual(artifactHashes.get("threads.json"), hash(result.serializedArtifacts.threadsJson));
      strictEqual(artifactHashes.get("documents.json"), hash(result.serializedArtifacts.documentsJson));
    })
  );

  effect("is deterministic for selection and artifact hashes", () =>
    Effect.gen(function* () {
      const emails = buildFixtureEmails();
      const options = {
        minMessageCount: 20,
        targetMessageCount: 24,
        maxMessageCount: 28,
        minimumThreadsPerCategory: 1,
        sourceLabel: "fixture://enron-curator-test",
      } as const;

      const first = yield* curateFromEmails(emails, options);
      const second = yield* curateFromEmails(emails, options);

      strictEqual(first.manifest.datasetHash, second.manifest.datasetHash);
      strictEqual(hash(first.serializedArtifacts.threadsJson), hash(second.serializedArtifacts.threadsJson));
      strictEqual(hash(first.serializedArtifacts.documentsJson), hash(second.serializedArtifacts.documentsJson));

      const firstThreadIds = first.selection.selectedThreads.map((thread) => thread.thread.threadId);
      const secondThreadIds = second.selection.selectedThreads.map((thread) => thread.thread.threadId);
      expect(firstThreadIds).toEqual(secondThreadIds);
    })
  );
});
