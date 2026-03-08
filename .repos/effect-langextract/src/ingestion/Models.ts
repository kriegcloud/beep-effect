import { Schema } from "effect"

export const IngestionFormatSchema = Schema.Literal(
  "auto",
  "text",
  "file",
  "url",
  "json",
  "jsonl",
  "csv",
  "stdin"
)
export type IngestionFormat = typeof IngestionFormatSchema.Type

export const RowErrorModeSchema = Schema.Literal("fail-fast", "skip-row")
export type RowErrorMode = typeof RowErrorModeSchema.Type

export class IngestionSourceText extends Schema.Class<IngestionSourceText>(
  "IngestionSourceText"
)({
  _tag: Schema.Literal("text"),
  text: Schema.String
}) {}

export class IngestionSourceFile extends Schema.Class<IngestionSourceFile>(
  "IngestionSourceFile"
)({
  _tag: Schema.Literal("file"),
  path: Schema.String
}) {}

export class IngestionSourceUrl extends Schema.Class<IngestionSourceUrl>(
  "IngestionSourceUrl"
)({
  _tag: Schema.Literal("url"),
  url: Schema.String
}) {}

export class IngestionSourceStdin extends Schema.Class<IngestionSourceStdin>(
  "IngestionSourceStdin"
)({
  _tag: Schema.Literal("stdin")
}) {}

export const IngestionSourceSchema = Schema.Union(
  IngestionSourceText,
  IngestionSourceFile,
  IngestionSourceUrl,
  IngestionSourceStdin
)
export type IngestionSource = typeof IngestionSourceSchema.Type

export class FieldSelector extends Schema.Class<FieldSelector>("FieldSelector")({
  path: Schema.String,
  required: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  trim: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

export class AdditionalContextMapping extends Schema.Class<AdditionalContextMapping>(
  "AdditionalContextMapping"
)({
  fields: Schema.Array(FieldSelector),
  joinWith: Schema.optionalWith(Schema.String, { default: () => "\n" }),
  includeFieldNames: Schema.optionalWith(Schema.Boolean, {
    default: () => true
  })
}) {}

export class DocumentMappingSpec extends Schema.Class<DocumentMappingSpec>(
  "DocumentMappingSpec"
)({
  text: Schema.optionalWith(FieldSelector, { exact: true }),
  documentId: Schema.optionalWith(FieldSelector, { exact: true }),
  additionalContext: Schema.optionalWith(
    Schema.Union(FieldSelector, AdditionalContextMapping),
    { exact: true }
  )
}) {}

export class MappingDefaults extends Schema.Class<MappingDefaults>(
  "MappingDefaults"
)({
  textCandidates: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  idCandidates: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  contextCandidates: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true
  })
}) {}

export class CsvIngestionOptions extends Schema.Class<CsvIngestionOptions>(
  "CsvIngestionOptions"
)({
  delimiter: Schema.optionalWith(Schema.String, { default: () => "," }),
  hasHeader: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

export class TextIngestionOptions extends Schema.Class<TextIngestionOptions>(
  "TextIngestionOptions"
)({
  encoding: Schema.optionalWith(Schema.String, { default: () => "utf-8" }),
  stripBom: Schema.optionalWith(Schema.Boolean, { default: () => true })
}) {}

export class JsonIngestionOptions extends Schema.Class<JsonIngestionOptions>(
  "JsonIngestionOptions"
)({
  maxBytes: Schema.optionalWith(Schema.Int, { exact: true })
}) {}

export class UrlIngestionOptions extends Schema.Class<UrlIngestionOptions>(
  "UrlIngestionOptions"
)({
  maxBodyBytes: Schema.optionalWith(Schema.Int, { exact: true })
}) {}

export class IngestionRowOrigin extends Schema.Class<IngestionRowOrigin>(
  "IngestionRowOrigin"
)({
  sourceTag: Schema.Literal("file", "url", "stdin"),
  sourceRef: Schema.String,
  rowIndex: Schema.Int,
  lineNumber: Schema.optionalWith(Schema.Int, { exact: true })
}) {}

export class IngestionRow extends Schema.Class<IngestionRow>("IngestionRow")({
  origin: IngestionRowOrigin,
  value: Schema.Unknown
}) {}

export class DocumentLike extends Schema.Class<DocumentLike>("DocumentLike")({
  text: Schema.String,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}

export class IngestionRequest extends Schema.Class<IngestionRequest>(
  "IngestionRequest"
)({
  source: IngestionSourceSchema,
  format: Schema.optionalWith(IngestionFormatSchema, { default: () => "auto" }),
  mapping: Schema.optionalWith(DocumentMappingSpec, { exact: true }),
  mappingDefaults: Schema.optionalWith(MappingDefaults, { exact: true }),
  csv: Schema.optionalWith(CsvIngestionOptions, { exact: true }),
  text: Schema.optionalWith(TextIngestionOptions, { exact: true }),
  json: Schema.optionalWith(JsonIngestionOptions, { exact: true }),
  url: Schema.optionalWith(UrlIngestionOptions, { exact: true }),
  onRowError: Schema.optionalWith(RowErrorModeSchema, {
    default: () => "fail-fast"
  })
}) {}

export type EffectiveIngestionFormat = "text" | "json" | "jsonl" | "csv"

export const defaultTextCandidates = [
  "text",
  "body",
  "content",
  "message",
  "input"
] as const

export const defaultIdCandidates = [
  "id",
  "documentId",
  "document_id",
  "doc_id"
] as const

export const defaultContextCandidates = [
  "additionalContext",
  "additional_context",
  "context",
  "metadata"
] as const
