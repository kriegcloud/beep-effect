# P2 Citation Ledger

## Purpose

Track all evidence IDs used by the white paper and ensure each one resolves to a D12 ledger row and source artifact.

## Citation Rules

1. Every normative statement must include at least one claim ID and one evidence ID.
2. Evidence IDs must exist in D12 Evidence ID Ledger.
3. Status label context must be preserved from the source claim row.
4. Multi-evidence claims should preserve all evidence IDs unless a strict subset is justified.
5. Unsupported statements are moved to assumptions and are not presented as normative claims.

## Evidence Ledger (Matrix-Complete)

| Evidence ID | Source Doc | Source Artifact Path | Source Status | Typical Use |
|---|---|---|---|---|
| E-S01-001 | D12 | `tooling/repo-utils/src/JSDoc/JSDoc.ts` | implemented | Canonical tag surface and terminology identity |
| E-S01-002 | D12 | `tooling/repo-utils/src/JSDoc/models/tag-values/index.ts` | implemented | `_tag` contract and decode invariant |
| E-S01-003 | D12 | `tooling/repo-utils/src/JSDoc/models/tag-values/index.ts` | implemented | Canonical tag-name set support |
| E-S01-005 | D12 | `tooling/repo-utils/src/JSDoc/models/CanonicalJSDocSourceMetadata.model.ts` | implemented | Provenance metadata typing integrity |
| E-S02-001 | D12 | `specs/pending/repo-codegraph-canonical/README.md` | specified | Certainty-tier boundary definitions |
| E-S02-002 | D12 | `specs/pending/repo-codegraph-canonical/MASTER_ORCHESTRATION.md` | specified | Phase state machine and orchestration contract |
| E-S02-003 | D12 | `specs/pending/repo-codegraph-canonical/MASTER_ORCHESTRATION.md` | specified | Gate preconditions for phase promotion |
| E-S02-004 | D12 | `specs/pending/repo-codegraph-canonical/RUBRICS.md` | specified | Quantitative quality gate thresholds |
| E-S03-001 | D12 | `specs/pending/repo-codegraph-jsdoc/OVERVIEW.md` | specified | Status-label discipline and corpus posture |
| E-S03-002 | D12 | `specs/pending/repo-codegraph-jsdoc/outputs/JSDOC_FIBRATION_ARCHITECTURE.md` | specified | Partial-completion and pipeline posture |
| E-S03-003 | D12 | `specs/pending/repo-codegraph-jsdoc/outputs/validate-jsdoc-exhaustiveness.mjs` | implemented | Deterministic validation checkpoints |
| E-S03-004 | D12 | `specs/pending/repo-codegraph-jsdoc/outputs/source-tag-snapshots.json` | implemented | Snapshot normalization and verification context |
| E-S03-005 | D12 | `specs/pending/repo-codegraph-jsdoc/outputs/validate-jsdoc-exhaustiveness.mjs` | implemented | Deferred reliability carry and caveat tracking |
| E-S04-001 | D12 | `.repos/beep-effect/packages/knowledge/_docs/INDEX.md` | implemented | Operations architecture alignment |
| E-S04-002 | D12 | `.repos/beep-effect/packages/knowledge/_docs/LLM_CONTROL_STRATEGY_SUMMARY.md` | specified | Timeout/token/concurrency control constraints |
| E-S04-003 | D12 | `.repos/beep-effect/packages/knowledge/_docs/ontology_research/owl_reasoning_validation_production.md` | conceptual | Conceptual OWL/SHACL strategy statements |
| E-S04-004 | D12 | `.repos/beep-effect/packages/knowledge/_docs/audits/AUDIT_SUMMARY.md` | implemented | Audit severity and governance risk posture |
| E-S04-005 | D12 | `.repos/beep-effect/packages/knowledge/_docs/ontology_research/ontology101.pdf` | implemented | Non-text ontology evidence surface |
| E-S04-006 | D12 | `.repos/beep-effect/packages/knowledge/_docs/ontology_research/Generated Image December 18, 2025 - 9_07PM.jpeg` | implemented | Non-text ontology evidence surface |

## Validation Checklist

- [x] Every evidence ID used by the matrix appears in this ledger.
- [x] Every ledger evidence ID resolves to D12.
- [x] Citation rows preserve source status-label context.
- [x] Caveat-carry evidence ID (`E-S03-005`) is represented for risks and annex contexts.
