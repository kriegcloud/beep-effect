import { $RepoUtilsId } from "@beep/identity/packages";
import {
  ArrayOfNonEmptyStrings,
  FilePath,
  LiteralKit,
  NonNegativeInt,
  Sha256Hex,
  Sha256HexFromBytes,
} from "@beep/schema";
import { Effect, identity, Option as O, SchemaIssue, SchemaTransformation } from "effect";
import * as S from "effect/Schema";
import { Node as TsMorphNode, Project, SourceFile } from "ts-morph";
import { TSSyntaxKind } from "../TypeScript/models/TSSyntaxKind.model.ts";

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

const encodeUnsupported =
  (message: string) =>
  (value: unknown): Effect.Effect<never, SchemaIssue.Issue> =>
    Effect.fail(
      new SchemaIssue.InvalidValue(O.some(value), {
        message,
      })
    );

const stringIdentityTransform = SchemaTransformation.transform({
  decode: identity,
  encode: identity,
});

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

export const RepoRootPath = FilePath.pipe(
  S.brand("RepoRootPath"),
  S.annotate(
    $I.annote("RepoRootPath", {
      description: "Absolute or repo-anchored path representing the repository root directory.",
    })
  )
);

export type RepoRootPath = typeof RepoRootPath.Type;

export const WorkspaceDirectoryPath = FilePath.pipe(
  S.brand("WorkspaceDirectoryPath"),
  S.annotate(
    $I.annote("WorkspaceDirectoryPath", {
      description: "Directory path representing a workspace root inside the repository.",
    })
  )
);

export type WorkspaceDirectoryPath = typeof WorkspaceDirectoryPath.Type;

export const TsConfigFilePath = FilePath.check(tsConfigFilePathChecks).pipe(
  S.brand("TsConfigFilePath"),
  S.annotate(
    $I.annote("TsConfigFilePath", {
      description: "A tsconfig*.json file path that is safe to embed in TSMorph scope identities.",
    })
  )
);

export type TsConfigFilePath = typeof TsConfigFilePath.Type;

export const TypeScriptImplementationFilePath = FilePath.check(typeScriptImplementationFilePathChecks).pipe(
  S.brand("TypeScriptImplementationFilePath"),
  S.annotate(
    $I.annote("TypeScriptImplementationFilePath", {
      description: "A TypeScript implementation file path for .ts, .tsx, .mts, or .cts files.",
    })
  )
);

export type TypeScriptImplementationFilePath = typeof TypeScriptImplementationFilePath.Type;

export const TypeScriptDeclarationFilePath = FilePath.check(typeScriptDeclarationFilePathChecks).pipe(
  S.brand("TypeScriptDeclarationFilePath"),
  S.annotate(
    $I.annote("TypeScriptDeclarationFilePath", {
      description: "A TypeScript declaration file path for .d.ts, .d.mts, or .d.cts files.",
    })
  )
);

export type TypeScriptDeclarationFilePath = typeof TypeScriptDeclarationFilePath.Type;

export const TypeScriptFilePath = S.Union([
  TypeScriptImplementationFilePath,
  TypeScriptDeclarationFilePath,
]).pipe(
  S.annotate(
    $I.annote("TypeScriptFilePath", {
      description: "A TypeScript source file path covering implementation and declaration files.",
    })
  )
);

export type TypeScriptFilePath = typeof TypeScriptFilePath.Type;

export const SymbolFilePath = TypeScriptImplementationFilePath.check(symbolIdSafePathChecks).pipe(
  S.brand("SymbolFilePath"),
  S.annotate(
    $I.annote("SymbolFilePath", {
      description: "A TypeScript implementation file path that is safe to embed in symbol identities.",
    })
  )
);

export type SymbolFilePath = typeof SymbolFilePath.Type;

export const SymbolNameSegment = S.String.check(S.isPattern(SYMBOL_NAME_SEGMENT_PATTERN)).pipe(
  S.brand("SymbolNameSegment"),
  S.annotate(
    $I.annote("SymbolNameSegment", {
      description: "A single identifier-like segment in a TypeScript symbol path.",
    })
  )
);

export type SymbolNameSegment = typeof SymbolNameSegment.Type;

export const SymbolQualifiedName = S.String.check(S.isPattern(SYMBOL_QUALIFIED_NAME_PATTERN)).pipe(
  S.brand("SymbolQualifiedName"),
  S.annotate(
    $I.annote("SymbolQualifiedName", {
      description: "Dot-delimited symbol path such as UserService.login.",
    })
  )
);

export type SymbolQualifiedName = typeof SymbolQualifiedName.Type;

export const SymbolKind = LiteralKit(symbolKindOptions);

export type SymbolKind = typeof SymbolKind.Type;

export const SymbolCategory = LiteralKit(["function", "class", "member", "type"] as const);

export type SymbolCategory = typeof SymbolCategory.Type;

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

export const SymbolKindToCategory = SymbolKind.pipe(
  S.decodeTo(
    SymbolCategory,
    SchemaTransformation.transformOrFail({
      decode: (value) => Effect.succeed(symbolCategoryFromKind(value)),
      encode: encodeUnsupported("Encoding SymbolCategory back to SymbolKind is not supported by SymbolKindToCategory."),
    })
  ),
  S.annotate(
    $I.annote("SymbolKindToCategory", {
      description: "One-way schema transformation from exact TypeScript declaration kind to coarse symbol category.",
    })
  )
);

export type SymbolKindToCategory = typeof SymbolKindToCategory.Type;

export const SourceText = S.NonEmptyString.pipe(
  S.brand("SourceText"),
  S.annotate(
    $I.annote("SourceText", {
      description: "Non-empty source text extracted from a TypeScript file or declaration.",
    })
  )
);

export type SourceText = typeof SourceText.Type;

export const LineNumber = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("LineNumber"),
  S.annotate(
    $I.annote("LineNumber", {
      description: "A positive 1-based line number.",
    })
  )
);

export type LineNumber = typeof LineNumber.Type;

export const ColumnNumber = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("ColumnNumber"),
  S.annotate(
    $I.annote("ColumnNumber", {
      description: "A positive 1-based column number.",
    })
  )
);

export type ColumnNumber = typeof ColumnNumber.Type;

export const ByteOffset = NonNegativeInt.pipe(
  S.brand("ByteOffset"),
  S.annotate(
    $I.annote("ByteOffset", {
      description: "A non-negative byte offset within a source file.",
    })
  )
);

export type ByteOffset = typeof ByteOffset.Type;

export const ByteLength = NonNegativeInt.pipe(
  S.brand("ByteLength"),
  S.annotate(
    $I.annote("ByteLength", {
      description: "A non-negative byte length for a source span.",
    })
  )
);

export type ByteLength = typeof ByteLength.Type;

export const ContentHash = Sha256Hex.pipe(
  S.brand("ContentHash"),
  S.annotate(
    $I.annote("ContentHash", {
      description: "Canonical SHA-256 digest for source text or symbol content.",
    })
  )
);

export type ContentHash = typeof ContentHash.Type;

export const TsMorphScopeMode = LiteralKit(["syntax", "semantic"] as const);

export type TsMorphScopeMode = typeof TsMorphScopeMode.Type;

export const TsMorphReferencePolicy = LiteralKit(["workspaceOnly", "followReferences"] as const);

export type TsMorphReferencePolicy = typeof TsMorphReferencePolicy.Type;

const resolvedProjectIdentity = S.TemplateLiteral([
  TsConfigFilePath,
  "::",
  TsMorphScopeMode,
  "#",
  TsMorphReferencePolicy,
]);

export const ProjectScopeId = resolvedProjectIdentity.pipe(
  S.brand("ProjectScopeId"),
  S.annotate(
    $I.annote("ProjectScopeId", {
      description: "Stable resolved ts-morph scope identity string: tsconfig::mode#referencePolicy.",
    })
  )
);

export type ProjectScopeId = typeof ProjectScopeId.Type;

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

export const ProjectCacheKey = resolvedProjectIdentity.pipe(
  S.brand("ProjectCacheKey"),
  S.annotate(
    $I.annote("ProjectCacheKey", {
      description: "Cache-key string for a memoized ts-morph project instance.",
    })
  )
);

export type ProjectCacheKey = typeof ProjectCacheKey.Type;

export const SymbolId = S.TemplateLiteral([SymbolFilePath, "::", SymbolQualifiedName, "#", SymbolKind]).pipe(
  S.brand("SymbolId"),
  S.annotate(
    $I.annote("SymbolId", {
      description: "Stable TypeScript symbol identity string: file::qualifiedName#kind",
    })
  )
);

export type SymbolId = typeof SymbolId.Type;

export const SymbolIdParts = S.TemplateLiteralParser([SymbolFilePath, "::", SymbolQualifiedName, "#", SymbolKind]).annotate(
  $I.annote("SymbolIdParts", {
    description: "Parsed symbol id parts for file path, qualified name, and exact kind.",
  })
);

export const FilePathToTsConfigFilePath = FilePath.pipe(
  S.decodeTo(TsConfigFilePath, stringIdentityTransform),
  S.annotate(
    $I.annote("FilePathToTsConfigFilePath", {
      description: "Schema transformation from a generic file path to a validated tsconfig file path.",
    })
  )
);

export const FilePathToTypeScriptImplementationFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptImplementationFilePath, stringIdentityTransform),
  S.annotate(
    $I.annote("FilePathToTypeScriptImplementationFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript implementation file path.",
    })
  )
);

export const FilePathToTypeScriptDeclarationFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptDeclarationFilePath, stringIdentityTransform),
  S.annotate(
    $I.annote("FilePathToTypeScriptDeclarationFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript declaration file path.",
    })
  )
);

export const FilePathToTypeScriptFilePath = FilePath.pipe(
  S.decodeTo(TypeScriptFilePath, stringIdentityTransform),
  S.annotate(
    $I.annote("FilePathToTypeScriptFilePath", {
      description: "Schema transformation from a generic file path to a TypeScript source file path.",
    })
  )
);

export const TypeScriptImplementationFilePathToSymbolFilePath = TypeScriptImplementationFilePath.pipe(
  S.decodeTo(SymbolFilePath, stringIdentityTransform),
  S.annotate(
    $I.annote("TypeScriptImplementationFilePathToSymbolFilePath", {
      description: "Schema transformation from a TypeScript implementation file path to a symbol-id-safe file path.",
    })
  )
);

const decodeSymbolId = S.decodeUnknownSync(SymbolId);
const decodeSymbolIdPartsEffect = S.decodeUnknownEffect(SymbolIdParts);
const decodeProjectScopeId = S.decodeUnknownSync(ProjectScopeId);
const decodeProjectScopeIdPartsEffect = S.decodeUnknownEffect(ProjectScopeIdParts);
const decodeContentHash = S.decodeUnknownSync(ContentHash);
const decodeSha256HexFromBytesEffect = S.decodeUnknownEffect(Sha256HexFromBytes);

export const SymbolIdToParts = SymbolId.pipe(
  S.decodeTo(
    SymbolIdParts,
    SchemaTransformation.transformOrFail({
      decode: (value, options) => decodeSymbolIdPartsEffect(value, options),
      encode: (value) =>
        Effect.succeed(
          decodeSymbolId(`${value[0]}${value[1]}${value[2]}${value[3]}${value[4]}`)
        ),
    })
  ),
  S.annotate(
    $I.annote("SymbolIdToParts", {
      description: "Bidirectional schema transformation between SymbolId strings and parsed SymbolId tuple parts.",
    })
  )
);

export const ProjectScopeIdToParts = ProjectScopeId.pipe(
  S.decodeTo(
    ProjectScopeIdParts,
    SchemaTransformation.transformOrFail({
      decode: (value, options) => decodeProjectScopeIdPartsEffect(value, options),
      encode: (value) =>
        Effect.succeed(
          decodeProjectScopeId(`${value[0]}${value[1]}${value[2]}${value[3]}${value[4]}`)
        ),
    })
  ),
  S.annotate(
    $I.annote("ProjectScopeIdToParts", {
      description: "Bidirectional schema transformation between ProjectScopeId strings and parsed scope identity tuple parts.",
    })
  )
);

export const ContentHashFromBytes = S.Uint8Array.pipe(
  S.decodeTo(
    ContentHash,
    SchemaTransformation.transformOrFail({
      decode: (value, options) => decodeSha256HexFromBytesEffect(value, options).pipe(Effect.map(decodeContentHash)),
      encode: encodeUnsupported("Encoding ContentHash back to original bytes is not supported by ContentHashFromBytes."),
    })
  ),
  S.annotate(
    $I.annote("ContentHashFromBytes", {
      description: "Effectful one-way schema transformation from source bytes to a canonical content hash.",
    })
  )
);

const textEncoder = new TextEncoder();
const decodeContentHashFromBytesEffect = S.decodeUnknownEffect(ContentHashFromBytes);

export const ContentHashFromSourceText = SourceText.pipe(
  S.decodeTo(
    ContentHash,
    SchemaTransformation.transformOrFail({
      decode: (value, options) => decodeContentHashFromBytesEffect(textEncoder.encode(value), options),
      encode: encodeUnsupported("Encoding ContentHash back to original source text is not supported by ContentHashFromSourceText."),
    })
  ),
  S.annotate(
    $I.annote("ContentHashFromSourceText", {
      description: "Effectful one-way schema transformation from source text to a canonical content hash.",
    })
  )
);

/**
 * Internal runtime schemas.
 * These are intentionally not re-exported from the package entrypoint.
 */
export const InternalTsMorphProject = S.instanceOf(Project).pipe(
  S.annotate(
    $I.annote("InternalTsMorphProject", {
      description: "Internal runtime schema for a live ts-morph Project instance.",
    })
  )
);

export const InternalTsMorphSourceFile = S.instanceOf(SourceFile).pipe(
  S.annotate(
    $I.annote("InternalTsMorphSourceFile", {
      description: "Internal runtime schema for a live ts-morph SourceFile instance.",
    })
  )
);

export const InternalTsMorphNode = S.instanceOf(TsMorphNode).pipe(
  S.annotate(
    $I.annote("InternalTsMorphNode", {
      description: "Internal runtime schema for a live ts-morph Node instance.",
    })
  )
);

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

export declare namespace Symbol {
  export type Type = typeof Symbol.Type;
  export type Encoded = typeof Symbol.Encoded;
}

export type SymbolInit = Omit<Symbol.Type, "id" | "category"> & {
  readonly id?: SymbolId | undefined;
  readonly category?: SymbolCategory | undefined;
};

export const makeSymbolId = (parts: {
  readonly filePath: SymbolFilePath;
  readonly qualifiedName: SymbolQualifiedName;
  readonly kind: SymbolKind;
}): SymbolId => decodeSymbolId(`${parts.filePath}::${parts.qualifiedName}#${parts.kind}`);

export const makeProjectScopeId = (parts: {
  readonly tsConfigPath: TsConfigFilePath;
  readonly mode: TsMorphScopeMode;
  readonly referencePolicy: TsMorphReferencePolicy;
}): ProjectScopeId => decodeProjectScopeId(`${parts.tsConfigPath}::${parts.mode}#${parts.referencePolicy}`);

const decodeProjectCacheKey = S.decodeUnknownSync(ProjectCacheKey);

export const makeProjectCacheKey = (parts: {
  readonly tsConfigPath: TsConfigFilePath;
  readonly mode: TsMorphScopeMode;
  readonly referencePolicy: TsMorphReferencePolicy;
}): ProjectCacheKey => decodeProjectCacheKey(`${parts.tsConfigPath}::${parts.mode}#${parts.referencePolicy}`);

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

class TsMorphScopeEntrypointTsConfig extends S.Class<TsMorphScopeEntrypointTsConfig>($I`TsMorphScopeEntrypointTsConfig`)(
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

export const TsMorphScopeEntrypoint = S.Union([
  TsMorphScopeEntrypointTsConfig,
  TsMorphScopeEntrypointFile,
])
  .annotate(
    $I.annote("TsMorphScopeEntrypointBase", {
      description: "Tagged union describing how a ts-morph scope should be resolved.",
    })
  )
  .pipe(S.toTaggedUnion("_tag"));

export type TsMorphScopeEntrypoint = typeof TsMorphScopeEntrypoint.Type;

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

export class TsMorphFileOutlineRequest extends S.Class<TsMorphFileOutlineRequest>($I`TsMorphFileOutlineRequest`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphFileOutlineRequest", {
    description: "Request to extract top-level outline symbols from a TypeScript file within a resolved scope.",
  })
) {}

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

export class TsMorphSourceTextRequest extends S.Class<TsMorphSourceTextRequest>($I`TsMorphSourceTextRequest`)(
  {
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphSourceTextRequest", {
    description: "Request to read normalized source text for a TypeScript file.",
  })
) {}

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

export class TsMorphSymbolLookupRequest extends S.Class<TsMorphSymbolLookupRequest>($I`TsMorphSymbolLookupRequest`)(
  {
    scopeId: ProjectScopeId,
    symbolId: SymbolId,
  },
  $I.annote("TsMorphSymbolLookupRequest", {
    description: "Request to load a normalized symbol by its stable symbol id within a resolved scope.",
  })
) {}

export class TsMorphSymbolLookupResult extends S.Class<TsMorphSymbolLookupResult>($I`TsMorphSymbolLookupResult`)(
  {
    scopeId: ProjectScopeId,
    symbol: Symbol,
  },
  $I.annote("TsMorphSymbolLookupResult", {
    description: "Resolved normalized symbol payload for a symbol lookup request.",
  })
) {}

export const TsMorphSearchLimit = S.Int.check(S.isGreaterThan(0)).pipe(
  S.brand("TsMorphSearchLimit"),
  S.annotate(
    $I.annote("TsMorphSearchLimit", {
      description: "Positive result limit for ts-morph-backed search operations.",
    })
  )
);

export type TsMorphSearchLimit = typeof TsMorphSearchLimit.Type;

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

export class TsMorphSymbolSourceRequest extends S.Class<TsMorphSymbolSourceRequest>($I`TsMorphSymbolSourceRequest`)(
  {
    scopeId: ProjectScopeId,
    symbolId: SymbolId,
  },
  $I.annote("TsMorphSymbolSourceRequest", {
    description: "Request to read source text for a normalized symbol by its stable id.",
  })
) {}

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

export const TsMorphDiagnosticCategory = LiteralKit(["error", "warning", "suggestion", "message"] as const);

export type TsMorphDiagnosticCategory = typeof TsMorphDiagnosticCategory.Type;

export class TsMorphDiagnostic extends S.Class<TsMorphDiagnostic>($I`TsMorphDiagnostic`)(
  {
    category: TsMorphDiagnosticCategory,
    code: NonNegativeInt,
    message: S.NonEmptyString,
    source: S.OptionFromNullOr(S.NonEmptyString),
    startLine: LineNumber,
    startColumn: ColumnNumber,
    endLine: LineNumber,
    endColumn: ColumnNumber,
  },
  $I.annote("TsMorphDiagnostic", {
    description: "Normalized TypeScript diagnostic for a single file within a resolved scope.",
  })
) {}

export class TsMorphDiagnosticsRequest extends S.Class<TsMorphDiagnosticsRequest>($I`TsMorphDiagnosticsRequest`)(
  {
    scopeId: ProjectScopeId,
    filePath: TypeScriptFilePath,
  },
  $I.annote("TsMorphDiagnosticsRequest", {
    description: "Request to compute normalized diagnostics for a TypeScript file within a resolved scope.",
  })
) {}

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
