import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as BunContext from "@effect/platform-bun/BunContext"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import { runCli } from "../../src/Cli.js"
import { LanguageModel } from "../../src/LanguageModel.js"
import {
  readTextFile,
  removeFile,
  tempPath,
  writeAnnotatedDocument,
  writeExamplesFile
} from "../helpers/cli.js"

const runtimeLayer = Layer.mergeAll(BunContext.layer, FetchHttpClient.layer)

const mockLanguageModelLayer = LanguageModel.testLayer({
  provider: "test-mock",
  defaultText:
    "[{\"extractionClass\":\"snippet\",\"extractionText\":\"Alice visited\"}]"
})

describe("Effect CLI subcommands", () => {
  it.effect("runs typed extract subcommand", () =>
    Effect.gen(function* () {
      const examplesPath = tempPath("cli-subcommands", "examples.json")
      const outputPath = tempPath("cli-subcommands", "output.json")
      yield* writeExamplesFile(examplesPath)

      yield* runCli(
        [
          "bun",
          "src/main.ts",
          "extract",
          "--input",
          "Alice visited Paris and Bob stayed in London.",
          "--input-format",
          "text",
          "--prompt",
          "Extract travel snippets.",
          "--examples-file",
          examplesPath,
          "--provider",
          "anthropic",
          "--output",
          "json",
          "--output-path",
          outputPath
        ],
        {
          env: process.env,
          primedCacheStoreLayer: KeyValueStore.layerMemory,
          languageModelLayer: mockLanguageModelLayer,
          emitResultToStdout: false
        }
      ).pipe(Effect.provide(runtimeLayer))

      const content = yield* readTextFile(outputPath)
      const parsed = JSON.parse(content) as { extractions?: ReadonlyArray<unknown> }
      expect((parsed.extractions?.length ?? 0) > 0).toBe(true)

      yield* removeFile(examplesPath)
      yield* removeFile(outputPath)
    })
  )

  it.effect("runs typed visualize subcommand", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("cli-subcommands", "annotated.json")
      const outputPath = tempPath("cli-subcommands", "output.html")
      yield* writeAnnotatedDocument(inputPath)

      yield* runCli(
        [
          "bun",
          "src/main.ts",
          "visualize",
          "--input",
          inputPath,
          "--output-path",
          outputPath,
          "--animation-speed",
          "0.5",
          "--show-legend",
          "true"
        ],
        {
          env: process.env,
          primedCacheStoreLayer: KeyValueStore.layerMemory,
          languageModelLayer: mockLanguageModelLayer,
          emitResultToStdout: false
        }
      ).pipe(Effect.provide(runtimeLayer))

      const html = yield* readTextFile(outputPath)
      expect(html).toContain("<mark")

      yield* removeFile(inputPath)
      yield* removeFile(outputPath)
    })
  )
})
