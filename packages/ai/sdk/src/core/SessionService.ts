import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap, type Stream } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { makeSessionTurnDriver } from "./internal/sessionTurnDriver.js";
import type { SDKMessage, SDKUserMessage } from "./Schema/Message.js";
import type { SDKSessionOptions } from "./Schema/Session.js";
import type { ChatEventSource } from "./Schema/Storage.js";
import type { SessionError, SessionHandle } from "./Session.js";
import { resolveTurnTimeouts, SessionConfig } from "./SessionConfig.js";
import { SessionManager } from "./SessionManager.js";
import { ChatHistoryStore } from "./Storage/index.js";

const $I = $AiSdkId.create("core/SessionService");

/**
 * @since 0.0.0
 */
export type SessionHistoryOptions = {
  readonly source?: ChatEventSource;
  readonly inputSource?: ChatEventSource;
  readonly recordInput?: boolean;
  readonly recordOutput?: boolean;
};

const defaultOutputSource: ChatEventSource = "sdk";
const defaultInputSource: ChatEventSource = "external";

type SessionConfigService = ServiceMap.Service.Shape<typeof SessionConfig>;

const resolveRuntimeTimeouts = Effect.serviceOption(SessionConfig).pipe(
  Effect.map((configOption: O.Option<SessionConfigService>) =>
    O.isNone(configOption) ? undefined : resolveTurnTimeouts(configOption.value.runtime)
  )
);

/**
 * @since 0.0.0
 */
export interface SessionServiceShape {
  readonly handle: SessionHandle;
  readonly sessionId: Effect.Effect<string, SessionError>;
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>;
  readonly turn: (message: string | SDKUserMessage) => Stream.Stream<SDKMessage, SessionError>;
  readonly stream: Stream.Stream<SDKMessage, SessionError>;
  readonly close: Effect.Effect<void, SessionError>;
}

/**
 * @since 0.0.0
 */
export class SessionService extends ServiceMap.Service<SessionService, SessionServiceShape>()($I`SessionService`) {
  static readonly layer = (options: SDKSessionOptions) =>
    Layer.effect(
      SessionService,
      Effect.gen(function* () {
        const manager = yield* SessionManager;
        const handle = yield* manager.create(options);
        const timeouts = yield* resolveRuntimeTimeouts;
        const driver = yield* makeSessionTurnDriver({
          send: handle.send,
          stream: handle.stream,
          close: handle.close,
          ...(timeouts ? { timeouts } : {}),
        });

        return SessionService.of({
          handle,
          sessionId: handle.sessionId,
          send: driver.sendRaw,
          turn: driver.turn,
          stream: driver.streamRaw,
          close: driver.shutdown.pipe(Effect.andThen(handle.close)),
        });
      })
    );

  static readonly layerDefault = (options: SDKSessionOptions) =>
    SessionService.layer(options).pipe(Layer.provide(SessionManager.layerDefault));

  static readonly layerDefaultFromEnv = (options: SDKSessionOptions, prefix = "AGENTSDK") =>
    SessionService.layer(options).pipe(Layer.provide(SessionManager.layerDefaultFromEnv(prefix)));

  static readonly layerWithHistory = (options: SDKSessionOptions, history?: SessionHistoryOptions) =>
    Layer.effect(
      SessionService,
      Effect.gen(function* () {
        const manager = yield* SessionManager;
        const store = yield* ChatHistoryStore;
        const handle = yield* manager.create(options);
        const timeouts = yield* resolveRuntimeTimeouts;

        const recordOutput = history?.recordOutput ?? true;
        const recordInput = history?.recordInput ?? false;
        const outputSource = history?.source ?? defaultOutputSource;
        const inputSource = history?.inputSource ?? defaultInputSource;

        const recordMessage = (message: SDKMessage, source: ChatEventSource) =>
          store.appendMessage(message.session_id, message, { source }).pipe(
            Effect.asVoid,
            Effect.catchCause(() => Effect.void)
          );

        const recordInputMessage = (message: string | SDKUserMessage) =>
          P.isString(message)
            ? handle.sessionId.pipe(
                Effect.flatMap((resolvedSessionId) =>
                  recordMessage(
                    {
                      type: "user",
                      session_id: resolvedSessionId,
                      message: {
                        role: "user",
                        content: [{ type: "text", text: message }],
                      },
                      parent_tool_use_id: null,
                    },
                    inputSource
                  )
                ),
                Effect.catchCause(() => Effect.void)
              )
            : recordMessage(message, inputSource);

        const send = recordInput
          ? Effect.fn("SessionService.sendWithHistory")((message: string | SDKUserMessage) =>
              handle.send(message).pipe(Effect.tap(() => recordInputMessage(message)))
            )
          : handle.send;

        const onOutputMessage = recordOutput
          ? (message: SDKMessage) => recordMessage(message, outputSource)
          : undefined;

        const driver = yield* makeSessionTurnDriver({
          send,
          stream: handle.stream,
          close: handle.close,
          ...(timeouts ? { timeouts } : {}),
          ...(onOutputMessage ? { onOutputMessage } : {}),
        });

        return SessionService.of({
          handle,
          sessionId: handle.sessionId,
          send: driver.sendRaw,
          turn: driver.turn,
          stream: driver.streamRaw,
          close: driver.shutdown.pipe(Effect.andThen(handle.close)),
        });
      })
    );
}
