import { $KnowledgeServerId } from "@beep/identity/packages";
import type { SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { EmbeddingError } from "../Embedding/EmbeddingProvider";
import { EmbeddingService, EmbeddingServiceLive } from "../Embedding/EmbeddingService";
import type { AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";
import { extractLocalName } from "../Ontology/constants";
import { cosineSimilarity } from "../utils/vector";

const $I = $KnowledgeServerId.create("Grounding/GroundingService");

export interface GroundingConfig {
  readonly confidenceThreshold?: undefined | number;
  readonly keepUngrounded?: undefined | boolean;
}

export interface GroundingResult {
  readonly groundedRelations: readonly AssembledRelation[];
  readonly ungroundedRelations: readonly AssembledRelation[];
  readonly stats: {
    readonly total: number;
    readonly grounded: number;
    readonly ungrounded: number;
    readonly averageConfidence: number;
  };
}

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

interface VerifyAccumulator {
  readonly grounded: ReadonlyArray<AssembledRelation>;
  readonly ungrounded: ReadonlyArray<AssembledRelation>;
  readonly totalConfidence: number;
}

export interface GroundingServiceShape {
  readonly verifyRelations: (
    graph: KnowledgeGraph,
    sourceText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string,
    config?: GroundingConfig
  ) => Effect.Effect<GroundingResult, EmbeddingError>;
  readonly applyGrounding: (graph: KnowledgeGraph, groundingResult: GroundingResult) => KnowledgeGraph;
  readonly verifyRelation: (
    relation: AssembledRelation,
    subjectMention: string,
    objectMention: string | undefined,
    sourceText: string,
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: string
  ) => Effect.Effect<number, EmbeddingError>;
}

export class GroundingService extends Context.Tag($I`GroundingService`)<GroundingService, GroundingServiceShape>() {}

const serviceEffect: Effect.Effect<GroundingServiceShape, never, EmbeddingService> = Effect.gen(function* () {
  const embedding = yield* EmbeddingService;

  const verifyRelations = Effect.fn("GroundingService.verifyRelations")(
    (
      graph: KnowledgeGraph,
      sourceText: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      ontologyId: string,
      config: GroundingConfig = {}
    ): Effect.Effect<GroundingResult, EmbeddingError> =>
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
          {
            grounded: A.empty<AssembledRelation>(),
            ungrounded: A.empty<AssembledRelation>(),
            totalConfidence: 0,
          } as VerifyAccumulator,
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
                  ? { ...current, ungrounded: A.append(current.ungrounded, relation) }
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
                return {
                  ...current,
                  grounded: A.append(current.grounded, updatedRelation),
                  totalConfidence: current.totalConfidence + similarity,
                };
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
                ? { ...current, ungrounded: A.append(current.ungrounded, updatedRelation) }
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

        yield* Effect.logInfo("GroundingService.verifyRelations: complete").pipe(Effect.annotateLogs(result.stats));

        return result;
      }).pipe(
        Effect.withSpan("GroundingService.verifyRelations", {
          captureStackTrace: false,
          attributes: { relationCount: A.length(graph.relations), organizationId, ontologyId },
        })
      )
  );

  const applyGrounding = (graph: KnowledgeGraph, groundingResult: GroundingResult): KnowledgeGraph => ({
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
