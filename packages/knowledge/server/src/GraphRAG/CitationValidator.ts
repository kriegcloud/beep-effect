/**
 * Citation Validator for GraphRAG
 *
 * Validates citations against the knowledge graph to verify that referenced
 * entities and relations actually exist. Supports both direct validation via
 * SPARQL and inferred relation detection via the ReasonerService.
 *
 * @module knowledge-server/GraphRAG/CitationValidator
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import type { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import type { Quad } from "@beep/knowledge-domain/value-objects";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import { ReasonerService } from "../Reasoning/ReasonerService";
import { SparqlService, type SparqlServiceError } from "../Sparql/SparqlService";
import { type Citation, InferenceStep, type ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/CitationValidator");

/**
 * Result of validating a single entity reference.
 *
 * @since 0.1.0
 * @category types
 */
export interface EntityValidationResult {
  readonly entityId: KnowledgeEntityIds.KnowledgeEntityId.Type;
  readonly found: boolean;
  readonly confidence: number;
}

/**
 * Result of validating a relation reference.
 *
 * Includes reasoning trace if the relation was inferred rather than direct.
 *
 * @since 0.1.0
 * @category types
 */
export interface RelationValidationResult {
  readonly relationId: KnowledgeEntityIds.RelationId.Type;
  readonly found: boolean;
  readonly isInferred: boolean;
  readonly confidence: number;
  readonly reasoningTrace?: ReasoningTrace;
}

/**
 * Complete validation result for a citation.
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
 * Union of all citation validation errors
 *
 * @since 0.1.0
 * @category types
 */
export type CitationValidationError = SparqlServiceError | MaxDepthExceededError | MaxInferencesExceededError;

/**
 * Confidence decay factor per inference depth level.
 * Direct relations have confidence 1.0, each inference step reduces by this factor.
 *
 * @since 0.1.0
 * @category constants
 */
const INFERENCE_CONFIDENCE_DECAY = 0.1;

/**
 * Base confidence for inferred relations (before depth penalty).
 *
 * @since 0.1.0
 * @category constants
 */
const BASE_INFERRED_CONFIDENCE = 0.9;

/**
 * Minimum confidence for inferred relations regardless of depth.
 *
 * @since 0.1.0
 * @category constants
 */
const MIN_INFERRED_CONFIDENCE = 0.5;

/**
 * Build a SPARQL ASK query to check if an entity exists in the graph.
 *
 * @since 0.1.0
 * @category internal
 */
const buildEntityExistsQuery = (entityId: string): string => `
  ASK WHERE {
    { ?s ?p ?o . FILTER(?s = <${entityId}>) }
    UNION
    { ?s ?p ?o . FILTER(?o = <${entityId}>) }
  }
`;

/**
 * Build a SPARQL ASK query to check if a relation exists directly.
 *
 * @since 0.1.0
 * @category internal
 */
const buildRelationExistsQuery = (relationId: string): string => `
  ASK WHERE {
    ?s ?p ?o .
    FILTER(?p = <${relationId}>)
  }
`;

/**
 * Calculate confidence for an inferred relation based on inference depth.
 *
 * @since 0.1.0
 * @category internal
 */
const calculateInferredConfidence = (depth: number): number => {
  const penalty = depth * INFERENCE_CONFIDENCE_DECAY;
  return Math.max(MIN_INFERRED_CONFIDENCE, BASE_INFERRED_CONFIDENCE - penalty);
};

/**
 * Check if a quad matches the target relation ID.
 *
 * @since 0.1.0
 * @category internal
 */
const quadMatchesRelation = (quad: Quad, relationId: string): boolean => quad.predicate === relationId;

/**
 * Build a reasoning trace from provenance information.
 *
 * @since 0.1.0
 * @category internal
 */
const buildReasoningTrace = (
  provenance: Record<string, { ruleId: string; sourceQuads: ReadonlyArray<string> }>,
  depth: number
): ReasoningTrace => {
  const inferenceSteps = A.map(Struct.keys(provenance), (key) => {
    const prov = provenance[key];
    return new InferenceStep({
      rule: prov?.ruleId ?? "unknown",
      premises: A.map(prov?.sourceQuads ?? [], String),
    });
  });

  return {
    inferenceSteps,
    depth,
  } as ReasoningTrace;
};

/**
 * CitationValidator Effect.Service
 *
 * Validates citations against the knowledge graph by checking entity existence
 * and relation validity. Uses SparqlService for direct lookups and ReasonerService
 * for detecting inferred relations.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * import { CitationValidator } from "@beep/knowledge-server/GraphRAG";
 *
 * const program = Effect.gen(function* () {
 *   const validator = yield* CitationValidator;
 *
 *   const citation = new Citation({
 *     claimText: "Alice knows Bob",
 *     entityIds: [aliceId, bobId],
 *     relationId: knowsRelationId,
 *     confidence: 0.9,
 *   });
 *
 *   const result = yield* validator.validateCitation(citation);
 *   console.log(`Validation confidence: ${result.overallConfidence}`);
 * });
 * ```
 */
export class CitationValidator extends Effect.Service<CitationValidator>()($I`CitationValidator`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const sparql = yield* SparqlService;
    const reasoner = yield* ReasonerService;

    /**
     * Validate that an entity exists in the knowledge graph.
     *
     * @param entityId - The entity ID to validate
     * @returns EntityValidationResult with found status and confidence
     *
     * @since 0.1.0
     */
    const validateEntity = (
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
    ): Effect.Effect<EntityValidationResult, SparqlServiceError> =>
      Effect.gen(function* () {
        const query = buildEntityExistsQuery(entityId);
        const exists = yield* sparql.ask(query);

        return {
          entityId,
          found: exists,
          confidence: exists ? 1.0 : 0.0,
        };
      }).pipe(
        Effect.withSpan("CitationValidator.validateEntity", {
          attributes: { entityId },
        })
      );

    /**
     * Validate that a relation exists in the knowledge graph.
     *
     * First checks for direct existence via SPARQL, then falls back to
     * reasoning to detect inferred relations.
     *
     * @param relationId - The relation ID to validate
     * @returns RelationValidationResult with found status, inference flag, and confidence
     *
     * @since 0.1.0
     */
    const validateRelation = (
      relationId: KnowledgeEntityIds.RelationId.Type
    ): Effect.Effect<
      RelationValidationResult,
      SparqlServiceError | MaxDepthExceededError | MaxInferencesExceededError
    > =>
      Effect.gen(function* () {
        // First check for direct relation
        const directQuery = buildRelationExistsQuery(relationId);
        const directExists = yield* sparql.ask(directQuery);

        if (directExists) {
          return {
            relationId,
            found: true,
            isInferred: false,
            confidence: 1.0,
          };
        }

        // Fall back to reasoning to check for inferred relations
        const inferenceResult = yield* reasoner.infer();

        // Check if any derived triple matches the relation
        const matchingTriple = A.findFirst(inferenceResult.derivedTriples, (quad) =>
          quadMatchesRelation(quad, relationId)
        );

        if (O.isSome(matchingTriple)) {
          // Relation was inferred - calculate confidence from provenance
          const depth = inferenceResult.stats.iterations;
          const confidence = calculateInferredConfidence(depth);
          const reasoningTrace = buildReasoningTrace(inferenceResult.provenance, depth);

          return {
            relationId,
            found: true,
            isInferred: true,
            confidence,
            reasoningTrace,
          };
        }

        // Relation not found directly or through inference
        return {
          relationId,
          found: false,
          isInferred: false,
          confidence: 0.0,
        };
      }).pipe(
        Effect.withSpan("CitationValidator.validateRelation", {
          attributes: { relationId },
        })
      );

    /**
     * Validate a complete citation including all entity and relation references.
     *
     * @param citation - The citation to validate
     * @returns CitationValidationResult with per-entity results and overall confidence
     *
     * @since 0.1.0
     */
    const validateCitation = (citation: Citation): Effect.Effect<CitationValidationResult, CitationValidationError> =>
      Effect.gen(function* () {
        // Validate all entities in parallel
        const entityResults = yield* Effect.all(A.map(citation.entityIds, validateEntity), {
          concurrency: "unbounded",
        });

        // Validate relation if present
        const relationResult = O.isSome(O.fromNullable(citation.relationId))
          ? yield* validateRelation(citation.relationId as KnowledgeEntityIds.RelationId.Type)
          : undefined;

        // Calculate overall confidence as minimum of all confidences
        const entityConfidences = A.map(entityResults, (r) => r.confidence);
        const allConfidences =
          relationResult !== undefined ? A.append(entityConfidences, relationResult.confidence) : entityConfidences;

        const overallConfidence = A.isEmptyReadonlyArray(allConfidences) ? 0.0 : Math.min(...allConfidences);

        // Handle exactOptionalPropertyTypes - only include relationResult if defined
        const baseResult = {
          citation,
          entityResults,
          overallConfidence,
        };

        return relationResult !== undefined ? { ...baseResult, relationResult } : baseResult;
      }).pipe(
        Effect.withSpan("CitationValidator.validateCitation", {
          attributes: {
            claimText: citation.claimText,
            entityCount: citation.entityIds.length,
            hasRelation: citation.relationId !== undefined,
          },
        })
      );

    /**
     * Validate multiple citations in parallel.
     *
     * @param citations - Array of citations to validate
     * @returns Array of validation results
     *
     * @since 0.1.0
     */
    const validateAllCitations = (
      citations: ReadonlyArray<Citation>
    ): Effect.Effect<ReadonlyArray<CitationValidationResult>, CitationValidationError> =>
      Effect.all(A.map(citations, validateCitation), { concurrency: "unbounded" }).pipe(
        Effect.withSpan("CitationValidator.validateAllCitations", {
          attributes: { citationCount: citations.length },
        })
      );

    return {
      validateEntity,
      validateRelation,
      validateCitation,
      validateAllCitations,
    };
  }),
  dependencies: [SparqlService.Default, ReasonerService.Default],
}) {}
