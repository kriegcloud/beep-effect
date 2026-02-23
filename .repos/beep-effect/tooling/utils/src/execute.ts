/**
 * Executable script for testing and debugging utilities.
 *
 * Not intended for external use.
 *
 * @since 0.1.0
 */
import { mapWorkspaceToRelativePaths } from "@beep/tooling-utils/repo";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { HashMap, HashSet, Option } from "effect";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { FsUtilsLive } from "./FsUtils.js";

const program = Effect.gen(function* () {
  const packageFileMap = yield* mapWorkspaceToRelativePaths;

  const beepToolingFileSet = HashMap.get(packageFileMap, "@beep/tooling-utils");

  if (Option.isSome(beepToolingFileSet)) {
    for (const file of HashSet.values(beepToolingFileSet.value)) {
      yield* Console.log(file);
    }
  }
}).pipe(
  Effect.catchAll(
    Effect.fnUntraced(function* (error) {
      const message = String(error);
      yield* Console.log(`\nBOOTSTRAP FAILURE :: ${message}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\nTRACE :: ${Cause.pretty(cause)}`);
      return yield* error;
    })
  )
);

BunRuntime.runMain(program.pipe(Effect.provide([BunContext.layer, FsUtilsLive])));
