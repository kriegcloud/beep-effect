/**
 * @file tsconfig-sync Command Handler
 *
 * Main handler for the tsconfig-sync command. Orchestrates:
 * - Workspace discovery via discover.ts
 * - Reference computation via references.ts
 * - Package.json sync via package-sync.ts
 * - Tsconfig file sync via tsconfig-file-sync.ts
 * - Next.js app sync via app-sync.ts
 *
 * @module tsconfig-sync/handler
 * @since 1.0.0
 */

import { CyclicDependencyError } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import color from "picocolors";
import { processNextJsApps } from "./app-sync.js";
import {
  checkForCycles,
  discoverWorkspace,
  filterPackages,
  findBuildConfig,
  getPackageCount,
  getPackageDeps,
} from "./discover.js";
import { DriftDetectedError } from "./errors.js";
import { syncPackageJson } from "./package-sync.js";
import { computePackageReferences } from "./references.js";
import { getSyncMode, type TsconfigSyncInput } from "./schemas.js";
import { syncPackageTsconfigs } from "./tsconfig-file-sync.js";

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main handler for the tsconfig-sync command.
 *
 * @since 0.1.0
 * @category handlers
 */
export const tsconfigSyncHandler = (input: TsconfigSyncInput) =>
  Effect.gen(function* () {
    const mode = getSyncMode(input);

    // Step 1: Discover workspace
    if (input.verbose) {
      yield* Console.log(color.cyan("Discovering workspace packages..."));
    }

    const context = yield* discoverWorkspace;
    const packageCount = getPackageCount(context);
    yield* Console.log(color.green(`Found ${packageCount} packages`));

    // Step 2: Build adjacency list and detect cycles
    if (input.verbose) {
      yield* Console.log(color.cyan("Building dependency graph..."));
      yield* Console.log(color.cyan("Checking for circular dependencies..."));
    }

    const cycles = yield* checkForCycles(context.adjacencyList);
    if (A.isNonEmptyReadonlyArray(cycles)) {
      yield* Console.log(color.red("\nError: Circular dependency detected\n"));
      yield* Console.log(color.yellow("Detected cycles:"));
      yield* Effect.forEach(cycles, (cycle) => Console.log(color.yellow(`  ${A.join(cycle, " → ")}`)), {
        discard: true,
      });

      const cycleParticipants = F.pipe(cycles, A.flatMap(F.identity), A.dedupe);
      return yield* new CyclicDependencyError({ packages: cycleParticipants, cycles });
    }

    yield* Console.log(color.green("No circular dependencies detected"));

    // Step 3: Compute transitive closure (unless --no-hoist)
    if (!input.noHoist && input.verbose) {
      yield* Console.log(color.cyan("Computing transitive dependency closure..."));
    }

    // Step 4: Filter packages
    const packagesToProcess = filterPackages(context, input.filter);

    if (input.filter && A.length(packagesToProcess) === 0) {
      yield* Console.log(color.yellow(`Package ${input.filter} not found in workspace`));
      return;
    }

    // Step 5: Process each package
    let changesNeeded = 0;
    let changesApplied = 0;

    // Process packages unless --apps-only
    if (!input.appsOnly) {
      yield* Console.log(color.cyan(`Processing ${A.length(packagesToProcess)} package(s)...`));
    }

    for (const pkg of packagesToProcess) {
      // Skip packages if --apps-only is set
      if (input.appsOnly) continue;

      const depsOption = getPackageDeps(context, pkg);
      if (O.isNone(depsOption)) continue;

      const deps = depsOption.value;

      // Get the package's tsconfig.build.json path
      const pkgTsconfigOption = HashMap.get(context.tsconfigPaths, pkg);
      const buildTsconfigPath = F.pipe(
        pkgTsconfigOption,
        O.flatMap((paths) => (A.isNonEmptyReadonlyArray(paths) ? findBuildConfig(paths) : O.none()))
      );

      // Skip if no build tsconfig
      if (O.isNone(buildTsconfigPath)) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  ${pkg}: no tsconfig.build.json found, skipping`));
        }
        continue;
      }

      // Get package directory from build tsconfig path
      const pkgDir = F.pipe(buildTsconfigPath.value, Str.replace(/\/tsconfig\.build\.json$/, ""));

      // Step 5a: Compute references
      const finalBuildRefs = yield* computePackageReferences(
        pkg,
        deps,
        context,
        buildTsconfigPath.value,
        input.noHoist
      );

      // Step 5b: Sync tsconfig files
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
        changesNeeded += tsconfigResult.totalChanges;
      } else {
        changesApplied += tsconfigResult.totalChanges;
      }

      // Step 5c: Sync package.json
      const pkgJsonResult = yield* syncPackageJson(pkg, pkgDir, context, mode, input.verbose);

      if (pkgJsonResult.hasChanges) {
        if (mode === "check" || mode === "dry-run") {
          changesNeeded++;
        } else {
          changesApplied++;
        }
      }
    }

    // Step 6: Process Next.js apps (unless --packages-only)
    if (!input.packagesOnly) {
      yield* processNextJsApps(input, mode, context, {
        onChangeNeeded: () => {
          changesNeeded++;
        },
        onChangeApplied: () => {
          changesApplied++;
        },
      });
    }

    // Step 7: Report or apply based on mode
    if (mode === "check") {
      if (changesNeeded > 0) {
        yield* Console.log(color.yellow(`\nConfiguration drift detected: ${changesNeeded} package(s) need updating`));
        return yield* new DriftDetectedError({
          fileCount: changesNeeded,
          summary: `${changesNeeded} tsconfig file(s) have outdated references`,
        });
      }
      yield* Console.log(color.green("\nAll configurations in sync"));
    } else if (mode === "dry-run") {
      yield* Console.log(color.cyan("\nDry-run mode - changes that would be made:"));
      yield* Console.log(`  ${changesNeeded} package(s) would be updated`);
      yield* Console.log("\nRun without --dry-run to apply changes.");
    } else {
      // Sync mode
      yield* Console.log(color.green(`\nSync complete: ${changesApplied} package(s) updated`));
    }
  }).pipe(Effect.withSpan("tsconfigSyncHandler"));
