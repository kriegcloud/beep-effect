import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"

export const PermissionMode = withIdentifier(
  Schema.Literal(
    "default",
    "acceptEdits",
    "bypassPermissions",
    "plan",
    "delegate",
    "dontAsk"
  ),
  "PermissionMode"
)

export type PermissionMode = typeof PermissionMode.Type
export type PermissionModeEncoded = typeof PermissionMode.Encoded

export const PermissionBehavior = withIdentifier(
  Schema.Literal("allow", "deny", "ask"),
  "PermissionBehavior"
)

export type PermissionBehavior = typeof PermissionBehavior.Type
export type PermissionBehaviorEncoded = typeof PermissionBehavior.Encoded

export const PermissionUpdateDestination = withIdentifier(
  Schema.Literal("userSettings", "projectSettings", "localSettings", "session", "cliArg"),
  "PermissionUpdateDestination"
)

export type PermissionUpdateDestination = typeof PermissionUpdateDestination.Type
export type PermissionUpdateDestinationEncoded = typeof PermissionUpdateDestination.Encoded

export const PermissionRuleValue = withIdentifier(
  Schema.Struct({
    toolName: Schema.String,
    ruleContent: Schema.optional(Schema.String)
  }),
  "PermissionRuleValue"
)

export type PermissionRuleValue = typeof PermissionRuleValue.Type
export type PermissionRuleValueEncoded = typeof PermissionRuleValue.Encoded

const RulesPayload = Schema.Struct({
  rules: Schema.Array(PermissionRuleValue),
  behavior: PermissionBehavior,
  destination: PermissionUpdateDestination
})

export const PermissionUpdate = withIdentifier(
  Schema.Union(
    Schema.Struct({
      type: Schema.Literal("addRules"),
      ...RulesPayload.fields
    }),
    Schema.Struct({
      type: Schema.Literal("replaceRules"),
      ...RulesPayload.fields
    }),
    Schema.Struct({
      type: Schema.Literal("removeRules"),
      ...RulesPayload.fields
    }),
    Schema.Struct({
      type: Schema.Literal("setMode"),
      mode: PermissionMode,
      destination: PermissionUpdateDestination
    }),
    Schema.Struct({
      type: Schema.Literal("addDirectories"),
      directories: Schema.Array(Schema.String),
      destination: PermissionUpdateDestination
    }),
    Schema.Struct({
      type: Schema.Literal("removeDirectories"),
      directories: Schema.Array(Schema.String),
      destination: PermissionUpdateDestination
    })
  ),
  "PermissionUpdate"
)

export type PermissionUpdate = typeof PermissionUpdate.Type
export type PermissionUpdateEncoded = typeof PermissionUpdate.Encoded

export const PermissionResult = withIdentifier(
  Schema.Union(
    Schema.Struct({
      behavior: Schema.Literal("allow"),
      updatedInput: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
      updatedPermissions: Schema.optional(Schema.Array(PermissionUpdate)),
      toolUseID: Schema.optional(Schema.String)
    }),
    Schema.Struct({
      behavior: Schema.Literal("deny"),
      message: Schema.String,
      interrupt: Schema.optional(Schema.Boolean),
      toolUseID: Schema.optional(Schema.String)
    })
  ),
  "PermissionResult"
)

export type PermissionResult = typeof PermissionResult.Type
export type PermissionResultEncoded = typeof PermissionResult.Encoded

export const PermissionRequestHookSpecificOutput = withIdentifier(
  Schema.Struct({
    hookEventName: Schema.Literal("PermissionRequest"),
    decision: Schema.Union(
      Schema.Struct({
        behavior: Schema.Literal("allow"),
        updatedInput: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
        updatedPermissions: Schema.optional(Schema.Array(PermissionUpdate))
      }),
      Schema.Struct({
        behavior: Schema.Literal("deny"),
        message: Schema.optional(Schema.String),
        interrupt: Schema.optional(Schema.Boolean)
      })
    )
  }),
  "PermissionRequestHookSpecificOutput"
)

export type PermissionRequestHookSpecificOutput = typeof PermissionRequestHookSpecificOutput.Type
export type PermissionRequestHookSpecificOutputEncoded = typeof PermissionRequestHookSpecificOutput.Encoded

export const CanUseTool = Schema.declare(
  (_: unknown): _ is ((
    toolName: string,
    input: Record<string, unknown>,
    options: {
      signal: AbortSignal
      suggestions?: PermissionUpdate[]
      blockedPath?: string
      decisionReason?: string
      toolUseID: string
      agentID?: string
    }
  ) => Promise<PermissionResult>) => true
).pipe(Schema.annotations({ identifier: "CanUseTool", jsonSchema: {} }))

export type CanUseTool = typeof CanUseTool.Type
export type CanUseToolEncoded = typeof CanUseTool.Encoded
