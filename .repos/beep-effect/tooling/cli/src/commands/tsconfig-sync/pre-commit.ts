/**
 * @file tsconfig-sync Pre-commit Scoping
 *
 * Resolves staged-file-gated config-sync scope for package manifest policy,
 * package tsconfig sync, and app tsconfig sync.
 *
 * @module tsconfig-sync/pre-commit
 * @since 0.1.0
 */

import * as ProcessCommand from "@effect/platform/Command";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { GitStateError } from "../peer-deps-sync/errors.js";

const PRE_COMMIT_RELEVANT_PATTERN =
  /^(packages\/.+\/package\.json|packages\/.+\/tsconfig(?:\.[^/]+)?\.json|tooling\/.+\/package\.json|tooling\/.+\/tsconfig(?:\.[^/]+)?\.json|apps\/[^/]+\/(?:package\.json|tsconfig\.json)|tooling\/cli\/src\/commands\/tsconfig-sync\/.+|tooling\/cli\/src\/commands\/peer-deps-sync\/.+|tooling\/cli\/src\/index\.ts|tooling\/utils\/src\/schemas\/PackageJson\.ts|tooling\/utils\/src\/repo\/.+|package\.json|syncpack\.config\.ts)$/;
const PACKAGE_MANIFEST_PATTERN = /^(packages|tooling)\/.+\/package\.json$/;
const PACKAGE_TSCONFIG_PATTERN = /^(packages|tooling)\/.+\/tsconfig(?:\.[^/]+)?\.json$/;
const APP_FILE_PATTERN = /^apps\/([^/]+)\/(?:package\.json|tsconfig\.json)$/;
const FULL_SCAN_PATTERN =
  /^(tooling\/cli\/src\/commands\/tsconfig-sync\/.+|tooling\/cli\/src\/commands\/peer-deps-sync\/.+|tooling\/cli\/src\/index\.ts|tooling\/utils\/src\/schemas\/PackageJson\.ts|tooling\/utils\/src\/repo\/.+|package\.json|syncpack\.config\.ts)$/;

export interface PackagePathEntry {
  readonly name: string;
  readonly relativeDir: string;
}

export interface ConfigSyncPreCommitScope {
  readonly mode: "skip" | "subset" | "full";
  readonly manifestPackageNames: ReadonlySet<string>;
  readonly packageNames: ReadonlySet<string>;
  readonly appNames: ReadonlySet<string>;
  readonly stagedFiles: ReadonlyArray<string>;
}

const toNormalizedRelativePath = (pathValue: string): string => pathValue.replace(/\\/g, "/");

const packageFileToRelativeDir = (filePath: string): string =>
  toNormalizedRelativePath(filePath).replace(/\/(?:package\.json|tsconfig(?:\.[^/]+)?\.json)$/, "");

export const filterRelevantConfigSyncStagedFiles = (stagedFiles: ReadonlyArray<string>): ReadonlyArray<string> =>
  F.pipe(
    stagedFiles,
    A.filter((file) => PRE_COMMIT_RELEVANT_PATTERN.test(file))
  );

export const getStagedFiles = Effect.gen(function* () {
  const command = F.pipe(
    ProcessCommand.make("git", "diff", "--cached", "--name-only"),
    ProcessCommand.stdout("pipe"),
    ProcessCommand.stderr("pipe")
  );

  const result = yield* ProcessCommand.string(command).pipe(
    Effect.mapError((cause) => new GitStateError({ operation: "git-diff-cached", cause }))
  );

  return F.pipe(
    result,
    Str.trim,
    Str.split("\n"),
    A.filter((line) => Str.length(line) > 0)
  );
});

export const resolveConfigSyncPreCommitScope = (
  stagedFiles: ReadonlyArray<string>,
  workspacePackageEntries: ReadonlyArray<PackagePathEntry>,
  libraryPackageEntries: ReadonlyArray<PackagePathEntry>,
  allAppNames: ReadonlyArray<string>
): ConfigSyncPreCommitScope => {
  const relevantFiles = filterRelevantConfigSyncStagedFiles(stagedFiles);

  if (A.isEmptyArray(relevantFiles)) {
    return {
      mode: "skip",
      manifestPackageNames: new Set<string>(),
      packageNames: new Set<string>(),
      appNames: new Set<string>(),
      stagedFiles: [],
    };
  }

  if (A.some(relevantFiles, (file) => FULL_SCAN_PATTERN.test(file))) {
    return {
      mode: "full",
      manifestPackageNames: new Set(A.map(libraryPackageEntries, (entry) => entry.name)),
      packageNames: new Set(A.map(workspacePackageEntries, (entry) => entry.name)),
      appNames: new Set(allAppNames),
      stagedFiles: relevantFiles,
    };
  }

  const workspacePackageNameByDir = new Map(
    A.map(workspacePackageEntries, (entry) => [toNormalizedRelativePath(entry.relativeDir), entry.name] as const)
  );
  const libraryPackageNameByDir = new Map(
    A.map(libraryPackageEntries, (entry) => [toNormalizedRelativePath(entry.relativeDir), entry.name] as const)
  );
  const manifestPackageNames = new Set<string>();
  const packageNames = new Set<string>();
  const appNames = new Set<string>();

  for (const file of relevantFiles) {
    if (PACKAGE_MANIFEST_PATTERN.test(file)) {
      const relativeDir = packageFileToRelativeDir(file);
      const packageName = workspacePackageNameByDir.get(relativeDir);
      if (packageName) {
        packageNames.add(packageName);
      }

      const libraryPackageName = libraryPackageNameByDir.get(relativeDir);
      if (libraryPackageName) {
        manifestPackageNames.add(libraryPackageName);
      }

      continue;
    }

    if (PACKAGE_TSCONFIG_PATTERN.test(file)) {
      const relativeDir = packageFileToRelativeDir(file);
      const packageName = workspacePackageNameByDir.get(relativeDir);
      if (packageName) {
        packageNames.add(packageName);
      }
      continue;
    }

    const appMatch = APP_FILE_PATTERN.exec(file);
    if (appMatch?.[1] && allAppNames.includes(appMatch[1])) {
      appNames.add(appMatch[1]);
    }
  }

  return {
    mode: manifestPackageNames.size > 0 || packageNames.size > 0 || appNames.size > 0 ? "subset" : "skip",
    manifestPackageNames,
    packageNames,
    appNames,
    stagedFiles: relevantFiles,
  };
};
