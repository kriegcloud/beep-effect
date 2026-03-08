import { Effect, Option, Schema } from "effect"

import { Document, DocumentIdGenerator } from "../Data.js"
import { IngestionDecodeError, IngestionMappingError } from "../Errors.js"
import {
  AdditionalContextMapping,
  defaultContextCandidates,
  defaultIdCandidates,
  defaultTextCandidates,
  DocumentLike,
  type DocumentMappingSpec,
  FieldSelector,
  type IngestionRow,
  type MappingDefaults} from "./Models.js"

export interface MapRowToDocumentOptions {
  readonly mapping?: DocumentMappingSpec | undefined
  readonly mappingDefaults?: MappingDefaults | undefined
}

const asRecord = (
  value: unknown
): Readonly<Record<string, unknown>> | undefined => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined
  }
  return value as Readonly<Record<string, unknown>>
}

const readPath = (value: unknown, path: string): unknown => {
  const trimmedPath = path.trim()
  if (trimmedPath.length === 0) {
    return undefined
  }

  const segments = trimmedPath.split(".")
  let current: unknown = value

  for (const segment of segments) {
    if (segment.length === 0) {
      return undefined
    }

    if (current === null || typeof current !== "object") {
      return undefined
    }

    const record = current as Record<string, unknown>
    if (!(segment in record)) {
      return undefined
    }

    current = record[segment]
  }

  return current
}

const toStringValue = (
  value: unknown,
  options: {
    readonly trim: boolean
    readonly allowStructured: boolean
  }
): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }

  let stringValue: string
  switch (typeof value) {
    case "string":
      stringValue = value
      break
    case "number":
    case "boolean":
    case "bigint":
      stringValue = String(value)
      break
    case "object":
      if (!options.allowStructured) {
        return undefined
      }
      try {
        stringValue = JSON.stringify(value)
      } catch {
        return undefined
      }
      break
    default:
      return undefined
  }

  return options.trim ? stringValue.trim() : stringValue
}

const findCaseInsensitiveKey = (
  row: Readonly<Record<string, unknown>>,
  candidate: string
): string | undefined => {
  const lowered = candidate.toLowerCase()
  return Object.keys(row).find((key) => key.toLowerCase() === lowered)
}

const mappingError = (row: IngestionRow, message: string): IngestionMappingError =>
  new IngestionMappingError({
    message,
    sourceTag: row.origin.sourceTag,
    sourceRef: row.origin.sourceRef,
    rowIndex: row.origin.rowIndex,
    ...(row.origin.lineNumber !== undefined
      ? { lineNumber: row.origin.lineNumber }
      : {})
  })

const decodeError = (row: IngestionRow, message: string): IngestionDecodeError =>
  new IngestionDecodeError({
    message,
    sourceTag: row.origin.sourceTag,
    sourceRef: row.origin.sourceRef,
    rowIndex: row.origin.rowIndex,
    ...(row.origin.lineNumber !== undefined
      ? { lineNumber: row.origin.lineNumber }
      : {})
  })

const autoDetectTextSelector = (
  row: Readonly<Record<string, unknown>>,
  defaults: MappingDefaults | undefined
): FieldSelector | undefined => {
  const candidates = defaults?.textCandidates ?? defaultTextCandidates
  for (const candidate of candidates) {
    const actualKey = findCaseInsensitiveKey(row, candidate)
    if (actualKey === undefined) {
      continue
    }

    const value = toStringValue(row[actualKey], {
      trim: true,
      allowStructured: false
    })
    if (value !== undefined && value.length > 0) {
      return new FieldSelector({
        path: actualKey,
        required: true,
        trim: true
      })
    }
  }

  const stringKeys = Object.keys(row).filter((key) => {
    const value = toStringValue(row[key], {
      trim: true,
      allowStructured: false
    })
    return value !== undefined && value.length > 0
  })

  if (stringKeys.length === 1) {
    const onlyKey = stringKeys[0]
    if (onlyKey === undefined) {
      return undefined
    }
    return new FieldSelector({
      path: onlyKey,
      required: true,
      trim: true
    })
  }

  return undefined
}

const selectField = (
  row: Readonly<Record<string, unknown>>,
  selector: FieldSelector,
  options: {
    readonly allowStructured: boolean
  }
): string | undefined =>
  toStringValue(readPath(row, selector.path), {
    trim: selector.trim,
    allowStructured: options.allowStructured
  })

const selectIdField = (
  row: Readonly<Record<string, unknown>>,
  defaults: MappingDefaults | undefined
): string | undefined => {
  const candidates = defaults?.idCandidates ?? defaultIdCandidates
  for (const candidate of candidates) {
    const actualKey = findCaseInsensitiveKey(row, candidate)
    if (actualKey === undefined) {
      continue
    }

    const value = toStringValue(row[actualKey], {
      trim: true,
      allowStructured: false
    })

    if (value !== undefined && value.length > 0) {
      return value
    }
  }

  return undefined
}

const selectContextField = (
  row: Readonly<Record<string, unknown>>,
  defaults: MappingDefaults | undefined
): string | undefined => {
  const candidates = defaults?.contextCandidates ?? defaultContextCandidates
  for (const candidate of candidates) {
    const actualKey = findCaseInsensitiveKey(row, candidate)
    if (actualKey === undefined) {
      continue
    }

    const value = toStringValue(row[actualKey], {
      trim: true,
      allowStructured: true
    })

    if (value !== undefined && value.length > 0) {
      return value
    }
  }

  return undefined
}

const pathLabel = (path: string): string => {
  const segments = path.split(".")
  return segments[segments.length - 1] ?? path
}

const selectAdditionalContext = (
  row: Readonly<Record<string, unknown>>,
  mapping: DocumentMappingSpec | undefined,
  defaults: MappingDefaults | undefined
): Effect.Effect<string | undefined, IngestionMappingError> => {
  if (mapping?.additionalContext === undefined) {
    return Effect.succeed(selectContextField(row, defaults))
  }

  if (mapping.additionalContext instanceof FieldSelector) {
    return Effect.succeed(
      selectField(row, mapping.additionalContext, {
        allowStructured: true
      })
    )
  }

  const contextMapping = mapping.additionalContext as AdditionalContextMapping
  return Effect.gen(function* () {
    const pieces = Array<string>()

    for (const selector of contextMapping.fields) {
      const value = selectField(row, selector, {
        allowStructured: true
      })

      if (value === undefined || value.length === 0) {
        if (selector.required) {
          return yield* new IngestionMappingError({
            message: `Missing required context field: ${selector.path}`
          })
        }
        continue
      }

      if (contextMapping.includeFieldNames) {
        pieces.push(`${pathLabel(selector.path)}: ${value}`)
      } else {
        pieces.push(value)
      }
    }

    if (pieces.length === 0) {
      return undefined
    }

    return pieces.join(contextMapping.joinWith)
  })
}

const normalizeDocument = (
  row: IngestionRow,
  candidate: {
    readonly text: unknown
    readonly documentId?: unknown
    readonly additionalContext?: unknown
  }
): Effect.Effect<Document, IngestionMappingError | IngestionDecodeError, DocumentIdGenerator> =>
  Effect.gen(function* () {
    const text = toStringValue(candidate.text, {
      trim: true,
      allowStructured: false
    })

    if (text === undefined || text.length === 0) {
      return yield* mappingError(row, "Document text is required and must be non-empty.")
    }

    const normalizedDocumentId = toStringValue(candidate.documentId, {
      trim: true,
      allowStructured: false
    })
    const documentId =
      normalizedDocumentId !== undefined && normalizedDocumentId.length > 0
        ? normalizedDocumentId
        : undefined

    const normalizedAdditionalContext = toStringValue(candidate.additionalContext, {
      trim: true,
      allowStructured: true
    })

    const generator = yield* DocumentIdGenerator
    const finalDocumentId = documentId ?? (yield* generator.next)

    const payload = {
      text,
      documentId: finalDocumentId,
      ...(normalizedAdditionalContext !== undefined && normalizedAdditionalContext.length > 0
        ? { additionalContext: normalizedAdditionalContext }
        : {})
    }

    return yield* Schema.decodeUnknown(Document)(payload).pipe(
      Effect.mapError((error) =>
        decodeError(row, `Failed to validate mapped document: ${String(error)}`)
      )
    )
  })

export const mapRowToDocument = (
  row: IngestionRow,
  options: MapRowToDocumentOptions
): Effect.Effect<Document, IngestionMappingError | IngestionDecodeError, DocumentIdGenerator> =>
  Effect.gen(function* () {
    const decodedDocumentLike = yield* Schema.decodeUnknown(DocumentLike)(row.value).pipe(
      Effect.option
    )

    if (Option.isSome(decodedDocumentLike)) {
      const value = decodedDocumentLike.value
      return yield* normalizeDocument(row, {
        text: value.text,
        documentId: value.documentId,
        additionalContext: value.additionalContext
      })
    }

    const rawRow = asRecord(row.value)
    if (rawRow === undefined) {
      return yield* mappingError(row, "Row value must be an object for mapped ingestion.")
    }

    const textSelector = options.mapping?.text ?? autoDetectTextSelector(rawRow, options.mappingDefaults)
    if (textSelector === undefined) {
      return yield* mappingError(
        row,
        "Unable to resolve text field. Provide mapping.text or include a known text column."
      )
    }

    const text = selectField(rawRow, textSelector, {
      allowStructured: false
    })

    if (text === undefined || text.length === 0) {
      return yield* mappingError(row, `Text mapping resolved to an empty value at path '${textSelector.path}'.`)
    }

    const mappedDocumentId =
      options.mapping?.documentId !== undefined
        ? selectField(rawRow, options.mapping.documentId, {
            allowStructured: false
          })
        : selectIdField(rawRow, options.mappingDefaults)

    const additionalContext = yield* selectAdditionalContext(
      rawRow,
      options.mapping,
      options.mappingDefaults
    ).pipe(
      Effect.mapError((error) =>
        error.sourceTag !== undefined
          ? error
          : mappingError(row, error.message)
      )
    )

    return yield* normalizeDocument(row, {
      text,
      documentId: mappedDocumentId,
      additionalContext
    })
  })
