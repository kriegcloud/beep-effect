/**
 * Confidence Scoring for Citation Validation
 *
 * Computes confidence scores for citations based on validation results,
 * applying depth penalties for inferred relations and computing weighted
 * averages for answer-level confidence.
 *
 * Scoring Formula:
 * - citation_confidence = min(entity_confidence, relation_confidence)
 * - inferred_penalty = 1.0 - (0.1 * inference_depth)
 * - final_citation_confidence = citation_confidence * max(inferred_penalty, 0.5)
 * - answer_confidence = weighted_avg(citation_confidences) where weight = length(claimText)
 *
 * Confidence Thresholds:
 * - >= 0.5: Valid citation, include in answer
 * - < 0.5: Flagged as potentially ungrounded
 * - < 0.3: Consider excluding from answer entirely
 *
 * @module knowledge-server/GraphRAG/ConfidenceScorer
 * @since 0.1.0
 */

import { $KnowledgeServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { Citation, ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/ConfidenceScorer");

// =============================================================================
// Types
// =============================================================================

/**
 * Result of validating a single entity reference in a citation
 *
 * @since 0.1.0
 * @category types
 */
export interface EntityValidationResult {
  readonly entityId: string;
  readonly found: boolean;
  readonly confidence: number;
}

/**
 * Result of validating a relation reference in a citation
 *
 * @since 0.1.0
 * @category types
 */
export interface RelationValidationResult {
  readonly relationId: string;
  readonly found: boolean;
  readonly isInferred: boolean;
  readonly confidence: number;
  readonly reasoningTrace?: ReasoningTrace;
}

/**
 * Complete validation result for a single citation
 *
 * @since 0.1.0
 * @category types
 */
export interface CitationValidationResult {
  readonly citation: Citation;
  readonly entityResults: ReadonlyArray<EntityValidationResult>;
  readonly relationResult?: undefined | RelationValidationResult;
  readonly overallConfidence: number;
}

/**
 * Citation with final computed confidence and grounding status
 *
 * @since 0.1.0
 * @category types
 */
export interface ScoredCitation {
  /** Original citation being scored */
  readonly citation: Citation;

  /** Validation result from CitationValidator */
  readonly validationResult: CitationValidationResult;

  /** Final confidence after applying depth penalty */
  readonly finalConfidence: number;

  /** Whether citation is considered grounded (finalConfidence >= 0.5) */
  readonly isGrounded: boolean;

  /** Whether citation should be excluded (finalConfidence < 0.3) */
  readonly shouldExclude: boolean;
}

/**
 * Answer with all citations scored and overall confidence computed
 *
 * @since 0.1.0
 * @category types
 */
export interface ScoredAnswer {
  /** Original answer text */
  readonly text: string;

  /** All citations with computed scores */
  readonly citations: ReadonlyArray<ScoredCitation>;

  /** Weighted average of citation confidences */
  readonly overallConfidence: number;

  /** Percentage of citations with confidence >= 0.5 */
  readonly groundedRatio: number;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Minimum confidence for a citation to be considered grounded
 *
 * @since 0.1.0
 * @category constants
 */
export const GROUNDED_THRESHOLD = 0.5;

/**
 * Minimum confidence below which citation should be excluded
 *
 * @since 0.1.0
 * @category constants
 */
export const EXCLUDE_THRESHOLD = 0.3;

/**
 * Penalty factor per inference depth level
 *
 * @since 0.1.0
 * @category constants
 */
export const DEPTH_PENALTY_FACTOR = 0.1;

/**
 * Minimum penalty multiplier (prevents total confidence collapse)
 *
 * @since 0.1.0
 * @category constants
 */
export const MIN_PENALTY_MULTIPLIER = 0.5;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Clamp a number to the valid confidence range [0.0, 1.0]
 *
 * @param value - Value to clamp
 * @returns Value clamped to [0.0, 1.0]
 *
 * @since 0.1.0
 * @category helpers
 */
const clampConfidence = (value: number): number => {
  return Num.clamp(value, { minimum: 0.0, maximum: 1.0 });
};

/**
 * Compute depth penalty multiplier for inferred relations
 *
 * Formula: max(1.0 - (0.1 * depth), 0.5)
 *
 * @param depth - Inference depth (number of hops)
 * @returns Penalty multiplier in range [0.5, 1.0]
 *
 * @since 0.1.0
 * @category helpers
 */
const computeDepthPenalty = (depth: number): number => {
  const penalty = 1.0 - DEPTH_PENALTY_FACTOR * depth;
  return Num.max(penalty, MIN_PENALTY_MULTIPLIER);
};

/**
 * Get minimum confidence from entity validation results
 *
 * Returns 1.0 if no entities (edge case - citation with no entities)
 *
 * @param results - Entity validation results
 * @returns Minimum entity confidence
 *
 * @since 0.1.0
 * @category helpers
 */
const minEntityConfidence = (results: ReadonlyArray<EntityValidationResult>): number => {
  if (A.isEmptyReadonlyArray(results)) {
    return 1.0;
  }

  const confidences = A.map(results, (r) => r.confidence);
  return A.reduce(confidences, 1.0, Num.min);
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * ConfidenceScorer - Computes final confidence scores for citations
 *
 * Applies the spec's scoring formula:
 * 1. Base confidence = min(entity_confidence, relation_confidence)
 * 2. Depth penalty = 1.0 - (0.1 * inference_depth), minimum 0.5
 * 3. Final confidence = base_confidence * depth_penalty
 *
 * Answer-level confidence is computed as weighted average of citation
 * confidences, where weights are claim text lengths.
 *
 * @example
 * ```ts
 * import { ConfidenceScorer } from "@beep/knowledge-server/GraphRAG";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const scorer = yield* ConfidenceScorer;
 *
 *   // Score a single citation
 *   const scoredCitation = scorer.scoreCitation(validationResult);
 *   console.log(scoredCitation.finalConfidence);
 *   console.log(scoredCitation.isGrounded);
 *
 *   // Score entire answer
 *   const scoredAnswer = scorer.scoreAnswer(answerText, validationResults);
 *   console.log(scoredAnswer.overallConfidence);
 *   console.log(scoredAnswer.groundedRatio);
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class ConfidenceScorer extends Effect.Service<ConfidenceScorer>()($I`ConfidenceScorer`, {
  accessors: true,
  effect: Effect.succeed({
    /**
     * Apply depth penalty for inferred relations
     *
     * @param baseConfidence - Confidence before penalty
     * @param depth - Inference depth (number of hops)
     * @returns Confidence after applying depth penalty
     *
     * @since 0.1.0
     */
    applyDepthPenalty: (baseConfidence: number, depth: number): number => {
      const penalty = computeDepthPenalty(depth);
      return clampConfidence(baseConfidence * penalty);
    },

    /**
     * Score a single citation validation result
     *
     * Computes final confidence by:
     * 1. Taking minimum of entity and relation confidences
     * 2. Applying depth penalty if relation was inferred
     *
     * @param result - Citation validation result from CitationValidator
     * @returns Scored citation with final confidence and grounding status
     *
     * @since 0.1.0
     */
    scoreCitation: (result: CitationValidationResult): ScoredCitation => {
      // 1. Get minimum entity confidence
      const entityConf = minEntityConfidence(result.entityResults);

      // 2. Get relation confidence (default 1.0 if no relation)
      const relationResult = O.fromNullable(result.relationResult);
      const relationConf = O.match(relationResult, {
        onNone: () => 1.0,
        onSome: (r) => r.confidence,
      });

      // 3. Base confidence = min(entity, relation)
      const baseConfidence = Num.min(entityConf, relationConf);

      // 4. Apply depth penalty if relation was inferred
      const inferenceDepth = O.match(relationResult, {
        onNone: () => 0,
        onSome: (r) => {
          if (!r.isInferred) {
            return 0;
          }
          // Get depth from reasoning trace, default to 1 if inferred but no trace
          const traceOpt = O.fromNullable(r.reasoningTrace);
          return O.match(traceOpt, {
            onNone: () => 1,
            onSome: (trace) => trace.depth,
          });
        },
      });

      const finalConfidence =
        inferenceDepth > 0 ? clampConfidence(baseConfidence * computeDepthPenalty(inferenceDepth)) : baseConfidence;

      // 5. Determine grounding status
      const isGrounded = Num.greaterThanOrEqualTo(finalConfidence, GROUNDED_THRESHOLD);
      const shouldExclude = Num.lessThan(finalConfidence, EXCLUDE_THRESHOLD);

      return {
        citation: result.citation,
        validationResult: result,
        finalConfidence,
        isGrounded,
        shouldExclude,
      };
    },

    /**
     * Score all citations and compute answer-level confidence
     *
     * Answer confidence is weighted average of citation confidences,
     * where weights are claim text lengths (longer claims contribute more).
     *
     * @param text - Answer text
     * @param validationResults - Validation results for all citations
     * @returns Scored answer with overall confidence and grounding ratio
     *
     * @since 0.1.0
     */
    scoreAnswer: (text: string, validationResults: ReadonlyArray<CitationValidationResult>): ScoredAnswer => {
      // 1. Score all citations
      const scoredCitations = A.map(validationResults, (result): ScoredCitation => {
        // Inline scoring to avoid circular reference
        const entityConf = minEntityConfidence(result.entityResults);

        const relationResult = O.fromNullable(result.relationResult);
        const relationConf = O.match(relationResult, {
          onNone: () => 1.0,
          onSome: (r) => r.confidence,
        });

        const baseConfidence = Num.min(entityConf, relationConf);

        const inferenceDepth = O.match(relationResult, {
          onNone: () => 0,
          onSome: (r) => {
            if (!r.isInferred) {
              return 0;
            }
            const traceOpt = O.fromNullable(r.reasoningTrace);
            return O.match(traceOpt, {
              onNone: () => 1,
              onSome: (trace) => trace.depth,
            });
          },
        });

        const finalConfidence =
          inferenceDepth > 0 ? clampConfidence(baseConfidence * computeDepthPenalty(inferenceDepth)) : baseConfidence;

        const isGrounded = Num.greaterThanOrEqualTo(finalConfidence, GROUNDED_THRESHOLD);
        const shouldExclude = Num.lessThan(finalConfidence, EXCLUDE_THRESHOLD);

        return {
          citation: result.citation,
          validationResult: result,
          finalConfidence,
          isGrounded,
          shouldExclude,
        };
      });

      // 2. Compute weighted average (weight = claim text length)
      const weightedValues = A.map(scoredCitations, (sc) => ({
        value: sc.finalConfidence,
        weight: Str.length(sc.citation.claimText),
      }));

      const overallConfidence = weightedAverage(weightedValues);

      // 3. Compute grounded ratio
      const groundedCount = A.length(A.filter(scoredCitations, (sc) => sc.isGrounded));
      const totalCount = A.length(scoredCitations);
      const groundedRatio = totalCount > 0 ? groundedCount / totalCount : 0;

      return {
        text,
        citations: scoredCitations,
        overallConfidence,
        groundedRatio,
      };
    },

    /**
     * Compute weighted average of values
     *
     * Returns 0 if total weight is 0 (handles division by zero).
     *
     * @param values - Array of value/weight pairs
     * @returns Weighted average, or 0 if no weights
     *
     * @since 0.1.0
     */
    weightedAverage: (values: ReadonlyArray<{ value: number; weight: number }>): number => {
      return weightedAverage(values);
    },
  }),
}) {}

/**
 * Standalone weighted average computation
 *
 * Extracted to avoid duplication in scoreAnswer implementation.
 *
 * @param values - Array of value/weight pairs
 * @returns Weighted average, or 0 if no weights
 *
 * @since 0.1.0
 * @category helpers
 */
const weightedAverage = (values: ReadonlyArray<{ value: number; weight: number }>): number => {
  if (A.isEmptyReadonlyArray(values)) {
    return 0;
  }

  const totalWeight = A.reduce(values, 0, (acc, v) => acc + v.weight);

  // Handle division by zero (all weights are 0)
  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = A.reduce(values, 0, (acc, v) => acc + v.value * v.weight);

  return clampConfidence(weightedSum / totalWeight);
};

// =============================================================================
// Layer
// =============================================================================

/**
 * Live layer for ConfidenceScorer
 *
 * No external dependencies - all computations are pure.
 *
 * @since 0.1.0
 * @category layers
 */
export const ConfidenceScorerLive = ConfidenceScorer.Default;
