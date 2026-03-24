import { $AiSdkId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { type Duration, Effect, Layer } from "effect";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as RateLimiter from "effect/unstable/persistence/RateLimiter";

const $I = $AiSdkId.create("core/experimental/RateLimiter");

/**
 * @since 0.0.0
 */
export * from "effect/unstable/persistence/RateLimiter";

/**
 * In-memory rate limiter layer for local development and tests.
 *
 * @example
 * ```typescript
 * const program = Effect.gen(function*() {
 *   return yield* Effect.succeed("ready")
 * }).pipe(Effect.provide(layerMemory))
 * ```
 */
/**
 * @since 0.0.0
 * @category Configuration
 */
export const layerMemory = RateLimiter.layer.pipe(Layer.provide(RateLimiter.layerStoreMemory));

/**
 * Namespace a limiter key by session id.
 */
/**
 * @since 0.0.0
 * @category Utility
 */
export const keyForSession = (sessionId: string) => `session:${sessionId}`;

/**
 * Namespace a limiter key by tool name.
 */
/**
 * @since 0.0.0
 * @category Utility
 */
export const keyForTool = (toolName: string) => `tool:${toolName}`;

/**
 * Namespace a limiter key by endpoint name.
 */
/**
 * @since 0.0.0
 * @category Utility
 */
export const keyForEndpoint = (endpoint: string) => `endpoint:${endpoint}`;

/**
 * Namespace a limiter key by session id and tool name.
 */
/**
 * @since 0.0.0
 * @category Utility
 */
export const keyForSessionTool = (sessionId: string, toolName: string) => `${keyForSession(sessionId)}:${toolName}`;

const RateLimitWindowConfigAlgo = LiteralKit(["fixed-window", "token-bucket"]).pipe(
  $I.annoteSchema("RateLimitWindowConfigAlgo", {
    description: "Rate limiting algorithm to use",
  })
);

type RateLimitWindowConfigAlgo = typeof RateLimitWindowConfigAlgo.Type;

const RateLimitWindowConfigExceededReason = LiteralKit(["delay", "fail"]).pipe(
  $I.annoteSchema("RateLimitWindowConfigExceededReason", {
    description: "Action to take when rate limit is exceeded",
  })
);
type RateLimitWindowConfigExceededReason = typeof RateLimitWindowConfigExceededReason.Type;
/**
 * Configuration for a shared rate limiting window.
 */
/**
 * @since 0.0.0
 * @category Configuration
 */
// export class RateLimitWindowConfigBase extends S.Class<RateLimitWindowConfigBase>($I`RateLimitWindowConfigBase`)(
//   {
//     window: S.Duration
//   }
// ) {}
export type RateLimitWindowConfig = Readonly<{
  readonly algorithm?: undefined | RateLimitWindowConfigAlgo;
  readonly onExceeded?: undefined | RateLimitWindowConfigExceededReason;
  readonly window: Duration.Input;
  readonly limit: number;
  readonly tokens?: undefined | number;
}>;

/**
 * Per-handler rate limit configuration.
 */
/**
 * @since 0.0.0
 * @category Configuration
 */
export type RateLimitHandlerConfig<A> = Omit<RateLimitWindowConfig, "tokens"> & {
  readonly key: string | ((input: A) => string);
  readonly tokens?: undefined | number | ((input: A) => number);
};

/**
 * Apply a rate limit to a single Effect.
 *
 * @example
 * ```typescript
 * const guarded = withRateLimit({
 *   key: "query",
 *   window: "1 minute",
 *   limit: 10
 * })(Effect.succeed("ok"))
 * ```
 */
/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const withRateLimit =
  (config: {
    readonly key: string;
    readonly window: Duration.Input;
    readonly limit: number;
    readonly algorithm?: undefined | "fixed-window" | "token-bucket";
    readonly onExceeded?: undefined | "delay" | "fail";
    readonly tokens?: undefined | number;
  }) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.flatMap(RateLimiter.makeWithRateLimiter, (withLimiter) =>
      withLimiter({
        ...config,
        onExceeded: config.onExceeded ?? "delay",
      })(effect)
    );

/**
 * Wrap a handler function with rate limiting.
 *
 * @example
 * ```typescript
 * const handler = rateLimitHandler(
 *   (input: { sessionId: string }) => Effect.succeed(input.sessionId),
 *   {
 *     key: (input) => keyForSession(input.sessionId),
 *     window: "10 seconds",
 *     limit: 3
 *   }
 * )
 * ```
 */
/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const rateLimitHandler =
  <A, E, R, B>(handler: (input: A) => Effect.Effect<B, E, R>, config: RateLimitHandlerConfig<A>) =>
  (input: A) => {
    const { tokens: tokensConfig, ...rest } = config;
    const key = P.isFunction(rest.key) ? rest.key(input) : rest.key;
    const tokens = P.isFunction(tokensConfig) ? tokensConfig(input) : tokensConfig;
    const limiterConfig = {
      ...rest,
      key,
      ...(tokens === undefined ? {} : { tokens }),
    };
    return withRateLimit(limiterConfig)(handler(input));
  };

type HandlerLike = (input: unknown) => Effect.Effect<unknown, unknown, unknown>;

/**
 * Apply rate limiting to a map of handlers using a shared window config.
 *
 * @example
 * ```typescript
 * const handlers = rateLimitHandlers(
 *   {
 *     send: (input: string) => Effect.succeed(input),
 *     stream: (input: string) => Effect.succeed(input)
 *   },
 *   { window: "30 seconds", limit: 5 },
 *   { keyPrefix: "agent" }
 * )
 * ```
 */
/**
 * @since 0.0.0
 * @category DomainLogic
 */
export const rateLimitHandlers = <Handlers extends Record<string, HandlerLike>>(
  handlers: Handlers,
  config: RateLimitWindowConfig | ((name: keyof Handlers) => RateLimitWindowConfig),
  options?: undefined | { readonly keyPrefix?: undefined | string }
): Handlers => {
  const prefix = options?.keyPrefix === undefined ? "" : `${options.keyPrefix}:`;
  const output = {} as Handlers;

  for (const [name, handler] of R.toEntries(handlers)) {
    const resolved = P.isFunction(config) ? config(name as keyof Handlers) : config;
    output[name as keyof Handlers] = rateLimitHandler(handler, {
      ...resolved,
      key: `${prefix}${name}`,
    }) as Handlers[keyof Handlers];
  }

  return output;
};
