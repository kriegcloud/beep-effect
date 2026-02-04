/**
 * ImageFetcher Service
 *
 * Downloads images from URLs with timeout/retry handling,
 * computes content hashes, and validates content types.
 *
 * @since 2.0.0
 * @module Service/ImageFetcher
 */

import { FetchHttpClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Context, Duration, Effect, Layer, Schedule } from "effect"
import {
  type ImageError,
  ImageFetchError,
  ImageInvalidTypeError,
  ImageTimeoutError,
  ImageTooLargeError
} from "../Domain/Error/Image.js"
import type { ImageCandidate, ImageFetchResult } from "../Domain/Model/Image.js"
import { sha256Bytes } from "../Utils/Hash.js"

// =============================================================================
// Constants
// =============================================================================

/**
 * Default fetch timeout in milliseconds
 */
const DEFAULT_TIMEOUT_MS = 30_000

/**
 * Default maximum image size in bytes (10 MB)
 */
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Allowed image content types
 */
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/ico",
  "image/x-icon"
]

/**
 * Retry schedule for transient failures
 */
const RETRY_SCHEDULE = Schedule.exponential(Duration.millis(500)).pipe(
  Schedule.intersect(Schedule.recurs(3)),
  Schedule.whileInput<ImageError>((err) =>
    // Only retry on network/timeout errors, not validation errors
    err._tag === "ImageFetchError" || err._tag === "ImageTimeoutError"
  )
)

// =============================================================================
// Types
// =============================================================================

/**
 * Options for image fetching
 */
export interface ImageFetchOptions {
  /** Timeout in milliseconds (default: 30000) */
  readonly timeoutMs?: number
  /** Maximum image size in bytes (default: 10MB) */
  readonly maxSizeBytes?: number
  /** Custom allowed content types (default: common image types) */
  readonly allowedTypes?: ReadonlyArray<string>
  /** Enable retries for transient failures (default: true) */
  readonly retry?: boolean
}

// =============================================================================
// Service Interface
// =============================================================================

/**
 * ImageFetcher service interface
 *
 * Downloads images from URLs and prepares them for storage.
 *
 * @since 2.0.0
 * @category Service
 */
export interface ImageFetcherService {
  /**
   * Fetch a single image candidate
   *
   * Downloads the image, validates content type and size,
   * and computes the content hash.
   *
   * @param candidate - Image candidate to fetch
   * @param options - Fetch options
   * @returns Fetch result with bytes and hash
   */
  readonly fetch: (
    candidate: ImageCandidate,
    options?: ImageFetchOptions
  ) => Effect.Effect<ImageFetchResult, ImageError>

  /**
   * Fetch multiple image candidates in parallel
   *
   * Fetches all candidates concurrently with bounded parallelism.
   * Failed fetches are logged but don't fail the entire batch.
   *
   * @param candidates - Image candidates to fetch
   * @param options - Fetch options
   * @returns Array of successful fetch results
   */
  readonly fetchAll: (
    candidates: ReadonlyArray<ImageCandidate>,
    options?: ImageFetchOptions
  ) => Effect.Effect<ReadonlyArray<ImageFetchResult>>

  /**
   * Check if a URL is likely an image based on content-type probe
   *
   * @param url - URL to check
   * @returns true if the URL returns an image content type
   */
  readonly isImage: (url: string) => Effect.Effect<boolean>
}

// =============================================================================
// Implementation Helpers
// =============================================================================

/**
 * Normalize content type (handle variations like image/jpg vs image/jpeg)
 */
const normalizeContentType = (contentType: string | null | undefined): string => {
  if (!contentType) return "application/octet-stream"

  // Extract the base mime type (ignore charset etc.)
  const base = contentType.split(";")[0].trim().toLowerCase()

  // Normalize common variations
  if (base === "image/jpg") return "image/jpeg"

  return base
}

/**
 * Infer content type from URL if headers don't provide it
 */
const inferContentTypeFromUrl = (url: string): string | undefined => {
  const lowercaseUrl = url.toLowerCase()

  if (lowercaseUrl.includes(".jpg") || lowercaseUrl.includes(".jpeg")) {
    return "image/jpeg"
  }
  if (lowercaseUrl.includes(".png")) {
    return "image/png"
  }
  if (lowercaseUrl.includes(".gif")) {
    return "image/gif"
  }
  if (lowercaseUrl.includes(".webp")) {
    return "image/webp"
  }
  if (lowercaseUrl.includes(".svg")) {
    return "image/svg+xml"
  }
  if (lowercaseUrl.includes(".bmp")) {
    return "image/bmp"
  }
  if (lowercaseUrl.includes(".ico")) {
    return "image/x-icon"
  }

  return undefined
}

// =============================================================================
// Service Tag
// =============================================================================

/**
 * ImageFetcher service tag
 *
 * @since 2.0.0
 * @category Service
 */
export class ImageFetcher extends Context.Tag("@core-v2/ImageFetcher")<
  ImageFetcher,
  ImageFetcherService
>() {
  /**
   * Live implementation
   *
   * @since 2.0.0
   * @category Layers
   */
  static readonly Live = Layer.effect(
    ImageFetcher,
    Effect.gen(function*() {
      const httpClient = yield* HttpClient.HttpClient

      const fetch: ImageFetcherService["fetch"] = (candidate, options = {}) =>
        Effect.gen(function*() {
          const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
          const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES
          const allowedTypes = options.allowedTypes ?? ALLOWED_CONTENT_TYPES

          const request = HttpClientRequest.get(candidate.sourceUrl).pipe(
            HttpClientRequest.setHeaders({
              Accept: "image/*",
              "User-Agent": "EffectOntology/2.0 ImageFetcher"
            })
          )

          // Add referrer if available
          const requestWithReferrer = candidate.referrerUrl
            ? HttpClientRequest.setHeaders({
              Referer: candidate.referrerUrl,
              Accept: "image/*",
              "User-Agent": "EffectOntology/2.0 ImageFetcher"
            })(request)
            : request

          // Execute with timeout
          const response = yield* httpClient.execute(requestWithReferrer).pipe(
            Effect.timeout(Duration.millis(timeoutMs)),
            Effect.catchTag("TimeoutException", () =>
              Effect.fail(
                new ImageTimeoutError({
                  url: candidate.sourceUrl,
                  timeoutMs
                })
              )),
            Effect.mapError((error) => {
              if (error instanceof ImageTimeoutError) return error
              return new ImageFetchError({
                message: `Failed to fetch image: ${error}`,
                url: candidate.sourceUrl,
                cause: error
              })
            })
          )

          // Check HTTP status
          if (response.status >= 400) {
            return yield* Effect.fail(
              new ImageFetchError({
                message: `HTTP ${response.status} error`,
                url: candidate.sourceUrl,
                statusCode: response.status
              })
            )
          }

          // Get and validate content type
          const rawContentType = response.headers["content-type"]
          let contentType = normalizeContentType(rawContentType)

          // If content type is generic, try to infer from URL
          if (contentType === "application/octet-stream") {
            const inferred = inferContentTypeFromUrl(candidate.sourceUrl)
            if (inferred) {
              contentType = inferred
            }
          }

          if (!allowedTypes.includes(contentType)) {
            return yield* Effect.fail(
              new ImageInvalidTypeError({
                url: candidate.sourceUrl,
                contentType,
                allowedTypes: [...allowedTypes]
              })
            )
          }

          // Check content-length if available
          const contentLength = response.headers["content-length"]
          if (contentLength) {
            const size = parseInt(contentLength, 10)
            if (!isNaN(size) && size > maxSizeBytes) {
              return yield* Effect.fail(
                new ImageTooLargeError({
                  url: candidate.sourceUrl,
                  sizeBytes: size,
                  maxBytes: maxSizeBytes
                })
              )
            }
          }

          // Read response body
          const arrayBuffer = yield* response.arrayBuffer.pipe(
            Effect.mapError((error) =>
              new ImageFetchError({
                message: `Failed to read image body: ${error}`,
                url: candidate.sourceUrl,
                cause: error
              })
            )
          )

          const bytes = new Uint8Array(arrayBuffer)

          // Validate actual size
          if (bytes.length > maxSizeBytes) {
            return yield* Effect.fail(
              new ImageTooLargeError({
                url: candidate.sourceUrl,
                sizeBytes: bytes.length,
                maxBytes: maxSizeBytes
              })
            )
          }

          // Compute hash
          const hash = yield* sha256Bytes(bytes)

          return {
            bytes,
            hash,
            contentType,
            candidate
          } satisfies ImageFetchResult
        }).pipe(
          // Apply retry schedule if enabled
          options?.retry !== false
            ? Effect.retry(RETRY_SCHEDULE)
            : (x) => x
        )

      const fetchAll: ImageFetcherService["fetchAll"] = (candidates, options = {}) =>
        Effect.gen(function*() {
          const results: Array<ImageFetchResult> = []

          // Fetch with bounded parallelism (5 concurrent)
          yield* Effect.forEach(
            candidates,
            (candidate) =>
              fetch(candidate, options).pipe(
                Effect.tap((result) => Effect.sync(() => results.push(result))),
                Effect.catchAll((error) =>
                  Effect.logWarning(`Failed to fetch image: ${error.message}`).pipe(
                    Effect.as(undefined)
                  )
                )
              ),
            { concurrency: 5 }
          )

          return results
        })

      const isImage: ImageFetcherService["isImage"] = (url) =>
        Effect.gen(function*() {
          const request = HttpClientRequest.head(url).pipe(
            HttpClientRequest.setHeaders({
              Accept: "image/*",
              "User-Agent": "EffectOntology/2.0 ImageFetcher"
            })
          )

          const response = yield* httpClient.execute(request).pipe(
            Effect.timeout(Duration.millis(5000)),
            Effect.option
          )

          if (response._tag === "None") return false

          const contentType = normalizeContentType(response.value.headers["content-type"])
          return ALLOWED_CONTENT_TYPES.includes(contentType)
        }).pipe(
          Effect.catchAll(() => Effect.succeed(false))
        )

      return {
        fetch,
        fetchAll,
        isImage
      }
    })
  )

  /**
   * Default layer with HttpClient
   *
   * @since 2.0.0
   * @category Layers
   */
  static readonly Default = ImageFetcher.Live.pipe(
    Layer.provide(FetchHttpClient.layer)
  )
}
