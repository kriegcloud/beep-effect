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
import { LiteralKit, NonEmptyTrimmedStr } from "@beep/schema";

const $I = $CodexId.create("Domain/Hooks/UserPromptSubmit");
