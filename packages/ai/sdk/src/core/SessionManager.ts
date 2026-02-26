import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import type * as Scope from "effect/Scope"
import * as ServiceMap from "effect/ServiceMap"
import type * as Stream from "effect/Stream"
import { ConfigError } from "./Errors.js"
import { makeSessionTurnDriver } from "./internal/sessionTurnDriver.js"
import type { SDKMessage, SDKResultMessage, SDKUserMessage } from "./Schema/Message.js"
import type { SDKSessionOptions } from "./Schema/Session.js"
import {
  createSession,
  prompt,
  resumeSession,
  SessionError,
  type SessionError as SessionErrorType,
  type SessionHandle
} from "./Session.js"
import {
  resolveTurnTimeouts,
  SessionConfig,
  type SessionDefaults,
  type SessionRuntimeSettings
} from "./SessionConfig.js"

export const SessionManagerError = Schema.Union([SessionError, ConfigError])

export type SessionManagerError = typeof SessionManagerError.Type
export type SessionManagerErrorEncoded = typeof SessionManagerError.Encoded

const mergeRecord = <T>(
  base: Readonly<Record<string, T>> | undefined,
  override: Readonly<Record<string, T>> | undefined
) => (base || override ? { ...(base ?? {}), ...(override ?? {}) } : undefined)

const mergeDefaults = (
  defaults: SessionDefaults,
  options: SDKSessionOptions
): SDKSessionOptions => {
  const env = mergeRecord(defaults.env, options.env)
  return {
    ...defaults,
    ...options,
    ...(env ? { env } : {})
  }
}

const requireModel = (options: SDKSessionOptions) =>
  typeof options.model === "string" && options.model.trim().length > 0
    ? Effect.succeed(options)
    : Effect.fail(
        ConfigError.make({
          message: "Session model is required"
        })
      )

type ManagedSession = {
  readonly handle: SessionHandle
  readonly sessionId: Effect.Effect<string, SessionErrorType>
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionErrorType>
  readonly turn: (message: string | SDKUserMessage) => Stream.Stream<SDKMessage, SessionErrorType>
  readonly stream: Stream.Stream<SDKMessage, SessionErrorType>
  readonly close: Effect.Effect<void, SessionErrorType>
}

const makeSessionServiceWithRuntime = (
  handle: SessionHandle,
  runtime: SessionRuntimeSettings
): Effect.Effect<ManagedSession, never, Scope.Scope> =>
  Effect.gen(function*() {
    const timeouts = resolveTurnTimeouts(runtime)
    const driver = yield* makeSessionTurnDriver({
      send: handle.send,
      stream: handle.stream,
      close: handle.close,
      ...(timeouts ? { timeouts } : {})
    })

    return {
      handle,
      sessionId: handle.sessionId,
      send: driver.sendRaw,
      turn: driver.turn,
      stream: driver.streamRaw,
      close: driver.shutdown.pipe(Effect.andThen(handle.close))
    }
  })

export class SessionManager extends ServiceMap.Service<
  SessionManager,
  {
    readonly create: (
      options: SDKSessionOptions
    ) => Effect.Effect<SessionHandle, SessionErrorType | ConfigError, Scope.Scope>
    readonly resume: (
      sessionId: string,
      options: SDKSessionOptions
    ) => Effect.Effect<SessionHandle, SessionErrorType | ConfigError, Scope.Scope>
    readonly prompt: (
      message: string,
      options: SDKSessionOptions
    ) => Effect.Effect<SDKResultMessage, SessionErrorType | ConfigError>
    readonly withSession: <A, E, R>(
      options: SDKSessionOptions,
      use: (session: ManagedSession) => Effect.Effect<A, E, R>
    ) => Effect.Effect<A, E | SessionErrorType | ConfigError, R>
  }
>()("@effect/claude-agent-sdk/SessionManager") {
  static readonly layer = Layer.effect(
    SessionManager,
    Effect.gen(function*() {
      const { defaults, runtime } = yield* SessionConfig

      const prepareOptions = Effect.fn("SessionManager.prepareOptions")(
        (options: SDKSessionOptions) =>
          requireModel(mergeDefaults(defaults, options))
      )

      const create = Effect.fn("SessionManager.create")((options: SDKSessionOptions) =>
        prepareOptions(options).pipe(
          Effect.flatMap((merged) =>
            createSession(merged, {
              closeDrainTimeout: runtime.closeDrainTimeout
            })
          )
        )
      )

      const resume = Effect.fn("SessionManager.resume")(
        (sessionId: string, options: SDKSessionOptions) =>
          prepareOptions(options).pipe(
            Effect.flatMap((merged) =>
              resumeSession(sessionId, merged, {
                closeDrainTimeout: runtime.closeDrainTimeout
              })
            )
          )
      )

      const promptMessage = Effect.fn("SessionManager.prompt")(
        (message: string, options: SDKSessionOptions) =>
          prepareOptions(options).pipe(
            Effect.flatMap((merged) => prompt(message, merged))
          )
      )

      const withSession = Effect.fn("SessionManager.withSession")(
        <A, E, R>(
          options: SDKSessionOptions,
          use: (session: ManagedSession) => Effect.Effect<A, E, R>
        ) =>
          Effect.scoped(
            Effect.gen(function*() {
              const handle = yield* create(options)
              const session = yield* makeSessionServiceWithRuntime(handle, runtime)
              return yield* use(session)
            })
          )
      )

      return SessionManager.of({
        create,
        resume,
        prompt: promptMessage,
        withSession
      })
    })
  )

  static readonly layerDefault = SessionManager.layer.pipe(
    Layer.provide(SessionConfig.layer)
  )

  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    SessionManager.layer.pipe(
      Layer.provide(SessionConfig.layerFromEnv(prefix))
    )
}
