/**
 * Base Domain types & schemas for @beep/clawhole
 *
 * @module @beep/clawhole/Domain/Base
 * @since 0.0.0
 */
import { $ClawholeId, $I } from "@beep/identity";
import { LiteralKit, PosInt, SchemaUtils, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { pipe, flow, Duration } from "effect";

/**
 * The Type of a clawhole chat
 *
 * @category DomainModels
 * @since 0.0.0
 */
export const ChatType = LiteralKit(["direct", "group", "channel"]).pipe(
  SchemaUtils.withStatics((schema) => ({
    normalize: (raw?: undefined | string): O.Option<ChatType> =>
      pipe(
        raw,
        O.fromNullishOr,
        O.map(flow(Str.trim, Str.toLowerCase)),
        O.map((value) => {
          if (value === "dm") return "direct";
          return value;
        }),
        O.flatMap(S.decodeUnknownOption(schema))
      ),
  })),
  $I.annoteSchema("ChatType", {
    description: "The Type of a clawhole chat",
  })
);

/**
 * Type of {@link ChatType} {@inheritDoc ChatType}
 *
 * @category DomainModels
 * @since 0.0.0
 */
export type ChatType = typeof ChatType.Type;

/**
 * TypingMode - The typing mode of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const TypeingMode = LiteralKit(["never", "instant", "thinking", "message"]).pipe(
  $I.annoteSchema("TypeingMode", {
    description: "TypingMode - The typing mode of clawhole",
  })
);

/**
 * Type of {@link TypeingMode} {@inheritDoc TypeingMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type TypeingMode = typeof TypeingMode.Type;

/**
 * SessionScope - the session scope for clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SessionScope = LiteralKit(["per-sender", "global"]).pipe(
  $I.annoteSchema("SessionScope", {
    description: "SessionScope - the session scope for clawhole",
  })
);

/**
 * Type of {@link SessionScope} {@inheritDoc SessionScope}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SessionScope = typeof SessionScope.Type;

/**
 * DmScope - The Direct Message scope of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DmScope = LiteralKit(["main", "per-peer", "per-channel-peer", "per-account-channel-peer"]).pipe(
  $I.annoteSchema("DmScope", {
    description: "DmScope - The Direct Message scope of clawhole",
  })
);

/**
 * Type of {@link DmScope} {@inheritDoc DmScope}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DmScope = typeof DmScope.Type;

/**
 * ReplyToMode - The Reply to Mode of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ReplyToMode = LiteralKit(["off", "first", "all"]).pipe(
  $I.annoteSchema("ReplyToMode", {
    description: "ReplyToMode - The Reply to Mode of clawhole",
  })
);

/**
 * Type of {@link ReplyToMode} {@inheritDoc ReplyToMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ReplyToMode = typeof ReplyToMode.Type;

/**
 * GroupPolicy - The group policy of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const GroupPolicy = LiteralKit(["open", "disabled", "allowlist"]).pipe(
  $I.annoteSchema("GroupPolicy", {
    description: "GroupPolicy - The group policy of clawhole",
  })
);

/**
 * Type of {@link GroupPolicy} {@inheritDoc GroupPolicy}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GroupPolicy = typeof GroupPolicy.Type;

/**
 * DmPolicy - The direct message policy of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const DmPolicy = LiteralKit(["pairing", "allowlist", "open", "disabled"]).pipe(
  $I.annoteSchema("DmPolicy", {
    description: "DmPolicy - The direct message policy of clawhole",
  })
);

/**
 * Type of {@link DmPolicy} {@inheritDoc DmPolicy}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DmPolicy = typeof DmPolicy.Type;

/**
 * ContextVisibilityMode - The context visibility mode of clawhole
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ContextVisibilityMode = LiteralKit(["all", "allowlist", "allowlist_quote"]).pipe(
  $I.annoteSchema("ContextVisibilityMode", {
    description: "ContextVisibilityMode - The context visibility mode of clawhole",
  })
);

/**
 * Type of {@link ContextVisibilityMode} {@inheritDoc ContextVisibilityMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ContextVisibilityMode = typeof ContextVisibilityMode.Type;

/**
 * OutboundRetryConfig - The retry config for outbound requests
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class OutboundRetryConfig extends S.Class<OutboundRetryConfig>($I`OutboundRetryConfig`)(
  {
    /** Max retry attempts for outbound requests (default: 3). */
    attempts: PosInt.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(PosInt.makeUnsafe(3))).annotateKey({
      description: "Max retry attempts for outbound requests (default: 3).",
      default: PosInt.makeUnsafe(3),
    }),

    /** Minimum retry delay in ms (default: 300-500ms depending on provider). */
    minDelayMs: S.DurationFromMillis.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(Duration.millis(300) as Duration.Duration & number)
    ).annotateKey({
      description: "Minimum retry delay in ms (default: 300-500ms depending" + " on provider).",
      default: Duration.millis(300),
    }),
    /** Maximum retry delay cap in ms (default: 30000). */
    maxDelayMs: S.DurationFromMillis.pipe(
      S.optionalKey,
      SchemaUtils.withKeyDefaults(Duration.millis(30000) as Duration.Duration & number)
    ).annotateKey({
      description: "Maximum retry delay cap in ms (default: 30000).",
      default: Duration.millis(30000),
    }),

    /** Jitter factor (0-1) applied to delays (default: 0.1). */
    jitter: S.Number.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(0.1)).annotateKey({
      description: "Jitter factor (0-1) applied to delays (default: 0.1).",
    }),
  },
  $I.annote("OutboundRetryConfig", {
    description: "OutboundRetryConfig - The retry config for outbound requests",
  })
) {}

/**
 * BlockStreamingBreakPreference - The break preference for block streaming
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const BlockStreamingBreakPreference = LiteralKit(["paragraph", "newline", "sentence"]).pipe(
  $I.annoteSchema("BlockStreamingBreakPreference", {
    description: "BlockStreamingBreakPreference - The break preference for block streaming",
  })
);

/**
 * Type of {@link BlockStreamingBreakPreference} {@inheritDoc BlockStreamingBreakPreference}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BlockStreamingBreakPreference = typeof BlockStreamingBreakPreference.Type;

/**
 * BlockStreamingCoalesceConfig - The configuration fro coalescing block streaming
 *
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BlockStreamingCoalesceConfig extends S.Class<BlockStreamingCoalesceConfig>(
  $I`BlockStreamingCoalesceConfig`
)(
  {
    minChars: S.OptionFromOptionalKey(NonNegativeInt),
    maxChars: S.OptionFromOptionalKey(NonNegativeInt),
    idleMs: S.OptionFromOptionalKey(S.DurationFromMillis),
  },
  $I.annote("BlockStreamingCoalesceConfig", {
    description: "BlockStreamingCoalesceConfig - The configuration fro coalescing block streaming",
  })
) {}

/**
 * BlockStreamingChunkConfig - The Block Streaming Chunk Config for clawhole
 *
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BlockStreamingChunkConfig extends S.Class<BlockStreamingChunkConfig>($I`BlockStreamingChunkConfig`)(
  {
    minChars: S.OptionFromOptionalKey(NonNegativeInt),
    maxChars: S.OptionFromOptionalKey(NonNegativeInt),
    breakPreference: S.OptionFromOptionalKey(BlockStreamingBreakPreference),
  },
  $I.annote("BlockStreamingChunkConfig", {
    description: "BlockStreamingChunkConfig - The Block Streaming Chunk Config for clawhole",
  })
) {}

/**
 * MarkdownTableMode - The mode for markdown tables
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const MarkdownTableMode = LiteralKit(["off", "bullets", "code", "block"]).pipe(
  $I.annoteSchema("MarkdownTableMode", {
    description: "MarkdownTableMode - The mode for markdown tables",
  })
);

/**
 * Type of {@link MarkdownTableMode} {@inheritDoc MarkdownTableMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type MarkdownTableMode = typeof MarkdownTableMode.Type;

/**
 * AgentElevatedAllowFromConfig - allowlists keyed by provider id (and
 * internal "webchat").
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AgentElevatedAllowFromConfig = S.Record(
  S.String,
  S.Union([S.String, S.Number]).pipe(S.Array, S.OptionFromOptionalKey)
);

/**
 * Type of {@link AgentElevatedAllowFromConfig}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AgentElevatedAllowFromConfig = typeof AgentElevatedAllowFromConfig.Type;
