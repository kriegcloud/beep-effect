/**
 * MCP server entry point for codebase search.
 * Starts the stdio-based MCP server for semantic code search.
 *
 * Environment variables:
 * - `CODEBASE_ROOT` - Path to the monorepo root (default: `.`)
 * - `INDEX_PATH` - Path to the search index directory (default: `.code-index`)
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { BunStdio } from "@effect/platform-bun";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { NodeFileSystem, NodePath } from "@effect/platform-node";
import { Config, Effect, Layer } from "effect";
import { Bm25WriterLive, EmbeddingServiceLive, LanceDbWriterLive } from "./indexer/index.js";
import { PipelineLive } from "./indexer/Pipeline.js";
import { makeMcpServerConfigLayer, makeServerLayer } from "./mcp/index.js";
import { HybridSearchLive, RelationResolverLive } from "./search/index.js";

// ---------------------------------------------------------------------------
// Configuration from environment
// ---------------------------------------------------------------------------

/** @internal */
const ServerConfig = Config.all({
  rootDir: Config.string("CODEBASE_ROOT").pipe(Config.withDefault(() => ".")),
  indexPath: Config.string("INDEX_PATH").pipe(Config.withDefault(() => ".code-index")),
});

// ---------------------------------------------------------------------------
// Layer composition
// ---------------------------------------------------------------------------

/** @internal */
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

const program = Effect.gen(function* () {
  const config = yield* ServerConfig;

  const indexerServicesLayer = Layer.mergeAll(
    EmbeddingServiceLive,
    LanceDbWriterLive(config.indexPath),
    Bm25WriterLive(config.indexPath)
  );

  const searchAndPipelineLayer = Layer.mergeAll(HybridSearchLive, RelationResolverLive, PipelineLive).pipe(
    Layer.provideMerge(indexerServicesLayer)
  );

  const mcpLayer = makeServerLayer.pipe(
    Layer.provide(makeMcpServerConfigLayer(config)),
    Layer.provide(searchAndPipelineLayer),
    Layer.provide(BunStdio.layer),
    Layer.provide(PlatformLayer)
  );

  return yield* Layer.launch(mcpLayer);
});

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

program.pipe(
  Effect.orElseSucceed(() => undefined),
  BunRuntime.runMain
);
