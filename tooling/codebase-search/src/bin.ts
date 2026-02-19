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
import { Layer } from "effect";
import { Bm25WriterLive } from "./indexer/Bm25Writer.js";
import { EmbeddingServiceLive } from "./indexer/EmbeddingService.js";
import { LanceDbWriterLive } from "./indexer/LanceDbWriter.js";
import { PipelineLive } from "./indexer/Pipeline.js";
import { makeServerLayer } from "./mcp/McpServer.js";
import { HybridSearchLive } from "./search/HybridSearch.js";
import { RelationResolverLive } from "./search/RelationResolver.js";

// ---------------------------------------------------------------------------
// Configuration from environment
// ---------------------------------------------------------------------------

/** @internal */
const rootDir = process.env.CODEBASE_ROOT ?? ".";

/** @internal */
const indexPath = process.env.INDEX_PATH ?? ".code-index";

// ---------------------------------------------------------------------------
// Layer composition
// ---------------------------------------------------------------------------

/** @internal */
const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

/** @internal */
const IndexerServicesLayer = Layer.mergeAll(
  EmbeddingServiceLive,
  LanceDbWriterLive(indexPath),
  Bm25WriterLive(indexPath)
);

/** @internal */
const SearchServicesLayer = Layer.mergeAll(HybridSearchLive, RelationResolverLive);

/** @internal */
const PipelineLayer = PipelineLive.pipe(Layer.provide(IndexerServicesLayer));

/** @internal */
const McpLayer = makeServerLayer({ rootDir, indexPath }).pipe(
  Layer.provide(Layer.mergeAll(SearchServicesLayer, IndexerServicesLayer, PipelineLayer)),
  Layer.provide(BunStdio.layer),
  Layer.provide(PlatformLayer)
);

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

Layer.launch(McpLayer).pipe(BunRuntime.runMain);
