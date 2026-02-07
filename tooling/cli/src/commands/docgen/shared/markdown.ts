/**
 * @file Markdown Generation Utilities
 *
 * Utilities for generating markdown output, particularly the
 * agent-friendly JSDOC_ANALYSIS.md report format.
 *
 * Key exports:
 * - generateAnalysisReport: Create JSDOC_ANALYSIS.md content
 * - formatChecklistItem: Format a single checklist item
 * - groupByPriority: Group exports by priority level
 *
 * @module docgen/shared/markdown
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import type { ExportAnalysis, PackageAnalysis } from "../types.js";

/**
 * Format a single checklist item for the analysis report.
 *
 * @example
 * ```ts
 * import { formatChecklistItem } from "@beep/repo-cli/commands/docgen/shared"
 * import type { ExportAnalysis } from "@beep/repo-cli/commands/docgen/types"
 *
 * const exportAnalysis: ExportAnalysis = {
 *   name: "myFunction",
 *   kind: "function",
 *   filePath: "src/utils.ts",
 *   line: 42,
 *   missingTags: ["@since"],
 *   presentTags: ["@category", "@example"],
 *   priority: "low",
 *   context: "Utility function for data transformation"
 * }
 *
 * const checklistItem = formatChecklistItem(exportAnalysis)
 * console.log(checklistItem)
 * // => - [ ] `src/utils.ts:42` — **myFunction** (function)
 * //      - Missing: @since
 * //      - Has: @category, @example
 * //      - Context: Utility function for data transformation
 * ```
 *
 * @param exp - The export analysis to format
 * @returns Formatted markdown checklist item
 * @category utilities
 * @since 0.1.0
 */
export const formatChecklistItem = (exp: ExportAnalysis): string => {
  const location = `\`${exp.filePath}:${exp.line}\``;
  const missingList = F.pipe(exp.missingTags, A.join(", "));
  const presentList = F.pipe(exp.presentTags, A.join(", "));

  const lines: string[] = [
    `- [ ] ${location} — **${exp.name}** (${exp.kind})`,
    `  - Missing: ${missingList || "none"}`,
  ];

  if (A.length(exp.presentTags) > 0) {
    lines.push(`  - Has: ${presentList}`);
  }

  if (exp.context) {
    lines.push(`  - Context: ${exp.context}`);
  }

  return F.pipe(lines, A.join("\n"));
};

/**
 * Group exports by priority level.
 *
 * @example
 * ```ts
 * import { groupByPriority } from "@beep/repo-cli/commands/docgen/shared"
 * import type { ExportAnalysis } from "@beep/repo-cli/commands/docgen/types"
 * import * as A from "effect/Array"
 *
 * const exports: ReadonlyArray<ExportAnalysis> = [
 *   { name: "foo", kind: "function", filePath: "src/foo.ts", line: 1, missingTags: ["@category", "@example", "@since"], presentTags: [], priority: "high" },
 *   { name: "bar", kind: "function", filePath: "src/bar.ts", line: 10, missingTags: ["@since"], presentTags: ["@category", "@example"], priority: "low" },
 * ]
 *
 * const grouped = groupByPriority(exports)
 * console.log(A.length(grouped.high))  // => 1
 * console.log(A.length(grouped.low))   // => 1
 * ```
 *
 * @param exports - Array of export analyses
 * @returns Object with high, medium, and low priority arrays
 * @category utilities
 * @since 0.1.0
 */
export const groupByPriority = (
  exports: ReadonlyArray<ExportAnalysis>
): {
  readonly high: ReadonlyArray<ExportAnalysis>;
  readonly medium: ReadonlyArray<ExportAnalysis>;
  readonly low: ReadonlyArray<ExportAnalysis>;
} => ({
  high: F.pipe(
    exports,
    A.filter((e) => e.priority === "high")
  ),
  medium: F.pipe(
    exports,
    A.filter((e) => e.priority === "medium")
  ),
  low: F.pipe(
    exports,
    A.filter((e) => e.priority === "low")
  ),
});

/**
 * Generate the full JSDOC_ANALYSIS.md report content.
 *
 * This format is optimized for AI agent consumption with:
 * - Clear instructions and workflow
 * - Prioritized checklists with file:line references
 * - Summary statistics
 * - Verification commands
 *
 * @example
 * ```ts
 * import { generateAnalysisReport } from "@beep/repo-cli/commands/docgen/shared"
 * import type { PackageAnalysis } from "@beep/repo-cli/commands/docgen/types"
 * import * as Str from "effect/String"
 * import * as F from "effect/Function"
 *
 * const analysis: PackageAnalysis = {
 *   packageName: "@beep/my-package",
 *   packagePath: "packages/common/my-package",
 *   timestamp: "2025-01-15T12:00:00Z",
 *   exports: [
 *     { name: "myFunc", kind: "function", filePath: "src/index.ts", line: 10, missingTags: ["@since"], presentTags: ["@category", "@example"], priority: "low" }
 *   ],
 *   summary: {
 *     totalExports: 1,
 *     fullyDocumented: 0,
 *     missingDocumentation: 1,
 *     missingCategory: 0,
 *     missingExample: 0,
 *     missingSince: 1
 *   }
 * }
 *
 * const report = generateAnalysisReport(analysis)
 * const hasHeader = F.pipe(report, Str.includes("# JSDoc Analysis Report"))
 * console.log(hasHeader)  // => true
 * ```
 *
 * @param analysis - The package analysis results
 * @returns Complete markdown document content
 * @category utilities
 * @since 0.1.0
 */
export const generateAnalysisReport = (analysis: PackageAnalysis): string => {
  // Filter to only exports with missing tags
  const exportsWithIssues = F.pipe(
    analysis.exports,
    A.filter((e) => A.length(e.missingTags) > 0)
  );
  const { high, medium, low } = groupByPriority(exportsWithIssues);

  const sections: string[] = [];

  // Header
  sections.push(`# JSDoc Analysis Report: ${analysis.packageName}`);
  sections.push(Str.empty);
  sections.push(`> **Generated**: ${analysis.timestamp}`);
  sections.push(`> **Package**: ${analysis.packagePath}`);
  sections.push(`> **Status**: ${analysis.summary.missingDocumentation} exports need documentation`);
  sections.push(Str.empty);
  sections.push("---");
  sections.push(Str.empty);

  // Instructions
  sections.push("## Instructions for Agent");
  sections.push(Str.empty);
  sections.push("You are tasked with adding missing JSDoc documentation to this package. Follow these rules:");
  sections.push(Str.empty);
  sections.push("1. **Required Tags**: Every public export must have:");
  sections.push('   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")');
  sections.push("   - `@example` - Working TypeScript code example with imports");
  sections.push("   - `@since` - Version when added (use `0.1.0` for new items)");
  sections.push(Str.empty);
  sections.push("2. **Example Format**:");
  sections.push("   ````typescript");
  sections.push("   /**");
  sections.push("    * Brief description of what this does.");
  sections.push("    *");
  sections.push("    * @example");
  sections.push("    * ```typescript");
  sections.push(`    * import { MyThing } from "${analysis.packageName}"`);
  sections.push("    *");
  sections.push('    * const result = MyThing.make({ field: "value" })');
  sections.push("    * console.log(result)");
  sections.push('    * // => { field: "value" }');
  sections.push("    * ```");
  sections.push("    *");
  sections.push("    * @category Constructors");
  sections.push("    * @since 0.1.0");
  sections.push("    */");
  sections.push("   ````");
  sections.push(Str.empty);
  sections.push("3. **Workflow**:");
  sections.push("   - Work through the checklist below in order");
  sections.push("   - Mark items complete by changing `[ ]` to `[x]`");
  sections.push("   - After completing all items, delete this file");
  sections.push(Str.empty);
  sections.push("---");
  sections.push(Str.empty);

  // Progress Checklist
  sections.push("## Progress Checklist");
  sections.push(Str.empty);

  if (A.length(high) > 0) {
    sections.push("### High Priority (Missing all required tags)");
    sections.push(Str.empty);
    F.pipe(
      high,
      A.forEach((e) => {
        sections.push(formatChecklistItem(e));
        sections.push(Str.empty);
      })
    );
  }

  if (A.length(medium) > 0) {
    sections.push("### Medium Priority (Missing some tags)");
    sections.push(Str.empty);
    F.pipe(
      medium,
      A.forEach((e) => {
        sections.push(formatChecklistItem(e));
        sections.push(Str.empty);
      })
    );
  }

  if (A.length(low) > 0) {
    sections.push("### Low Priority (Missing @since only)");
    sections.push(Str.empty);
    F.pipe(
      low,
      A.forEach((e) => {
        sections.push(formatChecklistItem(e));
        sections.push(Str.empty);
      })
    );
  }

  if (A.length(high) === 0 && A.length(medium) === 0 && A.length(low) === 0) {
    sections.push("All exports are fully documented!");
    sections.push(Str.empty);
  }

  // Summary Statistics
  sections.push("---");
  sections.push(Str.empty);
  sections.push("## Summary Statistics");
  sections.push(Str.empty);
  sections.push("| Metric | Count |");
  sections.push("|--------|-------|");
  sections.push(`| Total Exports | ${analysis.summary.totalExports} |`);
  sections.push(`| Fully Documented | ${analysis.summary.fullyDocumented} |`);
  sections.push(`| Missing Documentation | ${analysis.summary.missingDocumentation} |`);
  sections.push(`| Missing @category | ${analysis.summary.missingCategory} |`);
  sections.push(`| Missing @example | ${analysis.summary.missingExample} |`);
  sections.push(`| Missing @since | ${analysis.summary.missingSince} |`);
  sections.push(Str.empty);

  // Verification
  sections.push("---");
  sections.push(Str.empty);
  sections.push("## Verification");
  sections.push(Str.empty);
  sections.push("After completing all documentation, run:");
  sections.push(Str.empty);
  sections.push("```bash");
  sections.push(`beep docgen analyze -p ${analysis.packagePath}`);
  sections.push("```");
  sections.push(Str.empty);
  sections.push("If successful, delete this file. If issues remain, the checklist will be regenerated.");

  return F.pipe(sections, A.join("\n"));
};

/**
 * Generate JSON output for analysis results.
 *
 * @example
 * ```ts
 * import { generateAnalysisJson } from "@beep/repo-cli/commands/docgen/shared"
 * import type { PackageAnalysis } from "@beep/repo-cli/commands/docgen/types"
 *
 * const analysis: PackageAnalysis = {
 *   packageName: "@beep/my-package",
 *   packagePath: "packages/common/my-package",
 *   timestamp: "2025-01-15T12:00:00Z",
 *   exports: [],
 *   summary: {
 *     totalExports: 0,
 *     fullyDocumented: 0,
 *     missingDocumentation: 0,
 *     missingCategory: 0,
 *     missingExample: 0,
 *     missingSince: 0
 *   }
 * }
 *
 * const json = generateAnalysisJson(analysis)
 * console.log(JSON.parse(json).packageName)  // => "@beep/my-package"
 * ```
 *
 * @param analysis - The package analysis results
 * @returns JSON string representation
 * @category utilities
 * @since 0.1.0
 */
export const generateAnalysisJson = (analysis: PackageAnalysis): string => JSON.stringify(analysis, null, 2);
