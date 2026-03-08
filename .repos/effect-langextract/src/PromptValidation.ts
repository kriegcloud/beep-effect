import { Effect, Layer, Schema } from "effect"

import { ExampleData } from "./Data.js"
import { PromptAlignmentError } from "./Errors.js"
import { Resolver } from "./Resolver.js"

export const PromptValidationLevel = Schema.Literal("off", "warning", "error")
export type PromptValidationLevel = typeof PromptValidationLevel.Type

export class AlignmentPolicy extends Schema.Class<AlignmentPolicy>("AlignmentPolicy")({
  enableFuzzyAlignment: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  }),
  fuzzyAlignmentThreshold: Schema.optionalWith(Schema.Number, {
    default: () => 0.75
  }),
  acceptMatchLesser: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  })
}) {}

export class ValidationIssue extends Schema.Class<ValidationIssue>("ValidationIssue")({
  exampleIndex: Schema.Int,
  exampleId: Schema.optionalWith(Schema.String, { exact: true }),
  extractionClass: Schema.String,
  extractionTextPreview: Schema.String,
  alignmentStatus: Schema.optionalWith(Schema.String, { exact: true }),
  issueKind: Schema.Literal("failed", "non_exact"),
  charInterval: Schema.optionalWith(Schema.Tuple(Schema.Int, Schema.Int), { exact: true }),
  tokenInterval: Schema.optionalWith(Schema.Tuple(Schema.Int, Schema.Int), { exact: true })
}) {}

export class ValidationReport extends Schema.Class<ValidationReport>("ValidationReport")({
  issues: Schema.Array(ValidationIssue)
}) {
  get hasFailed(): boolean {
    return this.issues.some((issue) => issue.issueKind === "failed")
  }

  get hasNonExact(): boolean {
    return this.issues.some((issue) => issue.issueKind === "non_exact")
  }
}

export interface PromptValidatorService {
  readonly validatePromptAlignment: (
    examples: ReadonlyArray<ExampleData>,
    policy?: AlignmentPolicy
  ) => Effect.Effect<ValidationReport>

  readonly handleAlignmentReport: (
    report: ValidationReport,
    level: PromptValidationLevel,
    options?: { strictNonExact?: boolean }
  ) => Effect.Effect<void, PromptAlignmentError>
}

const validatePromptAlignmentImpl = (
  examples: ReadonlyArray<ExampleData>,
  policy: AlignmentPolicy | undefined,
  resolver: Resolver
): Effect.Effect<ValidationReport> =>
  Effect.gen(function* () {
    const issues: Array<ValidationIssue> = []

    for (const [exampleIndex, example] of examples.entries()) {
      if (example.extractions.length === 0) {
        continue
      }

      const aligned = yield* resolver
        .align(example.extractions, example.text, 0, 0, {
          enableFuzzyAlignment: policy?.enableFuzzyAlignment ?? true,
          fuzzyAlignmentThreshold: policy?.fuzzyAlignmentThreshold ?? 0.75,
          acceptMatchLesser: policy?.acceptMatchLesser ?? true
        })
        .pipe(Effect.catchAll(() => Effect.succeed([] as const)))

      for (const extraction of example.extractions) {
        const match = aligned.find(
          (candidate) =>
            candidate.extractionClass === extraction.extractionClass &&
            candidate.extractionText === extraction.extractionText
        )

        const status = match?.alignmentStatus
        const isResolved =
          status !== undefined &&
          match?.charInterval?.startPos !== undefined &&
          match?.charInterval?.endPos !== undefined &&
          match?.tokenInterval?.startIndex !== undefined &&
          match?.tokenInterval?.endIndex !== undefined

        if (!isResolved) {
          issues.push(
            new ValidationIssue({
              exampleIndex,
              extractionClass: extraction.extractionClass,
              extractionTextPreview: extraction.extractionText.slice(0, 80),
              issueKind: "failed"
            })
          )
          continue
        }

        if (status !== "match_exact") {
          issues.push(
            new ValidationIssue({
              exampleIndex,
              extractionClass: extraction.extractionClass,
              extractionTextPreview: extraction.extractionText.slice(0, 80),
              alignmentStatus: status,
              issueKind: "non_exact",
              charInterval: [
                match.charInterval?.startPos ?? 0,
                match.charInterval?.endPos ?? 0
              ],
              tokenInterval: [
                match.tokenInterval?.startIndex ?? 0,
                match.tokenInterval?.endIndex ?? 0
              ]
            })
          )
        }
      }
    }

    return new ValidationReport({ issues })
  })

const handleAlignmentReportImpl = (
  report: ValidationReport,
  level: PromptValidationLevel,
  options?: { strictNonExact?: boolean }
): Effect.Effect<void, PromptAlignmentError> => {
  if (level === "error" && report.hasFailed) {
    return Effect.fail(
      new PromptAlignmentError({
        message: "Prompt validation failed due to unresolved extraction alignments."
      })
    )
  }

  if (level === "error" && options?.strictNonExact && report.hasNonExact) {
    return Effect.fail(
      new PromptAlignmentError({
        message: "Prompt validation found non-exact alignments in strict mode."
      })
    )
  }

  return Effect.void
}

export class PromptValidator extends Effect.Service<PromptValidator>()(
  "@effect-langextract/PromptValidator",
  {
    dependencies: [Resolver.Default],
    effect: Effect.gen(function* () {
      const resolver = yield* Resolver
      return {
        validatePromptAlignment: (examples, policy) =>
          validatePromptAlignmentImpl(examples, policy, resolver),
        handleAlignmentReport: handleAlignmentReportImpl
      } satisfies PromptValidatorService
    })
  }
) {
  static readonly Test: Layer.Layer<PromptValidator> = PromptValidator.Default

  static testLayer = (
    service?: PromptValidatorService
  ): Layer.Layer<PromptValidator, never, Resolver> =>
    service !== undefined
      ? Layer.succeed(PromptValidator, PromptValidator.make(service))
      : PromptValidator.DefaultWithoutDependencies
}

export const PromptValidatorLive: Layer.Layer<PromptValidator> = PromptValidator.Default

export const PromptValidatorTest: Layer.Layer<PromptValidator> = PromptValidator.Test
