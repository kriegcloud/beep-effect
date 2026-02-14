import * as Clock from "effect/Clock"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import * as Schema from "effect/Schema"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import { SessionManager, type SessionManagerError } from "./SessionManager.js"
import type { SessionHandle, SessionError } from "./Session.js"
import type { SDKSessionOptions } from "./Schema/Session.js"

export type SessionPoolCloseReason = "manual" | "idle" | "shutdown"

export type SessionPoolOptions = {
  readonly model: string
  readonly sessionOptions?: Omit<SDKSessionOptions, "model">
  readonly maxSessions?: number
  readonly idleTimeout?: Duration.DurationInput
  readonly onSessionCreated?: (sessionId: string) => Effect.Effect<void>
  readonly onSessionClosed?: (
    sessionId: string,
    reason: SessionPoolCloseReason
  ) => Effect.Effect<void>
}

export class SessionPoolFullError extends Schema.TaggedError<SessionPoolFullError>()(
  "SessionPoolFullError",
  {
    message: Schema.String,
    maxSessions: Schema.Number
  }
) {}

export class SessionPoolNotFoundError extends Schema.TaggedError<SessionPoolNotFoundError>()(
  "SessionPoolNotFoundError",
  {
    message: Schema.String,
    sessionId: Schema.String
  }
) {}

export const SessionPoolError = Schema.Union(SessionPoolFullError, SessionPoolNotFoundError)

export type SessionPoolError = typeof SessionPoolError.Type
export type SessionPoolErrorEncoded = typeof SessionPoolError.Encoded

export type SessionInfo = {
  readonly sessionId: string
  readonly createdAt: number
  readonly lastUsedAt: number
}

type SessionEntry = {
  readonly handle: SessionHandle
  readonly scope: Scope.CloseableScope
  readonly createdAt: number
  readonly lastUsedAt: number
}

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
    const lock = yield* Effect.makeSemaphore(1)

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      lock.withPermits(1)(effect)

    const touch = (sessionId: string) =>
      withLock(
        Effect.gen(function*() {
          const now = yield* Clock.currentTimeMillis
          const sessions = yield* Ref.get(sessionsRef)
          const entry = sessions.get(sessionId)
          if (!entry) return
          sessions.set(sessionId, { ...entry, lastUsedAt: now })
        })
      )

    const closeEntry = (
      sessionId: string,
      reason: SessionPoolCloseReason
    ): Effect.Effect<void, SessionError | SessionPoolNotFoundError> =>
      withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          const entry = sessions.get(sessionId)
          if (!entry) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId
            })
          }
          sessions.delete(sessionId)
          yield* Scope.close(entry.scope, Exit.succeed(undefined))
          if (options.onSessionClosed) {
            yield* options.onSessionClosed(sessionId, reason)
          }
        })
      )

    const ensureCapacity = withLock(
      Effect.gen(function*() {
        const sessions = yield* Ref.get(sessionsRef)
        if (sessions.size < maxSessions) return
        return yield* SessionPoolFullError.make({
          message: "Session pool capacity exceeded",
          maxSessions
        })
      })
    )

    const wrapHandle = (sessionId: string, entry: SessionEntry): SessionHandle => ({
      sessionId: entry.handle.sessionId,
      send: (message) =>
        entry.handle.send(message).pipe(
          Effect.tap(() => touch(sessionId))
        ),
      stream: entry.handle.stream.pipe(
        Stream.tap(() => touch(sessionId))
      ),
      close: closeEntry(sessionId, "manual").pipe(
        Effect.catchTag("SessionPoolNotFoundError", () => Effect.void)
      )
    })

    const storeEntry = (
      sessionId: string,
      entry: SessionEntry
    ) =>
      withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          sessions.set(sessionId, entry)
          if (options.onSessionCreated) {
            yield* options.onSessionCreated(sessionId)
          }
        })
      )

    const create = Effect.fn("SessionPool.create")(function*(
      overrides?: Partial<SDKSessionOptions>
    ) {
      yield* ensureCapacity
      const scope = yield* Scope.make()
      const handle = yield* Scope.extend(
        manager.create(resolveOptions(options, overrides)),
        scope
      )
      const sessionId = yield* handle.sessionId
      const now = yield* Clock.currentTimeMillis
      const entry: SessionEntry = {
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now
      }
      yield* storeEntry(sessionId, entry)
      return wrapHandle(sessionId, entry)
    })

    const get = Effect.fn("SessionPool.get")(function*(
      sessionId: string,
      overrides?: Partial<SDKSessionOptions>
    ) {
      const existing = yield* withLock(
        Ref.get(sessionsRef).pipe(
          Effect.map((sessions) => sessions.get(sessionId))
        )
      )
      if (existing) {
        yield* touch(sessionId)
        return wrapHandle(sessionId, existing)
      }
      yield* ensureCapacity
      const scope = yield* Scope.make()
      const handle = yield* Scope.extend(
        manager.resume(sessionId, resolveOptions(options, overrides)),
        scope
      )
      const now = yield* Clock.currentTimeMillis
      const entry: SessionEntry = {
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now
      }
      yield* storeEntry(sessionId, entry)
      return wrapHandle(sessionId, entry)
    })

    const list = withLock(
      Ref.get(sessionsRef).pipe(
        Effect.map((sessions) =>
          Array.from(sessions.entries()).map(([sessionId, entry]) => ({
            sessionId,
            createdAt: entry.createdAt,
            lastUsedAt: entry.lastUsedAt
          } satisfies SessionInfo))
        )
      )
    )

    const info = Effect.fn("SessionPool.info")((sessionId: string) =>
      withLock(
        Effect.gen(function*() {
          const sessions = yield* Ref.get(sessionsRef)
          const entry = sessions.get(sessionId)
          if (!entry) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId
            })
          }
          return {
            sessionId,
            createdAt: entry.createdAt,
            lastUsedAt: entry.lastUsedAt
          } satisfies SessionInfo
        })
      )
    )

    const close = Effect.fn("SessionPool.close")((sessionId: string) =>
      closeEntry(sessionId, "manual")
    )

    const closeAll = withLock(
      Effect.gen(function*() {
        const sessions = yield* Ref.get(sessionsRef)
        const entries = Array.from(sessions.entries())
        sessions.clear()
        yield* Effect.forEach(
          entries,
          ([sessionId, entry]) =>
            Scope.close(entry.scope, Exit.succeed(undefined)).pipe(
              Effect.tap(() =>
                options.onSessionClosed
                  ? options.onSessionClosed(sessionId, "shutdown")
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
        use: (handle: SessionHandle) => Effect.Effect<A, E, R>
      ) =>
        get(sessionId).pipe(
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
              if (sessions.size === 0) return
              const now = yield* Clock.currentTimeMillis
              const stale: Array<[string, SessionEntry]> = []
              for (const entry of sessions.entries()) {
                const lastUsedAt = entry[1].lastUsedAt
                if (now - lastUsedAt >= idleTimeoutMs) {
                  stale.push(entry)
                }
              }
              if (stale.length === 0) return
              for (const [sessionId, entry] of stale) {
                sessions.delete(sessionId)
                yield* Scope.close(entry.scope, Exit.succeed(undefined))
                if (options.onSessionClosed) {
                  yield* options.onSessionClosed(sessionId, "idle")
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
      close,
      closeAll,
      withSession
    })
  })

export class SessionPool extends Context.Tag("@effect/claude-agent-sdk/SessionPool")<
  SessionPool,
  {
    readonly create: (
      overrides?: Partial<SDKSessionOptions>
    ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>
    readonly get: (
      sessionId: string,
      overrides?: Partial<SDKSessionOptions>
    ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>
    readonly info: (sessionId: string) => Effect.Effect<SessionInfo, SessionPoolError>
    readonly withSession: <A, E, R>(
      sessionId: string,
      use: (handle: SessionHandle) => Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | SessionManagerError | SessionPoolError, R>
    readonly list: Effect.Effect<ReadonlyArray<SessionInfo>, SessionPoolError>
    readonly close: (sessionId: string) => Effect.Effect<void, SessionError | SessionPoolError>
    readonly closeAll: Effect.Effect<void, SessionError>
  }
>() {
  static readonly layer = (options: SessionPoolOptions) =>
    Layer.scoped(SessionPool, makeSessionPool(options))

  static readonly make = (options: SessionPoolOptions) =>
    Effect.scoped(makeSessionPool(options))
}
