/**
 * Schema-first cron configuration models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw cron config types into Effect
 * schemas while preserving the documented config surface and validating the
 * accepted wire encodings at the boundary.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { Duration } from "effect"
 * import { CronConfig } from "@beep/clawhole/domain/Cron"
 *
 * const decodeCronConfig = S.decodeUnknownSync(CronConfig)
 *
 * const cron = decodeCronConfig({
 *   sessionRetention: "1h30m",
 *   runLog: {
 *     maxBytes: "5mb"
 *   }
 * })
 *
 * if (cron.sessionRetention !== false) {
 *   console.log(Duration.toMillis(cron.sessionRetention)) // 5400000
 * }
 * console.log(cron.runLog.maxBytes) // "5mb"
 * ```
 *
 * @module @beep/clawhole/domain/Cron
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { FilePath, LiteralKit, NonEmptyTrimmedStr, SchemaUtils } from "@beep/schema";
import { thunkEmptyRecord, thunkFalse, thunkSome } from "@beep/utils";
import { Duration, Effect, flow, pipe, Result, SchemaGetter, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SecretInput } from "./Secrets.ts";

const $I = $ClawholeId.create("domain/Cron");

/**
 * Transient error kinds that can trigger retries for one-shot cron jobs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const CronRetryOn = LiteralKit(["rate_limit", "overloaded", "network", "timeout", "server_error"] as const).pipe(
  $I.annoteSchema("CronRetryOn", {
    description: "Transient cron error kinds that may trigger retry behavior for one-shot jobs.",
  })
);

/**
 * Type of {@link CronRetryOn}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type CronRetryOn = typeof CronRetryOn.Type;

const defaultRetryBackoffMsEncoded = () => A.make(30_000, 60_000, 300_000);
const defaultRetryBackoffMs = A.make(Duration.seconds(30), Duration.minutes(1), Duration.minutes(5));
const defaultRetryOn: ReadonlyArray<CronRetryOn> = ["rate_limit", "overloaded", "network", "timeout", "server_error"];
const defaultSessionRetention = Duration.hours(24);
const defaultSessionRetentionEncoded = () => "24h";

const httpProtocols = A.make("http:", "https:");

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

const isHttpProtocol = (value: string): boolean => pipe(httpProtocols, A.contains(value));

const isHttpUrlString = (value: string): boolean =>
  pipe(
    Result.try(() => new URL(value)),
    Result.map((url) => isHttpProtocol(url.protocol)),
    Result.getOrElse(thunkFalse)
  );

const parseByteSizeString = (value: string): O.Option<number> =>
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

const invalidDurationInputIssue = (input: string) =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message: "Expected a valid duration input.",
  });

const parseCronDurationString = (raw: string): O.Option<Duration.Duration> => {
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

    const unit = (single[2] ?? "h") as keyof typeof durationMultipliers;
    const milliseconds = Math.round(value * durationMultipliers[unit]);
    return Number.isFinite(milliseconds) ? O.some(Duration.millis(milliseconds)) : O.none();
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
  return Number.isFinite(milliseconds) ? O.some(Duration.millis(milliseconds)) : O.none();
};

const decodeCronDurationString = (input: string): Effect.Effect<Duration.Duration, SchemaIssue.Issue> =>
  pipe(
    parseCronDurationString(input),
    O.match({
      onNone: () => Effect.fail(invalidDurationInputIssue(input)),
      onSome: Effect.succeed,
    })
  );

const HttpUrlString = NonEmptyTrimmedStr.check(
  S.makeFilter(isHttpUrlString, {
    identifier: $I`HttpUrlStringCheck`,
    title: "HTTP URL String",
    description: "A non-empty trimmed absolute http:// or https:// URL string.",
    message: "Expected an absolute http:// or https:// URL.",
  })
).pipe(
  S.brand("HttpUrlString"),
  $I.annoteSchema("HttpUrlString", {
    description: "A non-empty trimmed absolute webhook URL using the http or https protocol.",
  })
);

const ByteSizeString = NonEmptyTrimmedStr.check(
  S.makeFilter(flow(parseByteSizeString, O.isSome), {
    identifier: $I`ByteSizeStringCheck`,
    title: "Byte Size String",
    description: "A non-empty trimmed byte-size string such as 2mb or 512kb.",
    message: "Expected a valid byte-size string such as 2mb, 512kb, or 2000000.",
  })
).pipe(
  S.brand("ByteSizeString"),
  $I.annoteSchema("ByteSizeString", {
    description: "A non-empty trimmed byte-size string accepted by cron run-log pruning config.",
  })
);

const CronDurationFromString = NonEmptyTrimmedStr.pipe(
  S.decodeTo(S.Duration, {
    decode: SchemaGetter.transformOrFail(decodeCronDurationString),
    encode: SchemaGetter.forbidden(
      () => "Encoding CronDurationFromString results back to the original duration string is not supported"
    ),
  }),
  $I.annoteSchema("CronDurationFromString", {
    description: "A one-way schema that decodes compact OpenClaw duration strings such as 24h or 1h30m.",
  })
);

const CronRetryBackoff = S.Array(S.DurationFromMillis)
  .check(S.makeFilterGroup([S.isMinLength(1), S.isMaxLength(10)]))
  .pipe(
    S.withConstructorDefault(thunkSome(defaultRetryBackoffMs)),
    S.withDecodingDefaultKey(defaultRetryBackoffMsEncoded),
    $I.annoteSchema("CronRetryBackoff", {
      description: "Retry backoff delays decoded from millisecond inputs into Effect Duration values.",
    })
  );

const CronSessionRetention = S.Union([S.Literal(false), CronDurationFromString]).pipe(
  S.withConstructorDefault(thunkSome(defaultSessionRetention)),
  S.withDecodingDefaultKey(defaultSessionRetentionEncoded),
  $I.annoteSchema("CronSessionRetention", {
    description:
      "How long completed cron run sessions are retained, decoded from duration input or disabled with false.",
  })
);

const CronRunLogMaxBytes = S.Union([
  S.Number.check(
    S.makeFilterGroup([
      S.isFinite({
        description: "A finite number.",
      }),
      S.isGreaterThanOrEqualTo(0),
    ])
  ),
  ByteSizeString,
]).pipe(
  $I.annoteSchema("CronRunLogMaxBytes", {
    description: "The accepted cron run-log max-bytes input, as either a non-negative number or a byte-size string.",
  })
);

const CronFailureMode = LiteralKit(["announce", "webhook"] as const).pipe(
  $I.annoteSchema("CronFailureMode", {
    description: "Delivery modes supported by cron failure alerts and destinations.",
  })
);

const defaultRetryConfig = () => new CronRetryConfig({});
const defaultRunLogConfig = () => new CronRunLogConfig({});

/**
 * Retry policy overrides for one-shot cron jobs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CronRetryConfig extends S.Class<CronRetryConfig>($I`CronRetryConfig`)(
  {
    maxAttempts: SchemaUtils.withKeyDefaults(
      S.Int.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(10)])),
      3
    ).annotateKey({
      description: "Maximum retries before a one-shot cron job is permanently disabled.",
      default: 3,
    }),
    backoffMs: CronRetryBackoff.annotateKey({
      description: "Retry backoff delays decoded from millisecond inputs into Effect Duration values.",
      default: defaultRetryBackoffMs,
    }),
    retryOn: SchemaUtils.withKeyDefaults(
      S.Array(CronRetryOn).check(S.makeFilterGroup([S.isMinLength(1), S.isMaxLength(10)])),
      defaultRetryOn
    ).annotateKey({
      description: "Transient error kinds that should trigger retries when one-shot jobs fail.",
      default: defaultRetryOn,
    }),
  },
  $I.annote("CronRetryConfig", {
    description:
      "Retry policy overrides for one-shot cron jobs, including attempts, backoff schedule, and retryable error kinds.",
  })
) {}

/**
 * Global cron failure alert configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CronFailureAlertConfig extends S.Class<CronFailureAlertConfig>($I`CronFailureAlertConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether global cron failure alerts are enabled.",
    }),
    after: S.OptionFromOptionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).annotateKey({
      description: "Minimum consecutive failures before a global cron failure alert is emitted.",
    }),
    cooldownMs: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey({
      description: "Cooldown between repeated global cron failure alerts, decoded from milliseconds.",
    }),
    mode: S.OptionFromOptionalKey(CronFailureMode).annotateKey({
      description: "How global cron failure alerts should be delivered.",
    }),
    accountId: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional channel account identifier used when sending global cron failure alerts.",
    }),
  },
  $I.annote("CronFailureAlertConfig", {
    description: "Global settings controlling when cron failure alerts fire and how they are delivered.",
  })
) {}

/**
 * Default destination for cron failure notifications.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CronFailureDestinationConfig extends S.Class<CronFailureDestinationConfig>(
  $I`CronFailureDestinationConfig`
)(
  {
    channel: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional channel identifier used for announce-mode failure delivery.",
    }),
    to: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional target identifier or webhook URL used by the chosen failure-delivery mode.",
    }),
    accountId: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional channel account identifier used when sending failure notifications.",
    }),
    mode: S.OptionFromOptionalKey(CronFailureMode).annotateKey({
      description: "Delivery mode used for the default cron failure destination.",
    }),
  },
  $I.annote("CronFailureDestinationConfig", {
    description: "Default destination settings applied to cron failure notifications across jobs.",
  })
) {}

/**
 * Cron run-log pruning settings for per-job history files.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CronRunLogConfig extends S.Class<CronRunLogConfig>($I`CronRunLogConfig`)(
  {
    maxBytes: SchemaUtils.withKeyDefaults(CronRunLogMaxBytes, 2_000_000).annotateKey({
      description: "Maximum bytes per run-log file before the file is pruned.",
      default: 2_000_000,
    }),
    keepLines: SchemaUtils.withKeyDefaults(S.Int.check(S.isGreaterThanOrEqualTo(1)), 2_000).annotateKey({
      description: "How many trailing run-log lines are retained after pruning.",
      default: 2_000,
    }),
  },
  $I.annote("CronRunLogConfig", {
    description: "Pruning settings for per-job cron run-log files under cron/runs/<jobId>.jsonl.",
  })
) {}

/**
 * Top-level cron scheduler configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CronConfig extends S.Class<CronConfig>($I`CronConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the stored cron scheduler is enabled.",
    }),
    store: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "Filesystem path to the persisted cron jobs store.",
    }),
    maxConcurrentRuns: S.OptionFromOptionalKey(S.Int.check(S.isGreaterThanOrEqualTo(1))).annotateKey({
      description: "Maximum number of cron jobs that may run at the same time.",
    }),
    retry: CronRetryConfig.pipe(
      S.withConstructorDefault(thunkSome(defaultRetryConfig())),
      S.withDecodingDefaultKey(thunkEmptyRecord)
    ).annotateKey({
      description: "Retry policy overrides for one-shot cron jobs.",
      default: {
        maxAttempts: 3,
        backoffMs: defaultRetryBackoffMs,
        retryOn: defaultRetryOn,
      },
    }),
    webhook: S.OptionFromOptionalKey(HttpUrlString).annotateKey({
      description: "Deprecated legacy fallback webhook URL used only for stored jobs with notify=true.",
    }),
    webhookToken: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Bearer token attached to cron webhook POST deliveries.",
    }),
    sessionRetention: CronSessionRetention.annotateKey({
      description:
        "How long completed cron run sessions are retained before pruning, decoded from duration input or disabled with false.",
      default: defaultSessionRetention,
    }),
    runLog: CronRunLogConfig.pipe(
      S.withConstructorDefault(() => O.some(defaultRunLogConfig())),
      S.withDecodingDefaultKey(thunkEmptyRecord)
    ).annotateKey({
      description: "Pruning controls for per-job cron run-log files.",
      default: {
        maxBytes: 2_000_000,
        keepLines: 2_000,
      },
    }),
    failureAlert: S.OptionFromOptionalKey(CronFailureAlertConfig).annotateKey({
      description: "Global cron failure alert settings.",
    }),
    failureDestination: S.OptionFromOptionalKey(CronFailureDestinationConfig).annotateKey({
      description: "Default destination for cron failure notifications across jobs.",
    }),
  },
  $I.annote("CronConfig", {
    description:
      "Top-level cron scheduler configuration, including retries, retention, webhook fallback, and failure-notification settings.",
  })
) {}
