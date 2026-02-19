# Phase 4 Handoff: Knowledge Pipeline Integration

## Context For Phase 4

### Working Context (<=2K tokens)

Current task: implement Phase 4 in knowledge integration surface:
- P4.1 wealth-management-oriented test ontology for Enron dataset
- P4.2 extraction harness that loads curated Enron docs and runs knowledge extraction pipeline
- P4.3 run harness against curated subset and record outcomes
- P4.4 extraction quality validation checks (types, predicates, evidence grounding)
- P4.5 findings documentation

Phase 3 is complete.

Implemented in Phase 3:
- `tooling/cli/src/commands/enron/s3-client.ts`
  - typed `S3DataSource` service
  - strict URI validation for `s3://static.vaultctx.com/todox/test-data/*`
  - typed failures for invalid URI, missing object (404), and transport errors
- `tooling/cli/src/commands/enron/cache.ts`
  - `EnronDataCache` service + live layer
  - cache-first reads with S3 manifest check fallback
  - cache validation via SHA-256 + byte-length checks against manifest metadata
  - invalidation statuses: `miss`, `hit`, `manifest-changed`, `artifact-mismatch`
- `tooling/cli/src/commands/enron/index.ts`
  - `enron download` (sync curated cache)
  - `enron info` (counts/hash/cache status)
  - `enron parse` (deterministic NDJSON emission of curated docs)
  - `enron curate` (Phase 2 curation pipeline invocation from `--csv` or `--maildir`)
- `tooling/cli/src/index.ts`
  - `enron` command group wired into main `beep` CLI
- `tooling/cli/test/commands/enron/cache.test.ts`
  - integration coverage for cache miss/hit
  - hash mismatch invalidation + manifest change invalidation
  - `info` and `parse` output expectations
  - runs with explicit `Effect.runPromise(...)` harness to avoid ambient test-context filesystem overrides

Phase 3 verification run:
- `bun run check --filter @beep/repo-cli` ✅
- `bun run test --filter @beep/repo-cli` ✅

Current curated dataset source:
- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

Operational behavior to preserve in P4:
- Cache sync always validates local artifacts against manifest metadata before use.
- CLI parse output is deterministic NDJSON sorted by document id/message id.
- Loader currently resolves S3 through public HTTPS fetch for `static.vaultctx.com` prefix.

Immediate dependencies to read first:
- `specs/pending/enron-data-pipeline/README.md` (Phase 4 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P4.md` (this file)
- `tooling/cli/src/commands/enron/index.ts`
- `tooling/cli/src/commands/enron/cache.ts`
- `tooling/cli/src/commands/enron/curator.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`

### Episodic Context (<=1K tokens)

- Phase 0 uploaded canonical raw corpus tarball to S3 and documented parsing-library tradeoffs.
- Phase 1 built parser/thread reconstruction/document bridge with deterministic IDs and fixture tests.
- Phase 2 produced curated artifacts and uploaded manifest + hashed payloads.
- Phase 3 implemented runtime loader command surface with deterministic cache semantics and CLI integration tests.
- A recurring naming drift remains in some docs (`@beep/tooling-cli` vs actual package `@beep/repo-cli`). Keep verification filters aligned to `@beep/repo-cli`.

### Semantic Context (<=500 tokens)

- Bucket ARN: `arn:aws:s3:::static.vaultctx.com`
- Test-data prefix: `s3://static.vaultctx.com/todox/test-data/`
- Curated prefix: `s3://static.vaultctx.com/todox/test-data/enron/curated/`
- CLI package: `tooling/cli` (`@beep/repo-cli`)
- Cache default directory: `~/.cache/todox-test-data/enron/curated`
- Phase 3 command surface:
  - `bun run repo-cli enron download`
  - `bun run repo-cli enron info`
  - `bun run repo-cli enron parse [--limit N]`
  - `bun run repo-cli enron curate --csv <path> | --maildir <path>`

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Phase 3 prompt: `specs/pending/enron-data-pipeline/handoffs/P3_ORCHESTRATOR_PROMPT.md`

## Phase 4 Focus

Implement and validate:
- `tooling/cli/src/commands/enron/test-ontology.ttl`
- `tooling/cli/src/commands/enron/extraction-harness.ts`
- Phase 4 validation/report outputs (including extraction quality checks and findings doc)

Expected behavior:
1. Load curated Enron documents via Phase 3 loader/cache path.
2. Feed deterministic document stream into knowledge extraction pipeline layers.
3. Validate entity/relation/evidence quality constraints.
4. Record extraction outcomes and limitations in outputs docs.

## Verification Checklist (Phase 4)

- [ ] Test ontology created and parseable by ontology tooling
- [ ] Extraction harness implemented and runnable
- [ ] Harness loads curated Enron docs through Phase 3 loader path
- [ ] Pipeline run executed (or blocker documented with concrete failure mode)
- [ ] Quality checks implemented for entity typing, predicates, evidence grounding
- [ ] Findings documented in `specs/pending/enron-data-pipeline/outputs/extraction-results.md`
- [ ] `bun run check --filter @beep/repo-cli` (and relevant knowledge packages touched)
- [ ] `bun run test --filter @beep/repo-cli` (and relevant knowledge packages touched)
- [ ] `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` Phase 4 section updated
- [ ] Next handoff pair created:
  - `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P5.md`
  - `specs/pending/enron-data-pipeline/handoffs/P5_ORCHESTRATOR_PROMPT.md`
