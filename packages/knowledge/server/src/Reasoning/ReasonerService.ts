/**
 * ReasonerService
 *
 * Effect.Service for RDFS semantic reasoning over RDF knowledge graphs.
 * Uses forward-chaining inference to derive implicit facts from explicit triples.
 *
 * @module knowledge-server/Reasoning/ReasonerService
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import type { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import {
  DefaultReasoningConfig,
  type InferenceResult,
  QuadPattern,
  type ReasoningConfig,
} from "@beep/knowledge-domain/value-objects";
import * as Effect from "effect/Effect";
import { RdfStore } from "../Rdf/RdfStoreService";
import { forwardChain } from "./ForwardChainer";

const $I = $KnowledgeServerId.create("Reasoning/ReasonerService");

/**
 * ReasonerService Effect.Service
 *
 * Provides RDFS reasoning capabilities over RDF quads stored in RdfStore.
 * The service retrieves all quads from the store and applies RDFS entailment
 * rules to derive implicit facts.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * import { ReasonerService } from "@beep/knowledge-server/Reasoning";
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* ReasonerService.infer();
 *   console.log(`Derived ${result.stats.triplesInferred} new triples`);
 * });
 * ```
 */
export class ReasonerService extends Effect.Service<ReasonerService>()($I`ReasonerService`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    /**
     * Core inference logic - shared between infer and inferAndMaterialize
     */
    const runInference = Effect.fn("ReasonerService.runInference")(
      (
        config: ReasoningConfig
      ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
        Effect.gen(function* () {
          // Get all quads from the store using wildcard pattern
          const quads = yield* store.match(new QuadPattern({}));

          // Run forward-chaining inference
          const result = yield* forwardChain(quads, config);

          return result;
        }).pipe(
          Effect.withSpan("ReasonerService.runInference", {
            attributes: {
              maxDepth: config.maxDepth,
              maxInferences: config.maxInferences,
              profile: config.profile,
            },
          })
        )
    );

    /**
     * Run RDFS forward-chaining inference
     *
     * Retrieves all quads from RdfStore and applies RDFS entailment rules
     * until fixed-point is reached or limits are exceeded.
     *
     * @param config - Optional reasoning configuration (defaults to DefaultReasoningConfig)
     * @returns InferenceResult with derived triples, provenance, and stats
     *
     * @since 0.1.0
     */
    const infer = Effect.fn("ReasonerService.infer")(
      (
        config: ReasoningConfig = DefaultReasoningConfig
      ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
        runInference(config).pipe(
          Effect.withSpan("ReasonerService.infer", {
            attributes: {
              maxDepth: config.maxDepth,
              maxInferences: config.maxInferences,
              profile: config.profile,
            },
          })
        )
    );

    /**
     * Run RDFS inference and optionally materialize results
     *
     * Performs inference and optionally adds derived triples back to the store.
     *
     * @param config - Optional reasoning configuration
     * @param materialize - If true, add derived triples to store (default: false)
     * @returns InferenceResult with derived triples, provenance, and stats
     *
     * @since 0.1.0
     */
    const inferAndMaterialize = Effect.fn("ReasonerService.inferAndMaterialize")(
      (
        config: ReasoningConfig = DefaultReasoningConfig,
        materialize = false
      ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
        Effect.gen(function* () {
          const result = yield* runInference(config);

          if (materialize && result.derivedTriples.length > 0) {
            yield* store.addQuads(result.derivedTriples);
          }

          return result;
        }).pipe(
          Effect.withSpan("ReasonerService.inferAndMaterialize", {
            attributes: {
              materialize,
              maxDepth: config.maxDepth,
              maxInferences: config.maxInferences,
              profile: config.profile,
            },
          })
        )
    );

    return {
      infer,
      inferAndMaterialize,
    };
  }),
}) {}
