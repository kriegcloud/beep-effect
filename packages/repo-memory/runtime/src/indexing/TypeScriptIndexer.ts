/**
 * Deterministic TypeScript repository indexing service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  CitationSpan,
  RepoDocumentedParameter,
  RepoDocumentedReturn,
  RepoDocumentedThrow,
  RepoId,
  RepoImportEdge,
  type RepoJSDocCoreTag,
  RepoJSDocDeprecatedTag,
  RepoJSDocDescriptionTag,
  RepoJSDocParamTag,
  RepoJSDocRemarksTag,
  RepoJSDocReturnsTag,
  RepoJSDocSeeTag,
  RepoJSDocSummaryTag,
  RepoJSDocThrowsTag,
  RepoSourceFile,
  RepoSourceSnapshot,
  RepoSymbolDocumentation,
  type RepoSymbolKind,
  RepoSymbolRecord,
  RunId,
  SourceSnapshotId,
} from "@beep/repo-memory-model";
import { RepoRunStore, type RepoStoreError } from "@beep/repo-memory-store";
import {
  FilePath,
  NonNegativeInt,
  normalizePath,
  PosInt,
  Sha256HexFromBytes,
  StatusCauseTaggedErrorClass,
} from "@beep/schema";
import { Str, Text, thunkEmptyStr } from "@beep/utils";
import {
  Context,
  DateTime,
  Effect,
  FileSystem,
  flow,
  HashMap,
  HashSet,
  Inspectable,
  Layer,
  MutableHashSet,
  Order,
  Path,
  pipe,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Workflow from "effect/unstable/workflow/Workflow";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import { Node, Project, type SourceFile, type Statement, VariableDeclarationKind } from "ts-morph";
import { recordIndexedFileCount } from "../telemetry/RepoMemoryTelemetry.js";

const $I = $RepoMemoryRuntimeId.create("internal/TypeScriptIndexer");
const decodeContentHash = S.decodeUnknownEffect(Sha256HexFromBytes);
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeSourceSnapshotId = S.decodeUnknownSync(SourceSnapshotId);
const textEncoder = new TextEncoder();
const maxDeclarationTextLength = 4000;
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

/**
 * Deterministic TypeScript indexing result for one repository snapshot.
 *
 * @example
 * ```ts
 * import { IndexedTypeScriptArtifacts } from "@beep/repo-memory-runtime"
 *
 * const schema = IndexedTypeScriptArtifacts
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
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

/**
 * Input required to index one repository with the TypeScript indexer.
 *
 * @example
 * ```ts
 * import { TypeScriptIndexRequest } from "@beep/repo-memory-runtime"
 *
 * const schema = TypeScriptIndexRequest
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class TypeScriptIndexRequest extends S.Class<TypeScriptIndexRequest>($I`TypeScriptIndexRequest`)(
  {
    repoId: RepoId,
    repoPath: FilePath,
    runId: RunId,
  },
  $I.annote("TypeScriptIndexRequest", {
    description: "Workflow-scoped request for deterministic TypeScript repo extraction.",
  })
) {}

/**
 * Typed failure emitted by deterministic TypeScript indexing.
 *
 * @example
 * ```ts
 * import { TypeScriptIndexError } from "@beep/repo-memory-runtime"
 *
 * const error = TypeScriptIndexError.noCause("Unable to index repository.", 500)
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class TypeScriptIndexError extends StatusCauseTaggedErrorClass<TypeScriptIndexError>($I`TypeScriptIndexError`)(
  "TypeScriptIndexError",
  $I.annote("TypeScriptIndexError", {
    description: "Typed failure from deterministic TypeScript index extraction.",
  })
) {}

/**
 * Service contract for deterministic TypeScript repository indexing.
 *
 * @example
 * ```ts
 * import type { TypeScriptIndexServiceShape } from "@beep/repo-memory-runtime"
 *
 * const methods = ["indexRepo"] satisfies ReadonlyArray<keyof TypeScriptIndexServiceShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface TypeScriptIndexServiceShape {
  readonly indexRepo: (
    request: TypeScriptIndexRequest
  ) => Effect.Effect<IndexedTypeScriptArtifacts, TypeScriptIndexError>;
}

/**
 * Service tag for deterministic TypeScript repository indexing.
 *
 * @example
 * ```ts
 * import { TypeScriptIndexService } from "@beep/repo-memory-runtime"
 *
 * const layer = TypeScriptIndexService.layer
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class TypeScriptIndexService extends Context.Service<TypeScriptIndexService, TypeScriptIndexServiceShape>()(
  $I`TypeScriptIndexService`
) {
  static readonly layer: Layer.Layer<TypeScriptIndexService, never, FileSystem.FileSystem | Path.Path | RepoRunStore> =
    Layer.effect(
      TypeScriptIndexService,
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repoRunStore = yield* RepoRunStore;

        return TypeScriptIndexService.of({
          indexRepo: flow(
            indexTypeScriptRepo,
            Effect.withSpan("TypeScriptIndexer.indexRepo"),
            Effect.annotateLogs({ component: "repo-memory-typescript-indexer" }),
            Effect.provideService(FileSystem.FileSystem, fs),
            Effect.provideService(Path.Path, path),
            Effect.provideService(RepoRunStore, repoRunStore)
          ),
        });
      })
    );
}

const isTypeScriptSourceFile = (filePath: string): boolean => {
  if (pipe(filePath, Str.endsWith(".d.ts"))) {
    return false;
  }

  return A.some(typeScriptSourceFileSuffixes, (suffix) => pipe(filePath, Str.endsWith(suffix)));
};

const isIgnoredPath = flow(
  Str.split("/"),
  A.some((segment) => HashSet.has(ignoredDirectoryNames, segment))
);

const isContainedRepoPath = (path: Path.Path, repoRootPath: string, candidatePath: string): boolean => {
  const relativeFromRoot = normalizePath(path.relative(repoRootPath, candidatePath));

  return (
    relativeFromRoot === "" ||
    relativeFromRoot === "." ||
    (!path.isAbsolute(relativeFromRoot) && relativeFromRoot !== ".." && !Str.startsWith("../")(relativeFromRoot))
  );
};

const isSymlinkedPath = (path: Path.Path, originalPath: string, canonicalPath: string): boolean =>
  path.resolve(originalPath) !== canonicalPath;

const isSymlinkLoopCause = (cause: unknown): boolean =>
  pipe(Inspectable.toStringUnknown(cause, 0), Str.includes("ELOOP"));

const boundedDeclarationText = (text: string): string => {
  const normalized = pipe(text, Str.trim);
  return Str.length(normalized) <= maxDeclarationTextLength
    ? normalized
    : `${pipe(normalized, Str.slice(0, maxDeclarationTextLength - 3))}...`;
};

const firstSignatureLine = (text: string): string =>
  pipe(Str.split("\n")(text), A.map(Str.trim), A.findFirst(Str.isNonEmpty), O.getOrElse(Str.trimThunk(text)));

const normalizedText = (value: string | undefined): O.Option<string> =>
  pipe(value === undefined ? O.none<string>() : O.some(value), O.map(Str.trim), O.filter(Str.isNonEmpty));

const normalizedTagComment = (value: string | undefined): O.Option<string> =>
  pipe(
    value === undefined ? O.none<string>() : O.some(value),
    O.map(flow(Str.replace(/^\s*-\s*/, ""), Str.trim)),
    O.filter(Str.isNonEmpty)
  );

const jsDocsForNode = (node: OutlineNode): ReadonlyArray<import("ts-morph").JSDoc> =>
  Node.isJSDocable(node) ? node.getJsDocs() : A.empty();

const joinedDocComments: (docs: ReadonlyArray<import("ts-morph").JSDoc>) => O.Option<string> = flow(
  A.map((doc: import("ts-morph").JSDoc) => pipe(doc.getCommentText(), normalizedText, O.getOrElse(thunkEmptyStr))),
  A.filter(Str.isNonEmpty),
  A.join("\n\n"),
  normalizedText
);

const firstTagText = (docs: ReadonlyArray<import("ts-morph").JSDoc>, tagName: string): O.Option<string> =>
  pipe(
    docs,
    A.flatMap((doc) => doc.getTags()),
    A.findFirst((tag) => tag.getTagName() === tagName),
    O.flatMap((tag) => normalizedTagComment(tag.getCommentText()))
  );

const typeExpressionText = (
  tag: import("ts-morph").JSDocParameterTag | import("ts-morph").JSDocReturnTag | import("ts-morph").JSDocThrowsTag
): O.Option<string> =>
  pipe(
    O.fromUndefinedOr(tag.getTypeExpression()),
    O.map((typeExpression) => typeExpression.getTypeNode().getText()),
    O.map(Str.trim),
    O.filter(Str.isNonEmpty)
  );

const seeReferenceText = (tag: import("ts-morph").JSDocSeeTag): O.Option<string> =>
  pipe(
    normalizedTagComment(tag.getCommentText()),
    O.orElse(() => {
      const structureText = tag.getStructure().text;
      return P.isString(structureText) ? normalizedText(structureText) : O.none();
    })
  );

const documentationSpan = (options: {
  readonly docs: ReadonlyArray<import("ts-morph").JSDoc>;
  readonly filePath: string;
  readonly symbolName: string;
}): O.Option<CitationSpan> =>
  pipe(
    A.head(options.docs),
    O.flatMap((firstDoc) =>
      pipe(
        A.last(options.docs),
        O.map(
          (lastDoc) =>
            new CitationSpan({
              filePath: decodeFilePath(options.filePath),
              startLine: decodePosInt(firstDoc.getStartLineNumber(true)),
              endLine: decodePosInt(lastDoc.getEndLineNumber()),
              startColumn: O.none(),
              endColumn: O.none(),
              symbolName: O.some(options.symbolName),
            })
        )
      )
    )
  );

const documentationSummary: (documentation: O.Option<RepoSymbolDocumentation>) => O.Option<string> = flow(
  O.flatMap((value: RepoSymbolDocumentation) =>
    pipe(
      value.summary,
      O.orElse(() => value.description)
    )
  )
);

const documentationSearchText: (documentation: O.Option<RepoSymbolDocumentation>) => string = flow(
  O.match({
    onNone: thunkEmptyStr,
    onSome: (value: RepoSymbolDocumentation) =>
      pipe(
        A.make(
          pipe(value.description, O.getOrElse(thunkEmptyStr)),
          pipe(value.summary, O.getOrElse(thunkEmptyStr)),
          pipe(value.remarks, O.getOrElse(thunkEmptyStr)),
          pipe(value.deprecationNote, O.getOrElse(thunkEmptyStr))
        ),
        A.appendAll(
          pipe(
            value.params,
            A.flatMap((param) =>
              A.make(
                param.name,
                pipe(param.type, O.getOrElse(thunkEmptyStr)),
                pipe(param.description, O.getOrElse(thunkEmptyStr))
              )
            )
          )
        ),
        A.appendAll(
          pipe(
            value.returns,
            O.map((result) =>
              A.make(
                pipe(result.type, O.getOrElse(thunkEmptyStr)),
                pipe(result.description, O.getOrElse(thunkEmptyStr))
              )
            ),
            O.getOrElse(A.empty<string>)
          )
        ),
        A.appendAll(
          pipe(
            value.throws,
            A.flatMap((errorDoc) =>
              A.make(
                pipe(errorDoc.type, O.getOrElse(thunkEmptyStr)),
                pipe(errorDoc.description, O.getOrElse(thunkEmptyStr))
              )
            )
          )
        ),
        A.appendAll(value.see),
        A.map(Str.trim),
        A.filter(Str.isNonEmpty),
        A.join(" ")
      ),
  })
);

const extractSymbolDocumentation = (options: {
  readonly documentationNode: OutlineNode;
  readonly filePath: string;
  readonly symbolName: string;
}): O.Option<RepoSymbolDocumentation> => {
  const docs = jsDocsForNode(options.documentationNode);
  const span = documentationSpan({
    docs,
    filePath: options.filePath,
    symbolName: options.symbolName,
  });

  if (O.isNone(span)) {
    return O.none();
  }

  const description = pipe(
    joinedDocComments(docs),
    O.orElse(() => firstTagText(docs, "description"))
  );
  const summary = firstTagText(docs, "summary");
  const remarks = firstTagText(docs, "remarks");
  const deprecated = firstTagText(docs, "deprecated");
  const params = pipe(
    docs,
    A.flatMap((doc) => doc.getTags()),
    A.filter(Node.isJSDocParameterTag),
    A.map(
      (tag) =>
        new RepoDocumentedParameter({
          name: tag.getName(),
          type: typeExpressionText(tag),
          description: normalizedTagComment(tag.getCommentText()),
        })
    )
  );
  const returns = pipe(
    docs,
    A.flatMap((doc) => doc.getTags()),
    A.findFirst(Node.isJSDocReturnTag),
    O.map(
      (tag) =>
        new RepoDocumentedReturn({
          type: typeExpressionText(tag),
          description: normalizedTagComment(tag.getCommentText()),
        })
    )
  );
  const throws = pipe(
    docs,
    A.flatMap((doc) => doc.getTags()),
    A.filter(Node.isJSDocThrowsTag),
    A.map(
      (tag) =>
        new RepoDocumentedThrow({
          type: typeExpressionText(tag),
          description: normalizedTagComment(tag.getCommentText()),
        })
    )
  );
  const see = pipe(
    docs,
    A.flatMap((doc) => doc.getTags()),
    A.filter(Node.isJSDocSeeTag),
    A.flatMap((tag) =>
      pipe(
        seeReferenceText(tag),
        O.match({
          onNone: A.empty<string>,
          onSome: A.make,
        })
      )
    )
  );

  let tags = A.empty<RepoJSDocCoreTag>();

  if (O.isSome(description)) {
    tags = A.append(tags, new RepoJSDocDescriptionTag({ description: description.value }));
  }

  if (O.isSome(summary)) {
    tags = A.append(tags, new RepoJSDocSummaryTag({ description: summary.value }));
  }

  if (O.isSome(remarks)) {
    tags = A.append(tags, new RepoJSDocRemarksTag({ description: remarks.value }));
  }

  for (const param of params) {
    tags = A.append(
      tags,
      new RepoJSDocParamTag({
        name: param.name,
        type: param.type,
        description: param.description,
      })
    );
  }

  if (O.isSome(returns)) {
    tags = A.append(
      tags,
      new RepoJSDocReturnsTag({
        type: returns.value.type,
        description: returns.value.description,
      })
    );
  }

  for (const errorDoc of throws) {
    tags = A.append(
      tags,
      new RepoJSDocThrowsTag({
        type: errorDoc.type,
        description: errorDoc.description,
      })
    );
  }

  if (
    O.isSome(deprecated) ||
    pipe(
      docs,
      A.flatMap((doc) => doc.getTags()),
      A.some(Node.isJSDocDeprecatedTag)
    )
  ) {
    tags = A.append(tags, new RepoJSDocDeprecatedTag({ description: deprecated }));
  }

  for (const reference of see) {
    tags = A.append(tags, new RepoJSDocSeeTag({ reference }));
  }

  return O.some(
    new RepoSymbolDocumentation({
      span: span.value,
      description,
      summary,
      remarks,
      isDeprecated:
        O.isSome(deprecated) ||
        pipe(
          docs,
          A.flatMap((doc) => doc.getTags()),
          A.some(Node.isJSDocDeprecatedTag)
        ),
      deprecationNote: deprecated,
      params,
      returns,
      throws,
      see,
      tags,
    })
  );
};

const makeSymbolId = (filePath: string, qualifiedName: string, symbolKind: RepoSymbolKind): string =>
  `${filePath}::${qualifiedName}#${symbolKind}`;

const symbolSearchText = (parts: {
  readonly symbolName: string;
  readonly qualifiedName: string;
  readonly signature: string;
  readonly documentation: O.Option<RepoSymbolDocumentation>;
  readonly jsDocSummary: O.Option<string>;
  readonly declarationText: string;
}): string =>
  pipe(
    A.make(
      parts.symbolName,
      parts.qualifiedName,
      parts.signature,
      parts.declarationText,
      pipe(parts.jsDocSummary, O.getOrElse(thunkEmptyStr)),
      documentationSearchText(parts.documentation)
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
    Effect.mapError((cause) =>
      TypeScriptIndexError.new(cause, `Failed to hash source text for "${options.filePath}".`, 500)
    )
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
    readonly documentationNode: OutlineNode;
  }): Effect.Effect<RepoSymbolRecord, TypeScriptIndexError> => {
    const qualifiedName = options.symbolName;
    const declarationText = boundedDeclarationText(options.node.getText());
    const signature = firstSignatureLine(declarationText);
    const documentation = extractSymbolDocumentation({
      documentationNode: options.documentationNode,
      filePath: options.filePath,
      symbolName: options.symbolName,
    });
    const jsDocSummary = documentationSummary(documentation);

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
        documentation,
        jsDocSummary,
        declarationText,
        searchText: symbolSearchText({
          symbolName: options.symbolName,
          qualifiedName,
          signature,
          documentation,
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
    if (!Str.isNonEmpty(symbolName)) {
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
        documentationNode: options.statement,
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
            documentationNode: statement,
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
            documentationNode: statement,
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
          documentationNode: statement,
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
          documentationNode: statement,
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
          documentationNode: statement,
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
          documentationNode: statement,
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
  readonly repoRootPath: string;
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
    const resolvedTargetFilePath = pipe(
      O.fromNullishOr(importDeclaration.getModuleSpecifierSourceFile()),
      O.map((targetSourceFile) => targetSourceFile.getFilePath()),
      O.filter(P.and(P.not(isIgnoredPath), isTypeScriptSourceFile)),
      O.filter((targetFilePath) => {
        const normalizedRepoRoot = normalizePath(options.repoRootPath);
        const normalizedTargetFilePath = normalizePath(targetFilePath);

        return (
          normalizedTargetFilePath === normalizedRepoRoot ||
          normalizedTargetFilePath.startsWith(`${normalizedRepoRoot}/`)
        );
      }),
      O.map(decodeFilePath)
    );

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
          resolvedTargetFilePath,
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
          resolvedTargetFilePath,
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
          resolvedTargetFilePath,
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
          resolvedTargetFilePath,
          typeOnly,
        })
      );
    }
  }

  return results;
};

const dedupeArtifactsByKey = <A>(
  values: ReadonlyArray<A>,
  keyOf: (value: A) => string,
  choose: (current: A, next: A) => A = (current) => current
): ReadonlyArray<A> => {
  let indexes = HashMap.empty<string, number>();
  let deduped = A.empty<A>();

  for (const value of values) {
    const key = keyOf(value);
    const existingIndex = HashMap.get(indexes, key);

    if (O.isSome(existingIndex)) {
      const current = deduped[existingIndex.value];

      if (current !== undefined) {
        pipe(
          deduped,
          A.replace(existingIndex.value, choose(current, value)),
          O.match({
            onNone: () => {},
            onSome: (d) => {
              deduped = d;
            },
          })
        );
      }

      continue;
    }

    indexes = HashMap.set(indexes, key, A.length(deduped));
    deduped = A.append(deduped, value);
  }

  return deduped;
};

const hasSymbolDocumentation = (symbol: RepoSymbolRecord): boolean =>
  O.isSome(symbol.documentation) || O.isSome(symbol.jsDocSummary);

const preferSymbolRecord = (current: RepoSymbolRecord, next: RepoSymbolRecord): RepoSymbolRecord => {
  const currentHasDocumentation = hasSymbolDocumentation(current);
  const nextHasDocumentation = hasSymbolDocumentation(next);

  if (currentHasDocumentation !== nextHasDocumentation) {
    return currentHasDocumentation ? current : next;
  }

  const currentDeclarationLength = Str.length(current.declarationText);
  const nextDeclarationLength = Str.length(next.declarationText);

  if (currentDeclarationLength !== nextDeclarationLength) {
    return currentDeclarationLength >= nextDeclarationLength ? current : next;
  }

  const currentSpanLength = current.endLine - current.startLine;
  const nextSpanLength = next.endLine - next.startLine;

  return currentSpanLength >= nextSpanLength ? current : next;
};

const symbolRecordStoreKey = (symbol: RepoSymbolRecord): string =>
  `${symbol.repoId}::${symbol.sourceSnapshotId}::${symbol.symbolId}`;

const importEdgeStoreKey = (importEdge: RepoImportEdge): string =>
  `${importEdge.repoId}::${importEdge.sourceSnapshotId}::${importEdge.importerFilePath}::${importEdge.moduleSpecifier}::${pipe(
    importEdge.importedName,
    O.getOrElse(() => "<none>")
  )}`;

const discoverProjectScopes = Effect.fn("TypeScriptIndex.discoverProjectScopes")(function* (
  repoRootPath: string
): Effect.fn.Return<ReadonlyArray<ProjectScope>, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const canonicalRepoRoot = yield* fs
    .realPath(repoRootPath)
    .pipe(
      Effect.mapError((cause) =>
        TypeScriptIndexError.new(
          cause,
          `Failed to resolve canonical repository root "${repoRootPath}" while discovering scopes.`,
          500
        )
      )
    );
  const visitedCanonicalDirs = MutableHashSet.empty<string>();

  const walk = Effect.fn("TypeScriptIndex.walkTsConfigs")(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
    const canonicalCurrentPathOption = yield* fs.realPath(currentPath).pipe(
      Effect.map(O.some),
      Effect.catch((cause) =>
        isSymlinkLoopCause(cause)
          ? Effect.succeed(O.none<string>())
          : Effect.fail(
              TypeScriptIndexError.new(
                cause,
                `Failed to resolve canonical path "${currentPath}" while discovering tsconfig scopes.`,
                500
              )
            )
      )
    );

    if (O.isNone(canonicalCurrentPathOption)) {
      return A.empty<string>();
    }

    const canonicalCurrentPath = canonicalCurrentPathOption.value;

    if (!isContainedRepoPath(path, canonicalRepoRoot, canonicalCurrentPath)) {
      return A.empty<string>();
    }

    if (currentPath !== repoRootPath && isSymlinkedPath(path, currentPath, canonicalCurrentPath)) {
      return A.empty<string>();
    }

    if (MutableHashSet.has(visitedCanonicalDirs, canonicalCurrentPath)) {
      return A.empty<string>();
    }

    MutableHashSet.add(visitedCanonicalDirs, canonicalCurrentPath);

    const entries = yield* fs
      .readDirectory(currentPath)
      .pipe(
        Effect.mapError((cause) =>
          TypeScriptIndexError.new(
            cause,
            `Failed to read repository directory "${currentPath}" while discovering tsconfig scopes.`,
            500
          )
        )
      );

    let results = A.empty<string>();

    for (const entry of entries) {
      const absolutePath = path.join(currentPath, entry);
      const canonicalAbsolutePathOption = yield* fs.realPath(absolutePath).pipe(
        Effect.map(O.some),
        Effect.catch((cause) =>
          isSymlinkLoopCause(cause)
            ? Effect.succeed(O.none<string>())
            : Effect.fail(
                TypeScriptIndexError.new(
                  cause,
                  `Failed to resolve canonical repository entry "${absolutePath}" while discovering tsconfig scopes.`,
                  500
                )
              )
        )
      );

      if (O.isNone(canonicalAbsolutePathOption)) {
        continue;
      }

      const canonicalAbsolutePath = canonicalAbsolutePathOption.value;
      const statOption = yield* fs.stat(absolutePath).pipe(
        Effect.map(O.some),
        Effect.catch((cause) =>
          isSymlinkLoopCause(cause)
            ? Effect.succeed(O.none<FileSystem.File.Info>())
            : Effect.fail(
                TypeScriptIndexError.new(
                  cause,
                  `Failed to stat repository entry "${absolutePath}" while discovering tsconfig scopes.`,
                  500
                )
              )
        )
      );

      if (O.isNone(statOption)) {
        continue;
      }

      const stat = statOption.value;

      if (!isContainedRepoPath(path, canonicalRepoRoot, canonicalAbsolutePath)) {
        continue;
      }

      const symlinkedPath = isSymlinkedPath(path, absolutePath, canonicalAbsolutePath);

      if (stat.type === "Directory") {
        if (symlinkedPath) {
          continue;
        }
        if (HashSet.has(ignoredDirectoryNames, entry)) {
          continue;
        }

        results = A.appendAll(results, yield* walk(absolutePath));
        continue;
      }

      if (!symlinkedPath && entry === "tsconfig.json") {
        results = A.append(results, absolutePath);
      }
    }

    return results;
  });

  const tsconfigPaths = A.sort(yield* walk(repoRootPath), Order.String);
  if (!A.isReadonlyArrayNonEmpty(tsconfigPaths)) {
    return yield* TypeScriptIndexError.noCause(
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

const projectSourceFiles = Effect.fn("TypeScriptIndex.projectSourceFiles")(function* (
  repoRootPath: string,
  project: Project
): Effect.fn.Return<ReadonlyArray<SourceFile>, TypeScriptIndexError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const canonicalRepoRoot = yield* fs
    .realPath(repoRootPath)
    .pipe(
      Effect.mapError((cause) =>
        TypeScriptIndexError.new(
          cause,
          `Failed to resolve canonical repository root "${repoRootPath}" while filtering source files.`,
          500
        )
      )
    );

  let sourceFiles = A.empty<SourceFile>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();

    if (sourceFile.isFromExternalLibrary() || isIgnoredPath(filePath) || !isTypeScriptSourceFile(filePath)) {
      continue;
    }

    const canonicalFilePath = yield* fs
      .realPath(filePath)
      .pipe(
        Effect.mapError((cause) =>
          TypeScriptIndexError.new(cause, `Failed to resolve canonical source file "${filePath}" while indexing.`, 500)
        )
      );

    if (!isContainedRepoPath(path, canonicalRepoRoot, canonicalFilePath)) {
      continue;
    }

    if (isSymlinkedPath(path, filePath, canonicalFilePath)) {
      continue;
    }

    sourceFiles = A.append(sourceFiles, sourceFile);
  }

  return sourceFiles;
});

const withScopedProject = <A, R>(
  tsconfigPath: string,
  use: (project: Project) => Effect.Effect<A, TypeScriptIndexError, R>
): Effect.Effect<A, TypeScriptIndexError, R> =>
  Effect.acquireUseRelease(
    Effect.try({
      try: () =>
        new Project({
          tsConfigFilePath: tsconfigPath,
          skipFileDependencyResolution: true,
          skipLoadingLibFiles: true,
        }),
      catch: (cause) =>
        TypeScriptIndexError.new(cause, `Failed to initialize ts-morph project for "${tsconfigPath}".`, 400),
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
    Text.joinLines
  );

  const digest = yield* decodeContentHash(textEncoder.encode(fingerprint)).pipe(
    Effect.mapError((cause) =>
      TypeScriptIndexError.new(cause, "Failed to compute a deterministic source snapshot id.", 500)
    )
  );

  return decodeSourceSnapshotId(`snapshot:${digest}`);
});

const mapRunStoreError = <A>(effect: Effect.Effect<A, RepoStoreError>) =>
  effect.pipe(Effect.mapError((error) => TypeScriptIndexError.new(error.cause, error.message, error.status)));

const suspendIfRunInterrupted = Effect.fn("TypeScriptIndex.suspendIfRunInterrupted")(function* (
  runId: RunId
): Effect.fn.Return<void, TypeScriptIndexError, RepoRunStore> {
  const repoRunStore = yield* RepoRunStore;
  const runOption = yield* mapRunStoreError(repoRunStore.getRun(runId));

  if (O.isNone(runOption) || runOption.value.status !== "interrupted") {
    return;
  }

  const instanceOption = yield* Effect.serviceOption(WorkflowEngine.WorkflowInstance);

  if (O.isNone(instanceOption)) {
    yield* Effect.logWarning(`Run "${runId}" was interrupted without a workflow instance to suspend.`);
    return;
  }

  return yield* Workflow.suspend(instanceOption.value);
});

/**
 * Deterministically index a TypeScript repository into repo-memory artifacts.
 *
 * @example
 * ```ts
 * import { indexTypeScriptRepo } from "@beep/repo-memory-runtime"
 *
 * const indexRepo = indexTypeScriptRepo
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const indexTypeScriptRepo = Effect.fn("TypeScriptIndex.indexTypeScriptRepo")(function* (
  options: TypeScriptIndexRequest
): Effect.fn.Return<
  IndexedTypeScriptArtifacts,
  TypeScriptIndexError,
  FileSystem.FileSystem | Path.Path | RepoRunStore
> {
  const fs = yield* FileSystem.FileSystem;
  const canonicalRepoPath = yield* fs
    .realPath(options.repoPath)
    .pipe(
      Effect.mapError((cause) =>
        TypeScriptIndexError.new(
          cause,
          `Failed to resolve canonical repository root "${options.repoPath}" before indexing.`,
          500
        )
      )
    );
  yield* suspendIfRunInterrupted(options.runId);
  const scopes = yield* discoverProjectScopes(canonicalRepoPath);
  yield* suspendIfRunInterrupted(options.runId);
  let seenFiles = HashSet.empty<string>();
  const provisionalSnapshotId = decodeSourceSnapshotId("snapshot:pending");
  let extractedFiles = A.empty<RepoSourceFile>();
  let extractedSymbols = A.empty<RepoSymbolRecord>();
  let extractedImportEdges = A.empty<RepoImportEdge>();

  for (const scope of scopes) {
    yield* suspendIfRunInterrupted(options.runId);
    yield* withScopedProject(scope.tsconfigPath, (project) =>
      Effect.gen(function* () {
        yield* suspendIfRunInterrupted(options.runId);

        for (const sourceFile of yield* projectSourceFiles(canonicalRepoPath, project)) {
          // Keep large repo walks promptly interruptible instead of waiting for coarse batched checkpoints.
          yield* suspendIfRunInterrupted(options.runId);

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
              repoRootPath: canonicalRepoPath,
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
    ),
    (records) => dedupeArtifactsByKey(records, symbolRecordStoreKey, preferSymbolRecord)
  );
  const importEdges = pipe(
    extractedImportEdges,
    A.map(
      (importEdge) =>
        new RepoImportEdge({
          ...importEdge,
          sourceSnapshotId,
        })
    ),
    (edges) => dedupeArtifactsByKey(edges, importEdgeStoreKey)
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
