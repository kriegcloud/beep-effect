import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  Citation,
  type QueryRepoRunInput,
  type RepoDocumentedParameter,
  type RepoDocumentedReturn,
  type RepoDocumentedThrow,
  type RepoId,
  type RepoImportEdge,
  type RepoSemanticArtifacts,
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
import { DateTime, Effect, Layer, Order, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  type QueryKindMetric,
  recordQueryInterpretation,
  recordQueryResult,
} from "../telemetry/RepoMemoryTelemetry.js";

const $I = $RepoMemoryRuntimeId.create("retrieval/GroundedRetrieval");
const decodePosInt = S.decodeUnknownSync(PosInt);
const repoSemanticNamespace = "urn:beep:repo-memory:semantic#";
const semanticFilePathPredicate = `${repoSemanticNamespace}filePath`;
const semanticImportsFilePredicate = `${repoSemanticNamespace}importsFile`;
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

const normalizeQuestion = (question: string): string => pipe(question, Str.trim, Str.replace(/\s+/g, " "));

const firstCapture = (pattern: RegExp, input: string): O.Option<string> =>
  (() => {
    const match = pattern.exec(input);
    return match === null ? O.none() : pipe(match, A.get(1), O.map(Str.trim));
  })();

const extractBacktickValue = (question: string): O.Option<string> => firstCapture(/`([^`]+)`/, question);

const extractSymbolName = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => {
      return firstCapture(
        /(?:locate|find|where is|where's|describe|what is|docs for|documentation for|params of|parameters of|returns of|throws of|deprecated)\s+(?:the\s+)?(?:symbol\s+)?([A-Za-z_$][A-Za-z0-9_$]*)/i,
        question
      );
    }),
    O.filter(Str.isNonEmpty)
  );

const extractFileQuery = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.filter((value) => /\.[cm]?tsx?$/.test(value)),
    O.orElse(() => firstCapture(/([A-Za-z0-9_./-]+\.[cm]?tsx?)/i, question))
  );

const extractModuleQuery = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => firstCapture(/(?:who|what)\s+imports?\s+([A-Za-z0-9_./@-]+)/i, question)),
    O.filter(Str.isNonEmpty)
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
      extractFileQuery(normalized),
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
      extractFileQuery(normalized),
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
      "This v0 deterministic query path currently supports countFiles, countSymbols, locateSymbol, describeSymbol, symbolParams, symbolReturns, symbolThrows, symbolDeprecation, listFileExports, listFileImports, listFileImporters, and keywordSearch only.",
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
        notes: A.append(options.notes, `sourceSnapshotId=${options.sourceSnapshotId}`),
      })
  );

const normalizeFileQuery = (query: string): ReadonlyArray<string> => {
  const normalized = Str.toLowerCase(Str.trim(query));
  const basename = pipe(
    normalized,
    Str.split("/"),
    A.last,
    O.getOrElse(() => normalized)
  );
  const withoutExtension = pipe(normalized, Str.replace(/\.[cm]?tsx?$/i, ""));
  const basenameWithoutExtension = pipe(
    withoutExtension,
    Str.split("/"),
    A.last,
    O.getOrElse(() => withoutExtension)
  );

  return pipe(
    A.make(normalized, basename, withoutExtension, basenameWithoutExtension),
    A.filter(Str.isNonEmpty),
    A.dedupe
  );
};

const matchesFileQuery = (query: string, filePath: string): boolean => {
  const normalizedFilePath = Str.toLowerCase(filePath);
  return A.some(
    normalizeFileQuery(query),
    (candidate) => normalizedFilePath === candidate || pipe(normalizedFilePath, Str.endsWith(`/${candidate}`))
  );
};

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

  const citationIds = new Set(
    pipe(
      citations,
      A.map((citation) => citation.id)
    )
  );
  return pipe(
    semanticArtifacts.value.evidenceAnchors,
    A.filter(
      (anchor) =>
        O.isSome(anchor.note) &&
        pipe(anchor.note.value, Str.startsWith("citationId=")) &&
        citationIds.has(pipe(anchor.note.value, Str.slice("citationId=".length)))
    ),
    A.length
  );
};

const semanticImporterFilePaths = (
  semanticArtifacts: O.Option<RepoSemanticArtifacts>,
  query: string
): ReadonlyArray<string> => {
  if (O.isNone(semanticArtifacts)) {
    return A.empty();
  }

  const nodeToFilePath = new Map<string, string>();
  const importerFiles = new Set<string>();

  for (const quad of semanticArtifacts.value.dataset.quads) {
    if (quad.predicate.value === semanticFilePathPredicate && quad.object.termType === "Literal") {
      nodeToFilePath.set(quad.subject.value, quad.object.value);
    }
  }

  const targetNodes = new Set(
    pipe(
      A.fromIterable(nodeToFilePath.entries()),
      A.filter(([, filePath]) => matchesFileQuery(query, filePath)),
      A.map(([node]) => node)
    )
  );

  if (targetNodes.size === 0) {
    return A.empty();
  }

  for (const quad of semanticArtifacts.value.dataset.quads) {
    if (quad.predicate.value !== semanticImportsFilePredicate || quad.object.termType !== "NamedNode") {
      continue;
    }

    if (!targetNodes.has(quad.object.value)) {
      continue;
    }

    const importerFilePath = nodeToFilePath.get(quad.subject.value);
    if (importerFilePath !== undefined) {
      importerFiles.add(importerFilePath);
    }
  }

  return pipe(A.fromIterable(importerFiles), A.sort(Order.String));
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

const exactOrSearchMatches = (store: GroundedRetrievalStoreShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("GroundedRetrieval.exactOrSearchMatches")(function* (symbolName: string) {
    const exactMatches = yield* mapStoreError(store.findSymbolsByExactName(repoId, sourceSnapshotId, symbolName));
    return A.isReadonlyArrayNonEmpty(exactMatches)
      ? exactMatches
      : yield* mapStoreError(store.searchSymbols(repoId, sourceSnapshotId, symbolName, 5));
  });

const normalizeModuleSpecifierQuery = (query: string): ReadonlyArray<string> => {
  const normalized = Str.toLowerCase(Str.trim(query));
  const withoutExtension = pipe(normalized, Str.replace(/\.[cm]?tsx?$/i, ""));
  const basename = pipe(
    normalized,
    Str.split("/"),
    A.last,
    O.getOrElse(() => normalized)
  );
  const basenameWithoutExtension = pipe(
    withoutExtension,
    Str.split("/"),
    A.last,
    O.getOrElse(() => withoutExtension)
  );

  return pipe(
    A.make(normalized, withoutExtension, basename, basenameWithoutExtension),
    A.filter(Str.isNonEmpty),
    A.dedupe
  );
};

const matchesModuleSpecifier = (query: string, edge: RepoImportEdge): boolean => {
  const normalizedSpecifier = Str.toLowerCase(edge.moduleSpecifier);

  return A.some(
    normalizeModuleSpecifierQuery(query),
    (candidate) => normalizedSpecifier === candidate || pipe(normalizedSpecifier, Str.endsWith(`/${candidate}`))
  );
};

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
    const findMatches = exactOrSearchMatches(store, payload.repoId, sourceSnapshotId);

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
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
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
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
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
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);
          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("locateSymbol=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }
          const symbol = maybeSymbol.value;

          const citations = normalizeCitations(A.make(symbolCitation(symbol)));
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Located symbol "${symbol.symbolName}" from indexed symbol records.`,
            citations,
            notes: A.make(`symbolId=${symbol.symbolId}`),
          });

          return new GroundedQueryResult({
            answer: `Symbol "${symbol.symbolName}" is declared in ${symbol.filePath} on lines ${symbol.startLine}-${symbol.endLine}.`,
            citations,
            packet,
          });
        }),
      describeSymbol: (value) =>
        Effect.gen(function* () {
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);
          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("describeSymbol=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }
          const symbol = maybeSymbol.value;

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
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: O.isSome(symbol.documentation)
              ? `Described symbol "${symbol.symbolName}" from its indexed declaration and JSDoc semantics.`
              : `Described symbol "${symbol.symbolName}" from its indexed declaration because no JSDoc semantics were captured.`,
            citations,
            notes: A.make(`signature=${symbol.signature}`, `documentation=${O.isSome(symbol.documentation)}`),
          });

          return new GroundedQueryResult({
            answer: `Symbol "${symbol.symbolName}" is a ${symbol.symbolKind}. Signature: ${symbol.signature}. ${documentationText}`,
            citations,
            packet,
          });
        }),
      symbolParams: (value) =>
        Effect.gen(function* () {
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);

          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("symbolParams=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }

          const symbol = maybeSymbol.value;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.make("symbolParams=no-documentation"),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Returned documented parameters for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.make(`paramCount=${A.length(documentation.params)}`),
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
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);

          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("symbolReturns=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }

          const symbol = maybeSymbol.value;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.make("symbolReturns=no-documentation"),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Returned documented return semantics for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.make(`hasReturns=${O.isSome(documentation.returns)}`),
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
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);

          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("symbolThrows=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }

          const symbol = maybeSymbol.value;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.make("symbolThrows=no-documentation"),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Returned documented throw semantics for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.make(`throwCount=${A.length(documentation.throws)}`),
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
          const matches = yield* findMatches(value.symbolName);
          const maybeSymbol = A.head(matches);

          if (O.isNone(maybeSymbol)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed symbol matched "${value.symbolName}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("symbolDeprecation=no-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed symbol named "${value.symbolName}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }

          const symbol = maybeSymbol.value;

          if (O.isNone(symbol.documentation)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No JSDoc-backed documentation was indexed for symbol "${symbol.symbolName}".`,
              citations: A.empty(),
              notes: A.make("symbolDeprecation=no-documentation"),
            });

            return new GroundedQueryResult({
              answer: `No indexed JSDoc-backed documentation was found for "${symbol.symbolName}".`,
              citations: A.empty(),
              packet,
            });
          }

          const documentation = symbol.documentation.value;
          const citations = documentationCitations(symbol);
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Returned deprecation documentation for symbol "${symbol.symbolName}".`,
            citations,
            notes: A.make(`deprecated=${documentation.isDeprecated}`),
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
          const files = yield* mapStoreError(
            store.findSourceFiles(payload.repoId, sourceSnapshotId, value.fileQuery, 5)
          );
          const maybeFile = A.head(files);

          if (O.isNone(maybeFile)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("listFileExports=no-file-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed TypeScript file matching "${value.fileQuery}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }
          const file = maybeFile.value;

          const symbols = yield* mapStoreError(
            store.listExportedSymbolsForFile(payload.repoId, sourceSnapshotId, file.filePath)
          );
          const citations = normalizeCitations(pipe(symbols, A.map(symbolCitation)));
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Listed exported symbols for ${file.filePath}.`,
            citations,
            notes: A.make(`filePath=${file.filePath}`, `exportCount=${A.length(symbols)}`),
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
          const files = yield* mapStoreError(
            store.findSourceFiles(payload.repoId, sourceSnapshotId, value.fileQuery, 5)
          );
          const maybeFile = A.head(files);

          if (O.isNone(maybeFile)) {
            const packet = yield* makePacket({
              repoId: payload.repoId,
              sourceSnapshotId,
              query: payload.question,
              summary: `No indexed file matched "${value.fileQuery}" in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              notes: A.make("listFileImports=no-file-match"),
            });

            return new GroundedQueryResult({
              answer: `No indexed TypeScript file matching "${value.fileQuery}" was found in snapshot ${sourceSnapshotId}.`,
              citations: A.empty(),
              packet,
            });
          }
          const file = maybeFile.value;

          const importEdges = yield* mapStoreError(store.listImportEdges(payload.repoId, sourceSnapshotId));
          const matchingEdges = pipe(
            importEdges,
            A.filter((edge) => edge.importerFilePath === file.filePath)
          );
          const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
          const importedModules = pipe(
            matchingEdges,
            A.map((edge) => edge.moduleSpecifier),
            A.dedupe
          );
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Listed import declarations captured for ${file.filePath}.`,
            citations,
            notes: A.make(`filePath=${file.filePath}`, `importCount=${A.length(matchingEdges)}`),
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
      listFileImporters: (value) =>
        Effect.gen(function* () {
          const importEdges = yield* mapStoreError(store.listImportEdges(payload.repoId, sourceSnapshotId));
          const semanticImporterMatches = semanticImporterFilePaths(semanticArtifacts, value.moduleQuery);
          const matchingEdges = pipe(
            importEdges,
            A.filter(
              (edge) =>
                matchesModuleSpecifier(value.moduleQuery, edge) ||
                A.contains(semanticImporterMatches, edge.importerFilePath)
            )
          );
          const citations = normalizeCitations(pipe(matchingEdges, A.map(importEdgeCitation)));
          const importerFiles = pipe(
            matchingEdges,
            A.map((edge) => edge.importerFilePath),
            A.sort(Order.String),
            A.dedupe
          );
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Listed files importing "${value.moduleQuery}" from captured import edges.`,
            citations,
            notes: A.make(
              `moduleQuery=${value.moduleQuery}`,
              `importerCount=${A.length(importerFiles)}`,
              `semanticImporterMatches=${A.length(semanticImporterMatches)}`
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
          const matches = yield* mapStoreError(store.searchSymbols(payload.repoId, sourceSnapshotId, value.query, 5));
          const citations = normalizeCitations(pipe(matches, A.map(symbolCitation)));
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Keyword search over indexed symbols using "${value.query}".`,
            citations,
            notes: A.make(`matchCount=${A.length(matches)}`),
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
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
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
