/**
 * MCP server composition for codebase-search tools.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Layer, Logger } from "effect";
import type { Stdio } from "effect/Stdio";
import { McpServer as EffectMcpServer, type Tool, Toolkit } from "effect/unstable/ai";
import type {
  EmbeddingModelError,
  IndexingError,
  IndexNotFoundError,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "../errors.js";
import type { LanceDbWriter } from "../indexer/index.js";
import type { Pipeline } from "../indexer/Pipeline.js";
import type { HybridSearch, RelationResolver } from "../search/index.js";
import { BrowseSymbolsTool, handleBrowseSymbols } from "./BrowseSymbolsTool.js";
import { ErrorCodes, formatError, type McpErrorResponse } from "./contracts.js";
import { FindRelatedTool, handleFindRelated } from "./FindRelatedTool.js";
import { handleReindex, ReindexTool } from "./ReindexTool.js";
import { handleSearchCodebase, SearchCodebaseTool } from "./SearchCodebaseTool.js";

/**
 * Toolkit combining all codebase-search MCP tools.
 *
 * @since 0.0.0
 * @category tools
 */
export const CodebaseSearchToolkit = Toolkit.make(SearchCodebaseTool, FindRelatedTool, BrowseSymbolsTool, ReindexTool);

/**
 * Configuration for MCP server launch.
 *
 * @since 0.0.0
 * @category types
 */
export interface McpServerConfig {
  /** Absolute path to the monorepo root directory. */
  readonly rootDir: string;
  /** Absolute or cwd-relative path to the search index directory. */
  readonly indexPath: string;
}

/**
 * Create toolkit handler layer for all MCP tools.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeToolkitHandlerLayer: (
  config: McpServerConfig
) => Layer.Layer<
  Tool.HandlersFor<Toolkit.Tools<typeof CodebaseSearchToolkit>>,
  never,
  LanceDbWriter | HybridSearch | RelationResolver | Pipeline
> = (config) => {
  const runHandler = <A, R>(
    effect: Effect.Effect<
      A,
      IndexingError | IndexNotFoundError | SymbolNotFoundError | EmbeddingModelError | SearchTimeoutError,
      R
    >
  ): Effect.Effect<A, McpErrorResponse, R> => effect.pipe(Effect.mapError(formatError));

  return CodebaseSearchToolkit.toLayer({
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
  });
};

/**
 * Create complete MCP server layer with stdio transport.
 *
 * @since 0.0.0
 * @category layers
 */
export const makeServerLayer: (
  config: McpServerConfig
) => Layer.Layer<never, never, LanceDbWriter | HybridSearch | RelationResolver | Pipeline | Stdio> = (config) => {
  const handlersLayer = makeToolkitHandlerLayer(config);
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

export { ErrorCodes, formatError };
