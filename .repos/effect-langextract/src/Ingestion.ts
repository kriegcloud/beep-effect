import * as FileSystem from "@effect/platform/FileSystem"
import * as HttpClient from "@effect/platform/HttpClient"
import { Effect, Layer, Option, Schema, Stream } from "effect"

import { Document, DocumentIdGenerator } from "./Data.js"
import {
  IngestionConfigError,
  IngestionDecodeError,
  IngestionEmptyInputError,
  IngestionFormatError,
  IngestionMappingError,
  IngestionSourceError
} from "./Errors.js"
import {
  mapRowToDocument,
  type MapRowToDocumentOptions
} from "./ingestion/FieldMapping.js"
import {
  decodeCsvRows,
  decodeJsonlRows,
  decodeJsonRows,
  decodeTextDocument,
  resolveEffectiveFormat
} from "./ingestion/FormatDecoders.js"
import {
  type IngestionRequest,
  IngestionRequest as IngestionRequestSchema,
  type IngestionSource} from "./ingestion/Models.js"
import {
  type ByteSource,
  isHttpUrl,
  streamFileSource,
  streamStdinSource,
  streamUrlSource} from "./ingestion/SourceReaders.js"

export type IngestionError =
  | IngestionConfigError
  | IngestionSourceError
  | IngestionFormatError
  | IngestionDecodeError
  | IngestionMappingError
  | IngestionEmptyInputError

export interface IngestionService {
  readonly ingest: (
    request: IngestionRequest
  ) => Stream.Stream<
    Document,
    IngestionError,
    FileSystem.FileSystem | HttpClient.HttpClient | DocumentIdGenerator
  >
}

const toIngestionConfigError = (message: string) => (error: unknown): IngestionConfigError =>
  new IngestionConfigError({
    message: `${message}: ${String(error)}`
  })

type StreamSource = Exclude<IngestionSource, { readonly _tag: "text" }>

const sourceFromRequest = (
  source: StreamSource,
  maxBodyBytes?: number | undefined
): Effect.Effect<
  ByteSource<FileSystem.FileSystem | HttpClient.HttpClient>,
  IngestionSourceError
> => {
  switch (source._tag) {
    case "file":
      return Effect.succeed(streamFileSource(source.path))
    case "stdin":
      return Effect.succeed(streamStdinSource())
    case "url": {
      if (!isHttpUrl(source.url)) {
        return Effect.fail(
          new IngestionSourceError({
            message: "Only http/https URLs are supported.",
            sourceTag: "url",
            sourceRef: source.url
          })
        )
      }
      return Effect.succeed(
        streamUrlSource(source.url, maxBodyBytes)
      )
    }
  }
}

const documentFromText = (
  text: string,
  sourceTag: "text" | "file" | "url" | "stdin",
  sourceRef: string
): Effect.Effect<Document, IngestionEmptyInputError, DocumentIdGenerator> =>
  Effect.gen(function* () {
    const normalizedText = text.trim()
    if (normalizedText.length === 0) {
      return yield* new IngestionEmptyInputError({
        message: "Ingestion produced empty text input.",
        sourceTag,
        sourceRef
      })
    }

    const generator = yield* DocumentIdGenerator
    const documentId = yield* generator.next

    return new Document({
      text: normalizedText,
      documentId
    })
  })

const toDocumentsFromRows = (
  rows: Stream.Stream<
    DocumentLikeRow,
    IngestionDecodeError | IngestionFormatError,
    FileSystem.FileSystem | HttpClient.HttpClient
  >,
  options: MapRowToDocumentOptions,
  onRowError: "fail-fast" | "skip-row"
): Stream.Stream<
  Document,
  | IngestionDecodeError
  | IngestionFormatError
  | IngestionMappingError
  | IngestionEmptyInputError,
  FileSystem.FileSystem | HttpClient.HttpClient | DocumentIdGenerator
> =>
  rows.pipe(
    Stream.mapEffect((row) =>
      mapRowToDocument(row, options).pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            onRowError === "skip-row"
              ? Effect.logWarning("Skipping row due to mapping error").pipe(
                  Effect.annotateLogs({
                    sourceTag: error.sourceTag,
                    sourceRef: error.sourceRef,
                    rowIndex: error.rowIndex,
                    lineNumber: error.lineNumber,
                    reason: error.message
                  }),
                  Effect.as(Option.none<Document>())
                )
              : Effect.fail(error),
          onSuccess: (document) => Effect.succeed(Option.some(document))
        })
      )
    ),
    Stream.filterMap((value) => value)
  )

type DocumentLikeRow = Parameters<typeof mapRowToDocument>[0]

const ingestResolved = (
  request: IngestionRequest
): Stream.Stream<
  Document,
  IngestionError,
  FileSystem.FileSystem | HttpClient.HttpClient | DocumentIdGenerator
> => {
  const effectiveFormat = resolveEffectiveFormat(request.source, request.format)

  if (request.source._tag === "text") {
    if (effectiveFormat !== "text") {
      return Stream.fail(
        new IngestionFormatError({
          message: "Raw text input only supports text format.",
          format: effectiveFormat,
          sourceTag: "text",
          sourceRef: "inline"
        })
      )
    }

    return Stream.fromEffect(documentFromText(request.source.text, "text", "inline"))
  }

  return Stream.unwrap(
    sourceFromRequest(request.source, request.url?.maxBodyBytes).pipe(
      Effect.map((source) => {
        if (effectiveFormat === "text") {
          return Stream.fromEffect(
            decodeTextDocument(source, request.text).pipe(
              Effect.flatMap((text) =>
                documentFromText(text, source.sourceTag, source.sourceRef)
              )
            )
          )
        }

        const rows =
          effectiveFormat === "json"
            ? decodeJsonRows(source, request.json, request.text)
            : effectiveFormat === "jsonl"
              ? decodeJsonlRows(source, {
                  onRowError: request.onRowError,
                  text: request.text
                })
              : decodeCsvRows(source, {
                  csv: request.csv,
                  text: request.text,
                  onRowError: request.onRowError
                })

        return toDocumentsFromRows(
          rows,
          {
            mapping: request.mapping,
            mappingDefaults: request.mappingDefaults
          },
          request.onRowError
        )
      })
    )
  )
}

const ingestImpl = (
  requestInput: IngestionRequest
): Stream.Stream<
  Document,
  IngestionError,
  FileSystem.FileSystem | HttpClient.HttpClient | DocumentIdGenerator
> =>
  Stream.unwrap(
    Schema.decodeUnknown(IngestionRequestSchema)(requestInput).pipe(
      Effect.mapError(toIngestionConfigError("Failed to decode ingestion request")),
      Effect.map(ingestResolved)
    )
  )

export class Ingestion extends Effect.Service<Ingestion>()(
  "@effect-langextract/Ingestion",
  {
    sync: () => ({
      ingest: ingestImpl
    })
  }
) {
  static readonly Test: Layer.Layer<Ingestion> = Ingestion.Default

  static testLayer = (
    service?: IngestionService
  ): Layer.Layer<Ingestion> =>
    Layer.succeed(
      Ingestion,
      Ingestion.make(
        service ?? {
          ingest: ingestImpl
        }
      )
    )
}

export const ingestDocuments = (
  request: IngestionRequest
): Stream.Stream<
  Document,
  IngestionError,
  Ingestion | FileSystem.FileSystem | HttpClient.HttpClient | DocumentIdGenerator
> =>
  Stream.unwrap(
    Effect.gen(function* () {
      const ingestion = yield* Ingestion
      return ingestion.ingest(request)
    })
  )
