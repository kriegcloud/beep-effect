import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { Effect, Layer, Schema } from "effect"

import { AlignmentExecutor } from "../../src/AlignmentExecutor.js"
import {
  AnnotatedDocument,
  CharInterval,
  DocumentIdGenerator,
  ExampleData
} from "../../src/Data.js"
import { InferenceConfigError } from "../../src/Errors.js"
import { FormatHandler } from "../../src/FormatHandler.js"
import { Ingestion } from "../../src/Ingestion.js"
import { LanguageModel } from "../../src/LanguageModel.js"
import { PrimedCache, PrimedCachePolicy } from "../../src/PrimedCache.js"
import { PromptBuilder } from "../../src/Prompting.js"
import { Resolver } from "../../src/Resolver.js"
import { extract } from "../../src/api/Extraction.js"
import {
  IngestionRequest,
  IngestionSourceText
} from "../../src/ingestion/Models.js"
import { Annotator } from "../../src/index.js"
import { Tokenizer } from "../../src/index.js"

const ParityCasesJson = Schema.parseJson(
  Schema.Array(
    Schema.Struct({
      id: Schema.String,
      text: Schema.String,
      promptDescription: Schema.String,
      examples: Schema.Array(ExampleData),
      modelOutput: Schema.String
    })
  )
)
type ParityCase = (typeof ParityCasesJson)["Type"][number]

export class NormalizedExtraction extends Schema.Class<NormalizedExtraction>(
  "NormalizedExtraction"
)({
  extractionClass: Schema.String,
  extractionText: Schema.String,
  alignmentStatus: Schema.optionalWith(Schema.String, { exact: true }),
  charInterval: Schema.optionalWith(CharInterval, { exact: true }),
  attributes: Schema.optionalWith(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Array(Schema.String))
    }),
    { exact: true }
  )
}) {}

export class NormalizedAnnotatedDocument extends Schema.Class<NormalizedAnnotatedDocument>(
  "NormalizedAnnotatedDocument"
)({
  text: Schema.String,
  extractions: Schema.Array(NormalizedExtraction)
}) {}

const BaselineMap = Schema.Record({
  key: Schema.String,
  value: NormalizedAnnotatedDocument
})
const BaselineMapJson = Schema.parseJson(BaselineMap)
type BaselineMap = typeof BaselineMap.Type

export type ParityHarnessOptions = {
  readonly fixturesPath: string
  readonly baselinesPath: string
  readonly outputDir: string
  readonly writeBaselines: boolean
}

export type ParityCaseResult = {
  readonly id: string
  readonly passed: boolean
  readonly mismatchPath?: string | undefined
  readonly expectedPath?: string | undefined
  readonly actualPath: string
}

export type ParityHarnessReport = {
  readonly generatedAt: string
  readonly fixturesPath: string
  readonly baselinesPath: string
  readonly outputDir: string
  readonly cases: number
  readonly passed: number
  readonly failed: number
  readonly wroteBaselines: boolean
  readonly results: ReadonlyArray<ParityCaseResult>
}

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error)

const decodeCases = (json: string): Effect.Effect<ReadonlyArray<ParityCase>, Error> =>
  Schema.decode(ParityCasesJson)(json).pipe(
    Effect.mapError(
      (error) => new Error(`Failed to decode parity fixtures: ${String(error)}`)
    )
  )

const decodeBaselines = (json: string): Effect.Effect<BaselineMap, Error> =>
  Schema.decode(BaselineMapJson)(json).pipe(
    Effect.mapError(
      (error) => new Error(`Failed to decode parity baselines: ${String(error)}`)
    )
  )

const toPrettyJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`

const sortAttributeRecord = (
  attributes: Readonly<Record<string, string | ReadonlyArray<string>>> | undefined
): Readonly<Record<string, string | ReadonlyArray<string>>> | undefined => {
  if (attributes === undefined) {
    return undefined
  }
  const sortedEntries = Object.entries(attributes).sort(([left], [right]) =>
    left.localeCompare(right)
  )
  return Object.fromEntries(sortedEntries)
}

export const normalizeAnnotatedDocument = (
  document: AnnotatedDocument
): NormalizedAnnotatedDocument =>
  new NormalizedAnnotatedDocument({
    text: document.text,
    extractions: document.extractions.map(
      (extraction) =>
        new NormalizedExtraction({
          extractionClass: extraction.extractionClass,
          extractionText: extraction.extractionText,
          ...(extraction.alignmentStatus !== undefined
            ? { alignmentStatus: extraction.alignmentStatus }
            : {}),
          ...(extraction.charInterval !== undefined
            ? {
                charInterval: new CharInterval({
                  startPos: extraction.charInterval.startPos,
                  endPos: extraction.charInterval.endPos
                })
              }
            : {}),
          ...(extraction.attributes !== undefined
            ? { attributes: sortAttributeRecord(extraction.attributes) }
            : {})
        })
    )
  })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const findFirstDiffPath = (
  expected: unknown,
  actual: unknown,
  currentPath = "$"
): string | undefined => {
  if (Object.is(expected, actual)) {
    return undefined
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      return `${currentPath}.length`
    }
    for (let index = 0; index < expected.length; index += 1) {
      const diff = findFirstDiffPath(
        expected[index],
        actual[index],
        `${currentPath}[${index}]`
      )
      if (diff !== undefined) {
        return diff
      }
    }
    return undefined
  }

  if (isRecord(expected) && isRecord(actual)) {
    const expectedKeys = Object.keys(expected).sort()
    const actualKeys = Object.keys(actual).sort()

    const keyDiff = findFirstDiffPath(expectedKeys, actualKeys, `${currentPath}.__keys`)
    if (keyDiff !== undefined) {
      return keyDiff
    }

    for (const key of expectedKeys) {
      const diff = findFirstDiffPath(
        expected[key],
        actual[key],
        `${currentPath}.${key}`
      )
      if (diff !== undefined) {
        return diff
      }
    }
    return undefined
  }

  return currentPath
}

const makeRuntimeLayer = (
  modelOutput: string
): Layer.Layer<Annotator | PrimedCache | Ingestion | DocumentIdGenerator> => {
  const resolverLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
    Tokenizer.Default,
    FormatHandler.Default
  ])

  const alignmentExecutorLayer = Layer.provide(
    AlignmentExecutor.DefaultWithoutDependencies,
    [resolverLayer]
  )

  const documentIdLayer = DocumentIdGenerator.testLayer()

  const annotatorLayer = Layer.provide(Annotator.DefaultWithoutDependencies, [
    Tokenizer.Default,
    PromptBuilder.Default,
    FormatHandler.Default,
    alignmentExecutorLayer,
    resolverLayer,
    LanguageModel.testLayer({
      provider: "parity-fixture",
      modelId: "parity-fixture-model",
      defaultText: modelOutput
    }),
    documentIdLayer
  ])

  return Layer.mergeAll(
    annotatorLayer,
    documentIdLayer,
    Ingestion.Default,
    PrimedCache.testLayer({
      enableRequestStore: true,
      enableSessionStore: false
    })
  )
}

const runParityCase = (
  parityCase: ParityCase
): Effect.Effect<NormalizedAnnotatedDocument, Error> =>
  extract({
    ingestion: new IngestionRequest({
      source: new IngestionSourceText({
        _tag: "text",
        text: parityCase.text
      }),
      format: "text"
    }),
    prompt: {
      description: parityCase.promptDescription,
      examples: parityCase.examples
    },
    annotate: {
      maxCharBuffer: 500,
      batchLength: 4,
      batchConcurrency: 1,
      providerConcurrency: 2,
      extractionPasses: 1
    },
    cachePolicy: new PrimedCachePolicy({
      enabled: false,
      namespace: `parity-${parityCase.id}`,
      ttlSeconds: 60,
      deterministicOnly: true
    }),
    clearPrimedCacheOnStart: false
  }).pipe(
    Effect.flatMap((documents) => {
      const firstDocument = documents[0]
      if (firstDocument === undefined) {
        return Effect.fail(
          new InferenceConfigError({
            message: `Parity case '${parityCase.id}' produced zero documents.`
          })
        )
      }
      return Effect.succeed(normalizeAnnotatedDocument(firstDocument))
    }),
    Effect.provide(makeRuntimeLayer(parityCase.modelOutput)),
    Effect.mapError(
      (error) =>
        new Error(
          `Parity case '${parityCase.id}' failed: ${
            error instanceof InferenceConfigError ? error.message : toErrorMessage(error)
          }`
        )
    )
  )

const ensureDir = (directory: string): void => {
  mkdirSync(directory, { recursive: true })
}

const readText = (filePath: string): Effect.Effect<string, Error> =>
  Effect.try({
    try: () => readFileSync(filePath, "utf8"),
    catch: (error) =>
      new Error(`Failed to read file '${filePath}': ${toErrorMessage(error)}`)
  })

const writeText = (filePath: string, value: string): Effect.Effect<void, Error> =>
  Effect.try({
    try: () => writeFileSync(filePath, value, "utf8"),
    catch: (error) =>
      new Error(`Failed to write file '${filePath}': ${toErrorMessage(error)}`)
  })

const sortedBaselineMap = (map: BaselineMap): BaselineMap =>
  Object.fromEntries(
    Object.entries(map).sort(([left], [right]) => left.localeCompare(right))
  )

const loadBaselines = (
  baselinesPath: string
): Effect.Effect<BaselineMap, Error> => {
  if (!existsSync(baselinesPath)) {
    return Effect.succeed({})
  }
  return readText(baselinesPath).pipe(Effect.flatMap(decodeBaselines))
}

export const runParityHarness = (
  options: ParityHarnessOptions
): Effect.Effect<ParityHarnessReport, Error> =>
  Effect.gen(function* () {
    ensureDir(options.outputDir)
    const actualDir = path.join(options.outputDir, "actual")
    ensureDir(actualDir)

    const fixturesJson = yield* readText(options.fixturesPath)
    const cases = yield* decodeCases(fixturesJson)
    const baselines = yield* loadBaselines(options.baselinesPath)

    const caseRuns = yield* Effect.forEach(cases, (parityCase) =>
      Effect.gen(function* () {
        const normalized = yield* runParityCase(parityCase)
        const actualPath = path.join(actualDir, `${parityCase.id}.json`)
        yield* writeText(actualPath, toPrettyJson(normalized))
        return { parityCase, normalized, actualPath } as const
      })
    )

    const actualBaselines: BaselineMap = Object.fromEntries(
      caseRuns.map(({ parityCase, normalized }) => [parityCase.id, normalized])
    )

    if (options.writeBaselines) {
      yield* writeText(
        options.baselinesPath,
        toPrettyJson(sortedBaselineMap(actualBaselines))
      )
    }

    const results: ReadonlyArray<ParityCaseResult> = caseRuns.map(
      ({ parityCase, normalized, actualPath }) => {
        const expected = baselines[parityCase.id]
        const mismatchPath =
          options.writeBaselines
            ? undefined
            : expected === undefined
              ? "$.__missing_baseline__"
              : findFirstDiffPath(expected, normalized)

        return {
          id: parityCase.id,
          passed: mismatchPath === undefined,
          ...(mismatchPath !== undefined ? { mismatchPath } : {}),
          ...(expected !== undefined
            ? { expectedPath: `${options.baselinesPath}#${parityCase.id}` }
            : {}),
          actualPath
        }
      }
    )

    const passed = results.filter((result) => result.passed).length
    const failed = results.length - passed

    return {
      generatedAt: new Date().toISOString(),
      fixturesPath: options.fixturesPath,
      baselinesPath: options.baselinesPath,
      outputDir: options.outputDir,
      cases: results.length,
      passed,
      failed,
      wroteBaselines: options.writeBaselines,
      results
    } as const
  })

const parseCliArgs = (
  args: ReadonlyArray<string>
): {
  readonly options: ParityHarnessOptions
  readonly report: boolean
} => {
  const parsed = {
    fixturesPath: path.join(process.cwd(), "test/fixtures/parity/cases.json"),
    baselinesPath: path.join(process.cwd(), "test/fixtures/parity/baselines.json"),
    outputDir: path.join(process.cwd(), ".cache/parity"),
    writeBaselines: false,
    report: false
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === "--fixtures") {
      const value = args[index + 1]
      if (value === undefined) {
        throw new Error("Missing value for --fixtures")
      }
      parsed.fixturesPath = path.resolve(value)
      index += 1
      continue
    }
    if (arg === "--baselines") {
      const value = args[index + 1]
      if (value === undefined) {
        throw new Error("Missing value for --baselines")
      }
      parsed.baselinesPath = path.resolve(value)
      index += 1
      continue
    }
    if (arg === "--output-dir") {
      const value = args[index + 1]
      if (value === undefined) {
        throw new Error("Missing value for --output-dir")
      }
      parsed.outputDir = path.resolve(value)
      index += 1
      continue
    }
    if (arg === "--write-baselines") {
      parsed.writeBaselines = true
      continue
    }
    if (arg === "--report") {
      parsed.report = true
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return {
    options: {
      fixturesPath: parsed.fixturesPath,
      baselinesPath: parsed.baselinesPath,
      outputDir: parsed.outputDir,
      writeBaselines: parsed.writeBaselines
    },
    report: parsed.report
  }
}

const writeReportFiles = (report: ParityHarnessReport): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const timestamp = report.generatedAt.replaceAll(":", "-")
    const latestPath = path.join(report.outputDir, "extract-diff-report.latest.json")
    const datedPath = path.join(report.outputDir, `extract-diff-report-${timestamp}.json`)
    const reportJson = `${JSON.stringify(report, null, 2)}\n`
    yield* writeText(latestPath, reportJson)
    yield* writeText(datedPath, reportJson)
  })

export const runCli = (argv: ReadonlyArray<string>): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    const { options, report } = parseCliArgs(argv)
    const parityReport = yield* runParityHarness(options)
    yield* writeReportFiles(parityReport)

    if (report) {
      console.log(JSON.stringify(parityReport, null, 2))
    } else {
      console.log(
        `parity diff complete: passed=${parityReport.passed} failed=${parityReport.failed} cases=${parityReport.cases}`
      )
      console.log(`report: ${path.join(options.outputDir, "extract-diff-report.latest.json")}`)
      if (options.writeBaselines) {
        console.log(`updated baselines: ${options.baselinesPath}`)
      }
    }

    if (!options.writeBaselines && parityReport.failed > 0) {
      return yield* Effect.fail(
        new Error(
          `Parity diff failed for ${parityReport.failed} case(s). See report for mismatch paths.`
        )
      )
    }
  })

if (import.meta.main) {
  Effect.runPromise(runCli(process.argv.slice(2))).catch((error: unknown) => {
    console.error(toErrorMessage(error))
    process.exitCode = 1
  })
}
