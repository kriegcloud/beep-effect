import type * as Duration from "effect/Duration";
import * as S from "effect/Schema";

import type { HandlerFiberContext } from "../context";
import type { BetterAuthMetricsConfig } from "../instrumentation";

// type l = Duration.DurationInput;
//
// number
// | bigint
// | `${number} nano`
// | `${number} nanos`
// | `${number} micro`
// | `${number} micros`
// | `${number} milli`
// | `${number} millis`
// | `${number} second`
// | `${number} seconds`
// | `${number} minute`
// | `${number} minutes`
// | `${number} hour`
// | `${number} hours`
// | `${number} day`
// | `${number} days`
// | `${number} week`

export const DurationInputSchema = S.Duration;

const RetryOptionsSchema = S.Struct({
  maxAttempts: S.optional(S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1))),
  baseDelay: S.optional(DurationInputSchema),
  factor: S.optional(S.Number.pipe(S.greaterThan(0))),
});

const TimeoutOptionsSchema = S.Struct({
  duration: DurationInputSchema,
  message: S.optional(S.String),
});

const RecordUnknownSchema = S.Record({ key: S.String, value: S.Unknown });
const RecordStringSchema = S.Record({ key: S.String, value: S.String });

const FiberContextSchema = S.Struct({
  annotations: S.optional(RecordUnknownSchema),
  metricTags: S.optional(RecordStringSchema),
});

const MetricsOptionsSchema = S.Struct({
  latencyHistogram: S.optional(S.Unknown),
  successCounter: S.optional(S.Unknown),
  errorCounter: S.optional(S.Unknown),
  durationUnit: S.optional(S.Literal("millis", "seconds")),
});

export const HandlerOptionsSchema = S.Struct({
  retry: S.optional(RetryOptionsSchema),
  timeout: S.optional(TimeoutOptionsSchema),
  metrics: S.optional(MetricsOptionsSchema),
  annotations: S.optional(RecordUnknownSchema),
  tracing: S.optional(S.Literal("traced", "untraced")),
  semaphoreKey: S.optional(S.String),
  fiberContext: S.optional(FiberContextSchema),
});

export interface HandlerRetryOptions {
  readonly maxAttempts?: number;
  readonly baseDelay?: Duration.DurationInput;
  readonly factor?: number;
}

export interface HandlerTimeoutOptions {
  readonly duration: Duration.DurationInput;
  readonly message?: string;
}

export interface HandlerFiberContextOptions extends Partial<HandlerFiberContext> {}

export type HandlerMetricsOptions = Partial<BetterAuthMetricsConfig>;

export interface HandlerOptionsShape {
  readonly retry?: HandlerRetryOptions;
  readonly timeout?: HandlerTimeoutOptions;
  readonly metrics?: HandlerMetricsOptions;
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly tracing?: "traced" | "untraced";
  readonly semaphoreKey?: string;
  readonly fiberContext?: HandlerFiberContextOptions;
}

export type HandlerOptionsInput = typeof HandlerOptionsSchema.Type;
export type HandlerOptionsEncoded = typeof HandlerOptionsSchema.Encoded;
