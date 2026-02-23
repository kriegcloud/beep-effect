# Phase 5 Handoff: Meeting Prep Validation

## Context For Phase 5

### Working Context (<=2K tokens)

Current task: implement Phase 5 meeting-prep validation surface:
- P5.1 select 3-5 realistic Enron scenarios
- P5.2 generate meeting prep briefings
- P5.3 validate evidence chains per bullet
- P5.4 write `outputs/meeting-prep-quality.md`

Phase 4 is complete.

Implemented in Phase 4:
- `tooling/cli/src/commands/enron/test-ontology.ttl`
  - wealth-management test ontology for Enron extraction validation
  - parsed successfully by the Phase 4 harness ontology parser
- `tooling/cli/src/commands/enron/extraction-harness.ts`
  - loads curated docs through Phase 3 cache/S3 path
  - composes local deterministic extraction layer + cache layer
  - collects mentions/entities/relations + per-document quality validation
  - emits deterministic JSON report
- `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
  - deterministic run on `offset=0, limit=25`
  - summary: `processed=25`, `successful=25`, `failed=0`
  - totals: `mentions=1014`, `entities=1014`, `relations=732`, `tokens=136077`, `runtimeMs=38`
  - quality: `entityTypeAlignmentRate=1`, `predicateValidityRate=1`, `evidenceGroundingRate=1`, `nonHallucinationRate=1`
- `specs/pending/enron-data-pipeline/outputs/extraction-results.md`
  - Phase 4 findings and constraints summary

Phase 4 boundary fixes applied:
- `tooling/cli/src/commands/enron/cache.ts`
  - uses schema-safe JSON decode (`S.decodeUnknown(S.parseJson(...))`)
  - `EnronDataCache` service no longer leaks `S3DataSource` requirements
- `tooling/cli/src/commands/enron/index.ts`
  - fixed `Option<T>` command argument handling and `exactOptionalPropertyTypes` object construction
- `tooling/cli/src/commands/enron/extraction-harness.ts`
  - removed deep cross-package source imports that broke `@beep/repo-cli` NodeNext build
  - replaced with local deterministic extraction layer and ontology validation pipeline

Verification run completed in Phase 4:
- `bun run check --filter @beep/repo-cli` ✅
- `bun run test --filter @beep/repo-cli` ✅
- `bun run build --filter @beep/repo-cli` ✅
- `bun run build --filter @beep/knowledge-server` ✅
- `bun run check --filter @beep/knowledge-server` ✅
- `bun run test --filter @beep/knowledge-server` ✅ (548 pass, 20 skip, 0 fail)

Operational constraints to carry into Phase 5:
- Extraction harness is deterministic and currently healthy on bounded slice runs.
- This harness is deterministic validation tooling, not production semantic extraction quality. Treat extracted relations as stable test fixtures for Phase 5 validation workflows.
- Entity/predicate/evidence/non-hallucination checks are clean on the deterministic slice.

Immediate dependencies to read first:
- `specs/pending/enron-data-pipeline/README.md` (Phase 5 section)
- `specs/pending/enron-data-pipeline/outputs/extraction-results.md`
- `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- `packages/knowledge/domain/src/entities/MeetingPrep/contracts/Generate.contract.ts`
- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/knowledge/server/src/entities/Evidence/rpc/list.ts`

### Episodic Context (<=1K tokens)

- Phase 0 acquired and uploaded canonical Enron corpus artifact to S3.
- Phase 1 built parser/thread/document bridge foundations.
- Phase 2 curated deterministic subset and uploaded manifest + artifacts.
- Phase 3 implemented CLI loader/cache and deterministic `parse` ordering.
- Phase 4 integrated extraction pipeline with deterministic ontology/harness validation and produced extraction quality outputs.
- Naming drift still exists in some docs (`@beep/tooling-cli`), but actual package filters used in verification are `@beep/repo-cli`.

### Semantic Context (<=500 tokens)

- Bucket ARN: `arn:aws:s3:::static.vaultctx.com`
- Curated prefix: `s3://static.vaultctx.com/todox/test-data/enron/curated/`
- Curated dataset hash: `72de84d49b3ab02460ee63d4f583ba1dc3c64cb0c4a1c95d0b802f10ef60fadd`
- CLI package: `tooling/cli` (`@beep/repo-cli`)
- Harness file: `tooling/cli/src/commands/enron/extraction-harness.ts`
- Ontology file: `tooling/cli/src/commands/enron/test-ontology.ttl`
- Phase 4 outputs:
  - `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
  - `specs/pending/enron-data-pipeline/outputs/extraction-results.md`

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Master orchestration: `specs/pending/enron-data-pipeline/MASTER_ORCHESTRATION.md`
- Rubric: `specs/pending/enron-data-pipeline/RUBRICS.md`

## Phase 5 Focus

Implement and validate:
1. Scenario selection from curated Enron threads (3-5 representative meeting-prep cases)
2. Meeting prep generation via RPC path
3. Evidence-chain verification per generated bullet
4. Quality report output at `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md`

Expected behavior:
- Meeting-prep bullets are grounded in real curated dataset evidence.
- Evidence references are resolvable and semantically support bullet claims.
- Any remaining grounding gaps discovered in Phase 5 are measured and documented with concrete mismatch modes.

## Verification Checklist (Phase 5)

- [ ] 3-5 scenarios selected and documented
- [ ] Meeting prep generated for each scenario
- [ ] Evidence chain checks implemented/applied to generated bullets
- [ ] `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md` written
- [ ] `bun run check --filter @beep/repo-cli` (if CLI/phase tooling touched)
- [ ] `bun run test --filter @beep/repo-cli` (if CLI/phase tooling touched)
- [ ] Matching knowledge-package check/test filters run for any touched knowledge files
- [ ] `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` updated for Phase 5
- [ ] Next handoff pair created if further phase continuation is needed
