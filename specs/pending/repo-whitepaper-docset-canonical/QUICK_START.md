# Quick Start: repo-whitepaper-docset-canonical

## What This Spec Delivers

A canonical orchestration package for producing a 12-document, whitepaper-ready technical corpus from four locked source areas.

## Current Status

- Phase: `P0` complete (spec package initialized)
- Next phase: `P1` (source inventory + fact harvest)

## Start Here

1. Read [README.md](./README.md) for locked scope, ADRs, and phase gates.
2. Open [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) for state-machine execution.
3. Use [RUBRICS.md](./RUBRICS.md) to validate pass/fail before phase promotion.
4. Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) at each phase exit.

## Phase Entry Files

- `P0`: `README.md`, `outputs/initial_plan.md`, `handoffs/HANDOFF_P0.md`
- `P1`: `outputs/p1/source-index.md`, `outputs/p1/fact-ledger.json`, `outputs/p1/coverage-baseline.md`
- `P2`: `outputs/p2/term-model.md`, `outputs/p2/taxonomy-crosswalk.md`, `outputs/p2/conflict-register.md`
- `P3`: `outputs/p3/doc-blueprints.md`, `outputs/p3/ownership-matrix.md`, `outputs/manifest.json`
- `P4`: `outputs/docset/D01.md` ... `outputs/docset/D08.md`
- `P5`: `outputs/docset/D09.md` ... `outputs/docset/D12.md`
- `P6`: `outputs/p6/consistency-report.md`, `outputs/p6/completeness-report.md`, `outputs/p6/quality-scorecard.md`
- `P7`: `outputs/p7/whitepaper-starter-kit.md`, `handoffs/HANDOFF_P7.md`

## Required Verification Commands (Spec Package)

```bash
# verify package skeleton exists
find specs/pending/repo-whitepaper-docset-canonical -maxdepth 3 -type f | sort

# verify manifest JSON is valid
node -e "JSON.parse(require('node:fs').readFileSync('specs/pending/repo-whitepaper-docset-canonical/outputs/manifest.json','utf8')); console.log('manifest ok')"

# verify phase gate JSON templates are valid
node -e "JSON.parse(require('node:fs').readFileSync('specs/pending/repo-whitepaper-docset-canonical/outputs/p6/quality-gates.json','utf8')); console.log('quality gates ok')"
```

## Operating Rules

1. Do not move to the next phase unless current phase exits pass rubric checks.
2. Do not add external source claims without assumption labeling.
3. Do not duplicate primary-topic ownership across documents.
4. Do not publish starter kit without complete traceability links.
