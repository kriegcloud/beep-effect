/**
 * ApiClient Service
 *
 * Effect.Service wrapping HttpClient for typed API requests.
 * Uses Effect patterns - no fetch, no await inside atoms.
 *
 * @since 2.0.0
 * @module services/ApiClient
 */

import { Schema as DomainSchema } from "@effect-ontology/core-v2/Domain"
import { FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Context, Effect, Layer, Schema } from "effect"

// Re-export schema types for convenience
const {
  ArticleDetailResponse,
  ArticleSearchResponse,
  IngestLinkRequest,
  IngestLinkResponse,
  LinkDetail,
  ListLinksResponse,
  OntologyDetailResponse,
  OntologyListResponse,
  OntologySummary,
  TimelineClaimsResponse,
  TimelineEntityResponse
} = DomainSchema

// =============================================================================
// Error Types
// =============================================================================

export class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
  status: Schema.Number,
  message: Schema.String
}) {}

// =============================================================================
// ApiClient Service
// =============================================================================

// =============================================================================
// Filter Types
// =============================================================================

export interface LinksFilter {
  status?: string
  sourceType?: string
  limit?: number
  offset?: number
}

export interface TimelineFilter {
  subject?: string
  predicate?: string
  asOf?: string
  source?: string
  rank?: string
  limit?: number
  offset?: number
}

export interface DocumentsFilter {
  sources?: Array<string>
  query?: string
  limit?: number
  offset?: number
}

// =============================================================================
// ApiClient Service
// =============================================================================

/** ApiClient service interface */
export interface ApiClientService {
  // Links
  readonly listLinks: (
    ontologyId: string,
    filters: LinksFilter
  ) => Effect.Effect<typeof ListLinksResponse.Type, ApiError>

  readonly getLink: (ontologyId: string, id: string) => Effect.Effect<typeof LinkDetail.Type, ApiError>

  readonly ingestLink: (body: typeof IngestLinkRequest.Type) => Effect.Effect<typeof IngestLinkResponse.Type, ApiError>

  readonly previewLink: (url: string) => Effect.Effect<unknown, ApiError>

  // Ontologies
  readonly listOntologies: () => Effect.Effect<ReadonlyArray<typeof OntologySummary.Type>, ApiError>

  readonly getOntology: (id: string) => Effect.Effect<typeof OntologyDetailResponse.Type, ApiError>

  // Timeline
  readonly getTimelineClaims: (
    ontologyId: string,
    filters: TimelineFilter
  ) => Effect.Effect<typeof TimelineClaimsResponse.Type, ApiError>

  readonly getEntity: (
    ontologyId: string,
    iri: string,
    params?: { asOf?: string; includeDeprecated?: boolean }
  ) => Effect.Effect<typeof TimelineEntityResponse.Type, ApiError>

  // Documents
  readonly searchDocuments: (
    ontologyId: string,
    filters: DocumentsFilter
  ) => Effect.Effect<typeof ArticleSearchResponse.Type, ApiError>

  readonly getDocument: (
    ontologyId: string,
    id: string
  ) => Effect.Effect<typeof ArticleDetailResponse.Type, ApiError>

  // Health
  readonly healthCheck: () => Effect.Effect<{ status: string }, ApiError>
}

/** ApiClient service tag */
export class ApiClient extends Context.Tag("ApiClient")<ApiClient, ApiClientService>() {}

/** ApiClient implementation layer */
export const ApiClientLive = Layer.effect(
  ApiClient,
  Effect.gen(function*() {
    const client = yield* HttpClient.HttpClient

    // Extract error message from response body
    const extractErrorMessage = (body: string, status: number): string => {
      try {
        const json = JSON.parse(body)
        return json.message || json.error || `HTTP ${status}`
      } catch {
        return body || `HTTP ${status}`
      }
    }

    // Preserve ApiError if already created, otherwise wrap
    const wrapError = (e: unknown): ApiError => {
      if (e instanceof ApiError) return e
      return new ApiError({
        status: 0, // Network/parse error
        message: e instanceof Error ? e.message : String(e)
      })
    }

    // Helper for typed requests with schema validation
    const request = <A, I, R>(
      req: HttpClientRequest.HttpClientRequest,
      schema: Schema.Schema<A, I, R>
    ): Effect.Effect<A, ApiError, R> =>
      client.execute(req).pipe(
        Effect.flatMap((response) => {
          const status = response.status
          if (status >= 400) {
            return response.text.pipe(
              Effect.flatMap((body) =>
                Effect.fail(
                  new ApiError({
                    status,
                    message: extractErrorMessage(body, status)
                  })
                )
              )
            )
          }
          return HttpClientResponse.schemaBodyJson(schema)(response).pipe(
            Effect.mapError((parseError) =>
              new ApiError({
                status: 422,
                message: `Parse error: ${parseError.message}`
              })
            )
          )
        }),
        Effect.mapError(wrapError),
        Effect.scoped
      )

    // Helper for requests without body parsing (returns unknown JSON)
    const requestUnknown = (req: HttpClientRequest.HttpClientRequest): Effect.Effect<unknown, ApiError> =>
      client.execute(req).pipe(
        Effect.flatMap((response) => {
          const status = response.status
          if (status >= 400) {
            return response.text.pipe(
              Effect.flatMap((body) =>
                Effect.fail(
                  new ApiError({
                    status,
                    message: extractErrorMessage(body, status)
                  })
                )
              )
            )
          }
          return response.json.pipe(
            Effect.mapError((parseError) =>
              new ApiError({
                status: 422,
                message: `JSON parse error: ${parseError.message}`
              })
            )
          )
        }),
        Effect.mapError(wrapError),
        Effect.scoped
      )

    return ApiClient.of({
      // List ingested links with filters (ontology-scoped)
      listLinks: (ontologyId, filters) => {
        const params = new URLSearchParams()
        if (filters.status) params.set("status", filters.status)
        if (filters.sourceType) params.set("sourceType", filters.sourceType)
        params.set("limit", String(filters.limit ?? 20))
        params.set("offset", String(filters.offset ?? 0))

        return request(
          HttpClientRequest.get(`/api/v1/ontologies/${ontologyId}/links?${params.toString()}`),
          ListLinksResponse
        )
      },

      // Get single link details (ontology-scoped)
      getLink: (ontologyId, id) =>
        request(HttpClientRequest.get(`/api/v1/ontologies/${ontologyId}/links/${id}`), LinkDetail),

      // Ingest a new link (ontologyId from path)
      ingestLink: (body) =>
        HttpClientRequest.post(`/api/v1/ontologies/${body.ontologyId}/links`).pipe(
          HttpClientRequest.bodyJson(body),
          Effect.flatMap((req) => request(req, IngestLinkResponse)),
          Effect.mapError(wrapError)
        ),

      // Preview a link without storing
      previewLink: (url) =>
        HttpClientRequest.post("/api/v1/links/preview").pipe(
          HttpClientRequest.bodyJson({ url }),
          Effect.flatMap(requestUnknown),
          Effect.mapError(wrapError)
        ),

      // Ontologies
      listOntologies: () =>
        request(
          HttpClientRequest.get("/api/v1/ontologies"),
          OntologyListResponse
        ).pipe(Effect.map((r) => r.ontologies)),

      getOntology: (id) =>
        request(
          HttpClientRequest.get(`/api/v1/ontologies/${id}`),
          OntologyDetailResponse
        ),

      // Timeline
      getTimelineClaims: (ontologyId, filters) => {
        const params = new URLSearchParams()
        if (filters.subject) params.set("subject", filters.subject)
        if (filters.predicate) params.set("predicate", filters.predicate)
        if (filters.asOf) params.set("asOf", filters.asOf)
        if (filters.source) params.set("source", filters.source)
        if (filters.rank) params.set("rank", filters.rank)
        params.set("limit", String(filters.limit ?? 50))
        params.set("offset", String(filters.offset ?? 0))

        return request(
          HttpClientRequest.get(`/api/v1/ontologies/${ontologyId}/claims?${params.toString()}`),
          TimelineClaimsResponse
        )
      },

      getEntity: (ontologyId, iri, params) => {
        const searchParams = new URLSearchParams()
        if (params?.asOf) searchParams.set("asOf", params.asOf)
        if (params?.includeDeprecated) searchParams.set("includeDeprecated", "true")
        const query = searchParams.toString()

        return request(
          HttpClientRequest.get(
            `/api/v1/ontologies/${ontologyId}/timeline/entities/${encodeURIComponent(iri)}${query ? `?${query}` : ""}`
          ),
          TimelineEntityResponse
        )
      },

      // Documents
      searchDocuments: (ontologyId, filters) => {
        const body = {
          sources: filters.sources,
          query: filters.query,
          limit: filters.limit ?? 20,
          offset: filters.offset ?? 0
        }
        return HttpClientRequest.post(`/api/v1/ontologies/${ontologyId}/documents`).pipe(
          HttpClientRequest.bodyJson(body),
          Effect.flatMap((r) => request(r, ArticleSearchResponse)),
          Effect.mapError(wrapError)
        )
      },

      getDocument: (ontologyId, id) =>
        request(
          HttpClientRequest.get(`/api/v1/ontologies/${ontologyId}/documents/${id}`),
          ArticleDetailResponse
        ),

      // Health check
      healthCheck: () =>
        request(
          HttpClientRequest.get("/api/health/ready"),
          Schema.Struct({ status: Schema.String })
        )
    })
  })
).pipe(Layer.provide(FetchHttpClient.layer))

/** Full API layer */
export const ApiLayer = ApiClientLive
