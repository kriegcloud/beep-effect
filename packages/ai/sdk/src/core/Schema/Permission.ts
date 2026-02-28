import * as S from "effect/Schema";
import { withIdentifier } from "./Annotations.js";

/**
 * @since 0.0.0
 */
export const PermissionMode = withIdentifier(
  S.Literals(["default", "acceptEdits", "bypassPermissions", "plan", "delegate", "dontAsk"]),
  "PermissionMode"
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
export const PermissionBehavior = withIdentifier(S.Literals(["allow", "deny", "ask"]), "PermissionBehavior");

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
export const PermissionUpdateDestination = withIdentifier(
  S.Literals(["userSettings", "projectSettings", "localSettings", "session", "cliArg"]),
  "PermissionUpdateDestination"
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
export const PermissionRuleValue = withIdentifier(
  S.Struct({
    toolName: S.String,
    ruleContent: S.optional(S.String),
  }),
  "PermissionRuleValue"
);

/**
 * @since 0.0.0
 */
export type PermissionRuleValue = typeof PermissionRuleValue.Type;
/**
 * @since 0.0.0
 */
export type PermissionRuleValueEncoded = typeof PermissionRuleValue.Encoded;

const RulesPayload = S.Struct({
  rules: S.Array(PermissionRuleValue),
  behavior: PermissionBehavior,
  destination: PermissionUpdateDestination,
});

/**
 * @since 0.0.0
 */
export const PermissionUpdate = withIdentifier(
  S.Union([
    S.Struct({
      type: S.Literal("addRules"),
      ...RulesPayload.fields,
    }),
    S.Struct({
      type: S.Literal("replaceRules"),
      ...RulesPayload.fields,
    }),
    S.Struct({
      type: S.Literal("removeRules"),
      ...RulesPayload.fields,
    }),
    S.Struct({
      type: S.Literal("setMode"),
      mode: PermissionMode,
      destination: PermissionUpdateDestination,
    }),
    S.Struct({
      type: S.Literal("addDirectories"),
      directories: S.Array(S.String),
      destination: PermissionUpdateDestination,
    }),
    S.Struct({
      type: S.Literal("removeDirectories"),
      directories: S.Array(S.String),
      destination: PermissionUpdateDestination,
    }),
  ]),
  "PermissionUpdate"
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
export const PermissionResult = withIdentifier(
  S.Union([
    S.Struct({
      behavior: S.Literal("allow"),
      updatedInput: S.optional(S.Record(S.String, S.Unknown)),
      updatedPermissions: S.optional(S.Array(PermissionUpdate)),
      toolUseID: S.optional(S.String),
    }),
    S.Struct({
      behavior: S.Literal("deny"),
      message: S.String,
      interrupt: S.optional(S.Boolean),
      toolUseID: S.optional(S.String),
    }),
  ]),
  "PermissionResult"
);

/**
 * @since 0.0.0
 */
export type PermissionResult = typeof PermissionResult.Type;
/**
 * @since 0.0.0
 */
export type PermissionResultEncoded = typeof PermissionResult.Encoded;

/**
 * @since 0.0.0
 */
export const PermissionRequestHookSpecificOutput = withIdentifier(
  S.Struct({
    hookEventName: S.Literal("PermissionRequest"),
    decision: S.Union([
      S.Struct({
        behavior: S.Literal("allow"),
        updatedInput: S.optional(S.Record(S.String, S.Unknown)),
        updatedPermissions: S.optional(S.Array(PermissionUpdate)),
      }),
      S.Struct({
        behavior: S.Literal("deny"),
        message: S.optional(S.String),
        interrupt: S.optional(S.Boolean),
      }),
    ]),
  }),
  "PermissionRequestHookSpecificOutput"
);

/**
 * @since 0.0.0
 */
export type PermissionRequestHookSpecificOutput = typeof PermissionRequestHookSpecificOutput.Type;
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
).annotate({ identifier: "CanUseTool", jsonSchema: {} });

/**
 * @since 0.0.0
 */
export type CanUseTool = typeof CanUseTool.Type;
/**
 * @since 0.0.0
 */
export type CanUseToolEncoded = typeof CanUseTool.Encoded;
