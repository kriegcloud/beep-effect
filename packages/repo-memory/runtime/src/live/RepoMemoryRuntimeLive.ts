import { Layer } from "effect";
import { RepoRunService, RepoRunWorkflowsLayer, TypeScriptIndexService } from "../internal/RepoMemoryRuntime.js";
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
 * @since 0.0.0
 * @category Configuration
 */
export const RepoMemoryRuntimeLive = Layer.merge(RepoRunServiceLive, RepoRunWorkflowsLive);
