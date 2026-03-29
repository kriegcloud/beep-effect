/**
 * module for Codex SessionStart hook schemas.
 *
 * @see {@link https://developers.openai.com/codex/hooks#sessionstart | Codex SessionStart Hook}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/session-start.command.input.schema.json | Codex SessionStart Command Input JSON Schema}
 * @see {@link https://github.com/openai/codex/blob/main/codex-rs/hooks/schema/generated/session-start.command.input.schema.json | Codex SessionStart Command Output JSON Schema}
 *
 * @module @beep/codex/Domain/Hooks/SessionStart
 * @since 0.0.0
 */
import {$CodexId} from "@beep/identity";
import * as S from "effect/Schema";
import {LiteralKit, NonEmptyTrimmedStr} from "@beep/schema";

const $I = $CodexId.create("Domain/Hooks/SessionStart");
