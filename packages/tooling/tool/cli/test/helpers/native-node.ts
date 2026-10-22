import { StepExec } from "@beep/repo-cli/test/PackageScripts";
import { currentHostPlatform } from "@beep/utils";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Str from "effect/String";

const nativeNodeCandidate = Effect.fnUntraced(function* (candidate: string) {
  const fs = yield* FileSystem.FileSystem;
  if (!(yield* fs.exists(candidate))) return O.none();
  const result = yield* StepExec.runCaptured({
    command: candidate,
    args: ["-p", 'process.versions.bun === undefined ? process.execPath : ""'],
    source: "stdout",
    timeout: "5 seconds",
  });
  const executable = Str.trim(result.output);
  return result.exitCode === 0 && Str.isNonEmpty(executable) ? O.some(executable) : O.none();
});
/** Resolve a genuine Node executable while rejecting Bun's compatibility shim. */
export const hostNodeExecutable = Effect.gen(function* () {
  const path = yield* Path.Path;
  const override = yield* Config.option(Config.NonEmptyString("BEEP_NODE_BIN"));
  const searchPath = yield* Config.String("PATH");
  const candidates = O.isSome(override)
    ? [override.value]
    : A.map(Str.split(currentHostPlatform === "win32" ? ";" : ":")(searchPath), (directory) =>
        path.join(directory, currentHostPlatform === "win32" ? "node.exe" : "node")
      );
  for (const candidate of candidates) {
    const found = yield* nativeNodeCandidate(candidate);
    if (O.isSome(found)) return found.value;
  }
  return yield* Effect.die("Native Node is required for canonical runtime discovery proof.");
});
