import { $RepoMemoryServerId } from "@beep/identity/packages";
import {
  RepoId,
  RepoImportEdge,
  RepoSourceFile,
  RepoSourceSnapshot,
  type RepoSymbolKind,
  RepoSymbolRecord,
  SourceSnapshotId,
} from "@beep/repo-memory-domain";
import { FilePath, NonNegativeInt, PosInt, Sha256HexFromBytes, TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import { DateTime, Effect, FileSystem, HashSet, Layer, Order, Path, pipe, ServiceMap, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Node, Project, type SourceFile, type Statement, VariableDeclarationKind } from "ts-morph";
import { recordIndexedFileCount } from "./RepoMemoryMetrics.js";

const $I = $RepoMemoryServerId.create("internal/TypeScriptIndex");
const decodeContentHash = S.decodeUnknownEffect(Sha256HexFromBytes);
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeSourceSnapshotId = S.decodeUnknownSync(SourceSnapshotId);
const textEncoder = new TextEncoder();
const maxDeclarationTextLength = 4000;
const isNonEmptyString = (value: string): boolean => Str.length(value) > 0;
const ignoredDirectoryNames = HashSet.fromIterable([
  ".git",
  ".next",
  ".repos",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "outputs",
]);
const typeScriptSourceFileSuffixes = A.make(".cts", ".mts", ".ts", ".tsx");

type OutlineNode =
  | Statement
  | import("ts-morph").VariableDeclaration
  | import("ts-morph").ClassDeclaration
  | import("ts-morph").FunctionDeclaration
  | import("ts-morph").InterfaceDeclaration
  | import("ts-morph").TypeAliasDeclaration
  | import("ts-morph").EnumDeclaration
  | import("ts-morph").ModuleDeclaration;

class ProjectScope extends S.Class<ProjectScope>($I`ProjectScope`)(
  {
    workspaceName: S.String,
    tsconfigPath: FilePath,
  },
  $I.annote("ProjectScope", {
    description: "Resolved tsconfig scope used to build one workflow-scoped ts-morph project.",
  })
) {}

export class IndexedTypeScriptArtifacts extends S.Class<IndexedTypeScriptArtifacts>($I`IndexedTypeScriptArtifacts`)(
  {
    snapshot: RepoSourceSnapshot,
    files: S.Array(RepoSourceFile),
    symbols: S.Array(RepoSymbolRecord),
    importEdges: S.Array(RepoImportEdge),
  },
  $I.annote("IndexedTypeScriptArtifacts", {
    description: "Workflow-scoped deterministic TypeScript extraction result.",
  })
) {}

export class TypeScriptIndexRequest extends S.Class<TypeScriptIndexRequest>($I`TypeScriptIndexRequest`)(
  {
    repoId: RepoId,
    repoPath: FilePath,
  },
  $I.annote("TypeScriptIndexRequest", {
    description: "Workflow-scoped request for deterministic TypeScript repo extraction.",
  })
) {}

export class TypeScriptIndexError extends TaggedErrorClass<TypeScriptIndexError>($I`TypeScriptIndexError`)(
  "TypeScriptIndexError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("TypeScriptIndexError", {
    description: "Typed failure from deterministic TypeScript index extraction.",
  })
) {}

export interface TypeScriptIndexServiceShape {
  readonly indexRepo: (
    request: TypeScriptIndexRequest
  ) => Effect.Effect<IndexedTypeScriptArtifacts, TypeScriptIndexError>;
}

export class TypeScriptIndexService extends ServiceMap.Service<TypeScriptIndexService, TypeScriptIndexServiceShape>()(
  $I`TypeScriptIndexService`
) {
  static readonly layer: Layer.Layer<TypeScriptIndexService, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
    TypeScriptIndexService,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      return TypeScriptIndexService.of({
        indexRepo: (options) =>
          indexTypeScriptRepo(options).pipe(
            Effect.withSpan("TypeScriptIndexService.indexRepo"),
            Effect.annotateLogs({ component: "typescript-index" }),
            Effect.provideService(FileSystem.FileSystem, fs),
            Effect.provideService(Path.Path, path)
          ),
      });
    })
  );
}

const toIndexError = (message: string, status: number, cause?: unknown): TypeScriptIndexError =>
  new TypeScriptIndexError({
    message,
    status,
    cause: O.fromUndefinedOr(cause),
  });

const isTypeScriptSourceFile = (filePath: string): boolean => {
  if (pipe(filePath, Str.endsWith(".d.ts"))) {
    return false;
  }

  return A.some(typeScriptSourceFileSuffixes, (suffix) => pipe(filePath, Str.endsWith(suffix)));
};

const isIgnoredPath = (absolutePath: string): boolean =>
  pipe(
    Str.split("/")(absolutePath),
    A.some((segment) => HashSet.has(ignoredDirectoryNames, segment))
  );

const boundedDeclarationText = (text: string): string => {
  const normalized = pipe(text, Str.trim);
  return Str.length(normalized) <= maxDeclarationTextLength
    ? normalized
    : `${pipe(normalized, Str.slice(0, maxDeclarationTextLength - 3))}...`;
};

const firstSignatureLine = (text: string): string =>
  pipe(
    Str.split("\n")(text),
    A.map(Str.trim),
    A.findFirst(Str.isNonEmpty),
    O.getOrElse(() => Str.trim(text))
  );

const readJsDocSummary = (node: OutlineNode): O.Option<string> => {
  if (!Node.isJSDocable(node)) {
    return O.none();
  }

  const description = pipe(
    node.getJsDocs(),
    A.map((doc) => Str.trim(doc.getDescription())),
    A.filter(Str.isNonEmpty),
    A.join("\n\n")
  );

  return isNonEmptyString(description) ? O.some(description) : O.none();
};

const makeSymbolId = (filePath: string, qualifiedName: string, symbolKind: RepoSymbolKind): string =>
  `${filePath}::${qualifiedName}#${symbolKind}`;

const symbolSearchText = (parts: {
  readonly symbolName: string;
  readonly qualifiedName: string;
  readonly signature: string;
  readonly jsDocSummary: O.Option<string>;
  readonly declarationText: string;
}): string =>
  pipe(
    A.make(
      parts.symbolName,
      parts.qualifiedName,
      parts.signature,
      parts.declarationText,
      pipe(parts.jsDocSummary, O.getOrElse(thunkEmptyStr))
    ),
    A.map(Str.trim),
    A.filter(Str.isNonEmpty),
    A.join(" "),
    Str.toLowerCase
  );

const isExportedNode = (node: OutlineNode): boolean => (Node.isExportable(node) ? node.isExported() : false);

const makeRepoSourceFile = Effect.fn("TypeScriptIndex.makeRepoSourceFile")(function* (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly workspaceName: string;
  readonly tsconfigPath: string;
  readonly filePath: string;
  readonly sourceText: string;
}): Effect.fn.Return<RepoSourceFile, TypeScriptIndexError> {
  const contentHash = yield* decodeContentHash(textEncoder.encode(options.sourceText)).pipe(
    Effect.mapError((cause) => toIndexError(`Failed to hash source text for "${options.filePath}".`, 500, cause))
  );

  return new RepoSourceFile({
    repoId: options.repoId,
    sourceSnapshotId: options.sourceSnapshotId,
    filePath: decodeFilePath(options.filePath),
    contentHash,
    lineCount: decodeNonNegativeInt(pipe(options.sourceText, Str.split("\n"), A.length)),
    workspaceName: options.workspaceName,
    tsconfigPath: decodeFilePath(options.tsconfigPath),
  });
});

const makeRepoSymbolRecord = Effect.fn("TypeScriptIndex.makeRepoSymbolRecord")(
  (options: {
    readonly repoId: RepoId;
    readonly sourceSnapshotId: SourceSnapshotId;
    readonly filePath: string;
    readonly symbolName: string;
    readonly symbolKind: RepoSymbolKind;
    readonly exported: boolean;
    readonly node: OutlineNode;
  }): Effect.Effect<RepoSymbolRecord, TypeScriptIndexError> => {
    const qualifiedName = options.symbolName;
    const declarationText = boundedDeclarationText(options.node.getText());
    const signature = firstSignatureLine(declarationText);
    const jsDocSummary = readJsDocSummary(options.node);

    return Effect.succeed(
      new RepoSymbolRecord({
        repoId: options.repoId,
        sourceSnapshotId: options.sourceSnapshotId,
        symbolId: makeSymbolId(options.filePath, qualifiedName, options.symbolKind),
        symbolName: options.symbolName,
        qualifiedName,
        symbolKind: options.symbolKind,
        exported: options.exported,
        filePath: decodeFilePath(options.filePath),
        startLine: decodePosInt(options.node.getStartLineNumber(true)),
        endLine: decodePosInt(options.node.getEndLineNumber()),
        signature,
        jsDocSummary,
        declarationText,
        searchText: symbolSearchText({
          symbolName: options.symbolName,
          qualifiedName,
          signature,
          jsDocSummary,
          declarationText,
        }),
      })
    );
  }
);

const extractVariableSymbols = Effect.fn("TypeScriptIndex.extractVariableSymbols")(function* (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly filePath: string;
  readonly statement: import("ts-morph").VariableStatement;
}): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, TypeScriptIndexError> {
  if (options.statement.getDeclarationKind() !== VariableDeclarationKind.Const) {
    return A.empty<RepoSymbolRecord>();
  }

  let results = A.empty<RepoSymbolRecord>();

  for (const declaration of options.statement.getDeclarations()) {
    const symbolName = pipe(declaration.getName(), Str.trim);
    if (!isNonEmptyString(symbolName)) {
      continue;
    }

    results = A.append(
      results,
      yield* makeRepoSymbolRecord({
        repoId: options.repoId,
        sourceSnapshotId: options.sourceSnapshotId,
        filePath: options.filePath,
        symbolName,
        symbolKind: "const",
        exported: isExportedNode(options.statement),
        node: declaration,
      })
    );
  }

  return results;
});

const extractTopLevelSymbols = Effect.fn("TypeScriptIndex.extractTopLevelSymbols")(function* (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly filePath: string;
  readonly sourceFile: SourceFile;
}): Effect.fn.Return<ReadonlyArray<RepoSymbolRecord>, TypeScriptIndexError> {
  let symbols = A.empty<RepoSymbolRecord>();

  for (const statement of options.sourceFile.getStatements()) {
    if (Node.isFunctionDeclaration(statement)) {
      const symbolName = statement.getName();
      if (symbolName !== undefined) {
        symbols = A.append(
          symbols,
          yield* makeRepoSymbolRecord({
            repoId: options.repoId,
            sourceSnapshotId: options.sourceSnapshotId,
            filePath: options.filePath,
            symbolName,
            symbolKind: "function",
            exported: isExportedNode(statement),
            node: statement,
          })
        );
      }
      continue;
    }

    if (Node.isClassDeclaration(statement)) {
      const symbolName = statement.getName();
      if (symbolName !== undefined) {
        symbols = A.append(
          symbols,
          yield* makeRepoSymbolRecord({
            repoId: options.repoId,
            sourceSnapshotId: options.sourceSnapshotId,
            filePath: options.filePath,
            symbolName,
            symbolKind: "class",
            exported: isExportedNode(statement),
            node: statement,
          })
        );
      }
      continue;
    }

    if (Node.isInterfaceDeclaration(statement)) {
      symbols = A.append(
        symbols,
        yield* makeRepoSymbolRecord({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          filePath: options.filePath,
          symbolName: statement.getName(),
          symbolKind: "interface",
          exported: isExportedNode(statement),
          node: statement,
        })
      );
      continue;
    }

    if (Node.isTypeAliasDeclaration(statement)) {
      symbols = A.append(
        symbols,
        yield* makeRepoSymbolRecord({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          filePath: options.filePath,
          symbolName: statement.getName(),
          symbolKind: "typeAlias",
          exported: isExportedNode(statement),
          node: statement,
        })
      );
      continue;
    }

    if (Node.isEnumDeclaration(statement)) {
      symbols = A.append(
        symbols,
        yield* makeRepoSymbolRecord({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          filePath: options.filePath,
          symbolName: statement.getName(),
          symbolKind: "enum",
          exported: isExportedNode(statement),
          node: statement,
        })
      );
      continue;
    }

    if (Node.isModuleDeclaration(statement)) {
      symbols = A.append(
        symbols,
        yield* makeRepoSymbolRecord({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          filePath: options.filePath,
          symbolName: statement.getName(),
          symbolKind: "namespace",
          exported: isExportedNode(statement),
          node: statement,
        })
      );
      continue;
    }

    if (Node.isVariableStatement(statement)) {
      symbols = A.appendAll(
        symbols,
        yield* extractVariableSymbols({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          filePath: options.filePath,
          statement,
        })
      );
    }
  }

  return symbols;
});

const extractImportEdges = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly filePath: string;
  readonly sourceFile: SourceFile;
}): ReadonlyArray<RepoImportEdge> => {
  let results = A.empty<RepoImportEdge>();

  for (const importDeclaration of options.sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
    const typeOnly = importDeclaration.isTypeOnly();
    const defaultImport = importDeclaration.getDefaultImport();
    const namespaceImport = importDeclaration.getNamespaceImport();
    const namedImports = importDeclaration.getNamedImports();

    if (defaultImport !== undefined) {
      results = A.append(
        results,
        new RepoImportEdge({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          importerFilePath: decodeFilePath(options.filePath),
          startLine: decodePosInt(importDeclaration.getStartLineNumber(true)),
          endLine: decodePosInt(importDeclaration.getEndLineNumber()),
          moduleSpecifier,
          importedName: O.some(defaultImport.getText()),
          typeOnly,
        })
      );
    }

    if (namespaceImport !== undefined) {
      results = A.append(
        results,
        new RepoImportEdge({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          importerFilePath: decodeFilePath(options.filePath),
          startLine: decodePosInt(importDeclaration.getStartLineNumber(true)),
          endLine: decodePosInt(importDeclaration.getEndLineNumber()),
          moduleSpecifier,
          importedName: O.some(namespaceImport.getText()),
          typeOnly,
        })
      );
    }

    for (const namedImport of namedImports) {
      results = A.append(
        results,
        new RepoImportEdge({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          importerFilePath: decodeFilePath(options.filePath),
          startLine: decodePosInt(importDeclaration.getStartLineNumber(true)),
          endLine: decodePosInt(importDeclaration.getEndLineNumber()),
          moduleSpecifier,
          importedName: O.some(namedImport.getName()),
          typeOnly,
        })
      );
    }

    if (defaultImport === undefined && namespaceImport === undefined && !A.isReadonlyArrayNonEmpty(namedImports)) {
      results = A.append(
        results,
        new RepoImportEdge({
          repoId: options.repoId,
          sourceSnapshotId: options.sourceSnapshotId,
          importerFilePath: decodeFilePath(options.filePath),
          startLine: decodePosInt(importDeclaration.getStartLineNumber(true)),
          endLine: decodePosInt(importDeclaration.getEndLineNumber()),
          moduleSpecifier,
          importedName: O.none(),
          typeOnly,
        })
      );
    }
  }

  return results;
};

const discoverProjectScopes = Effect.fn("TypeScriptIndex.discoverProjectScopes")(function* (
  repoRootPath: string
): Effect.fn.Return<ReadonlyArray<ProjectScope>, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const walk = Effect.fn("TypeScriptIndex.walkTsConfigs")(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
    const entries = yield* fs
      .readDirectory(currentPath)
      .pipe(
        Effect.mapError((cause) =>
          toIndexError(
            `Failed to read repository directory "${currentPath}" while discovering tsconfig scopes.`,
            500,
            cause
          )
        )
      );

    let results = A.empty<string>();

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry);
      const stat = yield* fs
        .stat(absolutePath)
        .pipe(
          Effect.mapError((cause) =>
            toIndexError(
              `Failed to stat repository entry "${absolutePath}" while discovering tsconfig scopes.`,
              500,
              cause
            )
          )
        );

      if (stat.type === "Directory") {
        if (HashSet.has(ignoredDirectoryNames, entry)) {
          continue;
        }

        results = A.appendAll(results, yield* walk(absolutePath));
        continue;
      }

      if (entry === "tsconfig.json") {
        results = A.append(results, absolutePath);
      }
    }

    return results;
  });

  const tsconfigPaths = A.sort(yield* walk(repoRootPath), Order.String);
  if (!A.isReadonlyArrayNonEmpty(tsconfigPaths)) {
    return yield* toIndexError(
      `Repository "${repoRootPath}" does not contain any discoverable tsconfig.json files.`,
      400
    );
  }

  return pipe(
    tsconfigPaths,
    A.map(
      (tsconfigPath) =>
        new ProjectScope({
          workspaceName:
            path.dirname(tsconfigPath) === repoRootPath ? "root" : path.basename(path.dirname(tsconfigPath)),
          tsconfigPath: decodeFilePath(tsconfigPath),
        })
    )
  );
});

const projectSourceFiles = (repoRootPath: string, project: Project): ReadonlyArray<SourceFile> =>
  pipe(
    project.getSourceFiles(),
    A.filter((sourceFile) => {
      const filePath = sourceFile.getFilePath();
      return (
        !sourceFile.isFromExternalLibrary() &&
        pipe(filePath, Str.startsWith(repoRootPath)) &&
        !isIgnoredPath(filePath) &&
        isTypeScriptSourceFile(filePath)
      );
    })
  );

const withScopedProject = <A>(
  tsconfigPath: string,
  use: (project: Project) => Effect.Effect<A, TypeScriptIndexError>
): Effect.Effect<A, TypeScriptIndexError> =>
  Effect.acquireUseRelease(
    Effect.try({
      try: () =>
        new Project({
          tsConfigFilePath: tsconfigPath,
          skipFileDependencyResolution: true,
          skipLoadingLibFiles: true,
        }),
      catch: (cause) => toIndexError(`Failed to initialize ts-morph project for "${tsconfigPath}".`, 400, cause),
    }),
    use,
    (project) =>
      Effect.sync(() => {
        for (const sourceFile of project.getSourceFiles()) {
          project.removeSourceFile(sourceFile);
        }
      }).pipe(Effect.ignore)
  );

const snapshotIdFromFiles = Effect.fn("TypeScriptIndex.snapshotIdFromFiles")(function* (
  files: ReadonlyArray<RepoSourceFile>
): Effect.fn.Return<SourceSnapshotId, TypeScriptIndexError> {
  const fingerprint = pipe(
    files,
    A.sort(Order.mapInput(Order.String, (file: RepoSourceFile) => file.filePath)),
    A.map((file) => `${file.filePath}:${file.contentHash}`),
    A.join("\n")
  );

  const digest = yield* decodeContentHash(textEncoder.encode(fingerprint)).pipe(
    Effect.mapError((cause) => toIndexError("Failed to compute a deterministic source snapshot id.", 500, cause))
  );

  return decodeSourceSnapshotId(`snapshot:${digest}`);
});

export const indexTypeScriptRepo = Effect.fn("TypeScriptIndex.indexTypeScriptRepo")(function* (
  options: TypeScriptIndexRequest
): Effect.fn.Return<IndexedTypeScriptArtifacts, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
  const scopes = yield* discoverProjectScopes(options.repoPath);
  let seenFiles = HashSet.empty<string>();
  const provisionalSnapshotId = decodeSourceSnapshotId("snapshot:pending");
  let extractedFiles = A.empty<RepoSourceFile>();
  let extractedSymbols = A.empty<RepoSymbolRecord>();
  let extractedImportEdges = A.empty<RepoImportEdge>();

  for (const scope of scopes) {
    yield* withScopedProject(scope.tsconfigPath, (project) =>
      Effect.gen(function* () {
        for (const sourceFile of projectSourceFiles(options.repoPath, project)) {
          const filePath = sourceFile.getFilePath();
          if (HashSet.has(seenFiles, filePath)) {
            continue;
          }
          seenFiles = HashSet.add(seenFiles, filePath);

          const sourceText = sourceFile.getFullText();
          extractedFiles = A.append(
            extractedFiles,
            yield* makeRepoSourceFile({
              repoId: options.repoId,
              sourceSnapshotId: provisionalSnapshotId,
              workspaceName: scope.workspaceName,
              tsconfigPath: scope.tsconfigPath,
              filePath,
              sourceText,
            })
          );

          extractedSymbols = A.appendAll(
            extractedSymbols,
            yield* extractTopLevelSymbols({
              repoId: options.repoId,
              sourceSnapshotId: provisionalSnapshotId,
              filePath,
              sourceFile,
            })
          );

          extractedImportEdges = A.appendAll(
            extractedImportEdges,
            extractImportEdges({
              repoId: options.repoId,
              sourceSnapshotId: provisionalSnapshotId,
              filePath,
              sourceFile,
            })
          );
        }
      })
    );
  }

  const capturedAt = yield* DateTime.now;
  const sourceSnapshotId = yield* snapshotIdFromFiles(extractedFiles);

  const files = pipe(
    extractedFiles,
    A.map(
      (file) =>
        new RepoSourceFile({
          ...file,
          sourceSnapshotId,
        })
    )
  );
  const symbols = pipe(
    extractedSymbols,
    A.map(
      (symbol) =>
        new RepoSymbolRecord({
          ...symbol,
          sourceSnapshotId,
        })
    )
  );
  const importEdges = pipe(
    extractedImportEdges,
    A.map(
      (importEdge) =>
        new RepoImportEdge({
          ...importEdge,
          sourceSnapshotId,
        })
    )
  );
  const indexedFileCount = decodeNonNegativeInt(A.length(files));

  yield* Effect.annotateCurrentSpan({
    repo_id: options.repoId,
    indexed_file_count: A.length(files),
    symbol_count: A.length(symbols),
    import_edge_count: A.length(importEdges),
    workspace_count: A.length(scopes),
    tsconfig_count: A.length(scopes),
  });
  yield* recordIndexedFileCount(A.length(files));

  return new IndexedTypeScriptArtifacts({
    snapshot: new RepoSourceSnapshot({
      id: sourceSnapshotId,
      repoId: options.repoId,
      capturedAt,
      fileCount: indexedFileCount,
    }),
    files,
    symbols,
    importEdges,
  });
});
