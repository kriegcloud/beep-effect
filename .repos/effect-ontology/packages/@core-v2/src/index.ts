/**
 * @effect-ontology/core-v2
 *
 * Effect-native knowledge extraction framework
 *
 * @since 2.0.0
 * @module index
 */

// Domain (pure types, no service dependencies)
export * as Domain from "./Domain/index.js"

// Entity Resolution Domain Types
export {
  defaultEntityResolutionConfig,
  type EntityResolutionConfig,
  EREdge,
  ERNode,
  MentionRecord,
  RelationEdge,
  ResolutionEdge,
  ResolvedEntity
} from "./Domain/Model/EntityResolution.js"

// Services (Effect.Service classes with .Default layers)
export { ConfigService, ConfigServiceDefault } from "./Service/Config.js"
export { EntityExtractor, RelationExtractor } from "./Service/Extraction.js"
export { NlpService } from "./Service/Nlp.js"
export { OntologyService } from "./Service/Ontology.js"
export { RdfBuilder } from "./Service/Rdf.js"

// Entity Linker Service (query helpers)
export { getCanonicalId, getMentionsForEntity, toMermaid } from "./Service/EntityLinker.js"

// New Phase 3 Services
export { type LinkedRelation, type LinkingResult, RelationLinker } from "./Service/RelationLinker.js"
export { type SimilarityResult, SimilarityScorer } from "./Service/SimilarityScorer.js"

// Workflows (composable business logic)
export { ExtractionWorkflow } from "./Service/ExtractionWorkflow.js"
export {
  ExtractionWorkflowDefault,
  ExtractionWorkflowLive,
  makeExtractionWorkflow
} from "./Workflow/StreamingExtraction.js"

// Entity Resolution Workflow
export { buildEntityResolutionGraph, clusterEntities } from "./Workflow/EntityResolutionGraph.js"

// Entity Resolution Types (from Domain)
export type {
  ClusteringResult,
  EntityCluster,
  EntityResolutionGraph,
  EntityResolutionInfo,
  EntityResolutionStats,
  SimilarityEdge
} from "./Domain/Model/EntityResolutionGraph.js"

// Runtime (pre-composed layers)
export {
  ExtractionLayersLive,
  makeLanguageModelLayer,
  ProductionLayersWithTracing,
  RateLimitedLlmLayer,
  TracingLive
} from "./Runtime/ProductionRuntime.js"

// Telemetry (OpenTelemetry integration)
export * as Telemetry from "./Telemetry/index.js"
