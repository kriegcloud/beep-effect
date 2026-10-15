/**
 * Typed failures of question writes and their calendar port.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { ReviewItemId } from "@beep/law-practice-domain";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { DefectCause } from "../internal/DefectCause.ts";

const $I = $LawPracticeUseCasesId.create("QuestionWrites/QuestionWrites.errors");

const QuestionWriteReasonBase = LiteralKit(["calendar-unavailable", "event-not-found", "restore-failed"]);

/**
 * Why a question write or its undo failed.
 *
 * **Details**
 *
 * - `calendar-unavailable`: the calendar could not be reached or answered
 *   with an error;
 * - `event-not-found`: the event a write updates or an undo restores no
 *   longer exists;
 * - `restore-failed`: the calendar refused to put an event back.
 *
 * **Example** (Guard a write failure reason)
 *
 * ```ts
 * import { QuestionWriteReason } from "@beep/law-practice-use-cases/QuestionWrites"
 *
 * console.log(QuestionWriteReason.is["event-not-found"]("event-not-found")) // true
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const QuestionWriteReason = QuestionWriteReasonBase.pipe(
  $I.annoteSchema("QuestionWriteReason", {
    description: "Why a question write or its undo failed: calendar unavailable, event not found, or restore failed.",
  }),
  SchemaUtils.withLiteralKitStatics(QuestionWriteReasonBase)
);

/**
 * Runtime type for {@link QuestionWriteReason}.
 *
 * @see {@link QuestionWriteReason} for the reasons.
 * @category errors
 * @since 0.0.0
 */
export type QuestionWriteReason = typeof QuestionWriteReason.Type;

/**
 * A question write, or the undo of one, failed at the calendar.
 *
 * **Details**
 *
 * `itemId` names the question whose write failed when the failure belongs to
 * one. The cause is kept for diagnostics only.
 *
 * **Example** (Report a missing event)
 *
 * ```ts
 * import { QuestionWriteError } from "@beep/law-practice-use-cases/QuestionWrites"
 * import * as O from "effect/Option"
 *
 * const error = QuestionWriteError.make({ reason: "event-not-found", itemId: O.some("question:1") })
 * console.log(error.reason) // "event-not-found"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class QuestionWriteError extends S.TaggedError<QuestionWriteError, { readonly brand: unique symbol }>(
  $I`QuestionWriteError`
)(
  "QuestionWriteError",
  {
    cause: DefectCause.annotateKey({
      description: "Optional underlying calendar defect.",
    }),
    itemId: ReviewItemId.pipe(
      S.OptionFromOptionalKey,
      S.withConstructorDefault(Effect.succeedNone),
      S.annotateKey({
        description: "Question whose write failed, when the failure belongs to one.",
      })
    ),
    reason: QuestionWriteReason.annotateKey({
      description: "Closed failure category suitable for exhaustive handling.",
    }),
  },
  $I.annoteError<QuestionWriteError>("QuestionWriteError", {
    title: "Question write failed",
    description: "A question write, or the undo of one, failed at the calendar.",
  })
) {}
