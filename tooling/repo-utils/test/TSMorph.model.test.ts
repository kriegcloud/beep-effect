import { describe, expect, it } from "@effect/vitest";
import { Effect, Option as O } from "effect";
import * as S from "effect/Schema";
import { Project } from "ts-morph";
import {
  ByteLength,
  ByteOffset,
  ColumnNumber,
  ContentHash,
  ContentHashFromSourceText,
  FilePathToTsConfigFilePath,
  FilePathToTypeScriptDeclarationFilePath,
  FilePathToTypeScriptFilePath,
  FilePathToTypeScriptImplementationFilePath,
  LineNumber,
  makeProjectCacheKey,
  makeProjectScopeId,
  makeSymbol,
  makeSymbolId,
  ProjectScopeId,
  ProjectScopeIdParts,
  RepoRootPath,
  Symbol,
  SymbolCategory,
  SymbolFilePath,
  SymbolId,
  SymbolIdParts,
  SymbolKind,
  SymbolKindToCategory,
  SymbolNameSegment,
  SymbolQualifiedName,
  symbolCategoryFromKind,
  TsConfigFilePath,
  TsMorphDiagnostic,
  TsMorphDiagnosticsResult,
  TsMorphFileOutline,
  TsMorphProjectScope,
  TsMorphProjectScopeRequest,
  TsMorphReferencePolicy,
  TsMorphScopeMode,
  TsMorphSearchLimit,
  TsMorphSourceTextResult,
  TsMorphSymbolLookupResult,
  TsMorphSymbolSearchRequest,
  TsMorphSymbolSearchResult,
  TsMorphSymbolSourceResult,
  TypeScriptDeclarationFilePath,
  TypeScriptFilePath,
  TypeScriptImplementationFilePath,
  TypeScriptImplementationFilePathToSymbolFilePath,
  WorkspaceDirectoryPath,
} from "../src/TSMorph/index.js";
import {
  InternalTsMorphNode,
  InternalTsMorphProject,
  InternalTsMorphSourceFile,
} from "../src/TSMorph/TSMorph.model.js";

const decodeRepoRootPath = S.decodeUnknownSync(RepoRootPath);
const decodeWorkspaceDirectoryPath = S.decodeUnknownSync(WorkspaceDirectoryPath);
const decodeTsConfigFilePath = S.decodeUnknownSync(TsConfigFilePath);
const decodeTypeScriptImplementationFilePath = S.decodeUnknownSync(TypeScriptImplementationFilePath);
const decodeTypeScriptDeclarationFilePath = S.decodeUnknownSync(TypeScriptDeclarationFilePath);
const decodeTypeScriptFilePath = S.decodeUnknownSync(TypeScriptFilePath);
const decodeSymbolQualifiedName = S.decodeUnknownSync(SymbolQualifiedName);
const decodeSymbolFilePath = S.decodeUnknownSync(SymbolFilePath);
const decodeSymbolKind = S.decodeUnknownSync(SymbolKind);
const decodeSymbolCategory = S.decodeUnknownSync(SymbolCategory);
const decodeSymbolId = S.decodeUnknownSync(SymbolId);
const decodeSymbolIdParts = S.decodeUnknownSync(SymbolIdParts);
const decodeProjectScopeId = S.decodeUnknownSync(ProjectScopeId);
const decodeProjectScopeIdParts = S.decodeUnknownSync(ProjectScopeIdParts);
const decodeLineNumber = S.decodeUnknownSync(LineNumber);
const decodeColumnNumber = S.decodeUnknownSync(ColumnNumber);
const decodeByteOffset = S.decodeUnknownSync(ByteOffset);
const decodeByteLength = S.decodeUnknownSync(ByteLength);
const decodeSymbolNameSegment = S.decodeUnknownSync(SymbolNameSegment);
const decodeSearchLimit = S.decodeUnknownSync(TsMorphSearchLimit);
const decodeContentHash = S.decodeUnknownSync(ContentHash);
const decodeSymbol = S.decodeUnknownSync(Symbol);
const decodeTsMorphProjectScopeRequest = S.decodeUnknownSync(TsMorphProjectScopeRequest);
const decodeTsMorphProjectScope = S.decodeUnknownSync(TsMorphProjectScope);
const decodeTsMorphFileOutline = S.decodeUnknownSync(TsMorphFileOutline);
const decodeTsMorphSourceTextResult = S.decodeUnknownSync(TsMorphSourceTextResult);
const decodeTsMorphSymbolLookupResult = S.decodeUnknownSync(TsMorphSymbolLookupResult);
const decodeTsMorphSymbolSearchRequest = S.decodeUnknownSync(TsMorphSymbolSearchRequest);
const decodeTsMorphSymbolSearchResult = S.decodeUnknownSync(TsMorphSymbolSearchResult);
const decodeTsMorphSymbolSourceResult = S.decodeUnknownSync(TsMorphSymbolSourceResult);
const decodeTsMorphDiagnostic = S.decodeUnknownSync(TsMorphDiagnostic);
const decodeTsMorphDiagnosticsResult = S.decodeUnknownSync(TsMorphDiagnosticsResult);
const decodeInternalProject = S.decodeUnknownSync(InternalTsMorphProject);
const decodeInternalSourceFile = S.decodeUnknownSync(InternalTsMorphSourceFile);
const decodeInternalNode = S.decodeUnknownSync(InternalTsMorphNode);
const encodeSymbol = S.encodeSync(Symbol);

const baseSymbolInput = {
  filePath: decodeSymbolFilePath("src/main.ts"),
  name: decodeSymbolNameSegment("login"),
  qualifiedName: decodeSymbolQualifiedName("UserService.login"),
  kind: decodeSymbolKind("MethodDeclaration"),
  signature: "login(id: string): User",
  docstring: O.none<string>(),
  summary: O.none<string>(),
  decorators: [],
  keywords: ["login"],
  parentId: O.none<SymbolId>(),
  startLine: decodeLineNumber(10),
  endLine: decodeLineNumber(18),
  byteOffset: decodeByteOffset(128),
  byteLength: decodeByteLength(84),
  contentHash: decodeContentHash("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
};

const baseSymbol = makeSymbol({
  ...baseSymbolInput,
  contentHash: baseSymbolInput.contentHash,
});
const baseSymbolEncoded = encodeSymbol(baseSymbol);

describe("TSMorph model taxonomy", () => {
  describe("path primitives", () => {
    it("accepts repo and workspace directory paths", () => {
      expect(decodeRepoRootPath("/repo/root")).toBe("/repo/root");
      expect(decodeWorkspaceDirectoryPath("/repo/root/tooling/repo-utils")).toBe("/repo/root/tooling/repo-utils");
    });

    it("validates tsconfig file paths", () => {
      expect(decodeTsConfigFilePath("tooling/repo-utils/tsconfig.json")).toBe("tooling/repo-utils/tsconfig.json");
      expect(decodeTsConfigFilePath("packages/foo/tsconfig.build.json")).toBe("packages/foo/tsconfig.build.json");
      expect(() => decodeTsConfigFilePath("packages/foo/tsconfig.ts")).toThrow();
      expect(() => decodeTsConfigFilePath("packages/foo/tsconfig#dev.json")).toThrow();
    });

    it("splits implementation and declaration TypeScript file paths strictly", () => {
      expect(decodeTypeScriptImplementationFilePath("src/main.ts")).toBe("src/main.ts");
      expect(decodeTypeScriptImplementationFilePath("src/component.tsx")).toBe("src/component.tsx");
      expect(decodeTypeScriptImplementationFilePath("src/module.mts")).toBe("src/module.mts");
      expect(() => decodeTypeScriptImplementationFilePath("src/types.d.ts")).toThrow();
      expect(() => decodeTypeScriptImplementationFilePath("src/main.js")).toThrow();

      expect(decodeTypeScriptDeclarationFilePath("src/types.d.ts")).toBe("src/types.d.ts");
      expect(decodeTypeScriptDeclarationFilePath("src/types.d.mts")).toBe("src/types.d.mts");
      expect(() => decodeTypeScriptDeclarationFilePath("src/main.ts")).toThrow();

      expect(decodeTypeScriptFilePath("src/main.ts")).toBe("src/main.ts");
      expect(decodeTypeScriptFilePath("src/types.d.ts")).toBe("src/types.d.ts");
    });

    it("keeps SymbolFilePath implementation-only and delimiter-safe", () => {
      expect(decodeSymbolFilePath("src/main.ts")).toBe("src/main.ts");
      expect(() => decodeSymbolFilePath("src/types.d.ts")).toThrow();
      expect(() => decodeSymbolFilePath("src::main.ts")).toThrow();
      expect(() => decodeSymbolFilePath("src/main#one.ts")).toThrow();
    });
  });

  describe("pure transformations", () => {
    it("refines generic file paths into stricter TypeScript path schemas", () => {
      expect(S.decodeUnknownSync(FilePathToTsConfigFilePath)("tooling/repo-utils/tsconfig.json")).toBe(
        "tooling/repo-utils/tsconfig.json"
      );
      expect(S.decodeUnknownSync(FilePathToTypeScriptImplementationFilePath)("src/main.ts")).toBe("src/main.ts");
      expect(S.decodeUnknownSync(FilePathToTypeScriptDeclarationFilePath)("src/types.d.ts")).toBe("src/types.d.ts");
      expect(S.decodeUnknownSync(FilePathToTypeScriptFilePath)("src/types.d.ts")).toBe("src/types.d.ts");
      expect(S.decodeUnknownSync(TypeScriptImplementationFilePathToSymbolFilePath)("src/main.ts")).toBe("src/main.ts");
    });

    it("maps exact symbol kinds to coarse categories", () => {
      expect(symbolCategoryFromKind("FunctionDeclaration")).toBe(SymbolCategory.Enum.function);
      expect(symbolCategoryFromKind("Constructor")).toBe(SymbolCategory.Enum.member);
      expect(symbolCategoryFromKind("EnumDeclaration")).toBe(SymbolCategory.Enum.type);
      expect(S.decodeUnknownSync(SymbolKindToCategory)("MethodDeclaration")).toBe("member");
      expect(decodeSymbolCategory("member")).toBe("member");
    });

    it("roundtrips symbol ids and scope ids through parsed tuple parts", () => {
      const symbolId = decodeSymbolId("src/main.ts::UserService.login#MethodDeclaration");
      expect(decodeSymbolIdParts(symbolId)).toEqual([
        "src/main.ts",
        "::",
        "UserService.login",
        "#",
        "MethodDeclaration",
      ]);

      const scopeId = makeProjectScopeId({
        tsConfigPath: decodeTsConfigFilePath("tooling/repo-utils/tsconfig.json"),
        mode: TsMorphScopeMode.Enum.syntax,
        referencePolicy: TsMorphReferencePolicy.Enum.workspaceOnly,
      });

      expect(scopeId).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
      expect(decodeProjectScopeId(scopeId)).toBe(scopeId);
      expect(decodeProjectScopeIdParts(scopeId)).toEqual([
        "tooling/repo-utils/tsconfig.json",
        "::",
        "syntax",
        "#",
        "workspaceOnly",
      ]);
      expect(
        makeProjectCacheKey({
          tsConfigPath: decodeTsConfigFilePath("tooling/repo-utils/tsconfig.json"),
          mode: TsMorphScopeMode.Enum.syntax,
          referencePolicy: TsMorphReferencePolicy.Enum.workspaceOnly,
        })
      ).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");
    });
  });

  describe("effectful transformations", () => {
    it("derives content hashes from source text", async () => {
      const hash = await Effect.runPromise(S.decodeUnknownEffect(ContentHashFromSourceText)("export const a = 1;\n"));
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe("runtime instance schemas", () => {
    it("accepts live ts-morph runtime instances and rejects plain objects", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const sourceFile = project.createSourceFile(
        "src/main.ts",
        "export class UserService { login(id: string) { return id; } }",
        { overwrite: true }
      );
      const classDeclaration = sourceFile.getClassOrThrow("UserService");

      expect(decodeInternalProject(project)).toBe(project);
      expect(decodeInternalSourceFile(sourceFile)).toBe(sourceFile);
      expect(decodeInternalNode(classDeclaration)).toBe(classDeclaration);
      expect(() => decodeInternalProject({})).toThrow();
      expect(() => decodeInternalSourceFile({})).toThrow();
      expect(() => decodeInternalNode({})).toThrow();
    });
  });

  describe("symbol primitives", () => {
    it("accepts strict qualified names and exact kinds", () => {
      expect(decodeSymbolQualifiedName("UserService")).toBe("UserService");
      expect(decodeSymbolQualifiedName("UserService.login")).toBe("UserService.login");
      expect(() => decodeSymbolQualifiedName("UserService.#login")).toThrow();
      expect(() => decodeSymbolQualifiedName("UserService.[Symbol.iterator]")).toThrow();

      expect(decodeSymbolKind("MethodDeclaration")).toBe("MethodDeclaration");
      expect(() => decodeSymbolKind("QualifiedName")).toThrow();
      expect(() => decodeSymbolKind("Identifier")).toThrow();
    });

    it("builds normalized symbols with derived ids and categories", () => {
      const symbol = makeSymbol(baseSymbolInput);

      expect(symbol.id).toBe(
        makeSymbolId({
          filePath: decodeSymbolFilePath("src/main.ts"),
          qualifiedName: decodeSymbolQualifiedName("UserService.login"),
          kind: decodeSymbolKind("MethodDeclaration"),
        })
      );
      expect(symbol.category).toBe(SymbolCategory.Enum.member);
      expect(
        decodeSymbol({
          id: "src/main.ts::UserService.login#MethodDeclaration",
          filePath: "src/main.ts",
          name: "login",
          qualifiedName: "UserService.login",
          kind: "MethodDeclaration",
          category: "member",
          signature: "login(id: string): User",
          docstring: null,
          summary: null,
          decorators: [],
          keywords: ["login"],
          parentId: null,
          startLine: 10,
          endLine: 18,
          byteOffset: 128,
          byteLength: 84,
          contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        }).kind
      ).toBe("MethodDeclaration");
    });
  });

  describe("request/result classes", () => {
    it("decodes project scope and file/source requests", () => {
      const request = decodeTsMorphProjectScopeRequest({
        entrypoint: {
          _tag: "tsconfig",
          tsConfigPath: "tooling/repo-utils/tsconfig.json",
        },
        repoRootPath: null,
        mode: "syntax",
        referencePolicy: "workspaceOnly",
      });

      expect(O.isNone(request.repoRootPath)).toBe(true);

      const scope = decodeTsMorphProjectScope({
        scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
        cacheKey: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
        repoRootPath: "/repo/root",
        workspaceDirectoryPath: "/repo/root/tooling/repo-utils",
        tsConfigPath: "tooling/repo-utils/tsconfig.json",
        mode: "syntax",
        referencePolicy: "workspaceOnly",
      });

      expect(scope.scopeId).toBe("tooling/repo-utils/tsconfig.json::syntax#workspaceOnly");

      expect(
        decodeTsMorphFileOutline({
          scopeId: scope.scopeId,
          filePath: "src/main.ts",
          symbols: [baseSymbolEncoded],
        }).symbols
      ).toHaveLength(1);

      expect(
        decodeTsMorphSourceTextResult({
          filePath: "src/main.ts",
          sourceText: "export const a = 1;",
          contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        }).filePath
      ).toBe("src/main.ts");
    });

    it("decodes symbol lookup, search, source, and diagnostics results", () => {
      expect(decodeSearchLimit(25)).toBe(25);
      expect(decodeLineNumber(1)).toBe(1);
      expect(decodeColumnNumber(2)).toBe(2);

      expect(
        decodeTsMorphSymbolLookupResult({
          scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
          symbol: baseSymbolEncoded,
        }).symbol.id
      ).toBe(baseSymbol.id);

      const searchRequest = decodeTsMorphSymbolSearchRequest({
        scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
        query: "user",
        categories: ["member"],
        kinds: ["MethodDeclaration"],
        limit: 25,
      });

      expect(searchRequest.limit).toBe(25);

      expect(
        decodeTsMorphSymbolSearchResult({
          scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
          query: "user",
          limit: 25,
          symbols: [baseSymbolEncoded],
          total: 1,
        }).total
      ).toBe(1);

      expect(
        decodeTsMorphSymbolSourceResult({
          scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
          symbol: baseSymbolEncoded,
          sourceText: "login(id: string): User { return user; }",
          contentHash: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
        }).symbol.id
      ).toBe(baseSymbol.id);

      expect(
        decodeTsMorphDiagnostic({
          category: "error",
          code: 2322,
          message: "Type 'string' is not assignable to type 'number'.",
          source: null,
          startLine: 4,
          startColumn: 10,
          endLine: 4,
          endColumn: 16,
        }).category
      ).toBe("error");

      expect(
        decodeTsMorphDiagnosticsResult({
          scopeId: "tooling/repo-utils/tsconfig.json::syntax#workspaceOnly",
          filePath: "src/main.ts",
          diagnostics: [
            {
              category: "error",
              code: 2322,
              message: "Type 'string' is not assignable to type 'number'.",
              source: null,
              startLine: 4,
              startColumn: 10,
              endLine: 4,
              endColumn: 16,
            },
          ],
        }).diagnostics
      ).toHaveLength(1);
    });
  });
});
