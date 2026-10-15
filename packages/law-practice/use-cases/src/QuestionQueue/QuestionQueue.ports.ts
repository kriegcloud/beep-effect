/**
 * Question queue contracts: the answer-log store port and the queue service
 * that records the attorney's answers and selects the daily digest.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type { AnswerRow, ReviewItemId } from "@beep/law-practice-domain";
import type * as Effect from "effect/Effect";
import type * as HashMap from "effect/HashMap";
import type { AnswerLogError, QuestionNotFoundError, UnknownQuestionOptionError } from "./QuestionQueue.errors.ts";
import type { DigestSelection, QuestionReviewItem, RecordAnswerInput } from "./QuestionQueue.schemas.ts";

const $I = $LawPracticeUseCasesId.create("QuestionQueue/QuestionQueue.ports");

/**
 * Port shape: the append-only store behind the answer log.
 *
 * **Details**
 *
 * The store has no policy: it does not validate options, compute revisions or
 * order rows by time. It appends what it is given and reads back every row in
 * append order. There is no update and no delete.
 *
 * **Example** (Name a store method)
 *
 * ```ts
 * import type { AnswerLogShape } from "@beep/law-practice-use-cases/QuestionQueue"
 *
 * const method: keyof AnswerLogShape = "append"
 * console.log(method) // "append"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface AnswerLogShape {
  /** Append one row to the end of the log. A failure may or may not have stored it. */
  readonly append: (row: AnswerRow) => Effect.Effect<void, AnswerLogError>;
  /** Every stored row, in append order. Empty only when the store answered and holds no rows. */
  readonly rows: Effect.Effect<ReadonlyArray<AnswerRow>, AnswerLogError>;
}

/**
 * Port: the append-only store behind the answer log.
 *
 * **Details**
 *
 * It mirrors the review queue's `VerdictLog`: a durable adapter appends JSONL
 * rows, and tests use an in-memory store with the same shape.
 *
 * **Example** (Reference the store port)
 *
 * ```ts
 * import { AnswerLog } from "@beep/law-practice-use-cases/QuestionQueue"
 *
 * console.log(AnswerLog.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class AnswerLog extends Context.Service<AnswerLog, AnswerLogShape>()($I`AnswerLog`) {}

/**
 * Service shape of the question queue.
 *
 * **Details**
 *
 * Every answer appends a row through {@link AnswerLog}; nothing edits or
 * deletes one, and no answer is ever locked.
 *
 * - **Current answer.** A question's current answer is its row with the
 *   greatest `recordedAt`; a tie goes to the row appended last, since rows
 *   are read in append order. Revisions never break ties.
 * - **Revisions.** An answer is recorded with one more than the highest
 *   revision of that item, or 1 when the item has no row.
 * - **Digest.** The digest keeps, in the order given, every question with no
 *   answer, a `keep-reminding` answer, or a `pending-on-client` answer whose
 *   `resurfaceOn` is on or before `today`. `decided` and `withdrawn` answers
 *   leave the digest.
 *
 * Timestamps come from the `Clock` service, so tests control them with
 * `TestClock`.
 *
 * **Example** (Name a queue method)
 *
 * ```ts
 * import type { QuestionQueueShape } from "@beep/law-practice-use-cases/QuestionQueue"
 *
 * const method: keyof QuestionQueueShape = "digest"
 * console.log(method) // "digest"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface QuestionQueueShape {
  /**
   * The current answer of each given question that has one, keyed by item id.
   * Questions with no row are absent; rows for other items are ignored.
   */
  readonly currentAnswers: (
    items: ReadonlyArray<QuestionReviewItem>
  ) => Effect.Effect<HashMap.HashMap<ReviewItemId, AnswerRow>, AnswerLogError>;
  /** The questions the daily digest shows on `today`, in the order given. */
  readonly digest: (selection: DigestSelection) => Effect.Effect<ReadonlyArray<QuestionReviewItem>, AnswerLogError>;
  /** Every row of the answer log, in append order, superseded answers included. */
  readonly readLog: Effect.Effect<ReadonlyArray<AnswerRow>, AnswerLogError>;
  /**
   * Append the attorney's answer as the item's next revision, stamped with the
   * clock's current time, and return the appended row. Reading the log and
   * appending run under one permit. Fails with `QuestionNotFoundError` when
   * the answer names another item and with `UnknownQuestionOptionError` when a
   * `decided` answer names an option the item does not offer.
   */
  readonly recordAnswer: (input: {
    readonly item: QuestionReviewItem;
    readonly answer: RecordAnswerInput;
  }) => Effect.Effect<AnswerRow, QuestionNotFoundError | UnknownQuestionOptionError | AnswerLogError>;
}

/**
 * Service: the attorney's question queue over the append-only answer log.
 *
 * **Details**
 *
 * The queue owns option validation, revision numbering and the digest rule;
 * {@link AnswerLog} only stores rows. Turning decided answers into calendar
 * writes is the separate `QuestionWrites` service.
 *
 * **Example** (Reference the queue service)
 *
 * ```ts
 * import { QuestionQueue } from "@beep/law-practice-use-cases/QuestionQueue"
 *
 * console.log(QuestionQueue.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class QuestionQueue extends Context.Service<QuestionQueue, QuestionQueueShape>()($I`QuestionQueue`) {}
