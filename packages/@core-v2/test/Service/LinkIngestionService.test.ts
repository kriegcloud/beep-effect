import * as Pg from "@effect/sql-drizzle/Pg"
import { Effect, Layer, Option } from "effect"
import { describe, expect, it, vi } from "vitest"
import { ContentEnrichmentAgent } from "../../src/Service/ContentEnrichmentAgent.js"
import { ImageExtractor } from "../../src/Service/ImageExtractor.js"
import { ImageFetcher } from "../../src/Service/ImageFetcher.js"
import { ImageStore } from "../../src/Service/ImageStore.js"
import { JinaReaderClient } from "../../src/Service/JinaReaderClient.js"
import { LinkIngestionService } from "../../src/Service/LinkIngestionService.js"
import { StorageService } from "../../src/Service/Storage.js"

// Mock dependencies
const mockJina = {
  fetchUrl: vi.fn()
}

const mockStorage = {
  set: vi.fn(),
  get: vi.fn()
}

const mockDrizzle = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([]))
      }))
    }))
  })),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: "test-id" }]))
    }))
  }))
}

const mockEnricher = {
  enrichFromJina: vi.fn()
}

const mockImageExtractor = {
  extractFromJina: vi.fn(() => [])
}

const mockImageFetcher = {
  fetchAll: vi.fn(() => Effect.succeed([]))
}

const mockImageStore = {
  storeImage: vi.fn(),
  addImageRef: vi.fn()
}

const TestLayer = Layer.mergeAll(
  Layer.succeed(JinaReaderClient, mockJina as any),
  Layer.succeed(StorageService, mockStorage as any),
  Layer.succeed(Pg.PgDrizzle, mockDrizzle as any),
  Layer.succeed(ContentEnrichmentAgent, mockEnricher as any),
  Layer.succeed(ImageExtractor, mockImageExtractor as any),
  Layer.succeed(ImageFetcher, mockImageFetcher as any),
  Layer.succeed(ImageStore, mockImageStore as any)
)

describe("LinkIngestionService", () => {
  it("should ingest a URL successfully", async () => {
    mockJina.fetchUrl.mockReturnValue(Effect.succeed({
      content: {
        content: "Test content",
        title: "Test Title",
        siteName: "Test Site",
        wordCount: 100
      }
    }))

    mockStorage.set.mockReturnValue(Effect.succeed(undefined))

    const program = Effect.gen(function*() {
      const ingestion = yield* LinkIngestionService
      return yield* ingestion.ingestUrl("https://example.com", {
        ontologyId: "seattle",
        enrich: false,
        extractImages: false
      })
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(LinkIngestionService.Default),
        Effect.provide(TestLayer)
      )
    )

    expect(result.id).toBe("test-id")
    expect(mockJina.fetchUrl).toHaveBeenCalledWith("https://example.com")
    expect(mockStorage.set).toHaveBeenCalled()
  })

  it("should detect duplicates", async () => {
    // Mock existing entry in DB
    mockDrizzle.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{ id: "existing-id", storageUri: "path/to/content" }]))
        }))
      }))
    } as any)

    mockJina.fetchUrl.mockReturnValue(Effect.succeed({
      content: {
        content: "Test content",
        title: "Test Title"
      }
    }))

    const program = Effect.gen(function*() {
      const ingestion = yield* LinkIngestionService
      return yield* ingestion.ingestUrl("https://example.com", {
        ontologyId: "seattle",
        enrich: false,
        extractImages: false
      })
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(LinkIngestionService.Default),
        Effect.provide(TestLayer)
      )
    )

    expect(result.duplicate).toBe(true)
    expect(result.id).toBe("existing-id")
    expect(mockStorage.set).not.toHaveBeenCalled()
  })
})
