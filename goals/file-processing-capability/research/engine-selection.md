# Engine Selection

## Purpose

This note records the V1 engine split for `@beep/file-processing`. It is a
research and routing aid, not the source of truth for package boundaries. The
architecture standard owns topology doctrine; [SPEC.md](../SPEC.md) owns
goal-specific details after that doctrine is satisfied.

## Recommendation

Use a hybrid driver strategy:

- `@beep/tika` for broad text and metadata extraction through a Tika Server
  HTTP sidecar.
- `@beep/libpff` for PST archive export through a CLI sidecar.
- Treat Poppler and Gotenberg/LibreOffice as explicit near-term specialist
  candidates, but do not require them for V1 completion.
- Treat Docling as the first later structured/OCR/layout candidate.
- Treat Unstructured as optional, Marker as opt-in only, and Kreuzberg as a
  benchmark candidate.

This matches the repo architecture:

- `@beep/file-processing` owns product-neutral operation contracts and IR.
- drivers own external engine boundaries.
- `beep files process` owns repo operation and manifest proof.

## Apache Tika

Apache Tika 3.x is the V1 broad extraction engine because it supports a wide range
of document formats and exposes text plus metadata extraction. Current Tika
format documentation lists Microsoft Office OLE2 and OOXML formats, RTF, PDF,
HTML, text formats, image metadata formats, mail formats, and PST parsing
through `OutlookPSTParser`.

Use Tika in V1 for:

- DOC / DOCX
- RTF
- HTML / XHTML
- text-layer PDF extraction
- text and Markdown-compatible text
- image metadata
- broad format detection where Tika can classify the input

Do not use Tika as the only PST path in V1. PST export needs child EML artifacts
and structured archive output, which is better routed through libpff.

Runner decision:

- default runner: Tika Server over HTTP
- discovery: typed config with base URL, request timeout, and output budgets
- version capture: request and record the runtime Tika version during startup or
  first operation
- missing engine behavior: translate to `FileProcessingEngineUnavailable`

Reference:

- <https://tika.apache.org/3.3.1/formats.html>

## libpff

libpff is the V1 PST export engine. It is purpose-built for Personal Folder
File and Offline Folder File formats used by Outlook data stores, including PST
and OST files.

Use libpff in V1 for:

- validating the PST export executable surface
- exporting PST contents into child EML artifacts
- producing JSONL metadata for messages, folders, and attachments where
  available
- preserving source-to-child relationships in the file-processing manifest

Runner decision:

- default runner: CLI sidecar using libpff tooling, discovered from typed config
  or PATH
- version capture: record executable version when available
- missing engine behavior: translate to `FileProcessingEngineUnavailable`

Reference:

- <https://github.com/libyal/libpff>
- <https://github.com/libyal/libpff/blob/main/documentation/Personal%20Folder%20File%20%28PFF%29%20format.asciidoc>

## LibreOffice

LibreOffice is a later driver candidate for conversions and renditions. It is
not a V1 dependency because this packet focuses on extraction IR rather than
bidirectional conversion or layout-perfect rendering.

Likely later uses:

- DOC/DOCX/RTF to PDF renditions
- Office-to-text or Office-to-HTML fallbacks
- conversion workflows where exact Tika text extraction is not enough

Recommended integration path: Gotenberg/LibreOffice HTTP sidecar for
conversion/rendition workflows. This is not a V1 extractor.

Reference:

- <https://help.libreoffice.org/latest/sq/text/shared/guide/convertfilters.html>
- <https://help.libreoffice.org/latest/sq/text/shared/guide/pdf_params.html>

## Poppler

Poppler is a later PDF-specific driver candidate. It is not required for V1
because Tika can cover the initial text-layer PDF extraction path.

Likely later uses:

- PDF metadata verification through `pdfinfo`
- PDF text extraction comparison through `pdftotext`
- PDF page/image/rendition workflows
- PDF text-layer sanity checks and embedded image extraction

Recommended integration path: CLI sidecar around `pdfinfo`, `pdftotext`, and
`pdfimages`. This is a specialist PDF diagnostics/assets driver candidate, not
the broad V1 extractor.

Reference:

- <https://manpages.debian.org/bookworm/poppler-utils/pdfinfo.1.en.html>
- <https://manpages.debian.org/bookworm/poppler-utils/pdftotext.1.en.html>
- <https://manpages.debian.org/bookworm/poppler-utils/pdfimages.1.en.html>

## Docling

Docling is the preferred later candidate for layout-aware and OCR-capable
structured extraction. It supports PDF, DOCX, XLSX, PPTX, Markdown, HTML, CSV,
and common image formats, and exports Markdown, JSON, HTML, and text. It does
not replace libpff for PST and should not be a V1 dependency.

Reference:

- <https://docling-project.github.io/docling/usage/supported_formats/>

## Unstructured

Unstructured is a credible optional provider for element partitioning across a
broad document set, including DOC, DOCX, RTF, PDF, HTML, images, text, and XLSX.
It brings Python/container dependency weight, so it is a later provider, not the
initial abstraction anchor.

Reference:

- <https://docs.unstructured.io/open-source/core-functionality/partitioning>

## Marker

Marker is a powerful PDF-to-Markdown/JSON option. It is opt-in only because its
project documents GPL code and commercial restrictions for broader commercial
self-hosting/model use. Do not make it a default driver without a licensing
decision.

Reference:

- <https://github.com/datalab-to/marker>

## Kreuzberg

Kreuzberg is a promising Rust-core, TypeScript-capable document intelligence
candidate. Treat it as a benchmark candidate against Tika and Docling, not as
the V1 anchor.

Reference:

- <https://github.com/kreuzberg-dev/kreuzberg>

## OCR Engines

OCR is a later strategy and driver boundary. The V1 operation model should
reserve OCR-capable strategy flags so scanned PDFs and image-backed documents
can be routed later, but no OCR implementation is required in this packet.

Likely later uses:

- scanned PDF text extraction
- image text extraction
- layout-aware extraction for evidence spans
- comparison between Tesseract, Tika OCR integration, and newer document AI
  engines

## Strategy Summary

| Engine | Runner | V1 role | Later role |
| --- | --- | --- | --- |
| Tika 3.x | HTTP sidecar | Broad extraction and metadata | fallback/comparison engine |
| libpff | CLI sidecar | PST export | deeper forensic metadata if needed |
| Poppler | CLI sidecar | none | PDF diagnostics, bbox/text comparison, image extraction |
| Gotenberg/LibreOffice | HTTP sidecar | none | conversions and renditions |
| Docling | Python/container sidecar | none | structured extraction, OCR, layout-aware Markdown/JSON |
| Unstructured | Python/container sidecar | none | optional element partitioning provider |
| Marker | Python/container sidecar | none | opt-in PDF Markdown/JSON after licensing decision |
| Kreuzberg | TS/Rust/CLI candidate | none | benchmark candidate |
| OCR engines | driver-specific sidecar | strategy placeholder only | scanned/image-backed extraction |
