/**
 * @file CLI Output Formatting Utilities
 *
 * Provides consistent output formatting for all docgen CLI commands.
 * Handles colors, symbols, and structured output.
 *
 * Key exports:
 * - success/error/warning/info: Formatted message functions
 * - formatPackageResult: Format generation result for a package
 * - formatPackageStatus: Format status line for a package
 * - header: Print section header
 * - formatCoverage: Format coverage percentage
 * - symbols: Unicode symbols for status indicators
 *
 * @module docgen/shared/output
 * @since 0.1.0
 */

import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import color from "picocolors";
import type { GenerationResult, PackageInfo } from "../types.js";

/**
 * Unicode symbols for status indicators.
 * Using picocolors for consistent color output.
 *
 * @category models
 * @since 0.1.0
 */
export const symbols = {
  success: color.green("\u2713"),
  error: color.red("\u2717"),
  warning: color.yellow("\u26A0"),
  info: color.blue("\u2139"),
  pending: color.gray("\u25CB"),
  arrow: color.gray("\u2192"),
} as const;

/**
 * Log a success message with green checkmark.
 *
 * @param message - The message to display
 * @returns Effect that logs the message
 * @category utilities
 * @since 0.1.0
 */
export const success = (message: string): Effect.Effect<void> => Console.log(`${symbols.success} ${message}`);

/**
 * Log an error message with red X.
 *
 * @param message - The message to display
 * @returns Effect that logs the message
 * @category utilities
 * @since 0.1.0
 */
export const error = (message: string): Effect.Effect<void> => Console.log(`${symbols.error} ${color.red(message)}`);

/**
 * Log a warning message with yellow warning symbol.
 *
 * @param message - The message to display
 * @returns Effect that logs the message
 * @category utilities
 * @since 0.1.0
 */
export const warning = (message: string): Effect.Effect<void> =>
  Console.log(`${symbols.warning} ${color.yellow(message)}`);

/**
 * Log an info message with blue info symbol.
 *
 * @param message - The message to display
 * @returns Effect that logs the message
 * @category utilities
 * @since 0.1.0
 */
export const info = (message: string): Effect.Effect<void> => Console.log(`${symbols.info} ${message}`);

/**
 * Format a package generation result line.
 *
 * @param result - The generation result
 * @returns Formatted string for display
 * @category utilities
 * @since 0.1.0
 */
export const formatPackageResult = (result: GenerationResult): string => {
  if (result.success) {
    const moduleInfo = result.moduleCount !== undefined ? ` (${result.moduleCount} modules)` : Str.empty;
    return `  ${symbols.success} ${color.cyan(result.packageName)}${moduleInfo}`;
  }
  return `  ${symbols.error} ${color.cyan(result.packageName)}\n    ${symbols.arrow} ${result.error ?? "Unknown error"}`;
};

/**
 * Format package info for status output.
 *
 * @param pkg - The package info
 * @returns Formatted string for display
 * @category utilities
 * @since 0.1.0
 */
export const formatPackageStatus = (pkg: PackageInfo): string => {
  const symbol =
    pkg.status === "configured-and-generated"
      ? symbols.success
      : pkg.status === "configured-not-generated"
        ? symbols.warning
        : symbols.pending;

  const name = color.cyan(pkg.name.padEnd(30));
  const path = color.gray(pkg.relativePath);

  return `  ${symbol} ${name} ${path}`;
};

/**
 * Print a section header with underline.
 *
 * @param title - The header title
 * @returns Effect that logs the header
 * @category utilities
 * @since 0.1.0
 */
export const header = (title: string): Effect.Effect<void> =>
  Console.log(`\n${color.bold(title)}\n${"=".repeat(Str.length(title))}`);

/**
 * Format coverage percentage with color coding.
 *
 * - Green: >= 50%
 * - Yellow: >= 25%
 * - Red: < 25%
 *
 * @param configured - Number of configured packages
 * @param total - Total number of packages
 * @returns Colored percentage string
 * @category utilities
 * @since 0.1.0
 */
export const formatCoverage = (configured: number, total: number): string => {
  const percentage = total > 0 ? Math.round((configured / total) * 100) : 0;
  const colorFn = percentage >= 50 ? color.green : percentage >= 25 ? color.yellow : color.red;
  return colorFn(`${configured}/${total} packages (${percentage}%)`);
};

/**
 * Print a blank line.
 *
 * @returns Effect that logs empty line
 * @category utilities
 * @since 0.1.0
 */
export const blank = (): Effect.Effect<void> => Console.log(Str.empty);

/**
 * Print a horizontal divider.
 *
 * @returns Effect that logs divider
 * @category utilities
 * @since 0.1.0
 */
export const divider = (): Effect.Effect<void> => Console.log(color.gray("-".repeat(60)));

/**
 * Format a key-value pair for display.
 *
 * @param key - The label
 * @param value - The value
 * @returns Formatted string
 * @category utilities
 * @since 0.1.0
 */
export const keyValue = (key: string, value: string): string => `${color.gray(key)}: ${value}`;

/**
 * Print a list of items with bullets.
 *
 * @param items - Items to display
 * @returns Effect that logs the list
 * @category utilities
 * @since 0.1.0
 */
export const bulletList = (items: ReadonlyArray<string>): Effect.Effect<void> =>
  Effect.forEach(items, (item) => Console.log(`  ${color.gray("\u2022")} ${item}`), {
    discard: true,
  });

/**
 * Format dry-run indicator.
 *
 * @returns Colored dry-run tag
 * @category utilities
 * @since 0.1.0
 */
export const dryRunTag = (): string => color.yellow("[DRY RUN]");

/**
 * Format a path for display (cyan colored).
 *
 * @param path - The path to format
 * @returns Colored path string
 * @category utilities
 * @since 0.1.0
 */
export const formatPath = (path: string): string => color.cyan(path);

/**
 * Format a count with appropriate color.
 *
 * @param count - The count value
 * @param threshold - Value below which to show red
 * @returns Colored count string
 * @category utilities
 * @since 0.1.0
 */
export const formatCount = (count: number, threshold = 0): string => {
  const colorFn = count <= threshold ? color.red : color.green;
  return colorFn(String(count));
};
