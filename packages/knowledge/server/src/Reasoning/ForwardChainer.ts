import { $KnowledgeServerId } from "@beep/identity/packages";
import { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import {
  InferenceProvenance,
  InferenceResult,
  InferenceStats,
  Quad,
  type ReasoningConfig,
} from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { owlRules, owlSameAsRules } from "./OwlRules";
import { quadId, type Rule, type RuleInference, rdfs2, rdfs3, rdfs9, rdfs11, rdfsRules } from "./RdfsRules";

const $I = $KnowledgeServerId.create("Reasoning/ForwardChainer");
export class ChainState extends S.Class<ChainState>($I`ChainState`)({
  knownQuadIds: BS.MutableHashSet(S.String),
  allQuads: S.Array(Quad).pipe(S.mutable),
  derivedQuads: S.Array(Quad).pipe(S.mutable),
  provenance: BS.MutableHashMap({ key: S.String, value: InferenceProvenance }),
  totalInferences: S.Number,
  iterations: S.Number,
}) {}

const initializeState = (initialQuads: ReadonlyArray<Quad>): ChainState => {
  const knownQuadIds = MutableHashSet.empty<string>();
  const allQuads = A.empty<Quad>();

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

  A.forEach(uniqueQuads, (quad) => {
    allQuads.push(quad);
  });

  return {
    knownQuadIds,
    allQuads,
    derivedQuads: [],
    provenance: MutableHashMap.empty<string, InferenceProvenance>(),
    totalInferences: 0,
    iterations: 0,
  };
};

const collectNewInferences = (state: ChainState, rules: ReadonlyArray<Rule>): ReadonlyArray<RuleInference> =>
  pipe(
    rules,
    A.flatMap((rule) => rule.apply(state.allQuads)),
    A.filter((inference) => {
      const id = quadId(inference.quad);
      return !MutableHashSet.has(state.knownQuadIds, id);
    })
  );

const applyInferences = (state: ChainState, inferences: ReadonlyArray<RuleInference>): number => {
  const uniqueInferences = pipe(
    inferences,
    A.filterMap((inference) => {
      const id = quadId(inference.quad);
      if (MutableHashSet.has(state.knownQuadIds, id)) {
        return O.none();
      }
      MutableHashSet.add(state.knownQuadIds, id);
      return O.some({ inference, id });
    })
  );

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

const wouldGenerateMore = (state: ChainState, rules: ReadonlyArray<Rule>): boolean =>
  pipe(
    rules,
    A.flatMap((rule) => rule.apply(state.allQuads)),
    A.some((inference) => !MutableHashSet.has(state.knownQuadIds, quadId(inference.quad)))
  );

const finalizeProvenance = (
  provenance: MutableHashMap.MutableHashMap<string, InferenceProvenance>
): Record<string, InferenceProvenance> => {
  const entries = A.empty<[string, InferenceProvenance]>();
  MutableHashMap.forEach(provenance, (value, key) => {
    entries.push([key, value]);
  });
  return R.fromEntries(entries);
};

export const forwardChain = (
  initialQuads: ReadonlyArray<Quad>,
  config: ReasoningConfig,
  options?: {
    readonly customRules?: ReadonlyArray<Rule>;
  }
): Effect.Effect<InferenceResult, MaxDepthExceededError | MaxInferencesExceededError> =>
  Effect.gen(function* () {
    const startTime = yield* DateTime.now;
    const state = initializeState(initialQuads);
    const rules = getRulesForConfig(config, options?.customRules ?? []);

    let iterations = 0;
    let totalInferences = 0;

    while (iterations < config.maxDepth) {
      iterations++;

      const newInferences = collectNewInferences(state, rules);

      if (A.isEmptyReadonlyArray(newInferences)) {
        break;
      }

      const addedCount = applyInferences(state, newInferences);

      totalInferences += addedCount;
      if (totalInferences > config.maxInferences) {
        return yield* new MaxInferencesExceededError({
          message: `Exceeded maximum inferences limit: ${config.maxInferences}`,
          limit: config.maxInferences,
          inferencesGenerated: totalInferences,
        });
      }
    }

    if (iterations >= config.maxDepth && wouldGenerateMore(state, rules)) {
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

const getRulesForConfig = (config: ReasoningConfig, customRules: ReadonlyArray<Rule>): ReadonlyArray<Rule> => {
  switch (config.profile) {
    case "rdfs-subclass":
      return [rdfs9, rdfs11];
    case "rdfs-domain-range":
      return [rdfs2, rdfs3];
    case "owl-sameas":
      return owlSameAsRules;
    case "owl-full":
      return [...rdfsRules, ...owlRules];
    case "custom":
      return customRules;
    default:
      return rdfsRules;
  }
};
