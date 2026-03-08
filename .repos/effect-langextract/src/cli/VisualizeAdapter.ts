import * as FileSystem from "@effect/platform/FileSystem"
import { Effect } from "effect"
import * as Console from "effect/Console"

import { renderDocuments } from "../api/Render.js"
import { decodeAnnotatedDocumentJson } from "../DataLib.js"
import { InferenceConfigError } from "../Errors.js"
import { readTextFile, writeTextFile } from "../IO.js"
import { Visualizer } from "../Visualization.js"

export interface VisualizeCommandOptions {
  readonly input: string
  readonly outputPath?: string | undefined
  readonly animationSpeed?: number | undefined
  readonly showLegend?: boolean | undefined
}

export const runVisualizeAdapter = (
  options: VisualizeCommandOptions,
  emitResultToStdout = true
): Effect.Effect<void, InferenceConfigError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    if (options.input.trim().length === 0) {
      return yield* new InferenceConfigError({
        message: "Visualize command requires a non-empty --input path."
      })
    }

    const raw = yield* readTextFile(options.input).pipe(
      Effect.mapError(
        (error) =>
          new InferenceConfigError({
            message: error.message
          })
      )
    )

    const document = yield* decodeAnnotatedDocumentJson(raw).pipe(
      Effect.mapError(
        (error) =>
          new InferenceConfigError({
            message: `Failed to decode annotated document JSON (${options.input}): ${String(error)}`
          })
      )
    )

    const html = yield* renderDocuments({
      documents: [document],
      format: "html",
      visualization: {
        ...(options.animationSpeed !== undefined
          ? { animationSpeed: options.animationSpeed }
          : {}),
        ...(options.showLegend !== undefined
          ? { showLegend: options.showLegend }
          : {})
      }
    }).pipe(Effect.provide(Visualizer.Default))

    if (options.outputPath !== undefined) {
      yield* writeTextFile(options.outputPath, html).pipe(
        Effect.mapError(
          (error) =>
            new InferenceConfigError({
              message: error.message
            })
        )
      )
      return
    }

    if (emitResultToStdout) {
      yield* Console.log(html)
    }
  })
