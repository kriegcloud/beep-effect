import { Option, Schema } from "effect"
import { decodeJsonStringOption } from "../json/JsonStringCodecs.js"

const RecoveredToolErrorPayload = Schema.Struct({
  ok: Schema.Literal(false),
  errorCode: Schema.String,
  message: Schema.String
})
const decodeRecoveredToolErrorPayload = decodeJsonStringOption(RecoveredToolErrorPayload)

export const isRecoveredToolErrorOutput = (outputJson: string): boolean =>
  Option.isSome(decodeRecoveredToolErrorPayload(outputJson))
