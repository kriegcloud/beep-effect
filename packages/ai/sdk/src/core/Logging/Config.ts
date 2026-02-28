import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Config, Effect, Layer, type LogLevel, Match, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { ConfigError } from "../Errors.js";
import { layerConfigFromEnv } from "../internal/config.js";
import type { AgentLogCategory } from "./Types.js";

const $I = $AiSdkId.create("core/Logging/Config");

/**
 * @since 0.0.0
 */
export const LogFormat = LiteralKit(["pretty", "structured", "json", "logfmt", "string"]);

/**
 * @since 0.0.0
 */
export type LogFormat = typeof LogFormat.Type;

/**
 * @since 0.0.0
 */
export type AgentLoggingCategories = Record<AgentLogCategory, boolean>;

/**
 * @since 0.0.0
 */
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
  return S.decodeUnknownEffect(LogFormat)(normalized).pipe(
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
  return Match.value(normalized).pipe(
    Match.when("all", () => Effect.succeed<LogLevel.LogLevel>("All")),
    Match.when("trace", () => Effect.succeed<LogLevel.LogLevel>("Trace")),
    Match.when("debug", () => Effect.succeed<LogLevel.LogLevel>("Debug")),
    Match.when("info", () => Effect.succeed<LogLevel.LogLevel>("Info")),
    Match.whenOr("warn", "warning", () => Effect.succeed<LogLevel.LogLevel>("Warn")),
    Match.when("error", () => Effect.succeed<LogLevel.LogLevel>("Error")),
    Match.when("fatal", () => Effect.succeed<LogLevel.LogLevel>("Fatal")),
    Match.whenOr("off", "none", () => Effect.succeed<LogLevel.LogLevel>("None")),
    Match.orElse(() =>
      Effect.fail(
        ConfigError.make({
          message: `Invalid log level: ${value}`,
        })
      )
    )
  );
};

/**
 * @since 0.0.0
 */
export interface AgentLoggingConfigShape {
  readonly settings: AgentLoggingSettings;
}

/**
 * @since 0.0.0
 */
export class AgentLoggingConfig extends ServiceMap.Service<AgentLoggingConfig, AgentLoggingConfigShape>()(
  $I`AgentLoggingConfig`
) {
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

      const resolvedFormat = O.isSome(format) ? yield* parseLogFormat(format.value) : defaultSettings.format;
      const resolvedMinLevel = O.isSome(minLevel) ? yield* parseLogLevel(minLevel.value) : defaultSettings.minLevel;

      const settings: AgentLoggingSettings = {
        format: resolvedFormat,
        minLevel: resolvedMinLevel,
        includeSpans: O.getOrElse(includeSpans, () => defaultSettings.includeSpans),
        categories: {
          messages: O.getOrElse(logMessages, () => defaultSettings.categories.messages),
          queryEvents: O.getOrElse(logQueryEvents, () => defaultSettings.categories.queryEvents),
          hooks: O.getOrElse(logHooks, () => defaultSettings.categories.hooks),
        },
      };

      return AgentLoggingConfig.of({ settings });
    })
  );
}
