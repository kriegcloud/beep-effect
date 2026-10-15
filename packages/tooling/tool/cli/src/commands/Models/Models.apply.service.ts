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
import { XMLParser } from "fast-xml-parser";
import { parseDocument } from "yaml";
import { asArrayBufferView } from "../../internal/cli/Bytes.ts";
import { decodeTomlTextWith, decodeYamlTextWith } from "../../internal/schema/TextCodec.ts";
import { ModelsLocatorError } from "./Models.errors.ts";
import { modelsReadShellAssign } from "./Models.locator.service.ts";
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
  const yamlPaths = A.flatMap(writes, ({ locator }) =>
    locator._tag === "yaml-path" ? [A.map(locator.path, (segment) => `${segment}`)] : []
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
  if (A.isReadonlyArrayNonEmpty(yamlPaths)) {
    const decode = (text: string) =>
      Effect.try({
        try: () => {
          const doc = parseDocument(text, { merge: true });
          if (A.isReadonlyArrayNonEmpty(doc.errors) || A.isReadonlyArrayNonEmpty(doc.warnings)) return O.none();
          return O.some(doc.toJS({ maxAliasCount: 100 }));
        },
        catch: () => failure("Invalid native YAML."),
      }).pipe(
        Effect.flatMap(
          O.match({
            onNone: () => Effect.fail(failure("Invalid native YAML.")),
            onSome: Effect.succeed,
          })
        )
      );
    yield* compare(yield* decode(before), yield* decode(after), yamlPaths);
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
 * A same-directory exclusive hard link retains the planned inode. Publication
 * uses GNU mv --exchange (renameat2 RENAME_EXCHANGE), then verifies the actual
 * displaced inode and bytes. Apply, restore and recovery exchange rather than
 * overwriting a pathname. A competing replacement is returned to the live path;
 * every detected race fails with a journal id and retains recovery artifacts.
 * Capability is probed once per service; unsupported atomic exchange fails closed
 * for every write, including home writes. There is no unverified fallback.
 * Writers holding an inode can still mutate it after its final observation;
 * strict exclusion of such writers requires an external maintenance boundary.
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
        Match.orElse(() => Effect.void)
      ),
    { concurrency: 1, discard: true }
  )
);

const checkShellDrift = Effect.fnUntraced(function* (text: string, writes: ReadonlyArray<ModelsLocatorWrite>) {
  yield* Effect.forEach(
    writes,
    ({ locator, expected }) =>
      Match.value(locator).pipe(
        Match.tag("shell-assign", ({ variable, within }) =>
          modelsReadShellAssign(text, variable, within).pipe(
            Effect.flatMap((current) =>
              !O.exists(current, Str.includes("Unsupported shell form")) && O.contains(expected)(current)
                ? Effect.void
                : Effect.fail(
                    failure(
                      O.exists(current, Str.includes("Unsupported shell form"))
                        ? "Unsupported shell form: owned configuration drift detected (shell target is check-only; edit by hand)."
                        : "Owned configuration drift detected (shell target is check-only; edit by hand)."
                    )
                  )
            )
          )
        ),
        Match.orElse(() => Effect.void)
      ),
    { concurrency: 1, discard: true }
  );
});

const makeApply = Effect.fn("ModelsApply.make")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const crypto = yield* Crypto.Crypto;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const validate = validateSyntax;
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

  const exchange = Effect.fnUntraced(function* (left: string, right: string) {
    const code = yield* spawner
      .exitCode(
        ChildProcess.make("mv", ["--exchange", "--no-copy", "--", left, right], {
          stdout: "ignore",
          stderr: "ignore",
        })
      )
      .pipe(ModelsLocatorError.mapError("Atomic exchange failed; retain recovery artifacts."));
    if (code !== 0) return yield* failure("Atomic exchange failed; retain recovery artifacts.");
  });
  const supported = yield* Effect.gen(function* () {
    const root = yield* fs.makeTempDirectoryScoped().pipe(io);
    const left = path.join(root, "left");
    const right = path.join(root, "right");
    yield* fs.writeFileString(left, "left", { flag: "wx", mode: 0o600 }).pipe(io);
    yield* fs.writeFileString(right, "right", { flag: "wx", mode: 0o600 }).pipe(io);
    yield* exchange(left, right);
    return (yield* readNative(left)) === "right" && (yield* readNative(right)) === "left";
  }).pipe(
    Effect.scoped,
    Effect.catchTag("ModelsLocatorError", () => Effect.succeed(false)),
    Effect.cached
  );
  const sameInode = (left: FileSystem.File.Info, right: FileSystem.File.Info) =>
    O.isSome(left.ino) && O.isSome(right.ino) && left.dev === right.dev && left.ino.value === right.ino.value;

  const matches = Effect.fnUntraced(function* (file: string, info: FileSystem.File.Info, expectedHash: string) {
    // stat follows a link, while exchange moves the link itself. Never accept a
    // displaced symlink merely because its target has the planned inode/hash.
    if (O.isSome(yield* fs.readLink(file).pipe(Effect.option))) return false;
    return sameInode(info, yield* fs.stat(file).pipe(io)) && (yield* hash(yield* readNative(file))) === expectedHash;
  });

  const recoverSymlink = Effect.fnUntraced(function* (
    file: string,
    temporary: string,
    info: FileSystem.File.Info,
    expectedHash: string
  ) {
    yield* exchange(temporary, file);
    if (!(yield* matches(temporary, info, expectedHash)))
      return yield* failure("Concurrent recovery changed during symlink exchange.");
  });

  // Recovery returns each actual displaced pathname occupant through another
  // verified exchange, preserving both files if contention continues.
  const recover = Effect.fnUntraced(function* (
    file: string,
    temporary: string,
    initialInfo: FileSystem.File.Info,
    initialHash: string
  ) {
    let expectedInfo = initialInfo;
    let expectedHash = initialHash;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (!(yield* matches(file, expectedInfo, expectedHash))) break;
      if (O.isSome(yield* fs.readLink(temporary).pipe(Effect.option))) {
        yield* recoverSymlink(file, temporary, expectedInfo, expectedHash);
        break;
      }
      const returningInfo = yield* fs.stat(temporary).pipe(io);
      const returningHash = yield* hash(yield* readNative(temporary));
      yield* exchange(temporary, file);
      if (yield* matches(temporary, expectedInfo, expectedHash)) break;
      expectedInfo = returningInfo;
      expectedHash = returningHash;
    }
  });

  const assertDestination = Effect.fnUntraced(function* (journal: ModelsApplyJournal) {
    const actual = yield* fs.realPath(journal.file).pipe(io);
    const link = yield* fs.readLink(journal.file).pipe(Effect.option);
    const info = yield* fs.stat(journal.file).pipe(io);
    if (actual !== journal.file || O.isSome(link) || info.type !== "File")
      return yield* failure("Canonical native destination changed; refusing replacement.");
    if (O.isNone(journal.requestedFile))
      return yield* failure("Recovery journal lacks destination identity; refusing replacement.");
    const requested = yield* fs.realPath(journal.requestedFile.value).pipe(io);
    const requestedLink = yield* fs.readLink(journal.requestedFile.value).pipe(Effect.option);
    if (
      requested !== journal.file ||
      !O.makeEquivalence<string>((left, right) => left === right)(requestedLink, journal.requestedLink)
    )
      return yield* failure("Requested native entry or link target changed; refusing replacement.");
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
    if (!(yield* supported))
      return yield* failure(`Atomic exchange unsupported; refusing native write. Journal: ${journal.id}`);
    const operation = `${journal.id}-${yield* suffix}`;
    const temporary = `${file}.${operation}.tmp`;
    const retained = `${file}.${operation}.preimage`;
    let exchanged = false;
    let completed = false;
    yield* Effect.acquireUseRelease(
      assertDestination(journal).pipe(Effect.andThen(fs.link(file, retained)), io),
      () =>
        Effect.gen(function* () {
          const plannedInfo = yield* fs.stat(retained).pipe(io);
          return yield* Effect.acquireUseRelease(
            fs.writeFileString(temporary, after, { flag: "wx", mode: 0o600 }).pipe(io),
            Effect.fnUntraced(function* () {
              const staged = yield* readNative(temporary);
              if (staged !== after) return yield* failure("Staged configuration differs from the validated candidate.");
              yield* validate(staged, writes);
              if (Str.endsWith(".toml")(file))
                yield* decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown))(staged).pipe(
                  Effect.mapError(() => failure("Invalid staged TOML target."))
                );
              yield* assertDestination(journal);
              yield* fs.chmod(temporary, mode).pipe(io);
              const stagedInfo = yield* fs.stat(temporary).pipe(io);
              if (
                (yield* hash(yield* readNative(file))) !== beforeHash ||
                (yield* hash(yield* readNative(retained))) !== beforeHash
              )
                return yield* failure("Native file drifted after planning; refusing replacement.");
              yield* Effect.uninterruptible(
                Effect.gen(function* () {
                  // Once publication starts, a failed process observation is uncertain:
                  // retain both occupants even if mv cannot report its final status.
                  exchanged = true;
                  yield* exchange(temporary, file);
                  if (!(yield* matches(temporary, plannedInfo, beforeHash))) {
                    yield* fs
                      .writeFileString(
                        path.join(backupDirectory, `${operation}.concurrent`),
                        `journal=${journal.id}\nretained=${retained}\ndisplaced=${temporary}\nevent=concurrent-native-write\n`,
                        { flag: "wx", mode: 0o600 }
                      )
                      .pipe(io);
                    yield* recover(file, temporary, stagedInfo, yield* hash(after));
                    return yield* failure("Concurrent native write detected; recovery event retained.");
                  }
                  if (!(yield* matches(file, stagedInfo, yield* hash(after))))
                    return yield* failure("Native file changed after replacement; preserve journal for recovery.");
                  completed = true;
                })
              );
            }),
            () => (!exchanged || completed ? Effect.ignore(fs.remove(temporary)) : Effect.void)
          );
        }),
      () => (!exchanged || completed ? Effect.ignore(fs.remove(retained)) : Effect.void)
    ).pipe(Effect.mapError((error) => failure(`${error.message} Journal: ${journal.id}`)));
  });

  const apply: ModelsApplyShape["apply"] = Effect.fn("ModelsApply.apply")(
    function* (file, writes, mode, backupDirectory) {
      const shellWrites = A.filter(writes, ({ locator }) => locator._tag === "shell-assign");
      if (mode === "write" && A.isReadonlyArrayNonEmpty(shellWrites))
        return yield* failure("Shell targets are check-only; edit by hand.");
      // Resolving symlinks preserves their native ownership rather than replacing the link.
      const actual = yield* fs.realPath(file).pipe(io);
      const before = yield* readNative(actual);
      yield* validate(before, writes);
      if (mode === "check") yield* checkShellDrift(before, writes);
      const nativeWrites = A.filter(writes, ({ locator }) => locator._tag !== "shell-assign");
      const spans = yield* Effect.forEach(nativeWrites, (write) => modelsWriteSpans(before, write), {
        concurrency: 1,
      }).pipe(Effect.map(A.flatten));
      const after = yield* modelsApplySpans(before, spans);
      yield* validate(after, writes);
      yield* assertNativeFields(before, after, writes);
      // Re-resolve every address in the candidate. Replacing only those spans with
      // the old scalar bytes must reconstruct the complete original native file.
      yield* assertOwnedBytes(before, after, nativeWrites, spans);
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
        writes: O.some(writes),
        requestedFile: O.some(path.resolve(file)),
        requestedLink: yield* fs.readLink(file).pipe(Effect.option),
      });
      const encoded = yield* encodeJournal(journal).pipe(
        ModelsLocatorError.mapError("Cannot encode recovery journal.")
      );
      yield* fs
        .writeFileString(path.join(backupDirectory, `${id}.json`), encoded, {
          flag: "wx",
          mode: 0o600,
        })
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
      yield* Effect.gen(function* () {
        if (O.isNone(journal.writes))
          return yield* failure("Legacy journal lacks locator ownership; shell targets are check-only; edit by hand.");
        if (A.some(journal.writes.value, ({ locator }) => locator._tag === "shell-assign"))
          return yield* failure("Shell targets are check-only; edit by hand.");
        yield* assertDestination(journal);
        const backup = yield* fs.realPath(journal.backup).pipe(io);
        if (path.dirname(backup) !== root || path.basename(backup) !== `${journal.id}.backup`)
          return yield* failure("Recovery backup is outside its journal directory.");
        const original = yield* readNative(backup);
        if ((yield* hash(original)) !== journal.beforeHash)
          return yield* failure("Recovery backup hash does not match.");
        const current = yield* readNative(journal.file);
        if ((yield* hash(current)) === journal.beforeHash) return;
        if ((yield* hash(current)) !== journal.afterHash)
          return yield* failure("Native file changed since apply; restore would overwrite new state.");
        yield* atomic(journal.file, journal.afterHash, original, journal.mode, journal, backupDirectory);
      }).pipe(
        Effect.mapError((error) =>
          failure(Str.includes("Journal:")(error.message) ? error.message : `${error.message} Journal: ${journal.id}`)
        )
      );
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
