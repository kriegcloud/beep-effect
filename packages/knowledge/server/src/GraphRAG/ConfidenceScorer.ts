import { $KnowledgeServerId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Citation, ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/ConfidenceScorer");
export class EntityValidationResult extends S.Class<EntityValidationResult>($I`EntityValidationResult`)({
  entityId: KnowledgeEntityIds.KnowledgeEntityId,
  found: S.Boolean,
  confidence: Confidence,
}) {}

export class RelationValidationResult extends S.Class<RelationValidationResult>($I`RelationValidationResult`)({
  relationId: KnowledgeEntityIds.RelationId,
  found: S.Boolean,
  isInferred: S.Boolean,
  confidence: Confidence,
  reasoningTrace: S.optional(ReasoningTrace),
}) {}

export class CitationValidationResult extends S.Class<CitationValidationResult>($I`CitationValidationResult`)({
  citation: Citation,
  entityResults: S.Array(EntityValidationResult),
  relationResult: S.optional(RelationValidationResult),
  overallConfidence: Confidence,
}) {}
export class ScoredCitation extends S.Class<ScoredCitation>($I`ScoredCitation`)({
  citation: Citation,
  validationResult: CitationValidationResult,
  finalConfidence: Confidence,
  isGrounded: S.Boolean,
  shouldExclude: S.Boolean,
}) {}

export class ScoredAnswer extends S.Class<ScoredAnswer>($I`ScoredAnswer`)({
  text: S.String,
  citations: S.Array(ScoredCitation),
  overallConfidence: Confidence,
  groundedRatio: S.Number,
}) {}

export const GROUNDED_THRESHOLD = 0.5;

export const EXCLUDE_THRESHOLD = 0.3;

export const DEPTH_PENALTY_FACTOR = 0.1;

export const MIN_PENALTY_MULTIPLIER = 0.5;

const clampConfidence = (value: number): number => {
  return Num.clamp(value, { minimum: 0.0, maximum: 1.0 });
};

const computeDepthPenalty = (depth: number): number => {
  const penalty = 1.0 - DEPTH_PENALTY_FACTOR * depth;
  return Num.max(penalty, MIN_PENALTY_MULTIPLIER);
};

const minEntityConfidence = (results: ReadonlyArray<EntityValidationResult>): number => {
  if (A.isEmptyReadonlyArray(results)) {
    return 1.0;
  }

  const confidences = A.map(results, (r) => r.confidence);
  return A.reduce(confidences, 1.0, Num.min);
};

export interface ConfidenceScorerShape {
  readonly applyDepthPenalty: (baseConfidence: number, depth: number) => number;
  readonly scoreCitation: (result: CitationValidationResult) => ScoredCitation;
  readonly scoreAnswer: (text: string, validationResults: ReadonlyArray<CitationValidationResult>) => ScoredAnswer;
  readonly weightedAverage: (values: ReadonlyArray<{ value: number; weight: number }>) => number;
}

export class ConfidenceScorer extends Context.Tag($I`ConfidenceScorer`)<ConfidenceScorer, ConfidenceScorerShape>() {}

const weightedAverage = (values: ReadonlyArray<{ readonly value: number; readonly weight: number }>): number => {
  if (A.isEmptyReadonlyArray(values)) {
    return 0;
  }

  const totalWeight = A.reduce(values, 0, (acc, v) => acc + v.weight);

  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = A.reduce(values, 0, (acc, v) => acc + v.value * v.weight);

  return clampConfidence(weightedSum / totalWeight);
};

const serviceEffect: Effect.Effect<ConfidenceScorerShape> = Effect.succeed(
  ConfidenceScorer.of({
    applyDepthPenalty: (baseConfidence: number, depth: number): number => {
      const penalty = computeDepthPenalty(depth);
      return clampConfidence(baseConfidence * penalty);
    },

    scoreCitation: (result: CitationValidationResult): ScoredCitation => {
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
    },

    scoreAnswer: (text: string, validationResults: ReadonlyArray<CitationValidationResult>): ScoredAnswer => {
      const scoredCitations = A.map(validationResults, (result): ScoredCitation => {
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

      const weightedValues = A.map(scoredCitations, (sc) => ({
        value: sc.finalConfidence,
        weight: Str.length(sc.citation.claimText),
      }));

      const overallConfidence = weightedAverage(weightedValues);

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

    weightedAverage: (values: ReadonlyArray<{ value: number; weight: number }>): number => {
      return weightedAverage(values);
    },
  })
);

export const ConfidenceScorerLive = Layer.effect(ConfidenceScorer, serviceEffect);
