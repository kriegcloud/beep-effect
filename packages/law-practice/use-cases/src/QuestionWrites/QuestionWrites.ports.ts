/**
 * Question write contracts: the calendar port that applies and restores
 * writes, and the service that proposes, applies and undoes them.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type { AnswerRow, OptionWrite } from "@beep/law-practice-domain";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type { QuestionReviewItem } from "../QuestionQueue/QuestionQueue.schemas.ts";
import type { QuestionWriteError } from "./QuestionWrites.errors.ts";
import type {
  AppliedWrite,
  AppliedWriteBatch,
  CalendarPrior,
  OperatorApproval,
  ProposedWrite,
  ProposedWriteBatch,
} from "./QuestionWrites.schemas.ts";

const $I = $LawPracticeUseCasesId.create("QuestionWrites/QuestionWrites.ports");

/**
 * Port shape: the calendar that applies question writes and restores them.
 *
 * **Details**
 *
 * The key of a write is `question:<itemId>:<optionId>`. The adapter stores it
 * on the event, so applying the same write twice updates the same event
 * rather than creating a second one. The docket-intake calendar adapter
 * implements this port within its provisional categories.
 *
 * **Example** (Name a calendar method)
 *
 * ```ts
 * import type { QuestionCalendarShape } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * const method: keyof QuestionCalendarShape = "upsert"
 * console.log(method) // "upsert"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface QuestionCalendarShape {
  /**
   * Put the event back as `prior` describes, or delete it when the write
   * created it. Fails with `event-not-found` when the event is gone and with
   * `restore-failed` when the calendar refuses.
   */
  readonly restore: (applied: AppliedWrite) => Effect.Effect<void, QuestionWriteError>;
  /**
   * Create or update the event the write names, keyed by `key`. Returns the
   * event id and, for an update, the event's state before it; re-applying a
   * write updates the event an earlier apply created under the same key, so
   * it returns that event's state as well. Fails with `event-verified`, and
   * changes nothing, when the event to update is no longer provisional.
   */
  readonly upsert: (input: {
    readonly key: string;
    readonly write: OptionWrite;
  }) => Effect.Effect<{ readonly eventId: string; readonly prior: O.Option<CalendarPrior> }, QuestionWriteError>;
}

/**
 * Port: the calendar that applies question writes and restores them.
 *
 * **Example** (Reference the calendar port)
 *
 * ```ts
 * import { QuestionCalendar } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * console.log(QuestionCalendar.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class QuestionCalendar extends Context.Service<QuestionCalendar, QuestionCalendarShape>()(
  $I`QuestionCalendar`
) {}

/**
 * Service shape of question writes.
 *
 * **Details**
 *
 * - **Propose.** `propose` is pure and deterministic. For each given question
 *   whose current answer (greatest `recordedAt`, then append order) is
 *   `decided` on an option that names a write, it returns one
 *   `ProposedWrite`, in the order of `items`. A note, and every state other
 *   than `decided`, proposes nothing; no write at all gives an empty result,
 *   never a failure.
 * - **Apply.** `apply` takes the operator's approval and has no default
 *   approver. It applies each proposal through {@link QuestionCalendar} in
 *   batch order and returns the `AppliedWriteBatch` the journal records. A
 *   failed apply takes back the writes it made; one it cannot take back is
 *   reported as `restore-failed`, never in place of the original failure.
 * - **Undo.** `undo` restores each applied write in reverse order.
 *
 * **Example** (Name a write method)
 *
 * ```ts
 * import type { QuestionWritesShape } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * const method: keyof QuestionWritesShape = "propose"
 * console.log(method) // "propose"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface QuestionWritesShape {
  /** Apply an approved batch through the calendar and return the applied writes for the journal. */
  readonly apply: (input: {
    readonly batch: ProposedWriteBatch;
    readonly approval: OperatorApproval;
  }) => Effect.Effect<AppliedWriteBatch, QuestionWriteError>;
  /** The writes the given questions' current decided answers imply, in the order of `items`; empty when none. */
  readonly propose: (input: {
    readonly items: ReadonlyArray<QuestionReviewItem>;
    readonly rows: ReadonlyArray<AnswerRow>;
  }) => ReadonlyArray<ProposedWrite>;
  /** Restore every write of an applied batch, last applied first. */
  readonly undo: (applied: AppliedWriteBatch) => Effect.Effect<void, QuestionWriteError>;
}

/**
 * Service: turns decided answers into operator-approved, journaled, undoable calendar writes.
 *
 * **Details**
 *
 * Proposals stay proposals until the operator approves their batch. The
 * service holds no journal of its own: `apply` returns the
 * `AppliedWriteBatch` the docket-intake journal records, and `undo` reads it
 * back.
 *
 * **Example** (Reference the write service)
 *
 * ```ts
 * import { QuestionWrites } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * console.log(QuestionWrites.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class QuestionWrites extends Context.Service<QuestionWrites, QuestionWritesShape>()($I`QuestionWrites`) {}
