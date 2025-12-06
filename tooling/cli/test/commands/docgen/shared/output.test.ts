/**
 * @file Unit tests for CLI output formatting utilities.
 * @module docgen/shared/output.test
 */

import {
  dryRunTag,
  formatCount,
  formatCoverage,
  formatPackageResult,
  formatPackageStatus,
  formatPath,
  keyValue,
  symbols,
} from "@beep/repo-cli/commands/docgen/shared/output";
import type { GenerationResult, PackageInfo } from "@beep/repo-cli/commands/docgen/types";
import { describe, expect, it } from "@beep/testkit";
import * as F from "effect/Function";
import * as Str from "effect/String";

describe("output utilities", () => {
  describe("symbols", () => {
    it("has success symbol", () => {
      expect(symbols.success).toBeDefined();
      expect(Str.isNonEmpty(symbols.success)).toBe(true);
    });

    it("has error symbol", () => {
      expect(symbols.error).toBeDefined();
      expect(Str.isNonEmpty(symbols.error)).toBe(true);
    });

    it("has warning symbol", () => {
      expect(symbols.warning).toBeDefined();
      expect(Str.isNonEmpty(symbols.warning)).toBe(true);
    });

    it("has info symbol", () => {
      expect(symbols.info).toBeDefined();
      expect(Str.isNonEmpty(symbols.info)).toBe(true);
    });

    it("has pending symbol", () => {
      expect(symbols.pending).toBeDefined();
      expect(Str.isNonEmpty(symbols.pending)).toBe(true);
    });

    it("has arrow symbol", () => {
      expect(symbols.arrow).toBeDefined();
      expect(Str.isNonEmpty(symbols.arrow)).toBe(true);
    });
  });

  describe("formatPackageResult", () => {
    it("formats successful result", () => {
      const result: GenerationResult = {
        packageName: "@beep/test",
        packagePath: "packages/test",
        success: true,
        moduleCount: 5,
      };
      const formatted = formatPackageResult(result);
      expect(F.pipe(formatted, Str.includes("@beep/test"))).toBe(true);
      expect(F.pipe(formatted, Str.includes("5 modules"))).toBe(true);
    });

    it("formats successful result without module count", () => {
      const result: GenerationResult = {
        packageName: "@beep/test",
        packagePath: "packages/test",
        success: true,
      };
      const formatted = formatPackageResult(result);
      expect(F.pipe(formatted, Str.includes("@beep/test"))).toBe(true);
    });

    it("formats failed result with error", () => {
      const result: GenerationResult = {
        packageName: "@beep/failed",
        packagePath: "packages/failed",
        success: false,
        error: "Configuration error",
      };
      const formatted = formatPackageResult(result);
      expect(F.pipe(formatted, Str.includes("@beep/failed"))).toBe(true);
      expect(F.pipe(formatted, Str.includes("Configuration error"))).toBe(true);
    });

    it("formats failed result without error", () => {
      const result: GenerationResult = {
        packageName: "@beep/failed",
        packagePath: "packages/failed",
        success: false,
      };
      const formatted = formatPackageResult(result);
      expect(F.pipe(formatted, Str.includes("@beep/failed"))).toBe(true);
      expect(F.pipe(formatted, Str.includes("Unknown error"))).toBe(true);
    });
  });

  describe("formatPackageStatus", () => {
    it("formats configured-and-generated status", () => {
      const pkg: PackageInfo = {
        name: "@beep/complete",
        relativePath: "packages/test",
        absolutePath: "/path/to/packages/test",
        hasDocgenConfig: true,
        hasGeneratedDocs: true,
        status: "configured-and-generated",
      };
      const formatted = formatPackageStatus(pkg);
      expect(F.pipe(formatted, Str.includes("@beep/complete"))).toBe(true);
      expect(F.pipe(formatted, Str.includes("packages/test"))).toBe(true);
    });

    it("formats configured-not-generated status", () => {
      const pkg: PackageInfo = {
        name: "@beep/pending",
        relativePath: "packages/pending",
        absolutePath: "/path/to/packages/pending",
        hasDocgenConfig: true,
        hasGeneratedDocs: false,
        status: "configured-not-generated",
      };
      const formatted = formatPackageStatus(pkg);
      expect(F.pipe(formatted, Str.includes("@beep/pending"))).toBe(true);
    });

    it("formats not-configured status", () => {
      const pkg: PackageInfo = {
        name: "@beep/unconfigured",
        relativePath: "packages/unconfigured",
        absolutePath: "/path/to/packages/unconfigured",
        hasDocgenConfig: false,
        hasGeneratedDocs: false,
        status: "not-configured",
      };
      const formatted = formatPackageStatus(pkg);
      expect(F.pipe(formatted, Str.includes("@beep/unconfigured"))).toBe(true);
    });
  });

  describe("formatCoverage", () => {
    it("formats high coverage (>= 50%)", () => {
      const result = formatCoverage(8, 10);
      expect(F.pipe(result, Str.includes("8/10"))).toBe(true);
      expect(F.pipe(result, Str.includes("80%"))).toBe(true);
    });

    it("formats medium coverage (>= 25%)", () => {
      const result = formatCoverage(3, 10);
      expect(F.pipe(result, Str.includes("3/10"))).toBe(true);
      expect(F.pipe(result, Str.includes("30%"))).toBe(true);
    });

    it("formats low coverage (< 25%)", () => {
      const result = formatCoverage(1, 10);
      expect(F.pipe(result, Str.includes("1/10"))).toBe(true);
      expect(F.pipe(result, Str.includes("10%"))).toBe(true);
    });

    it("handles zero total", () => {
      const result = formatCoverage(0, 0);
      expect(F.pipe(result, Str.includes("0/0"))).toBe(true);
      expect(F.pipe(result, Str.includes("0%"))).toBe(true);
    });

    it("handles 100% coverage", () => {
      const result = formatCoverage(5, 5);
      expect(F.pipe(result, Str.includes("5/5"))).toBe(true);
      expect(F.pipe(result, Str.includes("100%"))).toBe(true);
    });
  });

  describe("keyValue", () => {
    it("formats key-value pair", () => {
      const result = keyValue("Name", "TestPackage");
      expect(F.pipe(result, Str.includes("Name"))).toBe(true);
      expect(F.pipe(result, Str.includes("TestPackage"))).toBe(true);
      expect(F.pipe(result, Str.includes(":"))).toBe(true);
    });

    it("handles empty value", () => {
      const result = keyValue("Key", "");
      expect(F.pipe(result, Str.includes("Key"))).toBe(true);
      expect(F.pipe(result, Str.includes(":"))).toBe(true);
    });
  });

  describe("dryRunTag", () => {
    it("returns dry run indicator", () => {
      const tag = dryRunTag();
      expect(F.pipe(tag, Str.includes("DRY RUN"))).toBe(true);
    });
  });

  describe("formatPath", () => {
    it("formats path string", () => {
      const result = formatPath("/path/to/file.ts");
      expect(Str.isNonEmpty(result)).toBe(true);
    });

    it("handles empty path", () => {
      const result = formatPath("");
      expect(typeof result).toBe("string");
    });
  });

  describe("formatCount", () => {
    it("formats count above threshold", () => {
      const result = formatCount(5, 0);
      expect(F.pipe(result, Str.includes("5"))).toBe(true);
    });

    it("formats count at threshold", () => {
      const result = formatCount(0, 0);
      expect(F.pipe(result, Str.includes("0"))).toBe(true);
    });

    it("formats count below threshold", () => {
      const result = formatCount(0, 1);
      expect(F.pipe(result, Str.includes("0"))).toBe(true);
    });

    it("uses default threshold of 0", () => {
      const result = formatCount(1);
      expect(F.pipe(result, Str.includes("1"))).toBe(true);
    });
  });
});
