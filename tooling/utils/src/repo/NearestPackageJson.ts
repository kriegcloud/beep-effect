import { PackageJson } from "@beep/tooling-utils";
import { FsUtils } from "@beep/tooling-utils/FsUtils";
import { DomainError } from "@beep/tooling-utils/repo/Errors";
import * as Path from "@effect/platform/Path";
import { Effect, pipe } from "effect";
import * as Str from "effect/String";
import { fromFileUrl } from "./CurrentFile.js";

export const dirHasPackageJson = Effect.fn("dirHasPackageJson")(function* (dir: string) {
  const fsUtils = yield* FsUtils;
  return yield* fsUtils.dirHasFile(dir, "package.json");
});

/**
 * Resolves a file path or URL to a directory path.
 * - If given a file:// URL, converts it to a path first
 * - If the path is a file, returns its parent directory
 * - If the path is a directory, returns it as-is
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
 * Walks up the directory tree from a starting directory until it finds a package.json
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
    return yield* Effect.fail(
      new DomainError({
        message: "Could not find package.json in parent directories",
        cause: new Error("Could not find package.json in parent directories"),
      })
    );
  }
  return dir;
});

/**
 * Finds and parses the nearest package.json starting from the given file or directory.
 * @param fileOrUrl - A file path, directory path, or file:// URL (e.g., import.meta.url)
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
 * @param fileOrUrl - A file path, directory path, or file:// URL (e.g., import.meta.url)
 *
 * @example
 * ```ts
 * // From a file using import.meta.url
 * const name = yield* NearestPackageJsonName(import.meta.url);
 *
 * // From a specific path
 * const name = yield* NearestPackageJsonName("/path/to/some/file.ts");
 * ```
 */
export const NearestPackageJsonName = Effect.fn("NearestPackageJsonName")(function* (fileOrUrl: string | URL) {
  const pkg = yield* NearestPackageJson(fileOrUrl);
  return pkg.name;
});
