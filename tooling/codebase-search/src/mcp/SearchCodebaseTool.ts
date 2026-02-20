/**
 * MCP tool definition and handler for `search_codebase`.
 *
 * @since 0.0.0
 * @module
 */

import { Effect } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import type { EmbeddingModelError, IndexingError, IndexNotFoundError, SearchTimeoutError } from "../errors.js";
import { LanceDbWriter } from "../indexer/LanceDbWriter.js";
import { HybridSearch, type HybridSearchConfig } from "../search/HybridSearch.js";
import { McpErrorResponseSchema } from "./contracts.js";
import { type FormattedSearchResult, formatSearchResults, type RawSearchResult } from "./formatters.js";

/**
 * Handle `search_codebase` invocation.
 *
 * @since 0.0.0
 * @category handlers
 */
export const handleSearchCodebase: (params: {
  readonly query: string;
  readonly kind?: string | undefined;
  readonly package?: string | undefined;
  readonly limit?: number | undefined;
}) => Effect.Effect<
  FormattedSearchResult,
  IndexingError | IndexNotFoundError | EmbeddingModelError | SearchTimeoutError,
  HybridSearch | LanceDbWriter
> = Effect.fn(function* (params: {
  readonly query: string;
  readonly kind?: string | undefined;
  readonly package?: string | undefined;
  readonly limit?: number | undefined;
}) {
  const hybridSearch = yield* HybridSearch;
  const lanceDb = yield* LanceDbWriter;

  const limit = pipe(
    O.fromNullishOr(params.limit),
    O.map((value) => Math.max(1, Math.min(20, value))),
    O.getOrElse(() => 5)
  );

  const config: HybridSearchConfig = {
    query: params.query,
    limit,
    kind: params.kind,
    package: params.package,
  };

  const hybridResults = yield* hybridSearch.search(config);
  const ids = A.map(hybridResults, (result) => result.symbolId);
  const symbolRows = yield* lanceDb.list({ ids });
  const rowById = new Map<string, (typeof symbolRows)[number]>();

  for (const row of symbolRows) {
    rowById.set(row.id, row);
  }

  const merged: ReadonlyArray<RawSearchResult> = pipe(
    hybridResults,
    A.map((result): RawSearchResult => {
      const row = rowById.get(result.symbolId);
      return {
        symbolId: result.symbolId,
        score: result.score,
        vectorRank: result.vectorRank,
        keywordRank: result.keywordRank,
        name: row?.name,
        kind: row?.kind,
        package: row?.package,
        module: row?.module,
        filePath: row?.filePath,
        startLine: row?.startLine,
        description: row?.description,
        signature: row?.signature,
      };
    })
  );

  return formatSearchResults(
    merged,
    {
      kind: params.kind ?? null,
      package: params.package ?? null,
    },
    "hybrid"
  );
});

/**
 * MCP tool: semantic + keyword hybrid search.
 *
 * @since 0.0.0
 * @category tools
 */
export const SearchCodebaseTool = Tool.make("search_codebase", {
  description: "Search for code symbols using hybrid vector and BM25 retrieval.",
  parameters: S.Struct({
    query: S.String.annotate({
      description: "Natural language search query for finding code symbols.",
    }),
    kind: S.optionalKey(
      S.String.annotate({
        description: "Optional filter by symbol kind (schema, service, layer, error, etc.).",
      })
    ),
    package: S.optionalKey(
      S.String.annotate({
        description: "Optional filter by package name (for example, @beep/repo-utils).",
      })
    ),
    limit: S.optionalKey(
      S.Number.annotate({
        description: "Maximum number of results (1-20, default 5).",
      })
    ),
  }),
  success: S.Unknown,
  failure: McpErrorResponseSchema,
  dependencies: [HybridSearch, LanceDbWriter],
});
