import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, type Scope, ServiceMap, type Stream } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { ConfigError } from "./Errors.js";
import { makeSessionTurnDriver } from "./internal/sessionTurnDriver.js";
import type { SDKMessage, SDKResultMessage, SDKUserMessage } from "./Schema/Message.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import {
  createSession,
  prompt,
  resumeSession,
  SessionError,
  type SessionError as SessionErrorType,
  type SessionHandle,
} from "./Session.js";
import {
  resolveTurnTimeouts,
  SessionConfig,
  type SessionDefaults,
  type SessionRuntimeSettings,
} from "./SessionConfig.js";

const $I = $AiSdkId.create("core/SessionManager");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const SessionManagerError = S.Union([SessionError, ConfigError]);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionManagerError = typeof SessionManagerError.Type;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionManagerErrorEncoded = typeof SessionManagerError.Encoded;

const mergeRecord = <T>(
  base: Readonly<Record<string, T>> | undefined,
  override: Readonly<Record<string, T>> | undefined
) => (base === undefined && override === undefined ? undefined : { ...base, ...override });

const mergeDefaults = (defaults: SessionDefaults, options: SDKSessionOptions): SDKSessionOptions => {
  const env = mergeRecord(defaults.env, options.env);
  return {
    ...defaults,
    ...options,
    ...(env === undefined ? {} : { env }),
  };
};

const requireModel = (options: SDKSessionOptions) =>
  P.isString(options.model) && options.model.trim().length > 0
    ? Effect.succeed(options)
    : Effect.fail(
        ConfigError.make({
          message: "Session model is required",
        })
      );

type ManagedSession = {
  readonly handle: SessionHandle;
  readonly sessionId: Effect.Effect<string, SessionErrorType>;
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionErrorType>;
  readonly turn: (message: string | SDKUserMessage) => Stream.Stream<SDKMessage, SessionErrorType>;
  readonly stream: Stream.Stream<SDKMessage, SessionErrorType>;
  readonly close: Effect.Effect<void, SessionErrorType>;
};

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface SessionManagerShape {
  readonly create: (
    options: SDKSessionOptions
  ) => Effect.Effect<SessionHandle, SessionErrorType | ConfigError, Scope.Scope>;
  readonly prompt: (
    message: string,
    options: SDKSessionOptions
  ) => Effect.Effect<SDKResultMessage, SessionErrorType | ConfigError>;
  readonly resume: (
    sessionId: string,
    options: SDKSessionOptions
  ) => Effect.Effect<SessionHandle, SessionErrorType | ConfigError, Scope.Scope>;
  readonly withSession: <A, E, R>(
    options: SDKSessionOptions,
    use: (session: ManagedSession) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | SessionErrorType | ConfigError, R>;
}

const makeSessionServiceWithRuntime = (
  handle: SessionHandle,
  runtime: SessionRuntimeSettings
): Effect.Effect<ManagedSession, never, Scope.Scope> =>
  Effect.gen(function* () {
    const timeouts = resolveTurnTimeouts(runtime);
    const driver = yield* makeSessionTurnDriver({
      send: handle.send,
      stream: handle.stream,
      close: handle.close,
      ...(timeouts === undefined ? {} : { timeouts }),
    });

    return {
      handle,
      sessionId: handle.sessionId,
      send: driver.sendRaw,
      turn: driver.turn,
      stream: driver.streamRaw,
      close: driver.shutdown.pipe(Effect.andThen(handle.close)),
    };
  });

/**
 * @since 0.0.0
 * @category PortContract
 */
export class SessionManager extends ServiceMap.Service<SessionManager, SessionManagerShape>()($I`SessionManager`) {
  static readonly layer = Layer.effect(
    SessionManager,
    Effect.gen(function* () {
      const { defaults, runtime } = yield* SessionConfig;

      const prepareOptions = (options: SDKSessionOptions) => requireModel(mergeDefaults(defaults, options));

      const create = (options: SDKSessionOptions) =>
        Effect.flatMap(prepareOptions(options), (merged) =>
          createSession(merged, {
            closeDrainTimeout: runtime.closeDrainTimeout,
          })
        );

      const resume = (sessionId: string, options: SDKSessionOptions) =>
        Effect.flatMap(prepareOptions(options), (merged) =>
          resumeSession(sessionId, merged, {
            closeDrainTimeout: runtime.closeDrainTimeout,
          })
        );

      const promptMessage = (message: string, options: SDKSessionOptions) =>
        Effect.flatMap(prepareOptions(options), (merged) => prompt(message, merged));

      const withSession = <A, E, R>(
        options: SDKSessionOptions,
        use: (session: ManagedSession) => Effect.Effect<A, E, R>
      ): Effect.Effect<A, E | SessionErrorType | ConfigError, R> =>
        Effect.scoped(
          Effect.gen(function* () {
            const handle = yield* create(options);
            const session = yield* makeSessionServiceWithRuntime(handle, runtime);
            return yield* use(session);
          })
        );

      return SessionManager.of({
        create,
        resume,
        prompt: promptMessage,
        withSession,
      });
    })
  );

  static readonly layerDefault = SessionManager.layer.pipe(Layer.provide(SessionConfig.layer));

  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    SessionManager.layer.pipe(Layer.provide(SessionConfig.layerFromEnv(prefix)));
}
