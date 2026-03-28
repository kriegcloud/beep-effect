/**
 * based on event types from codex-rs/exec/src/exec_events.rs
 *
 * @module @beep/ai-sdk/codex/events
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("codex/shared");
/**
 * Describes the usage of tokens during a turn.
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class Usage extends S.Class<Usage>($I`Usage`)(
  {
    /** The number of input tokens used during the turn. */
    input_tokens: PosInt.annotateKey({
      description: "The number of input tokens used during the turn.",
    }),
    /** The number of cached input tokens used during the turn. */
    cached_input_tokens: PosInt.annotateKey({
      description: "The number of cached input tokens used during the turn.",
    }),
    /** The number of output tokens used during the turn. */
    output_tokens: PosInt.annotateKey({
      description: "The number of output tokens used during the turn.",
    }),
  },
  $I.annote("Usage", {
    description: "Describes the usage of tokens during a turn.",
  })
) {}
