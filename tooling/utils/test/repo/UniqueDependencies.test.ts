import { getUniqueDeps } from "@beep/tooling-utils";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { collectUniqueNpmDependencies } from "@beep/tooling-utils/repo/UniqueDependencies";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const TestLayer = Layer.mergeAll(
  FsUtilsLive,
  NodeFileSystem.layer,
  NodePath.layerPosix,
);

describe("Repo/UniqueDependencies", () => {
  it.scoped("collectUniqueNpmDependencies returns expected unions", () =>
    Effect.gen(function* () {
      const res = yield* collectUniqueNpmDependencies;
      // deps should include a core dependency used in this pkg
      deepStrictEqual(res.dependencies.includes("effect"), true);
      // devDeps should include a root dev dep like tsx
      deepStrictEqual(res.devDependencies.includes("tsx"), true);
    }).pipe(Effect.provide(TestLayer)),
  );

  it.scoped("getUniqueDeps alias matches collectUniqueNpmDependencies", () =>
    Effect.gen(function* () {
      const a = yield* collectUniqueNpmDependencies;
      const b = yield* getUniqueDeps;
      deepStrictEqual(a.dependencies.sort(), b.dependencies.sort());
      deepStrictEqual(a.devDependencies.sort(), b.devDependencies.sort());
    }).pipe(Effect.provide(TestLayer)),
  );
});
