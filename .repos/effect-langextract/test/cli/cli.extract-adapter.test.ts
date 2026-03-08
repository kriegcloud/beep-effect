import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { resolveIngestionRequest } from "../../src/cli/ExtractAdapter.js"
import type { ResolvedExtractCommandConfig } from "../../src/cli/index.js"

const baseConfig: ResolvedExtractCommandConfig = {
  input: "rows.jsonl",
  inputFormat: "jsonl",
  textField: "body",
  idField: "post_id",
  contextField: ["author"],
  csvDelimiter: undefined,
  csvHeader: undefined,
  rowErrorMode: "fail-fast",
  documentBatchSize: 100,
  prompt: "Extract snippets.",
  examplesFile: "examples.json",
  provider: "openai",
  modelId: "gpt-4o-mini",
  temperature: 0,
  output: "json",
  outputPath: undefined,
  maxCharBuffer: 1000,
  batchLength: 10,
  batchConcurrency: 1,
  providerConcurrency: 8,
  extractionPasses: 1,
  contextWindowChars: undefined,
  maxBatchInputTokens: undefined,
  primedCacheEnabled: true,
  primedCacheDir: ".cache/langextract/primed",
  primedCacheNamespace: "test",
  primedCacheTtlSeconds: 60,
  primedCacheDeterministicOnly: true,
  clearPrimedCacheOnStart: false,
  openAiApiKey: "",
  openAiBaseUrl: undefined,
  openAiOrganization: undefined,
  geminiApiKey: "",
  geminiBaseUrl: undefined,
  anthropicApiKey: "",
  anthropicBaseUrl: undefined,
  ollamaBaseUrl: "http://localhost:11434"
}

describe("CLI extract adapter mapping", () => {
  it.effect("maps JSONL file input and field selectors into ingestion request", () =>
    resolveIngestionRequest(baseConfig).pipe(
      Effect.tap((request) =>
        Effect.sync(() => {
          expect(request.source._tag).toBe("file")
          expect(request.format).toBe("jsonl")
          expect(request.mapping?.text?.path).toBe("body")
          expect(request.mapping?.documentId?.path).toBe("post_id")
        })
      ),
      Effect.asVoid
    )
  )

  it.effect("fails when URL mode is selected with non-URL input", () =>
    resolveIngestionRequest({
      ...baseConfig,
      input: "not-a-url",
      inputFormat: "url"
    }).pipe(
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("http/https URL")
        })
      ),
      Effect.asVoid
    )
  )
})
