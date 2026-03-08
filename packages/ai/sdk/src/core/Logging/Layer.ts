import { Effect, Layer, Logger, Match, References } from "effect";
import { AgentLoggingConfig, type LogFormat } from "./Config.js";

const resolveLogger = (format: LogFormat) =>
  Match.value(format).pipe(
    Match.when("pretty", () => Logger.consolePretty()),
    Match.when("structured", () => Logger.consoleStructured),
    Match.when("json", () => Logger.consoleJson),
    Match.when("logfmt", () => Logger.consoleLogFmt),
    Match.when("string", () => Logger.withConsoleLog(Logger.formatSimple)),
    Match.exhaustive
  );

/**
 * @since 0.0.0
 * @category CrossCutting
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
 * @category CrossCutting
 */
export const layerDefault = layer.pipe(Layer.provide(AgentLoggingConfig.layer));

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export const layerDefaultFromEnv = (prefix = "AGENTSDK") =>
  layer.pipe(Layer.provide(AgentLoggingConfig.layerFromEnv(prefix)));
