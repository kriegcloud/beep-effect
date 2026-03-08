import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { resolveExtractCommandConfig } from "../../src/Cli.js"
import { runExtractAdapter } from "../../src/cli/ExtractAdapter.js"
import { LanguageModel } from "../../src/LanguageModel.js"
import {
  readTextFile,
  removeFile,
  tempPath,
  writeExamplesFile
} from "../helpers/cli.js"

const mockLanguageModelLayer = LanguageModel.testLayer({
  provider: "test-mock",
  defaultText:
    "[{\"extractionClass\":\"snippet\",\"extractionText\":\"Alice visited\"}]"
})

describe("CLI extract command", () => {
  it.effect("writes JSON output using anthropic provider layer", () =>
    Effect.gen(function* () {
      const examplesPath = tempPath("cli", "examples.json")
      const outputPath = tempPath("cli", "output.json")
      yield* writeExamplesFile(examplesPath)

      yield* resolveExtractCommandConfig({
        input: "Alice visited Paris and Bob stayed in London.",
        inputFormat: "text",
        prompt: "Extract travel snippets.",
        examplesFile: examplesPath,
        provider: "anthropic",
        output: "json",
        outputPath,
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1,
        primedCacheEnabled: true,
        primedCacheNamespace: "cli-test",
        primedCacheTtlSeconds: 60,
        primedCacheDeterministicOnly: true,
        clearPrimedCacheOnStart: true
      }).pipe(
        Effect.flatMap((config) =>
          runExtractAdapter(config, {
            languageModelLayer: mockLanguageModelLayer,
            emitResultToStdout: false
          })
        ),
        Effect.provide(BunFileSystem.layer),
        Effect.provide(FetchHttpClient.layer)
      )

      const content = yield* readTextFile(outputPath)
      const parsed = JSON.parse(content) as { extractions?: ReadonlyArray<unknown> }
      expect((parsed.extractions?.length ?? 0) > 0).toBe(true)

      yield* removeFile(examplesPath)
      yield* removeFile(outputPath)
    })
  )

  it.effect("writes JSONL output via streaming path with trailing newline", () =>
    Effect.gen(function* () {
      const examplesPath = tempPath("cli", "examples-jsonl.json")
      const outputPath = tempPath("cli", "output.jsonl")
      yield* writeExamplesFile(examplesPath)

      yield* resolveExtractCommandConfig({
        input: "Alice visited Paris and Bob stayed in London.",
        inputFormat: "text",
        prompt: "Extract travel snippets.",
        examplesFile: examplesPath,
        provider: "openai",
        output: "jsonl",
        outputPath,
        maxCharBuffer: 1000,
        batchLength: 10,
        batchConcurrency: 1,
        providerConcurrency: 8,
        extractionPasses: 1,
        primedCacheEnabled: true,
        primedCacheNamespace: "cli-test",
        primedCacheTtlSeconds: 60,
        primedCacheDeterministicOnly: true,
        clearPrimedCacheOnStart: false
      }).pipe(
        Effect.flatMap((config) =>
          runExtractAdapter(config, {
            languageModelLayer: mockLanguageModelLayer,
            emitResultToStdout: false
          })
        ),
        Effect.provide(BunFileSystem.layer),
        Effect.provide(FetchHttpClient.layer)
      )

      const content = yield* readTextFile(outputPath)
      expect(content.endsWith("\n")).toBe(true)
      const lines = content.trim().split("\n")
      expect(lines).toHaveLength(1)
      const firstLine = lines[0]
      if (firstLine === undefined) {
        throw new Error("Missing JSONL row")
      }
      const parsed = JSON.parse(firstLine) as { extractions?: ReadonlyArray<unknown> }
      expect((parsed.extractions?.length ?? 0) > 0).toBe(true)

      yield* removeFile(examplesPath)
      yield* removeFile(outputPath)
    })
  )

  it.effect("fails when no input source is provided", () =>
    resolveExtractCommandConfig({
      prompt: "Extract entities.",
      provider: "gemini",
      output: "json",
      maxCharBuffer: 1000,
      batchLength: 10,
      batchConcurrency: 1,
      providerConcurrency: 8,
      extractionPasses: 1,
      primedCacheEnabled: false,
      primedCacheNamespace: "cli-test",
      primedCacheTtlSeconds: 60,
      primedCacheDeterministicOnly: true,
      clearPrimedCacheOnStart: false
    }).pipe(
      Effect.flatMap((config) =>
        runExtractAdapter(config, {
          languageModelLayer: mockLanguageModelLayer,
          emitResultToStdout: false
        })
      ),
      Effect.provide(BunFileSystem.layer),
      Effect.provide(FetchHttpClient.layer),
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("requires --input")
        })
      ),
      Effect.asVoid
    )
  )
})
