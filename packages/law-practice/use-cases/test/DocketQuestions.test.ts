/**
 * Docket intake as the first question producer: one question per
 * needs-review reason, none for settled outcomes. Every message id, date and
 * docket here is synthetic.
 */

import { DocketDueDate } from "@beep/law-practice-domain/values/DocketDeadline";
import { ReviewItem } from "@beep/law-practice-domain/values/ReviewItem";
import {
  DocketCandidateDate,
  DocketEntered,
  DocketNeedsReview,
  DocketNeedsReviewReason,
  DocketQuestionInput,
  DocketQuestions,
  DocketQuestionsLive,
  DocketWrittenEntry,
  IntakeFailed,
  NotDocketItem,
} from "@beep/law-practice-use-cases/DocketIntake";
import { LocalDate } from "@beep/schema/LocalDate";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome, assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { TestCrypto } from "./officeActionFixtures.ts";
import type { DocketCandidateDateSource } from "@beep/law-practice-use-cases/DocketIntake";

const NEEDS_REVIEW_EVENT = "evt-needs-review-1";
const day = (month: number, dayOfMonth: number) => LocalDate.make({ year: 2026, month, day: dayOfMonth });
const candidate = (date: LocalDate, source: DocketCandidateDateSource) => DocketCandidateDate.make({ date, source });

const needsReview = (reason: DocketNeedsReviewReason, messageId = "AAMkAGsynthetic-message-1=") =>
  DocketNeedsReview.make({
    entry: DocketWrittenEntry.make({ eventId: NEEDS_REVIEW_EVENT }),
    flags: ["matter-suggested", "dates-differ"],
    messageId,
    reason,
  });

const encodeQuestion = S.encodeEffect(ReviewItem);
const decodeQuestion = S.decodeEffect(ReviewItem);

const raise = Effect.fnUntraced(function* (input: DocketQuestionInput) {
  return yield* (yield* DocketQuestions).raise(input);
});

describe("@beep/law-practice-use-cases docket questions", () => {
  it.layer(DocketQuestionsLive.pipe(Layer.provide(TestCrypto)), { timeout: "10 seconds" })("producer", (it) => {
    it.effect(
      "raises one valid question per needs-review reason, with a stable id",
      Effect.fnUntraced(function* () {
        const questions = yield* Effect.forEach(DocketNeedsReviewReason.literals, (reason) =>
          Effect.flatMap(raise(DocketQuestionInput.make({ outcome: needsReview(reason) })), (question) =>
            Effect.fromOption(question)
          )
        );
        const again = yield* raise(DocketQuestionInput.make({ outcome: needsReview("agents-disagree") }));

        expect(A.map(questions, ({ itemId }) => Str.replace(/:[0-9a-f]{32}$/u, "")(itemId))).toStrictEqual(
          A.map(DocketNeedsReviewReason.literals, (reason) => `docket-intake:${reason}`)
        );
        const agentsDisagree = yield* Effect.fromOption(A.get(questions, 2));
        assertSome(
          O.map(again, ({ itemId }) => itemId),
          agentsDisagree.itemId
        );
        expect(A.dedupe(A.map(questions, ({ text }) => text))).toHaveLength(DocketNeedsReviewReason.literals.length);
        for (const question of questions) {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(question.options.length).toBeLessThanOrEqual(5);
          assertTrue(A.some(question.options, ({ write }) => O.isNone(write)));
          expect(yield* decodeQuestion(yield* encodeQuestion(question))).toStrictEqual(question);
        }
      })
    );

    it.effect(
      "offers one calendar option per distinct candidate date, earliest first",
      Effect.fnUntraced(function* () {
        const question = yield* Effect.fromOption(
          yield* raise(
            DocketQuestionInput.make({
              outcome: needsReview("agents-disagree"),
              candidateDates: [
                candidate(day(11, 4), "reviewer"),
                candidate(day(11, 2), "extractor"),
                candidate(day(11, 2), "stated"),
              ],
              conversationId: O.some("AAQkADsynthetic-thread"),
              docket: O.some("90001US01"),
              title: O.some("Response to office action"),
            })
          )
        );

        expect(A.map(question.options, ({ optionId }) => optionId)).toStrictEqual([
          "use-2026-11-02",
          "use-2026-11-04",
          "handle-myself",
          "not-a-deadline",
        ]);
        assertSome(
          O.flatMap(A.head(question.options), ({ write }) => O.flatMap(write, ({ eventId }) => eventId)),
          NEEDS_REVIEW_EVENT
        );
        assertSome(question.docket, "90001US01");
        assertSome(question.conversationId, "AAQkADsynthetic-thread");
        expect(A.map(question.facts, ({ text }) => text)).toStrictEqual([
          "The message is on the calendar as a needs-review entry.",
          "The matter was suggested, not matched exactly.",
          "The date the message states and the date computed from it differ.",
          "The first reader found November 2, 2026.",
          "The message states November 2, 2026.",
          "The second reader found November 4, 2026.",
        ]);
      })
    );

    it.effect(
      "keeps at most five options, dropping the latest dates",
      Effect.fnUntraced(function* () {
        const question = yield* Effect.fromOption(
          yield* raise(
            DocketQuestionInput.make({
              outcome: needsReview("flagged-low-confidence"),
              candidateDates: A.map([20, 4, 12, 2, 9], (dayOfMonth) => candidate(day(11, dayOfMonth), "tracked")),
            })
          )
        );

        expect(A.map(question.options, ({ optionId }) => optionId)).toStrictEqual([
          "use-2026-11-02",
          "use-2026-11-04",
          "use-2026-11-09",
          "handle-myself",
          "not-a-deadline",
        ]);
        expect(question.facts).toHaveLength(8);
      })
    );

    it.effect(
      "raises nothing for settled, non-docket and failed outcomes, and separates messages and reasons",
      Effect.fnUntraced(function* () {
        const date = day(11, 2);
        const settled = DocketEntered.make({
          dueDate: DocketDueDate.make({ basis: "stated", computed: O.none(), date, stated: O.some(date) }),
          entry: DocketWrittenEntry.make({ eventId: "evt-due-1" }),
          flags: [],
          messageId: "AAMkAGsynthetic-message-1=",
          reminders: [],
        });
        for (const outcome of [
          settled,
          NotDocketItem.make({ messageId: "AAMkAGsynthetic-message-2=" }),
          IntakeFailed.make({ messageId: "AAMkAGsynthetic-message-3=", stage: "review" }),
        ]) {
          assertNone(yield* raise(DocketQuestionInput.make({ outcome })));
        }

        const ids = yield* Effect.forEach(
          [
            needsReview("no-usable-date", "AAMkAGsynthetic-message-1="),
            needsReview("no-usable-date", "AAMkAGsynthetic-message-2="),
            needsReview("due-date-past", "AAMkAGsynthetic-message-1="),
          ],
          (outcome) =>
            Effect.map(
              raise(DocketQuestionInput.make({ outcome })),
              O.map(({ itemId }) => itemId)
            )
        );
        expect(A.dedupe(A.getSomes(ids))).toHaveLength(3);
      })
    );
  });
});
