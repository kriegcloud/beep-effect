/**
 * Shared TypeScript source path exclusion rules for CLI lint commands.
 *
 * @since 0.0.0
 * @module
 */

import * as A from "effect/Array";
import * as Str from "effect/String";

/**
 * Path segments excluded from TypeScript source lint traversals.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS = [
  "/.repos/",
  "/node_modules/",
  "/dist/",
  "/build/",
  "/coverage/",
  "/storybook-static/",
  "/.next/",
  "/.turbo/",
  "/specs/",
  "/test/",
  "/tests/",
  "/dtslint/",
] as const;

/**
 * File suffixes excluded from TypeScript source lint traversals.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES = [
  ".d.ts",
  ".test.ts",
  ".test.tsx",
  ".spec.ts",
  ".spec.tsx",
  ".stories.tsx",
] as const;

/**
 * Normalize filesystem paths to POSIX separators before string matching.
 *
 * @param value - Path string to normalize.
 * @returns POSIX-normalized path string.
 * @since 0.0.0
 * @category CrossCutting
 */
export const toPosixPath = (value: string): string => Str.replace(/\\/g, "/")(value);

/**
 * Check whether a TypeScript source path should be excluded from lint traversals.
 *
 * @param filePath - Relative or absolute path to inspect.
 * @returns True when the path matches an excluded segment or suffix rule.
 * @since 0.0.0
 * @category CrossCutting
 */
export const isExcludedTypeScriptSourcePath = (filePath: string): boolean => {
  const normalized = toPosixPath(filePath);
  return (
    A.some(TYPESCRIPT_SOURCE_EXCLUDED_SUFFIXES, (suffix) => Str.endsWith(suffix)(normalized)) ||
    A.some(TYPESCRIPT_SOURCE_EXCLUDED_SEGMENTS, (segment) => Str.includes(segment)(normalized))
  );
};
