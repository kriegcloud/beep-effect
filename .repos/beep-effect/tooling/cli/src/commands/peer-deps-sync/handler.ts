/**
 * @file peer-deps-sync Command Handler
 *
 * Orchestrates live reference policy loading, staged-file scoped package
 * discovery, and package.json dependency section synchronization.
 *
 * @module peer-deps-sync/handler
 * @since 0.1.0
 */

import { findRepoRoot } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import color from "picocolors";
import {
  filterRelevantConfigSyncStagedFiles,
  getStagedFiles,
  resolveConfigSyncPreCommitScope,
} from "../tsconfig-sync/pre-commit.js";
import { DriftDetectedError } from "./errors.js";
import { buildDependencySortContext, discoverWorkspaceLibraryPackages, syncPackageManifest } from "./package-sync.js";
import { loadReferencePolicy } from "./policy.js";
import { getSyncMode, type PeerDepsSyncInput } from "./schemas.js";

export const peerDepsSyncHandler = (input: PeerDepsSyncInput) =>
  Effect.gen(function* () {
    const mode = getSyncMode(input);
    const repoRoot = yield* findRepoRoot;
    const referencePolicy = yield* loadReferencePolicy(repoRoot);
    const sortContext = yield* buildDependencySortContext;
    const allWorkspacePackages = yield* discoverWorkspaceLibraryPackages(repoRoot);

    if (input.verbose) {
      yield* Console.log(
        color.cyan(
          `Loaded reference policy from ${referencePolicy.referencePath} (${referencePolicy.packageCount} package manifests, ${referencePolicy.peerOnlyNames.size} peer-only deps, ${referencePolicy.optionalPeerNames.size} optional peers)`
        )
      );
    }

    let scopedPackageNames: undefined | ReadonlySet<string> = undefined;

    if (input.preCommit) {
      const stagedFiles = yield* getStagedFiles;
      const relevantStagedFiles = filterRelevantConfigSyncStagedFiles(stagedFiles);

      if (A.isEmptyArray(relevantStagedFiles)) {
        yield* Console.log(color.green("No relevant staged files, skipping peer-deps-sync."));
        return;
      }

      const workspaceEntries = A.map(allWorkspacePackages, (pkg) => ({
        name: pkg.name,
        relativeDir: pkg.relativePackageJsonPath.replace(/\/package\.json$/, ""),
      }));
      const scope = resolveConfigSyncPreCommitScope(relevantStagedFiles, workspaceEntries, workspaceEntries, []);

      if (scope.mode === "skip" || (scope.mode === "subset" && scope.manifestPackageNames.size === 0)) {
        yield* Console.log(color.green("No relevant staged files, skipping peer-deps-sync."));
        return;
      }

      if (scope.mode === "subset") {
        scopedPackageNames = scope.manifestPackageNames;
        if (input.verbose) {
          yield* Console.log(
            color.cyan(
              `Scoped peer-deps-sync to ${scope.manifestPackageNames.size} staged package(s): ${A.join(Array.from(scope.manifestPackageNames), ", ")}`
            )
          );
        }
      } else if (input.verbose) {
        yield* Console.log(
          color.cyan(
            `Policy-affecting files staged, checking all package manifests (${scope.stagedFiles.length} files)`
          )
        );
      }
    }

    const packagesToProcess = yield* discoverWorkspaceLibraryPackages(repoRoot, {
      filter: input.filter,
      packageNames: scopedPackageNames,
    });

    if (input.filter && A.isEmptyArray(packagesToProcess)) {
      yield* Console.log(color.yellow(`Package ${input.filter} not found in scoped workspace library set`));
      return;
    }

    if (A.isEmptyArray(packagesToProcess)) {
      yield* Console.log(color.green("No workspace library manifests matched, skipping."));
      return;
    }

    yield* Console.log(color.cyan(`Processing ${A.length(packagesToProcess)} package manifest(s)...`));

    let changesNeeded = 0;
    let changesApplied = 0;

    for (const pkg of packagesToProcess) {
      const result = yield* syncPackageManifest(pkg, referencePolicy, sortContext, mode);

      if (!result.hasChanges) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  ${pkg.name}: no changes needed`));
        }
        continue;
      }

      const changedFieldsText = A.join(result.changedFields, ", ");
      if (mode === "check") {
        changesNeeded++;
        yield* Console.log(color.yellow(`  ${pkg.name}: drift detected in ${changedFieldsText}`));
      } else if (mode === "dry-run") {
        changesNeeded++;
        yield* Console.log(color.cyan(`  ${pkg.name}: would update ${changedFieldsText}`));
      } else {
        changesApplied++;
        yield* Console.log(color.green(`  ${pkg.name}: updated ${changedFieldsText}`));
      }
    }

    if (mode === "check") {
      if (changesNeeded > 0) {
        yield* Console.log(color.yellow(`\nPeer dependency drift detected: ${changesNeeded} package(s) need updating`));
        return yield* Effect.fail(
          new DriftDetectedError({
            fileCount: changesNeeded,
            summary: `${changesNeeded} package manifest(s) have outdated dependency section placement`,
          })
        );
      }

      yield* Console.log(color.green("\nAll package manifests are in sync"));
      return;
    }

    if (mode === "dry-run") {
      yield* Console.log(color.cyan(`\nDry-run mode: ${changesNeeded} package(s) would be updated`));
      if (changesNeeded > 0) {
        yield* Console.log(color.cyan("Run without --dry-run to apply changes."));
      }
      return;
    }

    yield* Console.log(color.green(`\nPeer dependency sync complete: ${changesApplied} package(s) updated`));
  }).pipe(Effect.withSpan("peerDepsSyncHandler"));
