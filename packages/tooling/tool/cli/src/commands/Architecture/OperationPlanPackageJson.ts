/**
 * Architecture operation-plan package manifest rendering.
 *
 * @packageDocumentation
 * @category cli-commands
 * @since 0.0.0
 */

import { jsonStringifyPretty } from "@beep/repo-utils";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type { ArchitecturePackageRole, WritePackageJsonOperation } from "./OperationPlan.js";

const packageExportSourceFor = (role: ArchitecturePackageRole, subpath: string): string => {
  if (subpath === ".") return "./src/index.ts";
  if (subpath === "./layer" && role === "server") return "./src/Layer.ts";
  if (Str.endsWith("/*")(subpath)) return `./src/${Str.replace("/*", "/*/index.ts")(Str.replace("./", "")(subpath))}`;
  if (
    role === "domain" &&
    (subpath === "./aggregates" || subpath === "./entities" || subpath === "./identity" || subpath === "./values")
  ) {
    return `./src/${Str.replace("./", "")(subpath)}/index.ts`;
  }
  return `./src/${Str.replace("./", "")(subpath)}.ts`;
};

const packageExportPublishSourceFor = (role: ArchitecturePackageRole, subpath: string): string => {
  if (subpath === ".") return "./dist/index.js";
  if (subpath === "./layer" && role === "server") return "./dist/Layer.js";
  if (Str.endsWith("/*")(subpath)) return `./dist/${Str.replace("/*", "/*/index.js")(Str.replace("./", "")(subpath))}`;
  if (
    role === "domain" &&
    (subpath === "./aggregates" || subpath === "./entities" || subpath === "./identity" || subpath === "./values")
  ) {
    return `./dist/${Str.replace("./", "")(subpath)}/index.js`;
  }
  return `./dist/${Str.replace("./", "")(subpath)}.js`;
};

const packageExportMapFor = (
  role: ArchitecturePackageRole,
  exports: ReadonlyArray<string>,
  publish: boolean
): R.ReadonlyRecord<string, string | null> =>
  pipe(
    exports,
    A.map(
      (subpath) =>
        [
          subpath,
          publish ? packageExportPublishSourceFor(role, subpath) : packageExportSourceFor(role, subpath),
        ] as const
    ),
    (entries) => [...entries, ["./internal/*", null] as const, ["./package.json", "./package.json"] as const],
    R.fromEntries
  );

/**
 * Render a structured package manifest operation.
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const renderPackageJsonOperation = Effect.fn(function* (operation: WritePackageJsonOperation) {
  return yield* jsonStringifyPretty({
    name: operation.packageName,
    version: "0.0.0",
    description: operation.packageDescription,
    license: "MIT",
    private: true,
    type: "module",
    homepage: `https://github.com/kriegcloud/beep-effect/tree/main/${operation.repositoryDirectory}`,
    repository: {
      type: "git",
      url: "git@github.com:kriegcloud/beep-effect.git",
      directory: operation.repositoryDirectory,
    },
    scripts: {
      audit: "bun run --if-present beep:audit",
      babel: "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
      "beep:audit":
        "bun run beep:build && bun run beep:check && bun run beep:test && bun run beep:test:integration && bun run beep:lint",
      "beep:build": "tsc -b tsconfig.json && bun run babel",
      "beep:check": "tsgo -b tsconfig.json",
      "beep:lint": "biome check .",
      "beep:lint:fix": "biome check . --write",
      "beep:test": "bunx --bun vitest run --passWithNoTests --exclude=test/integration/**",
      "beep:test:integration": "bunx --bun vitest run test/integration --passWithNoTests",
      build: "bun run beep:build",
      check: "bun run beep:check",
      coverage: "bunx --bun vitest run --coverage --passWithNoTests --exclude=test/integration/**",
      docgen: "bun run ../../../packages/tooling/tool/docgen/src/bin.ts",
      lint: "bun run beep:lint",
      "lint:fix": "bun run beep:lint:fix",
      test: "bun run beep:test",
      "test:integration": "bun run beep:test:integration",
    },
    exports: packageExportMapFor(operation.role, operation.exports, false),
    files: ["src/**/*.ts", "dist/**/*.js", "dist/**/*.js.map", "dist/**/*.d.ts", "dist/**/*.d.ts.map"],
    sideEffects: [],
    publishConfig: {
      access: "public",
      provenance: true,
      exports: packageExportMapFor(operation.role, operation.exports, true),
    },
    dependencies: operation.dependencies,
    devDependencies: operation.devDependencies,
  });
});
