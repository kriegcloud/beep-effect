import { $KnowledgeServerId } from "@beep/identity/packages";
import type {
  BatchAlreadyRunningError,
  BatchNotFoundError,
  InvalidStateTransitionError,
} from "@beep/knowledge-domain/errors";
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import type { BatchConfig, BatchEvent } from "@beep/knowledge-domain/value-objects";
import {
  BatchCompleted,
  BatchCreated,
  BatchFailed,
  BatchMachineEvent,
  type BatchMachineState,
  DocumentCompleted,
  DocumentFailed,
  DocumentStarted,
  ResolutionCompleted,
  ResolutionStarted,
} from "@beep/knowledge-domain/value-objects";
import type { ActorRef } from "@beep/machine";
import { createPersistentActor, PersistenceAdapterTag } from "@beep/machine";
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
import * as Schedule from "effect/Schedule";

import { MentionRecordRepo } from "@beep/knowledge-server/db/repos/MentionRecord.repo";
import type { ExtractionResult } from "../Extraction/ExtractionPipeline";
import { BatchActorRegistry } from "./BatchActorRegistry";
import { BatchEventEmitter } from "./BatchEventEmitter";
import { makeBatchMachine } from "./BatchMachine";
import { ExtractionWorkflow, type ExtractionWorkflowParams } from "./ExtractionWorkflow";
import { WorkflowPersistence } from "./WorkflowPersistence";

const $I = $KnowledgeServerId.create("Workflow/BatchOrchestrator");

type BatchActor = ActorRef<BatchMachineState, BatchMachineEvent>;

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
  const registry = yield* BatchActorRegistry;
  const emitter = yield* BatchEventEmitter;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
  const maybeMentionRecordRepo = yield* Effect.serviceOption(MentionRecordRepo);
  const persistence = yield* WorkflowPersistence;
  const adapter = yield* PersistenceAdapterTag;

  const emitEvent = (makeEvent: (timestamp: DateTime.Utc) => BatchEvent) =>
    Effect.gen(function* () {
      const now = yield* DateTime.now;
      yield* emitter.emit(makeEvent(now));
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

  const processDocumentsContinue = Effect.fn("BatchOrchestrator.processDocumentsContinue")(function* (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    params: BatchOrchestratorParams,
    actor: BatchActor
  ) {
    return yield* Effect.forEach(
      params.documents,
      (doc, index) =>
        Effect.gen(function* () {
          yield* emitEvent((timestamp) =>
            DocumentStarted.make({ batchId, documentId: doc.documentId, documentIndex: index, timestamp })
          );

          const either = yield* Effect.either(workflow.run(makeWorkflowParams(doc, params)));

          if (Either.isRight(either)) {
            const extractionResult = either.right;
            yield* emitEvent((timestamp) =>
              DocumentCompleted.make({
                batchId,
                documentId: doc.documentId,
                entityCount: extractionResult.stats.entityCount,
                relationCount: extractionResult.stats.relationCount,
                timestamp,
              })
            );

            // Send actor event for document completion
            yield* actor.send(
              BatchMachineEvent.DocumentCompleted({
                documentId: doc.documentId,
                entityCount: extractionResult.stats.entityCount,
                relationCount: extractionResult.stats.relationCount,
              })
            );

            return {
              documentId: doc.documentId,
              result: Either.right(extractionResult),
            } satisfies DocumentResult;
          }

          // Send actor event for document failure
          yield* actor.send(
            BatchMachineEvent.DocumentFailed({
              documentId: doc.documentId,
              error: String(either.left),
            })
          );

          yield* emitEvent((timestamp) =>
            DocumentFailed.make({ batchId, documentId: doc.documentId, error: String(either.left), timestamp })
          );

          return {
            documentId: doc.documentId,
            result: Either.left(String(either.left)),
          } satisfies DocumentResult;
        }),
      { concurrency: params.config.concurrency }
    );
  });

  interface AbortAllState {
    readonly index: number;
    readonly completed: number;
    readonly results: ReadonlyArray<DocumentResult>;
    readonly aborted: boolean;
  }

  const processDocumentsAbortAll = (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    params: BatchOrchestratorParams,
    actor: BatchActor
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

          yield* emitEvent((timestamp) =>
            DocumentStarted.make({ batchId, documentId: doc.documentId, documentIndex: state.index, timestamp })
          );

          const either = yield* Effect.either(workflow.run(makeWorkflowParams(doc, params)));

          if (Either.isLeft(either)) {
            // Send actor event for document failure
            yield* actor.send(
              BatchMachineEvent.DocumentFailed({
                documentId: doc.documentId,
                error: String(either.left),
              })
            );

            yield* emitEvent((timestamp) =>
              DocumentFailed.make({ batchId, documentId: doc.documentId, error: String(either.left), timestamp })
            );

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

          yield* emitEvent((timestamp) =>
            DocumentCompleted.make({
              batchId,
              documentId: doc.documentId,
              entityCount: extractionResult.stats.entityCount,
              relationCount: extractionResult.stats.relationCount,
              timestamp,
            })
          );

          // Send actor event for document completion
          yield* actor.send(
            BatchMachineEvent.DocumentCompleted({
              documentId: doc.documentId,
              entityCount: extractionResult.stats.entityCount,
              relationCount: extractionResult.stats.relationCount,
            })
          );

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
    params: BatchOrchestratorParams,
    actor: BatchActor
  ): Effect.Effect<ReadonlyArray<DocumentResult>> =>
    Effect.gen(function* () {
      const initialResults = yield* processDocumentsContinue(batchId, params, actor);

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

            const retryResults = yield* processDocumentsContinue(batchId, retryParams, actor);

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
    const batchId = params.batchId ?? KnowledgeEntityIds.BatchExecutionId.create();
    const totalDocs = A.length(params.documents);

    // Spawn the persistent actor-based machine
    const builtMachine = makeBatchMachine({
      batchId,
      documentIds: A.map(params.documents, (d) => d.documentId),
      config: params.config,
    });
    const persistentMachine = builtMachine.persist({
      snapshotSchedule: Schedule.forever,
      journalEvents: true,
      machineType: "batch-extraction",
    });
    const actor = yield* createPersistentActor(batchId, persistentMachine, O.none(), []).pipe(
      Effect.provideService(PersistenceAdapterTag, adapter),
      Effect.catchTag("PersistenceError", (e) => Effect.die(e))
    );

    // Register actor in the registry
    yield* registry.register(batchId, actor);

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

    yield* emitEvent((timestamp) => BatchCreated.make({ batchId, totalDocuments: totalDocs, timestamp }));

    // Transition actor to Extracting
    yield* actor.send(BatchMachineEvent.StartExtraction);

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
      Match.when("continue-on-failure", () => processDocumentsContinue(batchId, params, actor)),
      Match.when("abort-all", () => processDocumentsAbortAll(batchId, params, actor)),
      Match.when("retry-failed", () => processDocumentsRetryFailed(batchId, params, actor)),
      Match.exhaustive
    );

    const batchResult = aggregateResults(batchId, documentResults);

    // Send ExtractionComplete to actor
    yield* actor.send(
      BatchMachineEvent.ExtractionComplete({
        successCount: batchResult.successCount,
        failureCount: batchResult.failureCount,
        totalEntityCount: batchResult.entityCount,
        totalRelationCount: batchResult.relationCount,
      })
    );

    if (params.config.enableEntityResolution && O.isSome(maybeClusterer)) {
      yield* emitEvent((timestamp) => ResolutionStarted.make({ batchId, timestamp }));

      yield* Effect.logInfo("BatchOrchestrator: entity resolution phase started").pipe(
        Effect.annotateLogs({ batchId })
      );

      const clusterer = maybeClusterer.value;

      const mergeCount = yield* Effect.gen(function* () {
        if (O.isNone(maybeMentionRecordRepo)) {
          yield* Effect.logWarning(
            "BatchOrchestrator: MentionRecordRepo not available, skipping entity resolution"
          ).pipe(Effect.annotateLogs({ batchId }));
          return 0;
        }

        const mentionRepo = maybeMentionRecordRepo.value;
        const unresolvedMentions = yield* mentionRepo.findUnresolved(params.organizationId, 1000);
        const mentionCount = A.length(unresolvedMentions);

        if (mentionCount === 0) {
          yield* Effect.logInfo("BatchOrchestrator: no unresolved mentions found, skipping clustering").pipe(
            Effect.annotateLogs({ batchId })
          );
          return 0;
        }

        yield* Effect.logInfo("BatchOrchestrator: clustering unresolved mentions").pipe(
          Effect.annotateLogs({ batchId, unresolvedMentionCount: mentionCount })
        );

        yield* clusterer.cluster(unresolvedMentions);

        return mentionCount;
      }).pipe(
        Effect.catchAllCause((cause) =>
          Effect.logWarning("BatchOrchestrator: entity resolution failed, continuing with mergeCount: 0").pipe(
            Effect.annotateLogs({ cause: String(cause), batchId }),
            Effect.as(0)
          )
        )
      );

      yield* actor.send(BatchMachineEvent.ResolutionComplete({ mergeCount }));
      yield* emitEvent((timestamp) => ResolutionCompleted.make({ batchId, mergeCount, timestamp }));
    }

    if (batchResult.failureCount > 0 && batchResult.successCount === 0) {
      // Send Fail to actor
      yield* actor.send(BatchMachineEvent.Fail({ error: "All documents failed" }));

      yield* emitEvent((timestamp) =>
        BatchFailed.make({
          batchId,
          error: "All documents failed",
          failedDocuments: batchResult.failureCount,
          timestamp,
        })
      );
    } else {
      yield* emitEvent((timestamp) =>
        BatchCompleted.make({
          batchId,
          totalDocuments: batchResult.totalDocuments,
          entityCount: batchResult.entityCount,
          relationCount: batchResult.relationCount,
          timestamp,
        })
      );
    }

    // Remove actor from registry and stop it
    yield* registry.remove(batchId);
    yield* actor.stop;

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
