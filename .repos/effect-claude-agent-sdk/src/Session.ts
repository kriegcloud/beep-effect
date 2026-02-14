import {
  unstable_v2_createSession,
  unstable_v2_prompt,
  unstable_v2_resumeSession
} from "@anthropic-ai/claude-agent-sdk"
import type { SDKSession, SDKUserMessage as SdkSDKUserMessage } from "@anthropic-ai/claude-agent-sdk"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import * as SynchronizedRef from "effect/SynchronizedRef"
import { TransportError } from "./Errors.js"
import type { SDKMessage, SDKResultMessage, SDKUserMessage } from "./Schema/Message.js"
import type { SDKSessionOptions } from "./Schema/Session.js"

/**
 * Raised when a session has been closed and cannot accept new work.
 */
export class SessionClosedError extends Schema.TaggedError<SessionClosedError>()(
  "SessionClosedError",
  {
    message: Schema.String
  }
) {}

export const SessionError = Schema.Union(SessionClosedError, TransportError)

export type SessionError = typeof SessionError.Type
export type SessionErrorEncoded = typeof SessionError.Encoded

/**
 * Managed session wrapper around the SDK session API.
 */
export interface SessionHandle {
  /**
   * Session id once the init message arrives (or immediately for resumed sessions).
   */
  readonly sessionId: Effect.Effect<string, SessionClosedError>
  /**
   * Send a user message into the session.
   */
  readonly send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>
  /**
   * Stream session messages (single-use unless shared downstream).
   */
  readonly stream: Stream.Stream<SDKMessage, SessionError>
  /**
   * Close the session after in-flight sends and streams settle.
   */
  readonly close: Effect.Effect<void, SessionError>
}

const toTransportError = (message: string, cause: unknown) =>
  TransportError.make({
    message,
    cause
  })

const sessionClosed = (message: string) =>
  SessionClosedError.make({
    message
  })

type SessionPhase = "open" | "closing" | "closed"

type SessionState = {
  readonly phase: SessionPhase
  readonly inFlightSends: number
  readonly inFlightStreams: number
  readonly idleSignal: Deferred.Deferred<void, never> | null
  readonly closeSignal: Deferred.Deferred<void, never> | null
}

const isIdle = (state: SessionState) =>
  state.inFlightSends === 0 && state.inFlightStreams === 0

const signalIdleIfNeeded = (state: SessionState) =>
  state.phase === "closing" && isIdle(state) && state.idleSignal
    ? Deferred.succeed(state.idleSignal, undefined).pipe(Effect.asVoid)
    : Effect.void

const normalizeOptions = (options: SDKSessionOptions): SDKSessionOptions => ({
  ...options,
  executable: options.executable ?? "bun"
})

const markSessionId = (
  deferred: Deferred.Deferred<string, SessionClosedError>,
  message: SDKMessage
) =>
  message.type === "system" && message.subtype === "init"
    ? Deferred.succeed(deferred, message.session_id).pipe(Effect.asVoid)
    : Effect.void

const normalizeUserMessage = (message: SDKUserMessage): SdkSDKUserMessage => {
  const result: Record<string, unknown> = { ...message }
  if (result.isSynthetic === undefined) delete result.isSynthetic
  if (result.tool_use_result === undefined) delete result.tool_use_result
  if (result.uuid === undefined) delete result.uuid
  return result as SdkSDKUserMessage
}

/**
 * Convert an SDK session into an Effect-managed SessionHandle.
 */
export const fromSdkSession = Effect.fn("Session.fromSdkSession")(function*(
  sdkSession: SDKSession
) {
  const stateRef = yield* SynchronizedRef.make<SessionState>({
    phase: "open",
    inFlightSends: 0,
    inFlightStreams: 0,
    idleSignal: null,
    closeSignal: null
  })
  const sessionIdDeferred = yield* Deferred.make<string, SessionClosedError>()
  const sendSemaphore = yield* Effect.makeSemaphore(1)
  const streamSemaphore = yield* Effect.makeSemaphore(1)

  const initialSessionId = yield* Effect.sync(() => {
    try {
      return sdkSession.sessionId
    } catch {
      return undefined
    }
  })
  if (initialSessionId !== undefined) {
    yield* Deferred.succeed(sessionIdDeferred, initialSessionId)
  }

  const beginSend: Effect.Effect<void, SessionClosedError> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [void, SessionState], SessionClosedError> =>
      state.phase === "open"
        ? Effect.succeed([
            undefined,
            { ...state, inFlightSends: state.inFlightSends + 1 }
          ])
        : Effect.fail(sessionClosed("Session is closed"))
  )

  const endSend: Effect.Effect<void, never> = SynchronizedRef.updateEffect(
    stateRef,
    (state) => {
      const next = {
        ...state,
        inFlightSends: Math.max(0, state.inFlightSends - 1)
      }
      return signalIdleIfNeeded(next).pipe(Effect.as(next))
    }
  )

  const beginStream: Effect.Effect<void, SessionClosedError> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [void, SessionState], SessionClosedError> =>
      state.phase === "open"
        ? Effect.succeed([
            undefined,
            { ...state, inFlightStreams: state.inFlightStreams + 1 }
          ])
        : Effect.fail(sessionClosed("Session is closed"))
  )

  const endStream: Effect.Effect<void, never> = SynchronizedRef.updateEffect(
    stateRef,
    (state) => {
      const next = {
        ...state,
        inFlightStreams: Math.max(0, state.inFlightStreams - 1)
      }
      return signalIdleIfNeeded(next).pipe(Effect.as(next))
    }
  )

  const send = Effect.fn("Session.send")((message: string | SDKUserMessage) =>
    Effect.acquireUseRelease(
      beginSend,
      () =>
        sendSemaphore.withPermits(1)(
          Effect.tryPromise({
            try: () =>
              sdkSession.send(
                typeof message === "string" ? message : normalizeUserMessage(message)
              ),
            catch: (cause) => toTransportError("Failed to send session message", cause)
          })
        ),
      () => endSend
    )
  )

  const stream = Stream.unwrapScoped(
    Effect.uninterruptibleMask((restore) =>
      Effect.gen(function*() {
        yield* restore(streamSemaphore.take(1))
        yield* beginStream.pipe(
          Effect.tapError(() => streamSemaphore.release(1))
        )
        yield* Effect.addFinalizer(() =>
          streamSemaphore.release(1).pipe(Effect.zipRight(endStream))
        )
        const iterable = yield* Effect.try({
          try: () => sdkSession.stream(),
          catch: (cause) => toTransportError("Failed to start session stream", cause)
        })
        return Stream.fromAsyncIterable(iterable, (cause) =>
          toTransportError("Session stream failed", cause)
        ).pipe(Stream.tap((message) => markSessionId(sessionIdDeferred, message)))
      })
    )
  )

  type CloseAction =
    | { readonly _tag: "AlreadyClosed" }
    | { readonly _tag: "AwaitClose"; readonly closeSignal: Deferred.Deferred<void, never> }
    | {
        readonly _tag: "StartClose"
        readonly idleSignal: Deferred.Deferred<void, never>
        readonly closeSignal: Deferred.Deferred<void, never>
        readonly idle: boolean
      }

  const beginClose: Effect.Effect<CloseAction, never> = SynchronizedRef.modifyEffect(
    stateRef,
    (state): Effect.Effect<readonly [CloseAction, SessionState], never> => {
      if (state.phase === "closed") {
        return Effect.succeed([
          { _tag: "AlreadyClosed" },
          state
        ])
      }
      if (state.phase === "closing") {
        return Effect.succeed([
          { _tag: "AwaitClose", closeSignal: state.closeSignal! },
          state
        ])
      }
      return Effect.gen(function*() {
        const idleSignal = yield* Deferred.make<void>()
        const closeSignal = yield* Deferred.make<void>()
        const idle = isIdle(state)
        return [
          { _tag: "StartClose", idleSignal, closeSignal, idle },
          {
            ...state,
            phase: "closing",
            idleSignal,
            closeSignal
          }
        ] as const
      })
    }
  )

  const close: Effect.Effect<void, SessionError> = Effect.gen(function*() {
    const action = yield* beginClose
    if (action._tag === "AlreadyClosed") return
    if (action._tag === "AwaitClose") {
      yield* Deferred.await(action.closeSignal)
      return
    }
    yield* Deferred.fail(sessionIdDeferred, sessionClosed("Session closed")).pipe(Effect.ignore)
    if (action.idle) {
      yield* Deferred.succeed(action.idleSignal, undefined)
    }
    yield* Deferred.await(action.idleSignal)
    yield* Effect.try({
      try: () => sdkSession.close(),
      catch: (cause) =>
        toTransportError("Failed to close session", cause)
    })
    yield* Deferred.succeed(action.closeSignal, undefined)
    yield* SynchronizedRef.update(stateRef, (state): SessionState => ({
      ...state,
      phase: "closed",
      idleSignal: null
    }))
  }).pipe(Effect.withSpan("Session.close"))

  return {
    sessionId: Deferred.await(sessionIdDeferred),
    send,
    stream,
    close
  } satisfies SessionHandle
})

const closeQuietly = (handle: SessionHandle) =>
  handle.close.pipe(Effect.catchAll(() => Effect.void))

const createSessionEffect = Effect.fn("Session.createSession")(function*(
  options: SDKSessionOptions
) {
  const resolved = normalizeOptions(options)
  const sdkSession = yield* Effect.try({
    try: () => unstable_v2_createSession(resolved as Parameters<typeof unstable_v2_createSession>[0]),
    catch: (cause) => toTransportError("Failed to create session", cause)
  })
  return yield* fromSdkSession(sdkSession)
})

const resumeSessionEffect = Effect.fn("Session.resumeSession")(function*(
  sessionId: string,
  options: SDKSessionOptions
) {
  const resolved = normalizeOptions(options)
  const sdkSession = yield* Effect.try({
    try: () => unstable_v2_resumeSession(sessionId, resolved as Parameters<typeof unstable_v2_resumeSession>[1]),
    catch: (cause) => toTransportError("Failed to resume session", cause)
  })
  return yield* fromSdkSession(sdkSession)
})

/**
 * Create a new SDK session and scope its lifetime to the Effect scope.
 */
export const createSession = (options: SDKSessionOptions) =>
  Effect.acquireRelease(createSessionEffect(options), closeQuietly)

/**
 * Resume an existing SDK session and scope its lifetime to the Effect scope.
 */
export const resumeSession = (sessionId: string, options: SDKSessionOptions) =>
  Effect.acquireRelease(resumeSessionEffect(sessionId, options), closeQuietly)

/**
 * Run a one-off prompt using the SDK session API.
 */
export const prompt = Effect.fn("Session.prompt")((
  message: string,
  options: SDKSessionOptions
): Effect.Effect<SDKResultMessage, TransportError> =>
  Effect.tryPromise({
    try: () => unstable_v2_prompt(message, normalizeOptions(options) as Parameters<typeof unstable_v2_prompt>[1]),
    catch: (cause) => toTransportError("Failed to run session prompt", cause)
  })
)
