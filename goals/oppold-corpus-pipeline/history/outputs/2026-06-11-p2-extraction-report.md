# P2 Extraction Run Report (2026-06-11)

## Outcome

Real extraction ran over every unique-digest artifact in `raw/` via
`bun run beep corpus extract --corpus-root /home/elpresidank/data-home/oppold-corpus
--tika-jar ~/.local/share/tika/tika-app-3.3.1.jar --export-children
--concurrency 4 --overwrite`. Output tree: `oppold-corpus/staging/extract/`
(28 GB) with `run.json`, `coverage.json`, `sources.jsonl`, `failures.jsonl`,
`text/`, `metadata/`, and `children/` in `@beep/file-processing` manifest
shapes.

## Drivers Hardened (SPEC targets)

- `drivers/libpff`: real `pffexport` subprocess engine
  (`makePffexportFileProcessingEngine`) — spawns pffexport, drains pipes,
  walks the export tree, and emits one `ArtifactReference` per exported
  message part and attachment. Stub-binary unit tests (4) keep CI free of a
  system pffexport. Host binary: AUR `libpff-git` 20260608.
- `drivers/tika`: real tika-app subprocess engine
  (`makeTikaAppFileProcessingEngine`) — `java -jar tika-app.jar -J -t`
  per file, single call for text + metadata, schema-validated JSON parsing,
  120 s per-file timeout. Stub-binary unit tests (4). Host jar: Apache
  tika-app 3.3.1 under `~/.local/share/tika/`.
- `beep corpus` family complete: `salvage | catalog | extract | organize |
  enrich` all documented by `bun run beep corpus --help`.

## Coverage (7,330 unique digests; 1,108 duplicate copies skipped)

| Format | Succeeded | Failed |
| --- | --- | --- |
| pst | 27 | 0 |
| doc | 1,196 | 0 |
| docx | 2,399 | 0 |
| docm | 1 | 0 |
| rtf | 15 | 0 |
| html | 766 | 0 |
| pdf-text-layer | 337 | 0 |
| plain-text | 2,034 | 0 |
| markdown | 1 | 0 |
| image-metadata | 252 | 0 |
| xls / xlsx | 17 | 0 |
| unknown | 0 | 285 |
| **Total** | **7,045** | **285** |

- **663,272 child artifacts** exported from the 27 unique PST archives
  (per-message bodies, headers, recipients, attachments), recorded in
  `children/<artifact-id>/artifacts.jsonl`.
- **6,702 text artifacts** under `text/`, one metadata JSON per extracted
  source under `metadata/`.
- Every SPEC-named format (doc/docx/pdf/html/rtf) extracted at 100%.

## Failures (all expected classes)

| Reason | Count | Explanation |
| --- | --- | --- |
| unsupported-file-format | 246 | unknown extensions (`.zip`, extensionless, misc.) — out of V1 scope |
| engine-unavailable | 24 | unknown-format files no engine claims |
| file-detection-failed | 15 | file names containing literal backslashes (non-portable paths; named in the P1 report) |

## Spot Checks

- `Sent_Emails.pst` export: real message bodies with intact reply chains and
  headers (verified `Sent Items/Message00026/Message.txt`).
- PDF text: patent claims text extracted verbatim from CAD-package
  application PDFs.
- Metadata JSON: full Tika metadata (content type, parser chain, image
  dimensions) per artifact.

## Decisions

- Extraction processes one representative per content digest
  (`--include-duplicates` exists for full re-runs); duplicate linkage stays
  in the DuckDB catalog.
- pffexport ran in `items` mode with `text` body format; recovered-item
  export (`-m all`) remains available later since `raw/` PSTs are immutable.
- xls/xlsx/docm extraction came free with real Tika and was kept.

## Quality Gates

`TURBO_FORCE=1 bunx turbo run check lint test` green for `@beep/libpff`,
`@beep/tika`, `@beep/repo-cli` (corpus tests: 7 passing incl. stub-engine
end-to-end extract + salvage verification).
