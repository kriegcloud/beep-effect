import { $AiSdkId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import {
  Clock,
  Duration,
  Effect,
  Exit,
  Layer,
  MutableHashMap,
  Ref,
  Schedule,
  Scope,
  Semaphore,
  ServiceMap,
  Stream,
} from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { utcFromMillis } from "./internal/dateTime.js";
import { SessionInfo as SessionInfoData, type SessionInfo as SessionInfoSchema } from "./Schema/Service.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import type { SessionError, SessionHandle } from "./Session.js";
import { SessionManager, type SessionManagerError } from "./SessionManager.js";

const $I = $AiSdkId.create("core/SessionPool");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionPoolCloseReason = "manual" | "idle" | "shutdown";

/**
 * @since 0.0.0
 * @category Configuration
 */
export type SessionPoolOptions = {
  readonly model: string;
  readonly sessionOptions?: Omit<SDKSessionOptions, "model">;
  readonly maxSessions?: number;
  readonly idleTimeout?: Duration.Input;
  readonly onSessionCreated?: (sessionId: string, tenant?: string) => Effect.Effect<void>;
  readonly onSessionClosed?: (
    sessionId: string,
    reason: SessionPoolCloseReason,
    tenant?: string
  ) => Effect.Effect<void>;
};

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionPoolFullError extends TaggedErrorClass<SessionPoolFullError>()("SessionPoolFullError", {
  message: S.String,
  maxSessions: S.Number,
}) {
  static readonly make = (params: Pick<SessionPoolFullError, "message" | "maxSessions">) =>
    new SessionPoolFullError(params);
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionPoolNotFoundError extends TaggedErrorClass<SessionPoolNotFoundError>()("SessionPoolNotFoundError", {
  message: S.String,
  sessionId: S.String,
}) {
  static readonly make = (params: Pick<SessionPoolNotFoundError, "message" | "sessionId">) =>
    new SessionPoolNotFoundError(params);
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionPoolInvalidTenantError extends TaggedErrorClass<SessionPoolInvalidTenantError>()(
  "SessionPoolInvalidTenantError",
  {
    message: S.String,
    tenant: S.String,
  }
) {
  static readonly make = (params: Pick<SessionPoolInvalidTenantError, "message" | "tenant">) =>
    new SessionPoolInvalidTenantError(params);
}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const SessionPoolError = S.Union([
  SessionPoolFullError,
  SessionPoolNotFoundError,
  SessionPoolInvalidTenantError,
]);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionPoolError = typeof SessionPoolError.Type;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionPoolErrorEncoded = typeof SessionPoolError.Encoded;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionInfo = SessionInfoSchema;

type SessionEntry = {
  readonly sessionId: string;
  readonly tenant?: string;
  readonly handle: SessionHandle;
  readonly scope: Scope.Closeable;
  readonly createdAt: number;
  readonly lastUsedAt: number;
};

const tenantPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const defaultTenantScope = "__default__";

const resolveTenant = (tenant: string | undefined): Effect.Effect<string | undefined, SessionPoolInvalidTenantError> =>
  tenant === undefined || tenantPattern.test(tenant)
    ? Effect.succeed(tenant)
    : Effect.fail(
        SessionPoolInvalidTenantError.make({
          message: "Invalid tenant format. Expected /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.",
          tenant,
        })
      );

const sessionKey = (sessionId: string, tenant: string | undefined) =>
  `${tenant ?? defaultTenantScope}\u0000${sessionId}`;

const toInfo = (entry: SessionEntry): SessionInfo =>
  new SessionInfoData({
    sessionId: entry.sessionId,
    ...(entry.tenant !== undefined ? { tenant: entry.tenant } : {}),
    createdAt: utcFromMillis(entry.createdAt),
    lastUsedAt: utcFromMillis(entry.lastUsedAt),
  });

const resolveOptions = (options: SessionPoolOptions, overrides?: Partial<SDKSessionOptions>): SDKSessionOptions => ({
  model: options.model,
  ...options.sessionOptions,
  ...overrides,
});

const makeSessionPool = (options: SessionPoolOptions) =>
  Effect.gen(function* () {
    const manager = yield* SessionManager;
    const maxSessions = options.maxSessions ?? 100;
    const idleTimeout = options.idleTimeout === undefined ? undefined : Duration.fromInput(options.idleTimeout);
    const idleTimeoutMs = idleTimeout === undefined ? undefined : Duration.toMillis(idleTimeout);
    const sessionsRef = yield* Ref.make(MutableHashMap.empty<string, SessionEntry>());
    const lock = yield* Semaphore.make(1);

    const withLock = <A, E, R>(effect: Effect.Effect<A, E, R>) => lock.withPermits(1)(effect);

    const touchResolved = (sessionId: string, tenant: string | undefined) =>
      withLock(
        Effect.gen(function* () {
          const now = yield* Clock.currentTimeMillis;
          const sessions = yield* Ref.get(sessionsRef);
          const key = sessionKey(sessionId, tenant);
          const entry = MutableHashMap.get(sessions, key);
          if (O.isNone(entry)) {
            return;
          }
          MutableHashMap.set(sessions, key, { ...entry.value, lastUsedAt: now });
        })
      );

    const touch = (sessionId: string, tenant?: string) =>
      resolveTenant(tenant).pipe(Effect.flatMap((resolvedTenant) => touchResolved(sessionId, resolvedTenant)));

    const closeEntryResolved = (
      sessionId: string,
      reason: SessionPoolCloseReason,
      tenant: string | undefined
    ): Effect.Effect<void, SessionError | SessionPoolNotFoundError> =>
      withLock(
        Effect.gen(function* () {
          const sessions = yield* Ref.get(sessionsRef);
          const key = sessionKey(sessionId, tenant);
          const entry = MutableHashMap.get(sessions, key);
          if (O.isNone(entry)) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId,
            });
          }

          MutableHashMap.remove(sessions, key);
          yield* Scope.close(entry.value.scope, Exit.succeed(undefined));

          if (options.onSessionClosed) {
            yield* options.onSessionClosed(sessionId, reason, tenant);
          }
        })
      );

    const closeEntry = (
      sessionId: string,
      reason: SessionPoolCloseReason,
      tenant?: string
    ): Effect.Effect<void, SessionError | SessionPoolNotFoundError | SessionPoolInvalidTenantError> =>
      resolveTenant(tenant).pipe(
        Effect.flatMap((resolvedTenant) => closeEntryResolved(sessionId, reason, resolvedTenant))
      );

    const ensureCapacity = withLock(
      Effect.gen(function* () {
        const sessions = yield* Ref.get(sessionsRef);
        if (MutableHashMap.size(sessions) < maxSessions) {
          return;
        }
        return yield* SessionPoolFullError.make({
          message: "Session pool capacity exceeded",
          maxSessions,
        });
      })
    );

    const wrapHandle = (entry: SessionEntry): SessionHandle => ({
      sessionId: entry.handle.sessionId,
      send: (message) =>
        entry.handle.send(message).pipe(Effect.tap(() => touchResolved(entry.sessionId, entry.tenant))),
      stream: entry.handle.stream.pipe(Stream.tap(() => touchResolved(entry.sessionId, entry.tenant))),
      close: closeEntryResolved(entry.sessionId, "manual", entry.tenant).pipe(
        Effect.catchTag("SessionPoolNotFoundError", () => Effect.void)
      ),
    });

    const storeEntry = (key: string, entry: SessionEntry) =>
      withLock(
        Effect.gen(function* () {
          const sessions = yield* Ref.get(sessionsRef);
          MutableHashMap.set(sessions, key, entry);
          if (options.onSessionCreated) {
            yield* options.onSessionCreated(entry.sessionId, entry.tenant);
          }
        })
      );

    const create = Effect.fn("SessionPool.create")(function* (overrides?: Partial<SDKSessionOptions>, tenant?: string) {
      const resolvedTenant = yield* resolveTenant(tenant);
      yield* ensureCapacity;

      const scope = yield* Scope.make();
      const handle = yield* manager.create(resolveOptions(options, overrides)).pipe(Scope.provide(scope));

      const sessionId = yield* handle.sessionId;
      const now = yield* Clock.currentTimeMillis;
      const entry: SessionEntry = {
        sessionId,
        ...(resolvedTenant !== undefined ? { tenant: resolvedTenant } : {}),
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now,
      };

      yield* storeEntry(sessionKey(sessionId, resolvedTenant), entry);
      return wrapHandle(entry);
    });

    const get = Effect.fn("SessionPool.get")(function* (
      sessionId: string,
      overrides?: Partial<SDKSessionOptions>,
      tenant?: string
    ) {
      const resolvedTenant = yield* resolveTenant(tenant);
      const key = sessionKey(sessionId, resolvedTenant);
      const existing = yield* withLock(
        Ref.get(sessionsRef).pipe(Effect.map((sessions) => O.getOrUndefined(MutableHashMap.get(sessions, key))))
      );

      if (existing !== undefined) {
        yield* touch(sessionId, resolvedTenant);
        return wrapHandle(existing);
      }

      yield* ensureCapacity;
      const scope = yield* Scope.make();
      const handle = yield* manager.resume(sessionId, resolveOptions(options, overrides)).pipe(Scope.provide(scope));

      const now = yield* Clock.currentTimeMillis;
      const entry: SessionEntry = {
        sessionId,
        ...(resolvedTenant !== undefined ? { tenant: resolvedTenant } : {}),
        handle,
        scope,
        createdAt: now,
        lastUsedAt: now,
      };

      yield* storeEntry(key, entry);
      return wrapHandle(entry);
    });

    const listByTenant = Effect.fn("SessionPool.listByTenant")(function* (tenant?: string) {
      const resolvedTenant = yield* resolveTenant(tenant);
      return yield* withLock(
        Ref.get(sessionsRef).pipe(
          Effect.map((sessions) =>
            [...MutableHashMap.values(sessions)].filter((entry) => entry.tenant === resolvedTenant).map(toInfo)
          )
        )
      );
    });

    const list = listByTenant(undefined);

    const info = Effect.fn("SessionPool.info")(function* (sessionId: string, tenant?: string) {
      const resolvedTenant = yield* resolveTenant(tenant);
      return yield* withLock(
        Effect.gen(function* () {
          const sessions = yield* Ref.get(sessionsRef);
          const entry = MutableHashMap.get(sessions, sessionKey(sessionId, resolvedTenant));
          if (O.isNone(entry)) {
            return yield* SessionPoolNotFoundError.make({
              message: "Session not found",
              sessionId,
            });
          }
          return toInfo(entry.value);
        })
      );
    });

    const close = Effect.fn("SessionPool.close")(function* (sessionId: string, tenant?: string) {
      return yield* closeEntry(sessionId, "manual", tenant);
    });

    const closeAll = withLock(
      Effect.gen(function* () {
        const sessions = yield* Ref.get(sessionsRef);
        const entries = [...sessions];
        MutableHashMap.clear(sessions);

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
        );
      })
    );

    const withSession = Effect.fn("SessionPool.withSession")(
      <A, E, R>(sessionId: string, use: (handle: SessionHandle) => Effect.Effect<A, E, R>, tenant?: string) =>
        get(sessionId, undefined, tenant).pipe(Effect.flatMap(use))
    );

    if (idleTimeoutMs !== undefined && idleTimeoutMs > 0) {
      const interval = Duration.millis(Math.max(1000, Math.floor(idleTimeoutMs / 2)));

      yield* Effect.forkScoped(
        Effect.repeat(
          withLock(
            Effect.gen(function* () {
              const sessions = yield* Ref.get(sessionsRef);
              if (MutableHashMap.size(sessions) === 0) {
                return;
              }

              const now = yield* Clock.currentTimeMillis;
              const stale: Array<[string, SessionEntry]> = [];
              for (const [key, entry] of sessions) {
                if (now - entry.lastUsedAt >= idleTimeoutMs) {
                  stale.push([key, entry]);
                }
              }

              if (stale.length === 0) {
                return;
              }

              for (const [key, entry] of stale) {
                MutableHashMap.remove(sessions, key);
                yield* Scope.close(entry.scope, Exit.succeed(undefined));
                if (options.onSessionClosed) {
                  yield* options.onSessionClosed(entry.sessionId, "idle", entry.tenant);
                }
              }
            })
          ),
          Schedule.spaced(interval)
        )
      );
    }

    yield* Effect.addFinalizer(() => closeAll.pipe(Effect.ignore));

    return SessionPool.of({
      create,
      get,
      info,
      list,
      listByTenant,
      close,
      closeAll,
      withSession,
    });
  });

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface SessionPoolShape {
  readonly close: (sessionId: string, tenant?: string) => Effect.Effect<void, SessionError | SessionPoolError>;
  readonly closeAll: Effect.Effect<void, SessionError>;
  readonly create: (
    overrides?: Partial<SDKSessionOptions>,
    tenant?: string
  ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>;
  readonly get: (
    sessionId: string,
    overrides?: Partial<SDKSessionOptions>,
    tenant?: string
  ) => Effect.Effect<SessionHandle, SessionManagerError | SessionPoolError>;
  readonly info: (sessionId: string, tenant?: string) => Effect.Effect<SessionInfo, SessionPoolError>;
  readonly list: Effect.Effect<ReadonlyArray<SessionInfo>, SessionPoolError>;
  readonly listByTenant: (tenant?: string) => Effect.Effect<ReadonlyArray<SessionInfo>, SessionPoolError>;
  readonly withSession: <A, E, R>(
    sessionId: string,
    use: (handle: SessionHandle) => Effect.Effect<A, E, R>,
    tenant?: string
  ) => Effect.Effect<A, E | SessionManagerError | SessionPoolError, R>;
}

/**
 * @since 0.0.0
 * @category PortContract
 */
export class SessionPool extends ServiceMap.Service<SessionPool, SessionPoolShape>()($I`SessionPool`) {
  static readonly layer = (options: SessionPoolOptions) =>
    Layer.effect(SessionPool, Effect.scoped(makeSessionPool(options)));

  static readonly make = (options: SessionPoolOptions) => Effect.scoped(makeSessionPool(options));
}
