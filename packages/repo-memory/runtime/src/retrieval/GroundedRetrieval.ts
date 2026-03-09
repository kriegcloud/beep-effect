import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import { IdentifierText, PathText, QueryText, VariantText } from "@beep/nlp";
import {
  Citation,
  type QueryRepoRunInput,
  type RepoDocumentedParameter,
  type RepoDocumentedReturn,
  type RepoDocumentedThrow,
  type RepoId,
  type RepoImportEdge,
  type RepoSemanticArtifacts,
  type RepoSourceFile,
  type RepoSymbolDocumentation,
  type RepoSymbolRecord,
  RetrievalPacket,
  type SourceSnapshotId,
} from "@beep/repo-memory-model";
import {
  RepoSemanticStore,
  type RepoSemanticStoreShape,
  RepoSnapshotStore,
  type RepoSnapshotStoreShape,
  type RepoStoreError,
  RepoSymbolStore,
  type RepoSymbolStoreShape,
} from "@beep/repo-memory-store";
import { makeStatusCauseError, PosInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { thunkEmptyStr } from "@beep/utils";
import * as Str from "@beep/utils/Str";
import { DateTime, Effect, HashSet, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type QueryKindMetric,
  recordQueryInterpretation,
  recordQueryResult,
} from "../telemetry/RepoMemoryTelemetry.js";

const $I = $RepoMemoryRuntimeId.create("retrieval/GroundedRetrieval");
const decodePosInt = S.decodeUnknownSync(PosInt);
const citationOrder = Order.mapInput(
  Order.String,
  (citation: Citation) => `${citation.span.filePath}:${citation.span.startLine}:${citation.label}:${citation.id}`
);
type GroundedRetrievalStoreShape = RepoSemanticStoreShape & RepoSnapshotStoreShape & RepoSymbolStoreShape;

class CountFilesInterpretation extends S.Class<CountFilesInterpretation>($I`CountFilesInterpretation`)(
  {
    kind: S.tag("countFiles"),
  },
  $I.annote("CountFilesInterpretation", {
    description: "Deterministic query interpretation that counts indexed source files.",
  })
) {}

class CountSymbolsInterpretation extends S.Class<CountSymbolsInterpretation>($I`CountSymbolsInterpretation`)(
  {
    kind: S.tag("countSymbols"),
  },
  $I.annote("CountSymbolsInterpretation", {
    description: "Deterministic query interpretation that counts indexed symbols.",
  })
) {}

class LocateSymbolInterpretation extends S.Class<LocateSymbolInterpretation>($I`LocateSymbolInterpretation`)(
  {
    kind: S.tag("locateSymbol"),
    symbolName: S.String,
  },
  $I.annote("LocateSymbolInterpretation", {
    description: "Deterministic query interpretation that locates a symbol declaration.",
  })
) {}

class DescribeSymbolInterpretation extends S.Class<DescribeSymbolInterpretation>($I`DescribeSymbolInterpretation`)(
  {
    kind: S.tag("describeSymbol"),
    symbolName: S.String,
  },
  $I.annote("DescribeSymbolInterpretation", {
    description: "Deterministic query interpretation that describes one symbol declaration.",
  })
) {}

class SymbolParamsInterpretation extends S.Class<SymbolParamsInterpretation>($I`SymbolParamsInterpretation`)(
  {
    kind: S.tag("symbolParams"),
    symbolName: S.String,
  },
  $I.annote("SymbolParamsInterpretation", {
    description: "Deterministic query interpretation that returns documented symbol parameters.",
  })
) {}

class SymbolReturnsInterpretation extends S.Class<SymbolReturnsInterpretation>($I`SymbolReturnsInterpretation`)(
  {
    kind: S.tag("symbolReturns"),
    symbolName: S.String,
  },
  $I.annote("SymbolReturnsInterpretation", {
    description: "Deterministic query interpretation that returns documented symbol return semantics.",
  })
) {}

class SymbolThrowsInterpretation extends S.Class<SymbolThrowsInterpretation>($I`SymbolThrowsInterpretation`)(
  {
    kind: S.tag("symbolThrows"),
    symbolName: S.String,
  },
  $I.annote("SymbolThrowsInterpretation", {
    description: "Deterministic query interpretation that returns documented symbol throws semantics.",
  })
) {}

class SymbolDeprecationInterpretation extends S.Class<SymbolDeprecationInterpretation>(
  $I`SymbolDeprecationInterpretation`
)(
  {
    kind: S.tag("symbolDeprecation"),
    symbolName: S.String,
  },
  $I.annote("SymbolDeprecationInterpretation", {
    description: "Deterministic query interpretation that returns symbol deprecation documentation.",
  })
) {}

class ListFileExportsInterpretation extends S.Class<ListFileExportsInterpretation>($I`ListFileExportsInterpretation`)(
  {
    kind: S.tag("listFileExports"),
    fileQuery: S.String,
  },
  $I.annote("ListFileExportsInterpretation", {
    description: "Deterministic query interpretation that lists exports for one source file.",
  })
) {}

class ListFileImportsInterpretation extends S.Class<ListFileImportsInterpretation>($I`ListFileImportsInterpretation`)(
  {
    kind: S.tag("listFileImports"),
    fileQuery: S.String,
  },
  $I.annote("ListFileImportsInterpretation", {
    description: "Deterministic query interpretation that lists imports for one source file.",
  })
) {}

class ListFileImportersInterpretation extends S.Class<ListFileImportersInterpretation>(
  $I`ListFileImportersInterpretation`
)(
  {
    kind: S.tag("listFileImporters"),
    moduleQuery: S.String,
  },
  $I.annote("ListFileImportersInterpretation", {
    description: "Deterministic query interpretation that lists files importing one module specifier.",
  })
) {}

class ListFileDependenciesInterpretation extends S.Class<ListFileDependenciesInterpretation>(
  $I`ListFileDependenciesInterpretation`
)(
  {
    kind: S.tag("listFileDependencies"),
    fileQuery: S.String,
  },
  $I.annote("ListFileDependenciesInterpretation", {
    description: "Deterministic query interpretation that lists repo-local resolved file dependencies for one file.",
  })
) {}

class ListFileDependentsInterpretation extends S.Class<ListFileDependentsInterpretation>(
  $I`ListFileDependentsInterpretation`
)(
  {
    kind: S.tag("listFileDependents"),
    fileQuery: S.String,
  },
  $I.annote("ListFileDependentsInterpretation", {
    description: "Deterministic query interpretation that lists repo-local files depending on one file.",
  })
) {}

class KeywordSearchInterpretation extends S.Class<KeywordSearchInterpretation>($I`KeywordSearchInterpretation`)(
  {
    kind: S.tag("keywordSearch"),
    query: S.String,
  },
  $I.annote("KeywordSearchInterpretation", {
    description: "Deterministic bounded keyword search across indexed symbols.",
  })
) {}

class UnsupportedQueryInterpretation extends S.Class<UnsupportedQueryInterpretation>(
  $I`UnsupportedQueryInterpretation`
)(
  {
    kind: S.tag("unsupported"),
    reason: S.String,
  },
  $I.annote("UnsupportedQueryInterpretation", {
    description: "Explicit unsupported query interpretation returned for out-of-scope query shapes.",
  })
) {}

/**
 * Deterministic interpretation union for grounded repo-memory queries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryInterpretation = S.Union([
  CountFilesInterpretation,
  CountSymbolsInterpretation,
  LocateSymbolInterpretation,
  DescribeSymbolInterpretation,
  SymbolParamsInterpretation,
  SymbolReturnsInterpretation,
  SymbolThrowsInterpretation,
  SymbolDeprecationInterpretation,
  ListFileExportsInterpretation,
  ListFileImportsInterpretation,
  ListFileImportersInterpretation,
  ListFileDependenciesInterpretation,
  ListFileDependentsInterpretation,
  KeywordSearchInterpretation,
  UnsupportedQueryInterpretation,
]).pipe(S.toTaggedUnion("kind"));

/**
 * Runtime type for `QueryInterpretation`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryInterpretation = typeof QueryInterpretation.Type;

/**
 * Deterministic grounded result returned by the repo-memory retrieval service.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GroundedQueryResult extends S.Class<GroundedQueryResult>($I`GroundedQueryResult`)(
  {
    answer: S.String,
    citations: S.Array(Citation),
    packet: RetrievalPacket,
  },
  $I.annote("GroundedQueryResult", {
    description: "Deterministic grounded query result assembled from indexed repository artifacts.",
  })
) {}

/**
 * Typed retrieval failure raised while resolving deterministic grounded queries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GroundedRetrievalError extends TaggedErrorClass<GroundedRetrievalError>($I`GroundedRetrievalError`)(
  "GroundedRetrievalError",
  StatusCauseFields,
  $I.annote("GroundedRetrievalError", {
    description: "Typed error raised while resolving a bounded deterministic grounded query.",
  })
) {}

/**
 * Service contract for deterministic grounded repo retrieval.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface GroundedRetrievalServiceShape {
  readonly resolve: (payload: QueryRepoRunInput) => Effect.Effect<GroundedQueryResult, GroundedRetrievalError>;
}

/**
 * Service tag for deterministic grounded repo retrieval.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class GroundedRetrievalService extends ServiceMap.Service<
  GroundedRetrievalService,
  GroundedRetrievalServiceShape
>()($I`GroundedRetrievalService`) {
  static readonly layer: Layer.Layer<
    GroundedRetrievalService,
    never,
    RepoSemanticStore | RepoSnapshotStore | RepoSymbolStore
  > = Layer.effect(
    GroundedRetrievalService,
    Effect.suspend(() => makeGroundedRetrievalService()).pipe(
      Effect.withSpan("GroundedRetrievalService.make"),
      Effect.annotateLogs({ component: "grounded-retrieval" })
    )
  );
}

const toRetrievalError = makeStatusCauseError(GroundedRetrievalError);

const mapStoreError = <A>(effect: Effect.Effect<A, RepoStoreError>) =>
  effect.pipe(Effect.mapError((error) => toRetrievalError(error.message, error.status, error.cause)));

const normalizeQuestion = QueryText.normalizeQuestion;

const firstCapture = (pattern: RegExp, input: string): O.Option<string> =>
  (() => {
    const match = pattern.exec(input);
    return match === null ? O.none() : pipe(match, A.get(1), O.map(Str.trim));
  })();

const firstCaptureFrom = (patterns: ReadonlyArray<RegExp>, input: string): O.Option<string> => {
  for (const pattern of patterns) {
    const captured = firstCapture(pattern, input);

    if (O.isSome(captured)) {
      return captured;
    }
  }

  return O.none();
};

const importFilePatterns = A.make(
  /(?:what does|list)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)\s+import/i,
  /(?:imports of|list imports)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)/i
);
const exportFilePatterns = A.make(
  /(?:what does|list)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)\s+export/i,
  /(?:exports of|list exports)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)/i
);
const dependencyFilePatterns = A.make(
  /(?:what does|list)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)\s+depend on/i,
  /(?:depend on|depends on|dependencies of|dependency of)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)/i
);
const dependentFilePatterns = A.make(
  /(?:what depends on|who depends on|dependents of)\s+(?:the\s+)?(?:file\s+)?([A-Za-z0-9_./-]+)/i
);
const moduleQueryPatterns = A.make(
  /(?:who|what)\s+imports?\s+([A-Za-z0-9_./@-]+)/i,
  /(?:importers of)\s+([A-Za-z0-9_./@-]+)/i
);

const extractNormalizedPathQuery = (question: string, patterns: ReadonlyArray<RegExp>): O.Option<string> =>
  pipe(
    QueryText.extractBacktickValue(question),
    O.orElse(() => firstCaptureFrom(patterns, question)),
    O.map(PathText.normalizePathPhrase),
    O.filter(PathText.isPathLike)
  );

const extractImportFileQuery = (question: string): O.Option<string> =>
  extractNormalizedPathQuery(question, importFilePatterns);

const extractExportFileQuery = (question: string): O.Option<string> =>
  extractNormalizedPathQuery(question, exportFilePatterns);

const extractDependencyFileQuery = (question: string): O.Option<string> =>
  extractNormalizedPathQuery(question, dependencyFilePatterns);

const extractDependentFileQuery = (question: string): O.Option<string> =>
  extractNormalizedPathQuery(question, dependentFilePatterns);

const extractBacktickValue = QueryText.extractBacktickValue;

const extractSymbolName = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => {
      return firstCapture(
        /(?:locate|find|where is|where's|describe|what is|docs for|documentation for|params of|parameters of|returns of|throws of|deprecated)\s+(?:the\s+)?(?:symbol\s+)?(.+)$/i,
        question
      );
    }),
    O.map(QueryText.normalizePhrase),
    O.filter((phrase) => {
      const tokenized = IdentifierText.tokens(phrase);
      return A.isReadonlyArrayNonEmpty(tokenized) && tokenized.length <= 6 && !/[/.\\]/.test(phrase);
    })
  );

const extractModuleQuery = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => firstCaptureFrom(moduleQueryPatterns, question)),
    O.map(PathText.normalizePathPhrase),
    O.filter(PathText.isPathLike)
  );

const interpretQuery = (question: string): QueryInterpretation => {
  const normalized = normalizeQuestion(question);
  const lower = Str.toLowerCase(normalized);
  const contains = (value: string) => pipe(lower, Str.includes(value));
  const startsWith = (value: string) => pipe(lower, Str.startsWith(value));

  if ((contains("how many") || contains("count")) && contains("symbol")) {
    return new CountSymbolsInterpretation({});
  }

  if ((contains("how many") || contains("count")) && (contains("file") || contains("source"))) {
    return new CountFilesInterpretation({});
  }

  if (contains("what depends on") || contains("who depends on") || contains("dependents of")) {
    return pipe(
      extractDependentFileQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Dependent queries currently require one concrete TypeScript file path, preferably enclosed in backticks.",
          }),
        onSome: (fileQuery) => new ListFileDependentsInterpretation({ fileQuery }),
      })
    );
  }

  if (contains("depend on") || contains("depends on") || contains("dependencies of") || contains("dependency of")) {
    return pipe(
      extractDependencyFileQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Dependency queries currently require one concrete TypeScript file path, preferably enclosed in backticks.",
          }),
        onSome: (fileQuery) => new ListFileDependenciesInterpretation({ fileQuery }),
      })
    );
  }

  if (contains("who imports") || contains("what imports") || contains("importers of")) {
    return pipe(
      extractModuleQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Importer queries currently require one module specifier or file query, preferably enclosed in backticks.",
          }),
        onSome: (moduleQuery) => new ListFileImportersInterpretation({ moduleQuery }),
      })
    );
  }

  if ((contains("what does") && contains(" import")) || contains("imports of") || contains("list imports")) {
    return pipe(
      extractImportFileQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Import queries currently require one concrete TypeScript file path, preferably enclosed in backticks.",
          }),
        onSome: (fileQuery) => new ListFileImportsInterpretation({ fileQuery }),
      })
    );
  }

  if (contains("export")) {
    return pipe(
      extractExportFileQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Export queries currently require one concrete TypeScript file path, preferably enclosed in backticks.",
          }),
        onSome: (fileQuery) => new ListFileExportsInterpretation({ fileQuery }),
      })
    );
  }

  if (startsWith("search ") || contains("keyword")) {
    return new KeywordSearchInterpretation({
      query: pipe(
        extractBacktickValue(normalized),
        O.getOrElse(() => pipe(normalized, Str.replace(/^(search|keyword)\s+/i, "")))
      ),
    });
  }

  if (contains("deprecated")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Deprecation queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new SymbolDeprecationInterpretation({ symbolName }),
      })
    );
  }

  if (contains("throw")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Throws queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new SymbolThrowsInterpretation({ symbolName }),
      })
    );
  }

  if (contains("return")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Return queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new SymbolReturnsInterpretation({ symbolName }),
      })
    );
  }

  if (contains("param") || contains("argument")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Parameter queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new SymbolParamsInterpretation({ symbolName }),
      })
    );
  }

  if (contains("locate") || contains("where is") || contains("find")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Locate queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new LocateSymbolInterpretation({ symbolName }),
      })
    );
  }

  if (contains("describe") || contains("what is") || contains("docs for") || contains("documentation for")) {
    return pipe(
      extractSymbolName(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason: "Describe queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new DescribeSymbolInterpretation({ symbolName }),
      })
    );
  }

  return new UnsupportedQueryInterpretation({
    reason:
      "This v0 deterministic query path currently supports countFiles, countSymbols, locateSymbol, describeSymbol, symbolParams, symbolReturns, symbolThrows, symbolDeprecation, listFileExports, listFileImports, listFileImporters, listFileDependencies, listFileDependents, and keywordSearch only.",
  });
};

const latestSnapshotForRepo = (store: GroundedRetrievalStoreShape) =>
  Effect.fn("GroundedRetrieval.latestSnapshotForRepo")(function* (
    repoId: RepoId
  ): Effect.fn.Return<SourceSnapshotId, GroundedRetrievalError> {
    const latestSnapshot = yield* mapStoreError(store.latestSourceSnapshot(repoId));

    return yield* O.match(latestSnapshot, {
      onNone: () => toRetrievalError(`Repo "${repoId}" does not have a completed source snapshot yet.`, 400),
      onSome: (snapshot) => Effect.succeed(snapshot.id),
    });
  });

const symbolCitation = (
  symbol: Pick<RepoSymbolRecord, "repoId" | "symbolId" | "symbolName" | "filePath" | "startLine" | "endLine">
): Citation =>
  new Citation({
    id: symbol.symbolId,
    repoId: symbol.repoId,
    label: symbol.symbolName,
    rationale: `Symbol declaration for ${symbol.symbolName}.`,
    span: {
      filePath: symbol.filePath,
      startLine: decodePosInt(symbol.startLine),
      endLine: decodePosInt(symbol.endLine),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: O.some(symbol.symbolName),
    },
  });

const importEdgeCitation = (edge: RepoImportEdge): Citation =>
  new Citation({
    id: `${edge.importerFilePath}::${edge.moduleSpecifier}::${edge.startLine}:${pipe(edge.importedName, O.getOrNull) ?? "*"}`,
    repoId: edge.repoId,
    label: `${edge.importerFilePath}:${edge.startLine}`,
    rationale: `Import of "${edge.moduleSpecifier}" in ${edge.importerFilePath}.`,
    span: {
      filePath: edge.importerFilePath,
      startLine: decodePosInt(edge.startLine),
      endLine: decodePosInt(edge.endLine),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: edge.importedName,
    },
  });

const fileCitation = (file: Pick<RepoSourceFile, "repoId" | "filePath">): Citation =>
  new Citation({
    id: file.filePath,
    repoId: file.repoId,
    label: file.filePath,
    rationale: `Source file ${file.filePath}.`,
    span: {
      filePath: file.filePath,
      startLine: decodePosInt(1),
      endLine: decodePosInt(1),
      startColumn: O.none(),
      endColumn: O.none(),
      symbolName: O.none(),
    },
  });

const documentationCitation = (
  symbol: Pick<RepoSymbolRecord, "repoId" | "symbolId" | "symbolName" | "documentation">
): O.Option<Citation> =>
  pipe(
    symbol.documentation,
    O.map(
      (documentation) =>
        new Citation({
          id: `${symbol.symbolId}::jsdoc`,
          repoId: symbol.repoId,
          label: `${symbol.symbolName} JSDoc`,
          rationale: `JSDoc documentation for ${symbol.symbolName}.`,
          span: documentation.span,
        })
    )
  );

const documentationCitations = (
  symbol: RepoSymbolRecord,
  options?: {
    readonly includeDeclaration?: boolean | undefined;
  }
): ReadonlyArray<Citation> =>
  normalizeCitations(
    pipe(
      A.make(
        pipe(documentationCitation(symbol), O.getOrNull),
        options?.includeDeclaration ? symbolCitation(symbol) : null
      ),
      A.filter((citation): citation is Citation => citation !== null)
    )
  );

const normalizeCitations = (citations: ReadonlyArray<Citation>): ReadonlyArray<Citation> =>
  pipe(
    citations,
    A.sort(citationOrder),
    A.dedupeWith((left, right) => left.id === right.id)
  );

const prefixedText = (label: string, value: O.Option<string>): O.Option<string> =>
  pipe(
    value,
    O.map((text) => `${label}: ${text}.`)
  );

const formatDocumentedParameter = (parameter: RepoDocumentedParameter): string => {
  const header = pipe(
    parameter.type,
    O.match({
      onNone: () => parameter.name,
      onSome: (type) => `${parameter.name}: ${type}`,
    })
  );

  return pipe(
    parameter.description,
    O.match({
      onNone: () => header,
      onSome: (description) => `${header} — ${description}`,
    })
  );
};

const formatDocumentedReturn = (documentation: RepoDocumentedReturn): string =>
  pipe(
    A.make(
      pipe(documentation.type, O.getOrElse(thunkEmptyStr)),
      pipe(documentation.description, O.getOrElse(thunkEmptyStr))
    ),
    A.filter(Str.isNonEmpty),
    A.join(" — ")
  );

const formatDocumentedThrow = (documentation: RepoDocumentedThrow): string =>
  pipe(
    A.make(
      pipe(documentation.type, O.getOrElse(thunkEmptyStr)),
      pipe(documentation.description, O.getOrElse(thunkEmptyStr))
    ),
    A.filter(Str.isNonEmpty),
    A.join(" — ")
  );

const describeDocumentation = (documentation: RepoSymbolDocumentation): string =>
  pipe(
    A.make(
      pipe(prefixedText("Summary", documentation.summary), O.getOrElse(thunkEmptyStr)),
      pipe(prefixedText("Description", documentation.description), O.getOrElse(thunkEmptyStr)),
      pipe(prefixedText("Remarks", documentation.remarks), O.getOrElse(thunkEmptyStr)),
      documentation.isDeprecated
        ? pipe(
            prefixedText("Deprecated", documentation.deprecationNote),
            O.getOrElse(() => "Deprecated.")
          )
        : "",
      pipe(
        documentation.params,
        A.match({
          onEmpty: thunkEmptyStr,
          onNonEmpty: (params) =>
            `Documented parameters: ${pipe(params, A.map(formatDocumentedParameter), A.join("; "))}.`,
        })
      ),
      pipe(
        documentation.returns,
        O.match({
          onNone: thunkEmptyStr,
          onSome: (result) => `Returns: ${formatDocumentedReturn(result)}.`,
        })
      ),
      pipe(
        documentation.throws,
        A.match({
          onEmpty: thunkEmptyStr,
          onNonEmpty: (errors) => `Throws: ${pipe(errors, A.map(formatDocumentedThrow), A.join("; "))}.`,
        })
      ),
      pipe(
        documentation.see,
        A.match({
          onEmpty: thunkEmptyStr,
          onNonEmpty: (references) => `See also: ${A.join(references, ", ")}.`,
        })
      )
    ),
    A.filter(Str.isNonEmpty),
    A.join(" ")
  );

const makePacket = (options: {
  readonly repoId: RepoId;
  readonly sourceSnapshotId: SourceSnapshotId;
  readonly query: string;
  readonly summary: string;
  readonly citations: ReadonlyArray<Citation>;
  readonly notes: ReadonlyArray<string>;
}): Effect.Effect<RetrievalPacket> =>
  Effect.map(
    DateTime.now,
    (retrievedAt) =>
      new RetrievalPacket({
        repoId: options.repoId,
        sourceSnapshotId: O.some(options.sourceSnapshotId),
        query: options.query,
        retrievedAt,
        summary: options.summary,
        citations: options.citations,
        notes: VariantText.orderedDedupe(A.append(options.notes, `sourceSnapshotId=${options.sourceSnapshotId}`)),
      })
  );

type MatchSelection<A> = {
  readonly matches: ReadonlyArray<A>;
  readonly nlpNotes: ReadonlyArray<string>;
};

type SingleMatchSelection<A> =
  | {
      readonly kind: "none";
      readonly nlpNotes: ReadonlyArray<string>;
    }
  | {
      readonly kind: "single";
      readonly match: A;
      readonly nlpNotes: ReadonlyArray<string>;
    }
  | {
      readonly kind: "ambiguous";
      readonly matches: ReadonlyArray<A>;
      readonly nlpNotes: ReadonlyArray<string>;
    };

type RankedSymbolHit = {
  readonly exportedRank: number;
  readonly symbol: RepoSymbolRecord;
  readonly variant: string;
  readonly variantIndex: number;
};

type RankedFileHit = {
  readonly file: RepoSourceFile;
  readonly strategy: "file-exact" | "file-suffix" | "file-basename" | "file-contains";
  readonly variant: string;
  readonly variantIndex: number;
};

type RankedImporterHit = {
  readonly edge: RepoImportEdge;
  readonly strategy: "module-exact" | "module-suffix";
  readonly variant: string;
  readonly variantIndex: number;
};

const stripTypeScriptExtension = (input: string): string => pipe(input, Str.replace(/\.[cm]?tsx?$/i, ""));

const pathBasename = (input: string): string =>
  pipe(
    input,
    Str.split("/"),
    A.last,
    O.getOrElse(() => input)
  );

const rankedSymbolHitOrder = Order.mapInput(Order.String, (hit: RankedSymbolHit) => {
  const startLine = `${hit.symbol.startLine}`.padStart(6, "0");
  return `${`${hit.variantIndex}`.padStart(2, "0")}:${hit.exportedRank}:${hit.symbol.filePath}:${startLine}:${hit.symbol.symbolId}`;
});

const fileStrategyRanks = {
  "file-basename": 2,
  "file-contains": 3,
  "file-exact": 0,
  "file-suffix": 1,
} satisfies Record<RankedFileHit["strategy"], number>;

const moduleStrategyRanks = {
  "module-exact": 0,
  "module-suffix": 1,
} satisfies Record<RankedImporterHit["strategy"], number>;

const fileStrategyRank = (strategy: RankedFileHit["strategy"]): number => fileStrategyRanks[strategy];
const moduleStrategyRank = (strategy: RankedImporterHit["strategy"]): number => moduleStrategyRanks[strategy];

const rankedFileHitOrder = Order.mapInput(
  Order.String,
  (hit: RankedFileHit) =>
    `${fileStrategyRank(hit.strategy)}:${`${hit.variantIndex}`.padStart(2, "0")}:${hit.file.filePath}`
);

const rankedImporterHitOrder = Order.mapInput(Order.String, (hit: RankedImporterHit) => {
  const importedName = pipe(
    hit.edge.importedName,
    O.getOrElse(() => "*")
  );

  return `${moduleStrategyRank(hit.strategy)}:${`${hit.variantIndex}`.padStart(2, "0")}:${hit.edge.importerFilePath}:${`${hit.edge.startLine}`.padStart(6, "0")}:${hit.edge.moduleSpecifier}:${importedName}`;
});

const importEdgeIdentity = (edge: RepoImportEdge): string =>
  `${edge.importerFilePath}:${edge.moduleSpecifier}:${edge.startLine}:${edge.endLine}:${pipe(
    edge.importedName,
    O.getOrElse(() => "*")
  )}`;

const makeSelectionNotes = (options: {
  readonly raw: string;
  readonly selected: string;
  readonly strategy: string;
}): ReadonlyArray<string> =>
  VariantText.orderedDedupe(
    A.make(
      `nlp:match-strategy=${options.strategy}`,
      options.selected === QueryText.normalizePhrase(options.raw) ? "" : `nlp:matched-variant=${options.selected}`
    )
  );

const nlpQuestionNotes = (question: string): ReadonlyArray<string> => {
  const normalized = normalizeQuestion(question);

  return normalized === question ? A.empty() : A.make(`nlp:normalized-question=${normalized}`);
};

const selectSingleMatch = <A>(selection: MatchSelection<A>): SingleMatchSelection<A> => {
  if (!A.isReadonlyArrayNonEmpty(selection.matches)) {
    return {
      kind: "none",
      nlpNotes: selection.nlpNotes,
    };
  }

  if (selection.matches.length > 1) {
    return {
      kind: "ambiguous",
      matches: selection.matches,
      nlpNotes: selection.nlpNotes,
    };
  }

  return {
    kind: "single",
    match: pipe(selection.matches, A.head, O.getOrThrow),
    nlpNotes: selection.nlpNotes,
  };
};

const formatFileCandidates = (files: ReadonlyArray<RepoSourceFile>): string =>
  pipe(
    files,
    A.map((file) => file.filePath),
    A.join(", ")
  );

const formatSymbolCandidates = (symbols: ReadonlyArray<RepoSymbolRecord>): string =>
  pipe(
    symbols,
    A.map((symbol) => `${symbol.symbolName} in ${symbol.filePath}:${symbol.startLine}`),
    A.join(", ")
  );

const rankFileMatch = (
  filePath: string,
  variant: string
): "file-exact" | "file-suffix" | "file-basename" | "file-contains" => {
  const normalizedFilePath = Str.toLowerCase(PathText.normalizePathPhrase(filePath));
  const normalizedVariant = Str.toLowerCase(PathText.normalizePathPhrase(variant));
  const filePathWithoutExtension = stripTypeScriptExtension(normalizedFilePath);
  const fileBasename = pathBasename(normalizedFilePath);
  const basenameWithoutExtension = stripTypeScriptExtension(fileBasename);

  if (normalizedFilePath === normalizedVariant) {
    return "file-exact";
  }

  if (
    filePathWithoutExtension === normalizedVariant ||
    pipe(normalizedFilePath, Str.endsWith(`/${normalizedVariant}`)) ||
    pipe(filePathWithoutExtension, Str.endsWith(`/${normalizedVariant}`))
  ) {
    return "file-suffix";
  }

  if (fileBasename === normalizedVariant || basenameWithoutExtension === normalizedVariant) {
    return "file-basename";
  }

  return "file-contains";
};

const findSymbolMatches = (store: GroundedRetrievalStoreShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("GroundedRetrieval.findSymbolMatches")(function* (
    symbolName: string
  ): Effect.fn.Return<MatchSelection<RepoSymbolRecord>, GroundedRetrievalError> {
    const variants = IdentifierText.variants(symbolName);
    const rawVariant = QueryText.normalizePhrase(symbolName);

    for (const [variantIndex, variant] of variants.entries()) {
      const exactMatches = yield* mapStoreError(store.findSymbolsByExactName(repoId, sourceSnapshotId, variant));

      if (A.isReadonlyArrayNonEmpty(exactMatches)) {
        const rankedExactMatches = pipe(
          exactMatches,
          A.map((symbol) => ({
            exportedRank: symbol.exported ? 0 : 1,
            symbol,
            variant,
            variantIndex,
          })),
          A.sort(rankedSymbolHitOrder)
        );
        const bestExactMatch = pipe(rankedExactMatches, A.head, O.getOrThrow);

        return {
          matches: pipe(
            rankedExactMatches,
            A.filter((match) => match.exportedRank === bestExactMatch.exportedRank),
            A.map((match) => match.symbol)
          ),
          nlpNotes:
            variantIndex === 0 && variant === rawVariant
              ? A.empty()
              : makeSelectionNotes({
                  raw: symbolName,
                  selected: variant,
                  strategy: "symbol-exact-variant",
                }),
        };
      }
    }

    let rankedHits = A.empty<RankedSymbolHit>();

    for (const [variantIndex, variant] of variants.entries()) {
      const matches = yield* mapStoreError(store.searchSymbols(repoId, sourceSnapshotId, variant, 5));
      rankedHits = A.appendAll(
        rankedHits,
        pipe(
          matches,
          A.map((symbol) => ({
            exportedRank: symbol.exported ? 0 : 1,
            symbol,
            variant,
            variantIndex,
          }))
        )
      );
    }

    const rankedMatches = pipe(
      rankedHits,
      A.sort(rankedSymbolHitOrder),
      A.dedupeWith((left, right) => left.symbol.symbolId === right.symbol.symbolId)
    );

    if (!A.isReadonlyArrayNonEmpty(rankedMatches)) {
      return {
        matches: A.empty(),
        nlpNotes: A.empty(),
      };
    }

    const bestMatch = pipe(rankedMatches, A.head, O.getOrThrow);
    const selectedMatches = pipe(
      rankedMatches,
      A.filter(
        (match) => match.variantIndex === bestMatch.variantIndex && match.exportedRank === bestMatch.exportedRank
      ),
      A.map((match) => match.symbol)
    );

    return {
      matches: selectedMatches,
      nlpNotes:
        bestMatch.variantIndex === 0 && bestMatch.variant === rawVariant
          ? A.empty()
          : makeSelectionNotes({
              raw: symbolName,
              selected: bestMatch.variant,
              strategy: "symbol-search-variant",
            }),
    };
  });

const resolveFileCandidates = (store: GroundedRetrievalStoreShape) =>
  Effect.fn("GroundedRetrieval.resolveFileCandidates")(function* (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    fileQuery: string
  ): Effect.fn.Return<MatchSelection<RepoSourceFile>, GroundedRetrievalError> {
    const variants = PathText.filePathVariants(fileQuery);
    const rawVariant = PathText.normalizePathPhrase(fileQuery);
    let rankedHits = A.empty<RankedFileHit>();

    for (const [variantIndex, variant] of variants.entries()) {
      const files = yield* mapStoreError(store.findSourceFiles(repoId, sourceSnapshotId, variant, 5));
      rankedHits = A.appendAll(
        rankedHits,
        pipe(
          files,
          A.map((file) => ({
            file,
            strategy: rankFileMatch(file.filePath, variant),
            variant,
            variantIndex,
          }))
        )
      );
    }

    const rankedMatches = pipe(
      rankedHits,
      A.sort(rankedFileHitOrder),
      A.dedupeWith((left, right) => left.file.filePath === right.file.filePath)
    );

    if (!A.isReadonlyArrayNonEmpty(rankedMatches)) {
      return {
        matches: A.empty(),
        nlpNotes: A.empty(),
      };
    }

    const bestMatch = pipe(rankedMatches, A.head, O.getOrThrow);
    const bestStrategyRank = fileStrategyRank(bestMatch.strategy);
    const selectedMatches = pipe(
      rankedMatches,
      A.filter(
        (match) =>
          match.variantIndex === bestMatch.variantIndex && fileStrategyRank(match.strategy) === bestStrategyRank
      ),
      A.map((match) => match.file)
    );

    return {
      matches: selectedMatches,
      nlpNotes:
        bestMatch.variantIndex === 0 && bestMatch.variant === rawVariant && bestMatch.strategy === "file-exact"
          ? A.empty()
          : makeSelectionNotes({
              raw: fileQuery,
              selected: bestMatch.variant,
              strategy: bestMatch.strategy,
            }),
    };
  });

const rankImporterMatch = (moduleSpecifier: string, variant: string): O.Option<RankedImporterHit["strategy"]> => {
  const normalizedSpecifier = Str.toLowerCase(PathText.normalizePathPhrase(moduleSpecifier));
  const normalizedVariant = Str.toLowerCase(PathText.normalizePathPhrase(variant));

  if (normalizedSpecifier === normalizedVariant) {
    return O.some("module-exact");
  }

  return pipe(normalizedSpecifier, Str.endsWith(`/${normalizedVariant}`)) ? O.some("module-suffix") : O.none();
};

const selectImporterEdges = (
  moduleQuery: string,
  importEdges: ReadonlyArray<RepoImportEdge>
): MatchSelection<RepoImportEdge> => {
  const variants = PathText.moduleSpecifierVariants(moduleQuery);
  const rawVariant = PathText.normalizePathPhrase(moduleQuery);
  let rankedHits = A.empty<RankedImporterHit>();

  for (const [variantIndex, variant] of variants.entries()) {
    rankedHits = A.appendAll(
      rankedHits,
      pipe(
        importEdges,
        A.map((edge) =>
          pipe(
            rankImporterMatch(edge.moduleSpecifier, variant),
            O.map((strategy) => ({
              edge,
              strategy,
              variant,
              variantIndex,
            }))
          )
        ),
        A.getSomes
      )
    );
  }

  const rankedMatches = pipe(
    rankedHits,
    A.sort(rankedImporterHitOrder),
    A.dedupeWith((left, right) => importEdgeIdentity(left.edge) === importEdgeIdentity(right.edge))
  );

  if (!A.isReadonlyArrayNonEmpty(rankedMatches)) {
    return {
      matches: A.empty(),
      nlpNotes: A.empty(),
    };
  }

  const bestMatch = pipe(rankedMatches, A.head, O.getOrThrow);

  return {
    matches: pipe(
      rankedMatches,
      A.filter(
        (match) =>
          match.variantIndex === bestMatch.variantIndex &&
          moduleStrategyRank(match.strategy) === moduleStrategyRank(bestMatch.strategy)
      ),
      A.map((match) => match.edge)
    ),
    nlpNotes:
      bestMatch.variantIndex === 0 && bestMatch.variant === rawVariant && bestMatch.strategy === "module-exact"
        ? A.empty()
        : makeSelectionNotes({
            raw: moduleQuery,
            selected: bestMatch.variant,
            strategy: bestMatch.strategy,
          }),
  };
};

const searchKeywordMatches = (store: GroundedRetrievalStoreShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("GroundedRetrieval.searchKeywordMatches")(function* (
    query: string
  ): Effect.fn.Return<MatchSelection<RepoSymbolRecord>, GroundedRetrievalError> {
    const variants = IdentifierText.variants(query);
    const rawVariant = QueryText.normalizePhrase(query);
    let rankedHits = A.empty<RankedSymbolHit>();

    for (const [variantIndex, variant] of variants.entries()) {
      const matches = yield* mapStoreError(store.searchSymbols(repoId, sourceSnapshotId, variant, 5));
      rankedHits = A.appendAll(
        rankedHits,
        pipe(
          matches,
          A.map((symbol) => ({
            exportedRank: symbol.exported ? 0 : 1,
            symbol,
            variant,
            variantIndex,
          }))
        )
      );
    }

    const rankedMatches = pipe(
      rankedHits,
      A.sort(rankedSymbolHitOrder),
      A.dedupeWith((left, right) => left.symbol.symbolId === right.symbol.symbolId)
    );

    if (!A.isReadonlyArrayNonEmpty(rankedMatches)) {
      return {
        matches: A.empty(),
        nlpNotes: A.empty(),
      };
    }

    const bestMatch = pipe(rankedMatches, A.head, O.getOrThrow);
    const selectedMatches = pipe(
      rankedMatches,
      A.filter(
        (match) => match.variantIndex === bestMatch.variantIndex && match.exportedRank === bestMatch.exportedRank
      ),
      A.map((match) => match.symbol)
    );

    return {
      matches: selectedMatches,
      nlpNotes:
        bestMatch.variantIndex === 0 && bestMatch.variant === rawVariant
          ? A.empty()
          : makeSelectionNotes({
              raw: query,
              selected: bestMatch.variant,
              strategy: "keyword-variant",
            }),
    };
  });

const toQueryKindMetric = (interpretation: QueryInterpretation): QueryKindMetric => interpretation.kind;

const queryResultOutcome = (
  interpretation: QueryInterpretation,
  result: GroundedQueryResult
): "cited" | "notCited" | "unsupported" =>
  interpretation.kind === "unsupported"
    ? "unsupported"
    : A.isReadonlyArrayNonEmpty(result.citations)
      ? "cited"
      : "notCited";

const loadSemanticArtifacts = (store: GroundedRetrievalStoreShape) =>
  Effect.fn("GroundedRetrieval.loadSemanticArtifacts")(function* (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): Effect.fn.Return<O.Option<RepoSemanticArtifacts>> {
    return yield* store
      .getSemanticArtifacts(repoId, sourceSnapshotId)
      .pipe(
        Effect.catch((error) =>
          Effect.logWarning(
            `Semantic artifact lookup failed for repo "${repoId}" and snapshot "${sourceSnapshotId}": ${error.message}`
          ).pipe(Effect.as(O.none<RepoSemanticArtifacts>()))
        )
      );
  });

const matchedSemanticAnchorCount = (
  citations: ReadonlyArray<Citation>,
  semanticArtifacts: O.Option<RepoSemanticArtifacts>
): number => {
  if (O.isNone(semanticArtifacts) || A.isReadonlyArrayEmpty(citations)) {
    return 0;
  }

  const citationIds = pipe(
    citations,
    A.map((citation) => citation.id),
    HashSet.fromIterable
  );
  return pipe(
    semanticArtifacts.value.evidenceAnchors,
    A.filter(
      (anchor) =>
        O.isSome(anchor.note) &&
        pipe(anchor.note.value, Str.startsWith("citationId=")) &&
        HashSet.has(citationIds, pipe(anchor.note.value, Str.slice("citationId=".length)))
    ),
    A.length
  );
};

const withSemanticOverlay = (
  result: GroundedQueryResult,
  semanticArtifacts: O.Option<RepoSemanticArtifacts>
): GroundedQueryResult => {
  if (O.isNone(semanticArtifacts)) {
    return result;
  }

  const matchedAnchorCount = matchedSemanticAnchorCount(result.citations, semanticArtifacts);

  return new GroundedQueryResult({
    answer: result.answer,
    citations: result.citations,
    packet: new RetrievalPacket({
      ...result.packet,
      summary: `${result.packet.summary} Semantic overlay available for dependency, provenance, and evidence context.`,
      notes: pipe(
        result.packet.notes,
        A.append(`semanticDatasetQuads=${semanticArtifacts.value.dataset.quads.length}`),
        A.append(`semanticProvenanceRecords=${semanticArtifacts.value.provenance.records.length}`),
        A.append(`semanticEvidenceAnchors=${semanticArtifacts.value.evidenceAnchors.length}`),
        A.append(`semanticCitationAnchors=${matchedAnchorCount}/${A.length(result.packet.citations)}`)
      ),
    }),
  });
};

const makeGroundedRetrievalService = Effect.fn("GroundedRetrieval.make")(function* () {
  const semanticStore = yield* RepoSemanticStore;
  const snapshotStore = yield* RepoSnapshotStore;
  const symbolStore = yield* RepoSymbolStore;
  const store: GroundedRetrievalStoreShape = { ...semanticStore, ...snapshotStore, ...symbolStore };
  const latestSnapshot = latestSnapshotForRepo(store);
  const latestSemanticArtifacts = loadSemanticArtifacts(store);

  const resolve: GroundedRetrievalServiceShape["resolve"] = Effect.fn("GroundedRetrieval.resolve")(function* (payload) {
    const sourceSnapshotId = yield* latestSnapshot(payload.repoId);
    const semanticArtifacts = yield* latestSemanticArtifacts(payload.repoId, sourceSnapshotId);
    const interpretation = interpretQuery(payload.question);
    const queryKind = toQueryKindMetric(interpretation);
    const questionNotes = nlpQuestionNotes(payload.question);
    const findMatches = findSymbolMatches(store, payload.repoId, sourceSnapshotId);
    const findFiles = resolveFileCandidates(store);
    const findKeywordMatches = searchKeywordMatches(store, payload.repoId, sourceSnapshotId);

    const makeQueryPacket = (options: {
      readonly summary: string;
      readonly citations: ReadonlyArray<Citation>;
      readonly notes: ReadonlyArray<string>;
    }) =>
      makePacket({
        repoId: payload.repoId,
        sourceSnapshotId,
        query: payload.question,
        summary: options.summary,
        citations: options.citations,
        notes: VariantText.orderedDedupe(A.appendAll(questionNotes, options.notes)),
      });

    const noSymbolMatchResult = Effect.fn("GroundedRetrieval.noSymbolMatchResult")(function* (
      symbolName: string,
      note: string,
      nlpNotes: ReadonlyArray<string>
    ) {
      const packet = yield* makeQueryPacket({
        summary: `No indexed symbol matched "${symbolName}" in snapshot ${sourceSnapshotId}.`,
        citations: A.empty(),
        notes: A.appendAll(A.make(note), nlpNotes),
      });

      return new GroundedQueryResult({
        answer: `No indexed symbol named "${symbolName}" was found in snapshot ${sourceSnapshotId}.`,
        citations: A.empty(),
        packet,
      });
    });

    const ambiguousSymbolMatchResult = Effect.fn("GroundedRetrieval.ambiguousSymbolMatchResult")(function* (
      symbolName: string,
      matches: ReadonlyArray<RepoSymbolRecord>,
      nlpNotes: ReadonlyArray<string>
    ) {
      const citations = normalizeCitations(pipe(matches, A.take(10), A.map(symbolCitation)));
      const packet = yield* makeQueryPacket({
        summary: `Symbol query "${symbolName}" matched multiple indexed symbols.`,
        citations,
        notes: A.appendAll(A.make(`candidateCount=${A.length(matches)}`), nlpNotes),
      });

      return new GroundedQueryResult({
        answer: `Ambiguous symbol query "${symbolName}". Matching symbols: ${formatSymbolCandidates(matches)}.`,
        citations,
        packet,
      });
    });

    const noFileMatchResult = Effect.fn("GroundedRetrieval.noFileMatchResult")(function* (
      fileQuery: string,
      note: string,
      nlpNotes: ReadonlyArray<string>
    ) {
      const packet = yield* makeQueryPacket({
        summary: `No indexed file matched "${fileQuery}" in snapshot ${sourceSnapshotId}.`,
        citations: A.empty(),
        notes: A.appendAll(A.make(note), nlpNotes),
      });

      return new GroundedQueryResult({
        answer: `No indexed TypeScript file matching "${fileQuery}" was found in snapshot ${sourceSnapshotId}.`,
        citations: A.empty(),
        packet,
      });
    });

    const ambiguousFileMatchResult = Effect.fn("GroundedRetrieval.ambiguousFileMatchResult")(function* (
      fileQuery: string,
      matches: ReadonlyArray<RepoSourceFile>,
      nlpNotes: ReadonlyArray<string>
    ) {
      const citations = normalizeCitations(pipe(matches, A.take(10), A.map(fileCitation)));
      const packet = yield* makeQueryPacket({
        summary: `File query "${fileQuery}" matched multiple indexed files.`,
        citations,
        notes: A.appendAll(A.make(`candidateCount=${A.length(matches)}`), nlpNotes),
      });

      return new GroundedQueryResult({
        answer: `Ambiguous file query "${fileQuery}". Matching files: ${formatFileCandidates(matches)}.`,
        citations,
        packet,
      });
    });

    yield* Effect.annotateCurrentSpan({
      repo_id: payload.repoId,
      source_snapshot_id: sourceSnapshotId,
      query_kind: queryKind,
    });
    yield* recordQueryInterpretation(queryKind);

    const result = yield* QueryInterpretation.match(interpretation, {
      countFiles: () =>
        Effect.gen(function* () {
          const fileCount = yield* mapStoreError(store.countSourceFiles(payload.repoId, sourceSnapshotId));
          const packet = yield* makeQueryPacket({
            summary: `Counted indexed TypeScript source files for snapshot ${sourceSnapshotId}.`,
            citations: A.empty(),
            notes: A.make(`countFiles=${fileCount}`),
          });

          return new GroundedQueryResult({
            answer: `Indexed snapshot ${sourceSnapshotId} currently contains ${fileCount} TypeScript source files.`,
            citations: A.empty(),
            packet,
          });
        }),
      countSymbols: () =>
        Effect.gen(function* () {
          const symbolCount = yield* mapStoreError(store.listSymbolRecords(payload.repoId, sourceSnapshotId)).pipe(
            Effect.map(A.length)
          );
          const packet = yield* makeQueryPacket({
            summary: `Counted indexed TypeScript symbols for snapshot ${sourceSnapshotId}.`,
            citations: A.empty(),
            notes: A.make(`countSymbols=${symbolCount}`),
          });

          return new GroundedQueryResult({
            answer: `Indexed snapshot ${sourceSnapshotId} currently contains ${symbolCount} captured TypeScript symbols.`,
            citations: A.empty(),
            packet,
          });
        }),
      locateSymbol: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "locateSymbol=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          const citations = normalizeCitations(A.make(symbolCitation(symbol)));
          const packet = yield* makeQueryPacket({
            summary: `Located symbol "${symbol.symbolName}" from indexed symbol records.`,
            citations,
            notes: A.appendAll(A.make(`symbolId=${symbol.symbolId}`), selection.nlpNotes),
          });

          return new GroundedQueryResult({
            answer: `Symbol "${symbol.symbolName}" is declared in ${symbol.filePath} on lines ${symbol.startLine}-${symbol.endLine}.`,
            citations,
            packet,
          });
        }),
      describeSymbol: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "describeSymbol=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          const documentationText = pipe(
            symbol.documentation,
            O.map(describeDocumentation),
            O.filter(Str.isNonEmpty),
            O.getOrElse(() =>
              pipe(
                symbol.documentation,
                O.match({
                  onNone: () => "No indexed JSDoc-backed documentation was found.",
                  onSome: () => "Indexed JSDoc is present but none of the core semantic fields were captured.",
                })
              )
            )
          );
          const citations = O.isSome(symbol.documentation)
            ? documentationCitations(symbol, { includeDeclaration: true })
            : normalizeCitations(A.make(symbolCitation(symbol)));
          const packet = yield* makeQueryPacket({
            summary: O.isSome(symbol.documentation)
              ? `Described symbol "${symbol.symbolName}" from its indexed declaration and JSDoc semantics.`
              : `Described symbol "${symbol.symbolName}" from its indexed declaration because no JSDoc semantics were captured.`,
            citations,
            notes: A.appendAll(
              A.make(`signature=${symbol.signature}`, `documentation=${O.isSome(symbol.documentation)}`),
              selection.nlpNotes
            ),
          });

          return new GroundedQueryResult({
            answer: `Symbol "${symbol.symbolName}" is a ${symbol.symbolKind}. Signature: ${symbol.signature}. ${documentationText}`,
            citations,
            packet,
          });
        }),
      symbolParams: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "symbolParams=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makeQueryPacket({
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.appendAll(A.make("symbolParams=no-documentation"), selection.nlpNotes),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makeQueryPacket({
            summary: `Returned documented parameters for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.appendAll(A.make(`paramCount=${A.length(documentation.params)}`), selection.nlpNotes),
          });

          return new GroundedQueryResult({
            answer: pipe(
              documentation.params,
              A.match({
                onEmpty: () =>
                  `Symbol "${symbol.symbolName}" has indexed JSDoc, but no documented parameters were captured.`,
                onNonEmpty: (params) =>
                  `Documented parameters for "${symbol.symbolName}": ${pipe(params, A.map(formatDocumentedParameter), A.join("; "))}.`,
              })
            ),
            citations,
            packet,
          });
        }),
      symbolReturns: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "symbolReturns=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makeQueryPacket({
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.appendAll(A.make("symbolReturns=no-documentation"), selection.nlpNotes),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makeQueryPacket({
            summary: `Returned documented return semantics for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.appendAll(A.make(`hasReturns=${O.isSome(documentation.returns)}`), selection.nlpNotes),
          });

          return new GroundedQueryResult({
            answer: pipe(
              documentation.returns,
              O.match({
                onNone: () =>
                  `Symbol "${symbol.symbolName}" has indexed JSDoc, but no documented return contract was captured.`,
                onSome: (result) => `Documented return for "${symbol.symbolName}": ${formatDocumentedReturn(result)}.`,
              })
            ),
            citations,
            packet,
          });
        }),
      symbolThrows: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "symbolThrows=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makeQueryPacket({
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.appendAll(A.make("symbolThrows=no-documentation"), selection.nlpNotes),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makeQueryPacket({
            summary: `Returned documented throw semantics for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.appendAll(A.make(`throwCount=${A.length(documentation.throws)}`), selection.nlpNotes),
          });

          return new GroundedQueryResult({
            answer: pipe(
              documentation.throws,
              A.match({
                onEmpty: () =>
                  `Symbol "${symbol.symbolName}" has indexed JSDoc, but no documented throws were captured.`,
                onNonEmpty: (errors) =>
                  `Documented throws for "${symbol.symbolName}": ${pipe(errors, A.map(formatDocumentedThrow), A.join("; "))}.`,
              })
            ),
            citations,
            packet,
          });
        }),
      symbolDeprecation: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findMatches(value.symbolName));

          if (selection.kind === "none") {
            return yield* noSymbolMatchResult(value.symbolName, "symbolDeprecation=no-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousSymbolMatchResult(value.symbolName, selection.matches, selection.nlpNotes);
          }

          const symbol = selection.match;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makeQueryPacket({
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.appendAll(A.make("symbolDeprecation=no-documentation"), selection.nlpNotes),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makeQueryPacket({
            summary: `Returned deprecation documentation for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.appendAll(A.make(`deprecated=${documentation.isDeprecated}`), selection.nlpNotes),
          });

          return new GroundedQueryResult({
            answer: documentation.isDeprecated
              ? pipe(
                  documentation.deprecationNote,
                  O.match({
                    onNone: () => `Symbol "${symbol.symbolName}" is documented as deprecated.`,
                    onSome: (note) => `Symbol "${symbol.symbolName}" is documented as deprecated. ${note}`,
                  })
                )
              : `Symbol "${symbol.symbolName}" has indexed JSDoc, but it is not documented as deprecated.`,
            citations,
            packet,
          });
        }),
      listFileExports: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findFiles(payload.repoId, sourceSnapshotId, value.fileQuery));

          if (selection.kind === "none") {
            return yield* noFileMatchResult(value.fileQuery, "listFileExports=no-file-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousFileMatchResult(value.fileQuery, selection.matches, selection.nlpNotes);
          }

          const file = selection.match;

          const symbols = yield* mapStoreError(
            store.listExportedSymbolsForFile(payload.repoId, sourceSnapshotId, file.filePath)
          );
          const citations = normalizeCitations(pipe(symbols, A.map(symbolCitation)));
          const packet = yield* makeQueryPacket({
            summary: `Listed exported symbols for ${file.filePath}.`,
            citations,
            notes: A.appendAll(
              A.make(`filePath=${file.filePath}`, `exportCount=${A.length(symbols)}`),
              selection.nlpNotes
            ),
          });

          const answer = !A.isReadonlyArrayNonEmpty(symbols)
            ? `File ${file.filePath} has no indexed exported top-level symbols in snapshot ${sourceSnapshotId}.`
            : `File ${file.filePath} exports: ${pipe(
                symbols,
                A.map((symbol) => `${symbol.symbolName} (${symbol.symbolKind})`),
                A.join(", ")
              )}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      listFileImports: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findFiles(payload.repoId, sourceSnapshotId, value.fileQuery));

          if (selection.kind === "none") {
            return yield* noFileMatchResult(value.fileQuery, "listFileImports=no-file-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousFileMatchResult(value.fileQuery, selection.matches, selection.nlpNotes);
          }

          const file = selection.match;

          const matchingEdges = yield* mapStoreError(
            store.listImportEdgesForImporterFile(payload.repoId, sourceSnapshotId, file.filePath)
          );
          const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
          const importedModules = pipe(
            matchingEdges,
            A.map((edge) => edge.moduleSpecifier),
            A.dedupe
          );
          const packet = yield* makeQueryPacket({
            summary: `Listed import declarations captured for ${file.filePath}.`,
            citations,
            notes: A.appendAll(
              A.make(`filePath=${file.filePath}`, `importCount=${A.length(matchingEdges)}`),
              selection.nlpNotes
            ),
          });

          const answer = !A.isReadonlyArrayNonEmpty(importedModules)
            ? `File ${file.filePath} has no indexed import declarations in snapshot ${sourceSnapshotId}.`
            : `File ${file.filePath} imports: ${A.join(importedModules, ", ")}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      listFileDependencies: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findFiles(payload.repoId, sourceSnapshotId, value.fileQuery));

          if (selection.kind === "none") {
            return yield* noFileMatchResult(value.fileQuery, "listFileDependencies=no-file-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousFileMatchResult(value.fileQuery, selection.matches, selection.nlpNotes);
          }

          const file = selection.match;
          const fileEdges = yield* mapStoreError(
            store.listImportEdgesForImporterFile(payload.repoId, sourceSnapshotId, file.filePath)
          );
          const resolvedEdges = pipe(
            fileEdges,
            A.filter((edge) => O.isSome(edge.resolvedTargetFilePath))
          );
          const citations = normalizeCitations(pipe(resolvedEdges, A.map(importEdgeCitation)));
          const dependencyFiles = pipe(
            resolvedEdges,
            A.map((edge) => edge.resolvedTargetFilePath),
            A.getSomes,
            A.sort(Order.String),
            A.dedupe
          );
          const packet = yield* makeQueryPacket({
            summary: `Listed repo-local resolved file dependencies for ${file.filePath}.`,
            citations,
            notes: A.appendAll(
              A.make(
                `filePath=${file.filePath}`,
                `dependencyCount=${A.length(dependencyFiles)}`,
                `unresolvedImportCount=${A.length(fileEdges) - A.length(resolvedEdges)}`
              ),
              selection.nlpNotes
            ),
          });

          const answer = !A.isReadonlyArrayNonEmpty(dependencyFiles)
            ? `File ${file.filePath} has no repo-local resolved file dependencies in snapshot ${sourceSnapshotId}.`
            : `File ${file.filePath} depends on: ${A.join(dependencyFiles, ", ")}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      listFileDependents: (value) =>
        Effect.gen(function* () {
          const selection = selectSingleMatch(yield* findFiles(payload.repoId, sourceSnapshotId, value.fileQuery));

          if (selection.kind === "none") {
            return yield* noFileMatchResult(value.fileQuery, "listFileDependents=no-file-match", selection.nlpNotes);
          }

          if (selection.kind === "ambiguous") {
            return yield* ambiguousFileMatchResult(value.fileQuery, selection.matches, selection.nlpNotes);
          }

          const file = selection.match;
          const matchingEdges = yield* mapStoreError(
            store.listImportEdgesForResolvedTargetFile(payload.repoId, sourceSnapshotId, file.filePath)
          );
          const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
          const importerFiles = pipe(
            matchingEdges,
            A.map((edge) => edge.importerFilePath),
            A.sort(Order.String),
            A.dedupe
          );
          const packet = yield* makeQueryPacket({
            summary: `Listed repo-local files depending on ${file.filePath}.`,
            citations,
            notes: A.appendAll(
              A.make(`filePath=${file.filePath}`, `dependentCount=${A.length(importerFiles)}`),
              selection.nlpNotes
            ),
          });

          const answer = !A.isReadonlyArrayNonEmpty(importerFiles)
            ? `No indexed repo-local files depend on ${file.filePath} in snapshot ${sourceSnapshotId}.`
            : `Files depending on ${file.filePath}: ${A.join(importerFiles, ", ")}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      listFileImporters: (value) =>
        Effect.gen(function* () {
          const importEdges = yield* mapStoreError(store.listImportEdges(payload.repoId, sourceSnapshotId));
          const selection = selectImporterEdges(value.moduleQuery, importEdges);
          const matchingEdges = selection.matches;
          const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
          const importerFiles = pipe(
            matchingEdges,
            A.map((edge) => edge.importerFilePath),
            A.sort(Order.String),
            A.dedupe
          );
          const packet = yield* makeQueryPacket({
            summary: `Listed files importing "${value.moduleQuery}" from captured import edges.`,
            citations,
            notes: A.appendAll(
              A.make(`moduleQuery=${value.moduleQuery}`, `importerCount=${A.length(importerFiles)}`),
              selection.nlpNotes
            ),
          });

          const answer = !A.isReadonlyArrayNonEmpty(importerFiles)
            ? `No indexed files import "${value.moduleQuery}" in snapshot ${sourceSnapshotId}.`
            : `Files importing "${value.moduleQuery}": ${A.join(importerFiles, ", ")}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      keywordSearch: (value) =>
        Effect.gen(function* () {
          const selection = yield* findKeywordMatches(value.query);
          const matches = selection.matches;
          const citations = normalizeCitations(pipe(matches, A.map(symbolCitation)));
          const packet = yield* makeQueryPacket({
            summary: `Keyword search over indexed symbols using "${value.query}".`,
            citations,
            notes: A.appendAll(A.make(`matchCount=${A.length(matches)}`), selection.nlpNotes),
          });

          const answer = !A.isReadonlyArrayNonEmpty(matches)
            ? `No indexed symbols matched keyword query "${value.query}" in snapshot ${sourceSnapshotId}.`
            : `Keyword search matched: ${pipe(
                matches,
                A.map((symbol) => `${symbol.symbolName} in ${symbol.filePath}`),
                A.join("; ")
              )}.`;

          return new GroundedQueryResult({
            answer,
            citations,
            packet,
          });
        }),
      unsupported: (value) =>
        Effect.gen(function* () {
          const packet = yield* makeQueryPacket({
            summary: "The question did not match one of the supported deterministic query shapes.",
            citations: A.empty(),
            notes: A.make(value.reason),
          });

          return new GroundedQueryResult({
            answer: `Unsupported query shape. ${value.reason}`,
            citations: A.empty(),
            packet,
          });
        }),
    });
    const enrichedResult = withSemanticOverlay(result, semanticArtifacts);

    const outcome = queryResultOutcome(interpretation, enrichedResult);
    yield* Effect.annotateCurrentSpan({
      query_kind: queryKind,
      query_outcome: outcome,
      citation_count: A.length(enrichedResult.citations),
      retrieval_packet_citation_count: A.length(enrichedResult.packet.citations),
      retrieval_note_count: A.length(enrichedResult.packet.notes),
    });
    yield* recordQueryResult(queryKind, outcome, A.length(enrichedResult.citations));

    return enrichedResult;
  });

  return GroundedRetrievalService.of({ resolve });
});
