/**
 * Running Bun version preflight shared by cheap gates and Git hooks.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { VersionSyncError } from "./VersionSync.errors.ts";

/**
 * Compare a repository Bun pin with the running version without performing I/O.
 *
 * **Example** (Check a matching version)
 *
 * ```ts
 * import { compareBunRuntimeVersion } from "@beep/repo-cli/commands/VersionSync"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const version = Effect.runSync(compareBunRuntimeVersion(O.some("1.4.3\n"), "1.4.3\n"))
 * console.log(version) // 1.4.3
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const compareBunRuntimeVersion = Effect.fn("VersionSync.compareBunRuntimeVersion")(function* (
  pinned: O.Option<string>,
  running: string
) {
  const actual = Str.trim(running);
  const expected = yield* O.map(pinned, Str.trim).pipe(O.filter(Str.isNonEmpty), (pin) =>
    Effect.fromOption(pin, () =>
      VersionSyncError.make({ file: ".bun-version", message: ".bun-version is missing or empty" })
    )
  );
  if (expected !== actual) {
    return yield* VersionSyncError.make({
      file: ".bun-version",
      message: `Bun version mismatch: .bun-version=${expected}; bun --version=${actual}`,
    });
  }
  return expected;
});

/**
 * Read the repository pin and run Bun once, failing closed on I/O or process errors.
 *
 * **Example** (Compose the runtime preflight)
 *
 * ```ts
 * import { checkBunRuntimeVersion } from "@beep/repo-cli/commands/VersionSync"
 * import * as Effect from "effect/Effect"
 *
 * console.log(Effect.isEffect(checkBunRuntimeVersion("/repo"))) // true
 * ```
 *
 * @category diagnostics
 * @since 0.0.0
 */
export const checkBunRuntimeVersion = Effect.fn("VersionSync.checkBunRuntimeVersion")(function* (repoRoot: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const pinned = yield* fs
    .readFileString(path.join(repoRoot, ".bun-version"))
    .pipe(VersionSyncError.mapError("Cannot read .bun-version", ".bun-version"));
  const running = yield* Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* spawner.spawn(ChildProcess.make("bun", ["--version"], { cwd: repoRoot }));
      const [output, exitCode] = yield* Effect.all(
        [handle.stdout.pipe(Stream.decodeText, Stream.mkString), handle.exitCode],
        { concurrency: 2 }
      );
      if (exitCode !== 0) {
        return yield* VersionSyncError.make({ file: ".bun-version", message: `bun --version exited ${exitCode}` });
      }
      return output;
    })
  ).pipe(VersionSyncError.mapError("Cannot run bun --version", ".bun-version"));
  return yield* compareBunRuntimeVersion(O.some(pinned), running);
});
