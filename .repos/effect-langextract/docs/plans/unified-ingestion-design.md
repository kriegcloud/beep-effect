# Unified Ingestion Layer Design (Library-First)

## Context

This plan designs a unified ingestion layer for `effect-langextract` where:

1. Library APIs are the primary surface.
2. The CLI is a thin adapter over library ingestion + extraction.
3. Multiple input formats normalize into `Document` with typed validation.
4. Streaming and backpressure are first-class for large datasets.

Date: 2026-02-18

---

## Design Inputs (From Source)

### Project integration points

1. `src/Cli.ts` is the orchestration boundary where ingestion requests are constructed and wired to extraction.
2. `src/Extract.ts` is the library extraction entrypoint and should consume ingestion outputs rather than own input parsing.
3. `src/Annotator.ts` already supports multi-document processing with `annotateDocuments(documents: ReadonlyArray<Document>, ...) => Stream<AnnotatedDocument, LangExtractError>`.
4. `src/Data.ts` is the canonical schema surface for `Document`, `AnnotatedDocument`, `Extraction`, and `ExampleData`.
5. `src/IO.ts` contains reusable transport helpers (file and URL) that ingestion can compose.

### Python reference behavior

1. `.reference/langextract/langextract/extraction.py` accepts `text_or_documents` (string or iterable of `Document`) and branches to `annotate_text` vs `annotate_documents`.
2. `.reference/langextract/langextract/io.py` includes:
   - `Dataset(input_path, id_key, text_key)` for CSV -> `Document`.
   - `load_annotated_documents_jsonl(...)` and `save_annotated_documents(...)` for JSONL workflow.
3. `.reference/langextract/langextract/core/data.py` defines the same conceptual model (`Document`, `AnnotatedDocument`, `Extraction`) with auto-generated document IDs.

### Effect design constraints

1. Keep typed service/layer composition (`Effect.Service`, `Layer`).
2. Decode external payloads with `Schema.decodeUnknown` (typed parse failures).
3. Use `Stream`-based ingestion to preserve backpressure and bounded memory.

---

## Goals

1. Unified ingestion entrypoint for:
   - raw text
   - single text file
   - URL
   - JSONL file (line-delimited rows)
   - JSON file (array of rows/documents)
   - CSV file with field mapping
   - stdin (streamed)
2. Library-first API returning `Stream<Document, IngestionError>`.
3. Mapping system from arbitrary row schemas to `Document` fields.
4. CLI flag surface that only translates user args to ingestion requests.
5. Safe handling of malformed rows, encoding issues, large inputs, and backpressure.

## Non-goals (This Plan)

1. Rewriting model/provider layers.
2. Replacing existing alignment or resolver logic.
3. Implementing full incremental JSON-array parser in phase 1 (JSON array is supported, but initially buffered).
4. Backward-compatibility adapters for legacy CLI input flags.

---

## Architecture Overview

### High-level flow

```text
InputSpec
  -> Source Reader (file/url/stdin/text)
  -> Format Decoder (text/json/jsonl/csv)
  -> Row Schema Decode (optional user schema)
  -> Field Mapping -> Document candidate
  -> Document Schema Decode
  -> Stream<Document>
  -> Annotation pipeline (batch by docs) -> Stream<AnnotatedDocument>
```

### New boundary

1. `Ingestion` becomes the only place that knows how to read/parse input formats.
2. `Extract`/`Annotator` remain focused on extraction, not transport/parsing.
3. CLI delegates all input decisions to ingestion config + ingestion service.

---

## Proposed Library API Surface

## Core input types

```ts
export type IngestionFormat =
  | "text"
  | "file"
  | "url"
  | "json"
  | "jsonl"
  | "csv"
  | "stdin"
  | "auto"

export type IngestionSource =
  | { readonly _tag: "text"; readonly text: string }
  | { readonly _tag: "file"; readonly path: string }
  | { readonly _tag: "url"; readonly url: string }
  | { readonly _tag: "stdin" }
```

## Field mapping types

```ts
export type FieldPath = string // dot-path, e.g. "payload.body"

export interface DocumentFieldMapping {
  readonly text?: FieldPath
  readonly documentId?: FieldPath
  readonly additionalContext?: FieldPath | ReadonlyArray<FieldPath>
}

export interface MappingDefaults {
  readonly textCandidates?: ReadonlyArray<string>
  readonly idCandidates?: ReadonlyArray<string>
  readonly contextCandidates?: ReadonlyArray<string>
}
```

## Ingestion request

```ts
export interface IngestionRequest {
  readonly source: IngestionSource
  readonly format?: IngestionFormat // default: "auto"
  readonly mapping?: DocumentFieldMapping
  readonly mappingDefaults?: MappingDefaults
  readonly csv?: {
    readonly delimiter?: string // default ","
    readonly hasHeader?: boolean // default true
  }
  readonly text?: {
    readonly encoding?: string // default "utf-8"
    readonly stripBom?: boolean // default true
  }
  readonly json?: {
    readonly maxBytes?: number // guardrail for buffered JSON arrays
  }
  readonly onRowError?: "fail-fast" | "skip-row" // default fail-fast
}
```

## Ingestion service/module

```ts
export interface IngestionService {
  readonly ingest: (
    request: IngestionRequest
  ) => Stream.Stream<Document, IngestionError>
}

export class Ingestion extends Effect.Service<Ingestion>()(
  "@effect-langextract/Ingestion",
  { ... }
) {}

export const ingestDocuments = (request: IngestionRequest) =>
  Effect.gen(function* () {
    const ingestion = yield* Ingestion
    return ingestion.ingest(request)
  })
```

## Optional extraction helper over streams

```ts
export interface ExtractDocumentsOptions extends AnnotateOptions {
  readonly promptDescription: string
  readonly examples: ReadonlyArray<ExampleData>
  readonly documentBatchSize?: number // default 100
}

export const extractDocumentsStream: (
  documents: Stream.Stream<Document, IngestionError>,
  options: ExtractDocumentsOptions
) => Stream.Stream<AnnotatedDocument, IngestionError | LangExtractError>
```

This keeps extraction reusable for non-CLI consumers and avoids collecting entire datasets into memory.

---

## Supported Data Models (Detailed)

## Canonical domain model (unchanged)

The ingestion layer targets existing domain types in `src/Data.ts`:

1. `Document`
2. `AnnotatedDocument`
3. `Extraction`
4. `ExampleData`

No schema changes are required to these core models. Ingestion only normalizes external data into `Document`.

## Ingestion source model

Proposed explicit schema classes (in addition to TS interfaces):

```ts
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
```

## Format and parsing option models

```ts
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
```

## Raw structured row model

Structured formats (`json`, `jsonl`, `csv`) should normalize into a row envelope before mapping:

```ts
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
```

This gives row-level diagnostics (line/row location) without coupling decoders to mapping logic.

## Mapping model

Mapping should be explicit and typeable, not free-form strings only:

```ts
export type FieldPath = string

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
  text: FieldSelector,
  documentId: Schema.optionalWith(FieldSelector, { exact: true }),
  additionalContext: Schema.optionalWith(
    Schema.Union(FieldSelector, AdditionalContextMapping),
    { exact: true }
  )
}) {}
```

The CLI can keep simple `--text-field`, `--id-field`, `--context-field` flags, while library users can provide richer mapping objects.

## Row policy and diagnostics model

```ts
export const RowErrorModeSchema = Schema.Literal("fail-fast", "skip-row")

export class IngestionRowDiagnostic extends Schema.Class<IngestionRowDiagnostic>(
  "IngestionRowDiagnostic"
)({
  level: Schema.Literal("warning", "error"),
  code: Schema.String,
  message: Schema.String,
  origin: IngestionRowOrigin
}) {}

export class IngestionSummary extends Schema.Class<IngestionSummary>(
  "IngestionSummary"
)({
  totalRows: Schema.Int,
  emittedDocuments: Schema.Int,
  skippedRows: Schema.Int,
  diagnostics: Schema.Array(IngestionRowDiagnostic)
}) {}
```

`ingest(...)` still returns `Stream<Document, IngestionError>`, but internal/optional reporting can use `IngestionSummary` for CLI logs and tests.

## Supported payload shapes by format

1. `text` source:
   - input model: single raw string
   - output model: one `Document`
2. `file` (text):
   - input model: UTF-8 text file
   - output model: one `Document`
3. `url`:
   - input model: downloaded text payload
   - output model: one `Document`
4. `json`:
   - shape A: `ReadonlyArray<DocumentLike>`
   - shape B: `ReadonlyArray<Record<string, unknown>>` + mapping
5. `jsonl`:
   - one JSON object per line as `Record<string, unknown>` or `DocumentLike`
6. `csv`:
   - one row per record as `Record<string, string>`
   - mapped by `DocumentMappingSpec`
7. `stdin`:
   - shape depends on selected format (`text/json/jsonl/csv`)

## Concrete payload examples

1. JSON array of `DocumentLike`:

```json
[
  { "text": "Alice visited Paris.", "documentId": "post-1" },
  { "text": "Bob stayed in London.", "additionalContext": "travel-log" }
]
```

2. JSON array of arbitrary rows + mapping:

```json
[
  { "post_id": "42", "body": "Mars mission delayed.", "author": "Ada" }
]
```

Mapping:

```ts
{
  text: { path: "body", required: true },
  documentId: { path: "post_id" },
  additionalContext: {
    fields: [{ path: "author" }],
    includeFieldNames: true
  }
}
```

3. JSONL rows:

```jsonl
{"id":"evt-1","content":"Payment declined","ctx":"region=us"}
{"id":"evt-2","content":"Retry succeeded","ctx":"region=eu"}
```

4. CSV rows:

```csv
post_id,body,author
1,Service outage in zone A,ops-bot
2,Service restored,ops-bot
```

## DocumentLike model (accepted structured document row)

```ts
export class DocumentLike extends Schema.Class<DocumentLike>("DocumentLike")({
  text: Schema.String,
  documentId: Schema.optionalWith(Schema.String, { exact: true }),
  additionalContext: Schema.optionalWith(Schema.String, { exact: true })
}) {}
```

For structured inputs, ingestion attempts:

1. decode as `DocumentLike` first.
2. if decode fails, apply mapping path.
3. if mapping path succeeds, validate final candidate as `Document`.

## Normalization rules

1. `text` is trimmed; empty string after trim is invalid.
2. `documentId` is trimmed when present; empty => treated as missing.
3. `additionalContext`:
   - scalar values are stringified.
   - object/array values are JSON-stringified only when explicitly selected by mapping.
4. generated `documentId` always uses `DocumentIdGenerator`.
5. source-origin metadata is not persisted to `Document`; it is used for diagnostics only.

---

## Effect API Audit (Full Pass)

This section locks concrete Effect-native API decisions for ingestion.

## Preferred APIs by concern

1. Service abstraction:
   - Use: `Effect.Service`, `Layer.effect`, `Layer.succeed`, `Layer.provide`.
   - Avoid: plain module-level mutable singletons or constructor-only DI.
2. File input streaming:
   - Use: `FileSystem.FileSystem.stream(path, options)`.
   - Avoid: `readFileString` for large JSONL/CSV ingestion paths.
3. URL input streaming:
   - Use: `HttpClient.get` -> `HttpClientResponse.filterStatusOk` -> `HttpClientResponse.stream(...)`.
   - Add body guard: `HttpIncomingMessage.withMaxBodySize(...)`.
   - Avoid: eager `response.text` for large payloads.
4. Text decoding:
   - Use: `Stream.decodeText("utf-8")`.
   - Line splitting: `Stream.splitLines`.
   - Avoid: manual byte concatenation + `TextDecoder` loops unless absolutely required.
5. NDJSON / JSONL decoding:
   - Use: `@effect/platform/Ndjson.unpackSchema(...)` via `Stream.pipeThroughChannel(...)`.
   - Benefit: typed parse failures (`NdjsonError | ParseError`) and robust newline handling.
   - Avoid: ad-hoc `JSON.parse` per line without schema.
6. JSON object/array decoding:
   - Use: `Schema.parseJson(targetSchema)` + `Schema.decodeUnknown(...)`.
   - For max-size guardrails: `FileSystem.stat` + `Stream.runFoldWhile` for streamed byte-count checks where needed.
   - Avoid: raw `JSON.parse` and unchecked casts.
7. Streamed transform stages:
   - Use: `Stream.mapEffect`, `Stream.flatMap`, `Stream.grouped`, `Stream.filter`, `Stream.mapError`.
   - Prefer bounded grouping with `Stream.grouped(documentBatchSize)`.
8. Error typing:
   - Use: `Schema.TaggedError` for ingestion-domain errors and map from `PlatformError` / parse errors.
   - Avoid: throwing generic `Error` in ingestion path.
9. Logging and diagnostics:
   - Use: `Effect.logDebug`, `Effect.logWarning`, `Effect.annotateLogs`.
   - Include `source`, `rowIndex`, `lineNumber`, `format`.
10. Config decoding:
   - Use: `Schema.Config` where flags/env are converted to typed ingestion config.
   - Avoid: manual string-to-number parsing sprinkled through logic.
11. CSV parsing:
   - Use: stream-first parser adapter + `Stream.fromAsyncIterable` / channel bridge into `Stream<IngestionRow, IngestionDecodeError>`.
   - Note: no first-party CSV parser exists in `effect` / `@effect/platform`; treat parser as boundary and immediately decode rows with `Schema`.
   - Avoid: fully buffering CSV into arrays before mapping.

## Effect-native ingestion pipelines

1. File JSONL -> typed rows:

```ts
fileSystem.stream(path).pipe(
  Stream.pipeThroughChannel(
    Ndjson.unpackSchema(RowSchema)({ ignoreEmptyLines: true })
  )
)
```

2. URL JSONL -> typed rows:

```ts
HttpClientResponse.stream(
  HttpClient.get(url).pipe(Effect.flatMap(HttpClientResponse.filterStatusOk))
).pipe(
  Stream.pipeThroughChannel(
    Ndjson.unpackSchema(RowSchema)({ ignoreEmptyLines: true })
  )
)
```

3. File text -> one document:

```ts
fileSystem.stream(path).pipe(
  Stream.decodeText("utf-8"),
  Stream.mkString,
  Effect.map((text) => [textToDocument(text)])
)
```

4. Streamed row -> mapped document:

```ts
rows.pipe(
  Stream.mapEffect((row) =>
    mapRowToDocument(row).pipe(
      Effect.flatMap(Schema.decodeUnknown(Document)),
      Effect.mapError(toIngestionDecodeError(row.origin))
    )
  )
)
```

## Backpressure and queue policy

1. Default policy: keep ingestion pull-driven end-to-end.
2. If queue bridging is required, prefer bounded queues.
3. Explicitly avoid `Queue.unbounded` for ingestion row bridges.
4. Keep extraction batching bounded via `Stream.grouped`.

## Known anti-patterns to avoid in this implementation

1. Full-buffer loading of large JSONL/CSV files.
2. Unchecked `JSON.parse` / type assertions for row decoding.
3. Mixing platform APIs directly in CLI handlers instead of ingestion service.
4. Creating custom concurrency queues where `Stream` combinators already express required behavior.
5. Losing row origin metadata when mapping decode failures.

## Audit acceptance checklist

1. Every ingestion parser path is represented as `Stream<..., IngestionError>`.
2. Every external decode path goes through `Schema` decoders.
3. File and URL large-input paths use streaming APIs (not eager text buffering).
4. Row-level failures include origin metadata.
5. CLI contains no direct parsing logic for JSON/JSONL/CSV.
6. No unbounded queue in ingestion implementation.

---

## Schema and Field Mapping Design

## Mapping behavior

1. Explicit mapping wins:
   - `mapping.text`, `mapping.documentId`, `mapping.additionalContext`.
2. If `text` is omitted, auto-detect from defaults:
   - `["text", "body", "content", "message", "input"]` (case-insensitive).
3. If exactly one string-like field exists, use it as `text`.
4. If no text field can be resolved, fail with `IngestionMappingError`.

## Mapped value normalization

1. `text` must decode to non-empty string.
2. `documentId` is optional; when missing, use `DocumentIdGenerator`.
3. `additionalContext`:
   - single field: string conversion
   - multiple fields: join as `"key: value"` lines.

## Validation pipeline

For each structured row:

1. Parse raw row to `unknown`.
2. Validate row with `Schema` (default permissive record schema if caller did not provide one).
3. Apply mapping to build document candidate.
4. Validate candidate with `Schema.decodeUnknown(Document)`.
5. Emit `Document` into stream.

This guarantees the annotation pipeline only sees valid `Document` values.

---

## Streaming and Backpressure Design

## Format behavior

1. `text`, `file`, `url`: produce a single `Document`.
2. `jsonl`: decode with `Ndjson.unpackSchema` in a stream pipeline.
3. `csv`: stream row-by-row via parser.
4. `json`:
   - phase 1: parse buffered array and stream via `Stream.fromIterable`.
   - enforce `maxBytes` guardrail; recommend JSONL/CSV for large datasets.
5. `stdin`:
   - respects selected/auto-detected format.
   - does not require whole-input buffering for JSONL/CSV/text.

## Backpressure strategy

1. Ingestion stream stays pull-driven.
2. Downstream extraction consumes with bounded grouping:
   - `Stream.grouped(documentBatchSize)` -> `annotator.annotateDocuments(batch, ...)`.
3. Concurrency is controlled at extraction stage via existing `batchConcurrency` and provider concurrency.
4. Optional bounded queue can be introduced if ingestion source is pushy, but default is direct stream composition.
5. Explicitly disallow unbounded queues in ingestion adapters.

---

## Effect Service and Layer Design

## New service

`Ingestion` dependencies:

1. `FileSystem.FileSystem` for local files.
2. `HttpClient.HttpClient` for URL ingestion.
3. `DocumentIdGenerator` for missing IDs.
4. Optional runtime stdin adapter service for Bun/Node.

## Layer strategy

1. `Ingestion.DefaultWithoutDependencies` for test injection.
2. `Ingestion.Default` with runtime dependencies.
3. `Ingestion.testLayer(...)` for deterministic fixtures/mocks.

## Error model

Add typed errors in `src/Errors.ts`:

1. `IngestionConfigError`
2. `IngestionSourceError`
3. `IngestionFormatError`
4. `IngestionDecodeError` (include row index/line if available)
5. `IngestionMappingError`
6. `IngestionEmptyInputError`

Each error should carry enough context (source tag, file path/url, line/row number).

---

## CLI Integration (Thin Consumer)

## CLI strategy

1. Use a single unified input surface:
   - `--input` (path, URL, or `-` for stdin)
   - `--input-format` (`auto|text|json|jsonl|csv|url|stdin`)
   - `--text-field`
   - `--id-field`
   - `--context-field` (repeatable)
   - `--csv-delimiter`
   - `--csv-header` (`true|false`)
   - `--row-error-mode` (`fail-fast|skip-row`)
   - `--document-batch-size`
2. Remove legacy input flags (`--text`, `--file`, `--url`) as part of clean break.

## CLI behavior changes

1. CLI builds an `IngestionRequest` from flags.
2. CLI calls `ingestDocuments(...)`.
3. CLI wires ingestion stream into extraction stream helper.
4. CLI output handling:
   - single doc + `json`: same behavior as today.
   - multi-doc + `json`: output array of `AnnotatedDocument`.
   - multi-doc + `jsonl`: one annotated document per line.
   - `html`: only valid for single document; error for multi-doc input.

This keeps CLI logic as orchestration only.

---

## File-by-File Implementation Plan

## New files

1. `src/Ingestion.ts`
   - public service, request types, and helpers.
2. `src/ingestion/Models.ts`
   - ingestion schemas, row envelope, mapping models.
3. `src/ingestion/SourceReaders.ts`
   - text/file/url/stdin readers.
4. `src/ingestion/FormatDecoders.ts`
   - decoder pipeline for text/json/jsonl/csv.
5. `src/ingestion/FieldMapping.ts`
   - field-path resolution, auto-detection, normalization.
6. `src/ingestion/ExtractDocuments.ts`
   - stream -> grouped batches -> `annotator.annotateDocuments`.
7. `test/ingestion/ingestion.models.test.ts`
8. `test/ingestion/ingestion.formats.test.ts`
9. `test/ingestion/ingestion.mapping.test.ts`
10. `test/ingestion/ingestion.errors.test.ts`
11. `test/ingestion/extract-documents.stream.test.ts`

## Modified files

1. `src/Cli.ts`
   - implement ingestion request builder and remove legacy inline source-resolution path.
   - add structured ingestion flags.
   - use stream extraction helper.
2. `src/Extract.ts`
   - add stream-oriented extraction helper exports (or re-export from ingestion module).
3. `src/Errors.ts`
   - add ingestion error tags.
4. `src/index.ts`
   - export ingestion APIs.
5. `src/runtime/BunMain.ts`
   - wire stdin/runtime layer if needed.
6. `src/runtime/NodeMain.ts`
   - wire stdin/runtime layer if needed.
7. `test/cli/cli.extract.test.ts`
   - add JSONL/CSV/JSON/stdin coverage.
8. `test/cli/effect-cli.subcommands.test.ts`
   - verify thin wiring for new input flags.

## Optional dependency change

If CSV parser support is not implemented manually:

1. add CSV parser dependency in `package.json` (stream-capable, RFC-compliant).

---

## Implementation Readiness Gates (Per File)

Use these as merge gates for the ingestion implementation.

## `src/ingestion/Models.ts`

1. All ingestion models are represented as `Schema.Class` / `Schema.Literal` unions.
2. Source, mapping, row-origin, and diagnostics models compile with no `any`.
3. `DocumentLike` decode path is defined and exported.
4. `IngestionFormatSchema`, `RowErrorModeSchema`, and mapping schemas are exported for CLI and tests.

## `src/Ingestion.ts`

1. Public API returns `Stream<Document, IngestionError>` only.
2. No direct `JSON.parse` or unchecked casts in orchestration path.
3. All platform errors are mapped to typed ingestion errors.
4. Logging uses `Effect.log*` + `Effect.annotateLogs` with source/row metadata.
5. No unbounded queue usage.

## `src/ingestion/SourceReaders.ts`

1. File readers use `FileSystem.stream` for large-path ingestion.
2. URL readers use `HttpClient` + `HttpClientResponse.filterStatusOk` + `HttpClientResponse.stream`.
3. URL path sets a body-size guard (`HttpIncomingMessage.withMaxBodySize`) where applicable.
4. Text decode pipeline uses `Stream.decodeText("utf-8")`.
5. No eager full-buffer read for JSONL/CSV paths.

## `src/ingestion/FormatDecoders.ts`

1. JSONL path uses `Ndjson.unpackSchema` via `Stream.pipeThroughChannel`.
2. JSON path uses `Schema.parseJson(...)` and typed decode effects.
3. CSV path emits streamed rows (no full-table buffering) and immediately schema-validates row shape.
4. Row origin (`rowIndex`, `lineNumber`, source) is preserved for downstream mapping and errors.
5. `onRowError` behavior is explicitly implemented for `fail-fast` and `skip-row`.

## `src/ingestion/FieldMapping.ts`

1. Mapping first attempts `DocumentLike` decode; fallback path applies mapping spec.
2. Auto-detection logic is deterministic and case-insensitive.
3. Normalization rules are enforced (trim text, empty -> invalid, ID generation fallback).
4. Mapping failures include row-origin context in error payload.
5. Final candidate is validated with `Schema.decodeUnknown(Document)`.

## `src/ingestion/ExtractDocuments.ts`

1. Uses `Stream.grouped(documentBatchSize)` before annotation calls.
2. Uses existing `Annotator.annotateDocuments` without duplicating extraction logic.
3. Preserves stream backpressure; no full materialization of all documents.
4. Error channel is a typed union (`IngestionError | LangExtractError`).

## `src/Cli.ts`

1. CLI only translates flags/env to `IngestionRequest` and extraction options.
2. No format parsing logic remains in CLI (`json/jsonl/csv` parsing moved to ingestion layer).
3. Legacy flags (`--text|--file|--url`) are removed and no aliasing layer is introduced.
4. New flags (`--input`, `--input-format`, mapping flags, row error mode) map 1:1 to ingestion models.
5. Output-mode constraints are enforced (e.g., `html` single-document only).

## `src/Errors.ts`

1. All new ingestion errors are `Schema.TaggedError`.
2. Error fields include enough context for diagnostics (source, row/line, path/url).
3. `AnyLangExtractError` union is updated (if needed) without type holes.

## `src/index.ts`

1. Ingestion APIs and models are exported from a stable public surface.
2. No accidental export of internal-only helper modules.

## `src/runtime/BunMain.ts` and `src/runtime/NodeMain.ts`

1. Runtime-specific stdin wiring (if added) stays in runtime modules only.
2. Core ingestion modules remain platform-neutral.
3. Layer composition remains explicit (`Layer.mergeAll` / `Layer.provide`), no hidden globals.

## `test/ingestion/*.test.ts`

1. Models test validates schema decode/encode behavior.
2. Format tests cover text/file/url/json/jsonl/csv/stdin.
3. Mapping tests cover explicit mapping, auto-detect, and failure diagnostics.
4. Error tests assert tagged errors and origin metadata.
5. Stream integration tests verify bounded batching and large-input behavior.

## `test/cli/*.test.ts`

1. Unified input flags are the only supported input surface.
2. New structured-input flags are covered end-to-end.
3. Multi-document output shapes (`json` array, `jsonl` lines) are validated.
4. `row-error-mode=skip-row` and `fail-fast` behaviors are asserted.
5. Removed legacy flags (`--text|--file|--url`) are asserted as unsupported.

## Gate outcome rule

1. A file is implementation-ready only when all gates listed for that file are satisfied.
2. Any failed gate blocks merge for that file’s change set.
3. The PR description should include a checked list of these gates by touched file.

---

## Migration Path

## Phase 1: Library-first ingestion + new CLI surface

1. Implement `Ingestion` service + tests.
2. Switch CLI input handling to `--input` + `--input-format` and mapping flags.
3. Remove legacy input code paths in CLI.

## Phase 2: Structured-source hardening

1. Add JSON/JSONL/CSV/stdin flags.
2. Add mapping flags and row-error policy.
3. Add stream extraction helper and grouped document batching.
4. No compatibility shim layer is introduced.

## Phase 3: Cleanup and stabilization

1. Remove any dead compatibility code if introduced during implementation.
2. Expand docs/examples for library ingestion usage first, CLI second.
3. Lock the new CLI input contract in tests and docs.

---

## Edge Cases and Handling

## Encoding and text decoding

1. Default UTF-8.
2. Strip BOM when configured.
3. Fail with `IngestionDecodeError` when bytes are not decodable.

## Malformed structured input

1. JSONL invalid line:
   - `fail-fast`: stop with line number.
   - `skip-row`: emit warning log, continue.
2. CSV malformed row:
   - include row number and delimiter context.
3. JSON not array:
   - fail with `IngestionFormatError`.

## URL safety and network behavior

1. Reuse strict URL validation (`http/https` only).
2. Configure timeout and response size limits.
3. Reject unsupported content types when strict mode is enabled.

## Large inputs and memory

1. JSONL/CSV/stdin processed incrementally.
2. JSON array guarded by `maxBytes` and documented as buffered in phase 1.
3. Annotation execution grouped by `documentBatchSize` to bound memory.

## Mapping and ID behavior

1. Missing text mapping: hard failure with candidate list in error message.
2. Missing IDs: generated with `DocumentIdGenerator`.
3. Duplicate IDs: fail by default (explicit override required to allow).

## Output and UX

1. HTML output rejected for multi-document extraction runs.
2. JSON output is object for single doc, array for multi-doc.
3. JSONL remains stable and recommended for multi-doc and large outputs.

---

## Testing Plan

1. Unit tests for each format decoder (text/file/url/json/jsonl/csv/stdin).
2. Unit tests for mapping auto-detection and explicit mapping paths.
3. Unit tests for ingestion error tagging and context fields.
4. Integration tests:
   - ingestion stream -> annotation stream for mixed batch sizes.
   - CLI structured inputs (JSONL/CSV/stdin) with deterministic `LanguageModel.testLayer`.
5. Regression tests:
   - removed legacy flags (`--text|--file|--url`) stay unsupported.

---

## Design Decisions Summary

1. Introduce a dedicated `Ingestion` service rather than embedding format parsing in CLI.
2. Normalize all input formats into `Stream<Document>`.
3. Keep extraction components unchanged where possible; add stream batching helper around existing `Annotator.annotateDocuments`.
4. Adopt a clean-break CLI contract with unified input flags and no legacy shims.
5. Keep phase-1 JSON array support buffered with explicit guardrails; rely on JSONL/CSV for truly large streaming workloads.
