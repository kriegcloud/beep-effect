import * as EventLogModule from "@effect/experimental/EventLog"
import * as EventLogEncryption from "@effect/experimental/EventLogEncryption"
import * as EventLogRemote from "@effect/experimental/EventLogRemote"
import * as Socket from "@effect/platform/Socket"
import { BunSocket } from "@effect/platform-bun"
import * as Cause from "effect/Cause"
import * as Chunk from "effect/Chunk"
import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as FiberMap from "effect/FiberMap"
import * as Layer from "effect/Layer"
import type * as Mailbox from "effect/Mailbox"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as SubscriptionRef from "effect/SubscriptionRef"
import { StorageConfig } from "../Storage/StorageConfig.js"

export type RemoteKind = "remoteId" | "url"

export type RemoteKey = {
  readonly key: string
  readonly kind: RemoteKind
}

export type RemoteStatus = {
  readonly key: string
  readonly kind: RemoteKind
  readonly remoteId: string
  readonly url?: string
  readonly connected: boolean
  readonly lastSyncAt?: number
  readonly lastError?: string
}

export type SyncConfigOptions = {
  readonly syncInterval?: Duration.DurationInput
}

export type SyncServiceWebSocketOptions = {
  readonly disablePing?: boolean
  readonly syncInterval?: Duration.DurationInput
}

const remoteIdToString = (remoteId: Uint8Array) =>
  Array.from(remoteId)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

export class SyncConfig extends Context.Tag("@effect/claude-agent-sdk/SyncConfig")<
  SyncConfig,
  SyncConfigOptions
>() {
  static readonly layer = (options: SyncConfigOptions) =>
    Layer.succeed(SyncConfig, options)
}

export class SyncService extends Context.Tag("@effect/claude-agent-sdk/SyncService")<
  SyncService,
  {
    readonly connect: (remote: EventLogRemote.EventLogRemote) => Effect.Effect<void>
    readonly connectWebSocket: (url: string, options?: SyncServiceWebSocketOptions) => Effect.Effect<void>
    readonly disconnect: (remoteId: string) => Effect.Effect<void>
    readonly disconnectRemoteId: (remoteId: string) => Effect.Effect<void>
    readonly disconnectWebSocket: (url: string) => Effect.Effect<void>
    readonly syncNow: () => Effect.Effect<void>
    readonly status: () => Effect.Effect<ReadonlyArray<RemoteStatus>>
    readonly statusStream: () => Stream.Stream<ReadonlyArray<RemoteStatus>>
  }
>() {
  static readonly layer = Layer.scoped(SyncService, make())

  static readonly layerWebSocket = (
    url: string,
    options?: SyncServiceWebSocketOptions
  ) => {
    let layer = Layer.scoped(SyncService, makeWithWebSocket(url, options)).pipe(
      Layer.provide(BunSocket.layerWebSocketConstructor),
      Layer.provide(EventLogEncryption.layerSubtle)
    )
    if (options?.syncInterval !== undefined) {
      layer = layer.pipe(
        Layer.provide(SyncConfig.layer({ syncInterval: options.syncInterval }))
      )
    }
    return layer
  }
}

function makeWithWebSocket(
  url: string,
  options?: SyncServiceWebSocketOptions
) {
  return Effect.gen(function*() {
    const service = yield* make()
    yield* service.connectWebSocket(url, options)
    return service
  })
}

function make() {
  return Effect.gen(function*() {
    const scope = yield* Effect.scope
    const log = yield* EventLogModule.EventLog
    const encryption = yield* EventLogEncryption.EventLogEncryption
    const webSocketConstructor = yield* Socket.WebSocketConstructor
    const fibers = yield* FiberMap.make<string>()
    const syncNowSemaphore = yield* Effect.makeSemaphore(1)
    const statusRef = yield* SubscriptionRef.make<Map<string, RemoteStatus>>(new Map())
    const connectorsRef = yield* Ref.make<Map<string, {
      readonly effect: Effect.Effect<void, never, Scope.Scope>
      readonly key: string
      readonly kind: RemoteKind
      readonly url?: string
    }>>(new Map())

    const buildStatus = (input: {
      readonly key: string
      readonly kind: RemoteKind
      readonly remoteId: string
      readonly connected: boolean
      readonly url?: string
      readonly lastSyncAt?: number
      readonly lastError?: string
    }): RemoteStatus => ({
      key: input.key,
      kind: input.kind,
      remoteId: input.remoteId,
      connected: input.connected,
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.lastSyncAt !== undefined ? { lastSyncAt: input.lastSyncAt } : {}),
      ...(input.lastError !== undefined ? { lastError: input.lastError } : {})
    })

    const withUrl = <T extends object>(input: T, url?: string) =>
      url !== undefined ? { ...input, url } : input

    const withLastSyncAt = <T extends object>(input: T, lastSyncAt?: number) =>
      lastSyncAt !== undefined ? { ...input, lastSyncAt } : input

    const withLastError = <T extends object>(input: T, lastError?: string) =>
      lastError !== undefined ? { ...input, lastError } : input

    const markConnected = (key: string, kind: RemoteKind, url?: string) =>
      Effect.gen(function*() {
        const now = yield* Clock.currentTimeMillis
        yield* SubscriptionRef.update(statusRef, (map) => {
          const next = new Map(map)
          const previous = next.get(key)
          next.set(key, {
            ...buildStatus(withUrl({
              key,
              kind,
              remoteId: previous?.remoteId ?? key,
              connected: true,
              lastSyncAt: now
            }, url))
          })
          return next
        })
      })

    const markDisconnected = (key: string, error?: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        const next = new Map(map)
        const previous = next.get(key)
        const kind = previous?.kind ?? "remoteId"
        const url = previous?.url
        const lastSyncAt = previous?.lastSyncAt
        const lastError = error ?? previous?.lastError
        const baseStatusInput = withLastError(
          withLastSyncAt(
            {
              key,
              kind,
              remoteId: previous?.remoteId ?? key,
              connected: false
            },
            lastSyncAt
          ),
          lastError
        )
        const status: RemoteStatus = buildStatus(withUrl(baseStatusInput, url))
        next.set(key, {
          ...status,
          connected: false
        })
        return next
      })

    const markSynced = (key: string) =>
      Effect.gen(function*() {
        const now = yield* Clock.currentTimeMillis
        yield* SubscriptionRef.update(statusRef, (map) => {
          const next = new Map(map)
          const previous = next.get(key)
          if (!previous) return next
          next.set(key, {
            ...buildStatus(withUrl({
              key,
              kind: previous.kind,
              remoteId: previous.remoteId,
              connected: true,
              lastSyncAt: now
            }, previous.url))
          })
          return next
        })
      })

    const ensureStatus = (key: string, kind: RemoteKind, url?: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        if (map.has(key)) return map
        const next = new Map(map)
        next.set(key, buildStatus(withUrl({
          key,
          kind,
          remoteId: key,
          connected: false
        }, url)))
        return next
      })

    const updateRemoteId = (key: string, remoteId: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        const next = new Map(map)
        const previous = next.get(key)
        const kind = previous?.kind ?? "remoteId"
        const url = previous?.url
        const baseStatusInput = withLastError(
          withLastSyncAt(
            {
              key,
              kind,
              remoteId,
              connected: previous?.connected ?? false
            },
            previous?.lastSyncAt
          ),
          previous?.lastError
        )
        next.set(key, {
          ...buildStatus(withUrl(baseStatusInput, url))
        })
        return next
      })

    const runTracked = <R>(
      key: string,
      effect: Effect.Effect<void, never, R>,
      options?: { readonly onlyIfMissing?: boolean }
    ) =>
      FiberMap.run(
        fibers,
        key,
        Scope.extend(
          effect.pipe(
            Effect.catchAllCause((cause) => markDisconnected(key, Cause.pretty(cause))),
            Effect.ensuring(markDisconnected(key))
          ),
          scope
        ),
        { onlyIfMissing: options?.onlyIfMissing ?? true }
      )

    const registerConnector = (
      key: string,
      kind: RemoteKind,
      effect: Effect.Effect<void, never, Scope.Scope>,
      url?: string
    ) =>
      Ref.update(connectorsRef, (map) => {
        const next = new Map(map)
        next.set(key, {
          effect,
          key,
          kind,
          ...(url !== undefined ? { url } : {})
        })
        return next
      })

    const removeConnector = (key: string) =>
      Ref.update(connectorsRef, (map) => {
        const next = new Map(map)
        next.delete(key)
        return next
      })

    const connectInternal = Effect.fn("SyncService.connectInternal")(function*(
      key: string,
      kind: RemoteKind,
      effect: Effect.Effect<void, never, Scope.Scope>,
      url?: string
    ) {
      yield* registerConnector(key, kind, effect, url)
      yield* ensureStatus(key, kind, url)
      const hasFiber = yield* FiberMap.has(fibers, key)
      if (hasFiber) {
        const statusMap = yield* SubscriptionRef.get(statusRef)
        const previous = statusMap.get(key)
        if (previous?.connected) return
      }
      yield* runTracked(key, effect, { onlyIfMissing: !hasFiber })
    })

    const wrapMailbox = <A, E>(mailbox: Mailbox.ReadonlyMailbox<A, E>, key: string) => {
      const markIfEntries = (entries: Chunk.Chunk<A>) =>
        Chunk.isEmpty(entries) ? Effect.void : markSynced(key)
      return {
        ...mailbox,
        clear: mailbox.clear.pipe(Effect.tap(markIfEntries)),
        takeAll: mailbox.takeAll.pipe(
          Effect.tap(([entries]) => markIfEntries(entries))
        ),
        takeN: (n: number) =>
          mailbox.takeN(n).pipe(
            Effect.tap(([entries]) => markIfEntries(entries))
          ),
        take: mailbox.take.pipe(Effect.tap(() => markSynced(key)))
      }
    }

    const wrapRemote = (remote: EventLogRemote.EventLogRemote, key: string): EventLogRemote.EventLogRemote => ({
      id: remote.id,
      write: (identity, entries) =>
        remote.write(identity, entries).pipe(Effect.tap(() => markSynced(key))),
      changes: (identity, startSequence) =>
        remote.changes(identity, startSequence).pipe(
          Effect.map((mailbox) => wrapMailbox(mailbox, key))
        )
    })

    const trackedEventLog = (key: string) =>
      EventLogModule.EventLog.of({
        ...log,
        registerRemote: (remote) => {
          const remoteId = remoteIdToString(remote.id)
          const trackedRemote = wrapRemote(remote, key)
          return log.registerRemote(trackedRemote).pipe(
            Effect.tap(() => updateRemoteId(key, remoteId)),
            Effect.tap(() => markConnected(key, "url", key))
          )
        }
      })

    const connect = Effect.fn("SyncService.connect")(function*(
      remote: EventLogRemote.EventLogRemote
    ) {
      const key = remoteIdToString(remote.id)
      const trackedRemote = wrapRemote(remote, key)
      yield* connectInternal(
        key,
        "remoteId",
        log.registerRemote(trackedRemote).pipe(
          Effect.tap(() => updateRemoteId(key, key)),
          Effect.tap(() => markConnected(key, "remoteId"))
        )
      )
    })

    const connectWebSocket = Effect.fn("SyncService.connectWebSocket")(function*(
      url: string,
      options?: SyncServiceWebSocketOptions
    ) {
      const effect = EventLogRemote.fromWebSocket(url, options).pipe(
        Effect.provideService(EventLogModule.EventLog, trackedEventLog(url)),
        Effect.provideService(EventLogEncryption.EventLogEncryption, encryption),
        Effect.provideService(Socket.WebSocketConstructor, webSocketConstructor)
      )
      yield* connectInternal(url, "url", effect, url)
    })

    const disconnect = Effect.fn("SyncService.disconnect")((remoteId: string) =>
      FiberMap.remove(fibers, remoteId).pipe(
        Effect.zipRight(removeConnector(remoteId)),
        Effect.zipRight(markDisconnected(remoteId))
      )
    )

    const disconnectRemoteId = Effect.fn("SyncService.disconnectRemoteId")((remoteId: string) =>
      disconnect(remoteId)
    )

    const disconnectWebSocket = Effect.fn("SyncService.disconnectWebSocket")((url: string) =>
      disconnect(url)
    )

    const syncNow = Effect.fn("SyncService.syncNow")(() =>
      syncNowSemaphore.withPermits(1)(
        Effect.gen(function*() {
          const connectors = yield* Ref.get(connectorsRef)
          if (connectors.size === 0) return
          yield* Effect.forEach(
            connectors,
            ([key, connector]) =>
              FiberMap.remove(fibers, key).pipe(
                Effect.zipRight(runTracked(key, connector.effect, { onlyIfMissing: false }))
              ),
            { discard: true }
          )
        })
      )
    )

    const status = Effect.fn("SyncService.status")(() =>
      SubscriptionRef.get(statusRef).pipe(
        Effect.map((map) => Array.from(map.values()))
      )
    )

    const statusStream = () =>
      statusRef.changes.pipe(
        Stream.map((map) => Array.from(map.values()))
      )

    yield* Effect.gen(function*() {
      const syncConfig = yield* Effect.serviceOption(SyncConfig)
      if (Option.isSome(syncConfig) && syncConfig.value.syncInterval !== undefined) {
        const interval = syncConfig.value.syncInterval
        if (Duration.toMillis(interval) <= 0) return
        yield* Effect.repeat(syncNow(), Schedule.spaced(interval))
        return
      }
      const config = yield* Effect.serviceOption(StorageConfig)
      if (Option.isNone(config)) return
      const interval = config.value.settings.sync.interval
      if (Duration.toMillis(interval) <= 0) return
      yield* Effect.repeat(syncNow(), Schedule.spaced(interval))
    }).pipe(
      Effect.catchAllCause(Effect.logDebug),
      Effect.forkScoped
    )

    return SyncService.of({
      connect,
      connectWebSocket,
      disconnect,
      disconnectRemoteId,
      disconnectWebSocket,
      syncNow,
      status,
      statusStream
    })
  })
}
