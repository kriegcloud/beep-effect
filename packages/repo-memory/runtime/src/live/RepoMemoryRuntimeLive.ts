/**
 * Live runtime layer assembly for repo-memory services.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Layer } from "effect";
import { TypeScriptIndexService } from "../indexing/TypeScriptIndexer.js";
import { RepoRunService, RepoRunWorkflowsLayer } from "../internal/RepoMemoryRuntime.js";
import { GroundedRetrievalService } from "../retrieval/GroundedRetrieval.js";
import { RepoSemanticEnrichmentService } from "../semantic/RepoSemanticEnrichmentService.js";

const RepoRunServiceLive = RepoRunService.layer.pipe(
  Layer.provideMerge(TypeScriptIndexService.layer),
  Layer.provideMerge(RepoSemanticEnrichmentService.layer),
  Layer.provideMerge(GroundedRetrievalService.layer)
);

const RepoRunWorkflowsLive = RepoRunWorkflowsLayer.pipe(Layer.provide(RepoRunServiceLive));

/**
 * Live repo-memory runtime layer.
 *
 * @example
 * ```ts
 * import { RepoMemoryRuntimeLive } from "@beep/repo-memory-runtime"
 *
 * const layer = RepoMemoryRuntimeLive
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const RepoMemoryRuntimeLive = Layer.merge(RepoRunServiceLive, RepoRunWorkflowsLive);
