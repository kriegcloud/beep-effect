# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 (Meeting Prep Validation) of the `enron-data-pipeline` spec.

### Context

Phase 4 is complete. Use these artifacts as inputs:
- `specs/pending/enron-data-pipeline/handoffs/HANDOFF_P5.md`
- `specs/pending/enron-data-pipeline/outputs/extraction-results.md`
- `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- `tooling/cli/src/commands/enron/extraction-harness.ts`
- `tooling/cli/src/commands/enron/test-ontology.ttl`
- `packages/knowledge/domain/src/entities/MeetingPrep/contracts/Generate.contract.ts`
- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/knowledge/server/src/entities/Evidence/rpc/list.ts`

Curated dataset source remains:
- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

Phase 4 extraction summary (deterministic slice `limit=25`):
- `successfulDocuments=25`, `failedDocuments=0`
- `entityTypeAlignmentRate=1.0`
- `predicateValidityRate=1.0`
- `nonHallucinationRate=1.0`
- `evidenceGroundingRate=1.0`

### Your Mission

Implement all Phase 5 tasks:

1. Select test scenarios:
- Pick 3-5 Enron threads simulating realistic meeting-prep use cases:
  - pre-meeting agenda/follow-up
  - deal/financial discussion
  - org-role/ownership change
  - multi-party negotiation/action tracking
- Keep selection deterministic and document selection rationale.

2. Generate meeting prep briefings:
- Execute meeting prep generation through the existing RPC path (not mocked summaries).
- Capture generated bullets and evidence references for each selected scenario.

3. Validate evidence chains:
- For each generated bullet, verify evidence references resolve to real curated-source content.
- Check that cited spans semantically support bullet claims.
- Record mismatch modes (missing evidence, wrong span, weak claim support, cross-thread leakage).

4. Quality assessment and reporting:
- Create `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md`.
- Include scenario coverage, briefing usefulness, evidence validity, and prioritized remediation items.
- Explicitly account for any mismatch modes found during Phase 5 (missing evidence, weak support, cross-thread leakage).

### Constraints

- Keep boundaries clean; avoid unrelated refactors.
- Follow monorepo and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`).
- Preserve deterministic behavior in scenario selection/order and output reporting.
- Do not start long-running dev servers unless strictly required.
- If required environment dependencies are unavailable (DB/services/API), capture concrete blockers and partial validation evidence.

### Verification

Run and pass relevant checks/tests for touched packages.
At minimum, if touched:

```bash
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
```

If knowledge packages are touched, include matching `--filter @beep/knowledge-server` (and any additional touched knowledge packages) in verification.

Then update:
- `specs/pending/enron-data-pipeline/REFLECTION_LOG.md` (Phase 5 section)
- Any final handoff/closure docs required by the spec workflow

### Success Criteria

- [ ] 3-5 deterministic meeting-prep scenarios selected
- [ ] Meeting prep briefings generated from Enron-derived knowledge data
- [ ] Evidence chains validated per bullet with concrete pass/fail criteria
- [ ] Findings documented in `outputs/meeting-prep-quality.md`
- [ ] Any discovered evidence-chain risks tracked with actionable remediation direction
- [ ] Checks/tests pass for touched packages
- [ ] Reflection updated for Phase 5
