import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/Permission");

/**
 * @since 0.0.0
 */
export const PermissionMode = LiteralKit([
  "default",
  "acceptEdits",
  "bypassPermissions",
  "plan",
  "delegate",
  "dontAsk",
]).annotate(
  $I.annote("PermissionMode", {
    description: "Supported SDK permission handling modes.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionMode = typeof PermissionMode.Type;
/**
 * @since 0.0.0
 */
export type PermissionModeEncoded = typeof PermissionMode.Encoded;

/**
 * @since 0.0.0
 */
export const PermissionBehavior = LiteralKit(["allow", "deny", "ask"]).annotate(
  $I.annote("PermissionBehavior", {
    description: "Allowed outcomes for tool permission evaluation.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionBehavior = typeof PermissionBehavior.Type;
/**
 * @since 0.0.0
 */
export type PermissionBehaviorEncoded = typeof PermissionBehavior.Encoded;

/**
 * @since 0.0.0
 */
export const PermissionUpdateDestination = LiteralKit([
  "userSettings",
  "projectSettings",
  "localSettings",
  "session",
  "cliArg",
]).annotate(
  $I.annote("PermissionUpdateDestination", {
    description: "Configuration scopes that permission updates can target.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionUpdateDestination = typeof PermissionUpdateDestination.Type;
/**
 * @since 0.0.0
 */
export type PermissionUpdateDestinationEncoded = typeof PermissionUpdateDestination.Encoded;

/**
 * @since 0.0.0
 */
export class PermissionRuleValue extends S.Class<PermissionRuleValue>($I`PermissionRuleValue`)(
  {
    toolName: S.String,
    ruleContent: S.optional(S.String),
  },
  $I.annote("PermissionRuleValue", {
    description: "Single permission rule entry keyed by tool name and optional rule content.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PermissionRuleValueEncoded = typeof PermissionRuleValue.Encoded;

class RulesPayload extends S.Class<RulesPayload>($I`RulesPayload`)(
  {
    rules: S.Array(PermissionRuleValue),
    behavior: PermissionBehavior,
    destination: PermissionUpdateDestination,
  },
  $I.annote("RulesPayload", {
    description: "Shared rule update payload for permission configuration mutations.",
  })
) {}

class PermissionUpdateAddRules extends S.Class<PermissionUpdateAddRules>($I`PermissionUpdateAddRules`)(
  {
    type: S.Literal("addRules"),
    ...RulesPayload.fields,
  },
  $I.annote("PermissionUpdateAddRules", {
    description: "Permission update that appends new rules.",
  })
) {}

class PermissionUpdateReplaceRules extends S.Class<PermissionUpdateReplaceRules>($I`PermissionUpdateReplaceRules`)(
  {
    type: S.Literal("replaceRules"),
    ...RulesPayload.fields,
  },
  $I.annote("PermissionUpdateReplaceRules", {
    description: "Permission update that replaces the current rule set.",
  })
) {}

class PermissionUpdateRemoveRules extends S.Class<PermissionUpdateRemoveRules>($I`PermissionUpdateRemoveRules`)(
  {
    type: S.Literal("removeRules"),
    ...RulesPayload.fields,
  },
  $I.annote("PermissionUpdateRemoveRules", {
    description: "Permission update that removes matching rules.",
  })
) {}

class PermissionUpdateSetMode extends S.Class<PermissionUpdateSetMode>($I`PermissionUpdateSetMode`)(
  {
    type: S.Literal("setMode"),
    mode: PermissionMode,
    destination: PermissionUpdateDestination,
  },
  $I.annote("PermissionUpdateSetMode", {
    description: "Permission update that changes the effective permission mode.",
  })
) {}

class PermissionUpdateAddDirectories extends S.Class<PermissionUpdateAddDirectories>(
  $I`PermissionUpdateAddDirectories`
)(
  {
    type: S.Literal("addDirectories"),
    directories: S.Array(S.String),
    destination: PermissionUpdateDestination,
  },
  $I.annote("PermissionUpdateAddDirectories", {
    description: "Permission update that adds allowed directories.",
  })
) {}

class PermissionUpdateRemoveDirectories extends S.Class<PermissionUpdateRemoveDirectories>(
  $I`PermissionUpdateRemoveDirectories`
)(
  {
    type: S.Literal("removeDirectories"),
    directories: S.Array(S.String),
    destination: PermissionUpdateDestination,
  },
  $I.annote("PermissionUpdateRemoveDirectories", {
    description: "Permission update that removes previously configured directories.",
  })
) {}

/**
 * @since 0.0.0
 */
export const PermissionUpdate = S.Union([
  PermissionUpdateAddRules,
  PermissionUpdateReplaceRules,
  PermissionUpdateRemoveRules,
  PermissionUpdateSetMode,
  PermissionUpdateAddDirectories,
  PermissionUpdateRemoveDirectories,
]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("PermissionUpdate", {
      description: "Tagged union schema for permission update operations.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type PermissionUpdate = typeof PermissionUpdate.Type;
/**
 * @since 0.0.0
 */
export type PermissionUpdateEncoded = typeof PermissionUpdate.Encoded;

/**
 * @since 0.0.0
 */
class PermissionResultAllow extends S.Class<PermissionResultAllow>($I`PermissionResultAllow`)(
  {
    behavior: S.Literal("allow"),
    updatedInput: S.optional(S.Record(S.String, S.Unknown)),
    updatedPermissions: S.optional(S.Array(PermissionUpdate)),
    toolUseID: S.optional(S.String),
  },
  $I.annote("PermissionResultAllow", {
    description: "Permission request outcome that allows tool execution.",
  })
) {}

class PermissionResultDeny extends S.Class<PermissionResultDeny>($I`PermissionResultDeny`)(
  {
    behavior: S.Literal("deny"),
    message: S.String,
    interrupt: S.optional(S.Boolean),
    toolUseID: S.optional(S.String),
  },
  $I.annote("PermissionResultDeny", {
    description: "Permission request outcome that denies tool execution.",
  })
) {}

/**
 * @since 0.0.0
 */
export const PermissionResult = S.Union([PermissionResultAllow, PermissionResultDeny]).pipe(
  S.toTaggedUnion("behavior"),
  S.annotate(
    $I.annote("PermissionResult", {
      description: "Tagged union schema for permission request outcomes.",
    })
  )
);

/**
 * @since 0.0.0
 */
export type PermissionResult = typeof PermissionResult.Type;
/**
 * @since 0.0.0
 */
export type PermissionResultEncoded = typeof PermissionResult.Encoded;

class PermissionRequestHookDecisionAllow extends S.Class<PermissionRequestHookDecisionAllow>(
  $I`PermissionRequestHookDecisionAllow`
)(
  {
    behavior: S.Literal("allow"),
    updatedInput: S.optional(S.Record(S.String, S.Unknown)),
    updatedPermissions: S.optional(S.Array(PermissionUpdate)),
  },
  $I.annote("PermissionRequestHookDecisionAllow", {
    description: "Permission-request hook decision that allows execution and may rewrite input or permissions.",
  })
) {}

class PermissionRequestHookDecisionDeny extends S.Class<PermissionRequestHookDecisionDeny>(
  $I`PermissionRequestHookDecisionDeny`
)(
  {
    behavior: S.Literal("deny"),
    message: S.optional(S.String),
    interrupt: S.optional(S.Boolean),
  },
  $I.annote("PermissionRequestHookDecisionDeny", {
    description: "Permission-request hook decision that denies execution and may include a message or interrupt hint.",
  })
) {}

/**
 * @since 0.0.0
 */
export class PermissionRequestHookSpecificOutput extends S.Class<PermissionRequestHookSpecificOutput>(
  $I`PermissionRequestHookSpecificOutput`
)(
  {
    hookEventName: S.Literal("PermissionRequest"),
    decision: S.Union([PermissionRequestHookDecisionAllow, PermissionRequestHookDecisionDeny]),
  },
  $I.annote("PermissionRequestHookSpecificOutput", {
    description: "Hook-specific response payload for PermissionRequest hooks.",
  })
) {}
/**
 * @since 0.0.0
 */
export type PermissionRequestHookSpecificOutputEncoded = typeof PermissionRequestHookSpecificOutput.Encoded;

/**
 * @since 0.0.0
 */
export const CanUseTool = S.declare(
  (
    _: unknown
  ): _ is (
    toolName: string,
    input: Record<string, unknown>,
    options: {
      signal: AbortSignal;
      suggestions?: PermissionUpdate[];
      blockedPath?: string;
      decisionReason?: string;
      toolUseID: string;
      agentID?: string;
    }
  ) => Promise<PermissionResult> => true
).annotate(
  $I.annote("CanUseTool", {
    description: "Permission callback function that decides whether a tool invocation may proceed.",
    jsonSchema: {},
  })
);

/**
 * @since 0.0.0
 */
export type CanUseTool = typeof CanUseTool.Type;
/**
 * @since 0.0.0
 */
export type CanUseToolEncoded = typeof CanUseTool.Encoded;
