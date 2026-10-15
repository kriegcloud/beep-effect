/**
 * The attorney question loop's first vertical slice, end to end over the
 * in-memory answer log and an in-memory calendar: raise a question, select it
 * in the digest, answer it, propose and apply the write it implies, and undo
 * it. Every question, date and event here is synthetic.
 */

import { ReviewItem } from "@beep/law-practice-domain/values/ReviewItem";
import {
  DigestSelection,
  QuestionNotFoundError,
  QuestionQueue,
  QuestionQueueLive,
  RecordAnswerInput,
  UnknownQuestionOptionError,
} from "@beep/law-practice-use-cases/QuestionQueue";
import {
  CalendarPrior,
  OperatorApproval,
  ProposedWriteBatch,
  QuestionCalendar,
  QuestionWriteError,
  QuestionWrites,
  QuestionWritesLive,
  questionWriteKey,
} from "@beep/law-practice-use-cases/QuestionWrites";
import { AnswerLogMemory } from "@beep/law-practice-use-cases/test";
import { LocalDate } from "@beep/schema/LocalDate";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import { TestClock } from "effect/testing";
import type { QuestionReviewItem } from "@beep/law-practice-use-cases/QuestionQueue";
import type { ProposedWrite } from "@beep/law-practice-use-cases/QuestionWrites";

type TestEvent = { readonly fields: CalendarPrior; readonly key: O.Option<string> };

/** The in-memory calendar's events by id, so tests can read what a write did. */
class CalendarEvents extends Context.Service<CalendarEvents, Ref.Ref<HashMap.HashMap<string, TestEvent>>>()(
  "@beep/law-practice-use-cases/test/QuestionLoop.slice.test/CalendarEvents"
) {}

const T_ASKED = 1_760_400_000_000;
const MINUTE = 60_000;
const REFUSED_TITLE = "Calendar refuses this write";

const date = (year: number, month: number, day: number) => LocalDate.make({ year, month, day });
const provisional = (fields: { readonly date: LocalDate; readonly title: string }) =>
  CalendarPrior.make({ ...fields, category: "Docket - unverified" });

// The docket entry the question is about, already on the calendar.
const SEEDED_EVENT = "evt-seeded";
const seededPrior = provisional({ date: date(2026, 10, 2), title: "Response due" });

const notFound = (itemId: O.Option<string>) => QuestionWriteError.make({ reason: "event-not-found", itemId });

// Upserts and restores against a map of events: a named event is updated, a
// keyed write creates its event once and updates it after that.
const TestCalendar = Layer.effect(
  QuestionCalendar,
  Effect.map(CalendarEvents, (events) =>
    QuestionCalendar.of({
      upsert: Effect.fn("TestCalendar.upsert")(function* ({ key, write }) {
        if (write.title === REFUSED_TITLE) {
          return yield* QuestionWriteError.make({ reason: "calendar-unavailable" });
        }
        const fields = provisional({ date: write.dueOn, title: write.title });
        const state = yield* Ref.get(events);
        if (O.isSome(write.eventId)) {
          const eventId = write.eventId.value;
          const current = yield* Effect.fromOption(HashMap.get(state, eventId), () => notFound(O.none()));
          yield* Ref.set(events, HashMap.set(state, eventId, { ...current, fields }));
          return { eventId, prior: O.some(current.fields) };
        }
        const eventId = O.getOrElse(
          O.map(
            A.findFirst(HashMap.toEntries(state), ([, event]) => O.contains(event.key, key)),
            ([existing]) => existing
          ),
          () => `evt-${HashMap.size(state) + 1}`
        );
        yield* Ref.set(events, HashMap.set(state, eventId, { fields, key: O.some(key) }));
        return { eventId, prior: O.none<CalendarPrior>() };
      }),
      restore: Effect.fn("TestCalendar.restore")(function* (applied) {
        const state = yield* Ref.get(events);
        const current = yield* Effect.fromOption(HashMap.get(state, applied.eventId), () =>
          notFound(O.some(applied.proposal.itemId))
        );
        yield* Ref.set(
          events,
          O.match(applied.prior, {
            onNone: () => HashMap.remove(state, applied.eventId),
            onSome: (prior) => HashMap.set(state, applied.eventId, { ...current, fields: prior }),
          })
        );
      }),
    })
  )
);

const TestLayer = Layer.mergeAll(
  QuestionQueueLive.pipe(Layer.provide(AnswerLogMemory)),
  QuestionWritesLive.pipe(Layer.provide(TestCalendar))
).pipe(
  Layer.provideMerge(
    Layer.effect(
      CalendarEvents,
      Ref.make(
        HashMap.make<ReadonlyArray<readonly [string, TestEvent]>>([
          SEEDED_EVENT,
          { fields: seededPrior, key: O.none() },
        ])
      )
    )
  )
);

const question = (itemId: string) =>
  S.decodeEffect(ReviewItem.cases.question)({
    kind: "question",
    itemId,
    text: "Is the response date November 2 or October 2?",
    sourceRefs: [],
    facts: [{ text: "The office action was mailed on 2026-08-02.", sourceRefs: [] }],
    options: [
      { optionId: "keep-date", label: "Keep October 2" },
      {
        optionId: "move-to-2026-11-02",
        label: "Move the response date to November 2",
        write: { kind: "calendar-date", title: "Response due", dueOn: "2026-11-02", eventId: SEEDED_EVENT },
      },
      {
        optionId: "add-reminder",
        label: "Add a reminder for October 20",
        write: { kind: "calendar-date", title: "Check with the client", dueOn: "2026-10-20" },
      },
    ],
  });

const answerAt = Effect.fnUntraced(function* (at: number, item: QuestionReviewItem, answer: RecordAnswerInput) {
  yield* TestClock.setTime(at);
  return yield* (yield* QuestionQueue).recordAnswer({ item, answer });
});

const digestOn = Effect.fnUntraced(function* (today: LocalDate, items: ReadonlyArray<QuestionReviewItem>) {
  return A.map(yield* (yield* QuestionQueue).digest(DigestSelection.make({ today, items })), ({ itemId }) => itemId);
});

const decided = (itemId: string, optionId: string) => RecordAnswerInput.cases.decided.make({ itemId, optionId });

const approval = Effect.map(DateTime.now, (approvedAt) =>
  OperatorApproval.make({ approvedBy: { kind: "System", component: "Runtime" }, approvedAt })
);

const eventsNow = Effect.flatMap(CalendarEvents, Ref.get);

const batchOf = (batchId: string, proposals: ReadonlyArray<ProposedWrite>) =>
  Effect.map(Effect.fromOption(O.liftPredicate(proposals, A.isReadonlyArrayNonEmpty)), (nonEmpty) =>
    ProposedWriteBatch.make({ batchId, proposals: nonEmpty })
  );

describe("@beep/law-practice-use-cases question loop slice", () => {
  it.layer(TestLayer, { timeout: "10 seconds" })("first vertical slice", (it) => {
    it.effect(
      "raises, digests, defers, decides, applies and undoes one question",
      Effect.fnUntraced(function* () {
        const queue = yield* QuestionQueue;
        const writes = yield* QuestionWrites;
        const item = yield* question("question:slice:1");

        // Raised: no answer yet, so the digest selects it.
        expect(yield* digestOn(date(2026, 10, 14), [item])).toStrictEqual([item.itemId]);

        // Pending on the client until October 20: skipped before, selected on and after.
        const pending = yield* answerAt(
          T_ASKED,
          item,
          RecordAnswerInput.cases["pending-on-client"].make({ itemId: item.itemId, resurfaceOn: date(2026, 10, 20) })
        );
        expect(pending.revision).toBe(1);
        expect(yield* digestOn(date(2026, 10, 19), [item])).toStrictEqual([]);
        expect(yield* digestOn(date(2026, 10, 20), [item])).toStrictEqual([item.itemId]);
        expect(yield* digestOn(date(2026, 10, 21), [item])).toStrictEqual([item.itemId]);

        // Decided on the option that moves the date: it leaves the digest and proposes one write.
        const decision = yield* answerAt(T_ASKED + MINUTE, item, decided(item.itemId, "move-to-2026-11-02"));
        expect(decision.revision).toBe(2);
        expect(yield* digestOn(date(2026, 10, 21), [item])).toStrictEqual([]);
        const proposals = writes.propose({ items: [item], rows: yield* queue.readLog });
        expect(A.map(proposals, ({ optionId }) => optionId)).toStrictEqual(["move-to-2026-11-02"]);
        expect(A.map(proposals, ({ answeredAt }) => DateTime.toEpochMillis(answeredAt))).toStrictEqual([
          T_ASKED + MINUTE,
        ]);

        // Approved and applied: the seeded event moves, and its prior state is journaled.
        const applied = yield* writes.apply({
          batch: yield* batchOf("writes-2026-10-21", proposals),
          approval: yield* approval,
        });
        expect(A.map(applied.applied, ({ eventId }) => eventId)).toStrictEqual([SEEDED_EVENT]);
        assertSome(
          O.flatMap(A.head(applied.applied), ({ prior }) => prior),
          seededPrior
        );
        const moved = HashMap.get(yield* eventsNow, SEEDED_EVENT);
        assertSome(
          O.map(moved, ({ fields }) => fields.date.toISOString()),
          "2026-11-02"
        );

        // Undone: the event is back as it was.
        yield* writes.undo(applied);
        assertSome(
          O.map(HashMap.get(yield* eventsNow, SEEDED_EVENT), ({ fields }) => fields),
          seededPrior
        );
      })
    );
  });

  it.layer(TestLayer, { timeout: "10 seconds" })("answer validation", (it) => {
    it.effect(
      "rejects an unknown option and an answer for another question without appending",
      Effect.fnUntraced(function* () {
        const queue = yield* QuestionQueue;
        const item = yield* question("question:validation:1");

        const unknownOption = yield* Effect.flip(answerAt(T_ASKED, item, decided(item.itemId, "no-such-option")));
        const otherQuestion = yield* Effect.flip(
          answerAt(T_ASKED, item, RecordAnswerInput.cases["keep-reminding"].make({ itemId: "question:other" }))
        );

        expect(S.is(UnknownQuestionOptionError)(unknownOption)).toBe(true);
        expect(
          S.is(UnknownQuestionOptionError)(unknownOption) && [unknownOption.itemId, unknownOption.optionId]
        ).toStrictEqual([item.itemId, "no-such-option"]);
        expect(S.is(QuestionNotFoundError)(otherQuestion) && otherQuestion.itemId).toBe("question:other");
        expect(yield* queue.readLog).toStrictEqual([]);
      })
    );
  });

  it.layer(TestLayer, { timeout: "10 seconds" })("digest states", (it) => {
    it.effect(
      "keeps keep-reminding answers and drops withdrawn and decided ones",
      Effect.fnUntraced(function* () {
        const queue = yield* QuestionQueue;
        const writes = yield* QuestionWrites;
        const reminding = yield* question("question:digest:reminding");
        const withdrawn = yield* question("question:digest:withdrawn");
        const keep = yield* question("question:digest:keep");
        const unanswered = yield* question("question:digest:unanswered");
        const items = [reminding, withdrawn, keep, unanswered];

        yield* answerAt(
          T_ASKED,
          reminding,
          RecordAnswerInput.cases["keep-reminding"].make({ itemId: reminding.itemId })
        );
        yield* answerAt(T_ASKED, withdrawn, RecordAnswerInput.cases.withdrawn.make({ itemId: withdrawn.itemId }));
        yield* answerAt(T_ASKED, keep, decided(keep.itemId, "keep-date"));

        expect(yield* digestOn(date(2026, 10, 14), items)).toStrictEqual([reminding.itemId, unanswered.itemId]);
        expect(HashMap.size(yield* queue.currentAnswers(items))).toBe(3);
        // A decided option that names no write, and every other state, proposes nothing.
        expect(writes.propose({ items, rows: yield* queue.readLog })).toStrictEqual([]);

        // A later answer revises an earlier one: withdrawn, then keep reminding.
        const revised = yield* answerAt(
          T_ASKED + MINUTE,
          withdrawn,
          RecordAnswerInput.cases["keep-reminding"].make({ itemId: withdrawn.itemId })
        );
        expect(revised.revision).toBe(2);
        expect(yield* digestOn(date(2026, 10, 14), items)).toStrictEqual([
          reminding.itemId,
          withdrawn.itemId,
          unanswered.itemId,
        ]);
      })
    );
  });

  it.layer(TestLayer, { timeout: "10 seconds" })("idempotent apply", (it) => {
    it.effect(
      "applying the same keyed write twice leaves one event, and undo removes it",
      Effect.fnUntraced(function* () {
        const queue = yield* QuestionQueue;
        const writes = yield* QuestionWrites;
        const item = yield* question("question:apply:1");
        yield* answerAt(T_ASKED, item, decided(item.itemId, "add-reminder"));
        const proposals = writes.propose({ items: [item], rows: yield* queue.readLog });
        const approve = { batch: yield* batchOf("writes-1", proposals), approval: yield* approval };

        const first = yield* writes.apply(approve);
        const second = yield* writes.apply(approve);
        const created = A.map(first.applied, ({ eventId }) => eventId);

        expect(A.map(second.applied, ({ eventId }) => eventId)).toStrictEqual(created);
        const events = yield* eventsNow;
        expect(HashMap.size(events)).toBe(2);
        assertNone(O.flatMap(A.head(second.applied), ({ prior }) => prior));
        assertSome(
          O.flatMap(A.head(created), (eventId) => O.flatMap(HashMap.get(events, eventId), ({ key }) => key)),
          questionWriteKey({ itemId: item.itemId, optionId: "add-reminder" })
        );

        yield* writes.undo(second);
        expect(HashMap.size(yield* eventsNow)).toBe(1);
      })
    );
  });

  it.layer(TestLayer, { timeout: "10 seconds" })("failed apply", (it) => {
    it.effect(
      "restores the writes already applied when a later write fails",
      Effect.fnUntraced(function* () {
        const writes = yield* QuestionWrites;
        const before = yield* eventsNow;
        const proposal = (itemId: string, title: string) => ({
          itemId,
          optionId: "add-reminder",
          write: { kind: "calendar-date", title, dueOn: "2026-10-20" },
          answeredAt: T_ASKED,
        });
        const batch = yield* S.decodeUnknownEffect(ProposedWriteBatch)({
          batchId: "writes-failing",
          proposals: [proposal("question:fail:1", "Check with the client"), proposal("question:fail:2", REFUSED_TITLE)],
        });

        const error = yield* Effect.flip(writes.apply({ batch, approval: yield* approval }));

        expect(error.reason).toBe("calendar-unavailable");
        expect(yield* eventsNow).toStrictEqual(before);
      })
    );
  });
});
