import { makePrettyConsoleLoggerLayer } from "@beep/errors/server";
import * as Bool from "effect/Boolean";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import { isDevEnvironment, logLevel } from "./Environment";
export type LoggingLive = Layer.Layer<never, never, never>;

export const LoggingLive: LoggingLive = Layer.mergeAll(
  Bool.match(isDevEnvironment, {
    onTrue: makePrettyConsoleLoggerLayer,
    onFalse: () => Logger.json,
  }),
  Logger.minimumLogLevel(logLevel)
);
