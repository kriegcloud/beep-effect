/**
 * @file Layer Composition Verification Handler
 *
 * Detection logic for Layer composition hygiene in the codebase.
 *
 * This verifier focuses on two high-signal guardrails:
 * - Exported layer values should have an explicit `Layer.Layer<...>` type annotation.
 * - `serviceEffect` values should have an explicit `Effect.Effect<...>` type annotation.
 *
 * The goal is to make layer graphs "self-documenting" at the module boundary so missing
 * dependencies surface early (especially at `Layer.launch(...)` entry points).
 *
 * @module verify/layers/handler
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
 * Detection pattern configuration for Layer hygiene violations.
 */
interface DetectionPattern {
  /** Unique name for the pattern */
  readonly name: ViolationType;
  /** Human-readable description */
  readonly description: string;
  /** Glob pattern for files to scan */
  readonly glob: string;
  /** Primary regex pattern to match */
  readonly pattern: RegExp;
  /** Glob patterns to exclude */
  readonly excludeGlobs?: ReadonlyArray<string>;
  /** Severity of violations */
  readonly severity: ViolationSeverity;
  /** Suggested fix */
  readonly suggestion: string;
}

/**
 * Layer hygiene detection patterns.
 */
const LAYER_PATTERNS: ReadonlyArray<DetectionPattern> = [
  {
    name: "layer-export-missing-annotation",
    description: "Exported `layer` must have an explicit `Layer.Layer<...>` type annotation",
    glob: "packages/*/server/src/**/*.ts",
    excludeGlobs: ["**/*.test.ts", "**/test/**/*.ts"],
    // Matches only the untyped form: `export const layer = ...`
    pattern: /^export\s+const\s+layer\s*=/,
    severity: "critical",
    suggestion: "Add an explicit type: `export const layer: Layer.Layer<...> = ...`",
  },
  {
    name: "layer-live-missing-annotation",
    description: "Exported Layer value should have an explicit `Layer.Layer<...>` type annotation",
    glob: "packages/*/server/src/**/*.ts",
    excludeGlobs: ["**/*.test.ts", "**/test/**/*.ts"],
    // Common exported layer naming conventions: `FooLive`, `FooLayer`, `FooBundleLive`, etc.
    // Matches only the untyped form: `export const FooLive = ...`
    pattern: /^export\s+const\s+\w+(?:Live|Layer|BundleLive|BundleLayer)\s*=/,
    severity: "warning",
    suggestion: "Add an explicit type: `export const FooLive: Layer.Layer<...> = ...`",
  },
  {
    name: "serviceeffect-missing-annotation",
    description: "`serviceEffect` must have an explicit `Effect.Effect<...>` type annotation",
    glob: "packages/*/server/src/**/*.ts",
    excludeGlobs: ["**/*.test.ts", "**/test/**/*.ts"],
    // Matches only the untyped form: `const serviceEffect = ...`
    pattern: /^const\s+serviceEffect\s*=/,
    severity: "warning",
    suggestion: "Add an explicit type: `const serviceEffect: Effect.Effect<...> = ...`",
  },
];

// -----------------------------------------------------------------------------
// Options Types
// -----------------------------------------------------------------------------

/**
 * Options for Layer verification.
 */
export interface LayerVerifyOptions {
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

  if (filterValue.startsWith("@beep/")) {
    const packagePart = filterValue.slice(6); // Remove "@beep/"

    // Slice wildcard: "@beep/iam-*" -> match "packages/iam/**"
    const sliceWildcard = packagePart.match(/^([a-z0-9]+)-\*$/);
    if (sliceWildcard) {
      return filePath.startsWith(`packages/${sliceWildcard[1]}/`);
    }

    // Exact package match: "@beep/shared-server" -> match "packages/shared/server/**"
    return filePath.includes(packagePart.replaceAll("-", "/"));
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
      const trimmed = Str.trim(line);

      // Avoid flagging patterns in comment-only lines (common in docs/examples).
      if (Str.startsWith("//")(trimmed) || Str.startsWith("/*")(trimmed) || Str.startsWith("*")(trimmed)) {
        return O.none();
      }

      if (!pattern.pattern.test(trimmed)) return O.none();

      return O.some(
        new Violation({
          type: pattern.name,
          severity: pattern.severity,
          filePath,
          line: index + 1,
          message: pattern.description,
          codeSnippet: trimmed,
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
 * Run Layer verification and return violations.
 *
 * @param options - Verification options
 * @returns Effect yielding the violation report
 *
 * @since 0.1.0
 * @category handlers
 */
export const layerHandler = (
  options: LayerVerifyOptions
): Effect.Effect<ViolationReport, GlobError, FileSystem.FileSystem | Path.Path | RepoUtils> =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const repoRoot = repo.REPOSITORY_ROOT;

    // Scan all patterns
    const results = yield* Effect.all(A.map(LAYER_PATTERNS, (p) => scanForPattern(p, repoRoot, options.filter)));

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
  }).pipe(Effect.withSpan("layerHandler"));
