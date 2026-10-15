/**
 * Question writes implementation over the calendar port.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { AnswerRow } from "@beep/law-practice-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { latestRowByItem } from "../internal/latestVerdict.ts";
import { QuestionCalendar, QuestionWrites } from "./QuestionWrites.ports.ts";
import { AppliedWrite, AppliedWriteBatch, ProposedWrite } from "./QuestionWrites.schemas.ts";
import type { QuestionReviewItem } from "../QuestionQueue/QuestionQueue.schemas.ts";
import type { QuestionCalendarShape, QuestionWritesShape } from "./QuestionWrites.ports.ts";
import type { OperatorApproval, ProposedWriteBatch } from "./QuestionWrites.schemas.ts";

/**
 * Calendar key of a proposed write: `question:<itemId>:<optionId>`.
 *
 * **Details**
 *
 * The calendar stores the key on the event, so applying the same write again
 * finds and updates that event instead of creating a second one.
 *
 * **Example** (Key a proposed write)
 *
 * ```ts
 * import { questionWriteKey } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * console.log(questionWriteKey({ itemId: "question:1", optionId: "move-date" })) // "question:question:1:move-date"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const questionWriteKey = ({ itemId, optionId }: Pick<ProposedWrite, "itemId" | "optionId">): string =>
  `question:${itemId}:${optionId}`;

// The write a question's current answer implies: a decided answer on an option that names one.
const proposalFor =
  (answers: HashMap.HashMap<string, AnswerRow>) =>
  (item: QuestionReviewItem): O.Option<ProposedWrite> =>
    pipe(
      HashMap.get(answers, item.itemId),
      O.filter(AnswerRow.guards.decided),
      O.flatMap((answer) =>
        pipe(
          A.findFirst(item.options, ({ optionId }) => optionId === answer.optionId),
          O.flatMap(({ write }) => write),
          O.map((write) =>
            ProposedWrite.make({
              itemId: item.itemId,
              optionId: answer.optionId,
              write,
              answeredAt: answer.recordedAt,
            })
          )
        )
      )
    );

const makeQuestionWrites = (calendar: QuestionCalendarShape): QuestionWritesShape => {
  const applyOne = (proposal: ProposedWrite) =>
    Effect.map(calendar.upsert({ key: questionWriteKey(proposal), write: proposal.write }), ({ eventId, prior }) =>
      AppliedWrite.make({ proposal, eventId, prior })
    );

  const restoreAll = (applied: ReadonlyArray<AppliedWrite>) =>
    Effect.forEach(A.reverse(applied), calendar.restore, { discard: true });

  // Each write after the first restores the writes before it when it fails,
  // so a failed apply leaves the calendar as it was.
  const apply = Effect.fn("QuestionWrites.apply")(function* (input: {
    readonly batch: ProposedWriteBatch;
    readonly approval: OperatorApproval;
  }) {
    const first = yield* applyOne(A.headNonEmpty(input.batch.proposals));
    const applied = yield* Effect.reduce(
      A.tailNonEmpty(input.batch.proposals),
      (): A.NonEmptyReadonlyArray<AppliedWrite> => A.of(first),
      (done, proposal) =>
        applyOne(proposal).pipe(
          Effect.map((write) => A.append(done, write)),
          Effect.catchTag("QuestionWriteError", (error) => Effect.andThen(restoreAll(done), Effect.fail(error)))
        )
    );
    return AppliedWriteBatch.make({ batchId: input.batch.batchId, approval: input.approval, applied });
  });

  return QuestionWrites.of({
    apply,
    propose: ({ items, rows }) => A.getSomes(A.map(items, proposalFor(latestRowByItem(rows)))),
    undo: Effect.fn("QuestionWrites.undo")((applied: AppliedWriteBatch) => restoreAll(applied.applied)),
  });
};

/**
 * Layer providing question writes over whichever {@link QuestionCalendar} the caller supplies.
 *
 * **Details**
 *
 * - `propose` is pure: for each question whose current answer is `decided`
 *   on an option that names a write, it returns one `ProposedWrite`, in the
 *   order of `items`.
 * - `apply` upserts each proposal under its {@link questionWriteKey}, in batch
 *   order, and returns the `AppliedWriteBatch` with each event's prior state.
 *   When a write fails, the writes already applied in that call are restored
 *   in reverse before the failure is returned.
 * - `undo` restores every applied write, last applied first.
 *
 * **Example** (Provide the layer over a calendar)
 *
 * ```ts
 * import { QuestionCalendar, QuestionWritesLive } from "@beep/law-practice-use-cases/QuestionWrites"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 * import * as O from "effect/Option"
 *
 * const calendar = Layer.succeed(QuestionCalendar, {
 *   upsert: () => Effect.succeed({ eventId: "evt-0001", prior: O.none() }),
 *   restore: () => Effect.void
 * })
 * console.log(Layer.isLayer(QuestionWritesLive.pipe(Layer.provide(calendar)))) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const QuestionWritesLive: Layer.Layer<QuestionWrites, never, QuestionCalendar> = Layer.effect(
  QuestionWrites,
  Effect.map(QuestionCalendar, makeQuestionWrites)
);
