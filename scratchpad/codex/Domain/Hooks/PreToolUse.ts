/**
 * module for Codex PreToolUse hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#pretooluse | Codex
 * PreToolUse Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/pre-tool-use.command.input.schema.json | Codex PreToolUse Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/pre-tool-use.command.output.schema.json | Codex PreToolUse Command Output JSON Schema}
 *
 * @module @beep/codex/Domain/Hooks/PreToolUse
 * @since 0.0.0
 */
import { $CodexId } from "@beep/identity";
import * as S from "effect/Schema";
import { LiteralKit, NonEmptyTrimmedStr } from "@beep/schema";

const $I = $CodexId.create("Domain/Hooks/PreToolUse");
