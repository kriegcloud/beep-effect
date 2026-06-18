# File Processing Capability Specification

## Status

**P1 MINIMUM VERTICAL PROOF COMPLETE**

Packet hardening completed on 2026-06-02. The minimum vertical implementation
landed through the law-practice office-action branch and merged to `main` in
PR #262 on 2026-06-18.

The remaining phases are breadth and hardening work: complete broad Tika
coverage, deepen libpff PST export, calibrate `beep files process` against
generated and operator-local corpus inputs, and record final handoff evidence.

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-06-02
- **Updated:** 2026-06-18

## Purpose

The legal AI stack needs a robust file processing substrate before higher-level
document management, file sync, corpus ingestion, or graph extraction work can
be reliable. The substrate must turn source files into typed, auditable
extraction artifacts that later product slices can consume without learning
about parser engines, native binaries, archive formats, or command-line
wrappers.

## Architecture Contract

`@beep/file-processing` is a `foundation/capability` package. It owns
domain-agnostic, schema-first operation contracts and file extraction IR. It is
not a shared-kernel product package, not a document-management slice, and not a
driver package.

This placement is accepted only after the `foundation/capability` gate is
proven in implementation: the package must carry no product semantics, wrap no
external engine, serve no repo-operational purpose, and have at least two named
current consumers importing it. The first implementation slice must therefore
prove imports from at least two of `@beep/tika`, `@beep/libpff`, and
`@beep/repo-cli`.

Concrete engines live in `drivers/*`:

- `@beep/tika` wraps Apache Tika for broad text and metadata extraction.
- `@beep/libpff` wraps libpff tooling for PST archive export.
- Later drivers may wrap LibreOffice, Poppler, Tesseract, Docling, or other
  engines when a later phase needs their concrete capability.

The repo CLI is the first non-product consumer:

- `beep files process` consumes `@beep/file-processing` and driver layers.
- It writes a schema-encoded manifest tree for tests and corpus coverage
  calibration.
- It does not own the file processing contracts; it is an operational adapter.

## Locked Decisions

| Decision | Locked answer |
| --- | --- |
| Capability package home | `packages/foundation/capability/file-processing` publishing `@beep/file-processing`. |
| External engines | Flat repo-level drivers, beginning with `@beep/tika` and `@beep/libpff`. |
| First implementation shape | Minimum vertical proof across capability, drivers, and repo CLI; not a contract-only package. |
| Public package root | Runtime-neutral contracts and curated exports only. |
| Live filesystem/process/HTTP composition | Owned by drivers, tooling, future server packages, or explicit environment entrypoints. |
| OCR | Strategy flag and skipped capability only in V1; no OCR implementation. |
| Product semantics | Future document-management and legal-domain semantics stay outside this packet. |

## P1 Decisions And Remaining Driver Questions

The P1 implementation resolved the minimum vertical decisions:

- The first `@beep/libpff` proof records typed engine-unavailable behavior and
  includes a synthetic child-artifact export proof.
- Generated synthetic fixtures cover the P1 package and CLI proof surfaces.
- No `@beep/file-processing/node` entrypoint was required for P1; filesystem
  and process composition stayed in drivers, tooling, and the law-practice
  server boundary.

Remaining driver questions belong to P2/P3/P4:

- broad Tika extraction and metadata proof for every non-PST V1 family
- real/public PST export proof beyond the synthetic P1 child-artifact path
- optional coverage profiling against operator-local corpus inputs

## Schema-First Operation Model

File processing operations are modeled as effectful schemas:

- Operation inputs are `S.Class` or tagged-union schemas.
- Operation outputs are schemas with encoded forms suitable for JSONL and
  manifest files.
- Operation failures are typed tagged errors.
- Services return `Effect` values and expose `Context.Service` contracts.
- Runtime implementation is provided through `Layer` composition at driver,
  tooling, or future server boundaries.

`@beep/schema` remains the home for pure primitives and codecs such as
`FilePath`, `FileName`, `FileExtension`, `MimeType`, CSV, JSON, JSONC, JSONL,
Markdown, and parser options. `@beep/file-processing` composes those primitives
into effectful operations. It must not move native process execution, Tika,
libpff, or product-specific document semantics into `@beep/schema`.

## Public Surface

The package should expose concept subpaths rather than a wide root facade.

Planned subpaths:

- `@beep/file-processing/Artifact`
- `@beep/file-processing/Operation`
- `@beep/file-processing/Extraction`
- `@beep/file-processing/Strategy`
- `@beep/file-processing/Service`
- `@beep/file-processing/test`

The package root may re-export `VERSION` and a small curated surface only.
All planned subpaths are runtime-neutral unless a later implementation creates
an explicit environment entrypoint such as `@beep/file-processing/node`.

### Artifact

`Artifact` models product-neutral source and child file identity:

- source path or stream reference
- source hash
- byte size
- declared name and extension
- declared MIME type when present
- detected format
- child artifact references for archive or attachment outputs

Artifact identity is file-processing identity, not workspace or legal-domain
identity. Future product slices may map extraction artifacts to their own
domain entities.

### Operation

V1 operations:

- `DetectFile` - classify format from source bytes and available hints.
- `ExtractFile` - extract text, metadata, spans, and rendition references.
- `ExportArchive` - expand archive-like formats into child artifacts.
- `ProcessFile` - run detection plus the applicable extraction/export steps.

Operations carry requested strategy preferences and bounded output budgets.
They do not expose per-format function names such as `parsePdf` or `parseDocx`
as the primary API.

### Extraction

The extraction IR records:

- source artifact reference
- operation id
- detected format
- engine name and version
- processing config digest
- extracted text when within materialization budget
- text spans with stable ids and offsets when available
- metadata fields emitted by the engine
- child artifact references
- skipped capabilities
- typed failures and warnings

The IR is extraction-oriented. It is not a bidirectional conversion contract and
does not promise layout-perfect document reconstruction.

### Strategy

Strategy selection is declared and deterministic.

Callers may express:

- requested operation
- accepted format families
- preferred engine family
- maximum materialized bytes
- whether child artifacts should be exported
- whether OCR-capable strategies are allowed

The service selects from declared driver capabilities. Drivers do not
self-register dynamically at runtime.

### Service

The service contract exposes file processing operations in `Effect`:

- drivers implement product-neutral capabilities
- the capability service chooses a deterministic strategy
- tooling and future server packages compose the live Layers
- public contracts do not depend on Tika, libpff, Box, or product slices

## Streaming And Materialization

V1 uses hybrid bounded streaming:

- file bytes and child artifact output may be streamed
- text and metadata may be materialized when they fit explicit budgets
- large outputs must write child files or manifest references instead of
  forcing callers to hold everything in memory

This supports small fixture tests and realistic corpus processing without
requiring every consumer to operate directly on streams.

## V1 Formats

Corpus-core V1 support:

| Format family | V1 behavior |
| --- | --- |
| DOC / DOCX / RTF | Extract text and metadata through `@beep/tika`. |
| HTML / XHTML | Extract text and metadata through `@beep/tika`. |
| PDF | Extract text-layer content and metadata through `@beep/tika`. |
| PST | Export child EML artifacts and JSONL metadata through `@beep/libpff`. |
| Plain text / Markdown | Decode text using existing schema primitives and record metadata. |
| Images | Record file metadata only; OCR is a later strategy. |
| XLS / XLSX / DOCM | Known local-corpus inputs; classify deterministically, but deep extraction is not required for V1 acceptance. |

OCR belongs to the operation model as a future strategy and driver boundary,
not as a V1 implementation requirement.

## Manifest Tree Output

`beep files process` writes an output directory containing schema-encoded
artifacts. The V1 tree shape is:

```txt
<output>/
  run.json
  sources.jsonl
  failures.jsonl
  coverage.json
  text/
    <operation-id>.txt
  children/
    <source-artifact-id>/
      artifacts.jsonl
```

Required schema names:

- `ProcessRunManifest` for `run.json`
- `SourceProcessingRecord` for `sources.jsonl`
- `FileProcessingFailureRecord` for `failures.jsonl`
- `FileProcessingCoverageSummary` for `coverage.json`
- `TextArtifactReference` for text references
- `ChildArtifactRecord` for child artifacts

Records are ordered by normalized source-relative path, then operation id.
Manifest paths are relative to the output root. The CLI must not write absolute
source paths into normal manifests unless an explicit diagnostic flag enables
host-specific profiling output.

Default CLI exit policy:

- `0` when all processable inputs succeed and expected skips are recorded
- `1` when one or more per-source hard failures occur and the failure policy is
  fail-on-error
- `2` when command configuration, output directory setup, or required engine
  discovery fails before per-source processing begins

Every manifest document is encoded from `@beep/file-processing` schemas.

## Driver Requirements

### `@beep/tika`

`@beep/tika` owns the technical boundary to Apache Tika 3.x. The default V1
runner is Tika Server over HTTP, with the currently documented format reference
tracked at <https://tika.apache.org/3.3.1/formats.html>. The driver exposes
typed capabilities and technical failures only. It does not import product
slices.

Required V1 capabilities:

- detect supported formats where Tika can classify them
- extract text and metadata for Office, RTF, HTML, PDF, text,
  Markdown-compatible text, and image metadata
- report engine name and version
- discover Tika through typed config, including base URL, timeout, and output
  budgets
- translate Tika failures to driver errors that die at the adapter boundary

### `@beep/libpff`

`@beep/libpff` owns the technical boundary to libpff tooling.

Required V1 capabilities:

- validate that the libpff executable surface is available
- discover the executable through typed config or PATH
- export PST contents to child EML artifacts
- produce JSONL metadata records for exported messages
- preserve folder/message/attachment relationships where libpff exposes them
- report engine name and version
- translate native process failures to driver errors that die at the adapter
  boundary

## Error Boundaries

Drivers expose technical errors. `@beep/file-processing` exposes
operation-level errors. `beep files process` translates operation errors into
manifest failure records and CLI exit behavior.

No Tika, libpff, native process, filesystem, or child-process error type should
escape as itself across the operation contract.

V1 error ownership:

| Boundary | Error family | Examples |
| --- | --- | --- |
| Driver internals | Driver technical errors | `TikaDriverError`, `LibpffDriverError`, `ExternalProcessError`, `EngineTimeout` |
| Capability operation | Public operation errors | `FileDetectionFailed`, `UnsupportedFileFormat`, `FileExtractionFailed`, `ArchiveExportFailed`, `FileProcessingEngineUnavailable`, `FileProcessingTimedOut`, `FileProcessingOutputLimitExceeded` |
| CLI command | Command boundary error | `FilesProcessCommandError` |
| Manifest records | Encoded operation failures and skips | `FileProcessingFailureRecord`, `FileProcessingWarningRecord`, `FileProcessingSkipRecord` |

Warnings and skips are data, not raw thrown errors. V1 skip reasons include
`ocr-disabled`, `format-out-of-scope`, `engine-unavailable`,
`encrypted-source`, and `output-budget-exceeded`.

Non-trivial translation belongs in role files named with
`error-translation.ts`, colocated with the consumer boundary. Inline
`Effect.mapError` or `Effect.catchTag` is acceptable for single-call-site
translations.

## Source-Of-Truth Order

When sources disagree, use this order:

1. `standards/ARCHITECTURE.md`
2. `standards/architecture/*`
3. this `SPEC.md`
4. `PLAN.md`
5. `research/engine-selection.md`
6. `ops/manifest.json`

## Acceptance Criteria

- `@beep/file-processing` exists with schema-first operation, extraction,
  strategy, artifact, service, and test surfaces.
- The package README records its named consumers and passes the
  `foundation/capability` gate.
- At least two real consumers import `@beep/file-processing` before the
  capability package is considered promotion-ready.
- `@beep/tika` implements the declared V1 extraction capabilities.
- `@beep/libpff` implements the declared V1 PST export capabilities.
- `beep files process` writes a schema-encoded manifest tree.
- Generated synthetic fixtures cover every V1 format family.
- Package and CLI tests prove detection, extraction, archive export, typed
  failure translation, and manifest encoding.
- Relevant `check`, `test`, `lint`, and `docgen:local` gates pass.
