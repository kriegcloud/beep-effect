/**
 * MCP server composition for codebase-search tools.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, Layer, Logger } from "effect";
import * as ServiceMap from "effect/ServiceMap";
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
import { formatError, type McpErrorResponse } from "./contracts.js";
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
export interface McpServerConfigShape {
  /** Absolute path to the monorepo root directory. */
  readonly rootDir: string;
  /** Absolute or cwd-relative path to the search index directory. */
  readonly indexPath: string;
}

/**
 * Service tag for MCP runtime configuration.
 *
 * @since 0.0.0
 * @category services
 */
export class McpServerConfig extends ServiceMap.Service<McpServerConfig, McpServerConfigShape>()(
  "@beep/codebase-search/mcp/McpServerConfig"
) {}

/**
 * Create a layer supplying MCP runtime configuration.
 *
 * @param config config parameter value.
 * @since 0.0.0
 * @category layers
 * @returns Returns the computed value.
 */
export const makeMcpServerConfigLayer = (config: McpServerConfigShape): Layer.Layer<McpServerConfig> =>
  Layer.succeed(McpServerConfig, McpServerConfig.of(config));

const makeToolkitHandlerLayerFromConfig = (
  config: McpServerConfigShape
): Layer.Layer<
  Tool.HandlersFor<Toolkit.Tools<typeof CodebaseSearchToolkit>>,
  never,
  LanceDbWriter | HybridSearch | RelationResolver | Pipeline
> => {
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
 * Create toolkit handler layer for all MCP tools.
 *
 * @since 0.0.0
 * @category layers
 * @returns Returns the computed value.
 */
export const makeToolkitHandlerLayer: Layer.Layer<
  Tool.HandlersFor<Toolkit.Tools<typeof CodebaseSearchToolkit>>,
  never,
  LanceDbWriter | HybridSearch | RelationResolver | Pipeline | McpServerConfig
> = Layer.unwrap(Effect.map(Effect.service(McpServerConfig), makeToolkitHandlerLayerFromConfig));

/**
 * Create complete MCP server layer with stdio transport.
 *
 * @since 0.0.0
 * @category layers
 * @returns Returns the computed value.
 */
export const makeServerLayer: Layer.Layer<
  never,
  never,
  LanceDbWriter | HybridSearch | RelationResolver | Pipeline | Stdio | McpServerConfig
> = (() => {
  const handlersLayer = makeToolkitHandlerLayer;
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
})();
