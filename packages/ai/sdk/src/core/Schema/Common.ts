import * as S from "effect/Schema";

import { withIdentifier } from "./Annotations.js";

/**
 * @since 0.0.0
 */
export const UUID = withIdentifier(S.String.check(S.isUUID(4)), "UUID");
/**
 * @since 0.0.0
 */
export type UUID = typeof UUID.Type;
/**
 * @since 0.0.0
 */
export type UUIDEncoded = typeof UUID.Encoded;

/**
 * @since 0.0.0
 */
export const ApiKeySource = withIdentifier(S.String, "ApiKeySource");

/**
 * @since 0.0.0
 */
export type ApiKeySource = typeof ApiKeySource.Type;
/**
 * @since 0.0.0
 */
export type ApiKeySourceEncoded = typeof ApiKeySource.Encoded;

/**
 * @since 0.0.0
 */
export const SdkBeta = withIdentifier(S.Literal("context-1m-2025-08-07"), "SdkBeta");

/**
 * @since 0.0.0
 */
export type SdkBeta = typeof SdkBeta.Type;
/**
 * @since 0.0.0
 */
export type SdkBetaEncoded = typeof SdkBeta.Encoded;

/**
 * @since 0.0.0
 */
export const ExitReason = withIdentifier(
  S.Literals(["clear", "logout", "prompt_input_exit", "other", "bypass_permissions_disabled"]),
  "ExitReason"
);

/**
 * @since 0.0.0
 */
export type ExitReason = typeof ExitReason.Type;
/**
 * @since 0.0.0
 */
export type ExitReasonEncoded = typeof ExitReason.Encoded;

/**
 * @since 0.0.0
 */
export const SlashCommand = withIdentifier(
  S.Struct({
    name: S.String,
    description: S.String,
    argumentHint: S.String,
  }),
  "SlashCommand"
);

/**
 * @since 0.0.0
 */
export type SlashCommand = typeof SlashCommand.Type;
/**
 * @since 0.0.0
 */
export type SlashCommandEncoded = typeof SlashCommand.Encoded;

/**
 * @since 0.0.0
 */
export const ModelInfo = withIdentifier(
  S.Struct({
    value: S.String,
    displayName: S.String,
    description: S.String,
  }),
  "ModelInfo"
);

/**
 * @since 0.0.0
 */
export type ModelInfo = typeof ModelInfo.Type;
/**
 * @since 0.0.0
 */
export type ModelInfoEncoded = typeof ModelInfo.Encoded;

/**
 * @since 0.0.0
 */
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

/**
 * @since 0.0.0
 */
export type ModelUsage = typeof ModelUsage.Type;
/**
 * @since 0.0.0
 */
export type ModelUsageEncoded = typeof ModelUsage.Encoded;

/**
 * @since 0.0.0
 */
export const NonNullableUsage = withIdentifier(S.Record(S.String, S.Unknown), "NonNullableUsage");

/**
 * @since 0.0.0
 */
export type NonNullableUsage = typeof NonNullableUsage.Type;
/**
 * @since 0.0.0
 */
export type NonNullableUsageEncoded = typeof NonNullableUsage.Encoded;

/**
 * @since 0.0.0
 */
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

/**
 * @since 0.0.0
 */
export type AccountInfo = typeof AccountInfo.Type;
/**
 * @since 0.0.0
 */
export type AccountInfoEncoded = typeof AccountInfo.Encoded;

/**
 * @since 0.0.0
 */
export const SDKPermissionDenial = withIdentifier(
  S.Struct({
    tool_name: S.String,
    tool_use_id: S.String,
    tool_input: S.Record(S.String, S.Unknown),
  }),
  "SDKPermissionDenial"
);

/**
 * @since 0.0.0
 */
export type SDKPermissionDenial = typeof SDKPermissionDenial.Type;
/**
 * @since 0.0.0
 */
export type SDKPermissionDenialEncoded = typeof SDKPermissionDenial.Encoded;

/**
 * @since 0.0.0
 */
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

/**
 * @since 0.0.0
 */
export type RewindFilesResult = typeof RewindFilesResult.Type;
/**
 * @since 0.0.0
 */
export type RewindFilesResultEncoded = typeof RewindFilesResult.Encoded;

/**
 * @since 0.0.0
 */
export const SdkPluginConfig = withIdentifier(
  S.Struct({
    type: S.Literal("local"),
    path: S.String,
  }),
  "SdkPluginConfig"
);

/**
 * @since 0.0.0
 */
export type SdkPluginConfig = typeof SdkPluginConfig.Type;
/**
 * @since 0.0.0
 */
export type SdkPluginConfigEncoded = typeof SdkPluginConfig.Encoded;
