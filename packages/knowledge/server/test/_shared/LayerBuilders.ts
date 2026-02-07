import type { ExtractionPipeline } from "@beep/knowledge-server/Extraction/ExtractionPipeline";
import type { FallbackLanguageModel } from "@beep/knowledge-server/LlmControl/FallbackLanguageModel";
import { type RdfBuilder, RdfBuilderLive } from "@beep/knowledge-server/Rdf/RdfBuilder";
import { type RdfStore, RdfStoreLive } from "@beep/knowledge-server/Rdf/RdfStoreService";
import { type Serializer, SerializerLive } from "@beep/knowledge-server/Rdf/Serializer";
import { type SparqlGenerator, SparqlGeneratorLive } from "@beep/knowledge-server/Sparql/SparqlGenerator";
import { type SparqlParser, SparqlParserLive } from "@beep/knowledge-server/Sparql/SparqlParser";
import { type ExtractionWorkflow, ExtractionWorkflowLive } from "@beep/knowledge-server/Workflow/ExtractionWorkflow";
import type { WorkflowPersistence } from "@beep/knowledge-server/Workflow/WorkflowPersistence";
import type { LanguageModel } from "@effect/ai";
import { WorkflowEngine } from "@effect/workflow";
import * as Layer from "effect/Layer";

export const makeRdfBuilderSerializerLayer = (): Layer.Layer<RdfBuilder | Serializer | RdfStore, never, never> =>
  Layer.mergeAll(RdfBuilderLive, SerializerLive).pipe(Layer.provideMerge(RdfStoreLive));

export const makeSparqlGeneratorLayer = (): Layer.Layer<
  SparqlGenerator | SparqlParser | RdfStore,
  never,
  LanguageModel.LanguageModel | FallbackLanguageModel
> => Layer.mergeAll(SparqlGeneratorLive, SparqlParserLive, RdfStoreLive);

export const makeExtractionWorkflowTestLayer = (deps: {
  readonly persistenceLayer: Layer.Layer<WorkflowPersistence, never, never>;
  readonly pipelineLayer: Layer.Layer<ExtractionPipeline, never, never>;
}): Layer.Layer<ExtractionWorkflow, never, never> =>
  Layer.provide(
    ExtractionWorkflowLive,
    Layer.mergeAll(deps.persistenceLayer, deps.pipelineLayer, WorkflowEngine.layerMemory)
  );
