import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import { DecodeError } from "./Errors.js"
import type {
  SDKMessage,
  SDKResultMessage,
  SDKResultSuccess
} from "./Schema/Message.js"

const isResultMessage = (message: SDKMessage): message is SDKResultMessage =>
  message.type === "result"

const isResultSuccess = (message: SDKResultMessage): message is SDKResultSuccess =>
  message.subtype === "success"

export const collectResultMessage = <E>(
  stream: Stream.Stream<SDKMessage, E>
) =>
  stream.pipe(
    Stream.filter(isResultMessage),
    Stream.runLast
  )

export const collectResultSuccess = <E>(
  stream: Stream.Stream<SDKMessage, E>
) =>
  collectResultMessage(stream).pipe(
    Effect.flatMap((result) => {
      if (Option.isNone(result)) {
        return Effect.fail(
          DecodeError.make({
            message: "SDK stream ended without a result message"
          })
        )
      }
      if (isResultSuccess(result.value)) {
        return Effect.succeed(result.value)
      }
      return Effect.fail(
        DecodeError.make({
          message: "SDK stream ended with an error result",
          input: result.value
        })
      )
    })
  )
