import { $RepoMemoryServerId } from "@beep/identity/packages";
import {
  Citation,
  type QueryRepoRunInput,
  type RepoId,
  type RepoImportEdge,
  type RepoSymbolRecord,
  RetrievalPacket,
  type SourceSnapshotId,
} from "@beep/repo-memory-domain";
import {
  LocalRepoMemoryDriver,
  type LocalRepoMemoryDriverError,
  type LocalRepoMemoryDriverShape,
} from "@beep/repo-memory-drivers-local";
import { PosInt, TaggedErrorClass } from "@beep/schema";
import { DateTime, Effect, Layer, Order, pipe, ServiceMap, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type QueryKindMetric, recordQueryInterpretation, recordQueryResult } from "./RepoMemoryMetrics.js";

const $I = $RepoMemoryServerId.create("internal/GroundedRetrieval");
const decodePosInt = S.decodeUnknownSync(PosInt);
const citationOrder = Order.mapInput(
  Order.String,
  (citation: Citation) => `${citation.span.filePath}:${citation.span.startLine}:${citation.label}:${citation.id}`
);
const isNonEmptyString = (value: string): boolean => Str.length(value) > 0;

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

const QueryInterpretation = S.Union([
  CountFilesInterpretation,
  CountSymbolsInterpretation,
  LocateSymbolInterpretation,
  DescribeSymbolInterpretation,
  ListFileExportsInterpretation,
  ListFileImportsInterpretation,
  ListFileImportersInterpretation,
  KeywordSearchInterpretation,
  UnsupportedQueryInterpretation,
]).pipe(S.toTaggedUnion("kind"));

type QueryInterpretation = typeof QueryInterpretation.Type;

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

export class GroundedRetrievalError extends TaggedErrorClass<GroundedRetrievalError>($I`GroundedRetrievalError`)(
  "GroundedRetrievalError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("GroundedRetrievalError", {
    description: "Typed error raised while resolving a bounded deterministic grounded query.",
  })
) {}

export interface GroundedRetrievalServiceShape {
  readonly resolve: (payload: QueryRepoRunInput) => Effect.Effect<GroundedQueryResult, GroundedRetrievalError>;
}

export class GroundedRetrievalService extends ServiceMap.Service<
  GroundedRetrievalService,
  GroundedRetrievalServiceShape
>()($I`GroundedRetrievalService`) {
  static readonly layer: Layer.Layer<GroundedRetrievalService, never, LocalRepoMemoryDriver> = Layer.effect(
    GroundedRetrievalService,
    Effect.suspend(() => makeGroundedRetrievalService()).pipe(
      Effect.withSpan("GroundedRetrievalService.make"),
      Effect.annotateLogs({ component: "grounded-retrieval" })
    )
  );
}

const toRetrievalError = (message: string, status: number, cause?: unknown): GroundedRetrievalError =>
  new GroundedRetrievalError({
    message,
    status,
    cause: O.fromUndefinedOr(cause),
  });

const mapDriverError = <A>(effect: Effect.Effect<A, LocalRepoMemoryDriverError>) =>
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
        /(?:locate|find|where is|where's|describe|what is)\s+(?:the\s+)?(?:symbol\s+)?([A-Za-z_$][A-Za-z0-9_$]*)/i,
        question
      );
    }),
    O.filter(isNonEmptyString)
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
    O.filter(isNonEmptyString)
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

  if (contains("describe") || contains("what is")) {
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
      "This v0 deterministic query path currently supports countFiles, countSymbols, locateSymbol, describeSymbol, listFileExports, listFileImports, listFileImporters, and keywordSearch only.",
  });
};

const latestSnapshotForRepo = (driver: LocalRepoMemoryDriverShape) =>
  Effect.fn("GroundedRetrieval.latestSnapshotForRepo")(function* (
    repoId: RepoId
  ): Effect.fn.Return<SourceSnapshotId, GroundedRetrievalError> {
    const latestSnapshot = yield* mapDriverError(driver.latestSourceSnapshot(repoId));

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

const normalizeCitations = (citations: ReadonlyArray<Citation>): ReadonlyArray<Citation> =>
  pipe(
    citations,
    A.sort(citationOrder),
    A.dedupeWith((left, right) => left.id === right.id)
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

const exactOrSearchMatches = (driver: LocalRepoMemoryDriverShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("GroundedRetrieval.exactOrSearchMatches")(function* (symbolName: string) {
    const exactMatches = yield* mapDriverError(driver.findSymbolsByExactName(repoId, sourceSnapshotId, symbolName));
    return A.isReadonlyArrayNonEmpty(exactMatches)
      ? exactMatches
      : yield* mapDriverError(driver.searchSymbols(repoId, sourceSnapshotId, symbolName, 5));
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
    A.filter(isNonEmptyString),
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
  const driver = yield* LocalRepoMemoryDriver;
  const latestSnapshot = latestSnapshotForRepo(driver);

  const resolve: GroundedRetrievalServiceShape["resolve"] = Effect.fn("GroundedRetrieval.resolve")(function* (payload) {
    const sourceSnapshotId = yield* latestSnapshot(payload.repoId);
    const interpretation = interpretQuery(payload.question);
    const queryKind = toQueryKindMetric(interpretation);
    const findMatches = exactOrSearchMatches(driver, payload.repoId, sourceSnapshotId);

    yield* Effect.annotateCurrentSpan({
      repo_id: payload.repoId,
      source_snapshot_id: sourceSnapshotId,
      query_kind: queryKind,
    });
    yield* recordQueryInterpretation(queryKind);

    const result = yield* QueryInterpretation.match(interpretation, {
      countFiles: () =>
        Effect.gen(function* () {
          const fileCount = yield* mapDriverError(driver.countSourceFiles(payload.repoId, sourceSnapshotId));
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
          const symbolCount = yield* mapDriverError(driver.listSymbolRecords(payload.repoId, sourceSnapshotId)).pipe(
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

          const citations = normalizeCitations(A.make(symbolCitation(symbol)));
          const jsDocText = pipe(
            symbol.jsDocSummary,
            O.getOrElse(() => "No JSDoc summary is available.")
          );
          const packet = yield* makePacket({
            repoId: payload.repoId,
            sourceSnapshotId,
            query: payload.question,
            summary: `Described symbol "${symbol.symbolName}" from its indexed declaration and JSDoc summary.`,
            citations,
            notes: A.make(`signature=${symbol.signature}`),
          });

          return new GroundedQueryResult({
            answer: `Symbol "${symbol.symbolName}" is a ${symbol.symbolKind}. Signature: ${symbol.signature}. ${jsDocText}`,
            citations,
            packet,
          });
        }),
      listFileExports: (value) =>
        Effect.gen(function* () {
          const files = yield* mapDriverError(
            driver.findSourceFiles(payload.repoId, sourceSnapshotId, value.fileQuery, 5)
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

          const symbols = yield* mapDriverError(
            driver.listExportedSymbolsForFile(payload.repoId, sourceSnapshotId, file.filePath)
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
          const files = yield* mapDriverError(
            driver.findSourceFiles(payload.repoId, sourceSnapshotId, value.fileQuery, 5)
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

          const importEdges = yield* mapDriverError(driver.listImportEdges(payload.repoId, sourceSnapshotId));
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
          const importEdges = yield* mapDriverError(driver.listImportEdges(payload.repoId, sourceSnapshotId));
          const matchingEdges = pipe(
            importEdges,
            A.filter((edge) => matchesModuleSpecifier(value.moduleQuery, edge))
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
            notes: A.make(`moduleQuery=${value.moduleQuery}`, `importerCount=${A.length(importerFiles)}`),
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
          const matches = yield* mapDriverError(driver.searchSymbols(payload.repoId, sourceSnapshotId, value.query, 5));
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

    const outcome = queryResultOutcome(interpretation, result);
    yield* Effect.annotateCurrentSpan({
      query_kind: queryKind,
      query_outcome: outcome,
      citation_count: A.length(result.citations),
      retrieval_packet_citation_count: A.length(result.packet.citations),
      retrieval_note_count: A.length(result.packet.notes),
    });
    yield* recordQueryResult(queryKind, outcome, A.length(result.citations));

    return result;
  });

  return GroundedRetrievalService.of({ resolve });
});
