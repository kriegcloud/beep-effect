import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { buildRepoDependencyIndex } from "@beep/tooling-utils/repo/DependencyIndex";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const TestLayer = Layer.mergeAll(
  FsUtilsLive,
  NodeFileSystem.layer,
  NodePath.layerPosix,
);

describe("Repo/DependencyIndex.buildRepoDependencyIndex", () => {
  it.scoped(
    "includes @beep/tooling-utils and @beep/root with expected deps",
    () =>
      Effect.gen(function* () {
        const map = yield* buildRepoDependencyIndex;

        // utils workspace exists with effect dependency
        const utils = HashMap.get(map, "@beep/tooling-utils");
        deepStrictEqual(O.isSome(utils), true);
        if (O.isSome(utils)) {
          deepStrictEqual(
            HashSet.has(utils.value.dependencies.npm, "effect"),
            true,
          );
        }

        // root entry exists and has tsx in dev deps
        const root = HashMap.get(map, "@beep/root");
        deepStrictEqual(O.isSome(root), true);
        if (O.isSome(root)) {
          deepStrictEqual(
            HashSet.has(root.value.devDependencies.npm, "tsx"),
            true,
          );
        }

        // ensure map has entries
        deepStrictEqual(HashMap.size(map) > 0, true);
      }).pipe(Effect.provide(TestLayer)),
  );
});
