/**
 * EntityResolution module exports
 *
 * Provides entity resolution capabilities for deduplicating and linking
 * entities across multiple knowledge graph extractions.
 *
 * @module knowledge-server/EntityResolution
 * @since 0.1.0
 */
export { CanonicalSelector, type CanonicalSelectorConfig, type SelectionStrategy } from "./CanonicalSelector";
export {
  type ClusterConfig,
  type EntityCluster,
  EntityClusterer,
} from "./EntityClusterer";
export {
  EntityResolutionService,
  EntityResolutionServiceLive,
  type ResolutionConfig,
  type ResolutionResult,
} from "./EntityResolutionService";
export { type SameAsLink, SameAsLinker } from "./SameAsLinker";
