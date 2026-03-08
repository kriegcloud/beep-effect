import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"

import { CharInterval, ExampleData, Extraction, Resolver } from "../../src/index.js"
import {
  AlignmentPolicy,
  PromptValidator,
  ValidationIssue,
  ValidationReport
} from "../../src/PromptValidation.js"

const makeExample = (extractionText: string): ExampleData =>
  new ExampleData({
    text: "Alice visited Paris.",
    extractions: [
      new Extraction({
        extractionClass: "snippet",
        extractionText
      })
    ]
  })

const withResolverStub = (
  align: (
    extractions: ReadonlyArray<Extraction>
  ) => Effect.Effect<ReadonlyArray<Extraction>>
) =>
  Effect.provide(
    Layer.provide(PromptValidator.DefaultWithoutDependencies, [
      Resolver.testLayer({
        resolve: () => Effect.succeed([]),
        align: (extractions) => align(extractions)
      })
    ])
  )

describe("PromptValidator", () => {
  it.effect("returns no issues for exact aligned examples (resolver stubbed)", () =>
    Effect.gen(function* () {
      const validator = yield* PromptValidator
      const report = yield* validator.validatePromptAlignment([
        makeExample("Alice")
      ])

      expect(report.issues.length).toBe(0)
    }).pipe(
      withResolverStub((extractions) =>
        Effect.succeed(
          extractions.map(
            (extraction) =>
              new Extraction({
                extractionClass: extraction.extractionClass,
                extractionText: extraction.extractionText,
                alignmentStatus: "match_exact",
                charInterval: new CharInterval({ startPos: 0, endPos: 5 }),
                tokenInterval: { startIndex: 0, endIndex: 1 }
              })
          )
        )
      )
    )
  )

  it.effect("emits non-exact issues when resolver reports non-exact alignment", () =>
    Effect.gen(function* () {
      const validator = yield* PromptValidator
      const report = yield* validator.validatePromptAlignment(
        [makeExample("Alice visited Paris today")],
        new AlignmentPolicy({
          fuzzyAlignmentThreshold: 0.7,
          acceptMatchLesser: true,
          enableFuzzyAlignment: true
        })
      )

      expect(report.issues.length).toBe(1)
      expect(report.issues[0]?.issueKind).toBe("non_exact")
      expect(report.issues[0]?.alignmentStatus).toBe("match_lesser")
    }).pipe(
      withResolverStub((extractions) =>
        Effect.succeed(
          extractions.map(
            (extraction) =>
              new Extraction({
                extractionClass: extraction.extractionClass,
                extractionText: extraction.extractionText,
                alignmentStatus: "match_lesser",
                charInterval: new CharInterval({ startPos: 0, endPos: 12 }),
                tokenInterval: { startIndex: 0, endIndex: 3 }
              })
          )
        )
      )
    )
  )

  it.effect("emits failed issues when resolver cannot align extraction", () =>
    Effect.gen(function* () {
      const validator = yield* PromptValidator
      const report = yield* validator.validatePromptAlignment([
        makeExample("Completely unrelated extraction value")
      ])

      expect(report.issues.length).toBe(1)
      expect(report.issues[0]?.issueKind).toBe("failed")
    }).pipe(
      withResolverStub((extractions) =>
        Effect.succeed(
          extractions.map(
            (extraction) =>
              new Extraction({
                extractionClass: extraction.extractionClass,
                extractionText: extraction.extractionText
              })
          )
        )
      )
    )
  )

  it.effect("fails strict non-exact handling when configured", () =>
    Effect.gen(function* () {
      const validator = yield* PromptValidator
      const report = new ValidationReport({
        issues: [
          new ValidationIssue({
            exampleIndex: 0,
            extractionClass: "snippet",
            extractionTextPreview: "Alice visited Paris today",
            issueKind: "non_exact",
            alignmentStatus: "match_lesser"
          })
        ]
      })

      yield* validator.handleAlignmentReport(report, "error", {
        strictNonExact: true
      }).pipe(
        Effect.flip,
        Effect.tap((error) =>
          Effect.sync(() => {
            expect(error.message).toContain("strict mode")
          })
        ),
        Effect.asVoid
      )
    }).pipe(Effect.provide(PromptValidator.Default))
  )

  it.effect("integration path remains wired to default resolver layer", () =>
    Effect.gen(function* () {
      const validator = yield* PromptValidator
      const report = yield* validator.validatePromptAlignment([
        new ExampleData({
          text: "Alice visited Paris.",
          extractions: [
            new Extraction({
              extractionClass: "person",
              extractionText: "Alice"
            })
          ]
        })
      ])

      expect(report.issues.length).toBe(0)
    }).pipe(Effect.provide(PromptValidator.Default))
  )
})
