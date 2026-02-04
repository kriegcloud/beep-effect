import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { SessionManager } from "./SessionManager.js"
import type { SessionHandle, SessionError } from "./Session.js"
import type { SDKMessage, SDKUserMessage } from "./Schema/Message.js"
import type { SDKSessionOptions } from "./Schema/Session.js"
import { ChatEventSource } from "./Schema/Storage.js"
import { ChatHistoryStore } from "./Storage/ChatHistoryStore.js"

export type SessionHistoryOptions = {
  readonly source?: ChatEventSource
  readonly inputSource?: ChatEventSource
  readonly recordInput?: boolean
  readonly recordOutput?: boolean
}

const defaultOutputSource: ChatEventSource = "sdk"
const defaultInputSource: ChatEventSource = "external"

export class SessionService extends Context.Tag("@effect/claude-agent-sdk/SessionService")<
  SessionService,
  {
    readonly handle: SessionHandle
    readonly sessionId: Effect.Effect<string, SessionError>
    readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>
    readonly turn: (message: string | SDKUserMessage) => Stream.Stream<SDKMessage, SessionError>
    readonly stream: Stream.Stream<SDKMessage, SessionError>
    readonly close: Effect.Effect<void, SessionError>
  }
>() {
  /**
   * Build a scoped session service from a SessionManager.
   */
  static readonly layer = (options: SDKSessionOptions) =>
    Layer.scoped(
      SessionService,
      Effect.gen(function*() {
        const manager = yield* SessionManager
        const handle = yield* manager.create(options)
        const turnEffect = Effect.fn("SessionService.turn")(
          (message: string | SDKUserMessage) =>
            handle.send(message).pipe(Effect.as(handle.stream))
        )
        const turn = (message: string | SDKUserMessage) =>
          Stream.unwrap(turnEffect(message))
        return SessionService.of({
          handle,
          sessionId: handle.sessionId,
          send: handle.send,
          turn,
          stream: handle.stream,
          close: handle.close
        })
      })
    )

  /**
   * Convenience layer that wires SessionManager from defaults.
   */
  static readonly layerDefault = (options: SDKSessionOptions) =>
    SessionService.layer(options).pipe(
      Layer.provide(SessionManager.layerDefault)
    )

  /**
   * Convenience layer that reads SessionManager config from env.
   */
  static readonly layerDefaultFromEnv = (options: SDKSessionOptions, prefix = "AGENTSDK") =>
    SessionService.layer(options).pipe(
      Layer.provide(SessionManager.layerDefaultFromEnv(prefix))
    )

  /**
   * Scoped session service that records streamed messages into ChatHistoryStore.
   * Recording is fail-open: storage errors are ignored to keep session flow intact.
   */
  static readonly layerWithHistory = (
    options: SDKSessionOptions,
    history?: SessionHistoryOptions
  ) =>
    Layer.scoped(
      SessionService,
      Effect.gen(function*() {
        const manager = yield* SessionManager
        const store = yield* ChatHistoryStore
        const handle = yield* manager.create(options)

        const recordOutput = history?.recordOutput ?? true
        const recordInput = history?.recordInput ?? false
        const outputSource = history?.source ?? defaultOutputSource
        const inputSource = history?.inputSource ?? defaultInputSource

        const recordMessage = (message: SDKMessage, source: ChatEventSource) =>
          store.appendMessage(message.session_id, message, { source }).pipe(
            Effect.asVoid,
            Effect.catchAll(() => Effect.void)
          )

        const [userStream, recordStream] = recordOutput
          ? yield* Stream.broadcast(handle.stream, 2, 64)
          : [handle.stream, Stream.empty]

        if (recordOutput) {
          yield* Effect.forkScoped(
            Stream.runForEach(recordStream, (message) =>
              recordMessage(message, outputSource)
            )
          )
        }

        const recordInputMessage = (message: string | SDKUserMessage) =>
          typeof message === "string"
            ? handle.sessionId.pipe(
                Effect.flatMap((resolvedSessionId) =>
                  recordMessage(
                    {
                      type: "user",
                      session_id: resolvedSessionId,
                      message: {
                        role: "user",
                        content: [{ type: "text", text: message }]
                      },
                      parent_tool_use_id: null
                    },
                    inputSource
                  )
                ),
                Effect.catchAll(() => Effect.void)
              )
            : recordMessage(message, inputSource)

        const send = recordInput
          ? Effect.fn("SessionService.sendWithHistory")((message: string | SDKUserMessage) =>
              handle.send(message).pipe(Effect.tap(() => recordInputMessage(message)))
            )
          : handle.send
        const turnEffect = Effect.fn("SessionService.turnWithHistory")(
          (message: string | SDKUserMessage) =>
            send(message).pipe(Effect.as(userStream))
        )
        const turn = (message: string | SDKUserMessage) =>
          Stream.unwrap(turnEffect(message))

        return SessionService.of({
          handle,
          sessionId: handle.sessionId,
          send,
          turn,
          stream: userStream,
          close: handle.close
        })
      })
    )
}
