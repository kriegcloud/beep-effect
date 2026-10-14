/**
 * The rows the practice mod keeps on the machine it runs on: verdicts on
 * answers, explicit timer intervals, and the attorney's chosen matter.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeClaudeModId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $PracticeClaudeModId.create("PracticeMod.values");

/**
 * The attorney's judgement of one answer.
 *
 * **Example** (Guard a verdict)
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Verdict } from "@/PracticeMod.values"
 *
 * console.log(S.is(Verdict)("wrong")) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const Verdict = LiteralKit(["right", "wrong", "partly"]).pipe(
  $I.annoteSchema("Verdict", { description: "The attorney's judgement of one answer." })
);

/**
 * Type-level union produced by {@link Verdict}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type Verdict = typeof Verdict.Type;

/**
 * The practice-kg tools whose calls the mod redraws in plain language.
 *
 * **Example** (List the redrawn tools)
 *
 * ```ts
 * import { PracticeKgToolName } from "@/PracticeMod.values"
 *
 * console.log(PracticeKgToolName.literals.length) // 11
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PracticeKgToolName = LiteralKit([
  "kg_clients",
  "kg_docket_family",
  "kg_application_lookup",
  "kg_find",
  "corpus_search_text",
  "corpus_get_document",
  "email_search",
  "kg_candidate_claims",
  "kg_matter_lookup",
  "kg_correspondent_lookup",
  "kg_provenance",
]).pipe(
  $I.annoteSchema("PracticeKgToolName", {
    description: "A practice-kg MCP tool whose calls the mod redraws in plain language.",
  })
);

/**
 * Type-level union produced by {@link PracticeKgToolName}.
 *
 * @category type-level
 * @since 0.0.0
 */
export type PracticeKgToolName = typeof PracticeKgToolName.Type;

/**
 * A matter the attorney chose with `/matter`, kept only when the knowledge
 * graph resolved it uniquely.
 *
 * **Example** (Make a chosen matter)
 *
 * ```ts
 * import { ChosenMatter } from "@/PracticeMod.values"
 *
 * const matter = ChosenMatter.make({ reference: "12345.10008US01", docketKey: "12345.10008US01", client: "12345" })
 * console.log(matter.reference) // "12345.10008US01"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ChosenMatter extends S.Class<ChosenMatter>($I`ChosenMatter`)(
  {
    reference: S.NonEmptyString.annotateKey({ description: "The reference the attorney typed." }),
    docketKey: S.NullOr(S.NonEmptyString).annotateKey({ description: "The resolved client-keyed docket, if any." }),
    client: S.NullOr(S.NonEmptyString).annotateKey({ description: "The resolved client number, if any." }),
  },
  $I.annote("ChosenMatter", { description: "A uniquely resolved matter the attorney chose for this session." })
) {}

/**
 * The answer a per-answer verdict targets: one completed turn of one
 * session, kept beside the verdict rows so a reviewer knows what was asked.
 *
 * **Details**
 *
 * `itemId` is `kg-answer:<sessionId>:<turnId>`, the same item id a review
 * queue uses for a knowledge-graph answer.
 *
 * **Example** (Make an answer item)
 *
 * ```ts
 * import * as O from "effect/Option"
 * import { KgAnswerItem } from "@/PracticeMod.values"
 *
 * const item = KgAnswerItem.make({
 *   itemId: "kg-answer:s-1:t-1",
 *   sessionId: "s-1",
 *   turnId: "t-1",
 *   question: "Which matter is 10008US01?",
 *   matter: O.none(),
 * })
 * console.log(item.itemId) // "kg-answer:s-1:t-1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class KgAnswerItem extends S.Class<KgAnswerItem>($I`KgAnswerItem`)(
  {
    itemId: S.NonEmptyString,
    sessionId: S.NonEmptyString,
    turnId: S.NonEmptyString,
    question: S.String,
    matter: S.OptionFromNullOr(ChosenMatter),
  },
  $I.annote("KgAnswerItem", { description: "The completed turn a per-answer verdict targets." })
) {}

/**
 * One verdict revision on one item. Rows are append-only: undo and changes
 * append a higher `revision`, and a row with `lockedAt` ends the item.
 *
 * **Details**
 *
 * The field set mirrors the shared review verdict envelope so the schema can
 * move to `@beep/law-practice-domain` unchanged once a second consumer reads
 * it (D10, D16).
 *
 * **Example** (Make a verdict row)
 *
 * ```ts
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { VerdictRow } from "@/PracticeMod.values"
 *
 * const row = VerdictRow.make({
 *   schemaVersion: "practice-verdict/v1",
 *   itemId: "kg-answer:s-1:t-1",
 *   verdict: O.some("wrong"),
 *   note: O.some("Missed the continuation."),
 *   revision: S.Natural.make(0),
 *   recordedAt: DateTime.makeUnsafe(0),
 *   lockedAt: O.none(),
 * })
 * console.log(row.revision) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VerdictRow extends S.Class<VerdictRow>($I`VerdictRow`)(
  {
    schemaVersion: S.Literal("practice-verdict/v1"),
    itemId: S.NonEmptyString,
    verdict: S.OptionFromNullOr(Verdict).annotateKey({
      description: "The verdict; none when this revision undoes the previous one.",
    }),
    note: S.OptionFromNullOr(S.NonEmptyString),
    revision: S.Natural,
    recordedAt: S.DateTimeUtcFromString,
    lockedAt: S.OptionFromNullOr(S.DateTimeUtcFromString),
  },
  $I.annote("VerdictRow", { description: "One append-only verdict revision on one reviewed item." })
) {}

/**
 * One explicit timer interval, written as one JSON line to the mod's local
 * timer log.
 *
 * **Details**
 *
 * Only `/time start` and `/time stop` create intervals; the duration is the
 * explicit interval and nothing else (law-time-capture-spine doctrine). The
 * rows stay raw until that goal's entry model exists.
 *
 * **Example** (Make a timer interval)
 *
 * ```ts
 * import * as DateTime from "effect/DateTime"
 * import * as O from "effect/Option"
 * import { TimerInterval } from "@/PracticeMod.values"
 *
 * const interval = TimerInterval.make({
 *   schemaVersion: "practice-timer/v1",
 *   sessionId: "s-1",
 *   matter: O.none(),
 *   startedAt: DateTime.makeUnsafe(0),
 *   stoppedAt: DateTime.makeUnsafe(60_000),
 * })
 * console.log(interval.schemaVersion) // "practice-timer/v1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TimerInterval extends S.Class<TimerInterval>($I`TimerInterval`)(
  {
    schemaVersion: S.Literal("practice-timer/v1"),
    sessionId: S.NonEmptyString,
    matter: S.OptionFromNullOr(ChosenMatter),
    startedAt: S.DateTimeUtcFromString,
    stoppedAt: S.DateTimeUtcFromString,
  },
  $I.annote("TimerInterval", { description: "One explicit timer interval, one line of the local timer log." })
) {}
