/**
 * TSMorph project loading and source-inspection service.
 *
 * @module
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Context, Effect, FileSystem, flow, Inspectable, Layer, MutableHashMap, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Node, Project, type SourceFile } from "ts-morph";
import { findRepoRoot } from "../Root.js";
import type {
  ProjectCacheKey,
  TsMorphDiagnosticsRequest,
  TsMorphFileOutlineRequest,
  TsMorphProjectInspectionRequest,
  TsMorphProjectScopeRequest,
  TsMorphScopeEntrypoint,
  TsMorphSourceTextRequest,
  Symbol as TsMorphSymbol,
  TsMorphSymbolLookupRequest,
  TsMorphSymbolSearchRequest,
  TsMorphSymbolSourceRequest,
} from "./TSMorph.model.js";
import {
  ByteLength,
  ByteOffset,
  ColumnNumber,
  ContentHashFromSourceText,
  LineNumber,
  makeProjectCacheKey,
  makeProjectScopeId,
  makeSymbol,
  ProjectScopeId,
  ProjectScopeIdParts,
  RepoRootPath,
  SourceText,
  SymbolFilePath,
  SymbolId,
  SymbolNameSegment,
  SymbolQualifiedName,
  TsConfigFilePath,
  TsMorphDiagnostic,
  TsMorphDiagnosticsResult,
  TsMorphFileOutline,
  TsMorphProjectScope,
  TsMorphReferencePolicy,
  TsMorphScopeMode,
  TsMorphSourceTextResult,
  TsMorphSymbolLookupResult,
  TsMorphSymbolSearchResult,
  TsMorphSymbolSourceResult,
  TypeScriptFilePath,
  TypeScriptImplementationFilePath,
  TypeScriptImplementationFilePathToSymbolFilePath,
  WorkspaceDirectoryPath,
} from "./TSMorph.model.js";
import {
  byNormalizedDiagnosticAscending,
  byTsMorphSymbolAscending,
  flattenDiagnosticMessageText,
  getDeclarationName,
  makeKeywords,
  makeScopeSymbolSearchText,
  makeSummary,
  normalizeDiagnosticCategory,
  type OutlineDeclaration,
  pipeQualifiedName,
  readDecorators,
  readDocstring,
  readSignature,
} from "./TSMorph.shared.js";

const $I = $RepoUtilsId.create("TSMorph/TSMorph.service");

const DEFAULT_SCOPE_MODE = TsMorphScopeMode.Enum.syntax;
const DEFAULT_REFERENCE_POLICY = TsMorphReferencePolicy.Enum.workspaceOnly;
const DEFAULT_TSCONFIG_FILE_NAME = "tsconfig.json";
const utf8Encoder = new TextEncoder();

const decodeByteLength = S.decodeUnknownSync(ByteLength);
const decodeByteOffset = S.decodeUnknownSync(ByteOffset);
const decodeColumnNumber = S.decodeUnknownSync(ColumnNumber);
const decodeContentHashFromSourceText = S.decodeUnknownEffect(ContentHashFromSourceText);
const decodeLineNumber = S.decodeUnknownSync(LineNumber);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeProjectScopeIdParts = S.decodeUnknownSync(ProjectScopeIdParts);
const decodeRepoRootPath = S.decodeUnknownSync(RepoRootPath);
const decodeSourceText = S.decodeUnknownSync(SourceText);
const decodeSymbolFilePath = S.decodeUnknownSync(SymbolFilePath);
const decodeSymbolNameSegment = S.decodeUnknownSync(SymbolNameSegment);
const decodeSymbolQualifiedName = S.decodeUnknownSync(SymbolQualifiedName);
const decodeTsMorphDiagnostic = S.decodeUnknownSync(TsMorphDiagnostic);
const decodeTsConfigFilePath = S.decodeUnknownSync(TsConfigFilePath);
const decodeTypeScriptFilePath = S.decodeUnknownSync(TypeScriptFilePath);
const decodeTypeScriptImplementationFilePath = S.decodeUnknownSync(TypeScriptImplementationFilePath);
const decodeTypeScriptImplementationToSymbolFilePath = S.decodeUnknownSync(
  TypeScriptImplementationFilePathToSymbolFilePath
);
const decodeWorkspaceDirectoryPath = S.decodeUnknownSync(WorkspaceDirectoryPath);
const decodeTypeScriptImplementationFilePathOption = S.decodeOption(TypeScriptImplementationFilePath);

const isSymbolNameSegment = S.is(SymbolNameSegment);
const isSymbolQualifiedName = S.is(SymbolQualifiedName);
/**
 * Typed error retained for compatibility with older placeholder service wiring.
 *
 * @example
 * ```ts
 * import { TsMorphServiceUnavailableError } from "@beep/repo-utils"
 * const value = TsMorphServiceUnavailableError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphServiceUnavailableError extends TaggedErrorClass<TsMorphServiceUnavailableError>(
  $I`TsMorphServiceUnavailableError`
)(
  "TsMorphServiceUnavailableError",
  {
    method: S.String,
    message: S.String,
  },
  $I.annote("TsMorphServiceUnavailableError", {
    description:
      "Typed compatibility error for placeholder TSMorphService methods; the current read-only live methods should not emit it.",
  })
) {}

/**
 * Typed error returned when a scope or repository path cannot be resolved.
 *
 * @example
 * ```ts
 * import { TsMorphScopeResolutionError } from "@beep/repo-utils"
 * const value = TsMorphScopeResolutionError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphScopeResolutionError extends TaggedErrorClass<TsMorphScopeResolutionError>(
  $I`TsMorphScopeResolutionError`
)(
  "TsMorphScopeResolutionError",
  {
    entrypoint: S.String,
    message: S.String,
  },
  $I.annote("TsMorphScopeResolutionError", {
    description:
      "Typed error indicating that a repository path or tsconfig scope could not be resolved for TSMorphService.",
  })
) {}

/**
 * Typed error returned when a scoped ts-morph project cannot be constructed.
 *
 * @example
 * ```ts
 * import { TsMorphProjectLoadError } from "@beep/repo-utils"
 * const value = TsMorphProjectLoadError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphProjectLoadError extends TaggedErrorClass<TsMorphProjectLoadError>($I`TsMorphProjectLoadError`)(
  "TsMorphProjectLoadError",
  {
    scopeId: ProjectScopeId,
    tsConfigPath: TsConfigFilePath,
    message: S.String,
  },
  $I.annote("TsMorphProjectLoadError", {
    description: "Typed error indicating that a ts-morph Project could not be initialized for a resolved scope.",
  })
) {}

/**
 * Typed error returned when a TypeScript file cannot be loaded from a resolved scope.
 *
 * @example
 * ```ts
 * import { TsMorphSourceFileError } from "@beep/repo-utils"
 * const value = TsMorphSourceFileError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSourceFileError extends TaggedErrorClass<TsMorphSourceFileError>($I`TsMorphSourceFileError`)(
  "TsMorphSourceFileError",
  {
    scopeId: S.OptionFromNullOr(ProjectScopeId),
    filePath: S.Option(TypeScriptFilePath),
    message: S.String,
  },
  $I.annote("TsMorphSourceFileError", {
    description:
      "Typed error indicating that a TypeScript source file could not be loaded or normalized by TSMorphService.",
  })
) {}

/**
 * Typed error returned when a symbol id cannot be resolved within a scope.
 *
 * @example
 * ```ts
 * import { TsMorphSymbolNotFoundError } from "@beep/repo-utils"
 * const value = TsMorphSymbolNotFoundError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphSymbolNotFoundError extends TaggedErrorClass<TsMorphSymbolNotFoundError>(
  $I`TsMorphSymbolNotFoundError`
)(
  "TsMorphSymbolNotFoundError",
  {
    scopeId: ProjectScopeId,
    symbolId: SymbolId,
    message: S.String,
  },
  $I.annote("TsMorphSymbolNotFoundError", {
    description: "Typed error indicating that a stable symbol id could not be resolved inside a ts-morph scope.",
    reason: "Raised when a requested stable symbol id is absent from the scope-local symbol index.",
    owner: "repo-utils",
    issueContext: "ts-morph-read-only-v1",
  })
) {}

/**
 * Typed error returned when a request targets a currently unsupported TypeScript source boundary.
 *
 * @example
 * ```ts
 * import { TsMorphUnsupportedFileError } from "@beep/repo-utils"
 * const value = TsMorphUnsupportedFileError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export class TsMorphUnsupportedFileError extends TaggedErrorClass<TsMorphUnsupportedFileError>(
  $I`TsMorphUnsupportedFileError`
)(
  "TsMorphUnsupportedFileError",
  {
    filePath: TypeScriptFilePath,
    message: S.String,
  },
  $I.annote("TsMorphUnsupportedFileError", {
    description:
      "Typed error indicating that a TypeScript file is valid input but is not yet supported by the current TSMorphService operation.",
  })
) {}

/**
 * Tagged union of all recoverable service errors emitted by `TSMorphService`.
 *
 * @example
 * ```ts
 * import { TSMorphServiceError } from "@beep/repo-utils"
 * const value = TSMorphServiceError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const TSMorphServiceError = S.Union([
  TsMorphProjectLoadError,
  TsMorphScopeResolutionError,
  TsMorphSourceFileError,
  TsMorphSymbolNotFoundError,
  TsMorphUnsupportedFileError,
  TsMorphServiceUnavailableError,
]).pipe(S.toTaggedUnion("_tag"));

/**
 * Tagged union type for all ts-morph service errors.
 *
 * @example
 * ```ts
 * import type { TSMorphServiceError } from "@beep/repo-utils"
 * type Example = TSMorphServiceError
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TSMorphServiceError = typeof TSMorphServiceError.Type;

/**
 * Read-only v1 service contract for ts-morph-backed scope, symbol, source, and diagnostic operations.
 *
 * @example
 * ```ts
 * import type { TSMorphServiceShape } from "@beep/repo-utils"
 * type Example = TSMorphServiceShape
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export type TSMorphServiceShape = {
  readonly resolveProjectScope: (
    request: TsMorphProjectScopeRequest
  ) => Effect.Effect<TsMorphProjectScope, TSMorphServiceError>;
  readonly inspectProject: <A>(
    request: TsMorphProjectInspectionRequest,
    inspect: (context: {
      readonly scope: TsMorphProjectScope;
      readonly project: Project;
      readonly sourceFiles: ReadonlyArray<SourceFile>;
    }) => A
  ) => Effect.Effect<A, TSMorphServiceError>;
  readonly getFileOutline: (
    request: TsMorphFileOutlineRequest
  ) => Effect.Effect<TsMorphFileOutline, TSMorphServiceError>;
  readonly getSymbolById: (
    request: TsMorphSymbolLookupRequest
  ) => Effect.Effect<TsMorphSymbolLookupResult, TSMorphServiceError>;
  readonly searchSymbols: (
    request: TsMorphSymbolSearchRequest
  ) => Effect.Effect<TsMorphSymbolSearchResult, TSMorphServiceError>;
  readonly readSourceText: (
    request: TsMorphSourceTextRequest
  ) => Effect.Effect<TsMorphSourceTextResult, TSMorphServiceError>;
  readonly readSymbolSource: (
    request: TsMorphSymbolSourceRequest
  ) => Effect.Effect<TsMorphSymbolSourceResult, TSMorphServiceError>;
  readonly getDiagnostics: (
    request: TsMorphDiagnosticsRequest
  ) => Effect.Effect<TsMorphDiagnosticsResult, TSMorphServiceError>;
  readonly updateSourceFile: (
    filePath: string,
    update: (sourceFile: SourceFile, project: Project) => void
  ) => Effect.Effect<boolean, TSMorphServiceError>;
};

/**
 * Service tag for the read-only v1 ts-morph contract.
 *
 * @example
 * ```ts
 * import { TSMorphService } from "@beep/repo-utils"
 * const value = TSMorphService
 * ```
 * @category PortContract
 * @since 0.0.0
 */
export class TSMorphService extends Context.Service<TSMorphService, TSMorphServiceShape>()($I`TSMorphService`) {}

type ProjectPool = {
  readonly getOrCreate: (scope: TsMorphProjectScope) => Effect.Effect<Project, TsMorphProjectLoadError>;
};

type ScopeSymbolIndex = {
  readonly entries: ReadonlyArray<ScopeSymbolEntry>;
  readonly entriesById: MutableHashMap.MutableHashMap<string, ScopeSymbolEntry>;
  readonly entriesByFilePath: MutableHashMap.MutableHashMap<string, ReadonlyArray<ScopeSymbolEntry>>;
};

interface ScopeSymbolEntry {
  readonly contentHash: TsMorphSymbol["contentHash"];
  readonly searchText: string;
  readonly sourceText: SourceText;
  readonly symbol: TsMorphSymbol;
}

const byScopeSymbolEntryAscending: Order.Order<ScopeSymbolEntry> = Order.mapInput(
  byTsMorphSymbolAscending,
  (entry: ScopeSymbolEntry) => entry.symbol
);

const schemaMessage = (cause: unknown): string =>
  P.isError(cause) ? cause.message : Inspectable.toStringUnknown(cause, 0);

const decodeOrFail = <A, E extends TSMorphServiceError>(
  decode: (value: unknown) => A,
  value: unknown,
  makeError: (message: string) => E
): Effect.Effect<A, E> =>
  Effect.try({
    try: () => decode(value),
    catch: flow(schemaMessage, makeError),
  });

const resolveAbsolutePath = (pathApi: Path.Path, repoRootPath: RepoRootPath, inputPath: string): string =>
  pathApi.normalize(pathApi.isAbsolute(inputPath) ? inputPath : pathApi.resolve(repoRootPath, inputPath));

const isOutsideAncestor = (pathApi: Path.Path, parentPath: string, childPath: string): boolean => {
  const relativePath = pathApi.relative(parentPath, childPath);
  return relativePath.length === 0 ? false : pathApi.isAbsolute(relativePath) || Str.startsWith("..")(relativePath);
};

const isMissingDirectoryError = (cause: unknown): boolean =>
  P.isString(cause)
    ? Str.includes("Directory not found:")(cause)
    : P.isObject(cause) &&
      P.hasProperty(cause, "message") &&
      P.isString(cause.message) &&
      Str.includes("Directory not found:")(cause.message);

const decodeRepoRelativePath = Effect.fn(function* (
  pathApi: Path.Path,
  repoRootPath: RepoRootPath,
  absolutePath: string
): Effect.fn.Return<string, TsMorphScopeResolutionError> {
  const relativePath = pathApi.normalize(pathApi.relative(repoRootPath, absolutePath));

  if (relativePath.length === 0 || pathApi.isAbsolute(relativePath) || Str.startsWith("..")(relativePath)) {
    return yield* new TsMorphScopeResolutionError({
      entrypoint: absolutePath,
      message: `Resolved path "${absolutePath}" is outside the repository root "${repoRootPath}".`,
    });
  }

  return yield* Effect.succeed(relativePath);
});

const ensureExists = Effect.fn("ensureExists")(function* <E extends TSMorphServiceError>(
  fs: FileSystem.FileSystem,
  absolutePath: string,
  makeError: () => E
): Effect.fn.Return<void, E> {
  return yield* fs.exists(absolutePath).pipe(
    Effect.orElseSucceed(thunkFalse),
    Effect.flatMap(
      Effect.fnUntraced(function* (exists) {
        return yield* exists ? Effect.void : Effect.fail(makeError());
      })
    )
  );
});

const createProjectPool = (pathApi: Path.Path): ProjectPool => {
  const projects = MutableHashMap.empty<ProjectCacheKey, Project>();

  const getOrCreate: ProjectPool["getOrCreate"] = Effect.fn(function* (scope) {
    const cachedProject = MutableHashMap.get(projects, scope.cacheKey);
    if (O.isSome(cachedProject)) {
      return cachedProject.value;
    }

    const absoluteTsConfigPath = resolveAbsolutePath(pathApi, scope.repoRootPath, scope.tsConfigPath);
    const project = yield* Effect.try({
      try: () =>
        new Project({
          tsConfigFilePath: absoluteTsConfigPath,
          skipFileDependencyResolution: scope.referencePolicy === TsMorphReferencePolicy.Enum.workspaceOnly,
          skipLoadingLibFiles: scope.mode === TsMorphScopeMode.Enum.syntax,
        }),
      catch: (cause) =>
        new TsMorphProjectLoadError({
          scopeId: scope.scopeId,
          tsConfigPath: scope.tsConfigPath,
          message: `Failed to initialize ts-morph Project for "${scope.cacheKey}": ${schemaMessage(cause)}`,
        }),
    });

    MutableHashMap.set(projects, scope.cacheKey, project);
    return project;
  });

  return { getOrCreate };
};

const normalizeOutlineSymbol = Effect.fn("normalizeOutlineSymbol")(function* (
  sourceFileText: string,
  symbolFilePath: SymbolFilePath,
  declaration: OutlineDeclaration,
  parentSymbol: O.Option<TsMorphSymbol>
): Effect.fn.Return<O.Option<ScopeSymbolEntry>, TSMorphServiceError> {
  const declarationName = getDeclarationName(declaration);
  if (O.isNone(declarationName)) {
    return O.none<ScopeSymbolEntry>();
  }

  if (!isSymbolNameSegment(declarationName.value.name)) {
    return O.none<ScopeSymbolEntry>();
  }

  const qualifiedName = pipeQualifiedName(parentSymbol, declarationName.value.name);
  if (!isSymbolQualifiedName(qualifiedName)) {
    return O.none<ScopeSymbolEntry>();
  }

  const startOffset = declaration.getStart(true);
  const endOffset = declaration.getEnd();
  const symbolText = yield* decodeOrFail(
    decodeSourceText,
    sourceFileText.slice(startOffset, endOffset),
    (message) =>
      new TsMorphSourceFileError({
        scopeId: O.none(),
        filePath: S.decodeOption(TypeScriptFilePath)(symbolFilePath),
        message: `Failed to decode extracted symbol source for "${qualifiedName}": ${message}`,
      })
  );
  const contentHash = yield* decodeContentHashFromSourceText(symbolText).pipe(
    Effect.mapError(
      (error) =>
        new TsMorphSourceFileError({
          scopeId: O.none(),
          filePath: S.decodeOption(TypeScriptFilePath)(symbolFilePath),
          message: `Failed to hash extracted symbol source for "${qualifiedName}": ${schemaMessage(error)}`,
        })
    )
  );

  const bytePrefix = utf8Encoder.encode(sourceFileText.slice(0, startOffset));
  const byteSpan = utf8Encoder.encode(symbolText);
  const docstring = readDocstring(declaration);
  const symbol = makeSymbol({
    filePath: decodeSymbolFilePath(symbolFilePath),
    name: decodeSymbolNameSegment(declarationName.value.name),
    qualifiedName: decodeSymbolQualifiedName(qualifiedName),
    kind: declarationName.value.kind,
    signature: readSignature(declaration),
    docstring,
    summary: makeSummary(docstring),
    decorators: readDecorators(declaration),
    keywords: makeKeywords(declarationName.value.name, qualifiedName, { kind: declarationName.value.kind }),
    parentId: O.map(parentSymbol, (parent) => parent.id),
    startLine: decodeLineNumber(declaration.getStartLineNumber(true)),
    endLine: decodeLineNumber(declaration.getEndLineNumber()),
    byteOffset: decodeByteOffset(bytePrefix.length),
    byteLength: decodeByteLength(byteSpan.length),
    contentHash,
  });

  return O.some({
    symbol,
    sourceText: symbolText,
    contentHash,
    searchText: makeScopeSymbolSearchText(symbol, symbolText),
  } satisfies ScopeSymbolEntry);
});

const resolveSymbolFilePath = Effect.fn(function* (
  filePath: TypeScriptFilePath
): Effect.fn.Return<SymbolFilePath, TsMorphUnsupportedFileError> {
  const implementationFilePath = yield* decodeOrFail(
    decodeTypeScriptImplementationFilePath,
    filePath,
    (message) =>
      new TsMorphUnsupportedFileError({
        filePath,
        message: `File outlines currently support TypeScript implementation files only: ${message}`,
      })
  );

  return yield* decodeOrFail(
    decodeTypeScriptImplementationToSymbolFilePath,
    implementationFilePath,
    (message) =>
      new TsMorphUnsupportedFileError({
        filePath,
        message: `Failed to normalize implementation file path "${implementationFilePath}" for symbol ids: ${message}`,
      })
  );
});

const collectOutlineEntries = Effect.fn(function* (
  filePath: TypeScriptFilePath,
  sourceFile: SourceFile
): Effect.fn.Return<ReadonlyArray<ScopeSymbolEntry>, TSMorphServiceError> {
  const symbolFilePath = yield* resolveSymbolFilePath(filePath);

  const entries = A.empty<ScopeSymbolEntry>();
  const sourceText = sourceFile.getFullText();

  for (const statement of sourceFile.getStatements()) {
    if (Node.isFunctionDeclaration(statement)) {
      const entry = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
      if (O.isSome(entry)) {
        entries.push(entry.value);
      }
      continue;
    }

    if (Node.isClassDeclaration(statement)) {
      const classEntry = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
      if (O.isSome(classEntry)) {
        entries.push(classEntry.value);

        for (const member of statement.getMembers()) {
          if (
            Node.isConstructorDeclaration(member) ||
            Node.isMethodDeclaration(member) ||
            Node.isGetAccessorDeclaration(member) ||
            Node.isSetAccessorDeclaration(member)
          ) {
            const memberEntry = yield* normalizeOutlineSymbol(
              sourceText,
              symbolFilePath,
              member,
              O.some(classEntry.value.symbol)
            );
            if (O.isSome(memberEntry)) {
              entries.push(memberEntry.value);
            }
          }
        }
      }
      continue;
    }

    if (
      Node.isInterfaceDeclaration(statement) ||
      Node.isTypeAliasDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      const entry = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
      if (O.isSome(entry)) {
        entries.push(entry.value);
      }
    }
  }

  return entries;
});

/**
 * Construct the current live implementation for the v1 TSMorphService contract.
 *
 * @returns Live service implementation backed by filesystem, path, and ts-morph project loading.
 * @example
 * ```ts
 * import { createTSMorphService } from "@beep/repo-utils"
 * const value = createTSMorphService
 * ```
 * @category DomainModel
 * @since 0.0.0
 */
export const createTSMorphService = Effect.fn("createTSMorphService")(function* (): Effect.fn.Return<
  TSMorphServiceShape,
  never,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;

  const resolvedScopes = MutableHashMap.empty<string, TsMorphProjectScope>();
  const projectPool = createProjectPool(pathApi);
  const symbolIndexPool = MutableHashMap.empty<ProjectCacheKey, ScopeSymbolIndex>();

  const resolveRepoRoot = Effect.fn("TSMorphService.resolveRepoRoot")(function* (
    repoRootPath: O.Option<RepoRootPath>
  ): Effect.fn.Return<RepoRootPath, TsMorphScopeResolutionError> {
    if (O.isSome(repoRootPath)) {
      return yield* decodeOrFail(
        decodeRepoRootPath,
        pathApi.normalize(
          pathApi.isAbsolute(repoRootPath.value)
            ? repoRootPath.value
            : pathApi.resolve(process.cwd(), repoRootPath.value)
        ),
        (message) =>
          new TsMorphScopeResolutionError({
            entrypoint: repoRootPath.value,
            message: `Failed to normalize explicit repository root "${repoRootPath.value}": ${message}`,
          })
      );
    }

    const discoveredRepoRoot = yield* findRepoRoot(process.cwd()).pipe(
      Effect.provideService(FileSystem.FileSystem, fs),
      Effect.mapError(
        (error) =>
          new TsMorphScopeResolutionError({
            entrypoint: process.cwd(),
            message: error.message,
          })
      )
    );

    return yield* decodeOrFail(
      decodeRepoRootPath,
      pathApi.normalize(discoveredRepoRoot),
      (message) =>
        new TsMorphScopeResolutionError({
          entrypoint: discoveredRepoRoot,
          message: `Failed to normalize discovered repository root "${discoveredRepoRoot}": ${message}`,
        })
    );
  });

  const resolveTsConfigPath = Effect.fn(function* (
    repoRootPath: RepoRootPath,
    tsConfigPath: string
  ): Effect.fn.Return<TsConfigFilePath, TSMorphServiceError> {
    const absoluteTsConfigPath = resolveAbsolutePath(pathApi, repoRootPath, tsConfigPath);
    yield* ensureExists(
      fs,
      absoluteTsConfigPath,
      () =>
        new TsMorphScopeResolutionError({
          entrypoint: tsConfigPath,
          message: `No tsconfig file exists at "${absoluteTsConfigPath}".`,
        })
    );

    const repoRelativeTsConfigPath = yield* decodeRepoRelativePath(pathApi, repoRootPath, absoluteTsConfigPath);
    return yield* decodeOrFail(
      decodeTsConfigFilePath,
      repoRelativeTsConfigPath,
      (message) =>
        new TsMorphScopeResolutionError({
          entrypoint: tsConfigPath,
          message: `Resolved tsconfig path "${repoRelativeTsConfigPath}" is not a valid TsConfigFilePath: ${message}`,
        })
    );
  });

  const resolveScopedFilePath = Effect.fn("TSMorphService.resolveScopedFilePath")(function* (
    repoRootPath: RepoRootPath,
    filePath: TypeScriptFilePath
  ): Effect.fn.Return<
    {
      readonly absoluteFilePath: string;
      readonly filePath: TypeScriptFilePath;
    },
    TSMorphServiceError
  > {
    const absoluteFilePath = resolveAbsolutePath(pathApi, repoRootPath, filePath);
    yield* ensureExists(
      fs,
      absoluteFilePath,
      () =>
        new TsMorphSourceFileError({
          scopeId: O.none(),
          filePath: S.decodeOption(TypeScriptFilePath)(filePath),
          message: `No TypeScript file exists at "${absoluteFilePath}".`,
        })
    );

    const repoRelativeFilePath = yield* decodeRepoRelativePath(pathApi, repoRootPath, absoluteFilePath);
    return {
      absoluteFilePath,
      filePath: yield* decodeOrFail(
        decodeTypeScriptFilePath,
        repoRelativeFilePath,
        (message) =>
          new TsMorphSourceFileError({
            scopeId: O.none(),
            filePath: S.decodeOption(TypeScriptFilePath)(filePath),
            message: `Resolved file path "${repoRelativeFilePath}" is not a valid TypeScriptFilePath: ${message}`,
          })
      ),
    };
  });

  const resolveFileEntrypointTsConfig = Effect.fn(function* (
    repoRootPath: RepoRootPath,
    filePath: TypeScriptFilePath
  ): Effect.fn.Return<TsConfigFilePath, TSMorphServiceError> {
    const { absoluteFilePath } = yield* resolveScopedFilePath(repoRootPath, filePath);

    let currentDirectory = pathApi.dirname(absoluteFilePath);
    while (true) {
      const candidateTsConfigPath = pathApi.join(currentDirectory, DEFAULT_TSCONFIG_FILE_NAME);
      const candidateExists = yield* fs.exists(candidateTsConfigPath).pipe(Effect.orElseSucceed(thunkFalse));

      if (candidateExists) {
        const repoRelativeTsConfigPath = yield* decodeRepoRelativePath(pathApi, repoRootPath, candidateTsConfigPath);
        return yield* decodeOrFail(
          decodeTsConfigFilePath,
          repoRelativeTsConfigPath,
          (message) =>
            new TsMorphScopeResolutionError({
              entrypoint: filePath,
              message: `Resolved tsconfig path "${repoRelativeTsConfigPath}" is not a valid TsConfigFilePath: ${message}`,
            })
        );
      }

      if (currentDirectory === repoRootPath) {
        break;
      }

      const parentDirectory = pathApi.dirname(currentDirectory);
      if (parentDirectory === currentDirectory) {
        break;
      }
      currentDirectory = parentDirectory;
    }

    return yield* new TsMorphScopeResolutionError({
      entrypoint: filePath,
      message: `No owning "${DEFAULT_TSCONFIG_FILE_NAME}" could be found for "${filePath}" within repository root "${repoRootPath}".`,
    });
  });

  const buildResolvedScope = Effect.fn("TSMorphService.buildResolvedScope")(function* (
    repoRootPath: RepoRootPath,
    tsConfigPath: TsConfigFilePath,
    mode: TsMorphScopeMode,
    referencePolicy: TsMorphReferencePolicy
  ) {
    const absoluteTsConfigPath = resolveAbsolutePath(pathApi, repoRootPath, tsConfigPath);
    const workspaceDirectoryPath = yield* decodeOrFail(
      decodeWorkspaceDirectoryPath,
      pathApi.dirname(absoluteTsConfigPath),
      (message) =>
        new TsMorphScopeResolutionError({
          entrypoint: tsConfigPath,
          message: `Failed to normalize workspace directory for "${tsConfigPath}": ${message}`,
        })
    );

    const scopeId = makeProjectScopeId({
      tsConfigPath,
      mode,
      referencePolicy,
    });

    const scope = new TsMorphProjectScope({
      scopeId,
      cacheKey: makeProjectCacheKey({
        tsConfigPath,
        mode,
        referencePolicy,
      }),
      repoRootPath,
      workspaceDirectoryPath,
      tsConfigPath,
      mode,
      referencePolicy,
    });

    MutableHashMap.set(resolvedScopes, scope.scopeId, scope);
    return scope;
  });

  const resolveScopeFromEntrypoint = Effect.fn("TSMorphService.resolveScopeFromEntrypoint")(function* (
    entrypoint: TsMorphScopeEntrypoint,
    repoRootPath: O.Option<RepoRootPath>,
    mode: TsMorphScopeMode,
    referencePolicy: TsMorphReferencePolicy
  ) {
    const resolvedRepoRootPath = yield* resolveRepoRoot(repoRootPath);
    const resolvedTsConfigPath = P.isTagged(entrypoint, "tsconfig")
      ? yield* resolveTsConfigPath(resolvedRepoRootPath, entrypoint.tsConfigPath)
      : yield* resolveFileEntrypointTsConfig(resolvedRepoRootPath, entrypoint.filePath);

    return yield* buildResolvedScope(resolvedRepoRootPath, resolvedTsConfigPath, mode, referencePolicy);
  });

  const resolveScopeById = (scopeId: string): Effect.Effect<TsMorphProjectScope, TSMorphServiceError> =>
    Effect.gen(function* () {
      const cachedScope = MutableHashMap.get(resolvedScopes, scopeId);
      if (O.isSome(cachedScope)) {
        return cachedScope.value;
      }

      const [tsConfigPath, _scopeSeparator, mode, _policySeparator, referencePolicy] = yield* decodeOrFail(
        decodeProjectScopeIdParts,
        scopeId,
        (message) =>
          new TsMorphScopeResolutionError({
            entrypoint: scopeId,
            message: `Failed to parse scope id "${scopeId}": ${message}`,
          })
      );

      const repoRootPath = yield* resolveRepoRoot(O.none());
      const resolvedTsConfigPath = yield* resolveTsConfigPath(repoRootPath, tsConfigPath);
      return yield* buildResolvedScope(repoRootPath, resolvedTsConfigPath, mode, referencePolicy);
    });

  const loadSourceFile = (
    scope: TsMorphProjectScope,
    filePath: TypeScriptFilePath
  ): Effect.Effect<
    {
      readonly sourceFile: SourceFile;
      readonly filePath: TypeScriptFilePath;
    },
    TSMorphServiceError
  > =>
    Effect.gen(function* () {
      const { absoluteFilePath, filePath: normalizedFilePath } = yield* resolveScopedFilePath(
        scope.repoRootPath,
        filePath
      );

      if (
        scope.referencePolicy === TsMorphReferencePolicy.Enum.workspaceOnly &&
        isOutsideAncestor(pathApi, scope.workspaceDirectoryPath, absoluteFilePath)
      ) {
        return yield* new TsMorphSourceFileError({
          scopeId: O.some(scope.scopeId),
          filePath: S.decodeOption(TypeScriptFilePath)(normalizedFilePath),
          message: `File "${normalizedFilePath}" is outside the workspace directory "${scope.workspaceDirectoryPath}" for scope "${scope.scopeId}".`,
        });
      }

      const project = yield* projectPool.getOrCreate(scope);
      const existingSourceFile = project.getSourceFile(absoluteFilePath);
      const sourceFile = existingSourceFile ?? project.addSourceFileAtPathIfExists(absoluteFilePath);

      if (sourceFile === undefined) {
        return yield* new TsMorphSourceFileError({
          scopeId: O.some(scope.scopeId),
          filePath: S.decodeOption(TypeScriptFilePath)(normalizedFilePath),
          message: `File "${normalizedFilePath}" could not be loaded into ts-morph project scope "${scope.scopeId}".`,
        });
      }

      if (existingSourceFile === undefined) {
        MutableHashMap.remove(symbolIndexPool, scope.cacheKey);
      }

      return {
        sourceFile,
        filePath: normalizedFilePath,
      };
    });

  const collectScopeSymbolIndex = (scope: TsMorphProjectScope): Effect.Effect<ScopeSymbolIndex, TSMorphServiceError> =>
    Effect.gen(function* () {
      const project = yield* projectPool.getOrCreate(scope);
      const entries = A.empty<ScopeSymbolEntry>();

      for (const sourceFile of project.getSourceFiles()) {
        const absoluteFilePath = pathApi.normalize(sourceFile.getFilePath());
        if (
          scope.referencePolicy === TsMorphReferencePolicy.Enum.workspaceOnly &&
          isOutsideAncestor(pathApi, scope.workspaceDirectoryPath, absoluteFilePath)
        ) {
          continue;
        }

        const repoRelativeFilePath = pathApi.normalize(pathApi.relative(scope.repoRootPath, absoluteFilePath));
        if (
          repoRelativeFilePath.length === 0 ||
          pathApi.isAbsolute(repoRelativeFilePath) ||
          Str.startsWith("..")(repoRelativeFilePath)
        ) {
          continue;
        }

        const implementationFilePath = decodeTypeScriptImplementationFilePathOption(repoRelativeFilePath);
        if (O.isSome(implementationFilePath)) {
          const sourceEntries = yield* collectOutlineEntries(implementationFilePath.value, sourceFile);
          entries.push(...sourceEntries);
        }
      }

      const sortedEntries = A.sort(entries, byScopeSymbolEntryAscending);
      const entriesById = MutableHashMap.empty<string, ScopeSymbolEntry>();
      const entriesByFilePath = MutableHashMap.empty<string, ReadonlyArray<ScopeSymbolEntry>>();

      for (const entry of entries) {
        const fileEntries = O.getOrElse(
          MutableHashMap.get(entriesByFilePath, entry.symbol.filePath),
          A.empty<ScopeSymbolEntry>
        );
        MutableHashMap.set(entriesByFilePath, entry.symbol.filePath, A.append(fileEntries, entry));
      }

      for (const entry of sortedEntries) {
        MutableHashMap.set(entriesById, entry.symbol.id, entry);
      }

      return {
        entries: sortedEntries,
        entriesById,
        entriesByFilePath,
      } satisfies ScopeSymbolIndex;
    });

  const getOrCreateScopeSymbolIndex = (
    scope: TsMorphProjectScope
  ): Effect.Effect<ScopeSymbolIndex, TSMorphServiceError> =>
    Effect.gen(function* () {
      const cachedSymbolIndex = MutableHashMap.get(symbolIndexPool, scope.cacheKey);
      if (O.isSome(cachedSymbolIndex)) {
        return cachedSymbolIndex.value;
      }

      const symbolIndex = yield* collectScopeSymbolIndex(scope);
      MutableHashMap.set(symbolIndexPool, scope.cacheKey, symbolIndex);
      return symbolIndex;
    });

  const findScopeSymbolEntry = (
    scope: TsMorphProjectScope,
    symbolId: SymbolId
  ): Effect.Effect<ScopeSymbolEntry, TSMorphServiceError> =>
    Effect.gen(function* () {
      const symbolIndex = yield* getOrCreateScopeSymbolIndex(scope);
      const entry = MutableHashMap.get(symbolIndex.entriesById, symbolId);
      if (O.isSome(entry)) {
        return entry.value;
      }

      return yield* new TsMorphSymbolNotFoundError({
        scopeId: scope.scopeId,
        symbolId,
        message: `Symbol "${symbolId}" could not be resolved within scope "${scope.scopeId}".`,
      });
    });

  const resolveProjectScope: TSMorphServiceShape["resolveProjectScope"] = Effect.fn(function* (request) {
    return yield* resolveScopeFromEntrypoint(
      request.entrypoint,
      request.repoRootPath,
      request.mode,
      request.referencePolicy
    );
  });

  const readSourceText: TSMorphServiceShape["readSourceText"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeFromEntrypoint(
      {
        _tag: "file",
        filePath: request.filePath,
      },
      O.none(),
      DEFAULT_SCOPE_MODE,
      DEFAULT_REFERENCE_POLICY
    );
    const loadedSourceFile = yield* loadSourceFile(scope, request.filePath);
    const sourceText = yield* decodeOrFail(
      decodeSourceText,
      loadedSourceFile.sourceFile.getFullText(),
      (message) =>
        new TsMorphSourceFileError({
          scopeId: O.some(scope.scopeId),
          filePath: S.decodeOption(TypeScriptFilePath)(loadedSourceFile.filePath),
          message: `Failed to decode source text for "${loadedSourceFile.filePath}": ${message}`,
        })
    );
    const contentHash = yield* decodeContentHashFromSourceText(sourceText).pipe(
      Effect.mapError(
        (error) =>
          new TsMorphSourceFileError({
            scopeId: O.some(scope.scopeId),
            filePath: S.decodeOption(TypeScriptFilePath)(loadedSourceFile.filePath),
            message: `Failed to hash source text for "${loadedSourceFile.filePath}": ${schemaMessage(error)}`,
          })
      )
    );

    return new TsMorphSourceTextResult({
      filePath: loadedSourceFile.filePath,
      sourceText,
      contentHash,
    });
  });

  const getFileOutline: TSMorphServiceShape["getFileOutline"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeById(request.scopeId);
    const loadedSourceFile = yield* loadSourceFile(scope, request.filePath);
    const outlineEntries = yield* collectOutlineEntries(loadedSourceFile.filePath, loadedSourceFile.sourceFile);
    const symbols = A.map(outlineEntries, (entry) => entry.symbol);

    return new TsMorphFileOutline({
      scopeId: scope.scopeId,
      filePath: loadedSourceFile.filePath,
      symbols,
    });
  });

  const getSymbolById: TSMorphServiceShape["getSymbolById"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeById(request.scopeId);
    const entry = yield* findScopeSymbolEntry(scope, request.symbolId);

    return new TsMorphSymbolLookupResult({
      scopeId: scope.scopeId,
      symbol: entry.symbol,
    });
  });

  const searchSymbols: TSMorphServiceShape["searchSymbols"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeById(request.scopeId);
    const symbolIndex = yield* getOrCreateScopeSymbolIndex(scope);
    const normalizedQuery = pipe(request.query, Str.trim, Str.toLowerCase);
    const searchableEntries = Str.isNonEmpty(normalizedQuery) ? symbolIndex.entries : A.empty<ScopeSymbolEntry>();
    const matchesRequestedFilters = (entry: ScopeSymbolEntry): boolean =>
      (A.isReadonlyArrayEmpty(request.categories) ||
        A.some(request.categories, (category) => category === entry.symbol.category)) &&
      (A.isReadonlyArrayEmpty(request.kinds) || A.some(request.kinds, (kind) => kind === entry.symbol.kind));
    const filteredEntries = pipe(
      searchableEntries,
      A.filter((entry) => Str.includes(normalizedQuery)(entry.searchText) && matchesRequestedFilters(entry))
    );

    return new TsMorphSymbolSearchResult({
      scopeId: scope.scopeId,
      query: request.query,
      limit: request.limit,
      symbols: pipe(
        A.take(filteredEntries, request.limit),
        A.map((entry) => entry.symbol)
      ),
      total: decodeNonNegativeInt(A.length(filteredEntries)),
    });
  });

  const readSymbolSource: TSMorphServiceShape["readSymbolSource"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeById(request.scopeId);
    const entry = yield* findScopeSymbolEntry(scope, request.symbolId);

    return new TsMorphSymbolSourceResult({
      scopeId: scope.scopeId,
      symbol: entry.symbol,
      sourceText: entry.sourceText,
      contentHash: entry.contentHash,
    });
  });

  const getDiagnostics: TSMorphServiceShape["getDiagnostics"] = Effect.fn(function* (request) {
    const scope = yield* resolveScopeById(request.scopeId);
    const loadedSourceFile = yield* loadSourceFile(scope, request.filePath);
    const normalizedLoadedSourceFilePath = pathApi.normalize(loadedSourceFile.sourceFile.getFilePath());
    const diagnostics = yield* pipe(
      loadedSourceFile.sourceFile.getPreEmitDiagnostics(),
      A.filter((diagnostic) => {
        const diagnosticSourceFile = diagnostic.getSourceFile();

        return (
          P.isNotUndefined(diagnosticSourceFile) &&
          pathApi.normalize(diagnosticSourceFile.getFilePath()) === normalizedLoadedSourceFilePath
        );
      }),
      Effect.forEach((diagnostic) => {
        const start = diagnostic.getStart() ?? 0;
        const length = diagnostic.getLength() ?? 0;
        const end = start + length;
        const startPosition = loadedSourceFile.sourceFile.getLineAndColumnAtPos(start);
        const endPosition = loadedSourceFile.sourceFile.getLineAndColumnAtPos(end);
        const source = diagnostic.getSource();

        return decodeOrFail(
          decodeTsMorphDiagnostic,
          {
            category: normalizeDiagnosticCategory(diagnostic.getCategory()),
            code: decodeNonNegativeInt(diagnostic.getCode()),
            message: flattenDiagnosticMessageText(diagnostic.getMessageText()),
            source: source ?? null,
            startLine: decodeLineNumber(startPosition.line),
            startColumn: decodeColumnNumber(startPosition.column),
            endLine: decodeLineNumber(endPosition.line),
            endColumn: decodeColumnNumber(endPosition.column),
          },
          (message) =>
            new TsMorphSourceFileError({
              scopeId: O.some(scope.scopeId),
              filePath: S.decodeOption(TypeScriptFilePath)(loadedSourceFile.filePath),
              message: `Failed to normalize diagnostic for "${loadedSourceFile.filePath}": ${message}`,
            })
        );
      }),
      Effect.map(A.sort(byNormalizedDiagnosticAscending))
    );

    return new TsMorphDiagnosticsResult({
      scopeId: scope.scopeId,
      filePath: loadedSourceFile.filePath,
      diagnostics,
    });
  });

  const inspectProject: TSMorphServiceShape["inspectProject"] = Effect.fn("TSMorphService.inspectProject")(
    function* (request, inspect) {
      const scope = yield* resolveScopeFromEntrypoint(
        request.entrypoint,
        request.repoRootPath,
        request.mode,
        request.referencePolicy
      );
      const project = yield* projectPool.getOrCreate(scope);

      for (const sourceFileGlob of request.sourceFileGlobs) {
        yield* Effect.try({
          try: () => project.addSourceFilesAtPaths(sourceFileGlob),
          catch: (cause) =>
            new TsMorphSourceFileError({
              scopeId: O.some(scope.scopeId),
              filePath: O.none(),
              message: `Failed to add source file glob "${sourceFileGlob}": ${
                P.isObject(cause) && P.hasProperty(cause, "message") && P.isString(cause.message)
                  ? cause.message
                  : Inspectable.toStringUnknown(cause)
              }`,
            }),
        }).pipe(Effect.catch((error) => (isMissingDirectoryError(error.message) ? Effect.void : Effect.fail(error))));
      }

      if (!A.isReadonlyArrayEmpty(request.sourceFileGlobs)) {
        MutableHashMap.remove(symbolIndexPool, scope.cacheKey);
      }

      for (const filePath of request.filePaths) {
        yield* loadSourceFile(scope, filePath);
      }

      const sourceFiles = A.filter(project.getSourceFiles(), (sourceFile) => {
        if (scope.referencePolicy !== TsMorphReferencePolicy.Enum.workspaceOnly) {
          return true;
        }

        return !isOutsideAncestor(pathApi, scope.workspaceDirectoryPath, pathApi.normalize(sourceFile.getFilePath()));
      });

      return yield* Effect.try({
        try: () =>
          inspect({
            scope,
            project,
            sourceFiles,
          }),
        catch: (cause) =>
          new TsMorphSourceFileError({
            scopeId: O.some(scope.scopeId),
            filePath: O.none(),
            message: `Read-only project inspection failed for scope "${scope.scopeId}": ${schemaMessage(cause)}`,
          }),
      });
    }
  );

  const updateSourceFile: TSMorphServiceShape["updateSourceFile"] = Effect.fn("TSMorphService.updateSourceFile")(
    function* (filePath, update) {
      const safeFilePath = TypeScriptImplementationFilePath.make(filePath);
      const scope = yield* resolveScopeFromEntrypoint(
        {
          _tag: "file",
          filePath: safeFilePath,
        },
        O.none(),
        DEFAULT_SCOPE_MODE,
        DEFAULT_REFERENCE_POLICY
      );
      const loadedSourceFile = yield* loadSourceFile(scope, safeFilePath);
      const project = yield* projectPool.getOrCreate(scope);
      const before = loadedSourceFile.sourceFile.getFullText();

      yield* Effect.try({
        try: () => update(loadedSourceFile.sourceFile, project),
        catch: (cause) =>
          new TsMorphSourceFileError({
            scopeId: O.some(scope.scopeId),
            filePath: S.decodeOption(TypeScriptFilePath)(loadedSourceFile.filePath),
            message: `Failed to update source file "${loadedSourceFile.filePath}": ${schemaMessage(cause)}`,
          }),
      });

      const after = loadedSourceFile.sourceFile.getFullText();
      if (before === after) {
        return false;
      }

      yield* Effect.tryPromise({
        try: () => loadedSourceFile.sourceFile.save(),
        catch: (cause) =>
          new TsMorphSourceFileError({
            scopeId: O.some(scope.scopeId),
            filePath: S.decodeOption(TypeScriptFilePath)(loadedSourceFile.filePath),
            message: `Failed to save source file "${loadedSourceFile.filePath}": ${schemaMessage(cause)}`,
          }),
      });

      MutableHashMap.remove(symbolIndexPool, scope.cacheKey);
      return true;
    }
  );

  return {
    resolveProjectScope,
    inspectProject,
    getFileOutline,
    getSymbolById,
    searchSymbols,
    readSourceText,
    readSymbolSource,
    getDiagnostics,
    updateSourceFile,
  };
});

/**
 * Default live layer for the current TSMorphService contract.
 *
 * @example
 * ```ts
 * import { TSMorphServiceLive } from "@beep/repo-utils"
 * const value = TSMorphServiceLive
 * ```
 * @category Configuration
 * @since 0.0.0
 */
export const TSMorphServiceLive: Layer.Layer<TSMorphService, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
  TSMorphService,
  createTSMorphService().pipe(Effect.map(TSMorphService.of))
);
