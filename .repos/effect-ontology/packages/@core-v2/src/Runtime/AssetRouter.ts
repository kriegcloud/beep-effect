/**
 * Router: Asset Download API
 *
 * HTTP endpoints for downloading raw assets: documents, RDF graphs,
 * validation reports, and link content.
 *
 * @since 2.0.0
 * @module Runtime/AssetRouter
 */

import { HttpRouter, HttpServerResponse } from "@effect/platform"
import { Effect, Option, Schema } from "effect"
import { BatchId, type DocumentId } from "../Domain/Identity.js"
import { PathLayout } from "../Domain/PathLayout.js"
import { LinkIngestionService } from "../Service/LinkIngestionService.js"
import { StorageService } from "../Service/Storage.js"

// =============================================================================
// Asset Router
// =============================================================================

export const AssetRouter = HttpRouter.empty.pipe(
  // GET /v1/ontologies/:ontologyId/documents/:docId/content
  // Download raw document content
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/documents/:docId/content",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { docId, ontologyId } = params

      if (!ontologyId || !docId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId and docId are required"
        }, { status: 400 })
      }

      const storage = yield* StorageService
      const path = PathLayout.document.input(docId as DocumentId)

      const content = yield* storage.get(path).pipe(
        Effect.map((optContent) => Option.getOrNull(optContent)),
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            yield* Effect.logWarning("Storage error fetching document content", {
              path,
              docId,
              error: String(error)
            })
            return null
          })
        )
      )

      if (content === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Document ${docId} content not found`
        }, { status: 404 })
      }

      return yield* HttpServerResponse.text(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=86400" // 24 hours
        }
      })
    })
  ),
  // GET /v1/ontologies/:ontologyId/documents/:docId/graph.ttl
  // Download RDF graph in Turtle format
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/documents/:docId/graph.ttl",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { docId, ontologyId } = params

      if (!ontologyId || !docId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId and docId are required"
        }, { status: 400 })
      }

      const storage = yield* StorageService
      const path = PathLayout.document.graph(docId as DocumentId)

      const content = yield* storage.get(path).pipe(
        Effect.map((optContent) => Option.getOrNull(optContent)),
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            yield* Effect.logWarning("Storage error fetching document graph", {
              path,
              docId,
              error: String(error)
            })
            return null
          })
        )
      )

      if (content === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Document ${docId} graph not found`
        }, { status: 404 })
      }

      return yield* HttpServerResponse.text(content, {
        headers: {
          "Content-Type": "text/turtle; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable" // Immutable RDF
        }
      })
    })
  ),
  // GET /v1/ontologies/:ontologyId/links/:linkId/content
  // Download link content (from ingested URLs)
  HttpRouter.get(
    "/v1/ontologies/:ontologyId/links/:linkId/content",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { linkId, ontologyId } = params

      if (!ontologyId || !linkId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "ontologyId and linkId are required"
        }, { status: 400 })
      }

      const linkService = yield* LinkIngestionService
      const storage = yield* StorageService

      // Get the link to find the storage URI
      const link = yield* linkService.getById(linkId).pipe(
        Effect.map((optLink) => Option.getOrNull(optLink))
      )

      if (link === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link ${linkId} not found`
        }, { status: 404 })
      }

      // Verify ontology matches
      if (link.ontologyId !== ontologyId) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link ${linkId} not found in ontology ${ontologyId}`
        }, { status: 404 })
      }

      // Get the content from storage
      const content = yield* storage.get(link.storageUri).pipe(
        Effect.map((optContent) => Option.getOrNull(optContent)),
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            yield* Effect.logWarning("Storage error fetching link content", {
              storageUri: link.storageUri,
              linkId,
              error: String(error)
            })
            return null
          })
        )
      )

      if (content === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Link ${linkId} content not found in storage`
        }, { status: 404 })
      }

      return yield* HttpServerResponse.text(content, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable", // Content-addressed
          "ETag": `"${link.contentHash}"`
        }
      })
    })
  ),
  // GET /v1/batches/:batchId/validation/report
  // Download validation report as JSON
  HttpRouter.get(
    "/v1/batches/:batchId/validation/report",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { batchId: rawBatchId } = params

      if (!rawBatchId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "batchId is required"
        }, { status: 400 })
      }

      // Validate batchId format
      const validatedBatchId = yield* Schema.decode(BatchId)(rawBatchId).pipe(
        Effect.catchAll(() =>
          Effect.fail({
            isValidationError: true as const,
            error: "VALIDATION_ERROR",
            message: `Invalid batch ID format: ${rawBatchId}`
          })
        )
      )

      const storage = yield* StorageService
      const path = PathLayout.batch.validationReport(validatedBatchId)

      const content = yield* storage.get(path).pipe(
        Effect.map((optContent) => Option.getOrNull(optContent)),
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            yield* Effect.logWarning("Storage error fetching validation report", {
              path,
              batchId: rawBatchId,
              error: String(error)
            })
            return null
          })
        )
      )

      if (content === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Validation report for batch ${rawBatchId} not found`
        }, { status: 404 })
      }

      // Parse and return as JSON using Effect
      const report = yield* Effect.try({
        try: () => JSON.parse(content),
        catch: () => null
      })

      if (report === null) {
        return yield* HttpServerResponse.json({
          error: "PARSE_ERROR",
          message: `Failed to parse validation report for batch ${rawBatchId}`
        }, { status: 500 })
      }

      return yield* HttpServerResponse.json(report, {
        headers: {
          "Cache-Control": "public, max-age=86400" // 24 hours
        }
      })
    }).pipe(
      Effect.catchAll((error) => {
        if (typeof error === "object" && error !== null && "isValidationError" in error) {
          return HttpServerResponse.json({
            error: (error as { error: string }).error,
            message: (error as { message: string }).message
          }, { status: 400 })
        }
        return Effect.fail(error)
      })
    )
  ),
  // GET /v1/batches/:batchId/graph.ttl
  // Download final canonical graph for a batch
  HttpRouter.get(
    "/v1/batches/:batchId/graph.ttl",
    Effect.gen(function*() {
      const params = yield* HttpRouter.params
      const { batchId: rawBatchId } = params

      if (!rawBatchId) {
        return yield* HttpServerResponse.json({
          error: "VALIDATION_ERROR",
          message: "batchId is required"
        }, { status: 400 })
      }

      // Validate batchId format
      const validatedBatchId = yield* Schema.decode(BatchId)(rawBatchId).pipe(
        Effect.catchAll(() =>
          Effect.fail({
            isValidationError: true as const,
            error: "VALIDATION_ERROR",
            message: `Invalid batch ID format: ${rawBatchId}`
          })
        )
      )

      const storage = yield* StorageService
      const path = PathLayout.batch.canonical(validatedBatchId)

      const content = yield* storage.get(path).pipe(
        Effect.map((optContent) => Option.getOrNull(optContent)),
        Effect.catchAll((error) =>
          Effect.gen(function*() {
            yield* Effect.logWarning("Storage error fetching canonical graph", {
              path,
              batchId: rawBatchId,
              error: String(error)
            })
            return null
          })
        )
      )

      if (content === null) {
        return yield* HttpServerResponse.json({
          error: "NOT_FOUND",
          message: `Canonical graph for batch ${rawBatchId} not found`
        }, { status: 404 })
      }

      return yield* HttpServerResponse.text(content, {
        headers: {
          "Content-Type": "text/turtle; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      })
    }).pipe(
      Effect.catchAll((error) => {
        if (typeof error === "object" && error !== null && "isValidationError" in error) {
          return HttpServerResponse.json({
            error: (error as { error: string }).error,
            message: (error as { message: string }).message
          }, { status: 400 })
        }
        return Effect.fail(error)
      })
    )
  )
)
