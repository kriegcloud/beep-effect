import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as LogLevel from "effect/LogLevel";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as ServiceMap from "effect/ServiceMap";
import { ConfigError } from "../Errors.js";
import { layerConfigFromEnv } from "../internal/config.js";
import type { AgentLogCategory } from "./Types.js";

export const LogFormat = Schema.Literals(["pretty", "structured", "json", "logfmt", "string"]);

export type LogFormat = typeof LogFormat.Type;

export type AgentLoggingCategories = Record<AgentLogCategory, boolean>;

export type AgentLoggingSettings = {
  readonly format: LogFormat;
  readonly minLevel: LogLevel.LogLevel;
  readonly includeSpans: boolean;
  readonly categories: AgentLoggingCategories;
};

const defaultSettings: AgentLoggingSettings = {
  format: "pretty",
  minLevel: "Info",
  includeSpans: false,
  categories: {
    messages: true,
    queryEvents: true,
    hooks: true,
  },
};

const parseLogFormat = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return Schema.decodeUnknownEffect(LogFormat)(normalized).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: `Invalid log format: ${value}`,
        cause,
      })
    )
  );
};

const parseLogLevel = (value: string): Effect.Effect<LogLevel.LogLevel, ConfigError> => {
  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case "all":
      return Effect.succeed("All");
    case "trace":
      return Effect.succeed("Trace");
    case "debug":
      return Effect.succeed("Debug");
    case "info":
      return Effect.succeed("Info");
    case "warn":
    case "warning":
      return Effect.succeed("Warn");
    case "error":
      return Effect.succeed("Error");
    case "fatal":
      return Effect.succeed("Fatal");
    case "off":
    case "none":
      return Effect.succeed("None");
    default:
      return Effect.fail(
        ConfigError.make({
          message: `Invalid log level: ${value}`,
        })
      );
  }
};

export class AgentLoggingConfig extends ServiceMap.Service<
  AgentLoggingConfig,
  {
    readonly settings: AgentLoggingSettings;
  }
>()("@effect/claude-agent-sdk/AgentLoggingConfig") {
  /**
   * Build AgentLoggingConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentLoggingConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));

  /**
   * Default configuration layer for logging.
   */
  static readonly layer = Layer.effect(
    AgentLoggingConfig,
    Effect.gen(function* () {
      const format = yield* Config.option(Config.string("LOG_FORMAT"));
      const minLevel = yield* Config.option(Config.string("LOG_LEVEL"));
      const includeSpans = yield* Config.option(Config.boolean("LOG_SPANS"));
      const logMessages = yield* Config.option(Config.boolean("LOG_MESSAGES"));
      const logQueryEvents = yield* Config.option(Config.boolean("LOG_QUERY_EVENTS"));
      const logHooks = yield* Config.option(Config.boolean("LOG_HOOKS"));

      const resolvedFormat = Option.isSome(format) ? yield* parseLogFormat(format.value) : defaultSettings.format;
      const resolvedMinLevel = Option.isSome(minLevel)
        ? yield* parseLogLevel(minLevel.value)
        : defaultSettings.minLevel;

      const settings: AgentLoggingSettings = {
        format: resolvedFormat,
        minLevel: resolvedMinLevel,
        includeSpans: Option.getOrElse(includeSpans, () => defaultSettings.includeSpans),
        categories: {
          messages: Option.getOrElse(logMessages, () => defaultSettings.categories.messages),
          queryEvents: Option.getOrElse(logQueryEvents, () => defaultSettings.categories.queryEvents),
          hooks: Option.getOrElse(logHooks, () => defaultSettings.categories.hooks),
        },
      };

      return AgentLoggingConfig.of({ settings });
    })
  );
}
