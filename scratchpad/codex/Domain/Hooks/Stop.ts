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
import { LiteralKit, NonEmptyTrimmedStr } from "@beep/schema";

const $I = $CodexId.create("Domain/Hooks/Stop");
