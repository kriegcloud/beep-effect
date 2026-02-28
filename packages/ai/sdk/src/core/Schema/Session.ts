import * as S from "effect/Schema";
import { withIdentifier } from "./Annotations.js";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { CanUseTool } from "./Permission.js";

const HookMap = S.Record(HookEvent, S.Array(HookCallbackMatcher));

/**
 * @since 0.0.0
 */
export const SessionPermissionMode = withIdentifier(
  S.Literals(["default", "acceptEdits", "plan", "dontAsk"]),
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
  S.Struct({
    model: S.String,
    pathToClaudeCodeExecutable: S.optional(S.String),
    executable: S.optional(S.Literals(["node", "bun"])),
    executableArgs: S.optional(S.Array(S.String)),
    env: S.optional(S.Record(S.String, S.Union([S.String, S.Undefined]))),
    allowedTools: S.optional(S.Array(S.String)),
    disallowedTools: S.optional(S.Array(S.String)),
    canUseTool: S.optional(CanUseTool),
    hooks: S.optional(HookMap),
    permissionMode: S.optional(SessionPermissionMode),
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
export const SDKSession = S.declare((_: unknown): _ is unknown => true).annotate({
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
