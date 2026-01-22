/**
 * Path utilities for tsconfig reference calculations.
 *
 * Provides functions to build root-relative paths for TypeScript project
 * references and calculate directory depths.
 *
 * @module @beep/tooling-utils/repo/Paths
 * @since 0.1.0
 * @category Utils
 */
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * Calculate the depth of a path from the repository root.
 *
 * Counts the number of directory separators in the path to determine
 * how many levels deep the path is from the root.
 *
 * @param path - Path relative to repo root
 * @returns Number of directory levels in the path
 *
 * @example
 * ```typescript
 * import { calculateDepth } from "@beep/tooling-utils/repo/Paths"
 *
 * calculateDepth("packages/common/schema/tsconfig.build.json")
 * // => 3 (packages, common, schema)
 *
 * calculateDepth("tsconfig.json")
 * // => 0
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const calculateDepth = (path: string): number => {
  // Split by "/" and filter out the filename (last segment) and empty strings
  const segments = F.pipe(
    path,
    Str.split("/"),
    A.filter((s) => Str.isNonEmpty(s))
  );

  // Depth is number of directory segments (exclude the filename)
  return Math.max(0, A.length(segments) - 1);
};

/**
 * Build a root-relative reference path from a source tsconfig to a target tsconfig.
 *
 * This is used for TypeScript project references where we need to calculate
 * the relative path from one tsconfig to another via the repository root.
 *
 * @param sourcePath - Path of the source tsconfig (relative to repo root)
 * @param targetPath - Path of the target tsconfig (relative to repo root)
 * @returns Relative path from source to target via repo root
 *
 * @example
 * ```typescript
 * import { buildRootRelativePath } from "@beep/tooling-utils/repo/Paths"
 *
 * buildRootRelativePath(
 *   "packages/calendar/server/tsconfig.build.json",
 *   "packages/calendar/domain/tsconfig.build.json"
 * )
 * // => "../../../packages/calendar/domain/tsconfig.build.json"
 *
 * buildRootRelativePath(
 *   "packages/common/schema/tsconfig.build.json",
 *   "packages/common/types/tsconfig.build.json"
 * )
 * // => "../../../packages/common/types/tsconfig.build.json"
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const buildRootRelativePath = (sourcePath: string, targetPath: string): string => {
  const depth = calculateDepth(sourcePath);

  // If at root level (depth 0), no prefix needed
  if (depth === 0) {
    return targetPath;
  }

  // Build the "../" prefix to get back to repo root
  const prefix = F.pipe(A.replicate("..", depth), A.join("/"));

  return `${prefix}/${targetPath}`;
};

/**
 * Normalize a path by removing leading "./" and trailing slashes.
 *
 * @param path - Path to normalize
 * @returns Normalized path
 *
 * @example
 * ```typescript
 * import { normalizePath } from "@beep/tooling-utils/repo/Paths"
 *
 * normalizePath("./packages/common/schema/")
 * // => "packages/common/schema"
 *
 * normalizePath("packages/common/schema")
 * // => "packages/common/schema"
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const normalizePath = (path: string): string => {
  // Split into chars, process, rejoin
  const chars = F.pipe(path, Str.split(""), A.fromIterable);

  // Remove leading "./"
  const withoutLeadingDotSlash = F.pipe(
    chars,
    (arr) => {
      if (A.length(arr) >= 2) {
        const first = A.get(arr, 0);
        const second = A.get(arr, 1);
        if (O.isSome(first) && O.isSome(second) && first.value === "." && second.value === "/") {
          return A.drop(arr, 2);
        }
      }
      return arr;
    }
  );

  // Remove trailing "/"
  const withoutTrailingSlash = F.pipe(
    withoutLeadingDotSlash,
    (arr) => {
      const len = A.length(arr);
      if (len > 0) {
        const last = A.get(arr, len - 1);
        if (O.isSome(last) && last.value === "/") {
          return A.dropRight(arr, 1);
        }
      }
      return arr;
    }
  );

  return A.join(withoutTrailingSlash, "");
};

/**
 * Get the directory containing a file path.
 *
 * @param filePath - Path to a file
 * @returns Directory path containing the file
 *
 * @example
 * ```typescript
 * import { getDirectory } from "@beep/tooling-utils/repo/Paths"
 *
 * getDirectory("packages/common/schema/tsconfig.build.json")
 * // => "packages/common/schema"
 *
 * getDirectory("tsconfig.json")
 * // => ""
 * ```
 *
 * @category Utils
 * @since 0.1.0
 */
export const getDirectory = (filePath: string): string => {
  const segments = F.pipe(filePath, Str.split("/"));
  const len = A.length(segments);

  if (len <= 1) {
    return "";
  }

  // Take all but the last segment (the filename)
  return F.pipe(segments, A.take(len - 1), A.join("/"));
};
