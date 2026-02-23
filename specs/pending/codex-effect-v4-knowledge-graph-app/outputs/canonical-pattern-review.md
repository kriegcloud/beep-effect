# Canonical Pattern Review

Date: 2026-02-22

## Objective

Re-check this pending spec against a broader completed-spec corpus and normalize structure to the dominant canonical pattern.

## Corpus Reviewed

### Local completed specs (`specs/completed`)

- `changesets-turborepo/README.md`
- `repo-tooling/README.md`
- `repo-cli-purge-command/README.md`
- `repo-cli-quality-hardening/README.md`
- `semantic-codebase-search/README.md`
- `shared-memories/README.md`
- `reverse-engineering-palantir-ontology/README.md`
- companion quick start/reflection files where present

### Additional completed specs (`.repos/beep-effect/specs/completed`)

Sampled canonical references:
- `spec-creation-improvements/README.md`
- `knowledge-graph-integration/README.md`
- `better-auth-client-wrappers/README.md`

Also computed heading frequency across completed-spec READMEs.

## Dominant Canonical Sections Identified

Most frequent headings across completed specs:

1. `Success Criteria`
2. `Phase Overview`
3. `Problem Statement`
4. `Scope`
5. `Purpose`
6. `Non-Goals`
7. `Dependencies`
8. `Related Specs` / `Related Documentation`

Common supporting artifacts for complex multi-phase specs:

- `README.md`
- `QUICK_START.md`
- `REFLECTION_LOG.md`
- `outputs/*`
- `handoffs/HANDOFF_P*.md`
- `handoffs/P*_ORCHESTRATOR_PROMPT.md`

## Gaps Found In Prior Draft

1. Missing orchestrator handoff prompt files.
2. No phase-by-phase handoff continuity scaffold.
3. README mixed styles and lacked explicit `Problem Statement`/`Proposed Solution` split.
4. Quick start did not provide direct handoff prompt path for immediate continuation.

## Normalization Applied

### README normalization

Added or normalized:
- Metadata as explicit sections (`Status`, `Owner`, `Created`, `Last Updated`)
- `Problem Statement`
- `Proposed Solution`
- `Primary Goal`
- `Goals` and `Non-Goals`
- `Required Outputs`
- `Phase Completion Requirements`
- explicit canonical compliance section

Kept and refined:
- `Success Criteria`
- ADR table (AD-001..AD-010)
- architecture/data flow blueprint
- risk/dependency/verification matrices

### Quick Start normalization

Added:
- explicit next phase statement
- direct handoff and orchestrator prompt file references
- full phase handoff table
- guardrails section aligned with locked decisions

### Handoff artifacts added

Created:
- `handoffs/HANDOFF_P1.md` + `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P2.md` + `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P3.md` + `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P4.md` + `handoffs/P4_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P5.md` + `handoffs/P5_ORCHESTRATOR_PROMPT.md`
- `handoffs/HANDOFF_P6.md` + `handoffs/P6_ORCHESTRATOR_PROMPT.md`

## Compliance Result

Result: The pending spec now matches the canonical multi-phase pattern used by completed specs in this repo family.

Specifically satisfied:

- Canonical README structure with explicit problem/goal/scope/success/phase model
- Companion triage doc (`QUICK_START.md`)
- Companion learning log (`REFLECTION_LOG.md`)
- Explicit orchestration continuity (`handoffs/` + orchestrator prompts)
- Artifactized reviews in `outputs/`

## Remaining Discipline Rule

As each phase is executed, the corresponding `HANDOFF_P*.md` file should be refreshed with actual outcomes and evidence before starting the next phase.
