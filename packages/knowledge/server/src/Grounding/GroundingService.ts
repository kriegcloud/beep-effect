import { $KnowledgeServerId } from "@beep/identity/packages";
import type { CircuitOpenError, RateLimitError } from "@beep/knowledge-domain/errors";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { EmbeddingError } from "../Embedding/EmbeddingProvider";
import { EmbeddingService, EmbeddingServiceLive } from "../Embedding/EmbeddingService";
import { AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { extractLocalName } from "../Ontology/constants";
import { cosineSimilarity } from "../utils/vector";

const $I = $KnowledgeServerId.create("Grounding/GroundingService");

const KnowledgeGraphSchema = S.typeSchema(KnowledgeGraph);
type KnowledgeGraphModel = S.Schema.Type<typeof KnowledgeGraphSchema>;

export class GroundingConfig extends S.Class<GroundingConfig>($I`GroundingConfig`)(
  {
    confidenceThreshold: S.optional(S.Number),
    keepUngrounded: S.optional(S.Boolean),
  },
  $I.annotations("GroundingConfig", {
    description:
      "Configuration for grounding verification (confidence threshold, whether to keep ungrounded relations).",
  })
) {}

class GroundingStats extends S.Class<GroundingStats>($I`GroundingStats`)(
  {
    total: S.Number,
    grounded: S.Number,
    ungrounded: S.Number,
    averageConfidence: S.Number,
  },
  $I.annotations("GroundingStats", {
    description: "Summary statistics for grounding verification results.",
  })
) {}

export class GroundingResult extends S.Class<GroundingResult>($I`GroundingResult`)(
  {
    groundedRelations: S.Array(AssembledRelation),
    ungroundedRelations: S.Array(AssembledRelation),
    stats: GroundingStats,
  },
  $I.annotations("GroundingResult", {
    description: "Result of grounding verification (grounded/ungrounded relations plus aggregate stats).",
  })
) {}

const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

const relationToStatement = (
  relation: AssembledRelation,
  subjectMention: string,
  objectMention?: undefined | string
): string => {
  const predicateLabel = extractLocalName(relation.predicate);

  const readablePredicate = F.pipe(predicateLabel, Str.replace(/([A-Z])/g, " $1"), Str.toLowerCase, Str.trim);

  if (relation.literalValue !== undefined) {
    return `${subjectMention} ${readablePredicate} ${relation.literalValue}`;
  }

  if (objectMention) {
    return `${subjectMention} ${readablePredicate} ${objectMention}`;
  }

  return `${subjectMention} has property ${readablePredicate}`;
};
class VerifyAccumulator extends S.Class<VerifyAccumulator>($I`VerifyAccumulator`)(
  {
    grounded: S.Array(AssembledRelation),
    ungrounded: S.Array(AssembledRelation),
    totalConfidence: Confidence,
  },
  $I.annotations("VerifyAccumulator", {
    description: "Internal accumulator used while verifying relations for grounding.",
  })
) {}

export interface GroundingServiceShape {
  readonly verifyRelations: (
    graph: KnowledgeGraphModel,
    sourceText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string,
    config?: GroundingConfig
  ) => Effect.Effect<GroundingResult, EmbeddingError | RateLimitError | CircuitOpenError>;
  readonly applyGrounding: (graph: KnowledgeGraphModel, groundingResult: GroundingResult) => KnowledgeGraphModel;
  readonly verifyRelation: (
    relation: AssembledRelation,
    subjectMention: string,
    objectMention: string | undefined,
    sourceText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string
  ) => Effect.Effect<number, EmbeddingError | RateLimitError | CircuitOpenError>;
}

export class GroundingService extends Context.Tag($I`GroundingService`)<GroundingService, GroundingServiceShape>() {}

const serviceEffect: Effect.Effect<GroundingServiceShape, never, EmbeddingService> = Effect.gen(function* () {
  const embedding = yield* EmbeddingService;

  const verifyRelations = Effect.fn("GroundingService.verifyRelations")(
    (
      graph: KnowledgeGraphModel,
      sourceText: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string,
      config: GroundingConfig = {}
    ): Effect.Effect<GroundingResult, EmbeddingError | RateLimitError | CircuitOpenError> =>
      Effect.gen(function* () {
        const threshold = config.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

        yield* Effect.logInfo("GroundingService.verifyRelations: starting").pipe(
          Effect.annotateLogs({
            relationCount: A.length(graph.relations),
            threshold,
          })
        );

        if (A.isEmptyReadonlyArray(graph.relations)) {
          return {
            groundedRelations: A.empty<AssembledRelation>(),
            ungroundedRelations: A.empty<AssembledRelation>(),
            stats: {
              total: 0,
              grounded: 0,
              ungrounded: 0,
              averageConfidence: 0,
            },
          };
        }

        const sourceEmbedding = yield* embedding.embed(sourceText, "search_document", organizationId, ontologyId);

        const entityById = MutableHashMap.fromIterable(A.map(graph.entities, (entity) => [entity.id, entity] as const));

        const acc = yield* Effect.reduce(
          graph.relations,
          new VerifyAccumulator({
            grounded: A.empty<AssembledRelation>(),
            ungrounded: A.empty<AssembledRelation>(),
            totalConfidence: 0,
          }),
          (current, relation) =>
            Effect.gen(function* () {
              const subjectOpt = MutableHashMap.get(entityById, relation.subjectId);

              if (O.isNone(subjectOpt)) {
                yield* Effect.logDebug("GroundingService: missing subject entity").pipe(
                  Effect.annotateLogs({
                    relationId: relation.id,
                    subjectId: relation.subjectId,
                  })
                );
                return config.keepUngrounded
                  ? new VerifyAccumulator({
                      grounded: current.grounded,
                      ungrounded: A.append(current.ungrounded, relation),
                      totalConfidence: current.totalConfidence,
                    })
                  : current;
              }
              const subject = subjectOpt.value;

              const objectOpt = relation.objectId ? MutableHashMap.get(entityById, relation.objectId) : O.none();
              const object = O.isSome(objectOpt) ? objectOpt.value : undefined;

              const statement = relationToStatement(relation, subject.mention, object?.mention);

              const statementEmbedding = yield* embedding.embed(statement, "search_query", organizationId, ontologyId);

              const similarity = cosineSimilarity(sourceEmbedding, statementEmbedding);

              const updatedRelation: AssembledRelation = {
                ...relation,
                confidence: similarity,
              };

              if (similarity >= threshold) {
                return new VerifyAccumulator({
                  grounded: A.append(current.grounded, updatedRelation),
                  ungrounded: current.ungrounded,
                  totalConfidence: current.totalConfidence + similarity,
                });
              }

              yield* Effect.logDebug("GroundingService: relation below threshold").pipe(
                Effect.annotateLogs({
                  relationId: relation.id,
                  statement,
                  similarity,
                  threshold,
                })
              );

              return config.keepUngrounded
                ? new VerifyAccumulator({
                    grounded: current.grounded,
                    ungrounded: A.append(current.ungrounded, updatedRelation),
                    totalConfidence: current.totalConfidence,
                  })
                : current;
            })
        );

        const groundedLen = A.length(acc.grounded);
        const ungroundedLen = A.length(acc.ungrounded);

        const result: GroundingResult = {
          groundedRelations: acc.grounded,
          ungroundedRelations: acc.ungrounded,
          stats: {
            total: A.length(graph.relations),
            grounded: groundedLen,
            ungrounded: ungroundedLen,
            averageConfidence: A.isNonEmptyReadonlyArray(acc.grounded) ? acc.totalConfidence / groundedLen : 0,
          },
        };

        const statsLog: Record<string, unknown> = {
          total: result.stats.total,
          grounded: result.stats.grounded,
          ungrounded: result.stats.ungrounded,
          averageConfidence: result.stats.averageConfidence,
        };
        yield* Effect.logInfo("GroundingService.verifyRelations: complete").pipe(Effect.annotateLogs(statsLog));

        return result;
      }).pipe(
        Effect.withSpan("GroundingService.verifyRelations", {
          captureStackTrace: false,
          attributes: { relationCount: A.length(graph.relations), organizationId, ontologyId },
        })
      )
  );

  const applyGrounding = (graph: KnowledgeGraphModel, groundingResult: GroundingResult): KnowledgeGraphModel => ({
    ...graph,
    relations: groundingResult.groundedRelations,
    stats: {
      ...graph.stats,
      relationCount: A.length(groundingResult.groundedRelations),
    },
  });

  const verifyRelation = Effect.fn("GroundingService.verifyRelation")(function* (
    relation: AssembledRelation,
    subjectMention: string,
    objectMention: string | undefined,
    sourceText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string
  ) {
    const statement = relationToStatement(relation, subjectMention, objectMention);

    const [sourceEmbed, statementEmbed] = yield* Effect.all(
      [
        embedding.embed(sourceText, "search_document", organizationId, ontologyId),
        embedding.embed(statement, "search_query", organizationId, ontologyId),
      ],
      { concurrency: 2 }
    );

    return cosineSimilarity(sourceEmbed, statementEmbed);
  });

  return GroundingService.of({
    verifyRelations,
    applyGrounding,
    verifyRelation,
  });
});

export const GroundingServiceLive = Layer.effect(GroundingService, serviceEffect).pipe(
  Layer.provide(EmbeddingServiceLive)
);
