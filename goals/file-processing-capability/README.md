# File Processing Capability

## Status

Pending implementation; packet hardening complete.

## Mission

Define the product-neutral file processing capability required before document
management, local file sync, corpus ingestion, and later knowledge-graph
pipelines can rely on durable extraction artifacts.

This packet intentionally starts below product features. V1 proves file
detection, extraction, archive export, and manifest writing across the corpus
core formats without implementing Box sync, document-management workflows,
knowledge-graph ingestion, or OCR engines.

## Reading Order

- [SPEC.md](./SPEC.md) - authoritative goal contract when it does not
  conflict with the architecture standard
- [PLAN.md](./PLAN.md) - phased implementation plan
- [research/engine-selection.md](./research/engine-selection.md) - engine and
  driver rationale
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata

For topology, package placement, boundary, and error doctrine,
`standards/ARCHITECTURE.md` and `standards/architecture/*` outrank this packet.

## Target Topology

- `packages/foundation/capability/file-processing` publishes
  `@beep/file-processing`.
- `packages/drivers/tika` publishes `@beep/tika`.
- `packages/drivers/libpff` publishes `@beep/libpff`.
- `packages/tooling/tool/cli` adds `beep files process` as the repo-operated
  proof and corpus coverage surface.

`@beep/file-processing` owns schema-first operation contracts, extraction IR,
typed failures, strategy selection, and service contracts. It does not own
format-specific engines. Drivers implement declared operation capabilities.

## V1 Cutline

In scope:

- DOC, DOCX, RTF
- HTML and XHTML
- text-layer PDFs
- PST export to EML plus JSONL metadata
- plain text and Markdown
- image file metadata without OCR
- schema-encoded manifest tree output
- generated synthetic fixtures for package and CLI tests
- optional coverage profiling against `<operator-local-corpus>`

Known non-core inputs from the local corpus include XLS, XLSX, and DOCM. V1
must classify them deterministically as supported, skipped, or failed, but full
spreadsheet and macro-enabled document extraction is not a completion
requirement.

Out of scope:

- OCR implementation
- Box API, Box Drive, webhooks, or sync policy
- document-management product workflows
- knowledge-graph extraction or assembly
- legal-domain entity resolution
- bidirectional document conversion
- production artifact storage or retention policy

## Completion Standard

This goal is implementation-ready when future agents can scaffold the packages,
drivers, CLI command, fixtures, and tests without reopening package-placement,
engine-runner, manifest-shape, error-boundary, or operation-model decisions.

The next implementation target is a minimum vertical proof, not a contract-only
package. `@beep/file-processing` is promotion-ready only when at least two real
consumers import it and its README records those consumers.
