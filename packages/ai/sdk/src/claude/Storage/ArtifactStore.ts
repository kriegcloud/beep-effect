import { $AiSdkId } from "@beep/identity/packages";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Clock, Duration, Effect, HashMap, HashSet, Layer, ServiceMap, SynchronizedRef } from "effect";
import * as O from "effect/Option";
import { KeyValueStore } from "effect/unstable/persistence";
import { utcToMillis } from "../internal/dateTime.js";
import type { ArtifactRecord } from "../Schema/Storage.js";
import type { ConflictPolicy } from "../Sync/index.js";
import { defaultArtifactPrefix, defaultStorageDirectory } from "./defaults.js";
import { SessionIndexStore } from "./SessionIndexStore.js";
import { StorageConfig } from "./StorageConfig.js";
import type { StorageError } from "./StorageError.js";

const $I = $AiSdkId.create("core/Storage/ArtifactStore");

/**
 * @since 0.0.0
 * @category DataAccess
 */
export type ArtifactListOptions = Readonly<{
  readonly offset?: number;
  readonly limit?: number;
}>;

/**
 * @since 0.0.0
 * @category DataAccess
 */
export type ArtifactJournaledOptions<R = never> = {
  readonly prefix?: string;
  readonly journalKey?: string;
  readonly identityKey?: string;
  readonly conflictPolicy?: Layer.Layer<ConflictPolicy, never, R>;
};

/**
 * @since 0.0.0
 * @category DataAccess
 */
export type ArtifactSyncOptions<R = never> = ArtifactJournaledOptions<R> & {
  readonly disablePing?: boolean;
  readonly protocols?: string | Array<string>;
  readonly syncInterval?: Duration.Input;
};

type ArtifactRetention = {
  readonly maxArtifacts?: number;
  readonly maxArtifactBytes?: number;
  readonly maxAgeMs?: number;
};

type ArtifactState = {
  readonly byId: HashMap.HashMap<string, ArtifactRecord>;
  readonly bySession: HashMap.HashMap<string, ReadonlyArray<string>>;
};

/**
 * @since 0.0.0
 * @category DataAccess
 */
export interface ArtifactStoreService {
  readonly cleanup?: () => Effect.Effect<void, StorageError>;
  readonly delete: (id: string) => Effect.Effect<void, StorageError>;
  readonly get: (id: string) => Effect.Effect<O.Option<ArtifactRecord>, StorageError>;
  readonly list: (
    sessionId: string,
    options?: ArtifactListOptions
  ) => Effect.Effect<ReadonlyArray<ArtifactRecord>, StorageError>;
  readonly purgeSession: (sessionId: string) => Effect.Effect<void, StorageError>;
  readonly put: (record: ArtifactRecord) => Effect.Effect<void, StorageError>;
}

const emptyState: ArtifactState = {
  byId: HashMap.empty(),
  bySession: HashMap.empty(),
};

const resolveEnabled = Effect.gen(function* () {
  const config = yield* Effect.serviceOption(StorageConfig);
  return O.isNone(config) ? true : config.value.settings.enabled.artifacts;
});

const resolveRetention = Effect.gen(function* () {
  const config = yield* Effect.serviceOption(StorageConfig);
  if (O.isNone(config)) return undefined;
  const retention = config.value.settings.retention.artifacts;
  return {
    maxArtifacts: retention.maxArtifacts,
    maxArtifactBytes: retention.maxArtifactBytes,
    maxAgeMs: Duration.toMillis(retention.maxAge),
  } satisfies ArtifactRetention;
});

const sizeOfRecord = (record: ArtifactRecord) => record.sizeBytes ?? new TextEncoder().encode(record.content).length;

const updateIndex = (ids: ReadonlyArray<string>, id: string): ReadonlyArray<string> =>
  ids.includes(id) ? ids : ids.concat(id);

const applyRetention = (
  state: ArtifactState,
  sessionId: string,
  retention: ArtifactRetention | undefined,
  now: number
): ArtifactState => {
  if (retention === undefined) return state;

  const ids = O.getOrElse(HashMap.get(state.bySession, sessionId), () => [] as ReadonlyArray<string>);
  let filteredIds = ids.filter((id) => HashMap.has(state.byId, id));

  if (retention.maxAgeMs !== undefined) {
    const cutoff = now - retention.maxAgeMs;
    filteredIds = filteredIds.filter((id) => {
      const record = HashMap.get(state.byId, id);
      return O.isSome(record) ? utcToMillis(record.value.createdAt) >= cutoff : false;
    });
  }

  if (retention.maxArtifacts !== undefined) {
    const maxArtifacts = retention.maxArtifacts;
    if (maxArtifacts <= 0) {
      filteredIds = [];
    } else if (filteredIds.length > maxArtifacts) {
      filteredIds = filteredIds.slice(filteredIds.length - maxArtifacts);
    }
  }

  if (retention.maxArtifactBytes !== undefined) {
    const maxBytes = retention.maxArtifactBytes;
    if (maxBytes <= 0) {
      filteredIds = [];
    } else {
      let total = 0;
      const kept: Array<string> = [];
      for (let index = filteredIds.length - 1; index >= 0; index -= 1) {
        const id = filteredIds[index];
        if (id === undefined) continue;
        const record = HashMap.get(state.byId, id);
        if (O.isNone(record)) continue;
        const size = sizeOfRecord(record.value);
        if (total + size > maxBytes) continue;
        total += size;
        kept.push(id);
      }
      kept.reverse();
      filteredIds = kept;
    }
  }

  const kept = HashSet.fromIterable(filteredIds);
  if (HashSet.size(kept) === ids.length) return state;

  let nextById = HashMap.fromIterable(state.byId);
  const nextBySession = HashMap.set(HashMap.fromIterable(state.bySession), sessionId, filteredIds);
  for (const id of ids) {
    if (!HashSet.has(kept, id)) {
      nextById = HashMap.remove(nextById, id);
    }
  }

  return {
    byId: nextById,
    bySession: nextBySession,
  };
};

const touchSessionIndex = (sessionId: string, timestamp: number) =>
  Effect.gen(function* () {
    const storeOption = yield* Effect.serviceOption(SessionIndexStore);
    if (O.isNone(storeOption)) return;
    yield* storeOption.value.touch(sessionId, { updatedAt: timestamp }).pipe(Effect.asVoid);
  }).pipe(Effect.catch(() => Effect.void));

const removeSessionIndex = (sessionId: string) =>
  Effect.gen(function* () {
    const storeOption = yield* Effect.serviceOption(SessionIndexStore);
    if (O.isNone(storeOption)) return;
    yield* storeOption.value.remove(sessionId).pipe(Effect.asVoid);
  }).pipe(Effect.catch(() => Effect.void));

const makeMemoryStore = Effect.gen(function* () {
  const stateRef = yield* SynchronizedRef.make(emptyState);

  const put = Effect.fn("ArtifactStore.put")((record: ArtifactRecord) =>
    Effect.gen(function* () {
      const enabled = yield* resolveEnabled;
      if (enabled === false) return;
      const now = utcToMillis(record.createdAt);
      const retention = yield* resolveRetention;
      yield* SynchronizedRef.update(stateRef, (state) => {
        const byId = HashMap.set(HashMap.fromIterable(state.byId), record.id, record);
        const bySessionBase = HashMap.fromIterable(state.bySession);
        const currentIds = O.getOrElse(HashMap.get(bySessionBase, record.sessionId), () => [] as ReadonlyArray<string>);
        const bySession = HashMap.set(bySessionBase, record.sessionId, updateIndex(currentIds, record.id));
        return applyRetention(
          {
            byId,
            bySession,
          },
          record.sessionId,
          retention,
          now
        );
      });
      yield* touchSessionIndex(record.sessionId, now);
    })
  );

  const get = Effect.fn("ArtifactStore.get")((id: string) =>
    SynchronizedRef.get(stateRef).pipe(Effect.map((state) => HashMap.get(state.byId, id)))
  );

  const list = Effect.fn("ArtifactStore.list")((sessionId: string, options?: ArtifactListOptions) =>
    SynchronizedRef.get(stateRef).pipe(
      Effect.map((state) => {
        const ids = O.getOrElse(HashMap.get(state.bySession, sessionId), () => [] as ReadonlyArray<string>);
        const offset = Math.max(0, options?.offset ?? 0);
        const slice =
          options?.limit === undefined ? ids.slice(offset) : ids.slice(offset, offset + Math.max(0, options.limit));
        return slice.flatMap((id) => {
          const record = HashMap.get(state.byId, id);
          return O.isSome(record) ? [record.value] : [];
        });
      })
    )
  );

  const deleteArtifact = Effect.fn("ArtifactStore.delete")((id: string) =>
    SynchronizedRef.update(stateRef, (state) => {
      const record = HashMap.get(state.byId, id);
      if (O.isNone(record)) return state;
      const byId = HashMap.remove(HashMap.fromIterable(state.byId), id);
      const bySessionBase = HashMap.fromIterable(state.bySession);
      const ids = O.getOrElse(HashMap.get(bySessionBase, record.value.sessionId), () => [] as ReadonlyArray<string>);
      const remaining = ids.filter((existing) => existing !== id);
      let bySession = bySessionBase;
      if (remaining.length === 0) {
        bySession = HashMap.remove(bySessionBase, record.value.sessionId);
      } else {
        bySession = HashMap.set(bySessionBase, record.value.sessionId, remaining);
      }
      return {
        byId,
        bySession,
      };
    })
  );

  const purgeSession = Effect.fn("ArtifactStore.purgeSession")((sessionId: string) =>
    SynchronizedRef.update(stateRef, (state) => {
      const ids = O.getOrElse(HashMap.get(state.bySession, sessionId), () => [] as ReadonlyArray<string>);
      let byId = HashMap.fromIterable(state.byId);
      for (const id of ids) {
        byId = HashMap.remove(byId, id);
      }
      return {
        byId,
        bySession: HashMap.remove(HashMap.fromIterable(state.bySession), sessionId),
      };
    }).pipe(Effect.tap(() => removeSessionIndex(sessionId)))
  );

  const cleanup = Effect.fn("ArtifactStore.cleanup")(function* () {
    const enabled = yield* resolveEnabled;
    if (enabled === false) return;
    const retention = yield* resolveRetention;
    if (retention === undefined) return;
    const now = yield* Clock.currentTimeMillis;

    yield* SynchronizedRef.update(stateRef, (state) => {
      let next = state;
      for (const sessionId of HashMap.keys(state.bySession)) {
        next = applyRetention(next, sessionId, retention, now);
      }
      return next;
    });
  });

  return ArtifactStore.of({
    put,
    get,
    list,
    delete: deleteArtifact,
    purgeSession,
    cleanup,
  });
});

/**
 * @since 0.0.0
 * @category DataAccess
 */
export class ArtifactStore extends ServiceMap.Service<ArtifactStore, ArtifactStoreService>()($I`ArtifactStore`) {
  static readonly layerMemory = Layer.effect(ArtifactStore, makeMemoryStore);

  static readonly layerKeyValueStore = (_options?: { readonly prefix?: string }) =>
    Layer.effect(ArtifactStore, makeMemoryStore);

  static readonly layerJournaled = <R = never>(_options?: ArtifactJournaledOptions<R>) =>
    Layer.effect(ArtifactStore, makeMemoryStore);

  static readonly layerJournaledWithSyncWebSocket = <R = never>(_url: string, options?: ArtifactSyncOptions<R>) =>
    ArtifactStore.layerJournaled(options);

  static readonly layerFileSystem = (options?: { readonly directory?: string; readonly prefix?: string }) =>
    ArtifactStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultArtifactPrefix,
    }).pipe(Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory)));

  static readonly layerFileSystemBun = (options?: { readonly directory?: string; readonly prefix?: string }) =>
    ArtifactStore.layerFileSystem(options).pipe(Layer.provide([BunFileSystem.layer, BunPath.layer]));

  static readonly layerJournaledFileSystem = (options?: {
    readonly directory?: string;
    readonly prefix?: string;
    readonly journalKey?: string;
    readonly identityKey?: string;
  }) =>
    ArtifactStore.layerJournaled(options).pipe(
      Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory))
    );

  static readonly layerJournaledFileSystemBun = (options?: {
    readonly directory?: string;
    readonly prefix?: string;
    readonly journalKey?: string;
    readonly identityKey?: string;
  }) => ArtifactStore.layerJournaledFileSystem(options).pipe(Layer.provide([BunFileSystem.layer, BunPath.layer]));
}
