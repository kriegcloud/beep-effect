import { readEnvLoggerConfig } from "@beep/utils/errors";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as LogLevel from "effect/LogLevel";

describe("errors/readEnvLoggerConfig", () => {
  it.scoped("defaults to pretty + All in development (no NODE_ENV)", () =>
    Effect.gen(function* () {
      const prev = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          if (prev == null) delete process.env.NODE_ENV;
          else process.env.NODE_ENV = prev;
        })
      );

      const cfg = yield* readEnvLoggerConfig;
      deepStrictEqual(cfg.format, "pretty");
      deepStrictEqual(cfg.level.ordinal, LogLevel.All.ordinal);
    })
  );

  it.scoped("uses json + Error in production (NODE_ENV=production)", () =>
    Effect.gen(function* () {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          if (prev == null) delete process.env.NODE_ENV;
          else process.env.NODE_ENV = prev;
        })
      );

      const cfg = yield* readEnvLoggerConfig;
      deepStrictEqual(cfg.format, "json");
      deepStrictEqual(cfg.level.ordinal, LogLevel.Error.ordinal);
    })
  );
});
