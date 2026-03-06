import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Clock, Effect, HashMap, Layer, Order, pipe, ServiceMap, SynchronizedRef } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { KeyValueStore } from "effect/unstable/persistence";
import { utcFromMillis, utcToMillis } from "../internal/dateTime.js";
import { SessionMeta } from "../Schema/Storage.js";
import { defaultIndexPageSize, defaultSessionIndexPrefix, defaultStorageDirectory } from "./defaults.js";
import { StorageConfig } from "./StorageConfig.js";
import { type StorageError, toStorageError } from "./StorageError.js";

const $I = $AiSdkId.create("core/Storage/SessionIndexStore");

/**
 * @since 0.0.0
 */
export const SessionIndexOrderBy = LiteralKit(["updatedAt", "createdAt"] as const).annotate(
  $I.annote("SessionIndexOrderBy", {
    description: "Ordering keys supported by SessionIndexStore list APIs.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionIndexOrderBy = typeof SessionIndexOrderBy.Type;

/**
 * @since 0.0.0
 */
export const SessionIndexDirection = LiteralKit(["asc", "desc"] as const).annotate(
  $I.annote("SessionIndexDirection", {
    description: "Sort directions supported by SessionIndexStore list APIs.",
  })
);

/**
 * @since 0.0.0
 */
export type SessionIndexDirection = typeof SessionIndexDirection.Type;

/**
 * @since 0.0.0
 */
export class SessionIndexCursor extends S.Class<SessionIndexCursor>($I`SessionIndexCursor`)(
  {
    value: S.Number,
    sessionId: S.String,
  },
  $I.annote("SessionIndexCursor", {
    description: "Opaque cursor used for SessionIndexStore pagination.",
  })
) {}

/**
 * @since 0.0.0
 */
export class SessionIndexListOptions extends S.Class<SessionIndexListOptions>($I`SessionIndexListOptions`)(
  {
    offset: S.optionalKey(S.UndefinedOr(S.Number)),
    limit: S.optionalKey(S.UndefinedOr(S.Number)),
    orderBy: S.optionalKey(S.UndefinedOr(SessionIndexOrderBy)),
    direction: S.optionalKey(S.UndefinedOr(SessionIndexDirection)),
    cursor: S.optionalKey(S.UndefinedOr(SessionIndexCursor)),
  },
  $I.annote("SessionIndexListOptions", {
    description: "Options for listing SessionIndexStore metadata with ordering and cursor pagination.",
  })
) {}

/**
 * @since 0.0.0
 */
export class SessionIndexTouchOptions extends S.Class<SessionIndexTouchOptions>($I`SessionIndexTouchOptions`)(
  {
    createdAt: S.optionalKey(S.UndefinedOr(S.Number)),
    updatedAt: S.optionalKey(S.UndefinedOr(S.Number)),
  },
  $I.annote("SessionIndexTouchOptions", {
    description: "Optional timestamp overrides when touching session index metadata.",
  })
) {}

/**
 * @since 0.0.0
 */
export class SessionIndexPage extends S.Class<SessionIndexPage>($I`SessionIndexPage`)(
  {
    items: S.Array(SessionMeta),
    nextCursor: S.optionalKey(S.UndefinedOr(SessionIndexCursor)),
  },
  $I.annote("SessionIndexPage", {
    description: "Cursor-paginated SessionIndexStore response payload.",
  })
) {}

const storeName = "SessionIndexStore";

class SessionIndexMeta extends S.Class<SessionIndexMeta>($I`SessionIndexMeta`)(
  {
    pageCount: S.Number,
    total: S.Number,
    pageSize: S.Number,
    updatedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("SessionIndexMeta", {
    description: "Internal key-value metadata describing session index pagination state.",
  })
) {}

class SessionIndexPageData extends S.Class<SessionIndexPageData>($I`SessionIndexPageData`)(
  {
    ids: S.Array(S.String),
    updatedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("SessionIndexPageData", {
    description: "Internal key-value page payload storing ordered session ids.",
  })
) {}

const resolveListLimit = (options: SessionIndexListOptions | undefined, fallback?: number) => {
  const resolved = options?.limit ?? fallback;
  return resolved ?? defaultIndexPageSize;
};

const defaultOrderBy: SessionIndexOrderBy = "updatedAt";
const defaultDirection: SessionIndexDirection = "desc";

const resolvePageSize = Effect.gen(function* () {
  const config = yield* Effect.serviceOption(StorageConfig);
  return O.isNone(config) ? defaultIndexPageSize : config.value.settings.kv.indexPageSize;
});

const normalizePageSize = (value: number) => Math.max(1, value);

const tupleOrder = Order.Tuple([Order.Number, Order.String]);

const resolveTupleOrder = (direction: SessionIndexDirection) =>
  direction === "desc" ? Order.flip(tupleOrder) : tupleOrder;

const toOrderKey = (meta: SessionMeta, orderBy: SessionIndexOrderBy) =>
  [utcToMillis(orderBy === "createdAt" ? meta.createdAt : meta.updatedAt), meta.sessionId] as const;

const toCursorKey = (cursor: SessionIndexCursor) => [cursor.value, cursor.sessionId] as const;

const makeMetaOrder = (orderBy: SessionIndexOrderBy, direction: SessionIndexDirection) =>
  Order.mapInput(resolveTupleOrder(direction), (meta: SessionMeta) => toOrderKey(meta, orderBy));

const applyOrdering = (metas: ReadonlyArray<SessionMeta>, options?: SessionIndexListOptions) => {
  const orderBy = options?.orderBy ?? defaultOrderBy;
  const direction = options?.direction ?? defaultDirection;
  const ordering = makeMetaOrder(orderBy, direction);
  let sorted = A.sort(metas, ordering);

  if (options?.cursor) {
    const after = Order.isGreaterThan(resolveTupleOrder(direction));
    const cursorKey = toCursorKey(options.cursor);
    sorted = A.filter(sorted, (meta) => after(toOrderKey(meta, orderBy), cursorKey));
  }

  return sorted;
};

/**
 * @since 0.0.0
 */
export const makeCursor = (meta: SessionMeta, orderBy: SessionIndexOrderBy = defaultOrderBy): SessionIndexCursor =>
  new SessionIndexCursor({
    value: utcToMillis(orderBy === "createdAt" ? meta.createdAt : meta.updatedAt),
    sessionId: meta.sessionId,
  });

type SessionIndexState = {
  readonly ids: ReadonlyArray<string>;
  readonly meta: HashMap.HashMap<string, SessionMeta>;
};

const emptyState: SessionIndexState = {
  ids: [],
  meta: HashMap.empty(),
};

/**
 * @since 0.0.0
 */
export interface SessionIndexStoreService {
  readonly get: (sessionId: string) => Effect.Effect<O.Option<SessionMeta>, StorageError>;
  readonly list: (options?: SessionIndexListOptions) => Effect.Effect<ReadonlyArray<SessionMeta>, StorageError>;
  readonly listIds: () => Effect.Effect<ReadonlyArray<string>, StorageError>;
  readonly listPage: (options?: SessionIndexListOptions) => Effect.Effect<SessionIndexPage, StorageError>;
  readonly remove: (sessionId: string) => Effect.Effect<void, StorageError>;
  readonly touch: (sessionId: string, options?: SessionIndexTouchOptions) => Effect.Effect<SessionMeta, StorageError>;
}

/**
 * @since 0.0.0
 */
export const defaultSessionIndexStore: SessionIndexStoreService = {
  touch: (sessionId, options) =>
    Effect.succeed(
      SessionMeta.make({
        sessionId,
        createdAt: utcFromMillis(options?.createdAt ?? options?.updatedAt ?? 0),
        updatedAt: utcFromMillis(options?.updatedAt ?? options?.createdAt ?? 0),
      })
    ),
  get: () => Effect.succeed(O.none()),
  list: () => Effect.succeed([]),
  listIds: () => Effect.succeed([]),
  remove: () => Effect.void,
  listPage: () => Effect.succeed(new SessionIndexPage({ items: [] })),
};

/**
 * @since 0.0.0
 */
export class SessionIndexStore extends ServiceMap.Service<SessionIndexStore, SessionIndexStoreService>()(
  $I`SessionIndexStore`,
  {
    make: Effect.succeed(defaultSessionIndexStore),
  }
) {
  static readonly layerMemory = Layer.effect(
    SessionIndexStore,
    Effect.gen(function* () {
      const stateRef = yield* SynchronizedRef.make(emptyState);

      const touch = Effect.fn("SessionIndexStore.touch")(function* (
        sessionId: string,
        options?: SessionIndexTouchOptions
      ) {
        const now = options?.updatedAt ?? (yield* Clock.currentTimeMillis);
        return yield* SynchronizedRef.modify(stateRef, (state) => {
          const existing = HashMap.get(state.meta, sessionId);
          const createdAt = O.isSome(existing) ? existing.value.createdAt : utcFromMillis(options?.createdAt ?? now);
          const updatedAt = utcFromMillis(now);
          const meta = SessionMeta.make({ sessionId, createdAt, updatedAt });
          const ids = O.isSome(existing) ? state.ids : state.ids.concat(sessionId);
          return [meta, { ids, meta: HashMap.set(state.meta, sessionId, meta) }] as const;
        });
      });

      const get = Effect.fn("SessionIndexStore.get")((sessionId: string) =>
        SynchronizedRef.get(stateRef).pipe(Effect.map((state) => HashMap.get(state.meta, sessionId)))
      );

      const listIds = Effect.fn("SessionIndexStore.listIds")(() =>
        SynchronizedRef.get(stateRef).pipe(Effect.map((state) => A.fromIterable(state.ids)))
      );

      const list = Effect.fn("SessionIndexStore.list")((options?: SessionIndexListOptions) =>
        Effect.gen(function* () {
          const config = yield* Effect.serviceOption(StorageConfig);
          const fallbackLimit = O.isNone(config) ? defaultIndexPageSize : config.value.settings.kv.indexPageSize;
          const limit = resolveListLimit(options, fallbackLimit);
          const offset = Math.max(0, options?.offset ?? 0);
          if (limit <= 0) return A.empty<SessionMeta>();
          const state = yield* SynchronizedRef.get(stateRef);
          const metas = pipe(
            state.ids,
            A.map((id) => HashMap.get(state.meta, id)),
            A.getSomes
          );
          const ordered = applyOrdering(metas, options);
          return pipe(ordered, A.drop(offset), A.take(limit));
        })
      );

      const listPage = Effect.fn("SessionIndexStore.listPage")(function* (options?: SessionIndexListOptions) {
        const config = yield* Effect.serviceOption(StorageConfig);
        const fallbackLimit = O.isNone(config) ? defaultIndexPageSize : config.value.settings.kv.indexPageSize;
        const limit = resolveListLimit(options, fallbackLimit);
        if (limit <= 0) return new SessionIndexPage({ items: A.empty<SessionMeta>() });
        const items = yield* list({ ...options, limit: limit + 1 });
        if (A.length(items) <= limit) return new SessionIndexPage({ items });
        const pageItems = A.take(items, limit);
        const orderBy = options?.orderBy ?? defaultOrderBy;
        const nextCursor = pipe(
          pageItems,
          A.last,
          O.map((last) => makeCursor(last, orderBy)),
          O.getOrUndefined
        );
        return new SessionIndexPage({
          items: pageItems,
          ...(nextCursor !== undefined ? { nextCursor } : {}),
        });
      });

      const remove = Effect.fn("SessionIndexStore.remove")((sessionId: string) =>
        SynchronizedRef.update(stateRef, (state) => {
          if (!HashMap.has(state.meta, sessionId)) return state;
          const nextMeta = HashMap.remove(state.meta, sessionId);
          const ids = A.filter(state.ids, (id) => id !== sessionId);
          return { ids, meta: nextMeta };
        })
      );

      return SessionIndexStore.of({
        touch,
        get,
        list,
        listIds,
        remove,
        listPage,
      });
    })
  );

  static readonly layerKeyValueStore = (options?: { readonly prefix?: string }) =>
    Layer.effect(
      SessionIndexStore,
      Effect.gen(function* () {
        const kv = yield* KeyValueStore.KeyValueStore;
        const prefix = options?.prefix ?? defaultSessionIndexPrefix;
        const indexMetaStore = KeyValueStore.toSchemaStore(kv, SessionIndexMeta);
        const pageStore = KeyValueStore.toSchemaStore(kv, SessionIndexPageData);
        const sessionStore = KeyValueStore.toSchemaStore(kv, SessionMeta);

        const metaKey = `${prefix}/index/meta`;
        const pageKey = (page: number) => `${prefix}/index/page/${page}`;
        const sessionKey = (sessionId: string) => `${prefix}/meta/${sessionId}`;

        const mapError = (operation: string, cause: unknown) => toStorageError(storeName, operation, cause);

        const loadIndexMeta = Effect.gen(function* () {
          const metaOption = yield* indexMetaStore
            .get(metaKey)
            .pipe(Effect.mapError((cause) => mapError("loadIndexMeta", cause)));
          if (O.isSome(metaOption)) {
            const meta = metaOption.value;
            return new SessionIndexMeta({
              pageCount: meta.pageCount,
              total: meta.total,
              pageSize: normalizePageSize(meta.pageSize),
              updatedAt: meta.updatedAt,
            });
          }
          const pageSize = normalizePageSize(yield* resolvePageSize);
          return new SessionIndexMeta({
            pageCount: 0,
            total: 0,
            pageSize,
            updatedAt: utcFromMillis(0),
          });
        });

        const saveIndexMeta = (meta: SessionIndexMeta) =>
          indexMetaStore.set(metaKey, meta).pipe(Effect.mapError((cause) => mapError("saveIndexMeta", cause)));

        const loadPage = (page: number): Effect.Effect<SessionIndexPageData, StorageError> =>
          pageStore.get(pageKey(page)).pipe(
            Effect.mapError((cause) => mapError("loadPage", cause)),
            Effect.map((maybe) =>
              O.getOrElse(maybe, () => new SessionIndexPageData({ ids: [], updatedAt: utcFromMillis(0) }))
            )
          );

        const savePage = (page: number, data: SessionIndexPageData) =>
          pageStore.set(pageKey(page), data).pipe(Effect.mapError((cause) => mapError("savePage", cause)));

        const findSessionPage = (sessionId: string, pageCount: number) =>
          Effect.gen(function* () {
            for (let page = 0; page < pageCount; page += 1) {
              const pageData = yield* loadPage(page);
              const index = O.fromUndefinedOr(A.findFirstIndex(pageData.ids, (id) => id === sessionId));
              if (O.isSome(index)) {
                return { page, index: index.value, pageData };
              }
            }
            return undefined;
          });

        const listIds = Effect.fn("SessionIndexStore.listIds")(() =>
          Effect.gen(function* () {
            const meta = yield* loadIndexMeta;
            if (meta.pageCount <= 0) return [];
            let ids = A.empty<string>();
            for (let page = 0; page < meta.pageCount; page += 1) {
              const pageData = yield* loadPage(page);
              ids = A.appendAll(ids, pageData.ids);
            }
            return ids;
          })
        );

        const list = Effect.fn("SessionIndexStore.list")((options?: SessionIndexListOptions) =>
          Effect.gen(function* () {
            const config = yield* Effect.serviceOption(StorageConfig);
            const fallbackLimit = O.isNone(config) ? defaultIndexPageSize : config.value.settings.kv.indexPageSize;
            const limit = resolveListLimit(options, fallbackLimit);
            const offset = Math.max(0, options?.offset ?? 0);
            if (limit <= 0) return A.empty<SessionMeta>();
            const ids = yield* listIds();
            const metas = yield* Effect.forEach(
              ids,
              (id) => sessionStore.get(sessionKey(id)).pipe(Effect.mapError((cause) => mapError("list", cause))),
              { discard: false }
            );
            const resolved = A.getSomes(metas);
            const ordered = applyOrdering(resolved, options);
            return pipe(ordered, A.drop(offset), A.take(limit));
          })
        );

        const listPage = Effect.fn("SessionIndexStore.listPage")(function* (options?: SessionIndexListOptions) {
          const config = yield* Effect.serviceOption(StorageConfig);
          const fallbackLimit = O.isNone(config) ? defaultIndexPageSize : config.value.settings.kv.indexPageSize;
          const limit = resolveListLimit(options, fallbackLimit);
          if (limit <= 0) return new SessionIndexPage({ items: A.empty<SessionMeta>() });
          const items = yield* list({ ...options, limit: limit + 1 });
          if (A.length(items) <= limit) return new SessionIndexPage({ items });
          const pageItems = A.take(items, limit);
          const orderBy = options?.orderBy ?? defaultOrderBy;
          const nextCursor = pipe(
            pageItems,
            A.last,
            O.map((last) => makeCursor(last, orderBy)),
            O.getOrUndefined
          );
          return new SessionIndexPage({
            items: pageItems,
            ...(nextCursor !== undefined ? { nextCursor } : {}),
          });
        });

        const get = Effect.fn("SessionIndexStore.get")((sessionId: string) =>
          sessionStore.get(sessionKey(sessionId)).pipe(Effect.mapError((cause) => mapError("get", cause)))
        );

        const touch = Effect.fn("SessionIndexStore.touch")(function* (
          sessionId: string,
          options?: SessionIndexTouchOptions
        ) {
          const now = options?.updatedAt ?? (yield* Clock.currentTimeMillis);
          const meta = yield* loadIndexMeta;
          const sessionOption = yield* sessionStore
            .get(sessionKey(sessionId))
            .pipe(Effect.mapError((cause) => mapError("touch", cause)));
          const existing = O.getOrUndefined(sessionOption);
          const createdAt = existing?.createdAt ?? utcFromMillis(options?.createdAt ?? now);
          const nextSession = SessionMeta.make({
            sessionId,
            createdAt,
            updatedAt: utcFromMillis(now),
          });
          yield* sessionStore
            .set(sessionKey(sessionId), nextSession)
            .pipe(Effect.mapError((cause) => mapError("touch", cause)));

          let pageCount = meta.pageCount;
          let total = meta.total;
          const pageSize = normalizePageSize(meta.pageSize);

          if (pageCount === 0) {
            yield* savePage(0, new SessionIndexPageData({ ids: [sessionId], updatedAt: utcFromMillis(now) }));
            pageCount = 1;
            total = 1;
          } else {
            const found = yield* findSessionPage(sessionId, pageCount);
            if (!found) {
              const lastPageIndex = pageCount - 1;
              const lastPage = yield* loadPage(lastPageIndex);
              if (lastPage.ids.length < pageSize) {
                yield* savePage(
                  lastPageIndex,
                  new SessionIndexPageData({ ids: lastPage.ids.concat(sessionId), updatedAt: utcFromMillis(now) })
                );
              } else {
                yield* savePage(
                  pageCount,
                  new SessionIndexPageData({ ids: [sessionId], updatedAt: utcFromMillis(now) })
                );
                pageCount += 1;
              }
              total += 1;
            } else if (utcToMillis(found.pageData.updatedAt) !== now) {
              yield* savePage(
                found.page,
                new SessionIndexPageData({ ids: found.pageData.ids, updatedAt: utcFromMillis(now) })
              );
            }
          }

          yield* saveIndexMeta(new SessionIndexMeta({ pageCount, total, pageSize, updatedAt: utcFromMillis(now) }));

          return nextSession;
        });

        const remove = Effect.fn("SessionIndexStore.remove")((sessionId: string) =>
          Effect.gen(function* () {
            const meta = yield* loadIndexMeta;
            const now = yield* Clock.currentTimeMillis;
            let pageCount = meta.pageCount;
            let total = meta.total;

            if (pageCount > 0) {
              const found = yield* findSessionPage(sessionId, pageCount);
              if (found) {
                const remaining = A.filter(found.pageData.ids, (id) => id !== sessionId);
                if (A.isReadonlyArrayEmpty(remaining)) {
                  yield* pageStore
                    .remove(pageKey(found.page))
                    .pipe(Effect.mapError((cause) => mapError("remove", cause)));
                  if (found.page === pageCount - 1) {
                    pageCount -= 1;
                    while (pageCount > 0) {
                      const lastPageOption = yield* pageStore
                        .get(pageKey(pageCount - 1))
                        .pipe(Effect.mapError((cause) => mapError("remove", cause)));
                      if (O.isNone(lastPageOption) || A.isReadonlyArrayEmpty(lastPageOption.value.ids)) {
                        yield* pageStore
                          .remove(pageKey(pageCount - 1))
                          .pipe(Effect.mapError((cause) => mapError("remove", cause)));
                        pageCount -= 1;
                      } else {
                        break;
                      }
                    }
                  }
                } else {
                  yield* savePage(
                    found.page,
                    new SessionIndexPageData({ ids: remaining, updatedAt: utcFromMillis(now) })
                  );
                }
                total = Math.max(0, total - 1);
              }
            }

            yield* sessionStore
              .remove(sessionKey(sessionId))
              .pipe(Effect.mapError((cause) => mapError("remove", cause)));

            yield* saveIndexMeta(
              new SessionIndexMeta({
                pageCount,
                total,
                pageSize: normalizePageSize(meta.pageSize),
                updatedAt: utcFromMillis(now),
              })
            );
          })
        );

        return SessionIndexStore.of({
          touch,
          get,
          list,
          listIds,
          remove,
          listPage,
        });
      })
    );

  static readonly layerFileSystem = (options?: { readonly directory?: string; readonly prefix?: string }) =>
    SessionIndexStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultSessionIndexPrefix,
    }).pipe(Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory)));

  static readonly layerFileSystemBun = (options?: { readonly directory?: string; readonly prefix?: string }) =>
    SessionIndexStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultSessionIndexPrefix,
    }).pipe(Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory)));
}
