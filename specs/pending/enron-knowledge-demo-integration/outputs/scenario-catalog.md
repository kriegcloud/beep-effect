# Scenario Catalog (Deterministic)

## Source

Derived from prior Enron spec artifacts:

- `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.json`
- curated dataset set:
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

## Deterministic Ordering Rule

Sort by `scenarioId` ascending.

## Scenarios

| Scenario ID | Use Case | Source Document ID | Query Seed | Rationale |
|---|---|---|---|---|
| scenario-1 | pre-meeting agenda/follow-up | email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a | Conference Call | explicit scheduling/follow-up coordination |
| scenario-2 | deal/financial discussion | email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88 | Duke Exchange Deal | monetary/deal workflow details |
| scenario-3 | org-role/ownership change | email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42 | Rod Wright | role/power ownership context |
| scenario-4 | multi-party negotiation/action tracking | email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607 | Fuel Supply Agreement | cross-party negotiation + action sequencing |

## Extraction Scope

- Full thread documents for selected scenario thread
- Deterministic cap: max 25 documents per scenario ingest
- If thread has >25 docs: keep deterministic lexical order by document ID, then take first 25

## Ontology Decision

Use:

- `tooling/cli/src/commands/enron/test-ontology.ttl`

for batch extraction payload ontology content.

## UI Display Fields

Each scenario card should include:

- title (use case + document title)
- query seed
- categories/depth/participants (when available)
- ingest state (not-started, pending, running, completed, failed)
- last ingested at (if available)
