import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { CanUseTool } from "./Permission.js";

const $I = $AiSdkId.create("core/Schema/Session");

const HookMap = S.Record(HookEvent, S.Array(HookCallbackMatcher));
const ClaudeCodeExecutable = LiteralKit(["node", "bun"]).annotate(
  $I.annote("ClaudeCodeExecutable", {
    description: "Supported executable runtime choices for launching Claude Code.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export const SessionPermissionMode = LiteralKit(["default", "acceptEdits", "plan", "dontAsk"]).annotate(
  $I.annote("SessionPermissionMode", {
    description: "Session-scoped permission modes accepted by SDK session options.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SessionPermissionMode = typeof SessionPermissionMode.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SessionPermissionModeEncoded = typeof SessionPermissionMode.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export class SDKSessionOptions extends S.Class<SDKSessionOptions>($I`SDKSessionOptions`)(
  {
    model: S.String,
    pathToClaudeCodeExecutable: S.optionalKey(FilePath.pipe(S.UndefinedOr)),
    executable: S.optionalKey(ClaudeCodeExecutable.pipe(S.UndefinedOr)),
    executableArgs: S.optionalKey(S.String.pipe(S.Array, S.UndefinedOr)),
    env: S.optionalKey(S.Record(S.String, S.Union([S.String, S.Undefined])).pipe(S.UndefinedOr)),
    allowedTools: S.optionalKey(S.String.pipe(S.Array, S.UndefinedOr)),
    disallowedTools: S.optionalKey(S.String.pipe(S.Array, S.UndefinedOr)),
    canUseTool: S.optionalKey(CanUseTool.pipe(S.UndefinedOr)),
    hooks: S.optionalKey(HookMap.pipe(S.UndefinedOr)),
    permissionMode: S.optionalKey(SessionPermissionMode.pipe(S.UndefinedOr)),
  },
  $I.annote("SDKSessionOptions", {
    description: "Schema-backed session configuration options for SDK sessions.",
  })
) {}
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKSessionOptionsEncoded = typeof SDKSessionOptions.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SDKSession = S.declare((_: unknown): _ is unknown => true).annotate(
  $I.annote("SDKSession", {
    description: "Opaque handle for an active SDK session.",
    jsonSchema: {},
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKSession = typeof SDKSession.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SDKSessionEncoded = typeof SDKSession.Encoded;
