import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import { HookCallbackMatcher, HookEvent } from "./Hooks.js"
import { CanUseTool } from "./Permission.js"

const HookMap = Schema.Record( HookEvent, Schema.Array(HookCallbackMatcher) )

export const SessionPermissionMode = withIdentifier(
  Schema.Literals(["default", "acceptEdits", "plan", "dontAsk"]),
  "SessionPermissionMode"
)

export type SessionPermissionMode = typeof SessionPermissionMode.Type
export type SessionPermissionModeEncoded = typeof SessionPermissionMode.Encoded

export const SDKSessionOptions = withIdentifier(
  Schema.Struct({
    model: Schema.String,
    pathToClaudeCodeExecutable: Schema.optional(Schema.String),
    executable: Schema.optional(Schema.Literals(["node", "bun"])),
    executableArgs: Schema.optional(Schema.Array(Schema.String)),
    env: Schema.optional(
      Schema.Record(
     Schema.String,
        Schema.Union([Schema.String, Schema.Undefined])
      )
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

export const SDKSession = Schema.declare((_: unknown): _ is unknown => true).annotate({ identifier: "SDKSession", jsonSchema: {} })

export type SDKSession = typeof SDKSession.Type
export type SDKSessionEncoded = typeof SDKSession.Encoded
