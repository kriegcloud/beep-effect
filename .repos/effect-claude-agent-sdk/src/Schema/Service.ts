import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { SDKResultSuccess, SDKUserMessage } from "./Message.js"
import { Options } from "./Options.js"

export const QueryInput = withIdentifier(
  Schema.Struct({
    prompt: Schema.Union(
      Schema.String,
      Schema.Array(SDKUserMessage)
    ),
    options: Schema.optional(Options)
  }),
  "QueryInput"
)

export type QueryInput = typeof QueryInput.Type
export type QueryInputEncoded = typeof QueryInput.Encoded

export const QueryResultOutput = withIdentifier(
  Schema.Struct({
    result: Schema.String,
    metadata: Schema.optional(SDKResultSuccess)
  }),
  "QueryResultOutput"
)

export type QueryResultOutput = typeof QueryResultOutput.Type
export type QueryResultOutputEncoded = typeof QueryResultOutput.Encoded
