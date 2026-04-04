/**
 * Text-to-speech configuration schemas for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw text-to-speech config surface into
 * repo-native Effect schemas while preserving the documented wire shape and
 * optional-field semantics.
 *
 * @module @beep/clawhole/domain/Tts
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("domain/TextToSpeech");

/**
 * Branded identifier for a configured TextToSpeech provider.
 *
 * @category Validation
 * @since 0.0.0
 */
export const TextToSpeechProvider = S.String.pipe(
  S.brand("TextToSpeechProvider"),
  $I.annoteSchema("TextToSpeechProvider", {
    description: "Branded identifier for a configured text-to-speech provider.",
  })
);

/**
 * Type of {@link TextToSpeechProvider}.
 *
 * @category Validation
 * @since 0.0.0
 */
export type TextToSpeechProvider = typeof TextToSpeechProvider.Type;

/**
 * Controls whether text-to-speech is applied only to final replies or to all
 * reply chunks.
 *
 * @category Validation
 * @since 0.0.0
 */
export const TextToSpeechMode = LiteralKit(["final", "all"]).pipe(
  $I.annoteSchema("TextToSpeechMode", {
    description: "When text-to-speech is applied: final replies only or all reply chunks.",
  })
);

/**
 * Type of {@link TextToSpeechMode} {@inheritDoc TextToSpeechMode}
 *
 * @category Validation
 * @since 0.0.0
 */
export type TextToSpeechMode = typeof TextToSpeechMode.Type;

/**
 * Controls when text-to-speech should auto-activate for replies.
 *
 * @category Validation
 * @since 0.0.0
 */
export const TextToSpeechAutoMode = LiteralKit(["off", "always", "inbound", "tagged"]).pipe(
  $I.annoteSchema("TextToSpeechAutoMode", {
    description: "Auto text-to-speech activation strategy: disabled, always on, inbound-triggered, or tag-triggered.",
  })
);

/**
 * Type of {@link TextToSpeechAutoMode} {@inheritDoc TextToSpeechAutoMode}
 *
 * @category Validation
 * @since 0.0.0
 */
export type TextToSpeechAutoMode = typeof TextToSpeechAutoMode.Type;

/**
 * Controls which text-to-speech parameters the model may override at runtime.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class TextToSpeechModelOverrideConfig extends S.Class<TextToSpeechModelOverrideConfig>(
  $I`TextToSpeechModelOverrideConfig`
)(
  {
    /** Enable model-provided overrides for TextToSpeech. */
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Enable model-provided overrides for TextToSpeech.",
    }),
    /** Allow model-provided TextToSpeech text blocks. */
    allowText: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Allow model-provided TextToSpeech text blocks.",
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
  $I.annote("TextToSpeechModelOverrideConfig", {
    description: "Controls which text-to-speech parameters the model may override at runtime.",
  })
) {}

/**
 * Provider-specific arbitrary config keyed by provider id and setting name.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TextToSpeechProviderConfigMap = S.Record(S.String, S.Record(S.String, S.Unknown)).pipe(
  $I.annoteSchema("TextToSpeechProviderConfigMap", {
    description: "Provider-specific arbitrary settings keyed by provider id and setting name.",
  })
);

/**
 * Type of {@link TextToSpeechProviderConfigMap}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TextToSpeechProviderConfigMap = typeof TextToSpeechProviderConfigMap.Type;

/**
 * Top-level TextToSpeech configuration for clawhole.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class TextToSpeechConfig extends S.Class<TextToSpeechConfig>($I`TextToSpeechConfig`)(
  {
    /** Auto-TextToSpeech mode (preferred). */
    auto: S.OptionFromOptionalKey(TextToSpeechAutoMode).annotateKey({
      description: "Auto-TextToSpeech mode (preferred).",
    }),
    /** Legacy: enable auto-TextToSpeech when `auto` is not set. */
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Legacy: enable auto-TextToSpeech when `auto` is not set.",
    }),
    /** Apply TextToSpeech to final replies only or to all replies (tool/block/final). */
    mode: S.OptionFromOptionalKey(TextToSpeechMode).annotateKey({
      description: "Apply TextToSpeech to final replies only or to all replies (tool/block/final).",
    }),
    /** Primary TextToSpeech provider (fallbacks are automatic). */
    provider: S.OptionFromOptionalKey(TextToSpeechProvider).annotateKey({
      description: "Primary TextToSpeech provider (fallbacks are automatic).",
    }),
    /** Optional model override for TextToSpeech auto-summary (provider/model or alias). */
    summaryModel: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional model override for TextToSpeech auto-summary (provider/model or alias).",
    }),
    /** Allow the model to override TextToSpeech parameters. */
    modelOverrides: S.OptionFromOptionalKey(TextToSpeechModelOverrideConfig).annotateKey({
      description: "Allow the model to override TextToSpeech parameters.",
    }),
    /** Provider-specific TextToSpeech settings keyed by speech provider id. */
    providers: S.OptionFromOptionalKey(TextToSpeechProviderConfigMap).annotateKey({
      description: "Provider-specific TextToSpeech settings keyed by speech provider id.",
    }),
    /** Optional path for local TextToSpeech user preferences JSON. */
    prefsPath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional path for local TextToSpeech user preferences JSON.",
    }),
    /** Hard cap for text sent to TextToSpeech (chars). */
    maxTextLength: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Hard cap for text sent to TextToSpeech (chars).",
    }),
    /** API request timeout (ms). */
    timeoutMs: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey({
      description: "API request timeout (ms).",
    }),
  },
  $I.annote("TextToSpeechConfig", {
    description: "Top-level text-to-speech configuration for provider selection, model overrides, and runtime limits.",
  })
) {}
