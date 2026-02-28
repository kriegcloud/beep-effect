import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { CanUseTool } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Session");

const HookMap = S.Record(HookEvent, S.Array(HookCallbackMatcher));

/**
 * @since 0.0.0
 */
export const SessionPermissionMode = LiteralKit(["default", "acceptEdits", "plan", "dontAsk"]).annotate(
  $I.annote("SessionPermissionMode", {
    description: "Schema for SessionPermissionMode.",
  })
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
export const SDKSessionOptions = S.Struct({
  model: S.String,
  pathToClaudeCodeExecutable: S.optional(S.String),
  executable: S.optional(LiteralKit(["node", "bun"])),
  executableArgs: S.optional(S.Array(S.String)),
  env: S.optional(S.Record(S.String, S.Union([S.String, S.Undefined]))),
  allowedTools: S.optional(S.Array(S.String)),
  disallowedTools: S.optional(S.Array(S.String)),
  canUseTool: S.optional(CanUseTool),
  hooks: S.optional(HookMap),
  permissionMode: S.optional(SessionPermissionMode),
}).annotate(
  $I.annote("SDKSessionOptions", {
    description: "Schema for SDKSessionOptions.",
  })
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
export const SDKSession = S.declare((_: unknown): _ is unknown => true).annotate(
  $I.annote("SDKSession", {
    description: "Schema for SDKSession.",
    jsonSchema: {},
  })
);

/**
 * @since 0.0.0
 */
export type SDKSession = typeof SDKSession.Type;
/**
 * @since 0.0.0
 */
export type SDKSessionEncoded = typeof SDKSession.Encoded;
