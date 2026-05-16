import {
  InstallerDependenciesConfig,
  makeInstallerDependenciesConfigLayer,
} from "@beep/installer-dependencies-config/layer";
import { encodeJsonString } from "@beep/schema/Json";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";

const TestLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

const makeTempRepo = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.makeTempDirectoryScoped({ prefix: "installer-dependencies-config-" });
});

const writeJsonFile = Effect.fnUntraced(function* (filePath: string, value: unknown) {
  const fs = yield* FileSystem.FileSystem;
  const encoded = yield* encodeJsonString(value);
  yield* fs.writeFileString(filePath, `${encoded}\n`);
});

describe("@beep/installer-dependencies-config", () => {
  it.effect(
    "prefers .bun-version when present",
    Effect.fnUntraced(function* () {
      yield* Effect.gen(function* () {
        const path = yield* Path.Path;
        const fs = yield* FileSystem.FileSystem;
        const repoRoot = yield* makeTempRepo();
        yield* fs.writeFileString(path.join(repoRoot, ".bun-version"), "1.3.14\n");
        yield* writeJsonFile(path.join(repoRoot, "package.json"), { packageManager: "bun@1.3.13" });

        const config = yield* InstallerDependenciesConfig.pipe(
          Effect.provide(makeInstallerDependenciesConfigLayer(repoRoot))
        );

        expect(config.bunRuntime.requiredVersion).toBe("1.3.14");
      }).pipe(Effect.provide(TestLayer));
    })
  );

  it.effect(
    "falls back to packageManager when .bun-version is absent",
    Effect.fnUntraced(function* () {
      yield* Effect.gen(function* () {
        const path = yield* Path.Path;
        const repoRoot = yield* makeTempRepo();
        yield* writeJsonFile(path.join(repoRoot, "package.json"), { packageManager: "bun@1.3.14" });

        const config = yield* InstallerDependenciesConfig.pipe(
          Effect.provide(makeInstallerDependenciesConfigLayer(repoRoot))
        );

        expect(config.bunRuntime.requiredVersion).toBe("1.3.14");
      }).pipe(Effect.provide(TestLayer));
    })
  );
});
