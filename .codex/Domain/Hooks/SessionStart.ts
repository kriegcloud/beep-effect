/**
 * module for Codex SessionStart hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#sessionstart | Codex SessionStart Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/session-start.command.input.schema.json | Codex SessionStart Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/session-start.command.output.schema.json | Codex SessionStart Command Output JSON Schema}
 *
 * @module
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { BaseCommandInputFields, HookEventName, HookUniversalOutputFields, StrictHookParseOptions } from "./Common.ts";

const $I = $CodexId.create("Domain/Hooks/SessionStart");

/**
 * Session start sources permitted by the generated Codex `SessionStart` input schema.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SessionStartSource = LiteralKit(["startup", "resume", "clear"] as const).annotate(
  $I.annote("SessionStartSource", {
    description: "Session start sources permitted by the generated Codex SessionStart input schema.",
  })
);

/**
 * Type for {@link SessionStartSource}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SessionStartSource = typeof SessionStartSource.Type;

/**
 * Hook-specific JSON output supported by Codex `SessionStart` hooks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionStartHookSpecificOutput extends S.Class<SessionStartHookSpecificOutput>(
  $I`SessionStartHookSpecificOutput`
)(
  {
    hookEventName: HookEventName,
    additionalContext: S.optionalKey(S.String),
  },
  {
    ...$I.annote("SessionStartHookSpecificOutput", {
      description: "Hook-specific output payload permitted by the generated Codex SessionStart output schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `SessionStart` command input payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionStartCommandInput extends S.Class<SessionStartCommandInput>($I`SessionStartCommandInput`)(
  {
    ...BaseCommandInputFields,
    hook_event_name: S.Literal("SessionStart"),
    source: SessionStartSource,
  },
  {
    ...$I.annote("SessionStartCommandInput", {
      description: "Codex SessionStart command input payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `SessionStart` command output payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SessionStartCommandOutput extends S.Class<SessionStartCommandOutput>($I`SessionStartCommandOutput`)(
  {
    ...HookUniversalOutputFields,
    hookSpecificOutput: S.optionalKey(SessionStartHookSpecificOutput),
  },
  {
    ...$I.annote("SessionStartCommandOutput", {
      description: "Codex SessionStart command output payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
