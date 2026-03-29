/**
 * module for Codex UserPromptSubmit hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#userpromptsubmit | Codex
 * UserPromptSubmit Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/user-prompt-submit.command.input.schema.json | Codex `UserPromptSubmit` Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/user-prompt-submit.command.output.schema.json | Codex `UserPromptSubmit` Command Output JSON Schema}
 *
 * @module @beep/codex/Domain/Hooks/UserPromptSubmit
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import * as S from "effect/Schema";
import {
  BlockDecision,
  HookEventName,
  HookUniversalOutputFields,
  StrictHookParseOptions,
  TurnScopedCommandInputFields,
} from "./Common.ts";

const $I = $CodexId.create("Domain/Hooks/UserPromptSubmit");

/**
 * Hook-specific JSON output supported by Codex `UserPromptSubmit` hooks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UserPromptSubmitHookSpecificOutput extends S.Class<UserPromptSubmitHookSpecificOutput>(
  $I`UserPromptSubmitHookSpecificOutput`
)(
  {
    hookEventName: HookEventName,
    additionalContext: S.optionalKey(S.String),
  },
  {
    ...$I.annote("UserPromptSubmitHookSpecificOutput", {
      description: "Hook-specific output payload permitted by the generated Codex UserPromptSubmit output schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `UserPromptSubmit` command input payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UserPromptSubmitCommandInput extends S.Class<UserPromptSubmitCommandInput>(
  $I`UserPromptSubmitCommandInput`
)(
  {
    ...TurnScopedCommandInputFields,
    hook_event_name: S.Literal("UserPromptSubmit"),
    prompt: S.String,
  },
  {
    ...$I.annote("UserPromptSubmitCommandInput", {
      description: "Codex UserPromptSubmit command input payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `UserPromptSubmit` command output payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UserPromptSubmitCommandOutput extends S.Class<UserPromptSubmitCommandOutput>(
  $I`UserPromptSubmitCommandOutput`
)(
  {
    ...HookUniversalOutputFields,
    decision: S.optionalKey(BlockDecision),
    reason: S.optionalKey(S.String),
    hookSpecificOutput: S.optionalKey(UserPromptSubmitHookSpecificOutput),
  },
  {
    ...$I.annote("UserPromptSubmitCommandOutput", {
      description: "Codex UserPromptSubmit command output payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
