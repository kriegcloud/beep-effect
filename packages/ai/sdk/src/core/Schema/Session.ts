import * as Schema from "effect/Schema";
import { withIdentifier } from "./Annotations.js";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { CanUseTool } from "./Permission.js";

const HookMap = Schema.Record(HookEvent, Schema.Array(HookCallbackMatcher));

/**
 * @since 0.0.0
 */
export const SessionPermissionMode = withIdentifier(
  Schema.Literals(["default", "acceptEdits", "plan", "dontAsk"]),
  "SessionPermissionMode"
);

/**
 * @since 0.0.0
 */
export type SessionPermissionMode = typeof SessionPermissionMode.Type;
/**
 * @since 0.0.0
 */
export type SessionPermissionModeEncoded = typeof SessionPermissionMode.Encoded;

/**
 * @since 0.0.0
 */
export const SDKSessionOptions = withIdentifier(
  Schema.Struct({
    model: Schema.String,
    pathToClaudeCodeExecutable: Schema.optional(Schema.String),
    executable: Schema.optional(Schema.Literals(["node", "bun"])),
    executableArgs: Schema.optional(Schema.Array(Schema.String)),
    env: Schema.optional(Schema.Record(Schema.String, Schema.Union([Schema.String, Schema.Undefined]))),
    allowedTools: Schema.optional(Schema.Array(Schema.String)),
    disallowedTools: Schema.optional(Schema.Array(Schema.String)),
    canUseTool: Schema.optional(CanUseTool),
    hooks: Schema.optional(HookMap),
    permissionMode: Schema.optional(SessionPermissionMode),
  }),
  "SDKSessionOptions"
);

/**
 * @since 0.0.0
 */
export type SDKSessionOptions = typeof SDKSessionOptions.Type;
/**
 * @since 0.0.0
 */
export type SDKSessionOptionsEncoded = typeof SDKSessionOptions.Encoded;

/**
 * @since 0.0.0
 */
export const SDKSession = Schema.declare((_: unknown): _ is unknown => true).annotate({
  identifier: "SDKSession",
  jsonSchema: {},
});

/**
 * @since 0.0.0
 */
export type SDKSession = typeof SDKSession.Type;
/**
 * @since 0.0.0
 */
export type SDKSessionEncoded = typeof SDKSession.Encoded;
