/**
 * Daily notice contracts: the mailbox port that claims a day and sends the
 * notice, and the service that decides whether to send.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type { LocalDate } from "@beep/schema/LocalDate";
import type * as Effect from "effect/Effect";
import type { QuestionReviewItem } from "../QuestionQueue/QuestionQueue.schemas.ts";
import type { NoticeMailboxError } from "./DailyNotice.errors.ts";
import type { DailyNoticeOutcome, NoticeMessage } from "./DailyNotice.schemas.ts";

const $I = $LawPracticeUseCasesId.create("DailyNotice/DailyNotice.ports");

/**
 * Port shape: the attorney's mailbox as the notice's sender and recipient.
 *
 * **Details**
 *
 * The adapter sends from the attorney's own mailbox to itself. `claimDay` is
 * atomic: of any number of runs claiming the same day, at the same time or
 * not, exactly one gets `true`, so a second run on that day sends nothing.
 *
 * **Example** (Name a mailbox method)
 *
 * ```ts
 * import type { NoticeMailboxShape } from "@beep/law-practice-use-cases/DailyNotice"
 *
 * const method: keyof NoticeMailboxShape = "send"
 * console.log(method) // "send"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface NoticeMailboxShape {
  /** Claim the notice for this day: `true` for the one run that claims it, `false` once it is claimed. */
  readonly claimDay: (day: LocalDate) => Effect.Effect<boolean, NoticeMailboxError>;
  /** Send the notice from the attorney's mailbox to itself. */
  readonly send: (message: NoticeMessage) => Effect.Effect<void, NoticeMailboxError>;
}

/**
 * Port: the attorney's mailbox as the notice's sender and recipient.
 *
 * **Example** (Reference the mailbox port)
 *
 * ```ts
 * import { NoticeMailbox } from "@beep/law-practice-use-cases/DailyNotice"
 *
 * console.log(NoticeMailbox.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class NoticeMailbox extends Context.Service<NoticeMailbox, NoticeMailboxShape>()($I`NoticeMailbox`) {}

/**
 * Service shape of the daily notice.
 *
 * **Details**
 *
 * One email a day at most, and only when questions are waiting. The run
 * claims the day before it sends, so a failure after the claim never leads
 * to a second notice that day; such a day is reported as a failure instead.
 *
 * **Example** (Name the notice method)
 *
 * ```ts
 * import type { DailyNoticeShape } from "@beep/law-practice-use-cases/DailyNotice"
 *
 * const method: keyof DailyNoticeShape = "sendIfDue"
 * console.log(method) // "sendIfDue"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface DailyNoticeShape {
  /**
   * Send today's notice when the digest is non-empty and no notice went out
   * today; otherwise send nothing and say why.
   */
  readonly sendIfDue: (input: {
    readonly digest: ReadonlyArray<QuestionReviewItem>;
    readonly today: LocalDate;
  }) => Effect.Effect<DailyNoticeOutcome, NoticeMailboxError>;
}

/**
 * Service: the daily notice that tells the attorney how many questions are waiting.
 *
 * **Example** (Reference the notice service)
 *
 * ```ts
 * import { DailyNotice } from "@beep/law-practice-use-cases/DailyNotice"
 *
 * console.log(DailyNotice.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class DailyNotice extends Context.Service<DailyNotice, DailyNoticeShape>()($I`DailyNotice`) {}
