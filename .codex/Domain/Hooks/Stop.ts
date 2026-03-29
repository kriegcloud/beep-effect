/**
 * module for Codex Stop hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#stop | Codex
 * Stop Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/stop.command.input.schema.json | Codex `Stop` Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/stop.command.output.schema.json | Codex `Stop` Command Output JSON Schema}
 *
 * @module @beep/codex/Domain/Hooks/Stop
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import * as S from "effect/Schema";
import {
  BlockDecision,
  HookUniversalOutputFields,
  NullableString,
  StrictHookParseOptions,
  TurnScopedCommandInputFields,
} from "./Common.ts";

const $I = $CodexId.create("Domain/Hooks/Stop");

/**
 * Codex `Stop` command input payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class StopCommandInput extends S.Class<StopCommandInput>($I`StopCommandInput`)(
  {
    ...TurnScopedCommandInputFields,
    hook_event_name: S.Literal("Stop"),
    stop_hook_active: S.Boolean,
    last_assistant_message: NullableString,
  },
  {
    ...$I.annote("StopCommandInput", {
      description: "Codex Stop command input payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}

/**
 * Codex `Stop` command output payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class StopCommandOutput extends S.Class<StopCommandOutput>($I`StopCommandOutput`)(
  {
    ...HookUniversalOutputFields,
    decision: S.optionalKey(BlockDecision),
    reason: S.optionalKey(S.String),
  },
  {
    ...$I.annote("StopCommandOutput", {
      description: "Codex Stop command output payload mirrored from the generated JSON schema.",
    }),
    parseOptions: StrictHookParseOptions,
  }
) {}
