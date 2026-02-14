import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { SDKResultSuccess, SDKUserMessage } from "./Message.js"
import { Options } from "./Options.js"
import { SDKSessionOptions } from "./Session.js"

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

export const SessionCreateInput = withIdentifier(
  Schema.Struct({
    options: SDKSessionOptions
  }),
  "SessionCreateInput"
)

export type SessionCreateInput = typeof SessionCreateInput.Type
export type SessionCreateInputEncoded = typeof SessionCreateInput.Encoded

export const SessionCreateOutput = withIdentifier(
  Schema.Struct({
    sessionId: Schema.String
  }),
  "SessionCreateOutput"
)

export type SessionCreateOutput = typeof SessionCreateOutput.Type
export type SessionCreateOutputEncoded = typeof SessionCreateOutput.Encoded

export const SessionSendInput = withIdentifier(
  Schema.Struct({
    message: Schema.Union(Schema.String, SDKUserMessage)
  }),
  "SessionSendInput"
)

export type SessionSendInput = typeof SessionSendInput.Type
export type SessionSendInputEncoded = typeof SessionSendInput.Encoded

export const SessionInfo = withIdentifier(
  Schema.Struct({
    sessionId: Schema.String,
    createdAt: Schema.Number,
    lastUsedAt: Schema.Number
  }),
  "SessionInfo"
)

export type SessionInfo = typeof SessionInfo.Type
export type SessionInfoEncoded = typeof SessionInfo.Encoded
