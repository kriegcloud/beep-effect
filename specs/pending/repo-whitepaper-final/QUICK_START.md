# Quick Start: repo-whitepaper-final

## What This Package Delivers

A fully executed, evidence-auditable white-paper publication packet based on D01-D12, including draft, review, final manuscript, annex, and signoff artifacts.

## Current Status

- P0 Bootstrap and Review Baseline: Complete
- P1 Narrative Architecture and Section Contracts: Complete
- P2 Evidence Packet and Assumption Controls: Complete
- P3 Draft v1 and QC: Complete
- P4 Dual Review and Resolution: Complete
- P5 Final Publication Packet: Complete
- P6 Final Signoff and Release Decision: Complete

## Start Here

1. Read [README.md](./README.md) for locks, scope, and confidence model.
2. Read [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for phase sequencing and promotion invariants.
3. Read [RUBRICS.md](./RUBRICS.md) for pass/fail conditions.
4. Read [outputs/p6/final-signoff-summary.md](./outputs/p6/final-signoff-summary.md) for final release decision.

## Key Artifacts

| Area | Artifact |
|---|---|
| Final manuscript | [outputs/p5/whitepaper-final.md](./outputs/p5/whitepaper-final.md) |
| Evidence mapping | [outputs/p2/claim-evidence-matrix.json](./outputs/p2/claim-evidence-matrix.json) |
| Citation controls | [outputs/p2/citation-ledger.md](./outputs/p2/citation-ledger.md) |
| Review closure | [outputs/p4/revision-resolution-log.md](./outputs/p4/revision-resolution-log.md) |
| Final decision | [handoffs/HANDOFF_P6.md](./handoffs/HANDOFF_P6.md) |

## Required Verification Commands

```bash
find specs/pending/repo-whitepaper-final -maxdepth 4 -type f | sort
rg -n "TODO|TBD|PLACEHOLDER|FIXME" specs/pending/repo-whitepaper-final
node specs/pending/repo-whitepaper-final/tools/validate-spec-integrity.mjs
node specs/pending/repo-whitepaper-final/tools/validate-matrix-ledger-consistency.mjs
node specs/pending/repo-whitepaper-final/tools/validate-whitepaper-draft.mjs --file specs/pending/repo-whitepaper-final/outputs/p5/whitepaper-final.md
node specs/pending/repo-whitepaper-final/tools/validate-publication-gates.mjs
```

## Operating Rules

1. Normative claims are D01-D12-evidence-bound.
2. Unsupported statements are assumptions, not facts.
3. Caveat carry (`C-002` / `E-S03-005`, D11 governance risks) remains explicit unless corpus evidence changes.
4. PASS requires dual-review pass and publication-gate pass.
