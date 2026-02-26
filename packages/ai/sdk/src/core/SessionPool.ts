import * as Clock from "effect/Clock"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"

import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import * as Schema from "effect/Schema"
import * as Scope from "effect/Scope"
import * as Semaphore from "effect/Semaphore"
import * as ServiceMap from "effect/ServiceMap"
import * as Stream from "effect/Stream"
import { SessionManager, type SessionManagerError } from "./SessionManager.js"
import type { SessionHandle, SessionError } from "./Session.js"
import type { SDKSessionOptions } from "./Schema/Session.js"

export type SessionPoolCloseReason = "manual" | "idle" | "shutdown"

export type SessionPoolOptions = {
  readonly model: string
  readonly sessionOptions?: Omit<SDKSessionOptions, "model">
  readonly maxSessions?: number
  readonly idleTimeout?: Duration.Input
  readonly onSessionCreated?: (sessionId: string, tenant?: string) => Effect.Effect<void>
  readonly onSessionClosed?: (
    sessionId: string,
    reason: SessionPoolCloseReason,
    tenant?: string
  ) => Effect.Effect<void>
}

export class SessionPoolFullError extends Schema.TaggedErrorClass<SessionPoolFullError>()(
  "SessionPoolFullError",
  {
    message: Schema.String,
    maxSessions: Schema.Number
  }
) {
  static readonly make = (params: Pick<SessionPoolFullError, "message" | "maxSessions">) =>
    new SessionPoolFullError(params)
}

export class SessionPoolNotFoundError extends Schema.TaggedErrorClass<SessionPoolNotFoundError>()(
  "SessionPoolNotFoundError",
  {
    message: Schema.String,
    sessionId: Schema.String
  }
) {
  static readonly make = (params: Pick<SessionPoolNotFoundError, "message" | "sessionId">) =>
    new SessionPoolNotFoundError(params)
}

export class SessionPoolInvalidTenantError extends Schema.TaggedErrorClass<SessionPoolInvalidTenantError>()(
  "SessionPoolInvalidTenantError",
  {
    message: Schema.String,
    tenant: Schema.String
  }
) {
  static readonly make = (
    params: Pick<SessionPoolInvalidTenantError, "message" | "tenant">
  ) => new SessionPoolInvalidTenantError(params)
}

export const SessionPoolError = Schema.Union([
  SessionPoolFullError,
  SessionPoolNotFoundError,
  SessionPoolInvalidTenantError
])

export type SessionPoolError = typeof SessionPoolError.Type
export type SessionPoolErrorEncoded = typeof SessionPoolError.Encoded

export type SessionInfo = {
  readonly sessionId: string
  readonly tenant?: string
  readonly createdAt: number
  readonly lastUsedAt: number
}

type SessionEntry = {
  readonly sessionId: string
  readonly tenant?: string
  readonly handle: SessionHandle
  readonly scope: Scope.Closeable
  readonly createdAt: number
  readonly lastUsedAt: number
}

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/
const defaultTenantScope = "__default__"

const resolveTenant = (
  tenant: string | undefined
): Effect.Effect<string | undefined, SessionPoolInvalidTenantError> =>
  tenant === undefined || tenantPattern.test(tenant)
    ? Effect.succeed(tenant)
    : Effect.fail(
        SessionPoolInvalidTenantError.make({
          message: "Invalid tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.",
          tenant
        })
      )

const sessionKey = (sessionId: string, tenant: string | undefined) =>
  `${tenant ?? defaultTenantScope}\u0000${sessionId}`

const toInfo = (entry: SessionEntry): SessionInfo => ({
  sessionId: entry.sessionId,
  ...(entry.tenant !== undefined ? { tenant: entry.tenant } : {}),
  createdAt: entry.createdAt,
  lastUsedAt: entry.lastUsedAt
})

const resolveOptions = (
  options: SessionPoolOptions,
  overrides?: Partial<SDKSessionOptions>
): SDKSessionOptions => ({
  model: options.model,
  ...(options.sessionOptions ?? {}),
  ...(overrides ?? {})
})

const makeSessionPool = (options: SessionPoolOptions) =>
  Effect.gen(function*() {
    const manager = yield* SessionManager
    const maxSessions = options.maxSessions ?? 100
    const idleTimeoutMs = options.idleTimeout
      ? Duration.toMillis(options.idleTimeout)
      : undefined
    const sessionsRef = yield* Ref.make(new Map<string, SessionEntry>())
    const lock = yield* Semaphore.make(1)

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      lock.withPermits(1)(effect)

    const touchResolved = (sessionId: string, tenant: string | undefined) =>
      withLock(
        Effect.gen(function*() {
          const now = yield* Clock.currentTimeMillis
          const sessions = yield* Ref.get(sessionsRef)
          const key = sessionKey(sessionId, tenant)
          const entry = sessions.get(key)
          if (entry === undefined) {
            return
          }
          sessions.set(key, { ...entry, lastUsedAt: now })
        })
      )

    const touch = (sessionId: string, tenant?: string) =>
      resolveTenant(tenant).pipe(
        Effect.flatMap((resolvedTenant) => touchResolved(sessionId, resolvedTenant))
      )

    const closeEntryResolved = (
      sessionId: string,
      reason: SessionPoolCloseReason,
      tenant: string | undefined
    ): Effect.Effect<void, SessionError | SessionPoolNotFoundError> =>
      withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          const key = sessionKey(sessionId, tenant)
          const entry = sessions.get(key)
          if (entry === undefined) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId
            })
          }

          sessions.delete(key)
          yield* Scope.close(entry.scope, Exit.succeed(undefined))

          if (options.onSessionClosed) {
            yield* options.onSessionClosed(sessionId, reason, tenant)
          }
        })
      )

    const closeEntry = (
      sessionId: string,
      reason: SessionPoolCloseReason,
      tenant?: string
    ): Effect.Effect<void, SessionError | SessionPoolNotFoundError | SessionPoolInvalidTenantError> =>
      resolveTenant(tenant).pipe(
        Effect.flatMap((resolvedTenant) => closeEntryResolved(sessionId, reason, resolvedTenant))
      )

    const ensureCapacity = withLock(
      Effect.gen(function*() {
        const sessions = yield* Ref.get(sessionsRef)
        if (sessions.size < maxSessions) {
          return
        }
        return yield* SessionPoolFullError.make({
          message: "Session pool capacity exceeded",
          maxSessions
        })
      })
    )

    const wrapHandle = (entry: SessionEntry): SessionHandle => ({
      sessionId: entry.handle.sessionId,
      send: (message) =>
        entry.handle.send(message).pipe(
          Effect.tap(() => touchResolved(entry.sessionId, entry.tenant))
        ),
      stream: entry.handle.stream.pipe(
        Stream.tap(() => touchResolved(entry.sessionId, entry.tenant))
      ),
      close: closeEntryResolved(entry.sessionId, "manual", entry.tenant).pipe(
        Effect.catchTag("SessionPoolNotFoundError", () => Effect.void)
      )
    })

    const storeEntry = (
      key: string,
      entry: SessionEntry
    ) =>
      withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          sessions.set(key, entry)
          if (options.onSessionCreated) {
            yield* options.onSessionCreated(entry.sessionId, entry.tenant)
          }
        })
      )

    const create = Effect.fn("SessionPool.create")(function*(
      overrides?: Partial<SDKSessionOptions>,
      tenant?: string
    ) {
      const resolvedTenant = yield* resolveTenant(tenant)
      yield* ensureCapacity

      const scope = yield* Scope.make()
      const handle = yield* manager
        .create(resolveOptions(options, overrides))
        .pipe(Scope.provide(scope))

      const sessionId = yield* handle.sessionId
      const now = yield* Clock.currentTimeMillis
      const entry: SessionEntry = {
        sessionId,
        ...(resolvedTenant !== undefined ? { tenant: resolvedTenant } : {}),
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now
      }

      yield* storeEntry(sessionKey(sessionId, resolvedTenant), entry)
      return wrapHandle(entry)
    })

    const get = Effect.fn("SessionPool.get")(function*(
      sessionId: string,
      overrides?: Partial<SDKSessionOptions>,
      tenant?: string
    ) {
      const resolvedTenant = yield* resolveTenant(tenant)
      const key = sessionKey(sessionId, resolvedTenant)
      const existing = yield* withLock(
        Ref.get(sessionsRef).pipe(
          Effect.map((sessions) => sessions.get(key))
        )
      )

      if (existing !== undefined) {
        yield* touch(sessionId, resolvedTenant)
        return wrapHandle(existing)
      }

      yield* ensureCapacity
      const scope = yield* Scope.make()
      const handle = yield* manager
        .resume(sessionId, resolveOptions(options, overrides))
        .pipe(Scope.provide(scope))

      const now = yield* Clock.currentTimeMillis
      const entry: SessionEntry = {
        sessionId,
        ...(resolvedTenant !== undefined ? { tenant: resolvedTenant } : {}),
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now
      }

      yield* storeEntry(key, entry)
      return wrapHandle(entry)
    })

    const listByTenant = Effect.fn("SessionPool.listByTenant")(function*(tenant?: string) {
      const resolvedTenant = yield* resolveTenant(tenant)
      return yield* withLock(
        Ref.get(sessionsRef).pipe(
          Effect.map((sessions) =>
            Array.from(sessions.values())
              .filter((entry) => entry.tenant === resolvedTenant)
              .map(toInfo)
          )
        )
      )
    })

    const list = listByTenant(undefined)

    const info = Effect.fn("SessionPool.info")(function*(
      sessionId: string,
      tenant?: string
    ) {
      const resolvedTenant = yield* resolveTenant(tenant)
      return yield* withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          const entry = sessions.get(sessionKey(sessionId, resolvedTenant))
          if (entry === undefined) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId
            })
          }
          return toInfo(entry)
        })
      )
    })

    const close = Effect.fn("SessionPool.close")(function*(
      sessionId: string,
      tenant?: string
    ) {
      return yield* closeEntry(sessionId, "manual", tenant)
    })

    const closeAll = withLock(
      Effect.gen(function*() {
        const sessions = yield* Ref.get(sessionsRef)
        const entries = Array.from(sessions.entries())
        sessions.clear()

        yield* Effect.forEach(
          entries,
          ([, entry]) =>
            Scope.close(entry.scope, Exit.succeed(undefined)).pipe(
              Effect.andThen(
                options.onSessionClosed
                  ? options.onSessionClosed(entry.sessionId, "shutdown", entry.tenant)
                  : Effect.void
              )
            ),
          { discard: true }
        )
      })
    )

    const withSession = Effect.fn("SessionPool.withSession")(
      <A, E, R>(
        sessionId: string,
        use: (handle: SessionHandle) => Effect.Effect<A, E, R>,
        tenant?: string
      ) =>
        get(sessionId, undefined, tenant).pipe(
          Effect.flatMap(use)
        )
    )

    if (idleTimeoutMs !== undefined && idleTimeoutMs > 0) {
      const interval = Duration.millis(Math.max(1000, Math.floor(idleTimeoutMs / 2)))

      yield* Effect.forkScoped(
        Effect.repeat(
          withLock(
            Effect.gen(function*() {
              const sessions = yield* Ref.get(sessionsRef)
              if (sessions.size === 0) {
                return
              }

              const now = yield* Clock.currentTimeMillis
              const stale: Array<[string, SessionEntry]> = []
              for (const [key, entry] of sessions.entries()) {
                if (now - entry.lastUsedAt >= idleTimeoutMs) {
                  stale.push([key, entry])
                }
              }

              if (stale.length === 0) {
                return
              }

              for (const [key, entry] of stale) {
                sessions.delete(key)
                yield* Scope.close(entry.scope, Exit.succeed(undefined))
                if (options.onSessionClosed) {
                  yield* options.onSessionClosed(entry.sessionId, "idle", entry.tenant)
                }
              }
            })
          ),
          Schedule.spaced(interval)
        )
      )
    }

    yield* Effect.addFinalizer(() => closeAll.pipe(Effect.ignore))

    return SessionPool.of({
      create,
      get,
      info,
      list,
      listByTenant,
      close,
      closeAll,
      withSession
    })
  })

export class SessionPool extends ServiceMap.Service<
  SessionPool,
  {
    readonly create: (
      overrides?: Partial<SDKSessionOptions>,
      tenant?: string
    ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>
    readonly get: (
      sessionId: string,
      overrides?: Partial<SDKSessionOptions>,
      tenant?: string
    ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>
    readonly info: (
      sessionId: string,
      tenant?: string
    ) => Effect.Effect<SessionInfo, SessionPoolError>
    readonly withSession: <A, E, R>(
      sessionId: string,
      use: (handle: SessionHandle) => Effect.Effect<A, E, R>,
      tenant?: string
    ) => Effect.Effect<A, E | SessionManagerError | SessionPoolError, R>
    readonly list: Effect.Effect<ReadonlyArray<SessionInfo>, SessionPoolError>
    readonly listByTenant: (
      tenant?: string
    ) => Effect.Effect<ReadonlyArray<SessionInfo>, SessionPoolError>
    readonly close: (
      sessionId: string,
      tenant?: string
    ) => Effect.Effect<void, SessionError | SessionPoolError>
    readonly closeAll: Effect.Effect<void, SessionError>
  }
>()("@effect/claude-agent-sdk/SessionPool") {
  static readonly layer = (options: SessionPoolOptions) =>
    Layer.buildWithScope(makeSessionPool(options))( SessionPool)

  static readonly make = (options: SessionPoolOptions) =>
    Effect.scoped(makeSessionPool(options))
}
