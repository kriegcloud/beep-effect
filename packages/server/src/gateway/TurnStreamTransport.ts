import type { TurnFailureCode, TurnFailedEvent, TurnStreamEvent } from "@template/domain/events"
import { Stream } from "effect"
import * as Sse from "effect/unstable/encoding/Sse"
import { encodeUnknownJsonSync } from "../json/JsonStringCodecs.js"
import { toTurnFailureCode, toTurnFailureIdentity, toTurnFailureMessage } from "../turn/TurnFailureMapping.js"

export interface FailedTurnEventOptions {
  readonly fallbackMessage: string
  readonly sequence?: number
  readonly defaultTurnId?: string
  readonly defaultSessionId?: string
  readonly mapKnownError?: (
    error: unknown
  ) => { readonly errorCode: TurnFailureCode; readonly message: string } | null
}

export const encodeTurnEventJson = (event: TurnStreamEvent): string =>
  encodeUnknownJsonSync(event)

export const toSseEvent = (event: TurnStreamEvent): Sse.Event => ({
  _tag: "Event",
  event: event.type,
  id: String(event.sequence),
  data: encodeTurnEventJson(event)
})

export const toFailedTurnEvent = (
  error: unknown,
  options: FailedTurnEventOptions
): TurnFailedEvent => {
  const identity = toTurnFailureIdentity(error)
  const known = options.mapKnownError?.(error) ?? null
  const message = known?.message ?? toTurnFailureMessage(error, options.fallbackMessage)
  const errorCode = known?.errorCode ?? toTurnFailureCode(error, message)

  return {
    type: "turn.failed",
    sequence: options.sequence ?? Number.MAX_SAFE_INTEGER,
    turnId: identity.turnId || options.defaultTurnId || "unknown",
    sessionId: identity.sessionId || options.defaultSessionId || "unknown",
    errorCode,
    message
  }
}

export const withFailedTurnEvent = <E, R>(
  stream: Stream.Stream<TurnStreamEvent, E, R>,
  options: FailedTurnEventOptions
): Stream.Stream<TurnStreamEvent, never, R> =>
  stream.pipe(
    Stream.catch((error) => Stream.make(toFailedTurnEvent(error, options)))
  )

export const toSseTextStream = <E, R>(stream: Stream.Stream<TurnStreamEvent, E, R>) =>
  stream.pipe(
    Stream.map(toSseEvent),
    Stream.pipeThroughChannel(Sse.encode()),
    Stream.encodeText
  )
