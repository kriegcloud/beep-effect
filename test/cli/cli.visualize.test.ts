import * as BunFileSystem from "@effect/platform-bun/BunFileSystem"
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { runVisualizeAdapter } from "../../src/cli/VisualizeAdapter.js"
import {
  readTextFile,
  removeFile,
  tempPath,
  writeAnnotatedDocument
} from "../helpers/cli.js"

describe("CLI visualize command", () => {
  it.effect("writes interactive HTML visualization from annotated document JSON", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("cli-visualize", "annotated.json")
      const outputPath = tempPath("cli-visualize", "visualization.html")
      yield* writeAnnotatedDocument(inputPath)

      yield* runVisualizeAdapter({
        input: inputPath,
        outputPath,
        animationSpeed: 0.5,
        showLegend: true
      }, false).pipe(Effect.provide(BunFileSystem.layer))

      const html = yield* readTextFile(outputPath)
      expect(html).toContain("<mark")
      expect(html).toContain("id=\"lx-visualization-payload\"")
      expect(html).toContain("id=\"lx-play-toggle\"")
      expect(html).toContain("__effectLangExtractVisualizationBootstrap")
      expect(html).toContain('"animationSpeed":0.5')
      expect(html).toContain('"showLegend":true')

      yield* removeFile(inputPath)
      yield* removeFile(outputPath)
    })
  )

  it.effect("respects showLegend=false and preserves payload flags", () =>
    Effect.gen(function* () {
      const inputPath = tempPath("cli-visualize", "annotated-no-legend.json")
      const outputPath = tempPath("cli-visualize", "visualization-no-legend.html")
      yield* writeAnnotatedDocument(inputPath)

      yield* runVisualizeAdapter({
        input: inputPath,
        outputPath,
        animationSpeed: 1.25,
        showLegend: false
      }, false).pipe(Effect.provide(BunFileSystem.layer))

      const html = yield* readTextFile(outputPath)
      expect(html).not.toContain("<ul class=\"lx-legend\"")
      expect(html).toContain('"showLegend":false')
      expect(html).toContain('"animationSpeed":1.25')

      yield* removeFile(inputPath)
      yield* removeFile(outputPath)
    })
  )
})
