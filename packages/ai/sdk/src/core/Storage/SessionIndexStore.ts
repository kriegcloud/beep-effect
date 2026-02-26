import { KeyValueStore } from "@effect/platform"
import { BunKeyValueStore } from "@effect/platform-bun"
import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Order from "effect/Order"
import * as Schema from "effect/Schema"
import * as SynchronizedRef from "effect/SynchronizedRef"
import { SessionMeta } from "../Schema/Storage.js"
import {
  defaultIndexPageSize,
  defaultSessionIndexPrefix,
  defaultStorageDirectory
} from "./defaults.js"
import { StorageConfig } from "./StorageConfig.js"
import { StorageError, toStorageError } from "./StorageError.js"

export type SessionIndexListOptions = {
  readonly offset?: number
  readonly limit?: number
  readonly orderBy?: SessionIndexOrderBy
  readonly direction?: SessionIndexDirection
  readonly cursor?: SessionIndexCursor
}

export type SessionIndexTouchOptions = {
  readonly createdAt?: number
  readonly updatedAt?: number
}

export type SessionIndexOrderBy = "updatedAt" | "createdAt"
export type SessionIndexDirection = "asc" | "desc"

export type SessionIndexCursor = {
  readonly value: number
  readonly sessionId: string
}

export type SessionIndexPage = {
  readonly items: ReadonlyArray<SessionMeta>
  readonly nextCursor?: SessionIndexCursor
}

const storeName = "SessionIndexStore"

const SessionIndexMeta = Schema.Struct({
  pageCount: Schema.Number,
  total: Schema.Number,
  pageSize: Schema.Number,
  updatedAt: Schema.Number
})

type SessionIndexMeta = typeof SessionIndexMeta.Type

const SessionIndexPageSchema = Schema.Struct({
  ids: Schema.Array(Schema.String),
  updatedAt: Schema.Number
})

type SessionIndexPageData = {
  readonly ids: ReadonlyArray<string>
  readonly updatedAt: number
}

const resolveListLimit = (options: SessionIndexListOptions | undefined, fallback?: number) => {
  const resolved = options?.limit ?? fallback
  return resolved ?? defaultIndexPageSize
}

const defaultOrderBy: SessionIndexOrderBy = "updatedAt"
const defaultDirection: SessionIndexDirection = "desc"

const resolvePageSize = Effect.gen(function*() {
  const config = yield* Effect.serviceOption(StorageConfig)
  return Option.isNone(config)
    ? defaultIndexPageSize
    : config.value.settings.kv.indexPageSize
})

const normalizePageSize = (value: number) => Math.max(1, value)

const tupleOrder = Order.tuple(Order.number, Order.string)

const resolveTupleOrder = (direction: SessionIndexDirection) =>
  direction === "desc" ? Order.reverse(tupleOrder) : tupleOrder

const toOrderKey = (meta: SessionMeta, orderBy: SessionIndexOrderBy) =>
  [orderBy === "createdAt" ? meta.createdAt : meta.updatedAt, meta.sessionId] as const

const toCursorKey = (cursor: SessionIndexCursor) =>
  [cursor.value, cursor.sessionId] as const

const makeMetaOrder = (orderBy: SessionIndexOrderBy, direction: SessionIndexDirection) =>
  Order.mapInput(resolveTupleOrder(direction), (meta: SessionMeta) => toOrderKey(meta, orderBy))

const applyOrdering = (
  metas: ReadonlyArray<SessionMeta>,
  options?: SessionIndexListOptions
) => {
  const orderBy = options?.orderBy ?? defaultOrderBy
  const direction = options?.direction ?? defaultDirection
  const ordering = makeMetaOrder(orderBy, direction)
  let sorted = metas.slice().sort(ordering)

  if (options?.cursor) {
    const after = Order.greaterThan(resolveTupleOrder(direction))
    const cursorKey = toCursorKey(options.cursor)
    sorted = sorted.filter((meta) => after(toOrderKey(meta, orderBy), cursorKey))
  }

  return sorted
}

export const makeCursor = (
  meta: SessionMeta,
  orderBy: SessionIndexOrderBy = defaultOrderBy
): SessionIndexCursor => ({
  value: orderBy === "createdAt" ? meta.createdAt : meta.updatedAt,
  sessionId: meta.sessionId
})

type SessionIndexState = {
  readonly ids: ReadonlyArray<string>
  readonly meta: Map<string, SessionMeta>
}

const emptyState: SessionIndexState = {
  ids: [],
  meta: new Map()
}

export type SessionIndexStoreService = {
  readonly touch: (
    sessionId: string,
    options?: SessionIndexTouchOptions
  ) => Effect.Effect<SessionMeta, StorageError>
  readonly get: (
    sessionId: string
  ) => Effect.Effect<Option.Option<SessionMeta>, StorageError>
  readonly list: (
    options?: SessionIndexListOptions
  ) => Effect.Effect<ReadonlyArray<SessionMeta>, StorageError>
  readonly listIds: () => Effect.Effect<ReadonlyArray<string>, StorageError>
  readonly remove: (sessionId: string) => Effect.Effect<void, StorageError>
  readonly listPage: (
    options?: SessionIndexListOptions
  ) => Effect.Effect<SessionIndexPage, StorageError>
}

const defaultSessionIndexStore: SessionIndexStoreService = {
  touch: (sessionId, options) =>
    Effect.succeed(
      SessionMeta.make({
        sessionId,
        createdAt: options?.createdAt ?? options?.updatedAt ?? 0,
        updatedAt: options?.updatedAt ?? options?.createdAt ?? 0
      })
    ),
  get: () => Effect.succeed(Option.none()),
  list: () => Effect.succeed([]),
  listIds: () => Effect.succeed([]),
  remove: () => Effect.void,
  listPage: () => Effect.succeed({ items: [] })
}

export class SessionIndexStore extends Context.Reference<SessionIndexStore>()(
  "@effect/claude-agent-sdk/SessionIndexStore",
  {
    defaultValue: () => defaultSessionIndexStore
  }
) {
  static readonly layerMemory = Layer.effect(
    SessionIndexStore,
    Effect.gen(function*() {
      const stateRef = yield* SynchronizedRef.make(emptyState)

      const touch = Effect.fn("SessionIndexStore.touch")(
        function*(sessionId: string, options?: SessionIndexTouchOptions) {
          const now = options?.updatedAt ?? (yield* Clock.currentTimeMillis)
          return yield* SynchronizedRef.modify(stateRef, (state) => {
            const nextMeta = new Map(state.meta)
            const existing = nextMeta.get(sessionId)
            const createdAt = existing?.createdAt ?? options?.createdAt ?? now
            const updatedAt = now
            const meta = SessionMeta.make({ sessionId, createdAt, updatedAt })
            nextMeta.set(sessionId, meta)
            const ids = existing ? state.ids : state.ids.concat(sessionId)
            return [meta, { ids, meta: nextMeta }] as const
          })
        }
      )

      const get = Effect.fn("SessionIndexStore.get")((sessionId: string) =>
        SynchronizedRef.get(stateRef).pipe(
          Effect.map((state) => Option.fromNullable(state.meta.get(sessionId)))
        )
      )

      const listIds = Effect.fn("SessionIndexStore.listIds")(() =>
        SynchronizedRef.get(stateRef).pipe(Effect.map((state) => state.ids.slice()))
      )

      const list = Effect.fn("SessionIndexStore.list")((options?: SessionIndexListOptions) =>
        Effect.gen(function*() {
          const config = yield* Effect.serviceOption(StorageConfig)
          const fallbackLimit = Option.isNone(config)
            ? defaultIndexPageSize
            : config.value.settings.kv.indexPageSize
          const limit = resolveListLimit(options, fallbackLimit)
          const offset = Math.max(0, options?.offset ?? 0)
          if (limit <= 0) return []
          const state = yield* SynchronizedRef.get(stateRef)
          const metas = state.ids.flatMap((id) => {
            const meta = state.meta.get(id)
            return meta ? [meta] : []
          })
          const ordered = applyOrdering(metas, options)
          return ordered.slice(offset, offset + limit)
        })
      )

      const listPage = Effect.fn("SessionIndexStore.listPage")(function*(
        options?: SessionIndexListOptions
      ) {
        const config = yield* Effect.serviceOption(StorageConfig)
        const fallbackLimit = Option.isNone(config)
          ? defaultIndexPageSize
          : config.value.settings.kv.indexPageSize
        const limit = resolveListLimit(options, fallbackLimit)
        if (limit <= 0) return { items: [] }
        const items = yield* list({ ...options, limit: limit + 1 })
        if (items.length <= limit) return { items }
        const pageItems = items.slice(0, limit)
        const orderBy = options?.orderBy ?? defaultOrderBy
        return {
          items: pageItems,
          nextCursor: makeCursor(pageItems[pageItems.length - 1]!, orderBy)
        }
      })

      const remove = Effect.fn("SessionIndexStore.remove")((sessionId: string) =>
        SynchronizedRef.update(stateRef, (state) => {
          if (!state.meta.has(sessionId)) return state
          const nextMeta = new Map(state.meta)
          nextMeta.delete(sessionId)
          const ids = state.ids.filter((id) => id !== sessionId)
          return { ids, meta: nextMeta }
        })
      )

      return SessionIndexStore.of({
        touch,
        get,
        list,
        listIds,
        remove,
        listPage
      })
    })
  )

  static readonly layerKeyValueStore = (options?: { readonly prefix?: string }) =>
    Layer.effect(
      SessionIndexStore,
      Effect.gen(function*() {
        const kv = yield* KeyValueStore.KeyValueStore
        const prefix = options?.prefix ?? defaultSessionIndexPrefix
        const indexMetaStore = kv.forSchema(SessionIndexMeta)
        const pageStore = kv.forSchema(SessionIndexPageSchema)
        const sessionStore = kv.forSchema(SessionMeta)

        const metaKey = `${prefix}/index/meta`
        const pageKey = (page: number) => `${prefix}/index/page/${page}`
        const sessionKey = (sessionId: string) => `${prefix}/meta/${sessionId}`

        const mapError = (operation: string, cause: unknown) =>
          toStorageError(storeName, operation, cause)

        const loadIndexMeta = Effect.gen(function*() {
          const metaOption = yield* indexMetaStore.get(metaKey).pipe(
            Effect.mapError((cause) => mapError("loadIndexMeta", cause))
          )
          if (Option.isSome(metaOption)) {
            const meta = metaOption.value
            return {
              ...meta,
              pageSize: normalizePageSize(meta.pageSize)
            } satisfies SessionIndexMeta
          }
          const pageSize = normalizePageSize(yield* resolvePageSize)
          return {
            pageCount: 0,
            total: 0,
            pageSize,
            updatedAt: 0
          } satisfies SessionIndexMeta
        })

        const saveIndexMeta = (meta: SessionIndexMeta) =>
          indexMetaStore.set(metaKey, meta).pipe(
            Effect.mapError((cause) => mapError("saveIndexMeta", cause))
          )

        const loadPage = (page: number): Effect.Effect<SessionIndexPageData, StorageError> =>
          pageStore.get(pageKey(page)).pipe(
            Effect.mapError((cause) => mapError("loadPage", cause)),
            Effect.map((maybe) =>
              Option.getOrElse(maybe, () => ({
                ids: [],
                updatedAt: 0
              } satisfies SessionIndexPageData))
            )
          )

        const savePage = (page: number, data: SessionIndexPageData) =>
          pageStore.set(pageKey(page), data).pipe(
            Effect.mapError((cause) => mapError("savePage", cause))
          )

        const findSessionPage = (sessionId: string, pageCount: number) =>
          Effect.gen(function*() {
            for (let page = 0; page < pageCount; page += 1) {
              const pageData = yield* loadPage(page)
              const index = pageData.ids.indexOf(sessionId)
              if (index >= 0) {
                return { page, index, pageData }
              }
            }
            return undefined
          })

        const listIds = Effect.fn("SessionIndexStore.listIds")(() =>
          Effect.gen(function*() {
            const meta = yield* loadIndexMeta
            if (meta.pageCount <= 0) return []
            const ids: Array<string> = []
            for (let page = 0; page < meta.pageCount; page += 1) {
              const pageData = yield* loadPage(page)
              ids.push(...pageData.ids)
            }
            return ids
          })
        )

        const list = Effect.fn("SessionIndexStore.list")((options?: SessionIndexListOptions) =>
          Effect.gen(function*() {
            const config = yield* Effect.serviceOption(StorageConfig)
            const fallbackLimit = Option.isNone(config)
              ? defaultIndexPageSize
              : config.value.settings.kv.indexPageSize
            const limit = resolveListLimit(options, fallbackLimit)
            const offset = Math.max(0, options?.offset ?? 0)
            if (limit <= 0) return []
            const ids = yield* listIds()
            const metas = yield* Effect.forEach(
              ids,
              (id) => sessionStore.get(sessionKey(id)).pipe(
                Effect.mapError((cause) => mapError("list", cause))
              ),
              { discard: false }
            )
            const resolved = metas.flatMap((meta) => Option.isSome(meta) ? [meta.value] : [])
            const ordered = applyOrdering(resolved, options)
            return ordered.slice(offset, offset + limit)
          })
        )

        const listPage = Effect.fn("SessionIndexStore.listPage")(function*(
          options?: SessionIndexListOptions
        ) {
          const config = yield* Effect.serviceOption(StorageConfig)
          const fallbackLimit = Option.isNone(config)
            ? defaultIndexPageSize
            : config.value.settings.kv.indexPageSize
          const limit = resolveListLimit(options, fallbackLimit)
          if (limit <= 0) return { items: [] }
          const items = yield* list({ ...options, limit: limit + 1 })
          if (items.length <= limit) return { items }
          const pageItems = items.slice(0, limit)
          const orderBy = options?.orderBy ?? defaultOrderBy
          return {
            items: pageItems,
            nextCursor: makeCursor(pageItems[pageItems.length - 1]!, orderBy)
          }
        })

        const get = Effect.fn("SessionIndexStore.get")((sessionId: string) =>
          sessionStore.get(sessionKey(sessionId)).pipe(
            Effect.mapError((cause) => mapError("get", cause))
          )
        )

        const touch = Effect.fn("SessionIndexStore.touch")(
          function*(sessionId: string, options?: SessionIndexTouchOptions) {
            const now = options?.updatedAt ?? (yield* Clock.currentTimeMillis)
            const meta = yield* loadIndexMeta
            const sessionOption = yield* sessionStore.get(sessionKey(sessionId)).pipe(
              Effect.mapError((cause) => mapError("touch", cause))
            )
            const existing = Option.getOrUndefined(sessionOption)
            const createdAt = existing?.createdAt ?? options?.createdAt ?? now
            const nextSession = SessionMeta.make({
              sessionId,
              createdAt,
              updatedAt: now
            })
            yield* sessionStore.set(sessionKey(sessionId), nextSession).pipe(
              Effect.mapError((cause) => mapError("touch", cause))
            )

            let pageCount = meta.pageCount
            let total = meta.total
            const pageSize = normalizePageSize(meta.pageSize)

            if (pageCount === 0) {
              yield* savePage(0, { ids: [sessionId], updatedAt: now })
              pageCount = 1
              total = 1
            } else {
              const found = yield* findSessionPage(sessionId, pageCount)
              if (!found) {
                const lastPageIndex = pageCount - 1
                const lastPage = yield* loadPage(lastPageIndex)
                if (lastPage.ids.length < pageSize) {
                  yield* savePage(lastPageIndex, {
                    ids: lastPage.ids.concat(sessionId),
                    updatedAt: now
                  })
                } else {
                  yield* savePage(pageCount, { ids: [sessionId], updatedAt: now })
                  pageCount += 1
                }
                total += 1
              } else if (found.pageData.updatedAt !== now) {
                yield* savePage(found.page, { ...found.pageData, updatedAt: now })
              }
            }

            yield* saveIndexMeta({
              pageCount,
              total,
              pageSize,
              updatedAt: now
            })

            return nextSession
          }
        )

        const remove = Effect.fn("SessionIndexStore.remove")((sessionId: string) =>
          Effect.gen(function*() {
            const meta = yield* loadIndexMeta
            const now = yield* Clock.currentTimeMillis
            let pageCount = meta.pageCount
            let total = meta.total

            if (pageCount > 0) {
              const found = yield* findSessionPage(sessionId, pageCount)
              if (found) {
                const remaining = found.pageData.ids.filter((id) => id !== sessionId)
                if (remaining.length === 0) {
                  yield* pageStore.remove(pageKey(found.page)).pipe(
                    Effect.mapError((cause) => mapError("remove", cause))
                  )
                  if (found.page === pageCount - 1) {
                    pageCount -= 1
                    while (pageCount > 0) {
                      const lastPageOption = yield* pageStore.get(pageKey(pageCount - 1)).pipe(
                        Effect.mapError((cause) => mapError("remove", cause))
                      )
                      if (Option.isNone(lastPageOption) || lastPageOption.value.ids.length === 0) {
                        yield* pageStore.remove(pageKey(pageCount - 1)).pipe(
                          Effect.mapError((cause) => mapError("remove", cause))
                        )
                        pageCount -= 1
                      } else {
                        break
                      }
                    }
                  }
                } else {
                  yield* savePage(found.page, {
                    ids: remaining,
                    updatedAt: now
                  })
                }
                total = Math.max(0, total - 1)
              }
            }

            yield* sessionStore.remove(sessionKey(sessionId)).pipe(
              Effect.mapError((cause) => mapError("remove", cause))
            )

            yield* saveIndexMeta({
              pageCount,
              total,
              pageSize: normalizePageSize(meta.pageSize),
              updatedAt: now
            })
          })
        )

        return SessionIndexStore.of({
          touch,
          get,
          list,
          listIds,
          remove,
          listPage
        })
      })
    )

  static readonly layerFileSystem = (options?: {
    readonly directory?: string
    readonly prefix?: string
  }) =>
    SessionIndexStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultSessionIndexPrefix
    }).pipe(
      Layer.provide(
        KeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )

  static readonly layerFileSystemBun = (options?: {
    readonly directory?: string
    readonly prefix?: string
  }) =>
    SessionIndexStore.layerKeyValueStore({
      prefix: options?.prefix ?? defaultSessionIndexPrefix
    }).pipe(
      Layer.provide(
        BunKeyValueStore.layerFileSystem(
          options?.directory ?? defaultStorageDirectory
        )
      )
    )
}
