import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { renderDocuments } from "../../src/api/Render.js"
import { AnnotatedDocument, CharInterval, Extraction } from "../../src/Data.js"
import { Visualizer } from "../../src/Visualization.js"

const sampleDocument = new AnnotatedDocument({
  documentId: "doc-1",
  text: "Alice visited Paris.",
  extractions: [
    new Extraction({
      extractionClass: "person",
      extractionText: "Alice",
      alignmentStatus: "match_exact",
      charInterval: new CharInterval({ startPos: 0, endPos: 5 })
    })
  ]
})

describe("Render API", () => {
  it.effect("renders single document JSON as object", () =>
    renderDocuments({
      documents: [sampleDocument],
      format: "json"
    }).pipe(
      Effect.tap((output) =>
        Effect.sync(() => {
          const decoded = JSON.parse(output) as { text?: string }
          expect(decoded.text).toBe("Alice visited Paris.")
          expect(Array.isArray(decoded)).toBe(false)
        })
      ),
      Effect.provide(Visualizer.Default),
      Effect.asVoid
    )
  )

  it.effect("renders multiple documents JSON as array", () =>
    renderDocuments({
      documents: [sampleDocument, sampleDocument],
      format: "json"
    }).pipe(
      Effect.tap((output) =>
        Effect.sync(() => {
          const decoded = JSON.parse(output)
          expect(Array.isArray(decoded)).toBe(true)
          expect(decoded).toHaveLength(2)
        })
      ),
      Effect.provide(Visualizer.Default),
      Effect.asVoid
    )
  )

  it.effect("renders JSONL with trailing newline", () =>
    renderDocuments({
      documents: [sampleDocument, sampleDocument],
      format: "jsonl"
    }).pipe(
      Effect.tap((output) =>
        Effect.sync(() => {
          expect(output.endsWith("\n")).toBe(true)
          const lines = output.trim().split("\n")
          expect(lines).toHaveLength(2)
        })
      ),
      Effect.provide(Visualizer.Default),
      Effect.asVoid
    )
  )

  it.effect("fails HTML render for multi-document input", () =>
    renderDocuments({
      documents: [sampleDocument, sampleDocument],
      format: "html"
    }).pipe(
      Effect.provide(Visualizer.Default),
      Effect.flip,
      Effect.tap((error) =>
        Effect.sync(() => {
          expect(error.message).toContain("single-document")
        })
      ),
      Effect.asVoid
    )
  )
})
