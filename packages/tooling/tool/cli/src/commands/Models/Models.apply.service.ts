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
import * as Order from "effect/Order";
import * as Path from "effect/Path";
import * as Random from "effect/Random";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { XMLParser } from "fast-xml-parser";
import { asArrayBufferView } from "../../internal/cli/Bytes.ts";
import { decodeTomlTextWith, decodeYamlTextWith } from "../../internal/schema/TextCodec.ts";
import { ModelsLocatorError } from "./Models.errors.ts";
import { ModelsApplyJournal } from "./Models.manifest.schemas.ts";
import { modelsApplySpans, modelsWriteSpans } from "./Models.spans.ts";
import type { ModelsApplyMode, ModelsLocatorWrite, ModelsWriteSpan } from "./Models.manifest.schemas.ts";

const $I = $RepoCliId.create("commands/Models/Models.apply.service");
const encodeJournal = S.encodeEffect(S.fromJsonString(ModelsApplyJournal));
const decodeJournal = S.decodeEffect(S.fromJsonString(ModelsApplyJournal));
const failure = (message: string) => ModelsLocatorError.make({ message });
const nativeFields = S.Record(S.String, S.Unknown);
const encodeValue = S.encodeUnknownEffect(S.fromJsonString(S.Unknown));

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
  if (S.is(nativeFields)(value)) return R.map(value, (child, key) => maskOwned(child, childPaths(key)));
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
      ModelsLocatorError.mapError("Cannot compare native fields.")
    );
    const afterNative = yield* encodeValue(maskOwned(right, owned)).pipe(
      ModelsLocatorError.mapError("Cannot compare native fields.")
    );
    if (beforeNative !== afterNative) return yield* failure("Non-owned native keys changed.");
  });
  if (A.isReadonlyArrayNonEmpty(tomlPaths)) {
    const decode = decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown));
    yield* compare(
      yield* decode(before).pipe(ModelsLocatorError.mapError("Invalid native TOML.")),
      yield* decode(after).pipe(ModelsLocatorError.mapError("Invalid native TOML.")),
      tomlPaths
    );
  }
  if (A.isReadonlyArrayNonEmpty(jsonPaths)) {
    const decode = S.decodeEffect(S.fromJsonString(S.Unknown));
    yield* compare(
      yield* decode(before).pipe(ModelsLocatorError.mapError("Invalid native JSON.")),
      yield* decode(after).pipe(ModelsLocatorError.mapError("Invalid native JSON.")),
      jsonPaths
    );
  }
});

/**
 * The writer accepts only explicit locator ownership, never a full replacement file.
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

const validate = Effect.fnUntraced(function* (text: string, writes: ReadonlyArray<ModelsLocatorWrite>) {
  for (const { locator } of writes) {
    if (locator._tag === "toml-top-level-key" || locator._tag === "toml-table-key")
      yield* decodeTomlTextWith(S.decodeUnknownEffect(S.Unknown))(text).pipe(
        ModelsLocatorError.mapError("Invalid TOML target.")
      );
    if (locator._tag === "json-key")
      yield* S.decodeEffect(S.fromJsonString(S.Unknown))(text).pipe(
        ModelsLocatorError.mapError("Invalid JSON target.")
      );
    if (locator._tag === "yaml-path")
      yield* decodeYamlTextWith(S.decodeUnknownEffect(S.Unknown))(text).pipe(
        ModelsLocatorError.mapError("Invalid YAML target.")
      );
    if (locator._tag === "xml-attribute" || locator._tag === "xml-escaped-json-attribute") {
      yield* Effect.try({
        try: () => new XMLParser({ ignoreAttributes: false }).parse(text, true),
        catch: () => failure("Invalid XML target."),
      });
    }
  }
});

const makeApply = Effect.fn("ModelsApply.make")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const crypto = yield* Crypto.Crypto;
  const hash = Effect.fnUntraced(function* (text: string) {
    return Hex.encode(
      yield* crypto
        .digest("SHA-256", asArrayBufferView(new TextEncoder().encode(text)))
        .pipe(ModelsLocatorError.mapError("Cannot fingerprint configuration."))
    );
  });
  const io = ModelsLocatorError.mapError("Native configuration I/O failed.");
  const suffix = Effect.gen(function* () {
    const now = yield* DateTime.now;
    const salt = yield* Random.nextIntBetween(0, 0xffffff);
    return `models-${now.pipe(DateTime.formatIso, Str.replace(/[:.]/g, ""))}-${salt.toString(16)}`;
  });

  const atomic = Effect.fnUntraced(function* (file: string, beforeHash: string, after: string, mode: number) {
    const temporary = `${file}.${yield* suffix}.tmp`;
    yield* Effect.scoped(
      Effect.acquireUseRelease(
        fs.writeFileString(temporary, after, { flag: "wx", mode: 0o600 }).pipe(io, Effect.as(temporary)),
        Effect.fnUntraced(function* () {
          yield* fs.chmod(temporary, mode).pipe(io);
          const current = yield* fs.readFileString(file).pipe(io);
          if ((yield* hash(current)) !== beforeHash)
            return yield* failure("Native file drifted after planning; refusing replacement.");
          yield* fs.rename(temporary, file).pipe(io);
        }),
        () => Effect.ignore(fs.remove(temporary))
      )
    );
  });

  const apply: ModelsApplyShape["apply"] = Effect.fn("ModelsApply.apply")(
    function* (file, writes, mode, backupDirectory) {
      // Resolving symlinks preserves their native ownership rather than replacing the link.
      const actual = yield* fs.realPath(file).pipe(io);
      const before = yield* fs.readFileString(actual).pipe(io);
      yield* validate(before, writes);
      const spans = yield* Effect.forEach(writes, (write) => modelsWriteSpans(before, write), { concurrency: 1 }).pipe(
        Effect.map(A.flatten)
      );
      const after = yield* modelsApplySpans(before, spans);
      yield* validate(after, writes);
      yield* assertNativeFields(before, after, writes);
      // Re-resolve every address in the candidate. Replacing only those spans with
      // the old scalar bytes must reconstruct the complete original native file.
      const nextSpans = yield* Effect.forEach(writes, (write) => modelsWriteSpans(after, write), {
        concurrency: 1,
      }).pipe(Effect.map(A.flatten));
      const previousByOrder = A.sort(
        spans,
        Order.mapInput(Order.Number, (entry: ModelsWriteSpan) => entry.start)
      );
      const nextByOrder = A.sort(
        nextSpans,
        Order.mapInput(Order.Number, (entry: ModelsWriteSpan) => entry.start)
      );
      if (A.length(previousByOrder) !== A.length(nextByOrder))
        return yield* failure("Owned address set changed during projection.");
      const reversed: ReadonlyArray<ModelsWriteSpan> = A.zipWith(nextByOrder, previousByOrder, (next, previous) => ({
        ...next,
        after: previous.before,
      }));
      if ((yield* modelsApplySpans(after, reversed)) !== before)
        return yield* failure("Non-owned native bytes changed.");
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
      yield* atomic(actual, journal.beforeHash, after, info.mode);
      if ((yield* hash(yield* fs.readFileString(actual).pipe(io))) !== journal.afterHash)
        return yield* failure("Native file changed after replacement; preserve journal for recovery.");
      return O.some(journal);
    }
  );

  const restore: ModelsApplyShape["restore"] = Effect.fn("ModelsApply.restore")(
    function* (journalFile, backupDirectory) {
      const root = yield* fs.realPath(backupDirectory).pipe(io);
      const actualJournal = yield* fs.realPath(journalFile).pipe(io);
      if (path.dirname(actualJournal) !== root) return yield* failure("Journal must belong to the backup directory.");
      const journal = yield* fs
        .readFileString(actualJournal)
        .pipe(io, Effect.flatMap(decodeJournal), ModelsLocatorError.mapError("Invalid recovery journal."));
      const backup = yield* fs.realPath(journal.backup).pipe(io);
      if (path.dirname(backup) !== root || path.basename(backup) !== `${journal.id}.backup`)
        return yield* failure("Recovery backup is outside its journal directory.");
      const original = yield* fs.readFileString(backup).pipe(io);
      if ((yield* hash(original)) !== journal.beforeHash) return yield* failure("Recovery backup hash does not match.");
      const current = yield* fs.readFileString(journal.file).pipe(io);
      if ((yield* hash(current)) === journal.beforeHash) return;
      if ((yield* hash(current)) !== journal.afterHash)
        return yield* failure("Native file changed since apply; restore would overwrite new state.");
      yield* atomic(journal.file, journal.afterHash, original, journal.mode);
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
