# Phase 4 Extraction Results

Last updated: 2026-02-15

## Run configuration

- Harness entrypoint: `tooling/cli/src/commands/enron/extraction-harness.ts`
- Command: `bun tooling/cli/src/commands/enron/extraction-harness.ts --limit 25 --output specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- Ontology: `tooling/cli/src/commands/enron/test-ontology.ttl`
- Curated source path: `s3://static.vaultctx.com/todox/test-data/enron/curated/{threads.json,documents.json,manifest.json}`
- Loader mode: cache-first via Phase 3 `EnronDataCache` + `S3DataSource`
- Document selection: deterministic sort by `(document.id, metadata.messageId)`, then `offset=0`, `limit=25`

## Ontology parse result

The test ontology parsed successfully.

- Classes: 6
- Properties: 6
- Class IRIs:
  - `https://todox.dev/ontology/wm/ActionItem`
  - `https://todox.dev/ontology/wm/EmailMessage`
  - `https://todox.dev/ontology/wm/FinancialInstrument`
  - `https://todox.dev/ontology/wm/MonetaryAmount`
  - `https://todox.dev/ontology/wm/Organization`
  - `https://todox.dev/ontology/wm/Person`
- Property IRIs:
  - `https://todox.dev/ontology/wm/discussesInstrument`
  - `https://todox.dev/ontology/wm/hasThreadReference`
  - `https://todox.dev/ontology/wm/mentionsOrganization`
  - `https://todox.dev/ontology/wm/mentionsParticipant`
  - `https://todox.dev/ontology/wm/reportsAmount`
  - `https://todox.dev/ontology/wm/requestsAction`

## Execution summary

- Dataset hash: `72de84d49b3ab02460ee63d4f583ba1dc3c64cb0c4a1c95d0b802f10ef60fadd`
- Cache status: `hit`
- Requested documents: 25
- Processed documents: 25
- Successful documents: 25
- Failed documents: 0
- Total mentions: 1014
- Total entities: 1014
- Total relations: 732
- Total tokens used: 136077
- Total runtime: 38 ms
- Runtime constraints: `none`

## Quality validation checks

### Aggregate checks

- Entity type checks: 1014
- Invalid entity types: 0
- Predicate checks: 732
- Invalid predicates: 0
- Evidence checks: 732
- Invalid evidence checks: 0
- Hallucination checks: 2478
- Hallucination signals: 0

### Rates

- Entity type alignment rate: `1.0000`
- Predicate validity rate: `1.0000`
- Evidence grounding rate: `1.0000`
- Non-hallucination rate: `1.0000`

## Key findings

1. Phase 4 pipeline integration is runnable end-to-end through the Phase 3 curated loader path and deterministic ordering contract.
2. Ontology alignment checks are clean for this deterministic slice: no unknown entity types and no unknown predicates.
3. Evidence span grounding checks are fully passing on this harness implementation for the sampled 25-document run.
4. The harness is deterministic and reproducible: same cache manifest hash, same ordering, and stable quality summary metrics for the same input slice.

## Runtime blockers encountered in this cycle

- Type-level build breakages were addressed in `@beep/repo-cli`:
  - optional CLI args now correctly use `Option<T>` at command boundaries,
  - `EnronDataCache` no longer leaks `S3DataSource` requirements in its public service interface,
  - extraction harness now stays within `tooling/cli` boundaries and compiles cleanly under repo-cli build settings.

## Artifacts

- Detailed machine-readable report: `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- Ontology used for validation: `tooling/cli/src/commands/enron/test-ontology.ttl`
- Harness implementation: `tooling/cli/src/commands/enron/extraction-harness.ts`

## Phase 5 implications

- Phase 5 can proceed using this deterministic extraction output as baseline input.
- Because this harness is deterministic and grounding checks passed for the sampled slice, Phase 5 should focus on scenario realism and evidence-chain usefulness rather than extraction runtime stability.
