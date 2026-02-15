# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 (Knowledge Pipeline Integration) of the `enron-data-pipeline` spec.

### Context

Phase 3 is complete. Use these artifacts as inputs:
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P4.md`
- `tooling/cli/src/commands/enron/index.ts`
- `tooling/cli/src/commands/enron/cache.ts`
- `tooling/cli/src/commands/enron/s3-client.ts`
- `tooling/cli/src/commands/enron/curator.ts`

Curated dataset is available via S3/cache loader path:
- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`
Loader guarantees deterministic `parse` NDJSON ordering by `(document.id, metadata.messageId)`.

### Your Mission

Implement all Phase 4 tasks:

1. Build test ontology mapping Enron concepts to TodoX WM ontology expectations:
- Create `tooling/cli/src/commands/enron/test-ontology.ttl`
- Include classes/predicates needed for extraction validation

2. Build extraction harness:
- Create `tooling/cli/src/commands/enron/extraction-harness.ts`
- Load curated documents via Phase 3 loader
- Compose/run extraction pipeline layers
- Collect entities, relations, and evidence spans

3. Execute extraction and capture results:
- Run harness against curated subset (or deterministic subset slice)
- Record runtime constraints/failures if environment blocks full run

4. Add quality validation:
- Entity type alignment to ontology classes
- Predicate validity
- Evidence grounding checks (source text span alignment)
- Basic non-hallucination checks where feasible

5. Document findings:
- Update/create `specs/pending/enron-data-pipeline/outputs/extraction-results.md`

### Constraints

- Keep boundaries clean; avoid unrelated refactors.
- Follow monorepo and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`).
- Preserve deterministic behavior in sampling/order/report outputs.
- Do not start long-running dev servers unless required for the harness run.

### Verification

Run and pass the relevant package checks/tests for touched packages.
At minimum, re-run:

```bash
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
```

If Phase 4 touches knowledge packages, include matching `--filter` runs for those packages in your verification summary.

Then update:
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 4 section)
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P5.md`
- `specs/pending/enron-data-pipeline/handoffs/P5_ORCHESTRATOR_PROMPT.md`

### Success Criteria

- [ ] Test ontology created and parseable
- [ ] Extraction harness implemented and runnable
- [ ] Curated loader path integrated into harness
- [ ] Extraction results captured with quality validation checks
- [ ] Findings documented in `outputs/extraction-results.md`
- [ ] Phase 4 package checks/tests pass
- [ ] Reflection updated
- [ ] P5 handoff pair created
