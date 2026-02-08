/**
 * @file Verify Command Schemas
 *
 * Defines Effect Schema types for verification violations and reports.
 * Provides type-safe structures for capturing and reporting code quality
 * violations found during verification.
 *
 * @module verify/schemas
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Violation Types
// -----------------------------------------------------------------------------

/**
 * Types of violations that can be detected.
 *
 * @since 0.1.0
 * @category schemas
 */
export const ViolationType = S.Literal(
  "entityid-domain",
  "entityid-client",
  "entityid-table",
  "native-set",
  "native-map",
  "native-error",
  "native-date",
  "node-fs",
  "node-fs-promises",
  "node-path",
  "async-await",
  "promise-usage",
  "unsafe-cast",
  "direct-json"
);

/**
 * Type for violation types.
 *
 * @since 0.1.0
 * @category models
 */
export type ViolationType = S.Schema.Type<typeof ViolationType>;

/**
 * Severity levels for violations.
 *
 * @since 0.1.0
 * @category schemas
 */
export const ViolationSeverity = S.Literal("critical", "warning");

/**
 * Type for violation severity.
 *
 * @since 0.1.0
 * @category models
 */
export type ViolationSeverity = S.Schema.Type<typeof ViolationSeverity>;

// -----------------------------------------------------------------------------
// Violation
// -----------------------------------------------------------------------------

/**
 * Schema for a single code violation.
 *
 * Captures all relevant information about a detected violation including
 * location, type, severity, and suggested remediation.
 *
 * @example
 * ```ts
 * const violation = new Violation({
 *   type: "entityid-client",
 *   severity: "critical",
 *   filePath: "packages/iam/client/src/member.schema.ts",
 *   line: 42,
 *   message: "Plain S.String ID in client schema",
 *   codeSnippet: "id: S.String,",
 *   suggestion: "Use EntityId from @beep/shared-domain",
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class Violation extends S.Class<Violation>("Violation")({
  /** Type of the violation */
  type: ViolationType,
  /** Severity level */
  severity: ViolationSeverity,
  /** Path to the file containing the violation */
  filePath: S.String,
  /** Line number where the violation occurs (1-based) */
  line: S.Number,
  /** Column number where the violation occurs (optional, 1-based) */
  column: S.optional(S.Number),
  /** Human-readable description of the violation */
  message: S.String,
  /** The code snippet containing the violation */
  codeSnippet: S.optional(S.String),
  /** Suggested fix for the violation */
  suggestion: S.optional(S.String),
}) {}

// -----------------------------------------------------------------------------
// Violation Report
// -----------------------------------------------------------------------------

/**
 * Summary statistics for a violation report.
 *
 * @since 0.1.0
 * @category schemas
 */
export class ViolationSummary extends S.Class<ViolationSummary>("ViolationSummary")({
  /** Total number of violations */
  total: S.Number,
  /** Number of critical violations */
  critical: S.Number,
  /** Number of warning violations */
  warning: S.Number,
  /** Violations grouped by type */
  byType: S.Record({ key: S.String, value: S.Number }),
}) {}

/**
 * Complete violation report with all violations and summary statistics.
 *
 * @example
 * ```ts
 * const report = new ViolationReport({
 *   violations: [violation1, violation2],
 *   summary: new ViolationSummary({
 *     total: 2,
 *     critical: 1,
 *     warning: 1,
 *     byType: { "entityid-client": 1, "native-date": 1 },
 *   }),
 *   scannedPackages: ["@beep/iam-client"],
 *   scannedFiles: 25,
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class ViolationReport extends S.Class<ViolationReport>("ViolationReport")({
  /** All violations found */
  violations: S.Array(Violation),
  /** Summary statistics */
  summary: ViolationSummary,
  /** Packages that were scanned */
  scannedPackages: S.Array(S.String),
  /** Total number of files scanned */
  scannedFiles: S.Number,
}) {}

// -----------------------------------------------------------------------------
// Report Builder
// -----------------------------------------------------------------------------

/**
 * Creates a ViolationSummary from a list of violations.
 *
 * @param violations - Array of violations to summarize
 * @returns Summary with counts by type and severity
 *
 * @since 0.1.0
 * @category constructors
 */
export const createSummary = (violations: ReadonlyArray<Violation>): ViolationSummary => {
  const critical = F.pipe(
    violations,
    A.filter((v) => v.severity === "critical"),
    A.length
  );

  const warning = F.pipe(
    violations,
    A.filter((v) => v.severity === "warning"),
    A.length
  );

  const byType = F.pipe(
    violations,
    A.groupBy((v) => v.type),
    R.map((group) => A.length(group))
  );

  return new ViolationSummary({
    total: A.length(violations),
    critical,
    warning,
    byType,
  });
};

/**
 * Creates a ViolationReport from violations and scan metadata.
 *
 * @param violations - Array of violations found
 * @param scannedPackages - Packages that were scanned
 * @param scannedFiles - Number of files scanned
 * @returns Complete violation report
 *
 * @since 0.1.0
 * @category constructors
 */
export const createReport = (
  violations: ReadonlyArray<Violation>,
  scannedPackages: ReadonlyArray<string>,
  scannedFiles: number
): ViolationReport =>
  new ViolationReport({
    violations: A.fromIterable(violations),
    summary: createSummary(violations),
    scannedPackages: A.fromIterable(scannedPackages),
    scannedFiles,
  });
