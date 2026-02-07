import { $KnowledgeServerId } from "@beep/identity/packages";
import type { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import {
  DefaultReasoningConfig,
  type InferenceResult,
  QuadPattern,
  type ReasoningConfig,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { RdfStore, RdfStoreLive } from "../Rdf/RdfStoreService";
import { forwardChain } from "./ForwardChainer";
import type { Rule } from "./RdfsRules";

const $I = $KnowledgeServerId.create("Reasoning/ReasonerService");

export interface ReasonerServiceShape {
  readonly infer: (
    config?: ReasoningConfig,
    customRules?: ReadonlyArray<Rule>
  ) => Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError>;
  readonly inferAndMaterialize: (
    config?: ReasoningConfig,
    materialize?: boolean,
    customRules?: ReadonlyArray<Rule>
  ) => Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError>;
}

export class ReasonerService extends Context.Tag($I`ReasonerService`)<ReasonerService, ReasonerServiceShape>() {}

const serviceEffect: Effect.Effect<ReasonerServiceShape, never, RdfStore> = Effect.gen(function* () {
  const store = yield* RdfStore;

  const runInference = Effect.fn("ReasonerService.runInference")(
    (
      config: ReasoningConfig,
      customRules?: ReadonlyArray<Rule>
    ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
      Effect.gen(function* () {
        const quads = yield* store.match(new QuadPattern({}));
        return yield* customRules === undefined
          ? forwardChain(quads, config)
          : forwardChain(quads, config, { customRules });
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

  const infer = Effect.fn("ReasonerService.infer")(
    (
      config: ReasoningConfig = DefaultReasoningConfig,
      customRules?: ReadonlyArray<Rule>
    ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
      runInference(config, customRules).pipe(
        Effect.withSpan("ReasonerService.infer", {
          attributes: {
            maxDepth: config.maxDepth,
            maxInferences: config.maxInferences,
            profile: config.profile,
          },
        })
      )
  );

  const inferAndMaterialize = Effect.fn("ReasonerService.inferAndMaterialize")(
    (
      config: ReasoningConfig = DefaultReasoningConfig,
      materialize = false,
      customRules?: ReadonlyArray<Rule>
    ): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
      Effect.gen(function* () {
        const result = yield* runInference(config, customRules);

        if (materialize && A.isNonEmptyReadonlyArray(result.derivedTriples)) {
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

  return ReasonerService.of({
    infer,
    inferAndMaterialize,
  });
});

export const ReasonerServiceLive = Layer.effect(ReasonerService, serviceEffect).pipe(Layer.provide(RdfStoreLive));
