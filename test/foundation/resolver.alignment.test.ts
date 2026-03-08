import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import {
  AlignmentError,
  Extraction,
  FormatHandler,
  FormatHandlerConfig,
  Resolver,
  Tokenizer
} from "../../src/index.js"

const resolverLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
  Tokenizer.Default,
  FormatHandler.testLayer(
    new FormatHandlerConfig({
      formatType: "json",
      useFences: false,
      strictFences: false,
      useWrapper: true,
      allowTopLevelList: true
    })
  )
])

describe("Resolver parity hardening", () => {
  it.effect("orders indexed extraction maps by *_index values", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const parsed = yield* resolver.resolve(
        `[{
          "patient": "John Doe",
          "patient_index": 2,
          "condition": "hypertension",
          "condition_index": 1
        }]`
      )

      expect(parsed.length).toBe(2)
      expect(parsed[0]?.extractionClass).toBe("condition")
      expect(parsed[0]?.extractionText).toBe("hypertension")
      expect(parsed[0]?.extractionIndex).toBe(1)
      expect(parsed[1]?.extractionClass).toBe("patient")
      expect(parsed[1]?.extractionText).toBe("John Doe")
      expect(parsed[1]?.extractionIndex).toBe(2)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("supports direct extractionClass/extractionText records", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const parsed = yield* resolver.resolve(
        `[{"extractionClass":"medication","extractionText":"Naprosyn"}]`
      )

      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.extractionClass).toBe("medication")
      expect(parsed[0]?.extractionText).toBe("Naprosyn")
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("supports snake_case extraction_class/extraction_text aliases", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const parsed = yield* resolver.resolve(
        '[{"extraction_class":"medication","extraction_text":"Naprosyn","extraction_index":3}]'
      )

      expect(parsed).toHaveLength(1)
      expect(parsed[0]?.extractionClass).toBe("medication")
      expect(parsed[0]?.extractionText).toBe("Naprosyn")
      expect(parsed[0]?.extractionIndex).toBe(3)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("keeps SequenceMatcher-style ordering behavior for interleaved extractions", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "medication",
            extractionText: "Naprosyn"
          }),
          new Extraction({
            extractionClass: "condition",
            extractionText: "arthritis"
          })
        ],
        "Patient with arthritis is prescribed Naprosyn.",
        0,
        0,
        {
          enableFuzzyAlignment: false
        }
      )

      expect(aligned[0]?.alignmentStatus).toBeUndefined()
      expect(aligned[0]?.charInterval).toBeUndefined()
      expect(aligned[1]?.alignmentStatus).toBe("match_exact")
      expect(aligned[1]?.charInterval?.startPos).toBe(13)
      expect(aligned[1]?.charInterval?.endPos).toBe(22)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("does not align strict substrings that are not token-exact", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "medication",
            extractionText: "Napro"
          })
        ],
        "Patient is prescribed Naprosyn and prednisone for treatment.",
        0,
        0,
        {
          enableFuzzyAlignment: false
        }
      )

      expect(aligned[0]?.alignmentStatus).toBeUndefined()
      expect(aligned[0]?.charInterval).toBeUndefined()
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("emits match_lesser for partial exact matches and can suppress it", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver

      const partial = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "condition",
            extractionText: "high blood pressure"
          })
        ],
        "Patient is prescribed high glucose.",
        0,
        0,
        {
          enableFuzzyAlignment: false,
          acceptMatchLesser: true
        }
      )

      expect(partial[0]?.alignmentStatus).toBe("match_lesser")
      expect(partial[0]?.charInterval?.startPos).toBe(22)
      expect(partial[0]?.charInterval?.endPos).toBe(26)

      const suppressed = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "condition",
            extractionText: "high blood pressure"
          })
        ],
        "Patient is prescribed high glucose.",
        0,
        0,
        {
          enableFuzzyAlignment: false,
          acceptMatchLesser: false
        }
      )

      expect(suppressed[0]?.alignmentStatus).toBeUndefined()
      expect(suppressed[0]?.charInterval).toBeUndefined()
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("falls back to fuzzy alignment for near matches", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const source = "Patient is prescribed Naprosyn and prednisone daily."

      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "medication",
            extractionText: "naprosins and prednisone daily"
          })
        ],
        source,
        0,
        0,
        {
          enableFuzzyAlignment: true,
          fuzzyAlignmentThreshold: 0.5
        }
      )

      expect(aligned[0]?.alignmentStatus).toBe("match_fuzzy")
      const startPos = aligned[0]?.charInterval?.startPos
      const endPos = aligned[0]?.charInterval?.endPos
      expect(startPos).toBeDefined()
      expect(endPos).toBeDefined()

      const extracted = source.slice(startPos ?? 0, endPos ?? 0)
      expect(extracted.toLowerCase()).toContain("prednisone")
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("prefers longer multiword extractions when ordering conflicts", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "medication",
            extractionText: "Naprosyn"
          }),
          new Extraction({
            extractionClass: "medication",
            extractionText: "Naprosyn and prednisone"
          })
        ],
        "Patient is prescribed Naprosyn and prednisone for treatment.",
        0,
        0,
        {
          enableFuzzyAlignment: false
        }
      )

      expect(aligned[0]?.alignmentStatus).toBeUndefined()
      expect(aligned[0]?.charInterval).toBeUndefined()
      expect(aligned[1]?.alignmentStatus).toBe("match_exact")
      expect(aligned[1]?.charInterval?.startPos).toBe(22)
      expect(aligned[1]?.charInterval?.endPos).toBe(45)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("handles unicode punctuation token boundaries", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "word",
            extractionText: "Separated"
          }),
          new Extraction({
            extractionClass: "word",
            extractionText: "by"
          }),
          new Extraction({
            extractionClass: "word",
            extractionText: "en–dashes"
          })
        ],
        "Separated–by–en–dashes.",
        0,
        0
      )

      expect(aligned[0]?.alignmentStatus).toBe("match_exact")
      expect(aligned[0]?.charInterval?.startPos).toBe(0)
      expect(aligned[0]?.charInterval?.endPos).toBe(9)
      expect(aligned[1]?.alignmentStatus).toBe("match_exact")
      expect(aligned[1]?.charInterval?.startPos).toBe(10)
      expect(aligned[1]?.charInterval?.endPos).toBe(12)
      expect(aligned[2]?.alignmentStatus).toBe("match_exact")
      expect(aligned[2]?.charInterval?.startPos).toBe(13)
      expect(aligned[2]?.charInterval?.endPos).toBe(22)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("respects token and character offsets for chunk alignment", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const source = "sample text with some extractions."

      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "condition",
            extractionText: "sample"
          }),
          new Extraction({
            extractionClass: "condition",
            extractionText: "extractions"
          })
        ],
        source,
        3,
        10,
        {
          enableFuzzyAlignment: false
        }
      )

      expect(aligned[0]?.alignmentStatus).toBe("match_exact")
      expect(aligned[0]?.tokenInterval?.startIndex).toBe(3)
      expect(aligned[0]?.tokenInterval?.endIndex).toBe(4)
      expect(aligned[0]?.charInterval?.startPos).toBe(10)
      expect(aligned[0]?.charInterval?.endPos).toBe(16)

      expect(aligned[1]?.alignmentStatus).toBe("match_exact")
      expect(aligned[1]?.tokenInterval?.startIndex).toBe(7)
      expect(aligned[1]?.tokenInterval?.endIndex).toBe(8)
      expect(aligned[1]?.charInterval?.startPos).toBe(32)
      expect(aligned[1]?.charInterval?.endPos).toBe(43)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("falls back to fuzzy when lesser is disabled", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const aligned = yield* resolver.align(
        [
          new Extraction({
            extractionClass: "condition",
            extractionText: "patient heart problems today"
          })
        ],
        "Patient has heart problems today.",
        0,
        0,
        {
          enableFuzzyAlignment: true,
          acceptMatchLesser: false
        }
      )

      expect(aligned[0]?.alignmentStatus).toBe("match_fuzzy")
      expect(aligned[0]?.tokenInterval?.startIndex).toBe(0)
      expect(aligned[0]?.tokenInterval?.endIndex).toBe(5)
      expect(aligned[0]?.charInterval?.startPos).toBe(0)
      expect(aligned[0]?.charInterval?.endPos).toBe(32)
    }).pipe(Effect.provide(resolverLayer))
  )

  it.effect("fails alignment on empty source text", () =>
    Effect.gen(function* () {
      const resolver = yield* Resolver
      const error = yield* resolver
        .align(
          [
            new Extraction({
              extractionClass: "medication",
              extractionText: "Naprosyn"
            })
          ],
          "",
          0,
          0
        )
        .pipe(Effect.flip)

      expect(error).toBeInstanceOf(AlignmentError)
      expect(error.message).toContain("Source tokens and extraction tokens cannot be empty")
    }).pipe(Effect.provide(resolverLayer))
  )
})
