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
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
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
import { ExtractionResult, type ExtractionResult as ExtractionResultType } from "../Extraction/ExtractionPipeline";
import { BatchEventEmitter } from "./BatchEventEmitter";
import { ExtractionWorkflow, type ExtractionWorkflowParams } from "./ExtractionWorkflow";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/BatchOrchestrator");

export interface BatchOrchestratorParams {
  readonly batchId?: KnowledgeEntityIds.BatchExecutionId.Type;
  readonly organizationId: SharedEntityIds.OrganizationId.Type;
  readonly ontologyId: KnowledgeEntityIds.OntologyId.Type;
  readonly documents: ReadonlyArray<{
    readonly documentId: string;
    readonly text: string;
    readonly ontologyContent: string;
  }>;
  readonly config: BatchConfig;
}

export interface DocumentResult {
  readonly documentId: string;
  readonly result: Either.Either<ExtractionResultType, string>;
}

export interface BatchResult {
  readonly batchId: KnowledgeEntityIds.BatchExecutionId.Type;
  readonly documentResults: ReadonlyArray<DocumentResult>;
  readonly totalDocuments: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly entityCount: number;
  readonly relationCount: number;
}

export interface BatchOrchestratorShape {
  readonly run: (
    params: BatchOrchestratorParams
  ) => Effect.Effect<BatchResult, BatchAlreadyRunningError | InvalidStateTransitionError | BatchNotFoundError>;
}

export class BatchOrchestrator extends Context.Tag($I`BatchOrchestrator`)<
  BatchOrchestrator,
  BatchOrchestratorShape
>() {}

const EngineDocumentSchema = S.Struct({
  documentId: S.String,
  text: S.String,
  ontologyContent: S.String,
});

const EngineBatchPayloadSchema = S.Struct({
  batchId: S.String,
  organizationId: S.String,
  ontologyId: S.String,
  documents: S.Array(EngineDocumentSchema),
  config: S.Struct({
    concurrency: S.Number,
    failurePolicy: S.Literal("continue-on-failure", "abort-all", "retry-failed"),
    maxRetries: S.Number,
    enableEntityResolution: S.Boolean,
  }),
});

const EngineDocumentResultSchema = S.Struct({
  documentId: S.String,
  success: S.Boolean,
  extraction: S.NullOr(ExtractionResult),
  error: S.NullOr(S.String),
});

const EngineBatchResultSchema = S.Struct({
  batchId: S.String,
  documentResults: S.Array(EngineDocumentResultSchema),
  totalDocuments: S.Number,
  successCount: S.Number,
  failureCount: S.Number,
  entityCount: S.Number,
  relationCount: S.Number,
});

type EngineDocumentResult = S.Schema.Type<typeof EngineDocumentResultSchema>;
type EngineBatchResult = S.Schema.Type<typeof EngineBatchResultSchema>;

const BatchEngineWorkflow = Workflow.make({
  name: "knowledge-batch-extraction",
  payload: EngineBatchPayloadSchema,
  success: EngineBatchResultSchema,
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

export const executeBatchEngineWorkflow = (
  payload: S.Schema.Type<typeof EngineBatchPayloadSchema>,
  executionId: string
) =>
  Effect.gen(function* () {
    const workflow = yield* ExtractionWorkflow;
    const emitter = yield* BatchEventEmitter;
    const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
    const maybeMentionRecordRepo = yield* Effect.serviceOption(MentionRecordRepo);
    const persistence = yield* WorkflowPersistence;
    const batchId = KnowledgeEntityIds.BatchExecutionId.make(payload.batchId);

    const emitEvent = Effect.fn("BatchOrchestrator.executeBatchEngineWorkflow.emitEvent")(
      function* (makeEvent: (timestamp: DateTime.Utc) => BatchEvent) {
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
      doc: S.Schema.Type<typeof EngineDocumentSchema>,
      index: number
    ) => Effect.Effect<EngineDocumentResult> = Effect.fn(
      "BatchOrchestrator.executeBatchEngineWorkflow.processDocument"
    )(function* (doc, index) {
      const runtimeParams: BatchOrchestratorParams = {
        batchId,
        organizationId: SharedEntityIds.OrganizationId.make(payload.organizationId),
        ontologyId: KnowledgeEntityIds.OntologyId.make(payload.ontologyId),
        documents: [],
        config: new BatchConfig(payload.config),
      };

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

        return {
          documentId: doc.documentId,
          success: true,
          extraction: either.right,
          error: null,
        };
      }

      yield* emitEvent((timestamp) =>
        DocumentFailed.make({ batchId, documentId: doc.documentId, error: String(either.left), timestamp })
      );
      return {
        documentId: doc.documentId,
        success: false,
        extraction: null,
        error: String(either.left),
      };
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
      .pipe(Effect.catchAll(() => Effect.void));
    yield* persistence.updateExecutionStatus(executionId, "running").pipe(Effect.catchAll(() => Effect.void));

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
        .pipe(Effect.catchAll(() => Effect.void));
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
      .pipe(Effect.catchAll(() => Effect.void));

    return batchResult;
  });

const serviceEffect = Effect.gen(function* () {
  const maybeWorkflowEngine = yield* Effect.serviceOption(WorkflowEngine.WorkflowEngine);

  const run: BatchOrchestratorShape["run"] = Effect.fn("BatchOrchestrator.run")(function* (
    params: BatchOrchestratorParams
  ) {
    const batchId = params.batchId ?? KnowledgeEntityIds.BatchExecutionId.create();
    const payload: S.Schema.Type<typeof EngineBatchPayloadSchema> = {
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
    };

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
