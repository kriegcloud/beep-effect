import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"

import {
  AnnotatedDocument,
  CharInterval,
  Document,
  DocumentIdGenerator,
  Extraction,
  makeDocumentEffect
} from "../../src/Data.js"

describe("Data schemas", () => {
  it.effect("round-trips Document through schema encode/decode", () =>
    Effect.gen(function* () {
      const source = yield* makeDocumentEffect({
        text: "Marie Curie discovered radium.",
        additionalContext: "Physics history"
      })

      const encoded = yield* Schema.encode(Document)(source)
      const decoded = yield* Schema.decodeUnknown(Document)(encoded)

      expect(decoded.text).toBe(source.text)
      expect(decoded.additionalContext).toBe("Physics history")
      expect(decoded.documentId).toBeDefined()
    }).pipe(Effect.provide(DocumentIdGenerator.Test))
  )

  it.effect("constructs Extraction with optional intervals", () =>
    Effect.gen(function* () {
      const extraction = new Extraction({
        extractionClass: "person",
        extractionText: "Marie Curie",
        alignmentStatus: "match_exact",
        charInterval: new CharInterval({
          startPos: 0,
          endPos: 11
        })
      })

      const encoded = yield* Schema.encode(Extraction)(extraction)
      const decoded = yield* Schema.decodeUnknown(Extraction)(encoded)

      expect(decoded.extractionClass).toBe("person")
      expect(decoded.charInterval?.startPos).toBe(0)
      expect(decoded.charInterval?.endPos).toBe(11)
    })
  )

  it.effect("constructs AnnotatedDocument with defaults", () =>
    Effect.gen(function* () {
      const annotated = new AnnotatedDocument({
        text: "Test text"
      })

      const encoded = yield* Schema.encode(AnnotatedDocument)(annotated)
      const decoded = yield* Schema.decodeUnknown(AnnotatedDocument)(encoded)

      expect(decoded.text).toBe("Test text")
      expect(decoded.extractions.length).toBe(0)
    })
  )
})
