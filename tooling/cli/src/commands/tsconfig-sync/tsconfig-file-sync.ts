/**
 * @file Tsconfig File Synchronization Module
 *
 * Handles tsconfig.build.json, tsconfig.src.json, and tsconfig.test.json synchronization.
 * Extracted from handler.ts for modularity.
 *
 * @module tsconfig-sync/tsconfig-file-sync
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import color from "picocolors";
import { computeRefsForConfigType, computeTestkitRefPath } from "./references.js";
import type { SyncMode } from "./schemas.js";
import { CONFIG_TYPES, type TsconfigType } from "./types.js";
import { checkTsconfigReferences, tsconfigExists, writeTsconfigReferences } from "./utils/tsconfig-writer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of syncing a single tsconfig file.
 *
 * @since 0.1.0
 * @category models
 */
export interface SingleTsconfigResult {
  /** Config type that was processed */
  readonly type: TsconfigType;
  /** Whether changes were detected or applied */
  readonly hasChanges: boolean;
  /** Number of references */
  readonly refCount: number;
}

/**
 * Result of syncing all tsconfig files for a package.
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigFileSyncResult {
  /** Results for each config type */
  readonly results: readonly SingleTsconfigResult[];
  /** Total number of changes */
  readonly totalChanges: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Config Sync
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sync a single tsconfig file (build, src, or test).
 *
 * @since 0.1.0
 * @category tsconfig-sync
 */
const syncSingleTsconfig = (
  pkg: string,
  configPath: string,
  configType: TsconfigType,
  configFile: string,
  refs: readonly string[],
  mode: SyncMode,
  verbose: boolean
) =>
  Effect.gen(function* () {
    // Check if config file exists
    const exists = yield* tsconfigExists(configPath);
    if (!exists) {
      if (verbose) {
        yield* Console.log(color.dim(`  ${pkg}: ${configFile} not found, skipping`));
      }
      return { type: configType, hasChanges: false, refCount: 0 };
    }

    const refCount = A.length(refs);

    if (mode === "check") {
      const inSync = yield* checkTsconfigReferences(configPath, refs);
      if (!inSync) {
        if (verbose) {
          yield* Console.log(color.yellow(`  ${pkg} (${configFile}): drift detected (${refCount} references)`));
        }
        return { type: configType, hasChanges: true, refCount };
      }

      if (verbose) {
        yield* Console.log(color.green(`  ${pkg} (${configFile}): in sync`));
      }
      return { type: configType, hasChanges: false, refCount };
    }

    if (mode === "dry-run") {
      const inSync = yield* checkTsconfigReferences(configPath, refs);
      if (!inSync) {
        yield* Console.log(color.cyan(`  ${pkg} (${configFile}): would update ${refCount} references`));
        return { type: configType, hasChanges: true, refCount };
      }

      if (verbose) {
        yield* Console.log(color.dim(`  ${pkg} (${configFile}): no changes needed`));
      }
      return { type: configType, hasChanges: false, refCount };
    }

    // Sync mode - write the files
    const didWrite = yield* writeTsconfigReferences(configPath, refs);
    if (didWrite) {
      yield* Console.log(color.green(`  ${pkg} (${configFile}): updated ${refCount} references`));
      return { type: configType, hasChanges: true, refCount };
    }

    if (verbose) {
      yield* Console.log(color.dim(`  ${pkg} (${configFile}): no changes needed`));
    }
    return { type: configType, hasChanges: false, refCount };
  });

// ─────────────────────────────────────────────────────────────────────────────
// Main Sync Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sync all tsconfig files for a single package.
 *
 * @since 0.1.0
 * @category tsconfig-sync
 */
export const syncPackageTsconfigs = (
  pkg: string,
  pkgDir: string,
  buildTsconfigPath: string,
  repoRoot: string,
  finalBuildRefs: readonly string[],
  mode: SyncMode,
  verbose: boolean
) =>
  Effect.gen(function* () {
    // Calculate testkit ref path (for test configs)
    const testkitRefPath = computeTestkitRefPath(buildTsconfigPath, repoRoot);

    const results: SingleTsconfigResult[] = [];

    for (const config of CONFIG_TYPES) {
      const configPath = `${pkgDir}/${config.file}`;

      // Compute refs for this config type
      const refs = computeRefsForConfigType(config.type, finalBuildRefs, testkitRefPath);

      // Sync this config
      const result = yield* syncSingleTsconfig(pkg, configPath, config.type, config.file, refs, mode, verbose);

      results.push(result);
    }

    const totalChanges = F.pipe(
      results,
      A.filter((r) => r.hasChanges),
      A.length
    );

    return { results, totalChanges };
  });
