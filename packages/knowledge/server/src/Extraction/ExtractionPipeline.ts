import { $KnowledgeServerId } from "@beep/identity/packages";
import { MentionRecord } from "@beep/knowledge-domain/entities";
import type { OntologyParseError } from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import { Confidence } from "@beep/knowledge-domain/values";
import { getErrorMessage, getErrorTag } from "@beep/knowledge-server/utils";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { AuthContext } from "@beep/shared-domain/Policy";
import { thunkTrue } from "@beep/utils";
import type * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ChunkingConfig, defaultChunkingConfig, NlpService, NlpServiceLive, type TextChunk } from "../Nlp";
import { OntologyService, OntologyServiceLive } from "../Ontology";
import { ProvenanceEmitter, ProvenanceEmitterLive, RdfStore, RdfStoreLive } from "../Rdf";
import { ProvenanceMetadata } from "../Rdf/ProvenanceEmitter";
import { ClassifyInput, DocumentClassifier, DocumentClassifierLive } from "../Service/DocumentClassifier";
import { EntityExtractor, EntityExtractorLive } from "./EntityExtractor";
import { GraphAssembler, GraphAssemblerLive, KnowledgeGraph } from "./GraphAssembler";
import { type MentionExtractionResult, MentionExtractor, MentionExtractorLive } from "./MentionExtractor";
import { RelationExtractor, RelationExtractorLive } from "./RelationExtractor";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedMention } from "./schemas/mention-output.schema";

const $I = $KnowledgeServerId.create("Extraction/ExtractionPipeline");

export class ExtractionPipelineConfig extends S.Class<ExtractionPipelineConfig>($I`ExtractionPipelineConfig`)(
  {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId,
    documentId: WorkspacesEntityIds.DocumentId,
    sourceUri: S.optionalWith(S.String, { as: "Option" }),
    chunkingConfig: S.optionalWith(ChunkingConfig, { as: "Option" }),
    mentionMinConfidence: S.optionalWith(Confidence, { as: "Option" }),
    entityMinConfidence: S.optionalWith(Confidence, { as: "Option" }),
    relationMinConfidence: S.optionalWith(Confidence, { as: "Option" }),
    entityBatchSize: S.optionalWith(S.Int, { as: "Option" }),
    mergeEntities: S.optionalWith(S.Boolean, { as: "Option" }),
    enableIncrementalClustering: S.optionalWith(S.Boolean, { as: "Option" }),
  },
  $I.annotations("ExtractionPipelineConfig", {
    description: "Configuration for the extraction pipeline",
  })
) {}

export class ExtractionResultStats extends S.Class<ExtractionResultStats>($I`ExtractionResultStats`)(
  {
    chunkCount: S.NonNegativeInt,
    mentionCount: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    tokensUsed: S.Number,
    durationMs: S.DurationFromMillis,
    clusteringEnabled: S.Boolean,
  },
  $I.annotations("ExtractionResultStats", {
    description: "Statistics for the extraction pipeline",
  })
) {}

export class ExtractionResult extends S.Class<ExtractionResult>($I`ExtractionResult`)(
  {
    graph: KnowledgeGraph,
    stats: ExtractionResultStats,
    config: ExtractionPipelineConfig,
  },
  $I.annotations("ExtractionResult", {
    description: "Result of the extraction pipeline",
  })
) {}

export interface ExtractionPipelineShape {
  readonly run: (
    text: string,
    ontologyContent: string,
    config: ExtractionPipelineConfig
  ) => Effect.Effect<ExtractionResult, OntologyParseError | HttpServerError.RequestError | AiError.AiError>;
}

export class ExtractionPipeline extends Context.Tag($I`ExtractionPipeline`)<
  ExtractionPipeline,
  ExtractionPipelineShape
>() {}

const annotateFailureOnCurrentSpan = (error: unknown): Effect.Effect<void> =>
  Effect.gen(function* () {
    yield* Effect.annotateCurrentSpan("outcome.success", false);
    yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(error));
    yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(error));
  });

const serviceEffect: Effect.Effect<
  ExtractionPipelineShape,
  never,
  | NlpService
  | MentionExtractor
  | EntityExtractor
  | RelationExtractor
  | GraphAssembler
  | OntologyService
  | RdfStore
  | ProvenanceEmitter
  | DocumentClassifier
> = Effect.gen(function* () {
  const nlp = yield* NlpService;
  const mentionExtractor = yield* MentionExtractor;
  const entityExtractor = yield* EntityExtractor;
  const relationExtractor = yield* RelationExtractor;
  const graphAssembler = yield* GraphAssembler;
  const ontologyService = yield* OntologyService;
  const rdfStore = yield* RdfStore;
  const provenanceEmitter = yield* ProvenanceEmitter;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
  const maybeClassifier = yield* Effect.serviceOption(DocumentClassifier);

  const run = Effect.fnUntraced(
    function* (text: string, ontologyContent: string, config: ExtractionPipelineConfig) {
      const actorUserId = yield* Effect.serviceOption(AuthContext).pipe(
        Effect.map(
          O.match({
            onNone: () => "app",
            onSome: (ctx) => ctx.session.userId,
          })
        )
      );
      const encodedConfig = yield* S.encode(ExtractionPipelineConfig)(config);
      const startTime = yield* DateTime.now;
      const extractionId = KnowledgeEntityIds.ExtractionId.create();
      let totalTokens = 0;

      yield* Effect.annotateCurrentSpan("knowledge.organization.id", config.organizationId);
      yield* Effect.annotateCurrentSpan("knowledge.ontology.id", config.ontologyId);
      yield* Effect.annotateCurrentSpan("knowledge.document.id", config.documentId);
      yield* Effect.annotateCurrentSpan("knowledge.document.text_length", Str.length(text));

      yield* Effect.logInfo("Starting extraction pipeline", {
        documentId: config.documentId,
        textLength: Str.length(text),
      });

      yield* O.match(maybeClassifier, {
        onNone: () =>
          Effect.gen(function* () {
            yield* Effect.annotateCurrentSpan("knowledge.classification.skipped", true);
            yield* Effect.annotateCurrentSpan("outcome.success", true);
          }),
        onSome: (classifier) =>
          classifier
            .classify(
              new ClassifyInput({
                preview: text.slice(0, 4000),
              })
            )
            .pipe(
              Effect.tap((classification) =>
                Effect.gen(function* () {
                  yield* Effect.annotateCurrentSpan("outcome.success", true);
                  yield* Effect.annotateCurrentSpan(
                    "knowledge.classification.document_type",
                    classification.documentType
                  );
                  yield* Effect.annotateCurrentSpan(
                    "knowledge.classification.domain_tag_count",
                    A.length(classification.domainTags)
                  );
                  yield* Effect.annotateCurrentSpan(
                    "knowledge.classification.complexity_score",
                    classification.complexityScore
                  );
                  yield* Effect.annotateCurrentSpan(
                    "knowledge.classification.entity_density",
                    classification.entityDensity
                  );
                  yield* Effect.logInfo("Document classified").pipe(
                    Effect.annotateLogs({
                      documentType: classification.documentType,
                      domainTags: classification.domainTags,
                      complexityScore: classification.complexityScore,
                      entityDensity: classification.entityDensity,
                    })
                  );
                })
              ),
              Effect.catchAllCause((cause) =>
                Effect.gen(function* () {
                  const failure = Cause.squash(cause);
                  yield* annotateFailureOnCurrentSpan(failure);
                  yield* Effect.logWarning("Document classification failed, continuing without classification").pipe(
                    Effect.annotateLogs({ cause: String(failure) })
                  );
                })
              )
            ),
      }).pipe(
        Effect.withSpan("knowledge.extraction.classify", {
          attributes: {
            "knowledge.document.id": config.documentId,
            "knowledge.document.text_length": Str.length(text),
          },
        })
      );

      yield* Effect.logDebug("Loading ontology");
      const ontologyContext = yield* ontologyService.load(config.ontologyId, ontologyContent).pipe(
        Effect.tap((context) =>
          Effect.gen(function* () {
            yield* Effect.annotateCurrentSpan("outcome.success", true);
            yield* Effect.annotateCurrentSpan("knowledge.ontology.class_count", A.length(context.classes));
            yield* Effect.annotateCurrentSpan("knowledge.ontology.property_count", A.length(context.properties));
          })
        ),
        Effect.tapError(annotateFailureOnCurrentSpan),
        Effect.withSpan("knowledge.extraction.load_ontology", {
          attributes: {
            "knowledge.document.id": config.documentId,
            "knowledge.ontology.id": config.ontologyId,
          },
        })
      );

      yield* Effect.logDebug("Chunking text");
      const chunks = yield* nlp
        .chunkTextAll(text, config.chunkingConfig.pipe(O.getOrElse(() => defaultChunkingConfig)))
        .pipe(
          Effect.tap((chunkValues) =>
            Effect.gen(function* () {
              yield* Effect.annotateCurrentSpan("outcome.success", true);
              yield* Effect.annotateCurrentSpan("knowledge.chunk.count", A.length(chunkValues));
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan),
          Effect.withSpan("knowledge.extraction.chunk", {
            attributes: {
              "knowledge.document.id": config.documentId,
              "knowledge.document.text_length": Str.length(text),
            },
          })
        );

      yield* Effect.logInfo("Text chunked", { chunkCount: A.length(chunks) });

      yield* Effect.logDebug("Extracting mentions");

      const {
        allMentions,
        mentionResults,
        tokensUsed: mentionTokensUsed,
      } = yield* Effect.gen(function* () {
        const mentionResults = yield* mentionExtractor.extractFromChunks(
          [...chunks],
          filterUndefined({
            minConfidence: encodedConfig.mentionMinConfidence,
          })
        );
        const allMentions = yield* mentionExtractor.mergeMentions(mentionResults);
        const tokensUsed = A.reduce([...mentionResults], 0, (acc, r) => acc + r.tokensUsed);
        yield* Effect.annotateCurrentSpan("outcome.success", true);
        yield* Effect.annotateCurrentSpan("knowledge.mention.count", A.length(allMentions));
        yield* Effect.annotateCurrentSpan("llm.tokens_total", tokensUsed);
        return { mentionResults, allMentions, tokensUsed };
      }).pipe(
        Effect.tapError(annotateFailureOnCurrentSpan),
        Effect.withSpan("knowledge.extraction.mentions", {
          attributes: {
            "knowledge.document.id": config.documentId,
            "knowledge.chunk.count": A.length(chunks),
          },
        })
      );
      totalTokens += mentionTokensUsed;

      yield* Effect.logInfo("Mentions extracted", {
        totalMentions: A.length(allMentions),
      });

      yield* Effect.logDebug("Classifying entities");
      const entityResult = yield* entityExtractor
        .classify(
          allMentions,
          ontologyContext,
          filterUndefined({
            minConfidence: encodedConfig.entityMinConfidence,
            batchSize: encodedConfig.entityBatchSize,
          })
        )
        .pipe(
          Effect.tap((result) =>
            Effect.gen(function* () {
              yield* Effect.annotateCurrentSpan("outcome.success", true);
              yield* Effect.annotateCurrentSpan("knowledge.entity.count", A.length(result.entities));
              yield* Effect.annotateCurrentSpan("knowledge.entity.invalid_count", A.length(result.invalidTypes));
              yield* Effect.annotateCurrentSpan("llm.tokens_total", result.tokensUsed);
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan),
          Effect.withSpan("knowledge.extraction.entities", {
            attributes: {
              "knowledge.document.id": config.documentId,
              "knowledge.mention.count": A.length(allMentions),
            },
          })
        );

      totalTokens += entityResult.tokensUsed;

      yield* Effect.logInfo("Entities classified", {
        validEntities: A.length(entityResult.entities),
        invalidTypes: A.length(entityResult.invalidTypes),
      });

      yield* Effect.logDebug("Extracting relations");

      const entitiesByChunk = mapEntitiesToChunks([...entityResult.entities], [...allMentions], [...chunks]);

      const { dedupedRelations, relationResult } = yield* Effect.gen(function* () {
        const relationResult = yield* relationExtractor.extractFromChunks(
          entitiesByChunk,
          [...chunks],
          ontologyContext,
          filterUndefined({
            minConfidence: encodedConfig.relationMinConfidence,
            validatePredicates: true,
          })
        );
        const dedupedRelations = yield* relationExtractor.deduplicateRelations(relationResult.triples);
        yield* Effect.annotateCurrentSpan("outcome.success", true);
        yield* Effect.annotateCurrentSpan("knowledge.relation.raw_count", A.length(relationResult.triples));
        yield* Effect.annotateCurrentSpan("knowledge.relation.count", A.length(dedupedRelations));
        yield* Effect.annotateCurrentSpan("knowledge.relation.invalid_count", A.length(relationResult.invalidTriples));
        yield* Effect.annotateCurrentSpan("llm.tokens_total", relationResult.tokensUsed);
        return { relationResult, dedupedRelations };
      }).pipe(
        Effect.tapError(annotateFailureOnCurrentSpan),
        Effect.withSpan("knowledge.extraction.relations", {
          attributes: {
            "knowledge.document.id": config.documentId,
            "knowledge.entity.count": A.length(entityResult.entities),
            "knowledge.chunk.count": A.length(chunks),
          },
        })
      );
      totalTokens += relationResult.tokensUsed;

      yield* Effect.logInfo("Relations extracted", {
        totalRelations: A.length(dedupedRelations),
      });

      yield* Effect.logDebug("Assembling knowledge graph");
      const graph = yield* graphAssembler
        .assemble([...entityResult.entities], [...dedupedRelations], {
          organizationId: config.organizationId,
          ontologyId: config.ontologyId,
          mergeEntities: config.mergeEntities.pipe(O.getOrElse(thunkTrue)),
        })
        .pipe(
          Effect.tap((graphResult) =>
            Effect.gen(function* () {
              yield* Effect.annotateCurrentSpan("outcome.success", true);
              yield* Effect.annotateCurrentSpan("knowledge.entity.count", graphResult.stats.entityCount);
              yield* Effect.annotateCurrentSpan("knowledge.relation.count", graphResult.stats.relationCount);
            })
          ),
          Effect.tapError(annotateFailureOnCurrentSpan),
          Effect.withSpan("knowledge.extraction.graph_assemble", {
            attributes: {
              "knowledge.document.id": config.documentId,
              "knowledge.entity.count": A.length(entityResult.entities),
              "knowledge.relation.count": A.length(dedupedRelations),
            },
          })
        );

      const clusteringEnabled = config.enableIncrementalClustering.pipe(
        O.match({
          onNone: () => false,
          onSome: (b) => b,
        })
      );

      if (clusteringEnabled) {
        yield* O.match(maybeClusterer, {
          onNone: () =>
            Effect.gen(function* () {
              yield* Effect.annotateCurrentSpan("outcome.success", true);
              yield* Effect.logDebug("IncrementalClustering requested but IncrementalClusterer not provided");
            }),
          onSome: Effect.fn(
            function* (clusterer) {
              const records = yield* buildMentionRecords(mentionResults, actorUserId, config, extractionId);
              yield* clusterer.cluster(records);
              yield* Effect.annotateCurrentSpan("outcome.success", true);
              yield* Effect.annotateCurrentSpan("knowledge.mention.count", A.length(records));
              yield* Effect.logInfo("Incremental clustering completed").pipe(
                Effect.annotateLogs({ mentionCount: A.length(records) })
              );
            },
            Effect.catchTag("ClusterError", (err) =>
              Effect.gen(function* () {
                yield* annotateFailureOnCurrentSpan(err);
                yield* Effect.logWarning("Incremental clustering failed, continuing without clustering").pipe(
                  Effect.annotateLogs({ error: err.message })
                );
              })
            ),
            Effect.withSpan("knowledge.extraction.incremental_clustering", {
              attributes: { "knowledge.document.id": config.documentId },
            })
          ),
        });
      }

      const endTime = yield* DateTime.now;
      const durationMs = Duration.millis(DateTime.distance(startTime, endTime));

      const emitted = yield* provenanceEmitter.emitExtraction(
        graph,
        new ProvenanceMetadata({
          extractionId,
          documentId: config.documentId,
          actorUserId,
          startedAt: startTime,
          endedAt: endTime,
        })
      );

      yield* rdfStore.createGraph(emitted.extractionGraphIri);
      yield* rdfStore.createGraph(emitted.provenanceGraphIri);
      yield* rdfStore.addQuads(emitted.graphQuads);
      yield* rdfStore.addQuads(emitted.provenanceQuads);

      yield* Effect.logInfo("Extraction pipeline complete", {
        entityCount: graph.stats.entityCount,
        relationCount: graph.stats.relationCount,
        tokensUsed: totalTokens,
        durationMs,
        clusteringEnabled,
      });
      yield* Effect.annotateCurrentSpan("outcome.success", true);
      yield* Effect.annotateCurrentSpan("knowledge.chunk.count", A.length(chunks));
      yield* Effect.annotateCurrentSpan("knowledge.mention.count", A.length(allMentions));
      yield* Effect.annotateCurrentSpan("knowledge.entity.count", graph.stats.entityCount);
      yield* Effect.annotateCurrentSpan("knowledge.relation.count", graph.stats.relationCount);
      yield* Effect.annotateCurrentSpan("llm.tokens_total", totalTokens);
      yield* Effect.annotateCurrentSpan("performance.duration_ms", Duration.toMillis(durationMs));
      yield* Effect.annotateCurrentSpan("knowledge.incremental_clustering.enabled", clusteringEnabled);

      return new ExtractionResult({
        graph,
        stats: new ExtractionResultStats({
          chunkCount: A.length(chunks),
          mentionCount: A.length(allMentions),
          entityCount: graph.stats.entityCount,
          relationCount: graph.stats.relationCount,
          tokensUsed: totalTokens,
          durationMs,
          clusteringEnabled,
        }),
        config,
      });
    },
    Effect.catchTag("ParseError", Effect.die),
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        const failure = Cause.squash(cause);
        yield* annotateFailureOnCurrentSpan(failure);
        return yield* Effect.failCause(cause);
      })
    ),
    Effect.withSpan("knowledge.extraction.pipeline")
  );

  return ExtractionPipeline.of({ run });
});

export const ExtractionPipelineLive = Layer.effect(ExtractionPipeline, serviceEffect).pipe(
  Layer.provideMerge(MentionExtractorLive),
  Layer.provideMerge(EntityExtractorLive),
  Layer.provideMerge(RelationExtractorLive),
  Layer.provideMerge(GraphAssemblerLive),
  Layer.provideMerge(ProvenanceEmitterLive),
  Layer.provideMerge(DocumentClassifierLive),
  Layer.provideMerge(OntologyServiceLive),
  Layer.provideMerge(RdfStoreLive),
  Layer.provideMerge(NlpServiceLive)
);

const mapEntitiesToChunks = (
  entities: readonly ClassifiedEntity[],
  mentions: readonly ExtractedMention[],
  chunks: readonly TextChunk[]
): MutableHashMap.MutableHashMap<number, readonly ClassifiedEntity[]> => {
  const entityByMention = A.reduce(entities, MutableHashMap.empty<string, ClassifiedEntity>(), (acc, entity) => {
    MutableHashMap.set(acc, Str.toLowerCase(entity.mention), entity);
    return acc;
  });

  const result = A.reduce(chunks, MutableHashMap.empty<number, ClassifiedEntity[]>(), (acc, chunk) => {
    MutableHashMap.set(acc, chunk.index, []);
    return acc;
  });

  for (const mention of mentions) {
    const entityOpt = MutableHashMap.get(entityByMention, Str.toLowerCase(mention.text));
    if (O.isNone(entityOpt)) continue;
    const entity = entityOpt.value;

    for (const chunk of chunks) {
      if (mention.startChar >= chunk.startOffset && mention.endChar <= chunk.endOffset) {
        const existing = F.pipe(
          MutableHashMap.get(result, chunk.index),
          O.getOrElse(() => A.empty<ClassifiedEntity>())
        );
        const alreadyPresent = A.some(existing, (e) => Str.toLowerCase(e.mention) === Str.toLowerCase(entity.mention));
        if (!alreadyPresent) {
          existing.push(entity);
          MutableHashMap.set(result, chunk.index, existing);
        }
        break;
      }
    }
  }

  return result;
};

const filterUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  F.pipe(
    obj as Record<string, unknown>,
    R.filter((value) => value !== undefined)
  ) as Partial<T>;

const buildMentionRecords = (
  mentionResults: readonly MentionExtractionResult[],
  actorUserId: string,
  config: ExtractionPipelineConfig,
  extractionId: KnowledgeEntityIds.ExtractionId.Type
): Effect.Effect<ReadonlyArray<S.Schema.Type<typeof MentionRecord.Model.insert>>> =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const orgId = SharedEntityIds.OrganizationId.make(config.organizationId);
    const docId = WorkspacesEntityIds.DocumentId.make(config.documentId);
    let rowIdSeq = 0;

    return A.flatMap(mentionResults, (result) =>
      A.map(result.mentions, (mention) => {
        rowIdSeq += 1;
        return MentionRecord.Model.insert.make({
          id: KnowledgeEntityIds.MentionRecordId.create(),
          organizationId: orgId,
          extractionId,
          documentId: docId,
          chunkIndex: result.chunk.index,
          rawText: mention.text,
          mentionType: mention.suggestedType ?? "",
          confidence: mention.confidence,
          responseHash: "",
          extractedAt: now,
          source: O.some($I`ExtractionPipeline`),
          deletedAt: O.none(),
          createdBy: O.some(actorUserId),
          updatedBy: O.some(actorUserId),
          deletedBy: O.none(),
          resolvedEntityId: O.none(),
        });
      })
    );
  });
