import { UnknownError } from "@beep/errors";
import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import type {
  BatchAlreadyRunningError,
  BatchNotFoundError,
  InvalidStateTransitionError,
} from "@beep/knowledge-domain/errors";
import { BatchInfrastructureError } from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import type { BatchEvent } from "@beep/knowledge-domain/values";
import {
  BatchCompleted,
  BatchConfig,
  BatchCreated,
  BatchFailed,
  DocumentCompleted,
  DocumentFailed,
  DocumentStarted,
  ResolutionCompleted,
  ResolutionStarted,
} from "@beep/knowledge-domain/values";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { WorkflowRuntimeLive } from "@beep/knowledge-server/Runtime";
import * as KnowledgeTables from "@beep/knowledge-tables/schema";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
import { thunkZero } from "@beep/utils";
import { Workflow, WorkflowEngine } from "@effect/workflow";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { EmbeddingService } from "../Embedding";
import { ExtractionPipelineLive, ExtractionResult } from "../Extraction/ExtractionPipeline";
import type { AssembledEntity } from "../Extraction/GraphAssembler";
import { RepoLive as EntityRepoLive } from "../entities/Entity/Entity.repo";
import { RepoLive as RelationRepoLive } from "../entities/Relation/Relation.repo";
import { getErrorMessage, getErrorTag } from "../utils";
import { BatchEventEmitter, BatchEventEmitterLive } from "./BatchEventEmitter";
import {
  ExtractionWorkflow,
  ExtractionWorkflowConfig,
  ExtractionWorkflowLive,
  type ExtractionWorkflowParams,
} from "./ExtractionWorkflow";
import { WorkflowPersistence, WorkflowPersistenceLive } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/BatchOrchestrator");

export class BatchOrchestratorDocument extends S.Class<BatchOrchestratorDocument>($I`BatchOrchestratorDocument`)({
  documentId: WorkspacesEntityIds.DocumentId,
  text: S.String,
  ontologyContent: S.String,
}) {}

export class BatchOrchestratorParams extends S.Class<BatchOrchestratorParams>($I`BatchOrchestratorParams`)({
  batchId: S.optional(KnowledgeEntityIds.BatchExecutionId),
  organizationId: SharedEntityIds.OrganizationId,
  currentUserId: SharedEntityIds.UserId,
  ontologyId: KnowledgeEntityIds.OntologyId,
  documents: S.Array(BatchOrchestratorDocument),
  config: BatchConfig,
}) {}

export class DocumentResult extends S.Class<DocumentResult>($I`DocumentResult`)({
  documentId: WorkspacesEntityIds.DocumentId,
  result: S.Either({
    right: ExtractionResult,
    left: S.Defect,
  }),
}) {}

export class BatchResult extends S.Class<BatchResult>($I`BatchResult`)({
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentResults: S.Array(DocumentResult),
  totalDocuments: S.NonNegativeInt,
  successCount: S.NonNegativeInt,
  failureCount: S.NonNegativeInt,
  entityCount: S.NonNegativeInt,
  relationCount: S.NonNegativeInt,
}) {}

export interface BatchOrchestratorShape {
  readonly run: (
    params: BatchOrchestratorParams
  ) => Effect.Effect<
    BatchResult,
    BatchAlreadyRunningError | InvalidStateTransitionError | BatchNotFoundError | BatchInfrastructureError
  >;
  readonly start: (params: BatchOrchestratorParams) => Effect.Effect<
    {
      readonly batchId: KnowledgeEntityIds.BatchExecutionId.Type;
      readonly totalDocuments: number;
    },
    BatchInfrastructureError
  >;
}

export class BatchOrchestrator extends Context.Tag($I`BatchOrchestrator`)<
  BatchOrchestrator,
  BatchOrchestratorShape
>() {}

export class EngineDocument extends S.Class<EngineDocument>($I`EngineDocument`)({
  documentId: WorkspacesEntityIds.DocumentId,
  text: S.String,
  ontologyContent: S.String,
}) {}

export class EngineBatchPayloadConfigFailurePolicy extends BS.StringLiteralKit(
  "continue_on_failure",
  "abort_all",
  "retry_failed"
).annotations(
  $I.annotations("EngineBatchPayloadConfigFailurePolicy", {
    description: "Failure policy for the batch extraction workflow",
  })
) {}

export declare namespace EngineBatchPayloadConfigFailurePolicy {
  export type Type = typeof EngineBatchPayloadConfigFailurePolicy.Type;
}
const makeEngineBatchPayloadConfigKind = EngineBatchPayloadConfigFailurePolicy.toTagged("failurePolicy").composer({
  concurrency: S.NonNegativeInt,
  maxRetries: S.NonNegativeInt,
  enableEntityResolution: S.Boolean,
});

export class ContinueOnFailureEngineBatchPayloadConfig extends S.Class<ContinueOnFailureEngineBatchPayloadConfig>(
  $I`ContinueOnFailureEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind.continue_on_failure({})) {}

export class AbortAllEngineBatchPayloadConfig extends S.Class<AbortAllEngineBatchPayloadConfig>(
  $I`AbortAllEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind.abort_all({})) {}

export class RetryFailedEngineBatchPayloadConfig extends S.Class<RetryFailedEngineBatchPayloadConfig>(
  $I`RetryFailedEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind.retry_failed({})) {}

export class EngineBatchPayloadConfig extends S.Union(
  ContinueOnFailureEngineBatchPayloadConfig,
  AbortAllEngineBatchPayloadConfig,
  RetryFailedEngineBatchPayloadConfig
).annotations(
  $I.annotations("EngineBatchPayloadConfig", {
    description: "Configuration for the batch extraction workflow",
  })
) {}

export declare namespace EngineBatchPayloadConfig {
  export type Type = typeof EngineBatchPayloadConfig.Type;
  export type Encoded = typeof EngineBatchPayloadConfig.Encoded;
}

export class EngineBatchPayload extends S.Class<EngineBatchPayload>($I`EngineBatchPayload`)({
  batchId: KnowledgeEntityIds.BatchExecutionId,
  organizationId: SharedEntityIds.OrganizationId,
  currentUserId: SharedEntityIds.UserId,
  ontologyId: KnowledgeEntityIds.OntologyId,
  documents: S.Array(EngineDocument),
  config: EngineBatchPayloadConfig,
}) {}

export class EngineDocumentResult extends S.Class<EngineDocumentResult>($I`EngineDocumentResult`)({
  documentId: WorkspacesEntityIds.DocumentId,
  success: S.Boolean,
  extraction: S.optionalWith(ExtractionResult, { nullable: true, as: "Option" }),
  error: S.optionalWith(S.Defect, { nullable: true, as: "Option" }),
}) {}

export class EngineBatchResult extends S.Class<EngineBatchResult>($I`EngineBatchResult`)({
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentResults: S.Array(EngineDocumentResult),
  totalDocuments: S.NonNegativeInt,
  successCount: S.NonNegativeInt,
  failureCount: S.NonNegativeInt,
  entityCount: S.NonNegativeInt,
  relationCount: S.NonNegativeInt,
}) {}

const BatchEngineWorkflow = Workflow.make({
  name: "knowledge-batch-extraction",
  payload: EngineBatchPayload,
  success: EngineBatchResult,
  error: S.Defect,
  idempotencyKey: (payload) => payload.batchId,
});

const toDocumentResult = (result: EngineDocumentResult): DocumentResult =>
  result.success && O.isSome(result.extraction)
    ? { documentId: result.documentId, result: Either.right(result.extraction.value) }
    : {
        documentId: result.documentId,
        result: Either.left(
          result.error ??
            new UnknownError({
              cause: result,
            })
        ),
      };

const toBatchResult = (engine: EngineBatchResult): BatchResult => ({
  batchId: KnowledgeEntityIds.BatchExecutionId.make(engine.batchId),
  documentResults: A.map(engine.documentResults, toDocumentResult),
  totalDocuments: engine.totalDocuments,
  successCount: engine.successCount,
  failureCount: engine.failureCount,
  entityCount: engine.entityCount,
  relationCount: engine.relationCount,
});

const aggregateEngineResults = (
  batchId: KnowledgeEntityIds.BatchExecutionId.Type,
  documentResults: ReadonlyArray<EngineDocumentResult>
): EngineBatchResult => {
  const successResults = A.filter(documentResults, (result) => result.success && result.extraction !== null);
  const failureResults = A.filter(documentResults, (result) => !result.success);
  const entityCount = A.reduce(
    successResults,
    0,
    (acc, result) =>
      acc +
      result.extraction.pipe(
        O.match({
          onNone: thunkZero,
          onSome: ({ stats }) => stats.entityCount,
        })
      )
  );
  const relationCount = A.reduce(
    successResults,
    0,
    (acc, result) =>
      acc +
      result.extraction.pipe(
        O.match({
          onNone: thunkZero,
          onSome: ({ stats }) => stats.relationCount,
        })
      )
  );

  return {
    batchId,
    documentResults,
    totalDocuments: A.length(documentResults),
    successCount: A.length(successResults),
    failureCount: A.length(failureResults),
    entityCount,
    relationCount,
  };
};

const makeExtractionParams = (
  doc: BatchOrchestratorParams["documents"][number],
  params: BatchOrchestratorParams,
  retryAttempt: number
): ExtractionWorkflowParams => ({
  documentId: doc.documentId,
  organizationId: params.organizationId,
  ontologyId: params.ontologyId,
  text: doc.text,
  ontologyContent: doc.ontologyContent,
  config: new ExtractionWorkflowConfig({
    mergeEntities: true,
    enableIncrementalClustering: params.config.enableEntityResolution,
    retryOwner: params.config.failurePolicy === "retry_failed" ? "orchestrator" : "activity",
    retryAttempt,
  }),
});

export const executeBatchEngineWorkflow = Effect.fn(
  function* (payload: EngineBatchPayload, executionId: string) {
    const workflow = yield* ExtractionWorkflow;
    const emitter = yield* BatchEventEmitter;

    const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
    const maybeMentionRecordRepo = yield* Effect.serviceOption(Entities.MentionRecord.Repo);
    const maybeEmbeddingService = yield* Effect.serviceOption(EmbeddingService);
    // Entity/Relation repos kept in Layer for other consumers; persistence uses Drizzle directly
    const persistence = yield* WorkflowPersistence;
    const batchId = KnowledgeEntityIds.BatchExecutionId.make(payload.batchId);

    yield* Effect.annotateCurrentSpan("knowledge.batch.id", payload.batchId);
    yield* Effect.annotateCurrentSpan("knowledge.organization.id", payload.organizationId);
    yield* Effect.annotateCurrentSpan("knowledge.ontology.id", payload.ontologyId);
    yield* Effect.annotateCurrentSpan("knowledge.batch.execution_id", executionId);
    yield* Effect.annotateCurrentSpan("knowledge.batch.failure_policy", payload.config.failurePolicy);
    yield* Effect.annotateCurrentSpan("knowledge.batch.total_documents", A.length(payload.documents));
    yield* Effect.annotateCurrentSpan("knowledge.batch.max_retries", payload.config.maxRetries);
    yield* Effect.annotateCurrentSpan(
      "knowledge.batch.enable_entity_resolution",
      payload.config.enableEntityResolution
    );

    const emitEvent = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.emitEvent")(
      function* (makeEvent: (timestamp: DateTime.Utc) => BatchEvent.Type) {
        const now = yield* DateTime.now;
        yield* emitter.emit(makeEvent(now));
      },
      Effect.catchAllCause((cause) =>
        Effect.logDebug("BatchOrchestrator(engine): failed to emit event").pipe(
          Effect.annotateLogs({ cause: String(cause), batchId })
        )
      )
    );

    const processDocument: (
      doc: EngineDocument,
      index: number,
      retryAttempt?: undefined | number
    ) => Effect.Effect<EngineDocumentResult, never, KnowledgeDb.Db> = Effect.fn(
      "BatchOrchestrator.executeBatchEngineWorkflow.processDocument"
    )(function* (doc, index, retryAttempt = 0) {
      yield* Effect.annotateCurrentSpan("knowledge.batch.id", payload.batchId);
      yield* Effect.annotateCurrentSpan("knowledge.document.id", doc.documentId);
      yield* Effect.annotateCurrentSpan("knowledge.document.index", index);
      yield* Effect.annotateCurrentSpan("knowledge.document.retry_attempt", retryAttempt);

      const runtimeParams = new BatchOrchestratorParams({
        batchId,
        organizationId: payload.organizationId,
        ontologyId: payload.ontologyId,
        currentUserId: payload.currentUserId,
        documents: [],
        config: BatchConfig.new(payload.config),
      });

      yield* emitEvent((timestamp) =>
        DocumentStarted.make({ batchId, documentId: doc.documentId, documentIndex: index, timestamp })
      );

      const either = yield* Effect.either(workflow.run(makeExtractionParams(doc, runtimeParams, retryAttempt)));
      if (Either.isRight(either)) {
        yield* Effect.annotateCurrentSpan("outcome.success", true);
        yield* Effect.annotateCurrentSpan("knowledge.entity.count", either.right.stats.entityCount);
        yield* Effect.annotateCurrentSpan("knowledge.relation.count", either.right.stats.relationCount);

        yield* emitEvent((timestamp) =>
          DocumentCompleted.make({
            batchId,
            documentId: doc.documentId,
            entityCount: either.right.stats.entityCount,
            relationCount: either.right.stats.relationCount,
            timestamp,
          })
        );

        return new EngineDocumentResult({
          documentId: doc.documentId,
          success: true,
          extraction: O.some(either.right),
          error: O.none(),
        });
      }

      yield* Effect.annotateCurrentSpan("outcome.success", false);
      yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(either.left));
      yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(either.left));

      yield* emitEvent((timestamp) =>
        DocumentFailed.make({ batchId, documentId: doc.documentId, error: String(either.left), timestamp })
      );
      return new EngineDocumentResult({
        documentId: doc.documentId,
        success: false,
        extraction: O.none(),
        error: either.left,
      });
    }, Effect.withSpan("knowledge.batch.document"));

    const processContinue = Effect.forEach(payload.documents, processDocument, {
      concurrency: payload.config.concurrency,
    });

    const processAbortAll = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.processAbortAll")(function* () {
      const initialState = { index: 0, results: A.empty<EngineDocumentResult>(), aborted: false };
      const finalState = yield* Effect.iterate(initialState, {
        while: (state) => !state.aborted && state.index < A.length(payload.documents),
        body: (state) =>
          Effect.gen(function* () {
            const doc = F.pipe(A.get(payload.documents, state.index), O.getOrThrow);
            const result = yield* processDocument(doc, state.index);
            return {
              index: state.index + 1,
              results: A.append(state.results, result),
              aborted: !result.success,
            };
          }),
      });
      return finalState.results;
    });

    const processRetryFailed = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.processRetryFailed")(
      function* () {
        const initialResults = yield* processContinue;
        const initialState = {
          results: initialResults,
          retriesRemaining: payload.config.maxRetries,
          retryAttempt: 1,
        };
        const finalState = yield* Effect.iterate(initialState, {
          while: (state) => A.some(state.results, (result) => !result.success) && state.retriesRemaining > 0,
          body: (state) =>
            Effect.gen(function* () {
              const failedResults = A.filter(state.results, (result) => !result.success);
              const failedIds = A.map(failedResults, (result) => result.documentId);
              const retryDocs = A.filterMap(payload.documents, (doc, index) =>
                F.pipe(failedIds, A.contains(doc.documentId)) ? O.some({ doc, index }) : O.none()
              );
              const retryResults = yield* Effect.forEach(
                retryDocs,
                ({ doc, index }) => processDocument(doc, index, state.retryAttempt),
                { concurrency: payload.config.concurrency }
              );
              const retryMap = HashMap.fromIterable(
                A.map(retryResults, (result): readonly [string, EngineDocumentResult] => [result.documentId, result])
              );
              const mergedResults = A.map(state.results, (result) =>
                F.pipe(
                  HashMap.get(retryMap, result.documentId),
                  O.getOrElse(() => result)
                )
              );
              return {
                results: mergedResults,
                retriesRemaining: state.retriesRemaining - 1,
                retryAttempt: state.retryAttempt + 1,
              };
            }),
        });
        return finalState.results;
      }
    );

    yield* persistence.updateExecutionStatus(executionId, "running");

    yield* emitEvent((timestamp) =>
      BatchCreated.make({ batchId, totalDocuments: A.length(payload.documents), timestamp })
    );

    const documentResults = yield* Match.value(payload.config.failurePolicy).pipe(
      Match.when("continue_on_failure", () => processContinue),
      Match.when("abort_all", processAbortAll),
      Match.when("retry_failed", processRetryFailed),
      Match.exhaustive
    );

    const batchResult = aggregateEngineResults(batchId, documentResults);
    yield* Effect.annotateCurrentSpan("knowledge.batch.success_count", batchResult.successCount);
    yield* Effect.annotateCurrentSpan("knowledge.batch.failure_count", batchResult.failureCount);
    yield* Effect.annotateCurrentSpan("knowledge.entity.count", batchResult.entityCount);
    yield* Effect.annotateCurrentSpan("knowledge.relation.count", batchResult.relationCount);

    if (payload.config.enableEntityResolution && O.isSome(maybeClusterer)) {
      yield* emitEvent((timestamp) => ResolutionStarted.make({ batchId, timestamp }));

      const mergeCount = yield* Effect.gen(function* () {
        if (O.isNone(maybeMentionRecordRepo)) {
          return 0;
        }
        const unresolvedMentions = yield* maybeMentionRecordRepo.value.findUnresolved(
          SharedEntityIds.OrganizationId.make(payload.organizationId),
          1000
        );
        if (A.length(unresolvedMentions) === 0) {
          return 0;
        }
        yield* maybeClusterer.value.cluster(unresolvedMentions);
        return A.length(unresolvedMentions);
      }).pipe(
        Effect.catchAllCause((cause) =>
          Effect.gen(function* () {
            const failure = Cause.squash(cause);
            yield* Effect.annotateCurrentSpan("outcome.success", false);
            yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(failure));
            yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(failure));
            yield* Effect.logWarning("BatchOrchestrator(engine): entity resolution failed, continuing").pipe(
              Effect.annotateLogs({ cause: String(cause), batchId })
            );
            return 0;
          })
        )
      );

      yield* emitEvent((timestamp) => ResolutionCompleted.make({ batchId, mergeCount, timestamp }));
    }

    const successfulExtractions = F.pipe(
      documentResults,
      A.filter((result) => result.success && result.extraction !== null)
    );

    const allExtractedEntities = F.pipe(
      successfulExtractions,
      A.flatMap((result) =>
        result.extraction.pipe(
          O.match({
            onNone: A.empty,
            onSome: ({ graph }) => graph.entities,
          })
        )
      )
    );

    const allExtractedRelations = F.pipe(
      successfulExtractions,
      A.flatMap(
        F.flow(
          Struct.get("extraction"),
          O.match({
            onNone: A.empty,
            onSome: ({ graph }) => graph.relations,
          })
        )
      )
    );

    if (!A.isEmptyReadonlyArray(allExtractedEntities) || !A.isEmptyReadonlyArray(allExtractedRelations)) {
      yield* Effect.gen(function* () {
        const orgId = SharedEntityIds.OrganizationId.make(payload.organizationId);
        const ontologyId = payload.ontologyId;

        yield* Effect.logInfo("BatchOrchestrator(engine): persisting extracted entities and relations").pipe(
          Effect.annotateLogs({
            entityCount: A.length(allExtractedEntities),
            relationCount: A.length(allExtractedRelations),
            batchId,
          })
        );

        const { effectClient } = yield* KnowledgeDb.Db;

        if (!A.isEmptyReadonlyArray(allExtractedEntities)) {
          const entityRows = A.filterMap(allExtractedEntities, (entity) => {
            if (!A.isNonEmptyReadonlyArray(entity.types)) return O.none();
            const auditField = O.some(payload.currentUserId);
            return S.encodeOption(Entities.Entity.Model.insert)({
              id: entity.id,
              organizationId: orgId,
              mention: entity.mention,
              types: [...entity.types],
              attributes: { ...entity.attributes },
              ontologyId: O.some(ontologyId),
              documentId: O.none(),
              sourceUri: O.none(),
              createdBy: auditField,
              updatedBy: auditField,
              source: O.some("batch-orchestrator"),
              extractionId: O.none(),
              groundingConfidence: O.some(entity.confidence),
              mentions: O.none(),
              deletedAt: O.none(),
              deletedBy: O.none(),
            });
          });

          if (!A.isEmptyReadonlyArray(entityRows)) {
            yield* effectClient.insert(KnowledgeTables.entity).values(entityRows).onConflictDoNothing();
            yield* Effect.logInfo("BatchOrchestrator(engine): entities persisted via drizzle").pipe(
              Effect.annotateLogs({ count: A.length(entityRows) })
            );
          }
        }
        // A.map(allExtractedRelations, (relation) => ({

        //                     }))
        if (!A.isEmptyReadonlyArray(allExtractedRelations)) {
          const relationRows = A.filterMap(allExtractedRelations, (relation) =>
            S.encodeOption(Entities.Relation.Model.insert)({
              id: relation.id,
              organizationId: orgId,
              subjectId: relation.subjectId,
              predicate: relation.predicate,
              objectId: O.fromNullable(relation.objectId),
              literalValue: O.fromNullable(relation.literalValue),
              literalType: O.fromNullable(relation.literalType),
              ontologyId: ontologyId ?? "default",
              extractionId: O.none(),
              evidence: relation.evidence
                ? O.some({
                    text: relation.evidence,
                    startChar: relation.evidenceStartChar ?? 0,
                    endChar: relation.evidenceEndChar ?? 0,
                  })
                : O.none(),
              groundingConfidence: O.fromNullable(relation.confidence),
              source: O.some("batch-orchestrator"),
              createdBy: payload.currentUserId,
              updatedBy: payload.currentUserId,
              deletedAt: O.none(),

              deletedBy: O.none(),
            })
          );

          if (!A.isEmptyReadonlyArray(relationRows)) {
            yield* effectClient.insert(KnowledgeTables.relation).values(relationRows).onConflictDoNothing();
            yield* Effect.logInfo("BatchOrchestrator(engine): relations persisted via drizzle").pipe(
              Effect.annotateLogs({ count: A.length(relationRows) })
            );
          }
        }

        yield* Effect.logInfo("BatchOrchestrator(engine): entity and relation persistence complete").pipe(
          Effect.annotateLogs({
            entityCount: A.length(allExtractedEntities),
            relationCount: A.length(allExtractedRelations),
            batchId,
          })
        );
      }).pipe(
        Effect.catchAllCause((cause) =>
          Effect.gen(function* () {
            const failure = Cause.squash(cause);
            yield* Effect.annotateCurrentSpan("persistence.success", false);
            yield* Effect.annotateCurrentSpan("persistence.error.tag", getErrorTag(failure));
            yield* Effect.annotateCurrentSpan("persistence.error.message", getErrorMessage(failure));
            yield* Effect.logWarning("BatchOrchestrator(engine): entity/relation persistence failed, continuing").pipe(
              Effect.annotateLogs({ cause: String(cause), batchId })
            );
          })
        )
      );
    }

    if (O.isSome(maybeEmbeddingService)) {
      const allEntities: ReadonlyArray<AssembledEntity> = allExtractedEntities;

      if (!A.isEmptyReadonlyArray(allEntities)) {
        yield* Effect.gen(function* () {
          yield* Effect.logInfo("BatchOrchestrator(engine): generating entity embeddings").pipe(
            Effect.annotateLogs({ entityCount: A.length(allEntities), batchId })
          );

          yield* maybeEmbeddingService.value.embedEntities(
            allEntities,
            SharedEntityIds.OrganizationId.make(payload.organizationId),
            KnowledgeEntityIds.OntologyId.make(payload.ontologyId)
          );

          yield* Effect.logInfo("BatchOrchestrator(engine): entity embeddings complete").pipe(
            Effect.annotateLogs({ entityCount: A.length(allEntities), batchId })
          );
        }).pipe(
          Effect.catchAllCause((cause) =>
            Effect.gen(function* () {
              const failure = Cause.squash(cause);
              yield* Effect.annotateCurrentSpan("embedding.success", false);
              yield* Effect.annotateCurrentSpan("embedding.error.tag", getErrorTag(failure));
              yield* Effect.annotateCurrentSpan("embedding.error.message", getErrorMessage(failure));
              yield* Effect.logWarning(
                "BatchOrchestrator(engine): entity embedding generation failed, continuing"
              ).pipe(Effect.annotateLogs({ cause: String(cause), batchId }));
            })
          )
        );
      }
    }

    if (batchResult.failureCount > 0 && batchResult.successCount === 0) {
      yield* Effect.annotateCurrentSpan("outcome.success", false);
      yield* Effect.annotateCurrentSpan("error.tag", "AllDocumentsFailed");
      yield* Effect.annotateCurrentSpan("error.message", "All documents failed");

      yield* emitEvent((timestamp) =>
        BatchFailed.make({
          batchId,
          error: "All documents failed",
          failedDocuments: batchResult.failureCount,
          timestamp,
        })
      );
      yield* persistence.updateExecutionStatus(executionId, "failed", {
        output: {
          batchId,
          totalDocuments: batchResult.totalDocuments,
          successCount: batchResult.successCount,
          failureCount: batchResult.failureCount,
          entityCount: batchResult.entityCount,
          relationCount: batchResult.relationCount,
        },
        error: "All documents failed",
      });
      return batchResult;
    }

    yield* emitEvent((timestamp) =>
      BatchCompleted.make({
        batchId,
        totalDocuments: batchResult.totalDocuments,
        entityCount: batchResult.entityCount,
        relationCount: batchResult.relationCount,
        timestamp,
      })
    );

    yield* persistence.updateExecutionStatus(executionId, "completed", {
      output: {
        batchId,
        totalDocuments: batchResult.totalDocuments,
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
        entityCount: batchResult.entityCount,
        relationCount: batchResult.relationCount,
      },
    });

    yield* Effect.annotateCurrentSpan("outcome.success", batchResult.failureCount === 0);
    return batchResult;
  },
  Effect.catchAllCause((cause) =>
    Effect.gen(function* () {
      const failure = Cause.squash(cause);
      yield* Effect.annotateCurrentSpan("outcome.success", false);
      yield* Effect.annotateCurrentSpan("error.tag", getErrorTag(failure));
      yield* Effect.annotateCurrentSpan("error.message", getErrorMessage(failure));
      return yield* Effect.failCause(cause);
    })
  ),
  Effect.withSpan("knowledge.batch.orchestrate"),
  Effect.mapError(String)
);

const toEngineConfig = (config: BatchConfig.Type) => {
  const fields = {
    concurrency: config.concurrency,
    maxRetries: config.maxRetries,
    enableEntityResolution: config.enableEntityResolution,
  };
  //         Match.when("continue_on_failure", () => new ContinueOnFailureEngineBatchPayloadConfig(fields)),
  //         Match.when("abort_all", () => new AbortAllEngineBatchPayloadConfig(fields)),
  //         Match.when("retry_failed", () => new RetryFailedEngineBatchPayloadConfig(fields)),
  //         Match.exhaustive
  return Match.value(config).pipe(
    Match.discriminatorsExhaustive("failurePolicy")({
      ["continue_on_failure" as const]: () => new ContinueOnFailureEngineBatchPayloadConfig(fields),
      ["abort_all" as const]: () => new AbortAllEngineBatchPayloadConfig(fields),
      ["retry_failed" as const]: () => new RetryFailedEngineBatchPayloadConfig(fields),
    })
  );
};

const toEnginePayload = (
  params: BatchOrchestratorParams,
  batchId: KnowledgeEntityIds.BatchExecutionId.Type
): EngineBatchPayload =>
  new EngineBatchPayload({
    batchId,
    organizationId: params.organizationId,
    ontologyId: params.ontologyId,
    currentUserId: params.currentUserId,
    documents: A.map(
      params.documents,
      (doc) =>
        new EngineDocument({
          documentId: doc.documentId,
          text: doc.text,
          ontologyContent: doc.ontologyContent,
        })
    ),
    config: toEngineConfig(params.config),
  });

const executionInput = (payload: EngineBatchPayload) => ({
  batchId: payload.batchId,
  totalDocuments: A.length(payload.documents),
  concurrency: payload.config.concurrency,
  failurePolicy: payload.config.failurePolicy,
  executionMode: "engine",
});

const toInfrastructureError = (
  batchId: KnowledgeEntityIds.BatchExecutionId.Type,
  operation: string,
  reason: string
): BatchInfrastructureError =>
  new BatchInfrastructureError({
    batchId,
    operation,
    reason,
  });

const serviceEffect = Effect.gen(function* () {
  const workflowEngine = yield* WorkflowEngine.WorkflowEngine;
  const persistence = yield* WorkflowPersistence;

  const persistInitialExecution = (
    payload: EngineBatchPayload,
    executionId: string
  ): Effect.Effect<void, BatchInfrastructureError> => {
    const batchId = KnowledgeEntityIds.BatchExecutionId.make(payload.batchId);
    return persistence
      .createExecution({
        id: executionId,
        organizationId: payload.organizationId,
        workflowType: "batch_extraction",
        input: executionInput(payload),
      })
      .pipe(
        Effect.mapError(() =>
          toInfrastructureError(batchId, "batch_create_execution", "failed to persist initial execution row")
        )
      );
  };

  const dispatchAndMapFailure = <A, E>(
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    operation: string,
    effect: Effect.Effect<A, E>
  ): Effect.Effect<A, BatchInfrastructureError> => {
    return effect.pipe(
      Effect.mapError(() => toInfrastructureError(batchId, operation, "workflow execution failed")),
      Effect.catchAllCause(() => Effect.fail(toInfrastructureError(batchId, operation, "workflow dispatch failed")))
    );
  };

  const run: BatchOrchestratorShape["run"] = Effect.fn("BatchOrchestrator.run")(function* (
    params: BatchOrchestratorParams
  ) {
    const batchId = params.batchId ?? KnowledgeEntityIds.BatchExecutionId.create();
    const payload = toEnginePayload(params, batchId);
    const executionId = yield* BatchEngineWorkflow.executionId(payload);
    yield* persistInitialExecution(payload, executionId);

    const engineResult = yield* dispatchAndMapFailure(
      batchId,
      "batch_run_dispatch",
      BatchEngineWorkflow.execute(payload).pipe(Effect.provideService(WorkflowEngine.WorkflowEngine, workflowEngine))
    );
    return toBatchResult(engineResult);
  });

  const start: BatchOrchestratorShape["start"] = Effect.fn("BatchOrchestrator.start")(function* (
    params: BatchOrchestratorParams
  ) {
    const batchId = params.batchId ?? KnowledgeEntityIds.BatchExecutionId.create();
    const payload = toEnginePayload(params, batchId);
    const executionId = yield* BatchEngineWorkflow.executionId(payload);

    yield* persistInitialExecution(payload, executionId);
    yield* dispatchAndMapFailure(
      batchId,
      "batch_start_dispatch",
      BatchEngineWorkflow.execute(payload, { discard: true }).pipe(
        Effect.provideService(WorkflowEngine.WorkflowEngine, workflowEngine),
        Effect.asVoid
      )
    );

    return {
      batchId,
      totalDocuments: A.length(payload.documents),
    };
  });

  return BatchOrchestrator.of({ run, start });
});

const BatchEngineWorkflowLayer = BatchEngineWorkflow.toLayer(executeBatchEngineWorkflow).pipe(
  Layer.provideMerge(ExtractionWorkflowLive),
  Layer.provideMerge(WorkflowPersistenceLive),
  Layer.provideMerge(BatchEventEmitterLive),
  Layer.provideMerge(ExtractionPipelineLive),
  Layer.provideMerge(EntityRepoLive),
  Layer.provideMerge(RelationRepoLive),
  Layer.provideMerge(KnowledgeDb.layer),
  Layer.provideMerge(WorkflowRuntimeLive)
);

export const BatchOrchestratorLive = Layer.effect(BatchOrchestrator, serviceEffect).pipe(
  Layer.provideMerge(BatchEngineWorkflowLayer)
);
