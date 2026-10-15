/**
 * The notice-mailbox adapter over a fake `M365` mailbox and a real temporary
 * data directory for the day claims. No request leaves the process; the
 * mailbox, questions and notice here are synthetic.
 */

import { QuestionOption } from "@beep/law-practice-domain/values/Question";
import { ReviewItem } from "@beep/law-practice-domain/values/ReviewItem";
import { makeNoticeMailboxLayer, NoticeMailboxConfig } from "@beep/law-practice-server/NoticeMailbox";
import { DailyNotice, DailyNoticeLive, NoticeMailbox, NoticeMessage } from "@beep/law-practice-use-cases/DailyNotice";
import { GraphMessage } from "@beep/m365";
import { LocalDate } from "@beep/schema/LocalDate";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import { makeM365Stub, oneRun, Platform, serviceOf, temporaryDirectory } from "./MailTagging.adapters.fixture.ts";
import type { M365CreateDraftMessageRequest, M365SendDraftMessageRequest } from "@beep/m365";

const MAILBOX = "attorney@example.test";

type Calls = {
  readonly drafts: ReadonlyArray<M365CreateDraftMessageRequest>;
  readonly sends: ReadonlyArray<M365SendDraftMessageRequest>;
};

// Records every draft and send; each draft gets the next id.
const fakeMailbox = (calls: Ref.Ref<Calls>) =>
  makeM365Stub({
    createDraftMessage: (request) =>
      Ref.modify(calls, (current) => {
        const draft = GraphMessage.make({ id: `draft-${A.length(current.drafts) + 1}` });
        const next: readonly [GraphMessage, Calls] = [draft, { ...current, drafts: A.append(current.drafts, request) }];
        return next;
      }),
    sendDraftMessage: (request) =>
      Ref.update(calls, (current) => ({ ...current, sends: A.append(current.sends, request) })),
  });

const mailboxLayer = (dataDirectory: string, calls: Ref.Ref<Calls>) =>
  makeNoticeMailboxLayer(NoticeMailboxConfig.make({ mailbox: MAILBOX, dataDirectory })).pipe(
    Layer.provide(fakeMailbox(calls))
  );

const noCalls = () => Ref.make<Calls>({ drafts: [], sends: [] });

const day = (dayOfMonth: number) => LocalDate.make({ year: 2026, month: 10, day: dayOfMonth });

const question = ReviewItem.cases.question.make({
  itemId: "question:notice-race",
  text: "Is the synthetic reply due on December 1?",
  sourceRefs: [],
  facts: [],
  options: [
    QuestionOption.make({ optionId: "due-december-1", label: "Yes, December 1" }),
    QuestionOption.make({ optionId: "not-a-deadline", label: "It is not a deadline" }),
  ],
});

describe("@beep/law-practice-server NoticeMailbox", () => {
  it.layer(Platform, { timeout: "10 seconds" })("over a temporary data directory", (it) => {
    it.effect("sends from the mailbox to itself", () =>
      oneRun(
        Effect.gen(function* () {
          const calls = yield* noCalls();
          const mailbox = yield* serviceOf(NoticeMailbox)(mailboxLayer(yield* temporaryDirectory, calls));

          yield* mailbox.send(
            NoticeMessage.make({ subject: "Claude: 2 questions waiting", body: "2 questions are waiting in Claude." })
          );

          const { drafts, sends } = yield* Ref.get(calls);
          expect(
            A.map(drafts, ({ draft, userId }) => [
              draft.subject,
              draft.body.content,
              draft.body.contentType,
              draft.toRecipients,
              O.getOrElse(userId, () => "no user id"),
            ])
          ).toStrictEqual([
            ["Claude: 2 questions waiting", "2 questions are waiting in Claude.", "text", [MAILBOX], MAILBOX],
          ]);
          expect(A.map(sends, ({ messageId }) => messageId)).toStrictEqual(["draft-1"]);
        })
      )
    );

    it.effect("claims each day once, as one file under notice-sent", () =>
      oneRun(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const dataDirectory = yield* temporaryDirectory;
          const mailbox = yield* serviceOf(NoticeMailbox)(mailboxLayer(dataDirectory, yield* noCalls()));

          const claims = yield* Effect.all([
            mailbox.claimDay(day(14)),
            mailbox.claimDay(day(14)),
            mailbox.claimDay(day(15)),
          ]);
          const files = yield* (yield* FileSystem.FileSystem).readDirectory(path.join(dataDirectory, "notice-sent"));

          expect(claims).toStrictEqual([true, false, true]);
          expect(A.sort(files, Str.Order)).toStrictEqual(["2026-10-14", "2026-10-15"]);
        })
      )
    );

    it.effect("sends exactly once when two runs on the same day race", () =>
      oneRun(
        Effect.gen(function* () {
          const calls = yield* noCalls();
          const notice = yield* serviceOf(DailyNotice)(
            DailyNoticeLive.pipe(Layer.provide(mailboxLayer(yield* temporaryDirectory, calls)))
          );

          const outcomes = yield* Effect.all(
            [
              notice.sendIfDue({ digest: [question], today: day(14) }),
              notice.sendIfDue({ digest: [question], today: day(14) }),
            ],
            { concurrency: 2 }
          );

          expect(
            A.sort(
              A.map(outcomes, ({ status }) => status),
              Str.Order
            )
          ).toStrictEqual(["already-sent", "sent"]);
          expect(A.length((yield* Ref.get(calls)).drafts)).toBe(1);
        })
      )
    );

    it.effect("fails the claim when the data directory cannot hold claims", () =>
      oneRun(
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const notADirectory = path.join(yield* temporaryDirectory, "data-file");
          yield* (yield* FileSystem.FileSystem).writeFileString(notADirectory, "not a directory\n");
          const mailbox = yield* serviceOf(NoticeMailbox)(mailboxLayer(notADirectory, yield* noCalls()));

          const failure = yield* Effect.flip(mailbox.claimDay(day(14)));

          expect(failure.operation).toBe("claim");
        })
      )
    );
  });
});
