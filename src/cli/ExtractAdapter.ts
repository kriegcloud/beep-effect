import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import { Effect, Layer, Schema, Stream } from "effect"
import * as Console from "effect/Console"

import type { ProviderRuntimeConfig } from "../api/ExecutionLayer.js"
import {
  makeExtractionExecutionLayer
} from "../api/ExecutionLayer.js"
import { extract, extractStream } from "../api/Extraction.js"
import { renderDocuments } from "../api/Render.js"
import { AnnotatedDocument, DocumentIdGenerator, ExampleData } from "../Data.js"
import { encodeAnnotatedDocumentJson } from "../DataLib.js"
import { InferenceConfigError } from "../Errors.js"
import { Ingestion } from "../Ingestion.js"
import {
  AdditionalContextMapping,
  CsvIngestionOptions,
  DocumentMappingSpec,
  FieldSelector,
  IngestionRequest,
  IngestionSourceFile,
  IngestionSourceStdin,
  IngestionSourceText,
  IngestionSourceUrl
} from "../ingestion/Models.js"
import { isHttpUrl } from "../ingestion/SourceReaders.js"
import { readTextFile, writeTextFile } from "../IO.js"
import { PrimedCachePolicy } from "../PrimedCache.js"
import {
  type CliRuntimeOptions,
  type ResolvedExtractCommandConfig
} from "./index.js"

const ExamplesJson = Schema.parseJson(Schema.Array(ExampleData))

const toInferenceConfigError = (
  message: string
) => (error: unknown): InferenceConfigError =>
  error instanceof InferenceConfigError
    ? error
    : new InferenceConfigError({
        message: `${message}: ${String(error)}`
      })

const decodeExamples = (
  raw: string,
  examplesPath: string
): Effect.Effect<ReadonlyArray<ExampleData>, InferenceConfigError> =>
  Schema.decodeUnknown(ExamplesJson)(raw).pipe(
    Effect.mapError(
      (error) =>
        new InferenceConfigError({
          message: `Failed to decode examples file (${examplesPath}): ${String(error)}`
        })
    )
  )

const readExamples = (
  examplesPath: string
): Effect.Effect<ReadonlyArray<ExampleData>, InferenceConfigError, FileSystem.FileSystem> =>
  readTextFile(examplesPath).pipe(
    Effect.mapError(
      (error) =>
        new InferenceConfigError({
          message: error.message
        })
    ),
    Effect.flatMap((raw) => decodeExamples(raw, examplesPath))
  )

const buildDocumentMapping = (
  config: ResolvedExtractCommandConfig
): DocumentMappingSpec | undefined => {
  const hasAnyFieldMapping =
    config.textField !== undefined ||
    config.idField !== undefined ||
    config.contextField.length > 0

  if (!hasAnyFieldMapping) {
    return undefined
  }

  const contextFields = config.contextField
    .map((field) => field.trim())
    .filter((field) => field.length > 0)

  return new DocumentMappingSpec({
    ...(config.textField !== undefined
      ? {
          text: new FieldSelector({
            path: config.textField,
            required: true,
            trim: true
          })
        }
      : {}),
    ...(config.idField !== undefined
      ? {
          documentId: new FieldSelector({
            path: config.idField,
            required: false,
            trim: true
          })
        }
      : {}),
    ...(contextFields.length === 1 && contextFields[0] !== undefined
      ? {
          additionalContext: new FieldSelector({
            path: contextFields[0],
            required: false,
            trim: true
          })
        }
      : contextFields.length > 1
        ? {
            additionalContext: new AdditionalContextMapping({
              fields: contextFields.map(
                (path) =>
                  new FieldSelector({
                    path,
                    required: false,
                    trim: true
                  })
              ),
              includeFieldNames: true,
              joinWith: "\n"
            })
          }
        : {})
  })
}

export const resolveIngestionRequest = (
  config: ResolvedExtractCommandConfig
): Effect.Effect<IngestionRequest, InferenceConfigError> => {
  if (config.input === undefined || config.input.trim().length === 0) {
    return Effect.fail(
      new InferenceConfigError({
        message: "Extract command requires --input."
      })
    )
  }

  const input = config.input.trim()
  const mapping = buildDocumentMapping(config)

  if (config.inputFormat === "text") {
    return Effect.succeed(
      new IngestionRequest({
        source: new IngestionSourceText({ _tag: "text", text: input }),
        format: "text",
        ...(mapping !== undefined ? { mapping } : {}),
        onRowError: config.rowErrorMode
      })
    )
  }

  if (config.inputFormat === "url") {
    if (!isHttpUrl(input)) {
      return Effect.fail(
        new InferenceConfigError({
          message: "--input-format url requires an http/https URL in --input."
        })
      )
    }

    return Effect.succeed(
      new IngestionRequest({
        source: new IngestionSourceUrl({ _tag: "url", url: input }),
        format: "text",
        ...(mapping !== undefined ? { mapping } : {}),
        onRowError: config.rowErrorMode
      })
    )
  }

  const source =
    config.inputFormat === "stdin" || input === "-"
      ? new IngestionSourceStdin({ _tag: "stdin" })
      : isHttpUrl(input)
        ? new IngestionSourceUrl({ _tag: "url", url: input })
        : new IngestionSourceFile({ _tag: "file", path: input })

  const format =
    config.inputFormat === "stdin" || config.inputFormat === "auto"
      ? "auto"
      : config.inputFormat

  return Effect.succeed(
    new IngestionRequest({
      source,
      format,
      ...(mapping !== undefined ? { mapping } : {}),
      ...(config.csvDelimiter !== undefined || config.csvHeader !== undefined
        ? {
            csv: new CsvIngestionOptions({
              ...(config.csvDelimiter !== undefined
                ? { delimiter: config.csvDelimiter }
                : {}),
              ...(config.csvHeader !== undefined
                ? { hasHeader: config.csvHeader }
                : {})
            })
          }
        : {}),
      onRowError: config.rowErrorMode
    })
  )
}

const resolveProviderRuntimeConfig = (
  config: ResolvedExtractCommandConfig
): ProviderRuntimeConfig => {
  switch (config.provider) {
    case "anthropic":
      return {
        provider: "anthropic",
        modelId: config.modelId,
        temperature: config.temperature,
        apiKey: config.anthropicApiKey,
        baseUrl: config.anthropicBaseUrl,
        providerConcurrency: config.providerConcurrency,
        primedCacheNamespace: config.primedCacheNamespace
      }
    case "openai":
      return {
        provider: "openai",
        modelId: config.modelId,
        temperature: config.temperature,
        apiKey: config.openAiApiKey,
        baseUrl: config.openAiBaseUrl,
        organization: config.openAiOrganization,
        providerConcurrency: config.providerConcurrency,
        primedCacheNamespace: config.primedCacheNamespace
      }
    case "ollama":
      return {
        provider: "ollama",
        modelId: config.modelId,
        temperature: config.temperature,
        baseUrl: config.ollamaBaseUrl,
        providerConcurrency: config.providerConcurrency,
        primedCacheNamespace: config.primedCacheNamespace
      }
    case "gemini":
      return {
        provider: "gemini",
        modelId: config.modelId,
        temperature: config.temperature,
        apiKey: config.geminiApiKey,
        baseUrl: config.geminiBaseUrl,
        providerConcurrency: config.providerConcurrency,
        primedCacheNamespace: config.primedCacheNamespace
      }
  }
}

const makeExecutionLayer = (
  config: ResolvedExtractCommandConfig,
  runtime: CliRuntimeOptions
) =>
  makeExtractionExecutionLayer(resolveProviderRuntimeConfig(config), {
    primedCacheStoreLayer: runtime.primedCacheStoreLayer,
    languageModelLayer: runtime.languageModelLayer,
    alignmentExecutorLayer: runtime.alignmentExecutorLayer
  })

const writeJsonlStream = <R>(
  config: ResolvedExtractCommandConfig,
  runtime: CliRuntimeOptions,
  documents: Stream.Stream<AnnotatedDocument, InferenceConfigError, R>
): Effect.Effect<void, InferenceConfigError, FileSystem.FileSystem | R> =>
  Effect.gen(function* () {
    const encoded = documents.pipe(
      Stream.mapEffect((document) =>
        encodeAnnotatedDocumentJson(document).pipe(
          Effect.mapError(
            (error) =>
              new InferenceConfigError({
                message: `Failed to encode annotated document JSONL row: ${String(error)}`
              })
          )
        )
      ),
      Stream.map((row) => `${row}\n`)
    )

    if (config.outputPath !== undefined) {
      const fileSystem = yield* FileSystem.FileSystem
      const encoder = new TextEncoder()
      yield* encoded.pipe(
        Stream.map((row) => encoder.encode(row)),
        Stream.run(fileSystem.sink(config.outputPath)),
        Effect.mapError(toInferenceConfigError("Failed to write JSONL output"))
      )
      return
    }

    if (runtime.emitResultToStdout !== false) {
      yield* encoded.pipe(
        Stream.runForEach((row) => Console.log(row.slice(0, -1))),
        Effect.mapError(toInferenceConfigError("Failed to emit JSONL output"))
      )
      return
    }

    yield* encoded.pipe(Stream.runDrain)
  })

export const runExtractAdapter = (
  config: ResolvedExtractCommandConfig,
  runtime: CliRuntimeOptions
): Effect.Effect<
  void,
  InferenceConfigError,
  FileSystem.FileSystem | HttpClient.HttpClient
> =>
  Effect.gen(function* () {
    const ingestionRequest = yield* resolveIngestionRequest(config)
    const examples = yield* readExamples(config.examplesFile)
    if (examples.length === 0) {
      return yield* new InferenceConfigError({
        message: "Examples are required for reliable extraction."
      })
    }

    const extractRequest = {
      ingestion: ingestionRequest,
      prompt: {
        description: config.prompt,
        examples
      },
      annotate: {
        maxCharBuffer: config.maxCharBuffer,
        batchLength: config.batchLength,
        batchConcurrency: config.batchConcurrency,
        providerConcurrency: config.providerConcurrency,
        extractionPasses: config.extractionPasses,
        ...(config.contextWindowChars !== undefined
          ? { contextWindowChars: config.contextWindowChars }
          : {}),
        ...(config.maxBatchInputTokens !== undefined
          ? { maxBatchInputTokens: config.maxBatchInputTokens }
          : {}),
        documentBatchSize: config.documentBatchSize
      },
      cachePolicy: new PrimedCachePolicy({
        enabled: config.primedCacheEnabled,
        namespace: config.primedCacheNamespace,
        ttlSeconds: config.primedCacheTtlSeconds,
        deterministicOnly: config.primedCacheDeterministicOnly
      }),
      clearPrimedCacheOnStart: config.clearPrimedCacheOnStart,
      requireNonEmptyResult: true
    } as const

    const executionLayer = makeExecutionLayer(config, runtime)
    const fullExtractLayer = Layer.mergeAll(
      executionLayer,
      Ingestion.Default,
      DocumentIdGenerator.Default
    )

    if (config.output === "jsonl") {
      const extracted = extractStream(extractRequest).pipe(
        Stream.mapError(toInferenceConfigError("Failed to extract documents"))
      )

      yield* writeJsonlStream(config, runtime, extracted).pipe(
        Effect.provide(fullExtractLayer)
      )
      return
    }

    const documents = yield* extract(extractRequest).pipe(
      Effect.mapError(toInferenceConfigError("Failed to extract documents")),
      Effect.provide(fullExtractLayer)
    )

    const outputText = yield* renderDocuments({
      documents,
      format: config.output
    }).pipe(Effect.provide(executionLayer))

    if (config.outputPath !== undefined) {
      yield* writeTextFile(config.outputPath, outputText).pipe(
        Effect.mapError(
          (error) =>
            new InferenceConfigError({
              message: error.message
            })
        )
      )
      return
    }

    if (runtime.emitResultToStdout !== false) {
      yield* Console.log(outputText)
    }
  })
