import { describe, expect, it } from "@effect/vitest"
import { Effect, Stream } from "effect"
import {
  toFailedTurnEvent,
  toSseEvent,
  withFailedTurnEvent
} from "../src/gateway/TurnStreamTransport.js"

describe("TurnStreamTransport", () => {
  it("toFailedTurnEvent applies mapped known errors", () => {
    const error = {
      _tag: "ChannelNotFound",
      channelId: "channel:missing",
      turnId: "turn:known",
      sessionId: "session:known"
    }

    const event = toFailedTurnEvent(error, {
      fallbackMessage: "Turn processing failed unexpectedly",
      mapKnownError: (unknownError) => {
        if (
          typeof unknownError === "object"
          && unknownError !== null
          && "_tag" in unknownError
          && unknownError._tag === "ChannelNotFound"
        ) {
          return {
            errorCode: "turn_processing_error",
            message: "Channel not found: channel:missing"
          }
        }
        return null
      }
    })

    expect(event).toEqual({
      type: "turn.failed",
      sequence: Number.MAX_SAFE_INTEGER,
      turnId: "turn:known",
      sessionId: "session:known",
      errorCode: "turn_processing_error",
      message: "Channel not found: channel:missing"
    })
  })

  it.effect("withFailedTurnEvent converts stream failure into terminal turn.failed event", () =>
    Effect.gen(function*() {
      const events = yield* withFailedTurnEvent(
        Stream.fail({
          turnId: "turn:failed",
          sessionId: "session:failed",
          reason: "provider_credit_exhausted: credits"
        }),
        { fallbackMessage: "fallback message" }
      ).pipe(Stream.runCollect)

      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({
        type: "turn.failed",
        turnId: "turn:failed",
        sessionId: "session:failed",
        errorCode: "provider_credit_exhausted"
      })
    }))

  it("toSseEvent encodes id and event type from turn event", () => {
    const sse = toSseEvent({
      type: "assistant.delta",
      sequence: 42,
      turnId: "turn:test",
      sessionId: "session:test",
      delta: "hello"
    })

    expect(sse.event).toBe("assistant.delta")
    expect(sse.id).toBe("42")
    expect(sse.data).toContain("\"type\":\"assistant.delta\"")
  })
})
