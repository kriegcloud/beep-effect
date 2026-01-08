/**
 * Nearest package.json discovery utilities.
 *
 * Finds and parses the nearest package.json by walking up the directory tree.
 *
 * @since 0.1.0
 */
import * as Path from "@effect/platform/Path";
import { Effect, pipe } from "effect";
import * as Str from "effect/String";
import { FsUtils } from "../FsUtils.js";
import { PackageJson } from "../schemas/PackageJson.js";
import { fromFileUrl } from "./CurrentFile.js";
import { DomainError } from "./Errors.js";

/**
 * Check if a directory contains a package.json file.
 *
 * @example
 * ```typescript
 * import { dirHasPackageJson } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const hasPackageJson = yield* dirHasPackageJson("/path/to/project")
 *   console.log(hasPackageJson)
 *   // => true
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const dirHasPackageJson = Effect.fn("dirHasPackageJson")(function* (dir: string) {
  const fsUtils = yield* FsUtils;
  return yield* fsUtils.dirHasFile(dir, "package.json");
});

/**
 * Resolves a file path or URL to a directory path.
 *
 * Handles three cases:
 * - If given a file:// URL, converts it to a path first
 * - If the path is a file, returns its parent directory
 * - If the path is a directory, returns it as-is
 *
 * @example
 * ```typescript
 * import { resolveStartDirectory } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const dir = yield* resolveStartDirectory(import.meta.url)
 *   console.log(dir)
 *   // => "/path/to/parent/directory"
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const resolveStartDirectory = Effect.fn("resolveStartDirectory")(function* (fileOrUrl: string | URL) {
  const fsUtils = yield* FsUtils;
  const pathService = yield* Path.Path;

  // Convert URL to path if needed
  const filePath =
    Str.isString(fileOrUrl) && !pipe(fileOrUrl, Str.startsWith("file://")) ? fileOrUrl : yield* fromFileUrl(fileOrUrl);

  // Check if it's a file or directory
  const isDir = yield* fsUtils.isDirectory(filePath);
  return isDir ? filePath : pathService.dirname(filePath);
});

/**
 * Walks up the directory tree from a starting directory until it finds a package.json.
 *
 * Traverses up to 20 parent directories looking for a package.json file. Fails if
 * the walk limit is reached without finding a package.json.
 *
 * @example
 * ```typescript
 * import { walkUpUntilHasPackageJson } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const pkgDir = yield* walkUpUntilHasPackageJson("/path/to/deeply/nested/file")
 *   console.log(pkgDir)
 *   // => "/path/to" (where package.json was found)
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const walkUpUntilHasPackageJson = Effect.fn("walkUpUntilHasPackageJson")(function* (startDir: string) {
  const walkLimit = 20;
  let readParents = 0;
  const fsUtils = yield* FsUtils;

  let dir = startDir;
  while (!(yield* dirHasPackageJson(dir)) && readParents <= walkLimit) {
    readParents++;
    dir = yield* fsUtils.getParentDirectory(dir);
  }

  if (readParents === walkLimit && dir === startDir) {
    return yield* new DomainError({
      message: "Could not find package.json in parent directories",
      cause: undefined,
    });
  }
  return dir;
});

/**
 * Finds and parses the nearest package.json starting from the given file or directory.
 *
 * Walks up the directory tree to find the nearest package.json, reads it, and parses
 * it into a typed {@link PackageJson} schema instance.
 *
 * @param fileOrUrl - A file path, directory path, or file:// URL (e.g., import.meta.url)
 *
 * @example
 * ```typescript
 * import { NearestPackageJson } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const pkg = yield* NearestPackageJson(import.meta.url)
 *   console.log(pkg.name)
 *   // => "@beep/my-package"
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const NearestPackageJson = Effect.fn("NearestPackageJson")(function* (fileOrUrl: string | URL) {
  const fsUtils = yield* FsUtils;

  const startDir = yield* resolveStartDirectory(fileOrUrl);
  const packageJsonDir = yield* walkUpUntilHasPackageJson(startDir);
  const content = yield* fsUtils.readJson(`${packageJsonDir}/package.json`);

  return yield* PackageJson.decodeUnknown(content);
});

/**
 * Gets the "name" field from the nearest package.json starting from the given file or directory.
 *
 * Convenience wrapper around {@link NearestPackageJson} that returns only the package name.
 *
 * @param fileOrUrl - A file path, directory path, or file:// URL (e.g., import.meta.url)
 *
 * @example
 * ```typescript
 * import { NearestPackageJsonName } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // From a file using import.meta.url
 *   const name = yield* NearestPackageJsonName(import.meta.url)
 *   console.log(name)
 *   // => "@beep/my-package"
 *
 *   // From a specific path
 *   const otherName = yield* NearestPackageJsonName("/path/to/some/file.ts")
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const NearestPackageJsonName = Effect.fn("NearestPackageJsonName")(function* (fileOrUrl: string | URL) {
  const pkg = yield* NearestPackageJson(fileOrUrl);
  return pkg.name;
});
