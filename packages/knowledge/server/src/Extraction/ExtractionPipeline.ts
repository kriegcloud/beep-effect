import { $KnowledgeServerId } from "@beep/identity/packages";
import { MentionRecord } from "@beep/knowledge-domain/entities";
import type { OntologyParseError } from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type * as AiError from "@effect/ai/AiError";
import type * as HttpServerError from "@effect/platform/HttpServerError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { type ChunkingConfig, defaultChunkingConfig, NlpService, type TextChunk } from "../Nlp";
import { OntologyService } from "../Ontology";
import { EntityExtractor, EntityExtractorLive } from "./EntityExtractor";
import { GraphAssembler, GraphAssemblerLive, type KnowledgeGraph } from "./GraphAssembler";
import { type MentionExtractionResult, MentionExtractor, MentionExtractorLive } from "./MentionExtractor";
import { RelationExtractor, RelationExtractorLive } from "./RelationExtractor";
import type { ClassifiedEntity } from "./schemas/entity-output.schema";
import type { ExtractedMention } from "./schemas/mention-output.schema";

const $I = $KnowledgeServerId.create("knowledge-server/Extraction/ExtractionPipeline");

export interface ExtractionPipelineConfig {
  readonly organizationId: string;
  readonly ontologyId: string;
  readonly documentId: string;
  readonly sourceUri?: undefined | string;
  readonly chunkingConfig?: undefined | ChunkingConfig;
  readonly mentionMinConfidence?: undefined | number;
  readonly entityMinConfidence?: undefined | number;
  readonly relationMinConfidence?: undefined | number;
  readonly entityBatchSize?: undefined | number;
  readonly mergeEntities?: undefined | boolean;
  readonly enableIncrementalClustering?: undefined | boolean;
}

export interface ExtractionResult {
  readonly graph: KnowledgeGraph;
  readonly stats: {
    readonly chunkCount: number;
    readonly mentionCount: number;
    readonly entityCount: number;
    readonly relationCount: number;
    readonly tokensUsed: number;
    readonly durationMs: number;
    readonly clusteringEnabled: boolean;
  };
  readonly config: ExtractionPipelineConfig;
}

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

const serviceEffect: Effect.Effect<
  ExtractionPipelineShape,
  never,
  NlpService | MentionExtractor | EntityExtractor | RelationExtractor | GraphAssembler | OntologyService
> = Effect.gen(function* () {
  const nlp = yield* NlpService;
  const mentionExtractor = yield* MentionExtractor;
  const entityExtractor = yield* EntityExtractor;
  const relationExtractor = yield* RelationExtractor;
  const graphAssembler = yield* GraphAssembler;
  const ontologyService = yield* OntologyService;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);

  const run = Effect.fnUntraced(function* (text: string, ontologyContent: string, config: ExtractionPipelineConfig) {
    const startTime = yield* DateTime.now;
    let totalTokens = 0;

    yield* Effect.logInfo("Starting extraction pipeline", {
      documentId: config.documentId,
      textLength: Str.length(text),
    });

    yield* Effect.logDebug("Loading ontology");
    const ontologyContext = yield* ontologyService.load(config.ontologyId, ontologyContent);

    yield* Effect.logDebug("Chunking text");
    const chunks = yield* nlp.chunkTextAll(text, config.chunkingConfig ?? defaultChunkingConfig);

    yield* Effect.logInfo("Text chunked", { chunkCount: A.length(chunks) });

    yield* Effect.logDebug("Extracting mentions");

    const mentionResults = yield* mentionExtractor.extractFromChunks(
      [...chunks],
      filterUndefined({
        minConfidence: config.mentionMinConfidence,
      })
    );

    const allMentions = yield* mentionExtractor.mergeMentions(mentionResults);
    totalTokens += A.reduce([...mentionResults], 0, (acc, r) => acc + r.tokensUsed);

    yield* Effect.logInfo("Mentions extracted", {
      totalMentions: A.length(allMentions),
    });

    yield* Effect.logDebug("Classifying entities");
    const entityResult = yield* entityExtractor.classify(
      allMentions,
      ontologyContext,
      filterUndefined({
        minConfidence: config.entityMinConfidence,
        batchSize: config.entityBatchSize,
      })
    );

    totalTokens += entityResult.tokensUsed;

    yield* Effect.logInfo("Entities classified", {
      validEntities: A.length(entityResult.entities),
      invalidTypes: A.length(entityResult.invalidTypes),
    });

    yield* Effect.logDebug("Extracting relations");

    const entitiesByChunk = mapEntitiesToChunks([...entityResult.entities], [...allMentions], [...chunks]);

    const relationResult = yield* relationExtractor.extractFromChunks(
      entitiesByChunk,
      [...chunks],
      ontologyContext,
      filterUndefined({
        minConfidence: config.relationMinConfidence,
        validatePredicates: true,
      })
    );

    totalTokens += relationResult.tokensUsed;

    const dedupedRelations = yield* relationExtractor.deduplicateRelations(relationResult.triples);

    yield* Effect.logInfo("Relations extracted", {
      totalRelations: A.length(dedupedRelations),
    });

    yield* Effect.logDebug("Assembling knowledge graph");
    const graph = yield* graphAssembler.assemble([...entityResult.entities], [...dedupedRelations], {
      organizationId: config.organizationId,
      ontologyId: config.ontologyId,
      mergeEntities: config.mergeEntities ?? true,
    });

    const clusteringEnabled = config.enableIncrementalClustering === true;

    if (clusteringEnabled) {
      yield* O.match(maybeClusterer, {
        onNone: () => Effect.logDebug("IncrementalClustering requested but IncrementalClusterer not provided"),
        onSome: Effect.fn(
          function* (clusterer) {
            const records = yield* buildMentionRecords(mentionResults, config);
            yield* clusterer.cluster(records);
            yield* Effect.logInfo("Incremental clustering completed").pipe(
              Effect.annotateLogs({ mentionCount: A.length(records) })
            );
          },
          Effect.catchTag("ClusterError", (err) =>
            Effect.logWarning("Incremental clustering failed, continuing without clustering").pipe(
              Effect.annotateLogs({ error: err.message })
            )
          ),
          Effect.withSpan("ExtractionPipeline.incrementalClustering", {
            attributes: { documentId: config.documentId },
          })
        ),
      });
    }

    const endTime = yield* DateTime.now;
    const durationMs = Duration.toMillis(DateTime.distance(startTime, endTime));

    yield* Effect.logInfo("Extraction pipeline complete", {
      entityCount: graph.stats.entityCount,
      relationCount: graph.stats.relationCount,
      tokensUsed: totalTokens,
      durationMs,
      clusteringEnabled,
    });

    return {
      graph,
      stats: {
        chunkCount: A.length(chunks),
        mentionCount: A.length(allMentions),
        entityCount: graph.stats.entityCount,
        relationCount: graph.stats.relationCount,
        tokensUsed: totalTokens,
        durationMs,
        clusteringEnabled,
      },
      config,
    };
  });

  return ExtractionPipeline.of({ run });
});

export const ExtractionPipelineLive = Layer.effect(ExtractionPipeline, serviceEffect).pipe(
  Layer.provide(MentionExtractorLive),
  Layer.provide(EntityExtractorLive),
  Layer.provide(RelationExtractorLive),
  Layer.provide(GraphAssemblerLive)
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
  config: ExtractionPipelineConfig
): Effect.Effect<ReadonlyArray<MentionRecord.Model>> =>
  Effect.gen(function* () {
    const extractionId = KnowledgeEntityIds.ExtractionId.create();
    const now = yield* DateTime.now;
    const orgId = SharedEntityIds.OrganizationId.make(config.organizationId);
    const docId = DocumentsEntityIds.DocumentId.make(config.documentId);
    let rowIdSeq = 0;

    return A.flatMap(mentionResults, (result) =>
      A.map(result.mentions, (mention) => {
        rowIdSeq += 1;
        return MentionRecord.Model.make({
          id: KnowledgeEntityIds.MentionRecordId.create(),
          _rowId: KnowledgeEntityIds.MentionRecordId.privateSchema.make(rowIdSeq),
          version: 1,
          organizationId: orgId,
          extractionId,
          documentId: docId,
          chunkIndex: result.chunk.index,
          rawText: mention.text,
          mentionType: mention.suggestedType ?? "",
          confidence: mention.confidence,
          responseHash: "",
          extractedAt: now,
          createdAt: now,
          updatedAt: now,
          source: O.none(),
          deletedAt: O.none(),
          createdBy: O.none(),
          updatedBy: O.none(),
          deletedBy: O.none(),
          resolvedEntityId: O.none(),
        });
      })
    );
  });
