import { $KnowledgeServerId } from "@beep/identity/packages";
import type { MaxDepthExceededError, MaxInferencesExceededError } from "@beep/knowledge-domain/errors";
import { Confidence, type Quad } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { ReasonerService, ReasonerServiceLive } from "../Reasoning/ReasonerService";
import { SparqlService, type SparqlServiceError, SparqlServiceLive } from "../Sparql/SparqlService";
import { Citation, InferenceStep, ReasoningTrace } from "./AnswerSchemas";

const $I = $KnowledgeServerId.create("GraphRAG/CitationValidator");

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

export class CitationValidationResult extends S.Class<CitationValidationResult>($I`CitationValidationResult`)(
  {
    citation: Citation,
    entityResults: S.Array(EntityValidationResult),
    relationResult: S.optional(RelationValidationResult),
    overallConfidence: Confidence,
  },
  $I.annotations("CitationValidationResult", {
    description: "Result of validating a citation",
  })
) {}

export type CitationValidationError = SparqlServiceError.Type | MaxDepthExceededError | MaxInferencesExceededError;

const INFERENCE_CONFIDENCE_DECAY = 0.1;

const BASE_INFERRED_CONFIDENCE = 0.9;

const MIN_INFERRED_CONFIDENCE = 0.5;

const buildEntityExistsQuery = (entityId: string): string => `
  ASK WHERE {
    { ?s ?p ?o . FILTER(?s = <${entityId}>) }
    UNION
    { ?s ?p ?o . FILTER(?o = <${entityId}>) }
  }
`;

const buildRelationExistsQuery = (relationId: string): string => `
  ASK WHERE {
    ?s ?p ?o .
    FILTER(?p = <${relationId}>)
  }
`;

const calculateInferredConfidence = (depth: number): number => {
  const penalty = depth * INFERENCE_CONFIDENCE_DECAY;
  return Num.max(MIN_INFERRED_CONFIDENCE, BASE_INFERRED_CONFIDENCE - penalty);
};

const quadMatchesRelation = (quad: Quad, relationId: string): boolean => quad.predicate === relationId;

const buildReasoningTrace = (
  provenance: Record<string, { ruleId: string; sourceQuads: ReadonlyArray<string> }>,
  depth: number
): ReasoningTrace => {
  const inferenceSteps = A.map(Struct.keys(provenance), (key) => {
    const prov = provenance[key];
    return new InferenceStep({
      rule: prov?.ruleId ?? "unknown",
      premises: A.map(prov?.sourceQuads ?? A.empty<string>(), String),
    });
  });

  return {
    inferenceSteps,
    depth,
  } as ReasoningTrace;
};

export interface CitationValidatorShape {
  readonly validateEntity: (
    entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
  ) => Effect.Effect<EntityValidationResult, SparqlServiceError.Type>;
  readonly validateRelation: (
    relationId: KnowledgeEntityIds.RelationId.Type
  ) => Effect.Effect<RelationValidationResult, SparqlServiceError.Type | MaxDepthExceededError | MaxInferencesExceededError>;
  readonly validateCitation: (citation: Citation) => Effect.Effect<CitationValidationResult, CitationValidationError>;
  readonly validateAllCitations: (
    citations: ReadonlyArray<Citation>
  ) => Effect.Effect<ReadonlyArray<CitationValidationResult>, CitationValidationError>;
}

export class CitationValidator extends Context.Tag($I`CitationValidator`)<
  CitationValidator,
  CitationValidatorShape
>() {}

const serviceEffect: Effect.Effect<CitationValidatorShape, never, SparqlService | ReasonerService> = Effect.gen(
  function* () {
    const sparql = yield* SparqlService;
    const reasoner = yield* ReasonerService;

    const validateEntity = (
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
    ): Effect.Effect<EntityValidationResult, SparqlServiceError.Type> =>
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

    const validateRelation = (
      relationId: KnowledgeEntityIds.RelationId.Type
    ): Effect.Effect<
      RelationValidationResult,
      SparqlServiceError.Type | MaxDepthExceededError | MaxInferencesExceededError
    > =>
      Effect.gen(function* () {
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

        const inferenceResult = yield* reasoner.infer();

        const matchingTriple = A.findFirst(inferenceResult.derivedTriples, (quad) =>
          quadMatchesRelation(quad, relationId)
        );

        if (O.isSome(matchingTriple)) {
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

    const validateCitation = (citation: Citation): Effect.Effect<CitationValidationResult, CitationValidationError> =>
      Effect.gen(function* () {
        const effects = A.map(citation.entityIds, validateEntity);
        const entityResults = yield* Effect.all(effects, {
          concurrency: A.length(effects),
        });

        const relationResult = O.isSome(O.fromNullable(citation.relationId))
          ? yield* validateRelation(citation.relationId as KnowledgeEntityIds.RelationId.Type)
          : undefined;

        const entityConfidences = A.map(entityResults, (r) => r.confidence);
        const allConfidences =
          relationResult !== undefined ? A.append(entityConfidences, relationResult.confidence) : entityConfidences;

        const overallConfidence = A.isNonEmptyReadonlyArray(allConfidences) ? A.min(allConfidences, Num.Order) : 0.0;

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
            entityCount: A.length(citation.entityIds),
            hasRelation: citation.relationId !== undefined,
          },
        })
      );

    const validateAllCitations = (
      citations: ReadonlyArray<Citation>
    ): Effect.Effect<ReadonlyArray<CitationValidationResult>, CitationValidationError> =>
      Effect.all(A.map(citations, validateCitation), { concurrency: "unbounded" }).pipe(
        Effect.withSpan("CitationValidator.validateAllCitations", {
          attributes: { citationCount: A.length(citations) },
        })
      );

    return CitationValidator.of({
      validateEntity,
      validateRelation,
      validateCitation,
      validateAllCitations,
    });
  }
);

export const CitationValidatorLive = Layer.effect(CitationValidator, serviceEffect).pipe(
  Layer.provide(SparqlServiceLive),
  Layer.provide(ReasonerServiceLive)
);
