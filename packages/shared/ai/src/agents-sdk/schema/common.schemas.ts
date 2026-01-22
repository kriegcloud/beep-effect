import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { withIdentifier } from "./annotations.schemas";

const $I = $SharedAiId.create("agents-sdk/schema/common.schemas");

const UUID = withIdentifier(S.UUID, "UUID");
export type UUID = typeof UUID.Type;
export type UUIDEncoded = typeof UUID.Encoded;

export class ApiKeySource extends BS.StringLiteralKit("user", "project", "org", "temporary").annotations({
  ...$I.annotations("ApiKeySource", {
    description: "Source of an API key",
  }),
  identifier: "ApiKeySource",
}) {}

export declare namespace ApiKeySource {
  export type Type = typeof ApiKeySource.Type;
  export type Encoded = typeof ApiKeySource.Encoded;
}

export class SdkBeta extends BS.StringLiteralKit("context-1m-2025-08-07").annotations({
  ...$I.annotations("SdkBeta", {
    description: "SDK Beta version",
  }),
  identifier: "SdkBeta",
}) {}

export declare namespace SdkBeta {
  export type Type = typeof SdkBeta.Type;
  export type Encoded = typeof SdkBeta.Encoded;
}

export class ExitReason extends BS.StringLiteralKit(
  "clear",
  "logout",
  "prompt_input_exit",
  "other",
  "bypass_permissions_disabled"
).annotations({
  ...$I.annotations("ExitReason", {
    description: "Exit reason",
  }),
  identifier: "ExitReason",
}) {}

export declare namespace ExitReason {
  export type Type = typeof ExitReason.Type;
  export type Encoded = typeof ExitReason.Encoded;
}

export class SlashCommand extends S.Class<SlashCommand>("SlashCommand")(
  {
    name: S.String,
    description: S.String,
    argumentHint: S.String,
  },
  {
    ...$I.annotations("SlashCommand", {
      description: "Slash command information",
    }),
    identifier: "SlashCommand",
  }
) {}

export declare namespace SlashCommand {
  export type Type = typeof SlashCommand.Type;
  export type Encoded = typeof SlashCommand.Encoded;
}

export class ModelInfo extends S.Class<ModelInfo>("ModelInfo")(
  {
    value: S.String,
    displayName: S.String,
    description: S.String,
  },
  {
    ...$I.annotations("ModelInfo", {
      description: "Model information",
    }),
    identifier: "ModelInfo",
  }
) {}

export declare namespace ModelInfo {
  export type Type = typeof ModelInfo.Type;
  export type Encoded = typeof ModelInfo.Encoded;
}

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
  {
    ...$I.annotations("ModelUsage", {
      description: "Model usage information",
    }),
    identifier: "ModelUsage",
  }
) {}

export declare namespace ModelUsage {
  export type Type = typeof ModelUsage.Type;
  export type Encoded = typeof ModelUsage.Encoded;
}

export const NonNullableUsage = withIdentifier(S.Record({ key: S.String, value: S.Unknown }), "NonNullableUsage");

export type NonNullableUsage = typeof NonNullableUsage.Type;
export type NonNullableUsageEncoded = typeof NonNullableUsage.Encoded;

export class AccountInfo extends S.Class<AccountInfo>("AccountInfo")(
  {
    email: S.optional(S.String),
    organization: S.optional(S.String),
    subscriptionType: S.optional(S.String),
    tokenSource: S.optional(S.String),
    apiKeySource: S.optional(S.String),
  },
  {
    ...$I.annotations("AccountInfo", {
      description: "Account information",
    }),
    identifier: "AccountInfo",
  }
) {}

export declare namespace AccountInfo {
  export type Type = typeof AccountInfo.Type;
  export type Encoded = typeof AccountInfo.Encoded;
}

export class SDKPermissionDenial extends S.Class<SDKPermissionDenial>("SDKPermissionDenial")(
  {
    tool_name: S.String,
    tool_use_id: S.String,
    tool_input: S.Record({ key: S.String, value: S.Unknown }),
  },
  {
    ...$I.annotations("SDKPermissionDenial", {
      description: "SDK permission denial information",
    }),
    identifier: "SDKPermissionDenial",
  }
) {}

export declare namespace SDKPermissionDenial {
  export type Type = typeof SDKPermissionDenial.Type;
  export type Encoded = typeof SDKPermissionDenial.Encoded;
}

export class RewindFilesResult extends S.Class<RewindFilesResult>("RewindFilesResult")(
  {
    canRewind: S.Boolean,
    error: S.optional(S.String),
    filesChanged: S.optional(S.Array(S.String)),
    insertions: S.optional(S.Number),
    deletions: S.optional(S.Number),
  },
  {
    ...$I.annotations("RewindFilesResult", {
      description: "Rewind files result information",
    }),
    identifier: "RewindFilesResult",
  }
) {}

export declare namespace RewindFilesResult {
  export type Type = typeof RewindFilesResult.Type;
  export type Encoded = typeof RewindFilesResult.Encoded;
}

export class SdkPluginConfig extends S.Class<SdkPluginConfig>("SdkPluginConfig")(
  {
    type: S.Literal("local"),
    path: S.String,
  },
  {
    ...$I.annotations("SdkPluginConfig", {
      description: "Claude plugin configuration",
    }),
    identifier: "SdkPluginConfig",
  }
) {}

export declare namespace SdkPluginConfig {
  export type Type = typeof SdkPluginConfig.Type;
  export type Encoded = typeof SdkPluginConfig.Encoded;
}
