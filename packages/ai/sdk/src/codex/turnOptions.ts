/**
 * @module @beep/ai-sdk/codex/turnOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { AbortSig } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/codex/turnOptions");

/**
 * TurnOptions - Turn options for codex
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TurnOptions extends S.Class<TurnOptions>($I`TurnOptions`)(
  {
    /** JSON schema describing the expected agent output. */
    outputSchema: S.OptionFromOptionalKey(S.Unknown).annotateKey({
      description: "JSON schema describing the expected agent output.",
    }),
    /** AbortSignal to cancel the turn. */
    signal: S.OptionFromOptionalKey(AbortSig).annotateKey({
      description: "AbortSignal to cancel the turn.",
    }),
  },
  $I.annote("TurnOptions", {
    description: "TurnOptions - Turn options for codex",
  })
) {}
