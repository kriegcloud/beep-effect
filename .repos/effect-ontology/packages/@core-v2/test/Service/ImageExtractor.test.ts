/**
 * ImageExtractor Service Tests
 *
 * Tests for image extraction from Jina responses and markdown content.
 *
 * @module test/Service/ImageExtractor
 */

import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { JinaContent } from "../../src/Domain/Model/EnrichedContent.js"
import type { ImageCandidate } from "../../src/Domain/Model/Image.js"
import { type ImageExtractionInput, ImageExtractor } from "../../src/Service/ImageExtractor.js"

// Test layer
const TestLayer = ImageExtractor.Live

describe("ImageExtractor", () => {
  describe("extractFromJina", () => {
    it("extracts hero image from featured image field", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const jinaContent = new JinaContent({
          url: "https://example.com/article",
          title: "Test Article",
          content: "Article content without inline images",
          length: 100,
          image: "https://example.com/hero.jpg"
        })

        const candidates = extractor.extractFromJina(jinaContent)

        expect(candidates.length).toBe(1)
        expect(candidates[0].role).toBe("hero")
        expect(candidates[0].sourceUrl).toBe("https://example.com/hero.jpg")
        expect(candidates[0].order).toBe(0)
        expect(candidates[0].referrerUrl).toBe("https://example.com/article")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("extracts inline images from markdown content", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = `
# Article Title

![First image](https://example.com/img1.png)

Some text here.

![Second image with alt](https://example.com/img2.jpg "Optional title")
`

        const jinaContent = new JinaContent({
          url: "https://example.com/article",
          title: "Test Article",
          content: markdown,
          length: markdown.length
        })

        const candidates = extractor.extractFromJina(jinaContent)

        expect(candidates.length).toBe(2)

        // First inline image
        expect(candidates[0].role).toBe("inline")
        expect(candidates[0].sourceUrl).toBe("https://example.com/img1.png")
        expect(candidates[0].alt).toBe("First image")
        expect(candidates[0].order).toBe(1)

        // Second inline image
        expect(candidates[1].role).toBe("inline")
        expect(candidates[1].sourceUrl).toBe("https://example.com/img2.jpg")
        expect(candidates[1].alt).toBe("Second image with alt")
        expect(candidates[1].caption).toBe("Optional title")
        expect(candidates[1].order).toBe(2)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("combines hero and inline images with correct ordering", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = `
# Article

![Inline image](https://example.com/inline.png)
`

        const jinaContent = new JinaContent({
          url: "https://example.com/article",
          title: "Test Article",
          content: markdown,
          length: markdown.length,
          image: "https://example.com/hero.jpg"
        })

        const candidates = extractor.extractFromJina(jinaContent)

        expect(candidates.length).toBe(2)

        // Hero first (order 0)
        expect(candidates[0].role).toBe("hero")
        expect(candidates[0].order).toBe(0)

        // Inline after (order 1)
        expect(candidates[1].role).toBe("inline")
        expect(candidates[1].order).toBe(1)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("returns empty array for content without images", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const jinaContent = new JinaContent({
          url: "https://example.com/article",
          title: "Text Only Article",
          content: "Just some text content with no images",
          length: 100
        })

        const candidates = extractor.extractFromJina(jinaContent)

        expect(candidates.length).toBe(0)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))
  })

  describe("extract", () => {
    it("extracts from raw input", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const input: ImageExtractionInput = {
          content: "![Test](https://example.com/test.png)",
          featuredImage: "https://example.com/hero.jpg",
          sourceUrl: "https://example.com/page"
        }

        const candidates = extractor.extract(input)

        expect(candidates.length).toBe(2)
        expect(candidates[0].role).toBe("hero")
        expect(candidates[1].role).toBe("inline")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))
  })

  describe("extractFromMarkdown", () => {
    it("handles relative URLs", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = "![Relative](/images/photo.jpg)"
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/article"
        )

        expect(candidates.length).toBe(1)
        expect(candidates[0].sourceUrl).toBe("https://example.com/images/photo.jpg")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("handles protocol-relative URLs", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = "![Image](//cdn.example.com/image.png)"
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/article"
        )

        expect(candidates.length).toBe(1)
        expect(candidates[0].sourceUrl).toBe("https://cdn.example.com/image.png")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("skips data URIs", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = "![Data URI](data:image/png;base64,iVBORw0KGgo...)"
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/article"
        )

        expect(candidates.length).toBe(0)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("respects startOrder parameter", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = "![A](a.jpg) ![B](b.jpg)"
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/page",
          5 // Start from order 5
        )

        expect(candidates.length).toBe(2)
        expect(candidates[0].order).toBe(5)
        expect(candidates[1].order).toBe(6)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("handles images without alt text", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = "![](https://example.com/image.png)"
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/page"
        )

        expect(candidates.length).toBe(1)
        expect(candidates[0].alt).toBeUndefined()
        expect(candidates[0].sourceUrl).toBe("https://example.com/image.png")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))

    it("handles complex markdown with multiple image patterns", () =>
      Effect.gen(function*() {
        const extractor = yield* ImageExtractor

        const markdown = `
# Document with Images

Here's an image: ![First](https://a.com/1.jpg)

And another ![Second](https://b.com/2.png "Caption text")

![Third](/relative/3.gif)

Some more text.
`
        const candidates = extractor.extractFromMarkdown(
          markdown,
          "https://example.com/doc"
        )

        expect(candidates.length).toBe(3)
        expect(candidates[0].sourceUrl).toBe("https://a.com/1.jpg")
        expect(candidates[1].sourceUrl).toBe("https://b.com/2.png")
        expect(candidates[1].caption).toBe("Caption text")
        expect(candidates[2].sourceUrl).toBe("https://example.com/relative/3.gif")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      ))
  })
})
