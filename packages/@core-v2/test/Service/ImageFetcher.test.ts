/**
 * ImageFetcher Service Tests
 *
 * Tests for image downloading, hashing, and validation.
 * Note: These are integration tests that verify the service logic.
 * The actual HTTP fetching is tested via the unit tests for ImageExtractor.
 *
 * @module test/Service/ImageFetcher
 */

import { HttpClient, HttpClientError, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { ImageFetchError, ImageInvalidTypeError, ImageTooLargeError } from "../../src/Domain/Error/Image.js"
import type { ImageCandidate } from "../../src/Domain/Model/Image.js"
import { ImageFetcher } from "../../src/Service/ImageFetcher.js"
import { sha256Bytes } from "../../src/Utils/Hash.js"

// Sample PNG bytes (minimal valid PNG)
const TINY_PNG_BYTES = new Uint8Array([
  0x89,
  0x50,
  0x4e,
  0x47,
  0x0d,
  0x0a,
  0x1a,
  0x0a,
  0x00,
  0x00,
  0x00,
  0x0d,
  0x49,
  0x48,
  0x44,
  0x52,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x00,
  0x00,
  0x01,
  0x08,
  0x02,
  0x00,
  0x00,
  0x00,
  0x90,
  0x77,
  0x53,
  0xde,
  0x00,
  0x00,
  0x00,
  0x0c,
  0x49,
  0x44,
  0x41,
  0x54,
  0x08,
  0xd7,
  0x63,
  0xf8,
  0x00,
  0x00,
  0x00,
  0x01,
  0x00,
  0x01,
  0x00,
  0x05,
  0x1c,
  0x00,
  0x9b,
  0x00,
  0x00,
  0x00,
  0x00,
  0x49,
  0x45,
  0x4e,
  0x44,
  0xae,
  0x42,
  0x60,
  0x82
])

/**
 * Create a mock HttpClient layer for testing
 * Uses HttpClient.make to create a simple mock that returns predefined responses
 */
const createMockHttpClientLayer = (
  responses: Map<string, { status: number; headers: Record<string, string>; body: Uint8Array }>
) =>
  Layer.succeed(
    HttpClient.HttpClient,
    HttpClient.make((request, _url, _signal, _fiber) =>
      Effect.gen(function*() {
        const url = request.url
        const response = responses.get(url)

        if (!response) {
          return yield* Effect.fail(
            new HttpClientError.RequestError({
              request,
              reason: "Transport",
              cause: new Error(`No mock for URL: ${url}`)
            })
          )
        }

        // Create mock response using fromWeb
        return HttpClientResponse.fromWeb(
          request,
          new Response(response.body, {
            status: response.status,
            headers: new Headers(response.headers)
          })
        )
      })
    )
  )

// Sample candidate for testing
const createCandidate = (url: string): ImageCandidate => ({
  sourceUrl: url,
  role: "inline",
  order: 0,
  referrerUrl: "https://example.com/page"
})

describe("ImageFetcher", () => {
  describe("fetch", () => {
    it("fetches and hashes an image successfully", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidate = createCandidate("https://example.com/image.png")

        const result = yield* fetcher.fetch(candidate)

        expect(result.bytes).toEqual(TINY_PNG_BYTES)
        expect(result.contentType).toBe("image/png")
        expect(result.candidate).toBe(candidate)

        // Verify hash
        const expectedHash = yield* sha256Bytes(TINY_PNG_BYTES)
        expect(result.hash).toBe(expectedHash)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/image.png",
                    {
                      status: 200,
                      headers: { "content-type": "image/png" },
                      body: TINY_PNG_BYTES
                    }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("infers content type from URL when headers are generic", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidate = createCandidate("https://cdn.example.com/photo.jpeg")

        const result = yield* fetcher.fetch(candidate)

        expect(result.contentType).toBe("image/jpeg")
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://cdn.example.com/photo.jpeg",
                    {
                      status: 200,
                      headers: { "content-type": "application/octet-stream" },
                      body: TINY_PNG_BYTES
                    }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("rejects images with unsupported content types", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidate = createCandidate("https://example.com/doc.pdf")

        const result = yield* fetcher.fetch(candidate).pipe(Effect.either)

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(ImageInvalidTypeError)
        }
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/doc.pdf",
                    {
                      status: 200,
                      headers: { "content-type": "application/pdf" },
                      body: new Uint8Array([1, 2, 3])
                    }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("rejects images that exceed size limit", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidate = createCandidate("https://example.com/large.png")

        // Use small maxSize option
        const result = yield* fetcher
          .fetch(candidate, { maxSizeBytes: 10, retry: false })
          .pipe(Effect.either)

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(ImageTooLargeError)
        }
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/large.png",
                    {
                      status: 200,
                      headers: { "content-type": "image/png" },
                      body: TINY_PNG_BYTES // 68 bytes, exceeds 10 byte limit
                    }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("handles HTTP errors", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidate = createCandidate("https://example.com/missing.png")

        const result = yield* fetcher
          .fetch(candidate, { retry: false })
          .pipe(Effect.either)

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(ImageFetchError)
          expect((result.left as ImageFetchError).statusCode).toBe(404)
        }
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/missing.png",
                    {
                      status: 404,
                      headers: { "content-type": "text/plain" },
                      body: new Uint8Array()
                    }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))
  })

  describe("fetchAll", () => {
    it("fetches multiple images in parallel", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidates = [
          createCandidate("https://example.com/1.png"),
          createCandidate("https://example.com/2.png"),
          createCandidate("https://example.com/3.png")
        ]

        const results = yield* fetcher.fetchAll(candidates)

        expect(results.length).toBe(3)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/1.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: TINY_PNG_BYTES }
                  ],
                  [
                    "https://example.com/2.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: TINY_PNG_BYTES }
                  ],
                  [
                    "https://example.com/3.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: TINY_PNG_BYTES }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("continues on individual fetch failures", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const candidates = [
          createCandidate("https://example.com/good.png"),
          createCandidate("https://example.com/bad.png"), // Will fail
          createCandidate("https://example.com/also-good.png")
        ]

        const results = yield* fetcher.fetchAll(candidates, { retry: false })

        // Only 2 should succeed (bad.png returns 404)
        expect(results.length).toBe(2)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/good.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: TINY_PNG_BYTES }
                  ],
                  [
                    "https://example.com/bad.png",
                    { status: 404, headers: { "content-type": "text/plain" }, body: new Uint8Array() }
                  ],
                  [
                    "https://example.com/also-good.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: TINY_PNG_BYTES }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))
  })

  describe("isImage", () => {
    it("returns true for image URLs", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const result = yield* fetcher.isImage("https://example.com/image.png")

        expect(result).toBe(true)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/image.png",
                    { status: 200, headers: { "content-type": "image/png" }, body: new Uint8Array() }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("returns false for non-image URLs", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        const result = yield* fetcher.isImage("https://example.com/doc.pdf")

        expect(result).toBe(false)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(
              createMockHttpClientLayer(
                new Map([
                  [
                    "https://example.com/doc.pdf",
                    { status: 200, headers: { "content-type": "application/pdf" }, body: new Uint8Array() }
                  ]
                ])
              )
            )
          )
        ),
        Effect.runPromise
      ))

    it("returns false on network errors", () =>
      Effect.gen(function*() {
        const fetcher = yield* ImageFetcher

        // No mock for this URL, will fail
        const result = yield* fetcher.isImage("https://nonexistent.example.com/image.png")

        expect(result).toBe(false)
      }).pipe(
        Effect.provide(
          ImageFetcher.Live.pipe(
            Layer.provide(createMockHttpClientLayer(new Map()))
          )
        ),
        Effect.runPromise
      ))
  })
})
