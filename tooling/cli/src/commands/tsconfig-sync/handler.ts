/**
 * @file tsconfig-sync Command Handler
 *
 * Main handler for the tsconfig-sync command. Orchestrates:
 * - Workspace discovery via @beep/tooling-utils
 * - Dependency graph building and cycle detection
 * - Transitive dependency computation
 * - tsconfig reference path calculation
 * - Configuration drift detection and sync
 *
 * Uses P0b utilities from @beep/tooling-utils for most complexity.
 *
 * @module tsconfig-sync/handler
 * @since 1.0.0
 */

import {
  buildRepoDependencyIndex,
  buildRootRelativePath,
  CyclicDependencyError,
  collectTsConfigPaths,
  computeTransitiveClosure,
  detectCycles,
  findRepoRoot,
  mergeSortedDeps,
  type RepoDepMapValue,
  sortDependencies,
  topologicalSort,
  type WorkspacePkgKey,
} from "@beep/tooling-utils";
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
import type * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import color from "picocolors";
import { DriftDetectedError } from "./errors.js";
import { getSyncMode, type TsconfigSyncInput } from "./schemas.js";
import {
  buildSinglePathAlias,
  checkAppTsconfig,
  checkTsconfigReferences,
  convertToPackageRootRefs,
  extractNonBeepPaths,
  getExistingReferencePaths,
  isNextJsApp,
  mergeRefs,
  readAppTsconfigPaths,
  tsconfigExists,
  writeAppTsconfig,
  writeTsconfigReferences,
} from "./utils/tsconfig-writer.js";

// Type aliases for clarity
type WorkspacePkgKeyT = S.Schema.Type<typeof WorkspacePkgKey>;
type RepoDepMapValueT = S.Schema.Type<typeof RepoDepMapValue>;

/**
 * Find the build tsconfig path from the array of paths.
 *
 * @since 0.1.0
 * @category utils
 */
const findBuildConfig = (paths: A.NonEmptyReadonlyArray<string>): O.Option<string> =>
  F.pipe(paths, A.findFirst(Str.endsWith("tsconfig.build.json")));

/**
 * Build adjacency list from dependency index for graph operations.
 *
 * @since 0.1.0
 * @category utils
 */
const buildAdjacencyList = (
  depIndex: HashMap.HashMap<WorkspacePkgKeyT, RepoDepMapValueT>
): HashMap.HashMap<string, HashSet.HashSet<string>> => {
  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [pkg, deps] of HashMap.entries(depIndex)) {
    // Skip synthetic root package
    if (pkg === "@beep/root") continue;

    // Combine workspace dependencies from prod, dev, and peer
    const workspaceDeps = F.pipe(
      deps.dependencies.workspace,
      HashSet.union(deps.devDependencies.workspace),
      HashSet.union(deps.peerDependencies.workspace)
    );

    adjacency = HashMap.set(adjacency, pkg, workspaceDeps as HashSet.HashSet<string>);
  }

  return adjacency;
};

/**
 * Known Next.js apps in the repository.
 *
 * @since 0.1.0
 * @category constants
 */
const NEXT_JS_APPS = ["web", "todox", "marketing"] as const;

/**
 * Tooling packages that should be excluded from app tsconfig paths/references.
 * These are dev-only packages that apps don't need IDE intellisense for.
 * Exception: @beep/testkit is allowed as apps may have tests.
 *
 * @since 0.1.0
 * @category constants
 */
const TOOLING_PACKAGES_TO_EXCLUDE = [
  "@beep/build-utils",
  "@beep/repo-cli",
  "@beep/tooling-utils",
  "@beep/repo-scripts",
] as const;

/**
 * Check if a package is a tooling package that should be excluded from app configs.
 *
 * @since 0.1.0
 * @category utils
 */
const isToolingPackage = (pkgName: string): boolean =>
  A.contains(TOOLING_PACKAGES_TO_EXCLUDE, pkgName as (typeof TOOLING_PACKAGES_TO_EXCLUDE)[number]);

/**
 * Read package.json and extract @beep/* dependencies.
 * Filters out tooling packages that shouldn't be in app tsconfigs.
 *
 * @since 0.1.0
 * @category utils
 */
const readAppDependencies = (appDir: string): Effect.Effect<HashSet.HashSet<string>, never, FileSystem.FileSystem> =>
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
        A.filter((dep) => !isToolingPackage(dep)), // Exclude tooling packages
        HashSet.fromIterable
      );
    } catch {
      return HashSet.empty<string>();
    }
  });

/**
 * Build package directory map from dependency index.
 * Maps package names to their directory paths relative to repo root.
 *
 * @since 0.1.0
 * @category utils
 */
const buildPkgDirMap = (
  tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>,
  repoRoot: string
): HashMap.HashMap<string, string> => {
  let pkgDirMap = HashMap.empty<string, string>();

  for (const [pkgName, paths] of HashMap.entries(tsconfigPaths)) {
    const buildConfig = findBuildConfig(paths);
    if (O.isSome(buildConfig)) {
      // Extract package directory from build config path
      // e.g., /repo/packages/iam/domain/tsconfig.build.json -> packages/iam/domain
      const pkgDir = F.pipe(
        buildConfig.value,
        Str.replace(repoRoot, ""),
        Str.replace(/^\//, ""),
        Str.replace(/\/tsconfig\.build\.json$/, "")
      );
      pkgDirMap = HashMap.set(pkgDirMap, pkgName, pkgDir);
    }
  }

  return pkgDirMap;
};

/**
 * Process Next.js apps to sync their tsconfig.json files.
 *
 * @since 0.1.0
 * @category handlers
 */
const processNextJsApps = (
  input: TsconfigSyncInput,
  mode: "check" | "dry-run" | "sync",
  repoRoot: string,
  tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>,
  callbacks: {
    onChangeNeeded: () => void;
    onChangeApplied: () => void;
  }
) =>
  Effect.gen(function* () {
    const filterValue = input.filter;

    // Build package directory map
    const pkgDirMap = buildPkgDirMap(tsconfigPaths, repoRoot);

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
      const appDir = `${repoRoot}/apps/${appName}`;
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

      // Read existing tsconfig to preserve non-@beep paths
      const existingPaths = yield* readAppTsconfigPaths(tsconfigPath).pipe(
        Effect.catchAll(() => Effect.succeed(R.empty<string, string[]>()))
      );

      // Extract non-@beep paths (e.g., "@/*", "*")
      const nonBeepPaths = extractNonBeepPaths(existingPaths);

      // Build path aliases for @beep/* dependencies
      const appRelPath = "../.."; // apps/web -> repo root
      const beepPaths = R.empty<string, string[]>();

      // Add self-referential path for the app's own internal imports
      // e.g., @beep/todox/* -> ./src/* for imports like @beep/todox/types/mail
      const appPkgName = `@beep/${appName}`;
      beepPaths[`${appPkgName}/*`] = ["./src/*"];

      for (const dep of HashSet.toValues(beepDeps)) {
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

      // Build references from @beep/* dependencies
      // For each dependency, find its tsconfig.build.json path
      const depRefs: string[] = [];
      for (const dep of HashSet.toValues(beepDeps)) {
        const pkgDirOption = HashMap.get(pkgDirMap, dep);
        if (O.isSome(pkgDirOption)) {
          const refPath = `${appRelPath}/${pkgDirOption.value}/tsconfig.build.json`;
          depRefs.push(refPath);
        }
      }

      // Deduplicate and sort references
      const sortedRefs = F.pipe(depRefs, A.dedupe, A.sort(Order.string));

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

/**
 * Main handler for the tsconfig-sync command.
 *
 * @since 0.1.0
 * @category handlers
 */
export const tsconfigSyncHandler = (input: TsconfigSyncInput) =>
  Effect.gen(function* () {
    const mode = getSyncMode(input);

    // Get repo root for path calculations
    const repoRoot = yield* findRepoRoot;

    // Step 1: Discovery
    if (input.verbose) {
      yield* Console.log(color.cyan("Discovering workspace packages..."));
    }

    const depIndex = yield* buildRepoDependencyIndex;
    const tsconfigPaths = yield* collectTsConfigPaths;

    const packageCount = F.pipe(HashMap.entries(depIndex), A.fromIterable, A.length);
    yield* Console.log(color.green(`Found ${packageCount} packages`));

    // Step 2: Build adjacency list and detect cycles
    if (input.verbose) {
      yield* Console.log(color.cyan("Building dependency graph..."));
    }

    const adjacencyList = buildAdjacencyList(depIndex);

    if (input.verbose) {
      yield* Console.log(color.cyan("Checking for circular dependencies..."));
    }

    const cycles = yield* detectCycles(adjacencyList);
    if (A.isNonEmptyArray(cycles)) {
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

    // Step 4: Filter packages if --filter specified
    const filterValue = input.filter;
    const packagesToProcess = filterValue
      ? F.pipe(
          HashMap.entries(depIndex),
          A.fromIterable,
          A.filter(([pkg]) => pkg === filterValue),
          A.map(([pkg]) => pkg)
        )
      : F.pipe(
          HashMap.entries(depIndex),
          A.fromIterable,
          A.filter(([pkg]) => pkg !== "@beep/root"),
          A.map(([pkg]) => pkg)
        );

    if (filterValue && A.length(packagesToProcess) === 0) {
      yield* Console.log(color.yellow(`Package ${filterValue} not found in workspace`));
      return;
    }

    // Step 5: For each package, compute expected state
    let changesNeeded = 0;
    let changesApplied = 0;

    // Process packages unless --apps-only
    if (!input.appsOnly) {
      yield* Console.log(color.cyan(`Processing ${A.length(packagesToProcess)} package(s)...`));
    }

    for (const pkg of packagesToProcess) {
      // Skip packages if --apps-only is set
      if (input.appsOnly) continue;
      const depsOption = HashMap.get(depIndex, pkg as WorkspacePkgKeyT);
      if (O.isNone(depsOption)) continue;

      const deps = depsOption.value;

      // Get direct workspace dependencies
      const directWorkspaceDeps = F.pipe(
        deps.dependencies.workspace,
        HashSet.union(deps.devDependencies.workspace),
        HashSet.union(deps.peerDependencies.workspace)
      );

      // Compute transitive closure if hoisting enabled
      let transitiveDeps = directWorkspaceDeps as HashSet.HashSet<string>;
      if (!input.noHoist) {
        const closure = yield* computeTransitiveClosure(adjacencyList, pkg);
        transitiveDeps = HashSet.union(directWorkspaceDeps as HashSet.HashSet<string>, closure);
      }

      // Build package-to-path mapping for sorting
      const pkgToPathMap = F.pipe(
        HashSet.toValues(transitiveDeps),
        A.filterMap((depPkg) => {
          const depTsconfigOption = HashMap.get(tsconfigPaths, depPkg);
          if (O.isNone(depTsconfigOption)) return O.none();

          const pkgTsconfigOption = HashMap.get(tsconfigPaths, pkg);
          if (O.isNone(pkgTsconfigOption)) return O.none();

          // Get build tsconfig paths
          const targetBuildPath = findBuildConfig(depTsconfigOption.value);
          const sourceBuildPath = findBuildConfig(pkgTsconfigOption.value);

          if (O.isNone(targetBuildPath) || O.isNone(sourceBuildPath)) return O.none();

          // Convert absolute paths to repo-relative paths
          const sourceRelative = F.pipe(
            sourceBuildPath.value,
            Str.replace(repoRoot, ""),
            Str.replace(/^\//, "") // Remove leading slash
          );
          const targetRelative = F.pipe(
            targetBuildPath.value,
            Str.replace(repoRoot, ""),
            Str.replace(/^\//, "") // Remove leading slash
          );

          // Calculate root-relative path from source tsconfig to target tsconfig
          const refPath = buildRootRelativePath(sourceRelative, targetRelative);
          return O.some([depPkg, refPath] as const);
        }),
        A.reduce(HashMap.empty<string, string>(), (acc, [depPkg, refPath]) => HashMap.set(acc, depPkg, refPath))
      );

      // Build subset adjacency list for transitive deps only
      const subsetAdjacency = F.pipe(
        HashSet.toValues(transitiveDeps),
        A.reduce(HashMap.empty<string, HashSet.HashSet<string>>(), (acc, depPkg) => {
          const depDepsOption = HashMap.get(adjacencyList, depPkg);
          if (O.isNone(depDepsOption)) return HashMap.set(acc, depPkg, HashSet.empty());
          // Filter to only include deps that are in our transitiveDeps set
          const filteredDeps = F.pipe(
            HashSet.toValues(depDepsOption.value),
            A.filter((d) => HashSet.has(transitiveDeps, d)),
            HashSet.fromIterable
          );
          return HashMap.set(acc, depPkg, filteredDeps);
        })
      );

      // Sort dependencies topologically (deps before dependents)
      const sortedDepPkgs = yield* topologicalSort(subsetAdjacency);

      // Map sorted package names to their reference paths
      const expectedRefs = F.pipe(
        sortedDepPkgs,
        A.filterMap((depPkg) => HashMap.get(pkgToPathMap, depPkg))
      );

      // Sort dependencies (workspace topological, external alphabetical)
      const allDeps = {
        ...F.pipe(
          HashSet.toValues(deps.dependencies.workspace),
          A.reduce(R.empty<string, string>(), (acc, dep) => ({ ...acc, [dep]: "workspace:^" }))
        ),
        ...F.pipe(
          HashSet.toValues(deps.dependencies.npm),
          A.reduce(R.empty<string, string>(), (acc, dep) => ({ ...acc, [dep]: "catalog:" }))
        ),
      };

      const sortedDeps = yield* sortDependencies(allDeps, adjacencyList);
      // TODO: In Phase 3, use mergedDeps to update package.json
      void mergeSortedDeps(sortedDeps);

      // Get the package's tsconfig.build.json path
      const pkgTsconfigOption = HashMap.get(tsconfigPaths, pkg);
      const buildTsconfigPath = F.pipe(pkgTsconfigOption, O.flatMap(findBuildConfig));

      // Skip if no build tsconfig
      if (O.isNone(buildTsconfigPath)) {
        if (input.verbose) {
          yield* Console.log(color.dim(`  ${pkg}: no tsconfig.build.json found, skipping`));
        }
        continue;
      }

      // Get package directory from build tsconfig path
      const pkgDir = F.pipe(buildTsconfigPath.value, Str.replace(/\/tsconfig\.build\.json$/, ""));

      // Calculate source tsconfig path relative to repo root (used for path calculations)
      const sourceRelative = F.pipe(buildTsconfigPath.value, Str.replace(repoRoot, ""), Str.replace(/^\//, ""));

      // Bug 1 Fix: Preserve existing refs by merging with computed refs
      // This handles type-only imports that may not be in package.json
      const existingBuildRefs = yield* getExistingReferencePaths(buildTsconfigPath.value).pipe(
        Effect.catchAll(() => Effect.succeed(A.empty<string>()))
      );

      // Normalize existing refs to root-relative format
      // This converts package-relative refs (../types/tsconfig.build.json) to root-relative
      const normalizedExistingRefs = F.pipe(
        existingBuildRefs,
        A.filterMap((ref) => {
          // If already root-relative (starts with ../../../), keep if valid
          if (Str.startsWith("../../../")(ref)) {
            // Check if it points to packages or tooling directory
            if (Str.includes("packages/")(ref) || Str.includes("tooling/")(ref)) {
              return O.some(ref);
            }
            return O.none();
          }

          // If package-relative (like ../types/tsconfig.build.json or ../../common/types/tsconfig.build.json)
          // convert to root-relative by resolving the path and looking up in tsconfigPaths
          if (Str.startsWith("..")(ref) && Str.includes("tsconfig.build.json")(ref)) {
            // Resolve the package-relative path to an absolute path
            // sourceRelative is like "packages/common/identity/tsconfig.build.json"
            // Get the source directory: "packages/common/identity"
            const sourceDir = F.pipe(sourceRelative, Str.replace(/\/[^/]+$/, ""));

            // Navigate the relative path from source directory
            // e.g., ref = "../types/tsconfig.build.json", sourceDir = "packages/common/identity"
            // result: "packages/common/types/tsconfig.build.json"
            const refWithoutFilename = Str.replace(/\/tsconfig\.build\.json$/, "")(ref);
            const segments = F.pipe(sourceDir, Str.split("/"));
            const refSegments = F.pipe(refWithoutFilename, Str.split("/"));

            // Process relative path: for each "..", pop a segment from source path
            let resultSegments = [...segments];
            for (const seg of refSegments) {
              if (seg === "..") {
                resultSegments = A.dropRight(resultSegments, 1);
              } else if (seg !== ".") {
                resultSegments = [...resultSegments, seg];
              }
            }

            const resolvedDir = A.join(resultSegments, "/");
            const resolvedPath = `${resolvedDir}/tsconfig.build.json`;

            // Find the package that has this tsconfig path
            const matchingEntry = F.pipe(
              HashMap.entries(tsconfigPaths),
              A.fromIterable,
              A.findFirst(([, paths]) => {
                // Check if any of the package's tsconfig paths match the resolved path
                return F.pipe(
                  paths,
                  A.some((p) => {
                    const pRelative = F.pipe(p, Str.replace(repoRoot, ""), Str.replace(/^\//, ""));
                    return pRelative === resolvedPath;
                  })
                );
              })
            );

            if (O.isSome(matchingEntry)) {
              const [, paths] = matchingEntry.value;
              const targetBuildPath = findBuildConfig(paths);
              if (O.isSome(targetBuildPath)) {
                // Convert absolute paths to repo-relative paths
                const targetRelative = F.pipe(targetBuildPath.value, Str.replace(repoRoot, ""), Str.replace(/^\//, ""));
                // Calculate root-relative path from source to target
                const rootRelativeRef = buildRootRelativePath(sourceRelative, targetRelative);
                return O.some(rootRelativeRef);
              }
            }
            return O.none();
          }

          return O.none();
        })
      );

      // Merge normalized existing refs with computed refs (deduplicated)
      const mergedBuildRefs = mergeRefs(normalizedExistingRefs, expectedRefs);

      // Sort the merged refs to maintain topological order
      // First, collect all refs into a set, then order by the expectedRefs order (which is topologically sorted)
      // Add any existing refs that weren't in expectedRefs at the end
      const expectedRefsSet = HashSet.fromIterable(expectedRefs);
      const extraRefs = F.pipe(
        mergedBuildRefs,
        A.filter((ref) => !HashSet.has(expectedRefsSet, ref))
      );
      const finalBuildRefs = [...expectedRefs, ...extraRefs];

      // Bug 2, 3, 4 Fix: Process all three tsconfig types with correct reference targets
      // Config types to process
      const configTypes = [
        { type: "build" as const, file: "tsconfig.build.json" },
        { type: "src" as const, file: "tsconfig.src.json" },
        { type: "test" as const, file: "tsconfig.test.json" },
      ];

      // Calculate testkit ref path (for test configs)
      const testkitRefPath = buildRootRelativePath(
        Str.replace(/tsconfig\.build\.json$/, "tsconfig.test.json")(sourceRelative),
        "tooling/testkit/tsconfig.build.json"
      );

      for (const config of configTypes) {
        const configPath = `${pkgDir}/${config.file}`;

        // Check if config file exists
        const exists = yield* tsconfigExists(configPath);
        if (!exists) {
          if (input.verbose) {
            yield* Console.log(color.dim(`  ${pkg}: ${config.file} not found, skipping`));
          }
          continue;
        }

        // Bug 4 Fix: Different reference targets per config type
        // - tsconfig.build.json: refs point to tsconfig.build.json
        // - tsconfig.src.json: refs point to package root (no tsconfig.build.json suffix)
        // - tsconfig.test.json: refs point to package root + local src ref + testkit
        let refs: readonly string[];

        if (config.type === "build") {
          refs = finalBuildRefs;
        } else {
          // For src and test, convert to package root refs (remove /tsconfig.build.json)
          refs = convertToPackageRootRefs(finalBuildRefs);

          if (config.type === "test") {
            // Prepend local src reference for test configs
            refs = ["tsconfig.src.json", ...refs];

            // Ensure testkit is included (keep tsconfig.build.json for testkit)
            const hasTestkit = F.pipe(refs, A.some(Str.includes("testkit")));
            if (!hasTestkit) {
              refs = [...refs, testkitRefPath];
            }
          }
        }

        // Check or write tsconfig references
        if (mode === "check") {
          const inSync = yield* checkTsconfigReferences(configPath, refs);
          if (!inSync) {
            changesNeeded++;
            if (input.verbose) {
              yield* Console.log(
                color.yellow(`  ${pkg} (${config.file}): drift detected (${A.length(refs)} references)`)
              );
            }
          } else if (input.verbose) {
            yield* Console.log(color.green(`  ${pkg} (${config.file}): in sync`));
          }
        } else if (mode === "dry-run") {
          const inSync = yield* checkTsconfigReferences(configPath, refs);
          if (!inSync) {
            changesNeeded++;
            yield* Console.log(color.cyan(`  ${pkg} (${config.file}): would update ${A.length(refs)} references`));
          } else if (input.verbose) {
            yield* Console.log(color.dim(`  ${pkg} (${config.file}): no changes needed`));
          }
        } else {
          // Sync mode - write the files
          const didWrite = yield* writeTsconfigReferences(configPath, refs);
          if (didWrite) {
            changesApplied++;
            yield* Console.log(color.green(`  ${pkg} (${config.file}): updated ${A.length(refs)} references`));
          } else if (input.verbose) {
            yield* Console.log(color.dim(`  ${pkg} (${config.file}): no changes needed`));
          }
        }
      }
    }

    // Step 6: Process Next.js apps (unless --packages-only)
    if (!input.packagesOnly) {
      yield* processNextJsApps(input, mode, repoRoot, tsconfigPaths, {
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
