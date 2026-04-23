/**
 * Internal shared Codex hook wire schemas.
 *
 * @module
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CodexId.create("Domain/Hooks/Common");

/**
 * Parse options used to mirror generated Codex hook JSON schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const StrictHookParseOptions = {
  onExcessProperty: "error" as const,
  exact: true as const,
};

/**
 * Nullable string used by the Codex hook wire format.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const NullableString = S.Union([S.String, S.Null]).annotate(
  $I.annote("NullableString", {
    description: "Codex hook wire field that accepts either a string or null.",
  })
);

/**
 * Type for {@link NullableString}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NullableString = typeof NullableString.Type;

/**
 * Permission mode values emitted by Codex hook command inputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PermissionMode = LiteralKit(["default", "acceptEdits", "plan", "dontAsk", "bypassPermissions"]).annotate(
  $I.annote("PermissionMode", {
    description: "Permission mode value carried on Codex hook command inputs.",
  })
);

/**
 * Type for {@link PermissionMode}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PermissionMode = typeof PermissionMode.Type;

/**
 * Hook event names referenced by Codex hook-specific output payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const HookEventName = LiteralKit([
  "PreToolUse",
  "PostToolUse",
  "SessionStart",
  "UserPromptSubmit",
  "Stop",
]).annotate(
  $I.annote("HookEventName", {
    description: "Hook event names permitted by the generated Codex hook output schemas.",
  })
);

/**
 * Type for {@link HookEventName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type HookEventName = typeof HookEventName.Type;

/**
 * Shared block decision literal used by multiple Codex hook outputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BlockDecision = LiteralKit(["block"]).annotate(
  $I.annote("BlockDecision", {
    description: "Shared block decision emitted by Codex hook outputs that can interrupt normal flow.",
  })
);

/**
 * Type for {@link BlockDecision}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BlockDecision = typeof BlockDecision.Type;

/**
 * Current Bash tool name emitted for Codex Bash hook events.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BashToolName = S.Literal("Bash").pipe(
  S.annotate(
    $I.annote("BashToolName", {
      description: "Current tool name emitted by Codex for Bash hook events.",
    })
  )
);

/**
 * Type for {@link BashToolName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BashToolName = typeof BashToolName.Type;

/**
 * Shared fields present on Codex hook command inputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BaseCommandInputFields = {
  session_id: S.String,
  transcript_path: NullableString,
  cwd: S.String,
  model: S.String,
  permission_mode: PermissionMode,
} as const;

/**
 * Shared fields present on turn-scoped Codex hook command inputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TurnScopedCommandInputFields = {
  ...BaseCommandInputFields,
  turn_id: S.String,
} as const;

/**
 * Shared top-level output fields supported by Codex hook command outputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const HookUniversalOutputFields = {
  continue: S.optionalKey(S.Boolean),
  stopReason: S.optionalKey(S.String),
  suppressOutput: S.optionalKey(S.Boolean),
  systemMessage: S.optionalKey(S.String),
} as const;

/**
 * Shared top-level output fields supported by Codex hook command outputs.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class HookUniversalOutput extends S.Class<HookUniversalOutput>($I`HookUniversalOutput`)(
  HookUniversalOutputFields,
  {
    ...$I.annote("HookUniversalOutput", {
      description: "Shared top-level output fields permitted across generated Codex hook command output schemas.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
