import {$KnowledgeServerId} from "@beep/identity/packages";
import {BS} from "@beep/schema";
import {FileSystem, Path} from "@effect/platform";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import {SqlClient, SqlSchema} from "@effect/sql";
import {SqliteClient} from "@effect/sql-sqlite-bun";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("Service/Storage");

export class StorageGenerationConflictError extends S.TaggedError<StorageGenerationConflictError>(
  $I`StorageGenerationConflictError`
)(
  "StorageGenerationConflictError",
  {
    key: S.String,
    expectedGeneration: S.Number,
    actualGeneration: S.optionalWith(S.OptionFromNullishOr(S.Number, null), {default: O.none<number>}),
  },
  $I.annotations("StorageGenerationConflictError", {
    description: "Optimistic concurrency conflict: expected generation does not match current stored generation.",
  })
) {
}

export type StorageError = StorageGenerationConflictError;

export class StoredValue extends S.Class<StoredValue>($I`StoredValue`)(
  {
    key: S.String,
    value: S.String,
    generation: S.Number,
    updatedAt: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("StoredValue", {
    description: "Storage value with optimistic concurrency generation and last-updated timestamp.",
  })
) {
}

export class PutOptions extends S.Class<PutOptions>($I`PutOptions`)(
  {
    expectedGeneration: S.optional(S.Number),
  },
  $I.annotations("PutOptions", {
    description: "Options for Storage.put (expected generation for optimistic concurrency).",
  })
) {
}

export class DeleteOptions extends S.Class<DeleteOptions>($I`DeleteOptions`)(
  {
    expectedGeneration: S.optional(S.Number),
  },
  $I.annotations("DeleteOptions", {
    description: "Options for Storage.delete (expected generation for optimistic concurrency).",
  })
) {
}

export class SignedUrlPurpose extends BS.StringLiteralKit("get", "put").annotations(
  $I.annotations("SignedUrlPurpose", {
    description: "Operation intent for signed URL generation (get = download, put = upload).",
  })
) {
}

export class SignedUrlOptions extends S.Class<SignedUrlOptions>($I`SignedUrlOptions`)(
  {
    purpose: SignedUrlPurpose,
    expiresInSeconds: S.optional(S.Int.pipe(S.positive())),
  },
  $I.annotations("SignedUrlOptions", {
    description:
      "Optional parameters for signed URL generation. Backends without signed URLs should return Option.none().",
  })
) {
}

// -----------------------------------------------------------------------------
// Outcomes (used internally for Ref.modify determinism)
// -----------------------------------------------------------------------------

export class OutComeTag extends BS.StringLiteralKit("ok", "conflict").annotations(
  $I.annotations("OutComeTag", {
    description: "Outcome tag for storage operations",
  })
) {
}

export const makeOutcomeKind = OutComeTag.toTagged("_tag").composer({});

export class OkPutOutcome extends S.Class<OkPutOutcome>($I`OkPutOutcome`)(
  makeOutcomeKind.ok({
    value: StoredValue,
  })
) {
}

export class ConflictPutOutcome extends S.Class<ConflictPutOutcome>($I`ConflictPutOutcome`)(
  makeOutcomeKind.conflict({
    error: StorageGenerationConflictError,
  })
) {
}

export class PutOutcome extends S.Union(OkPutOutcome, ConflictPutOutcome) {
}

export declare namespace PutOutcome {
  export type Type = typeof PutOutcome.Type;
  export type Encoded = typeof PutOutcome.Encoded;
}

export class OkDeleteOutcome extends S.Class<OkDeleteOutcome>($I`OkDeleteOutcome`)(
  makeOutcomeKind.ok({
    value: S.Boolean,
  })
) {
}

export class ConflictDeleteOutcome extends S.Class<ConflictDeleteOutcome>($I`ConflictDeleteOutcome`)(
  makeOutcomeKind.conflict({
    error: StorageGenerationConflictError,
  })
) {
}

export class DeleteOutcome extends S.Union(OkDeleteOutcome, ConflictDeleteOutcome) {
}

export declare namespace DeleteOutcome {
  export type Type = typeof DeleteOutcome.Type;
  export type Encoded = typeof DeleteOutcome.Encoded;
}

export interface StorageShape {
  readonly get: (key: string) => Effect.Effect<O.Option<StoredValue>>;
  readonly put: (key: string, value: string, options?: PutOptions) => Effect.Effect<StoredValue, StorageError>;
  readonly delete: (key: string, options?: DeleteOptions) => Effect.Effect<boolean, StorageError>;
  readonly list: (prefix?: string) => Effect.Effect<ReadonlyArray<StoredValue>>;
  readonly signedUrl: (key: string, options?: SignedUrlOptions) => Effect.Effect<O.Option<string>>;
}

export class Storage extends Context.Tag($I`Storage`)<Storage, StorageShape>() {
}

const noneSignedUrl: StorageShape["signedUrl"] = Effect.fn("Storage.signedUrl")((_key, _options) =>
  Effect.succeed(O.none())
);

const checkExpectedGeneration = (
  key: string,
  expected: O.Option<number>,
  actual: O.Option<number>
): O.Option<StorageGenerationConflictError> =>
  O.flatMap(expected, (expectedGeneration) =>
    O.match(actual, {
      onNone: () => O.some(new StorageGenerationConflictError({key, expectedGeneration, actualGeneration: O.none()})),
      onSome: (actualGeneration) =>
        expectedGeneration === actualGeneration
          ? O.none()
          : O.some(
            new StorageGenerationConflictError({
              key,
              expectedGeneration,
              actualGeneration: O.some(actualGeneration),
            })
          ),
    })
  );

// -----------------------------------------------------------------------------
// In-memory backend
// -----------------------------------------------------------------------------

const serviceEffect: Effect.Effect<StorageShape> = Effect.gen(function* () {
  const stateRef = yield* Ref.make(HashMap.empty<string, StoredValue>());

  const get: StorageShape["get"] = Effect.fn("Storage.get")(function* (key) {
    const state = yield* Ref.get(stateRef);
    return HashMap.get(state, key);
  });

  const put: StorageShape["put"] = Effect.fn("Storage.put")(function* (key, value, options) {
    const result = yield* Ref.modify(
      stateRef,
      (state): readonly [PutOutcome.Type, HashMap.HashMap<string, StoredValue>] => {
        const current = HashMap.get(state, key);
        const actualGeneration = O.map(current, (_) => _.generation);

        const expectedGeneration = O.fromNullable(options?.expectedGeneration);
        const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
        if (O.isSome(conflict)) return [new ConflictPutOutcome({error: conflict.value}), state];

        const nextGeneration = O.match(actualGeneration, {onNone: () => 1, onSome: (g) => g + 1});
        const updatedAt = DateTime.unsafeNow();

        const nextValue = new StoredValue({
          key,
          value,
          generation: nextGeneration,
          updatedAt,
        });

        return [new OkPutOutcome({value: nextValue}), HashMap.set(state, key, nextValue)];
      }
    );

    return yield* Match.valueTags(result, {
      conflict: (r) => Effect.fail(r.error),
      ok: (r) => Effect.succeed(r.value),
    });
  });

  const deleteValue: StorageShape["delete"] = Effect.fn("Storage.delete")(function* (key, options) {
    const result = yield* Ref.modify(
      stateRef,
      (state): readonly [DeleteOutcome.Type, HashMap.HashMap<string, StoredValue>] => {
        const current = HashMap.get(state, key);
        const actualGeneration = O.map(current, (_) => _.generation);
        const expectedGeneration = O.fromNullable(options?.expectedGeneration);

        const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
        if (O.isSome(conflict)) return [new ConflictDeleteOutcome({error: conflict.value}), state];

        if (O.isNone(current)) {
          return [new OkDeleteOutcome({value: false}), state];
        }

        return [new OkDeleteOutcome({value: true}), HashMap.remove(state, key)];
      }
    );

    return yield* Match.valueTags(result, {
      conflict: (r) => Effect.fail(r.error),
      ok: (r) => Effect.succeed(r.value),
    });
  });

  const list: StorageShape["list"] = Effect.fn("Storage.list")(function* (prefix) {
    const state = yield* Ref.get(stateRef);
    const values = A.fromIterable(HashMap.values(state));
    const filtered = P.isString(prefix) ? A.filter(values, (entry) => Str.startsWith(prefix)(entry.key)) : values;
    return A.sort(
      filtered,
      Order.mapInput(Order.string, (entry: StoredValue) => entry.key)
    );
  });

  return Storage.of({get, put, delete: deleteValue, list, signedUrl: noneSignedUrl});
});

export const StorageMemoryLive = Layer.effect(Storage, serviceEffect);

// -----------------------------------------------------------------------------
// Local filesystem backend
// -----------------------------------------------------------------------------

export interface StorageLocalConfigShape {
  readonly rootDirectory: string;
}

export class StorageLocalConfig extends Context.Tag($I`StorageLocalConfig`)<
  StorageLocalConfig,
  StorageLocalConfigShape
>() {
}

export const StorageLocalConfigLive = Layer.effect(
  StorageLocalConfig,
  Effect.gen(function* () {
    const rootDirectory = yield* Config.string("KNOWLEDGE_STORAGE_LOCAL_ROOT").pipe(
      Config.withDefault("./tmp/knowledge-storage")
    );
    return StorageLocalConfig.of({rootDirectory});
  })
);

class StorageLocalMeta extends S.Class<StorageLocalMeta>($I`StorageLocalMeta`)(
  {
    generation: S.Number,
    updatedAtMillis: S.Number,
  },
  $I.annotations("StorageLocalMeta", {description: "Local backend meta sidecar (generation + updatedAt millis)"})
) {
}

const encodeMetaJson = S.encode(S.parseJson(StorageLocalMeta));
const decodeMetaJson = S.decodeUnknown(S.parseJson(StorageLocalMeta));

const metaPathFor = (filePath: string) => `${filePath}.meta.json`;

const makeStorageLocalService: Effect.Effect<
  StorageShape,
  never,
  StorageLocalConfig | FileSystem.FileSystem | Path.Path
> = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const {rootDirectory} = yield* StorageLocalConfig;

  const rootResolved = path.resolve(rootDirectory);
  const rootPrefix = Str.endsWith(path.sep)(rootResolved) ? rootResolved : `${rootResolved}${path.sep}`;

  // Centralize UTF-8 encoding/decoding via schema transforms rather than sprinkling TextEncoder/TextDecoder.
  const encodeUtf8 = S.encode(BS.DecodeString);
  const decodeUtf8 = S.decode(BS.DecodeString);

  // Bun currently rejects the AbortSignal instance passed by @effect/platform-node-shared
  // when using readFile/writeFile. Use open + readAlloc/writeAll to avoid passing `signal`.
  const readText = Effect.fn("StorageLocal.readText")((filePath: string) =>
    Effect.scoped(
      fs.open(filePath, {flag: "r"}).pipe(
        Effect.flatMap((file) =>
          file.stat.pipe(
            Effect.orDie,
            Effect.flatMap((info) => file.readAlloc(info.size).pipe(Effect.orDie)),
            Effect.map((bytesOpt) => O.getOrElse(bytesOpt, () => new Uint8Array())),
            Effect.flatMap((bytes) => decodeUtf8(bytes).pipe(Effect.orDie))
          )
        )
      )
    ).pipe(Effect.orDie)
  );

  const resolveKeyPath = Effect.fn("StorageLocal.resolveKeyPath")((key: string) => {
    const keySegments = A.filter(Str.split("/")(key), (seg) => Str.length(seg) > 0);
    const resolved = path.resolve(rootResolved, path.join(...keySegments));
    return Str.startsWith(rootPrefix)(resolved)
      ? Effect.succeed(resolved)
      : // exception(storage-key): treat invalid keys as defects to preserve Storage error surface
      Effect.dieMessage(`StorageLocal: key escapes rootDirectory: ${key}`);
  });

  const ensureParentDir = Effect.fn("StorageLocal.ensureParentDir")((filePath: string) =>
    fs.makeDirectory(path.dirname(filePath), {recursive: true}).pipe(Effect.orDie)
  );

  const readMeta = Effect.fn("StorageLocal.readMeta")((metaPath: string) =>
    fs.exists(metaPath).pipe(
      Effect.orDie,
      Effect.flatMap((exists) =>
        exists
          ? readText(metaPath).pipe(
            Effect.flatMap((text) => decodeMetaJson(text).pipe(Effect.orDie)),
            Effect.map(O.some)
          )
          : Effect.succeed(O.none())
      )
    )
  );

  const writeTextAtomic = Effect.fn("StorageLocal.writeTextAtomic")((targetPath: string, value: string) =>
    Effect.gen(function* () {
      const now = DateTime.toEpochMillis(DateTime.unsafeNow());
      const tmpPath = `${targetPath}.tmp.${now}`;
      yield* ensureParentDir(targetPath);
      const bytes = yield* encodeUtf8(value).pipe(Effect.orDie);
      // @effect/platform-node-shared's writeFile passes an AbortSignal that Bun's node:fs rejects.
      // Avoid FileSystem.writeFileString here by going through open + writeAll (no signal involved).
      yield* Effect.scoped(
        fs.open(tmpPath, {flag: "w"}).pipe(
          Effect.orDie,
          Effect.flatMap((file) => file.writeAll(bytes).pipe(Effect.orDie))
        )
      );
      yield* fs.rename(tmpPath, targetPath).pipe(Effect.orDie);
    })
  );

  const writeJsonAtomic = Effect.fn("StorageLocal.writeJsonAtomic")((targetPath: string, value: StorageLocalMeta) =>
    Effect.gen(function* () {
      const encoded = yield* encodeMetaJson(value).pipe(Effect.orDie);
      yield* writeTextAtomic(targetPath, encoded);
    })
  );

  const get: StorageShape["get"] = Effect.fn("StorageLocal.get")(function* (key) {
    const filePath = yield* resolveKeyPath(key);
    const metaPath = metaPathFor(filePath);

    const metaOpt = yield* readMeta(metaPath);
    if (O.isNone(metaOpt)) return O.none();

    const value = yield* readText(filePath);
    const updatedAt = DateTime.unsafeMake(metaOpt.value.updatedAtMillis);
    return O.some(
      new StoredValue({
        key,
        value,
        generation: metaOpt.value.generation,
        updatedAt,
      })
    );
  });

  const put: StorageShape["put"] = Effect.fn("StorageLocal.put")((key, value, options) =>
    Effect.gen(function* () {
      const filePath = yield* resolveKeyPath(key);
      const metaPath = metaPathFor(filePath);

      const currentMetaOpt = yield* readMeta(metaPath);
      const actualGeneration = O.map(currentMetaOpt, (_) => _.generation);
      const expectedGeneration = O.fromNullable(options?.expectedGeneration);
      const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
      if (O.isSome(conflict)) return yield* conflict.value;

      const nextGeneration = O.match(actualGeneration, {onNone: () => 1, onSome: (g) => g + 1});
      const updatedAtMillis = DateTime.toEpochMillis(DateTime.unsafeNow());

      yield* writeTextAtomic(filePath, value);
      yield* writeJsonAtomic(metaPath, new StorageLocalMeta({generation: nextGeneration, updatedAtMillis}));

      const updatedAt = DateTime.unsafeMake(updatedAtMillis);
      return new StoredValue({key, value, generation: nextGeneration, updatedAt});
    })
  );

  const deleteValue: StorageShape["delete"] = Effect.fn("StorageLocal.delete")((key, options) =>
    Effect.gen(function* () {
      const filePath = yield* resolveKeyPath(key);
      const metaPath = metaPathFor(filePath);

      const currentMetaOpt = yield* readMeta(metaPath);
      const actualGeneration = O.map(currentMetaOpt, (_) => _.generation);
      const expectedGeneration = O.fromNullable(options?.expectedGeneration);
      const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
      if (O.isSome(conflict)) return yield* conflict.value;

      if (O.isNone(currentMetaOpt)) return false;

      yield* fs.remove(filePath).pipe(Effect.orDie);
      yield* fs.remove(metaPath).pipe(Effect.orDie);
      return true;
    })
  );

  const list: StorageShape["list"] = Effect.fn("StorageLocal.list")((prefix) =>
    Effect.gen(function* () {
      const metaSuffix = ".meta.json";
      const metaSuffixLength = Str.length(metaSuffix);
      const entries = yield* fs.readDirectory(rootResolved, {recursive: true}).pipe(Effect.orDie);
      const metaFiles = A.filter(entries, Str.endsWith(metaSuffix));

      const collect = yield* Effect.reduce(metaFiles, A.empty<StoredValue>(), (acc, metaPath) =>
        Effect.gen(function* () {
          const filePath = Str.slice(0, -metaSuffixLength)(metaPath);
          const rel = path.relative(rootResolved, filePath);
          const key = F.pipe(rel, Str.split(path.sep), A.join("/"));
          if (P.isString(prefix) && !Str.startsWith(prefix)(key)) return acc;

          const metaOpt = yield* readMeta(metaPath);
          if (O.isNone(metaOpt)) return acc;

          const valueExists = yield* fs.exists(filePath).pipe(Effect.orDie);
          if (!valueExists) return acc;

          const value = yield* readText(filePath);
          const updatedAt = DateTime.unsafeMake(metaOpt.value.updatedAtMillis);
          return A.append(acc, new StoredValue({key, value, generation: metaOpt.value.generation, updatedAt}));
        })
      );

      return A.sort(
        collect,
        Order.mapInput(Order.string, (entry: StoredValue) => entry.key)
      );
    })
  );

  return Storage.of({get, put, delete: deleteValue, list, signedUrl: noneSignedUrl});
});

export const StorageLocalLive = Layer.provideMerge(
  Layer.effect(Storage, makeStorageLocalService),
  Layer.provideMerge(BunFileSystem.layer, BunPath.layerPosix)
);

// -----------------------------------------------------------------------------
// SQLite backend (@effect/sql-sqlite-bun)
// -----------------------------------------------------------------------------

export interface StorageSqlConfigShape {
  readonly databasePath: string;
}

export class StorageSqlConfig extends Context.Tag($I`StorageSqlConfig`)<StorageSqlConfig, StorageSqlConfigShape>() {
}

export const StorageSqlConfigLive = Layer.effect(
  StorageSqlConfig,
  Effect.gen(function* () {
    const databasePath = yield* Config.string("KNOWLEDGE_STORAGE_SQLITE_PATH").pipe(
      Config.withDefault("./tmp/knowledge-storage.sqlite")
    );
    return StorageSqlConfig.of({databasePath});
  })
);

class StorageSqlRow extends S.Class<StorageSqlRow>($I`StorageSqlRow`)(
  {
    key: S.String,
    value: S.String,
    generation: S.Number,
    updated_at: S.Number,
  },
  $I.annotations("StorageSqlRow", {description: "SQLite storage row (snake_case column names)"})
) {
}

class StorageKeyOnly extends S.Class<StorageKeyOnly>($I`StorageKeyOnly`)(
  {key: S.String},
  $I.annotations("StorageKeyOnly", {description: "Key-only select shape for storage"})
) {
}

class StorageGenerationOnly extends S.Class<StorageGenerationOnly>($I`StorageGenerationOnly`)(
  {generation: S.Number},
  $I.annotations("StorageGenerationOnly", {description: "Generation-only select shape for storage"})
) {
}

const makeStorageSqlService: Effect.Effect<StorageShape, never, SqlClient.SqlClient> = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql`
      CREATE TABLE IF NOT EXISTS knowledge_storage
      (
          key
          TEXT
          PRIMARY
          KEY,
          value
          TEXT
          NOT
          NULL,
          generation
          INTEGER
          NOT
          NULL,
          updated_at
          INTEGER
          NOT
          NULL
      )
  `.pipe(Effect.orDie);

  const getRow = SqlSchema.findOne({
    Request: StorageKeyOnly,
    Result: StorageSqlRow,
    execute: (req) =>
      sql`SELECT key, value, generation, updated_at
          FROM knowledge_storage
          WHERE key = ${req.key}`.pipe(Effect.orDie),
  });

  const listRows = SqlSchema.findAll({
    Request: S.Struct({like: S.String}),
    Result: StorageSqlRow,
    execute: (req) =>
      sql`
          SELECT key, value, generation, updated_at
          FROM knowledge_storage
          WHERE key LIKE ${req.like}
          ORDER BY key ASC
      `.pipe(Effect.orDie),
  });

  const currentGeneration = SqlSchema.findOne({
    Request: StorageKeyOnly,
    Result: StorageGenerationOnly,
    execute: (req) => sql`SELECT generation
                          FROM knowledge_storage
                          WHERE key = ${req.key}`.pipe(Effect.orDie),
  });

  const toStoredValue = (row: StorageSqlRow): StoredValue => {
    const updatedAt = DateTime.unsafeMake(row.updated_at);
    return new StoredValue({
      key: row.key,
      value: row.value,
      generation: row.generation,
      updatedAt,
    });
  };

  const get: StorageShape["get"] = Effect.fn("StorageSql.get")((key) =>
    getRow(new StorageKeyOnly({key})).pipe(Effect.orDie, Effect.map(O.map(toStoredValue)))
  );

  const put: StorageShape["put"] = Effect.fn("StorageSql.put")((key, value, options) =>
    sql
      .withTransaction(
        Effect.gen(function* () {
          const current = yield* currentGeneration(new StorageKeyOnly({key})).pipe(Effect.orDie);
          const actualGeneration = O.map(current, (_) => _.generation);
          const expectedGeneration = O.fromNullable(options?.expectedGeneration);
          const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
          if (O.isSome(conflict)) return yield* conflict.value;

          const nextGeneration = O.match(actualGeneration, {onNone: () => 1, onSome: (g) => g + 1});
          const updatedAtMillis = DateTime.toEpochMillis(DateTime.unsafeNow());

          if (O.isSome(current)) {
            yield* sql`
                UPDATE knowledge_storage
                SET value = ${value},
                    generation = ${nextGeneration},
                    updated_at = ${updatedAtMillis}
                WHERE key = ${key}
            `.pipe(Effect.orDie);
          } else {
            yield* sql`
                INSERT INTO knowledge_storage (key, value, generation, updated_at)
                VALUES (${key}, ${value}, ${nextGeneration}, ${updatedAtMillis})
            `.pipe(Effect.orDie);
          }

          const updatedAt = DateTime.unsafeMake(updatedAtMillis);
          return new StoredValue({key, value, generation: nextGeneration, updatedAt});
        })
      )
      .pipe(Effect.catchTag("SqlError", Effect.die))
  );

  const deleteValue: StorageShape["delete"] = Effect.fn("StorageSql.delete")((key, options) =>
    sql
      .withTransaction(
        Effect.gen(function* () {
          const current = yield* currentGeneration(new StorageKeyOnly({key})).pipe(Effect.orDie);
          const actualGeneration = O.map(current, (_) => _.generation);
          const expectedGeneration = O.fromNullable(options?.expectedGeneration);
          const conflict = checkExpectedGeneration(key, expectedGeneration, actualGeneration);
          if (O.isSome(conflict)) return yield* conflict.value;

          if (O.isNone(current)) return false;

          yield* sql`DELETE
                     FROM knowledge_storage
                     WHERE key = ${key}`.pipe(Effect.orDie);
          return true;
        })
      )
      .pipe(Effect.catchTag("SqlError", Effect.die))
  );

  const list: StorageShape["list"] = Effect.fn("StorageSql.list")((prefix) => {
    const like = P.isString(prefix) ? `${prefix}%` : "%";
    return listRows({like}).pipe(Effect.orDie, Effect.map(A.map(toStoredValue)));
  });

  return Storage.of({get, put, delete: deleteValue, list, signedUrl: noneSignedUrl});
});

const SqliteLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const {databasePath} = yield* StorageSqlConfig;
    return SqliteClient.layer({filename: databasePath});
  })
);

export const StorageSqlLive = Layer.provideMerge(
  Layer.scoped(Storage, makeStorageSqlService),
  Layer.provideMerge(SqliteLive, Layer.provideMerge(BunFileSystem.layer, BunPath.layerPosix))
);
