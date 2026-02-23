import { EnronEmail, EnronThread, EnronThreadDateRange } from "@beep/repo-cli/commands/enron/schemas";
import { scoreThread, scoreThreads } from "@beep/repo-cli/commands/enron/thread-scorer";
import { describe, effect, expect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

interface MakeThreadOptions {
  readonly threadId: string;
  readonly participants: ReadonlyArray<string>;
  readonly messageBodies: ReadonlyArray<string>;
  readonly subjectPrefix: string;
  readonly forwarded?: boolean;
}

const baseDate = new Date("2001-01-01T00:00:00.000Z");

const makeThread = (options: MakeThreadOptions): EnronThread => {
  const messages = options.messageBodies.map((body, index) => {
    const sender = options.participants[index % options.participants.length] ?? "unknown@enron.com";
    const recipients = options.participants.filter((participant) => participant !== sender).slice(0, 2);
    const messageId = `<${options.threadId}-${index}@enron.com>`;

    return new EnronEmail({
      from: sender,
      to: recipients,
      cc: [],
      bcc: [],
      date: new Date(baseDate.getTime() + index * 60_000),
      subject:
        options.forwarded && index > 0 ? `Fwd: ${options.subjectPrefix} ${index}` : `${options.subjectPrefix} ${index}`,
      messageId,
      inReplyTo: index === 0 ? undefined : `<${options.threadId}-${index - 1}@enron.com>`,
      references: index === 0 ? [] : [`<${options.threadId}-0@enron.com>`],
      body,
      folder: "test/inbox",
      user: "test-user",
    });
  });

  const endDate = new Date(baseDate.getTime() + (messages.length - 1) * 60_000);

  return new EnronThread({
    threadId: options.threadId,
    messages,
    participants: options.participants,
    depth: Math.max(1, messages.length),
    dateRange: new EnronThreadDateRange({
      start: baseDate,
      end: endDate,
    }),
  });
};

describe("enron/thread-scorer", () => {
  effect("scores high-value threads above low-signal threads", () =>
    Effect.gen(function* () {
      const highSignalThread = makeThread({
        threadId: "thread:high",
        participants: ["lead@enron.com", "risk@enron.com", "ops@enron.com", "finance@enron.com"],
        subjectPrefix: "Portfolio Deal Update",
        forwarded: true,
        messageBodies: [
          "Please review the portfolio position and account risk by noon.",
          "Need follow up on compensation changes for the deal desk.",
          "Fwd chain context\n-----Original Message-----\nPrior account updates.",
          "Short ack.",
          `${"Long analysis ".repeat(120)} deal risk position portfolio account action`,
          "Please action this by deadline and follow up with finance.",
        ],
      });

      const lowSignalThread = makeThread({
        threadId: "thread:low",
        participants: ["a@enron.com", "b@enron.com"],
        subjectPrefix: "Lunch",
        messageBodies: ["see you", "ok"],
      });

      const highScore = scoreThread(highSignalThread);
      const lowScore = scoreThread(lowSignalThread);

      expect(highScore.score).toBeGreaterThan(lowScore.score);
      expect(highScore.breakdown.financialKeywords.keywordHits).toBeGreaterThan(0);
      expect(highScore.breakdown.actionItems.keywordHits).toBeGreaterThan(0);
      expect(highScore.breakdown.forwardedChains.forwardedMessageCount).toBeGreaterThan(0);

      const recomputedTotal =
        highScore.breakdown.multiPartyParticipation.score +
        highScore.breakdown.threadDepth.score +
        highScore.breakdown.financialKeywords.score +
        highScore.breakdown.actionItems.score +
        highScore.breakdown.forwardedChains.score +
        highScore.breakdown.lengthDiversity.score;

      strictEqual(highScore.breakdown.totalScore, recomputedTotal);
      strictEqual(highScore.score, recomputedTotal);
    })
  );

  effect("uses deterministic tie-breakers for equally-scored threads", () =>
    Effect.gen(function* () {
      const first = makeThread({
        threadId: "thread:a",
        participants: ["a@enron.com", "b@enron.com", "c@enron.com"],
        subjectPrefix: "Status",
        messageBodies: ["please review the account", "need your action", "done"],
      });

      const second = makeThread({
        threadId: "thread:b",
        participants: ["a@enron.com", "b@enron.com", "c@enron.com"],
        subjectPrefix: "Status",
        messageBodies: ["please review the account", "need your action", "done"],
      });

      const ranked = scoreThreads([second, first]);
      strictEqual(ranked[0]?.thread.threadId, "thread:a");
      strictEqual(ranked[1]?.thread.threadId, "thread:b");
    })
  );
});
