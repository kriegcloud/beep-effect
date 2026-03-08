import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import { Chunk, Effect, Stream } from "effect"

import { Annotator } from "../Annotator.js"
import { AnnotatedDocument, DocumentIdGenerator, ExampleData, Extraction } from "../Data.js"
import type {
  AnyExtractionTarget,
  ExtractionClassSchema,
  ExtractionTarget
} from "../ExtractionTarget.js"
import {
  InferenceConfigError,
  LangExtractError,
  PrimedCacheError
} from "../Errors.js"
import type { IngestionError } from "../Ingestion.js"
import { ingestDocuments,Ingestion } from "../Ingestion.js"
import { extractDocumentsStream } from "../ingestion/ExtractDocuments.js"
import { IngestionRequest } from "../ingestion/Models.js"
import { PrimedCache, PrimedCachePolicy } from "../PrimedCache.js"
import {
  SCHEMA_DATA_ATTRIBUTE_KEY,
  toTypedAnnotatedDocument,
  type TypedAnnotatedDocument
} from "../TypedExtraction.js"

export interface ExtractAnnotateConfig {
  readonly maxCharBuffer: number
  readonly batchLength: number
  readonly batchConcurrency: number
  readonly providerConcurrency: number
  readonly extractionPasses: number
  readonly contextWindowChars?: number | undefined
  readonly maxBatchInputTokens?: number | undefined
  readonly documentBatchSize?: number | undefined
  readonly additionalContext?: string | undefined
}

interface ExtractRequestBase {
  readonly ingestion: IngestionRequest
  readonly annotate: ExtractAnnotateConfig
  readonly cachePolicy?: PrimedCachePolicy | undefined
  readonly clearPrimedCacheOnStart?: boolean | undefined
  readonly requireNonEmptyResult?: boolean | undefined
}

export interface LegacyExtractRequest extends ExtractRequestBase {
  readonly prompt: {
    readonly description: string
    readonly examples: ReadonlyArray<ExampleData>
  }
  readonly target?: undefined
  readonly promptOverrides?: undefined
}

export interface SchemaExtractRequest<Target extends AnyExtractionTarget = AnyExtractionTarget>
  extends ExtractRequestBase {
  readonly target: Target
  readonly promptOverrides?: {
    readonly description?: string | undefined
    readonly examples?: ReadonlyArray<ExampleData> | undefined
  }
  readonly prompt?: undefined
}

export type ExtractRequest = LegacyExtractRequest | SchemaExtractRequest

export type ExtractApiError =
  | InferenceConfigError
  | IngestionError
  | LangExtractError
  | PrimedCacheError

const defaultCachePolicy = (): PrimedCachePolicy => new PrimedCachePolicy({})

const isSchemaRequest = (
  request: ExtractRequest
): request is SchemaExtractRequest => "target" in request && request.target !== undefined

const validateRequest = (
  request: ExtractRequest
): Effect.Effect<void, InferenceConfigError> =>
  Effect.gen(function* () {
    if (isSchemaRequest(request)) {
      if (request.target.description.trim().length === 0) {
        return yield* new InferenceConfigError({
          message: "Schema target description must be non-empty."
        })
      }
      if (
        request.promptOverrides?.description !== undefined
        && request.promptOverrides.description.trim().length === 0
      ) {
        return yield* new InferenceConfigError({
          message: "Prompt override description must be non-empty when provided."
        })
      }
      return
    }

    if (request.prompt.examples.length === 0) {
      return yield* new InferenceConfigError({
        message: "Examples are required for reliable extraction."
      })
    }

    if (request.prompt.description.trim().length === 0) {
      return yield* new InferenceConfigError({
        message: "Prompt description must be non-empty."
      })
    }
  })

const resolvePromptConfig = (
  request: ExtractRequest
): {
  readonly description: string
  readonly examples: ReadonlyArray<ExampleData>
  readonly target?: AnyExtractionTarget | undefined
} => {
  if (isSchemaRequest(request)) {
    return {
      description:
        request.promptOverrides?.description ?? request.target.promptDescription,
      examples: request.promptOverrides?.examples ?? request.target.promptExamples,
      target: request.target
    }
  }

  return {
    description: request.prompt.description,
    examples: request.prompt.examples
  }
}

const stripSchemaMarkers = (document: AnnotatedDocument): AnnotatedDocument => {
  const hasMarkers = document.extractions.some(
    (extraction) => extraction.attributes?.[SCHEMA_DATA_ATTRIBUTE_KEY] !== undefined
  )
  if (!hasMarkers) {
    return document
  }

  return new AnnotatedDocument({
    text: document.text,
    ...(document.documentId !== undefined ? { documentId: document.documentId } : {}),
    extractions: document.extractions.map((extraction) => {
      if (extraction.attributes?.[SCHEMA_DATA_ATTRIBUTE_KEY] === undefined) {
        return extraction
      }
      const { [SCHEMA_DATA_ATTRIBUTE_KEY]: _, ...remainingAttributes } = extraction.attributes ?? {}
      return new Extraction({
        extractionClass: extraction.extractionClass,
        extractionText: extraction.extractionText,
        ...(extraction.charInterval !== undefined ? { charInterval: extraction.charInterval } : {}),
        ...(extraction.alignmentStatus !== undefined ? { alignmentStatus: extraction.alignmentStatus } : {}),
        ...(extraction.extractionIndex !== undefined ? { extractionIndex: extraction.extractionIndex } : {}),
        ...(extraction.groupIndex !== undefined ? { groupIndex: extraction.groupIndex } : {}),
        ...(extraction.description !== undefined ? { description: extraction.description } : {}),
        ...(extraction.tokenInterval !== undefined ? { tokenInterval: extraction.tokenInterval } : {}),
        ...(Object.keys(remainingAttributes).length > 0 ? { attributes: remainingAttributes } : {})
      })
    })
  })
}

type ExtractStreamDependencies =
  | Ingestion
  | Annotator
  | PrimedCache
  | FileSystem.FileSystem
  | HttpClient.HttpClient
  | DocumentIdGenerator

const extractStreamRaw = (
  request: ExtractRequest
): Stream.Stream<AnnotatedDocument, ExtractApiError, ExtractStreamDependencies> =>
  Stream.unwrap(
    Effect.gen(function* () {
      yield* validateRequest(request)

      const cachePolicy = request.cachePolicy ?? defaultCachePolicy()
      if (request.clearPrimedCacheOnStart === true) {
        const primedCache = yield* PrimedCache
        yield* primedCache.clearNamespace(cachePolicy.namespace)
      }

      const prompt = resolvePromptConfig(request)

      return extractDocumentsStream(ingestDocuments(request.ingestion), {
        maxCharBuffer: request.annotate.maxCharBuffer,
        batchLength: request.annotate.batchLength,
        batchConcurrency: request.annotate.batchConcurrency,
        providerConcurrency: request.annotate.providerConcurrency,
        extractionPasses: request.annotate.extractionPasses,
        ...(request.annotate.contextWindowChars !== undefined
          ? { contextWindowChars: request.annotate.contextWindowChars }
          : {}),
        ...(request.annotate.additionalContext !== undefined
          ? { additionalContext: request.annotate.additionalContext }
          : {}),
        ...(request.annotate.maxBatchInputTokens !== undefined
          ? { maxBatchInputTokens: request.annotate.maxBatchInputTokens }
          : {}),
        ...(request.annotate.documentBatchSize !== undefined
          ? { documentBatchSize: request.annotate.documentBatchSize }
          : {}),
        promptDescription: prompt.description,
        promptExamples: prompt.examples,
        ...(prompt.target !== undefined
          ? { extractionTarget: prompt.target }
          : {}),
        cachePolicy
      })
    })
  )

export const extractStream = (
  request: ExtractRequest
): Stream.Stream<AnnotatedDocument, ExtractApiError, ExtractStreamDependencies> =>
  extractStreamRaw(request).pipe(Stream.map(stripSchemaMarkers))

export const extract = (
  request: ExtractRequest
): Effect.Effect<
  ReadonlyArray<AnnotatedDocument>,
  ExtractApiError,
  | Ingestion
  | Annotator
  | PrimedCache
  | FileSystem.FileSystem
  | HttpClient.HttpClient
  | DocumentIdGenerator
> =>
  extractStream(request).pipe(
    Stream.runCollect,
    Effect.map(Chunk.toReadonlyArray),
    Effect.flatMap((documents) => {
      const requireNonEmptyResult = request.requireNonEmptyResult ?? true
      if (requireNonEmptyResult && documents.length === 0) {
        return Effect.fail(
          new InferenceConfigError({
            message: "Ingestion produced zero documents."
          })
        )
      }
      return Effect.succeed(documents)
    })
  )

export const extractTyped = <Classes extends Record<string, ExtractionClassSchema>>(
  request: SchemaExtractRequest<ExtractionTarget<Classes>>
): Effect.Effect<
  ReadonlyArray<TypedAnnotatedDocument<Classes>>,
  ExtractApiError,
  ExtractStreamDependencies
> =>
  extractStreamRaw(request).pipe(
    Stream.runCollect,
    Effect.map(Chunk.toReadonlyArray),
    Effect.flatMap((documents) => {
      const requireNonEmptyResult = request.requireNonEmptyResult ?? true
      if (requireNonEmptyResult && documents.length === 0) {
        return Effect.fail(
          new InferenceConfigError({
            message: "Ingestion produced zero documents."
          })
        )
      }
      return Effect.forEach(documents, (document) =>
        toTypedAnnotatedDocument<Classes>(document, request.target)
      )
    })
  )

export const extractTypedStream = <Classes extends Record<string, ExtractionClassSchema>>(
  request: SchemaExtractRequest<ExtractionTarget<Classes>>
): Stream.Stream<TypedAnnotatedDocument<Classes>, ExtractApiError, ExtractStreamDependencies> =>
  extractStreamRaw(request).pipe(
    Stream.mapEffect((doc) => toTypedAnnotatedDocument<Classes>(doc, request.target))
  )
