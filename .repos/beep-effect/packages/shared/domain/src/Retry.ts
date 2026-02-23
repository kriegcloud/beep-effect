import * as Data from "effect/Data";
import type * as Duration from "effect/Duration";
import * as Schedule from "effect/Schedule";

/**
 * Configuration options for exponential backoff retry strategy
 *
 * Defines the parameters for configuring a retry mechanism with exponential backoff
 *
 * @param {Duration["DurationInput"]} delay - Initial delay between retry attempts in milliseconds
 * @param {number} [growthFactor] - Factory by which the delay increases exponentially
 * @param {boolean} [jitter] - Whether to add randomness to the retry delay to prevent thundering herd problem
 * @param {number} [maxRetries] - Maximum number of retry attempts
 */
export type ExponentialBackOffOptions = Readonly<{
  /**
   * Initial delay between retry attempts
   * @default 100
   */
  readonly delay: Duration.DurationInput;

  /**
   * Factor by which the delay increases exponentially
   * @default 2.0
   */
  readonly growthFactor?: undefined | number;

  /**
   * Whether to add randomness to the retry delay to prevent thundering herd problem
   * @default true
   */
  readonly jitter?: undefined | boolean;

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  readonly maxRetries?: undefined | number;
}>;

/**
 * Default configuration for exponential backoff retry strategy
 *
 * Provides out-of-the-box configuration for retry mechanism
 */
const defaultExponentialBackoffOptions = Data.struct({
  delay: 100,
  growthFactor: 2.0,
  jitter: true,
  maxRetries: 3,
} as const satisfies ExponentialBackOffOptions);

/**
 * Create an exponential backoff retry policy with configurable options
 *
 * @param { ExponentialBackOffOptions} [options] - Optional configuration to override defaults
 * @returns {Schedule["Schedule"]} A retry schedule with exponential backoff and optional jitter
 *
 * @example
 * ```ts
 * // Create as custom retry policy with longer delays and more retries
 * const customPolicy = makeExponentialBackoffPolicy({
 *   delay: 500,
 *   growthFactor: 5,
 *   jitter: false,
 * });
 * ```
 */
const makeExponentialBackoffPolicy = (
  options: undefined | ExponentialBackOffOptions
): Schedule.Schedule<[Duration.Duration, number]> => {
  const opts = { ...defaultExponentialBackoffOptions, ...options } as const;

  return Schedule.intersect(
    Schedule.exponential(opts.delay, opts.growthFactor),
    Schedule.recurs(opts.maxRetries ?? defaultExponentialBackoffOptions.maxRetries)
  ).pipe((policy) => (opts.jitter ? Schedule.jittered(policy) : policy));
};

/**
 * Default exponential backoff retry policy
 *
 * Provide a pre-configured retry policy with standard exponential backoff settings
 */
const defaultExponentialBackoffPolicy = makeExponentialBackoffPolicy(defaultExponentialBackoffOptions);

/**
 * Retry utility with exponential backoff policy generation
 *
 * Provides methods for creating and managing retry policies
 */
export const Retry = Data.struct({
  /**
   * Creates a custom backoff retry policy
   *
   * @param {ExponentialBackOffOptions} [options] - Configuration for the retry policy
   * @returns {Schedule["Schedule"]} A customized retry schedule
   */
  makeExponentialBackoffPolicy,

  /**
   * Default exponential backoff retry policy
   *
   * Ready-to-use retry policy with standard configuration
   */
  exponentialBackoffPolicy: defaultExponentialBackoffPolicy,

  /**
   * Default retry once policy
   */
  oncePolicy: Schedule.once,

  /**
   * Default no retry policy
   */
  noRetryPolicy: Schedule.stop,
} as const);
