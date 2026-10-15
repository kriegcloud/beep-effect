/**
 * Server adapter of the daily notice's `NoticeMailbox` port over `@beep/m365`
 * mail drafts and a local file that keeps the day of the last notice.
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
import { LocalDateFromString } from "@beep/schema/LocalDate";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { NoticeMailboxOperation, NoticeMessage } from "@beep/law-practice-use-cases/DailyNotice";
import type { M365Shape } from "@beep/m365";
import type { LocalDate } from "@beep/schema/LocalDate";

const $I = $LawPracticeServerId.create("NoticeMailbox/NoticeMailbox.layer");

/**
 * The attorney's mailbox the notice goes from and to, and the file that keeps the day of the last notice.
 *
 * **Example** (Decode a notice config)
 *
 * ```ts
 * import { NoticeMailboxConfig } from "@beep/law-practice-server/NoticeMailbox"
 * import * as S from "effect/Schema"
 *
 * const config = S.decodeUnknownOption(NoticeMailboxConfig)({
 *   mailbox: "attorney@example.test",
 *   stateFile: "/var/lib/practice/notice-last-sent"
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
    stateFile: S.NonEmptyString.annotateKey({
      description: "Path of the file that keeps the day of the last notice; its directory must exist.",
    }),
  }).pipe(
    $I.annoteSchema("NoticeMailboxConfig", {
      description: "The attorney's mailbox the notice goes from and to, and the file that keeps the last notice day.",
    })
  )
) {}

const failed =
  (operation: NoticeMailboxOperation) =>
  (cause: unknown): NoticeMailboxError =>
    NoticeMailboxError.make({ cause: O.some(cause), operation });

const makeNoticeMailbox = (m365: M365Shape, fs: FileSystem.FileSystem, config: NoticeMailboxConfig) => {
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

  // No file yet means no notice yet; a file that names no day is a read failure, not "never".
  const lastSentOn = Effect.gen(function* () {
    if (!(yield* fs.exists(config.stateFile))) {
      return O.none<LocalDate>();
    }
    const text = yield* fs.readFileString(config.stateFile);
    return O.some(yield* S.decodeEffect(LocalDateFromString)(Str.trim(text)));
  }).pipe(Effect.mapError(failed("read")), Effect.withSpan("NoticeMailbox.lastSentOn"));

  const recordSentOn = Effect.fn("NoticeMailbox.recordSentOn")((day: LocalDate) =>
    fs.writeFileString(config.stateFile, `${day.toISOString()}\n`).pipe(Effect.mapError(failed("record")))
  );

  return NoticeMailbox.of({ lastSentOn, recordSentOn, send });
};

/**
 * Build the `NoticeMailbox` port over `@beep/m365` and the local file system.
 *
 * **Details**
 *
 * `send` creates a plain-text draft in the configured mailbox, addressed to
 * that same mailbox, and sends it, so the notice uses no grant beyond the
 * mailbox's own. The day of the last notice is one ISO date in
 * `stateFile`; no file means no notice yet. Every failure is a
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
 *   S.decodeUnknownOption(NoticeMailboxConfig)({ mailbox: "attorney@example.test", stateFile: "/tmp/notice" }),
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
): Layer.Layer<NoticeMailbox, never, FileSystem.FileSystem | M365> =>
  Layer.effect(
    NoticeMailbox,
    Effect.gen(function* () {
      return makeNoticeMailbox(yield* M365, yield* FileSystem.FileSystem, config);
    })
  );
