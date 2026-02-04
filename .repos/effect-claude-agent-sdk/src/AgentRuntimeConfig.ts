import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type { Options } from "./Schema/Options.js"
import { layerConfigFromEnv } from "./internal/config.js"

export type AgentRuntimeSettings = {
  readonly defaultOptions: Options
  readonly queryTimeout: Duration.Duration | undefined
  readonly firstMessageTimeout: Duration.Duration | undefined
  readonly retryMaxRetries: number
  readonly retryBaseDelay: Duration.Duration
}

const emptyOptions: Options = {}

const defaultSettings: AgentRuntimeSettings = {
  defaultOptions: emptyOptions,
  queryTimeout: undefined,
  firstMessageTimeout: undefined,
  retryMaxRetries: 0,
  retryBaseDelay: Duration.seconds(1)
}

export class AgentRuntimeConfig
  extends Context.Tag("@effect/claude-agent-sdk/AgentRuntimeConfig")<
    AgentRuntimeConfig,
    {
      readonly settings: AgentRuntimeSettings
    }
  >()
{
  /**
   * Build AgentRuntimeConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentRuntimeConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)))

  /**
   * Default configuration layer for AgentRuntime.
   */
  static readonly layer = Layer.effect(
    AgentRuntimeConfig,
    Effect.gen(function*() {
      const queryTimeout = yield* Config.option(Config.duration("QUERY_TIMEOUT"))
      const firstMessageTimeout = yield* Config.option(Config.duration("FIRST_MESSAGE_TIMEOUT"))
      const retryMaxRetries = yield* Config.option(Config.integer("RETRY_MAX_RETRIES"))
      const retryBaseDelay = yield* Config.option(Config.duration("RETRY_BASE_DELAY"))

      const settings: AgentRuntimeSettings = {
        defaultOptions: defaultSettings.defaultOptions,
        queryTimeout: Option.getOrElse(queryTimeout, () => defaultSettings.queryTimeout),
        firstMessageTimeout: Option.getOrElse(
          firstMessageTimeout,
          () => defaultSettings.firstMessageTimeout
        ),
        retryMaxRetries: Math.max(
          0,
          Option.getOrElse(retryMaxRetries, () => defaultSettings.retryMaxRetries)
        ),
        retryBaseDelay: Option.getOrElse(retryBaseDelay, () => defaultSettings.retryBaseDelay)
      }

      return AgentRuntimeConfig.of({ settings })
    })
  )
}
