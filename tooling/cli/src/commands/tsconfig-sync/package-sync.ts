/**
 * @file Package.json Synchronization Module
 *
 * Handles package.json dependency sorting and version specifier enforcement.
 * Extracted from handler.ts for modularity.
 *
 * @module tsconfig-sync/package-sync
 * @since 1.0.0
 */

import { enforceVersionSpecifiers, mergeSortedDeps, sortDependencies } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import color from "picocolors";
import type { SyncMode } from "./schemas.js";
import type { WorkspaceContext } from "./types.js";
import {
  type AllPackageJsonDeps,
  checkAllPackageJsonDeps,
  readPackageJson,
  writeAllPackageJsonDeps,
} from "./utils/package-json-writer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of syncing a package's package.json.
 *
 * @since 0.1.0
 * @category models
 */
export interface PackageSyncResult {
  /** Whether changes were detected or applied */
  readonly hasChanges: boolean;
  /** Fields that were changed */
  readonly changedFields: readonly string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build expected package.json dependencies with proper sorting.
 *
 * @since 0.1.0
 * @category utils
 */
const buildExpectedDeps = (currentDeps: Record<string, string> | undefined, context: WorkspaceContext) =>
  Effect.gen(function* () {
    if (!currentDeps || R.size(currentDeps) === 0) return undefined;

    const enforced = enforceVersionSpecifiers(currentDeps, context.workspacePackages);
    const sorted = yield* sortDependencies(enforced, context.adjacencyList);
    return mergeSortedDeps(sorted);
  });

// ─────────────────────────────────────────────────────────────────────────────
// Main Sync Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sync package.json dependencies for a single package.
 *
 * @since 0.1.0
 * @category package-sync
 */
export const syncPackageJson = (
  pkg: string,
  pkgDir: string,
  context: WorkspaceContext,
  mode: SyncMode,
  verbose: boolean
) =>
  Effect.gen(function* () {
    const pkgJsonPath = `${pkgDir}/package.json`;

    // Read current package.json
    const currentPkgJson = yield* readPackageJson(pkgJsonPath).pipe(
      Effect.catchAll(() =>
        Effect.succeed({
          dependencies: undefined,
          devDependencies: undefined,
          peerDependencies: undefined,
        })
      )
    );

    // Build expected deps with enforced specifiers and sorted
    const expectedDeps = yield* buildExpectedDeps(currentPkgJson.dependencies, context);
    const expectedDevDeps = yield* buildExpectedDeps(currentPkgJson.devDependencies, context);
    const expectedPeerDeps = yield* buildExpectedDeps(currentPkgJson.peerDependencies, context);

    const expectedPkgJsonDeps: AllPackageJsonDeps = {
      dependencies: expectedDeps,
      devDependencies: expectedDevDeps,
      peerDependencies: expectedPeerDeps,
    };

    // Check/dry-run/sync based on mode
    if (mode === "check") {
      const pkgJsonDiff = yield* checkAllPackageJsonDeps(pkgJsonPath, expectedPkgJsonDeps).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            hasChanges: false,
            dependencies: { hasChanges: false, reordered: false },
            devDependencies: { hasChanges: false, reordered: false },
            peerDependencies: { hasChanges: false, reordered: false },
          })
        )
      );

      if (pkgJsonDiff.hasChanges) {
        const fields: string[] = [];
        if (pkgJsonDiff.dependencies.hasChanges) fields.push("dependencies");
        if (pkgJsonDiff.devDependencies.hasChanges) fields.push("devDependencies");
        if (pkgJsonDiff.peerDependencies.hasChanges) fields.push("peerDependencies");

        if (verbose) {
          yield* Console.log(color.yellow(`  ${pkg} (package.json): drift detected in ${A.join(fields, ", ")}`));
        }

        return { hasChanges: true, changedFields: fields };
      }

      if (verbose) {
        yield* Console.log(color.green(`  ${pkg} (package.json): in sync`));
      }

      return { hasChanges: false, changedFields: [] };
    }

    if (mode === "dry-run") {
      const pkgJsonDiff = yield* checkAllPackageJsonDeps(pkgJsonPath, expectedPkgJsonDeps).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            hasChanges: false,
            dependencies: { hasChanges: false, reordered: false },
            devDependencies: { hasChanges: false, reordered: false },
            peerDependencies: { hasChanges: false, reordered: false },
          })
        )
      );

      if (pkgJsonDiff.hasChanges) {
        const fields: string[] = [];
        if (pkgJsonDiff.dependencies.hasChanges) fields.push("dependencies");
        if (pkgJsonDiff.devDependencies.hasChanges) fields.push("devDependencies");
        if (pkgJsonDiff.peerDependencies.hasChanges) fields.push("peerDependencies");

        yield* Console.log(color.cyan(`  ${pkg} (package.json): would update ${A.join(fields, ", ")}`));

        return { hasChanges: true, changedFields: fields };
      }

      if (verbose) {
        yield* Console.log(color.dim(`  ${pkg} (package.json): no changes needed`));
      }

      return { hasChanges: false, changedFields: [] };
    }

    // Sync mode - write the sorted dependencies
    const didWrite = yield* writeAllPackageJsonDeps(pkgJsonPath, expectedPkgJsonDeps).pipe(
      Effect.catchAll(() => Effect.succeed(false))
    );

    if (didWrite) {
      yield* Console.log(color.green(`  ${pkg} (package.json): updated dependency order`));
      return { hasChanges: true, changedFields: ["dependencies"] };
    }

    if (verbose) {
      yield* Console.log(color.dim(`  ${pkg} (package.json): no changes needed`));
    }

    return { hasChanges: false, changedFields: [] };
  });
