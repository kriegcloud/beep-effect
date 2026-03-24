import fs from "node:fs";

import { Effect, Logger } from "effect";
import * as Layer from "effect/Layer";

import { ServerConfig } from "./config";

export const ServerLoggerLive = Effect.gen(function* () {
  const { logsDir, serverLogPath } = yield* ServerConfig;

  yield* Effect.sync(() => {
    fs.mkdirSync(logsDir, { recursive: true });
  });

  const fileLogger = Logger.formatSimple.pipe(Logger.toFile(serverLogPath));

  return Logger.layer([Logger.defaultLogger, fileLogger], {
    mergeWithExisting: false,
  });
}).pipe(Layer.unwrap);
