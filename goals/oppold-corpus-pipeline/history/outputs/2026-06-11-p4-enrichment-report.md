# P4 Enrichment Run Report (2026-06-11)

## Outcome

`USPTO_API_KEY=$(op read "op://BEEP_SECRETS/BEEP_SECRETS/USPTO_API_KEY")
bun run beep corpus enrich --corpus-root /home/elpresidank/data-home/oppold-corpus
--max-lookups 150 --lookup-delay-millis 1100` resolved corpus-derived patent
and application identifiers against the USPTO Open Data Portal via the new
`drivers/uspto` driver. Outputs: `catalog/enrichment-manifest.jsonl`,
catalog table `corpus_enrichment`, `catalog/reports/enrich-summary.json`.

## Results (final run)

| Metric | Value |
| --- | --- |
| Identifier candidates discovered (filenames + extracted text) | 3,571 |
| Lookups performed (top-ranked, rate-limited ~55/min) | 150 |
| Resolved | 99 |
| Not found | 51 |
| Failed | 0 |
| **Family anchors** (resolved candidates carrying docket families) | **99** |

Sample anchors: application 16977436 → "TRENCH CLOSING ASSEMBLY"
(applicant Precision Planting LLC) anchored to docket family 10094; patent
8550020 "VARIABLE PRESSURE CONTROL SYSTEM FOR DUAL ACTING ACTUATORS"
anchored across nine families it is cited in; provisional 62447418
"DIFFERENTIAL SPEED STALK ROLLS" anchored to family 10000.

## Anchoring Mechanics

Identifiers found in a document's extracted text inherit that document's
docket family through the extraction `sources.jsonl` (text artifact →
content digest → `corpus_organized` docket family). Continuity parents per
resolved application come from the ODP continuity endpoint. Candidates with
docket-family associations rank ahead of bare-text matches, which suppressed
the dollar-amount noise the first pass surfaced.

## Iterations Recorded

1. Run 1: occurrence-ranked candidates → dollar-amount artifacts dominated,
   zero anchors.
2. Run 2: docket-first ordering — unchanged, exposing that the edit had
   silently failed to apply against biome-reformatted text (caught via
   result invariance + grep for the new symbol).
3. Run 4 (after verifiably landing the text-to-family linkage): 99/99
   resolved candidates anchored.

## Credentials

USPTO ODP requires an API key tied to an ID.me-verified USPTO.gov account
(provisioned by the user mid-session; stored in 1Password, read via
`op read`, passed as `USPTO_API_KEY`, never logged). Keys are deleted after
90 days of non-use.

## Remaining Capacity

3,421 lower-ranked candidates remain unresolved by choice (`--max-lookups
150`); re-running `corpus enrich` with a higher cap extends coverage
incrementally — the manifest and table are rebuilt idempotently.
