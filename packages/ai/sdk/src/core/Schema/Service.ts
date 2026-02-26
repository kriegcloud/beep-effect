import * as S from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { SDKResultSuccess, SDKUserMessage } from "./Message.js"
import { Options } from "./Options.js"
import { SDKSessionOptions } from "./Session.js"

export const Tenant = withIdentifier(
  S.String,
  "Tenant"
)

export type Tenant = typeof Tenant.Type
export type TenantEncoded = typeof Tenant.Encoded

export const QueryInput = withIdentifier(
  S.Struct({
    prompt: S.Union(
      [S.String,
      S.Array(SDKUserMessage)]
    ),
    options: S.optional(Options)
  }),
  "QueryInput"
)

export type QueryInput = typeof QueryInput.Type
export type QueryInputEncoded = typeof QueryInput.Encoded

export const QueryResultOutput = withIdentifier(
  S.Struct({
    result: S.String,
    metadata: S.optional(SDKResultSuccess)
  }),
  "QueryResultOutput"
)

export type QueryResultOutput = typeof QueryResultOutput.Type
export type QueryResultOutputEncoded = typeof QueryResultOutput.Encoded

export const SessionCreateInput = withIdentifier(
  S.Struct({
    options: SDKSessionOptions,
    tenant: S.optional(Tenant)
  }),
  "SessionCreateInput"
)

export type SessionCreateInput = typeof SessionCreateInput.Type
export type SessionCreateInputEncoded = typeof SessionCreateInput.Encoded

export const SessionCreateOutput = withIdentifier(
  S.Struct({
    sessionId: S.String
  }),
  "SessionCreateOutput"
)

export type SessionCreateOutput = typeof SessionCreateOutput.Type
export type SessionCreateOutputEncoded = typeof SessionCreateOutput.Encoded

export const SessionSendInput = withIdentifier(
  S.Struct({
    message: S.Union([S.String, SDKUserMessage]),
    tenant: S.optional(Tenant)
  }),
  "SessionSendInput"
)

export type SessionSendInput = typeof SessionSendInput.Type
export type SessionSendInputEncoded = typeof SessionSendInput.Encoded

export const SessionInfo = withIdentifier(
  S.Struct({
    sessionId: S.String,
    tenant: S.optional(Tenant),
    createdAt: S.Number,
    lastUsedAt: S.Number
  }),
  "SessionInfo"
)

export type SessionInfo = typeof SessionInfo.Type
export type SessionInfoEncoded = typeof SessionInfo.Encoded
