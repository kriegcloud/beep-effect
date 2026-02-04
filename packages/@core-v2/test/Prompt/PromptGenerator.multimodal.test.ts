/**
 * PromptGenerator Multimodal Tests
 *
 * Tests for image-aware prompt generation with @effect/ai FilePart.
 *
 * @module test/Prompt/PromptGenerator.multimodal
 */

import { Effect, Layer, Option } from "effect"
import { describe, expect, it } from "vitest"
import type { ImageForPrompt, ImageRef } from "../../src/Domain/Model/Image.js"
import { ClassDefinition } from "../../src/Domain/Model/Ontology.js"
import {
  buildMultimodalPrompt,
  buildMultimodalUserContent,
  buildPromptFromStructured,
  generateStructuredEntityPrompt,
  imagesToPromptParts
} from "../../src/Prompt/PromptGenerator.js"
import { ImageBlobStore } from "../../src/Service/ImageBlobStore.js"
import { ImagePromptAdapter } from "../../src/Service/ImagePromptAdapter.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"
import { iri } from "../Utils/iri.js"

// Sample test image data (tiny 1x1 PNG)
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
const TINY_PNG_BYTES = Uint8Array.from(atob(TINY_PNG_BASE64), (c) => c.charCodeAt(0))

// Test layers
const ImageBlobStoreTestLayer = ImageBlobStore.Live.pipe(
  Layer.provide(StorageServiceTest)
)

const ImagePromptAdapterTestLayer = ImagePromptAdapter.Live.pipe(
  Layer.provide(ImageBlobStore.Live),
  Layer.provide(StorageServiceTest)
)

// Sample image for testing
const sampleImage: ImageForPrompt = {
  base64: TINY_PNG_BASE64,
  mediaType: "image/png",
  alt: "Test image",
  caption: "A test caption",
  context: "Surrounding text context",
  position: 0,
  assetHash: "test-hash-123"
}

describe("imagesToPromptParts", () => {
  it("converts images to FileParts", () => {
    const parts = imagesToPromptParts([sampleImage])

    expect(parts.length).toBe(1)
    expect(parts[0].type).toBe("file")
    expect((parts[0] as { mediaType: string }).mediaType).toBe("image/png")
  })

  it("uses position in filename", () => {
    const images: Array<ImageForPrompt> = [
      { ...sampleImage, position: 0 },
      { ...sampleImage, position: 1 },
      { ...sampleImage, position: 2 }
    ]

    const parts = imagesToPromptParts(images)

    expect(parts.length).toBe(3)
    // Check filenames include position
    expect((parts[0] as { fileName: string }).fileName).toBe("image-0.png")
    expect((parts[1] as { fileName: string }).fileName).toBe("image-1.png")
    expect((parts[2] as { fileName: string }).fileName).toBe("image-2.png")
  })

  it("handles different media types", () => {
    const jpegImage: ImageForPrompt = { ...sampleImage, mediaType: "image/jpeg" }
    const webpImage: ImageForPrompt = { ...sampleImage, mediaType: "image/webp" }

    const jpegParts = imagesToPromptParts([jpegImage])
    const webpParts = imagesToPromptParts([webpImage])

    expect((jpegParts[0] as { fileName: string }).fileName).toBe("image-0.jpg")
    expect((webpParts[0] as { fileName: string }).fileName).toBe("image-0.webp")
  })
})

describe("buildMultimodalUserContent", () => {
  it("builds text-only content when no images", () => {
    const parts = buildMultimodalUserContent("Extract entities from this text.")

    expect(parts.length).toBe(1)
    expect(parts[0].type).toBe("text")
    expect((parts[0] as { text: string }).text).toBe("Extract entities from this text.")
  })

  it("includes images with intro text", () => {
    const parts = buildMultimodalUserContent(
      "Main text content",
      [sampleImage],
      "Here are the images:"
    )

    // Should have: text, intro, context annotation, file
    expect(parts.length).toBe(4)
    expect(parts[0].type).toBe("text") // main text
    expect(parts[1].type).toBe("text") // intro
    expect((parts[1] as { text: string }).text).toContain("Here are the images:")
    expect(parts[2].type).toBe("text") // context annotation
    expect(parts[3].type).toBe("file") // image
  })

  it("includes image context annotations", () => {
    const parts = buildMultimodalUserContent("Text", [sampleImage])

    // Find the context annotation
    const contextPart = parts.find(
      (p) => p.type === "text" && (p as { text: string }).text.includes("[Image 0:")
    )

    expect(contextPart).toBeDefined()
    expect((contextPart as { text: string }).text).toContain("Test image")
    expect((contextPart as { text: string }).text).toContain("A test caption")
  })

  it("handles multiple images", () => {
    const images: Array<ImageForPrompt> = [
      { ...sampleImage, position: 0, alt: "First" },
      { ...sampleImage, position: 1, alt: "Second" }
    ]

    const parts = buildMultimodalUserContent("Text", images)

    // Count file parts
    const fileParts = parts.filter((p) => p.type === "file")
    expect(fileParts.length).toBe(2)
  })
})

describe("buildMultimodalPrompt", () => {
  it("creates a valid Prompt object", () => {
    const prompt = buildMultimodalPrompt(
      "System instructions here",
      "User text here",
      [sampleImage]
    )

    // Prompt should be defined (internal structure varies by @effect/ai version)
    expect(prompt).toBeDefined()
    // Just verify it's a Prompt object by checking it's truthy
    expect(typeof prompt).toBe("object")
  })

  it("works without images", () => {
    const prompt = buildMultimodalPrompt(
      "System instructions",
      "User text"
    )

    expect(prompt).toBeDefined()
    expect(typeof prompt).toBe("object")
  })
})

// Test class for structured prompt generation
const testPersonClass = new ClassDefinition({
  id: iri("http://test/Person"),
  label: "Person",
  comment: "A person",
  properties: [],
  broader: [],
  narrower: []
})

describe("buildPromptFromStructured", () => {
  it("builds prompt from StructuredPrompt without images", () => {
    const structured = generateStructuredEntityPrompt(
      "Test text",
      [testPersonClass],
      []
    )

    const prompt = buildPromptFromStructured(structured)

    expect(prompt).toBeDefined()
    expect(typeof prompt).toBe("object")
  })

  it("builds prompt with images from context", () => {
    const structured = generateStructuredEntityPrompt(
      "Test text",
      [testPersonClass],
      []
    )

    const prompt = buildPromptFromStructured(structured, {
      classes: [],
      objectProperties: [],
      datatypeProperties: [],
      imageContexts: [sampleImage]
    })

    expect(prompt).toBeDefined()
    expect(typeof prompt).toBe("object")
  })
})

// Combined layer that provides both ImageBlobStore and ImagePromptAdapter
// ImagePromptAdapter.Live depends on ImageBlobStore, so we need to provide it
const ImageBlobStoreLayer = ImageBlobStore.Live.pipe(Layer.provide(StorageServiceTest))
const CombinedTestLayer = ImagePromptAdapter.Live.pipe(
  Layer.provide(ImageBlobStoreLayer),
  Layer.provideMerge(ImageBlobStoreLayer)
)

describe("ImagePromptAdapter", () => {
  it("converts ImageRefs to ImageForPrompt", () =>
    Effect.gen(function*() {
      const blobStore = yield* ImageBlobStore
      const adapter = yield* ImagePromptAdapter

      // Store a test image
      const hash = "adapter-test-hash"
      yield* blobStore.putBytesWithMetadata(hash, TINY_PNG_BYTES, "image/png", "https://example.com/test.png")

      // Create a reference
      const ref: ImageRef = {
        ownerType: "link",
        ownerId: "link-123",
        assetHash: hash,
        alt: "Test alt text",
        caption: "Test caption",
        position: 0,
        context: "Surrounding context"
      }

      // Convert to ImageForPrompt
      const forPrompt = yield* adapter.toImageForPrompt([ref])

      expect(forPrompt.length).toBe(1)
      expect(forPrompt[0].base64).toBe(TINY_PNG_BASE64)
      expect(forPrompt[0].mediaType).toBe("image/png")
      expect(forPrompt[0].alt).toBe("Test alt text")
      expect(forPrompt[0].caption).toBe("Test caption")
      expect(forPrompt[0].context).toBe("Surrounding context")
    }).pipe(
      Effect.provide(CombinedTestLayer),
      Effect.runPromise
    ))

  it("skips missing images with warning", () =>
    Effect.gen(function*() {
      const adapter = yield* ImagePromptAdapter

      const ref: ImageRef = {
        ownerType: "link",
        ownerId: "link-123",
        assetHash: "nonexistent-hash",
        position: 0
      }

      // Should return empty array (skips missing)
      const forPrompt = yield* adapter.toImageForPrompt([ref])

      expect(forPrompt.length).toBe(0)
    }).pipe(
      Effect.provide(ImagePromptAdapterTestLayer),
      Effect.runPromise
    ))

  it("toPromptParts creates FileParts", () =>
    Effect.gen(function*() {
      const adapter = yield* ImagePromptAdapter

      const parts = adapter.toPromptParts([sampleImage])

      expect(parts.length).toBe(1)
      expect(parts[0].type).toBe("file")
    }).pipe(
      Effect.provide(ImagePromptAdapterTestLayer),
      Effect.runPromise
    ))

  it("buildUserMessageParts combines text and images", () =>
    Effect.gen(function*() {
      const adapter = yield* ImagePromptAdapter

      const parts = adapter.buildUserMessageParts(
        "Extract from this text",
        [sampleImage],
        "Images below:"
      )

      // Should have text, intro, context, file
      expect(parts.length).toBeGreaterThan(2)

      const textParts = parts.filter((p) => p.type === "text")
      const fileParts = parts.filter((p) => p.type === "file")

      expect(textParts.length).toBeGreaterThan(0)
      expect(fileParts.length).toBe(1)
    }).pipe(
      Effect.provide(ImagePromptAdapterTestLayer),
      Effect.runPromise
    ))
})
