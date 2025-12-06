/**
 * @file Unit tests for agent schemas.
 * @module docgen/agents/schemas.test
 */

import {
  AICallResult,
  AnalysisResult,
  ConfigResult,
  DocgenWorkflowPayload,
  DocgenWorkflowResult,
  FileToFix,
  PackageFixResultSchema,
  ReadFileResult,
  TokenUsageSchema,
  ValidationResult,
  WriteResult,
} from "@beep/repo-cli/commands/docgen/agents/schemas";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as S from "effect/Schema";

describe("agent schemas", () => {
  describe("DocgenWorkflowPayload", () => {
    it("decodes valid payload", () => {
      const input = {
        packagePaths: ["packages/common/identity"],
        dryRun: false,
        model: "claude-sonnet-4-20250514",
        maxIterations: 20,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes payload with multiple packages", () => {
      const input = {
        packagePaths: ["packages/common/identity", "packages/common/schema", "packages/iam/domain"],
        dryRun: true,
        model: "claude-opus-4-20250514",
        maxIterations: 10,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.packagePaths)).toBe(3);
        expect(result.right.dryRun).toBe(true);
      }
    });

    it("decodes payload with empty package paths", () => {
      const input = {
        packagePaths: [],
        dryRun: false,
        model: "claude-sonnet-4-20250514",
        maxIterations: 20,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("fails on missing required fields", () => {
      const input = {
        packagePaths: ["packages/test"],
        // missing dryRun, model, maxIterations
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("fails on invalid packagePaths type", () => {
      const input = {
        packagePaths: "not-an-array",
        dryRun: false,
        model: "claude-sonnet-4-20250514",
        maxIterations: 20,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("fails on non-boolean dryRun", () => {
      const input = {
        packagePaths: ["packages/test"],
        dryRun: "false",
        model: "claude-sonnet-4-20250514",
        maxIterations: 20,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowPayload)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("TokenUsageSchema", () => {
    it("decodes valid token usage", () => {
      const input = {
        inputTokens: 1000,
        outputTokens: 500,
        totalTokens: 1500,
        reasoningTokens: 0,
        cachedInputTokens: 100,
      };

      const result = S.decodeUnknownEither(TokenUsageSchema)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes zero values", () => {
      const input = {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        reasoningTokens: 0,
        cachedInputTokens: 0,
      };

      const result = S.decodeUnknownEither(TokenUsageSchema)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("fails on non-numeric values", () => {
      const input = {
        inputTokens: "1000",
        outputTokens: 500,
        totalTokens: 1500,
        reasoningTokens: 0,
        cachedInputTokens: 100,
      };

      const result = S.decodeUnknownEither(TokenUsageSchema)(input);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("fails on missing field", () => {
      const input = {
        inputTokens: 1000,
        outputTokens: 500,
        // missing totalTokens, reasoningTokens, cachedInputTokens
      };

      const result = S.decodeUnknownEither(TokenUsageSchema)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("ConfigResult", () => {
    it("decodes valid config result", () => {
      const input = {
        packagePath: "/path/to/package",
        srcDir: "src",
        exclude: ["**/*.test.ts"],
      };

      const result = S.decodeUnknownEither(ConfigResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes with empty exclude", () => {
      const input = {
        packagePath: "/path/to/package",
        srcDir: "lib",
        exclude: [],
      };

      const result = S.decodeUnknownEither(ConfigResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("FileToFix", () => {
    it("decodes valid file to fix", () => {
      const input = {
        filePath: "src/index.ts",
        exportName: "myExport",
        missingTags: ["@category", "@example"],
      };

      const result = S.decodeUnknownEither(FileToFix)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes with empty missingTags", () => {
      const input = {
        filePath: "src/utils.ts",
        exportName: "helper",
        missingTags: [],
      };

      const result = S.decodeUnknownEither(FileToFix)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("AnalysisResult", () => {
    it("decodes valid analysis result", () => {
      const input = {
        packagePath: "/path/to/pkg",
        exportCount: 10,
        missingCount: 5,
        filesToFix: [
          { filePath: "src/a.ts", exportName: "a", missingTags: ["@category"] },
          { filePath: "src/b.ts", exportName: "b", missingTags: ["@example"] },
        ],
      };

      const result = S.decodeUnknownEither(AnalysisResult)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.filesToFix)).toBe(2);
      }
    });

    it("decodes with no files to fix", () => {
      const input = {
        packagePath: "/path/to/pkg",
        exportCount: 10,
        missingCount: 0,
        filesToFix: [],
      };

      const result = S.decodeUnknownEither(AnalysisResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("AICallResult", () => {
    it("decodes valid AI call result", () => {
      const input = {
        filePath: "src/index.ts",
        content: "export const foo = 42;",
        tokensUsed: 150,
        inputTokens: 100,
        outputTokens: 50,
      };

      const result = S.decodeUnknownEither(AICallResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("WriteResult", () => {
    it("decodes successful write", () => {
      const input = {
        filePath: "src/index.ts",
        bytesWritten: 1024,
        success: true,
      };

      const result = S.decodeUnknownEither(WriteResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes failed write", () => {
      const input = {
        filePath: "src/index.ts",
        bytesWritten: 0,
        success: false,
      };

      const result = S.decodeUnknownEither(WriteResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("ReadFileResult", () => {
    it("decodes valid read result", () => {
      const input = {
        filePath: "src/index.ts",
        content: "const x = 1;\nconst y = 2;",
        lineCount: 2,
      };

      const result = S.decodeUnknownEither(ReadFileResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes empty file", () => {
      const input = {
        filePath: "src/empty.ts",
        content: "",
        lineCount: 0,
      };

      const result = S.decodeUnknownEither(ReadFileResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("ValidationResult", () => {
    it("decodes passing validation", () => {
      const input = {
        packagePath: "/path/to/pkg",
        valid: true,
        errors: [],
      };

      const result = S.decodeUnknownEither(ValidationResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes failing validation with errors", () => {
      const input = {
        packagePath: "/path/to/pkg",
        valid: false,
        errors: ["Example does not compile", "Missing import"],
      };

      const result = S.decodeUnknownEither(ValidationResult)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.valid).toBe(false);
        expect(A.length(result.right.errors)).toBe(2);
      }
    });
  });

  describe("PackageFixResultSchema", () => {
    it("decodes complete result with token usage", () => {
      const input = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        success: true,
        exportsFixed: 10,
        exportsRemaining: 0,
        validationPassed: true,
        errors: [],
        durationMs: 5000,
        tokenUsage: {
          inputTokens: 1000,
          outputTokens: 500,
          totalTokens: 1500,
          reasoningTokens: 0,
          cachedInputTokens: 100,
        },
      };

      const result = S.decodeUnknownEither(PackageFixResultSchema)(input);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes result with errors", () => {
      const input = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        success: false,
        exportsFixed: 5,
        exportsRemaining: 5,
        validationPassed: false,
        errors: ["Failed to parse JSDoc for export1", "Validation failed"],
        durationMs: 3000,
        tokenUsage: {
          inputTokens: 500,
          outputTokens: 200,
          totalTokens: 700,
          reasoningTokens: 0,
          cachedInputTokens: 0,
        },
      };

      const result = S.decodeUnknownEither(PackageFixResultSchema)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.success).toBe(false);
        expect(A.length(result.right.errors)).toBe(2);
      }
    });

    it("fails on missing tokenUsage", () => {
      const input = {
        packageName: "@beep/test",
        packagePath: "/path/to/test",
        success: true,
        exportsFixed: 10,
        exportsRemaining: 0,
        validationPassed: true,
        errors: [],
        durationMs: 5000,
        // missing tokenUsage
      };

      const result = S.decodeUnknownEither(PackageFixResultSchema)(input);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("DocgenWorkflowResult", () => {
    it("decodes workflow result with multiple packages", () => {
      const input = {
        results: [
          {
            packageName: "@beep/pkg1",
            packagePath: "/path/to/pkg1",
            success: true,
            exportsFixed: 5,
            exportsRemaining: 0,
            validationPassed: true,
            errors: [],
            durationMs: 2000,
            tokenUsage: {
              inputTokens: 500,
              outputTokens: 200,
              totalTokens: 700,
              reasoningTokens: 0,
              cachedInputTokens: 0,
            },
          },
          {
            packageName: "@beep/pkg2",
            packagePath: "/path/to/pkg2",
            success: true,
            exportsFixed: 3,
            exportsRemaining: 0,
            validationPassed: true,
            errors: [],
            durationMs: 1500,
            tokenUsage: {
              inputTokens: 300,
              outputTokens: 150,
              totalTokens: 450,
              reasoningTokens: 0,
              cachedInputTokens: 0,
            },
          },
        ],
        totalExportsFixed: 8,
        totalTokens: 1150,
        durationMs: 3500,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowResult)(input);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.results)).toBe(2);
        expect(result.right.totalExportsFixed).toBe(8);
      }
    });

    it("decodes empty workflow result", () => {
      const input = {
        results: [],
        totalExportsFixed: 0,
        totalTokens: 0,
        durationMs: 100,
      };

      const result = S.decodeUnknownEither(DocgenWorkflowResult)(input);
      expect(Either.isRight(result)).toBe(true);
    });
  });
});
