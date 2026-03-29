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
import {$CodexId} from "@beep/identity";
import * as S from "effect/Schema";
import {LiteralKit, NonEmptyTrimmedStr} from "@beep/schema";

const $I = $CodexId.create("Domain/Hooks/PostToolUse");
