/**
 * Output formatters for MCP tool responses. Ensures consistent formatting,
 * signature truncation, and token budget compliance across all tools.
 *
 * Token budgets (MCP tools):
 * - search_codebase: ~100-150 tokens per result (5 results ≈ 800-1300)
 * - find_related: ~80-120 per related symbol (5 results ≈ 430-630)
 * - browse_symbols: ~200-1000 tokens total
 * - reindex: ~80-150 tokens total
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
 * Maximum signature length for MCP tool output. Signatures longer than
 * this are truncated with a trailing ellipsis.
 * @since 0.0.0
 * @category constants
 */
export const MCP_SIGNATURE_MAX_LENGTH = 200;

/**
 * Maximum signature length for hook context injection. Hooks have a
 * tighter token budget so signatures are truncated shorter.
 * @since 0.0.0
 * @category constants
 */
export const HOOK_SIGNATURE_MAX_LENGTH = 120;

// ---------------------------------------------------------------------------
// Signature Truncation
// ---------------------------------------------------------------------------

/**
 * Truncate a signature string to a maximum length, appending an ellipsis
 * marker when truncation occurs.
 *
 * @since 0.0.0
 * @category formatters
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
 * Symbol IDs follow the format `@scope/pkg/module/Name` or `pkg/module/Name`.
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
 * Parse a symbol ID into its component parts.
 * Handles both scoped (`@scope/pkg/module/Name`) and unscoped (`pkg/module/Name`) formats.
 *
 * @since 0.0.0
 * @category formatters
 */
export const parseSymbolId = (symbolId: string): ParsedSymbolId => {
  const parts = A.fromIterable(symbolId.split("/"));
  const len = A.length(parts);

  // Extract name (last segment)
  const name = pipe(
    A.get(parts, len - 1),
    O.getOrElse(() => symbolId)
  );

  // Extract package and module based on format
  if (len >= 4 && symbolId.startsWith("@")) {
    // @scope/pkg/module/Name → package = @scope/pkg, module = middle parts
    const pkg = pipe([A.get(parts, 0), A.get(parts, 1)], A.getSomes, A.join("/"));
    const mod = pipe(parts, A.drop(2), A.dropRight(1), A.join("/"));
    return { name, package: pkg, module: mod, fullPath: symbolId };
  }

  if (len >= 3) {
    // pkg/module/Name
    const pkg = pipe(
      A.get(parts, 0),
      O.getOrElse(() => "")
    );
    const mod = pipe(parts, A.drop(1), A.dropRight(1), A.join("/"));
    return { name, package: pkg, module: mod, fullPath: symbolId };
  }

  if (len === 2) {
    // module/Name
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
 * Raw result from the hybrid search pipeline used as input to the formatter.
 *
 * @since 0.0.0
 * @category types
 */
export interface RawSearchResult {
  readonly symbolId: string;
  readonly score: number;
  readonly vectorRank: number | null;
  readonly keywordRank: number | null;
}

/**
 * Formatted search result for MCP tool output.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedSearchResult {
  readonly id: string;
  readonly name: string;
  readonly package: string;
  readonly module: string;
  readonly score: number;
  readonly vectorRank: number | null;
  readonly keywordRank: number | null;
}

/**
 * Format raw hybrid search results for the `search_codebase` MCP tool.
 * Parses symbol IDs to extract name, package, and module metadata.
 * Each result is ~100 tokens; 5 results ≈ 500-750 tokens (well within 1500 budget).
 *
 * @since 0.0.0
 * @category formatters
 */
export const formatSearchResults = (results: ReadonlyArray<RawSearchResult>): ReadonlyArray<FormattedSearchResult> =>
  A.map(results, (r) => {
    const parsed = parseSymbolId(r.symbolId);
    return {
      id: r.symbolId,
      name: parsed.name,
      package: parsed.package,
      module: parsed.module,
      score: Math.round(r.score * 1000) / 1000,
      vectorRank: r.vectorRank,
      keywordRank: r.keywordRank,
    };
  });

// ---------------------------------------------------------------------------
// find_related Result Formatting
// ---------------------------------------------------------------------------

/**
 * Raw related symbol from the relation resolver.
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
 * Formatted related symbol for MCP tool output.
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
 * Format related symbols for the `find_related` MCP tool.
 * Each result is ~80-120 tokens; 5 results ≈ 430-630 tokens.
 *
 * @since 0.0.0
 * @category formatters
 */
export const formatRelatedResults = (
  sourceSymbolId: string,
  relation: string,
  results: ReadonlyArray<RawRelatedSymbol>
): {
  readonly sourceSymbolId: string;
  readonly relation: string;
  readonly results: ReadonlyArray<FormattedRelatedSymbol>;
} => ({
  sourceSymbolId,
  relation,
  results: A.map(results, (r) => ({
    id: r.id,
    name: r.name,
    kind: r.kind,
    package: r.package,
    module: r.module,
    filePath: r.filePath,
    startLine: r.startLine,
    description: r.description,
    relationDetail: r.relationDetail,
  })),
});

// ---------------------------------------------------------------------------
// browse_symbols Result Formatting
// ---------------------------------------------------------------------------

/**
 * Formatted browse result for the `browse_symbols` MCP tool.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedBrowseResult {
  readonly totalSymbols: number;
  readonly filters: {
    readonly package: string | null;
    readonly module: string | null;
    readonly kind: string | null;
  };
  readonly hint: string;
}

/**
 * Format browse_symbols result. ~200-300 tokens for index summary.
 *
 * @since 0.0.0
 * @category formatters
 */
export const formatBrowseResult = (
  totalSymbols: number,
  filters: {
    readonly package: string | null;
    readonly module: string | null;
    readonly kind: string | null;
  }
): FormattedBrowseResult => ({
  totalSymbols,
  filters,
  hint: "Use search_codebase with a query string for detailed results, or browse_symbols with package/module/kind filters to narrow the index.",
});

// ---------------------------------------------------------------------------
// reindex Result Formatting
// ---------------------------------------------------------------------------

/**
 * Formatted reindex result for the `reindex` MCP tool.
 *
 * @since 0.0.0
 * @category types
 */
export interface FormattedReindexResult {
  readonly status: string;
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
 * Format reindex result. ~80-150 tokens.
 *
 * @since 0.0.0
 * @category formatters
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
  status: "ok",
  mode,
  stats,
});
