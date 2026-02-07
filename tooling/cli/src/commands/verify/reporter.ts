/**
 * @file Violation Reporter
 *
 * Formats and outputs violation reports in various formats:
 * - table: Human-readable tabular format
 * - json: Machine-readable JSON
 * - summary: Condensed summary counts
 *
 * @module verify/reporter
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as R from "effect/Record";
import * as Str from "effect/String";
import pc from "picocolors";
import type { OutputFormat } from "./options.js";
import type { Violation, ViolationReport } from "./schemas.js";

// -----------------------------------------------------------------------------
// Table Formatting
// -----------------------------------------------------------------------------

/**
 * Truncate a string to a maximum length, adding ellipsis if needed.
 */
const truncate = (str: string, maxLen: number): string =>
  Str.length(str) > maxLen ? `${F.pipe(str, Str.slice(0, maxLen - 1))}\u2026` : str;

/**
 * Pad a string to a minimum length.
 */
const padEnd = (str: string, len: number): string => str.padEnd(len);

/**
 * Format severity with color.
 */
const formatSeverity = (severity: string): string =>
  severity === "critical" ? pc.red(padEnd(severity, 8)) : pc.yellow(padEnd(severity, 8));

/**
 * Format violation type for display.
 */
const formatType = (type: string): string => padEnd(type, 16);

/**
 * Format a single violation as a table row.
 */
const formatViolationRow = (violation: Violation): string => {
  const parts = [
    formatSeverity(violation.severity),
    formatType(violation.type),
    padEnd(truncate(violation.filePath, 45), 46),
    padEnd(String(violation.line), 5),
    truncate(violation.message, 30),
  ];
  return parts.join(" \u2502 ");
};

/**
 * Format the table header.
 */
const formatTableHeader = (): string => {
  const header = [
    padEnd("Severity", 8),
    padEnd("Type", 16),
    padEnd("File", 46),
    padEnd("Line", 5),
    padEnd("Message", 30),
  ].join(" \u2502 ");

  const separator = [
    "\u2500".repeat(8),
    "\u2500".repeat(16),
    "\u2500".repeat(46),
    "\u2500".repeat(5),
    "\u2500".repeat(30),
  ].join("\u2500\u253c\u2500");

  return `${pc.bold(header)}\n${separator}`;
};

/**
 * Format report as a table.
 */
const formatAsTable = (report: ViolationReport): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log(pc.bold("\nVerification Report"));
    yield* Console.log("\u2550".repeat(50));
    yield* Console.log("");

    if (A.length(report.violations) === 0) {
      yield* Console.log(pc.green("\u2713 No violations found"));
    } else {
      yield* Console.log(formatTableHeader());
      for (const violation of report.violations) {
        yield* Console.log(formatViolationRow(violation));
      }
    }

    yield* Console.log("");
    yield* formatSummaryLine(report);
  });

// -----------------------------------------------------------------------------
// JSON Formatting
// -----------------------------------------------------------------------------

/**
 * Format report as JSON.
 */
const formatAsJson = (report: ViolationReport): Effect.Effect<void> =>
  Effect.gen(function* () {
    const jsonOutput = {
      violations: report.violations.map((v) => ({
        type: v.type,
        severity: v.severity,
        filePath: v.filePath,
        line: v.line,
        column: v.column,
        message: v.message,
        codeSnippet: v.codeSnippet,
        suggestion: v.suggestion,
      })),
      summary: {
        total: report.summary.total,
        critical: report.summary.critical,
        warning: report.summary.warning,
        byType: report.summary.byType,
      },
      scannedPackages: report.scannedPackages,
      scannedFiles: report.scannedFiles,
    };

    yield* Console.log(JSON.stringify(jsonOutput, null, 2));
  });

// -----------------------------------------------------------------------------
// Summary Formatting
// -----------------------------------------------------------------------------

/**
 * Format a summary line.
 */
const formatSummaryLine = (report: ViolationReport): Effect.Effect<void> =>
  Effect.gen(function* () {
    const { summary } = report;

    if (summary.total === 0) {
      yield* Console.log(pc.green(`\u2713 No violations found (scanned ${report.scannedFiles} files)`));
      return;
    }

    const criticalText = summary.critical > 0 ? pc.red(`${summary.critical} critical`) : "0 critical";
    const warningText = summary.warning > 0 ? pc.yellow(`${summary.warning} warning`) : "0 warning";

    yield* Console.log(
      `Summary: ${summary.total} violations (${criticalText}, ${warningText}) across ${report.scannedFiles} files`
    );
  });

/**
 * Format report as summary only.
 */
const formatAsSummary = (report: ViolationReport): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Console.log(pc.bold("\nVerification Summary"));
    yield* Console.log("\u2550".repeat(50));
    yield* Console.log("");

    // Group by type category
    const entityIdTypes = ["entityid-domain", "entityid-client", "entityid-table"];
    const patternTypes = ["native-set", "native-map", "native-error", "native-date"];

    // EntityId violations
    const hasEntityIdViolations = F.pipe(
      entityIdTypes,
      A.some((t) => R.has(report.summary.byType, t))
    );

    if (hasEntityIdViolations) {
      yield* Console.log(pc.bold("EntityId Violations:"));
      for (const type of entityIdTypes) {
        const count = R.get(report.summary.byType, type);
        if (count._tag === "Some") {
          const icon = count.value > 0 ? pc.red("\u2717") : pc.green("\u2713");
          const label = F.pipe(type, Str.replace("entityid-", ""));
          yield* Console.log(`  ${icon} ${label}: ${count.value} violations`);
        }
      }
      yield* Console.log("");
    }

    // Pattern violations
    const hasPatternViolations = F.pipe(
      patternTypes,
      A.some((t) => R.has(report.summary.byType, t))
    );

    if (hasPatternViolations) {
      yield* Console.log(pc.bold("Effect Pattern Violations:"));
      for (const type of patternTypes) {
        const count = R.get(report.summary.byType, type);
        if (count._tag === "Some") {
          const isWarning = type === "native-date";
          const icon = count.value > 0 ? (isWarning ? pc.yellow("\u26a0") : pc.red("\u2717")) : pc.green("\u2713");
          const label = F.pipe(type, Str.replace("native-", "Native "));
          const suffix = isWarning && count.value > 0 ? " (warning)" : "";
          yield* Console.log(`  ${icon} ${label}: ${count.value} violations${suffix}`);
        }
      }
      yield* Console.log("");
    }

    // Total summary
    yield* formatSummaryLine(report);
  });

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * Format and output a violation report.
 *
 * @param report - The violation report to format
 * @param format - Output format (table, json, or summary)
 * @returns Effect that outputs the formatted report
 *
 * @since 0.1.0
 * @category formatters
 */

export const formatReport = (report: ViolationReport, format: OutputFormat): Effect.Effect<void> =>
  Match.value(format).pipe(
    Match.when("table", () => formatAsTable(report)),
    Match.when("json", () => formatAsJson(report)),
    Match.when("summary", () => formatAsSummary(report)),
    Match.exhaustive
  );
