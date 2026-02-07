/**
 * @file Effect Pattern Verification Handler
 *
 * Detection logic for Effect pattern violations in the codebase.
 * Finds native Set/Map/Error/Date usage that should use Effect utilities.
 *
 * Detection patterns ported from scripts/verify-effect-patterns.sh
 *
 * @module verify/patterns/handler
 * @since 0.1.0
 */

import { RepoUtils } from "@beep/tooling-utils";
import { FileSystem, Path } from "@effect/platform";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { glob } from "glob";
import { GlobError } from "../errors.js";
import {
  createReport,
  Violation,
  type ViolationReport,
  type ViolationSeverity,
  type ViolationType,
} from "../schemas.js";

// -----------------------------------------------------------------------------
// Detection Patterns
// -----------------------------------------------------------------------------

/**
 * Detection pattern configuration for Effect pattern violations.
 */
interface DetectionPattern {
  /** Unique name for the pattern */
  name: ViolationType;
  /** Human-readable description */
  description: string;
  /** Glob pattern for files to scan */
  glob: string;
  /** Primary regex pattern to match */
  pattern: RegExp;
  /** Exclude pattern (skip lines matching this) */
  excludePattern?: RegExp;
  /** Glob patterns to exclude */
  excludeGlobs?: ReadonlyArray<string>;
  /** Severity of violations */
  severity: ViolationSeverity;
  /** Suggested fix */
  suggestion: string;
}

/**
 * Effect pattern detection patterns.
 *
 * Ported from scripts/verify-effect-patterns.sh
 */
const EFFECT_PATTERNS: ReadonlyArray<DetectionPattern> = [
  {
    name: "native-set",
    description: "Native Set usage (use MutableHashSet.make())",
    glob: "packages/*/*/src/**/*.ts",
    pattern: /new Set\(/,
    severity: "critical",
    suggestion: "import * as MutableHashSet from 'effect/MutableHashSet'; MutableHashSet.make(...)",
  },
  {
    name: "native-map",
    description: "Native Map usage (use MutableHashMap.make())",
    glob: "packages/*/*/src/**/*.ts",
    pattern: /new Map\(/,
    severity: "critical",
    suggestion: "import * as MutableHashMap from 'effect/MutableHashMap'; MutableHashMap.make(...)",
  },
  {
    name: "native-error",
    description: "Native Error constructor (use S.TaggedError)",
    glob: "packages/*/*/src/**/*.ts",
    pattern: /new Error\(/,
    excludePattern: /\/\/ biome-ignore/,
    severity: "critical",
    suggestion: "Create a tagged error class extending S.TaggedError",
  },
  {
    name: "native-date",
    description: "Native Date constructor (prefer DateTime.now)",
    glob: "packages/*/*/src/**/*.ts",
    excludeGlobs: ["**/*.test.ts", "**/test/**/*.ts"],
    pattern: /new Date\(/,
    severity: "warning",
    suggestion: "import * as DateTime from 'effect/DateTime'; yield* DateTime.now",
  },
];

// -----------------------------------------------------------------------------
// Options Types
// -----------------------------------------------------------------------------

/**
 * Options for Effect pattern verification.
 */
export interface PatternVerifyOptions {
  /** Package filter pattern (e.g., "@beep/iam-*") */
  readonly filter: O.Option<string>;
  /** Output format */
  readonly format: "table" | "json" | "summary";
  /** Severity filter */
  readonly severity: "critical" | "warning" | "all";
}

// -----------------------------------------------------------------------------
// Scanning Logic
// -----------------------------------------------------------------------------

/**
 * Match files against a glob pattern relative to repo root.
 */
const matchGlob = (pattern: string, repoRoot: string, ignorePatterns?: ReadonlyArray<string>) =>
  Effect.tryPromise({
    try: () =>
      glob(pattern, {
        cwd: repoRoot,
        nodir: true,
        ignore: ["**/node_modules/**", ...(ignorePatterns ?? [])],
      }),
    catch: (error) =>
      new GlobError({
        pattern,
        cause: error,
      }),
  });

/**
 * Check if a file path matches the package filter.
 */
const matchesFilter = (filePath: string, filter: O.Option<string>): boolean => {
  if (O.isNone(filter)) return true;

  const filterValue = filter.value;
  // Convert @beep/iam-* to packages/iam/*
  if (filterValue.startsWith("@beep/")) {
    const packagePart = filterValue.slice(6); // Remove "@beep/"
    // Handle wildcards
    if (packagePart.endsWith("*")) {
      const prefix = packagePart.slice(0, -1); // Remove trailing *
      // Match packages/{slice}/ where slice starts with prefix
      const sliceMatch = filePath.match(/^packages\/([^/]+)\//);
      if (sliceMatch?.[1]) {
        return sliceMatch[1].startsWith(prefix);
      }
    }
    // Exact match
    return filePath.includes(packagePart.replace("-", "/"));
  }

  // Generic filter - check if path contains filter
  return filePath.includes(filterValue);
};

/**
 * Scan a single file for violations matching a pattern.
 */
const scanFileForPattern = (filePath: string, content: string, pattern: DetectionPattern): ReadonlyArray<Violation> => {
  const lines = Str.split(content, "\n");

  return F.pipe(
    lines,
    A.map((line, index) => {
      // Check primary pattern
      if (!pattern.pattern.test(line)) return O.none();

      // Check exclude pattern
      if (pattern.excludePattern?.test(line)) return O.none();

      return O.some(
        new Violation({
          type: pattern.name,
          severity: pattern.severity,
          filePath,
          line: index + 1,
          message: pattern.description,
          codeSnippet: Str.trim(line),
          suggestion: pattern.suggestion,
        })
      );
    }),
    A.getSomes
  );
};

/**
 * Scan all files matching a pattern configuration.
 */
const scanForPattern = (pattern: DetectionPattern, repoRoot: string, filter: O.Option<string>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Match files
    const allFiles = yield* matchGlob(pattern.glob, repoRoot, pattern.excludeGlobs);

    // Apply filter
    const filteredFiles = F.pipe(
      allFiles,
      A.filter((file) => matchesFilter(file, filter))
    );

    // Scan each file
    const allViolations: Violation[] = [];
    for (const file of filteredFiles) {
      const fullPath = path.join(repoRoot, file);

      const content = yield* fs.readFileString(fullPath).pipe(Effect.catchAll(() => Effect.succeed("")));

      if (Str.isNonEmpty(content)) {
        const violations = scanFileForPattern(file, content, pattern);
        allViolations.push(...violations);
      }
    }

    return {
      violations: allViolations,
      fileCount: A.length(filteredFiles),
    };
  });

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/**
 * Run Effect pattern verification and return violations.
 *
 * @param options - Verification options
 * @returns Effect yielding the violation report
 *
 * @since 0.1.0
 * @category handlers
 */
export const patternHandler = (
  options: PatternVerifyOptions
): Effect.Effect<ViolationReport, GlobError, FileSystem.FileSystem | Path.Path | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const repoRoot = repo.REPOSITORY_ROOT;

    // Scan all patterns
    const results = yield* Effect.all(
      A.map(EFFECT_PATTERNS, (pattern) => scanForPattern(pattern, repoRoot, options.filter))
    );

    // Aggregate violations
    const allViolations = F.pipe(
      results,
      A.flatMap((r) => r.violations)
    );

    // Filter by severity if needed
    const filteredViolations =
      options.severity === "all"
        ? allViolations
        : F.pipe(
            allViolations,
            A.filter((v) => v.severity === options.severity)
          );

    // Get total file count
    const totalFiles = F.pipe(
      results,
      A.map((r) => r.fileCount),
      A.reduce(0, (acc, n) => acc + n)
    );

    // Determine scanned packages
    const packages = F.pipe(
      filteredViolations,
      A.map((v) => {
        const match = v.filePath.match(/^packages\/([^/]+)\/([^/]+)/);
        return match ? `@beep/${match[1]}-${match[2]}` : "unknown";
      }),
      A.dedupe
    );

    return createReport(filteredViolations, packages, totalFiles);
  }).pipe(Effect.withSpan("patternHandler"));
