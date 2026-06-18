# P0 Salvage Run Report (2026-06-11)

> Note: corpus paths, source labels, exact file counts, and byte totals are
> redacted to comply with the SPEC no-corpus-content/no-PII constraint.
> `<CORPUS_ROOT>` denotes the outside-repo corpus root; `<N>`/`<BYTES>`
> denote redacted counts/sizes; `<source-N>` denotes a redacted source
> label. The machine-readable values live in the outside-repo manifest only.

## Outcome

All source locations salvaged into `<CORPUS_ROOT>/raw/` with per-file
SHA-256 verification. Zero read errors, zero hash mismatches, zero skipped
files.

## Method

Runner: `<CORPUS_ROOT>/ops/run-salvage.sh` → `ops/salvage.sh` (fail-fast).
Per file: `sha256sum` origin → `cp --preserve=timestamps` → `sha256sum` copy →
compare → append provenance record. Source order per `PLAN.md`: removable
media first (no second copy), then local sources. Full log:
`<CORPUS_ROOT>/logs/salvage-2026-06-11.log` (kept beside the data, outside the
repo).

Provenance manifest: `<CORPUS_ROOT>/raw/provenance.jsonl` — one JSONL record
per file with `sourceLabel`, `originPath`, `relativePath`, `destPath`,
`sizeBytes`, `mtimeEpoch`, `mtimeIso`, `sha256`, `salvagedAt`.

## Counts

Per-source file counts and byte totals are redacted; they live in the
outside-repo manifest only. Shape: one row per source label
(`<source-1>` … `<source-5>`), each with `<N>` files / `<BYTES>` and a
`Matches pre-salvage scan` flag, summing to a `<N>` / `<BYTES>` total.

Salvage window: 2026-06-11T14:59:26Z → 2026-06-11T15:10:01Z. Log tail:
`SALVAGE-COMPLETE` for every label, then `ALL-SOURCES-SALVAGED`, runner
exit code 0. Manifest line count equals the summed per-source walk counts;
no count drift.

## Spot-check (verification matrix: salvage integrity)

`ops/spot-check.sh 15`: the largest file per source label plus a 15-record
random sample (20 unique records after de-dup). For each record the raw/ copy
AND the origin file were re-hashed and compared against the manifest digest:

```
SPOT-CHECK-PASS: 20/20 records verified (manifest = copy = origin)
```

Sample included the largest USB PST, both standalone PSTs, the largest
CAD-package PDF, and 16 corpus-side files spanning `$I`/`$R` pairs, named
directories, and the per-message export tree.

## Observations for P1

- The largest local source contains a pre-existing per-message export tree
  (a `…/Sent Items/Message…/…` hierarchy) alongside its `source/<archive-1>.pst`
  — most of the txt and html files live there. P1/P2 should treat that tree
  as an alternate rendering of `<archive-1>.pst`, not as independent
  documents.
- Clean-named directories coexist with `$I*`/`$R*` recycle-bin files at the
  tree root, so name restoration applies to a subset of the corpus, not all
  of its files.
- USB year-series gaps confirmed at salvage time: a missing early-year Inbox
  and a missing late-year Sent archive within the recovered PST series.

## Original sources

Untouched, per SPEC non-goals. Source retirement remains a manual user
decision after this verified salvage.

## Amendment (2026-06-11, during P1)

A batch of provenance records carried a leading `\` in their `sha256` field
— the `sha256sum` escape marker for file names containing a literal
backslash. The underlying digests were correct and re-verified against both
copy and origin; the manifest was corrected in place and the pre-fix version
archived at `<CORPUS_ROOT>/logs/provenance.jsonl.pre-escape-fix`. Details in
[`2026-06-11-p1-catalog-report.md`](./2026-06-11-p1-catalog-report.md).
