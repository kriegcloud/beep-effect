/**
 * @file Unit tests for docgen types and schemas.
 * @module docgen/types.test
 */

import {
  DocgenConfigSchema,
  ExitCode,
  ExportAnalysisSchema,
  ExportKind,
  IssuePriority,
  PackageAnalysisSchema,
  PackageAnalysisSummarySchema,
  PackageDocgenStatus,
  PackageInfoSchema,
  RequiredTags,
} from "@beep/repo-cli/commands/docgen/types";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as S from "effect/Schema";

describe("types", () => {
  describe("ExitCode", () => {
    it("has correct exit code values", () => {
      expect(ExitCode.Success).toBe(0);
      expect(ExitCode.InvalidInput).toBe(1);
      expect(ExitCode.ConfigurationError).toBe(2);
      expect(ExitCode.ExecutionError).toBe(3);
      expect(ExitCode.PartialFailure).toBe(4);
    });
  });

  describe("RequiredTags", () => {
    it("contains all required JSDoc tags", () => {
      expect(A.contains(RequiredTags, "@category")).toBe(true);
      expect(A.contains(RequiredTags, "@example")).toBe(true);
      expect(A.contains(RequiredTags, "@since")).toBe(true);
      expect(A.length(RequiredTags)).toBe(3);
    });
  });

  describe("ExportKind", () => {
    it("accepts valid export kinds", () => {
      const kinds = ["function", "const", "type", "interface", "class", "namespace", "enum"];
      F.pipe(
        kinds,
        A.forEach((kind) => {
          const result = S.decodeUnknownEither(ExportKind)(kind);
          expect(Either.isRight(result)).toBe(true);
        })
      );
    });

    it("rejects invalid export kinds", () => {
      const result = S.decodeUnknownEither(ExportKind)("invalid");
      expect(Either.isLeft(result)).toBe(true);
    });

    it("rejects non-string values", () => {
      const result = S.decodeUnknownEither(ExportKind)(123);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("IssuePriority", () => {
    it("accepts valid priorities", () => {
      const priorities = ["high", "medium", "low"];
      F.pipe(
        priorities,
        A.forEach((priority) => {
          const result = S.decodeUnknownEither(IssuePriority)(priority);
          expect(Either.isRight(result)).toBe(true);
        })
      );
    });

    it("rejects invalid priorities", () => {
      const result = S.decodeUnknownEither(IssuePriority)("critical");
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("PackageDocgenStatus", () => {
    it("accepts valid statuses", () => {
      const statuses = ["not-configured", "configured-not-generated", "configured-and-generated"];
      F.pipe(
        statuses,
        A.forEach((status) => {
          const result = S.decodeUnknownEither(PackageDocgenStatus)(status);
          expect(Either.isRight(result)).toBe(true);
        })
      );
    });

    it("rejects invalid statuses", () => {
      const result = S.decodeUnknownEither(PackageDocgenStatus)("unknown-status");
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("DocgenConfigSchema", () => {
    it("decodes minimal empty config", () => {
      const config = {};
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes config with srcDir and outDir", () => {
      const config = {
        srcDir: "src",
        outDir: "docs",
      };
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.srcDir).toBe("src");
        expect(result.right.outDir).toBe("docs");
      }
    });

    it("decodes config with exclude patterns", () => {
      const config = {
        srcDir: "src",
        exclude: ["**/*.test.ts", "**/*.spec.ts"],
      };
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.exclude ?? [])).toBe(2);
      }
    });

    it("decodes config with compiler options", () => {
      const config = {
        srcDir: "src",
        parseCompilerOptions: {
          strict: true,
          noEmit: true,
        },
        examplesCompilerOptions: {
          target: "ES2024",
        },
      };
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes config with $schema field", () => {
      const config = {
        $schema: "./schema.json",
        srcDir: "src",
      };
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects config with invalid exclude type", () => {
      const config = {
        exclude: "not-an-array",
      };
      const result = S.decodeUnknownEither(DocgenConfigSchema)(config);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("PackageInfoSchema", () => {
    it("decodes valid package info", () => {
      const info = {
        name: "@beep/schema",
        relativePath: "packages/common/schema",
        absolutePath: "/home/user/beep/packages/common/schema",
        hasDocgenConfig: true,
        hasGeneratedDocs: false,
        status: "configured-not-generated",
      };
      const result = S.decodeUnknownEither(PackageInfoSchema)(info);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing required fields", () => {
      const info = {
        name: "@beep/schema",
        // missing other required fields
      };
      const result = S.decodeUnknownEither(PackageInfoSchema)(info);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("rejects invalid status", () => {
      const info = {
        name: "@beep/schema",
        relativePath: "packages/common/schema",
        absolutePath: "/home/user/beep/packages/common/schema",
        hasDocgenConfig: true,
        hasGeneratedDocs: false,
        status: "invalid-status",
      };
      const result = S.decodeUnknownEither(PackageInfoSchema)(info);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("ExportAnalysisSchema", () => {
    it("decodes minimal export analysis", () => {
      const analysis = {
        name: "myExport",
        kind: "function",
        filePath: "src/index.ts",
        line: 1,
        presentTags: [],
        missingTags: ["@category", "@example", "@since"],
        hasJsDoc: false,
        priority: "high",
        insertionLine: 1,
        declarationSource: "export function myExport() {}",
      };

      const result = S.decodeUnknownEither(ExportAnalysisSchema)(analysis);
      expect(Either.isRight(result)).toBe(true);
    });

    it("decodes complete export analysis with all optional fields", () => {
      const analysis = {
        name: "myExport",
        kind: "const",
        filePath: "src/index.ts",
        line: 10,
        presentTags: ["@category"],
        missingTags: ["@example", "@since"],
        hasJsDoc: true,
        context: "Helper function for processing data",
        priority: "medium",
        insertionLine: 8,
        existingJsDocStartLine: 8,
        existingJsDocEndLine: 9,
        declarationSource: "export const myExport = 42;",
        contextBefore: "// Previous line\nimport * as A from 'effect/Array'",
      };

      const result = S.decodeUnknownEither(ExportAnalysisSchema)(analysis);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.context).toBe("Helper function for processing data");
        expect(result.right.existingJsDocStartLine).toBe(8);
        expect(result.right.existingJsDocEndLine).toBe(9);
      }
    });

    it("rejects invalid export kind", () => {
      const analysis = {
        name: "myExport",
        kind: "invalid-kind",
        filePath: "src/index.ts",
        line: 1,
        presentTags: [],
        missingTags: [],
        hasJsDoc: false,
        priority: "high",
        insertionLine: 1,
        declarationSource: "export const myExport = 42;",
      };

      const result = S.decodeUnknownEither(ExportAnalysisSchema)(analysis);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("rejects invalid priority", () => {
      const analysis = {
        name: "myExport",
        kind: "const",
        filePath: "src/index.ts",
        line: 1,
        presentTags: [],
        missingTags: [],
        hasJsDoc: false,
        priority: "critical",
        insertionLine: 1,
        declarationSource: "export const myExport = 42;",
      };

      const result = S.decodeUnknownEither(ExportAnalysisSchema)(analysis);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("PackageAnalysisSummarySchema", () => {
    it("decodes valid summary", () => {
      const summary = {
        totalExports: 10,
        fullyDocumented: 5,
        missingDocumentation: 5,
        missingCategory: 3,
        missingExample: 4,
        missingSince: 2,
      };

      const result = S.decodeUnknownEither(PackageAnalysisSummarySchema)(summary);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects non-numeric values", () => {
      const summary = {
        totalExports: "ten",
        fullyDocumented: 5,
        missingDocumentation: 5,
        missingCategory: 3,
        missingExample: 4,
        missingSince: 2,
      };

      const result = S.decodeUnknownEither(PackageAnalysisSummarySchema)(summary);
      expect(Either.isLeft(result)).toBe(true);
    });
  });

  describe("PackageAnalysisSchema", () => {
    it("decodes complete package analysis", () => {
      const analysis = {
        packageName: "@beep/test-package",
        packagePath: "/path/to/test-package",
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
            priority: "high",
            insertionLine: 1,
            declarationSource: "export const testExport = 42;",
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

      const result = S.decodeUnknownEither(PackageAnalysisSchema)(analysis);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(result.right.packageName).toBe("@beep/test-package");
        expect(A.length(result.right.exports)).toBe(1);
      }
    });

    it("decodes package analysis with empty exports", () => {
      const analysis = {
        packageName: "@beep/empty-package",
        packagePath: "/path/to/empty-package",
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

      const result = S.decodeUnknownEither(PackageAnalysisSchema)(analysis);
      expect(Either.isRight(result)).toBe(true);
    });
  });
});
