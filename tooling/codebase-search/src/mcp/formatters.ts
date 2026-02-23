/**
 * Shared MCP response formatters and output helpers.
 *
 * @since 0.0.0
 * @module
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum signature length for MCP tool output.
 *
 * @since 0.0.0
 * @category constants
 */
export const MCP_SIGNATURE_MAX_LENGTH = 200;

/**
 * Maximum signature length for hook context injection.
 *
 * @since 0.0.0
 * @category constants
 */
export const HOOK_SIGNATURE_MAX_LENGTH = 120;

// ---------------------------------------------------------------------------
// Signature Truncation
// ---------------------------------------------------------------------------

/**
 * Truncate a signature string to a maximum length.
 *
 * @param signature signature parameter value.
 * @param maxLength maxLength parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const truncateSignature = (signature: string, maxLength: number): string => {
  if (Str.length(signature) <= maxLength) {
    return signature;
  }
  return `${signature.slice(0, maxLength - 3)}...`;
};

// ---------------------------------------------------------------------------
// SymbolId Parsing
// ---------------------------------------------------------------------------

/**
 * Parsed components extracted from a symbol ID string.
 *
 * @since 0.0.0
 * @category types
 */
export interface ParsedSymbolId {
  readonly name: string;
  readonly package: string;
  readonly module: string;
  readonly fullPath: string;
}

/**
 * Parse a symbol ID into package/module/name components.
 *
 * @param symbolId symbolId parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const parseSymbolId = (symbolId: string): ParsedSymbolId => {
  const parts = A.fromIterable(symbolId.split("/"));
  const len = A.length(parts);

  const name = pipe(
    A.get(parts, len - 1),
    O.getOrElse(() => symbolId)
  );

  if (len >= 4 && symbolId.startsWith("@")) {
    const pkg = pipe([A.get(parts, 0), A.get(parts, 1)], A.getSomes, A.join("/"));
    const mod = pipe(parts, A.drop(2), A.dropRight(1), A.join("/"));
    return { name, package: pkg, module: mod, fullPath: symbolId };
  }

  if (len >= 3) {
    const pkg = pipe(
      A.get(parts, 0),
      O.getOrElse(() => "")
    );
    const mod = pipe(parts, A.drop(1), A.dropRight(1), A.join("/"));
    return { name, package: pkg, module: mod, fullPath: symbolId };
  }

  if (len === 2) {
    const mod = pipe(
      A.get(parts, 0),
      O.getOrElse(() => "")
    );
    return { name, package: "", module: mod, fullPath: symbolId };
  }

  return { name, package: "", module: "", fullPath: symbolId };
};

// ---------------------------------------------------------------------------
// search_codebase Result Formatting
// ---------------------------------------------------------------------------

/**
 * Raw hybrid search result with optional symbol metadata attached.
 *
 * @since 0.0.0
 * @category types
 */
export interface RawSearchResult {
  readonly symbolId: string;
  readonly score: number;
  readonly vectorRank: number | null;
  readonly keywordRank: number | null;
  readonly name?: string | undefined;
  readonly kind?: string | undefined;
  readonly package?: string | undefined;
  readonly module?: string | undefined;
  readonly filePath?: string | undefined;
  readonly startLine?: number | undefined;
  readonly description?: string | undefined;
  readonly signature?: string | undefined;
}

/**
 * One formatted search result row.
 *
 * @since 0.0.0
 * @category types
 */
export interface SearchResultRow {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly package: string;
  readonly module: string;
  readonly filePath: string;
  readonly startLine: number;
  readonly description: string;
  readonly signature: string;
  readonly score: number;
  readonly vectorRank: number | null;
  readonly keywordRank: number | null;
}

/**
 * Formatted search response payload.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedSearchResult {
  readonly results: ReadonlyArray<SearchResultRow>;
  readonly totalMatches: number;
  readonly searchMode: "hybrid" | "vector" | "keyword";
  readonly filtersApplied: {
    readonly kind: string | null;
    readonly package: string | null;
  };
}

/**
 * Format search results for the `search_codebase` MCP tool.
 *
 * @param results results parameter value.
 * @param filters filters parameter value.
 * @param filters.kind kind field value.
 * @param filters.package package field value.
 * @param searchMode searchMode parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatSearchResults = (
  results: ReadonlyArray<RawSearchResult>,
  filters: { readonly kind: string | null; readonly package: string | null },
  searchMode: "hybrid" | "vector" | "keyword" = "hybrid"
): FormattedSearchResult => {
  const rows = pipe(
    results,
    A.map((result): SearchResultRow => {
      const parsed = parseSymbolId(result.symbolId);
      return {
        id: result.symbolId,
        name: result.name ?? parsed.name,
        kind: result.kind ?? "unknown",
        package: result.package ?? parsed.package,
        module: result.module ?? parsed.module,
        filePath: result.filePath ?? "",
        startLine: result.startLine ?? 0,
        description: result.description ?? "",
        signature: truncateSignature(result.signature ?? "", MCP_SIGNATURE_MAX_LENGTH),
        score: Math.round(result.score * 1000) / 1000,
        vectorRank: result.vectorRank,
        keywordRank: result.keywordRank,
      };
    })
  );

  return {
    results: rows,
    totalMatches: A.length(rows),
    searchMode,
    filtersApplied: filters,
  };
};

// ---------------------------------------------------------------------------
// find_related Result Formatting
// ---------------------------------------------------------------------------

/**
 * Raw related symbol from relation resolver.
 *
 * @since 0.0.0
 * @category types
 */
export interface RawRelatedSymbol {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly package: string;
  readonly module: string;
  readonly filePath: string;
  readonly startLine: number;
  readonly description: string;
  readonly relationDetail: string;
}

/**
 * Formatted related symbol row.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedRelatedSymbol {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
  readonly package: string;
  readonly module: string;
  readonly filePath: string;
  readonly startLine: number;
  readonly description: string;
  readonly relationDetail: string;
}

/**
 * Source symbol summary in related lookup output.
 *
 * @since 0.0.0
 * @category types
 */
export interface RelatedSource {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
}

/**
 * Formatted related lookup response payload.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedRelatedResult {
  readonly source: RelatedSource;
  readonly relation: string;
  readonly related: ReadonlyArray<FormattedRelatedSymbol>;
}

/**
 * Format related symbols for the `find_related` MCP tool.
 *
 * @param source source parameter value.
 * @param relation relation parameter value.
 * @param results results parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatRelatedResults = (
  source: RelatedSource,
  relation: string,
  results: ReadonlyArray<RawRelatedSymbol>
): FormattedRelatedResult => ({
  source,
  relation,
  related: A.map(results, (result) => ({
    id: result.id,
    name: result.name,
    kind: result.kind,
    package: result.package,
    module: result.module,
    filePath: result.filePath,
    startLine: result.startLine,
    description: result.description,
    relationDetail: result.relationDetail,
  })),
});

// ---------------------------------------------------------------------------
// browse_symbols Result Formatting
// ---------------------------------------------------------------------------

/**
 * Browsing response level.
 *
 * @since 0.0.0
 * @category types
 */
export type BrowseLevel = "packages" | "modules" | "symbols";

/**
 * One browse result item row.
 *
 * @since 0.0.0
 * @category types
 */
export interface BrowseItem {
  readonly name: string;
  readonly count: number;
  readonly kinds: Readonly<Record<string, number>>;
  readonly description: string;
}

/**
 * Formatted browse response payload.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedBrowseResult {
  readonly level: BrowseLevel;
  readonly items: ReadonlyArray<BrowseItem>;
}

/**
 * Format browse output with explicit hierarchy level.
 *
 * @param level level parameter value.
 * @param items items parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatBrowseResult = (level: BrowseLevel, items: ReadonlyArray<BrowseItem>): FormattedBrowseResult => ({
  level,
  items,
});

// ---------------------------------------------------------------------------
// reindex Result Formatting
// ---------------------------------------------------------------------------

/**
 * Formatted reindex result payload.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedReindexResult {
  readonly status: "completed";
  readonly mode: string;
  readonly stats: {
    readonly filesScanned: number;
    readonly filesChanged: number;
    readonly symbolsIndexed: number;
    readonly symbolsRemoved: number;
    readonly durationMs: number;
  };
}

/**
 * Format reindex tool output.
 *
 * @param mode mode parameter value.
 * @param stats stats parameter value.
 * @param stats.filesScanned filesScanned field value.
 * @param stats.filesChanged filesChanged field value.
 * @param stats.symbolsIndexed symbolsIndexed field value.
 * @param stats.symbolsRemoved symbolsRemoved field value.
 * @param stats.durationMs durationMs field value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatReindexResult = (
  mode: string,
  stats: {
    readonly filesScanned: number;
    readonly filesChanged: number;
    readonly symbolsIndexed: number;
    readonly symbolsRemoved: number;
    readonly durationMs: number;
  }
): FormattedReindexResult => ({
  status: "completed",
  mode,
  stats,
});
