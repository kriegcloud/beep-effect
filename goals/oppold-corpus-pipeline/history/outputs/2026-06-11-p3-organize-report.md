# P3 Organization Run Report (2026-06-11)

## Outcome

`bun run beep corpus organize --corpus-root /home/elpresidank/data-home/oppold-corpus
--client-map .../ops/client-map.json --overwrite` built the
`oppold-corpus/organized/` taxonomy from the restoration manifest and
canonical (digest-deduplicated) provenance records, with the organize
manifest at `catalog/organize-manifest.jsonl` and catalog table
`corpus_organized`.

## Taxonomy Counts (7,330 canonical artifacts)

| Category | Count | Materialization |
| --- | --- | --- |
| docket | 643 (105 docket families, 1 multi-version group) | copied to `dockets/<family>/<docket>/` |
| client | 81 (`precision-planting` via client map) | copied to `clients/<client>/...` |
| email-archive | 28 PSTs | symlinked under `email-archives/` |
| email-export | 3,271 (`Sent_Emails.export/` rendering) | manifest-only, no copies |
| recycle-metadata | 252 (`$I` blobs) | manifest-only |
| unsorted | 3,055 | copied to `_unsorted/<label>/<dirs>/` |

242 recycle-bin restored names applied (251 matched pairs minus duplicates
whose canonical copy lives elsewhere).

## Heuristics (deterministic, no LLM)

- Attorney-docket token pattern (`10109WO02-US1`, `101117US01`, …) extracted
  from effective names and paths; family = leading numeric prefix.
- Restored `$I` original paths supply directory structure for `$R` content
  (for example `H:\Oppold_IP_Law\Applications\…`).
- Client tier only from the explicit corpus-side label map
  (`ops/client-map.json`); nothing guessed.
- Version groups: same docket + same name stem ordered by source mtime
  (`v01--`, `v02--` prefixes).

## Sample Spot Checks

- `dockets/10064/10064WO01/Precision Planting (10064WO01) PCT Application 4-14-15.docx`
- `dockets/10000/10000WO01/360 Yield Center (10000WO01) Assignment 4-2-15.doc`
- `dockets/10007/10007US01/v01--VOID - Spec (10007US01).dotx` +
  `v02--VOID - Spec (10007US01).docx` (restored recycle-bin draft pair,
  mtime-ordered)
- `_unsorted/data-home-oppold-ip-law/Agreements/…` preserves original
  directory context for non-docket work product.

## Notes

- Docket-file client names are visible in the filenames (Precision Planting,
  360 Yield Center, …) but the `clients/` tier is populated only from the
  explicit map; P4 USPTO applicant data is the grounded path to filling
  client identity per family.
- User sampling review: pending user confirmation of the tree (samples
  above presented for review).
