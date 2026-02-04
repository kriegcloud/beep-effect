import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import { AgentLoggingConfig, type LogFormat } from "./Config.js"

const resolveLogger = (format: LogFormat) => {
  switch (format) {
    case "pretty":
      return Logger.prettyLogger()
    case "structured":
      return Logger.structuredLogger
    case "json":
      return Logger.jsonLogger
    case "logfmt":
      return Logger.logfmtLogger
    case "string":
      return Logger.stringLogger
  }
}

const needsConsoleRouting = (format: LogFormat) => format !== "pretty"

export const layer = Layer.unwrapEffect(
  Effect.gen(function*() {
    const { settings } = yield* AgentLoggingConfig
    const baseLogger = resolveLogger(settings.format)
    const routedLogger = needsConsoleRouting(settings.format)
      ? Logger.withLeveledConsole(baseLogger)
      : baseLogger
    const logger = settings.includeSpans
      ? Logger.withSpanAnnotations(routedLogger)
      : routedLogger

    return Layer.mergeAll(
      Logger.replace(Logger.defaultLogger, logger),
      Logger.minimumLogLevel(settings.minLevel)
    )
  })
)

export const layerDefault = layer.pipe(Layer.provide(AgentLoggingConfig.layer))

export const layerDefaultFromEnv = (prefix = "AGENTSDK") =>
  layer.pipe(Layer.provide(AgentLoggingConfig.layerFromEnv(prefix)))
