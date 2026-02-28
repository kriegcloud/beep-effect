import { Effect, Layer, Logger, References } from "effect";
import { AgentLoggingConfig, type LogFormat } from "./Config.js";

const resolveLogger = (format: LogFormat) => {
  switch (format) {
    case "pretty":
      return Logger.consolePretty();
    case "structured":
      return Logger.consoleStructured;
    case "json":
      return Logger.consoleJson;
    case "logfmt":
      return Logger.consoleLogFmt;
    case "string":
      return Logger.withConsoleLog(Logger.formatSimple);
  }
};

/**
 * @since 0.0.0
 */
export const layer = Layer.unwrap(
  Effect.gen(function* () {
    const { settings } = yield* AgentLoggingConfig;
    const logger = resolveLogger(settings.format);

    return Layer.mergeAll(Logger.layer([logger]), Layer.succeed(References.MinimumLogLevel, settings.minLevel));
  })
);

/**
 * @since 0.0.0
 */
export const layerDefault = layer.pipe(Layer.provide(AgentLoggingConfig.layer));

/**
 * @since 0.0.0
 */
export const layerDefaultFromEnv = (prefix = "AGENTSDK") =>
  layer.pipe(Layer.provide(AgentLoggingConfig.layerFromEnv(prefix)));
