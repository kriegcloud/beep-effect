import { $RepoUtilsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Effect, FileSystem, Layer, MutableHashMap, Path, ServiceMap, String as Str } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type ClassDeclaration,
  type ConstructorDeclaration,
  type EnumDeclaration,
  type FunctionDeclaration,
  type GetAccessorDeclaration,
  type InterfaceDeclaration,
  type MethodDeclaration,
  Node,
  Project,
  type SetAccessorDeclaration,
  type SourceFile,
  type TypeAliasDeclaration,
} from "ts-morph";
import { findRepoRoot } from "../Root.js";
import type {
  ProjectCacheKey,
  SymbolKind,
  TsMorphDiagnosticsRequest,
  TsMorphDiagnosticsResult,
  TsMorphFileOutlineRequest,
  TsMorphProjectScopeRequest,
  TsMorphScopeEntrypoint,
  TsMorphSourceTextRequest,
  Symbol as TsMorphSymbol,
  TsMorphSymbolLookupRequest,
  TsMorphSymbolLookupResult,
  TsMorphSymbolSearchRequest,
  TsMorphSymbolSearchResult,
  TsMorphSymbolSourceRequest,
  TsMorphSymbolSourceResult,
} from "./TSMorph.model.js";
import {
  ByteLength,
  ByteOffset,
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
  SymbolNameSegment,
  SymbolQualifiedName,
  symbolCategoryFromKind,
  TsConfigFilePath,
  TsMorphFileOutline,
  TsMorphProjectScope,
  TsMorphReferencePolicy,
  TsMorphScopeMode,
  TsMorphSourceTextResult,
  TypeScriptFilePath,
  TypeScriptImplementationFilePath,
  TypeScriptImplementationFilePathToSymbolFilePath,
  WorkspaceDirectoryPath,
} from "./TSMorph.model.js";

const $I = $RepoUtilsId.create("TSMorph/TSMorph.service");

const DEFAULT_SCOPE_MODE = TsMorphScopeMode.Enum.syntax;
const DEFAULT_REFERENCE_POLICY = TsMorphReferencePolicy.Enum.workspaceOnly;
const DEFAULT_TSCONFIG_FILE_NAME = "tsconfig.json";
const utf8Encoder = new TextEncoder();

const decodeByteLength = S.decodeUnknownSync(ByteLength);
const decodeByteOffset = S.decodeUnknownSync(ByteOffset);
const decodeContentHashFromSourceText = S.decodeUnknownEffect(ContentHashFromSourceText);
const decodeLineNumber = S.decodeUnknownSync(LineNumber);
const decodeProjectScopeIdParts = S.decodeUnknownSync(ProjectScopeIdParts);
const decodeRepoRootPath = S.decodeUnknownSync(RepoRootPath);
const decodeSourceText = S.decodeUnknownSync(SourceText);
const decodeSymbolFilePath = S.decodeUnknownSync(SymbolFilePath);
const decodeSymbolNameSegment = S.decodeUnknownSync(SymbolNameSegment);
const decodeSymbolQualifiedName = S.decodeUnknownSync(SymbolQualifiedName);
const decodeTsConfigFilePath = S.decodeUnknownSync(TsConfigFilePath);
const decodeTypeScriptFilePath = S.decodeUnknownSync(TypeScriptFilePath);
const decodeTypeScriptImplementationFilePath = S.decodeUnknownSync(TypeScriptImplementationFilePath);
const decodeTypeScriptImplementationToSymbolFilePath = S.decodeUnknownSync(
  TypeScriptImplementationFilePathToSymbolFilePath
);
const decodeWorkspaceDirectoryPath = S.decodeUnknownSync(WorkspaceDirectoryPath);

const isSymbolNameSegment = S.is(SymbolNameSegment);
const isSymbolQualifiedName = S.is(SymbolQualifiedName);

/**
 * Typed error returned by the remaining placeholder TSMorphService methods.
 *
 * @since 0.0.0
 * @category Errors
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
      "Typed error indicating that a TSMorphService method contract exists but is not yet backed by a live implementation.",
  })
) {}

/**
 * Typed error returned when a scope or repository path cannot be resolved.
 *
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
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
 * Typed error returned when a request targets a currently unsupported TypeScript source boundary.
 *
 * @since 0.0.0
 * @category Errors
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
 * @since 0.0.0
 * @category Errors
 */
export type TSMorphServiceError =
  | TsMorphProjectLoadError
  | TsMorphScopeResolutionError
  | TsMorphSourceFileError
  | TsMorphUnsupportedFileError
  | TsMorphServiceUnavailableError;

/**
 * Read-only v1 service contract for ts-morph-backed scope, symbol, source, and diagnostic operations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TSMorphServiceShape = {
  readonly resolveProjectScope: (
    request: TsMorphProjectScopeRequest
  ) => Effect.Effect<TsMorphProjectScope, TSMorphServiceError>;
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
};

/**
 * Service tag for the read-only v1 ts-morph contract.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class TSMorphService extends ServiceMap.Service<TSMorphService, TSMorphServiceShape>()($I`TSMorphService`) {}

type OutlineDeclaration =
  | ClassDeclaration
  | ConstructorDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | GetAccessorDeclaration
  | InterfaceDeclaration
  | MethodDeclaration
  | SetAccessorDeclaration
  | TypeAliasDeclaration;

type ProjectPool = {
  readonly getOrCreate: (scope: TsMorphProjectScope) => Effect.Effect<Project, TsMorphProjectLoadError>;
};

const schemaMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause));

const unavailable = <A>(method: string): Effect.Effect<A, TSMorphServiceError> =>
  Effect.fail(
    new TsMorphServiceUnavailableError({
      method,
      message: `TSMorphService.${method} is not implemented yet. The schema and service contract are available, but the live ts-morph-backed engine still needs to be wired.`,
    })
  );

const decodeOrFail = <A, E extends TSMorphServiceError>(
  decode: (value: unknown) => A,
  value: unknown,
  makeError: (message: string) => E
): Effect.Effect<A, E> =>
  Effect.try({
    try: () => decode(value),
    catch: (cause) => makeError(schemaMessage(cause)),
  });

const resolveAbsolutePath = (pathApi: Path.Path, repoRootPath: RepoRootPath, inputPath: string): string =>
  pathApi.normalize(pathApi.isAbsolute(inputPath) ? inputPath : pathApi.resolve(repoRootPath, inputPath));

const isOutsideAncestor = (pathApi: Path.Path, parentPath: string, childPath: string): boolean => {
  const relativePath = pathApi.relative(parentPath, childPath);
  return relativePath.length === 0 ? false : pathApi.isAbsolute(relativePath) || Str.startsWith("..")(relativePath);
};

const decodeRepoRelativePath = (
  pathApi: Path.Path,
  repoRootPath: RepoRootPath,
  absolutePath: string
): Effect.Effect<string, TsMorphScopeResolutionError> => {
  const relativePath = pathApi.normalize(pathApi.relative(repoRootPath, absolutePath));

  if (relativePath.length === 0 || pathApi.isAbsolute(relativePath) || Str.startsWith("..")(relativePath)) {
    return Effect.fail(
      new TsMorphScopeResolutionError({
        entrypoint: absolutePath,
        message: `Resolved path "${absolutePath}" is outside the repository root "${repoRootPath}".`,
      })
    );
  }

  return Effect.succeed(relativePath);
};

const ensureExists = <E extends TSMorphServiceError>(
  fs: FileSystem.FileSystem,
  absolutePath: string,
  makeError: () => E
): Effect.Effect<void, E> =>
  fs.exists(absolutePath).pipe(
    Effect.orElseSucceed(thunkFalse),
    Effect.flatMap((exists) => (exists ? Effect.void : Effect.fail(makeError())))
  );

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

const readDocstring = (node: OutlineDeclaration): O.Option<string> => {
  if (!Node.isJSDocable(node)) {
    return O.none();
  }

  const descriptions: Array<string> = [];
  for (const jsDoc of node.getJsDocs()) {
    const description = Str.trim(jsDoc.getDescription());
    if (description.length > 0) {
      descriptions.push(description);
    }
  }

  return descriptions.length === 0 ? O.none() : O.some(descriptions.join("\n\n"));
};

const readDecorators = (node: OutlineDeclaration): ReadonlyArray<string> => {
  if (!Node.isDecoratable(node)) {
    return [];
  }

  const decorators: Array<string> = [];
  for (const decorator of node.getDecorators()) {
    const decoratorText = Str.trim(decorator.getText());
    if (decoratorText.length > 0) {
      decorators.push(decoratorText);
    }
  }

  return decorators;
};

const readSignature = (node: OutlineDeclaration): string => {
  const nodeText = Str.trim(node.getText());
  if (nodeText.length === 0) {
    return nodeText;
  }

  const [firstLine] = nodeText.split("\n");
  return firstLine === undefined ? nodeText : Str.trim(firstLine);
};

const makeSummary = (docstring: O.Option<string>): O.Option<string> => docstring;

const makeKeywords = (name: string, qualifiedName: string, kind: SymbolKind): ReadonlyArray<string> => [
  name,
  qualifiedName,
  kind,
  symbolCategoryFromKind(kind),
];

const getDeclarationName = (
  declaration: OutlineDeclaration
): O.Option<{
  readonly name: string;
  readonly kind: SymbolKind;
}> => {
  if (Node.isConstructorDeclaration(declaration)) {
    return O.some({
      name: "constructor",
      kind: "Constructor",
    });
  }

  if (Node.isFunctionDeclaration(declaration)) {
    const name = declaration.getName();
    return name === undefined
      ? O.none()
      : O.some({
          name,
          kind: "FunctionDeclaration",
        });
  }

  if (Node.isClassDeclaration(declaration)) {
    const name = declaration.getName();
    return name === undefined
      ? O.none()
      : O.some({
          name,
          kind: "ClassDeclaration",
        });
  }

  if (Node.isMethodDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "MethodDeclaration",
    });
  }

  if (Node.isGetAccessorDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "GetAccessor",
    });
  }

  if (Node.isSetAccessorDeclaration(declaration)) {
    return O.some({
      name: declaration.getName(),
      kind: "SetAccessor",
    });
  }

  if (Node.isInterfaceDeclaration(declaration)) {
    const name = declaration.getName();
    return name === undefined
      ? O.none()
      : O.some({
          name,
          kind: "InterfaceDeclaration",
        });
  }

  if (Node.isTypeAliasDeclaration(declaration)) {
    const name = declaration.getName();
    return name === undefined
      ? O.none()
      : O.some({
          name,
          kind: "TypeAliasDeclaration",
        });
  }

  const name = declaration.getName();
  return name === undefined
    ? O.none()
    : O.some({
        name,
        kind: "EnumDeclaration",
      });
};

const normalizeOutlineSymbol = (
  sourceFileText: string,
  symbolFilePath: SymbolFilePath,
  declaration: OutlineDeclaration,
  parentSymbol: O.Option<TsMorphSymbol>
): Effect.Effect<O.Option<TsMorphSymbol>, TSMorphServiceError> =>
  Effect.gen(function* () {
    const declarationName = getDeclarationName(declaration);
    if (O.isNone(declarationName)) {
      return O.none<TsMorphSymbol>();
    }

    if (!isSymbolNameSegment(declarationName.value.name)) {
      return O.none<TsMorphSymbol>();
    }

    const qualifiedName = pipeQualifiedName(parentSymbol, declarationName.value.name);
    if (!isSymbolQualifiedName(qualifiedName)) {
      return O.none<TsMorphSymbol>();
    }

    const symbolText = declaration.getFullText();
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

    const startOffset = declaration.getStart(true);
    const bytePrefix = utf8Encoder.encode(sourceFileText.slice(0, startOffset));
    const byteSpan = utf8Encoder.encode(symbolText);
    const docstring = readDocstring(declaration);

    return O.some(
      makeSymbol({
        filePath: decodeSymbolFilePath(symbolFilePath),
        name: decodeSymbolNameSegment(declarationName.value.name),
        qualifiedName: decodeSymbolQualifiedName(qualifiedName),
        kind: declarationName.value.kind,
        signature: readSignature(declaration),
        docstring,
        summary: makeSummary(docstring),
        decorators: readDecorators(declaration),
        keywords: makeKeywords(declarationName.value.name, qualifiedName, declarationName.value.kind),
        parentId: O.map(parentSymbol, (symbol) => symbol.id),
        startLine: decodeLineNumber(declaration.getStartLineNumber(true)),
        endLine: decodeLineNumber(declaration.getEndLineNumber()),
        byteOffset: decodeByteOffset(bytePrefix.length),
        byteLength: decodeByteLength(byteSpan.length),
        contentHash,
      })
    );
  });

const pipeQualifiedName = (parentSymbol: O.Option<TsMorphSymbol>, name: string): string =>
  O.isSome(parentSymbol) ? `${parentSymbol.value.qualifiedName}.${name}` : name;

const collectOutlineSymbols = (
  filePath: TypeScriptFilePath,
  sourceFile: SourceFile
): Effect.Effect<ReadonlyArray<TsMorphSymbol>, TSMorphServiceError> =>
  Effect.gen(function* () {
    const implementationFilePath = yield* decodeOrFail(
      decodeTypeScriptImplementationFilePath,
      filePath,
      (message) =>
        new TsMorphUnsupportedFileError({
          filePath,
          message: `File outlines currently support TypeScript implementation files only: ${message}`,
        })
    );

    const symbolFilePath = yield* decodeOrFail(
      decodeTypeScriptImplementationToSymbolFilePath,
      implementationFilePath,
      (message) =>
        new TsMorphUnsupportedFileError({
          filePath,
          message: `Failed to normalize implementation file path "${implementationFilePath}" for symbol ids: ${message}`,
        })
    );

    const symbols: Array<TsMorphSymbol> = [];
    const sourceText = sourceFile.getFullText();

    for (const statement of sourceFile.getStatements()) {
      if (Node.isFunctionDeclaration(statement)) {
        const symbol = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
        if (O.isSome(symbol)) {
          symbols.push(symbol.value);
        }
        continue;
      }

      if (Node.isClassDeclaration(statement)) {
        const classSymbol = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
        if (O.isSome(classSymbol)) {
          symbols.push(classSymbol.value);

          for (const member of statement.getMembers()) {
            if (
              Node.isConstructorDeclaration(member) ||
              Node.isMethodDeclaration(member) ||
              Node.isGetAccessorDeclaration(member) ||
              Node.isSetAccessorDeclaration(member)
            ) {
              const memberSymbol = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, member, classSymbol);
              if (O.isSome(memberSymbol)) {
                symbols.push(memberSymbol.value);
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
        const symbol = yield* normalizeOutlineSymbol(sourceText, symbolFilePath, statement, O.none());
        if (O.isSome(symbol)) {
          symbols.push(symbol.value);
        }
      }
    }

    return symbols;
  });

/**
 * Construct the current live implementation for the v1 TSMorphService contract.
 *
 * @returns Live service implementation backed by filesystem, path, and ts-morph project loading.
 * @since 0.0.0
 * @category Constructors
 */
export const createTSMorphService = (): Effect.Effect<TSMorphServiceShape, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const pathApi = yield* Path.Path;

    const resolvedScopes = MutableHashMap.empty<string, TsMorphProjectScope>();
    const projectPool = createProjectPool(pathApi);

    const resolveRepoRoot = (
      repoRootPath: O.Option<RepoRootPath>
    ): Effect.Effect<RepoRootPath, TsMorphScopeResolutionError> =>
      Effect.gen(function* () {
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

    const resolveTsConfigPath = (
      repoRootPath: RepoRootPath,
      tsConfigPath: string
    ): Effect.Effect<TsConfigFilePath, TSMorphServiceError> =>
      Effect.gen(function* () {
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

    const resolveScopedFilePath = (
      repoRootPath: RepoRootPath,
      filePath: TypeScriptFilePath
    ): Effect.Effect<
      {
        readonly absoluteFilePath: string;
        readonly filePath: TypeScriptFilePath;
      },
      TSMorphServiceError
    > =>
      Effect.gen(function* () {
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

    const resolveFileEntrypointTsConfig = (
      repoRootPath: RepoRootPath,
      filePath: TypeScriptFilePath
    ): Effect.Effect<TsConfigFilePath, TSMorphServiceError> =>
      Effect.gen(function* () {
        const { absoluteFilePath } = yield* resolveScopedFilePath(repoRootPath, filePath);

        let currentDirectory = pathApi.dirname(absoluteFilePath);
        while (true) {
          const candidateTsConfigPath = pathApi.join(currentDirectory, DEFAULT_TSCONFIG_FILE_NAME);
          const candidateExists = yield* fs.exists(candidateTsConfigPath).pipe(Effect.orElseSucceed(thunkFalse));

          if (candidateExists) {
            const repoRelativeTsConfigPath = yield* decodeRepoRelativePath(
              pathApi,
              repoRootPath,
              candidateTsConfigPath
            );
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

    const buildResolvedScope = (
      repoRootPath: RepoRootPath,
      tsConfigPath: TsConfigFilePath,
      mode: TsMorphScopeMode,
      referencePolicy: TsMorphReferencePolicy
    ): Effect.Effect<TsMorphProjectScope, TSMorphServiceError> =>
      Effect.gen(function* () {
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

    const resolveScopeFromEntrypoint = (
      entrypoint: TsMorphScopeEntrypoint,
      repoRootPath: O.Option<RepoRootPath>,
      mode: TsMorphScopeMode,
      referencePolicy: TsMorphReferencePolicy
    ): Effect.Effect<TsMorphProjectScope, TSMorphServiceError> =>
      Effect.gen(function* () {
        const resolvedRepoRootPath = yield* resolveRepoRoot(repoRootPath);
        const resolvedTsConfigPath =
          entrypoint._tag === "tsconfig"
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
        const sourceFile =
          project.getSourceFile(absoluteFilePath) ?? project.addSourceFileAtPathIfExists(absoluteFilePath);

        if (sourceFile === undefined) {
          return yield* new TsMorphSourceFileError({
            scopeId: O.some(scope.scopeId),
            filePath: S.decodeOption(TypeScriptFilePath)(normalizedFilePath),
            message: `File "${normalizedFilePath}" could not be loaded into ts-morph project scope "${scope.scopeId}".`,
          });
        }

        return {
          sourceFile,
          filePath: normalizedFilePath,
        };
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
      const symbols = yield* collectOutlineSymbols(loadedSourceFile.filePath, loadedSourceFile.sourceFile);

      return new TsMorphFileOutline({
        scopeId: scope.scopeId,
        filePath: loadedSourceFile.filePath,
        symbols,
      });
    });

    return {
      resolveProjectScope,
      getFileOutline,
      getSymbolById: () => unavailable("getSymbolById"),
      searchSymbols: () => unavailable("searchSymbols"),
      readSourceText,
      readSymbolSource: () => unavailable("readSymbolSource"),
      getDiagnostics: () => unavailable("getDiagnostics"),
    };
  });

/**
 * Default live layer for the current TSMorphService contract.
 *
 * @since 0.0.0
 * @category Layers
 */
export const TSMorphServiceLive: Layer.Layer<TSMorphService, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
  TSMorphService,
  createTSMorphService().pipe(Effect.map(TSMorphService.of))
);
