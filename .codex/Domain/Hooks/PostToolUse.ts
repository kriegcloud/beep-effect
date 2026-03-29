/**
 * module for Codex PostToolUse hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#posttooluse | Codex
 * PostToolUse Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/post-tool-use.command.input.schema.json | PostToolUse Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/post-tool-use.command.output.schema.json | PostToolUse Command Output JSON Schema}
 *
 * @module @beep/codex/Domain/Hooks/PostToolUse
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import * as S from "effect/Schema";
import {
  BashToolName,
  BlockDecision,
  HookEventName,
  HookUniversalOutputFields,
  StrictHookParseOptions,
  TurnScopedCommandInputFields,
} from "./Common.ts";

const $I = $CodexId.create("Domain/Hooks/PostToolUse");

/**
 * Tool input payload emitted for Codex `PostToolUse` Bash hook events.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PostToolUseToolInput extends S.Class<PostToolUseToolInput>($I`PostToolUseToolInput`)(
  {
    command: S.String,
  },
  {
    ...$I.annote("PostToolUseToolInput", {
      description: "Tool input payload emitted for Codex PostToolUse Bash hook events.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Hook-specific JSON output supported by Codex `PostToolUse` hooks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PostToolUseHookSpecificOutput extends S.Class<PostToolUseHookSpecificOutput>(
  $I`PostToolUseHookSpecificOutput`
)(
  {
    hookEventName: HookEventName,
    additionalContext: S.optionalKey(S.String),
    updatedMCPToolOutput: S.optionalKey(S.Unknown),
  },
  {
    ...$I.annote("PostToolUseHookSpecificOutput", {
      description: "Hook-specific output payload permitted by the generated Codex PostToolUse output schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `PostToolUse` command input payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PostToolUseCommandInput extends S.Class<PostToolUseCommandInput>($I`PostToolUseCommandInput`)(
  {
    ...TurnScopedCommandInputFields,
    hook_event_name: S.Literal("PostToolUse"),
    tool_name: BashToolName,
    tool_input: PostToolUseToolInput,
    tool_response: S.Unknown,
    tool_use_id: S.String,
  },
  {
    ...$I.annote("PostToolUseCommandInput", {
      description: "Codex PostToolUse command input payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `PostToolUse` command output payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PostToolUseCommandOutput extends S.Class<PostToolUseCommandOutput>($I`PostToolUseCommandOutput`)(
  {
    ...HookUniversalOutputFields,
    decision: S.optionalKey(BlockDecision),
    reason: S.optionalKey(S.String),
    hookSpecificOutput: S.optionalKey(PostToolUseHookSpecificOutput),
  },
  {
    ...$I.annote("PostToolUseCommandOutput", {
      description: "Codex PostToolUse command output payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
