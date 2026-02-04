/**
 * Service: AgentKit
 *
 * Provides built-in Agent adapters that operate on AgentTask as a shared
 * pipeline envelope. This reduces API surface area by standardizing the
 * inputs/outputs across ingestion, extraction, validation, and correction.
 *
 * @since 2.0.0
 * @module Service/Agent/AgentKit
 */

import { Data, Effect, Option } from "effect"
import { AgentId, AgentMetadata, ValidationResult } from "../../Domain/Model/Agent.js"
import type { Agent } from "../../Domain/Model/Agent.js"
import type { KnowledgeGraph } from "../../Domain/Model/Entity.js"
import type { OntologyAgentConfig } from "../../Domain/Model/OntologyAgent.js"
import { ConfigService, ConfigServiceDefault } from "../Config.js"
import { LinkIngestionService } from "../LinkIngestionService.js"
import { OntologyService } from "../Ontology.js"
import { OntologyAgent } from "../OntologyAgent.js"
import { RdfBuilder, type RdfStore } from "../Rdf.js"
import { ShaclService } from "../Shacl.js"
import { StorageService, StorageServiceLive } from "../Storage.js"
import { AgentCoordinator } from "./AgentCoordinator.js"
import { CorrectorAgent } from "./CorrectorAgent.js"
import { AgentTask } from "./types.js"

// =============================================================================
// Errors
// =============================================================================

export class AgentInputError extends Data.TaggedError("AgentInputError")<{
  readonly taskId: string
  readonly message: string
  readonly missing?: ReadonlyArray<string>
}> {}

// =============================================================================
// Helpers
// =============================================================================

const mergeTask = (task: AgentTask, updates: Partial<AgentTask>): AgentTask => new AgentTask({ ...task, ...updates })

const isRdfStore = (value: unknown): value is RdfStore =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  (value as { _tag?: string })._tag === "RdfStore"

const isKnowledgeGraph = (value: unknown): value is KnowledgeGraph =>
  typeof value === "object" &&
  value !== null &&
  "entities" in value &&
  "relations" in value

// =============================================================================
// Service Definition
// =============================================================================

export class AgentKit extends Effect.Service<AgentKit>()("AgentKit", {
  effect: Effect.gen(function*() {
    const config = yield* ConfigService
    const ontologyAgent = yield* OntologyAgent
    const ontologyService = yield* OntologyService
    const rdfBuilder = yield* RdfBuilder
    const shaclService = yield* ShaclService
    const ingestionOpt = yield* Effect.serviceOption(LinkIngestionService)
    const storage = yield* StorageService
    const corrector = yield* CorrectorAgent

    const getOntologyStore = yield* Effect.cached(
      Effect.gen(function*() {
        const ontologyPath = config.ontology.path
        const contentOpt = yield* storage.get(ontologyPath)
        if (Option.isNone(contentOpt)) {
          return yield* Effect.fail(
            new Error(`Ontology not found at ${ontologyPath}`)
          )
        }
        return yield* rdfBuilder.parseTurtle(contentOpt.value)
      })
    )

    const getShapesStore = yield* Effect.cached(
      Effect.gen(function*() {
        const ontologyStore = yield* getOntologyStore
        return yield* shaclService.generateShapesFromOntology(ontologyStore._store)
      })
    )

    const buildStoreFromGraph = (graph: KnowledgeGraph) =>
      Effect.gen(function*() {
        const store = yield* rdfBuilder.createStore
        yield* rdfBuilder.addEntities(store, graph.entities)
        yield* rdfBuilder.addRelations(store, graph.relations)
        return store
      })

    const resolveStore = (task: AgentTask) =>
      Effect.gen(function*() {
        if (task.rdfStore && isRdfStore(task.rdfStore)) {
          return task.rdfStore
        }

        if (typeof task.turtle === "string") {
          return yield* rdfBuilder.parseTurtle(task.turtle)
        }

        if (task.knowledgeGraph) {
          return yield* buildStoreFromGraph(task.knowledgeGraph)
        }

        if (task.graph && isRdfStore(task.graph)) {
          return task.graph
        }

        if (task.graph && isKnowledgeGraph(task.graph)) {
          return yield* buildStoreFromGraph(task.graph)
        }

        return yield* Effect.fail(
          new AgentInputError({
            taskId: task.taskId,
            message: "Validation requires rdfStore, turtle, or knowledgeGraph",
            missing: ["rdfStore", "turtle", "knowledgeGraph"]
          })
        )
      })

    const ingestor: Agent<AgentTask, AgentTask, AgentInputError | unknown> = Option.match(ingestionOpt, {
      onNone: () => ({
        metadata: new AgentMetadata({
          id: AgentId("ingestor"),
          name: "Link Ingestor",
          description: "Fetches and stores source content, returning enriched text for downstream agents",
          type: "ingestor",
          version: "1.0.0"
        }),
        validate: () =>
          Effect.succeed(
            ValidationResult.fail(["LinkIngestionService is not available"])
          ),
        execute: (task) =>
          Effect.fail(
            new AgentInputError({
              taskId: task.taskId,
              message: "LinkIngestionService is not available"
            })
          )
      }),
      onSome: (ingestion) => ({
        metadata: new AgentMetadata({
          id: AgentId("ingestor"),
          name: "Link Ingestor",
          description: "Fetches and stores source content, returning enriched text for downstream agents",
          type: "ingestor",
          version: "1.0.0"
        }),
        validate: (task) =>
          Effect.succeed(
            task.sourceUrl
              ? ValidationResult.pass()
              : ValidationResult.fail(["sourceUrl is required"])
          ),
        execute: (task) =>
          Effect.gen(function*() {
            if (!task.sourceUrl) {
              return yield* Effect.fail(
                new AgentInputError({
                  taskId: task.taskId,
                  message: "Ingestion requires sourceUrl",
                  missing: ["sourceUrl"]
                })
              )
            }

            if (!task.ontologyId) {
              return yield* Effect.fail(
                new AgentInputError({
                  taskId: task.taskId,
                  message: "Ingestion requires ontologyId",
                  missing: ["ontologyId"]
                })
              )
            }

            const extraOptions = (task.ingestionOptions ?? {}) as Record<string, unknown>
            const ingestResult = yield* ingestion.ingestUrl(task.sourceUrl, {
              ontologyId: task.ontologyId,
              ...extraOptions
            })
            const contentOpt = yield* storage.get(ingestResult.storageUri)

            if (Option.isNone(contentOpt)) {
              return yield* Effect.fail(
                new AgentInputError({
                  taskId: task.taskId,
                  message: `Ingested content missing at ${ingestResult.storageUri}`
                })
              )
            }

            return mergeTask(task, {
              text: contentOpt.value,
              ingestionResult: ingestResult,
              documentId: task.documentId ?? ingestResult.id
            })
          })
      })
    })

    const extractor: Agent<AgentTask, AgentTask, AgentInputError | unknown> = {
      metadata: new AgentMetadata({
        id: AgentId("extractor"),
        name: "Ontology Extractor",
        description: "Extracts entities/relations using ontology-guided LLM prompts",
        type: "extractor",
        version: "1.0.0"
      }),
      validate: (task) =>
        Effect.succeed(
          task.text
            ? ValidationResult.pass()
            : ValidationResult.fail(["text is required"])
        ),
      execute: (task): Effect.Effect<AgentTask, AgentInputError | unknown, never> =>
        Effect.gen(function*() {
          if (!task.text) {
            return yield* Effect.fail(
              new AgentInputError({
                taskId: task.taskId,
                message: "Extraction requires text",
                missing: ["text"]
              })
            )
          }

          const agentConfig = task.agentConfig as OntologyAgentConfig | undefined
          const result = yield* ontologyAgent.extract(task.text, agentConfig)
          const rdfStore = yield* buildStoreFromGraph(result.graph)
          const ontologyContext = task.ontologyContext ?? (yield* ontologyService.ontology)

          return mergeTask(task, {
            knowledgeGraph: result.graph,
            graph: result.graph,
            rdfStore,
            turtle: result.turtle,
            ontologyContext
          })
        })
    }

    const validator: Agent<AgentTask, AgentTask, AgentInputError | unknown> = {
      metadata: new AgentMetadata({
        id: AgentId("validator"),
        name: "SHACL Validator",
        description: "Validates RDF graphs against ontology-derived SHACL shapes",
        type: "validator",
        version: "1.0.0"
      }),
      validate: (task) =>
        Effect.succeed(
          task.rdfStore || task.turtle || task.knowledgeGraph || task.graph
            ? ValidationResult.pass()
            : ValidationResult.fail(["rdfStore, turtle, or knowledgeGraph is required"])
        ),
      execute: (task): Effect.Effect<AgentTask, AgentInputError | unknown, never> =>
        Effect.gen(function*() {
          const rdfStore = yield* resolveStore(task)
          const shapesStore = yield* getShapesStore
          const report = yield* shaclService.validate(rdfStore._store, shapesStore)
          const explanations = ontologyAgent.explainViolations(report.violations)

          return mergeTask(task, {
            rdfStore,
            validationReport: report,
            validationExplanations: explanations
          })
        })
    }

    const correctorAgent: Agent<AgentTask, AgentTask, AgentInputError | unknown> = {
      metadata: new AgentMetadata({
        id: AgentId("corrector"),
        name: "SHACL Corrector",
        description: "Applies LLM-guided corrections to SHACL violations",
        type: "corrector",
        version: "1.0.0"
      }),
      validate: (task) =>
        Effect.succeed(
          task.validationReport
            ? ValidationResult.pass()
            : ValidationResult.fail(["validationReport is required"])
        ),
      execute: (task): Effect.Effect<AgentTask, AgentInputError | unknown, never> =>
        Effect.gen(function*() {
          if (!task.validationReport) {
            return yield* Effect.fail(
              new AgentInputError({
                taskId: task.taskId,
                message: "Correction requires validationReport",
                missing: ["validationReport"]
              })
            )
          }

          const rdfStore = yield* resolveStore(task)
          const ontologyContext = task.ontologyContext ?? (yield* ontologyService.ontology)
          const result = yield* corrector.correctAll(task.validationReport, rdfStore, ontologyContext)
          const turtle = yield* rdfBuilder.toTurtle(rdfStore)

          return mergeTask(task, {
            rdfStore,
            turtle,
            correctionResult: result
          })
        })
    }

    const registerDefaults = () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator
        if (Option.isSome(ingestionOpt)) {
          yield* coordinator.register(ingestor)
        }
        yield* coordinator.register(extractor)
        yield* coordinator.register(validator)
        yield* coordinator.register(correctorAgent)
      })

    return {
      ingestor,
      extractor,
      validator,
      corrector: correctorAgent,
      registerDefaults
    }
  }),
  dependencies: [
    ConfigServiceDefault,
    OntologyAgent.Default,
    OntologyService.Default,
    RdfBuilder.Default,
    ShaclService.Default,
    StorageServiceLive,
    CorrectorAgent.Default,
    AgentCoordinator.Default
  ],
  accessors: true
}) {}
