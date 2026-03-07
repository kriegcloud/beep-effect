import type { SDKSession, SDKUserMessage as SdkSDKUserMessage } from "@anthropic-ai/claude-agent-sdk";
import {
  unstable_v2_createSession,
  unstable_v2_prompt,
  unstable_v2_resumeSession,
} from "@anthropic-ai/claude-agent-sdk";
import { TaggedErrorClass } from "@beep/schema";
import { Deferred, Duration, Effect, Exit, Semaphore, Stream, SynchronizedRef } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TransportError } from "./Errors.js";
import { defaultSessionLifecyclePolicy } from "./internal/lifecyclePolicy.js";
import {
  type SDKMessage,
  SDKMessage as SDKMessageSchema,
  type SDKResultMessage,
  type SDKUserMessage,
} from "./Schema/Message.js";
import type { SDKSessionOptions } from "./Schema/Session.js";

/**
 * Raised when a session has been closed and cannot accept new work.
 */
/**
 * @since 0.0.0
 */
export class SessionClosedError extends TaggedErrorClass<SessionClosedError>()("SessionClosedError", {
  message: S.String,
}) {
  static readonly make = (message: string) => new SessionClosedError({ message });
}

/**
 * @since 0.0.0
 */
export const SessionError = S.Union([SessionClosedError, TransportError]);

/**
 * @since 0.0.0
 */
export type SessionError = typeof SessionError.Type;
/**
 * @since 0.0.0
 */
export type SessionErrorEncoded = typeof SessionError.Encoded;

/**
 * Managed session wrapper around the SDK session API.
 */
/**
 * @since 0.0.0
 */
export interface SessionHandle {
  /**
   * Close the session after in-flight sends and streams settle.
   */
  readonly close: Effect.Effect<void, SessionError>;
  /**
   * Send a user message into the session.
   */
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>;
  /**
   * Session id once the init message arrives (or immediately for resumed sessions).
   */
  readonly sessionId: Effect.Effect<string, SessionClosedError>;
  /**
   * Stream session messages (single-use unless shared downstream).
   */
  readonly stream: Stream.Stream<SDKMessage, SessionError>;
}

const toTransportError = (message: string, cause: unknown) => TransportError.make(message, cause);

const sessionClosed = (message: string) => SessionClosedError.make(message);

type SessionPhase = "open" | "closing" | "closed";

type SessionState = {
  readonly phase: SessionPhase;
  readonly inFlightSends: number;
  readonly inFlightStreams: number;
  readonly idleSignal: Deferred.Deferred<void> | null;
  readonly closeSignal: Deferred.Deferred<Exit.Exit<void, SessionError>> | null;
};

/**
 * @since 0.0.0
 */
export type SessionRuntimeOptions = Readonly<{
  readonly closeDrainTimeout?: Duration.Input;
}>;

const fromExit = <A, E>(exit: Exit.Exit<A, E>): Effect.Effect<A, E> =>
  Exit.match(exit, {
    onFailure: Effect.failCause,
    onSuccess: Effect.succeed,
  });

const isIdle = (state: SessionState) => state.inFlightSends === 0 && state.inFlightStreams === 0;

const signalIdleIfNeeded = (state: SessionState) =>
  state.phase === "closing" && isIdle(state) && state.idleSignal
    ? Deferred.succeed(state.idleSignal, undefined).pipe(Effect.asVoid)
    : Effect.void;

const normalizeOptions = (options: SDKSessionOptions): SDKSessionOptions => ({
  model: options.model,
  executable: options.executable ?? "bun",
  ...(options.pathToClaudeCodeExecutable !== undefined
    ? { pathToClaudeCodeExecutable: options.pathToClaudeCodeExecutable }
    : {}),
  ...(options.executableArgs !== undefined ? { executableArgs: [...options.executableArgs] } : {}),
  ...(options.env !== undefined ? { env: options.env } : {}),
  ...(options.canUseTool !== undefined ? { canUseTool: options.canUseTool } : {}),
  ...(options.hooks !== undefined ? { hooks: options.hooks } : {}),
  ...(options.allowedTools !== undefined ? { allowedTools: [...options.allowedTools] } : {}),
  ...(options.disallowedTools !== undefined ? { disallowedTools: [...options.disallowedTools] } : {}),
  ...(options.permissionMode !== undefined ? { permissionMode: options.permissionMode } : {}),
});

const markSessionId = (deferred: Deferred.Deferred<string, SessionClosedError>, message: SDKMessage) =>
  message.type === "system" && message.subtype === "init"
    ? Deferred.succeed(deferred, message.session_id).pipe(Effect.asVoid)
    : Effect.void;

const normalizeUserMessage = (message: SDKUserMessage): SdkSDKUserMessage => {
  const result: Record<string, unknown> = { ...message };
  if (result.isSynthetic === undefined) delete result.isSynthetic;
  if (result.tool_use_result === undefined) delete result.tool_use_result;
  if (result.uuid === undefined) delete result.uuid;
  return result as SdkSDKUserMessage;
};

/**
 * Convert an SDK session into an Effect-managed SessionHandle.
 */
/**
 * @since 0.0.0
 */
export const fromSdkSession = Effect.fn("Session.fromSdkSession")(function* (
  sdkSession: SDKSession,
  runtimeOptions?: SessionRuntimeOptions
) {
  const decodeSdkMessage = S.decodeUnknownEffect(SDKMessageSchema);
  const closeDrainTimeoutInput = runtimeOptions?.closeDrainTimeout ?? defaultSessionLifecyclePolicy.closeDrainTimeout;
  const closeDrainTimeout = Duration.fromInput(closeDrainTimeoutInput);
  if (closeDrainTimeout === undefined) {
    return yield* toTransportError("Invalid session close drain timeout", closeDrainTimeoutInput);
  }

  const stateRef = yield* SynchronizedRef.make<SessionState>({
    phase: "open",
    inFlightSends: 0,
    inFlightStreams: 0,
    idleSignal: null,
    closeSignal: null,
  });
  const sessionIdDeferred = yield* Deferred.make<string, SessionClosedError>();
  const sendSemaphore = yield* Semaphore.make(1);
  const streamSemaphore = yield* Semaphore.make(1);

  const initialSessionId = yield* Effect.sync(() => {
    try {
      return sdkSession.sessionId;
    } catch {
      return undefined;
    }
  });
  if (initialSessionId !== undefined) {
    yield* Deferred.succeed(sessionIdDeferred, initialSessionId);
  }

  const beginSend: Effect.Effect<void, SessionClosedError> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [void, SessionState], SessionClosedError> =>
      state.phase === "open"
        ? Effect.succeed([undefined, { ...state, inFlightSends: state.inFlightSends + 1 }])
        : Effect.fail(sessionClosed("Session is closed"))
  );

  const endSend: Effect.Effect<void> = SynchronizedRef.updateEffect(stateRef, (state) => {
    const next = {
      ...state,
      inFlightSends: Math.max(0, state.inFlightSends - 1),
    };
    return signalIdleIfNeeded(next).pipe(Effect.as(next));
  });

  const beginStream: Effect.Effect<void, SessionClosedError> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [void, SessionState], SessionClosedError> =>
      state.phase === "open"
        ? Effect.succeed([undefined, { ...state, inFlightStreams: state.inFlightStreams + 1 }])
        : Effect.fail(sessionClosed("Session is closed"))
  );

  const endStream: Effect.Effect<void> = SynchronizedRef.updateEffect(stateRef, (state) => {
    const next = {
      ...state,
      inFlightStreams: Math.max(0, state.inFlightStreams - 1),
    };
    return signalIdleIfNeeded(next).pipe(Effect.as(next));
  });

  const send = Effect.fn("Session.send")((message: string | SDKUserMessage) =>
    Effect.acquireUseRelease(
      beginSend,
      () =>
        sendSemaphore.withPermits(1)(
          Effect.tryPromise({
            try: () => sdkSession.send(P.isString(message) ? message : normalizeUserMessage(message)),
            catch: (cause) => toTransportError("Failed to send session message", cause),
          })
        ),
      () => endSend
    )
  );

  const stream = Stream.unwrap(
    Effect.uninterruptibleMask((restore) =>
      Effect.gen(function* () {
        yield* restore(streamSemaphore.take(1));
        yield* beginStream.pipe(Effect.tapError(() => streamSemaphore.release(1)));
        yield* Effect.addFinalizer(() => streamSemaphore.release(1).pipe(Effect.andThen(endStream)));
        const iterable = yield* Effect.try({
          try: () => sdkSession.stream(),
          catch: (cause) => toTransportError("Failed to start session stream", cause),
        });
        return Stream.fromAsyncIterable(iterable, (cause) => toTransportError("Session stream failed", cause)).pipe(
          Stream.mapEffect((message) =>
            decodeSdkMessage(message).pipe(
              Effect.mapError((cause) => toTransportError("Failed to decode session stream message", cause))
            )
          ),
          Stream.tap((message) => markSessionId(sessionIdDeferred, message))
        );
      })
    )
  );

  type CloseAction =
    | { readonly _tag: "AlreadyClosed" }
    | {
        readonly _tag: "AwaitClose";
        readonly closeSignal: Deferred.Deferred<Exit.Exit<void, SessionError>>;
      }
    | {
        readonly _tag: "StartClose";
        readonly idleSignal: Deferred.Deferred<void>;
        readonly closeSignal: Deferred.Deferred<Exit.Exit<void, SessionError>>;
        readonly idle: boolean;
      };

  const beginClose: Effect.Effect<CloseAction> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [CloseAction, SessionState]> => {
      if (state.phase === "closed") {
        return Effect.succeed([{ _tag: "AlreadyClosed" }, state]);
      }
      if (state.phase === "closing") {
        return Effect.succeed([{ _tag: "AwaitClose", closeSignal: state.closeSignal! }, state]);
      }
      return Effect.gen(function* () {
        const idleSignal = yield* Deferred.make<void>();
        const closeSignal = yield* Deferred.make<Exit.Exit<void, SessionError>>();
        const idle = isIdle(state);
        return [
          { _tag: "StartClose", idleSignal, closeSignal, idle },
          {
            ...state,
            phase: "closing",
            idleSignal,
            closeSignal,
          },
        ] as const;
      });
    }
  );

  const close: Effect.Effect<void, SessionError> = Effect.gen(function* () {
    const action = yield* beginClose;
    if (action._tag === "AlreadyClosed") {
      yield* Effect.logDebug("Session.close called on already closed session");
      return;
    }
    if (action._tag === "AwaitClose") {
      yield* Effect.logDebug("Session.close waiting for in-progress close");
      const closeExit = yield* Deferred.await(action.closeSignal);
      return yield* fromExit(closeExit);
    }
    yield* Effect.logDebug("Session lifecycle transition: open -> closing");
    yield* Deferred.fail(sessionIdDeferred, sessionClosed("Session closed")).pipe(Effect.ignore);
    const closeExit = yield* Effect.exit(
      Effect.gen(function* () {
        if (action.idle) {
          yield* Deferred.succeed(action.idleSignal, undefined);
        }
        const idleResult = yield* Deferred.await(action.idleSignal).pipe(Effect.timeoutOption(closeDrainTimeout));
        if (O.isNone(idleResult)) {
          yield* Effect.logWarning("Session close timed out waiting for in-flight work. Forcing shutdown.");
        }
        yield* Effect.try({
          try: () => sdkSession.close(),
          catch: (cause) => toTransportError("Failed to close session", cause),
        });
      })
    );
    yield* SynchronizedRef.update(
      stateRef,
      (state): SessionState => ({
        ...state,
        phase: "closed",
        idleSignal: null,
        closeSignal: null,
      })
    );
    yield* Effect.logDebug("Session lifecycle transition: closing -> closed");
    yield* Deferred.succeed(action.closeSignal, closeExit).pipe(Effect.ignore);
    return yield* fromExit(closeExit);
  }).pipe(Effect.withSpan("Session.close"));

  return {
    sessionId: Deferred.await(sessionIdDeferred),
    send,
    stream,
    close,
  } satisfies SessionHandle;
});

const closeQuietly = (handle: SessionHandle) => handle.close.pipe(Effect.catch(() => Effect.void));

const createSessionEffect = Effect.fn("Session.createSession")(function* (
  options: SDKSessionOptions,
  runtimeOptions?: SessionRuntimeOptions
) {
  const resolved = normalizeOptions(options);
  const sdkSession = yield* Effect.try({
    try: () => unstable_v2_createSession(resolved as unknown as Parameters<typeof unstable_v2_createSession>[0]),
    catch: (cause) => toTransportError("Failed to create session", cause),
  });
  return yield* fromSdkSession(sdkSession, runtimeOptions);
});

const resumeSessionEffect = Effect.fn("Session.resumeSession")(function* (
  sessionId: string,
  options: SDKSessionOptions,
  runtimeOptions?: SessionRuntimeOptions
) {
  const resolved = normalizeOptions(options);
  const sdkSession = yield* Effect.try({
    try: () =>
      unstable_v2_resumeSession(sessionId, resolved as unknown as Parameters<typeof unstable_v2_resumeSession>[1]),
    catch: (cause) => toTransportError("Failed to resume session", cause),
  });
  return yield* fromSdkSession(sdkSession, runtimeOptions);
});

/**
 * Create a new SDK session and scope its lifetime to the Effect scope.
 */
/**
 * @since 0.0.0
 */
export const createSession = (options: SDKSessionOptions, runtimeOptions?: SessionRuntimeOptions) =>
  Effect.acquireRelease(createSessionEffect(options, runtimeOptions), closeQuietly);

/**
 * Resume an existing SDK session and scope its lifetime to the Effect scope.
 */
/**
 * @since 0.0.0
 */
export const resumeSession = (sessionId: string, options: SDKSessionOptions, runtimeOptions?: SessionRuntimeOptions) =>
  Effect.acquireRelease(resumeSessionEffect(sessionId, options, runtimeOptions), closeQuietly);

/**
 * Run a one-off prompt using the SDK session API.
 */
/**
 * @since 0.0.0
 */
export const prompt = Effect.fn("Session.prompt")(
  (message: string, options: SDKSessionOptions): Effect.Effect<SDKResultMessage, TransportError> =>
    Effect.tryPromise({
      try: () =>
        unstable_v2_prompt(message, normalizeOptions(options) as unknown as Parameters<typeof unstable_v2_prompt>[1]),
      catch: (cause) => toTransportError("Failed to run session prompt", cause),
    })
);
