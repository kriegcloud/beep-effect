/**
 * @file tsconfig-sync Command Handler
 *
 * Main handler for the config-sync flow. Orchestrates:
 * - Peer dependency policy normalization for workspace library manifests
 * - Effective dependency graph construction from normalized manifests
 * - Tsconfig reference synchronization
 * - Next.js app sync
 *
 * @module tsconfig-sync/handler
 * @since 0.1.0
 */

import type { PackageJson } from "@beep/tooling-utils";
import { CyclicDependencyError } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import color from "picocolors";
import {
  buildDependencySortContext,
  discoverWorkspaceLibraryPackages,
  planPackageManifestSync,
  writePlannedPackageManifest,
} from "../peer-deps-sync/package-sync.js";
import { loadReferencePolicy } from "../peer-deps-sync/policy.js";
import { processNextJsApps } from "./app-sync.js";
import {
  applyPackageJsonDependencyOverrides,
  checkForCycles,
  discoverWorkspace,
  filterPackages,
  findBuildConfig,
  getPackageCount,
  getPackageDeps,
  withEffectiveDepIndex,
} from "./discover.js";
import { DriftDetectedError } from "./errors.js";
import { syncPackageJson } from "./package-sync.js";
import { filterRelevantConfigSyncStagedFiles, getStagedFiles, resolveConfigSyncPreCommitScope } from "./pre-commit.js";
import { computePackageReferences } from "./references.js";
import { getSyncMode, type TsconfigSyncInput } from "./schemas.js";
import { syncPackageTsconfigs } from "./tsconfig-file-sync.js";
import { NEXT_JS_APPS } from "./types.js";

const buildDriftSummary = (manifestChanges: number, configChanges: number): string => {
  const parts: Array<string> = [];
  if (manifestChanges > 0) {
    parts.push(`${manifestChanges} package manifest(s)`);
  }
  if (configChanges > 0) {
    parts.push(`${configChanges} tsconfig/config target(s)`);
  }

  return `${A.join(parts, ", ")} need updating`;
};

/**
 * Main handler for the tsconfig-sync command.
 *
 * @since 0.1.0
 * @category handlers
 */
export const tsconfigSyncHandler = (input: TsconfigSyncInput) =>
  Effect.gen(function* () {
    const mode = getSyncMode(input);

    let stagedFiles: ReadonlyArray<string> = [];
    if (input.preCommit) {
      stagedFiles = yield* getStagedFiles;
      const relevantStagedFiles = filterRelevantConfigSyncStagedFiles(stagedFiles);
      if (A.isEmptyArray(relevantStagedFiles)) {
        yield* Console.log(color.green("No relevant staged files, skipping config-sync."));
        return;
      }
      stagedFiles = relevantStagedFiles;
    }

    if (input.verbose) {
      yield* Console.log(color.cyan("Discovering workspace packages..."));
    }

    const baseContext = yield* discoverWorkspace;
    const allWorkspaceLibraryPackages = yield* discoverWorkspaceLibraryPackages(baseContext.repoRoot);
    const manifestManagedPackageNames = new Set(A.map(allWorkspaceLibraryPackages, (pkg) => pkg.name));

    let scopedManifestPackageNames: undefined | ReadonlySet<string> = undefined;
    let scopedPackageNames: undefined | ReadonlySet<string> = undefined;
    let scopedAppNames: undefined | ReadonlySet<string> = undefined;

    if (input.preCommit) {
      const workspacePackageEntries = F.pipe(
        HashMap.entries(baseContext.pkgDirMap),
        A.fromIterable,
        A.map(([name, relativeDir]) => ({ name, relativeDir }))
      );
      const libraryPackageEntries = A.map(allWorkspaceLibraryPackages, (pkg) => ({
        name: pkg.name,
        relativeDir: pkg.relativePackageJsonPath.replace(/\/package\.json$/, ""),
      }));
      const scope = resolveConfigSyncPreCommitScope(stagedFiles, workspacePackageEntries, libraryPackageEntries, [
        ...NEXT_JS_APPS,
      ]);

      if (scope.mode === "skip") {
        yield* Console.log(color.green("No relevant staged files, skipping config-sync."));
        return;
      }

      scopedManifestPackageNames = scope.manifestPackageNames;
      scopedPackageNames = scope.packageNames;
      scopedAppNames = scope.appNames;

      if (scope.mode === "subset" && input.verbose) {
        const subsetParts: Array<string> = [];
        if (scope.manifestPackageNames.size > 0) {
          subsetParts.push(`${scope.manifestPackageNames.size} manifest package(s)`);
        }
        if (scope.packageNames.size > 0) {
          subsetParts.push(`${scope.packageNames.size} workspace package(s)`);
        }
        if (scope.appNames.size > 0) {
          subsetParts.push(`${scope.appNames.size} app(s)`);
        }
        yield* Console.log(color.cyan(`Scoped config-sync to ${A.join(subsetParts, ", ")}`));
      } else if (scope.mode === "full" && input.verbose) {
        yield* Console.log(
          color.cyan(
            `Policy-affecting files staged, checking all package manifests and configs (${scope.stagedFiles.length} files)`
          )
        );
      }
    }

    const manifestPackagesToProcess = input.appsOnly
      ? []
      : yield* discoverWorkspaceLibraryPackages(baseContext.repoRoot, {
          filter: input.filter,
          packageNames: scopedManifestPackageNames,
        });

    const dependencyOverrides = new Map<
      string,
      Pick<PackageJson, "dependencies" | "devDependencies" | "peerDependencies">
    >();
    let manifestChangesNeeded = 0;
    let manifestChangesApplied = 0;

    if (A.isNonEmptyArray(manifestPackagesToProcess)) {
      const referencePolicy = yield* loadReferencePolicy(baseContext.repoRoot);
      const sortContext = yield* buildDependencySortContext;

      if (input.verbose) {
        yield* Console.log(
          color.cyan(
            `Loaded reference policy from ${referencePolicy.referencePath} (${referencePolicy.packageCount} package manifests, ${referencePolicy.peerOnlyNames.size} peer-only deps, ${referencePolicy.optionalPeerNames.size} optional peers)`
          )
        );
      }

      yield* Console.log(color.cyan(`Processing ${A.length(manifestPackagesToProcess)} package manifest(s)...`));

      for (const pkg of manifestPackagesToProcess) {
        const plan = yield* planPackageManifestSync(pkg, referencePolicy, sortContext);

        dependencyOverrides.set(pkg.name, {
          dependencies: plan.expectedSections.dependencies,
          devDependencies: plan.expectedSections.devDependencies,
          peerDependencies: plan.expectedSections.peerDependencies,
        });

        if (!plan.hasChanges) {
          if (input.verbose) {
            yield* Console.log(color.dim(`  ${pkg.name} (manifest): no changes needed`));
          }
          continue;
        }

        const changedFieldsText = A.join(plan.changedFields, ", ");
        if (mode === "check") {
          manifestChangesNeeded++;
          yield* Console.log(color.yellow(`  ${pkg.name} (manifest): drift detected in ${changedFieldsText}`));
          continue;
        }

        if (mode === "dry-run") {
          manifestChangesNeeded++;
          yield* Console.log(color.cyan(`  ${pkg.name} (manifest): would update ${changedFieldsText}`));
          continue;
        }

        yield* writePlannedPackageManifest(plan);
        manifestChangesApplied++;
        yield* Console.log(color.green(`  ${pkg.name} (manifest): updated ${changedFieldsText}`));
      }
    }

    const effectiveDepIndex = applyPackageJsonDependencyOverrides(baseContext.depIndex, dependencyOverrides);
    const context = withEffectiveDepIndex(baseContext, effectiveDepIndex);
    const packageCount = getPackageCount(context);
    yield* Console.log(color.green(`Found ${packageCount} packages`));

    if (input.verbose) {
      yield* Console.log(color.cyan("Building dependency graph..."));
      yield* Console.log(color.cyan("Checking for circular dependencies..."));
    }

    const cycles = yield* checkForCycles(context.adjacencyList);
    if (A.isNonEmptyReadonlyArray(cycles)) {
      yield* Console.log(color.red("\nError: Circular dependency detected\n"));
      yield* Console.log(color.yellow("Detected cycles:"));
      yield* Effect.forEach(cycles, (cycle) => Console.log(color.yellow(`  ${cycle.join(" → ")}`)), {
        discard: true,
      });

      const cycleParticipants = F.pipe(cycles, A.flatMap(F.identity), A.dedupe);
      return yield* new CyclicDependencyError({ packages: cycleParticipants, cycles });
    }

    yield* Console.log(color.green("No circular dependencies detected"));

    if (!input.noHoist && input.verbose) {
      yield* Console.log(color.cyan("Computing transitive dependency closure..."));
    }

    const packagesToProcess = filterPackages(context, {
      filter: input.filter,
      packageNames: scopedPackageNames,
    });
    const hasAppFilter = !!input.filter && A.some([...NEXT_JS_APPS], (app) => input.filter === `@beep/${app}`);
    const hasScopedApps = scopedAppNames !== undefined && scopedAppNames.size > 0;

    if (input.filter && A.isEmptyArray(packagesToProcess) && !hasAppFilter && !hasScopedApps) {
      yield* Console.log(color.yellow(`Package ${input.filter} not found in workspace`));
      return;
    }

    let configChangesNeeded = 0;
    let configChangesApplied = 0;

    if (!input.appsOnly) {
      yield* Console.log(color.cyan(`Processing ${A.length(packagesToProcess)} package(s)...`));
    }

    for (const pkg of packagesToProcess) {
      if (input.appsOnly) {
        continue;
      }

      const depsOption = getPackageDeps(context, pkg);
      if (O.isNone(depsOption)) {
        continue;
      }

      const deps = depsOption.value;
      const pkgTsconfigOption = HashMap.get(context.tsconfigPaths, pkg);
      const buildTsconfigPath = F.pipe(
        pkgTsconfigOption,
        O.flatMap((paths) => (A.isNonEmptyReadonlyArray(paths) ? findBuildConfig(paths) : O.none()))
      );

      if (O.isNone(buildTsconfigPath)) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  ${pkg}: no tsconfig.build.json found, skipping`));
        }
        continue;
      }

      const pkgDir = buildTsconfigPath.value.replace(/\/tsconfig\.build\.json$/, "");
      const finalBuildRefs = yield* computePackageReferences(
        pkg,
        deps,
        context,
        buildTsconfigPath.value,
        input.noHoist
      );
      const tsconfigResult = yield* syncPackageTsconfigs(
        pkg,
        pkgDir,
        buildTsconfigPath.value,
        context.repoRoot,
        finalBuildRefs,
        mode,
        input.verbose
      );

      if (mode === "check" || mode === "dry-run") {
        configChangesNeeded += tsconfigResult.totalChanges;
      } else {
        configChangesApplied += tsconfigResult.totalChanges;
      }

      if (manifestManagedPackageNames.has(pkg)) {
        continue;
      }

      const pkgJsonResult = yield* syncPackageJson(pkg, pkgDir, context, mode, input.verbose);
      if (pkgJsonResult.hasChanges) {
        if (mode === "check" || mode === "dry-run") {
          configChangesNeeded++;
        } else {
          configChangesApplied++;
        }
      }
    }

    if (!input.packagesOnly) {
      yield* processNextJsApps(
        input,
        mode,
        context,
        {
          onChangeNeeded: () => {
            configChangesNeeded++;
          },
          onChangeApplied: () => {
            configChangesApplied++;
          },
        },
        {
          appNames: scopedAppNames,
        }
      );
    }

    if (mode === "check") {
      const totalChangesNeeded = manifestChangesNeeded + configChangesNeeded;
      if (totalChangesNeeded > 0) {
        yield* Console.log(
          color.yellow(
            `\nConfiguration drift detected: ${manifestChangesNeeded} manifest change(s), ${configChangesNeeded} tsconfig/config change(s)`
          )
        );
        return yield* new DriftDetectedError({
          fileCount: totalChangesNeeded,
          summary: buildDriftSummary(manifestChangesNeeded, configChangesNeeded),
        });
      }

      yield* Console.log(color.green("\nAll configurations in sync"));
      return;
    }

    if (mode === "dry-run") {
      yield* Console.log(
        color.cyan(
          `\nDry-run mode: ${manifestChangesNeeded} manifest change(s), ${configChangesNeeded} tsconfig/config change(s)`
        )
      );
      if (manifestChangesNeeded + configChangesNeeded > 0) {
        yield* Console.log(color.cyan("Run without --dry-run to apply changes."));
      }
      return;
    }

    yield* Console.log(
      color.green(
        `\nConfig sync complete: ${manifestChangesApplied} manifest change(s), ${configChangesApplied} tsconfig/config change(s) applied`
      )
    );
  }).pipe(Effect.withSpan("tsconfigSyncHandler"));
