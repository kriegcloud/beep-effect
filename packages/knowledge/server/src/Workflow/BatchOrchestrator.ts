import { $KnowledgeServerId } from "@beep/identity/packages";
import type {
  BatchAlreadyRunningError,
  BatchNotFoundError,
  InvalidStateTransitionError,
} from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import type { BatchConfig, BatchEvent, BatchState } from "@beep/knowledge-domain/value-objects";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
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
import type * as S from "effect/Schema";
import type { ExtractionResult } from "../Extraction/ExtractionPipeline";
import { BatchEventEmitter } from "./BatchEventEmitter";
import { BatchStateMachine } from "./BatchStateMachine";
import { ExtractionWorkflow, type ExtractionWorkflowParams } from "./ExtractionWorkflow";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/BatchOrchestrator");

type NonNegInt = S.Schema.Type<typeof S.NonNegativeInt>;
const asNonNeg = (n: number): NonNegInt => n as NonNegInt;

type DistributiveOmit<T, K extends string> = T extends unknown ? Omit<T, K> : never;

export interface BatchOrchestratorParams {
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
  readonly result: Either.Either<ExtractionResult, string>;
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

const serviceEffect = Effect.gen(function* () {
  const workflow = yield* ExtractionWorkflow;
  const stateMachine = yield* BatchStateMachine;
  const emitter = yield* BatchEventEmitter;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
  const persistence = yield* WorkflowPersistence;

  const emitEvent = (event: DistributiveOmit<BatchEvent, "timestamp"> & { readonly timestamp?: unknown }) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      yield* emitter.emit({ ...event, timestamp: now } as BatchEvent);
    }).pipe(
      Effect.catchAllCause((cause) =>
        Effect.logDebug("BatchOrchestrator: failed to emit event").pipe(Effect.annotateLogs({ cause: String(cause) }))
      )
    );

  const makeWorkflowParams = (
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
    },
  });

  const processDocumentsContinue = (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    params: BatchOrchestratorParams
  ): Effect.Effect<ReadonlyArray<DocumentResult>> =>
    Effect.gen(function* () {
      let completed = 0;
      const total = A.length(params.documents);

      const results = yield* Effect.forEach(
        params.documents,
        (doc, index) =>
          Effect.gen(function* () {
            yield* emitEvent({
              _tag: "BatchEvent.DocumentStarted",
              batchId,
              documentId: doc.documentId,
              documentIndex: asNonNeg(index),
            });

            const either = yield* Effect.either(workflow.run(makeWorkflowParams(doc, params)));

            if (Either.isRight(either)) {
              completed++;
              const extractionResult = either.right;
              yield* emitEvent({
                _tag: "BatchEvent.DocumentCompleted",
                batchId,
                documentId: doc.documentId,
                entityCount: asNonNeg(extractionResult.stats.entityCount),
                relationCount: asNonNeg(extractionResult.stats.relationCount),
              });

              yield* stateMachine
                .transition(batchId, {
                  _tag: "BatchState.Extracting",
                  batchId,
                  completedDocuments: asNonNeg(completed),
                  totalDocuments: asNonNeg(total),
                  progress: completed / total,
                } as BatchState)
                .pipe(Effect.catchAll(() => Effect.void));

              return {
                documentId: doc.documentId,
                result: Either.right(extractionResult),
              } satisfies DocumentResult;
            }

            yield* emitEvent({
              _tag: "BatchEvent.DocumentFailed",
              batchId,
              documentId: doc.documentId,
              error: String(either.left),
            });

            return {
              documentId: doc.documentId,
              result: Either.left(String(either.left)),
            } satisfies DocumentResult;
          }),
        { concurrency: params.config.concurrency }
      );

      return results;
    });

  interface AbortAllState {
    readonly index: number;
    readonly completed: number;
    readonly results: ReadonlyArray<DocumentResult>;
    readonly aborted: boolean;
  }

  const processDocumentsAbortAll = (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    params: BatchOrchestratorParams
  ): Effect.Effect<ReadonlyArray<DocumentResult>> => {
    const total = A.length(params.documents);
    const initial: AbortAllState = {
      index: 0,
      completed: 0,
      results: A.empty<DocumentResult>(),
      aborted: false,
    };

    return Effect.iterate(initial, {
      while: (state) => !state.aborted && state.index < total,
      body: (state) =>
        Effect.gen(function* () {
          const doc = F.pipe(A.get(params.documents, state.index), O.getOrThrow);

          yield* emitEvent({
            _tag: "BatchEvent.DocumentStarted",
            batchId,
            documentId: doc.documentId,
            documentIndex: asNonNeg(state.index),
          });

          const either = yield* Effect.either(workflow.run(makeWorkflowParams(doc, params)));

          if (Either.isLeft(either)) {
            yield* emitEvent({
              _tag: "BatchEvent.DocumentFailed",
              batchId,
              documentId: doc.documentId,
              error: String(either.left),
            });

            const failResult: DocumentResult = {
              documentId: doc.documentId,
              result: Either.left(String(either.left)),
            };

            return {
              index: state.index + 1,
              completed: state.completed,
              results: A.append(state.results, failResult),
              aborted: true,
            };
          }

          const extractionResult = either.right;
          const newCompleted = state.completed + 1;

          yield* emitEvent({
            _tag: "BatchEvent.DocumentCompleted",
            batchId,
            documentId: doc.documentId,
            entityCount: asNonNeg(extractionResult.stats.entityCount),
            relationCount: asNonNeg(extractionResult.stats.relationCount),
          });

          yield* stateMachine
            .transition(batchId, {
              _tag: "BatchState.Extracting",
              batchId,
              completedDocuments: asNonNeg(newCompleted),
              totalDocuments: asNonNeg(total),
              progress: newCompleted / total,
            } as BatchState)
            .pipe(Effect.catchAll(() => Effect.void));

          const successResult: DocumentResult = {
            documentId: doc.documentId,
            result: Either.right(extractionResult),
          };

          return {
            index: state.index + 1,
            completed: newCompleted,
            results: A.append(state.results, successResult),
            aborted: false,
          };
        }),
    }).pipe(Effect.map((state) => state.results));
  };

  interface RetryState {
    readonly results: ReadonlyArray<DocumentResult>;
    readonly retriesRemaining: number;
  }

  const processDocumentsRetryFailed = (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    params: BatchOrchestratorParams
  ): Effect.Effect<ReadonlyArray<DocumentResult>> =>
    Effect.gen(function* () {
      const initialResults = yield* processDocumentsContinue(batchId, params);

      const initial: RetryState = {
        results: initialResults,
        retriesRemaining: params.config.maxRetries,
      };

      const finalState = yield* Effect.iterate(initial, {
        while: (state) => {
          const hasFailed = A.some(state.results, (r) => Either.isLeft(r.result));
          return hasFailed && state.retriesRemaining > 0;
        },
        body: (state) =>
          Effect.gen(function* () {
            const failed = A.filter(state.results, (r) => Either.isLeft(r.result));

            yield* Effect.logInfo("BatchOrchestrator: retrying failed documents").pipe(
              Effect.annotateLogs({
                batchId,
                failedCount: A.length(failed),
                retriesRemaining: state.retriesRemaining,
              })
            );

            const failedDocIds = A.map(failed, (r) => r.documentId);
            const retryDocs = A.filter(params.documents, (d) => F.pipe(failedDocIds, A.contains(d.documentId)));

            const retryParams: BatchOrchestratorParams = {
              ...params,
              documents: retryDocs,
            };

            const retryResults = yield* processDocumentsContinue(batchId, retryParams);

            const retryMap = HashMap.fromIterable(A.map(retryResults, (r) => [r.documentId, r] as const));

            const mergedResults = A.map(state.results, (r) =>
              F.pipe(
                HashMap.get(retryMap, r.documentId),
                O.getOrElse(() => r)
              )
            );

            return {
              results: mergedResults,
              retriesRemaining: state.retriesRemaining - 1,
            };
          }),
      });

      return finalState.results;
    });

  const aggregateResults = (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    documentResults: ReadonlyArray<DocumentResult>
  ): BatchResult => {
    const successes = A.filter(documentResults, (r) => Either.isRight(r.result));
    const failures = A.filter(documentResults, (r) => Either.isLeft(r.result));

    const successExtractions: ReadonlyArray<ExtractionResult> = A.filterMap(documentResults, (r) =>
      Either.isRight(r.result) ? O.some(r.result.right) : O.none()
    );

    const entityCount = A.reduce(successExtractions, 0, (acc, r) => acc + r.stats.entityCount);
    const relationCount = A.reduce(successExtractions, 0, (acc, r) => acc + r.stats.relationCount);

    return {
      batchId,
      documentResults,
      totalDocuments: A.length(documentResults),
      successCount: A.length(successes),
      failureCount: A.length(failures),
      entityCount,
      relationCount,
    };
  };

  const run: BatchOrchestratorShape["run"] = Effect.fn("BatchOrchestrator.run")(function* (
    params: BatchOrchestratorParams
  ) {
    const batchId = KnowledgeEntityIds.BatchExecutionId.create();
    const totalDocs = A.length(params.documents);

    yield* stateMachine.create(batchId);

    const executionId = KnowledgeEntityIds.WorkflowExecutionId.create();
    yield* persistence
      .createExecution({
        id: executionId,
        organizationId: params.organizationId,
        workflowType: "batch_extraction",
        input: {
          batchId,
          totalDocuments: totalDocs,
          concurrency: params.config.concurrency,
          failurePolicy: params.config.failurePolicy,
        },
      })
      .pipe(
        Effect.catchAllCause((cause) =>
          Effect.logWarning("BatchOrchestrator: failed to persist execution record").pipe(
            Effect.annotateLogs({ cause: String(cause), batchId })
          )
        )
      );

    yield* emitEvent({
      _tag: "BatchEvent.BatchCreated",
      batchId,
      totalDocuments: asNonNeg(totalDocs),
    });

    yield* stateMachine.transition(batchId, {
      _tag: "BatchState.Extracting",
      batchId,
      completedDocuments: asNonNeg(0),
      totalDocuments: asNonNeg(totalDocs),
      progress: 0,
    } as BatchState);

    yield* Effect.logInfo("BatchOrchestrator: starting document processing").pipe(
      Effect.annotateLogs({
        batchId,
        totalDocuments: totalDocs,
        failurePolicy: params.config.failurePolicy,
        concurrency: params.config.concurrency,
      })
    );

    const documentResults = yield* F.pipe(
      Match.value(params.config.failurePolicy),
      Match.when("continue-on-failure", () => processDocumentsContinue(batchId, params)),
      Match.when("abort-all", () => processDocumentsAbortAll(batchId, params)),
      Match.when("retry-failed", () => processDocumentsRetryFailed(batchId, params)),
      Match.exhaustive
    );

    if (params.config.enableEntityResolution && O.isSome(maybeClusterer)) {
      yield* stateMachine
        .transition(batchId, {
          _tag: "BatchState.Resolving",
          batchId,
          progress: 0,
        } as BatchState)
        .pipe(Effect.catchAll(() => Effect.void));

      yield* emitEvent({ _tag: "BatchEvent.ResolutionStarted", batchId });

      yield* Effect.logInfo("BatchOrchestrator: entity resolution phase started").pipe(
        Effect.annotateLogs({ batchId })
      );

      yield* emitEvent({
        _tag: "BatchEvent.ResolutionCompleted",
        batchId,
        mergeCount: asNonNeg(0),
      });
    }

    const batchResult = aggregateResults(batchId, documentResults);

    if (batchResult.failureCount > 0 && batchResult.successCount === 0) {
      yield* stateMachine
        .transition(batchId, {
          _tag: "BatchState.Failed",
          batchId,
          failedDocuments: asNonNeg(batchResult.failureCount),
          error: "All documents failed",
        } as BatchState)
        .pipe(Effect.catchAll(() => Effect.void));

      yield* emitEvent({
        _tag: "BatchEvent.BatchFailed",
        batchId,
        error: "All documents failed",
        failedDocuments: asNonNeg(batchResult.failureCount),
      });
    } else {
      yield* stateMachine
        .transition(batchId, {
          _tag: "BatchState.Completed",
          batchId,
          totalDocuments: asNonNeg(batchResult.totalDocuments),
          entityCount: asNonNeg(batchResult.entityCount),
          relationCount: asNonNeg(batchResult.relationCount),
        } as BatchState)
        .pipe(Effect.catchAll(() => Effect.void));

      yield* emitEvent({
        _tag: "BatchEvent.BatchCompleted",
        batchId,
        totalDocuments: asNonNeg(batchResult.totalDocuments),
        entityCount: asNonNeg(batchResult.entityCount),
        relationCount: asNonNeg(batchResult.relationCount),
      });
    }

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
      .pipe(
        Effect.catchAllCause((cause) =>
          Effect.logWarning("BatchOrchestrator: failed to update execution status").pipe(
            Effect.annotateLogs({ cause: String(cause), batchId })
          )
        )
      );

    yield* Effect.logInfo("BatchOrchestrator: batch completed").pipe(
      Effect.annotateLogs({
        batchId,
        totalDocuments: batchResult.totalDocuments,
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
        entityCount: batchResult.entityCount,
        relationCount: batchResult.relationCount,
      })
    );

    return batchResult;
  });

  return BatchOrchestrator.of({ run });
});

export const BatchOrchestratorLive = Layer.effect(BatchOrchestrator, serviceEffect);
