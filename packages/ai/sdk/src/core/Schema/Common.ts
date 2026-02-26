import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"

export const UUID = withIdentifier(Schema.UUID, "UUID")
export type UUID = typeof UUID.Type
export type UUIDEncoded = typeof UUID.Encoded

export const ApiKeySource = withIdentifier(
  Schema.String,
  "ApiKeySource"
)

export type ApiKeySource = typeof ApiKeySource.Type
export type ApiKeySourceEncoded = typeof ApiKeySource.Encoded

export const SdkBeta = withIdentifier(
  Schema.Literal("context-1m-2025-08-07"),
  "SdkBeta"
)

export type SdkBeta = typeof SdkBeta.Type
export type SdkBetaEncoded = typeof SdkBeta.Encoded

export const ExitReason = withIdentifier(
  Schema.Literal("clear", "logout", "prompt_input_exit", "other", "bypass_permissions_disabled"),
  "ExitReason"
)

export type ExitReason = typeof ExitReason.Type
export type ExitReasonEncoded = typeof ExitReason.Encoded

export const SlashCommand = withIdentifier(
  Schema.Struct({
    name: Schema.String,
    description: Schema.String,
    argumentHint: Schema.String
  }),
  "SlashCommand"
)

export type SlashCommand = typeof SlashCommand.Type
export type SlashCommandEncoded = typeof SlashCommand.Encoded

export const ModelInfo = withIdentifier(
  Schema.Struct({
    value: Schema.String,
    displayName: Schema.String,
    description: Schema.String
  }),
  "ModelInfo"
)

export type ModelInfo = typeof ModelInfo.Type
export type ModelInfoEncoded = typeof ModelInfo.Encoded

export const ModelUsage = withIdentifier(
  Schema.Struct({
    inputTokens: Schema.Number,
    outputTokens: Schema.Number,
    cacheReadInputTokens: Schema.Number,
    cacheCreationInputTokens: Schema.Number,
    webSearchRequests: Schema.Number,
    costUSD: Schema.Number,
    contextWindow: Schema.Number,
    maxOutputTokens: Schema.Number
  }),
  "ModelUsage"
)

export type ModelUsage = typeof ModelUsage.Type
export type ModelUsageEncoded = typeof ModelUsage.Encoded

export const NonNullableUsage = withIdentifier(
  Schema.Record({ key: Schema.String, value: Schema.Unknown }),
  "NonNullableUsage"
)

export type NonNullableUsage = typeof NonNullableUsage.Type
export type NonNullableUsageEncoded = typeof NonNullableUsage.Encoded

export const AccountInfo = withIdentifier(
  Schema.Struct({
    email: Schema.optional(Schema.String),
    organization: Schema.optional(Schema.String),
    subscriptionType: Schema.optional(Schema.String),
    tokenSource: Schema.optional(Schema.String),
    apiKeySource: Schema.optional(Schema.String)
  }),
  "AccountInfo"
)

export type AccountInfo = typeof AccountInfo.Type
export type AccountInfoEncoded = typeof AccountInfo.Encoded

export const SDKPermissionDenial = withIdentifier(
  Schema.Struct({
    tool_name: Schema.String,
    tool_use_id: Schema.String,
    tool_input: Schema.Record({ key: Schema.String, value: Schema.Unknown })
  }),
  "SDKPermissionDenial"
)

export type SDKPermissionDenial = typeof SDKPermissionDenial.Type
export type SDKPermissionDenialEncoded = typeof SDKPermissionDenial.Encoded

export const RewindFilesResult = withIdentifier(
  Schema.Struct({
    canRewind: Schema.Boolean,
    error: Schema.optional(Schema.String),
    filesChanged: Schema.optional(Schema.Array(Schema.String)),
    insertions: Schema.optional(Schema.Number),
    deletions: Schema.optional(Schema.Number)
  }),
  "RewindFilesResult"
)

export type RewindFilesResult = typeof RewindFilesResult.Type
export type RewindFilesResultEncoded = typeof RewindFilesResult.Encoded

export const SdkPluginConfig = withIdentifier(
  Schema.Struct({
    type: Schema.Literal("local"),
    path: Schema.String
  }),
  "SdkPluginConfig"
)

export type SdkPluginConfig = typeof SdkPluginConfig.Type
export type SdkPluginConfigEncoded = typeof SdkPluginConfig.Encoded
