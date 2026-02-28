import { ServiceMap } from "effect";
import * as Config from "effect/Config";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { layerConfigFromEnv } from "./internal/config.js";
import { mergeOptions } from "./internal/options.js";
import type { Options } from "./Schema/Options.js";

export type AgentRuntimeSettings = {
  readonly defaultOptions: Options;
  readonly queryTimeout: Duration.Duration | undefined;
  readonly firstMessageTimeout: Duration.Duration | undefined;
  readonly retryMaxRetries: number;
  readonly retryBaseDelay: Duration.Duration;
};

const emptyOptions: Options = {};

const defaultSettings: AgentRuntimeSettings = {
  defaultOptions: emptyOptions,
  queryTimeout: undefined,
  firstMessageTimeout: undefined,
  retryMaxRetries: 0,
  retryBaseDelay: Duration.seconds(1),
};

const resolveSettings = (overrides?: Partial<AgentRuntimeSettings>): AgentRuntimeSettings => {
  if (!overrides) {
    return defaultSettings;
  }
  const defaultOptions = overrides.defaultOptions
    ? mergeOptions(defaultSettings.defaultOptions, overrides.defaultOptions)
    : defaultSettings.defaultOptions;
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
    queryTimeout: Option.getOrElse(queryTimeout, () => defaultSettings.queryTimeout),
    firstMessageTimeout: Option.getOrElse(firstMessageTimeout, () => defaultSettings.firstMessageTimeout),
    retryMaxRetries: Math.max(
      0,
      Option.getOrElse(retryMaxRetries, () => defaultSettings.retryMaxRetries)
    ),
    retryBaseDelay: Option.getOrElse(retryBaseDelay, () => defaultSettings.retryBaseDelay),
  };

  return { settings };
});

export class AgentRuntimeConfig extends ServiceMap.Service<
  AgentRuntimeConfig,
  {
    settings: AgentRuntimeSettings;
  }
>()("@effect/claude-agent-sdk/AgentRuntimeConfig") {
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
