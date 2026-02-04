/**
 * Forward-Chaining Inference Engine
 *
 * Implements a forward-chaining algorithm for RDFS reasoning.
 * Repeatedly applies entailment rules until no new inferences are generated
 * (fixed-point) or limits are reached.
 *
 * @module knowledge-server/Reasoning/ForwardChainer
 * @since 0.1.0
 */

import { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import {
  InferenceProvenance,
  InferenceResult,
  InferenceStats,
  type Quad,
  type ReasoningConfig,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { quadId, type RuleInference, rdfsRules } from "./RdfsRules";

/**
 * Internal state for forward-chaining iteration
 */
interface ChainState {
  readonly knownQuadIds: MutableHashSet.MutableHashSet<string>;
  readonly allQuads: Quad[];
  readonly derivedQuads: Quad[];
  readonly provenance: MutableHashMap.MutableHashMap<string, InferenceProvenance>;
  readonly totalInferences: number;
  readonly iterations: number;
}

/**
 * Initialize chain state from input quads
 */
const initializeState = (initialQuads: ReadonlyArray<Quad>): ChainState => {
  const knownQuadIds = MutableHashSet.empty<string>();
  const allQuads = A.empty<Quad>();

  // Deduplicate initial quads using functional filter
  const uniqueQuads = pipe(
    initialQuads,
    A.filterMap((quad) => {
      const id = quadId(quad);
      if (MutableHashSet.has(knownQuadIds, id)) {
        return O.none();
      }
      MutableHashSet.add(knownQuadIds, id);
      return O.some(quad);
    })
  );

  // Add unique quads to working set
  for (const quad of uniqueQuads) {
    allQuads.push(quad);
  }

  return {
    knownQuadIds,
    allQuads,
    derivedQuads: [],
    provenance: MutableHashMap.empty<string, InferenceProvenance>(),
    totalInferences: 0,
    iterations: 0,
  };
};

/**
 * Collect all new inferences from applying rules to current knowledge base
 */
const collectNewInferences = (state: ChainState): ReadonlyArray<RuleInference> =>
  pipe(
    rdfsRules,
    A.flatMap((rule) => rule.apply(state.allQuads)),
    A.filter((inference) => {
      const id = quadId(inference.quad);
      return !MutableHashSet.has(state.knownQuadIds, id);
    })
  );

/**
 * Apply inferences to state, recording provenance
 *
 * Deduplicates within the batch to handle same-iteration duplicates
 * from different rules generating the same quad.
 */
const applyInferences = (state: ChainState, inferences: ReadonlyArray<RuleInference>): number => {
  // Filter to unique inferences not already known, deduplicating within batch
  const uniqueInferences = pipe(
    inferences,
    A.filterMap((inference) => {
      const id = quadId(inference.quad);
      if (MutableHashSet.has(state.knownQuadIds, id)) {
        return O.none();
      }
      // Mark as known immediately to dedupe within this batch
      MutableHashSet.add(state.knownQuadIds, id);
      return O.some({ inference, id });
    })
  );

  // Apply all unique inferences
  pipe(
    uniqueInferences,
    A.forEach(({ inference, id }) => {
      state.allQuads.push(inference.quad);
      state.derivedQuads.push(inference.quad);
      MutableHashMap.set(
        state.provenance,
        id,
        new InferenceProvenance({
          ruleId: inference.ruleId,
          sourceQuads: inference.sourceQuadIds,
        })
      );
    })
  );

  return A.length(uniqueInferences);
};

/**
 * Check if rules would still generate new inferences
 *
 * Used to determine if we've hit depth limit mid-inference vs at natural fixed-point.
 */
const wouldGenerateMore = (state: ChainState): boolean =>
  pipe(
    rdfsRules,
    A.flatMap((rule) => rule.apply(state.allQuads)),
    A.some((inference) => !MutableHashSet.has(state.knownQuadIds, quadId(inference.quad)))
  );

/**
 * Convert mutable provenance map to immutable Record
 */
const finalizeProvenance = (
  provenance: MutableHashMap.MutableHashMap<string, InferenceProvenance>
): Record<string, InferenceProvenance> => {
  const result = R.empty<string, InferenceProvenance>();
  MutableHashMap.forEach(provenance, (value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Execute forward-chaining inference on a set of quads
 *
 * Implements a fixed-point algorithm that repeatedly applies RDFS entailment
 * rules until either:
 * - No new inferences are generated (convergence)
 * - Maximum depth limit is reached
 * - Maximum inference count limit is reached
 *
 * @param initialQuads - The base quads to reason over
 * @param config - Reasoning configuration (depth limit, inference limit)
 * @returns InferenceResult with derived quads and provenance
 *
 * @since 0.1.0
 * @category reasoning
 */
export const forwardChain = (
  initialQuads: ReadonlyArray<Quad>,
  config: ReasoningConfig
): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
  Effect.gen(function* () {
    const startTime = yield* DateTime.now;
    const state = initializeState(initialQuads);

    let iterations = 0;
    let totalInferences = 0;

    // Fixed-point iteration
    while (iterations < config.maxDepth) {
      iterations++;

      const newInferences = collectNewInferences(state);

      // If no new inferences, we've reached fixed-point
      if (A.isEmptyReadonlyArray(newInferences)) {
        break;
      }

      // Apply inferences (deduplicates within batch)
      const addedCount = applyInferences(state, newInferences);

      // Check inference limit after adding
      totalInferences += addedCount;
      if (totalInferences > config.maxInferences) {
        return yield* new MaxInferencesExceededError({
          message: `Exceeded maximum inferences limit: ${config.maxInferences}`,
          limit: config.maxInferences,
          inferencesGenerated: totalInferences,
        });
      }
    }

    // Check if we hit depth limit without reaching fixed-point
    if (iterations >= config.maxDepth && wouldGenerateMore(state)) {
      return yield* new MaxDepthExceededError({
        message: `Exceeded maximum reasoning depth: ${config.maxDepth}`,
        limit: config.maxDepth,
        iterations,
      });
    }

    const endTime = yield* DateTime.now;
    const durationMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

    return new InferenceResult({
      derivedTriples: state.derivedQuads,
      provenance: finalizeProvenance(state.provenance),
      stats: new InferenceStats({
        iterations,
        triplesInferred: A.length(state.derivedQuads),
        durationMs,
      }),
    });
  }).pipe(Effect.withSpan("ForwardChainer.forwardChain"));
