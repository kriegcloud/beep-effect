/**
 * @file Unit tests for agent tool definitions.
 * @module docgen/agents/tools.test
 */

import {
  AnalyzePackage,
  DocFixerToolkit,
  InsertJsDoc,
  ListPackageExports,
  ReadSourceFile,
  SearchEffectDocs,
  ValidateExamples,
  WriteSourceFile,
} from "@beep/repo-cli/commands/docgen/agents/tools";
import { describe, expect, it } from "@beep/testkit";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

describe("agent tools", () => {
  describe("AnalyzePackage", () => {
    it("has correct name", () => {
      expect(AnalyzePackage.name).toBe("AnalyzePackage");
    });

    it("has description", () => {
      expect(AnalyzePackage.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema", () => {
      const validParams = { packagePath: "packages/common/identity" };
      const result = S.decodeUnknownEither(AnalyzePackage.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects invalid parameters", () => {
      const invalidParams = { packagePath: 123 };
      const result = S.decodeUnknownEither(AnalyzePackage.parametersSchema)(invalidParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("rejects missing packagePath", () => {
      const missingParams = {};
      const result = S.decodeUnknownEither(AnalyzePackage.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema", () => {
      const successData = {
        analysisContent: "# Analysis\n...",
        exportCount: 10,
        missingCount: 5,
      };
      const result = S.decodeUnknownEither(AnalyzePackage.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "Analysis failed: package not found";
      const result = S.decodeUnknownEither(AnalyzePackage.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("ReadSourceFile", () => {
    it("has correct name", () => {
      expect(ReadSourceFile.name).toBe("ReadSourceFile");
    });

    it("has description", () => {
      expect(ReadSourceFile.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema", () => {
      const validParams = { filePath: "/home/user/project/src/index.ts" };
      const result = S.decodeUnknownEither(ReadSourceFile.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing filePath", () => {
      const missingParams = {};
      const result = S.decodeUnknownEither(ReadSourceFile.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema", () => {
      const successData = {
        content: "export const foo = 42;",
        lineCount: 1,
      };
      const result = S.decodeUnknownEither(ReadSourceFile.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "File not found: /path/to/file.ts";
      const result = S.decodeUnknownEither(ReadSourceFile.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("WriteSourceFile", () => {
    it("has correct name", () => {
      expect(WriteSourceFile.name).toBe("WriteSourceFile");
    });

    it("has description", () => {
      expect(WriteSourceFile.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema with both fields", () => {
      const validParams = {
        filePath: "/home/user/project/src/index.ts",
        content: "export const foo = 42;",
      };
      const result = S.decodeUnknownEither(WriteSourceFile.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing filePath", () => {
      const missingParams = { content: "export const foo = 42;" };
      const result = S.decodeUnknownEither(WriteSourceFile.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("rejects missing content", () => {
      const missingParams = { filePath: "/home/user/project/src/index.ts" };
      const result = S.decodeUnknownEither(WriteSourceFile.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema", () => {
      const successData = {
        success: true,
        bytesWritten: 1024,
      };
      const result = S.decodeUnknownEither(WriteSourceFile.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "Permission denied: /path/to/file.ts";
      const result = S.decodeUnknownEither(WriteSourceFile.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("InsertJsDoc", () => {
    it("has correct name", () => {
      expect(InsertJsDoc.name).toBe("InsertJsDoc");
    });

    it("has description", () => {
      expect(InsertJsDoc.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema with required fields only", () => {
      const validParams = {
        filePath: "/path/to/file.ts",
        jsDocContent: "/**\n * Description\n * @category Utils\n */",
        insertAtLine: 10,
      };
      const result = S.decodeUnknownEither(InsertJsDoc.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates parameters schema with optional replace fields", () => {
      const validParams = {
        filePath: "/path/to/file.ts",
        jsDocContent: "/**\n * Description\n * @category Utils\n */",
        insertAtLine: 10,
        replaceStartLine: 8,
        replaceEndLine: 9,
      };
      const result = S.decodeUnknownEither(InsertJsDoc.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates parameters schema with null replace fields", () => {
      const validParams = {
        filePath: "/path/to/file.ts",
        jsDocContent: "/**\n * Description\n * @category Utils\n */",
        insertAtLine: 10,
        replaceStartLine: null,
        replaceEndLine: null,
      };
      const result = S.decodeUnknownEither(InsertJsDoc.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing required fields", () => {
      const missingParams = {
        filePath: "/path/to/file.ts",
        // missing jsDocContent and insertAtLine
      };
      const result = S.decodeUnknownEither(InsertJsDoc.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema", () => {
      const successData = {
        success: true,
        linesInserted: 5,
        linesRemoved: 2,
      };
      const result = S.decodeUnknownEither(InsertJsDoc.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "Line number out of range";
      const result = S.decodeUnknownEither(InsertJsDoc.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("ValidateExamples", () => {
    it("has correct name", () => {
      expect(ValidateExamples.name).toBe("ValidateExamples");
    });

    it("has description", () => {
      expect(ValidateExamples.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema", () => {
      const validParams = { packagePath: "packages/common/schema" };
      const result = S.decodeUnknownEither(ValidateExamples.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing packagePath", () => {
      const missingParams = {};
      const result = S.decodeUnknownEither(ValidateExamples.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema with no errors", () => {
      const successData = {
        valid: true,
        errors: [],
        moduleCount: 5,
      };
      const result = S.decodeUnknownEither(ValidateExamples.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates success schema with errors", () => {
      const successData = {
        valid: false,
        errors: ["Example at line 10 does not compile", "Missing import for Effect"],
        moduleCount: 5,
      };
      const result = S.decodeUnknownEither(ValidateExamples.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.errors)).toBe(2);
      }
    });

    it("validates failure schema", () => {
      const failureData = "Package not found";
      const result = S.decodeUnknownEither(ValidateExamples.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("SearchEffectDocs", () => {
    it("has correct name", () => {
      expect(SearchEffectDocs.name).toBe("SearchEffectDocs");
    });

    it("has description", () => {
      expect(SearchEffectDocs.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema", () => {
      const validParams = { query: "Effect.gen usage" };
      const result = S.decodeUnknownEither(SearchEffectDocs.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing query", () => {
      const missingParams = {};
      const result = S.decodeUnknownEither(SearchEffectDocs.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema with results", () => {
      const successData = {
        results: [
          { title: "Effect.gen", content: "Generator syntax for Effect...", documentId: 1 },
          { title: "Effect.map", content: "Map over Effect success...", documentId: 2 },
        ],
      };
      const result = S.decodeUnknownEither(SearchEffectDocs.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.results)).toBe(2);
      }
    });

    it("validates success schema with empty results", () => {
      const successData = {
        results: [],
      };
      const result = S.decodeUnknownEither(SearchEffectDocs.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "Search service unavailable";
      const result = S.decodeUnknownEither(SearchEffectDocs.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("ListPackageExports", () => {
    it("has correct name", () => {
      expect(ListPackageExports.name).toBe("ListPackageExports");
    });

    it("has description", () => {
      expect(ListPackageExports.description?.length).toBeGreaterThan(0);
    });

    it("validates parameters schema", () => {
      const validParams = { packagePath: "packages/common/utils" };
      const result = S.decodeUnknownEither(ListPackageExports.parametersSchema)(validParams);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects missing packagePath", () => {
      const missingParams = {};
      const result = S.decodeUnknownEither(ListPackageExports.parametersSchema)(missingParams);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema with exports", () => {
      const successData = {
        exports: [
          { name: "myFunction", kind: "function", filePath: "src/utils.ts", line: 10, hasJsDoc: true },
          { name: "MyType", kind: "type", filePath: "src/types.ts", line: 5, hasJsDoc: false },
          { name: "MY_CONST", kind: "const", filePath: "src/constants.ts", line: 1, hasJsDoc: true },
        ],
      };
      const result = S.decodeUnknownEither(ListPackageExports.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
      if (Either.isRight(result)) {
        expect(A.length(result.right.exports)).toBe(3);
      }
    });

    it("validates all export kinds", () => {
      const kinds = ["function", "const", "type", "interface", "class", "namespace", "enum"] as const;
      const exports = A.map(kinds, (kind) => ({
        name: `export_${kind}`,
        kind,
        filePath: "src/index.ts",
        line: 1,
        hasJsDoc: false,
      }));
      const successData = { exports };
      const result = S.decodeUnknownEither(ListPackageExports.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("rejects invalid export kind", () => {
      const successData = {
        exports: [{ name: "myExport", kind: "invalid-kind", filePath: "src/index.ts", line: 1, hasJsDoc: false }],
      };
      const result = S.decodeUnknownEither(ListPackageExports.successSchema)(successData);
      expect(Either.isLeft(result)).toBe(true);
    });

    it("validates success schema with empty exports", () => {
      const successData = {
        exports: [],
      };
      const result = S.decodeUnknownEither(ListPackageExports.successSchema)(successData);
      expect(Either.isRight(result)).toBe(true);
    });

    it("validates failure schema", () => {
      const failureData = "Package index file not found";
      const result = S.decodeUnknownEither(ListPackageExports.failureSchema)(failureData);
      expect(Either.isRight(result)).toBe(true);
    });
  });

  describe("DocFixerToolkit", () => {
    it("is defined", () => {
      expect(DocFixerToolkit).toBeDefined();
    });

    it("contains all expected tools", () => {
      const tools = DocFixerToolkit.tools;
      const toolNames = Struct.keys(tools);
      expect(A.length(toolNames)).toBe(7);
    });

    it("contains AnalyzePackage tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "AnalyzePackage")).toBe(true);
    });

    it("contains ReadSourceFile tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "ReadSourceFile")).toBe(true);
    });

    it("contains WriteSourceFile tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "WriteSourceFile")).toBe(true);
    });

    it("contains InsertJsDoc tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "InsertJsDoc")).toBe(true);
    });

    it("contains ValidateExamples tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "ValidateExamples")).toBe(true);
    });

    it("contains SearchEffectDocs tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "SearchEffectDocs")).toBe(true);
    });

    it("contains ListPackageExports tool", () => {
      const tools = DocFixerToolkit.tools;
      expect(R.has(tools, "ListPackageExports")).toBe(true);
    });
  });
});
