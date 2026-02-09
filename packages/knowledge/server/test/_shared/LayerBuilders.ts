import {
  ExtractionPipeline,
  ExtractionPipelineConfig,
  type ExtractionPipelineShape,
} from "@beep/knowledge-server/Extraction/ExtractionPipeline";
import { type RdfBuilder, RdfBuilderLive } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { type RdfStore, RdfStoreLive } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { type Serializer, SerializerLive } from "@beep/knowledge-server/Rdf/Serializer";
import { type SparqlGenerator, SparqlGeneratorLive } from "@beep/knowledge-server/Sparql/SparqlGenerator";
import { type SparqlParser, SparqlParserLive } from "@beep/knowledge-server/Sparql/SparqlParser";
import {
  ExtractionWorkflow,
  type ExtractionWorkflowParams,
  type ExtractionWorkflowShape,
} from "@beep/knowledge-server/Workflow/ExtractionWorkflow";
import {
  WorkflowPersistence,
  type WorkflowPersistenceShape,
} from "@beep/knowledge-server/Workflow/WorkflowPersistence";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { LanguageModel } from "@effect/ai";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

// Function declarations are intentionally used here to avoid TDZ issues in the presence of
// test-time circular imports (ESM module initialization ordering).
export function makeRdfBuilderSerializerLayer(): Layer.Layer<RdfBuilder | Serializer | RdfStore, never, never> {
  return Layer.mergeAll(RdfBuilderLive, SerializerLive).pipe(Layer.provideMerge(RdfStoreLive));
}

export function makeSparqlGeneratorLayer(): Layer.Layer<
  SparqlGenerator | SparqlParser | RdfStore,
  never,
  LanguageModel.LanguageModel
> {
  return Layer.mergeAll(SparqlGeneratorLive, SparqlParserLive, RdfStoreLive);
}

export function makeExtractionWorkflowTestLayer(deps: {
  readonly persistenceLayer: Layer.Layer<WorkflowPersistence, never, never>;
  readonly pipelineLayer: Layer.Layer<ExtractionPipeline, never, never>;
}): Layer.Layer<ExtractionWorkflow, never, never> {
  const impl: Effect.Effect<ExtractionWorkflowShape, never, ExtractionPipeline | WorkflowPersistence> = Effect.gen(
    function* () {
      const pipeline: ExtractionPipelineShape = yield* ExtractionPipeline;
      const persistence: WorkflowPersistenceShape = yield* WorkflowPersistence;

      const run: ExtractionWorkflowShape["run"] = (params: ExtractionWorkflowParams) =>
        Effect.gen(function* () {
          const executionId = KnowledgeEntityIds.WorkflowExecutionId.create();
          const orgId = SharedEntityIds.OrganizationId.make(
            params.organizationId ?? SharedEntityIds.OrganizationId.create()
          );
          const ontologyId = O.fromNullable(params.ontologyId).pipe(
            O.map(KnowledgeEntityIds.OntologyId.make),
            O.getOrElse(() => KnowledgeEntityIds.OntologyId.create())
          );

          const pipelineConfig = new ExtractionPipelineConfig({
            organizationId: orgId,
            ontologyId,
            documentId: DocumentsEntityIds.DocumentId.make(params.documentId),
            sourceUri: O.none(),
            chunkingConfig: O.none(),
            mentionMinConfidence: O.none(),
            entityMinConfidence: O.none(),
            relationMinConfidence: O.none(),
            entityBatchSize: O.none(),
            mergeEntities: O.fromNullable(params.config?.mergeEntities),
            enableIncrementalClustering: O.fromNullable(params.config?.enableIncrementalClustering),
          });

          // Best-effort persistence: failures must not block workflow execution.
          yield* persistence
            .createExecution({
              id: executionId,
              organizationId: orgId,
              workflowType: "extraction",
              input: {
                organizationId: orgId,
                documentId: params.documentId,
                ontologyId,
              },
            })
            .pipe(Effect.catchAllCause(() => Effect.void));

          yield* persistence
            .updateExecutionStatus(executionId, "running")
            .pipe(Effect.catchAllCause(() => Effect.void));

          const exit = yield* pipeline.run(params.text, params.ontologyContent, pipelineConfig).pipe(Effect.exit);

          if (exit._tag === "Failure") {
            const message = String(exit.cause);
            yield* persistence
              .updateExecutionStatus(executionId, "failed", { error: message })
              .pipe(Effect.catchAllCause(() => Effect.void));
            return yield* Effect.die(exit.cause);
          }

          yield* persistence
            .updateExecutionStatus(executionId, "completed", {
              output: {
                entityCount: exit.value.stats.entityCount,
                relationCount: exit.value.stats.relationCount,
                mentionCount: exit.value.stats.mentionCount,
                chunkCount: exit.value.stats.chunkCount,
              },
            })
            .pipe(Effect.catchAllCause(() => Effect.void));
          return exit.value;
        });

      return ExtractionWorkflow.of({ run });
    }
  );

  return Layer.effect(ExtractionWorkflow, impl).pipe(
    Layer.provide(deps.persistenceLayer),
    Layer.provide(deps.pipelineLayer)
  );
}
