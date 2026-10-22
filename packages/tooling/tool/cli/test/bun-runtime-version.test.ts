import { MemoryFileSystem } from "@beep/memfs/MemoryFileSystem";
import { checkBunRuntimeVersion, compareBunRuntimeVersion } from "@beep/repo-cli/commands/VersionSync";
import { it } from "@beep/test-runner";
import { afterEach, describe, expect, vi } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";

afterEach(() => vi.unstubAllGlobals());

describe("Bun runtime version comparison", () => {
  it.effect("accepts equal versions after trimming command and pin newlines", () =>
    Effect.gen(function* () {
      expect(yield* compareBunRuntimeVersion(O.some("1.4.3\n"), "1.4.3\n")).toBe("1.4.3");
    })
  );

  it.effect("rejects different versions with a one-line message naming both", () =>
    Effect.gen(function* () {
      const error = yield* compareBunRuntimeVersion(O.some("1.4.3\n"), "1.4.2\n").pipe(Effect.flip);
      expect(error._tag).toBe("VersionSyncError");
      expect(error.message).toBe("Bun version mismatch: .bun-version=1.4.3; bun --version=1.4.2");
    })
  );

  it.effect("rejects a missing pin", () =>
    Effect.gen(function* () {
      const error = yield* compareBunRuntimeVersion(O.none(), "1.4.3").pipe(Effect.flip);
      expect(error.file).toBe(".bun-version");
      expect(error.message).toBe(".bun-version is missing or empty");
    })
  );

  it.effect("rejects an empty pin", () =>
    Effect.gen(function* () {
      const error = yield* compareBunRuntimeVersion(O.some(" \n"), "1.4.3").pipe(Effect.flip);
      expect(error.message).toBe(".bun-version is missing or empty");
    })
  );
});

// Keep pin I/O in memory; the local CLI gate separately exercises the real Bun process.
const runtimeLayer = Layer.mergeAll(
  MemoryFileSystem.layer,
  Path.layer,
  Layer.succeed(
    ChildProcessSpawner.ChildProcessSpawner,
    ChildProcessSpawner.make(() =>
      Effect.succeed(
        ChildProcessSpawner.makeHandle({
          all: Stream.make(new TextEncoder().encode("1.4.3\n")),
          stdout: Stream.make(new TextEncoder().encode("1.4.3\n")),
          stderr: Stream.empty,
          stdin: Sink.drain,
          exitCode: Effect.succeed(ChildProcessSpawner.ExitCode(0)),
          getInputFd: () => Sink.drain,
          getOutputFd: () => Stream.empty,
          isRunning: Effect.succeed(false),
          kill: () => Effect.void,
          pid: ChildProcessSpawner.ProcessId(1),
          unref: Effect.succeed(Effect.void),
        })
      )
    )
  )
);

it.layer(runtimeLayer, { timeout: "30 seconds" })("Bun runtime preflight I/O", (it) => {
  it.effect("fails closed when the repository has no .bun-version", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const root = yield* fs.makeTempDirectoryScoped();
      const error = yield* checkBunRuntimeVersion(root).pipe(Effect.flip);
      expect(error._tag).toBe("VersionSyncError");
      expect(error.file).toBe(".bun-version");
      expect(error.message).toContain("Cannot read .bun-version");
    })
  );

  it.effect("falls back to command output on non-Bun hosts and rejects a mismatch", () =>
    Effect.gen(function* () {
      vi.stubGlobal("process", { ...process, versions: { ...process.versions, bun: undefined } });
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped();
      yield* fs.writeFileString(path.join(root, ".bun-version"), "0.0.0\n");
      const error = yield* checkBunRuntimeVersion(root).pipe(Effect.flip);
      expect(error.message).toContain("Bun version mismatch: .bun-version=0.0.0; bun --version=");
    })
  );
  it.effect("uses the in-process Bun version without requiring a spawner", () =>
    Effect.gen(function* () {
      vi.stubGlobal("process", { ...process, versions: { ...process.versions, bun: "1.4.2" } });
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped();
      yield* fs.writeFileString(path.join(root, ".bun-version"), "1.4.3\n");
      const error = yield* checkBunRuntimeVersion(root).pipe(
        Effect.provideService(
          ChildProcessSpawner.ChildProcessSpawner,
          ChildProcessSpawner.make(() => Effect.die("must not spawn"))
        ),
        Effect.flip
      );
      expect(error.message).toBe("Bun version mismatch: .bun-version=1.4.3; bun --version=1.4.2");
      yield* fs.writeFileString(path.join(root, ".bun-version"), "1.4.2\n");
      expect(yield* checkBunRuntimeVersion(root)).toBe("1.4.2");
    })
  );
});
