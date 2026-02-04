/**
 * Workflow Activities
 *
 * Effect-native activity implementations for the batch pipeline.
 * Activities are standalone effects that can be executed by the ActivityRunner.
 * They use branded schemas for input/output validation.
 *
 * The activity pattern:
 * - Factory function takes typed input (decoded from Cloud Tasks payload)
 * - Returns an Activity object with `name` and `execute` effect
 * - `execute` is a pure Effect that performs the work
 *
 * @since 2.0.0
 */

/**
 * @deprecated Use DurableActivities.ts instead.
 * Logic has been consolidated into durable Activity.make implementations.
 * This file is retained for reference and will be removed in a future version.
 */

import { Chunk, DateTime, Effect, Option, Schema } from "effect"
import { DocumentId, GcsUri, toGcsUri } from "../Domain/Identity.js"
import { KnowledgeGraph } from "../Domain/Model/Entity.js"
import { PathLayout } from "../Domain/PathLayout.js"
import { RDF } from "../Domain/Rdf/Types.js"
import type {
  ExtractionActivityInput,
  IngestionActivityInput,
  ResolutionActivityInput,
  ValidationActivityInput
} from "../Domain/Schema/Batch.js"
import { ValidationActivityOutput as ValidationActivityOutputSchema } from "../Domain/Schema/Batch.js"
import { ConfigService } from "../Service/Config.js"
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { OntologyService } from "../Service/Ontology.js"
import { RdfBuilder } from "../Service/Rdf.js"
import { ShaclService } from "../Service/Shacl.js"
import type { ShaclViolation } from "../Service/Shacl.js"
import { StorageService } from "../Service/Storage.js"
import { loadShaclShapesWithAutoDiscovery } from "./ShaclHelpers.js"

// -----------------------------------------------------------------------------
// Shared helpers
// -----------------------------------------------------------------------------

const stripGsPrefix = (uri: string): string => uri.startsWith("gs://") ? uri.replace(/^gs:\/\/[^/]+\//, "") : uri

const requireContent = (opt: Option.Option<string>, key: string) =>
  Option.match(opt, {
    onNone: () => Effect.fail(new Error(`Missing object at ${key}`)),
    onSome: (value) => Effect.succeed(value)
  })

const resolveBucket = (config: { storage: { bucket: Option.Option<string> } }) =>
  Option.getOrElse(config.storage.bucket, () => "local-bucket")

const toStringError = (e: unknown): string => e instanceof Error ? e.message : String(e)

const summarizeViolations = (violations: ReadonlyArray<ShaclViolation>) => {
  const grouped = new Map<string, { count: number; sampleMessages: Array<string> }>()

  for (const violation of violations) {
    const entry = grouped.get(violation.severity) ?? { count: 0, sampleMessages: [] }
    entry.count += 1
    if (entry.sampleMessages.length < 3 && violation.message) {
      entry.sampleMessages.push(violation.message)
    }
    grouped.set(violation.severity, entry)
  }

  return Array.from(grouped.entries()).map(([severity, info]) => ({
    severity,
    count: info.count,
    sampleMessages: info.sampleMessages
  }))
}

/**
 * Serialize a KnowledgeGraph to Turtle using RdfBuilder
 */
const graphToTurtle = (graph: KnowledgeGraph) =>
  Effect.gen(function*() {
    const rdf = yield* RdfBuilder
    const store = yield* rdf.createStore
    yield* rdf.addEntities(store, graph.entities)
    yield* rdf.addRelations(store, graph.relations)
    return yield* rdf.toTurtle(store)
  })

/**
 * Parse Turtle to KnowledgeGraph (simplified - counts triples)
 */
const parseTurtleStats = (turtle: string) =>
  Effect.gen(function*() {
    const rdf = yield* RdfBuilder
    const store = yield* rdf.parseTurtle(turtle)
    // Count entities (subjects with rdf:type)
    const typeQuads = yield* rdf.queryStore(store, {
      predicate: RDF.type
    })
    // Count total triples
    const allQuads = yield* rdf.queryStore(store, {})
    return {
      entityCount: typeQuads.length,
      tripleCount: allQuads.length
    }
  })

// -----------------------------------------------------------------------------
// Schemas for activity outputs
// -----------------------------------------------------------------------------

export const ExtractionActivityOutput = Schema.Struct({
  documentId: DocumentId,
  graphUri: GcsUri,
  entityCount: Schema.Number,
  relationCount: Schema.Number,
  /** Number of claims extracted (optional for backward compatibility) */
  claimCount: Schema.optionalWith(Schema.Number, { default: () => 0 }),
  durationMs: Schema.Number
})
export type ExtractionActivityOutput = typeof ExtractionActivityOutput.Type

export const ResolutionActivityOutput = Schema.Struct({
  resolvedUri: GcsUri,
  entitiesTotal: Schema.Number,
  clustersFormed: Schema.Number,
  durationMs: Schema.Number
})
export type ResolutionActivityOutput = typeof ResolutionActivityOutput.Type

export const ValidationActivityOutput = ValidationActivityOutputSchema
export type ValidationActivityOutput = typeof ValidationActivityOutputSchema.Type

export const IngestionActivityOutput = Schema.Struct({
  canonicalUri: GcsUri,
  triplesIngested: Schema.Number,
  durationMs: Schema.Number
})
export type IngestionActivityOutput = typeof IngestionActivityOutput.Type

// -----------------------------------------------------------------------------
// Activity type - simple factory pattern (no @effect/workflow dependency)
// -----------------------------------------------------------------------------

export interface Activity<A, E, R> {
  readonly name: string
  readonly execute: Effect.Effect<A, E, R>
}

// -----------------------------------------------------------------------------
// Activities (parameterized factories)
// -----------------------------------------------------------------------------

type ExtractionInput = typeof ExtractionActivityInput.Type
type ResolutionInput = typeof ResolutionActivityInput.Type
type ValidationInput = typeof ValidationActivityInput.Type
type IngestionInput = typeof IngestionActivityInput.Type

export const makeExtractionActivity = (input: ExtractionInput): Activity<
  ExtractionActivityOutput,
  string,
  StorageService | ConfigService | RdfBuilder | EntityExtractor | RelationExtractor | OntologyService
> => ({
  name: "extraction",
  execute: Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService
    const config = yield* ConfigService
    const entityExtractor = yield* EntityExtractor
    const relationExtractor = yield* RelationExtractor
    const ontologyService = yield* OntologyService

    const bucket = resolveBucket(config)

    yield* Effect.logInfo("Extraction activity starting", {
      batchId: input.batchId,
      documentId: input.documentId,
      sourceUri: input.sourceUri,
      ontologyUri: input.ontologyUri
    })

    // 1. Read source document
    const sourceKey = stripGsPrefix(input.sourceUri)
    const sourceContent = yield* storage.get(sourceKey).pipe(
      Effect.flatMap((opt) => requireContent(opt, sourceKey))
    )

    yield* Effect.logInfo("Source document loaded", {
      documentId: input.documentId,
      contentLength: sourceContent.length,
      contentPreview: sourceContent.slice(0, 200)
    })

    // 2. Load ontology to get candidate classes
    // Use hybrid search on the source text to find relevant classes
    const candidateClasses = yield* ontologyService.searchClassesHybrid(
      sourceContent.slice(0, 2000), // Use first 2000 chars for class search
      100 // Get top 100 candidate classes
    ).pipe(
      Effect.tap((classes) =>
        Effect.logInfo("Candidate classes loaded", {
          documentId: input.documentId,
          candidateCount: Chunk.size(classes),
          candidateClassIds: Chunk.toReadonlyArray(classes).slice(0, 10).map((c) => c.id)
        })
      )
    )

    // 3. Extract entities from LLM
    const entities = yield* entityExtractor.extract(
      sourceContent,
      Chunk.toReadonlyArray(candidateClasses)
    ).pipe(
      Effect.tap((entities) =>
        Effect.logInfo("Entities extracted", {
          documentId: input.documentId,
          entityCount: Chunk.size(entities)
        })
      )
    )

    // 4. Get properties for extracted entity types to use in relation extraction
    const entityTypes = Chunk.toReadonlyArray(entities).flatMap((e) => e.types)
    const uniqueEntityTypes = Array.from(new Set(entityTypes))
    const properties = yield* ontologyService.getPropertiesFor(uniqueEntityTypes).pipe(
      Effect.tap((props) =>
        Effect.logInfo("Properties loaded for entity types", {
          documentId: input.documentId,
          entityTypeCount: uniqueEntityTypes.length,
          propertyCount: Chunk.size(props)
        })
      )
    )

    // 4.5. Get class hierarchy checker for OWL subclass reasoning in domain/range validation
    const isSubClassOf = yield* ontologyService.getClassHierarchyChecker()

    // 5. Extract relations from LLM (only if we have 2+ entities and properties)
    const relations = Chunk.size(entities) >= 2 && Chunk.size(properties) > 0
      ? yield* relationExtractor.extract(
        sourceContent,
        entities,
        Chunk.toReadonlyArray(properties),
        isSubClassOf
      ).pipe(
        Effect.tap((relations) =>
          Effect.logInfo("Relations extracted", {
            documentId: input.documentId,
            relationCount: Chunk.size(relations)
          })
        )
      )
      : Chunk.empty()

    // 6. Create KnowledgeGraph
    const graph = new KnowledgeGraph({
      entities: Chunk.toReadonlyArray(entities),
      relations: Chunk.toReadonlyArray(relations),
      sourceText: sourceContent
    })

    // 7. Serialize to Turtle using RdfBuilder
    const turtleContent = yield* graphToTurtle(graph).pipe(
      Effect.tap((turtle) =>
        Effect.logInfo("Graph serialized to Turtle", {
          documentId: input.documentId,
          turtleLength: turtle.length
        })
      )
    )

    // 8. Save Turtle graph to storage
    const graphPath = PathLayout.document.graph(input.documentId)
    yield* storage.set(graphPath, turtleContent)

    const end = yield* DateTime.now

    yield* Effect.logInfo("Extraction activity complete", {
      batchId: input.batchId,
      documentId: input.documentId,
      entityCount: Chunk.size(entities),
      relationCount: Chunk.size(relations),
      graphUri: toGcsUri(bucket, graphPath),
      durationMs: DateTime.distance(start, end)
    })

    return {
      documentId: input.documentId,
      graphUri: toGcsUri(bucket, graphPath),
      entityCount: Chunk.size(entities),
      relationCount: Chunk.size(relations),
      claimCount: 0, // Legacy activities don't track claims
      durationMs: DateTime.distance(start, end)
    }
  }).pipe(Effect.mapError(toStringError))
})

export const makeResolutionActivity = (input: ResolutionInput): Activity<
  ResolutionActivityOutput,
  string,
  StorageService | ConfigService | RdfBuilder
> => ({
  name: "resolution",
  execute: Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService
    const config = yield* ConfigService
    const rdf = yield* RdfBuilder
    const bucket = resolveBucket(config)

    yield* Effect.logInfo("Resolution activity starting", {
      batchId: input.batchId,
      graphCount: input.documentGraphUris.length
    })

    // Load all document graphs
    const graphContents = yield* Effect.forEach(input.documentGraphUris, (uri) =>
      storage.get(stripGsPrefix(uri)).pipe(
        Effect.flatMap((opt) => requireContent(opt, uri))
      ), { concurrency: 10 })

    // Parse each Turtle graph to RDF store and extract entities/relations
    const parsedGraphs = yield* Effect.forEach(graphContents, (turtle) =>
      Effect.gen(function*() {
        const store = yield* rdf.parseTurtle(turtle)
        // Query for all quads
        const quads = yield* rdf.queryStore(store, {})
        return { store, quadCount: quads.length }
      }).pipe(
        Effect.catchAll(() => Effect.succeed({ store: null, quadCount: 0 }))
      ), { concurrency: 5 })

    // Merge all valid Turtle content (simple concatenation for now)
    // TODO: Use proper RDF merge with entity resolution
    const mergedTurtle = graphContents.join("\n\n")

    // Write merged graph
    const resolutionPath = PathLayout.batch.resolution(input.batchId)
    yield* storage.set(resolutionPath, mergedTurtle)

    // Count entities in merged result
    const stats = yield* parseTurtleStats(mergedTurtle).pipe(
      Effect.catchAll(() => Effect.succeed({ entityCount: 0, tripleCount: 0 }))
    )

    const end = yield* DateTime.now

    yield* Effect.logInfo("Resolution activity complete", {
      batchId: input.batchId,
      entitiesTotal: stats.entityCount,
      clustersFormed: parsedGraphs.filter((g) => g.store !== null).length
    })

    return {
      resolvedUri: toGcsUri(bucket, resolutionPath),
      entitiesTotal: stats.entityCount,
      clustersFormed: parsedGraphs.filter((g) => g.store !== null).length,
      durationMs: DateTime.distance(start, end)
    }
  }).pipe(Effect.mapError(toStringError))
})

export const makeValidationActivity = (input: ValidationInput): Activity<
  ValidationActivityOutput,
  string,
  StorageService | ConfigService | RdfBuilder | ShaclService
> => ({
  name: "validation",
  execute: Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService
    const config = yield* ConfigService
    const rdf = yield* RdfBuilder
    const shacl = yield* ShaclService
    const bucket = resolveBucket(config)

    yield* Effect.logInfo("Validation activity starting", {
      batchId: input.batchId,
      resolvedGraphUri: input.resolvedGraphUri,
      hasShaclUri: Option.match(Option.fromNullable(input.shaclUri), {
        onNone: () => false,
        onSome: () => true
      }),
      shaclUri: input.shaclUri ?? "none"
    })

    const resolvedGraph = yield* storage.get(stripGsPrefix(input.resolvedGraphUri)).pipe(
      Effect.flatMap((opt) => requireContent(opt, input.resolvedGraphUri))
    )

    const dataStore = yield* rdf.parseTurtle(resolvedGraph)

    // Load SHACL shapes with auto-discovery
    const shapesStore = yield* loadShaclShapesWithAutoDiscovery(
      input.shaclUri,
      input.ontologyUri,
      input.batchId
    )

    const report = yield* shacl.validate(dataStore._store, shapesStore)

    const validationGraphPath = PathLayout.batch.validationGraph(input.batchId)
    yield* storage.set(validationGraphPath, resolvedGraph)

    const reportPath = PathLayout.batch.validationReport(input.batchId)
    yield* storage.set(reportPath, JSON.stringify(report, null, 2))

    const end = yield* DateTime.now

    yield* Effect.logInfo("Validation activity complete", {
      batchId: input.batchId,
      conforms: report.conforms,
      violations: report.violations.length,
      validatedUri: toGcsUri(bucket, validationGraphPath),
      durationMs: DateTime.distance(start, end)
    })

    return {
      validatedUri: toGcsUri(bucket, validationGraphPath),
      conforms: report.conforms,
      violations: report.violations.length,
      violationSummary: report.violations.length ? summarizeViolations(report.violations) : undefined,
      reportUri: toGcsUri(bucket, reportPath),
      durationMs: DateTime.distance(start, end)
    }
  }).pipe(Effect.mapError(toStringError))
})

export const makeIngestionActivity = (input: IngestionInput): Activity<
  IngestionActivityOutput,
  string,
  StorageService | ConfigService | RdfBuilder
> => ({
  name: "ingestion",
  execute: Effect.gen(function*() {
    const start = yield* DateTime.now
    const storage = yield* StorageService
    const config = yield* ConfigService
    const bucket = resolveBucket(config)

    yield* Effect.logInfo("Ingestion activity starting", {
      batchId: input.batchId,
      targetNamespace: input.targetNamespace
    })

    // Load validated graph
    const validatedGraph = yield* storage.get(stripGsPrefix(input.validatedGraphUri)).pipe(
      Effect.flatMap((opt) => requireContent(opt, input.validatedGraphUri))
    )

    // Count triples in the graph
    const stats = yield* parseTurtleStats(validatedGraph).pipe(
      Effect.catchAll(() => Effect.succeed({ entityCount: 0, tripleCount: 0 }))
    )

    // Write to batch canonical location
    const canonicalPath = PathLayout.batch.canonical(input.batchId)
    yield* storage.set(canonicalPath, validatedGraph)

    // Also write to namespace canonical location (merging with existing)
    const namespaceCanonicalPath = PathLayout.canonical(input.targetNamespace).entities
    yield* storage.set(namespaceCanonicalPath, validatedGraph)

    const end = yield* DateTime.now

    yield* Effect.logInfo("Ingestion activity complete", {
      batchId: input.batchId,
      triplesIngested: stats.tripleCount,
      canonicalPath
    })

    return {
      canonicalUri: toGcsUri(bucket, canonicalPath),
      triplesIngested: stats.tripleCount,
      durationMs: DateTime.distance(start, end)
    }
  }).pipe(Effect.mapError(toStringError))
})
