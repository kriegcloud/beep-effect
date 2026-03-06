import {
  decodePackageJson,
  decodePackageJsonExit,
  NpmPackageJson,
  type PackageJson,
} from "@beep/repo-utils/schemas/PackageJson";
import { describe, expect, it } from "@effect/vitest";
import { Exit } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("PackageJson schema", () => {
  describe("valid structures", () => {
    it("decodes minimal package.json (name only)", () => {
      const result = decodePackageJson({ name: "my-package" });
      expect(result.name).toBe("my-package");
    });

    it("decodes a full npm-oriented package.json with typed fields", () => {
      const input = {
        name: "@beep/repo-utils",
        version: "1.0.0",
        description: "Monorepo utilities",
        keywords: ["monorepo", "effect"],
        license: "MIT",
        private: true,
        type: "module",
        main: "./dist/index.js",
        module: "./dist/index.mjs",
        types: "./dist/index.d.ts",
        browser: {
          "./src/server.ts": "./src/browser.ts",
          fs: false,
        },
        scripts: {
          build: "tsc -b",
          test: "vitest",
        },
        dependencies: {
          effect: "^4.0.0",
        },
        devDependencies: {
          "@types/node": "^20.0.0",
        },
        peerDependencies: {
          typescript: "^5.0.0",
        },
        peerDependenciesMeta: {
          typescript: {
            optional: true,
          },
        },
        optionalDependencies: {
          fsevents: "^2.3.0",
        },
        files: ["dist", "src"],
        engines: { node: ">=20" },
        os: ["darwin", "linux"],
        cpu: ["x64"],
        funding: [
          "https://github.com/sponsors/beep",
          { type: "github", url: "https://github.com/sponsors/beep-effect" },
        ],
        homepage: "https://github.com/example/repo",
      };

      const result = decodePackageJson(input);
      expect(result.name).toBe("@beep/repo-utils");
      expect(result.browser).toEqual(
        O.some({
          "./src/server.ts": "./src/browser.ts",
          fs: false,
        })
      );
      expect(result.peerDependenciesMeta).toEqual(
        O.some({
          typescript: {
            optional: true,
          },
        })
      );
      expect(result.funding).toEqual(
        O.some(["https://github.com/sponsors/beep", { type: "github", url: "https://github.com/sponsors/beep-effect" }])
      );
    });

    it("decodes package exports and publishConfig exports as structured data", () => {
      const input = {
        name: "pkg",
        exports: {
          "./package.json": "./package.json",
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
            require: "./dist/index.cjs",
          },
          "./internal/*": null,
          "./*": ["./dist/*.js", "./dist/*.cjs"],
        },
        publishConfig: {
          access: "public",
          provenance: true,
          bin: {
            "pkg-cli": "./dist/bin.js",
          },
          exports: {
            "./package.json": "./package.json",
            ".": "./dist/index.js",
            "./internal/*": null,
          },
        },
      };

      const result = decodePackageJson(input);
      expect(result.exports).toEqual(
        O.some({
          "./package.json": "./package.json",
          ".": {
            types: "./dist/index.d.ts",
            import: "./dist/index.js",
            require: "./dist/index.cjs",
          },
          "./internal/*": null,
          "./*": ["./dist/*.js", "./dist/*.cjs"],
        })
      );
      expect(result.publishConfig).toEqual(
        O.some({
          access: "public",
          provenance: true,
          bin: {
            "pkg-cli": "./dist/bin.js",
          },
          exports: {
            "./package.json": "./package.json",
            ".": "./dist/index.js",
            "./internal/*": null,
          },
        })
      );
    });

    it("decodes imports mappings", () => {
      const result = decodePackageJson({
        name: "pkg",
        imports: {
          "#internal": "./src/internal.ts",
          "#runtime/*": {
            types: "./src/runtime/*.d.ts",
            default: "./src/runtime/*.ts",
          },
        },
      });

      expect(result.imports).toEqual(
        O.some({
          "#internal": "./src/internal.ts",
          "#runtime/*": {
            types: "./src/runtime/*.d.ts",
            default: "./src/runtime/*.ts",
          },
        })
      );
    });

    it("decodes workspaces as an array", () => {
      const result = decodePackageJson({
        name: "pkg",
        workspaces: ["packages/*", "tooling/*"],
      });

      expect(result.workspaces).toEqual(O.some(["packages/*", "tooling/*"]));
    });

    it("decodes workspaces as an object", () => {
      const result = decodePackageJson({
        name: "pkg",
        workspaces: {
          packages: ["packages/*"],
          nohoist: ["react"],
        },
      });

      expect(result.workspaces).toEqual(
        O.some({
          packages: ["packages/*"],
          nohoist: ["react"],
        })
      );
    });

    it("decodes sideEffects as a boolean or array", () => {
      const booleanResult = decodePackageJson({
        name: "pkg",
        sideEffects: false,
      });
      const arrayResult = decodePackageJson({
        name: "pkg",
        sideEffects: ["**/*.css"],
      });

      expect(booleanResult.sideEffects).toEqual(O.some(false));
      expect(arrayResult.sideEffects).toEqual(O.some(["**/*.css"]));
    });

    it("decodes repo-local top-level fields", () => {
      const result = decodePackageJson({
        name: "@beep/root",
        private: true,
        packageManager: "bun@1.3.10",
        repository: {
          type: "git",
          url: "git@github.com:kriegcloud/beep-effect.git",
          directory: ".",
        },
        workspaces: [".claude", "packages/common/*", "tooling/repo-utils"],
        catalog: {
          effect: "^4.0.0-beta.27",
          typescript: "^5.9.3",
        },
        "resolutions#": {
          "@beep/*": "Needed to force PNPM to install local packages",
        },
      });

      expect(result.packageManager).toEqual(O.some("bun@1.3.10"));
      expect(result.catalog).toEqual(
        O.some({
          effect: "^4.0.0-beta.27",
          typescript: "^5.9.3",
        })
      );
      expect(result["resolutions#"]).toEqual(
        O.some({
          "@beep/*": "Needed to force PNPM to install local packages",
        })
      );
    });

    it("keeps npm-only schema separate from repo-only extensions", () => {
      const decodeNpmPackageJson = S.decodeUnknownExit(NpmPackageJson);
      const exit = decodeNpmPackageJson(
        {
          name: "pkg",
          catalog: {
            effect: "^4.0.0",
          },
        },
        { onExcessProperty: "error" }
      );

      expect(Exit.isFailure(exit)).toBe(true);
    });
  });

  describe("malformed structures", () => {
    it("rejects missing name field", () => {
      expect(Exit.isFailure(decodePackageJsonExit({ version: "1.0.0" }))).toBe(true);
    });

    it("rejects empty string names", () => {
      expect(Exit.isFailure(decodePackageJsonExit({ name: "" }))).toBe(true);
    });

    it("rejects invalid package names", () => {
      expect(Exit.isFailure(decodePackageJsonExit({ name: "UpperCaseName" }))).toBe(true);
    });

    it("rejects repository objects without required type", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            repository: {
              url: "git@github.com:user/repo.git",
            },
          })
        )
      ).toBe(true);
    });

    it("rejects funding objects without a url", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            funding: {
              type: "github",
            },
          })
        )
      ).toBe(true);
    });

    it("rejects exports objects with invalid keys", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            exports: {
              "1invalid": "./dist/index.js",
            },
          })
        )
      ).toBe(true);
    });

    it("rejects imports objects with invalid keys", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            imports: {
              internal: "./src/internal.ts",
            },
          })
        )
      ).toBe(true);
    });

    it("rejects workspaces as a string", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            workspaces: "packages/*",
          })
        )
      ).toBe(true);
    });

    it("rejects unexpected top-level keys", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            unexpected: true,
          })
        )
      ).toBe(true);
    });

    it("rejects private as a string", () => {
      expect(
        Exit.isFailure(
          decodePackageJsonExit({
            name: "pkg",
            private: "true",
          })
        )
      ).toBe(true);
    });

    it("rejects non-object input", () => {
      expect(Exit.isFailure(decodePackageJsonExit("not-an-object"))).toBe(true);
      expect(Exit.isFailure(decodePackageJsonExit(42))).toBe(true);
      expect(Exit.isFailure(decodePackageJsonExit(null))).toBe(true);
      expect(Exit.isFailure(decodePackageJsonExit(undefined))).toBe(true);
      expect(Exit.isFailure(decodePackageJsonExit([]))).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles empty arrays for list fields", () => {
      const result = decodePackageJson({
        name: "pkg",
        keywords: [],
        files: [],
        workspaces: [],
      });

      expect(result.keywords).toEqual(O.some([]));
      expect(result.files).toEqual(O.some([]));
      expect(result.workspaces).toEqual(O.some([]));
    });

    it("handles scoped package names", () => {
      const result = decodePackageJson({ name: "@scope/package-name" });
      expect(result.name).toBe("@scope/package-name");
    });

    it("decodes a real-world workspace package shape from this repo", () => {
      const result = decodePackageJson({
        name: "@beep/repo-utils",
        version: "0.0.0",
        type: "module",
        private: true,
        license: "MIT",
        description: "Effect-based monorepo utilities",
        homepage: "https://github.com/kriegcloud/beep-effect/tree/main/tooling/repo-utils",
        repository: {
          type: "git",
          url: "git@github.com:kriegcloud/beep-effect.git",
          directory: "tooling/repo-utils",
        },
        sideEffects: [],
        exports: {
          "./package.json": "./package.json",
          ".": "./src/index.ts",
          "./*": "./src/*.ts",
          "./internal/*": null,
        },
        publishConfig: {
          access: "public",
          provenance: true,
          exports: {
            "./package.json": "./package.json",
            ".": "./dist/index.js",
            "./*": "./dist/*.js",
            "./internal/*": null,
          },
        },
        files: ["src/**/*.ts", "dist/**/*.js"],
        scripts: {
          build: "tsc -b tsconfig.json",
          test: "vitest",
        },
        dependencies: {
          effect: "catalog:",
          "@effect/platform-node": "catalog:",
          glob: "catalog:",
        },
        devDependencies: {
          "@types/node": "catalog:",
          "@effect/vitest": "catalog:",
        },
      });

      expect(result.repository).toEqual(
        O.some({
          type: "git",
          url: "git@github.com:kriegcloud/beep-effect.git",
          directory: "tooling/repo-utils",
        })
      );
    });

    it("decodePackageJson throws on invalid input", () => {
      expect(() => decodePackageJson({})).toThrow();
    });
  });

  describe("type inference", () => {
    it("schema Type is correctly shaped", () => {
      const encoded: PackageJson.Encoded = {
        name: "test",
        version: "1.0.0",
        dependencies: { effect: "^4.0.0" },
      };
      const check: PackageJson.Type = decodePackageJson(encoded);

      expect(check.name).toBe("test");
    });
  });
});
