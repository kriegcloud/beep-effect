import {
  ExtractionPipeline,
  ExtractionPipelineConfig,
  ExtractionResult,
  ExtractionResultStats,
  KnowledgeGraph,
  KnowledgeGraphStats,
} from "@beep/knowledge-server/Extraction";
import type { WorkflowPersistenceShape } from "@beep/knowledge-server/Workflow";
import {
  BatchEventEmitter,
  type BatchEventEmitterShape,
  ExtractionWorkflow,
  type ExtractionWorkflowShape,
  executeBatchEngineWorkflow,
  WorkflowPersistence,
} from "@beep/knowledge-server/Workflow";
import { WorkspacesEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import { makeExtractionWorkflowTestLayer } from "../_shared/LayerBuilders";

const organizationId = SharedEntityIds.OrganizationId.create();
const documentId = WorkspacesEntityIds.DocumentId.create();

const makeSuccessExtraction = (documentId: string): ExtractionResult =>
  new ExtractionResult({
    graph: new KnowledgeGraph({
      entities: [],
      relations: [],
      entityIndex: {},
      stats: new KnowledgeGraphStats({
        entityCount: 1,
        relationCount: 1,
        unresolvedSubjects: 0,
        unresolvedObjects: 0,
      }),
    }),
    stats: new ExtractionResultStats({
      entityCount: 1,
      relationCount: 1,
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

const makeFailingPersistence = (sink: {
  readonly createCalls: Array<unknown>;
  readonly statusCalls: Array<{ readonly id: string; readonly status: string }>;
}): WorkflowPersistenceShape => ({
  createExecution: (params) =>
    Effect.sync(() => {
      sink.createCalls.push(params);
      throw new Error("db down (createExecution)");
    }),
  updateExecutionStatus: (id, status) =>
    Effect.sync(() => {
      sink.statusCalls.push({ id, status });
      throw new Error("db down (updateExecutionStatus)");
    }),
  getExecution: () => Effect.die("not used"),
  findLatestBatchExecutionByBatchId: () => Effect.succeed(O.none()),
  cancelExecution: () => Effect.void,
  requireBatchExecutionByBatchId: () => Effect.die("not used"),
});

describe("Workflow persistence single-node semantics", () => {
  effect("ExtractionWorkflow succeeds even when persistence writes fail (best-effort persistence)", (_ctx) =>
    Effect.gen(function* () {
      const sink = { createCalls: [] as Array<unknown>, statusCalls: [] as Array<{ id: string; status: string }> };

      const pipelineLayer = Layer.succeed(
        ExtractionPipeline,
        ExtractionPipeline.of({
          run: () => Effect.succeed(makeSuccessExtraction(documentId)),
        })
      );

      const persistenceLayer = Layer.succeed(WorkflowPersistence, WorkflowPersistence.of(makeFailingPersistence(sink)));

      const testLayer = makeExtractionWorkflowTestLayer({
        persistenceLayer,
        pipelineLayer,
      });

      yield* Effect.gen(function* () {
        const workflow = yield* ExtractionWorkflow;
        const result = yield* workflow.run({
          organizationId,
          documentId,
          text: "alpha",
          ontologyContent: "ontology-a",
        });

        strictEqual(result.stats.entityCount, 1);
        assertTrue(sink.createCalls.length >= 1);
        // Even though persistence fails, workflow still attempts to mark running/completed.
        assertTrue(sink.statusCalls.some((c) => c.status === "running"));
        assertTrue(sink.statusCalls.some((c) => c.status === "completed"));
      }).pipe(Effect.provide(testLayer));
    })
  );

  effect("Batch engine workflow returns results even when persistence writes fail (best-effort persistence)", (_ctx) =>
    Effect.gen(function* () {
      const sink = { createCalls: [] as Array<unknown>, statusCalls: [] as Array<{ id: string; status: string }> };
      const persistenceLayer = Layer.succeed(WorkflowPersistence, WorkflowPersistence.of(makeFailingPersistence(sink)));

      const eventEmitterLayer = Layer.succeed(
        BatchEventEmitter,
        BatchEventEmitter.of({
          emit: () => Effect.void,
          subscribe: () => Stream.empty,
          subscribeAll: () => Stream.empty,
        } satisfies BatchEventEmitterShape)
      );

      const workflowLayer = Layer.succeed(
        ExtractionWorkflow,
        ExtractionWorkflow.of({
          run: (_params) => Effect.succeed(makeSuccessExtraction(documentId)),
        } satisfies ExtractionWorkflowShape)
      );

      const payload = {
        batchId: KnowledgeEntityIds.BatchExecutionId.create(),
        organizationId: SharedEntityIds.OrganizationId.create(),
        ontologyId: KnowledgeEntityIds.OntologyId.create(),
        documents: [{ documentId, text: "alpha", ontologyContent: "o" }],
        config: {
          concurrency: 1,
          failurePolicy: "continue-on-failure" as const,
          maxRetries: 0,
          enableEntityResolution: false,
        },
      };

      // This worker function is invoked by the workflow engine in production.
      // In tests we call it directly and prove it does not depend on persistence for correctness.
      const result = yield* executeBatchEngineWorkflow(payload, "exec-test").pipe(
        Effect.provide(Layer.mergeAll(persistenceLayer, eventEmitterLayer, workflowLayer))
      );

      strictEqual(result.totalDocuments, 1);
      assertTrue(sink.createCalls.length >= 1);
      assertTrue(sink.statusCalls.some((c) => c.status === "running"));
    })
  );

  effect("Batch engine workflow returns failure results even if persistence update fails", (_ctx) =>
    Effect.gen(function* () {
      const sink = { createCalls: [] as Array<unknown>, statusCalls: [] as Array<{ id: string; status: string }> };
      const persistenceLayer = Layer.succeed(WorkflowPersistence, WorkflowPersistence.of(makeFailingPersistence(sink)));

      const eventEmitterLayer = Layer.succeed(
        BatchEventEmitter,
        BatchEventEmitter.of({
          emit: () => Effect.void,
          subscribe: () => Stream.empty,
          subscribeAll: () => Stream.empty,
        } satisfies BatchEventEmitterShape)
      );

      const workflowLayer = Layer.succeed(
        ExtractionWorkflow,
        ExtractionWorkflow.of({
          run: (_params) => Effect.fail("forced failure for test"),
        } satisfies ExtractionWorkflowShape)
      );

      const payload = {
        batchId: KnowledgeEntityIds.BatchExecutionId.create(),
        organizationId: SharedEntityIds.OrganizationId.create(),
        ontologyId: KnowledgeEntityIds.OntologyId.create(),
        documents: [{ documentId, text: "alpha", ontologyContent: "o" }],
        config: {
          concurrency: 1,
          failurePolicy: "continue-on-failure" as const,
          maxRetries: 0,
          enableEntityResolution: false,
        },
      };

      // executeBatchEngineWorkflow converts per-document failures into failure results,
      // and persistence failures must not crash the run.
      const result = yield* executeBatchEngineWorkflow(payload, "exec-test").pipe(
        Effect.provide(Layer.mergeAll(persistenceLayer, eventEmitterLayer, workflowLayer))
      );

      strictEqual(result.totalDocuments, 1);
      strictEqual(result.failureCount, 1);
      // The important assertion is: persistence failures cannot convert a normal failure into a crash.
      assertTrue(sink.statusCalls.some((c) => c.status === "running"));
    })
  );
});
