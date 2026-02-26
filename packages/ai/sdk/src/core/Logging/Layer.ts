import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as References from "effect/References"
import { AgentLoggingConfig, type LogFormat } from "./Config.js"

const resolveLogger = (format: LogFormat) => {
  switch (format) {
    case "pretty":
      return Logger.consolePretty()
    case "structured":
      return Logger.consoleStructured
    case "json":
      return Logger.consoleJson
    case "logfmt":
      return Logger.consoleLogFmt
    case "string":
      return Logger.withConsoleLog(Logger.formatSimple)
  }
}

export const layer = Layer.unwrap(
  Effect.gen(function*() {
    const { settings } = yield* AgentLoggingConfig
    const logger = resolveLogger(settings.format)

    return Layer.mergeAll(
      Logger.layer([logger]),
      Layer.succeed(References.MinimumLogLevel, settings.minLevel)
    )
  })
)

export const layerDefault = layer.pipe(Layer.provide(AgentLoggingConfig.layer))

export const layerDefaultFromEnv = (prefix = "AGENTSDK") =>
  layer.pipe(Layer.provide(AgentLoggingConfig.layerFromEnv(prefix)))
