import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { BatchInfrastructureError } from "@beep/knowledge-domain/errors";
import type {
  BatchAlreadyRunningError,
  BatchNotFoundError,
  InvalidStateTransitionError,
} from "@beep/knowledge-domain/errors";
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
import { WorkflowRuntimeLive } from "@beep/knowledge-server/Runtime";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds, WorkspacesEntityIds } from "@beep/shared-domain";
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
import { ExtractionPipelineLive, ExtractionResult } from "../Extraction/ExtractionPipeline";
import { BatchEventEmitter, BatchEventEmitterLive } from "./BatchEventEmitter";
import { ExtractionWorkflow, ExtractionWorkflowLive, type ExtractionWorkflowParams } from "./ExtractionWorkflow";
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
  ontologyId: KnowledgeEntityIds.OntologyId,
  documents: S.Array(BatchOrchestratorDocument),
  config: BatchConfig,
}) {}

export class DocumentResult extends S.Class<DocumentResult>($I`DocumentResult`)({
  documentId: WorkspacesEntityIds.DocumentId,
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
  ) => Effect.Effect<
    BatchResult,
    BatchAlreadyRunningError | InvalidStateTransitionError | BatchNotFoundError | BatchInfrastructureError
  >;
  readonly start: (
    params: BatchOrchestratorParams
  ) => Effect.Effect<
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
  documentId: WorkspacesEntityIds.DocumentId,
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
  error: S.String,
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
  params: BatchOrchestratorParams,
  retryAttempt: number
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
    retryAttempt,
  },
});

export const executeBatchEngineWorkflow = Effect.fn(function* (payload: EngineBatchPayload, executionId: string) {
  const workflow = yield* ExtractionWorkflow;
  const emitter = yield* BatchEventEmitter;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
  const maybeMentionRecordRepo = yield* Effect.serviceOption(Entities.MentionRecord.Repo);
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

  const processDocument: (
    doc: EngineDocument,
    index: number,
    retryAttempt?: number
  ) => Effect.Effect<EngineDocumentResult> = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.processDocument")(
    function* (doc, index, retryAttempt = 0) {
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

    const either = yield* Effect.either(workflow.run(makeExtractionParams(doc, runtimeParams, retryAttempt)));
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
    }
  );

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

  const processRetryFailed = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.processRetryFailed")(function* () {
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
  });

  yield* persistence.updateExecutionStatus(executionId, "running");

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

  return batchResult;
}, Effect.mapError(String));

const toEngineConfig = (config: BatchConfig) => {
  const fields = {
    concurrency: config.concurrency,
    maxRetries: config.maxRetries,
    enableEntityResolution: config.enableEntityResolution,
  };
  return Match.value(config.failurePolicy).pipe(
    Match.when("continue-on-failure", () => new ContinueOnFailureEngineBatchPayloadConfig(fields)),
    Match.when("abort-all", () => new AbortAllEngineBatchPayloadConfig(fields)),
    Match.when("retry-failed", () => new RetryFailedEngineBatchPayloadConfig(fields)),
    Match.exhaustive
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
    documents: A.map(params.documents, (doc) =>
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
      Effect.catchAllCause(() =>
        Effect.fail(toInfrastructureError(batchId, operation, "workflow dispatch failed"))
      )
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
  Layer.provideMerge(WorkflowRuntimeLive)
);

export const BatchOrchestratorLive = Layer.effect(BatchOrchestrator, serviceEffect).pipe(
  Layer.provideMerge(BatchEngineWorkflowLayer)
);
