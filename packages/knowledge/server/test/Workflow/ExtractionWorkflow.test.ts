import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import { WorkflowEngine } from "@effect/workflow";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import {
  ExtractionPipeline,
  ExtractionPipelineConfig,
  ExtractionResult,
  ExtractionResultStats,
} from "../../src/Extraction/ExtractionPipeline";
import { KnowledgeGraph, KnowledgeGraphStats } from "../../src/Extraction/GraphAssembler";
import { ExtractionWorkflow, ExtractionWorkflowLive } from "../../src/Workflow/ExtractionWorkflow";
import { WorkflowPersistence, type WorkflowPersistenceShape } from "../../src/Workflow/WorkflowPersistence";

type StatusUpdate = {
  readonly id: string;
  readonly status: string;
  readonly updates:
    | {
        readonly output?: Record<string, unknown>;
        readonly error?: string;
        readonly lastActivityName?: string;
      }
    | undefined;
};

const makePersistence = (statusUpdates: Array<StatusUpdate>): WorkflowPersistenceShape => ({
  createExecution: () => Effect.void,
  updateExecutionStatus: (id, status, updates) =>
    Effect.sync(() => {
      statusUpdates.push({ id, status, updates });
    }),
  getExecution: () => Effect.die("not used"),
  findLatestBatchExecutionByBatchId: () => Effect.succeed(O.none()),
  cancelExecution: () => Effect.void,
  requireBatchExecutionByBatchId: () => Effect.die("not used"),
});

const organizationId = SharedEntityIds.OrganizationId.create();
const documentId = DocumentsEntityIds.DocumentId.create();

describe("ExtractionWorkflow", () => {
  effect(
    "marks execution failed when pipeline fails",
    (() => {
      const statusUpdates: Array<StatusUpdate> = [];

      const pipelineLayer = Layer.succeed(
        ExtractionPipeline,
        ExtractionPipeline.of({
          run: () => Effect.dieMessage("pipeline failed"),
        })
      );

      const persistenceLayer = Layer.succeed(
        WorkflowPersistence,
        WorkflowPersistence.of(makePersistence(statusUpdates))
      );

      return Effect.fn(
        function* () {
          const workflow = yield* ExtractionWorkflow;

          const result = yield* workflow
            .run({
              organizationId,
              documentId,
              text: "alpha",
              ontologyContent: "ontology-a",
            })
            .pipe(Effect.exit);

          assertTrue(Exit.isFailure(result));

          const runningCount = statusUpdates.filter((entry) => entry.status === "running").length;
          const failedEntries = statusUpdates.filter((entry) => entry.status === "failed");
          const completedCount = statusUpdates.filter((entry) => entry.status === "completed").length;

          assertTrue(runningCount >= 1);
          strictEqual(completedCount, 0);
          assertTrue(failedEntries.length >= 1);
          assertTrue(failedEntries.some((entry) => (entry.updates?.error ?? "").includes("pipeline failed")));
        },
        Effect.provide(
          Layer.provide(
            ExtractionWorkflowLive,
            Layer.mergeAll(persistenceLayer, pipelineLayer, WorkflowEngine.layerMemory)
          )
        )
      );
    })()
  );

  effect(
    "writes completed execution output when pipeline succeeds",
    (() => {
      const statusUpdates: Array<StatusUpdate> = [];

      const pipelineLayer = Layer.succeed(
        ExtractionPipeline,
        ExtractionPipeline.of({
          run: () =>
            Effect.succeed(
              new ExtractionResult({
                graph: new KnowledgeGraph({
                  entities: [],
                  relations: [],
                  entityIndex: {},
                  stats: new KnowledgeGraphStats({
                    entityCount: 2,
                    relationCount: 1,
                    unresolvedSubjects: 0,
                    unresolvedObjects: 0,
                  }),
                }),
                stats: new ExtractionResultStats({
                  entityCount: 2,
                  relationCount: 1,
                  mentionCount: 3,
                  chunkCount: 1,
                  tokensUsed: 1,
                  clusteringEnabled: false,
                  durationMs: Duration.millis(1),
                }),
                config: new ExtractionPipelineConfig({
                  organizationId: SharedEntityIds.OrganizationId.create(),
                  ontologyId: KnowledgeEntityIds.OntologyId.create(),
                  documentId: DocumentsEntityIds.DocumentId.create(),
                  sourceUri: O.none(),
                  chunkingConfig: O.none(),
                  mentionMinConfidence: O.none(),
                  entityMinConfidence: O.none(),
                  relationMinConfidence: O.none(),
                  entityBatchSize: O.none(),
                  mergeEntities: O.none(),
                  enableIncrementalClustering: O.none(),
                }),
              })
            ),
        })
      );

      const persistenceLayer = Layer.succeed(
        WorkflowPersistence,
        WorkflowPersistence.of(makePersistence(statusUpdates))
      );

      return Effect.fn(
        function* () {
          const workflow = yield* ExtractionWorkflow;

          const result = yield* workflow.run({
            organizationId,
            documentId,
            text: "alpha",
            ontologyContent: "ontology-a",
          });

          strictEqual(result.stats.entityCount, 2);
          strictEqual(result.stats.relationCount, 1);

          const completedEntries = statusUpdates.filter((entry) => entry.status === "completed");
          strictEqual(completedEntries.length, 1);
          const output = completedEntries[0]?.updates?.output;
          strictEqual(output?.entityCount, 2);
          strictEqual(output?.relationCount, 1);
        },
        Effect.provide(
          Layer.provide(
            ExtractionWorkflowLive,
            Layer.mergeAll(persistenceLayer, pipelineLayer, WorkflowEngine.layerMemory)
          )
        )
      );
    })()
  );
});
