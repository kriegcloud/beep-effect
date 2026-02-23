/**
 * @file Unit tests for markdown generation utilities.
 * @module docgen/shared/markdown.test
 */

import {
  formatChecklistItem,
  generateAnalysisJson,
  generateAnalysisReport,
  groupByPriority,
} from "@beep/repo-cli/commands/docgen/shared/markdown";
import type { ExportAnalysis, PackageAnalysis } from "@beep/repo-cli/commands/docgen/types";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";

describe("markdown utilities", () => {
  describe("formatChecklistItem", () => {
    it("formats export with missing tags", () => {
      const exp: ExportAnalysis = {
        name: "myFunction",
        kind: "function",
        filePath: "src/index.ts",
        line: 10,
        presentTags: [],
        missingTags: ["@category", "@example", "@since"],
        hasJsDoc: false,
        priority: "high",
        insertionLine: 10,
        declarationSource: "export function myFunction() {}",
      };

      const result = formatChecklistItem(exp);
      expect(F.pipe(result, Str.includes("[ ]"))).toBe(true);
      expect(F.pipe(result, Str.includes("`src/index.ts:10`"))).toBe(true);
      expect(F.pipe(result, Str.includes("**myFunction**"))).toBe(true);
      expect(F.pipe(result, Str.includes("(function)"))).toBe(true);
      expect(F.pipe(result, Str.includes("Missing: @category, @example, @since"))).toBe(true);
    });

    it("formats export with present tags", () => {
      const exp: ExportAnalysis = {
        name: "partialDoc",
        kind: "const",
        filePath: "src/utils.ts",
        line: 20,
        presentTags: ["@category", "@since"],
        missingTags: ["@example"],
        hasJsDoc: true,
        priority: "medium",
        insertionLine: 18,
        declarationSource: "export const partialDoc = 1;",
      };

      const result = formatChecklistItem(exp);
      expect(F.pipe(result, Str.includes("Has: @category, @since"))).toBe(true);
      expect(F.pipe(result, Str.includes("Missing: @example"))).toBe(true);
    });

    it("formats export with context", () => {
      const exp: ExportAnalysis = {
        name: "withContext",
        kind: "type",
        filePath: "src/types.ts",
        line: 5,
        presentTags: [],
        missingTags: ["@category"],
        hasJsDoc: true,
        context: "A user type definition",
        priority: "medium",
        insertionLine: 3,
        declarationSource: "export type withContext = string;",
      };

      const result = formatChecklistItem(exp);
      expect(F.pipe(result, Str.includes("Context: A user type definition"))).toBe(true);
    });

    it("formats export with no missing tags", () => {
      const exp: ExportAnalysis = {
        name: "fullyDocumented",
        kind: "interface",
        filePath: "src/models.ts",
        line: 15,
        presentTags: ["@category", "@example", "@since"],
        missingTags: [],
        hasJsDoc: true,
        priority: "low",
        insertionLine: 10,
        declarationSource: "export interface fullyDocumented {}",
      };

      const result = formatChecklistItem(exp);
      expect(F.pipe(result, Str.includes("Missing: none"))).toBe(true);
    });
  });

  describe("groupByPriority", () => {
    const createExport = (name: string, priority: "high" | "medium" | "low"): ExportAnalysis => ({
      name,
      kind: "const",
      filePath: "src/index.ts",
      line: 1,
      presentTags: [],
      missingTags:
        priority === "high" ? ["@category", "@example", "@since"] : priority === "medium" ? ["@example"] : [],
      hasJsDoc: priority !== "high",
      priority,
      insertionLine: 1,
      declarationSource: `export const ${name} = 1;`,
    });

    it("groups exports by priority", () => {
      const exports = [
        createExport("high1", "high"),
        createExport("high2", "high"),
        createExport("medium1", "medium"),
        createExport("low1", "low"),
        createExport("low2", "low"),
        createExport("low3", "low"),
      ];

      const result = groupByPriority(exports);
      expect(A.length(result.high)).toBe(2);
      expect(A.length(result.medium)).toBe(1);
      expect(A.length(result.low)).toBe(3);
    });

    it("handles empty exports", () => {
      const result = groupByPriority([]);
      expect(A.length(result.high)).toBe(0);
      expect(A.length(result.medium)).toBe(0);
      expect(A.length(result.low)).toBe(0);
    });

    it("handles all high priority", () => {
      const exports = [createExport("h1", "high"), createExport("h2", "high")];
      const result = groupByPriority(exports);
      expect(A.length(result.high)).toBe(2);
      expect(A.length(result.medium)).toBe(0);
      expect(A.length(result.low)).toBe(0);
    });

    it("handles all medium priority", () => {
      const exports = [createExport("m1", "medium"), createExport("m2", "medium")];
      const result = groupByPriority(exports);
      expect(A.length(result.high)).toBe(0);
      expect(A.length(result.medium)).toBe(2);
      expect(A.length(result.low)).toBe(0);
    });

    it("handles all low priority", () => {
      const exports = [createExport("l1", "low"), createExport("l2", "low")];
      const result = groupByPriority(exports);
      expect(A.length(result.high)).toBe(0);
      expect(A.length(result.medium)).toBe(0);
      expect(A.length(result.low)).toBe(2);
    });
  });

  describe("generateAnalysisReport", () => {
    const createAnalysis = (exports: ReadonlyArray<ExportAnalysis>, packageName = "@beep/test"): PackageAnalysis => ({
      packageName,
      packagePath: "/path/to/test",
      timestamp: "2025-01-01T00:00:00Z",
      exports,
      summary: {
        totalExports: A.length(exports),
        fullyDocumented: A.length(A.filter(exports, (e) => A.length(e.missingTags) === 0)),
        missingDocumentation: A.length(A.filter(exports, (e) => A.length(e.missingTags) > 0)),
        missingCategory: A.length(A.filter(exports, (e) => A.contains(e.missingTags, "@category"))),
        missingExample: A.length(A.filter(exports, (e) => A.contains(e.missingTags, "@example"))),
        missingSince: A.length(A.filter(exports, (e) => A.contains(e.missingTags, "@since"))),
      },
    });

    it("generates report header", () => {
      const analysis = createAnalysis([]);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("# JSDoc Analysis Report: @beep/test"))).toBe(true);
      expect(F.pipe(report, Str.includes("**Generated**:"))).toBe(true);
      expect(F.pipe(report, Str.includes("**Package**:"))).toBe(true);
    });

    it("generates instructions section", () => {
      const analysis = createAnalysis([]);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("## Instructions for Agent"))).toBe(true);
      expect(F.pipe(report, Str.includes("@category"))).toBe(true);
      expect(F.pipe(report, Str.includes("@example"))).toBe(true);
      expect(F.pipe(report, Str.includes("@since"))).toBe(true);
    });

    it("generates progress checklist with high priority", () => {
      const exports: ReadonlyArray<ExportAnalysis> = [
        {
          name: "highPriority",
          kind: "function",
          filePath: "src/index.ts",
          line: 1,
          presentTags: [],
          missingTags: ["@category", "@example", "@since"],
          hasJsDoc: false,
          priority: "high",
          insertionLine: 1,
          declarationSource: "export function highPriority() {}",
        },
      ];
      const analysis = createAnalysis(exports);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("### High Priority"))).toBe(true);
      expect(F.pipe(report, Str.includes("highPriority"))).toBe(true);
    });

    it("generates progress checklist with medium priority", () => {
      const exports: ReadonlyArray<ExportAnalysis> = [
        {
          name: "mediumPriority",
          kind: "const",
          filePath: "src/index.ts",
          line: 1,
          presentTags: ["@category"],
          missingTags: ["@example", "@since"],
          hasJsDoc: true,
          priority: "medium",
          insertionLine: 1,
          declarationSource: "export const mediumPriority = 1;",
        },
      ];
      const analysis = createAnalysis(exports);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("### Medium Priority"))).toBe(true);
      expect(F.pipe(report, Str.includes("mediumPriority"))).toBe(true);
    });

    it("generates progress checklist with low priority", () => {
      const exports: ReadonlyArray<ExportAnalysis> = [
        {
          name: "lowPriority",
          kind: "type",
          filePath: "src/index.ts",
          line: 1,
          presentTags: ["@category", "@example"],
          missingTags: ["@since"],
          hasJsDoc: true,
          priority: "low",
          insertionLine: 1,
          declarationSource: "export type lowPriority = string;",
        },
      ];
      const analysis = createAnalysis(exports);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("### Low Priority"))).toBe(true);
      expect(F.pipe(report, Str.includes("lowPriority"))).toBe(true);
    });

    it("shows fully documented message when no issues", () => {
      const exports: ReadonlyArray<ExportAnalysis> = [
        {
          name: "fullyDoc",
          kind: "const",
          filePath: "src/index.ts",
          line: 1,
          presentTags: ["@category", "@example", "@since"],
          missingTags: [],
          hasJsDoc: true,
          priority: "low",
          insertionLine: 1,
          declarationSource: "export const fullyDoc = 1;",
        },
      ];
      const analysis = createAnalysis(exports);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("All exports are fully documented!"))).toBe(true);
    });

    it("generates summary statistics table", () => {
      const exports: ReadonlyArray<ExportAnalysis> = [
        {
          name: "exp1",
          kind: "function",
          filePath: "src/index.ts",
          line: 1,
          presentTags: [],
          missingTags: ["@category", "@example", "@since"],
          hasJsDoc: false,
          priority: "high",
          insertionLine: 1,
          declarationSource: "export function exp1() {}",
        },
      ];
      const analysis = createAnalysis(exports);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("## Summary Statistics"))).toBe(true);
      expect(F.pipe(report, Str.includes("| Metric | Count |"))).toBe(true);
      expect(F.pipe(report, Str.includes("| Total Exports |"))).toBe(true);
      expect(F.pipe(report, Str.includes("| Fully Documented |"))).toBe(true);
      expect(F.pipe(report, Str.includes("| Missing Documentation |"))).toBe(true);
    });

    it("generates verification section", () => {
      const analysis = createAnalysis([]);
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes("## Verification"))).toBe(true);
      expect(F.pipe(report, Str.includes("beep docgen analyze"))).toBe(true);
    });

    it("includes package name in example imports", () => {
      const analysis = createAnalysis([], "@beep/custom-pkg");
      const report = generateAnalysisReport(analysis);
      expect(F.pipe(report, Str.includes(`"@beep/custom-pkg"`))).toBe(true);
    });
  });

  describe("generateAnalysisJson", () => {
    it("generates valid JSON", () => {
      const analysis: PackageAnalysis = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        timestamp: "2025-01-01T00:00:00Z",
        exports: [
          {
            name: "testExport",
            kind: "const",
            filePath: "src/index.ts",
            line: 1,
            presentTags: [],
            missingTags: ["@category"],
            hasJsDoc: false,
            priority: "medium",
            insertionLine: 1,
            declarationSource: "export const testExport = 1;",
          },
        ],
        summary: {
          totalExports: 1,
          fullyDocumented: 0,
          missingDocumentation: 1,
          missingCategory: 1,
          missingExample: 0,
          missingSince: 0,
        },
      };

      const json = generateAnalysisJson(analysis);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("includes all analysis fields", () => {
      const analysis: PackageAnalysis = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        timestamp: "2025-01-01T00:00:00Z",
        exports: [],
        summary: {
          totalExports: 0,
          fullyDocumented: 0,
          missingDocumentation: 0,
          missingCategory: 0,
          missingExample: 0,
          missingSince: 0,
        },
      };

      const json = generateAnalysisJson(analysis);
      const parsed = JSON.parse(json);
      expect(parsed.packageName).toBe("@beep/test");
      expect(parsed.packagePath).toBe("/path/to/test");
      expect(parsed.timestamp).toBe("2025-01-01T00:00:00Z");
      expect(parsed.exports).toBeDefined();
      expect(parsed.summary).toBeDefined();
    });

    it("formats JSON with indentation", () => {
      const analysis: PackageAnalysis = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        timestamp: "2025-01-01T00:00:00Z",
        exports: [],
        summary: {
          totalExports: 0,
          fullyDocumented: 0,
          missingDocumentation: 0,
          missingCategory: 0,
          missingExample: 0,
          missingSince: 0,
        },
      };

      const json = generateAnalysisJson(analysis);
      expect(F.pipe(json, Str.includes("\n"))).toBe(true);
      expect(F.pipe(json, Str.includes("  "))).toBe(true);
    });
  });
});
