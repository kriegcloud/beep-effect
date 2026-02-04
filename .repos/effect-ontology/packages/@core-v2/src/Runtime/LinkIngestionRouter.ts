/**
 * Router: Link Ingestion API
 *
 * HTTP endpoints for URL ingestion via Jina Reader API.
 *
 * @since 2.0.0
 * @module Runtime/LinkIngestionRouter
 */

import { HttpRouter, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { DateTime, Effect, Option, Schema } from "effect"
import { TreeFormatter } from "effect/ParseResult"
import type { ParseError } from "effect/ParseResult"
import { type BatchId, documentIdFromHash, type Namespace, resolveToGcsUri, toGcsUri } from "../Domain/Identity.js"
import { PathLayout } from "../Domain/PathLayout.js"
import { BatchManifest, type BatchWorkflowPayload } from "../Domain/Schema/Batch.js"
import {
  BatchIngestResponse,
  BatchIngestResult,
  IngestLinkResponse,
  LinkDetail,
  LinkSummary,
  ListLinksResponse
} from "../Domain/Schema/LinkIngestion.js"
import { ConfigService } from "../Service/Config.js"
import { JinaReaderClient } from "../Service/JinaReaderClient.js"
import { LinkIngestionError, LinkIngestionService } from "../Service/LinkIngestionService.js"
import { OntologyService } from "../Service/Ontology.js"
import { StorageService } from "../Service/Storage.js"
import { WorkflowOrchestrator } from "../Service/WorkflowOrchestrator.js"

// =============================================================================
// Query Param Schemas (use NumberFromString for URL query params)
// =============================================================================

const ListLinksQueryParams = Schema.Struct({
  status: Schema.optional(Schema.Literal("pending", "enriched", "processed", "failed")),
  sourceType: Schema.optional(
    Schema.Literal("news", "blog", "press_release", "official", "academic", "unknown")
  ),
  organization: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.NumberFromString),
  offset: Schema.optional(Schema.NumberFromString)
})

const PreviewRequest = Schema.Struct({
  url: Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/))
})

// =============================================================================
// Request Body Schemas (without ontologyId - comes from path)
// =============================================================================

const IngestLinkBody = Schema.Struct({
  /** URL to ingest */
  url: Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/)),
  /** Skip AI enrichment */
  skipEnrich: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  /** Override source type classification */
  sourceType: Schema.optional(
    Schema.Literal("news", "blog", "press_release", "official", "academic", "unknown")
  ),
  /** Allow duplicate content */
  allowDuplicates: Schema.optionalWith(Schema.Boolean, { default: () => false })
})

const BatchIngestBody = Schema.Struct({
  /** URLs to ingest */
  urls: Schema.Array(Schema.String.pipe(Schema.pattern(/^https?:\/\/.+/))),
  /** Concurrency limit */
  concurrency: Schema.optionalWith(Schema.Number.pipe(Schema.int(), Schema.positive()), {
    default: () => 5
  }),
  /** Skip AI enrichment */
  skipEnrich: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  /** Continue on individual failures */
  continueOnError: Schema.optionalWith(Schema.Boolean, { default: () => true })
})

/**
 * Request body for creating a batch from ingested links
 */
const CreateBatchFromLinksBody = Schema.Struct({
  /** IDs of ingested links to include in the batch */
  linkIds: Schema.Array(Schema.String),
  /** Override target namespace (defaults to ontology namespace) */
  targetNamespace: Schema.optional(Schema.String),
  /** Optional preprocessing configuration */
  preprocessing: Schema.optional(Schema.Unknown)
})

// =============================================================================
// Link Ingestion Router
// =============================================================================

export const LinkIngestionRouter = HttpRouter.empty.pipe(
  // POST /v1/ontologies/:ontologyId/links - Ingest a single URL
  HttpRouter.post(
    "/v1/ontologies/:ontologyId/links",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId

      if (!ontologyId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId is required"
        }, { status: 400 })
      }

      return yield* HttpServerRequest.schemaBodyJson(IngestLinkBody).pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            HttpServerResponse.json({
              error: "VALIDATION_ERROR",
              message: TreeFormatter.formatErrorSync(error as ParseError)
            }, { status: 400 }),
          onSuccess: (request) =>
            Effect.gen(function*() {
              const ingestion = yield* LinkIngestionService

              const result = yield* ingestion.ingestUrl(request.url, {
                ontologyId,
                enrich: !request.skipEnrich,
                sourceType: request.sourceType,
                skipDuplicates: !request.allowDuplicates
              }).pipe(
                Effect.mapError((error) => ({
                  error: "INGESTION_ERROR" as const,
                  message: error.message,
                  phase: error.phase
                }))
              )

              return yield* HttpServerResponse.schemaJson(IngestLinkResponse)({
                id: result.id,
                contentHash: result.contentHash,
                storageUri: result.storageUri,
                headline: result.headline ?? null,
                wordCount: result.wordCount ?? null,
                duplicate: result.duplicate
              }, { status: result.duplicate ? 200 : 201 })
            }).pipe(
              Effect.catchAll((error) => HttpServerResponse.json(error, { status: 500 }))
            )
        })
      )
    })
  ),
  // POST /v1/ontologies/:ontologyId/links/batch - Batch ingest URLs
  HttpRouter.post(
    "/v1/ontologies/:ontologyId/links/batch",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId

      if (!ontologyId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId is required"
        }, { status: 400 })
      }

      return yield* HttpServerRequest.schemaBodyJson(BatchIngestBody).pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            HttpServerResponse.json({
              error: "VALIDATION_ERROR",
              message: TreeFormatter.formatErrorSync(error as ParseError)
            }, { status: 400 }),
          onSuccess: (request) =>
            Effect.gen(function*() {
              const ingestion = yield* LinkIngestionService

              const results = yield* ingestion.ingestUrls(request.urls, {
                ontologyId,
                concurrency: request.concurrency,
                enrich: !request.skipEnrich,
                continueOnError: request.continueOnError
              })

              // Transform results
              let successCount = 0
              let duplicateCount = 0
              let errorCount = 0

              const batchResults: Array<typeof BatchIngestResult.Type> = results.map((result, index) => {
                const url = request.urls[index]
                if (result instanceof LinkIngestionError) {
                  errorCount++
                  return new BatchIngestResult({
                    url,
                    status: "error",
                    id: null,
                    contentHash: null,
                    error: result.message
                  })
                }

                if (result.duplicate) {
                  duplicateCount++
                  return new BatchIngestResult({
                    url,
                    status: "duplicate",
                    id: result.id,
                    contentHash: result.contentHash,
                    error: null
                  })
                }

                successCount++
                return new BatchIngestResult({
                  url,
                  status: "success",
                  id: result.id,
                  contentHash: result.contentHash,
                  error: null
                })
              })

              return yield* HttpServerResponse.schemaJson(BatchIngestResponse)({
                results: batchResults,
                summary: {
                  total: results.length,
                  success: successCount,
                  duplicate: duplicateCount,
                  error: errorCount
                }
              })
            })
        })
      )
    })
  ),
  // GET /v1/ontologies/:ontologyId/links - List ingested links
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/links",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId

      if (!ontologyId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId is required"
        }, { status: 400 })
      }

      const queryParams = yield* HttpServerRequest.schemaSearchParams(ListLinksQueryParams).pipe(
        Effect.catchAll(() =>
          Effect.succeed({
            status: undefined,
            sourceType: undefined,
            organization: undefined,
            limit: undefined,
            offset: undefined
          } as Schema.Schema.Type<typeof ListLinksQueryParams>)
        )
      )

      const ingestion = yield* LinkIngestionService
      const limit = queryParams.limit ?? 20
      const offset = queryParams.offset ?? 0

      const links = yield* ingestion.list({
        ontologyId,
        status: queryParams.status,
        sourceType: queryParams.sourceType,
        organization: queryParams.organization,
        limit: limit + 1,
        offset
      })

      const hasMore = links.length > limit
      const linkResults = hasMore ? links.slice(0, limit) : links

      const summaries: Array<typeof LinkSummary.Type> = linkResults.map((link) =>
        new LinkSummary({
          id: link.id,
          contentHash: link.contentHash,
          sourceUri: link.sourceUri,
          sourceType: link.sourceType,
          headline: link.headline,
          organization: link.organization,
          status: link.status,
          wordCount: link.wordCount,
          fetchedAt: link.fetchedAt ? DateTime.unsafeFromDate(link.fetchedAt) : null,
          enrichedAt: link.enrichedAt ? DateTime.unsafeFromDate(link.enrichedAt) : null
        })
      )

      // Count total (simplified - would need a count query for efficiency)
      const total = links.length + offset

      return yield* HttpServerResponse.schemaJson(ListLinksResponse)({
        links: summaries,
        total,
        limit,
        offset,
        hasMore
      })
    })
  ),
  // GET /v1/ontologies/:ontologyId/links/:id - Get link details (ontology-scoped)
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/links/:id",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId
      const id = params.id

      if (!ontologyId || !id) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "Ontology ID and Link ID are required"
        }, { status: 400 })
      }

      // Validate ontology exists in registry
      const entryOpt = yield* OntologyService.getRegistryEntry(ontologyId)
      if (Option.isNone(entryOpt)) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Ontology "${ontologyId}" not found in registry`
        }, { status: 404 })
      }

      const ingestion = yield* LinkIngestionService
      const linkOpt = yield* ingestion.getById(id)

      if (Option.isNone(linkOpt)) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link "${id}" not found`
        }, { status: 404 })
      }

      const link = linkOpt.value

      // Validate link belongs to the specified ontology
      if (link.ontologyId !== ontologyId) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link "${id}" not found in ontology "${ontologyId}"`
        }, { status: 404 })
      }

      return yield* HttpServerResponse.schemaJson(LinkDetail)({
        id: link.id,
        contentHash: link.contentHash,
        sourceUri: link.sourceUri,
        sourceType: link.sourceType,
        headline: link.headline,
        description: link.description,
        author: link.author,
        organization: link.organization,
        language: link.language,
        topics: (link.topics as Array<string>) ?? [],
        keyEntities: (link.keyEntities as Array<string>) ?? [],
        storageUri: link.storageUri,
        status: link.status,
        wordCount: link.wordCount,
        publishedAt: link.publishedAt ? DateTime.unsafeFromDate(link.publishedAt) : null,
        fetchedAt: link.fetchedAt ? DateTime.unsafeFromDate(link.fetchedAt) : null,
        enrichedAt: link.enrichedAt ? DateTime.unsafeFromDate(link.enrichedAt) : null,
        processedAt: link.processedAt ? DateTime.unsafeFromDate(link.processedAt) : null,
        errorMessage: link.errorMessage
      })
    })
  ),
  // GET /v1/links/:id - Get link details (deprecated: use ontology-scoped endpoint)
  HttpRouter.get(
    "/v1/links/:id",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const id = params.id

      if (!id) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "Link ID is required"
        }, { status: 400 })
      }

      yield* Effect.logWarning("Deprecated: Use /v1/ontologies/:ontologyId/links/:id instead of /v1/links/:id")

      const ingestion = yield* LinkIngestionService
      const linkOpt = yield* ingestion.getById(id)

      if (Option.isNone(linkOpt)) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link "${id}" not found`
        }, { status: 404 })
      }

      const link = linkOpt.value

      return yield* HttpServerResponse.schemaJson(LinkDetail)({
        id: link.id,
        contentHash: link.contentHash,
        sourceUri: link.sourceUri,
        sourceType: link.sourceType,
        headline: link.headline,
        description: link.description,
        author: link.author,
        organization: link.organization,
        language: link.language,
        topics: (link.topics as Array<string>) ?? [],
        keyEntities: (link.keyEntities as Array<string>) ?? [],
        storageUri: link.storageUri,
        status: link.status,
        wordCount: link.wordCount,
        publishedAt: link.publishedAt ? DateTime.unsafeFromDate(link.publishedAt) : null,
        fetchedAt: link.fetchedAt ? DateTime.unsafeFromDate(link.fetchedAt) : null,
        enrichedAt: link.enrichedAt ? DateTime.unsafeFromDate(link.enrichedAt) : null,
        processedAt: link.processedAt ? DateTime.unsafeFromDate(link.processedAt) : null,
        errorMessage: link.errorMessage
      })
    })
  ),
  // POST /v1/links/preview - Preview URL without storing
  HttpRouter.post(
    "/v1/links/preview",
    Effect.gen(function*() {
      return yield* HttpServerRequest.schemaBodyJson(PreviewRequest).pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            HttpServerResponse.json({
              error: "VALIDATION_ERROR",
              message: TreeFormatter.formatErrorSync(error as ParseError)
            }, { status: 400 }),
          onSuccess: (request) =>
            Effect.gen(function*() {
              const jina = yield* JinaReaderClient

              const response = yield* jina.fetchUrl(request.url).pipe(
                Effect.mapError((error) => ({
                  error: "FETCH_ERROR" as const,
                  message: error.message
                }))
              )

              const { content } = response

              return yield* HttpServerResponse.json({
                url: request.url,
                title: content.title,
                siteName: content.siteName,
                description: content.description,
                publishedDate: content.publishedDate,
                wordCount: content.wordCount,
                contentPreview: content.content.slice(0, 500) +
                  (content.content.length > 500 ? "..." : "")
              })
            }).pipe(
              Effect.catchAll((error) => HttpServerResponse.json(error, { status: 502 }))
            )
        })
      )
    })
  ),
  // POST /v1/ontologies/:ontologyId/batches/from-links - Create batch from ingested links
  HttpRouter.post(
    "/v1/ontologies/:ontologyId/batches/from-links",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const ontologyId = params.ontologyId

      if (!ontologyId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId is required"
        }, { status: 400 })
      }

      // Validate ontology exists in registry
      const entryOpt = yield* OntologyService.getRegistryEntry(ontologyId)
      if (Option.isNone(entryOpt)) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Ontology "${ontologyId}" not found in registry`
        }, { status: 404 })
      }
      const ontologyEntry = entryOpt.value

      return yield* HttpServerRequest.schemaBodyJson(CreateBatchFromLinksBody).pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            HttpServerResponse.json({
              error: "VALIDATION_ERROR",
              message: TreeFormatter.formatErrorSync(error as ParseError)
            }, { status: 400 }),
          onSuccess: (request) =>
            Effect.gen(function*() {
              const config = yield* ConfigService
              const storage = yield* StorageService
              const ingestion = yield* LinkIngestionService
              const orchestrator = yield* WorkflowOrchestrator
              const ontologyService = yield* OntologyService
              const now = yield* DateTime.now

              // Fetch all requested links
              const links = yield* ingestion.getByIds(request.linkIds)

              if (links.length === 0) {
                return yield* HttpServerResponse.json({
                  error: "VALIDATION_ERROR",
                  message: "No valid link IDs provided"
                }, { status: 400 })
              }

              // Verify all links belong to this ontology
              const invalidLinks = links.filter((l) => l.ontologyId !== ontologyId)
              if (invalidLinks.length > 0) {
                return yield* HttpServerResponse.json({
                  error: "VALIDATION_ERROR",
                  message: `Links do not belong to ontology "${ontologyId}": ${
                    invalidLinks.map((l) => l.id).join(", ")
                  }`
                }, { status: 400 })
              }

              // Resolve bucket for GCS URIs
              const bucket = Option.getOrElse(config.storage.bucket, () => "local-bucket")

              // Generate batch ID
              const batchId = `batch-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}` as BatchId

              // Determine target namespace (use simple ontologyId, not full IRI)
              // The registry targetNamespace is a full IRI but the schema expects a simple namespace
              const targetNamespace = (request.targetNamespace ?? ontologyId) as Namespace

              // Resolve ontology URI - storage path needs bucket prefix
              const ontologyUri = resolveToGcsUri(ontologyEntry.storagePath, bucket)

              // Build documents from links
              // Use contentHash to generate DocumentId (not link.id which is UUID)
              const documents = links.map((link) => ({
                documentId: documentIdFromHash(link.contentHash),
                sourceUri: resolveToGcsUri(link.storageUri, bucket),
                contentType: "text/markdown" as const,
                sizeBytes: link.wordCount ? link.wordCount * 5 : 0 // Rough estimate
              }))

              // Resolve SHACL URI if provided
              const shaclUri = ontologyEntry.shapesPath
                ? resolveToGcsUri(ontologyEntry.shapesPath, bucket)
                : undefined

              // Generate proper OntologyVersion from registry entry
              const ontologyVersion = ontologyService.generateVersion(ontologyId, ontologyEntry.iri)

              // Create batch manifest
              const manifest: typeof BatchManifest.Type = {
                batchId,
                ontologyId,
                ontologyUri,
                ontologyVersion,
                shaclUri,
                targetNamespace,
                documents,
                createdAt: now
              }

              // Stage manifest to storage
              const encodeManifest = Schema.encode(BatchManifest)
              const encoded = yield* encodeManifest(manifest)
              const manifestJson = JSON.stringify(encoded)
              const manifestPath = PathLayout.batch.manifest(batchId)
              yield* storage.set(manifestPath, manifestJson)
              const manifestUri = toGcsUri(bucket, manifestPath)

              // Resolve embeddings URI if provided
              const embeddingsUri = ontologyEntry.embeddingsPath
                ? resolveToGcsUri(ontologyEntry.embeddingsPath, bucket)
                : undefined

              // Build workflow payload
              const documentIds = documents.map((d) => d.documentId)
              const payload: BatchWorkflowPayload = {
                batchId,
                ontologyId,
                manifestUri,
                ontologyVersion, // Use the already-computed version from line 575
                ontologyUri,
                targetNamespace,
                shaclUri,
                documentIds,
                ontologyEmbeddingsUri: embeddingsUri
              }

              // Start the workflow
              yield* orchestrator.start(payload)

              // Mark links as processing
              yield* Effect.forEach(
                links,
                (link) => ingestion.markProcessing(link.id),
                { concurrency: 10 }
              )

              yield* Effect.logInfo("Batch created from ingested links", {
                ontologyId,
                batchId,
                linkCount: links.length
              })

              // Return 202 Accepted
              return yield* HttpServerResponse.json({
                batchId,
                ontologyId,
                linkCount: links.length,
                documentCount: documents.length,
                wsEndpoint: `/v1/ontologies/${ontologyId}/events/stream`,
                statusEndpoint: `/v1/extract/batch/${batchId}/status`
              }, { status: 202 })
            }).pipe(
              Effect.catchAll((error) =>
                HttpServerResponse.json({
                  error: "BATCH_CREATION_ERROR",
                  message: String(error)
                }, { status: 500 })
              )
            )
        })
      )
    })
  ),
  // POST /v1/ontologies/:ontologyId/links/:linkId/re-enrich - Re-run enrichment on a pending/failed link
  HttpRouter.post(
    "/v1/ontologies/:ontologyId/links/:linkId/re-enrich",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { linkId, ontologyId } = params

      if (!ontologyId || !linkId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId and linkId are required"
        }, { status: 400 })
      }

      const ingestion = yield* LinkIngestionService

      // First verify the link exists and belongs to this ontology
      const existingLink = yield* ingestion.getById(linkId).pipe(
        Effect.map((opt) => Option.getOrNull(opt))
      )

      if (existingLink === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link "${linkId}" not found`
        }, { status: 404 })
      }

      if (existingLink.ontologyId !== ontologyId) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link "${linkId}" not found in ontology "${ontologyId}"`
        }, { status: 404 })
      }

      // Run re-enrichment
      const result = yield* ingestion.reEnrich(linkId).pipe(
        Effect.mapError((error) => ({
          error: "RE_ENRICH_ERROR" as const,
          message: error.message,
          phase: error.phase
        }))
      )

      if (Option.isNone(result)) {
        return yield* HttpServerResponse.json({
          error: "RE_ENRICH_ERROR",
          message: "Failed to re-enrich link"
        }, { status: 500 })
      }

      const link = result.value

      yield* Effect.logInfo("Link re-enriched successfully", {
        linkId,
        ontologyId,
        status: link.status,
        headline: link.headline
      })

      return yield* HttpServerResponse.json({
        id: link.id,
        status: link.status,
        headline: link.headline,
        topics: link.topics,
        keyEntities: link.keyEntities,
        enrichedAt: link.enrichedAt
      })
    }).pipe(
      Effect.catchAll((error) => {
        if (typeof error === "object" && error !== null && "error" in error) {
          return HttpServerResponse.json(error, { status: 500 })
        }
        return HttpServerResponse.json({
          error: "RE_ENRICH_ERROR",
          message: String(error)
        }, { status: 500 })
      })
    )
  )
)
