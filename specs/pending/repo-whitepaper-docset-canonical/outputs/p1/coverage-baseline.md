# P1 Coverage Baseline

## Objective

Establish baseline coverage metrics for source indexing and claim harvesting.

## Baseline Metrics

| Source Area ID | Indexed Artifacts | Harvested Facts | Evidence IDs | Coverage Status |
|---|---:|---:|---:|---|
| S01 | 31 | 3 | 3 | in progress |
| S02 | 7 | 2 | 2 | in progress |
| S03 | 40 | 3 | 3 | in progress |
| S04 | 72 | 4 | 4 | in progress |
| Total | 150 | 12 | 12 | baseline established |

## Interpretation

1. Baseline is intentionally minimal and sufficient for phase bootstrapping.
2. P4-P5 drafting requires expanded fact density per document section.
3. P6 requires complete coverage verification against `outputs/manifest.json` and `outputs/p6/traceability-links.json`.

## Exit Checks

1. `fact-ledger.json` parses and uses valid enums.
2. Every source area has at least one evidence reference.
3. No source area is omitted from the matrix.
