import { $KnowledgeServerId } from "@beep/identity/packages";
import type {
  BatchAlreadyRunningError,
  BatchNotFoundError,
  InvalidStateTransitionError,
} from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import type { BatchEvent } from "@beep/knowledge-domain/value-objects";
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
} from "@beep/knowledge-domain/value-objects";
import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { Workflow, WorkflowEngine } from "@effect/workflow";
import * as A from "effect/Array";
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
import { ExtractionResult } from "../Extraction/ExtractionPipeline";
import { BatchEventEmitter } from "./BatchEventEmitter";
import { ExtractionWorkflow, type ExtractionWorkflowParams } from "./ExtractionWorkflow";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/BatchOrchestrator");

export class BatchOrchestratorDocument extends S.Class<BatchOrchestratorDocument>($I`BatchOrchestratorDocument`)({
  documentId: DocumentsEntityIds.DocumentId,
  text: S.String,
  ontologyContent: S.String,
}) {}

export class BatchOrchestratorParams extends S.Class<BatchOrchestratorParams>($I`BatchOrchestratorParams`)({
  batchId: S.optional(KnowledgeEntityIds.BatchExecutionId),
  organizationId: SharedEntityIds.OrganizationId,
  ontologyId: KnowledgeEntityIds.OntologyId,
  documents: S.Array(BatchOrchestratorDocument),
  config: BatchConfig,
}) {}

export class DocumentResult extends S.Class<DocumentResult>($I`DocumentResult`)({
  documentId: DocumentsEntityIds.DocumentId,
  result: S.Either({
    right: ExtractionResult,
    left: S.String,
  }),
}) {}

export class BatchResult extends S.Class<BatchResult>($I`BatchResult`)({
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentResults: S.Array(DocumentResult),
  totalDocuments: S.Number,
  successCount: S.Number,
  failureCount: S.Number,
  entityCount: S.Number,
  relationCount: S.Number,
}) {}

export interface BatchOrchestratorShape {
  readonly run: (
    params: BatchOrchestratorParams
  ) => Effect.Effect<BatchResult, BatchAlreadyRunningError | InvalidStateTransitionError | BatchNotFoundError>;
}

export class BatchOrchestrator extends Context.Tag($I`BatchOrchestrator`)<
  BatchOrchestrator,
  BatchOrchestratorShape
>() {}

export class EngineDocument extends S.Class<EngineDocument>($I`EngineDocument`)({
  documentId: DocumentsEntityIds.DocumentId,
  text: S.String,
  ontologyContent: S.String,
}) {}

export class EngineBatchPayloadConfigFailurePolicy extends BS.StringLiteralKit(
  "continue-on-failure",
  "abort-all",
  "retry-failed"
).annotations(
  $I.annotations("EngineBatchPayloadConfigFailurePolicy", {
    description: "Failure policy for the batch extraction workflow",
  })
) {}

export declare namespace EngineBatchPayloadConfigFailurePolicy {
  export type Type = typeof EngineBatchPayloadConfigFailurePolicy.Type;
}
const makeEngineBatchPayloadConfigKind = EngineBatchPayloadConfigFailurePolicy.toTagged("failurePolicy").composer({
  concurrency: S.Number,
  maxRetries: S.Number,
  enableEntityResolution: S.Boolean,
});

export class ContinueOnFailureEngineBatchPayloadConfig extends S.Class<ContinueOnFailureEngineBatchPayloadConfig>(
  $I`ContinueOnFailureEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind["continue-on-failure"]({})) {}

export class AbortAllEngineBatchPayloadConfig extends S.Class<AbortAllEngineBatchPayloadConfig>(
  $I`AbortAllEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind["abort-all"]({})) {}

export class RetryFailedEngineBatchPayloadConfig extends S.Class<RetryFailedEngineBatchPayloadConfig>(
  $I`RetryFailedEngineBatchPayloadConfig`
)(makeEngineBatchPayloadConfigKind["retry-failed"]({})) {}

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
  batchId: S.String,
  organizationId: S.String,
  ontologyId: S.String,
  documents: S.Array(EngineDocument),
  config: EngineBatchPayloadConfig,
}) {}

export class EngineDocumentResult extends S.Class<EngineDocumentResult>($I`EngineDocumentResult`)({
  documentId: DocumentsEntityIds.DocumentId,
  success: S.Boolean,
  extraction: S.NullOr(ExtractionResult),
  error: S.NullOr(S.String),
}) {}

export class EngineBatchResult extends S.Class<EngineBatchResult>($I`EngineBatchResult`)({
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentResults: S.Array(EngineDocumentResult),
  totalDocuments: S.Number,
  successCount: S.Number,
  failureCount: S.Number,
  entityCount: S.Number,
  relationCount: S.Number,
}) {}

const BatchEngineWorkflow = Workflow.make({
  name: "knowledge-batch-extraction",
  payload: EngineBatchPayload,
  success: EngineBatchResult,
  error: S.Never,
  idempotencyKey: (payload) => payload.batchId,
});

const toDocumentResult = (result: EngineDocumentResult): DocumentResult =>
  result.success && result.extraction !== null
    ? { documentId: result.documentId, result: Either.right(result.extraction) }
    : { documentId: result.documentId, result: Either.left(result.error ?? "unknown error") };

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
  const entityCount = A.reduce(successResults, 0, (acc, result) => acc + (result.extraction?.stats.entityCount ?? 0));
  const relationCount = A.reduce(
    successResults,
    0,
    (acc, result) => acc + (result.extraction?.stats.relationCount ?? 0)
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
  params: BatchOrchestratorParams
): ExtractionWorkflowParams => ({
  documentId: doc.documentId,
  organizationId: params.organizationId,
  ontologyId: params.ontologyId,
  text: doc.text,
  ontologyContent: doc.ontologyContent,
  config: {
    mergeEntities: true,
    enableIncrementalClustering: params.config.enableEntityResolution,
    retryOwner: params.config.failurePolicy === "retry-failed" ? "orchestrator" : "activity",
  },
});

export const executeBatchEngineWorkflow = (payload: EngineBatchPayload, executionId: string) =>
  Effect.gen(function* () {
    const workflow = yield* ExtractionWorkflow;
    const emitter = yield* BatchEventEmitter;
    const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
    const maybeMentionRecordRepo = yield* Effect.serviceOption(MentionRecordRepo);
    const persistence = yield* WorkflowPersistence;
    const batchId = KnowledgeEntityIds.BatchExecutionId.make(payload.batchId);

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

    const processDocument: (doc: EngineDocument, index: number) => Effect.Effect<EngineDocumentResult> = Effect.fn(
      "BatchOrchestrator.executeBatchEngineWorkflow.processDocument"
    )(function* (doc, index) {
      const runtimeParams = new BatchOrchestratorParams({
        batchId,
        organizationId: SharedEntityIds.OrganizationId.make(payload.organizationId),
        ontologyId: KnowledgeEntityIds.OntologyId.make(payload.ontologyId),
        documents: [],
        config: new BatchConfig(payload.config),
      });

      yield* emitEvent((timestamp) =>
        DocumentStarted.make({ batchId, documentId: doc.documentId, documentIndex: index, timestamp })
      );

      const either = yield* Effect.either(workflow.run(makeExtractionParams(doc, runtimeParams)));
      if (Either.isRight(either)) {
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
          extraction: either.right,
          error: null,
        });
      }

      yield* emitEvent((timestamp) =>
        DocumentFailed.make({ batchId, documentId: doc.documentId, error: String(either.left), timestamp })
      );
      return new EngineDocumentResult({
        documentId: doc.documentId,
        success: false,
        extraction: null,
        error: String(either.left),
      });
    });

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
        };
        const finalState = yield* Effect.iterate(initialState, {
          while: (state) => A.some(state.results, (result) => !result.success) && state.retriesRemaining > 0,
          body: (state) =>
            Effect.gen(function* () {
              const failedResults = A.filter(state.results, (result) => !result.success);
              const failedIds = A.map(failedResults, (result) => result.documentId);
              const retryDocs = A.filter(payload.documents, (doc) => F.pipe(failedIds, A.contains(doc.documentId)));
              const retryResults = yield* Effect.forEach(retryDocs, processDocument, {
                concurrency: payload.config.concurrency,
              });
              const retryMap = HashMap.fromIterable(
                A.map(retryResults, (result): readonly [string, EngineDocumentResult] => [result.documentId, result])
              );
              const mergedResults = A.map(state.results, (result) =>
                F.pipe(
                  HashMap.get(retryMap, result.documentId),
                  O.getOrElse(() => result)
                )
              );
              return { results: mergedResults, retriesRemaining: state.retriesRemaining - 1 };
            }),
        });
        return finalState.results;
      }
    );

    yield* persistence
      .createExecution({
        id: executionId,
        organizationId: payload.organizationId,
        workflowType: "batch_extraction",
        input: {
          batchId,
          totalDocuments: A.length(payload.documents),
          concurrency: payload.config.concurrency,
          failurePolicy: payload.config.failurePolicy,
          executionMode: "engine",
        },
      })
      // Persistence is best-effort: failures and defects should not block orchestration.
      .pipe(Effect.catchAllCause(() => Effect.void));
    // Persistence is best-effort: failures and defects should not block orchestration.
    yield* persistence.updateExecutionStatus(executionId, "running").pipe(Effect.catchAllCause(() => Effect.void));

    yield* emitEvent((timestamp) =>
      BatchCreated.make({ batchId, totalDocuments: A.length(payload.documents), timestamp })
    );

    const documentResults = yield* Match.value(payload.config.failurePolicy).pipe(
      Match.when("continue-on-failure", () => processContinue),
      Match.when("abort-all", () => processAbortAll()),
      Match.when("retry-failed", () => processRetryFailed()),
      Match.exhaustive
    );

    const batchResult = aggregateEngineResults(batchId, documentResults);

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
          Effect.logWarning("BatchOrchestrator(engine): entity resolution failed, continuing").pipe(
            Effect.annotateLogs({ cause: String(cause), batchId }),
            Effect.as(0)
          )
        )
      );

      yield* emitEvent((timestamp) => ResolutionCompleted.make({ batchId, mergeCount, timestamp }));
    }

    if (batchResult.failureCount > 0 && batchResult.successCount === 0) {
      yield* emitEvent((timestamp) =>
        BatchFailed.make({
          batchId,
          error: "All documents failed",
          failedDocuments: batchResult.failureCount,
          timestamp,
        })
      );
      yield* persistence
        .updateExecutionStatus(executionId, "failed", {
          output: {
            batchId,
            totalDocuments: batchResult.totalDocuments,
            successCount: batchResult.successCount,
            failureCount: batchResult.failureCount,
            entityCount: batchResult.entityCount,
            relationCount: batchResult.relationCount,
          },
          error: "All documents failed",
        })
        // Persistence is best-effort: failures and defects should not block completion.
        .pipe(Effect.catchAllCause(() => Effect.void));
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

    yield* persistence
      .updateExecutionStatus(executionId, "completed", {
        output: {
          batchId,
          totalDocuments: batchResult.totalDocuments,
          successCount: batchResult.successCount,
          failureCount: batchResult.failureCount,
          entityCount: batchResult.entityCount,
          relationCount: batchResult.relationCount,
        },
      })
      // Persistence is best-effort: failures and defects should not block completion.
      .pipe(Effect.catchAllCause(() => Effect.void));

    return batchResult;
  });

const serviceEffect = Effect.gen(function* () {
  const maybeWorkflowEngine = yield* Effect.serviceOption(WorkflowEngine.WorkflowEngine);

  const run: BatchOrchestratorShape["run"] = Effect.fn("BatchOrchestrator.run")(function* (
    params: BatchOrchestratorParams
  ) {
    const batchId = params.batchId ?? KnowledgeEntityIds.BatchExecutionId.create();
    const payload = new EngineBatchPayload({
      batchId,
      organizationId: params.organizationId,
      ontologyId: params.ontologyId,
      documents: params.documents,
      config: {
        concurrency: params.config.concurrency,
        failurePolicy: params.config.failurePolicy,
        maxRetries: params.config.maxRetries,
        enableEntityResolution: params.config.enableEntityResolution,
      },
    });

    if (O.isNone(maybeWorkflowEngine)) {
      return yield* Effect.dieMessage("WorkflowEngine unavailable for engine mode");
    }

    const engineResult = yield* BatchEngineWorkflow.execute(payload).pipe(
      Effect.provideService(WorkflowEngine.WorkflowEngine, maybeWorkflowEngine.value)
    );
    return toBatchResult(engineResult);
  });

  return BatchOrchestrator.of({ run });
});

const BatchEngineWorkflowLayer = BatchEngineWorkflow.toLayer(executeBatchEngineWorkflow);

export const BatchOrchestratorLive = Layer.mergeAll(
  Layer.effect(BatchOrchestrator, serviceEffect),
  BatchEngineWorkflowLayer
);
