/**
 * Grounded Answer Schemas for GraphRAG
 *
 * Defines schema types for grounded answers with citations and reasoning traces.
 * These schemas support verifiable LLM responses linked to knowledge graph entities.
 *
 * @module knowledge-server/GraphRAG/AnswerSchemas
 * @since 0.1.0
 */

import { Confidence } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

/**
 * Single step in an inference reasoning trace.
 *
 * Represents one logical step in the reasoning path from premises to conclusion.
 *
 * @example
 * ```ts
 * const step = InferenceStep.make({
 *   rule: "sameAs transitivity",
 *   premises: ["Alice", "Alice_LinkedIn"],
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class InferenceStep extends S.Class<InferenceStep>("InferenceStep")({
  /**
   * Inference rule applied in this step
   *
   * @example "sameAs transitivity", "knows direct", "subClassOf"
   */
  rule: S.NonEmptyString,

  /**
   * Input facts/premises used in this step
   *
   * @example ["Alice", "Alice_LinkedIn"]
   */
  premises: S.Array(S.String),
}) {}

/**
 * Reasoning trace for inferred relationships.
 *
 * Contains the complete inference path showing how a conclusion was derived
 * from explicit facts through rule application.
 *
 * @example
 * ```ts
 * const trace = ReasoningTrace.make({
 *   inferenceSteps: [
 *     { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
 *     { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
 *     { rule: "sameAs transitivity", premises: ["Bob_LinkedIn", "Bob"] },
 *   ],
 *   depth: 3,
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class ReasoningTrace extends S.Class<ReasoningTrace>("ReasoningTrace")({
  /**
   * Ordered sequence of inference steps from premises to conclusion
   */
  inferenceSteps: S.Array(InferenceStep),

  /**
   * Inference depth (number of hops from explicit facts)
   * Must be >= 1 for any inferred relationship
   */
  depth: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
}) {}

/**
 * Citation linking a claim in the answer to graph entities/relations.
 *
 * Each citation provides provenance for a specific claim in the grounded answer,
 * referencing the knowledge graph entities and optionally the relation that
 * supports the claim.
 *
 * @example
 * ```ts
 * const citation = Citation.make({
 *   claimText: "Alice knows Bob",
 *   entityIds: [
 *     KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__alice-uuid"),
 *     KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__bob-uuid"),
 *   ],
 *   relationId: KnowledgeEntityIds.RelationId.make("knowledge_relation__knows-uuid"),
 *   confidence: 0.95,
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class Citation extends S.Class<Citation>("Citation")({
  /**
   * Text span from the answer being cited
   */
  claimText: S.NonEmptyString,

  /**
   * Entity IDs referenced by this citation
   * Must contain at least one entity for a valid citation
   */
  entityIds: S.Array(KnowledgeEntityIds.KnowledgeEntityId),

  /**
   * Optional relation ID if the claim involves a relationship between entities
   */
  relationId: S.optional(KnowledgeEntityIds.RelationId),

  /**
   * Confidence score for this citation (0.0-1.0)
   * - 1.0: Direct entity/relation match
   * - 0.5-0.9: Fuzzy match or inferred relationship
   * - < 0.5: Low confidence, may be ungrounded
   */
  confidence: Confidence,
}) {}

/**
 * Grounded answer with citations and optional reasoning trace.
 *
 * Represents a complete answer from the GraphRAG pipeline with full provenance.
 * Each claim in the answer text should have a corresponding citation linking
 * it to the underlying knowledge graph.
 *
 * @example
 * ```ts
 * const answer = GroundedAnswer.make({
 *   text: "Alice knows Bob through their LinkedIn connection.",
 *   citations: [
 *     {
 *       claimText: "Alice knows Bob",
 *       entityIds: [aliceId, bobId],
 *       relationId: knowsRelationId,
 *       confidence: 0.85,
 *     },
 *   ],
 *   confidence: 0.85,
 *   reasoning: {
 *     inferenceSteps: [
 *       { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
 *       { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
 *     ],
 *     depth: 2,
 *   },
 * });
 * ```
 *
 * @since 0.1.0
 * @category schemas
 */
export class GroundedAnswer extends S.Class<GroundedAnswer>("GroundedAnswer")({
  /**
   * The answer text with citation markers
   */
  text: S.NonEmptyString,

  /**
   * Citations linking claims to graph entities/relations
   */
  citations: S.Array(Citation),

  /**
   * Overall confidence score for the answer (0.0-1.0)
   * Computed as weighted average of citation confidences
   */
  confidence: Confidence,

  /**
   * Optional reasoning trace for answers involving inferred relationships
   */
  reasoning: S.optional(ReasoningTrace),
}) {}
