import { $KnowledgeServerId } from "@beep/identity/packages";
import type { InferenceProvenance, InferenceResult } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as MutableHashSet from "effect/MutableHashSet";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { InferenceStep, ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/ReasoningTraceFormatter");

const provenanceToStep = (provenance: InferenceProvenance): InferenceStep =>
  new InferenceStep({
    rule: provenance.ruleId as string & { readonly NonEmptyString: unique symbol },
    premises: A.fromIterable(provenance.sourceQuads),
  });

const calculateDepth = (
  provenanceMap: Record<string, InferenceProvenance>,
  tripleId: string,
  visited: MutableHashSet.MutableHashSet<string> = MutableHashSet.empty()
): number => {
  if (MutableHashSet.has(visited, tripleId)) {
    return 0;
  }

  const maybeProvenance = R.get(provenanceMap, tripleId);

  return O.match(maybeProvenance, {
    onNone: () => 0,
    onSome: (provenance) => {
      MutableHashSet.add(visited, tripleId);

      const sourceDepths = A.map(provenance.sourceQuads, (sourceId) =>
        calculateDepth(provenanceMap, sourceId, visited)
      );

      const maxSourceDepth = A.isNonEmptyReadonlyArray(sourceDepths)
        ? A.reduce(sourceDepths, 0, (acc, d) => (d > acc ? d : acc))
        : 0;

      return 1 + maxSourceDepth;
    },
  });
};

interface BfsState {
  readonly steps: ReadonlyArray<InferenceStep>;
  readonly visited: HashSet.HashSet<string>;
  readonly queue: ReadonlyArray<string>;
}

const processBfsNode = (
  provenanceMap: Record<string, InferenceProvenance>,
  state: BfsState,
  currentId: string
): BfsState => {
  if (HashSet.has(state.visited, currentId)) {
    return state;
  }

  const maybeProvenance = R.get(provenanceMap, currentId);

  return O.match(maybeProvenance, {
    onNone: () => ({
      ...state,
      visited: HashSet.add(state.visited, currentId),
    }),
    onSome: (provenance) => {
      const newVisited = HashSet.add(state.visited, currentId);
      const newSteps = A.append(state.steps, provenanceToStep(provenance));
      const newQueueItems = A.filter(provenance.sourceQuads, (sourceId) => !HashSet.has(newVisited, sourceId));
      return {
        steps: newSteps,
        visited: newVisited,
        queue: A.appendAll(state.queue, newQueueItems),
      };
    },
  });
};

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

const collectInferenceSteps = (
  provenanceMap: Record<string, InferenceProvenance>,
  rootTripleId: string
): ReadonlyArray<InferenceStep> => {
  const initialState: BfsState = {
    steps: A.empty<InferenceStep>(),
    visited: HashSet.empty<string>(),
    queue: A.of(rootTripleId),
  };

  const finalState = processBfsQueue(provenanceMap, initialState);
  return finalState.steps;
};

export interface ReasoningTraceFormatterShape {
  readonly formatReasoningTrace: (result: InferenceResult, tripleId: string) => O.Option<ReasoningTrace>;
  readonly summarizeTrace: (trace: ReasoningTrace) => string;
  readonly calculateDepth: (provenanceMap: Record<string, InferenceProvenance>, tripleId: string) => number;
}

export class ReasoningTraceFormatter extends Context.Tag($I`ReasoningTraceFormatter`)<
  ReasoningTraceFormatter,
  ReasoningTraceFormatterShape
>() {}

const serviceEffect: Effect.Effect<ReasoningTraceFormatterShape> = Effect.succeed(
  ReasoningTraceFormatter.of({
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
          const validDepth = Num.max(1, depth);

          return O.some(
            new ReasoningTrace({
              inferenceSteps: A.fromIterable(inferenceSteps),
              depth: validDepth,
            })
          );
        },
      });
    },

    summarizeTrace: (trace: ReasoningTrace): string => {
      const stepCount = A.length(trace.inferenceSteps);

      if (stepCount === 0) {
        return "No inference steps recorded";
      }

      const ruleNames = F.pipe(
        trace.inferenceSteps,
        A.map((step) => step.rule),
        A.join(" -> ")
      );

      const stepLabel = stepCount === 1 ? "step" : "steps";
      return `Inferred via ${stepCount} ${stepLabel}: ${ruleNames}`;
    },

    calculateDepth: (provenanceMap: Record<string, InferenceProvenance>, tripleId: string): number =>
      calculateDepth(provenanceMap, tripleId, MutableHashSet.empty()),
  })
);

export const ReasoningTraceFormatterLive = Layer.effect(ReasoningTraceFormatter, serviceEffect);
