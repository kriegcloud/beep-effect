import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Common");
/**
 * @since 0.0.0
 * @category Validation
 */
export const UUID = S.String.check(S.isUUID(4)).annotate(
  $I.annote("UUID", {
    description:
      "A Universally Unique Identifier (UUID) is a 128-bit number used to uniquely identify information in computer systems.",
  })
);
/**
 * @since 0.0.0
 * @category Validation
 */
export type UUID = typeof UUID.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type UUIDEncoded = typeof UUID.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ApiKeySource = S.String.annotate(
  $I.annote("ApiKeySource", {
    description: "Origin label for the API key currently backing the SDK session.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type ApiKeySource = typeof ApiKeySource.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ApiKeySourceEncoded = typeof ApiKeySource.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SdkBeta = S.Literal("context-1m-2025-08-07").annotate(
  $I.annote("SdkBeta", {
    description: "Supported SDK beta flag string accepted by upstream requests.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SdkBeta = typeof SdkBeta.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SdkBetaEncoded = typeof SdkBeta.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ExitReason = LiteralKit([
  "clear",
  "logout",
  "prompt_input_exit",
  "other",
  "bypass_permissions_disabled",
]).annotate(
  $I.annote("ExitReason", {
    description: "Enumerated reasons a session or prompt loop exited.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type ExitReason = typeof ExitReason.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ExitReasonEncoded = typeof ExitReason.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class SlashCommand extends S.Class<SlashCommand>($I`SlashCommand`)(
  {
    name: S.String,
    description: S.String,
    argumentHint: S.String,
  },
  $I.annote("SlashCommand", {
    description: "Slash command metadata exposed to clients for invocation and argument hints.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type SlashCommandEncoded = typeof SlashCommand.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class ModelInfo extends S.Class<ModelInfo>($I`ModelInfo`)(
  {
    value: S.String,
    displayName: S.String,
    description: S.String,
  },
  $I.annote("ModelInfo", {
    description: "Display metadata for a selectable model option.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type ModelInfoEncoded = typeof ModelInfo.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class ModelUsage extends S.Class<ModelUsage>($I`ModelUsage`)(
  {
    inputTokens: S.Number,
    outputTokens: S.Number,
    cacheReadInputTokens: S.Number,
    cacheCreationInputTokens: S.Number,
    webSearchRequests: S.Number,
    costUSD: S.Number,
    contextWindow: S.Number,
    maxOutputTokens: S.Number,
  },
  $I.annote("ModelUsage", {
    description: "Normalized token, cost, and context accounting for a model invocation.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type ModelUsageEncoded = typeof ModelUsage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const NonNullableUsage = S.Record(S.String, S.Unknown).annotate(
  $I.annote("NonNullableUsage", {
    description: "Opaque usage payload after nullish values have been stripped.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type NonNullableUsage = typeof NonNullableUsage.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type NonNullableUsageEncoded = typeof NonNullableUsage.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class AccountInfo extends S.Class<AccountInfo>($I`AccountInfo`)(
  {
    email: S.optional(S.String),
    organization: S.optional(S.String),
    subscriptionType: S.optional(S.String),
    tokenSource: S.optional(S.String),
    apiKeySource: S.optional(S.String),
  },
  $I.annote("AccountInfo", {
    description: "Account metadata surfaced for the authenticated SDK user.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type AccountInfoEncoded = typeof AccountInfo.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class SDKPermissionDenial extends S.Class<SDKPermissionDenial>($I`SDKPermissionDenial`)(
  {
    tool_name: S.String,
    tool_use_id: S.String,
    tool_input: S.Record(S.String, S.Unknown),
  },
  $I.annote("SDKPermissionDenial", {
    description: "Permission denial payload captured when a tool invocation is blocked.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKPermissionDenialEncoded = typeof SDKPermissionDenial.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class RewindFilesResult extends S.Class<RewindFilesResult>($I`RewindFilesResult`)(
  {
    canRewind: S.Boolean,
    error: S.optional(S.String),
    filesChanged: S.optional(S.Array(S.String)),
    insertions: S.optional(S.Number),
    deletions: S.optional(S.Number),
  },
  $I.annote("RewindFilesResult", {
    description: "Result summary for rewinding workspace file edits.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type RewindFilesResultEncoded = typeof RewindFilesResult.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class SdkPluginConfig extends S.Class<SdkPluginConfig>($I`SdkPluginConfig`)(
  {
    type: S.Literal("local"),
    path: FilePath,
  },
  $I.annote("SdkPluginConfig", {
    description: "Configuration for loading a local SDK plugin from disk.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type SdkPluginConfigEncoded = typeof SdkPluginConfig.Encoded;
