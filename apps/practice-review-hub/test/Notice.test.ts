/**
 * The daily notice over the hub's files in a temporary directory and a fake
 * mailbox that records what it would send. The test clock stands at the Unix
 * epoch, so today is 1970-01-01 in UTC. Every question here is synthetic.
 */

import { QuestionOption } from "@beep/law-practice-domain/values/Question";
import { ReviewItem } from "@beep/law-practice-domain/values/ReviewItem";
import { QuestionQueue, RecordAnswerInput } from "@beep/law-practice-use-cases/QuestionQueue";
import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore";
import { GraphMessage, M365 } from "@beep/m365";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import { makeNoticeLayer, sendDailyNotice } from "@/Notice";
import { Platform } from "./Hub.fixture.ts";

const MAILBOX = "attorney@example.test";
const UTC = DateTime.zoneMakeNamedUnsafe("UTC");

/** What the fake mailbox was asked to send: one subject and recipient list per draft. */
class SentMail extends Context.Service<SentMail, Ref.Ref<ReadonlyArray<string>>>()(
  "@beep/practice-review-hub/test/Notice.test/SentMail"
) {}

/** The data directory of one layer build, so a test can read the notice's day claims. */
class DataDirectory extends Context.Service<DataDirectory, string>()(
  "@beep/practice-review-hub/test/Notice.test/DataDirectory"
) {}

// Records each draft's subject and recipients; sending succeeds without doing anything.
const FakeMailbox = Layer.unwrap(
  Effect.map(SentMail, (sent) =>
    Layer.mock(M365)({
      createDraftMessage: ({ draft }) =>
        Effect.as(
          Ref.update(sent, A.append(`${draft.subject} -> ${A.join(draft.toRecipients, ",")}`)),
          GraphMessage.make({ id: "draft-1" })
        ),
      sendDraftMessage: () => Effect.void,
    })
  )
);

const NoticeTest = Layer.unwrap(
  Effect.gen(function* () {
    const dataDirectory = yield* (yield* FileSystem.FileSystem).makeTempDirectoryScoped({ prefix: "review-notice-" });
    return makeNoticeLayer({ dataDirectory, mailbox: MAILBOX }).pipe(
      Layer.provide(FakeMailbox),
      Layer.provideMerge(Layer.succeed(DataDirectory, dataDirectory))
    );
  })
).pipe(Layer.provideMerge(Layer.merge(Platform, Layer.effect(SentMail, Ref.make<ReadonlyArray<string>>([])))));

const question = (itemId: string) =>
  ReviewItem.cases.question.make({
    itemId,
    text: "Is the synthetic reply due on December 1?",
    sourceRefs: [],
    facts: [],
    options: [
      QuestionOption.make({ optionId: "due-december-1", label: "Yes, December 1" }),
      QuestionOption.make({ optionId: "not-a-deadline", label: "It is not a deadline" }),
    ],
  });

describe("@beep/practice-review-hub daily notice", () => {
  it.layer(NoticeTest, { timeout: "10 seconds" })("questions waiting", (it) => {
    it.effect(
      "counts only the questions the digest selects, sends once, and keeps the day",
      Effect.fnUntraced(function* () {
        const answered = question("question:notice-1");
        yield* (yield* ReviewItemStore).upsert([
          answered,
          question("question:notice-2"),
          ReviewItem.cases["kg-answer"].make({
            itemId: "kg-answer:notice-1",
            text: "The synthetic matter has one pending reply.",
            sourceRefs: [],
          }),
        ]);
        yield* (yield* QuestionQueue).recordAnswer({
          item: answered,
          answer: RecordAnswerInput.cases.decided.make({ itemId: answered.itemId, optionId: "due-december-1" }),
        });

        const first = yield* sendDailyNotice(UTC);
        const second = yield* sendDailyNotice(UTC);
        const claims = yield* (yield* FileSystem.FileSystem).readDirectory(`${yield* DataDirectory}/notice-sent`);

        expect([first.status, second.status]).toStrictEqual(["sent", "already-sent"]);
        expect(yield* Ref.get(yield* SentMail)).toStrictEqual(["Claude: 1 question waiting -> attorney@example.test"]);
        expect(claims).toStrictEqual(["1970-01-01"]);
      })
    );
  });

  it.layer(NoticeTest, { timeout: "10 seconds" })("nothing waiting", (it) => {
    it.effect(
      "sends nothing and claims no day when no question waits",
      Effect.fnUntraced(function* () {
        const outcome = yield* sendDailyNotice(UTC);
        const claims = `${yield* DataDirectory}/notice-sent`;

        expect(outcome.status).toBe("nothing-waiting");
        expect(yield* Ref.get(yield* SentMail)).toStrictEqual([]);
        expect(yield* (yield* FileSystem.FileSystem).exists(claims)).toBe(false);
      })
    );
  });
});
