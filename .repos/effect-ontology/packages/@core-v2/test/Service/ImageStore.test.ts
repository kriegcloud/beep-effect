/**
 * ImageStore and ImageBlobStore Tests
 *
 * Tests for image storage, deduplication, and manifest management.
 *
 * @module test/Service/ImageStore
 */

import { BunContext } from "@effect/platform-bun"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import type { ImageRef } from "../../src/Domain/Model/Image.js"
import { PathLayout } from "../../src/Domain/PathLayout.js"
import { ConfigService, DEFAULT_CONFIG } from "../../src/Service/Config.js"
import { ImageBlobStore } from "../../src/Service/ImageBlobStore.js"
import { ImageStore } from "../../src/Service/ImageStore.js"
import { StorageService, StorageServiceLive, StorageServiceTest } from "../../src/Service/Storage.js"

// Test layer with memory storage
const TestStorageLayer = StorageServiceTest

// ImageBlobStore test layer
const ImageBlobStoreTestLayer = ImageBlobStore.Live.pipe(
  Layer.provide(TestStorageLayer)
)

// ImageStore test layer
const ImageStoreTestLayer = ImageStore.Live.pipe(
  Layer.provide(ImageBlobStore.Live),
  Layer.provide(TestStorageLayer)
)

// Sample test data
const testImageBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]) // PNG magic bytes
const testHash = "abc123def456"
const testContentType = "image/png"
const testSourceUrl = "https://example.com/test.png"

describe("PathLayout.image", () => {
  it("generates correct original path", () => {
    const path = PathLayout.image.original("abc123")
    expect(path).toBe("assets/images/abc123/original")
  })

  it("generates correct metadata path", () => {
    const path = PathLayout.image.metadata("abc123")
    expect(path).toBe("assets/images/abc123/metadata.json")
  })

  it("generates correct variant path", () => {
    const path = PathLayout.image.variant("abc123", "thumb")
    expect(path).toBe("assets/images/abc123/variants/thumb.jpg")
  })

  it("generates correct manifest path", () => {
    const path = PathLayout.image.manifest("link", "link-456")
    expect(path).toBe("assets/owners/link/link-456/images/manifest.json")
  })
})

describe("ImageBlobStore", () => {
  it("stores and retrieves bytes", () =>
    Effect.gen(function*() {
      const store = yield* ImageBlobStore

      // Store bytes
      yield* store.putBytes(testHash, testImageBytes)

      // Retrieve bytes
      const result = yield* store.getBytes(testHash)
      expect(Option.isSome(result)).toBe(true)
      if (Option.isSome(result)) {
        expect(result.value).toEqual(testImageBytes)
      }
    }).pipe(
      Effect.provide(ImageBlobStoreTestLayer),
      Effect.runPromise
    ))

  it("returns None for non-existent bytes", () =>
    Effect.gen(function*() {
      const store = yield* ImageBlobStore
      const result = yield* store.getBytes("nonexistent")
      expect(Option.isNone(result)).toBe(true)
    }).pipe(
      Effect.provide(ImageBlobStoreTestLayer),
      Effect.runPromise
    ))

  it("stores and retrieves metadata", () =>
    Effect.gen(function*() {
      const store = yield* ImageBlobStore

      // Store bytes with metadata
      const asset = yield* store.putBytesWithMetadata(testHash, testImageBytes, testContentType, testSourceUrl)

      expect(asset.hash).toBe(testHash)
      expect(asset.contentType).toBe(testContentType)
      expect(asset.sizeBytes).toBe(testImageBytes.length)
      expect(asset.sourceUrl).toBe(testSourceUrl)

      // Retrieve metadata
      const retrieved = yield* store.getMetadata(testHash)
      expect(Option.isSome(retrieved)).toBe(true)
      if (Option.isSome(retrieved)) {
        expect(retrieved.value.hash).toBe(testHash)
        expect(retrieved.value.contentType).toBe(testContentType)
      }
    }).pipe(
      Effect.provide(ImageBlobStoreTestLayer),
      Effect.runPromise
    ))

  it("hasBytes returns correct boolean", () =>
    Effect.gen(function*() {
      const store = yield* ImageBlobStore

      // Initially doesn't exist
      const beforeStore = yield* store.hasBytes(testHash)
      expect(beforeStore).toBe(false)

      // Store it
      yield* store.putBytes(testHash, testImageBytes)

      // Now exists
      const afterStore = yield* store.hasBytes(testHash)
      expect(afterStore).toBe(true)
    }).pipe(
      Effect.provide(ImageBlobStoreTestLayer),
      Effect.runPromise
    ))

  it("deletes bytes and metadata", () =>
    Effect.gen(function*() {
      const store = yield* ImageBlobStore

      // Store and verify
      yield* store.putBytesWithMetadata(testHash, testImageBytes, testContentType)
      expect(Option.isSome(yield* store.getBytes(testHash))).toBe(true)
      expect(Option.isSome(yield* store.getMetadata(testHash))).toBe(true)

      // Delete
      yield* store.delete(testHash)

      // Verify deleted
      expect(Option.isNone(yield* store.getBytes(testHash))).toBe(true)
      expect(Option.isNone(yield* store.getMetadata(testHash))).toBe(true)
    }).pipe(
      Effect.provide(ImageBlobStoreTestLayer),
      Effect.runPromise
    ))
})

describe("ImageStore", () => {
  it("stores image with deduplication", () =>
    Effect.gen(function*() {
      const store = yield* ImageStore

      // Store first time
      const asset1 = yield* store.storeImage(testHash, testImageBytes, testContentType, testSourceUrl)
      expect(asset1.hash).toBe(testHash)

      // Store again (should deduplicate)
      const asset2 = yield* store.storeImage(testHash, testImageBytes, testContentType, testSourceUrl)
      expect(asset2.hash).toBe(testHash)
      expect(asset2.sourceUrl).toBe(testSourceUrl) // Should return existing asset
    }).pipe(
      Effect.provide(ImageStoreTestLayer),
      Effect.runPromise
    ))

  it("manages owner manifests", () =>
    Effect.gen(function*() {
      const store = yield* ImageStore

      const ownerType = "link" as const
      const ownerId = "link-123"

      // Initially no images
      const initialImages = yield* store.listByOwner(ownerType, ownerId)
      expect(initialImages.length).toBe(0)

      // Add image reference
      const ref: ImageRef = {
        ownerType,
        ownerId,
        assetHash: testHash,
        alt: "Test image",
        position: 0
      }
      yield* store.addImageRef(ref)

      // List images
      const images = yield* store.listByOwner(ownerType, ownerId)
      expect(images.length).toBe(1)
      expect(images[0].assetHash).toBe(testHash)
      expect(images[0].alt).toBe("Test image")

      // Count
      const count = yield* store.countByOwner(ownerType, ownerId)
      expect(count).toBe(1)
    }).pipe(
      Effect.provide(ImageStoreTestLayer),
      Effect.runPromise
    ))

  it("removes image references from manifest", () =>
    Effect.gen(function*() {
      const store = yield* ImageStore

      const ownerType = "document" as const
      const ownerId = "doc-456"

      // Add two images
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: "hash1",
        position: 0
      })
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: "hash2",
        position: 1
      })

      expect((yield* store.listByOwner(ownerType, ownerId)).length).toBe(2)

      // Remove one
      yield* store.removeImageRef(ownerType, ownerId, "hash1")

      const remaining = yield* store.listByOwner(ownerType, ownerId)
      expect(remaining.length).toBe(1)
      expect(remaining[0].assetHash).toBe("hash2")
    }).pipe(
      Effect.provide(ImageStoreTestLayer),
      Effect.runPromise
    ))

  it("maintains image order by position", () =>
    Effect.gen(function*() {
      const store = yield* ImageStore

      const ownerType = "link" as const
      const ownerId = "link-order-test"

      // Add in non-sequential order
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: "hash3",
        position: 2
      })
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: "hash1",
        position: 0
      })
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: "hash2",
        position: 1
      })

      const images = yield* store.listByOwner(ownerType, ownerId)
      expect(images.map((i) => i.position)).toEqual([0, 1, 2])
      expect(images.map((i) => i.assetHash)).toEqual(["hash1", "hash2", "hash3"])
    }).pipe(
      Effect.provide(ImageStoreTestLayer),
      Effect.runPromise
    ))

  it("retrieves full manifest with metadata", () =>
    Effect.gen(function*() {
      const store = yield* ImageStore

      const ownerType = "link" as const
      const ownerId = "link-manifest-test"

      // Initially no manifest
      const noManifest = yield* store.getManifest(ownerType, ownerId)
      expect(Option.isNone(noManifest)).toBe(true)

      // Add an image
      yield* store.addImageRef({
        ownerType,
        ownerId,
        assetHash: testHash,
        position: 0,
        context: "surrounding text"
      })

      // Get manifest
      const manifest = yield* store.getManifest(ownerType, ownerId)
      expect(Option.isSome(manifest)).toBe(true)
      if (Option.isSome(manifest)) {
        expect(manifest.value.ownerType).toBe(ownerType)
        expect(manifest.value.ownerId).toBe(ownerId)
        expect(manifest.value.totalCount).toBe(1)
        expect(manifest.value.images[0].context).toBe("surrounding text")
      }
    }).pipe(
      Effect.provide(ImageStoreTestLayer),
      Effect.runPromise
    ))
})
