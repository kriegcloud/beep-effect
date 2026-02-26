import * as Effect from "effect/Effect"
import * as Sink from "effect/Sink"
import * as Stream from "effect/Stream"
import type { SessionError } from "../Session.js"
import type { SDKMessage, SDKUserMessage } from "../Schema/Message.js"

const isTurnTerminalMessage = (message: SDKMessage) =>
  message.type === "result"

const turnBoundarySink = Sink.collectAllUntil(isTurnTerminalMessage)

const takeTurn = (stream: Stream.Stream<SDKMessage, SessionError>) =>
  stream.pipe(
    Stream.transduce(turnBoundarySink),
    Stream.take(1),
    Stream.flattenChunks
  )

export const makeTurnStream = (
  _label: string,
  send: (message: string | SDKUserMessage) => Effect.Effect<void, SessionError>,
  stream: Stream.Stream<SDKMessage, SessionError>
) =>
  Effect.gen(function*() {
    const turnLock = yield* Effect.makeSemaphore(1)

    const turn = (message: string | SDKUserMessage) =>
      Stream.fromEffect(
        Effect.gen(function*() {
          yield* turnLock.take(1)
          yield* Effect.addFinalizer(() => turnLock.release(1))
          yield* send(message)
          return takeTurn(stream)
        })
      )

    return turn
  })
