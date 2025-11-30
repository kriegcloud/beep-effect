import { DotEnv } from "@beep/tooling-utils/schemas";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { FsUtilsLive } from "./FsUtils";

const program = Effect.gen(function* () {
  const parsed = yield* DotEnv.readEnvFile;
  const appName = yield* parsed.getVar("APP_NAME");

  yield* Console.log(parsed.toJson());
  yield* Console.log("appName: ", appName);
}).pipe(
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      const message = String(error);
      yield* Console.log(`\nBOOTSTRAP FAILURE :: ${message}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\nTRACE :: ${Cause.pretty(cause)}`);
      return yield* Effect.fail(error);
    })
  )
);

BunRuntime.runMain(program.pipe(Effect.provide([BunContext.layer, FsUtilsLive])));
