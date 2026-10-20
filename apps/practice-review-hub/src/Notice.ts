/**
 * The daily notice: how many questions wait for the attorney today, emailed
 * from the attorney's mailbox to itself at most once a day.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ReviewItem } from "@beep/law-practice-domain";
import { docketDayInZone } from "@beep/law-practice-server/DocketIntake";
import { makeNoticeMailboxLayer, NoticeMailboxConfig } from "@beep/law-practice-server/NoticeMailbox";
import { makeReviewFilesLayer, ReviewFilesConfig } from "@beep/law-practice-server/ReviewFiles";
import { DailyNotice, DailyNoticeLive } from "@beep/law-practice-use-cases/DailyNotice";
import { DigestSelection, QuestionQueue, QuestionQueueLive } from "@beep/law-practice-use-cases/QuestionQueue";
import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { M365, M365MailAddress } from "@beep/m365";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";

/**
 * Prefix of the notice's mailbox settings: `PRACTICE_REVIEW_NOTICE_TENANT_ID`,
 * `_CLIENT_ID`, `_CERT_THUMBPRINT_SHA256`, `_CERT_PRIVATE_KEY` and `_MAILBOX`.
 *
 * **Example** (Name a notice setting)
 *
 * ```ts
 * import { NOTICE_ENV_PREFIX } from "@/Notice"
 *
 * console.log(`${NOTICE_ENV_PREFIX}_MAILBOX`) // "PRACTICE_REVIEW_NOTICE_MAILBOX"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const NOTICE_ENV_PREFIX = "PRACTICE_REVIEW_NOTICE";

/**
 * Send today's notice if one is due: count the questions the digest selects
 * for today in the given time zone, then send at most one notice for the day.
 *
 * **Example** (Reference the notice program)
 *
 * ```ts
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 * import { sendDailyNotice } from "@/Notice"
 *
 * console.log(Effect.isEffect(sendDailyNotice(DateTime.zoneMakeNamedUnsafe("America/Chicago")))) // true
 * ```
 *
 * @category programs
 * @since 0.0.0
 */
export const sendDailyNotice = Effect.fn("ReviewNotice.send")(function* (timeZone: DateTime.TimeZone) {
  const today = docketDayInZone(yield* DateTime.now, timeZone);
  const questions = A.filter(yield* (yield* ReviewItemStore).list, ReviewItem.guards.question);
  const digest = yield* (yield* QuestionQueue).digest(DigestSelection.make({ today, items: questions }));
  return yield* (yield* DailyNotice).sendIfDue({ digest, today });
});

/**
 * The services `sendDailyNotice` needs, over the hub's files in
 * `dataDirectory` and a notice mailbox that sends from `mailbox` to itself.
 *
 * **Details**
 *
 * The questions come from `items.jsonl` and their answers from
 * `answers.jsonl`. Each notice day is claimed by creating
 * `notice-sent/<YYYY-MM-DD>` beside them before the notice is sent, so two
 * runs on the same day send at most one notice. The caller provides the
 * `M365` connection.
 *
 * **Example** (Make the notice layer)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import { makeNoticeLayer } from "@/Notice"
 *
 * const layer = makeNoticeLayer({ dataDirectory: "/var/lib/practice-review-hub", mailbox: "attorney@example.test" })
 * console.log(Layer.isLayer(layer)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeNoticeLayer = (options: {
  readonly dataDirectory: string;
  readonly mailbox: M365MailAddress;
}): Layer.Layer<DailyNotice | QuestionQueue | ReviewItemStore, never, FileSystem.FileSystem | M365 | Path.Path> =>
  Layer.merge(
    DailyNoticeLive.pipe(
      Layer.provide(
        makeNoticeMailboxLayer(
          NoticeMailboxConfig.make({ dataDirectory: options.dataDirectory, mailbox: options.mailbox })
        )
      )
    ),
    QuestionQueueLive
  ).pipe(Layer.provideMerge(makeReviewFilesLayer(ReviewFilesConfig.make({ dataDirectory: options.dataDirectory }))));
