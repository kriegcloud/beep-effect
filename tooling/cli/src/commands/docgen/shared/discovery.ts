/**
 * @file Package Discovery Utilities
 *
 * Utilities for discovering workspace packages and their docgen status.
 * Scans the monorepo to find packages with/without docgen configuration.
 *
 * Key exports:
 * - discoverAllPackages: Find all workspace packages
 * - discoverConfiguredPackages: Find packages with docgen.json
 * - discoverPackagesWithDocs: Find packages with generated docs
 * - getPackageInfo: Get detailed info about a specific package
 * - resolvePackagePath: Resolve and validate a package path
 * - getPackageName: Get package name from package.json
 *
 * @module docgen/shared/discovery
 * @since 1.0.0
 */

import type * as FsUtils from "@beep/tooling-utils/FsUtils";
import { findRepoRoot, resolveWorkspaceDirs } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import { InvalidPackagePathError, PackageNotFoundError } from "../errors.js";
import type { PackageDocgenStatus, PackageInfo } from "../types.js";
import { hasDocgenConfig } from "./config.js";

/** Directory where generated module docs are stored */
const DOCS_MODULES_DIR = "docs/modules";

/**
 * Determine the docgen status of a package based on config and docs presence.
 *
 * @param hasConfig - Whether docgen.json exists
 * @param hasDocs - Whether docs/modules/ directory exists
 * @returns The computed PackageDocgenStatus
 */
const computeStatus = (hasConfig: boolean, hasDocs: boolean): PackageDocgenStatus => {
  if (hasConfig && hasDocs) return "configured-and-generated";
  if (hasConfig) return "configured-not-generated";
  return "not-configured";
};

/**
 * Get package name from package.json.
 *
 * @example
 * ```ts
 * import { getPackageName } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const name = yield* getPackageName("/home/user/projects/beep-effect/packages/common/schema")
 *   console.log(name)
 *   // => "@beep/schema"
 * })
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @returns The package name from package.json
 * @throws PackageNotFoundError if package.json doesn't exist or can't be read
 * @category getters
 * @since 0.1.0
 */
export const getPackageName = (
  packagePath: string
): Effect.Effect<string, PackageNotFoundError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const pkgJsonPath = path.join(packagePath, "package.json");

    const exists = yield* fs.exists(pkgJsonPath).pipe(Effect.orElseSucceed(F.constFalse));
    if (!exists) {
      return yield* Effect.fail(
        new PackageNotFoundError({
          path: packagePath,
          message: "No package.json found",
        })
      );
    }

    const content = yield* fs.readFileString(pkgJsonPath).pipe(
      Effect.mapError(
        () =>
          new PackageNotFoundError({
            path: packagePath,
            message: "Failed to read package.json",
          })
      )
    );

    const parsed = yield* Effect.try({
      try: () => JSON.parse(content) as { name?: string },
      catch: () =>
        new PackageNotFoundError({
          path: packagePath,
          message: "Invalid package.json",
        }),
    });

    return parsed.name ?? path.basename(packagePath);
  });

/**
 * Check if a package has generated documentation.
 *
 * @example
 * ```ts
 * import { hasGeneratedDocs } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const hasDocs = yield* hasGeneratedDocs("/home/user/projects/beep-effect/packages/common/schema")
 *   console.log(hasDocs)
 *   // => true
 * })
 * ```
 *
 * @param packagePath - Absolute path to the package directory
 * @returns true if docs/modules/ directory exists
 * @category predicates
 * @since 0.1.0
 */
export const hasGeneratedDocs = (
  packagePath: string
): Effect.Effect<boolean, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const docsPath = path.join(packagePath, DOCS_MODULES_DIR);
    return yield* fs.exists(docsPath).pipe(Effect.orElseSucceed(F.constFalse));
  });

/**
 * Get detailed information about a single package.
 *
 * @example
 * ```ts
 * import { getPackageInfo } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const info = yield* getPackageInfo("/home/user/projects/beep-effect/packages/common/schema")
 *   console.log(info.name)
 *   // => "@beep/schema"
 *   console.log(info.status)
 *   // => "configured-and-generated"
 * })
 * ```
 *
 * @param absolutePath - Absolute path to the package directory
 * @returns PackageInfo with name, paths, and docgen status
 * @throws PackageNotFoundError if package.json doesn't exist
 * @category getters
 * @since 0.1.0
 */
export const getPackageInfo = (
  absolutePath: string
): Effect.Effect<PackageInfo, PackageNotFoundError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot.pipe(Effect.catchAll(() => Effect.succeed(process.cwd())));

    const name = yield* getPackageName(absolutePath);
    const hasConfig = yield* hasDocgenConfig(absolutePath);
    const hasDocs = yield* hasGeneratedDocs(absolutePath);
    const relativePath = path.relative(repoRoot, absolutePath);

    return {
      name,
      relativePath,
      absolutePath,
      hasDocgenConfig: hasConfig,
      hasGeneratedDocs: hasDocs,
      status: computeStatus(hasConfig, hasDocs),
    };
  });

/**
 * Discover all workspace packages in the monorepo.
 *
 * Uses resolveWorkspaceDirs from tooling-utils to find all packages
 * defined in the root package.json workspaces field.
 *
 * @example
 * ```ts
 * import { discoverAllPackages } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const packages = yield* discoverAllPackages
 *   const names = F.pipe(
 *     packages,
 *     A.map((pkg) => pkg.name)
 *   )
 *   console.log(names)
 * })
 * ```
 *
 * @returns Array of PackageInfo for all discovered packages
 * @category utilities
 * @since 0.1.0
 */
export const discoverAllPackages: Effect.Effect<
  ReadonlyArray<PackageInfo>,
  never,
  FileSystem.FileSystem | Path.Path | FsUtils.FsUtils
> = Effect.gen(function* () {
  const workspaceDirs = yield* resolveWorkspaceDirs.pipe(
    Effect.catchAll(() => Effect.succeed(HashMap.empty<string, string>()))
  );

  // Convert HashMap values to array of absolute paths
  const dirs = F.pipe(workspaceDirs, HashMap.values, A.fromIterable);

  const packages = yield* Effect.forEach(
    dirs,
    (dir) => getPackageInfo(dir).pipe(Effect.catchAll(() => Effect.succeed(null as PackageInfo | null))),
    { concurrency: 10 }
  );

  return F.pipe(
    packages,
    A.filter((p): p is PackageInfo => p !== null)
  );
});

/**
 * Discover packages that have docgen.json configured.
 *
 * @example
 * ```ts
 * import { discoverConfiguredPackages } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const packages = yield* discoverConfiguredPackages
 *   const count = F.pipe(packages, A.length)
 *   console.log(`Found ${count} packages with docgen.json`)
 * })
 * ```
 *
 * @returns Array of PackageInfo for packages with docgen.json
 * @category filtering
 * @since 0.1.0
 */
export const discoverConfiguredPackages: Effect.Effect<
  ReadonlyArray<PackageInfo>,
  never,
  FileSystem.FileSystem | Path.Path | FsUtils.FsUtils
> = Effect.gen(function* () {
  const allPackages = yield* discoverAllPackages;
  return F.pipe(
    allPackages,
    A.filter((p) => p.hasDocgenConfig)
  );
});

/**
 * Discover packages that have generated documentation.
 *
 * @example
 * ```ts
 * import { discoverPackagesWithDocs } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 * import * as A from "effect/Array"
 * import * as F from "effect/Function"
 *
 * const program = Effect.gen(function* () {
 *   const packages = yield* discoverPackagesWithDocs
 *   const relativePaths = F.pipe(
 *     packages,
 *     A.map((pkg) => pkg.relativePath)
 *   )
 *   console.log(relativePaths)
 * })
 * ```
 *
 * @returns Array of PackageInfo for packages with docs/modules/
 * @category filtering
 * @since 0.1.0
 */
export const discoverPackagesWithDocs: Effect.Effect<
  ReadonlyArray<PackageInfo>,
  never,
  FileSystem.FileSystem | Path.Path | FsUtils.FsUtils
> = Effect.gen(function* () {
  const allPackages = yield* discoverAllPackages;
  return F.pipe(
    allPackages,
    A.filter((p) => p.hasGeneratedDocs)
  );
});

/**
 * Resolve a package path (relative or absolute) to PackageInfo.
 *
 * @example
 * ```ts
 * import { resolvePackagePath } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const info = yield* resolvePackagePath("packages/common/schema")
 *   console.log(info.name)
 *   // => "@beep/schema"
 *   console.log(info.absolutePath)
 *   // => "/home/user/projects/beep-effect/packages/common/schema"
 * })
 * ```
 *
 * @param packagePath - Path to the package (can be relative to repo root or absolute)
 * @returns PackageInfo for the resolved package
 * @throws InvalidPackagePathError if path doesn't exist or isn't a directory
 * @throws PackageNotFoundError if package.json doesn't exist
 * @category utilities
 * @since 0.1.0
 */
export const resolvePackagePath = (
  packagePath: string
): Effect.Effect<PackageInfo, InvalidPackagePathError | PackageNotFoundError, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoRoot = yield* findRepoRoot.pipe(Effect.catchAll(() => Effect.succeed(process.cwd())));

    // Resolve to absolute path
    const absolutePath = path.isAbsolute(packagePath) ? packagePath : path.resolve(repoRoot, packagePath);

    // Verify directory exists
    const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(F.constFalse));
    if (!exists) {
      return yield* Effect.fail(
        new InvalidPackagePathError({
          path: packagePath,
          reason: "Directory does not exist",
        })
      );
    }

    // Verify it's a directory
    const stat = yield* fs.stat(absolutePath).pipe(
      Effect.mapError(
        () =>
          new InvalidPackagePathError({
            path: packagePath,
            reason: "Cannot stat path",
          })
      )
    );

    if (stat.type !== "Directory") {
      return yield* Effect.fail(
        new InvalidPackagePathError({
          path: packagePath,
          reason: "Path is not a directory",
        })
      );
    }

    return yield* getPackageInfo(absolutePath);
  });

/**
 * Resolve a package by name from the workspace.
 *
 * @example
 * ```ts
 * import { resolvePackageByName } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const info = yield* resolvePackageByName("@beep/schema")
 *   console.log(info.relativePath)
 *   // => "packages/common/schema"
 *   console.log(info.hasDocgenConfig)
 *   // => true
 * })
 * ```
 *
 * @param packageName - Package name (e.g., "@beep/schema")
 * @returns PackageInfo for the matching package
 * @throws PackageNotFoundError if package is not found in workspace
 * @category utilities
 * @since 0.1.0
 */
export const resolvePackageByName = (
  packageName: string
): Effect.Effect<PackageInfo, PackageNotFoundError, FileSystem.FileSystem | Path.Path | FsUtils.FsUtils> =>
  Effect.gen(function* () {
    const allPackages = yield* discoverAllPackages;
    const found = F.pipe(
      allPackages,
      A.findFirst((p) => p.name === packageName)
    );

    if (found._tag === "None") {
      return yield* Effect.fail(
        new PackageNotFoundError({
          path: packageName,
          message: `Package "${packageName}" not found in workspace`,
        })
      );
    }

    return found.value;
  });
