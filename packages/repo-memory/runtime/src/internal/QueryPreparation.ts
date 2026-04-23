/**
 * Query normalization and deterministic candidate selection for grounded retrieval.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import { IdentifierText, PathText, QueryText, VariantText } from "@beep/nlp";
import {
  type RepoId,
  type RepoImportEdge,
  type RepoSourceFile,
  type RepoSymbolRecord,
  RetrievalQueryKind,
  type SourceSnapshotId,
} from "@beep/repo-memory-model";
import type { RepoSnapshotStoreShape, RepoStoreError, RepoSymbolStoreShape } from "@beep/repo-memory-store";
import * as Str from "@beep/utils/Str";
import { Effect, flow, Order, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("retrieval/QueryPreparation");

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

class ListSymbolImportersInterpretation extends S.Class<ListSymbolImportersInterpretation>(
  $I`ListSymbolImportersInterpretation`
)(
  {
    kind: S.tag("listSymbolImporters"),
    symbolName: S.String,
  },
  $I.annote("ListSymbolImportersInterpretation", {
    description: "Deterministic query interpretation that lists files importing one concrete symbol.",
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
 * @example
 * ```ts
 * import { QueryInterpretation } from "../../src/internal/QueryPreparation.js"
 *
 * const schema = QueryInterpretation
 * ```
 *
 * @since 0.0.0
 * @category domain model
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
  ListSymbolImportersInterpretation,
  ListFileDependenciesInterpretation,
  ListFileDependentsInterpretation,
  KeywordSearchInterpretation,
  UnsupportedQueryInterpretation,
]).pipe(S.toTaggedUnion("kind"));

/**
 * Runtime type for `QueryInterpretation`.
 *
 * @example
 * ```ts
 * import type { QueryInterpretation } from "../../src/internal/QueryPreparation.js"
 *
 * const interpretation: QueryInterpretation = {
 *   kind: "unsupported",
 *   reason: "out of scope"
 * }
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export type QueryInterpretation = typeof QueryInterpretation.Type;

/**
 * Prepared grounded-question artifact produced before retrieval starts.
 *
 * @example
 * ```ts
 * import { GroundedQuestionPreparation } from "../../src/internal/QueryPreparation.js"
 *
 * const schema = GroundedQuestionPreparation
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class GroundedQuestionPreparation extends S.Class<GroundedQuestionPreparation>($I`GroundedQuestionPreparation`)(
  {
    normalizedQuery: S.String,
    interpretation: QueryInterpretation,
    queryKind: RetrievalQueryKind,
    questionNotes: S.Array(S.String),
  },
  $I.annote("GroundedQuestionPreparation", {
    description: "Normalized query-preparation result for the bounded grounded repo question path.",
  })
) {}

/**
 * Internal selection result before one candidate or ambiguity posture is chosen.
 *
 * @since 0.0.0
 * @category domain model
 */
type MatchSelection<A> = {
  readonly matches: ReadonlyArray<A>;
  readonly nlpNotes: ReadonlyArray<string>;
};

/**
 * Internal single-versus-ambiguous selection view built from `MatchSelection`.
 *
 * @since 0.0.0
 * @category domain model
 */
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

/**
 * Store requirements for bounded query preparation over indexed artifacts.
 *
 * @example
 * ```ts
 * import type { QueryPreparationStoreShape } from "../../src/internal/QueryPreparation.js"
 *
 * const methods = [
 *   "findSourceFiles",
 *   "findSymbolsByExactName",
 *   "searchSymbols"
 * ] satisfies ReadonlyArray<keyof QueryPreparationStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export type QueryPreparationStoreShape = Pick<RepoSnapshotStoreShape, "findSourceFiles"> &
  Pick<RepoSymbolStoreShape, "findSymbolsByExactName" | "searchSymbols">;

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

const emptyMatchSelection = <A>(): MatchSelection<A> => ({
  matches: A.empty(),
  nlpNotes: A.empty(),
});

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
  /importers of\s+([A-Za-z0-9_./@-]+)/i
);
const symbolImporterQueryPatterns = A.make(
  /(?:who|which\s+files?)\s+(?:use|uses)\s+(?:the\s+)?(?:symbol\s+)?(.+)$/i,
  /(?:where is|where's)\s+(?:the\s+)?(?:symbol\s+)?(.+)\s+used[!?.,;:]*$/i,
  /(?:usage of|usages of)\s+(?:the\s+)?(?:symbol\s+)?(.+)$/i,
  /(?:who|which\s+files?)\s+imports?\s+(?:the\s+)?symbol\s+(.+)$/i,
  /symbol importers of\s+(?:the\s+)?(?:symbol\s+)?(.+)$/i
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

const normalizeSymbolQuery = (query: string): O.Option<string> =>
  pipe(
    O.some(QueryText.normalizePhrase(query)),
    O.filter((phrase) => {
      const tokenized = IdentifierText.tokens(phrase);
      return A.isReadonlyArrayNonEmpty(tokenized) && tokenized.length <= 6 && !/[/.\\]/.test(phrase);
    })
  );

const extractSymbolName = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() =>
      firstCapture(
        /(?:locate|find|where is|where's|describe|what is|docs for|documentation for|params of|parameters of|returns of|throws of|deprecated)\s+(?:the\s+)?(?:symbol\s+)?(.+)$/i,
        question
      )
    ),
    O.flatMap(normalizeSymbolQuery)
  );

const extractModuleQuery = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => firstCaptureFrom(moduleQueryPatterns, question)),
    O.map(PathText.normalizePathPhrase),
    O.filter(PathText.isPathLike)
  );

const extractSymbolImporterQuery = (question: string): O.Option<string> =>
  pipe(
    extractBacktickValue(question),
    O.orElse(() => firstCaptureFrom(symbolImporterQueryPatterns, question)),
    O.flatMap(normalizeSymbolQuery)
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

  if (
    contains("who uses") ||
    contains("which file uses") ||
    contains("which files use") ||
    (contains("where is") && contains(" used")) ||
    contains("usage of") ||
    contains("usages of") ||
    contains("imports symbol") ||
    contains("symbol importers")
  ) {
    return pipe(
      extractSymbolImporterQuery(normalized),
      O.match({
        onNone: () =>
          new UnsupportedQueryInterpretation({
            reason:
              "Symbol-usage queries currently require one concrete symbol name, preferably enclosed in backticks.",
          }),
        onSome: (symbolName) => new ListSymbolImportersInterpretation({ symbolName }),
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

  // An explicit "search"/"keyword" prefix intentionally wins over symbol-intent
  // verbs in the remainder of the question so free-text lookup stays bounded.
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
      "This v0 deterministic query path currently supports countFiles, countSymbols, locateSymbol, describeSymbol, symbolParams, symbolReturns, symbolThrows, symbolDeprecation, listFileExports, listFileImports, listFileImporters, listSymbolImporters, listFileDependencies, listFileDependents, and keywordSearch only.",
  });
};

const nlpQuestionNotes = (question: string): ReadonlyArray<string> => {
  const normalized = normalizeQuestion(question);

  return normalized === question ? A.empty() : A.make(`nlp:normalized-question=${normalized}`);
};

const stripTypeScriptExtension: (input: string) => string = flow(Str.replace(/\.[cm]?tsx?$/i, ""));

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

const rankImporterMatch = (moduleSpecifier: string, variant: string): O.Option<RankedImporterHit["strategy"]> => {
  const normalizedSpecifier = Str.toLowerCase(PathText.normalizePathPhrase(moduleSpecifier));
  const normalizedVariant = Str.toLowerCase(PathText.normalizePathPhrase(variant));

  if (normalizedSpecifier === normalizedVariant) {
    return O.some("module-exact");
  }

  return pipe(normalizedSpecifier, Str.endsWith(`/${normalizedVariant}`)) ? O.some("module-suffix") : O.none();
};

/**
 * Normalize and interpret a grounded repo question without touching durable state.
 *
 * @example
 * ```ts
 * import { prepareGroundedQuery } from "../../src/internal/QueryPreparation.js"
 *
 * const prepared = prepareGroundedQuery("where is RepoRunService defined?")
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const prepareGroundedQuery = (question: string): GroundedQuestionPreparation => {
  const normalizedQuery = normalizeQuestion(question);
  const interpretation = interpretQuery(question);

  return new GroundedQuestionPreparation({
    normalizedQuery,
    interpretation,
    queryKind: interpretation.kind,
    questionNotes: nlpQuestionNotes(question),
  });
};

/**
 * Collapse a candidate selection into none, one, or ambiguous posture.
 *
 * @example
 * ```ts
 * import { selectSingleMatch } from "../../src/internal/QueryPreparation.js"
 *
 * const selection = selectSingleMatch({
 *   matches: ["RepoRunService"],
 *   nlpNotes: []
 * })
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const selectSingleMatch = <A>(selection: MatchSelection<A>): SingleMatchSelection<A> => {
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

/**
 * Resolve a symbol query into bounded deterministic candidate matches.
 *
 * @example
 * ```ts
 * import { findSymbolMatches } from "../../src/internal/QueryPreparation.js"
 *
 * const findSymbols = findSymbolMatches
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const findSymbolMatches: {
  (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): (
    store: QueryPreparationStoreShape
  ) => (symbolName: string) => Effect.Effect<MatchSelection<RepoSymbolRecord>, RepoStoreError>;
  (
    store: QueryPreparationStoreShape,
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): (symbolName: string) => Effect.Effect<MatchSelection<RepoSymbolRecord>, RepoStoreError>;
} = dual(3, (store: QueryPreparationStoreShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("QueryPreparation.findSymbolMatches")(function* (
    symbolName: string
  ): Effect.fn.Return<MatchSelection<RepoSymbolRecord>, RepoStoreError> {
    const variants = IdentifierText.variants(symbolName);
    const rawVariant = QueryText.normalizePhrase(symbolName);

    for (const [variantIndex, variant] of variants.entries()) {
      const exactMatches = yield* store.findSymbolsByExactName(repoId, sourceSnapshotId, variant);

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
      const matches = yield* store.searchSymbols(repoId, sourceSnapshotId, variant, 5);
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
      return emptyMatchSelection();
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
  })
);

/**
 * Resolve a file query into bounded deterministic candidate matches.
 *
 * @example
 * ```ts
 * import { resolveFileCandidates } from "../../src/internal/QueryPreparation.js"
 *
 * const resolveFiles = resolveFileCandidates
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const resolveFileCandidates = (store: QueryPreparationStoreShape) =>
  Effect.fn("QueryPreparation.resolveFileCandidates")(function* (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId,
    fileQuery: string
  ): Effect.fn.Return<MatchSelection<RepoSourceFile>, RepoStoreError> {
    const variants = PathText.filePathVariants(fileQuery);
    const rawVariant = PathText.normalizePathPhrase(fileQuery);
    let rankedHits = A.empty<RankedFileHit>();

    for (const [variantIndex, variant] of variants.entries()) {
      const files = yield* store.findSourceFiles(repoId, sourceSnapshotId, variant, 5);
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
      return emptyMatchSelection();
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

/**
 * Select bounded importer candidates for a normalized module query.
 *
 * @example
 * ```ts
 * import { selectImporterEdges } from "../../src/internal/QueryPreparation.js"
 *
 * const selection = selectImporterEdges("@beep/repo-memory-runtime", [])
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const selectImporterEdges: {
  (importEdges: ReadonlyArray<RepoImportEdge>): (moduleQuery: string) => MatchSelection<RepoImportEdge>;
  (moduleQuery: string, importEdges: ReadonlyArray<RepoImportEdge>): MatchSelection<RepoImportEdge>;
} = dual(2, (moduleQuery: string, importEdges: ReadonlyArray<RepoImportEdge>): MatchSelection<RepoImportEdge> => {
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
    return emptyMatchSelection();
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
});

/**
 * Search keyword candidates with bounded variant expansion and stable ranking.
 *
 * @example
 * ```ts
 * import { searchKeywordMatches } from "../../src/internal/QueryPreparation.js"
 *
 * const searchKeywords = searchKeywordMatches
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const searchKeywordMatches: {
  (
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): (
    store: QueryPreparationStoreShape
  ) => (query: string) => Effect.Effect<MatchSelection<RepoSymbolRecord>, RepoStoreError>;
  (
    store: QueryPreparationStoreShape,
    repoId: RepoId,
    sourceSnapshotId: SourceSnapshotId
  ): (query: string) => Effect.Effect<MatchSelection<RepoSymbolRecord>, RepoStoreError>;
} = dual(3, (store: QueryPreparationStoreShape, repoId: RepoId, sourceSnapshotId: SourceSnapshotId) =>
  Effect.fn("QueryPreparation.searchKeywordMatches")(function* (
    query: string
  ): Effect.fn.Return<MatchSelection<RepoSymbolRecord>, RepoStoreError> {
    const variants = IdentifierText.variants(query);
    const rawVariant = QueryText.normalizePhrase(query);
    let rankedHits = A.empty<RankedSymbolHit>();

    for (const [variantIndex, variant] of variants.entries()) {
      const matches = yield* store.searchSymbols(repoId, sourceSnapshotId, variant, 5);
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
      return emptyMatchSelection();
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
  })
);
