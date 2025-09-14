import { serverEnv } from "@beep/core-env/server";
import type * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";

export type LogLevelLive = Layer.Layer<never, never, never>;
export const LogLevelLive: LogLevelLive = Logger.minimumLogLevel(
  serverEnv.app.env === "dev" ? LogLevel.All : LogLevel.Info
);
