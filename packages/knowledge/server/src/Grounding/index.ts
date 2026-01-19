/**
 * Grounding module - Relation verification and confidence filtering
 *
 * Provides services for verifying extracted relations against source text
 * and filtering by confidence thresholds.
 *
 * @module knowledge-server/Grounding
 * @since 0.1.0
 */

// Filters
export {
  computeConfidenceStats,
  type FilterConfig,
  type FilterResult,
  type FilterStats,
  filterEntities,
  filterGraph,
  filterGraphEffect,
  filterRelations,
  getLowConfidenceEntities,
  getLowConfidenceRelations,
  removeOrphanEntities,
} from "./ConfidenceFilter";
// Service
export {
  type GroundingConfig,
  type GroundingResult,
  GroundingService,
  GroundingServiceLive,
} from "./GroundingService";
