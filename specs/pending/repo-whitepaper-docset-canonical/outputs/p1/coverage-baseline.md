# P1 Coverage Baseline

## Objective

Publish the P1 counting baseline from the complete source inventory and seeded fact ledger.

## Baseline Metrics

| Source Area ID | Indexed Artifacts | Text Artifacts | Binary Artifacts | Harvested Facts | Evidence IDs | Coverage Status |
|---|---:|---:|---:|---:|---:|---|
| S01 | 31 | 31 | 0 | 5 | 5 | complete |
| S02 | 7 | 7 | 0 | 4 | 4 | complete |
| S03 | 48 | 48 | 0 | 5 | 5 | complete |
| S04 | 78 | 75 | 3 | 6 | 6 | complete |
| Total | 164 | 161 | 3 | 20 | 20 | complete |

## Metric Formulas

1. `Indexed Artifacts`: exact `find <root> -type f | sort` count from `source-index.md`.
2. `Text Artifacts`: files with extensions `md`, `ts`, `mjs`, or `json`.
3. `Binary Artifacts`: `Indexed Artifacts - Text Artifacts`.
4. `Harvested Facts`: count of `CorpusFact` rows in `fact-ledger.json` by source area prefix.
5. `Evidence IDs`: unique `evidenceRef` count by source area prefix.

## Interpretation

1. Source inventory is complete for all four locked source areas.
2. Fact harvest is rubric-minimum and seeded across all source areas.
3. S04 includes metadata coverage for non-text artifacts (pdf/jpg/jpeg) without excluding them from inventory.

## P1 Exit Checks

1. `fact-ledger.json` parses and all `status` values are valid (`implemented|specified|conceptual`).
2. Every fact has a non-empty `evidenceRef` and all evidence IDs are unique.
3. No source area is omitted from inventory or baseline metrics.
4. Source-area counts in this file match `source-index.md` exactly.
