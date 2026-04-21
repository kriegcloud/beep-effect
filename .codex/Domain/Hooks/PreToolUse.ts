/**
 * module for Codex PreToolUse hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#pretooluse | Codex
 * PreToolUse Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/pre-tool-use.command.input.schema.json | Codex PreToolUse Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/pre-tool-use.command.output.schema.json | Codex PreToolUse Command Output JSON Schema}
 *
 * @module
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import {
  BashToolName,
  HookEventName,
  HookUniversalOutputFields,
  StrictHookParseOptions,
  TurnScopedCommandInputFields,
} from "./Common.ts";

const $I = $CodexId.create("Domain/Hooks/PreToolUse");

/**
 * Tool input payload emitted for Codex `PreToolUse` Bash hook events.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PreToolUseToolInput extends S.Class<PreToolUseToolInput>($I`PreToolUseToolInput`)(
  {
    command: S.String,
  },
  {
    ...$I.annote("PreToolUseToolInput", {
      description: "Tool input payload emitted for Codex PreToolUse Bash hook events.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Permission decision values accepted in `PreToolUse` hook-specific output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PreToolUsePermissionDecision = LiteralKit(["allow", "deny", "ask"] as const).annotate(
  $I.annote("PreToolUsePermissionDecision", {
    description: "Permission decision values accepted in PreToolUse hook-specific output.",
  })
);

/**
 * Type for {@link PreToolUsePermissionDecision}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PreToolUsePermissionDecision = typeof PreToolUsePermissionDecision.Type;

/**
 * Legacy decision values accepted by `PreToolUse` command output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PreToolUseDecision = LiteralKit(["approve", "block"] as const).annotate(
  $I.annote("PreToolUseDecision", {
    description: "Legacy decision values accepted by PreToolUse command output.",
  })
);

/**
 * Type for {@link PreToolUseDecision}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PreToolUseDecision = typeof PreToolUseDecision.Type;

/**
 * Hook-specific JSON output supported by Codex `PreToolUse` hooks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PreToolUseHookSpecificOutput extends S.Class<PreToolUseHookSpecificOutput>(
  $I`PreToolUseHookSpecificOutput`
)(
  {
    hookEventName: HookEventName,
    permissionDecision: S.optionalKey(PreToolUsePermissionDecision),
    permissionDecisionReason: S.optionalKey(S.String),
    updatedInput: S.optionalKey(S.Unknown),
    additionalContext: S.optionalKey(S.String),
  },
  {
    ...$I.annote("PreToolUseHookSpecificOutput", {
      description: "Hook-specific output payload permitted by the generated Codex PreToolUse output schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `PreToolUse` command input payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PreToolUseCommandInput extends S.Class<PreToolUseCommandInput>($I`PreToolUseCommandInput`)(
  {
    ...TurnScopedCommandInputFields,
    hook_event_name: S.Literal("PreToolUse"),
    tool_name: BashToolName,
    tool_input: PreToolUseToolInput,
    tool_use_id: S.String,
  },
  {
    ...$I.annote("PreToolUseCommandInput", {
      description: "Codex PreToolUse command input payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `PreToolUse` command output payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PreToolUseCommandOutput extends S.Class<PreToolUseCommandOutput>($I`PreToolUseCommandOutput`)(
  {
    ...HookUniversalOutputFields,
    decision: S.optionalKey(PreToolUseDecision),
    reason: S.optionalKey(S.String),
    hookSpecificOutput: S.optionalKey(PreToolUseHookSpecificOutput),
  },
  {
    ...$I.annote("PreToolUseCommandOutput", {
      description: "Codex PreToolUse command output payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
