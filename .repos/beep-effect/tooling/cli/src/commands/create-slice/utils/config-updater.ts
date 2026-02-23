/**
 * @file Config Updater for create-slice CLI
 *
 * Updates configuration files (package.json, tsconfig files) when creating new slices.
 * Uses jsonc-parser for tsconfig files to preserve comments and trailing commas.
 *
 * Handles:
 * - packages/runtime/server/package.json: Add slice server deps to peer/devDependencies
 * - packages/_internal/db-admin/package.json: Add slice tables/server deps to dependencies
 * - packages/runtime/server/tsconfig.*.json: Add slice references
 * - packages/_internal/db-admin/tsconfig.*.json: Add slice references
 *
 * @module create-slice/utils/config-updater
 * @since 0.1.0
 */

import * as path from "node:path";
import { $RepoCliId } from "@beep/identity/packages";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";
import { FileWriteError } from "../errors.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/create-slice/utils/config-updater");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Represents a tsconfig reference entry.
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigReference {
  readonly path: string;
}

/**
 * Parsed tsconfig.json structure (partial).
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigJson {
  readonly extends?: string;
  readonly include?: readonly string[];
  readonly exclude?: readonly string[];
  readonly references?: readonly TsconfigReference[];
  readonly compilerOptions?: Record<string, unknown>;
}

/**
 * Package.json dependencies structure.
 *
 * @since 0.1.0
 * @category models
 */
export interface PackageJsonDeps {
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// jsonc-parser Effect wrapper
// -----------------------------------------------------------------------------

/**
 * Loads the jsonc-parser module dynamically.
 */
const loadJsoncParser = Effect.tryPromise({
  try: () => import("jsonc-parser"),
  catch: (cause) => new FileWriteError({ filePath: "jsonc-parser", cause }),
});

// -----------------------------------------------------------------------------
// Generic File Update Helpers
// -----------------------------------------------------------------------------

/**
 * Reads a file, applies modifications using jsonc-parser, and writes it back.
 * Preserves comments and formatting in JSONC files.
 *
 * Note: The generic T is unconstrained because jsonc-parser returns unknown types
 * and the caller provides the appropriate type for their use case (e.g., TsconfigJson).
 * The type assertion is inherent to working with dynamic JSON parsing.
 */
const updateJsoncFile = <T>(
  filePath: string,
  modifier: (content: string, parsed: T, jsonc: typeof import("jsonc-parser")) => string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const jsonc = yield* loadJsoncParser;

    // Read current content
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));

    // Parse and modify - type assertion is unavoidable with dynamic JSON parsing
    const parsed = jsonc.parse(content) as T;
    const updatedContent = modifier(content, parsed, jsonc);

    // Write back
    yield* fs
      .writeFileString(filePath, updatedContent)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));
  });

/**
 * Reads a JSON file (standard JSON, not JSONC), modifies it, and writes it back.
 * For package.json files which are standard JSON.
 */
const updateJsonFile = <T extends Record<string, unknown>>(
  filePath: string,
  modifier: (parsed: T) => T
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // Read current content
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));

    // Parse JSON
    const parsed = yield* Effect.try({
      try: () => JSON.parse(content) as T,
      catch: (cause) => new FileWriteError({ filePath, cause }),
    });

    // Apply modification
    const updated = modifier(parsed);

    // Write back with consistent formatting
    const updatedContent = `${JSON.stringify(updated, null, 2)}\n`;
    yield* fs
      .writeFileString(filePath, updatedContent)
      .pipe(Effect.mapError((cause) => new FileWriteError({ filePath, cause })));
  });

// -----------------------------------------------------------------------------
// TSConfig Reference Update Functions
// -----------------------------------------------------------------------------

/**
 * Adds references to a tsconfig file using jsonc-parser.
 * Skips references that already exist.
 *
 * @param filePath - Absolute path to the tsconfig file
 * @param newReferences - Array of reference paths to add
 * @returns Effect that updates the file
 *
 * @example
 * ```ts
 * import { updateTsconfigReferences } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = updateTsconfigReferences(
 *   "/path/to/tsconfig.build.json",
 *   [
 *     "../../my-slice/server/tsconfig.build.json",
 *     "../../my-slice/tables/tsconfig.build.json"
 *   ]
 * )
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const updateTsconfigReferences = (
  filePath: string,
  newReferences: readonly string[]
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem> =>
  updateJsoncFile<TsconfigJson>(filePath, (content, parsed, jsonc) => {
    const currentRefs = parsed.references ?? [];
    const currentPaths = F.pipe(
      currentRefs,
      A.map((ref) => ref.path),
      HashSet.fromIterable
    );

    // Filter out references that already exist
    const refsToAdd = F.pipe(
      newReferences,
      A.filter((refPath) => !HashSet.has(currentPaths, refPath)),
      A.map((refPath): TsconfigReference => ({ path: refPath }))
    );

    // If nothing to add, return unchanged
    if (A.isEmptyArray(refsToAdd)) {
      return content;
    }

    // Merge references
    const updatedRefs = F.pipe(currentRefs, A.appendAll(refsToAdd));

    // Use jsonc.modify to update while preserving formatting
    const edits = jsonc.modify(content, ["references"], updatedRefs, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });

    return jsonc.applyEdits(content, edits);
  }).pipe(Effect.withSpan("ConfigUpdater.updateTsconfigReferences"));

// -----------------------------------------------------------------------------
// Runtime Server Package.json Update
// -----------------------------------------------------------------------------

/**
 * Updates packages/runtime/server/package.json to add slice dependencies.
 *
 * Adds to both peerDependencies and devDependencies:
 * - `@beep/{sliceName}-server`: "workspace:^"
 *
 * Pattern matches existing entries like @beep/workspaces-server, @beep/iam-server.
 *
 * @param sliceName - The name of the new slice (e.g., "notifications")
 * @returns Effect that updates the package.json file
 *
 * @example
 * ```ts
 * import { updateRuntimeServerPackageJson } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = updateRuntimeServerPackageJson("notifications")
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const updateRuntimeServerPackageJson = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const filePath = path.join(repo.REPOSITORY_ROOT, "packages/runtime/server/package.json");

    const serverPkg = `@beep/${sliceName}-server`;

    yield* updateJsonFile<PackageJsonDeps & Record<string, unknown>>(filePath, (pkg) => {
      const peerDeps = pkg.peerDependencies ?? {};
      const devDeps = pkg.devDependencies ?? {};

      // Add to peerDependencies if not present
      const updatedPeerDeps = F.pipe(
        peerDeps,
        R.has(serverPkg) ? F.identity : (deps) => ({ ...deps, [serverPkg]: "workspace:^" })
      );

      // Add to devDependencies if not present
      const updatedDevDeps = F.pipe(
        devDeps,
        R.has(serverPkg) ? F.identity : (deps) => ({ ...deps, [serverPkg]: "workspace:^" })
      );

      return {
        ...pkg,
        peerDependencies: updatedPeerDeps,
        devDependencies: updatedDevDeps,
      };
    });
  }).pipe(Effect.withSpan("ConfigUpdater.updateRuntimeServerPackageJson"));

// -----------------------------------------------------------------------------
// Root Package.json Workspaces Update
// -----------------------------------------------------------------------------

/**
 * Updates root package.json to add slice workspace entry.
 *
 * Adds to workspaces array:
 * - `packages/{sliceName}/*`
 *
 * This is required for bun/turbo to discover the new slice packages.
 *
 * @param sliceName - The name of the new slice (e.g., "notifications")
 * @returns Effect that updates the root package.json file
 *
 * @example
 * ```ts
 * import { updateRootPackageJsonWorkspaces } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = updateRootPackageJsonWorkspaces("notifications")
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const updateRootPackageJsonWorkspaces = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const filePath = path.join(repo.REPOSITORY_ROOT, "package.json");

    const workspaceEntry = `packages/${sliceName}/*`;

    yield* updateJsonFile<{ workspaces?: string[] } & Record<string, unknown>>(filePath, (pkg) => {
      const workspaces = pkg.workspaces ?? [];

      // Check if already present
      if (
        F.pipe(
          workspaces,
          A.some((w) => w === workspaceEntry)
        )
      ) {
        return pkg;
      }

      // Add new workspace entry
      return {
        ...pkg,
        workspaces: F.pipe(workspaces, A.append(workspaceEntry)),
      };
    });
  }).pipe(Effect.withSpan("ConfigUpdater.updateRootPackageJsonWorkspaces"));

// -----------------------------------------------------------------------------
// DB Admin Package.json Update
// -----------------------------------------------------------------------------

/**
 * Updates packages/_internal/db-admin/package.json to add slice dependencies.
 *
 * Adds to dependencies:
 * - `@beep/{sliceName}-tables`: "workspace:^"
 * - `@beep/{sliceName}-server`: "workspace:^"
 *
 * Pattern matches existing entries like @beep/workspaces-tables, @beep/iam-server.
 *
 * @param sliceName - The name of the new slice (e.g., "notifications")
 * @returns Effect that updates the package.json file
 *
 * @example
 * ```ts
 * import { updateDbAdminPackageJson } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = updateDbAdminPackageJson("notifications")
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const updateDbAdminPackageJson = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const filePath = path.join(repo.REPOSITORY_ROOT, "packages/_internal/db-admin/package.json");

    const tablesPkg = `@beep/${sliceName}-tables`;
    const serverPkg = `@beep/${sliceName}-server`;

    yield* updateJsonFile<PackageJsonDeps & Record<string, unknown>>(filePath, (pkg) => {
      const deps = pkg.dependencies ?? {};

      // Add tables package if not present
      const withTables = F.pipe(deps, R.has(tablesPkg) ? F.identity : (d) => ({ ...d, [tablesPkg]: "workspace:^" }));

      // Add server package if not present
      const withServer = F.pipe(
        withTables,
        R.has(serverPkg) ? F.identity : (d) => ({ ...d, [serverPkg]: "workspace:^" })
      );

      return {
        ...pkg,
        dependencies: withServer,
      };
    });
  }).pipe(Effect.withSpan("ConfigUpdater.updateDbAdminPackageJson"));

// -----------------------------------------------------------------------------
// Runtime Server TSConfig Updates
// -----------------------------------------------------------------------------

/**
 * Updates all tsconfig files in packages/runtime/server/ to add slice references.
 *
 * Updates:
 * - tsconfig.build.json: Adds `../../{sliceName}/server/tsconfig.build.json`
 * - tsconfig.src.json: Adds `../../{sliceName}/server`
 * - tsconfig.test.json: Adds `../../{sliceName}/server`
 *
 * @param sliceName - The name of the new slice
 * @returns Effect that updates all tsconfig files
 *
 * @since 0.1.0
 * @category functions
 */
export const updateRuntimeServerTsconfigs = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const serverDir = path.join(repo.REPOSITORY_ROOT, "packages/runtime/server");

    // tsconfig.build.json uses explicit tsconfig.build.json references
    yield* updateTsconfigReferences(path.join(serverDir, "tsconfig.build.json"), [
      `../../${sliceName}/server/tsconfig.build.json`,
    ]);

    // tsconfig.src.json uses directory references (resolves to tsconfig.json in that dir)
    yield* updateTsconfigReferences(path.join(serverDir, "tsconfig.src.json"), [`../../${sliceName}/server`]);

    // tsconfig.test.json uses directory references
    yield* updateTsconfigReferences(path.join(serverDir, "tsconfig.test.json"), [`../../${sliceName}/server`]);
  }).pipe(Effect.withSpan("ConfigUpdater.updateRuntimeServerTsconfigs"));

// -----------------------------------------------------------------------------
// DB Admin TSConfig Updates
// -----------------------------------------------------------------------------

/**
 * Updates all tsconfig files in packages/_internal/db-admin/ to add slice references.
 *
 * Updates:
 * - tsconfig.build.json: Adds server/tsconfig.build.json and tables/tsconfig.build.json
 * - tsconfig.src.json: Adds server and tables directory references
 * - tsconfig.test.json: Adds server/tsconfig.build.json and tables/tsconfig.build.json
 *
 * @param sliceName - The name of the new slice
 * @returns Effect that updates all tsconfig files
 *
 * @since 0.1.0
 * @category functions
 */
export const updateDbAdminTsconfigs = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const dbAdminDir = path.join(repo.REPOSITORY_ROOT, "packages/_internal/db-admin");

    // tsconfig.build.json uses explicit tsconfig.build.json references
    yield* updateTsconfigReferences(path.join(dbAdminDir, "tsconfig.build.json"), [
      `../../${sliceName}/server/tsconfig.build.json`,
      `../../${sliceName}/tables/tsconfig.build.json`,
    ]);

    // tsconfig.src.json uses directory references
    yield* updateTsconfigReferences(path.join(dbAdminDir, "tsconfig.src.json"), [
      `../../${sliceName}/server`,
      `../../${sliceName}/tables`,
    ]);

    // tsconfig.test.json uses explicit tsconfig.build.json references
    yield* updateTsconfigReferences(path.join(dbAdminDir, "tsconfig.test.json"), [
      `../../${sliceName}/server/tsconfig.build.json`,
      `../../${sliceName}/tables/tsconfig.build.json`,
    ]);
  }).pipe(Effect.withSpan("ConfigUpdater.updateDbAdminTsconfigs"));

// -----------------------------------------------------------------------------
// Web App TSConfig Updates
// -----------------------------------------------------------------------------

/**
 * Slice layers that require path aliases in the web app.
 */
const WEB_APP_SLICE_LAYERS = ["server", "domain", "tables", "client", "ui"] as const;

/**
 * Updates apps/web/tsconfig.json to add slice path aliases and references.
 *
 * Adds to compilerOptions.paths:
 * - `@beep/{sliceName}-{layer}`: Path to source index
 * - `@beep/{sliceName}-{layer}/*`: Path to source files
 *
 * Adds to references:
 * - References to each slice layer's tsconfig.build.json
 *
 * @param sliceName - The name of the new slice (e.g., "notifications")
 * @returns Effect that updates the web app tsconfig
 *
 * @example
 * ```ts
 * import { updateWebAppTsconfig } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = updateWebAppTsconfig("notifications")
 * ```
 *
 * @since 0.1.0
 * @category functions
 */
export const updateWebAppTsconfig = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const filePath = path.join(repo.REPOSITORY_ROOT, "apps/web/tsconfig.json");

    interface WebTsconfig {
      compilerOptions?: {
        paths?: Record<string, string[]>;
        [key: string]: unknown;
      };
      references?: TsconfigReference[];
      [key: string]: unknown;
    }

    yield* updateJsonFile<WebTsconfig>(filePath, (pkg) => {
      const paths = pkg.compilerOptions?.paths ?? {};
      const refs = pkg.references ?? [];

      // Generate new path aliases for each layer
      const newPaths = F.pipe(
        WEB_APP_SLICE_LAYERS,
        A.reduce(paths, (acc, layer) => {
          const pkgName = `@beep/${sliceName}-${layer}`;
          const pkgPath = `../../packages/${sliceName}/${layer}/src/index`;
          const pkgGlob = `../../packages/${sliceName}/${layer}/src/*`;

          // Skip if already exists
          if (R.has(acc, pkgName)) {
            return acc;
          }

          return {
            ...acc,
            [pkgName]: [pkgPath],
            [`${pkgName}/*`]: [pkgGlob],
          };
        })
      );

      // Generate new references for each layer
      const existingRefPaths = F.pipe(
        refs,
        A.map((ref) => ref.path),
        HashSet.fromIterable
      );

      const newRefs = F.pipe(
        WEB_APP_SLICE_LAYERS,
        A.map((layer) => ({
          path: `../../packages/${sliceName}/${layer}/tsconfig.build.json`,
        })),
        A.filter((ref) => !HashSet.has(existingRefPaths, ref.path))
      );

      return {
        ...pkg,
        compilerOptions: {
          ...pkg.compilerOptions,
          paths: newPaths,
        },
        references: F.pipe(refs, A.appendAll(newRefs)),
      };
    });
  }).pipe(Effect.withSpan("ConfigUpdater.updateWebAppTsconfig"));

// -----------------------------------------------------------------------------
// Aggregated Update Functions
// -----------------------------------------------------------------------------

/**
 * Updates all package.json files that need slice dependencies.
 *
 * Convenience function that updates:
 * - packages/runtime/server/package.json
 * - packages/_internal/db-admin/package.json
 *
 * @param sliceName - The name of the new slice
 * @returns Effect that updates both files
 *
 * @since 0.1.0
 * @category functions
 */
export const updateAllPackageJsons = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    yield* updateRootPackageJsonWorkspaces(sliceName);
    yield* updateRuntimeServerPackageJson(sliceName);
    yield* updateDbAdminPackageJson(sliceName);
  }).pipe(Effect.withSpan("ConfigUpdater.updateAllPackageJsons"));

/**
 * Updates all tsconfig files that need slice references.
 *
 * Convenience function that updates:
 * - All tsconfigs in packages/runtime/server/
 * - All tsconfigs in packages/_internal/db-admin/
 * - apps/web/tsconfig.json (paths and references)
 *
 * @param sliceName - The name of the new slice
 * @returns Effect that updates all files
 *
 * @since 0.1.0
 * @category functions
 */
export const updateAllSliceTsconfigs = (
  sliceName: string
): Effect.Effect<void, FileWriteError, FileSystem.FileSystem | RepoUtils> =>
  Effect.gen(function* () {
    yield* updateRuntimeServerTsconfigs(sliceName);
    yield* updateDbAdminTsconfigs(sliceName);
    yield* updateWebAppTsconfig(sliceName);
  }).pipe(Effect.withSpan("ConfigUpdater.updateAllSliceTsconfigs"));

// -----------------------------------------------------------------------------
// ConfigUpdaterService
// -----------------------------------------------------------------------------

/**
 * Service for updating configuration files when creating slices.
 *
 * Provides methods to update:
 * - package.json dependencies in runtime/server and db-admin
 * - tsconfig references in runtime/server and db-admin
 *
 * @example
 * ```ts
 * import { ConfigUpdaterService } from "./config-updater.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const updater = yield* ConfigUpdaterService
 *   yield* updater.updateAllForSlice("notifications")
 * })
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class ConfigUpdaterService extends Effect.Service<ConfigUpdaterService>()($I`ConfigUpdaterService`, {
  dependencies: [RepoUtilsLive],
  effect: Effect.gen(function* () {
    // Collect services to avoid leaking requirements
    const fs = yield* FileSystem.FileSystem;
    const repo = yield* RepoUtils;

    return {
      /**
       * Updates packages/runtime/server/package.json
       */
      updateRuntimeServerPackageJson: (sliceName: string) =>
        updateRuntimeServerPackageJson(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates packages/_internal/db-admin/package.json
       */
      updateDbAdminPackageJson: (sliceName: string) =>
        updateDbAdminPackageJson(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates root package.json workspaces array
       */
      updateRootPackageJsonWorkspaces: (sliceName: string) =>
        updateRootPackageJsonWorkspaces(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates a tsconfig file with new references
       */
      updateTsconfigReferences: (tsconfigPath: string, references: readonly string[]) =>
        updateTsconfigReferences(tsconfigPath, references).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates all tsconfigs in packages/runtime/server/
       */
      updateRuntimeServerTsconfigs: (sliceName: string) =>
        updateRuntimeServerTsconfigs(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates all tsconfigs in packages/_internal/db-admin/
       */
      updateDbAdminTsconfigs: (sliceName: string) =>
        updateDbAdminTsconfigs(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates apps/web/tsconfig.json with path aliases and references
       */
      updateWebAppTsconfig: (sliceName: string) =>
        updateWebAppTsconfig(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates all package.json files
       */
      updateAllPackageJsons: (sliceName: string) =>
        updateAllPackageJsons(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates all tsconfig files
       */
      updateAllSliceTsconfigs: (sliceName: string) =>
        updateAllSliceTsconfigs(sliceName).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo)
        ),

      /**
       * Updates all configuration files for a new slice.
       * This is the main entry point for the handler.
       */
      updateAllForSlice: (sliceName: string): Effect.Effect<void, FileWriteError> =>
        Effect.gen(function* () {
          yield* updateAllPackageJsons(sliceName);
          yield* updateAllSliceTsconfigs(sliceName);
        }).pipe(
          Effect.provideService(FileSystem.FileSystem, fs),
          Effect.provideService(RepoUtils, repo),
          Effect.withSpan("ConfigUpdaterService.updateAllForSlice")
        ),
    };
  }),
}) {}

/**
 * Live layer for ConfigUpdaterService.
 *
 * @since 0.1.0
 * @category layers
 */
export const ConfigUpdaterServiceLive = ConfigUpdaterService.Default;
