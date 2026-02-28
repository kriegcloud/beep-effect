import * as S from "effect/Schema";

import { withIdentifier } from "./Annotations.js";

export const UUID = withIdentifier(S.String.check(S.isUUID(4)), "UUID");
export type UUID = typeof UUID.Type;
export type UUIDEncoded = typeof UUID.Encoded;

export const ApiKeySource = withIdentifier(S.String, "ApiKeySource");

export type ApiKeySource = typeof ApiKeySource.Type;
export type ApiKeySourceEncoded = typeof ApiKeySource.Encoded;

export const SdkBeta = withIdentifier(S.Literal("context-1m-2025-08-07"), "SdkBeta");

export type SdkBeta = typeof SdkBeta.Type;
export type SdkBetaEncoded = typeof SdkBeta.Encoded;

export const ExitReason = withIdentifier(
  S.Literals(["clear", "logout", "prompt_input_exit", "other", "bypass_permissions_disabled"]),
  "ExitReason"
);

export type ExitReason = typeof ExitReason.Type;
export type ExitReasonEncoded = typeof ExitReason.Encoded;

export const SlashCommand = withIdentifier(
  S.Struct({
    name: S.String,
    description: S.String,
    argumentHint: S.String,
  }),
  "SlashCommand"
);

export type SlashCommand = typeof SlashCommand.Type;
export type SlashCommandEncoded = typeof SlashCommand.Encoded;

export const ModelInfo = withIdentifier(
  S.Struct({
    value: S.String,
    displayName: S.String,
    description: S.String,
  }),
  "ModelInfo"
);

export type ModelInfo = typeof ModelInfo.Type;
export type ModelInfoEncoded = typeof ModelInfo.Encoded;

export const ModelUsage = withIdentifier(
  S.Struct({
    inputTokens: S.Number,
    outputTokens: S.Number,
    cacheReadInputTokens: S.Number,
    cacheCreationInputTokens: S.Number,
    webSearchRequests: S.Number,
    costUSD: S.Number,
    contextWindow: S.Number,
    maxOutputTokens: S.Number,
  }),
  "ModelUsage"
);

export type ModelUsage = typeof ModelUsage.Type;
export type ModelUsageEncoded = typeof ModelUsage.Encoded;

export const NonNullableUsage = withIdentifier(S.Record(S.String, S.Unknown), "NonNullableUsage");

export type NonNullableUsage = typeof NonNullableUsage.Type;
export type NonNullableUsageEncoded = typeof NonNullableUsage.Encoded;

export const AccountInfo = withIdentifier(
  S.Struct({
    email: S.optional(S.String),
    organization: S.optional(S.String),
    subscriptionType: S.optional(S.String),
    tokenSource: S.optional(S.String),
    apiKeySource: S.optional(S.String),
  }),
  "AccountInfo"
);

export type AccountInfo = typeof AccountInfo.Type;
export type AccountInfoEncoded = typeof AccountInfo.Encoded;

export const SDKPermissionDenial = withIdentifier(
  S.Struct({
    tool_name: S.String,
    tool_use_id: S.String,
    tool_input: S.Record(S.String, S.Unknown),
  }),
  "SDKPermissionDenial"
);

export type SDKPermissionDenial = typeof SDKPermissionDenial.Type;
export type SDKPermissionDenialEncoded = typeof SDKPermissionDenial.Encoded;

export const RewindFilesResult = withIdentifier(
  S.Struct({
    canRewind: S.Boolean,
    error: S.optional(S.String),
    filesChanged: S.optional(S.Array(S.String)),
    insertions: S.optional(S.Number),
    deletions: S.optional(S.Number),
  }),
  "RewindFilesResult"
);

export type RewindFilesResult = typeof RewindFilesResult.Type;
export type RewindFilesResultEncoded = typeof RewindFilesResult.Encoded;

export const SdkPluginConfig = withIdentifier(
  S.Struct({
    type: S.Literal("local"),
    path: S.String,
  }),
  "SdkPluginConfig"
);

export type SdkPluginConfig = typeof SdkPluginConfig.Type;
export type SdkPluginConfigEncoded = typeof SdkPluginConfig.Encoded;
