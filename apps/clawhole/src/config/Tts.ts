import { $ClawholeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("config/TTS");

/**
 * Branded identifier for a configured TTS provider.
 *
 * @category Validation
 * @since 0.0.0
 */
export const TtsProvider = S.String.pipe(S.brand("TtsProvider"), $I.annoteSchema("TtsProvider"));

/**
 * Type of {@link TtsProvider}.
 *
 * @category Validation
 * @since 0.0.0
 */
export type TtsProvider = typeof TtsProvider.Type;

/**
 * TtsMode -
 *
 * @category Validation
 * @since 0.0.0
 */
export const TtsMode = LiteralKit(["final", "all"]).pipe(
  $I.annoteSchema("TtsMode", {
    description: "TtsMode - ",
  })
);

/**
 * Type of {@link TtsMode} {@inheritDoc TtsMode}
 *
 * @category Validation
 * @since 0.0.0
 */
export type TtsMode = typeof TtsMode.Type;

/**
 * TtsAutoMode -
 *
 * @category Validation
 * @since 0.0.0
 */
export const TtsAutoMode = LiteralKit(["off", "always", "inbound", "tagged"]).pipe(
  $I.annoteSchema("TtsAutoMode", {
    description: "TtsAutoMode - ",
  })
);

/**
 * Type of {@link TtsAutoMode} {@inheritDoc TtsAutoMode}
 *
 * @category Validation
 * @since 0.0.0
 */
export type TtsAutoMode = typeof TtsAutoMode.Type;

/**
 * TtsModelOverrideConfig -
 *
 *
 * @category Configuration
 * @since 0.0.0
 */
export class TtsModelOverrideConfig extends S.Class<TtsModelOverrideConfig>($I`TtsModelOverrideConfig`)(
  {
    /** Enable model-provided overrides for TTS. */
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Enable model-provided overrides for TTS.",
    }),
    /** Allow model-provided TTS text blocks. */
    allowText: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided TTS text blocks.",
    }),
    /** Allow model-provided provider override (default: false). */
    allowProvider: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided provider override (default: false).",
    }),
    /** Allow model-provided voice/voiceId override. */
    allowVoice: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided voice/voiceId override.",
    }),
    /** Allow model-provided modelId override. */
    allowModelId: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided modelId override.",
    }),
    /** Allow model-provided voice settings override. */
    allowVoiceSettings: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided voice settings override.",
    }),
    /** Allow model-provided normalization or language overrides. */
    allowNormalization: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided normalization or language overrides.",
    }),
    /** Allow model-provided seed override. */
    allowSeed: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided seed override.",
    }),
  },
  $I.annote("TtsModelOverrideConfig", {
    description: "TtsModelOverrideConfig - ",
  })
) {}

/**
 * Provider-specific arbitrary config keyed by provider id and setting name.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TtsProviderConfigMap = S.Record(S.String, S.Record(S.String, S.Unknown)).pipe(
  $I.annoteSchema("TtsProviderConfigMap")
);

/**
 * Type of {@link TtsProviderConfigMap}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TtsProviderConfigMap = typeof TtsProviderConfigMap.Type;

/**
 * Top-level TTS configuration for clawhole.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class TtsConfig extends S.Class<TtsConfig>($I`TtsConfig`)(
  {
    /** Auto-TTS mode (preferred). */
    auto: S.OptionFromOptionalKey(TtsAutoMode).annotateKey({
      description: "Auto-TTS mode (preferred).",
    }),
    /** Legacy: enable auto-TTS when `auto` is not set. */
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Legacy: enable auto-TTS when `auto` is not set.",
    }),
    /** Apply TTS to final replies only or to all replies (tool/block/final). */
    mode: S.OptionFromOptionalKey(TtsMode).annotateKey({
      description: "Apply TTS to final replies only or to all replies (tool/block/final).",
    }),
    /** Primary TTS provider (fallbacks are automatic). */
    provider: S.OptionFromOptionalKey(TtsProvider).annotateKey({
      description: "Primary TTS provider (fallbacks are automatic).",
    }),
    /** Optional model override for TTS auto-summary (provider/model or alias). */
    summaryModel: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional model override for TTS auto-summary (provider/model or alias).",
    }),
    /** Allow the model to override TTS parameters. */
    modelOverrides: S.OptionFromOptionalKey(TtsModelOverrideConfig).annotateKey({
      description: "Allow the model to override TTS parameters.",
    }),
    /** Provider-specific TTS settings keyed by speech provider id. */
    providers: S.OptionFromOptionalKey(TtsProviderConfigMap).annotateKey({
      description: "Provider-specific TTS settings keyed by speech provider id.",
    }),
    /** Optional path for local TTS user preferences JSON. */
    prefsPath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional path for local TTS user preferences JSON.",
    }),
    /** Hard cap for text sent to TTS (chars). */
    maxTextLength: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Hard cap for text sent to TTS (chars).",
    }),
    /** API request timeout (ms). */
    timeoutMs: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey({
      description: "API request timeout (ms).",
    }),
  },
  $I.annote("TtsConfig", {
    description: "",
  })
) {}
