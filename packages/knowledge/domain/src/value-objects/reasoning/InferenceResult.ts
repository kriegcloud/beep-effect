/**
 * Inference result value object
 *
 * Represents the output of a reasoning operation including derived triples,
 * provenance information, and execution statistics.
 *
 * @module knowledge-domain/value-objects/reasoning/InferenceResult
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Quad } from "../rdf/Quad";

const $I = $KnowledgeDomainId.create("value-objects/reasoning/InferenceResult");

/**
 * InferenceProvenance - Tracks the origin of an inferred triple
 *
 * Records which rule generated the inference and which source quads
 * were used as input to the rule.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class InferenceProvenance extends S.Class<InferenceProvenance>($I`InferenceProvenance`)({
  /**
   * Identifier of the rule that produced this inference
   */
  ruleId: S.String.annotations({
    title: "Rule ID",
    description: "Identifier of the inference rule that was applied",
  }),

  /**
   * Identifiers of the source quads used as rule input
   */
  sourceQuads: S.Array(S.String).annotations({
    title: "Source Quads",
    description: "Identifiers of quads that triggered this inference",
  }),
}) {}

/**
 * InferenceStats - Execution statistics for reasoning operation
 *
 * @since 0.1.0
 * @category value-objects
 */
export class InferenceStats extends S.Class<InferenceStats>($I`InferenceStats`)({
  /**
   * Number of rule application iterations performed
   */
  iterations: S.NonNegativeInt.annotations({
    title: "Iterations",
    description: "Number of rule application iterations",
  }),

  /**
   * Total number of new triples inferred
   */
  triplesInferred: S.NonNegativeInt.annotations({
    title: "Triples Inferred",
    description: "Total number of new triples generated",
  }),

  /**
   * Execution time in milliseconds
   */
  durationMs: S.NonNegative.annotations({
    title: "Duration (ms)",
    description: "Execution time in milliseconds",
  }),
}) {}

/**
 * InferenceResult - Complete result of a reasoning operation
 *
 * Contains all derived triples along with provenance tracking and
 * execution statistics for debugging and auditing.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class InferenceResult extends S.Class<InferenceResult>($I`InferenceResult`)({
  /**
   * Newly derived RDF triples from inference
   */
  derivedTriples: S.Array(Quad).annotations({
    title: "Derived Triples",
    description: "RDF quads generated through inference",
  }),

  /**
   * Provenance map from derived triple ID to its origin
   */
  provenance: S.Record({ key: S.String, value: InferenceProvenance }).annotations({
    title: "Provenance",
    description: "Maps derived triple IDs to their inference provenance",
  }),

  /**
   * Execution statistics
   */
  stats: InferenceStats.annotations({
    title: "Statistics",
    description: "Execution statistics for the reasoning operation",
  }),
}) {}

/**
 * Creates an empty inference result (no inferences made).
 *
 * @since 0.1.0
 * @category value-objects
 */
export const emptyInferenceResult = new InferenceResult({
  derivedTriples: [],
  provenance: {},
  stats: new InferenceStats({
    iterations: 0,
    triplesInferred: 0,
    durationMs: 0,
  }),
});
