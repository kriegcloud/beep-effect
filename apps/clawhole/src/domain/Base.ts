/**
 * Base configuration schemas for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw base config types into Effect
 * schemas while preserving the documented config shape, compatibility aliases,
 * and validation boundaries.
 *
 * @module @beep/clawhole/domain/Base
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { ArrayOfStrings, LiteralKit, NonEmptyTrimmedStr, NonNegativeInt, PosInt, SchemaUtils } from "@beep/schema";
import { Duration, flow, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $ClawholeId.create("config/Base");

const baseParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const BYTE_SIZE_PATTERN = /^(\d+(?:\.\d+)?)([a-z]+)?$/;
const SINGLE_DURATION_PATTERN = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/;
const COMPOSITE_DURATION_PATTERN = /(\d+(?:\.\d+)?)(ms|s|m|h|d)/g;

const byteSizeMultipliers = {
  b: 1,
  kb: 1024,
  k: 1024,
  mb: 1024 ** 2,
  m: 1024 ** 2,
  gb: 1024 ** 3,
  g: 1024 ** 3,
  tb: 1024 ** 4,
  t: 1024 ** 4,
} as const;

const durationMultipliers = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

const NonNegativeFiniteNumber = S.Number.check(
  S.makeFilterGroup([S.isFinite({ description: "A finite number." }), S.isGreaterThanOrEqualTo(0)], {
    identifier: $I`NonNegativeFiniteNumberChecks`,
    title: "Non-Negative Finite Number",
    description: "A finite number greater than or equal to 0.",
  })
).pipe(
  $I.annoteSchema("NonNegativeFiniteNumber", {
    description: "A finite number greater than or equal to 0.",
  })
);

const PositiveNumber = S.Number.check(
  S.makeFilterGroup([S.isFinite({ description: "A finite number." }), S.isGreaterThan(0)], {
    identifier: $I`PositiveNumberChecks`,
    title: "Positive Number",
    description: "A finite number greater than 0.",
  })
).pipe(
  $I.annoteSchema("PositiveNumber", {
    description: "A finite number greater than 0.",
  })
);

const UnitIntervalNumber = S.Number.check(
  S.makeFilterGroup(
    [S.isFinite({ description: "A finite number." }), S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1)],
    {
      identifier: $I`UnitIntervalNumberChecks`,
      title: "Unit Interval Number",
      description: "A finite number between 0 and 1 inclusive.",
    }
  )
).pipe(
  $I.annoteSchema("UnitIntervalNumber", {
    description: "A finite number between 0 and 1 inclusive.",
  })
);

const SessionResetAtHour = S.Int.check(
  S.makeFilterGroup([S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(23)], {
    identifier: $I`SessionResetAtHourChecks`,
    title: "Session Reset Hour",
    description: "A local-hour reset boundary between 0 and 23 inclusive.",
  })
).pipe(
  $I.annoteSchema("SessionResetAtHour", {
    description: "A local-hour reset boundary between 0 and 23 inclusive.",
  })
);

const SessionAgentToAgentMaxPingPongTurns = S.Int.check(
  S.makeFilterGroup([S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(5)], {
    identifier: $I`SessionAgentToAgentMaxPingPongTurnsChecks`,
    title: "Session Agent-To-Agent Max Ping-Pong Turns",
    description: "An integer turn limit between 0 and 5 inclusive for agent-to-agent ping-pong exchanges.",
  })
).pipe(
  $I.annoteSchema("SessionAgentToAgentMaxPingPongTurns", {
    description: "An integer turn limit between 0 and 5 inclusive for agent-to-agent ping-pong exchanges.",
  })
);

const SessionSendPolicyChatType = LiteralKit(["direct", "group", "channel", "dm"] as const).pipe(
  $I.annoteSchema("SessionSendPolicyChatType", {
    description:
      "Accepted chat-type selector for session send-policy rules, including the deprecated `dm` alias for backward compatibility.",
  })
);

const HumanDelayMode = LiteralKit(["off", "natural", "custom"] as const).pipe(
  $I.annoteSchema("HumanDelayMode", {
    description: "Delay style applied to block replies: disabled, natural, or fully custom.",
  })
);

const LoggingLevel = LiteralKit(["silent", "fatal", "error", "warn", "info", "debug", "trace"] as const).pipe(
  $I.annoteSchema("LoggingLevel", {
    description: "Supported runtime logging thresholds for console and file sinks.",
  })
);

const LoggingConsoleStyle = LiteralKit(["pretty", "compact", "json"] as const).pipe(
  $I.annoteSchema("LoggingConsoleStyle", {
    description: "Supported console log formatting styles.",
  })
);

const LoggingRedactSensitiveMode = LiteralKit(["off", "tools"] as const).pipe(
  $I.annoteSchema("LoggingRedactSensitiveMode", {
    description: "Sensitive-data redaction modes supported by the runtime logger.",
  })
);

const DiagnosticsOtelProtocol = LiteralKit(["http/protobuf", "grpc"] as const).pipe(
  $I.annoteSchema("DiagnosticsOtelProtocol", {
    description: "Supported OpenTelemetry export protocols for diagnostics OTEL transport.",
  })
);

const AgentElevatedAllowFromEntry = S.Union([S.String, S.Number]).pipe(
  $I.annoteSchema("AgentElevatedAllowFromEntry", {
    description: "A single elevated-tool allowlist sender identifier as either a string or number.",
  })
);

const parseSessionMaintenanceByteSizeString = (value: string): O.Option<number> =>
  pipe(
    value,
    Str.trim,
    Str.toLowerCase,
    Str.match(BYTE_SIZE_PATTERN),
    O.flatMap((match) => {
      const numericValue = Number(match[1]);
      if (!Number.isFinite(numericValue) || numericValue < 0) {
        return O.none();
      }

      const unit = (match[2] ?? "b") as keyof typeof byteSizeMultipliers;
      const multiplier = byteSizeMultipliers[unit];

      if (P.isUndefined(multiplier)) {
        return O.none();
      }

      const bytes = Math.round(numericValue * multiplier);
      return Number.isFinite(bytes) ? O.some(bytes) : O.none();
    })
  );

const parseSessionMaintenanceDurationString = (raw: string): O.Option<number> => {
  const trimmed = pipe(raw, Str.trim, Str.toLowerCase);

  if (Str.isEmpty(trimmed)) {
    return O.none();
  }

  const single = SINGLE_DURATION_PATTERN.exec(trimmed);

  if (!P.isNull(single)) {
    const value = Number(single[1]);
    if (!Number.isFinite(value) || value < 0) {
      return O.none();
    }

    const unit = (single[2] ?? "d") as keyof typeof durationMultipliers;
    const milliseconds = Math.round(value * durationMultipliers[unit]);
    return Number.isFinite(milliseconds) ? O.some(milliseconds) : O.none();
  }

  let totalMilliseconds = 0;
  let consumed = 0;

  for (const match of trimmed.matchAll(COMPOSITE_DURATION_PATTERN)) {
    const [full, valueRaw, unitRaw] = match;
    const index = match.index ?? -1;

    if (index < 0 || index !== consumed) {
      return O.none();
    }

    const value = Number(valueRaw);
    const unit = unitRaw as keyof typeof durationMultipliers;
    const multiplier = durationMultipliers[unit];

    if (!Number.isFinite(value) || value < 0 || P.isUndefined(multiplier)) {
      return O.none();
    }

    totalMilliseconds += value * multiplier;
    consumed += full.length;
  }

  if (consumed !== trimmed.length || consumed === 0) {
    return O.none();
  }

  const milliseconds = Math.round(totalMilliseconds);
  return Number.isFinite(milliseconds) ? O.some(milliseconds) : O.none();
};

const SessionMaintenanceDurationString = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => O.isSome(parseSessionMaintenanceDurationString(value)), {
    identifier: $I`SessionMaintenanceDurationStringCheck`,
    title: "Session Maintenance Duration String",
    description: "A non-empty trimmed duration string such as `30d`, `12h`, or `1h30m`.",
    message: "Expected a valid duration string such as 30d, 12h, or 1h30m",
  })
).pipe(
  $I.annoteSchema("SessionMaintenanceDurationString", {
    description: "A non-empty trimmed duration string accepted by session maintenance settings.",
  })
);

const SessionMaintenanceByteSizeString = NonEmptyTrimmedStr.check(
  S.makeFilter((value: string) => O.isSome(parseSessionMaintenanceByteSizeString(value)), {
    identifier: $I`SessionMaintenanceByteSizeStringCheck`,
    title: "Session Maintenance Byte-Size String",
    description: "A non-empty trimmed byte-size string such as `500mb`, `10gb`, or `1024`.",
    message: "Expected a valid byte-size string such as 500mb, 10gb, or 1024",
  })
).pipe(
  $I.annoteSchema("SessionMaintenanceByteSizeString", {
    description: "A non-empty trimmed byte-size string accepted by session maintenance settings.",
  })
);

const SessionMaintenanceDurationInput = S.Union([NonNegativeFiniteNumber, SessionMaintenanceDurationString]).pipe(
  $I.annoteSchema("SessionMaintenanceDurationInput", {
    description:
      "A session maintenance duration input accepted as either a non-negative number or compact duration string.",
  })
);

const SessionMaintenanceByteSizeInput = S.Union([NonNegativeFiniteNumber, SessionMaintenanceByteSizeString]).pipe(
  $I.annoteSchema("SessionMaintenanceByteSizeInput", {
    description: "A session maintenance byte-size input accepted as either a non-negative number or byte-size string.",
  })
);

const SessionMaintenanceResetArchiveRetentionInput = S.Union([S.Literal(false), SessionMaintenanceDurationInput]).pipe(
  $I.annoteSchema("SessionMaintenanceResetArchiveRetentionInput", {
    description:
      "Reset-archive retention accepted as `false` to disable cleanup or as a non-negative number / compact duration string.",
  })
);

/**
 * Chat conversation classification used by send-policy matches and related base
 * config entries.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ChatType = LiteralKit(["direct", "group", "channel"] as const).pipe(
  SchemaUtils.withStatics((schema) => ({
    normalize: (raw?: string): O.Option<ChatType> =>
      pipe(
        raw,
        O.fromNullishOr,
        O.map(flow(Str.trim, Str.toLowerCase)),
        O.map((value) => (value === "dm" ? "direct" : value)),
        O.flatMap(S.decodeUnknownOption(schema))
      ),
  })),
  $I.annoteSchema("ChatType", {
    description: "Chat conversation classification used by send-policy matches and related base config entries.",
  })
);

/**
 * Type of {@link ChatType}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ChatType = typeof ChatType.Type;

/**
 * Supported reply rendering modes for command and text response output.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ReplyMode = LiteralKit(["text", "command"] as const).pipe(
  $I.annoteSchema("ReplyMode", {
    description: "Supported reply rendering modes for command and text response output.",
  })
);

/**
 * Type of {@link ReplyMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ReplyMode = typeof ReplyMode.Type;

/**
 * Supported typing indicator modes for channel replies.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TypingMode = LiteralKit(["never", "instant", "thinking", "message"] as const).pipe(
  $I.annoteSchema("TypingMode", {
    description: "Supported typing indicator modes for channel replies.",
  })
);

/**
 * Type of {@link TypingMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TypingMode = typeof TypingMode.Type;

/**
 * Base session grouping strategies used by session config.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SessionScope = LiteralKit(["per-sender", "global"] as const).pipe(
  $I.annoteSchema("SessionScope", {
    description: "Base session grouping strategies used by session config.",
  })
);

/**
 * Type of {@link SessionScope}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SessionScope = typeof SessionScope.Type;

/**
 * DM session scoping modes used to control how direct-message sessions are
 * keyed.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DmScope = LiteralKit(["main", "per-peer", "per-channel-peer", "per-account-channel-peer"] as const).pipe(
  $I.annoteSchema("DmScope", {
    description: "DM session scoping modes used to control how direct-message sessions are keyed.",
  })
);

/**
 * Type of {@link DmScope}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type DmScope = typeof DmScope.Type;

/**
 * Reply-thread targeting modes for providers that support reply chaining.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ReplyToMode = LiteralKit(["off", "first", "all"] as const).pipe(
  $I.annoteSchema("ReplyToMode", {
    description: "Reply-thread targeting modes for providers that support reply chaining.",
  })
);

/**
 * Type of {@link ReplyToMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ReplyToMode = typeof ReplyToMode.Type;

/**
 * Group-message handling policies for channel configs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GroupPolicy = LiteralKit(["open", "disabled", "allowlist"] as const).pipe(
  $I.annoteSchema("GroupPolicy", {
    description: "Group-message handling policies for channel configs.",
  })
);

/**
 * Type of {@link GroupPolicy}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GroupPolicy = typeof GroupPolicy.Type;

/**
 * Direct-message access policies for channel configs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DmPolicy = LiteralKit(["pairing", "allowlist", "open", "disabled"] as const).pipe(
  $I.annoteSchema("DmPolicy", {
    description: "Direct-message access policies for channel configs.",
  })
);

/**
 * Type of {@link DmPolicy}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type DmPolicy = typeof DmPolicy.Type;

/**
 * Context-visibility policies for provider and reply config surfaces.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ContextVisibilityMode = LiteralKit(["all", "allowlist", "allowlist_quote"] as const).pipe(
  $I.annoteSchema("ContextVisibilityMode", {
    description: "Context-visibility policies for provider and reply config surfaces.",
  })
);

/**
 * Type of {@link ContextVisibilityMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ContextVisibilityMode = typeof ContextVisibilityMode.Type;

/**
 * Retry policy overrides for outbound provider requests.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class OutboundRetryConfig extends S.Class<OutboundRetryConfig>($I`OutboundRetryConfig`)(
  {
    attempts: PosInt.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(PosInt.makeUnsafe(3))).annotateKey({
      description: "Max retry attempts for outbound requests (default: 3).",
      default: PosInt.makeUnsafe(3),
    }),
    minDelayMs: S.DurationFromMillis.pipe(
      S.optionalKey,
      S.withConstructorDefault(() => O.some(Duration.millis(300))),
      S.withDecodingDefaultKey(() => 300)
    ).annotateKey({
      description: "Minimum retry delay in ms (default: 300-500ms depending on provider).",
      default: Duration.millis(300),
    }),
    maxDelayMs: S.DurationFromMillis.pipe(
      S.optionalKey,
      S.withConstructorDefault(() => O.some(Duration.millis(30_000))),
      S.withDecodingDefaultKey(() => 30_000)
    ).annotateKey({
      description: "Maximum retry delay cap in ms (default: 30000).",
      default: Duration.millis(30_000),
    }),
    jitter: UnitIntervalNumber.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(0.1)).annotateKey({
      description: "Jitter factor (0-1) applied to delays (default: 0.1).",
      default: 0.1,
    }),
  },
  $I.annote("OutboundRetryConfig", {
    description: "Retry policy overrides for outbound provider requests.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Break-preference hints used by block-streaming chunking config.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const BlockStreamingBreakPreference = LiteralKit(["paragraph", "newline", "sentence"] as const).pipe(
  $I.annoteSchema("BlockStreamingBreakPreference", {
    description: "Break-preference hints used by block-streaming chunking config.",
  })
);

/**
 * Type of {@link BlockStreamingBreakPreference}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type BlockStreamingBreakPreference = typeof BlockStreamingBreakPreference.Type;

/**
 * Coalescing thresholds for streamed block replies.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BlockStreamingCoalesceConfig extends S.Class<BlockStreamingCoalesceConfig>(
  $I`BlockStreamingCoalesceConfig`
)(
  {
    minChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Minimum buffered character count before a coalesced block is emitted.",
    }),
    maxChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum buffered character count before a coalesced block is flushed.",
    }),
    idleMs: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey({
      description: "Idle timeout in milliseconds before buffered streamed text is flushed.",
    }),
  },
  $I.annote("BlockStreamingCoalesceConfig", {
    description: "Coalescing thresholds for streamed block replies.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Chunking thresholds for streamed block replies.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class BlockStreamingChunkConfig extends S.Class<BlockStreamingChunkConfig>($I`BlockStreamingChunkConfig`)(
  {
    minChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Minimum chunk size in characters before a streamed block is emitted.",
    }),
    maxChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum chunk size in characters before a streamed block is split.",
    }),
    breakPreference: S.OptionFromOptionalKey(BlockStreamingBreakPreference).annotateKey({
      description: "Preferred boundary type when choosing where to split streamed block chunks.",
    }),
  },
  $I.annote("BlockStreamingChunkConfig", {
    description: "Chunking thresholds for streamed block replies.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Table-rendering modes for markdown output.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const MarkdownTableMode = LiteralKit(["off", "bullets", "code", "block"] as const).pipe(
  $I.annoteSchema("MarkdownTableMode", {
    description: "Table-rendering modes for markdown output.",
  })
);

/**
 * Type of {@link MarkdownTableMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type MarkdownTableMode = typeof MarkdownTableMode.Type;

/**
 * Markdown rendering overrides shared by channel/provider configs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MarkdownConfig extends S.Class<MarkdownConfig>($I`MarkdownConfig`)(
  {
    tables: S.OptionFromOptionalKey(MarkdownTableMode).annotateKey({
      description: "Table rendering mode (off|bullets|code|block).",
    }),
  },
  $I.annote("MarkdownConfig", {
    description: "Markdown rendering overrides shared by channel and provider configs.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Humanized delay overrides for block reply delivery.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class HumanDelayConfig extends S.Class<HumanDelayConfig>($I`HumanDelayConfig`)(
  {
    mode: S.OptionFromOptionalKey(HumanDelayMode).annotateKey({
      description: "Delay style for block replies (`off`, `natural`, or `custom`).",
    }),
    minMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Minimum delay in milliseconds for custom human-delay behavior.",
    }),
    maxMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum delay in milliseconds for custom human-delay behavior.",
    }),
  },
  $I.annote("HumanDelayConfig", {
    description: "Humanized delay overrides for block reply delivery.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Allow-or-deny actions used by session send-policy rules.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SessionSendPolicyAction = LiteralKit(["allow", "deny"] as const).pipe(
  $I.annoteSchema("SessionSendPolicyAction", {
    description: "Allow-or-deny actions used by session send-policy rules.",
  })
);

/**
 * Type of {@link SessionSendPolicyAction}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SessionSendPolicyAction = typeof SessionSendPolicyAction.Type;

/**
 * Match conditions used to scope a session send-policy rule.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionSendPolicyMatch extends S.Class<SessionSendPolicyMatch>($I`SessionSendPolicyMatch`)(
  {
    channel: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional channel/provider identifier matched by the rule.",
    }),
    chatType: S.OptionFromOptionalKey(SessionSendPolicyChatType).annotateKey({
      description:
        "Optional chat-type selector matched by the rule. The deprecated `dm` alias is accepted for backward compatibility.",
    }),
    keyPrefix: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional normalized session-key prefix matched by the rule.",
    }),
    rawKeyPrefix: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional raw, unnormalized session-key prefix matched by the rule.",
    }),
  },
  $I.annote("SessionSendPolicyMatch", {
    description: "Match conditions used to scope a session send-policy rule.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * One ordered session send-policy rule.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionSendPolicyRule extends S.Class<SessionSendPolicyRule>($I`SessionSendPolicyRule`)(
  {
    action: SessionSendPolicyAction.annotateKey({
      description: "Allow-or-deny decision applied when the optional rule match conditions succeed.",
    }),
    match: S.OptionFromOptionalKey(SessionSendPolicyMatch).annotateKey({
      description: "Optional match conditions that scope when this rule applies.",
    }),
  },
  $I.annote("SessionSendPolicyRule", {
    description: "One ordered session send-policy rule.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Session send-policy configuration controlling cross-session delivery rules.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionSendPolicyConfig extends S.Class<SessionSendPolicyConfig>($I`SessionSendPolicyConfig`)(
  {
    default: S.OptionFromOptionalKey(SessionSendPolicyAction).annotateKey({
      description: "Fallback action applied when no explicit session send-policy rule matches.",
    }),
    rules: SessionSendPolicyRule.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
      description: "Ordered allow-or-deny rules evaluated before the fallback action.",
    }),
  },
  $I.annote("SessionSendPolicyConfig", {
    description: "Session send-policy configuration controlling cross-session delivery rules.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Session reset strategy modes used by reset config entries.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SessionResetMode = LiteralKit(["daily", "idle"] as const).pipe(
  $I.annoteSchema("SessionResetMode", {
    description: "Session reset strategy modes used by reset config entries.",
  })
);

/**
 * Type of {@link SessionResetMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SessionResetMode = typeof SessionResetMode.Type;

/**
 * One reset policy entry for session reuse behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionResetConfig extends S.Class<SessionResetConfig>($I`SessionResetConfig`)(
  {
    mode: S.OptionFromOptionalKey(SessionResetMode).annotateKey({
      description: "Reset strategy used by the policy (`daily` or `idle`).",
    }),
    atHour: S.OptionFromOptionalKey(SessionResetAtHour).annotateKey({
      description: "Local hour (0-23) used as the daily reset boundary.",
    }),
    idleMinutes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Sliding idle window in minutes before a session is considered stale.",
    }),
  },
  $I.annote("SessionResetConfig", {
    description: "One reset policy entry for session reuse behavior.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Reset-policy overrides keyed by chat type.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionResetByTypeConfig extends S.Class<SessionResetByTypeConfig>($I`SessionResetByTypeConfig`)(
  {
    direct: S.OptionFromOptionalKey(SessionResetConfig).annotateKey({
      description: "Reset policy override applied to direct-chat sessions.",
    }),
    dm: S.OptionFromOptionalKey(SessionResetConfig).annotateKey({
      description: "Deprecated alias for `direct`, kept for backward compatibility with older configs.",
    }),
    group: S.OptionFromOptionalKey(SessionResetConfig).annotateKey({
      description: "Reset policy override applied to group-chat sessions.",
    }),
    thread: S.OptionFromOptionalKey(SessionResetConfig).annotateKey({
      description: "Reset policy override applied to thread-scoped sessions.",
    }),
  },
  $I.annote("SessionResetByTypeConfig", {
    description: "Reset-policy overrides keyed by chat type.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Shared defaults for thread-bound session routing behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionThreadBindingsConfig extends S.Class<SessionThreadBindingsConfig>($I`SessionThreadBindingsConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Master switch for thread-bound session routing features.",
    }),
    idleHours: S.OptionFromOptionalKey(NonNegativeFiniteNumber).annotateKey({
      description: "Inactivity window in hours before a thread-bound session auto-unfocuses.",
    }),
    maxAgeHours: S.OptionFromOptionalKey(NonNegativeFiniteNumber).annotateKey({
      description: "Optional hard max age in hours before a thread-bound session auto-unfocuses.",
    }),
  },
  $I.annote("SessionThreadBindingsConfig", {
    description: "Shared defaults for thread-bound session routing behavior.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Agent-to-agent session exchange controls.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionAgentToAgentConfig extends S.Class<SessionAgentToAgentConfig>($I`SessionAgentToAgentConfig`)(
  {
    maxPingPongTurns: S.OptionFromOptionalKey(SessionAgentToAgentMaxPingPongTurns).annotateKey({
      description: "Max ping-pong turns between requester and target agents (0-5).",
    }),
  },
  $I.annote("SessionAgentToAgentConfig", {
    description: "Agent-to-agent session exchange controls.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Session-store maintenance modes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const SessionMaintenanceMode = LiteralKit(["enforce", "warn"] as const).pipe(
  $I.annoteSchema("SessionMaintenanceMode", {
    description: "Session-store maintenance modes.",
  })
);

/**
 * Type of {@link SessionMaintenanceMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type SessionMaintenanceMode = typeof SessionMaintenanceMode.Type;

/**
 * Automatic maintenance controls for persisted session stores.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionMaintenanceConfig extends S.Class<SessionMaintenanceConfig>($I`SessionMaintenanceConfig`)(
  {
    mode: S.OptionFromOptionalKey(SessionMaintenanceMode).annotateKey({
      description: "Whether maintenance policies are only reported (`warn`) or actively enforced (`enforce`).",
    }),
    pruneAfter: S.OptionFromOptionalKey(SessionMaintenanceDurationInput).annotateKey({
      description: "Maximum age retained for session entries as a non-negative number or compact duration string.",
    }),
    pruneDays: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Deprecated day-count retention override. Use `pruneAfter` instead.",
    }),
    maxEntries: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum number of session entries retained in the store.",
    }),
    rotateBytes: S.OptionFromOptionalKey(SessionMaintenanceByteSizeInput).annotateKey({
      description: "Maximum session-store file size before rotation, as a non-negative number or byte-size string.",
    }),
    resetArchiveRetention: S.OptionFromOptionalKey(SessionMaintenanceResetArchiveRetentionInput).annotateKey({
      description: "Retention window for reset transcript archives, or `false` to disable archive cleanup.",
    }),
    maxDiskBytes: S.OptionFromOptionalKey(SessionMaintenanceByteSizeInput).annotateKey({
      description:
        "Optional per-agent disk budget for session-store data as a non-negative number or byte-size string.",
    }),
    highWaterBytes: S.OptionFromOptionalKey(SessionMaintenanceByteSizeInput).annotateKey({
      description: "Target size after disk-budget cleanup as a non-negative number or byte-size string.",
    }),
  },
  $I.annote("SessionMaintenanceConfig", {
    description: "Automatic maintenance controls for persisted session stores.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Top-level session configuration shared by OpenClaw-style agents and channels.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class SessionConfig extends S.Class<SessionConfig>($I`SessionConfig`)(
  {
    scope: S.OptionFromOptionalKey(SessionScope).annotateKey({
      description: "Base session grouping strategy (`per-sender` or `global`).",
    }),
    dmScope: S.OptionFromOptionalKey(DmScope).annotateKey({
      description: "DM session scoping override applied to direct-message continuity keys.",
    }),
    identityLinks: S.OptionFromOptionalKey(S.Record(S.String, ArrayOfStrings)).annotateKey({
      description:
        "Canonical identity mappings keyed by canonical id and containing platform-prefixed peer identifiers.",
    }),
    resetTriggers: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Inbound message triggers that force a session reset when matched.",
    }),
    idleMinutes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Legacy idle reset window in minutes kept for backward compatibility.",
    }),
    reset: S.OptionFromOptionalKey(SessionResetConfig).annotateKey({
      description: "Default reset policy applied when no type-specific or channel-specific override exists.",
    }),
    resetByType: S.OptionFromOptionalKey(SessionResetByTypeConfig).annotateKey({
      description: "Reset-policy overrides keyed by chat type.",
    }),
    resetByChannel: S.OptionFromOptionalKey(S.Record(S.String, SessionResetConfig)).annotateKey({
      description: "Channel-specific reset-policy overrides keyed by provider or channel identifier.",
    }),
    store: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional path to the persisted session store backing this runtime.",
    }),
    typingIntervalSeconds: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Interval in seconds for repeated typing indicators while replies are prepared.",
    }),
    typingMode: S.OptionFromOptionalKey(TypingMode).annotateKey({
      description: "Typing indicator mode applied while replies are being prepared.",
    }),
    parentForkMaxTokens: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum parent transcript token count allowed before session forking is skipped.",
    }),
    mainKey: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional canonical main session key override used for continuity anchoring.",
    }),
    sendPolicy: S.OptionFromOptionalKey(SessionSendPolicyConfig).annotateKey({
      description: "Cross-session send permissions controlling where session tools may deliver messages.",
    }),
    agentToAgent: S.OptionFromOptionalKey(SessionAgentToAgentConfig).annotateKey({
      description: "Loop-prevention controls for agent-to-agent exchanges.",
    }),
    threadBindings: S.OptionFromOptionalKey(SessionThreadBindingsConfig).annotateKey({
      description: "Shared defaults for thread-bound session routing workflows.",
    }),
    maintenance: S.OptionFromOptionalKey(SessionMaintenanceConfig).annotateKey({
      description: "Automatic maintenance controls for persisted session-store data.",
    }),
  },
  $I.annote("SessionConfig", {
    description: "Top-level session configuration shared by OpenClaw-style agents and channels.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Logging configuration for severity, output, and redaction behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class LoggingConfig extends S.Class<LoggingConfig>($I`LoggingConfig`)(
  {
    level: S.OptionFromOptionalKey(LoggingLevel).annotateKey({
      description: "Primary log level threshold applied to runtime logger output.",
    }),
    file: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional file path for persisted log output.",
    }),
    maxFileBytes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum size of a single log file in bytes before writes are suppressed.",
    }),
    consoleLevel: S.OptionFromOptionalKey(LoggingLevel).annotateKey({
      description: "Console-specific log level threshold for terminal output.",
    }),
    consoleStyle: S.OptionFromOptionalKey(LoggingConsoleStyle).annotateKey({
      description: "Console output style: `pretty`, `compact`, or `json`.",
    }),
    redactSensitive: S.OptionFromOptionalKey(LoggingRedactSensitiveMode).annotateKey({
      description: "Sensitive redaction mode for tool and config payloads.",
    }),
    redactPatterns: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Additional custom regular-expression strings used to redact log output.",
    }),
  },
  $I.annote("LoggingConfig", {
    description: "Logging configuration for severity, output, and redaction behavior.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * OpenTelemetry export settings used by diagnostics config.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class DiagnosticsOtelConfig extends S.Class<DiagnosticsOtelConfig>($I`DiagnosticsOtelConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether OTEL export is enabled for diagnostics.",
    }),
    endpoint: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Collector endpoint URL used for OpenTelemetry export.",
    }),
    protocol: S.OptionFromOptionalKey(DiagnosticsOtelProtocol).annotateKey({
      description: "OpenTelemetry transport protocol used by diagnostics export.",
    }),
    headers: S.OptionFromOptionalKey(S.Record(S.String, S.String)).annotateKey({
      description: "Additional OTEL export headers keyed by header name.",
    }),
    serviceName: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Service name reported in OTEL resource attributes.",
    }),
    traces: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether trace signals are exported.",
    }),
    metrics: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether metric signals are exported.",
    }),
    logs: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether log signals are exported.",
    }),
    sampleRate: S.OptionFromOptionalKey(UnitIntervalNumber).annotateKey({
      description: "Trace sample rate between 0 and 1 inclusive.",
    }),
    flushIntervalMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Metric export interval in milliseconds.",
    }),
  },
  $I.annote("DiagnosticsOtelConfig", {
    description: "OpenTelemetry export settings used by diagnostics config.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Cache-trace diagnostics settings for embedded or cached execution paths.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class DiagnosticsCacheTraceConfig extends S.Class<DiagnosticsCacheTraceConfig>($I`DiagnosticsCacheTraceConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether cache-trace logging is enabled.",
    }),
    filePath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional JSONL output path for cache-trace logs.",
    }),
    includeMessages: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether full message payloads are included in cache-trace output.",
    }),
    includePrompt: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether prompt text is included in cache-trace output.",
    }),
    includeSystem: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether system prompt text is included in cache-trace output.",
    }),
  },
  $I.annote("DiagnosticsCacheTraceConfig", {
    description: "Cache-trace diagnostics settings for embedded or cached execution paths.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Top-level diagnostics configuration for ad-hoc tracing and cache inspection.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class DiagnosticsConfig extends S.Class<DiagnosticsConfig>($I`DiagnosticsConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether diagnostics features are enabled.",
    }),
    flags: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Optional ad-hoc diagnostics flags such as `telegram.http`.",
    }),
    stuckSessionWarnMs: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Threshold in milliseconds before a processing session is reported as stuck.",
    }),
    otel: S.OptionFromOptionalKey(DiagnosticsOtelConfig).annotateKey({
      description: "OpenTelemetry export settings for diagnostics signals.",
    }),
    cacheTrace: S.OptionFromOptionalKey(DiagnosticsCacheTraceConfig).annotateKey({
      description: "Cache-trace logging settings for embedded or cached execution paths.",
    }),
  },
  $I.annote("DiagnosticsConfig", {
    description: "Top-level diagnostics configuration for ad-hoc tracing and cache inspection.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Web reconnect backoff policy for web-based channel runtimes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class WebReconnectConfig extends S.Class<WebReconnectConfig>($I`WebReconnectConfig`)(
  {
    initialMs: S.OptionFromOptionalKey(PositiveNumber).annotateKey({
      description: "Initial reconnect delay in milliseconds before the first retry.",
    }),
    maxMs: S.OptionFromOptionalKey(PositiveNumber).annotateKey({
      description: "Maximum reconnect delay cap in milliseconds.",
    }),
    factor: S.OptionFromOptionalKey(PositiveNumber).annotateKey({
      description: "Exponential backoff multiplier applied between reconnect attempts.",
    }),
    jitter: S.OptionFromOptionalKey(UnitIntervalNumber).annotateKey({
      description: "Randomization factor between 0 and 1 applied to reconnect delays.",
    }),
    maxAttempts: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum reconnect attempts before giving up for the current failure sequence (0 disables retries).",
    }),
  },
  $I.annote("WebReconnectConfig", {
    description: "Web reconnect backoff policy for web-based channel runtimes.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Web channel runtime settings for heartbeat and reconnect behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class WebConfig extends S.Class<WebConfig>($I`WebConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "If false, do not start the web provider runtime.",
    }),
    heartbeatSeconds: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Heartbeat interval in seconds for web channel connectivity checks.",
    }),
    reconnect: S.OptionFromOptionalKey(WebReconnectConfig).annotateKey({
      description: "Reconnect backoff policy applied after web transport failures.",
    }),
  },
  $I.annote("WebConfig", {
    description: "Web channel runtime settings for heartbeat and reconnect behavior.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Human-facing identity metadata surfaced by agents or runtime profiles.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class IdentityConfig extends S.Class<IdentityConfig>($I`IdentityConfig`)(
  {
    name: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional display name presented for the identity.",
    }),
    theme: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional theme identifier or style hint associated with the identity.",
    }),
    emoji: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional emoji presented alongside the identity.",
    }),
    avatar: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Avatar image path, remote URL, or data URI used for the identity.",
    }),
  },
  $I.annote("IdentityConfig", {
    description: "Human-facing identity metadata surfaced by agents or runtime profiles.",
    parseOptions: baseParseOptions,
  })
) {}

/**
 * Allowlists keyed by provider id for elevated-tool sender authorization.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AgentElevatedAllowFromConfig = S.Record(S.String, S.Array(AgentElevatedAllowFromEntry)).pipe(
  $I.annoteSchema("AgentElevatedAllowFromConfig", {
    description: 'Allowlists keyed by provider id, including the internal `"webchat"` provider.',
  })
);

/**
 * Type of {@link AgentElevatedAllowFromConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AgentElevatedAllowFromConfig = typeof AgentElevatedAllowFromConfig.Type;
