import { Effect, Schema } from "effect"

import { AnnotatedDocument } from "../Data.js"
import { encodeAnnotatedDocumentJson } from "../DataLib.js"
import { InferenceConfigError } from "../Errors.js"
import { Visualizer } from "../Visualization.js"

export type RenderFormat = "json" | "jsonl" | "html"

export interface RenderRequest {
  readonly documents: ReadonlyArray<AnnotatedDocument>
  readonly format: RenderFormat
  readonly visualization?: {
    readonly animationSpeed?: number | undefined
    readonly showLegend?: boolean | undefined
  }
}

const AnnotatedDocumentsJson = Schema.parseJson(Schema.Array(AnnotatedDocument))

const encodeAnnotatedDocumentsJson = (
  documents: ReadonlyArray<AnnotatedDocument>
): Effect.Effect<string, InferenceConfigError> =>
  Schema.encode(AnnotatedDocumentsJson)(documents).pipe(
    Effect.mapError(
      (error) =>
        new InferenceConfigError({
          message: `Failed to encode annotated documents JSON: ${String(error)}`
        })
    )
  )

const encodeAnnotatedDocumentsJsonl = (
  documents: ReadonlyArray<AnnotatedDocument>
): Effect.Effect<string, InferenceConfigError> =>
  Effect.forEach(documents, (document) => encodeAnnotatedDocumentJson(document)).pipe(
    Effect.map((rows) => `${rows.join("\n")}\n`),
    Effect.mapError(
      (error) =>
        new InferenceConfigError({
          message: `Failed to encode annotated documents JSONL: ${String(error)}`
        })
    )
  )

export const renderDocuments = (
  request: RenderRequest
): Effect.Effect<string, InferenceConfigError, Visualizer> => {
  if (request.format === "json") {
    if (request.documents.length === 1) {
      const firstDocument = request.documents[0]
      if (firstDocument === undefined) {
        return Effect.fail(
          new InferenceConfigError({
            message: "Expected a single annotated document."
          })
        )
      }

      return encodeAnnotatedDocumentJson(firstDocument).pipe(
        Effect.mapError(
          (error) =>
            new InferenceConfigError({
              message: `Failed to encode annotated document JSON: ${String(error)}`
            })
        )
      )
    }

    return encodeAnnotatedDocumentsJson(request.documents)
  }

  if (request.format === "jsonl") {
    return encodeAnnotatedDocumentsJsonl(request.documents)
  }

  if (request.documents.length !== 1) {
    return Effect.fail(
      new InferenceConfigError({
        message: "HTML output is only supported for single-document ingestion."
      })
    )
  }

  const firstDocument = request.documents[0]
  if (firstDocument === undefined) {
    return Effect.fail(
      new InferenceConfigError({
        message: "Expected a single annotated document."
      })
    )
  }

  return Effect.gen(function* () {
    const visualizer = yield* Visualizer
    return yield* visualizer.visualize(firstDocument, {
      ...(request.visualization?.animationSpeed !== undefined
        ? { animationSpeed: request.visualization.animationSpeed }
        : {}),
      ...(request.visualization?.showLegend !== undefined
        ? { showLegend: request.visualization.showLegend }
        : {})
    })
  }).pipe(
    Effect.mapError(
      (error) =>
        new InferenceConfigError({
          message: `Failed to build visualization output: ${String(error)}`
        })
    )
  )
}
