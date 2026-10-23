/**
 * Docket intake as the first producer of attorney questions: a needs-review
 * item becomes a `question` review item with the facts the pipeline checked
 * and the answers the attorney can give.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import { OptionWrite, QuestionFact, QuestionOption, ReviewItem } from "@beep/law-practice-domain";
import { equals, Order as LocalDateOrder } from "@beep/schema/LocalDate";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as Effect from "effect/Effect";
import * as Hex from "effect/encoding/Hex";
import { dual, pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import { DocketIntakeError } from "./DocketIntake.ports.ts";
import { DocketEntryFlag, DocketIntakeOutcome, DocketNeedsReviewReason } from "./DocketIntake.schemas.ts";
import { DocketCandidateDateSource } from "./DocketQuestions.schemas.ts";
import type { ReviewItemId } from "@beep/law-practice-domain";
import type { LocalDate } from "@beep/schema/LocalDate";
import type { QuestionReviewItem } from "../QuestionQueue/QuestionQueue.schemas.ts";
import type { DocketNeedsReview } from "./DocketIntake.schemas.ts";
import type { DocketCandidateDate, DocketQuestionInput } from "./DocketQuestions.schemas.ts";

const $I = $LawPracticeUseCasesId.create("DocketIntake/DocketQuestions.service");

const MAX_OPTIONS = 5;
const ID_HEX_LENGTH = 32;
const DEFAULT_TITLE = "Docket deadline";
const textEncoder = new TextEncoder();

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const longDate = (date: LocalDate): string =>
  O.getOrElse(
    O.map(A.get(MONTHS, date.month - 1), (month) => `${month} ${date.day}, ${date.year}`),
    () => date.toISOString()
  );

const questionText = (reason: DocketNeedsReview["reason"]): string =>
  DocketNeedsReviewReason.match(reason, {
    "no-usable-date": () => "Docket intake found no date it could use in a message. What is the deadline?",
    "due-date-past": () =>
      "The due date docket intake found for a message has already passed. What should the calendar show?",
    "agents-disagree": () => "The two readers of a docket message found different deadlines. Which date is right?",
    "processing-failed": () =>
      "Docket intake could not finish reading a message. Is it a deadline, and when is it due?",
    "flagged-low-confidence": () => "Docket intake is not confident about a message's deadline. Which date is right?",
    "flagged-max-rounds": () =>
      "The docket review ran out of rounds before its readers agreed on a deadline. Which date is right?",
    "deterministic-failure": () =>
      "The text docket intake quoted from a message does not match the message. Which date is right?",
  });

const notADeadline = QuestionOption.make({ optionId: "not-a-deadline", label: "Not a deadline" });
const handleMyself = (label: string) => QuestionOption.make({ optionId: "handle-myself", label });

// The answers that write nothing; every question offers at least one.
const nonWritingOptions = (reason: DocketNeedsReview["reason"]): ReadonlyArray<QuestionOption> =>
  DocketNeedsReviewReason.match(reason, {
    "no-usable-date": () => [handleMyself("I'll find the date and enter it"), notADeadline],
    "due-date-past": () => [
      handleMyself("I'll handle the missed date"),
      QuestionOption.make({ optionId: "already-handled", label: "Already handled" }),
    ],
    "agents-disagree": () => [handleMyself("Neither date; I'll enter it"), notADeadline],
    "processing-failed": () => [handleMyself("I'll read the message and enter it"), notADeadline],
    "flagged-low-confidence": () => [handleMyself("I'll check it and enter it"), notADeadline],
    "flagged-max-rounds": () => [handleMyself("I'll check it and enter it"), notADeadline],
    "deterministic-failure": () => [handleMyself("I'll check the message and enter it"), notADeadline],
  });

const flagFact = (flag: DocketEntryFlag): string =>
  DocketEntryFlag.match(flag, {
    "dates-differ": () => "The date the message states and the date computed from it differ.",
    "matter-ambiguous": () => "The message matches more than one matter.",
    "matter-suggested": () => "The matter was suggested, not matched exactly.",
    "matter-not-found": () => "No matter matches the message.",
    "matter-unverified": () => "The matter could not be verified.",
    "matter-lookup-failed": () => "The matter lookup failed.",
    "ladder-truncated": () => "Some reminders would fall before today and were not set.",
    "source-document-missing": () => "The source document was not attached to the message.",
    "due-date-past": () => "The due date is already past.",
    "junk-folder": () => "The message was found in Junk Email.",
    "deleted-folder": () => "The message was found in Deleted Items.",
    "tracked-date-differs": () => "The docket sheet tracks a different date for this matter.",
    "tracked-dates-unavailable": () => "The docket sheet could not be read.",
  });

const sourcePhrase = (source: DocketCandidateDate["source"]): string =>
  DocketCandidateDateSource.match(source, {
    stated: () => "the date the message states",
    computed: () => "computed from the mailing date",
    extractor: () => "the first reader's date",
    reviewer: () => "the second reader's date",
    tracked: () => "the date on the docket sheet",
  });

const candidateFact = ({ date, source }: DocketCandidateDate): string =>
  DocketCandidateDateSource.match(source, {
    stated: () => `The message states ${longDate(date)}.`,
    computed: () => `Computed from the mailing date: ${longDate(date)}.`,
    extractor: () => `The first reader found ${longDate(date)}.`,
    reviewer: () => `The second reader found ${longDate(date)}.`,
    tracked: () => `The docket sheet tracks ${longDate(date)}.`,
  });

const byDate = Order.mapInput(LocalDateOrder, ({ date }: DocketCandidateDate) => date);

// One option per distinct candidate date, earliest first, within the room the non-writing options leave.
const dateOptions = (
  input: DocketQuestionInput,
  needsReview: DocketNeedsReview,
  room: number
): ReadonlyArray<QuestionOption> =>
  pipe(
    A.dedupeWith(input.candidateDates, (self, that) => equals(self.date, that.date)),
    A.sort(byDate),
    A.take(room),
    A.map((candidate) =>
      QuestionOption.make({
        optionId: `use-${candidate.date.toISOString()}`,
        label: Str.capitalize(`use ${longDate(candidate.date)}, ${sourcePhrase(candidate.source)}`),
        write: O.some(
          OptionWrite.cases["calendar-date"].make({
            title: O.getOrElse(input.title, () => DEFAULT_TITLE),
            dueOn: candidate.date,
            eventId: O.some(needsReview.entry.eventId),
          })
        ),
      })
    )
  );

const questionFacts = (input: DocketQuestionInput, needsReview: DocketNeedsReview): ReadonlyArray<QuestionFact> => [
  QuestionFact.make({ text: "The message is on the calendar as a needs-review entry.", sourceRefs: [] }),
  ...A.map(needsReview.flags, (flag) => QuestionFact.make({ text: flagFact(flag), sourceRefs: [] })),
  ...A.map(A.sort(input.candidateDates, byDate), (candidate) =>
    QuestionFact.make({ text: candidateFact(candidate), sourceRefs: input.sourceRefs })
  ),
  ...O.toArray(
    O.map(needsReview.review, ({ maxRounds, rounds }) =>
      QuestionFact.make({ text: `The automated review ran ${rounds} of ${maxRounds} rounds.`, sourceRefs: [] })
    )
  ),
];

const questionFor = (
  input: DocketQuestionInput,
  needsReview: DocketNeedsReview,
  itemId: ReviewItemId
): QuestionReviewItem => {
  const nonWriting = nonWritingOptions(needsReview.reason);
  return ReviewItem.cases.question.make({
    itemId,
    text: questionText(needsReview.reason),
    label: O.some("Docket intake"),
    sourceRefs: input.sourceRefs,
    facts: questionFacts(input, needsReview),
    options: [...dateOptions(input, needsReview, MAX_OPTIONS - A.length(nonWriting)), ...nonWriting],
    docket: input.docket,
    conversationId: input.conversationId,
  });
};

/**
 * The question a docket intake outcome raises, if any.
 *
 * **Details**
 *
 * Records come first: only a `DocketNeedsReview` outcome becomes a question;
 * entered, non-docket and failed outcomes give none. The question asks the
 * reason's plain-language question. Its facts are the needs-review entry, each
 * flag, each candidate date (with the input's source documents) and the review
 * rounds. Its options are one calendar write per distinct candidate date,
 * earliest first, each moving the needs-review entry to that date, followed by
 * the reason's answers that write nothing; there are two to five in all.
 *
 * **Example** (Raise no question for a non-docket message)
 *
 * ```ts
 * import { DocketQuestionInput, NotDocketItem, docketQuestion } from "@beep/law-practice-use-cases/DocketIntake"
 *
 * const input = DocketQuestionInput.make({ outcome: NotDocketItem.make({ messageId: "message-1" }) })
 * console.log(docketQuestion(input, "docket-intake:example")._tag) // "None"
 * ```
 *
 * @category mapping
 * @since 0.0.0
 */
export const docketQuestion: {
  (itemId: ReviewItemId): (input: DocketQuestionInput) => O.Option<QuestionReviewItem>;
  (input: DocketQuestionInput, itemId: ReviewItemId): O.Option<QuestionReviewItem>;
} = dual(
  2,
  (input: DocketQuestionInput, itemId: ReviewItemId): O.Option<QuestionReviewItem> =>
    O.map(O.liftPredicate(input.outcome, DocketIntakeOutcome.guards.DocketNeedsReview), (needsReview) =>
      questionFor(input, needsReview, itemId)
    )
);

/**
 * Service shape of the docket question producer.
 *
 * **Example** (Name the producer method)
 *
 * ```ts
 * import type { DocketQuestionsShape } from "@beep/law-practice-use-cases/DocketIntake"
 *
 * const method: keyof DocketQuestionsShape = "raise"
 * console.log(method) // "raise"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface DocketQuestionsShape {
  /**
   * The question a docket intake outcome raises, with a stable item id:
   * `docket-intake:<reason>:<digest>`, where the digest is the first 32 hex
   * digits of the message id's SHA-256. None unless the outcome needs review.
   */
  readonly raise: (input: DocketQuestionInput) => Effect.Effect<O.Option<QuestionReviewItem>, DocketIntakeError>;
}

/**
 * Service: docket intake's producer of attorney questions.
 *
 * **Example** (Reference the producer)
 *
 * ```ts
 * import { DocketQuestions } from "@beep/law-practice-use-cases/DocketIntake"
 *
 * console.log(DocketQuestions.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class DocketQuestions extends Context.Service<DocketQuestions, DocketQuestionsShape>()($I`DocketQuestions`) {}

/**
 * Layer providing the docket question producer over the `Crypto` service.
 *
 * **Details**
 *
 * The item id digests the message id, so the same message and reason always
 * give the same question, and the id stays short and calendar-safe whatever
 * the provider's message id looks like. A digest failure fails with
 * `DocketIntakeError` at stage `review`.
 *
 * **Example** (Provide the producer)
 *
 * ```ts
 * import { DocketQuestionsLive } from "@beep/law-practice-use-cases/DocketIntake"
 * import * as Layer from "effect/Layer"
 *
 * console.log(Layer.isLayer(DocketQuestionsLive)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const DocketQuestionsLive: Layer.Layer<DocketQuestions, never, Crypto.Crypto> = Layer.effect(
  DocketQuestions,
  Effect.map(Crypto.Crypto, (crypto) =>
    DocketQuestions.of({
      raise: Effect.fn("DocketQuestions.raise")(function* (input: DocketQuestionInput) {
        if (!DocketIntakeOutcome.guards.DocketNeedsReview(input.outcome)) {
          return O.none<QuestionReviewItem>();
        }
        const { messageId, reason } = input.outcome;
        const digest = yield* crypto
          .digest("SHA-256", textEncoder.encode(messageId))
          .pipe(Effect.mapError(() => DocketIntakeError.make({ cause: "digest", stage: "review" })));
        return docketQuestion(input, `docket-intake:${reason}:${Str.slice(0, ID_HEX_LENGTH)(Hex.encode(digest))}`);
      }),
    })
  )
);
