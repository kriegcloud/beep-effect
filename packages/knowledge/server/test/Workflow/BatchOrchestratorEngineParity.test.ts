import { ActivityFailedError } from "@beep/knowledge-domain/errors";
import type { BatchEvent } from "@beep/knowledge-domain/value-objects";
import {
  ExtractionPipelineConfig,
  ExtractionResult,
  ExtractionResultStats,
  KnowledgeGraph,
  KnowledgeGraphStats,
} from "@beep/knowledge-server/Extraction";
import type {
  ExtractionWorkflowParams,
  ExtractionWorkflowShape,
  WorkflowPersistenceShape,
} from "@beep/knowledge-server/Workflow";
import {
  BatchEventEmitter,
  type BatchEventEmitterShape,
  ExtractionWorkflow,
  executeBatchEngineWorkflow,
  WorkflowPersistence,
} from "@beep/knowledge-server/Workflow";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import { makeWorkflowPersistenceShape, type WorkflowStatusUpdate } from "../_shared/ServiceMocks";

type Scenario = {
  readonly workflowRun: ExtractionWorkflowShape["run"];
  readonly payload: {
    readonly batchId: string;
    readonly organizationId: string;
    readonly ontologyId: string;
    readonly documents: ReadonlyArray<{
      readonly documentId: string;
      readonly text: string;
      readonly ontologyContent: string;
    }>;
    readonly config: {
      readonly concurrency: number;
      readonly failurePolicy: "continue-on-failure" | "abort-all" | "retry-failed";
      readonly maxRetries: number;
      readonly enableEntityResolution: boolean;
    };
  };
};

const makeSuccessExtraction = (entityCount: number, relationCount: number, documentId: string): ExtractionResult =>
  new ExtractionResult({
    graph: new KnowledgeGraph({
      entities: [],
      relations: [],
      entityIndex: {},
      stats: new KnowledgeGraphStats({
        entityCount,
        relationCount,
        unresolvedSubjects: 0,
        unresolvedObjects: 0,
      }),
    }),
    stats: new ExtractionResultStats({
      entityCount,
      relationCount,
      chunkCount: 1,
      mentionCount: 1,
      tokensUsed: 1,
      clusteringEnabled: false,
      durationMs: Duration.millis(1),
    }),
    config: new ExtractionPipelineConfig({
      organizationId: SharedEntityIds.OrganizationId.create(),
      ontologyId: KnowledgeEntityIds.OntologyId.create(),
      documentId,
      sourceUri: O.none(),
      chunkingConfig: O.none(),
      mentionMinConfidence: O.none(),
      entityMinConfidence: O.none(),
      relationMinConfidence: O.none(),
      entityBatchSize: O.none(),
      mergeEntities: O.none(),
      enableIncrementalClustering: O.none(),
    }),
  });

const runScenario = Effect.fn("BatchOrchestratorEngineParity.runScenario")(function* (scenario: Scenario) {
  const events: Array<BatchEvent.Type> = [];
  const statusUpdates: Array<WorkflowStatusUpdate> = [];
  const statuses: Array<{
    status: string;
    updates: Parameters<WorkflowPersistenceShape["updateExecutionStatus"]>[2];
  }> = [];
  const calls: Array<ExtractionWorkflowParams> = [];

  const workflowLayer = Layer.succeed(
    ExtractionWorkflow,
    ExtractionWorkflow.of({
      run: (params) => {
        calls.push(params);
        return scenario.workflowRun(params);
      },
    })
  );

  const eventEmitterLayer = Layer.succeed(
    BatchEventEmitter,
    BatchEventEmitter.of({
      emit: (event) =>
        Effect.sync(() => {
          events.push(event);
        }),
      subscribe: () => Stream.empty,
      subscribeAll: () => Stream.empty,
    } satisfies BatchEventEmitterShape)
  );

  const persistenceLayer = Layer.succeed(
    WorkflowPersistence,
    WorkflowPersistence.of(makeWorkflowPersistenceShape(statusUpdates))
  );

  const result = yield* executeBatchEngineWorkflow(scenario.payload, "exec-test").pipe(
    Effect.provide(Layer.mergeAll(workflowLayer, eventEmitterLayer, persistenceLayer))
  );

  for (const update of statusUpdates) {
    statuses.push({ status: update.status, updates: update.updates });
  }

  return { result, events, statuses, calls };
});

const failExtraction = (cause: string) =>
  Effect.fail(
    new ActivityFailedError({
      executionId: KnowledgeEntityIds.WorkflowExecutionId.create(),
      activityName: "run_extraction_pipeline",
      attempt: 1,
      cause,
    })
  );

describe("BatchOrchestrator engine parity", () => {
  effect(
    "preserves continue-on-failure semantics and event ordering",
    Effect.fn(function* () {
      const doc1 = DocumentsEntityIds.DocumentId.create();
      const doc2 = DocumentsEntityIds.DocumentId.create();
      const doc3 = DocumentsEntityIds.DocumentId.create();

      const output = yield* runScenario({
        payload: {
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [
            { documentId: doc1, text: "a", ontologyContent: "o" },
            { documentId: doc2, text: "b", ontologyContent: "o" },
            { documentId: doc3, text: "c", ontologyContent: "o" },
          ],
          config: {
            concurrency: 2,
            failurePolicy: "continue-on-failure",
            maxRetries: 0,
            enableEntityResolution: false,
          },
        },
        workflowRun: (params) =>
          params.documentId === doc2
            ? failExtraction("doc-2 failed")
            : Effect.succeed(makeSuccessExtraction(2, 1, params.documentId)),
      });

      strictEqual(output.result.totalDocuments, 3);
      strictEqual(output.result.successCount, 2);
      strictEqual(output.result.failureCount, 1);
      strictEqual(output.statuses[0]?.status, "running");
      strictEqual(output.statuses[1]?.status, "completed");
      strictEqual(output.events[0]?._tag, "BatchEvent.BatchCreated");
      strictEqual(output.events[output.events.length - 1]?._tag, "BatchEvent.BatchCompleted");
      strictEqual(output.events.filter((event) => event._tag === "BatchEvent.DocumentStarted").length, 3);
      strictEqual(output.events.filter((event) => event._tag === "BatchEvent.DocumentFailed").length, 1);
      strictEqual(output.calls.length, 3);
      strictEqual(output.calls[0]?.config?.retryOwner, "activity");
    })
  );

  effect(
    "preserves abort-all semantics and stops after first failure",
    Effect.fn(function* () {
      const doc1 = DocumentsEntityIds.DocumentId.create();
      const doc2 = DocumentsEntityIds.DocumentId.create();
      const doc3 = DocumentsEntityIds.DocumentId.create();

      const output = yield* runScenario({
        payload: {
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [
            { documentId: doc1, text: "a", ontologyContent: "o" },
            { documentId: doc2, text: "b", ontologyContent: "o" },
            { documentId: doc3, text: "c", ontologyContent: "o" },
          ],
          config: {
            concurrency: 1,
            failurePolicy: "abort-all",
            maxRetries: 0,
            enableEntityResolution: false,
          },
        },
        workflowRun: (params) =>
          params.documentId === doc2
            ? failExtraction("abort-on-doc-2")
            : Effect.succeed(makeSuccessExtraction(1, 1, params.documentId)),
      });

      strictEqual(output.calls.length, 2);
      strictEqual(output.result.totalDocuments, 2);
      strictEqual(output.result.successCount, 1);
      strictEqual(output.result.failureCount, 1);
      strictEqual(output.events.filter((event) => event._tag === "BatchEvent.DocumentStarted").length, 2);
      strictEqual(output.events[output.events.length - 1]?._tag, "BatchEvent.BatchCompleted");
      strictEqual(output.calls[0]?.config?.retryOwner, "activity");
    })
  );

  effect(
    "uses orchestrator-owned retry in retry-failed policy",
    Effect.fn(function* () {
      const doc1 = DocumentsEntityIds.DocumentId.create();
      const doc2 = DocumentsEntityIds.DocumentId.create();
      const invocations = new Map<string, number>();

      const output = yield* runScenario({
        payload: {
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [
            { documentId: doc1, text: "a", ontologyContent: "o" },
            { documentId: doc2, text: "b", ontologyContent: "o" },
          ],
          config: {
            concurrency: 2,
            failurePolicy: "retry-failed",
            maxRetries: 1,
            enableEntityResolution: false,
          },
        },
        workflowRun: (params) =>
          Effect.sync(() => {
            const count = (invocations.get(params.documentId) ?? 0) + 1;
            invocations.set(params.documentId, count);
            return count;
          }).pipe(
            Effect.flatMap((count) =>
              params.documentId === doc1 && count === 1
                ? failExtraction("first attempt failed")
                : Effect.succeed(makeSuccessExtraction(1, 1, params.documentId))
            )
          ),
      });

      strictEqual(output.result.totalDocuments, 2);
      strictEqual(output.result.successCount, 2);
      strictEqual(output.result.failureCount, 0);
      strictEqual(invocations.get(doc1), 2);
      strictEqual(invocations.get(doc2), 1);
      assertTrue(output.calls.every((call) => call.config?.retryOwner === "orchestrator"));
    })
  );

  effect(
    "emits BatchFailed and failed execution status when all documents fail",
    Effect.fn(function* () {
      const doc1 = DocumentsEntityIds.DocumentId.create();
      const doc2 = DocumentsEntityIds.DocumentId.create();

      const output = yield* runScenario({
        payload: {
          batchId: KnowledgeEntityIds.BatchExecutionId.create(),
          organizationId: SharedEntityIds.OrganizationId.create(),
          ontologyId: KnowledgeEntityIds.OntologyId.create(),
          documents: [
            { documentId: doc1, text: "a", ontologyContent: "o" },
            { documentId: doc2, text: "b", ontologyContent: "o" },
          ],
          config: {
            concurrency: 2,
            failurePolicy: "continue-on-failure",
            maxRetries: 0,
            enableEntityResolution: false,
          },
        },
        workflowRun: () => failExtraction("all failed"),
      });

      strictEqual(output.result.successCount, 0);
      strictEqual(output.result.failureCount, 2);
      strictEqual(output.events[output.events.length - 1]?._tag, "BatchEvent.BatchFailed");
      strictEqual(output.statuses[0]?.status, "running");
      strictEqual(output.statuses[1]?.status, "failed");
    })
  );
});
