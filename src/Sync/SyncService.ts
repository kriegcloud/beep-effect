import * as EventLogModule from "@effect/experimental/EventLog"
import * as EventLogEncryption from "@effect/experimental/EventLogEncryption"
import * as EventLogRemote from "@effect/experimental/EventLogRemote"
import * as Socket from "@effect/platform/Socket"
import { BunSocket } from "@effect/platform-bun"
import * as Cause from "effect/Cause"
import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as FiberMap from "effect/FiberMap"
import * as Layer from "effect/Layer"
import * as Mailbox from "effect/Mailbox"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as SubscriptionRef from "effect/SubscriptionRef"
import { StorageConfig } from "../Storage/StorageConfig.js"
import { EventLogRemoteServer, layerBunWebSocketTest } from "./EventLogRemoteServer.js"
import type { EventLogRemoteServerError } from "./EventLogRemoteServer.js"

export type RemoteKind = "remoteId" | "url"

/**
 * Identifies a remote in the SyncService registry.
 *
 * - kind: "url" for WebSocket connections (key = URL)
 * - kind: "remoteId" for direct EventLogRemote connections (key = remoteId hex)
 */
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
  readonly protocols?: string | Array<string>
}

const remoteIdToString = (remoteId: Uint8Array) =>
  Array.from(remoteId)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")

const defaultSyncConfig: SyncConfigOptions = {}

export class SyncConfig extends Context.Reference<SyncConfig>()(
  "@effect/claude-agent-sdk/SyncConfig",
  {
    defaultValue: () => defaultSyncConfig
  }
) {
  static readonly layer = (options: SyncConfigOptions) =>
    Layer.succeed(SyncConfig, options)
}

export class SyncService extends Context.Tag("@effect/claude-agent-sdk/SyncService")<
  SyncService,
  {
    readonly connect: (remote: EventLogRemote.EventLogRemote) => Effect.Effect<void>
    readonly connectWebSocket: (url: string, options?: SyncServiceWebSocketOptions) => Effect.Effect<void>
    /**
     * Disconnects a remote by key (URL or remoteId hex).
     */
    readonly disconnect: (key: RemoteKey | string) => Effect.Effect<void>
    /**
     * @deprecated Use `disconnect` instead.
     */
    readonly disconnectRemoteId: (remoteId: string) => Effect.Effect<void>
    readonly disconnectWebSocket: (url: string) => Effect.Effect<void>
    readonly syncNow: () => Effect.Effect<void>
    readonly status: () => Effect.Effect<ReadonlyArray<RemoteStatus>>
    readonly statusStream: () => Stream.Stream<ReadonlyArray<RemoteStatus>>
  }
>() {
  static readonly layer = Layer.scoped(SyncService, make())

  static readonly layerSocket: (
    host: string,
    port: number,
    options?: SyncServiceWebSocketOptions
  ) => Layer.Layer<SyncService, Socket.SocketError, EventLogModule.EventLog> = (
    host: string,
    port: number,
    options?: SyncServiceWebSocketOptions
  ) => {
    const socketLayer = BunSocket.layerNet({ host, port })
    const layer = Layer.scoped(
      SyncService,
      makeWithSocket(`tcp://${host}:${port}`, options)
    ).pipe(
      Layer.provide(socketLayer),
      Layer.provide(EventLogEncryption.layerSubtle)
    )
    return layer
  }

  static readonly layerWebSocket: (
    url: string,
    options?: SyncServiceWebSocketOptions
  ) => Layer.Layer<SyncService, never, EventLogModule.EventLog> = (
    url: string,
    options?: SyncServiceWebSocketOptions
  ) => {
    const layer = Layer.scoped(SyncService, makeWithWebSocket(url, options)).pipe(
      Layer.provide(BunSocket.layerWebSocketConstructor),
      Layer.provide(EventLogEncryption.layerSubtle)
    )
    return layer
  }

  static readonly layerMemory: (
    options?: SyncServiceWebSocketOptions
  ) => Layer.Layer<SyncService, unknown, EventLogModule.EventLog> = (options) =>
    Layer.unwrapEffect(
      Effect.gen(function*() {
        const server = yield* EventLogRemoteServer
        const layer = Layer.scoped(SyncService, makeWithWebSocket(server.url, options)).pipe(
          Layer.provide(BunSocket.layerWebSocketConstructor),
          Layer.provide(EventLogEncryption.layerSubtle)
        )
        return layer
      })
    ).pipe(
      Layer.provide(layerBunWebSocketTest())
    )
}

function makeWithWebSocket(
  url: string,
  options?: SyncServiceWebSocketOptions
) {
  return Effect.gen(function*() {
    const { service } = yield* makeService()
    yield* service.connectWebSocket(url, options)
    return service
  })
}

function makeWithSocket(key: string, options?: SyncServiceWebSocketOptions) {
  return Effect.gen(function*() {
    const { service, connectSocket } = yield* makeService()
    yield* connectSocket(key, options)
    return service
  })
}

function make() {
  return Effect.map(makeService(), ({ service }) => service)
}

function makeService() {
  return Effect.gen(function*() {
    const scope = yield* Effect.scope
    const log = yield* EventLogModule.EventLog
    const encryption = yield* EventLogEncryption.EventLogEncryption
    const webSocketConstructorOption = yield* Effect.serviceOption(
      Socket.WebSocketConstructor
    )
    const socketOption = yield* Effect.serviceOption(Socket.Socket)
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

    const mergeStatus = (
      previous: RemoteStatus | undefined,
      next: {
        readonly key: string
        readonly kind?: RemoteKind
        readonly remoteId?: string
        readonly connected?: boolean
        readonly url?: string
        readonly lastSyncAt?: number
        readonly lastError?: string | null
      }
    ) => {
      const url = next.url ?? previous?.url
      const lastSyncAt = next.lastSyncAt ?? previous?.lastSyncAt
      const lastError =
        next.lastError === null ? undefined : next.lastError ?? previous?.lastError
      return buildStatus({
        key: next.key,
        kind: next.kind ?? previous?.kind ?? "remoteId",
        remoteId: next.remoteId ?? previous?.remoteId ?? next.key,
        connected: next.connected ?? previous?.connected ?? false,
        ...(url !== undefined ? { url } : {}),
        ...(lastSyncAt !== undefined ? { lastSyncAt } : {}),
        ...(lastError !== undefined ? { lastError } : {})
      })
    }

    const markConnected = (key: string, kind: RemoteKind, url?: string) =>
      Effect.gen(function*() {
        const now = yield* Clock.currentTimeMillis
        yield* SubscriptionRef.update(statusRef, (map) => {
          const next = new Map(map)
          const previous = next.get(key)
          next.set(
            key,
            mergeStatus(previous, {
              key,
              kind,
              remoteId: previous?.remoteId ?? key,
              connected: true,
              lastSyncAt: now,
              lastError: null,
              ...(url !== undefined ? { url } : {})
            })
          )
          return next
        })
      })

    const markDisconnected = (key: string, error?: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        const next = new Map(map)
        const previous = next.get(key)
        next.set(
          key,
          mergeStatus(previous, {
            key,
            connected: false,
            ...(error !== undefined ? { lastError: error } : {})
          })
        )
        return next
      })

    const markSynced = (key: string) =>
      Effect.gen(function*() {
        const now = yield* Clock.currentTimeMillis
        yield* SubscriptionRef.update(statusRef, (map) => {
          const next = new Map(map)
          const previous = next.get(key)
          if (!previous) return next
          next.set(
            key,
            mergeStatus(previous, {
              key,
              connected: true,
              lastSyncAt: now,
              lastError: null
            })
          )
          return next
        })
      })

    const ensureStatus = (key: string, kind: RemoteKind, url?: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        if (map.has(key)) return map
        const next = new Map(map)
        next.set(
          key,
          buildStatus({
            key,
            kind,
            remoteId: key,
            connected: false,
            ...(url !== undefined ? { url } : {})
          })
        )
        return next
      })

    const updateRemoteId = (key: string, remoteId: string) =>
      SubscriptionRef.update(statusRef, (map) => {
        const next = new Map(map)
        const previous = next.get(key)
        next.set(
          key,
          mergeStatus(previous, {
            key,
            remoteId,
            connected: previous?.connected ?? false
          })
        )
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

    const wrapMailbox = <A, E>(mailbox: Mailbox.ReadonlyMailbox<A, E>, key: string) =>
      Mailbox.fromStream(
        Mailbox.toStream(mailbox).pipe(
          Stream.tap(() => markSynced(key))
        )
      )

    const wrapRemote = (remote: EventLogRemote.EventLogRemote, key: string): EventLogRemote.EventLogRemote => ({
      id: remote.id,
      write: (identity, entries) =>
        remote.write(identity, entries).pipe(Effect.tap(() => markSynced(key))),
      changes: (identity, startSequence) =>
        remote.changes(identity, startSequence).pipe(
          Effect.flatMap((mailbox) => wrapMailbox(mailbox, key))
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

    const connectSocket = Effect.fn("SyncService.connectSocket")(function*(
      key: string,
      options?: SyncServiceWebSocketOptions
    ) {
      const socket = yield* Option.match(socketOption, {
        onNone: () =>
          Effect.dieMessage(
            "SyncService.connectSocket requires Socket.Socket. Provide BunSocket.layerNet."
          ),
        onSome: (service) => Effect.succeed(service)
      })
      const effect = EventLogRemote.fromSocket(options).pipe(
        Effect.provideService(EventLogModule.EventLog, trackedEventLog(key)),
        Effect.provideService(EventLogEncryption.EventLogEncryption, encryption),
        Effect.provideService(Socket.Socket, socket)
      )
      yield* connectInternal(key, "url", effect, key)
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
      const webSocketConstructor = yield* Option.match(webSocketConstructorOption, {
        onNone: () =>
          Effect.dieMessage(
            "SyncService.connectWebSocket requires Socket.WebSocketConstructor. Provide BunSocket.layerWebSocketConstructor."
          ),
        onSome: (constructor) => Effect.succeed(constructor)
      })
      const socket = yield* Socket.makeWebSocket(url, {
        protocols: options?.protocols
      }).pipe(
        Effect.provideService(Socket.WebSocketConstructor, webSocketConstructor)
      )
      const effect = EventLogRemote.fromSocket({
        ...(options?.disablePing !== undefined ? { disablePing: options.disablePing } : {})
      }).pipe(
        Effect.provideService(EventLogModule.EventLog, trackedEventLog(url)),
        Effect.provideService(EventLogEncryption.EventLogEncryption, encryption),
        Effect.provideService(Socket.Socket, socket)
      )
      yield* connectInternal(url, "url", effect, url)
    })

    const toKey = (input: RemoteKey | string) =>
      typeof input === "string" ? input : input.key

    const disconnect = Effect.fn("SyncService.disconnect")((input: RemoteKey | string) => {
      const key = toKey(input)
      return FiberMap.remove(fibers, key).pipe(
        Effect.zipRight(removeConnector(key)),
        Effect.zipRight(markDisconnected(key))
      )
    })

    const disconnectRemoteId = disconnect

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
      const syncConfig = yield* SyncConfig
      if (syncConfig.syncInterval !== undefined) {
        const interval = syncConfig.syncInterval
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

    const service = SyncService.of({
      connect,
      connectWebSocket,
      disconnect,
      disconnectRemoteId,
      disconnectWebSocket,
      syncNow,
      status,
      statusStream
    })

    return { service, connectSocket }
  })
}
