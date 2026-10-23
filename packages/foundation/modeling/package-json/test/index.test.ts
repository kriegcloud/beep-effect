import * as PackageJson from "@beep/package-json";
import { Package } from "@beep/package-json/Package";
import * as PackageJsonFileExports from "@beep/package-json/PackageJsonFile";
import { PackageManifest } from "@beep/package-json/PackageManifest";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { dependencyModulesImporting, runtimeClosureOf } from "./support/rootClosure.ts";

const IO_MODULES = ["effect/FileSystem", "effect/Path"] as const;

describe("@beep/package-json root barrel", () => {
  it.effect("exposes the manifest models by identity", () =>
    Effect.sync(() => {
      assert.strictEqual(PackageJson.Package, Package);
      assert.strictEqual(PackageJson.PackageManifest, PackageManifest);
    })
  );

  it.effect("keeps PackageJsonFile subpath-only", () =>
    Effect.sync(() => {
      const names = R.keys(PackageJson);
      const fileExports = R.keys(PackageJsonFileExports);
      assert.include(fileExports, "PackageJsonFile");
      for (const name of fileExports) {
        assert.notInclude(names, name);
      }
    })
  );

  // W3-f: the @beep/jsonc and @beep/npm-spec re-exports were dropped; consumers
  // import those names from their own packages.
  it.effect("no longer re-exports @beep/jsonc or @beep/npm-spec names", () =>
    Effect.sync(() => {
      const names = R.keys(PackageJson);
      for (const name of [
        "JsoncEdit",
        "DependencySpecifier",
        "InvalidDependencySpecifierError",
        "isValidDependencySpecifier",
      ]) {
        assert.notInclude(names, name);
      }
    })
  );

  it.effect("never reaches the IO surface through its runtime import closure", () =>
    Effect.sync(() => {
      const closure = runtimeClosureOf("index.ts");
      // The walk really ran: the barrel reaches the model and its internals.
      assert.include(closure.modules, "Package.ts");
      assert.include(closure.modules, "internal/wire.ts");
      assert.notInclude(closure.modules, "PackageJsonFile.ts");
      assert.deepStrictEqual(
        A.filter(closure.packages, (specifier) => A.some(IO_MODULES, (io) => Str.startsWith(io)(specifier))),
        []
      );
    })
  );

  it.effect("depends only on packages whose sources never import the IO surface", () =>
    Effect.sync(() => {
      const { scanned, offending } = dependencyModulesImporting(IO_MODULES);
      // The glob really matched: every runtime dependency contributed sources.
      for (const name of ["identity", "jsonc", "npm-spec", "semver", "spdx"]) {
        assert.isTrue(A.some(scanned, Str.startsWith(`${name}/src/`)), name);
      }
      assert.deepStrictEqual(offending, []);
    })
  );

  it.effect("keeps the IO surface reachable from its own subpath", () =>
    Effect.sync(() => {
      assert.include(runtimeClosureOf("PackageJsonFile.ts").packages, "effect/FileSystem");
    })
  );
});
