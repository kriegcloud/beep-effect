import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Common");
/**
 * @since 0.0.0
 */
export const UUID = S.String.check(S.isUUID(4)).annotate(
  $I.annote("UUID", {
    description:
      "A Universally Unique Identifier (UUID) is a 128-bit number used to uniquely identify information in computer systems.",
  })
);
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
export const ApiKeySource = S.String.annotate(
  $I.annote("ApiKeySource", {
    description: "Schema for ApiKeySource.",
  })
);

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
export const SdkBeta = S.Literal("context-1m-2025-08-07").annotate(
  $I.annote("SdkBeta", {
    description: "Schema for SdkBeta.",
  })
);

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
export const ExitReason = LiteralKit([
  "clear",
  "logout",
  "prompt_input_exit",
  "other",
  "bypass_permissions_disabled",
]).annotate(
  $I.annote("ExitReason", {
    description: "Schema for ExitReason.",
  })
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
export const SlashCommand = S.Struct({
  name: S.String,
  description: S.String,
  argumentHint: S.String,
}).annotate(
  $I.annote("SlashCommand", {
    description: "Schema for SlashCommand.",
  })
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
export const ModelInfo = S.Struct({
  value: S.String,
  displayName: S.String,
  description: S.String,
}).annotate(
  $I.annote("ModelInfo", {
    description: "Schema for ModelInfo.",
  })
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
export const ModelUsage = S.Struct({
  inputTokens: S.Number,
  outputTokens: S.Number,
  cacheReadInputTokens: S.Number,
  cacheCreationInputTokens: S.Number,
  webSearchRequests: S.Number,
  costUSD: S.Number,
  contextWindow: S.Number,
  maxOutputTokens: S.Number,
}).annotate(
  $I.annote("ModelUsage", {
    description: "Schema for ModelUsage.",
  })
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
export const NonNullableUsage = S.Record(S.String, S.Unknown).annotate(
  $I.annote("NonNullableUsage", {
    description: "Schema for NonNullableUsage.",
  })
);

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
export const AccountInfo = S.Struct({
  email: S.optional(S.String),
  organization: S.optional(S.String),
  subscriptionType: S.optional(S.String),
  tokenSource: S.optional(S.String),
  apiKeySource: S.optional(S.String),
}).annotate(
  $I.annote("AccountInfo", {
    description: "Schema for AccountInfo.",
  })
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
export const SDKPermissionDenial = S.Struct({
  tool_name: S.String,
  tool_use_id: S.String,
  tool_input: S.Record(S.String, S.Unknown),
}).annotate(
  $I.annote("SDKPermissionDenial", {
    description: "Schema for SDKPermissionDenial.",
  })
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
export const RewindFilesResult = S.Struct({
  canRewind: S.Boolean,
  error: S.optional(S.String),
  filesChanged: S.optional(S.Array(S.String)),
  insertions: S.optional(S.Number),
  deletions: S.optional(S.Number),
}).annotate(
  $I.annote("RewindFilesResult", {
    description: "Schema for RewindFilesResult.",
  })
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
export const SdkPluginConfig = S.Struct({
  type: S.Literal("local"),
  path: FilePath,
}).annotate(
  $I.annote("SdkPluginConfig", {
    description: "Schema for SdkPluginConfig.",
  })
);

/**
 * @since 0.0.0
 */
export type SdkPluginConfig = typeof SdkPluginConfig.Type;
/**
 * @since 0.0.0
 */
export type SdkPluginConfigEncoded = typeof SdkPluginConfig.Encoded;
