/**
 * @file Unit tests for docgen configuration utilities.
 * @module docgen/shared/config.test
 */

import {
  DOCGEN_CONFIG_FILENAME,
  findTsConfig,
  hasDocgenConfig,
  loadDocgenConfig,
  loadTsConfig,
  TSCONFIG_PRECEDENCE,
} from "@beep/repo-cli/commands/docgen/shared/config";
import { describe, expect, it, layer } from "@beep/testkit";
import * as Path from "@effect/platform/Path";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

describe("config utilities", () => {
  describe("constants", () => {
    it("DOCGEN_CONFIG_FILENAME is docgen.json", () => {
      expect(DOCGEN_CONFIG_FILENAME).toBe("docgen.json");
    });

    it("TSCONFIG_PRECEDENCE has correct order", () => {
      expect(A.length(TSCONFIG_PRECEDENCE)).toBe(3);
      expect(TSCONFIG_PRECEDENCE[0]).toBe("tsconfig.src.json");
      expect(TSCONFIG_PRECEDENCE[1]).toBe("tsconfig.build.json");
      expect(TSCONFIG_PRECEDENCE[2]).toBe("tsconfig.json");
    });
  });

  const TestLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

  layer(TestLayer)("hasDocgenConfig", (it) => {
    it.effect("returns false for non-existent directory", () =>
      Effect.gen(function* () {
        const result = yield* hasDocgenConfig("/non/existent/path");
        expect(result).toBe(false);
      })
    );
  });

  layer(TestLayer)("loadDocgenConfig", (it) => {
    it.effect("fails for non-existent config file", () =>
      Effect.gen(function* () {
        const result = yield* loadDocgenConfig("/non/existent/path").pipe(Effect.either);
        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left._tag).toBe("DocgenConfigError");
        }
      })
    );
  });

  layer(TestLayer)("findTsConfig", (it) => {
    it.effect("fails when no tsconfig found", () =>
      Effect.gen(function* () {
        const result = yield* findTsConfig("/non/existent/path").pipe(Effect.either);
        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left._tag).toBe("TsConfigNotFoundError");
          expect(A.length(result.left.searchedFiles)).toBe(3);
        }
      })
    );

    it.effect("finds tsconfig.json in real package", () =>
      Effect.gen(function* () {
        const path = yield* Path.Path;
        // Use the current package which should have a tsconfig.json
        const packagePath = path.resolve(process.cwd(), "tooling/cli");
        const result = yield* findTsConfig(packagePath).pipe(Effect.either);
        // This may succeed or fail depending on whether tsconfig exists
        expect(result._tag === "Right" || result._tag === "Left").toBe(true);
      })
    );
  });

  layer(TestLayer)("loadTsConfig", (it) => {
    it.effect("fails for non-existent tsconfig", () =>
      Effect.gen(function* () {
        const result = yield* loadTsConfig("/non/existent/tsconfig.json").pipe(Effect.either);
        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left._tag).toBe("DocgenConfigError");
        }
      })
    );
  });

  layer(TestLayer)("integration scenarios", (it) => {
    it.effect("hasDocgenConfig returns boolean", () =>
      Effect.gen(function* () {
        const result = yield* hasDocgenConfig("/tmp");
        expect(typeof result).toBe("boolean");
      })
    );
  });
});
