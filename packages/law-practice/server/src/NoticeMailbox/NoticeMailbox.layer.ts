/**
 * Server adapter of the daily notice's `NoticeMailbox` port over `@beep/m365`
 * mail drafts and one claim file per notice day.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeServerId } from "@beep/identity/packages";
import { NoticeMailbox, NoticeMailboxError } from "@beep/law-practice-use-cases/DailyNotice";
import {
  GraphPathSegment,
  M365,
  M365CreateDraftMessageRequest,
  M365MailAddress,
  M365MailBody,
  M365MailDraft,
  M365SendDraftMessageRequest,
} from "@beep/m365";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { NoticeMailboxOperation, NoticeMessage } from "@beep/law-practice-use-cases/DailyNotice";
import type { M365Shape } from "@beep/m365";
import type { LocalDate } from "@beep/schema/LocalDate";
import type { PlatformError } from "effect/PlatformError";

const $I = $LawPracticeServerId.create("NoticeMailbox/NoticeMailbox.layer");

/**
 * The attorney's mailbox the notice goes from and to, and the data directory its day claims are kept in.
 *
 * **Example** (Decode a notice config)
 *
 * ```ts
 * import { NoticeMailboxConfig } from "@beep/law-practice-server/NoticeMailbox"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownOption(NoticeMailboxConfig)({
 *   mailbox: "attorney@example.test",
 *   dataDirectory: "/var/lib/practice-review-hub"
 * })
 * console.log(config._tag) // "Some"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NoticeMailboxConfig extends S.Opaque<NoticeMailboxConfig, { readonly brand: unique symbol }>()(
  S.Struct({
    mailbox: M365MailAddress.annotateKey({
      description: "The attorney's mailbox address; the notice goes from it to itself. Never logged.",
    }),
    dataDirectory: S.NonEmptyString.annotateKey({
      description: "Directory whose notice-sent/ subdirectory holds one claim file per notice day.",
    }),
  }).pipe(
    $I.annoteSchema("NoticeMailboxConfig", {
      description: "The attorney's mailbox the notice goes from and to, and the directory of its day claims.",
    })
  )
) {}

// Subdirectory of the data directory that holds one claim file per notice day.
const NOTICE_CLAIMS_DIRECTORY = "notice-sent";

const isAlreadyExists = (error: PlatformError): boolean => P.isTagged(error.reason, "AlreadyExists");

const failed =
  (operation: NoticeMailboxOperation) =>
  (cause: unknown): NoticeMailboxError =>
    NoticeMailboxError.make({ cause: O.some(cause), operation });

const makeNoticeMailbox = (
  m365: M365Shape,
  fs: FileSystem.FileSystem,
  path: Path.Path,
  config: NoticeMailboxConfig
) => {
  const userId = O.some(config.mailbox);

  const send = Effect.fn("NoticeMailbox.send")(
    function* (message: NoticeMessage) {
      const draft = yield* m365.createDraftMessage(
        M365CreateDraftMessageRequest.make({
          draft: M365MailDraft.make({
            subject: message.subject,
            body: M365MailBody.make({ content: message.body, contentType: "text" }),
            toRecipients: [config.mailbox],
          }),
          userId,
        })
      );
      const messageId = yield* S.decodeEffect(GraphPathSegment)(draft.id);
      yield* m365.sendDraftMessage(M365SendDraftMessageRequest.make({ messageId, userId }));
    },
    Effect.mapError(failed("send"))
  );

  // One file per day, created exclusively: the run whose create succeeds owns the day, and every
  // other run that day, concurrent or later, finds the file and sends nothing.
  const claims = path.join(config.dataDirectory, NOTICE_CLAIMS_DIRECTORY);
  const claimDay = Effect.fn("NoticeMailbox.claimDay")(
    function* (day: LocalDate) {
      yield* fs.makeDirectory(claims, { recursive: true, mode: 0o700 });
      return yield* fs
        .writeFileString(path.join(claims, day.toISOString()), `${day.toISOString()}\n`, { flag: "wx", mode: 0o600 })
        .pipe(
          Effect.as(true),
          Effect.catchIf(isAlreadyExists, () => Effect.succeed(false))
        );
    },
    Effect.mapError(failed("claim"))
  );

  return NoticeMailbox.of({ claimDay, send });
};

/**
 * Build the `NoticeMailbox` port over `@beep/m365` and the local file system.
 *
 * **Details**
 *
 * `send` creates a plain-text draft in the configured mailbox, addressed to
 * that same mailbox, and sends it, so the notice uses no grant beyond the
 * mailbox's own. `claimDay` creates `notice-sent/<YYYY-MM-DD>` in the data
 * directory with an exclusive create: the run whose create succeeds gets
 * `true`, and a run that finds the file gets `false`, so two runs on one day,
 * at the same time or not, claim it once. Every failure is a
 * `NoticeMailboxError` naming the operation.
 *
 * **Example** (Make the notice mailbox layer)
 *
 * ```ts
 * import { NoticeMailboxConfig, makeNoticeMailboxLayer } from "@beep/law-practice-server/NoticeMailbox"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const layer = O.map(
 *   S.decodeUnknownOption(NoticeMailboxConfig)({
 *     mailbox: "attorney@example.test",
 *     dataDirectory: "/var/lib/practice-review-hub"
 *   }),
 *   makeNoticeMailboxLayer
 * )
 * console.log(O.isSome(layer)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeNoticeMailboxLayer = (
  config: NoticeMailboxConfig
): Layer.Layer<NoticeMailbox, never, FileSystem.FileSystem | M365 | Path.Path> =>
  Layer.effect(
    NoticeMailbox,
    Effect.gen(function* () {
      return makeNoticeMailbox(yield* M365, yield* FileSystem.FileSystem, yield* Path.Path, config);
    })
  );
