# P0 Salvage Run Report (2026-06-11)

## Outcome

All five source locations salvaged into
`/home/elpresidank/data-home/oppold-corpus/raw/` with per-file SHA-256
verification. Zero read errors, zero hash mismatches, zero skipped files.

## Method

Runner: `oppold-corpus/ops/run-salvage.sh` → `ops/salvage.sh` (fail-fast).
Per file: `sha256sum` origin → `cp --preserve=timestamps` → `sha256sum` copy →
compare → append provenance record. Source order per `PLAN.md`: ESD-USB first
(removable media, no second copy), then local sources. Full log:
`oppold-corpus/logs/salvage-2026-06-11.log` (kept beside the data, outside the
repo).

Provenance manifest: `oppold-corpus/raw/provenance.jsonl` — one JSONL record
per file with `sourceLabel`, `originPath`, `relativePath`, `destPath`,
`sizeBytes`, `mtimeEpoch`, `mtimeIso`, `sha256`, `salvagedAt`.

## Counts

| Source label | Files | Bytes | Matches pre-salvage scan |
| --- | --- | --- | --- |
| `esd-usb-lh-emails` | 26 | 27,228,424,192 | yes |
| `documents-re5arta` | 1 | 312,886,272 | yes |
| `documents-lh-emails` | 1 | 1,135,607,808 | yes |
| `data-home-oppold-ip-law` | 8,294 | 2,981,948,632 | yes |
| `data-home-precision-planting-cad` | 116 | 28,667,652 | yes |
| **Total** | **8,438** | **31,687,534,556** | — |

Salvage window: 2026-06-11T14:59:26Z → 2026-06-11T15:10:01Z. Log tail:
`SALVAGE-COMPLETE` for all five labels, then `ALL-SOURCES-SALVAGED`, runner
exit code 0. Manifest line count (8,438) equals the summed per-source walk
counts; no count drift.

## Spot-check (verification matrix: salvage integrity)

`ops/spot-check.sh 15`: the largest file per source label plus a 15-record
random sample (20 unique records after de-dup). For each record the raw/ copy
AND the origin file were re-hashed and compared against the manifest digest:

```
SPOT-CHECK-PASS: 20/20 records verified (manifest = copy = origin)
```

Sample included `esd-usb-lh-emails/LH_Inbox_2008.pst` (largest USB PST),
both standalone PSTs, the largest CAD-package PDF, and 16 Oppold_IP_Law
files spanning `$I`/`$R` pairs, named directories, and the
`Sent_Emails.export/` tree.

## Observations for P1

- `data-home-oppold-ip-law` contains a pre-existing per-message export tree
  (`Sent_Emails.export/Top of Outlook data file/Sent Items/Message…/…`)
  alongside `source/Sent_Emails.pst` — most of the 2,497 txt and 792 html
  files live there. P1/P2 should treat that tree as an alternate rendering of
  `Sent_Emails.pst`, not as independent documents.
- Clean-named directories (`Agreements/`, `Responses/`, …) coexist with
  `$I*`/`$R*` recycle-bin files at the tree root, so name restoration applies
  to a subset of the corpus, not all 8,294 files.
- USB year-series gaps confirmed at salvage time: no `LH_Inbox_2009`, no
  `LH_Sent_2015` (26 PSTs: Inbox 2002–2008, 2010–2015; Sent 2002–2014).

## Original sources

Untouched, per SPEC non-goals. Source retirement remains a manual user
decision after this verified salvage.

## Amendment (2026-06-11, during P1)

15 provenance records carried a leading `\` in their `sha256` field — the
`sha256sum` escape marker for file names containing a literal backslash.
The underlying digests were correct and re-verified against both copy and
origin; the manifest was corrected in place and the pre-fix version archived
at `oppold-corpus/logs/provenance.jsonl.pre-escape-fix`. Details in
[`2026-06-11-p1-catalog-report.md`](./2026-06-11-p1-catalog-report.md).
