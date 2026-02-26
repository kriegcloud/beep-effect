import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as Schema from "effect/Schema"
import { ConfigError } from "../Errors.js"
import { layerConfigFromEnv } from "../internal/config.js"
import type { AgentLogCategory } from "./Types.js"

export const LogFormat = Schema.Literal(
  "pretty",
  "structured",
  "json",
  "logfmt",
  "string"
)

export type LogFormat = typeof LogFormat.Type

export type AgentLoggingCategories = Record<AgentLogCategory, boolean>

export type AgentLoggingSettings = {
  readonly format: LogFormat
  readonly minLevel: LogLevel.LogLevel
  readonly includeSpans: boolean
  readonly categories: AgentLoggingCategories
}

const defaultSettings: AgentLoggingSettings = {
  format: "pretty",
  minLevel: LogLevel.Info,
  includeSpans: false,
  categories: {
    messages: true,
    queryEvents: true,
    hooks: true
  }
}

const parseLogFormat = (value: string) => {
  const normalized = value.trim().toLowerCase()
  return Schema.decodeUnknown(LogFormat)(normalized).pipe(
    Effect.mapError((cause) =>
      ConfigError.make({
        message: `Invalid log format: ${value}`,
        cause
      })
    )
  )
}

const parseLogLevel = (value: string) => {
  const normalized = value.trim().toLowerCase()
  switch (normalized) {
    case "all":
      return Effect.succeed(LogLevel.All)
    case "trace":
      return Effect.succeed(LogLevel.Trace)
    case "debug":
      return Effect.succeed(LogLevel.Debug)
    case "info":
      return Effect.succeed(LogLevel.Info)
    case "warn":
    case "warning":
      return Effect.succeed(LogLevel.Warning)
    case "error":
      return Effect.succeed(LogLevel.Error)
    case "fatal":
      return Effect.succeed(LogLevel.Fatal)
    case "off":
    case "none":
      return Effect.succeed(LogLevel.None)
    default:
      return Effect.fail(
        ConfigError.make({
          message: `Invalid log level: ${value}`
        })
      )
  }
}

const defaultLoggingConfig = {
  settings: defaultSettings
}

export class AgentLoggingConfig extends Context.Reference<AgentLoggingConfig>()(
  "@effect/claude-agent-sdk/AgentLoggingConfig",
  {
    defaultValue: () => defaultLoggingConfig
  }
) {
  /**
   * Build AgentLoggingConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    AgentLoggingConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)))

  /**
   * Default configuration layer for logging.
   */
  static readonly layer = Layer.effect(
    AgentLoggingConfig,
    Effect.gen(function*() {
      const format = yield* Config.option(Config.string("LOG_FORMAT"))
      const minLevel = yield* Config.option(Config.string("LOG_LEVEL"))
      const includeSpans = yield* Config.option(Config.boolean("LOG_SPANS"))
      const logMessages = yield* Config.option(Config.boolean("LOG_MESSAGES"))
      const logQueryEvents = yield* Config.option(Config.boolean("LOG_QUERY_EVENTS"))
      const logHooks = yield* Config.option(Config.boolean("LOG_HOOKS"))

      const resolvedFormat = Option.isSome(format)
        ? yield* parseLogFormat(format.value)
        : defaultSettings.format
      const resolvedMinLevel = Option.isSome(minLevel)
        ? yield* parseLogLevel(minLevel.value)
        : defaultSettings.minLevel

      const settings: AgentLoggingSettings = {
        format: resolvedFormat,
        minLevel: resolvedMinLevel,
        includeSpans: Option.getOrElse(includeSpans, () => defaultSettings.includeSpans),
        categories: {
          messages: Option.getOrElse(logMessages, () => defaultSettings.categories.messages),
          queryEvents: Option.getOrElse(logQueryEvents, () => defaultSettings.categories.queryEvents),
          hooks: Option.getOrElse(logHooks, () => defaultSettings.categories.hooks)
        }
      }

      return AgentLoggingConfig.of({ settings })
    })
  )
}
