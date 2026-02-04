/**
 * Reasoning Trace Formatter for GraphRAG
 *
 * Converts inference provenance from the reasoning engine into human-readable
 * reasoning traces for inclusion in grounded answers. Provides depth calculation,
 * step extraction, and trace summarization.
 *
 * @module knowledge-server/GraphRAG/ReasoningTraceFormatter
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import type { InferenceProvenance, InferenceResult } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { InferenceStep, ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/ReasoningTraceFormatter");

// =============================================================================
// Pure Helper Functions
// =============================================================================

/**
 * Convert an InferenceProvenance to an InferenceStep.
 *
 * Maps the internal provenance format to the user-facing inference step schema.
 *
 * @param provenance - The inference provenance to convert
 * @returns An InferenceStep with rule and premises
 *
 * @since 0.1.0
 * @category helpers
 */
const provenanceToStep = (provenance: InferenceProvenance): InferenceStep =>
  new InferenceStep({
    rule: provenance.ruleId as string & { readonly NonEmptyString: unique symbol },
    premises: [...provenance.sourceQuads],
  });

/**
 * Calculate the inference depth for a triple by traversing its provenance chain.
 *
 * Depth is defined as:
 * - 0 for explicit facts (no provenance entry)
 * - 1 + max(depth of sourceQuads that are also inferred) for inferred triples
 *
 * Uses cycle detection to handle potentially circular references.
 *
 * @param provenanceMap - Map of triple IDs to their provenance
 * @param tripleId - The triple ID to calculate depth for
 * @param visited - Set of already-visited triple IDs (for cycle detection)
 * @returns The inference depth (0 if explicit, >= 1 if inferred)
 *
 * @since 0.1.0
 * @category computation
 */
const calculateDepth = (
  provenanceMap: Record<string, InferenceProvenance>,
  tripleId: string,
  visited: MutableHashSet.MutableHashSet<string> = MutableHashSet.empty()
): number => {
  // If already visited, we have a cycle - return 0 to break it
  if (MutableHashSet.has(visited, tripleId)) {
    return 0;
  }

  // Look up provenance for this triple
  const maybeProvenance = R.get(provenanceMap, tripleId);

  return O.match(maybeProvenance, {
    // No provenance entry means this is an explicit fact (depth 0)
    onNone: () => 0,
    onSome: (provenance) => {
      // Mark as visited to prevent cycles
      MutableHashSet.add(visited, tripleId);

      // Calculate max depth of source quads
      const sourceDepths = A.map(provenance.sourceQuads, (sourceId) =>
        calculateDepth(provenanceMap, sourceId, visited)
      );

      // Depth is 1 + max(source depths), minimum 1 for any inferred triple
      const maxSourceDepth = A.isEmptyReadonlyArray(sourceDepths) ? 0 : Math.max(...sourceDepths);

      return 1 + maxSourceDepth;
    },
  });
};

/**
 * BFS traversal state for collecting inference steps.
 *
 * @since 0.1.0
 * @category types
 */
interface BfsState {
  readonly steps: ReadonlyArray<InferenceStep>;
  readonly visited: ReadonlySet<string>;
  readonly queue: ReadonlyArray<string>;
}

/**
 * Process a single BFS iteration, returning updated state.
 *
 * @since 0.1.0
 * @category helpers
 */
const processBfsNode = (
  provenanceMap: Record<string, InferenceProvenance>,
  state: BfsState,
  currentId: string
): BfsState => {
  if (state.visited.has(currentId)) {
    return state;
  }

  const maybeProvenance = R.get(provenanceMap, currentId);

  return O.match(maybeProvenance, {
    onNone: () => ({
      ...state,
      visited: new Set([...state.visited, currentId]),
    }),
    onSome: (provenance) => {
      const newVisited = new Set([...state.visited, currentId]);
      const newSteps = A.append(state.steps, provenanceToStep(provenance));
      const newQueueItems = A.filter(provenance.sourceQuads, (sourceId) => !newVisited.has(sourceId));
      return {
        steps: newSteps,
        visited: newVisited,
        queue: A.appendAll(state.queue, newQueueItems),
      };
    },
  });
};

/**
 * Recursively process BFS queue until empty.
 *
 * @since 0.1.0
 * @category helpers
 */
const processBfsQueue = (provenanceMap: Record<string, InferenceProvenance>, state: BfsState): BfsState => {
  const headOption = A.head(state.queue);

  return O.match(headOption, {
    onNone: () => state,
    onSome: (currentId) => {
      const remainingQueue = A.drop(state.queue, 1);
      const stateWithUpdatedQueue = { ...state, queue: remainingQueue };
      const nextState = processBfsNode(provenanceMap, stateWithUpdatedQueue, currentId);
      return processBfsQueue(provenanceMap, nextState);
    },
  });
};

/**
 * Collect all inference steps by walking the provenance chain in BFS order.
 *
 * Builds an ordered list of steps from the root triple down to explicit facts,
 * which represents the reasoning path from premises to conclusion.
 *
 * @param provenanceMap - Map of triple IDs to their provenance
 * @param rootTripleId - The starting triple ID
 * @returns Array of InferenceSteps in reasoning order
 *
 * @since 0.1.0
 * @category helpers
 */
const collectInferenceSteps = (
  provenanceMap: Record<string, InferenceProvenance>,
  rootTripleId: string
): ReadonlyArray<InferenceStep> => {
  const initialState: BfsState = {
    steps: [],
    visited: new Set(),
    queue: [rootTripleId],
  };

  const finalState = processBfsQueue(provenanceMap, initialState);
  return finalState.steps;
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * ReasoningTraceFormatter - Converts inference provenance to reasoning traces
 *
 * Provides utilities for formatting inference results into human-readable
 * reasoning traces that can be included in grounded answers.
 *
 * Key operations:
 * - `formatReasoningTrace`: Build a complete trace for a specific inferred triple
 * - `summarizeTrace`: Generate human-readable summary of a trace
 * - `calculateDepth`: Compute inference depth for a triple
 *
 * @example
 * ```ts
 * import { ReasoningTraceFormatter } from "@beep/knowledge-server/GraphRAG";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const formatter = yield* ReasoningTraceFormatter;
 *
 *   // After running inference...
 *   const inferenceResult = yield* reasoner.run(graph);
 *
 *   // Format reasoning trace for a specific derived triple
 *   const trace = formatter.formatReasoningTrace(
 *     inferenceResult,
 *     "derived_triple_id"
 *   );
 *
 *   if (O.isSome(trace)) {
 *     yield* Effect.logInfo(formatter.summarizeTrace(trace.value));
 *     // "Inferred via 3 steps: sameAs transitivity -> knows direct -> sameAs transitivity"
 *   }
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class ReasoningTraceFormatter extends Effect.Service<ReasoningTraceFormatter>()($I`ReasoningTraceFormatter`, {
  accessors: true,
  effect: Effect.succeed({
    /**
     * Format a reasoning trace for a specific inferred triple.
     *
     * Looks up the triple in the inference result's provenance map and builds
     * a complete ReasoningTrace by walking the provenance chain.
     *
     * @param result - The complete inference result with provenance map
     * @param tripleId - The ID of the triple to get the trace for
     * @returns Some(ReasoningTrace) if the triple was inferred, None if explicit
     */
    formatReasoningTrace: (result: InferenceResult, tripleId: string): O.Option<ReasoningTrace> => {
      const maybeProvenance = R.get(result.provenance, tripleId);

      return O.match(maybeProvenance, {
        onNone: () => O.none(),
        onSome: (_provenance) => {
          const inferenceSteps = collectInferenceSteps(result.provenance, tripleId);

          if (A.isEmptyReadonlyArray(inferenceSteps)) {
            return O.none();
          }

          const depth = calculateDepth(result.provenance, tripleId);
          const validDepth = Math.max(1, depth);

          return O.some(
            new ReasoningTrace({
              inferenceSteps: [...inferenceSteps],
              depth: validDepth,
            })
          );
        },
      });
    },

    /**
     * Generate a human-readable summary of a reasoning trace.
     *
     * Formats the trace as a readable string showing the inference path.
     *
     * @param trace - The reasoning trace to summarize
     * @returns A human-readable summary string
     *
     * @example
     * "Inferred via 3 steps: sameAs transitivity -> knows direct -> sameAs transitivity"
     */
    summarizeTrace: (trace: ReasoningTrace): string => {
      const stepCount = A.length(trace.inferenceSteps);

      if (stepCount === 0) {
        return "No inference steps recorded";
      }

      const ruleNames = pipe(
        trace.inferenceSteps,
        A.map((step) => step.rule),
        A.join(" -> ")
      );

      const stepLabel = stepCount === 1 ? "step" : "steps";
      return `Inferred via ${stepCount} ${stepLabel}: ${ruleNames}`;
    },

    /**
     * Calculate the inference depth for a triple.
     *
     * Exposed for external use when only depth calculation is needed.
     *
     * @param provenanceMap - Map of triple IDs to their provenance
     * @param tripleId - The triple ID to calculate depth for
     * @returns The inference depth (0 if explicit, >= 1 if inferred)
     */
    calculateDepth: (provenanceMap: Record<string, InferenceProvenance>, tripleId: string): number =>
      calculateDepth(provenanceMap, tripleId, MutableHashSet.empty()),
  }),
}) {}
