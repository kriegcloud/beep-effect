import { serverEnv } from "@beep/core-env/server";
import { makePrettyConsoleLoggerLayer } from "@beep/errors/server";
import type * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
export type LoggerLive = Layer.Layer<never, never, never>;
export const LoggerLive: LoggerLive = serverEnv.app.env === "dev" ? makePrettyConsoleLoggerLayer() : Logger.json;
