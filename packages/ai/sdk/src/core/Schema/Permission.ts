import * as Schema from "effect/Schema";
import { withIdentifier } from "./Annotations.js";

/**
 * @since 0.0.0
 */
export const PermissionMode = withIdentifier(
  Schema.Literals(["default", "acceptEdits", "bypassPermissions", "plan", "delegate", "dontAsk"]),
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
export const PermissionBehavior = withIdentifier(Schema.Literals(["allow", "deny", "ask"]), "PermissionBehavior");

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
  Schema.Literals(["userSettings", "projectSettings", "localSettings", "session", "cliArg"]),
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
  Schema.Struct({
    toolName: Schema.String,
    ruleContent: Schema.optional(Schema.String),
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

const RulesPayload = Schema.Struct({
  rules: Schema.Array(PermissionRuleValue),
  behavior: PermissionBehavior,
  destination: PermissionUpdateDestination,
});

/**
 * @since 0.0.0
 */
export const PermissionUpdate = withIdentifier(
  Schema.Union([
    Schema.Struct({
      type: Schema.Literal("addRules"),
      ...RulesPayload.fields,
    }),
    Schema.Struct({
      type: Schema.Literal("replaceRules"),
      ...RulesPayload.fields,
    }),
    Schema.Struct({
      type: Schema.Literal("removeRules"),
      ...RulesPayload.fields,
    }),
    Schema.Struct({
      type: Schema.Literal("setMode"),
      mode: PermissionMode,
      destination: PermissionUpdateDestination,
    }),
    Schema.Struct({
      type: Schema.Literal("addDirectories"),
      directories: Schema.Array(Schema.String),
      destination: PermissionUpdateDestination,
    }),
    Schema.Struct({
      type: Schema.Literal("removeDirectories"),
      directories: Schema.Array(Schema.String),
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
  Schema.Union([
    Schema.Struct({
      behavior: Schema.Literal("allow"),
      updatedInput: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
      updatedPermissions: Schema.optional(Schema.Array(PermissionUpdate)),
      toolUseID: Schema.optional(Schema.String),
    }),
    Schema.Struct({
      behavior: Schema.Literal("deny"),
      message: Schema.String,
      interrupt: Schema.optional(Schema.Boolean),
      toolUseID: Schema.optional(Schema.String),
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
  Schema.Struct({
    hookEventName: Schema.Literal("PermissionRequest"),
    decision: Schema.Union([
      Schema.Struct({
        behavior: Schema.Literal("allow"),
        updatedInput: Schema.optional(Schema.Record(Schema.String, Schema.Unknown)),
        updatedPermissions: Schema.optional(Schema.Array(PermissionUpdate)),
      }),
      Schema.Struct({
        behavior: Schema.Literal("deny"),
        message: Schema.optional(Schema.String),
        interrupt: Schema.optional(Schema.Boolean),
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
export const CanUseTool = Schema.declare(
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
