# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 (Subset Curation & S3 Upload) of the `enron-data-pipeline` spec.

### Context

Phase 1 is complete. Use these artifacts as inputs:
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P2.md`
- `tooling/cli/src/commands/enron/schemas.ts`
- `tooling/cli/src/commands/enron/parser.ts`
- `tooling/cli/src/commands/enron/thread-reconstructor.ts`
- `tooling/cli/src/commands/enron/document-bridge.ts`

Raw dataset source (already uploaded):
- `s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz`

### Your Mission

Implement all Phase 2 tasks in `tooling/cli`:

1. Build thread scoring algorithm:
- Create `tooling/cli/src/commands/enron/thread-scorer.ts`
- Score factors (per spec):
  - multi-party participation
  - thread depth
  - financial keywords
  - action-item keywords
  - forwarded chains
  - length diversity
- Return score + breakdown for explainability

2. Build curated subset pipeline:
- Create `tooling/cli/src/commands/enron/curator.ts`
- Pipeline:
  - parse emails
  - reconstruct threads
  - score threads
  - select top diverse subset targeting 1-5K messages
  - map to curated JSON format for downstream extraction tests

3. Generate and upload manifest/artifacts:
- Serialize curated data and `manifest.json`
- Include at least:
  - selected thread count
  - selected message count
  - selection criteria summary
  - content hash(es) for cache validation
- Upload to `s3://static.vaultctx.com/todox/test-data/enron/curated/`

4. Add validation tests:
- Scoring tests (including ranking behavior)
- Curation tests (size bounds, diversity constraints, manifest integrity)

### Constraints

- Keep boundaries clean (`tooling/cli` only for this phase unless explicitly required).
- Follow monorepo and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`).
- Preserve deterministic outputs (stable sorting/tie-breakers for repeatable curation).
- Do not start long-running dev servers.

### Verification

Run and pass:

```bash
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
```

Note: legacy spec text may refer to `@beep/tooling-cli`, but current workspace package name is `@beep/repo-cli`.

Then update:
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 2 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P3.md`
- `specs/pending/enron-data-pipeline/handoffs/P3_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] `thread-scorer.ts` implemented with deterministic scoring + breakdown
- [ ] `curator.ts` implemented with thread selection pipeline
- [ ] Curated subset created (1-5K target range)
- [ ] Curated artifacts + `manifest.json` uploaded to S3 curated prefix
- [ ] Phase 2 tests pass for CLI package
- [ ] Reflection updated
- [ ] P3 handoff pair created
