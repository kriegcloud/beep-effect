#!/usr/bin/env node
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { DomainError, getWorkspaceDir } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { convertDirectoryToNextgen } from "./utils/convert-to-nextgen";

const program = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const fsUtils = yield* FsUtils;

  const webDir = yield* getWorkspaceDir("@beep/web");
  yield* Console.log("WEB DIR:", webDir);

  const publicDir = path.resolve(webDir, "public");
  if (!(yield* fs.exists(publicDir))) {
    return yield* new DomainError({
      message: `publicDir: ${publicDir} does not exist in file system`,
    });
  }

  const resolvedPublicDir = yield* fsUtils.existsOrThrow(publicDir);
  yield* Console.log("PUBLIC DIR:", resolvedPublicDir);

  const results = yield* convertDirectoryToNextgen({ dir: resolvedPublicDir });
  if (results.length === 0) {
    yield* Console.log("No legacy assets to convert.");
    return results;
  }

  yield* Console.log("Converted assets:", JSON.stringify(results, null, 2));
  return results;
}).pipe(
  Effect.provide([NodeContext.layer, FsUtilsLive]),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Console.log("\n💥 Program failed:", String(error));
      const cause = Cause.fail(error);
      yield* Console.log("\n🔍 Error details:", Cause.pretty(cause));
      return yield* Effect.fail(error);
    })
  )
);

NodeRuntime.runMain(program);
