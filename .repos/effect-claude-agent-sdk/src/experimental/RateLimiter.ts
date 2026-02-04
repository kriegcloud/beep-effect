import * as RateLimiter from "@effect/experimental/RateLimiter"
import type * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export * from "@effect/experimental/RateLimiter"

/**
 * In-memory rate limiter layer for local development and tests.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function*() {
 *   return yield* Effect.succeed("ready")
 * }).pipe(Effect.provide(layerMemory))
 * ```
 */
export const layerMemory = RateLimiter.layer.pipe(
  Layer.provide(RateLimiter.layerStoreMemory)
)

/**
 * Namespace a limiter key by session id.
 */
export const keyForSession = (sessionId: string) => `session:${sessionId}`

/**
 * Namespace a limiter key by tool name.
 */
export const keyForTool = (toolName: string) => `tool:${toolName}`

/**
 * Namespace a limiter key by endpoint name.
 */
export const keyForEndpoint = (endpoint: string) => `endpoint:${endpoint}`

/**
 * Namespace a limiter key by session id and tool name.
 */
export const keyForSessionTool = (sessionId: string, toolName: string) =>
  `${keyForSession(sessionId)}:${toolName}`

/**
 * Configuration for a shared rate limiting window.
 */
export type RateLimitWindowConfig = {
  readonly algorithm?: "fixed-window" | "token-bucket"
  readonly onExceeded?: "delay" | "fail"
  readonly window: Duration.DurationInput
  readonly limit: number
  readonly tokens?: number
}

/**
 * Per-handler rate limit configuration.
 */
export type RateLimitHandlerConfig<A> = Omit<RateLimitWindowConfig, "tokens"> & {
  readonly key: string | ((input: A) => string)
  readonly tokens?: number | ((input: A) => number)
}

/**
 * Apply a rate limit to a single Effect.
 *
 * @example
 * ```ts
 * const guarded = withRateLimit({
 *   key: "query",
 *   window: "1 minute",
 *   limit: 10
 * })(Effect.succeed("ok"))
 * ```
 */
export const withRateLimit = (config: {
  readonly key: string
  readonly window: Duration.DurationInput
  readonly limit: number
  readonly algorithm?: "fixed-window" | "token-bucket"
  readonly onExceeded?: "delay" | "fail"
  readonly tokens?: number
}) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.flatMap(RateLimiter.makeWithRateLimiter, (withLimiter) =>
      withLimiter({
        ...config,
        onExceeded: config.onExceeded ?? "delay"
      })(effect)
    )

/**
 * Wrap a handler function with rate limiting.
 *
 * @example
 * ```ts
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
export const rateLimitHandler = <A, E, R, B>(
  handler: (input: A) => Effect.Effect<B, E, R>,
  config: RateLimitHandlerConfig<A>
) =>
  (input: A) => {
    const { tokens: tokensConfig, ...rest } = config
    const key = typeof rest.key === "function" ? rest.key(input) : rest.key
    const tokens = typeof tokensConfig === "function" ? tokensConfig(input) : tokensConfig
    const limiterConfig = {
      ...rest,
      key,
      ...(tokens === undefined ? {} : { tokens })
    }
    return withRateLimit(limiterConfig)(handler(input))
  }

type AnyHandler = (input: any) => Effect.Effect<any, any, any>

/**
 * Apply rate limiting to a map of handlers using a shared window config.
 *
 * @example
 * ```ts
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
export const rateLimitHandlers = <Handlers extends Record<string, AnyHandler>>(
  handlers: Handlers,
  config: RateLimitWindowConfig | ((name: keyof Handlers) => RateLimitWindowConfig),
  options?: { readonly keyPrefix?: string }
): Handlers => {
  const prefix = options?.keyPrefix ? `${options.keyPrefix}:` : ""
  const output = {} as Handlers

  for (const [name, handler] of Object.entries(handlers)) {
    const resolved = typeof config === "function"
      ? config(name as keyof Handlers)
      : config
    output[name as keyof Handlers] = rateLimitHandler(handler as AnyHandler, {
      ...resolved,
      key: `${prefix}${name}`
    }) as Handlers[keyof Handlers]
  }

  return output
}
