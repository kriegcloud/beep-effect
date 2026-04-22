/**
 * TSMorph request, result, and branded identifier models.
 *
 * @module
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import {
  ArrayOfNonEmptyStrings,
  FilePath,
  LiteralKit,
  NonNegativeInt,
  Sha256Hex,
  Sha256HexFromBytes,
} from "@beep/schema";
import { Effect, SchemaGetter, Tuple } from "effect";
import * as S from "effect/Schema";
import { Project, SourceFile, Node as TsMorphNode } from "ts-morph";
import { TSSyntaxKind } from "../TypeScript/index.ts";

const $I = $RepoUtilsId.create("TSMorph/TSMorph.model");

const TS_CONFIG_FILE_PATTERN = /(?:^|[\\/])tsconfig(?:\.[^\\/]+)?\.json$/;
const TYPE_SCRIPT_IMPLEMENTATION_FILE_PATTERN = /\.(?:ts|tsx|mts|cts)$/;
const TYPE_SCRIPT_DECLARATION_FILE_PATTERN = /\.d\.(?:ts|mts|cts)$/;
const SYMBOL_NAME_SEGMENT_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const SYMBOL_QUALIFIED_NAME_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)*$/;

const symbolIdSafePathChecks = S.makeFilterGroup(
  [
    S.makeFilter((value: string) => !value.includes("::"), {
      title: "noDoubleColonDelimiter",
      description: 'a path without the "::" template-literal delimiter',
      message: 'Path must not contain "::"',
    }),
    S.makeFilter((value: string) => !value.includes("#"), {
      title: "noHashDelimiter",
      description: 'a path without the "#" template-literal delimiter',
      message: 'Path must not contain "#"',
    }),
  ],
  {
    title: "Template Literal Safe Path",
    description: "A file path string that can be safely embedded into template-literal identities.",
  }
);

const tsConfigFilePathChecks = S.makeFilterGroup(
  [
    S.isPattern(TS_CONFIG_FILE_PATTERN, {
      title: "isTsConfigFilePath",
      description: "a tsconfig file path ending in tsconfig*.json",
      message: "Path must point to a tsconfig*.json file",
    }),
    symbolIdSafePathChecks,
  ],
  {
    title: "TsConfig File Path",
    description: "A tsconfig file path that is safe to embed in scope identities.",
  }
);

const typeScriptImplementationFilePathChecks = S.makeFilterGroup(
  [
    S.isPattern(TYPE_SCRIPT_IMPLEMENTATION_FILE_PATTERN, {
      title: "isTypeScriptImplementationFile",
      description: "a TypeScript implementation file ending in .ts, .tsx, .mts, or .cts",
      message: "Path must point to a TypeScript implementation file",
    }),
    S.makeFilter((value: string) => !TYPE_SCRIPT_DECLARATION_FILE_PATTERN.test(value), {
      title: "isNotTypeScriptDeclarationFile",
      description: "a TypeScript implementation file path that is not a declaration file",
      message: "Implementation file path must not be a declaration file",
    }),
  ],
  {
    title: "TypeScript Implementation File Path",
    description: "A TypeScript implementation file path for .ts, .tsx, .mts, or .cts files.",
  }
);

const typeScriptDeclarationFilePathChecks = S.makeFilterGroup(
  [
    S.isPattern(TYPE_SCRIPT_DECLARATION_FILE_PATTERN, {
      title: "isTypeScriptDeclarationFile",
      description: "a TypeScript declaration file ending in .d.ts, .d.mts, or .d.cts",
      message: "Path must point to a TypeScript declaration file",
    }),
  ],
  {
    title: "TypeScript Declaration File Path",
    description: "A TypeScript declaration file path for .d.ts, .d.mts, or .d.cts files.",
  }
);

const symbolKindOptions = TSSyntaxKind.pickOptions([
  "FunctionDeclaration",
  "ClassDeclaration",
  "MethodDeclaration",
  "Constructor",
  "GetAccessor",
  "SetAccessor",
  "InterfaceDeclaration",
  "TypeAliasDeclaration",
  "EnumDeclaration",
] as const);

/**
 * Repository root directory path schema.
 *
 * @example
 * ```ts
 * import { RepoRootPath } from "@beep/repo-utils"
 * const value = RepoRootPath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const RepoRootPath = FilePath.pipe(
  S.brand("RepoRootPath"),
  S.annotate(
    $I.annote("RepoRootPath", {
      description: "Absolute or repo-anchored path representing the repository root directory.",
    })
  )
);

/**
 * Branded repository root directory path.
 *
 * @example
 * ```ts
 * import type { RepoRootPath } from "@beep/repo-utils"
 * type Example = RepoRootPath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type RepoRootPath = typeof RepoRootPath.Type;

/**
 * Workspace directory path schema.
 *
 * @example
 * ```ts
 * import { WorkspaceDirectoryPath } from "@beep/repo-utils"
 * const value = WorkspaceDirectoryPath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const WorkspaceDirectoryPath = FilePath.pipe(
  S.brand("WorkspaceDirectoryPath"),
  S.annotate(
    $I.annote("WorkspaceDirectoryPath", {
      description: "Directory path representing a workspace root inside the repository.",
    })
  )
);

/**
 * Branded workspace directory path.
 *
 * @example
 * ```ts
 * import type { WorkspaceDirectoryPath } from "@beep/repo-utils"
 * type Example = WorkspaceDirectoryPath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type WorkspaceDirectoryPath = typeof WorkspaceDirectoryPath.Type;

/**
 * `tsconfig*.json` file path schema.
 *
 * @example
 * ```ts
 * import { TsConfigFilePath } from "@beep/repo-utils"
 * const value = TsConfigFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsConfigFilePath = FilePath.check(tsConfigFilePathChecks).pipe(
  S.brand("TsConfigFilePath"),
  S.annotate(
    $I.annote("TsConfigFilePath", {
      description: "A tsconfig*.json file path that is safe to embed in TSMorph scope identities.",
    })
  )
);

/**
 * Branded `tsconfig*.json` file path.
 *
 * @example
 * ```ts
 * import type { TsConfigFilePath } from "@beep/repo-utils"
 * type Example = TsConfigFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsConfigFilePath = typeof TsConfigFilePath.Type;

/**
 * TypeScript implementation file path schema.
 *
 * @example
 * ```ts
 * import { TypeScriptImplementationFilePath } from "@beep/repo-utils"
 * const value = TypeScriptImplementationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TypeScriptImplementationFilePath = FilePath.check(typeScriptImplementationFilePathChecks).pipe(
  S.brand("TypeScriptImplementationFilePath"),
  S.annotate(
    $I.annote("TypeScriptImplementationFilePath", {
      description: "A TypeScript implementation file path for .ts, .tsx, .mts, or .cts files.",
    })
  )
);

/**
 * Branded TypeScript implementation file path.
 *
 * @example
 * ```ts
 * import type { TypeScriptImplementationFilePath } from "@beep/repo-utils"
 * type Example = TypeScriptImplementationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TypeScriptImplementationFilePath = typeof TypeScriptImplementationFilePath.Type;

/**
 * TypeScript declaration file path schema.
 *
 * @example
 * ```ts
 * import { TypeScriptDeclarationFilePath } from "@beep/repo-utils"
 * const value = TypeScriptDeclarationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TypeScriptDeclarationFilePath = FilePath.check(typeScriptDeclarationFilePathChecks).pipe(
  S.brand("TypeScriptDeclarationFilePath"),
  S.annotate(
    $I.annote("TypeScriptDeclarationFilePath", {
      description: "A TypeScript declaration file path for .d.ts, .d.mts, or .d.cts files.",
    })
  )
);

/**
 * Branded TypeScript declaration file path.
 *
 * @example
 * ```ts
 * import type { TypeScriptDeclarationFilePath } from "@beep/repo-utils"
 * type Example = TypeScriptDeclarationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TypeScriptDeclarationFilePath = typeof TypeScriptDeclarationFilePath.Type;

/**
 * TypeScript source file path schema.
 *
 * @example
 * ```ts
 * import { TypeScriptFilePath } from "@beep/repo-utils"
 * const value = TypeScriptFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TypeScriptFilePath = S.Union([TypeScriptImplementationFilePath, TypeScriptDeclarationFilePath]).pipe(
  S.annotate(
    $I.annote("TypeScriptFilePath", {
      description: "A TypeScript source file path covering implementation and declaration files.",
    })
  )
);

/**
 * Branded TypeScript source file path.
 *
 * @example
 * ```ts
 * import type { TypeScriptFilePath } from "@beep/repo-utils"
 * type Example = TypeScriptFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TypeScriptFilePath = typeof TypeScriptFilePath.Type;

/**
 * Symbol-safe implementation file path schema.
 *
 * @example
 * ```ts
 * import { SymbolFilePath } from "@beep/repo-utils"
 * const value = SymbolFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolFilePath = TypeScriptImplementationFilePath.check(symbolIdSafePathChecks).pipe(
  S.brand("SymbolFilePath"),
  S.annotate(
    $I.annote("SymbolFilePath", {
      description: "A TypeScript implementation file path that is safe to embed in symbol identities.",
    })
  )
);

/**
 * Branded symbol-safe implementation file path.
 *
 * @example
 * ```ts
 * import type { SymbolFilePath } from "@beep/repo-utils"
 * type Example = SymbolFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolFilePath = typeof SymbolFilePath.Type;

/**
 * Single segment schema for a symbol name.
 *
 * @example
 * ```ts
 * import { SymbolNameSegment } from "@beep/repo-utils"
 * const value = SymbolNameSegment
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolNameSegment = S.String.check(S.isPattern(SYMBOL_NAME_SEGMENT_PATTERN)).pipe(
  S.brand("SymbolNameSegment"),
  S.annotate(
    $I.annote("SymbolNameSegment", {
      description: "A single identifier-like segment in a TypeScript symbol path.",
    })
  )
);

/**
 * Branded single symbol name segment.
 *
 * @example
 * ```ts
 * import type { SymbolNameSegment } from "@beep/repo-utils"
 * type Example = SymbolNameSegment
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolNameSegment = typeof SymbolNameSegment.Type;

/**
 * Qualified symbol name schema.
 *
 * @example
 * ```ts
 * import { SymbolQualifiedName } from "@beep/repo-utils"
 * const value = SymbolQualifiedName
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolQualifiedName = S.String.check(S.isPattern(SYMBOL_QUALIFIED_NAME_PATTERN)).pipe(
  S.brand("SymbolQualifiedName"),
  S.annotate(
    $I.annote("SymbolQualifiedName", {
      description: "Dot-delimited symbol path such as UserService.login.",
    })
  )
);

/**
 * Branded qualified symbol name.
 *
 * @example
 * ```ts
 * import type { SymbolQualifiedName } from "@beep/repo-utils"
 * type Example = SymbolQualifiedName
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolQualifiedName = typeof SymbolQualifiedName.Type;

/**
 * Supported TypeScript declaration kinds for normalized symbols.
 *
 * @example
 * ```ts
 * import { SymbolKind } from "@beep/repo-utils"
 * const value = SymbolKind
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolKind = LiteralKit(symbolKindOptions);

/**
 * Literal union of supported TypeScript declaration kinds.
 *
 * @example
 * ```ts
 * import type { SymbolKind } from "@beep/repo-utils"
 * type Example = SymbolKind
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolKind = typeof SymbolKind.Type;

/**
 * Coarse symbol categories used by the TSMorph models.
 *
 * @example
 * ```ts
 * import { SymbolCategory } from "@beep/repo-utils"
 * const value = SymbolCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolCategory = LiteralKit(["function", "class", "member", "type"] as const);

/**
 * Literal union of coarse TSMorph symbol categories.
 *
 * @example
 * ```ts
 * import type { SymbolCategory } from "@beep/repo-utils"
 * type Example = SymbolCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolCategory = typeof SymbolCategory.Type;

/**
 * Maps a declaration kind to its coarse symbol category.
 *
 * @example
 * ```ts
 * import { symbolCategoryFromKind } from "@beep/repo-utils"
 * const value = symbolCategoryFromKind
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const symbolCategoryFromKind = SymbolKind.$match({
  FunctionDeclaration: SymbolCategory.thunk.function,
  ClassDeclaration: SymbolCategory.thunk.class,
  MethodDeclaration: SymbolCategory.thunk.member,
  Constructor: SymbolCategory.thunk.member,
  GetAccessor: SymbolCategory.thunk.member,
  SetAccessor: SymbolCategory.thunk.member,
  InterfaceDeclaration: SymbolCategory.thunk.type,
  TypeAliasDeclaration: SymbolCategory.thunk.type,
  EnumDeclaration: SymbolCategory.thunk.type,
});

/**
 * Schema transformation from declaration kind to coarse symbol category.
 *
 * @example
 * ```ts
 * import { SymbolKindToCategory } from "@beep/repo-utils"
 * const value = SymbolKindToCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolKindToCategory = SymbolKind.pipe(
  S.decodeTo(SymbolCategory, {
    decode: SchemaGetter.transform(symbolCategoryFromKind),
    encode: SchemaGetter.forbidden(
      () => "Encoding SymbolCategory back to SymbolKind is not supported by SymbolKindToCategory."
    ),
  }),
  S.annotate(
    $I.annote("SymbolKindToCategory", {
      description: "One-way schema transformation from exact TypeScript declaration kind to coarse symbol category.",
    })
  )
);

/**
 * Output type produced by `SymbolKindToCategory`.
 *
 * @example
 * ```ts
 * import type { SymbolKindToCategory } from "@beep/repo-utils"
 * type Example = SymbolKindToCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolKindToCategory = typeof SymbolKindToCategory.Type;

/**
 * Non-empty source text schema.
 *
 * @example
 * ```ts
 * import { SourceText } from "@beep/repo-utils"
 * const value = SourceText
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SourceText = S.NonEmptyString.pipe(
  S.brand("SourceText"),
  S.annotate(
    $I.annote("SourceText", {
      description: "Non-empty source text extracted from a TypeScript file or declaration.",
    })
  )
);

/**
 * Branded non-empty source text.
 *
 * @example
 * ```ts
 * import type { SourceText } from "@beep/repo-utils"
 * type Example = SourceText
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SourceText = typeof SourceText.Type;

/**
 * Positive 1-based line number schema.
 *
 * @example
 * ```ts
 * import { LineNumber } from "@beep/repo-utils"
 * const value = LineNumber
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const LineNumber = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("LineNumber"),
  S.annotate(
    $I.annote("LineNumber", {
      description: "A positive 1-based line number.",
    })
  )
);

/**
 * Branded positive 1-based line number.
 *
 * @example
 * ```ts
 * import type { LineNumber } from "@beep/repo-utils"
 * type Example = LineNumber
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type LineNumber = typeof LineNumber.Type;

/**
 * Positive 1-based column number schema.
 *
 * @example
 * ```ts
 * import { ColumnNumber } from "@beep/repo-utils"
 * const value = ColumnNumber
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ColumnNumber = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("ColumnNumber"),
  S.annotate(
    $I.annote("ColumnNumber", {
      description: "A positive 1-based column number.",
    })
  )
);

/**
 * Branded positive 1-based column number.
 *
 * @example
 * ```ts
 * import type { ColumnNumber } from "@beep/repo-utils"
 * type Example = ColumnNumber
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ColumnNumber = typeof ColumnNumber.Type;

/**
 * Non-negative byte offset schema.
 *
 * @example
 * ```ts
 * import { ByteOffset } from "@beep/repo-utils"
 * const value = ByteOffset
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ByteOffset = NonNegativeInt.pipe(
  S.brand("ByteOffset"),
  S.annotate(
    $I.annote("ByteOffset", {
      description: "A non-negative byte offset within a source file.",
    })
  )
);

/**
 * Branded non-negative byte offset.
 *
 * @example
 * ```ts
 * import type { ByteOffset } from "@beep/repo-utils"
 * type Example = ByteOffset
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ByteOffset = typeof ByteOffset.Type;

/**
 * Non-negative byte length schema.
 *
 * @example
 * ```ts
 * import { ByteLength } from "@beep/repo-utils"
 * const value = ByteLength
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ByteLength = NonNegativeInt.pipe(
  S.brand("ByteLength"),
  S.annotate(
    $I.annote("ByteLength", {
      description: "A non-negative byte length for a source span.",
    })
  )
);

/**
 * Branded non-negative byte length.
 *
 * @example
 * ```ts
 * import type { ByteLength } from "@beep/repo-utils"
 * type Example = ByteLength
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ByteLength = typeof ByteLength.Type;

/**
 * SHA-256 content hash schema.
 *
 * @example
 * ```ts
 * import { ContentHash } from "@beep/repo-utils"
 * const value = ContentHash
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ContentHash = Sha256Hex.pipe(
  S.brand("ContentHash"),
  S.annotate(
    $I.annote("ContentHash", {
      description: "Canonical SHA-256 digest for source text or symbol content.",
    })
  )
);

/**
 * Branded SHA-256 content hash.
 *
 * @example
 * ```ts
 * import type { ContentHash } from "@beep/repo-utils"
 * type Example = ContentHash
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ContentHash = typeof ContentHash.Type;

/**
 * Supported ts-morph project scope modes.
 *
 * @example
 * ```ts
 * import { TsMorphScopeMode } from "@beep/repo-utils"
 * const value = TsMorphScopeMode
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphScopeMode = LiteralKit(["syntax", "semantic"] as const);

/**
 * Literal union of ts-morph project scope modes.
 *
 * @example
 * ```ts
 * import type { TsMorphScopeMode } from "@beep/repo-utils"
 * type Example = TsMorphScopeMode
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphScopeMode = typeof TsMorphScopeMode.Type;

/**
 * Reference traversal policies for ts-morph scope resolution.
 *
 * @example
 * ```ts
 * import { TsMorphReferencePolicy } from "@beep/repo-utils"
 * const value = TsMorphReferencePolicy
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphReferencePolicy = LiteralKit(["workspaceOnly", "followReferences"] as const);

/**
 * Literal union of ts-morph reference traversal policies.
 *
 * @example
 * ```ts
 * import type { TsMorphReferencePolicy } from "@beep/repo-utils"
 * type Example = TsMorphReferencePolicy
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphReferencePolicy = typeof TsMorphReferencePolicy.Type;

const resolvedProjectIdentity = S.TemplateLiteral([
  TsConfigFilePath,
  "::",
  TsMorphScopeMode,
  "#",
  TsMorphReferencePolicy,
]);

/**
 * Stable identity schema for a resolved ts-morph project scope.
 *
 * @example
 * ```ts
 * import { ProjectScopeId } from "@beep/repo-utils"
 * const value = ProjectScopeId
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ProjectScopeId = resolvedProjectIdentity.pipe(
  S.brand("ProjectScopeId"),
  S.annotate(
    $I.annote("ProjectScopeId", {
      description: "Stable resolved ts-morph scope identity string: tsconfig::mode#referencePolicy.",
    })
  )
);

/**
 * Branded stable identity for a resolved ts-morph project scope.
 *
 * @example
 * ```ts
 * import type { ProjectScopeId } from "@beep/repo-utils"
 * type Example = ProjectScopeId
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ProjectScopeId = typeof ProjectScopeId.Type;

/**
 * Parsed components of a `ProjectScopeId`.
 *
 * @example
 * ```ts
 * import { ProjectScopeIdParts } from "@beep/repo-utils"
 * const value = ProjectScopeIdParts
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ProjectScopeIdParts = S.TemplateLiteralParser([
  TsConfigFilePath,
  "::",
  TsMorphScopeMode,
  "#",
  TsMorphReferencePolicy,
]).annotate(
  $I.annote("ProjectScopeIdParts", {
    description: "Parsed project scope identity tuple for tsconfig path, scope mode, and reference policy.",
  })
);

/**
 * Cache key schema for memoized ts-morph projects.
 *
 * @example
 * ```ts
 * import { ProjectCacheKey } from "@beep/repo-utils"
 * const value = ProjectCacheKey
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ProjectCacheKey = resolvedProjectIdentity.pipe(
  S.brand("ProjectCacheKey"),
  S.annotate(
    $I.annote("ProjectCacheKey", {
      description: "Cache-key string for a memoized ts-morph project instance.",
    })
  )
);

/**
 * Branded cache key for memoized ts-morph projects.
 *
 * @example
 * ```ts
 * import type { ProjectCacheKey } from "@beep/repo-utils"
 * type Example = ProjectCacheKey
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type ProjectCacheKey = typeof ProjectCacheKey.Type;

/**
 * Stable symbol identity schema.
 *
 * @example
 * ```ts
 * import { SymbolId } from "@beep/repo-utils"
 * const value = SymbolId
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolId = S.TemplateLiteral([SymbolFilePath, "::", SymbolQualifiedName, "#", SymbolKind]).pipe(
  S.brand("SymbolId"),
  S.annotate(
    $I.annote("SymbolId", {
      description: "Stable TypeScript symbol identity string: file::qualifiedName#kind",
    })
  )
);

/**
 * Branded stable symbol identity.
 *
 * @example
 * ```ts
 * import type { SymbolId } from "@beep/repo-utils"
 * type Example = SymbolId
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolId = typeof SymbolId.Type;

/**
 * Parsed components of a `SymbolId`.
 *
 * @example
 * ```ts
 * import { SymbolIdParts } from "@beep/repo-utils"
 * const value = SymbolIdParts
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const SymbolIdParts = S.TemplateLiteralParser([
  SymbolFilePath,
  "::",
  SymbolQualifiedName,
  "#",
  SymbolKind,
]).annotate(
  $I.annote("SymbolIdParts", {
    description: "Parsed symbol id parts for file path, qualified name, and exact kind.",
  })
);

/**
 * Schema transformation from a generic file path to a `TsConfigFilePath`.
 *
 * @example
 * ```ts
 * import { FilePathToTsConfigFilePath } from "@beep/repo-utils"
 * const value = FilePathToTsConfigFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const FilePathToTsConfigFilePath = FilePath.pipe(
  S.decodeTo(TsConfigFilePath, {
    decode: SchemaGetter.passthrough({ strict: false }),
    encode: SchemaGetter.passthrough({ strict: false }),
  }),
  S.annotate(
    $I.annote("FilePathToTsConfigFilePath", {
      description: "Schema transformation from a generic file path to a validated tsconfig file path.",
    })
  )
);

/**
 * Schema transformation from a generic file path to a TypeScript implementation file path.
 *
 * @example
 * ```ts
 * import { FilePathToTypeScriptImplementationFilePath } from "@beep/repo-utils"
 * const value = FilePathToTypeScriptImplementationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const FilePathToTypeScriptImplementationFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptImplementationFilePath, {
    decode: SchemaGetter.passthrough({ strict: false }),
    encode: SchemaGetter.passthrough({ strict: false }),
  }),
  S.annotate(
    $I.annote("FilePathToTypeScriptImplementationFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript implementation file path.",
    })
  )
);

/**
 * Schema transformation from a generic file path to a TypeScript declaration file path.
 *
 * @example
 * ```ts
 * import { FilePathToTypeScriptDeclarationFilePath } from "@beep/repo-utils"
 * const value = FilePathToTypeScriptDeclarationFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const FilePathToTypeScriptDeclarationFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptDeclarationFilePath, {
    decode: SchemaGetter.passthrough({ strict: false }),
    encode: SchemaGetter.passthrough({ strict: false }),
  }),
  S.annotate(
    $I.annote("FilePathToTypeScriptDeclarationFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript declaration file path.",
    })
  )
);

/**
 * Schema transformation from a generic file path to a TypeScript source file path.
 *
 * @example
 * ```ts
 * import { FilePathToTypeScriptFilePath } from "@beep/repo-utils"
 * const value = FilePathToTypeScriptFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const FilePathToTypeScriptFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptFilePath, {
    decode: SchemaGetter.passthrough({ strict: false }),
    encode: SchemaGetter.passthrough({ strict: false }),
  }),
  S.annotate(
    $I.annote("FilePathToTypeScriptFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript source file path.",
    })
  )
);

/**
 * Schema transformation from a TypeScript implementation file path to a symbol-safe file path.
 *
 * @example
 * ```ts
 * import { TypeScriptImplementationFilePathToSymbolFilePath } from "@beep/repo-utils"
 * const value = TypeScriptImplementationFilePathToSymbolFilePath
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TypeScriptImplementationFilePathToSymbolFilePath = TypeScriptImplementationFilePath.pipe(
  S.decodeTo(SymbolFilePath, {
    decode: SchemaGetter.passthrough({ strict: false }),
    encode: SchemaGetter.passthrough({ strict: false }),
  }),
  S.annotate(
    $I.annote("TypeScriptImplementationFilePathToSymbolFilePath", {
      description: "Schema transformation from a TypeScript implementation file path to a symbol-id-safe file path.",
    })
  )
);

const decodeSymbolId = S.decodeUnknownSync(SymbolId);
const decodeProjectScopeId = S.decodeUnknownSync(ProjectScopeId);
const decodeContentHash = S.decodeUnknownSync(ContentHash);
const decodeSha256HexFromBytesEffect = S.decodeUnknownEffect(Sha256HexFromBytes);

/**
 * Effectful one-way schema transformation from source bytes to a canonical content hash.
 *
 * @example
 * ```ts
 * import { ContentHashFromBytes } from "@beep/repo-utils"
 * const value = ContentHashFromBytes
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ContentHashFromBytes = S.Uint8Array.pipe(
  S.decodeTo(ContentHash, {
    decode: SchemaGetter.transformOrFail((value) =>
      decodeSha256HexFromBytesEffect(value).pipe(
        Effect.mapError((error) => error.issue),
        Effect.map(decodeContentHash)
      )
    ),
    encode: SchemaGetter.forbidden(
      () => "Encoding ContentHash back to original bytes is not supported by ContentHashFromBytes."
    ),
  }),
  S.annotate(
    $I.annote("ContentHashFromBytes", {
      description: "Effectful one-way schema transformation from source bytes to a canonical content hash.",
    })
  )
);

const textEncoder = new TextEncoder();
const decodeContentHashFromBytesEffect = S.decodeUnknownEffect(ContentHashFromBytes);

/**
 * Effectful one-way schema transformation from source text to a canonical content hash.
 *
 * @example
 * ```ts
 * import { ContentHashFromSourceText } from "@beep/repo-utils"
 * const value = ContentHashFromSourceText
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const ContentHashFromSourceText = SourceText.pipe(
  S.decodeTo(ContentHash, {
    decode: SchemaGetter.transformOrFail((value) =>
      decodeContentHashFromBytesEffect(textEncoder.encode(value)).pipe(Effect.mapError((error) => error.issue))
    ),
    encode: SchemaGetter.forbidden(
      () => "Encoding ContentHash back to original source text is not supported by ContentHashFromSourceText."
    ),
  }),
  S.annotate(
    $I.annote("ContentHashFromSourceText", {
      description: "Effectful one-way schema transformation from source text to a canonical content hash.",
    })
  )
);

/**
 * Internal runtime schemas.
 * These are intentionally not re-exported from the package entrypoint.
 *
 * @example
 * ```ts
 * import { InternalTsMorphProject } from "@beep/repo-utils"
 * const value = InternalTsMorphProject
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const InternalTsMorphProject = S.instanceOf(Project).pipe(
  S.annotate(
    $I.annote("InternalTsMorphProject", {
      description: "Internal runtime schema for a live ts-morph Project instance.",
    })
  )
);

/**
 * Internal runtime schema for a live ts-morph SourceFile instance.
 *
 * @example
 * ```ts
 * import { InternalTsMorphSourceFile } from "@beep/repo-utils"
 * const value = InternalTsMorphSourceFile
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const InternalTsMorphSourceFile = S.declare<SourceFile>(
  (value): value is SourceFile => value instanceof SourceFile
).pipe(
  S.annotate(
    $I.annote("InternalTsMorphSourceFile", {
      description: "Internal runtime schema for a live ts-morph SourceFile instance.",
    })
  )
);

/**
 * Internal runtime schema for a live ts-morph Node instance.
 *
 * @example
 * ```ts
 * import { InternalTsMorphNode } from "@beep/repo-utils"
 * const value = InternalTsMorphNode
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const InternalTsMorphNode = S.declare<TsMorphNode>(
  (value): value is TsMorphNode => value instanceof TsMorphNode
).pipe(
  S.annotate(
    $I.annote("InternalTsMorphNode", {
      description: "Internal runtime schema for a live ts-morph Node instance.",
    })
  )
);

/**
 * TS-native symbol record with strict identity, kind, and source-location metadata.
 *
 * @example
 * ```ts
 * import { Symbol as TsMorphSymbol } from "@beep/repo-utils"
 * const schema = TsMorphSymbol
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class Symbol extends S.Class<Symbol>($I`Symbol`)(
  {
    id: SymbolId.annotateKey({
      description: "Stable symbol identity string.",
    }),
    filePath: SymbolFilePath.annotateKey({
      description: "Repo-relative path to the TypeScript implementation source file.",
    }),
    name: SymbolNameSegment.annotateKey({
      description: "Leaf symbol name segment.",
    }),
    qualifiedName: SymbolQualifiedName.annotateKey({
      description: "Dot-delimited symbol path including parent ownership.",
    }),
    kind: SymbolKind.annotateKey({
      description: "Exact TypeScript declaration syntax kind.",
    }),
    category: SymbolCategory.annotateKey({
      description: "Derived coarse category for search and presentation.",
    }),
    signature: S.NonEmptyString.annotateKey({
      description: "Source signature text for the declaration.",
    }),
    docstring: S.OptionFromNullOr(S.NonEmptyString).annotateKey({
      description: "Optional documentation block extracted from the symbol.",
    }),
    summary: S.OptionFromNullOr(S.NonEmptyString).annotateKey({
      description: "Optional one-line summary for quick retrieval results.",
    }),
    decorators: ArrayOfNonEmptyStrings.annotateKey({
      description: "Decorator names or decorator expressions applied to the symbol.",
    }),
    keywords: ArrayOfNonEmptyStrings.annotateKey({
      description: "Search keywords derived from the symbol.",
    }),
    parentId: S.OptionFromNullOr(SymbolId).annotateKey({
      description: "Optional parent symbol id for owned members.",
    }),
    startLine: LineNumber.annotateKey({
      description: "1-based line number where the symbol starts.",
    }),
    endLine: LineNumber.annotateKey({
      description: "1-based line number where the symbol ends.",
    }),
    byteOffset: ByteOffset.annotateKey({
      description: "Byte offset of the symbol start within the source file.",
    }),
    byteLength: ByteLength.annotateKey({
      description: "Byte length of the full symbol source.",
    }),
    contentHash: ContentHash.annotateKey({
      description: "SHA-256 digest of the symbol source content.",
    }),
  },
  $I.annote("Symbol", {
    description: "TS-native symbol record with strict identity, kind, and source-location metadata.",
  })
) {}

/**
 * Namespace helpers for normalized TSMorph symbols.
 *
 * @example
 * ```ts
 * import { Symbol as TsMorphSymbol } from "@beep/repo-utils"
 * const schema = TsMorphSymbol
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export declare namespace Symbol {
  /**
   * Runtime-decoded `Symbol` value type.
   *
   * @example
   * ```ts
   * import type { Symbol as TsMorphSymbol } from "@beep/repo-utils"
   * type Example = TsMorphSymbol.Type
   * ```
   * @category DomainModel
   * @since 0.0.0
   */
  export type Type = typeof Symbol.Type;
  /**
   * Encoded representation of a `Symbol` value.
   *
   * @example
   * ```ts
   * import type { Symbol as TsMorphSymbol } from "@beep/repo-utils"
   * type Example = TsMorphSymbol.Encoded
   * ```
   * @category DomainModel
   * @since 0.0.0
   */
  export type Encoded = typeof Symbol.Encoded;
}

/**
 * Input shape for constructing a normalized `Symbol`.
 *
 * @example
 * ```ts
 * import type { SymbolInit } from "@beep/repo-utils"
 * type Example = SymbolInit
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type SymbolInit = Omit<Symbol.Type, "id" | "category"> & {
  readonly id?: SymbolId | undefined;
  readonly category?: SymbolCategory | undefined;
};

/**
 * Builds a stable `SymbolId` from validated symbol identity parts.
 *
 * @param parts - Validated symbol identity parts containing the file path, qualified name, and declaration kind.
 * @returns Stable symbol identifier.
 * @example
 * ```ts
 * import { makeSymbolId } from "@beep/repo-utils"
 * const value = makeSymbolId
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const makeSymbolId = (parts: {
  readonly filePath: SymbolFilePath;
  readonly qualifiedName: SymbolQualifiedName;
  readonly kind: SymbolKind;
}): SymbolId => decodeSymbolId(`${parts.filePath}::${parts.qualifiedName}#${parts.kind}`);

/**
 * Builds a stable `ProjectScopeId` from validated scope identity parts.
 *
 * @param parts - Validated scope identity parts containing the tsconfig path, scope mode, and reference policy.
 * @returns Stable project scope identifier.
 * @example
 * ```ts
 * import { makeProjectScopeId } from "@beep/repo-utils"
 * const value = makeProjectScopeId
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const makeProjectScopeId = (parts: {
  readonly tsConfigPath: TsConfigFilePath;
  readonly mode: TsMorphScopeMode;
  readonly referencePolicy: TsMorphReferencePolicy;
}): ProjectScopeId => decodeProjectScopeId(`${parts.tsConfigPath}::${parts.mode}#${parts.referencePolicy}`);

const decodeProjectCacheKey = S.decodeUnknownSync(ProjectCacheKey);

/**
 * Builds a stable `ProjectCacheKey` from validated scope identity parts.
 *
 * @param parts - Validated cache identity parts containing the tsconfig path, scope mode, and reference policy.
 * @returns Stable project cache key.
 * @example
 * ```ts
 * import { makeProjectCacheKey } from "@beep/repo-utils"
 * const value = makeProjectCacheKey
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const makeProjectCacheKey = (parts: {
  readonly tsConfigPath: TsConfigFilePath;
  readonly mode: TsMorphScopeMode;
  readonly referencePolicy: TsMorphReferencePolicy;
}): ProjectCacheKey => decodeProjectCacheKey(`${parts.tsConfigPath}::${parts.mode}#${parts.referencePolicy}`);

/**
 * Normalizes symbol input by deriving missing identity and category fields.
 *
 * @param input - Symbol fields to normalize into a `Symbol` instance.
 * @returns Normalized symbol instance.
 * @example
 * ```ts
 * import { makeSymbol } from "@beep/repo-utils"
 * const value = makeSymbol
 * ```
 * @category Utility
 * @since 0.0.0
 */
export const makeSymbol = (input: SymbolInit): Symbol =>
  new Symbol({
    ...input,
    id:
      input.id ??
      makeSymbolId({
        filePath: input.filePath,
        qualifiedName: input.qualifiedName,
        kind: input.kind,
      }),
    category: input.category ?? symbolCategoryFromKind(input.kind),
  });

class TsMorphScopeEntrypointTsConfig extends S.Class<TsMorphScopeEntrypointTsConfig>(
  $I`TsMorphScopeEntrypointTsConfig`
)(
  {
    _tag: S.tag("tsconfig"),
    tsConfigPath: TsConfigFilePath,
  },
  $I.annote("TsMorphScopeEntrypointTsConfig", {
    description: "Scope entrypoint that directly targets a tsconfig file.",
  })
) {}

class TsMorphScopeEntrypointFile extends S.Class<TsMorphScopeEntrypointFile>($I`TsMorphScopeEntrypointFile`)(
  {
    _tag: S.tag("file"),
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphScopeEntrypointFile", {
    description: "Scope entrypoint that resolves an owning tsconfig from a TypeScript file path.",
  })
) {}

/**
 * Tagged union schema for ts-morph scope resolution entrypoints.
 *
 * @example
 * ```ts
 * import { TsMorphScopeEntrypoint } from "@beep/repo-utils"
 * const value = TsMorphScopeEntrypoint
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphScopeEntrypoint = S.Union([TsMorphScopeEntrypointTsConfig, TsMorphScopeEntrypointFile])
  .annotate(
    $I.annote("TsMorphScopeEntrypointBase", {
      description: "Tagged union describing how a ts-morph scope should be resolved.",
    })
  )
  .pipe(S.toTaggedUnion("_tag"));

/**
 * Decoded ts-morph scope entrypoint union.
 *
 * @example
 * ```ts
 * import type { TsMorphScopeEntrypoint } from "@beep/repo-utils"
 * type Example = TsMorphScopeEntrypoint
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphScopeEntrypoint = typeof TsMorphScopeEntrypoint.Type;

/**
 * Request schema for resolving a ts-morph project scope.
 *
 * @example
 * ```ts
 * import { TsMorphProjectScopeRequest } from "@beep/repo-utils"
 * const value = TsMorphProjectScopeRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphProjectScopeRequest extends S.Class<TsMorphProjectScopeRequest>($I`TsMorphProjectScopeRequest`)(
  {
    entrypoint: TsMorphScopeEntrypoint,
    repoRootPath: S.OptionFromNullOr(RepoRootPath),
    mode: TsMorphScopeMode,
    referencePolicy: TsMorphReferencePolicy,
  },
  $I.annote("TsMorphProjectScopeRequest", {
    description: "Request to resolve a ts-morph project scope from a file or tsconfig entrypoint.",
  })
) {}

/**
 * Request schema for read-only ts-morph project inspection.
 *
 * @example
 * ```ts
 * import { TsMorphProjectInspectionRequest } from "@beep/repo-utils"
 * const value = TsMorphProjectInspectionRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphProjectInspectionRequest extends S.Class<TsMorphProjectInspectionRequest>(
  $I`TsMorphProjectInspectionRequest`
)(
  {
    entrypoint: TsMorphScopeEntrypoint,
    repoRootPath: S.OptionFromNullOr(RepoRootPath),
    mode: TsMorphScopeMode,
    referencePolicy: TsMorphReferencePolicy,
    filePaths: S.Array(TypeScriptImplementationFilePath),
    sourceFileGlobs: S.Array(S.NonEmptyString),
  },
  $I.annote("TsMorphProjectInspectionRequest", {
    description:
      "Request to inspect a resolved ts-morph project with optional source file loading without persisting edits.",
  })
) {}

/**
 * Resolved ts-morph project scope payload.
 *
 * @example
 * ```ts
 * import { TsMorphProjectScope } from "@beep/repo-utils"
 * const value = TsMorphProjectScope
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphProjectScope extends S.Class<TsMorphProjectScope>($I`TsMorphProjectScope`)(
  {
    scopeId: ProjectScopeId,
    cacheKey: ProjectCacheKey,
    repoRootPath: RepoRootPath,
    workspaceDirectoryPath: WorkspaceDirectoryPath,
    tsConfigPath: TsConfigFilePath,
    mode: TsMorphScopeMode,
    referencePolicy: TsMorphReferencePolicy,
  },
  $I.annote("TsMorphProjectScope", {
    description: "Resolved ts-morph project scope with stable identity and workspace boundaries.",
  })
) {}

/**
 * Request schema for extracting a file outline.
 *
 * @example
 * ```ts
 * import { TsMorphFileOutlineRequest } from "@beep/repo-utils"
 * const value = TsMorphFileOutlineRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphFileOutlineRequest extends S.Class<TsMorphFileOutlineRequest>($I`TsMorphFileOutlineRequest`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphFileOutlineRequest", {
    description: "Request to extract top-level outline symbols from a TypeScript file within a resolved scope.",
  })
) {}

/**
 * File outline payload for a TypeScript source file.
 *
 * @example
 * ```ts
 * import { TsMorphFileOutline } from "@beep/repo-utils"
 * const value = TsMorphFileOutline
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphFileOutline extends S.Class<TsMorphFileOutline>($I`TsMorphFileOutline`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
    symbols: S.Array(Symbol),
  },
  $I.annote("TsMorphFileOutline", {
    description: "Normalized file outline for a TypeScript source file.",
  })
) {}

/**
 * Request schema for reading file source text.
 *
 * @example
 * ```ts
 * import { TsMorphSourceTextRequest } from "@beep/repo-utils"
 * const value = TsMorphSourceTextRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSourceTextRequest extends S.Class<TsMorphSourceTextRequest>($I`TsMorphSourceTextRequest`)(
  {
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphSourceTextRequest", {
    description: "Request to read normalized source text for a TypeScript file.",
  })
) {}

/**
 * Source text payload for a TypeScript file.
 *
 * @example
 * ```ts
 * import { TsMorphSourceTextResult } from "@beep/repo-utils"
 * const value = TsMorphSourceTextResult
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSourceTextResult extends S.Class<TsMorphSourceTextResult>($I`TsMorphSourceTextResult`)(
  {
    filePath: TypeScriptFilePath,
    sourceText: SourceText,
    contentHash: ContentHash,
  },
  $I.annote("TsMorphSourceTextResult", {
    description: "Source text payload and content hash for a TypeScript file.",
  })
) {}

/**
 * Request schema for symbol lookup by stable identifier.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolLookupRequest } from "@beep/repo-utils"
 * const value = TsMorphSymbolLookupRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolLookupRequest extends S.Class<TsMorphSymbolLookupRequest>($I`TsMorphSymbolLookupRequest`)(
  {
    scopeId: ProjectScopeId,
    symbolId: SymbolId,
  },
  $I.annote("TsMorphSymbolLookupRequest", {
    description: "Request to load a normalized symbol by its stable symbol id within a resolved scope.",
  })
) {}

/**
 * Symbol lookup result payload.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolLookupResult } from "@beep/repo-utils"
 * const value = TsMorphSymbolLookupResult
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolLookupResult extends S.Class<TsMorphSymbolLookupResult>($I`TsMorphSymbolLookupResult`)(
  {
    scopeId: ProjectScopeId,
    symbol: Symbol,
  },
  $I.annote("TsMorphSymbolLookupResult", {
    description: "Resolved normalized symbol payload for a symbol lookup request.",
  })
) {}

/**
 * Positive result-limit schema for ts-morph search.
 *
 * @example
 * ```ts
 * import { TsMorphSearchLimit } from "@beep/repo-utils"
 * const value = TsMorphSearchLimit
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphSearchLimit = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("TsMorphSearchLimit"),
  S.annotate(
    $I.annote("TsMorphSearchLimit", {
      description: "Positive result limit for ts-morph-backed search operations.",
    })
  )
);

/**
 * Branded positive result limit for ts-morph search.
 *
 * @example
 * ```ts
 * import type { TsMorphSearchLimit } from "@beep/repo-utils"
 * type Example = TsMorphSearchLimit
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphSearchLimit = typeof TsMorphSearchLimit.Type;

/**
 * Request schema for symbol search within a resolved scope.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolSearchRequest } from "@beep/repo-utils"
 * const value = TsMorphSymbolSearchRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolSearchRequest extends S.Class<TsMorphSymbolSearchRequest>($I`TsMorphSymbolSearchRequest`)(
  {
    scopeId: ProjectScopeId,
    query: S.NonEmptyString,
    categories: S.Array(SymbolCategory),
    kinds: S.Array(SymbolKind),
    limit: TsMorphSearchLimit,
  },
  $I.annote("TsMorphSymbolSearchRequest", {
    description: "Request to search normalized symbols within a resolved ts-morph scope.",
  })
) {}

/**
 * Symbol search result payload.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolSearchResult } from "@beep/repo-utils"
 * const value = TsMorphSymbolSearchResult
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolSearchResult extends S.Class<TsMorphSymbolSearchResult>($I`TsMorphSymbolSearchResult`)(
  {
    scopeId: ProjectScopeId,
    query: S.NonEmptyString,
    limit: TsMorphSearchLimit,
    symbols: S.Array(Symbol),
    total: NonNegativeInt,
  },
  $I.annote("TsMorphSymbolSearchResult", {
    description: "Normalized symbol search results for a query within a resolved scope.",
  })
) {}

/**
 * Request schema for reading symbol source text.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolSourceRequest } from "@beep/repo-utils"
 * const value = TsMorphSymbolSourceRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolSourceRequest extends S.Class<TsMorphSymbolSourceRequest>($I`TsMorphSymbolSourceRequest`)(
  {
    scopeId: ProjectScopeId,
    symbolId: SymbolId,
  },
  $I.annote("TsMorphSymbolSourceRequest", {
    description: "Request to read source text for a normalized symbol by its stable id.",
  })
) {}

/**
 * Symbol source payload including extracted text.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolSourceResult } from "@beep/repo-utils"
 * const value = TsMorphSymbolSourceResult
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolSourceResult extends S.Class<TsMorphSymbolSourceResult>($I`TsMorphSymbolSourceResult`)(
  {
    scopeId: ProjectScopeId,
    symbol: Symbol,
    sourceText: SourceText,
    contentHash: ContentHash,
  },
  $I.annote("TsMorphSymbolSourceResult", {
    description: "Normalized symbol payload together with extracted source text.",
  })
) {}

/**
 * Supported normalized diagnostic categories.
 *
 * @example
 * ```ts
 * import { TsMorphDiagnosticCategory } from "@beep/repo-utils"
 * const value = TsMorphDiagnosticCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphDiagnosticCategory = LiteralKit(["error", "warning", "suggestion", "message"] as const);

/**
 * Literal union of normalized diagnostic categories.
 *
 * @example
 * ```ts
 * import type { TsMorphDiagnosticCategory } from "@beep/repo-utils"
 * type Example = TsMorphDiagnosticCategory
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphDiagnosticCategory = typeof TsMorphDiagnosticCategory.Type;

class TsMorphDiagnosticBase extends S.Class<TsMorphDiagnosticBase>($I`TsMorphDiagnosticBase`)(
  {
    code: NonNegativeInt,
    message: S.NonEmptyString,
    source: S.OptionFromNullOr(S.NonEmptyString),
    startLine: LineNumber,
    startColumn: ColumnNumber,
    endLine: LineNumber,
    endColumn: ColumnNumber,
  },
  $I.annote("TsMorphDiagnosticBase", {
    description: "Shared fields for normalized TypeScript diagnostics within a resolved scope.",
  })
) {}

class TsMorphDiagnosticError extends TsMorphDiagnosticBase.extend<TsMorphDiagnosticError>($I`TsMorphDiagnosticError`)(
  {
    category: S.tag("error"),
  },
  $I.annote("TsMorphDiagnosticError", {
    description: "Normalized TypeScript error diagnostic.",
  })
) {}

class TsMorphDiagnosticWarning extends TsMorphDiagnosticBase.extend<TsMorphDiagnosticWarning>(
  $I`TsMorphDiagnosticWarning`
)(
  {
    category: S.tag("warning"),
  },
  $I.annote("TsMorphDiagnosticWarning", {
    description: "Normalized TypeScript warning diagnostic.",
  })
) {}

class TsMorphDiagnosticSuggestion extends TsMorphDiagnosticBase.extend<TsMorphDiagnosticSuggestion>(
  $I`TsMorphDiagnosticSuggestion`
)(
  {
    category: S.tag("suggestion"),
  },
  $I.annote("TsMorphDiagnosticSuggestion", {
    description: "Normalized TypeScript suggestion diagnostic.",
  })
) {}

class TsMorphDiagnosticMessage extends TsMorphDiagnosticBase.extend<TsMorphDiagnosticMessage>(
  $I`TsMorphDiagnosticMessage`
)(
  {
    category: S.tag("message"),
  },
  $I.annote("TsMorphDiagnosticMessage", {
    description: "Normalized TypeScript message diagnostic.",
  })
) {}

/**
 * Tagged union schema for normalized TypeScript diagnostics.
 *
 * @returns Tagged union schema keyed by diagnostic category.
 * @example
 * ```ts
 * import { TsMorphDiagnostic } from "@beep/repo-utils"
 * const value = TsMorphDiagnostic
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TsMorphDiagnostic = TsMorphDiagnosticCategory.mapMembers(
  Tuple.evolve([
    () => TsMorphDiagnosticError,
    () => TsMorphDiagnosticWarning,
    () => TsMorphDiagnosticSuggestion,
    () => TsMorphDiagnosticMessage,
  ])
)
  .annotate(
    $I.annote("TsMorphDiagnostic", {
      description: "Tagged union of normalized TypeScript diagnostics keyed by category.",
    })
  )
  .pipe(S.toTaggedUnion("category"));

/**
 * Decoded normalized TypeScript diagnostic union.
 *
 * @example
 * ```ts
 * import type { TsMorphDiagnostic } from "@beep/repo-utils"
 * type Example = TsMorphDiagnostic
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TsMorphDiagnostic = typeof TsMorphDiagnostic.Type;

/**
 * Request schema for TypeScript diagnostics in a resolved scope.
 *
 * @example
 * ```ts
 * import { TsMorphDiagnosticsRequest } from "@beep/repo-utils"
 * const value = TsMorphDiagnosticsRequest
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphDiagnosticsRequest extends S.Class<TsMorphDiagnosticsRequest>($I`TsMorphDiagnosticsRequest`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphDiagnosticsRequest", {
    description: "Request to compute normalized diagnostics for a TypeScript file within a resolved scope.",
  })
) {}

/**
 * Diagnostics payload for a TypeScript file.
 *
 * @example
 * ```ts
 * import { TsMorphDiagnosticsResult } from "@beep/repo-utils"
 * const value = TsMorphDiagnosticsResult
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphDiagnosticsResult extends S.Class<TsMorphDiagnosticsResult>($I`TsMorphDiagnosticsResult`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
    diagnostics: S.Array(TsMorphDiagnostic),
  },
  $I.annote("TsMorphDiagnosticsResult", {
    description: "Normalized diagnostics payload for a TypeScript file within a resolved scope.",
  })
) {}
