import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { Chunk, Clock, Effect, Layer, Stream } from "effect"

import { AlignmentExecutor } from "../../src/AlignmentExecutor.js"
import { Annotator } from "../../src/Annotator.js"
import { Document, type Document as DocumentType } from "../../src/Data.js"
import { DocumentIdGenerator } from "../../src/Data.js"
import { FormatHandler } from "../../src/FormatHandler.js"
import { LanguageModel } from "../../src/LanguageModel.js"
import { PromptBuilder } from "../../src/Prompting.js"
import { Resolver } from "../../src/Resolver.js"
import { Tokenizer } from "../../src/Tokenizer.js"

type RoundResult = {
  readonly round: number
  readonly durationMs: number
  readonly extractionCount: number
}

type PerfReport = {
  readonly benchmark: "annotator-throughput"
  readonly generatedAt: string
  readonly rounds: number
  readonly warmupRounds: number
  readonly documentCount: number
  readonly totalChars: number
  readonly options: {
    readonly maxCharBuffer: number
    readonly batchLength: number
    readonly batchConcurrency: number
    readonly providerConcurrency: number
    readonly extractionPasses: number
  }
  readonly timingsMs: ReadonlyArray<number>
  readonly summary: {
    readonly minMs: number
    readonly maxMs: number
    readonly avgMs: number
  }
  readonly extractionCountPerRound: ReadonlyArray<number>
  readonly outputPath: string
}

const warmupRounds = 1
const measuredRounds = 5

const benchmarkOptions = {
  maxCharBuffer: 700,
  batchLength: 8,
  batchConcurrency: 2,
  providerConcurrency: 4,
  extractionPasses: 1
} as const

const fixtureSentence =
  "Alice visited Paris and met Bob near the central train station."

const makeDocuments = (): ReadonlyArray<DocumentType> => {
  const section = Array.from(
    { length: 220 },
    (_, index) => `Section ${index + 1}: ${fixtureSentence}`
  ).join(" ")

  return Array.from(
    { length: 4 },
    (_, index) =>
      new Document({
        documentId: `perf-doc-${index + 1}`,
        text: section
      })
  )
}

const resolverLayer = Layer.provide(Resolver.DefaultWithoutDependencies, [
  Tokenizer.Default,
  FormatHandler.Default
])

const alignmentExecutorLayer = Layer.provide(
  AlignmentExecutor.DefaultWithoutDependencies,
  [resolverLayer]
)

const annotatorLayer = Layer.provide(Annotator.DefaultWithoutDependencies, [
  Tokenizer.Default,
  PromptBuilder.Default,
  FormatHandler.Default,
  alignmentExecutorLayer,
  resolverLayer,
  LanguageModel.testLayer({
    provider: "perf-fixture",
    modelId: "perf-model",
    defaultText: "[]"
  }),
  DocumentIdGenerator.Default
])

const runRound = (
  round: number,
  documents: ReadonlyArray<DocumentType>
): Effect.Effect<RoundResult, never, Annotator> =>
  Effect.gen(function* () {
    const annotator = yield* Annotator
    const startedAt = yield* Clock.currentTimeMillis
    const annotated = yield* annotator
      .annotateDocuments(documents, benchmarkOptions)
      .pipe(Stream.runCollect)
    const finishedAt = yield* Clock.currentTimeMillis

    const extractionCount = Chunk.toReadonlyArray(annotated).reduce(
      (sum, document) => sum + document.extractions.length,
      0
    )

    return {
      round,
      durationMs: Math.max(0, finishedAt - startedAt),
      extractionCount
    }
  })

const average = (values: ReadonlyArray<number>): number => {
  if (values.length === 0) {
    return 0
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const makeReport = (
  rounds: ReadonlyArray<RoundResult>,
  outputPath: string,
  documents: ReadonlyArray<DocumentType>
): PerfReport => {
  const timingsMs = rounds.map((round) => round.durationMs)
  return {
    benchmark: "annotator-throughput",
    generatedAt: new Date().toISOString(),
    rounds: measuredRounds,
    warmupRounds,
    documentCount: documents.length,
    totalChars: documents.reduce((sum, document) => sum + document.text.length, 0),
    options: benchmarkOptions,
    timingsMs,
    summary: {
      minMs: timingsMs.length === 0 ? 0 : Math.min(...timingsMs),
      maxMs: timingsMs.length === 0 ? 0 : Math.max(...timingsMs),
      avgMs: average(timingsMs)
    },
    extractionCountPerRound: rounds.map((round) => round.extractionCount),
    outputPath
  }
}

const runBenchmark = Effect.gen(function* () {
  const documents = makeDocuments()

  for (let index = 0; index < warmupRounds; index += 1) {
    yield* runRound(index + 1, documents)
  }

  const rounds = yield* Effect.forEach(
    Array.from({ length: measuredRounds }, (_, index) => index + 1),
    (round) => runRound(round, documents)
  )

  const outputDir = path.join(process.cwd(), ".cache", "perf")
  mkdirSync(outputDir, { recursive: true })

  const timestamp = new Date().toISOString().replaceAll(":", "-")
  const outputPath = path.join(outputDir, `annotator-throughput-${timestamp}.json`)
  const latestPath = path.join(outputDir, "annotator-throughput.latest.json")

  const report = makeReport(rounds, outputPath, documents)
  const reportJson = `${JSON.stringify(report, null, 2)}\n`
  writeFileSync(outputPath, reportJson, "utf8")
  writeFileSync(latestPath, reportJson, "utf8")

  const showReport = process.argv.includes("--report")
  if (showReport) {
    console.log(reportJson)
  } else {
    console.log(
      `annotator throughput benchmark complete: avg=${report.summary.avgMs.toFixed(2)}ms min=${report.summary.minMs}ms max=${report.summary.maxMs}ms`
    )
    console.log(`report: ${outputPath}`)
  }
})

Effect.runPromise(runBenchmark.pipe(Effect.provide(annotatorLayer))).catch(
  (error: unknown) => {
    console.error(
      error instanceof Error
        ? error.message
        : `perf benchmark failed: ${String(error)}`
    )
    process.exitCode = 1
  }
)
