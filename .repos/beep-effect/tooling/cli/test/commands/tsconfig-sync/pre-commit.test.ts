/**
 * @file Unit tests for tsconfig-sync pre-commit scope resolution.
 * @module tsconfig-sync/pre-commit.test
 */

import { resolveConfigSyncPreCommitScope } from "@beep/repo-cli/commands/tsconfig-sync/pre-commit";
import { deepStrictEqual, describe, it, strictEqual } from "@beep/testkit";

const workspaceEntries = [
  { name: "@beep/foo", relativeDir: "packages/common/foo" },
  { name: "@beep/bar", relativeDir: "tooling/bar" },
];

const libraryEntries = [{ name: "@beep/foo", relativeDir: "packages/common/foo" }];

describe("resolveConfigSyncPreCommitScope", () => {
  it("skips when no relevant files are staged", () => {
    const scope = resolveConfigSyncPreCommitScope(["README.md"], workspaceEntries, libraryEntries, ["todox"]);

    strictEqual(scope.mode, "skip");
  });

  it("scopes package manifests to manifest and package phases", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["packages/common/foo/package.json"],
      workspaceEntries,
      libraryEntries,
      ["todox"]
    );

    strictEqual(scope.mode, "subset");
    deepStrictEqual(Array.from(scope.manifestPackageNames), ["@beep/foo"]);
    deepStrictEqual(Array.from(scope.packageNames), ["@beep/foo"]);
    deepStrictEqual(Array.from(scope.appNames), []);
  });

  it("scopes tooling tsconfig changes to package config work only", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["tooling/bar/tsconfig.build.json"],
      workspaceEntries,
      libraryEntries,
      ["todox"]
    );

    strictEqual(scope.mode, "subset");
    deepStrictEqual(Array.from(scope.manifestPackageNames), []);
    deepStrictEqual(Array.from(scope.packageNames), ["@beep/bar"]);
  });

  it("scopes app tsconfig changes to app work only", () => {
    const scope = resolveConfigSyncPreCommitScope(["apps/todox/tsconfig.json"], workspaceEntries, libraryEntries, [
      "todox",
    ]);

    strictEqual(scope.mode, "subset");
    deepStrictEqual(Array.from(scope.packageNames), []);
    deepStrictEqual(Array.from(scope.appNames), ["todox"]);
  });

  it("falls back to a full scan when config-sync code changes are staged", () => {
    const scope = resolveConfigSyncPreCommitScope(
      ["tooling/cli/src/commands/tsconfig-sync/handler.ts"],
      workspaceEntries,
      libraryEntries,
      ["todox"]
    );

    strictEqual(scope.mode, "full");
    deepStrictEqual(Array.from(scope.manifestPackageNames), ["@beep/foo"]);
    deepStrictEqual(Array.from(scope.packageNames), ["@beep/foo", "@beep/bar"]);
    deepStrictEqual(Array.from(scope.appNames), ["todox"]);
  });
});
