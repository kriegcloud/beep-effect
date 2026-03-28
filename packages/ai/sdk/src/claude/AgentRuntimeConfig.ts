import { $AiSdkId } from "@beep/identity/packages";
import { Config, Duration, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import { layerConfigFromEnv } from "./internal/config.js";
import { mergeOptions } from "./internal/options.js";
import type { Options } from "./Schema/Options.js";

const $I = $AiSdkId.create("core/AgentRuntimeConfig");

/**
 * @since 0.0.0
 * @category Configuration
 */
export type AgentRuntimeSettings = Readonly<{
  readonly defaultOptions: Options;
  readonly queryTimeout: Duration.Duration | undefined;
  readonly firstMessageTimeout: Duration.Duration | undefined;
  readonly retryMaxRetries: number;
  readonly retryBaseDelay: Duration.Duration;
}>;

const emptyOptions: Options = {};

const defaultSettings: AgentRuntimeSettings = {
  defaultOptions: emptyOptions,
  queryTimeout: undefined,
  firstMessageTimeout: undefined,
  retryMaxRetries: 0,
  retryBaseDelay: Duration.seconds(1),
};

const resolveSettings = (overrides?: Partial<AgentRuntimeSettings>): AgentRuntimeSettings => {
  if (overrides === undefined) {
    return defaultSettings;
  }
  const defaultOptions =
    overrides.defaultOptions === undefined
      ? defaultSettings.defaultOptions
      : mergeOptions(defaultSettings.defaultOptions, overrides.defaultOptions);
  return {
    ...defaultSettings,
    ...overrides,
    defaultOptions,
  };
};

const makeAgentRuntimeConfig = Effect.gen(function* () {
  const queryTimeout = yield* Config.option(Config.duration("QUERY_TIMEOUT"));
  const firstMessageTimeout = yield* Config.option(Config.duration("FIRST_MESSAGE_TIMEOUT"));
  const retryMaxRetries = yield* Config.option(Config.number("RETRY_MAX_RETRIES"));
  const retryBaseDelay = yield* Config.option(Config.duration("RETRY_BASE_DELAY"));

  const settings: AgentRuntimeSettings = {
    defaultOptions: defaultSettings.defaultOptions,
    queryTimeout: O.getOrElse(queryTimeout, () => defaultSettings.queryTimeout),
    firstMessageTimeout: O.getOrElse(firstMessageTimeout, () => defaultSettings.firstMessageTimeout),
    retryMaxRetries: Math.max(
      0,
      O.getOrElse(retryMaxRetries, () => defaultSettings.retryMaxRetries)
    ),
    retryBaseDelay: O.getOrElse(retryBaseDelay, () => defaultSettings.retryBaseDelay),
  };

  return { settings };
});

/**
 * @since 0.0.0
 * @category Configuration
 */
export type AgentRuntimeConfigShape = Readonly<{
  readonly settings: AgentRuntimeSettings;
}>;

/**
 * @since 0.0.0
 * @category Configuration
 */
export class AgentRuntimeConfig extends ServiceMap.Service<AgentRuntimeConfig, AgentRuntimeConfigShape>()(
  $I`AgentRuntimeConfig`
) {
  /**
   * Build AgentRuntimeConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentRuntimeConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));

  /**
   * Default configuration layer for AgentRuntime.
   */
  static readonly layer = Layer.effect(AgentRuntimeConfig, makeAgentRuntimeConfig);

  /**
   * Build AgentRuntimeConfig with explicit overrides applied to defaults.
   */
  static readonly layerWith = (overrides?: undefined | Partial<AgentRuntimeSettings>) =>
    Layer.effect(
      AgentRuntimeConfig,
      Effect.succeed({
        settings: resolveSettings(overrides),
      })
    );
}
