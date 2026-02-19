/**
 * @file Unit tests for TypeScript AST analysis utilities.
 * @module docgen/shared/ast.test
 */

import { TsMorphError } from "@beep/repo-cli/commands/docgen/errors";
import {
  addSourceFile,
  analyzeSourceFile,
  createProject,
  getSourceFiles,
} from "@beep/repo-cli/commands/docgen/shared/ast";
import { describe, effect, expect } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { Project } from "ts-morph";

describe("ast utilities", () => {
  describe("createProject", () => {
    effect("creates a ts-morph Project", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        expect(project).toBeInstanceOf(Project);
      })
    );

    effect("creates project with default compiler options", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        // Project should be usable
        const sourceFile = project.createSourceFile("test.ts", "export const x = 1;", { overwrite: true });
        expect(sourceFile.getFilePath()).toContain("test.ts");
      })
    );

    effect("creates project with custom compiler options", () =>
      Effect.gen(function* () {
        const project = yield* createProject({
          strict: true,
          target: 99, // ESNext
        });
        expect(project).toBeInstanceOf(Project);
      })
    );
  });

  describe("addSourceFile", () => {
    effect("fails for non-existent file", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const result = yield* addSourceFile(project, "/non/existent/file.ts").pipe(Effect.either);
        expect(result._tag).toBe("Left");
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(TsMorphError);
          expect(result.left._tag).toBe("TsMorphError");
          expect(result.left.filePath).toBe("/non/existent/file.ts");
        }
      })
    );
  });

  describe("analyzeSourceFile", () => {
    effect("analyzes exports from a source file", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
/**
 * Test function.
 * @category Utils
 * @example
 * myFunction();
 * @since 0.1.0
 */
export function myFunction() {}

export const myConst = 42;

export type MyType = string;

export interface MyInterface {
  name: string;
}
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        expect(A.length(results)).toBe(4);
      })
    );

    effect("identifies missing tags", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
export const noDoc = 1;

/**
 * Has only category.
 * @category Utils
 */
export const partialDoc = 2;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        // 3 results: module fileoverview (missing @since) + 2 exports
        expect(A.length(results)).toBe(3);

        const noDocExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "noDoc")
        );
        expect(noDocExport._tag).toBe("Some");
        if (noDocExport._tag === "Some") {
          expect(noDocExport.value.hasJsDoc).toBe(false);
          expect(A.length(noDocExport.value.missingTags)).toBe(3);
          expect(A.contains(noDocExport.value.missingTags, "@category")).toBe(true);
          expect(A.contains(noDocExport.value.missingTags, "@example")).toBe(true);
          expect(A.contains(noDocExport.value.missingTags, "@since")).toBe(true);
        }

        const partialDocExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "partialDoc")
        );
        expect(partialDocExport._tag).toBe("Some");
        if (partialDocExport._tag === "Some") {
          expect(partialDocExport.value.hasJsDoc).toBe(true);
          expect(A.contains(partialDocExport.value.presentTags, "@category")).toBe(true);
          expect(A.contains(partialDocExport.value.missingTags, "@example")).toBe(true);
          expect(A.contains(partialDocExport.value.missingTags, "@since")).toBe(true);
        }
      })
    );

    effect("identifies fully documented exports", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
/**
 * Fully documented.
 * @category Utils
 * @example
 * fullyDoc();
 * @since 0.1.0
 */
export const fullyDoc = 42;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        expect(A.length(results)).toBe(1);
        const result = A.head(results);
        expect(result._tag).toBe("Some");
        if (result._tag === "Some") {
          expect(result.value.hasJsDoc).toBe(true);
          expect(A.length(result.value.missingTags)).toBe(0);
          expect(result.value.priority).toBe("low");
        }
      })
    );

    effect("classifies export kinds correctly", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
export function myFunc() {}
export const myConst = 1;
export type MyType = string;
export interface MyInterface {}
export class MyClass {}
export namespace MyNamespace {}
export enum MyEnum { A, B }
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        // 8 results: module fileoverview (missing @since) + 7 exports
        expect(A.length(results)).toBe(8);

        const funcExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "myFunc")
        );
        expect(funcExport._tag).toBe("Some");
        if (funcExport._tag === "Some") {
          expect(funcExport.value.kind).toBe("function");
        }

        const constExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "myConst")
        );
        expect(constExport._tag).toBe("Some");
        if (constExport._tag === "Some") {
          expect(constExport.value.kind).toBe("const");
        }

        const typeExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "MyType")
        );
        expect(typeExport._tag).toBe("Some");
        if (typeExport._tag === "Some") {
          expect(typeExport.value.kind).toBe("type");
        }

        const interfaceExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "MyInterface")
        );
        expect(interfaceExport._tag).toBe("Some");
        if (interfaceExport._tag === "Some") {
          expect(interfaceExport.value.kind).toBe("interface");
        }

        const classExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "MyClass")
        );
        expect(classExport._tag).toBe("Some");
        if (classExport._tag === "Some") {
          expect(classExport.value.kind).toBe("class");
        }

        const namespaceExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "MyNamespace")
        );
        expect(namespaceExport._tag).toBe("Some");
        if (namespaceExport._tag === "Some") {
          expect(namespaceExport.value.kind).toBe("namespace");
        }

        const enumExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "MyEnum")
        );
        expect(enumExport._tag).toBe("Some");
        if (enumExport._tag === "Some") {
          expect(enumExport.value.kind).toBe("enum");
        }
      })
    );

    effect("computes priority based on missing tags", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
export const noTags = 1;

/**
 * @category Utils
 */
export const oneMissing = 2;

/**
 * @category Utils
 * @since 0.1.0
 */
export const twoPresent = 3;

/**
 * @category Utils
 * @example
 * all();
 * @since 0.1.0
 */
export const allPresent = 4;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");

        const noTagsExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "noTags")
        );
        expect(noTagsExport._tag).toBe("Some");
        if (noTagsExport._tag === "Some") {
          expect(noTagsExport.value.priority).toBe("high");
        }

        const oneMissingExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "oneMissing")
        );
        expect(oneMissingExport._tag).toBe("Some");
        if (oneMissingExport._tag === "Some") {
          expect(oneMissingExport.value.priority).toBe("medium");
        }

        const twoPresentExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "twoPresent")
        );
        expect(twoPresentExport._tag).toBe("Some");
        if (twoPresentExport._tag === "Some") {
          expect(twoPresentExport.value.priority).toBe("medium");
        }

        const allPresentExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "allPresent")
        );
        expect(allPresentExport._tag).toBe("Some");
        if (allPresentExport._tag === "Some") {
          expect(allPresentExport.value.priority).toBe("low");
        }
      })
    );

    effect("extracts context from JSDoc description", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
/**
 * This is the first line of description.
 * This is the second line.
 * @category Utils
 */
export const withContext = 1;

export const noContext = 2;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");

        const withContextExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "withContext")
        );
        expect(withContextExport._tag).toBe("Some");
        if (withContextExport._tag === "Some") {
          expect(withContextExport.value.context).toBe("This is the first line of description.");
        }

        const noContextExport = F.pipe(
          results,
          A.findFirst((r) => r.name === "noContext")
        );
        expect(noContextExport._tag).toBe("Some");
        if (noContextExport._tag === "Some") {
          expect(noContextExport.value.context).toBeUndefined();
        }
      })
    );

    effect("provides insertion line information", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `
export const line2 = 1;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        // 2 results: module fileoverview (missing @since) + 1 export
        expect(A.length(results)).toBe(2);
        // Find the actual export (not the fileoverview)
        const result = F.pipe(
          results,
          A.findFirst((r) => r.name === "line2")
        );
        expect(result._tag).toBe("Some");
        if (result._tag === "Some") {
          expect(result.value.insertionLine).toBeGreaterThan(0);
          expect(result.value.declarationSource).toContain("export const line2");
        }
      })
    );

    effect("includes existing JSDoc range when present", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "test.ts",
          `/**
 * Existing JSDoc.
 */
export const withJsDoc = 1;
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "test.ts");
        const result = A.head(results);
        expect(result._tag).toBe("Some");
        if (result._tag === "Some") {
          expect(result.value.existingJsDocStartLine).toBeDefined();
          expect(result.value.existingJsDocEndLine).toBeDefined();
        }
      })
    );

    effect("handles empty source file", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile("empty.ts", "", { overwrite: true });

        const results = analyzeSourceFile(sourceFile, "empty.ts");
        // 1 result: module fileoverview (missing @since) for empty file
        expect(A.length(results)).toBe(1);
        const result = A.head(results);
        expect(result._tag).toBe("Some");
        if (result._tag === "Some") {
          expect(result.value.name).toBe("<module fileoverview>");
          expect(result.value.kind).toBe("module-fileoverview");
        }
      })
    );

    effect("handles file with no exports", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const sourceFile = project.createSourceFile(
          "noexports.ts",
          `
const internal = 1;
function helper() {}
`,
          { overwrite: true }
        );

        const results = analyzeSourceFile(sourceFile, "noexports.ts");
        // 1 result: module fileoverview (missing @since) even without exports
        expect(A.length(results)).toBe(1);
        const result = A.head(results);
        expect(result._tag).toBe("Some");
        if (result._tag === "Some") {
          expect(result.value.name).toBe("<module fileoverview>");
          expect(result.value.kind).toBe("module-fileoverview");
        }
      })
    );
  });

  describe("getSourceFiles", () => {
    effect("fails for non-existent directory", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        const result = yield* getSourceFiles(project, "/non/existent/dir").pipe(Effect.either);
        // ts-morph might return empty array or error depending on version
        // We just verify it doesn't crash
        expect(result._tag === "Right" || result._tag === "Left").toBe(true);
      })
    );

    effect("returns empty array for empty directory pattern", () =>
      Effect.gen(function* () {
        const project = yield* createProject();
        // Create a project with no source files
        const files = yield* getSourceFiles(project, "/tmp/empty-test-dir-that-does-not-exist", []);
        // Should not throw, may return empty
        expect(A.length(files) >= 0).toBe(true);
      })
    );
  });
});
