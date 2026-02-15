# HANDOFF_P4: Enron Knowledge Demo Integration

> Validation handoff for proving the internal demo flow over real Enron data.

---

## Working Context (<=2K tokens)

### Phase 4 Objective

Validate that `apps/todox/src/app/knowledge-demo` provides a meaningful internal product demo using real persisted Enron-derived data across all surfaced features.

### Inputs Expected From P3

- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`
- `outputs/meeting-prep-rewrite-notes.md`
- `outputs/evidence-chain-regression-check.md`

### Required P4 Outcomes

1. end-to-end ingest -> query -> meeting-prep flow validated for multiple deterministic scenarios
2. no default-path dummy data remains in knowledge-demo
3. feature-gate behavior validated for `ENABLE_ENRON_KNOWLEDGE_DEMO` on and off
4. evidence references in UI are resolvable and meaningful
5. known risks captured with prioritized remediation

### Required P4 Output Artifacts

- `outputs/demo-validation.md`
- `outputs/demo-risks.md`

### Non-Goals For P4

- broad UI redesign
- new graph rendering framework
- public rollout hardening

---

## Episodic Context (<=1K tokens)

- P2 migrated the default data path to RPC-backed flows.
- P3 rewrote meeting prep synthesis and retained evidence persistence contracts.
- Remaining focus is demonstration quality and deterministic validation, not architecture redesign.

---

## Semantic Context (<=500 tokens)

Primary validation surfaces:

- `apps/todox/src/app/knowledge-demo/*`
- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/knowledge/server/src/entities/Evidence/rpc/list.ts`

Dataset and ontology anchors:

- curated Enron dataset under `s3://static.vaultctx.com/todox/test-data/enron/curated/*`
- ontology payload: `tooling/cli/src/commands/enron/test-ontology.ttl`

---

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `outputs/rpc-client-migration.md`
- `outputs/meeting-prep-rewrite-notes.md`

---

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 920 | <=2000 | OK |
| Episodic | 220 | <=1000 | OK |
| Semantic | 200 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1340 | <=4000 | OK |

---

## Verification Expectations For Phase 4

Run check/test for touched packages, likely including:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/server
bun run test --filter @beep/server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

Also produce deterministic smoke evidence in `outputs/demo-validation.md` covering each selected scenario.
