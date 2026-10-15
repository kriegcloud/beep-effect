/**
 * Backup-first native configuration writes and drift-fenced recovery.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { A, O, Str } from "@beep/utils";
import * as Context from "effect/Context";
import * as Crypto from "effect/Crypto";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Hex from "effect/encoding/Hex";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Random from "effect/Random";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import { XMLParser } from "fast-xml-parser";
import { asArrayBufferView } from "../../internal/cli/Bytes.ts";
import { decodeTomlTextWith, decodeYamlTextWith } from "../../internal/schema/TextCodec.ts";
import { ModelsLocatorError } from "./Models.errors.ts";
import { ModelsApplyJournal, ModelsWriteSpan } from "./Models.manifest.schemas.ts";
import { modelsApplySpans, modelsWriteSpans } from "./Models.spans.ts";
import type { ModelsApplyMode, ModelsLocatorWrite } from "./Models.manifest.schemas.ts";

const $I = $RepoCliId.create("commands/Models/Models.apply.service");
const encodeJournal = S.encodeEffect(S.fromJsonString(ModelsApplyJournal));
const decodeJournal = S.decodeEffect(S.fromJsonString(ModelsApplyJournal));
const failure = (message: string) => ModelsLocatorError.make({ message });
const nativeFields = S.Record(S.String, S.Unknown);
const encodeValue = S.encodeUnknownEffect(S.fromJsonString(S.Unknown));
const decodeJsonText = S.decodeEffect(S.fromJsonString(S.Unknown));

// Mask exactly the owned leaves in parsed native data. This assertion is
// independent of the stronger byte-preservation assertion below.
const maskOwned = (value: unknown, paths: ReadonlyArray<ReadonlyArray<string>>): unknown => {
  if (A.some(paths, A.isReadonlyArrayEmpty)) return "owned-model-leaf";
  const childPaths = (key: string) =>
    A.map(
      A.filter(paths, (segments) => O.contains(A.head(segments), key)),
      A.drop(1)
    );
  if (A.isArray(value)) return A.map(value, (child, index) => maskOwned(child, childPaths(`${index}`)));
  if (S.is(nativeFields)(value))
    return R.map(
      R.filter(value, (_, key) => !A.some(childPaths(key), A.isReadonlyArrayEmpty)),
      (child, key) => maskOwned(child, childPaths(key))
    );
  return value;
};

const assertNativeFields = Effect.fnUntraced(function* (
  before: string,
  after: string,
  writes: ReadonlyArray<ModelsLocatorWrite>
) {
  const tomlPaths = A.flatMap(writes, ({ locator }) =>
    locator._tag === "toml-top-level-key"
      ? [[locator.key]]
      : locator._tag === "toml-table-key"
        ? [[...Str.split(locator.table, "."), locator.key]]
        : []
  );
  const jsonPaths = A.flatMap(writes, ({ locator }) => (locator._tag === "json-key" ? [locator.pointer] : []));
  const compare = Effect.fnUntraced(function* (
    left: unknown,
    right: unknown,
    owned: ReadonlyArray<ReadonlyArray<string>>
  ) {
    const beforeNative = yield* encodeValue(maskOwned(left, owned)).pipe(
      Effect.mapError(() => failure("Cannot compare native fields."))
    );
    const afterNative = yield* encodeValue(maskOwned(right, owned)).pipe(
      Effect.mapError(() => failure("Cannot compare native fields."))
    );
    if (beforeNative !== afterNative) return yield* failure("Non-owned native keys changed.");
  });
  if (A.isReadonlyArrayNonEmpty(tomlPaths)) {
    const decode = decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown));
    yield* compare(
      yield* decode(before).pipe(Effect.mapError(() => failure("Invalid native TOML."))),
      yield* decode(after).pipe(Effect.mapError(() => failure("Invalid native TOML."))),
      tomlPaths
    );
  }
  if (A.isReadonlyArrayNonEmpty(jsonPaths)) {
    yield* compare(
      yield* decodeJsonText(before).pipe(Effect.mapError(() => failure("Invalid native JSON."))),
      yield* decodeJsonText(after).pipe(Effect.mapError(() => failure("Invalid native JSON."))),
      jsonPaths
    );
  }
});

const assertOwnedBytes = Effect.fnUntraced(function* (
  before: string,
  after: string,
  writes: ReadonlyArray<ModelsLocatorWrite>,
  spans: ReadonlyArray<ModelsWriteSpan>
) {
  const previousByOrder = A.sort(
    spans,
    Order.mapInput(Order.Number, (entry: ModelsWriteSpan) => entry.start)
  );
  let shift = 0;
  const reversed = A.map(previousByOrder, (previous) => {
    const start = previous.start + shift;
    shift += Str.length(previous.after) - Str.length(previous.before);
    return ModelsWriteSpan.make({
      start,
      end: start + Str.length(previous.after),
      before: previous.after,
      after: previous.before,
    });
  });
  // Re-resolve all owned locators, including absent-key removal assertions.
  for (const write of writes) {
    const resolved = yield* modelsWriteSpans(after, write);
    if (write.remove === true && A.isReadonlyArrayNonEmpty(resolved))
      return yield* failure("Removed native key returned during projection.");
    if ((yield* modelsApplySpans(after, resolved)) !== after)
      return yield* failure("Owned projection is not stable after re-resolving its addresses.");
  }
  if ((yield* modelsApplySpans(after, reversed)) !== before) return yield* failure("Non-owned native bytes changed.");
});

/**
 * The writer accepts only explicit locator ownership, never a full replacement file.
 *
 * **Example** (Describe the owned operations)
 *
 * ```ts
 * import type { ModelsApplyShape } from "@beep/repo-cli/commands/Models/Models.apply.service"
 * const operations: ReadonlyArray<keyof ModelsApplyShape> = ["apply", "restore"]
 * console.log(operations.length) // 2
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ModelsApplyShape {
  readonly apply: (
    file: string,
    writes: ReadonlyArray<ModelsLocatorWrite>,
    mode: ModelsApplyMode,
    backupDirectory: string
  ) => Effect.Effect<O.Option<ModelsApplyJournal>, ModelsLocatorError>;
  readonly restore: (journalFile: string, backupDirectory: string) => Effect.Effect<void, ModelsLocatorError>;
}

/**
 * Key-scoped native-file writer with exclusive backups and journaled rollback.
 *
 * **Details**
 *
 * A same-directory exclusive hard link retains the original inode before staging.
 * Apply and restore fence the live and retained bytes before atomic replacement,
 * then inspect the retained inode again. An in-place write observed in that window
 * fails with its journal id and restores the newer pre-image when our replacement
 * still owns the live path. A later rename-replacing writer wins; its bytes are
 * never intentionally rolled back. Recovery artifacts remain on failure.
 * This is detection and recovery, not mutual exclusion with native clients:
 * writers holding the old inode may write after the final observation, and the
 * identity check and recovery rename are not a filesystem compare-and-swap.
 * Such writers require an external maintenance boundary for a strict guarantee.
 *
 * **Example** (Access the writer)
 *
 * ```ts
 * import { ModelsApply } from "@beep/repo-cli/commands/Models/Models.apply.service"
 * import * as Effect from "effect/Effect"
 * console.log(Effect.isEffect(ModelsApply.use((writer) => Effect.succeed(writer))))
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ModelsApply extends Context.Service<ModelsApply, ModelsApplyShape>()($I`ModelsApply`) {}

const validateSyntax = Effect.fn("ModelsApply.validate")((text: string, writes: ReadonlyArray<ModelsLocatorWrite>) =>
  Effect.forEach(
    writes,
    ({ locator }) =>
      Match.value(locator).pipe(
        Match.tag("toml-top-level-key", "toml-table-key", () =>
          decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown))(text).pipe(
            Effect.mapError(() => failure("Invalid TOML target.")),
            Effect.asVoid
          )
        ),
        Match.tag("json-key", () =>
          decodeJsonText(text).pipe(
            Effect.mapError(() => failure("Invalid JSON target.")),
            Effect.asVoid
          )
        ),
        Match.tag("yaml-path", () =>
          decodeYamlTextWith(S.decodeUnknownEffect(S.Unknown))(text).pipe(
            Effect.mapError(() => failure("Invalid YAML target.")),
            Effect.asVoid
          )
        ),
        Match.tag("xml-attribute", "xml-escaped-json-attribute", () =>
          Effect.try({
            try: () => new XMLParser({ ignoreAttributes: false }).parse(text, true),
            catch: () => failure("Invalid XML target."),
          }).pipe(Effect.asVoid)
        ),
        Match.tag("shell-assign", () =>
          ChildProcessSpawner.ChildProcessSpawner.use((spawner) =>
            spawner
              .exitCode(
                ChildProcess.make("zsh", ["-f", "-n"], {
                  stdin: Stream.make(new TextEncoder().encode(text)),
                  stdout: "ignore",
                  stderr: "ignore",
                })
              )
              .pipe(
                Effect.mapError(() => failure("Cannot parse shell target with zsh.")),
                Effect.flatMap((code) => (code === 0 ? Effect.void : Effect.fail(failure("Invalid shell target."))))
              )
          )
        ),
        Match.orElse(() => Effect.void)
      ),
    { concurrency: 1, discard: true }
  )
);

const makeApply = Effect.fn("ModelsApply.make")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const crypto = yield* Crypto.Crypto;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const validate = (text: string, writes: ReadonlyArray<ModelsLocatorWrite>) =>
    validateSyntax(text, writes).pipe(Effect.provideService(ChildProcessSpawner.ChildProcessSpawner, spawner));
  const hash = Effect.fnUntraced(function* (text: string) {
    return Hex.encode(
      yield* crypto
        .digest("SHA-256", asArrayBufferView(new TextEncoder().encode(text)))
        .pipe(ModelsLocatorError.mapError("Cannot fingerprint configuration."))
    );
  });
  const io = ModelsLocatorError.mapError("Native configuration I/O failed.");
  const readNative = Effect.fnUntraced(function* (file: string) {
    const bytes = yield* fs.readFile(file).pipe(io);
    return yield* Effect.try({
      try: () => new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes),
      catch: () => failure("Native configuration must be valid UTF-8; refusing byte normalization."),
    });
  });
  const suffix = Effect.gen(function* () {
    const now = yield* DateTime.now;
    const salt = yield* Random.nextIntBetween(0, 0xffffff);
    return `models-${now.pipe(DateTime.formatIso, Str.replace(/[:.]/g, ""))}-${salt}`;
  });

  const atomic = Effect.fnUntraced(function* (
    file: string,
    beforeHash: string,
    after: string,
    mode: number,
    journal: ModelsApplyJournal,
    backupDirectory: string,
    writes: ReadonlyArray<ModelsLocatorWrite> = []
  ) {
    const operation = yield* suffix;
    const temporary = `${file}.${operation}.tmp`;
    const retained = `${file}.${operation}.preimage`;
    // link is exclusive and keeps the original inode observable after rename.
    yield* fs.link(file, retained).pipe(io);
    let completed = false;
    yield* Effect.acquireUseRelease(
      Effect.succeed(retained),
      () =>
        Effect.acquireUseRelease(
          fs.writeFileString(temporary, after, { flag: "wx", mode: 0o600 }).pipe(io),
          Effect.fnUntraced(function* () {
            const staged = yield* readNative(temporary);
            if (staged !== after) return yield* failure("Staged configuration differs from the validated candidate.");
            yield* validate(staged, writes);
            if (Str.endsWith(".toml")(file))
              yield* decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown))(staged).pipe(
                Effect.mapError(() => failure("Invalid staged TOML target."))
              );
            yield* fs.chmod(temporary, mode).pipe(io);
            const stagedInfo = yield* fs.stat(temporary).pipe(io);
            const current = yield* readNative(file);
            if ((yield* hash(current)) !== beforeHash || (yield* hash(yield* readNative(retained))) !== beforeHash)
              return yield* failure(`Native file drifted after planning; refusing replacement. Journal: ${journal.id}`);
            yield* Effect.uninterruptible(
              Effect.gen(function* () {
                yield* fs.rename(temporary, file).pipe(io);
                if ((yield* hash(yield* readNative(retained))) !== beforeHash) {
                  // Persist the recovery path before attempting recovery. Never erase a
                  // later rename-replacement or a write to our newly published inode.
                  yield* fs
                    .writeFileString(
                      path.join(backupDirectory, `${operation}.concurrent`),
                      `journal=${journal.id}\nretained=${retained}\nevent=original-inode-changed\n`,
                      { flag: "wx", mode: 0o600 }
                    )
                    .pipe(io);
                  const liveInfo = yield* fs.stat(file).pipe(io);
                  if (
                    O.isSome(stagedInfo.ino) &&
                    O.isSome(liveInfo.ino) &&
                    stagedInfo.dev === liveInfo.dev &&
                    stagedInfo.ino.value === liveInfo.ino.value &&
                    (yield* readNative(file)) === after
                  )
                    yield* fs.rename(retained, file).pipe(io);
                  return yield* failure(
                    `Concurrent native write detected; recovery event retained. Journal: ${journal.id}`
                  );
                }
                if ((yield* readNative(file)) !== after)
                  return yield* failure(
                    `Native file changed after replacement; preserve journal for recovery. Journal: ${journal.id}`
                  );
                completed = true;
              })
            );
          }),
          () => Effect.ignore(fs.remove(temporary))
        ),
      () => (completed ? Effect.ignore(fs.remove(retained)) : Effect.void)
    );
  });

  const apply: ModelsApplyShape["apply"] = Effect.fn("ModelsApply.apply")(
    function* (file, writes, mode, backupDirectory) {
      // Resolving symlinks preserves their native ownership rather than replacing the link.
      const actual = yield* fs.realPath(file).pipe(io);
      const before = yield* readNative(actual);
      yield* validate(before, writes);
      const spans = yield* Effect.forEach(writes, (write) => modelsWriteSpans(before, write), { concurrency: 1 }).pipe(
        Effect.map(A.flatten)
      );
      const after = yield* modelsApplySpans(before, spans);
      yield* validate(after, writes);
      yield* assertNativeFields(before, after, writes);
      // Re-resolve every address in the candidate. Replacing only those spans with
      // the old scalar bytes must reconstruct the complete original native file.
      yield* assertOwnedBytes(before, after, writes, spans);
      if (after === before) return O.none();
      if (mode === "check") return yield* failure("Owned configuration drift detected.");
      if (mode === "dry-run") return O.none();
      const info = yield* fs.stat(actual).pipe(io);
      const id = yield* suffix;
      yield* fs.makeDirectory(backupDirectory, { recursive: true, mode: 0o700 }).pipe(io);
      const backup = path.join(backupDirectory, `${id}.backup`);
      yield* fs.writeFileString(backup, before, { flag: "wx", mode: 0o600 }).pipe(io);
      const journal = ModelsApplyJournal.make({
        id,
        file: actual,
        backup,
        beforeHash: yield* hash(before),
        afterHash: yield* hash(after),
        mode: info.mode,
      });
      const encoded = yield* encodeJournal(journal).pipe(
        ModelsLocatorError.mapError("Cannot encode recovery journal.")
      );
      yield* fs
        .writeFileString(path.join(backupDirectory, `${id}.json`), encoded, { flag: "wx", mode: 0o600 })
        .pipe(io);
      yield* atomic(actual, journal.beforeHash, after, info.mode, journal, backupDirectory, writes);
      return O.some(journal);
    }
  );

  const restore: ModelsApplyShape["restore"] = Effect.fn("ModelsApply.restore")(
    function* (journalFile, backupDirectory) {
      const root = yield* fs.realPath(backupDirectory).pipe(io);
      const actualJournal = yield* fs.realPath(journalFile).pipe(io);
      if (path.dirname(actualJournal) !== root) return yield* failure("Journal must belong to the backup directory.");
      const journal = yield* fs.readFileString(actualJournal).pipe(
        io,
        Effect.flatMap(decodeJournal),
        Effect.mapError(() => failure("Invalid recovery journal."))
      );
      const backup = yield* fs.realPath(journal.backup).pipe(io);
      if (path.dirname(backup) !== root || path.basename(backup) !== `${journal.id}.backup`)
        return yield* failure("Recovery backup is outside its journal directory.");
      const original = yield* readNative(backup);
      if ((yield* hash(original)) !== journal.beforeHash) return yield* failure("Recovery backup hash does not match.");
      const current = yield* readNative(journal.file);
      if ((yield* hash(current)) === journal.beforeHash) return;
      if ((yield* hash(current)) !== journal.afterHash)
        return yield* failure("Native file changed since apply; restore would overwrite new state.");
      yield* atomic(journal.file, journal.afterHash, original, journal.mode, journal, backupDirectory);
    }
  );
  return ModelsApply.of({ apply, restore });
});

/**
 * Platform-backed owned-field writer.
 *
 * **Example** (Inspect the layer)
 *
 * ```ts
 * import { ModelsApplyLive } from "@beep/repo-cli/commands/Models/Models.apply.service"
 * import * as Layer from "effect/Layer"
 * console.log(Layer.isLayer(ModelsApplyLive))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const ModelsApplyLive = Layer.effect(ModelsApply, makeApply());
