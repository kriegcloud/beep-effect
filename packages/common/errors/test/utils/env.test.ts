import { describe } from "bun:test";
import { readEnvLoggerConfig } from "@beep/errors/server";
import { deepStrictEqual, scoped } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as LogLevel from "effect/LogLevel";
import * as P from "effect/Predicate";

describe("errors/readEnvLoggerConfig", () => {
  scoped("defaults to pretty + All in development (no NODE_ENV)", () =>
    Effect.gen(function* () {
      const prev = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          if (P.isNullable(prev)) delete process.env.NODE_ENV;
          else process.env.NODE_ENV = prev;
        })
      );

      const cfg = yield* readEnvLoggerConfig;
      deepStrictEqual(cfg.format, "pretty");
      deepStrictEqual(cfg.level.ordinal, LogLevel.All.ordinal);
    })
  );
});
