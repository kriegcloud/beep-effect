/**
 * Docket question values: a docket intake outcome with the context needed to
 * turn a needs-review item into a question for the attorney.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { SourceRef } from "@beep/law-practice-domain";
import { LiteralKit } from "@beep/schema";
import { LocalDateFromString } from "@beep/schema/LocalDate";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { DocketIntakeOutcome } from "./DocketIntake.schemas.ts";

const $I = $LawPracticeUseCasesId.create("DocketIntake/DocketQuestions.schemas");

// An optional text key: absent when the pipeline does not know the value.
const OptionalText = S.NonEmptyString.pipe(S.OptionFromOptionalKey, S.withConstructorDefault(Effect.succeedNone));

/**
 * Where a candidate due date came from.
 *
 * **Details**
 *
 * - `stated`: the message states the date outright;
 * - `computed`: computed from the mailing date and the response period;
 * - `extractor`: the first reader's date in an agent review;
 * - `reviewer`: the second reader's date in an agent review;
 * - `tracked`: the date the attorney's docket sheet already tracks.
 *
 * **Example** (Guard a candidate source)
 *
 * ```ts
 * import { DocketCandidateDateSource } from "@beep/law-practice-use-cases/DocketIntake"
 *
 * console.log(DocketCandidateDateSource.is.stated("stated")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const DocketCandidateDateSource = LiteralKit(["stated", "computed", "extractor", "reviewer", "tracked"]).pipe(
  $I.annoteSchema("DocketCandidateDateSource", {
    description: "Where a candidate due date came from: stated, computed, either agent reader, or the docket sheet.",
  })
);

/**
 * Runtime type for {@link DocketCandidateDateSource}.
 *
 * @see {@link DocketCandidateDateSource} for the sources.
 * @category models
 * @since 0.0.0
 */
export type DocketCandidateDateSource = typeof DocketCandidateDateSource.Type;

/**
 * One date a docket item's deadline could be, with where it came from.
 *
 * **Example** (Decode a stated date)
 *
 * ```ts
 * import { DocketCandidateDate } from "@beep/law-practice-use-cases/DocketIntake"
 * import * as S from "effect/Schema"
 *
 * const candidate = S.decodeUnknownOption(DocketCandidateDate)({ date: "2026-11-02", source: "stated" })
 * console.log(candidate._tag) // "Some"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DocketCandidateDate extends S.Opaque<DocketCandidateDate, { readonly brand: unique symbol }>()(
  S.Struct({
    date: LocalDateFromString.annotateKey({ description: "The candidate due date." }),
    source: DocketCandidateDateSource.annotateKey({ description: "Where the date came from." }),
  }).pipe(
    $I.annoteSchema("DocketCandidateDate", {
      description: "One date a docket item's deadline could be, with where it came from.",
    })
  )
) {}

/**
 * A docket intake outcome, with what the pipeline knows about it, to raise as a question.
 *
 * **Details**
 *
 * Only a `DocketNeedsReview` outcome becomes a question; the context fields
 * are optional because the pipeline knows them only for some messages.
 * `candidateDates` become one calendar option each, and `sourceRefs` are the
 * filed documents the dates were read from.
 *
 * **Example** (Read the input fields)
 *
 * ```ts
 * import { DocketQuestionInput } from "@beep/law-practice-use-cases/DocketIntake"
 *
 * console.log(Object.keys(DocketQuestionInput.fields).includes("outcome")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DocketQuestionInput extends S.Opaque<DocketQuestionInput, { readonly brand: unique symbol }>()(
  S.Struct({
    outcome: DocketIntakeOutcome.annotateKey({ description: "Outcome of processing one message." }),
    candidateDates: S.Array(DocketCandidateDate)
      .pipe(S.withConstructorDefault(Effect.succeed([])), S.withDecodingDefaultTypeKey(Effect.succeed([])))
      .annotateKey({ description: "Dates the deadline could be, from the message, the review, or the docket sheet." }),
    conversationId: OptionalText.annotateKey({ description: "Mail thread (Graph conversationId) of the message." }),
    docket: OptionalText.annotateKey({ description: "Docket number of the matched matter." }),
    sourceRefs: S.Array(SourceRef)
      .pipe(S.withConstructorDefault(Effect.succeed([])), S.withDecodingDefaultTypeKey(Effect.succeed([])))
      .annotateKey({ description: "Filed documents the candidate dates were read from." }),
    title: OptionalText.annotateKey({ description: "Calendar title the docket entry would carry." }),
  }).pipe(
    $I.annoteSchema("DocketQuestionInput", {
      description: "A docket intake outcome, with what the pipeline knows about it, to raise as a question.",
    })
  )
) {}
