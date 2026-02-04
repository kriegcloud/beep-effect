import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { HookCallbackMatcher, HookEvent } from "./Hooks.js"
import { CanUseTool } from "./Permission.js"

const HookMap = Schema.Record({ key: HookEvent, value: Schema.Array(HookCallbackMatcher) })

export const SessionPermissionMode = withIdentifier(
  Schema.Literal("default", "acceptEdits", "plan", "dontAsk"),
  "SessionPermissionMode"
)

export type SessionPermissionMode = typeof SessionPermissionMode.Type
export type SessionPermissionModeEncoded = typeof SessionPermissionMode.Encoded

export const SDKSessionOptions = withIdentifier(
  Schema.Struct({
    model: Schema.String,
    pathToClaudeCodeExecutable: Schema.optional(Schema.String),
    executable: Schema.optional(Schema.Literal("node", "bun")),
    executableArgs: Schema.optional(Schema.Array(Schema.String)),
    env: Schema.optional(
      Schema.Record({
        key: Schema.String,
        value: Schema.Union(Schema.String, Schema.Undefined)
      })
    ),
    allowedTools: Schema.optional(Schema.Array(Schema.String)),
    disallowedTools: Schema.optional(Schema.Array(Schema.String)),
    canUseTool: Schema.optional(CanUseTool),
    hooks: Schema.optional(HookMap),
    permissionMode: Schema.optional(SessionPermissionMode)
  }),
  "SDKSessionOptions"
)

export type SDKSessionOptions = typeof SDKSessionOptions.Type
export type SDKSessionOptionsEncoded = typeof SDKSessionOptions.Encoded

export const SDKSession = Schema.declare((_: unknown): _ is unknown => true).pipe(
  Schema.annotations({ identifier: "SDKSession", jsonSchema: {} })
)

export type SDKSession = typeof SDKSession.Type
export type SDKSessionEncoded = typeof SDKSession.Encoded
