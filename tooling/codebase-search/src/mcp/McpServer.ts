/**
 * MCP (Model Context Protocol) server exposing codebase search as four tools:
 * `search_codebase`, `find_related`, `browse_symbols`, and `reindex`.
 *
 * Uses Effect v4's built-in MCP server from `effect/unstable/ai` with
 * Schema-based tool definitions, Toolkit layer composition, and stdio transport.
 *
 * @since 0.0.0
 * @module
 */

import { Bm25Writer } from "@beep/codebase-search/indexer/Bm25Writer";
import { EmbeddingService } from "@beep/codebase-search/indexer/EmbeddingService";
import { LanceDbWriter } from "@beep/codebase-search/indexer/LanceDbWriter";
import type { PipelineConfig } from "@beep/codebase-search/indexer/Pipeline";
import { Pipeline } from "@beep/codebase-search/indexer/Pipeline";
import type { HybridSearchConfig } from "@beep/codebase-search/search/HybridSearch";
import { HybridSearch } from "@beep/codebase-search/search/HybridSearch";
import type { RelationResolverConfig, RelationType } from "@beep/codebase-search/search/RelationResolver";
import { RelationResolver } from "@beep/codebase-search/search/RelationResolver";
import { Effect, FileSystem, Layer, Logger, Path } from "effect";
import * as A from "effect/Array";
import { identity, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Stdio } from "effect/Stdio";
import { McpServer as EffectMcpServer, Tool, Toolkit } from "effect/unstable/ai";
import {
  EmbeddingModelError,
  IndexingError,
  IndexNotFoundError,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "../errors.js";
import { formatBrowseResult, formatReindexResult, formatRelatedResults, formatSearchResults } from "./formatters.js";

// ---------------------------------------------------------------------------
// Error Response Types
// ---------------------------------------------------------------------------

/**
 * Error codes used in MCP tool error responses.
 * @since 0.0.0
 * @category constants
 */
export const ErrorCodes = {
  INDEX_NOT_FOUND: "INDEX_NOT_FOUND",
  SYMBOL_NOT_FOUND: "SYMBOL_NOT_FOUND",
  INDEX_STALE: "INDEX_STALE",
  EMBEDDING_MODEL_ERROR: "EMBEDDING_MODEL_ERROR",
  SEARCH_TIMEOUT: "SEARCH_TIMEOUT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Type for error codes in MCP tool error responses.
 * @since 0.0.0
 * @category types
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Structured error response returned by MCP tool handlers.
 * @since 0.0.0
 * @category types
 */
export interface McpErrorResponse {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly suggestion: string;
  };
}

// ---------------------------------------------------------------------------
// Error Formatting
// ---------------------------------------------------------------------------

/**
 * Format an error from Effect services into a structured MCP error response.
 * @since 0.0.0
 * @category internal
 */
export const formatError = (err: unknown): McpErrorResponse => {
  if (err instanceof IndexNotFoundError) {
    return {
      error: {
        code: ErrorCodes.INDEX_NOT_FOUND,
        message: err.message,
        suggestion: "Run the 'reindex' tool with mode='full' to create the search index.",
      },
    };
  }
  if (err instanceof SymbolNotFoundError) {
    return {
      error: {
        code: ErrorCodes.SYMBOL_NOT_FOUND,
        message: err.message,
        suggestion: "Use 'search_codebase' to find valid symbol IDs.",
      },
    };
  }
  if (err instanceof EmbeddingModelError) {
    return {
      error: {
        code: ErrorCodes.EMBEDDING_MODEL_ERROR,
        message: err.message,
        suggestion: "Verify the embedding model is available and the runtime is compatible.",
      },
    };
  }
  if (err instanceof SearchTimeoutError) {
    return {
      error: {
        code: ErrorCodes.SEARCH_TIMEOUT,
        message: err.message,
        suggestion: "Try a more specific query or reduce the limit parameter.",
      },
    };
  }
  if (err instanceof IndexingError) {
    return {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: err.message,
        suggestion: "Check the indexing configuration and try again.",
      },
    };
  }
  return {
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: String(err),
      suggestion: "An unexpected error occurred. Check the server logs.",
    },
  };
};

// ---------------------------------------------------------------------------
// Tool Handler Effects
// ---------------------------------------------------------------------------

/**
 * Valid relation types for the find_related tool.
 * @since 0.0.0
 * @category constants
 */
const VALID_RELATION_TYPES: ReadonlyArray<RelationType> = [
  "imports",
  "imported-by",
  "same-module",
  "similar",
  "provides",
  "depends-on",
];

/** Reindex run statistics. */
export interface ReindexStats {
  readonly filesScanned: number;
  readonly filesChanged: number;
  readonly symbolsIndexed: number;
  readonly symbolsRemoved: number;
  readonly durationMs: number;
}

/** Successful response returned by the reindex tool handler. */
export interface ReindexSuccess {
  readonly status: "ok";
  readonly mode: "full" | "incremental";
  readonly stats: ReindexStats;
}

/** Schema for reindex run statistics. */
export const ReindexStatsSchema = S.Struct({
  filesScanned: S.Number,
  filesChanged: S.Number,
  symbolsIndexed: S.Number,
  symbolsRemoved: S.Number,
  durationMs: S.Number,
}) satisfies S.Decoder<ReindexStats>;

/** Schema for the reindex tool success response. */
export const ReindexSuccessSchema = S.Struct({
  status: S.Literal("ok"),
  mode: S.Literals(["full", "incremental"]),
  stats: ReindexStatsSchema,
}) satisfies S.Decoder<ReindexSuccess>;

/**
 * Handle the search_codebase tool invocation.
 * @since 0.0.0
 * @category handlers
 */
export const handleSearchCodebase: (params: {
  readonly query: string;
  readonly kind?: string | undefined;
  readonly package?: string | undefined;
  readonly limit?: number | undefined;
}) => Effect.Effect<
  unknown,
  IndexingError | IndexNotFoundError | EmbeddingModelError | SearchTimeoutError,
  HybridSearch | EmbeddingService | LanceDbWriter | Bm25Writer
> = Effect.fn(function* (params: {
  readonly query: string;
  readonly kind?: string | undefined;
  readonly package?: string | undefined;
  readonly limit?: number | undefined;
}) {
  const hybridSearch = yield* HybridSearch;

  const limit = pipe(
    O.fromNullishOr(params.limit),
    O.map((n) => Math.max(1, Math.min(20, n))),
    O.getOrElse(() => 5)
  );

  const config: HybridSearchConfig = {
    query: params.query,
    limit,
    kind: params.kind,
    package: params.package,
  };

  const results = yield* hybridSearch.search(config);

  return formatSearchResults(results);
});

/**
 * Handle the find_related tool invocation.
 * @since 0.0.0
 * @category handlers
 */
export const handleFindRelated: (params: {
  readonly symbolId: string;
  readonly relation?: string | undefined;
  readonly limit?: number | undefined;
}) => Effect.Effect<
  unknown,
  IndexingError | SymbolNotFoundError | EmbeddingModelError,
  RelationResolver | EmbeddingService | LanceDbWriter
> = Effect.fn(function* (params: {
  readonly symbolId: string;
  readonly relation?: string | undefined;
  readonly limit?: number | undefined;
}) {
  const relationResolver = yield* RelationResolver;

  const relation: RelationType = pipe(
    O.fromNullishOr(params.relation),
    O.filter((r): r is RelationType => A.contains(r)(VALID_RELATION_TYPES)),
    O.getOrElse((): RelationType => "similar")
  );

  const limit = pipe(
    O.fromNullishOr(params.limit),
    O.map((n) => Math.max(1, Math.min(10, n))),
    O.getOrElse(() => 5)
  );

  const config: RelationResolverConfig = {
    symbolId: params.symbolId,
    relation,
    limit,
  };

  const results = yield* relationResolver.resolve(config);

  return formatRelatedResults(params.symbolId, relation, results);
});

/**
 * Handle the browse_symbols tool invocation.
 * @since 0.0.0
 * @category handlers
 */
export const handleBrowseSymbols: (params: {
  readonly package?: string | undefined;
  readonly module?: string | undefined;
  readonly kind?: string | undefined;
}) => Effect.Effect<unknown, IndexingError, LanceDbWriter> = Effect.fn(function* (params: {
  readonly package?: string | undefined;
  readonly module?: string | undefined;
  readonly kind?: string | undefined;
}) {
  const lanceDb = yield* LanceDbWriter;

  const totalSymbols = yield* lanceDb.countRows();

  return formatBrowseResult(totalSymbols, {
    package: params.package ?? null,
    module: params.module ?? null,
    kind: params.kind ?? null,
  });
});

/**
 * Handle the reindex tool invocation.
 * @since 0.0.0
 * @category handlers
 */
export const handleReindex: (params: {
  readonly rootDir: string;
  readonly indexPath: string;
  readonly mode?: string | undefined;
  readonly package?: string | undefined;
}) => Effect.Effect<ReindexSuccess, IndexingError, Pipeline> = Effect.fn(function* (params: {
  readonly rootDir: string;
  readonly indexPath: string;
  readonly mode?: string | undefined;
  readonly package?: string | undefined;
}) {
  const pipeline = yield* Pipeline;

  const mode: "full" | "incremental" = params.mode === "full" ? "full" : "incremental";

  const config: PipelineConfig = {
    rootDir: params.rootDir,
    indexPath: params.indexPath,
    mode,
    packageFilter: params.package,
  };

  const stats = yield* pipeline.run(config);

  return S.decodeUnknownSync(ReindexSuccessSchema)(formatReindexResult(mode, stats));
});

// ---------------------------------------------------------------------------
// Tool Definitions (Effect Schema-based)
// ---------------------------------------------------------------------------

/**
 * MCP tool: search the codebase using hybrid vector + keyword search.
 * @since 0.0.0
 * @category tools
 */
export const SearchCodebaseTool = Tool.make("search_codebase", {
  description: "Search for code symbols using hybrid vector + keyword search with natural language queries.",
  parameters: S.Struct({
    query: S.String.annotate({
      description: "Natural language search query for finding code symbols",
    }),
    kind: S.optionalKey(
      S.String.annotate({
        description: "Filter by symbol kind (e.g. 'schema', 'service', 'error', 'layer')",
      })
    ),
    package: S.optionalKey(
      S.String.annotate({
        description: "Filter by package name (e.g. '@beep/cli')",
      })
    ),
    limit: S.optionalKey(
      S.Number.annotate({
        description: "Maximum number of results (1-20, default 5)",
      })
    ),
  }),
  success: S.Unknown,
});

/**
 * MCP tool: find symbols related to a given symbol.
 * @since 0.0.0
 * @category tools
 */
export const FindRelatedTool = Tool.make("find_related", {
  description: "Find symbols related to a given symbol by relationship type (similar, imports, imported-by, etc.).",
  parameters: S.Struct({
    symbolId: S.String.annotate({
      description: "The unique symbol ID to find related symbols for",
    }),
    relation: S.optionalKey(
      S.Literals(["imports", "imported-by", "same-module", "similar", "provides", "depends-on"]).annotate({
        description: "Type of relationship to resolve (default: 'similar')",
      })
    ),
    limit: S.optionalKey(
      S.Number.annotate({
        description: "Maximum number of results (1-10, default 5)",
      })
    ),
  }),
  success: S.Unknown,
});

/**
 * MCP tool: browse the symbol index.
 * @since 0.0.0
 * @category tools
 */
export const BrowseSymbolsTool = Tool.make("browse_symbols", {
  description: "Browse the symbol index with optional package, module, and kind filters. Returns index summary.",
  parameters: S.Struct({
    package: S.optionalKey(
      S.String.annotate({
        description: "Filter by package name",
      })
    ),
    module: S.optionalKey(
      S.String.annotate({
        description: "Filter by module name within a package",
      })
    ),
    kind: S.optionalKey(
      S.String.annotate({
        description: "Filter by symbol kind",
      })
    ),
  }),
  success: S.Unknown,
});

/**
 * MCP tool: rebuild the codebase search index.
 * @since 0.0.0
 * @category tools
 */
export const ReindexTool = Tool.make("reindex", {
  description:
    "Rebuild the codebase search index. Use mode='full' for a complete rebuild or 'incremental' for changes only.",
  parameters: S.Struct({
    mode: S.optionalKey(
      S.Literals(["incremental", "full"]).annotate({
        description: "Index rebuild mode (default: 'incremental')",
      })
    ),
    package: S.optionalKey(
      S.String.annotate({
        description: "Restrict indexing to a single package",
      })
    ),
  }),
  success: S.Unknown,
});

// ---------------------------------------------------------------------------
// Toolkit
// ---------------------------------------------------------------------------

/**
 * Toolkit combining all four codebase search MCP tools.
 * @since 0.0.0
 * @category tools
 */
export const CodebaseSearchToolkit = Toolkit.make(SearchCodebaseTool, FindRelatedTool, BrowseSymbolsTool, ReindexTool);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Configuration for the MCP server layer.
 * @since 0.0.0
 * @category types
 */
export interface McpServerConfig {
  /** Absolute path to the monorepo root directory. */
  readonly rootDir: string;
  /** Absolute path to the search index directory. */
  readonly indexPath: string;
}

// ---------------------------------------------------------------------------
// Layer Construction
// ---------------------------------------------------------------------------

/**
 * Creates the toolkit handler layer that wires up service dependencies
 * to the tool handlers. Errors are caught and returned as structured error
 * responses so the toolkit handlers never fail.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeToolkitHandlerLayer: (
  config: McpServerConfig
) => Layer.Layer<
  Tool.HandlersFor<Toolkit.Tools<typeof CodebaseSearchToolkit>>,
  never,
  HybridSearch | RelationResolver | Pipeline | LanceDbWriter | Bm25Writer | EmbeddingService
> = (config) =>
  CodebaseSearchToolkit.toLayer(
  Effect.gen(function* () {
      // Capture service instances for use inside tool handlers
      const hybridSearch = yield* HybridSearch;
      const relationResolver = yield* RelationResolver;
      const pipelineSvc = yield* Pipeline;
      const lanceDb = yield* LanceDbWriter;
      const bm25 = yield* Bm25Writer;
      const embeddingSvc = yield* EmbeddingService;

      // Build layers to provide when running handler Effects
      const allServiceLayers = Layer.mergeAll(
        Layer.succeed(HybridSearch, hybridSearch),
        Layer.succeed(RelationResolver, relationResolver),
        Layer.succeed(Pipeline, pipelineSvc),
        Layer.succeed(LanceDbWriter, lanceDb),
        Layer.succeed(Bm25Writer, bm25),
        Layer.succeed(EmbeddingService, embeddingSvc)
      );

      const runHandler = <A>(
        effect: Effect.Effect<
          A,
          IndexingError | IndexNotFoundError | SymbolNotFoundError | EmbeddingModelError | SearchTimeoutError,
          HybridSearch | RelationResolver | Pipeline | LanceDbWriter | Bm25Writer | EmbeddingService
        >
      ): Effect.Effect<A | McpErrorResponse> =>
        effect.pipe(
          Effect.provide(allServiceLayers),
          Effect.match({
            onSuccess: identity,
            onFailure: formatError,
          })
        );

      return {
        search_codebase: (params) =>
          runHandler(
            handleSearchCodebase({
              query: params.query,
              kind: params.kind,
              package: params.package,
              limit: params.limit,
            })
          ),
        find_related: (params) =>
          runHandler(
            handleFindRelated({
              symbolId: params.symbolId,
              relation: params.relation,
              limit: params.limit,
            })
          ),
        browse_symbols: (params) =>
          runHandler(
            handleBrowseSymbols({
              package: params.package,
              module: params.module,
              kind: params.kind,
            })
          ),
        reindex: (params) =>
          runHandler(
            handleReindex({
              rootDir: config.rootDir,
              indexPath: config.indexPath,
              mode: params.mode,
              package: params.package,
            })
          ),
      };
    })
  );

/**
 * Creates the complete MCP server layer with stdio transport.
 *
 * Composes the tool registration, handler implementations, stdio transport,
 * and all required services into a single launchable layer.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeServerLayer: (
  config: McpServerConfig
) => Layer.Layer<
  never,
  never,
  | HybridSearch
  | RelationResolver
  | Pipeline
  | LanceDbWriter
  | Bm25Writer
  | EmbeddingService
  | FileSystem.FileSystem
  | Path.Path
  | Stdio
> = (config) => {
  const handlersLayer = makeToolkitHandlerLayer(config);

  // Register the toolkit with McpServer (requires McpServer + handlers)
  const registrationLayer = Layer.effectDiscard(EffectMcpServer.registerToolkit(CodebaseSearchToolkit));

  return registrationLayer.pipe(
    Layer.provideMerge(handlersLayer),
    Layer.provide(
      EffectMcpServer.layerStdio({
        name: "codebase-search",
        version: "0.0.0",
      })
    ),
    Layer.provide(Layer.succeed(Logger.LogToStderr)(true))
  );
};
