# HANDOFF_P3: Enron Knowledge Demo Integration

## Working Context (<=2K tokens)

### Phase 3 Objective

Rewrite `meetingprep_generate` to produce meaningful LLM-synthesized bullets grounded in relation evidence, while preserving persistence + evidence-link invariants.

### Inputs Expected From P2

- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`
- functioning UI path for ingest + query over real data

### Required P3 Outcomes

- [ ] handler synthesis no longer uses relation-ID template copy
- [ ] bullet persistence unchanged contract-wise
- [ ] evidence links persist and resolve for each returned bullet
- [ ] recoverable failures handled deterministically (no defects)

## Episodic Context (<=1K tokens)

- Prior phases established deterministic scenario source and ingest flow.
- Runtime RPC path is expected to be operational by this point.

## Semantic Context (<=500 tokens)

Primary files:

- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/knowledge/domain/src/entities/MeetingPrep/contracts/Generate.contract.ts`
- `packages/knowledge/domain/src/entities/Evidence/contracts/List.contract.ts`

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 700 | <=2000 | OK |
| Episodic | 180 | <=1000 | OK |
| Semantic | 220 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1100 | <=4000 | OK |

## Verification Expectations For Phase 3

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
```

Also produce:

- `outputs/meeting-prep-rewrite-notes.md`
- `outputs/evidence-chain-regression-check.md`
