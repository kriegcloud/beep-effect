/**
 * @file Next.js App Synchronization Module
 *
 * Handles tsconfig.json synchronization for Next.js apps.
 * Next.js doesn't support TypeScript project references,
 * so it needs explicit path aliases for all transitive dependencies.
 *
 * @module tsconfig-sync/app-sync
 * @since 0.1.0
 */

import { computeTransitiveClosure } from "@beep/tooling-utils";
import { FileSystem } from "@effect/platform";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import color from "picocolors";
import type { SyncMode, TsconfigSyncInput } from "./schemas.js";
import { isToolingPackage, NEXT_JS_APPS, type WorkspaceContext } from "./types.js";
import {
  buildSinglePathAlias,
  checkAppTsconfig,
  extractNonBeepPaths,
  isNextJsApp,
  readAppTsconfigPaths,
  tsconfigExists,
  writeAppTsconfig,
} from "./utils/tsconfig-writer.js";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Callbacks for tracking changes during app sync.
 *
 * @since 0.1.0
 * @category models
 */
export interface AppSyncCallbacks {
  readonly onChangeNeeded: () => void;
  readonly onChangeApplied: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Read package.json and extract @beep/* dependencies.
 * Filters out tooling packages that shouldn't be in app tsconfigs.
 *
 * @since 0.1.0
 * @category utils
 */
const readAppDependencies = (appDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const pkgJsonPath = `${appDir}/package.json`;

    const content = yield* fs.readFileString(pkgJsonPath).pipe(Effect.catchAll(() => Effect.succeed("{}")));

    try {
      const pkgJson = JSON.parse(content) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };

      const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
      return F.pipe(
        Struct.keys(deps),
        A.filter(Str.startsWith("@beep/")),
        A.filter((dep) => !isToolingPackage(dep)),
        HashSet.fromIterable
      );
    } catch {
      return HashSet.empty<string>();
    }
  });

/**
 * Compute transitive dependencies for all direct dependencies.
 *
 * @since 0.1.0
 * @category utils
 */
const computeAppTransitiveDeps = (
  beepDeps: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) =>
  F.pipe(
    HashSet.toValues(beepDeps),
    Effect.reduce(HashSet.empty<string>(), (acc, dep) =>
      Effect.map(computeTransitiveClosure(adjacencyList, dep), (closure) =>
        F.pipe(acc, HashSet.add(dep), HashSet.union(closure))
      )
    )
  );

/**
 * Build path aliases and references for an app.
 *
 * @since 0.1.0
 * @category utils
 */
const buildAppPathsAndRefs = (
  appName: string,
  transitiveDeps: HashSet.HashSet<string>,
  pkgDirMap: HashMap.HashMap<string, string>,
  existingPaths: Record<string, string[]>
): { finalPaths: Record<string, string[]>; sortedRefs: readonly string[] } => {
  // Extract non-@beep paths (e.g., "@/*", "*")
  const nonBeepPaths = extractNonBeepPaths(existingPaths);

  // Build path aliases for @beep/* dependencies
  const appRelPath = "../.."; // apps/web -> repo root
  const beepPaths = R.empty<string, string[]>();

  // Add self-referential path for the app's own internal imports
  const appPkgName = `@beep/${appName}`;
  beepPaths[`${appPkgName}/*`] = ["./src/*"];

  for (const dep of HashSet.toValues(transitiveDeps)) {
    const pkgDirOption = HashMap.get(pkgDirMap, dep);
    if (O.isSome(pkgDirOption)) {
      const aliases = buildSinglePathAlias(dep, pkgDirOption.value, appRelPath);
      for (const [key, value] of aliases) {
        beepPaths[key] = [...value];
      }
    }
  }

  // Merge paths: non-@beep paths first, then @beep paths (sorted)
  const sortedBeepPathKeys = F.pipe(Object.keys(beepPaths), A.sort(Order.string));
  const finalPaths: Record<string, string[]> = {
    ...nonBeepPaths,
    ...F.pipe(
      sortedBeepPathKeys,
      A.reduce(R.empty<string, string[]>(), (acc, key) => {
        acc[key] = beepPaths[key] ?? [];
        return acc;
      })
    ),
  };

  // Build references from @beep/* dependencies (including transitive)
  const depRefs: string[] = [];
  for (const dep of HashSet.toValues(transitiveDeps)) {
    const pkgDirOption = HashMap.get(pkgDirMap, dep);
    if (O.isSome(pkgDirOption)) {
      const refPath = `${appRelPath}/${pkgDirOption.value}/tsconfig.build.json`;
      depRefs.push(refPath);
    }
  }

  // Deduplicate and sort references
  const sortedRefs = F.pipe(depRefs, A.dedupe, A.sort(Order.string));

  return { finalPaths, sortedRefs };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Sync Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Process Next.js apps to sync their tsconfig.json files.
 *
 * @since 0.1.0
 * @category app-sync
 */
export const processNextJsApps = (
  input: TsconfigSyncInput,
  mode: SyncMode,
  context: WorkspaceContext,
  callbacks: AppSyncCallbacks
) =>
  Effect.gen(function* () {
    const filterValue = input.filter;

    // Filter apps if --filter is specified
    const appsToProcess = filterValue
      ? F.pipe(
          NEXT_JS_APPS,
          A.filter((app) => filterValue === `@beep/${app}`)
        )
      : [...NEXT_JS_APPS];

    if (A.isEmptyArray(appsToProcess) && filterValue && Str.startsWith("@beep/")(filterValue)) {
      // Filter might be for a package, not an app - this is fine
      return;
    }

    if (A.isNonEmptyArray(appsToProcess)) {
      yield* Console.log(color.cyan(`\nProcessing ${A.length(appsToProcess)} Next.js app(s)...`));
    }

    for (const appName of appsToProcess) {
      const appDir = `${context.repoRoot}/apps/${appName}`;
      const tsconfigPath = `${appDir}/tsconfig.json`;

      // Check if it's actually a Next.js app
      const isNextApp = yield* isNextJsApp(appDir);
      if (!isNextApp) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  @beep/${appName}: not a Next.js app, skipping`));
        }
        continue;
      }

      // Check if tsconfig.json exists
      const exists = yield* tsconfigExists(tsconfigPath);
      if (!exists) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  @beep/${appName}: no tsconfig.json found, skipping`));
        }
        continue;
      }

      // Read @beep/* dependencies from package.json
      const beepDeps = yield* readAppDependencies(appDir);

      // Compute transitive closure for all @beep/* dependencies
      const transitiveDeps = yield* computeAppTransitiveDeps(beepDeps, context.adjacencyList);

      // Read existing tsconfig to preserve non-@beep paths
      const existingPaths = yield* readAppTsconfigPaths(tsconfigPath).pipe(
        Effect.catchAll(() => Effect.succeed(R.empty<string, string[]>()))
      );

      // Build path aliases and references
      const { finalPaths, sortedRefs } = buildAppPathsAndRefs(
        appName,
        transitiveDeps,
        context.pkgDirMap,
        existingPaths
      );

      // Count paths and refs for reporting
      const pathCount = Struct.keys(finalPaths).length;
      const refCount = A.length(sortedRefs);

      // Check or write based on mode
      if (mode === "check") {
        const inSync = yield* checkAppTsconfig(tsconfigPath, finalPaths, sortedRefs);
        if (!inSync) {
          callbacks.onChangeNeeded();
          if (input.verbose) {
            yield* Console.log(
              color.yellow(`  @beep/${appName} (tsconfig.json): drift detected (${pathCount} paths, ${refCount} refs)`)
            );
          }
        } else if (input.verbose) {
          yield* Console.log(color.green(`  @beep/${appName} (tsconfig.json): in sync`));
        }
      } else if (mode === "dry-run") {
        const inSync = yield* checkAppTsconfig(tsconfigPath, finalPaths, sortedRefs);
        if (!inSync) {
          callbacks.onChangeNeeded();
          yield* Console.log(
            color.cyan(`  @beep/${appName} (tsconfig.json): would update ${pathCount} paths, ${refCount} refs`)
          );
        } else if (input.verbose) {
          yield* Console.log(color.dim(`  @beep/${appName} (tsconfig.json): no changes needed`));
        }
      } else {
        // Sync mode
        const didWrite = yield* writeAppTsconfig(tsconfigPath, finalPaths, sortedRefs);
        if (didWrite) {
          callbacks.onChangeApplied();
          yield* Console.log(
            color.green(`  @beep/${appName} (tsconfig.json): updated ${pathCount} paths, ${refCount} refs`)
          );
        } else if (input.verbose) {
          yield* Console.log(color.dim(`  @beep/${appName} (tsconfig.json): no changes needed`));
        }
      }
    }
  });
