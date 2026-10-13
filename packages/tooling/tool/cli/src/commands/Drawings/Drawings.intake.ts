/**
 * `DrawingIntake`: pull one Outlook message's file attachments into a
 * directory under the corpus root, dedupe them by SHA-256 against the files
 * already there, and write a `drawing-intake/v1` record beside them.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  GraphPathSegment,
  loadM365AppOnlyEnv,
  M365,
  M365DownloadMessageAttachmentRequest,
  M365GetMessageRequest,
  M365ListMessageAttachmentsRequest,
  M365ListMessagesRequest,
  OutlookItemRef,
  OutlookItemRefFromInput,
} from "@beep/m365";
import { EmailString } from "@beep/schema";
import { Sha256HexFromBytes } from "@beep/schema/Sha256";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { flow, pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { printLines } from "../../internal/cli/Printer.ts";
import { DrawingIntakeError, DrawingsCommandError } from "./Drawings.errors.ts";
import {
  IntakeAttachment,
  IntakePickFromString,
  IntakeRecord,
  IntakeRequest,
  IntakeResult,
  MessageFacts,
} from "./Drawings.intake.schemas.ts";
import type {
  GraphAttachment,
  GraphMessage,
  M365AppOnlyConfigInput,
  M365AppOnlyEnvSettings,
  M365Error,
} from "@beep/m365";
import type { Sha256Hex } from "@beep/schema/Sha256";
import type { IntakeAttachmentOutcome, IntakePick } from "./Drawings.intake.schemas.ts";

const $I = $RepoCliId.create("commands/Drawings/Drawings.intake");

const FILE_ATTACHMENT = "#microsoft.graph.fileAttachment";
// Graph answers 404 for an unknown id and 400 for an id of the wrong kind (a conversation id as a message id).
const NOT_FOUND_STATUSES = HashSet.make(400, 404);
const CONVERSATION_PAGE_SIZE = 50;
const MAX_CONVERSATION_PAGES = 20;
const RECORD_NAME_PATTERN = /^intake(-\d+)?\.json$/;
const UNSAFE_NAME_PATTERN = /[\p{Cc}<>:"/\\|?*]+/gu;
const WHITESPACE_RUN_PATTERN = /\s+/gu;
const LEADING_DOTS_PATTERN = /^\.+/;
const SHORT_HASH_LENGTH = 8;

const decodeSha256 = S.decodeEffect(Sha256HexFromBytes);
const decodeEmail = S.decodeUnknownEffect(EmailString);
const encodeRecord = S.encodeEffect(S.fromJsonString(IntakeRecord, { space: 2 }));

const refused = (message: string): DrawingIntakeError => DrawingIntakeError.make({ reason: "refused", message });

const mailError =
  (what: string) =>
  (cause: M365Error): DrawingIntakeError =>
    DrawingIntakeError.make({ reason: "mail", message: `${what} (${cause.reason}).`, cause });

const isNotFound = (error: M365Error): boolean =>
  error.reason === "response status" && O.exists(error.status, (status) => HashSet.has(NOT_FOUND_STATUSES, status));

const isWithin = (path: Path.Path, root: string, file: string): boolean => {
  const relative = path.relative(root, file);
  return relative.length > 0 && !Str.startsWith("..")(relative) && !path.isAbsolute(relative);
};

// A plain file name: no separators, control or shell-hostile characters, no leading dots, never a record name.
const sanitizedName: (name: string) => string = flow(
  Str.replaceAll(UNSAFE_NAME_PATTERN, "_"),
  Str.replaceAll(WHITESPACE_RUN_PATTERN, " "),
  Str.trim,
  Str.replace(LEADING_DOTS_PATTERN, ""),
  O.liftPredicate(Str.isNonEmpty),
  O.map((name) => (RECORD_NAME_PATTERN.test(name) ? `attachment-${name}` : name)),
  O.getOrElse(() => "attachment")
);

const withShortHash = (fileName: string, sha256: Sha256Hex): string => {
  const tag = ` (${Str.takeLeft(sha256, SHORT_HASH_LENGTH)})`;
  return O.match(Str.lastIndexOf(".")(fileName), {
    onNone: () => `${fileName}${tag}`,
    onSome: (index) =>
      index === 0 ? `${fileName}${tag}` : `${Str.slice(0, index)(fileName)}${tag}${Str.slice(index)(fileName)}`,
  });
};

const recordNameFor = (taken: MutableHashSet.MutableHashSet<string>, n: number): string => {
  const candidate = n === 1 ? "intake.json" : `intake-${n}.json`;
  return MutableHashSet.has(taken, candidate) ? recordNameFor(taken, n + 1) : candidate;
};

const receivedAtOf = (message: GraphMessage): string => O.getOrElse(message.receivedDateTime, () => "");
const newestFirst = Order.flip(Order.mapInput(Order.String, receivedAtOf));

const pickIndex = (pick: IntakePick): number => (pick === "latest" ? 0 : pick - 1);

const escapeODataString = Str.replaceAll("'", "''");

type Resolved = {
  readonly message: GraphMessage;
  readonly conversationSize: O.Option<number>;
};

/**
 * Runtime shape of the {@link DrawingIntake} service.
 *
 * **Example** (Stub service)
 *
 * ```ts
 * import type { DrawingIntakeShape } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const service: DrawingIntakeShape = { pull: () => Effect.die("not implemented") }
 * console.log(service)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface DrawingIntakeShape {
  readonly pull: (request: IntakeRequest) => Effect.Effect<IntakeResult, DrawingIntakeError>;
}

const makeService = Effect.fn("DrawingIntake.makeService")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const m365 = yield* M365;
  const crypto = yield* Crypto.Crypto;

  const io =
    (what: string) =>
    (cause: unknown): DrawingIntakeError =>
      DrawingIntakeError.make({ reason: "io", message: what, cause });

  const hash = (bytes: Uint8Array) =>
    decodeSha256(bytes).pipe(
      Effect.provideService(Crypto.Crypto, crypto),
      Effect.mapError(io("Could not hash attachment bytes."))
    );

  const asMessage = (mailbox: string, id: string): Effect.Effect<O.Option<Resolved>, DrawingIntakeError> =>
    m365.getMessage(M365GetMessageRequest.make({ messageId: id, userId: O.some(mailbox) })).pipe(
      Effect.map((message) => O.some({ message, conversationSize: O.none() })),
      Effect.catchIf(isNotFound, () => Effect.succeedNone),
      Effect.mapError(mailError("Could not read the message"))
    );

  const collectPages = (
    mailbox: string,
    request: M365ListMessagesRequest,
    collected: ReadonlyArray<GraphMessage>,
    pagesLeft: number
  ): Effect.Effect<ReadonlyArray<GraphMessage>, M365Error> =>
    m365.listMessages(request).pipe(
      Effect.flatMap((page) => {
        const all = A.appendAll(collected, page.value);
        return pipe(
          page["@odata.nextLink"],
          O.filter(() => pagesLeft > 1),
          O.match({
            onNone: () => Effect.succeed(all),
            onSome: (link) =>
              collectPages(
                mailbox,
                M365ListMessagesRequest.make({ nextLink: O.some(link), userId: O.some(mailbox) }),
                all,
                pagesLeft - 1
              ),
          })
        );
      })
    );

  // Graph refuses `$orderby` on a property the `$filter` does not name, so the newest-first order is applied here.
  const asConversation = Effect.fnUntraced(function* (
    mailbox: string,
    id: string,
    pick: IntakePick
  ): Effect.fn.Return<O.Option<Resolved>, DrawingIntakeError> {
    const first = M365ListMessagesRequest.make({
      filter: O.some(`conversationId eq '${escapeODataString(id)}'`),
      top: O.some(CONVERSATION_PAGE_SIZE),
      userId: O.some(mailbox),
    });
    const messages = yield* collectPages(mailbox, first, [], MAX_CONVERSATION_PAGES).pipe(
      Effect.catchIf(isNotFound, () => Effect.succeed(A.empty<GraphMessage>())),
      Effect.mapError(mailError("Could not list the conversation's messages"))
    );
    if (!A.isReadonlyArrayNonEmpty(messages)) {
      return O.none();
    }
    const sorted = A.sort(messages, newestFirst);
    const message = yield* Effect.fromOption(A.get(sorted, pickIndex(pick)), () =>
      refused(`The conversation has ${A.length(sorted)} message(s); --pick ${pick} is out of range.`)
    );
    return O.some({ message, conversationSize: O.some(A.length(sorted)) });
  });

  // The id prefix is only a hint: try the kind it suggests first, then the other.
  const resolve = Effect.fn("DrawingIntake.resolve")(function* (request: IntakeRequest) {
    const { id } = request.ref;
    const message = asMessage(request.mailbox, id);
    const conversation = asConversation(request.mailbox, id, request.pick);
    const [first, second] = OutlookItemRef.match(request.ref, {
      message: () => [message, conversation] as const,
      conversation: () => [conversation, message] as const,
    });
    const found = yield* first.pipe(
      Effect.flatMap(O.match({ onNone: () => second, onSome: (resolved) => Effect.succeedSome(resolved) }))
    );
    return yield* Effect.fromOption(found, () =>
      DrawingIntakeError.make({
        reason: "not-found",
        message: `No message or conversation "${id}" in mailbox "${request.mailbox}".`,
      })
    );
  });

  const required = <A>(value: O.Option<A>, what: string): Effect.Effect<A, DrawingIntakeError> =>
    Effect.fromOption(value, () => DrawingIntakeError.make({ reason: "mail", message: `The message has no ${what}.` }));

  const factsOf = Effect.fnUntraced(function* (message: GraphMessage) {
    const address = yield* required(
      pipe(
        message.from,
        O.flatMap((from) => from.emailAddress),
        O.flatMap((email) => email.address)
      ),
      "sender address"
    );
    return MessageFacts.make({
      messageId: message.id,
      internetMessageId: yield* required(message.internetMessageId, "internet message id"),
      conversationId: message.conversationId,
      from: yield* decodeEmail(address).pipe(
        Effect.mapError((cause) =>
          DrawingIntakeError.make({ reason: "mail", message: "The sender address does not decode.", cause })
        )
      ),
      receivedAt: yield* required(message.receivedDateTime, "receipt time"),
      subject: O.getOrElse(message.subject, () => ""),
    });
  });

  const realPathOf = (target: string) =>
    fs.realPath(target).pipe(Effect.mapError(io(`Could not resolve "${target}".`)));

  const nearestExisting = (target: string): Effect.Effect<string, DrawingIntakeError> =>
    fs.exists(target).pipe(
      Effect.mapError(io(`Could not inspect "${target}".`)),
      Effect.flatMap((exists) =>
        exists || path.dirname(target) === target ? Effect.succeed(target) : nearestExisting(path.dirname(target))
      )
    );

  // Every existing file in the intake directory, by content hash (first name wins), plus every taken name.
  const scanOut = Effect.fnUntraced(function* (outDir: string) {
    const names = A.sort(
      yield* fs.readDirectory(outDir).pipe(Effect.mapError(io(`Could not list "${outDir}".`))),
      Order.String
    );
    const byHash = MutableHashMap.empty<Sha256Hex, string>();
    yield* Effect.forEach(
      A.filter(names, (name) => !RECORD_NAME_PATTERN.test(name)),
      Effect.fnUntraced(function* (name) {
        const file = path.join(outDir, name);
        const info = yield* fs.stat(file).pipe(Effect.mapError(io(`Could not stat "${file}".`)));
        if (info.type !== "File") {
          return;
        }
        const sha256 = yield* hash(yield* fs.readFile(file).pipe(Effect.mapError(io(`Could not read "${file}".`))));
        if (!MutableHashMap.has(byHash, sha256)) {
          MutableHashMap.set(byHash, sha256, name);
        }
      }),
      { discard: true }
    );
    return { byHash, taken: MutableHashSet.fromIterable(names) };
  });

  const pull = Effect.fn("DrawingIntake.pull")(function* (request: IntakeRequest) {
    const root = path.resolve(request.corpusRoot);
    const outDir = path.resolve(request.outDir);
    if (!isWithin(path, root, outDir)) {
      return yield* refused(`"${outDir}" is not under the corpus root "${root}".`);
    }
    const { message, conversationSize } = yield* resolve(request);
    const facts = yield* factsOf(message);
    const listed = yield* m365
      .listMessageAttachments(
        M365ListMessageAttachmentsRequest.make({ messageId: message.id, userId: O.some(request.mailbox) })
      )
      .pipe(Effect.mapError(mailError("Could not list the message's attachments")));

    // Re-check on real paths, before and after creating the directory, so a symlink inside the
    // corpus can neither lead the writes out of it nor create a directory outside it.
    const realRoot = yield* realPathOf(root);
    const outsideRoot = (real: string) =>
      real !== realRoot && !isWithin(path, realRoot, real)
        ? Effect.fail(refused(`"${outDir}" resolves outside the corpus root "${root}".`))
        : Effect.void;
    yield* outsideRoot(yield* realPathOf(yield* nearestExisting(outDir)));
    yield* fs.makeDirectory(outDir, { recursive: true }).pipe(Effect.mapError(io(`Could not create "${outDir}".`)));
    const realOut = yield* realPathOf(outDir);
    yield* outsideRoot(realOut);
    if (realOut === realRoot) {
      return yield* refused(`"${outDir}" resolves to the corpus root itself.`);
    }
    const { byHash, taken } = yield* scanOut(realOut);

    const take = Effect.fnUntraced(function* (attachment: GraphAttachment) {
      const name = O.getOrElse(attachment.name, () => "");
      const row = (
        outcome: IntakeAttachmentOutcome,
        fields: {
          readonly bytes: number;
          readonly sha256?: Sha256Hex;
          readonly savedAs?: string;
          readonly duplicateOf?: string;
        }
      ) =>
        IntakeAttachment.make({
          attachmentId: attachment.id,
          name,
          savedAs: O.fromUndefinedOr(fields.savedAs),
          contentType: attachment.contentType,
          bytes: fields.bytes,
          sha256: O.fromUndefinedOr(fields.sha256),
          outcome,
          duplicateOf: O.fromUndefinedOr(fields.duplicateOf),
        });
      const declared = O.getOrElse(attachment.size, () => 0);
      if (O.getOrElse(attachment["@odata.type"], () => FILE_ATTACHMENT) !== FILE_ATTACHMENT) {
        return row("skipped-item", { bytes: declared });
      }
      if (O.getOrElse(attachment.isInline, () => false)) {
        return row("skipped-inline", { bytes: declared });
      }
      if (declared > request.maxBytes) {
        return row("skipped-oversize", { bytes: declared });
      }
      const { bytes } = yield* m365
        .downloadMessageAttachment(
          M365DownloadMessageAttachmentRequest.make({
            attachmentId: attachment.id,
            messageId: message.id,
            userId: O.some(request.mailbox),
          })
        )
        .pipe(Effect.mapError(mailError(`Could not download attachment "${name}"`)));
      if (bytes.byteLength > request.maxBytes) {
        return row("skipped-oversize", { bytes: bytes.byteLength });
      }
      const sha256 = yield* hash(bytes);
      const wanted = sanitizedName(name);
      const holder = MutableHashMap.get(byHash, sha256);
      if (O.isSome(holder)) {
        return holder.value === wanted
          ? row("unchanged", { bytes: bytes.byteLength, sha256, savedAs: wanted })
          : row("duplicate", { bytes: bytes.byteLength, sha256, duplicateOf: holder.value });
      }
      const fileName = MutableHashSet.has(taken, wanted) ? withShortHash(wanted, sha256) : wanted;
      if (MutableHashSet.has(taken, fileName)) {
        return yield* refused(
          `"${fileName}" already exists in "${realOut}" with other content; nothing is overwritten.`
        );
      }
      // `wx` fails rather than replace a file that appeared since the scan.
      yield* fs
        .writeFile(path.join(realOut, fileName), bytes, { flag: "wx" })
        .pipe(Effect.mapError(io(`Could not write "${fileName}".`)));
      MutableHashMap.set(byHash, sha256, fileName);
      MutableHashSet.add(taken, fileName);
      return row("saved", { bytes: bytes.byteLength, sha256, savedAs: fileName });
    });

    const attachments = yield* Effect.forEach(listed.value, take);
    const record = IntakeRecord.make({
      schemaVersion: "drawing-intake/v1",
      mailbox: request.mailbox,
      message: facts,
      outDir: realOut,
      attachments,
      pulledAt: DateTime.formatIso(yield* DateTime.now),
    });
    const recordPath = path.join(realOut, recordNameFor(taken, 1));
    const json = yield* encodeRecord(record).pipe(Effect.mapError(io("Could not encode the intake record.")));
    yield* fs
      .writeFileString(recordPath, `${json}\n`, { flag: "wx" })
      .pipe(Effect.mapError(io(`Could not write "${recordPath}".`)));
    return IntakeResult.make({ record, recordPath, conversationSize });
  });

  return { pull } satisfies DrawingIntakeShape;
});

/**
 * Pulls one Outlook message's file attachments into a directory under the corpus root.
 *
 * **Details**
 *
 * The item may be a message id or a conversation id (the newest message, or
 * the `pick`-th newest). Inline and item attachments are skipped; file
 * attachments are hashed, deduped against the files already in the directory,
 * and written without ever replacing a file. The record goes to
 * `intake.json`, or `intake-<n>.json` when earlier records exist.
 *
 * **Example** (Reference the service)
 *
 * ```ts
 * import { DrawingIntake } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(DrawingIntake.layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class DrawingIntake extends Context.Service<DrawingIntake, DrawingIntakeShape>()($I`DrawingIntake`) {
  /**
   * Layer over the M365 driver, the file system, path, and crypto services.
   *
   * **Example** (Reference the layer)
   *
   * ```ts
   * import { DrawingIntake } from "@beep/repo-cli/commands/Drawings"
   *
   * console.log(DrawingIntake.layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<DrawingIntake, never, M365 | FileSystem.FileSystem | Path.Path | Crypto.Crypto> =
    Layer.effect(DrawingIntake, Effect.map(makeService(), DrawingIntake.of));
}

const decodeRef = S.decodeUnknownEffect(OutlookItemRefFromInput);
const decodePick = S.decodeUnknownEffect(IntakePickFromString);
const decodeMailbox = S.decodeUnknownEffect(GraphPathSegment);

const OUTCOME_WIDTH = 17;

const attachmentLine = (row: IntakeAttachment): string => {
  const shown = O.getOrElse(row.savedAs, () => row.name);
  const sha256 = O.match(row.sha256, { onNone: () => "", onSome: (hex) => `  sha256 ${hex}` });
  const duplicate = O.match(row.duplicateOf, { onNone: () => "", onSome: (name) => `  same bytes as ${name}` });
  return `  ${Str.padEnd(OUTCOME_WIDTH)(row.outcome)}${shown}  ${row.bytes} bytes${sha256}${duplicate}`;
};

/**
 * Operator-facing summary of an intake: names, sizes and hashes only.
 *
 * **Details**
 *
 * The subject, sender and body of the message are never printed; they stay in
 * the record under the corpus root.
 *
 * **Example** (Summarise an empty intake)
 *
 * ```ts
 * import { EmailString } from "@beep/schema"
 * import { IntakeRecord, IntakeResult, MessageFacts, renderIntakeSummary } from "@beep/repo-cli/commands/Drawings"
 * import * as O from "effect/Option"
 *
 * const lines = renderIntakeSummary(
 *   IntakeResult.make({
 *     record: IntakeRecord.make({
 *       schemaVersion: "drawing-intake/v1",
 *       mailbox: "mailbox@example.test",
 *       message: MessageFacts.make({
 *         messageId: "AAMkAGI2",
 *         internetMessageId: "<id@mail.example.test>",
 *         conversationId: O.none(),
 *         from: EmailString.make("sender@example.test"),
 *         receivedAt: "2026-10-10T12:00:00Z",
 *         subject: ""
 *       }),
 *       outDir: "/corpus/in",
 *       attachments: [],
 *       pulledAt: "2026-10-13T00:00:00.000Z"
 *     }),
 *     recordPath: "/corpus/in/intake.json",
 *     conversationSize: O.none()
 *   })
 * )
 * console.log(lines[0]) // "intake: 0 attachment(s) -> /corpus/in"
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const renderIntakeSummary = (result: IntakeResult): ReadonlyArray<string> => [
  `intake: ${A.length(result.record.attachments)} attachment(s) -> ${result.record.outDir}`,
  ...O.match(result.conversationSize, {
    onNone: () => [],
    onSome: (size) => [`  the link named a conversation of ${size} message(s); --pick chose among them, newest first`],
  }),
  ...A.map(result.record.attachments, attachmentLine),
  `record: ${result.recordPath}`,
];

/**
 * The app-only lane settings `drawings intake` runs with.
 *
 * **Example** (Reference the service)
 *
 * ```ts
 * import { DrawingIntakeLane } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(DrawingIntakeLane)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class DrawingIntakeLane extends Context.Service<DrawingIntakeLane, M365AppOnlyEnvSettings>()(
  $I`DrawingIntakeLane`
) {}

/**
 * The intake service and its lane settings, from `<PREFIX>_*` variables.
 *
 * **Details**
 *
 * Loads the settings with `loadM365AppOnlyEnv`, refusing unresolved `op://`
 * values, then builds the mail layer from them. The command passes
 * `M365.makeAppOnlyLiveLayer`; tests pass a fake.
 *
 * **Example** (Bind the live lane)
 *
 * ```ts
 * import { M365 } from "@beep/m365"
 * import { drawingIntakeLaneLayer } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(drawingIntakeLaneLayer({ envPrefix: "M365_OUTBOX", mailLayer: M365.makeAppOnlyLiveLayer }))
 * ```
 *
 * @param options - `envPrefix` names the app-only variables (such as `M365_OUTBOX`); `mailLayer` builds the M365 layer from the loaded settings.
 * @returns The intake service and lane settings, needing the file-system, path and crypto services.
 * @category layers
 * @since 0.0.0
 */
export const drawingIntakeLaneLayer = <E>(options: {
  readonly envPrefix: string;
  readonly mailLayer: (appOnly: M365AppOnlyConfigInput) => Layer.Layer<M365, E>;
}): Layer.Layer<
  DrawingIntake | DrawingIntakeLane,
  DrawingsCommandError | E,
  FileSystem.FileSystem | Path.Path | Crypto.Crypto
> =>
  Layer.unwrap(
    loadM365AppOnlyEnv(options.envPrefix).pipe(
      Effect.mapError((cause) => DrawingsCommandError.new(cause, cause.message)),
      Effect.map((settings) =>
        Layer.merge(
          DrawingIntake.layer.pipe(Layer.provide(options.mailLayer(settings.appOnly))),
          Layer.succeed(DrawingIntakeLane, settings)
        )
      )
    )
  );

/**
 * Handler of `beep drawings intake`.
 *
 * **Details**
 *
 * Decodes `--message` and `--pick`, takes the mailbox from `--mailbox` or the
 * lane settings, pulls through {@link DrawingIntake}, and prints
 * {@link renderIntakeSummary}.
 *
 * **Example** (Reference the handler)
 *
 * ```ts
 * import { runDrawingIntake } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(typeof runDrawingIntake) // "function"
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const runDrawingIntake = Effect.fn("DrawingsCommand.intake")(function* (options: {
  readonly message: string;
  readonly mailbox: O.Option<string>;
  readonly out: string;
  readonly corpusRoot: string;
  readonly pick: string;
}) {
  const ref = yield* decodeRef(options.message).pipe(
    Effect.mapError(
      DrawingsCommandError.new("--message is not an Outlook web link or a Graph message or conversation id.")
    )
  );
  const pick = yield* decodePick(options.pick).pipe(
    Effect.mapError(DrawingsCommandError.new("--pick must be `latest` or a positive whole number."))
  );
  const lane = yield* DrawingIntakeLane;
  const mailbox = yield* decodeMailbox(O.getOrElse(options.mailbox, () => lane.mailbox)).pipe(
    Effect.mapError(DrawingsCommandError.new("--mailbox must be a mailbox address or user id."))
  );
  const intake = yield* DrawingIntake;
  const result = yield* intake
    .pull(IntakeRequest.make({ ref, mailbox, outDir: options.out, corpusRoot: options.corpusRoot, pick }))
    .pipe(Effect.mapError((cause) => DrawingsCommandError.new(cause, cause.message)));
  yield* printLines(renderIntakeSummary(result));
});
