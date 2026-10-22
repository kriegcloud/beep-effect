import { checkBunRuntimeVersion, compareBunRuntimeVersion } from "@beep/repo-cli/commands/VersionSync";
import { it } from "@beep/test-runner";
import { NodeServices } from "@effect/platform-node";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";

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

it.layer(NodeServices.layer)("Bun runtime preflight I/O", (it) => {
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

  it.effect("runs bun --version and rejects a different pin", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped();
      yield* fs.writeFileString(path.join(root, ".bun-version"), "0.0.0\n");
      const error = yield* checkBunRuntimeVersion(root).pipe(Effect.flip);
      expect(error.message).toContain("Bun version mismatch: .bun-version=0.0.0; bun --version=");
    })
  );
});
